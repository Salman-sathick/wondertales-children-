import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wand2,
  ZoomIn,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Sliders,
  Settings2,
  Palette,
  Compass,
  Heart,
  Layers,
  SplitSquareVertical,
  Check,
} from 'lucide-react';
import {
  Story,
  StoryPage,
  ImageSize,
  ArtStyle,
  splitIntoSentences,
  VocabularyWord,
  CharacterProfile,
  ChildDrawing,
  StoryChoice,
  DEFAULT_CHARACTER,
  generateFallbackDrawingAcknowledgment,
} from '../utils/story';
import { IllustrationStudioModal } from './IllustrationStudioModal';
import { DrawingStudioModal } from './DrawingStudioModal';
import { WordDictionaryModal } from './WordDictionaryModal';
import { ImageZoomModal } from './ImageZoomModal';
import { StoryImage, StoryIllustrationType } from './StoryImage';

interface BookReaderProps {
  story: Story;
  onBackToLibrary: () => void;
  onUpdateStoryPage: (
    storyId: string,
    pageNumber: number,
    newImageUrl: string,
    size: ImageSize,
    style: ArtStyle,
    prompt: string
  ) => void;
  onSaveChildDrawing: (
    storyId: string,
    pageNumber: number,
    drawingDataUrl: string,
    caption: string,
    acknowledgment?: string
  ) => void;
  onAddBranchingPage: (
    storyId: string,
    newPage: StoryPage,
    chosenChoiceId: string
  ) => void;
  activeCharacter: CharacterProfile;
  soundEnabled: boolean;
  isToddlerMode?: boolean;
  onToggleToddlerMode?: () => void;
}

type VoiceOption = { id: string; name: string; persona: string };

const VOICES: VoiceOption[] = [
  { id: 'Kore', name: 'Storyteller Kore', persona: 'Warm, gentle & cozy bedtime narrator' },
  { id: 'Puck', name: 'Storyteller Puck', persona: 'Bubbly, energetic & cheerful fairy' },
  { id: 'Fenrir', name: 'Storyteller Fenrir', persona: 'Brave, noble & heroic adventurer' },
  { id: 'Zephyr', name: 'Storyteller Zephyr', persona: 'Soothing whisper & tranquil calm' },
  { id: 'Charon', name: 'Storyteller Charon', persona: 'Wise, friendly & whimsical grandfather' },
];

