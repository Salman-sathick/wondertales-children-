import React from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, Library, User, Palette } from 'lucide-react';
import { CharacterProfile } from '../utils/story';

interface HeaderProps {
  currentView: 'library' | 'reader';
  onNavigateLibrary: () => void;
  onOpenCreateStory: () => void;
  onOpenCustomizer: () => void;
  activeCharacter: CharacterProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeStoryTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateLibrary,
  onOpenCreateStory,
  onOpenCustomizer,
  activeCharacter,
  soundEnabled,
  onToggleSound,
  activeStoryTitle,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateLibrary}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1"
            aria-label="WonderTales Home Library"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-amber-300/40 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-amber-950 block leading-tight">
                WonderTales
              </span>
              <span className="text-[11px] font-medium text-amber-800/80 tracking-wide uppercase">
                Read-Aloud Storybooks
              </span>
            </div>
          </button>

          {activeStoryTitle && currentView === 'reader' && (
            <div className="hidden lg:flex items-center gap-2 pl-4 ml-4 border-l border-amber-200 text-sm font-medium text-stone-600 truncate max-w-xs">
              <span className="text-amber-800/60">Reading:</span>
              <span className="text-stone-900 font-serif truncate font-semibold">{activeStoryTitle}</span>
            </div>
          )}
        </div>

        {/* Center / Navigation Zone */}
        <nav className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={onNavigateLibrary}
            className={`px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              currentView === 'library'
                ? 'bg-amber-100/90 text-amber-900 shadow-xs border border-amber-300/70'
                : 'text-stone-700 hover:bg-amber-50/80 hover:text-amber-900'
            }`}
          >
            <Library className="w-4 h-4 text-amber-700" />
            <span>Story Shelf</span>
          </button>

          {/* Character Customizer Button */}
          <button
            onClick={onOpenCustomizer}
            className="px-3 py-2 bg-stone-100 hover:bg-amber-100/80 text-stone-800 hover:text-amber-950 rounded-xl border border-stone-200/80 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0"
            title="Customize hero name, appearance, hair, and clothing"
          >
            <User className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Hero:</span>
            <span className="text-amber-900 font-serif">{activeCharacter.name}</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-xl transition-colors shrink-0"
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-stone-400" />
            )}
          </button>
        </nav>

        {/* Primary Action: Weave New Story */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCreateStory}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 hover:from-amber-400 hover:to-yellow-400 border border-amber-400/80 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-800 animate-pulse" />
            <span className="hidden sm:inline">Weave New Story</span>
            <span className="sm:hidden">New Tale</span>
          </button>
        </div>
      </div>
    </header>
  );
};
