import React from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, Library, User, Palette } from 'lucide-react';
import { CharacterProfile } from '../utils/story';

interface HeaderProps {
  currentView: 'library' | 'reader' | 'sounds' | 'draw';
  onNavigateLibrary: () => void;
  onNavigateSounds: () => void;
  onNavigateDraw: () => void;
  onOpenCreateStory: () => void;
  onOpenCustomizer: () => void;
  activeCharacter: CharacterProfile;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeStoryTitle?: string;
  isToddlerMode: boolean;
  onToggleToddlerMode: () => void;
  hasPaidPass: boolean;
  onOpenPaywall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateLibrary,
  onNavigateSounds,
  onNavigateDraw,
  onOpenCreateStory,
  onOpenCustomizer,
  activeCharacter,
  soundEnabled,
  onToggleSound,
  activeStoryTitle,
  isToddlerMode,
  onToggleToddlerMode,
  hasPaidPass,
  onOpenPaywall,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNavigateLibrary}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-lg p-1 cursor-pointer"
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
                {isToddlerMode ? '👶 2yo Storybooks' : 'Read-Aloud Storybooks'}
              </span>
            </div>
          </button>

          {activeStoryTitle && currentView === 'reader' && (
            <div className="hidden xl:flex items-center gap-2 pl-4 ml-4 border-l border-amber-200 text-sm font-medium text-stone-600 truncate max-w-xs">
              <span className="text-amber-800/60">Reading:</span>
              <span className="text-stone-900 font-serif truncate font-semibold">{activeStoryTitle}</span>
            </div>
          )}
        </div>

        {/* Center / Navigation Zone */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
          {/* Toddler Mode Switch */}
          <button
            onClick={onToggleToddlerMode}
            className={`px-3 py-1.5 sm:py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              isToddlerMode
                ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 shadow-2xs'
                : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
            }`}
            title="Switch between 2-Year-Old Mode and Big Kid Mode"
          >
            <span>{isToddlerMode ? '👶 2yo Mode' : '🌟 Big Kid Mode'}</span>
          </button>

          {/* Story Shelf */}
          <button
            onClick={onNavigateLibrary}
            className={`px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'library'
                ? 'bg-amber-100/90 text-amber-900 shadow-xs border border-amber-300/70 font-bold'
                : 'text-stone-700 hover:bg-amber-50/80 hover:text-amber-900'
            }`}
          >
            <Library className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Story Shelf</span>
            <span className="sm:hidden">Shelf</span>
          </button>

          {/* Animal Sounds */}
          <button
            onClick={onNavigateSounds}
            className={`px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'sounds'
                ? 'bg-amber-100/90 text-amber-900 shadow-xs border border-amber-300/70 font-bold'
                : 'text-stone-700 hover:bg-amber-50/80 hover:text-amber-900'
            }`}
          >
            <span>🐾</span>
            <span className="hidden sm:inline">Animal Sounds</span>
            <span className="sm:hidden">Sounds</span>
          </button>

          {/* Blank Draw Page */}
          <button
            onClick={onNavigateDraw}
            className={`px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentView === 'draw'
                ? 'bg-rose-100/90 text-rose-950 shadow-xs border border-rose-300/70 font-bold'
                : 'text-stone-700 hover:bg-rose-50/80 hover:text-rose-900'
            }`}
          >
            <Palette className="w-4 h-4 text-rose-600" />
            <span>Draw</span>
          </button>

          {/* Character Customizer Button */}
          <button
            onClick={onOpenCustomizer}
            className="hidden md:flex px-3 py-2 bg-stone-100 hover:bg-amber-100/80 text-stone-800 hover:text-amber-950 rounded-xl border border-stone-200/80 text-xs font-bold items-center gap-1.5 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            title="Customize hero name, appearance, hair, and clothing"
          >
            <User className="w-3.5 h-3.5 text-amber-700" />
            <span>Hero:</span>
            <span className="text-amber-900 font-serif">{activeCharacter.name}</span>
          </button>

          {/* Magic Pass Status / Upgrade Button */}
          <button
            onClick={onOpenPaywall}
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              hasPaidPass
                ? 'bg-amber-200/80 text-amber-950 border-amber-400'
                : 'bg-gradient-to-r from-amber-100 to-rose-100 text-amber-950 border-amber-300 hover:brightness-105'
            }`}
            title="WonderTales Magic Pass Upgrade"
          >
            <span>👑</span>
            <span className="hidden sm:inline">{hasPaidPass ? 'Magic Pass' : 'Upgrade'}</span>
          </button>

          <button
            onClick={onToggleSound}
            className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-xl transition-colors shrink-0 cursor-pointer"
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
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-300 hover:from-amber-400 hover:to-yellow-400 border border-amber-400/80 rounded-xl shadow-xs hover:shadow-md transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-800 animate-pulse" />
            <span className="hidden sm:inline">Weave Story</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
