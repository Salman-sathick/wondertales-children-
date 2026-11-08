import React, { useState } from 'react';
import { Sparkles, BookOpen, Wand2, Compass, Heart, Volume2, PlusCircle, Search, Baby } from 'lucide-react';
import { Story } from '../utils/story';
import { StoryCard } from './StoryCard';
import { StoryImage } from './StoryImage';

interface StoryLibraryProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onOpenCreateStory: () => void;
  onQuickListen: (story: Story) => void;
  isToddlerMode?: boolean;
  onToggleToddlerMode?: () => void;
  onNavigateSounds?: () => void;
  onNavigateDraw?: () => void;
}

const CATEGORIES = ['All Stories', 'Ages 3-5', 'Ages 6-8', 'Ages 8-10', 'Custom Tales'];

export const StoryLibrary: React.FC<StoryLibraryProps> = ({
  stories,
  onSelectStory,
  onOpenCreateStory,
  onQuickListen,
  isToddlerMode = true,
  onToggleToddlerMode,
  onNavigateSounds,
  onNavigateDraw,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter((story) => {
    const matchesCategory =
      selectedCategory === 'All Stories'
        ? true
        : selectedCategory === 'Custom Tales'
        ? story.isCustom
        : story.readingLevel === selectedCategory ||
          story.tag.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(story.tag.toLowerCase());

    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.readingLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (story.toddlerTitle && story.toddlerTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Mode Switcher Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" role="img" aria-label="Baby emoji">
            {isToddlerMode ? '👶' : '🌟'}
          </span>
          <div>
            <span className="text-xs sm:text-sm font-bold text-stone-900 block">
              {isToddlerMode
                ? '👶 2-Year-Old Mode (Active): Big pictures, 1-line stories & tap to sparkle!'
                : '🌟 Big Kid Mode: Full reading practice, vocabulary sparks & detailed narrative.'}
            </span>
            <span className="text-[11px] text-stone-500">
              {isToddlerMode
                ? 'Perfect for toddlers and preschoolers (ages 2-5)'
                : 'Great for independent readers (ages 6-10)'}
            </span>
          </div>
        </div>

        {onToggleToddlerMode && (
          <button
            onClick={onToggleToddlerMode}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer shadow-2xs ${
              isToddlerMode
                ? 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                : 'bg-stone-100 text-stone-800 border-stone-300 hover:bg-stone-200'
            }`}
          >
            {isToddlerMode ? 'Switch to Big Kid Mode 🌟' : 'Switch to 👶 2-Year-Old Mode'}
          </button>
        )}
      </div>

      {/* Hero Welcome Banner */}
      <div className="rounded-3xl shadow-xl border border-amber-200/60 bg-gradient-to-r from-amber-100 via-rose-50 to-orange-100 p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                {isToddlerMode
                  ? 'Fun & Gentle Picture Stories for Little Ones'
                  : 'Interactive Bedtime & Adventure Storybooks'}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight">
              {isToddlerMode ? (
                <>
                  Stories that Speak, <br />
                  <span className="text-amber-800">Tap to Sparkle! ✨</span>
                </>
              ) : (
                <>
                  Stories that Speak, <br />
                  <span className="text-amber-800">Pictures that Sparkle.</span>
                </>
              )}
            </h1>

            <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
              {isToddlerMode
                ? 'Pick a cute animal friend! Hear friendly voices read aloud, tap the pictures for magical stars, and choose what happens next with big picture buttons!'
                : 'Listen to enchanting tales read aloud by expressive voices, customize your brave hero, draw your own illustrations, and branch every chapter with magical choices!'}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => onSelectStory(stories[0])}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>Play "Pip the Dragon" 🐲</span>
              </button>

              <button
                onClick={onOpenCreateStory}
                className="px-4 py-3 bg-white/90 hover:bg-white text-stone-800 hover:text-amber-900 font-bold text-sm rounded-xl border border-amber-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-amber-600" />
                <span>Weave Tale</span>
              </button>

              {onNavigateSounds && (
                <button
                  onClick={onNavigateSounds}
                  className="px-4 py-3 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-sm rounded-xl border border-amber-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>🐾</span>
                  <span>Animal Sounds</span>
                </button>
              )}

              {onNavigateDraw && (
                <button
                  onClick={onNavigateDraw}
                  className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-950 font-bold text-sm rounded-xl border border-rose-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>🎨</span>
                  <span>Draw Art</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: In-flow Framed Storybook Graphic with Interactive Sparkles */}
          <div className="md:col-span-5 lg:col-span-4 flex justify-center">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white/90 transition-transform duration-300 hover:scale-[1.02]">
              <StoryImage
                type="dragon"
                alt="Enchanting bedtime storybook with friendly baby dragon"
                interactiveSparkles={true}
                className="w-full h-auto aspect-4/3 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toddler Quick Friends Strip: Big animal buttons for instant 1-tap play */}
      {isToddlerMode && (
        <div className="p-4 bg-amber-50/70 border border-amber-200/70 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <span>🐾</span>
              <span>Pick a Story Friend (Tap to Play):</span>
            </span>
            <span className="text-xs text-amber-700 font-medium">1-Tap Start</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stories.slice(0, 4).map((story) => (
              <button
                key={story.id}
                onClick={() => onSelectStory(story)}
                className="p-3 bg-white hover:bg-amber-100/60 rounded-2xl border-2 border-amber-200 hover:border-amber-400 shadow-xs transition-all flex flex-col items-center text-center gap-2 cursor-pointer active:scale-95 group"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                  <StoryImage
                    type={(story.illustrationType as any) || 'dragon'}
                    alt={story.toddlerTitle || story.title}
                    interactiveSparkles={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-950 line-clamp-1">
                  {story.toddlerTitle || story.title}
                </span>
                <span className="text-[11px] text-amber-800 font-medium">
                  {story.toddlerSummary || 'Tap to play!'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stories, heroes, ages..."
            className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Story Cards Grid */}
      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onSelectStory={onSelectStory}
              onQuickListen={onQuickListen}
              isToddlerMode={isToddlerMode}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-stone-800">No stories found</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            Try adjusting your search or create your own custom adventure with our Story Wizard!
          </p>
          <button
            onClick={onOpenCreateStory}
            className="px-4 py-2 bg-amber-500 text-white font-bold text-sm rounded-xl shadow-xs cursor-pointer"
          >
            Weave a Story Now
          </button>
        </div>
      )}
    </div>
  );
};