export const BookReader: React.FC<BookReaderProps> = ({
  story,
  onBackToLibrary,
  onUpdateStoryPage,
  onSaveChildDrawing,
  onAddBranchingPage,
  activeCharacter = DEFAULT_CHARACTER,
  soundEnabled,
  isToddlerMode = true,
  onToggleToddlerMode,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [readingSpeed, setReadingSpeed] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Modals state
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState('');
  const [zoomImageTitle, setZoomImageTitle] = useState('');
  const [activeVocabularyWord, setActiveVocabularyWord] = useState<VocabularyWord | null>(null);
  const [isSpeakingWord, setIsSpeakingWord] = useState(false);

  // Branching story state
  const [isBranching, setIsBranching] = useState(false);
  const [branchingStatus, setBranchingStatus] = useState<string | null>(null);

  // Display Mode: 'both' | 'child' | 'ai'
  const [displayMode, setDisplayMode] = useState<'both' | 'child' | 'ai'>('both');

  // Developer mode flag: Only true if explicitly requested via ?dev=1 or ?developer=true
  const isDeveloperMode =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).get('dev') === '1' ||
      new URLSearchParams(window.location.search).get('developer') === 'true');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPage: StoryPage = story.pages[currentPageIndex] || story.pages[0];
  const totalPages = story.pages.length;

  // Base narrative text according to mode
  const baseNarrative = isToddlerMode && currentPage.simpleText ? currentPage.simpleText : currentPage.text;

  // Build full narrative to read aloud, appending drawing acknowledgment if present
  const fullPageText = currentPage.drawingAcknowledgment
    ? `${baseNarrative} ${currentPage.drawingAcknowledgment}`
    : baseNarrative;

  const sentences = splitIntoSentences(fullPageText);

  // Play audio chime if soundEnabled
  const playChime = (freq = 587.33, duration = 0.4) => {
    if (!soundEnabled) return;
    try {
      if (typeof window === 'undefined') return;
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      if (audioCtx.state === 'suspended') {
        audioCtx.close().catch(() => {});
        return;
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + duration * 0.4);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
      setTimeout(() => {
        audioCtx.close().catch(() => {});
      }, (duration + 0.1) * 1000);
    } catch {
      // AudioContext may be restricted before user gesture
    }
  };

  const stopNarration = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (pageTimerRef.current) {
      clearTimeout(pageTimerRef.current);
      pageTimerRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setActiveSentenceIndex(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isStudioOpen || isDrawingOpen || isZoomOpen || activeVocabularyWord) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleNarration();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageIndex, isPlaying, isStudioOpen, isDrawingOpen, isZoomOpen, activeVocabularyWord]);

  // When changing pages, reset audio
  useEffect(() => {
    stopNarration();
    playChime(587.33, 0.35);
  }, [currentPageIndex]);

  const goToNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  /**
   * Narrates the page using Gemini 3.8 Flash TTS
   */
  const playGeminiTTS = async (customText?: string) => {
    stopNarration();
    setIsLoadingAudio(true);
    setActiveSentenceIndex(0);

    const textToRead = customText || fullPageText;

    try {
      const selectedPersona = VOICES.find((v) => v.id === selectedVoice)?.persona;
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead,
          voiceName: selectedVoice,
          speaker: 'Storyteller',
          stylePrompt: `Children bedtime story narrator tailored for hero ${activeCharacter.name} (${activeCharacter.personality}) with ${selectedPersona}`,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.audioUrl) {
        throw new Error(data.error || 'Failed to fetch Gemini 3.8 Flash TTS audio');
      }

      const audio = new Audio(data.audioUrl);
      audio.playbackRate = readingSpeed;
      audioRef.current = audio;

      audio.onplay = () => {
        setIsLoadingAudio(false);
        setIsPlaying(true);
      };

      // Progressive sentence highlighting
      audio.ontimeupdate = () => {
        if (!audio.duration || sentences.length <= 1) return;
        const fraction = audio.currentTime / audio.duration;
        const currentIdx = Math.min(
          sentences.length - 1,
          Math.floor(fraction * sentences.length)
        );
        setActiveSentenceIndex(currentIdx);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setActiveSentenceIndex(null);
        if (autoAdvance && currentPageIndex < totalPages - 1) {
          pageTimerRef.current = setTimeout(() => {
            goToNextPage();
          }, 1200);
        }
      };

      audio.play().catch((err) => {
        console.warn('Audio play prevented or headless environment:', err);
      });
    } catch (err: any) {
      console.warn('Gemini 3.8 TTS network call fell back to local speech engine:', err.message);
      playWebSpeechFallback(textToRead);
    }
  };

  /**
   * Browser SpeechSynthesis fallback
   */
  const playWebSpeechFallback = (textToRead = fullPageText) => {
    if (!('speechSynthesis' in window)) {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = readingSpeed * 0.92;
    utterance.pitch = selectedVoice === 'Puck' ? 1.25 : selectedVoice === 'Charon' ? 0.85 : 1.05;

    const availableVoices = window.speechSynthesis.getVoices();
    const kidVoice =
      availableVoices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
      availableVoices.find((v) => v.lang.startsWith('en')) ||
      availableVoices[0];

    if (kidVoice) utterance.voice = kidVoice;

    speechSynthUtteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsLoadingAudio(false);
      setIsPlaying(true);
      setActiveSentenceIndex(0);
    };

    utterance.onboundary = (e) => {
      if (e.name === 'sentence' || e.name === 'word') {
        const charIdx = e.charIndex;
        let cumulative = 0;
        for (let i = 0; i < sentences.length; i++) {
          cumulative += sentences[i].length + 1;
          if (charIdx < cumulative) {
            setActiveSentenceIndex(i);
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setActiveSentenceIndex(null);
      if (autoAdvance && currentPageIndex < totalPages - 1) {
        pageTimerRef.current = setTimeout(() => {
          goToNextPage();
        }, 1200);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setActiveSentenceIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const toggleNarration = () => {
    if (isPlaying) {
      stopNarration();
    } else {
      playGeminiTTS();
    }
  };

  /**
   * Handles saving a child's drawing, requesting AI narrative acknowledgment
   */
  const handleSaveDrawing = (dataUrl: string, caption: string) => {
    playChime(784, 0.4);

    const fallbackAck = generateFallbackDrawingAcknowledgment(caption, activeCharacter.name);

    // Update state and close modal immediately for instant feedback
    onSaveChildDrawing(story.id, currentPage.pageNumber, dataUrl, caption, fallbackAck);

    // Try to fetch AI acknowledgment in background
    fetch('/api/acknowledge-drawing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drawingCaption: caption,
        heroName: activeCharacter.name,
        pageText: currentPage.text,
        characterProfile: activeCharacter,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.acknowledgment) {
          onSaveChildDrawing(
            story.id,
            currentPage.pageNumber,
            dataUrl,
            caption,
            data.acknowledgment
          );
          // Read aloud the acknowledgment!
          playGeminiTTS(data.acknowledgment);
        } else {
          playGeminiTTS(fallbackAck);
        }
      })
      .catch((err) => {
        console.warn('Using instant fallback drawing acknowledgment:', err);
        playGeminiTTS(fallbackAck);
      });
  };

  /**
   * Handles interactive branching choices on every page!
   */
  const handleSelectChoice = async (choice: StoryChoice) => {
    stopNarration();
    setIsBranching(true);
    setBranchingStatus(`Weaving story path: "${choice.text}"...`);
    playChime(659.25, 0.4);

    try {
      // 1. Ask Gemini to write next page and next choices
      const response = await fetch('/api/branch-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyTitle: story.title,
          currentPageNumber: currentPage.pageNumber,
          previousPageText: currentPage.text,
          chosenChoiceText: choice.text,
          readingLevel: story.readingLevel,
          characterProfile: activeCharacter,
          artStyle: currentPage.artStyle,
          imageSize: currentPage.illustrationResolution || '1K',
        }),
      });

      const data = await response.json();

      let newPage: StoryPage;

      if (response.ok && data.page) {
        newPage = data.page;
      } else {
        // Fallback branching generator if offline
        const nextPageNum = currentPage.pageNumber + 1;
        newPage = {
          pageNumber: nextPageNum,
          text: `Following the choice to ${choice.text.toLowerCase()}, ${activeCharacter.name} discovered ${choice.consequenceSummary}. The sky sparkled with wonder!`,
          illustrationPrompt: `${activeCharacter.name} (${activeCharacter.species}) enjoying ${choice.illustrationHint}, wearing ${activeCharacter.clothing}`,
          illustrationUrl: '/images/story_custom_adventure.jpg',
          illustrationResolution: currentPage.illustrationResolution || '1K',
          artStyle: currentPage.artStyle,
          displayMode: 'both',
          choices: [
            {
              id: `choice-${nextPageNum}-1`,
              text: 'Explore the glowing starlight clearing',
              consequenceSummary: `${activeCharacter.name} finds a slumbering friendly moon dragon.`,
              illustrationHint: 'A glowing clearing with flowers shaped like stars.',
            },
            {
              id: `choice-${nextPageNum}-2`,
              text: 'Head home to tuck into bed with cozy chamomile honey',
              consequenceSummary: `${activeCharacter.name} curls up into sweet bedtime dreams.`,
              illustrationHint: `${activeCharacter.name} sleeping cozy under moonbeams.`,
            },
          ],
          vocabularyWords: [
            {
              word: 'Adventure',
              phonetic: 'ad-VEN-chur',
              definition: 'An exciting and daring journey into the unknown.',
              childFriendly: 'A fun quest where you discover cool new things!',
            },
          ],
        };
      }

      // 2. Try to generate matching illustration with Gemini 3 Pro
      setBranchingStatus('Illustrating new page with Gemini 3 Pro...');
      try {
        const imgRes = await fetch('/api/generate-illustration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: newPage.illustrationPrompt,
            size: newPage.illustrationResolution || '1K',
            style: newPage.artStyle,
            characterProfile: activeCharacter,
          }),
        });
        const imgData = await imgRes.json();
        if (imgData.imageUrl) {
          newPage.illustrationUrl = imgData.imageUrl;
        }
      } catch (e) {
        console.warn('Image generation deferred to fallback illustration:', e);
      }

      // 3. Add page and advance
      onAddBranchingPage(story.id, newPage, choice.id);
      setCurrentPageIndex(story.pages.length); // points to newly appended page index
    } catch (err: any) {
      console.error('Branching error:', err);
    } finally {
      setIsBranching(false);
      setBranchingStatus(null);
    }
  };

  const pronounceWord = (word: string) => {
    setIsSpeakingWord(true);
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(word);
      u.rate = 0.85;
      u.pitch = 1.1;
      u.onend = () => setIsSpeakingWord(false);
      u.onerror = () => setIsSpeakingWord(false);
      window.speechSynthesis.speak(u);
    } else {
      setTimeout(() => setIsSpeakingWord(false), 1000);
    }
  };

  const hasChildDrawing = Boolean(currentPage.childDrawing?.dataUrl);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Top Navigation & Story Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          aria-label="Back to Story Library"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Story Library</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Toddler Mode Switcher */}
          {onToggleToddlerMode && (
            <button
              onClick={onToggleToddlerMode}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
                isToddlerMode
                  ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
              title="Toggle between 2-Year-Old Mode and Big Kid Mode"
            >
              {isToddlerMode ? '👶 2yo Mode' : '🌟 Big Kid Mode'}
            </button>
          )}

          {/* Active Hero Pill indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100/70 px-3 py-1.5 rounded-xl border border-amber-300/60">
            <Heart className="w-3.5 h-3.5 text-amber-700" />
            <span>Starring {activeCharacter.name}</span>
          </div>

          {/* Page Counter */}
          <div className="text-xs sm:text-sm font-semibold text-stone-600 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-2xs">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Page {currentPageIndex + 1} of {totalPages}</span>
          </div>

          {/* Draw Your Own Button */}
          <button
            onClick={() => setIsDrawingOpen(true)}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-950 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
            title="Draw your own illustration for this page"
          >
            <Palette className="w-3.5 h-3.5 text-rose-700" />
            <span className="hidden sm:inline">Draw Artwork</span>
            <span className="sm:hidden">Draw</span>
            {hasChildDrawing && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
          </button>

          {/* Developer-Only Illustration Studio Button */}
          {isDeveloperMode && (
            <button
              onClick={() => setIsStudioOpen(true)}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Developer Mode: Edit illustration prompts"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Developer AI Studio</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-200/70 rounded text-amber-900 font-bold">
                {currentPage.illustrationResolution || '1K'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Main Storybook Spread (Dual visual frame + narrative) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch mb-6">
        {/* Left Side: Illustrated Artwork (or Side-by-Side Dual Frame) */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-3">
          {/* Display Mode Toggle when child drawing exists */}
          {hasChildDrawing && (
            <div className="flex items-center justify-between p-1.5 bg-stone-100 rounded-2xl border border-stone-200/70">
              <span className="text-xs font-bold text-stone-600 pl-2">Display Mode:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDisplayMode('both')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    displayMode === 'both'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Both (Side-by-Side)
                </button>
                <button
                  onClick={() => setDisplayMode('child')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    displayMode === 'child'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  🎨 My Drawing
                </button>
                <button
                  onClick={() => setDisplayMode('ai')}
                  className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                    displayMode === 'ai'
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  ✨ AI Art
                </button>
              </div>
            </div>
          )}

          {/* Canvas & Art Container */}
          {hasChildDrawing && displayMode === 'both' ? (
            /* SIDE-BY-SIDE SPLIT VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 aspect-4/3 w-full">
              {/* Child Drawing Panel */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-3 border-rose-300 bg-white group">
                <img
                  src={currentPage.childDrawing?.dataUrl}
                  alt={`Child hand drawing for page ${currentPageIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-rose-600/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-md shadow-xs">
                  🎨 Your Drawing
                </div>
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setZoomImageUrl(currentPage.childDrawing?.dataUrl || '');
                      setZoomImageTitle(`Your Drawing · Page ${currentPage.pageNumber}`);
                      setIsZoomOpen(true);
                    }}
                    className="p-2 bg-stone-900/80 text-white rounded-lg hover:bg-stone-900"
                    title="Enlarge your drawing"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsDrawingOpen(true)}
                    className="px-2.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    Redraw
                  </button>
                </div>
              </div>

              {/* Gemini 3 Pro AI Illustration Panel */}
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-3 border-amber-300 bg-stone-100 group">
                <StoryImage
                  src={currentPage.illustrationUrl}
                  alt={`AI illustration for page ${currentPageIndex + 1}`}
                  type={(currentPage.illustrationType || story.illustrationType as StoryIllustrationType) || 'dragon'}
                  interactiveSparkles={true}
                  className="w-full h-full object-cover"
                />
                {isDeveloperMode && (
                  <div className="absolute top-2 left-2 px-2.5 py-0.5 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[11px] font-mono font-bold rounded-md shadow-xs">
                    ✨ Developer · {currentPage.illustrationResolution}
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setZoomImageUrl(currentPage.illustrationUrl);
                      setZoomImageTitle(`${story.title} · Page ${currentPage.pageNumber}`);
                      setIsZoomOpen(true);
                    }}
                    className="p-2 bg-stone-900/80 text-white rounded-lg hover:bg-stone-900 cursor-pointer"
                    title="Enlarge illustration"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  {isDeveloperMode && (
                    <button
                      onClick={() => setIsStudioOpen(true)}
                      className="px-2.5 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                    >
                      Paint
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : hasChildDrawing && displayMode === 'child' ? (
            /* CHILD DRAWING FULL VIEW */
            <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden shadow-xl border-4 border-rose-300 bg-white group">
              <img
                src={currentPage.childDrawing?.dataUrl}
                alt="Child hand-drawn illustration"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain p-4"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm">
                🎨 Hand-drawn by You!
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={() => {
                    setZoomImageUrl(currentPage.childDrawing?.dataUrl || '');
                    setZoomImageTitle(`Your Drawing · Page ${currentPage.pageNumber}`);
                    setIsZoomOpen(true);
                  }}
                  className="p-2.5 bg-stone-900/80 text-white rounded-xl hover:bg-stone-900"
                  title="Enlarge"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsDrawingOpen(true)}
                  className="px-3.5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Redraw Art
                </button>
              </div>
            </div>
          ) : (
            /* AI ILLUSTRATION STANDARD VIEW */
            <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-stone-100 group">
              <StoryImage
                src={currentPage.illustrationUrl}
                alt={`Storybook illustration for page ${currentPageIndex + 1}`}
                type={(currentPage.illustrationType || story.illustrationType as StoryIllustrationType) || 'dragon'}
                interactiveSparkles={true}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
              />

              {/* Top developer badge */}
              {isDeveloperMode && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-stone-950/75 backdrop-blur-md text-amber-300 text-xs font-mono font-bold rounded-lg border border-amber-400/30 shadow-xs">
                    Dev · {currentPage.illustrationResolution || '1K'}
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-1 bg-stone-900/60 backdrop-blur-md text-stone-200 text-xs font-medium rounded-lg">
                    {currentPage.artStyle || 'Fairytale Gouache'}
                  </span>
                </div>
              )}

              {/* Bottom Floating Controls: Zoom & Actions */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                {currentPage.illustrationUrl && (
                  <button
                    onClick={() => {
                      setZoomImageUrl(currentPage.illustrationUrl);
                      setZoomImageTitle(`${story.title} · Page ${currentPage.pageNumber}`);
                      setIsZoomOpen(true);
                    }}
                    className="p-2.5 bg-stone-900/80 hover:bg-stone-950 backdrop-blur-md text-white rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                    aria-label="Enlarge full-screen illustration"
                    title="View full picture"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsDrawingOpen(true)}
                  className="px-3.5 py-2 bg-rose-500/90 hover:bg-rose-600 backdrop-blur-md text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                  title="Draw your own picture for this page"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Draw</span>
                </button>

                {isDeveloperMode && (
                  <button
                    onClick={() => setIsStudioOpen(true)}
                    className="px-3.5 py-2 bg-amber-500/90 hover:bg-amber-600 backdrop-blur-md text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    title="Developer Mode: Edit illustration"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Re-illustrate</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Story Prose, Acknowledgment & Interactive Branching Choices */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg border border-amber-200/50 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-amber-100/60 to-transparent pointer-events-none rounded-tr-3xl" />

          <div>
            {/* Header info */}
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800/80 uppercase tracking-widest mb-3">
              <span>{story.title}</span>
              <span>Chapter {currentPageIndex + 1}</span>
            </div>

            {/* Child-Friendly Read Aloud Bar (In-Flow, Never Overlays Any Text or Choices) */}
            <div className="p-3 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 rounded-2xl border border-amber-200/90 flex flex-wrap items-center justify-between gap-2.5 mb-4 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleNarration}
                  disabled={isLoadingAudio}
                  className={`px-4 py-2 rounded-xl flex items-center gap-2 text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300 animate-pulse'
                      : 'bg-amber-400 hover:bg-amber-500 text-amber-950'
                  }`}
                  aria-label={isPlaying ? 'Pause reading aloud' : 'Read aloud with expressive voice'}
                >
                  {isLoadingAudio ? (
                    <div className="w-4 h-4 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 fill-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-amber-950 ml-0.5" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Read to Me'}</span>
                </button>

                <button
                  onClick={() => {
                    stopNarration();
                    playGeminiTTS();
                  }}
                  className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-amber-200/50 transition-colors cursor-pointer"
                  title="Restart reading this page"
                  aria-label="Restart reading"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed & Voice options */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/90 rounded-xl p-0.5 border border-amber-200/80 shadow-2xs">
                  {[0.8, 1.0, 1.2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setReadingSpeed(spd)}
                      className={`px-2 py-0.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        readingSpeed === spd
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <select
                  value={selectedVoice}
                  onChange={(e) => {
                    setSelectedVoice(e.target.value);
                    if (isPlaying) stopNarration();
                  }}
                  className="text-xs bg-white/90 border border-amber-200/80 rounded-xl px-2.5 py-1 text-stone-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-2xs cursor-pointer"
                  title="Choose Storyteller Voice"
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name.replace('Storyteller ', '')}
                    </option>
                  ))}
                </select>

                <label
                  className="hidden sm:flex items-center gap-1.5 text-[11px] text-stone-600 font-medium ml-1 cursor-pointer"
                  title="Automatically advance to next page when reading finishes"
                >
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded border-amber-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span>Auto-turn</span>
                </label>
              </div>
            </div>

            {/* Main story text */}
            {isToddlerMode ? (
              <div className="space-y-4 my-3">
                <div
                  onClick={() => {
                    if (!isPlaying) toggleNarration();
                  }}
                  className="p-5 sm:p-7 bg-gradient-to-br from-amber-50 to-orange-50/70 rounded-3xl border-2 border-amber-300/80 shadow-xs cursor-pointer hover:border-amber-400 transition-all group"
                  title="Tap to hear story read aloud"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-700" />
                      <span>Tap to Read Aloud:</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium group-hover:underline">
                      {isPlaying ? '🔊 Playing...' : '▶ Tap anywhere'}
                    </span>
                  </div>

                  <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-stone-900 leading-snug font-extrabold">
                    {currentPage.simpleText || currentPage.text}
                  </p>
                </div>

                {/* Drawing Acknowledgment Celebratory Card */}
                {currentPage.drawingAcknowledgment && (
                  <div className="p-3.5 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200 text-xs text-rose-900 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-rose-500 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-bold block">Storyteller Loved Your Drawing!</span>
                      <span className="italic leading-snug">{currentPage.drawingAcknowledgment}</span>
                    </div>
                  </div>
                )}

                {/* GIANT 2-YEAR-OLD EMOJI CHOICES */}
                <div className="mt-6 pt-5 border-t-2 border-dashed border-amber-200">
                  <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-2 mb-3">
                    <span className="text-lg">👉</span>
                    <span>What should we do next? Tap one!</span>
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {(currentPage.simpleChoices && currentPage.simpleChoices.length > 0
                      ? currentPage.simpleChoices
                      : (currentPage.choices || []).slice(0, 2).map((c, i) => ({
                          id: c.id,
                          emoji: i === 0 ? '⭐' : '🎈',
                          text: c.text.slice(0, 22),
                        }))
                    ).map((choice, i) => (
                      <button
                        key={choice.id || i}
                        onClick={() => {
                          playChime(659.25, 0.3);
                          const fullChoiceMatch =
                            currentPage.choices?.find((c) => c.id === choice.id) ||
                            currentPage.choices?.[i];
                          if (fullChoiceMatch) {
                            handleSelectChoice(fullChoiceMatch);
                          } else {
                            goToNextPage();
                          }
                        }}
                        disabled={isBranching}
                        className={`p-5 sm:p-6 rounded-3xl border-3 shadow-md hover:shadow-xl transition-all flex flex-col items-center justify-center text-center gap-2.5 active:scale-95 cursor-pointer disabled:opacity-50 ${
                          i === 0
                            ? 'bg-gradient-to-br from-amber-100 via-amber-50 to-amber-200 border-amber-400 text-amber-950 hover:border-amber-500'
                            : 'bg-gradient-to-br from-rose-100 via-rose-50 to-rose-200 border-rose-400 text-rose-950 hover:border-rose-500'
                        }`}
                      >
                        <span className="text-4xl sm:text-5xl animate-bounce" style={{ animationDuration: '2.5s' }}>
                          {choice.emoji}
                        </span>
                        <span className="font-serif font-extrabold text-base sm:text-lg">
                          {choice.text}
                        </span>
                      </button>
                    ))}
                  </div>

                  {isBranching && (
                    <div className="mt-3 p-3 bg-amber-100/80 border border-amber-300 rounded-xl flex items-center gap-3 animate-pulse">
                      <Sparkles className="w-5 h-5 text-amber-700 animate-spin" />
                      <span className="text-xs font-bold text-amber-950 font-serif">
                        {branchingStatus || 'Weaving your next adventure page...'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Big Kid Standard View */
              <>
                <div className="space-y-4 my-2">
                  {sentences.map((sentence, idx) => {
                    const isSentenceActive = isPlaying && activeSentenceIndex === idx;
                    const isAckSentence =
                      currentPage.drawingAcknowledgment &&
                      sentence.includes(currentPage.drawingAcknowledgment.slice(0, 15));

                    return (
                      <p
                        key={idx}
                        className={`font-serif text-xl sm:text-2xl lg:text-[25px] leading-relaxed transition-all duration-300 rounded-xl p-1.5 ${
                          isSentenceActive
                            ? 'bg-amber-200/80 text-amber-950 font-bold shadow-xs scale-101'
                            : isAckSentence
                            ? 'bg-rose-50/80 text-rose-950 border border-rose-200/60 font-medium'
                            : 'text-stone-800 font-normal hover:text-stone-950'
                        }`}
                      >
                        {sentence}
                      </p>
                    );
                  })}
                </div>

                {/* Drawing Acknowledgment Celebratory Card */}
                {currentPage.drawingAcknowledgment && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-200 text-xs text-rose-900 flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-rose-500 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-bold block">Storyteller Loved Your Drawing!</span>
                      <span className="italic leading-snug">Woven directly into the tale above.</span>
                    </div>
                  </div>
                )}

                {/* Interactive Vocabulary Sparks */}
                {currentPage.vocabularyWords && currentPage.vocabularyWords.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-amber-100">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tap to explore magic words:</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentPage.vocabularyWords.map((vocab) => (
                        <button
                          key={vocab.word}
                          onClick={() => setActiveVocabularyWord(vocab)}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs sm:text-sm font-bold rounded-xl border border-amber-300/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 group cursor-pointer"
                        >
                          <span className="group-hover:text-amber-800 underline decoration-amber-400 decoration-2 underline-offset-3">
                            {vocab.word}
                          </span>
                          <span className="text-[11px] text-amber-600 font-mono">
                            {vocab.phonetic ? `/${vocab.phonetic}/` : '✨'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* INTERACTIVE BRANCHING STORY CHOICES ON EVERY PAGE! */}
                {currentPage.choices && currentPage.choices.length > 0 && (
                  <div className="mt-8 pt-5 border-t-2 border-dashed border-amber-200/80">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-amber-600" />
                        <span>What should {activeCharacter.name} do next?</span>
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">Pick a path:</span>
                    </div>

                    <div className="space-y-2.5">
                      {currentPage.choices.map((choice, i) => (
                        <button
                          key={choice.id || i}
                          onClick={() => handleSelectChoice(choice)}
                          disabled={isBranching}
                          className="w-full p-3.5 rounded-2xl border-2 border-amber-200/80 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-100/60 text-left transition-all shadow-2xs hover:shadow-md flex items-start gap-3 group active:scale-98 disabled:opacity-50 cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-full bg-amber-400 group-hover:bg-amber-500 text-amber-950 font-bold text-xs flex items-center justify-center shrink-0 transition-colors">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div className="flex-1">
                            <span className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-amber-950 block">
                              {choice.text}
                            </span>
                            <span className="text-xs text-stone-500 group-hover:text-stone-700 block mt-0.5">
                              {choice.consequenceSummary}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-amber-400 group-hover:text-amber-700 shrink-0 self-center group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>

                    {isBranching && (
                      <div className="mt-3 p-3 bg-amber-100/80 border border-amber-300 rounded-xl flex items-center gap-3 animate-pulse">
                        <Sparkles className="w-5 h-5 text-amber-700 animate-spin" />
                        <span className="text-xs font-bold text-amber-950 font-serif">
                          {branchingStatus || 'Weaving your next adventure page...'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Page Turn Footnote Navigation */}
          <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={goToPrevPage}
              disabled={currentPageIndex === 0}
              className="py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Page</span>
            </button>

            {/* Page Dots */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[160px] py-1">
              {story.pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPageIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${
                    i === currentPageIndex
                      ? 'w-6 bg-amber-500'
                      : 'bg-stone-200 hover:bg-amber-300'
                  }`}
                  aria-label={`Jump to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPageIndex === totalPages - 1}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:pointer-events-none shadow-xs"
            >
              <span>Next Page</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>



      {/* Drawing Studio Modal */}
      <DrawingStudioModal
        pageNumber={currentPageIndex + 1}
        isOpen={isDrawingOpen}
        onClose={() => setIsDrawingOpen(false)}
        onSaveDrawing={handleSaveDrawing}
        initialDrawingUrl={currentPage.childDrawing?.dataUrl}
        heroName={activeCharacter.name}
      />

      {/* Illustration Studio Modal (Gemini 3 Pro with 1K 2K 4K affordance) */}
      <IllustrationStudioModal
        pageNumber={currentPageIndex + 1}
        currentPrompt={currentPage.illustrationPrompt}
        currentImageUrl={currentPage.illustrationUrl}
        currentSize={currentPage.illustrationResolution || '1K'}
        currentStyle={currentPage.artStyle || 'Classic Gouache Storybook'}
        characterProfile={activeCharacter}
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onApplyIllustration={(pageNum, newUrl, size, style, prompt) => {
          onUpdateStoryPage(story.id, pageNum, newUrl, size, style, prompt);
          setIsStudioOpen(false);
        }}
      />

      {/* Vocabulary Spark Modal */}
      <WordDictionaryModal
        wordData={activeVocabularyWord}
        onClose={() => setActiveVocabularyWord(null)}
        onPronounce={pronounceWord}
        isSpeaking={isSpeakingWord}
      />

      {/* Fullscreen Image Zoom Lightbox */}
      <ImageZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        imageUrl={zoomImageUrl || currentPage.illustrationUrl}
        storyTitle={zoomImageTitle || story.title}
        pageNumber={currentPageIndex + 1}
        resolution={currentPage.illustrationResolution || '1K'}
        prompt={currentPage.illustrationPrompt}
      />
    </div>
  );
};
