/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StoryLibrary } from './components/StoryLibrary';
import { BookReader } from './components/BookReader';
import { StoryCreatorModal } from './components/StoryCreatorModal';
import { CharacterCustomizerModal } from './components/CharacterCustomizerModal';
import { AnimalSoundsPage } from './components/AnimalSoundsPage';
import { BlankDrawPage } from './components/BlankDrawPage';
import { PaywallModal } from './components/PaywallModal';
import { AnimalSoundDef } from './utils/audioSynth';
import {
  DEFAULT_STORIES,
  DEFAULT_CHARACTER,
  Story,
  StoryPage,
  ImageSize,
  ArtStyle,
  CharacterProfile,
  applyCharacterToStory,
} from './utils/story';

const LOCAL_STORAGE_STORIES_KEY = 'wondertales_stories_v3';
const LOCAL_STORAGE_HERO_KEY = 'wondertales_active_hero_v3';
const LOCAL_STORAGE_TODDLER_MODE_KEY = 'wondertales_toddler_mode_v3';
const LOCAL_STORAGE_PAID_PASS_KEY = 'wondertales_paid_pass_v3';
const LOCAL_STORAGE_CUSTOM_STORIES_COUNT_KEY = 'wondertales_custom_stories_count_v3';

export default function App() {
  const [character, setCharacter] = useState<CharacterProfile>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HERO_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read saved hero from localStorage:', e);
    }
    return DEFAULT_CHARACTER;
  });

  const [isToddlerMode, setIsToddlerMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_TODDLER_MODE_KEY);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read toddler mode setting:', e);
    }
    return true; // Default to toddler mode for ultra-simple 2yo experience
  });

  const [hasPaidPass, setHasPaidPass] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PAID_PASS_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read paid pass setting:', e);
    }
    return false;
  });

  const [customStoriesCount, setCustomStoriesCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CUSTOM_STORIES_COUNT_KEY);
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read custom stories count:', e);
    }
    return 0;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize and upgrade any legacy stories
          const upgraded = parsed.map((s: Story) => {
            const defaultMatch = DEFAULT_STORIES.find((d) => d.id === s.id);
            if (defaultMatch) {
              return {
                ...defaultMatch,
                pages: defaultMatch.pages.map((p, idx) => ({
                  ...p,
                  childDrawing: s.pages?.[idx]?.childDrawing || p.childDrawing,
                  drawingAcknowledgment: s.pages?.[idx]?.drawingAcknowledgment || p.drawingAcknowledgment,
                })),
              };
            }
            return s;
          });

          const existingIds = new Set(upgraded.map((s: any) => s.id));
          const missingDefaults = DEFAULT_STORIES.filter((s) => !existingIds.has(s.id));
          return [...upgraded, ...missingDefaults];
        }
      }
    } catch (e) {
      console.warn('Could not read saved stories from localStorage:', e);
    }
    return DEFAULT_STORIES;
  });

  const [currentView, setCurrentView] = useState<'library' | 'reader' | 'sounds' | 'draw'>('library');
  const [activeStoryId, setActiveStoryId] = useState<string>(DEFAULT_STORIES[0].id);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync toddler mode setting
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_TODDLER_MODE_KEY, JSON.stringify(isToddlerMode));
    } catch (e) {
      console.warn('Could not save toddler mode setting:', e);
    }
  }, [isToddlerMode]);

  // Sync paid pass setting
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PAID_PASS_KEY, JSON.stringify(hasPaidPass));
    } catch (e) {
      console.warn('Could not save paid pass setting:', e);
    }
  }, [hasPaidPass]);

  // Sync custom stories count
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CUSTOM_STORIES_COUNT_KEY, JSON.stringify(customStoriesCount));
    } catch (e) {
      console.warn('Could not save custom stories count:', e);
    }
  }, [customStoriesCount]);

  // Sync stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_STORIES_KEY, JSON.stringify(stories));
    } catch (e) {
      console.warn('Could not save stories to localStorage:', e);
    }
  }, [stories]);

  // Sync hero to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HERO_KEY, JSON.stringify(character));
    } catch (e) {
      console.warn('Could not save hero to localStorage:', e);
    }
  }, [character]);

  // Handle URL navigation params (?view=sounds, ?view=draw, ?autostart=1, ?story=id, ?paywall=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'sounds') {
      setCurrentView('sounds');
    } else if (params.get('view') === 'draw') {
      setCurrentView('draw');
    } else if (params.get('paywall') === '1') {
      setIsPaywallOpen(true);
    } else if (params.get('autostart') === '1') {
      setCurrentView('reader');
      setActiveStoryId(stories[0].id);
    } else if (params.get('story')) {
      const match = stories.find((s) => s.id === params.get('story'));
      if (match) {
        setActiveStoryId(match.id);
        setCurrentView('reader');
      }
    }
  }, []);

  const activeStory = stories.find((s) => s.id === activeStoryId) || stories[0];

  const handleSelectStory = (story: Story) => {
    setActiveStoryId(story.id);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickListen = (story: Story) => {
    setActiveStoryId(story.id);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenCreateStory = () => {
    if (!hasPaidPass && customStoriesCount >= 2) {
      setIsPaywallOpen(true);
      return;
    }
    setIsCreatorOpen(true);
  };

  const handleUnlockPass = () => {
    setHasPaidPass(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_PAID_PASS_KEY, JSON.stringify(true));
    } catch (e) {
      console.warn('Could not save paid pass:', e);
    }
    setIsPaywallOpen(false);
  };

  const handleStoryCreated = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    setActiveStoryId(newStory.id);
    setCurrentView('reader');

    setCustomStoriesCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_STORIES_COUNT_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save custom story count:', e);
      }
      return next;
    });
  };

  const handleWeaveStoryWithDrawing = (drawingDataUrl: string, title?: string) => {
    if (!hasPaidPass && customStoriesCount >= 2) {
      setIsPaywallOpen(true);
      return;
    }

    const drawingStory: Story = {
      id: `drawing-tale-${Date.now()}`,
      title: title || `${character.name}'s Magical Drawing Adventure`,
      toddlerTitle: `🎨 ${character.name}'s Color Picture`,
      author: `${character.name} the Artist`,
      readingLevel: 'Ages 3-5',
      tag: 'Art & Imagination',
      summary: `A personalized adventure starring ${character.name}'s hand-drawn masterpiece!`,
      toddlerSummary: `${character.name} draws a magical picture!`,
      coverImage: drawingDataUrl,
      illustrationType: 'hero',
      themeColor: 'from-rose-400/20 to-amber-400/20',
      createdAt: new Date().toISOString().split('T')[0],
      isCustom: true,
      pages: [
        {
          pageNumber: 1,
          text: `Look what ${character.name} painted today! With bright colors and joyful imagination, the picture began to glow with bedtime starlight!`,
          simpleText: `Look at the beautiful picture ${character.name} made! ✨`,
          simpleChoices: [
            { id: 'c-draw-1', emoji: '🌟', text: 'Touch the Art' },
            { id: 'c-draw-2', emoji: '🎉', text: 'Dance & Celebrate' },
          ],
          illustrationPrompt: `${character.name}'s colorful hand drawing glowing in the magical bedtime gallery`,
          illustrationUrl: drawingDataUrl,
          illustrationResolution: '2K',
          artStyle: 'Whimsical Watercolor',
          displayMode: 'child',
          childDrawing: {
            pageNumber: 1,
            dataUrl: drawingDataUrl,
            caption: `Drawn by ${character.name}`,
            createdAt: new Date().toISOString(),
          },
          drawingAcknowledgment: `The bedtime storyteller is so proud of this artwork by ${character.name}!`,
          choices: [
            {
              id: 'c-draw-1',
              text: 'Step inside the magical painting to meet the painted creatures',
              consequenceSummary: 'The colors ripple like water and welcome the brave hero inside.',
              illustrationHint: 'Stepping into a vibrant rainbow portal.',
            },
            {
              id: 'c-draw-2',
              text: 'Hang the golden picture frame atop the Highest Cloud Mountain',
              consequenceSummary: 'The artwork illuminates the entire world like a warm starry night.',
              illustrationHint: 'A glowing framed painting shining on a mountaintop.',
            },
          ],
          vocabularyWords: [
            {
              word: 'Masterpiece',
              phonetic: 'MAS-ter-pees',
              definition: 'A magnificent work of art created with great talent and love.',
              childFriendly: 'Your super amazing, beautiful artwork!',
            },
          ],
        },
      ],
    };

    handleStoryCreated(drawingStory);
  };

  const handleWeaveStoryWithAnimal = (animal: AnimalSoundDef) => {
    if (!hasPaidPass && customStoriesCount >= 2) {
      setIsPaywallOpen(true);
      return;
    }
    setCharacter((prev) => ({
      ...prev,
      species: animal.name,
    }));
    setIsCreatorOpen(true);
  };

  const handleSaveCharacter = (newProfile: CharacterProfile, applyToActiveStoryBool: boolean) => {
    setCharacter(newProfile);
    if (applyToActiveStoryBool) {
      setStories((prev) =>
        prev.map((s) => (s.id === activeStoryId ? applyCharacterToStory(s, newProfile) : s))
      );
    }
  };

  const handleUpdateStoryPage = (
    storyId: string,
    pageNumber: number,
    newImageUrl: string,
    size: ImageSize,
    style: ArtStyle,
    prompt: string
  ) => {
    setStories((prevStories) =>
      prevStories.map((st) => {
        if (st.id !== storyId) return st;
        const updatedPages = st.pages.map((p) => {
          if (p.pageNumber !== pageNumber) return p;
          return {
            ...p,
            illustrationUrl: newImageUrl,
            illustrationResolution: size,
            artStyle: style,
            illustrationPrompt: prompt,
          };
        });

        const updatedCover = pageNumber === 1 ? newImageUrl : st.coverImage;

        return {
          ...st,
          coverImage: updatedCover,
          pages: updatedPages,
        };
      })
    );
  };

  const handleSaveChildDrawing = (
    storyId: string,
    pageNumber: number,
    drawingDataUrl: string,
    caption: string,
    acknowledgment?: string
  ) => {
    setStories((prevStories) =>
      prevStories.map((st) => {
        if (st.id !== storyId) return st;
        const updatedPages = st.pages.map((p) => {
          if (p.pageNumber !== pageNumber) return p;
          return {
            ...p,
            childDrawing: {
              pageNumber,
              dataUrl: drawingDataUrl,
              caption,
              createdAt: new Date().toISOString(),
            },
            drawingAcknowledgment: acknowledgment || p.drawingAcknowledgment,
            displayMode: 'both' as const,
          };
        });
        return {
          ...st,
          pages: updatedPages,
        };
      })
    );
  };

  const handleAddBranchingPage = (
    storyId: string,
    newPage: StoryPage,
    chosenChoiceId: string
  ) => {
    setStories((prevStories) =>
      prevStories.map((st) => {
        if (st.id !== storyId) return st;
        const updatedPages = st.pages.map((p, idx) => {
          if (idx === st.pages.length - 1) {
            return {
              ...p,
              chosenChoiceId,
            };
          }
          return p;
        });

        return {
          ...st,
          pages: [...updatedPages, newPage],
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      <Header
        currentView={currentView}
        onNavigateLibrary={() => {
          setCurrentView('library');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateSounds={() => {
          setCurrentView('sounds');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateDraw={() => {
          setCurrentView('draw');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCreateStory={handleOpenCreateStory}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        activeCharacter={character}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeStoryTitle={activeStory?.title}
        isToddlerMode={isToddlerMode}
        onToggleToddlerMode={() => setIsToddlerMode((prev) => !prev)}
        hasPaidPass={hasPaidPass}
        onOpenPaywall={() => setIsPaywallOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'library' ? (
          <StoryLibrary
            stories={stories}
            onSelectStory={handleSelectStory}
            onOpenCreateStory={handleOpenCreateStory}
            onQuickListen={handleQuickListen}
            isToddlerMode={isToddlerMode}
            onToggleToddlerMode={() => setIsToddlerMode((prev) => !prev)}
            onNavigateSounds={() => setCurrentView('sounds')}
            onNavigateDraw={() => setCurrentView('draw')}
          />
        ) : currentView === 'reader' ? (
          <BookReader
            story={activeStory}
            onBackToLibrary={() => setCurrentView('library')}
            onUpdateStoryPage={handleUpdateStoryPage}
            onSaveChildDrawing={handleSaveChildDrawing}
            onAddBranchingPage={handleAddBranchingPage}
            activeCharacter={character}
            soundEnabled={soundEnabled}
            isToddlerMode={isToddlerMode}
            onToggleToddlerMode={() => setIsToddlerMode((prev) => !prev)}
          />
        ) : currentView === 'sounds' ? (
          <AnimalSoundsPage
            onBackToLibrary={() => setCurrentView('library')}
            onWeaveStoryWithAnimal={handleWeaveStoryWithAnimal}
          />
        ) : (
          <BlankDrawPage
            onBackToLibrary={() => setCurrentView('library')}
            onWeaveStoryWithDrawing={handleWeaveStoryWithDrawing}
            heroName={character.name}
          />
        )}
      </main>

      {/* Story Creator Modal */}
      <StoryCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onStoryCreated={handleStoryCreated}
        activeCharacter={character}
      />

      {/* Character Customizer Modal */}
      <CharacterCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        currentCharacter={character}
        onSaveCharacter={handleSaveCharacter}
      />

      {/* WonderTales Magic Pass Paywall Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        onUnlockPass={handleUnlockPass}
        storiesGeneratedCount={customStoriesCount}
      />
    </div>
  );
}
