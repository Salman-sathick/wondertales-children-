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

const LOCAL_STORAGE_STORIES_KEY = 'wondertales_stories_v2';
const LOCAL_STORAGE_HERO_KEY = 'wondertales_active_hero_v2';

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

  const [stories, setStories] = useState<Story[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved stories from localStorage:', e);
    }
    return DEFAULT_STORIES;
  });

  const [currentView, setCurrentView] = useState<'library' | 'reader'>('library');
  const [activeStoryId, setActiveStoryId] = useState<string>(DEFAULT_STORIES[0].id);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Handle URL autostart (?autostart=1 or ?story=id) for Ultra Mode testability
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
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

  const handleStoryCreated = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
    setActiveStoryId(newStory.id);
    setCurrentView('reader');
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
        // Mark chosen choice on previous page
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
        onNavigateLibrary={() => setCurrentView('library')}
        onOpenCreateStory={() => setIsCreatorOpen(true)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        activeCharacter={character}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeStoryTitle={activeStory?.title}
      />

      <main className="flex-1">
        {currentView === 'library' ? (
          <StoryLibrary
            stories={stories}
            onSelectStory={handleSelectStory}
            onOpenCreateStory={() => setIsCreatorOpen(true)}
            onQuickListen={handleQuickListen}
          />
        ) : (
          <BookReader
            story={activeStory}
            onBackToLibrary={() => setCurrentView('library')}
            onUpdateStoryPage={handleUpdateStoryPage}
            onSaveChildDrawing={handleSaveChildDrawing}
            onAddBranchingPage={handleAddBranchingPage}
            activeCharacter={character}
            soundEnabled={soundEnabled}
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
    </div>
  );
}
