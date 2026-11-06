import React, { useState } from 'react';
import { Sparkles, BookOpen, Wand2, Compass, Heart, Volume2, PlusCircle, Search } from 'lucide-react';
import { Story } from '../utils/story';
import { StoryCard } from './StoryCard';

interface StoryLibraryProps {
  stories: Story[];
  onSelectStory: (story: Story) => void;
  onOpenCreateStory: () => void;
  onQuickListen: (story: Story) => void;
}

const CATEGORIES = ['All Stories', 'Bedtime & Space', 'Playful & Cooking', 'Ocean & Mystery', 'Custom Tales'];

export const StoryLibrary: React.FC<StoryLibraryProps> = ({
  stories,
  onSelectStory,
  onOpenCreateStory,
  onQuickListen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStories = stories.filter((story) => {
    const matchesCategory =
      selectedCategory === 'All Stories'
        ? true
        : selectedCategory === 'Custom Tales'
        ? story.isCustom
        : story.tag.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          selectedCategory.toLowerCase().includes(story.tag.toLowerCase());

    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.author.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-200/60 bg-gradient-to-r from-amber-100 via-rose-50 to-orange-100 p-6 sm:p-10 lg:p-12">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive Bedtime & Adventure Storybooks</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight">
            Stories that Speak, <br />
            <span className="text-amber-800">Pictures that Sparkle.</span>
          </h1>

          <p className="text-stone-700 text-base sm:text-lg leading-relaxed">
            Listen to enchanting tales read aloud by expressive voices with{' '}
            <strong className="text-amber-950 font-semibold">Gemini 3.8 Flash TTS</strong>, and repaint any page in{' '}
            <strong className="text-amber-950 font-semibold">1K, 2K, or 4K</strong> with{' '}
            <strong className="text-amber-950 font-semibold">Gemini 3 Pro</strong>!
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectStory(stories[0])}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read "Pip & The Lost Stardust"</span>
            </button>

            <button
              onClick={onOpenCreateStory}
              className="px-5 py-3 bg-white/90 hover:bg-white text-stone-800 hover:text-amber-900 font-bold text-sm rounded-xl border border-amber-300 shadow-xs transition-all flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-amber-600" />
              <span>Create New Tale</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="hidden md:block absolute right-6 bottom-4 lg:right-10 lg:bottom-6 w-80 lg:w-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 rotate-2 hover:rotate-0 transition-transform duration-500">
          <img
            src="/src/assets/images/hero_storybook_magic_1793981897302.jpg"
            alt="Enchanting pop-up magical storybook"
            referrerPolicy="no-referrer"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        {/* Category Filter Tabs (Interactive Functional Buttons) */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 ${
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
            placeholder="Search stories, heroes, themes..."
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
            className="px-4 py-2 bg-amber-500 text-white font-bold text-sm rounded-xl shadow-xs"
          >
            Weave a Story Now
          </button>
        </div>
      )}

      {/* Highlights / Features Banner (anti-slop clean typography) */}
      <div className="pt-8 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-6 text-stone-600 text-sm">
        <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-stone-200/70 shadow-2xs">
          <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-base">
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Gemini 3.8 Flash TTS</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Expressive bedtime storytelling with synchronized sentence highlighting, 5 child-friendly voice personas, and adjustable reading speed.
          </p>
        </div>

        <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-stone-200/70 shadow-2xs">
          <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-base">
            <Wand2 className="w-4 h-4 text-amber-600" />
            <span>Gemini 3 Pro Illustrations</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Repaint any page on demand with resolution affordance (1K standard, 2K crisp, 4K gallery detail) across 6 artistic children's book styles.
          </p>
        </div>

        <div className="space-y-1.5 p-4 rounded-2xl bg-white border border-stone-200/70 shadow-2xs">
          <div className="flex items-center gap-2 font-serif font-bold text-stone-900 text-base">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Magic Word Sparks</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">
            Interactive vocabulary sparks for young readers. Tap curious words to hear clear pronunciation and child-friendly definitions.
          </p>
        </div>
      </div>
    </div>
  );
};
