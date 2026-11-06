import React from 'react';
import { Volume2, BookOpen, Sparkles, Layers } from 'lucide-react';
import { Story } from '../utils/story';

interface StoryCardProps {
  story: Story;
  onSelectStory: (story: Story) => void;
  onQuickListen: (story: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelectStory,
  onQuickListen,
}) => {
  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Artwork Container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        {story.coverImage ? (
          <img
            src={story.coverImage}
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 via-rose-100 to-indigo-100 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-10 h-10 text-amber-500 mb-2 animate-bounce" />
            <span className="font-serif font-bold text-stone-800 text-lg">{story.title}</span>
            <span className="text-xs text-stone-500 mt-1">Ready for custom illustrations</span>
          </div>
        )}

        {/* Clean subtle overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Unboxed Metadata in corner (No Pill Enclosures) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/95 drop-shadow-md font-medium">
          <span className="font-semibold tracking-wide">{story.readingLevel}</span>
          <span>{story.pages.length} Illustrated Pages</span>
        </div>
      </div>

      {/* Story Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed category kicker */}
          <div className="text-xs font-semibold text-amber-800 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <span>{story.tag}</span>
            <span aria-hidden="true">·</span>
            <span>By {story.author}</span>
          </div>

          <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1 mb-2">
            {story.title}
          </h3>

          <p className="text-stone-600 text-sm line-clamp-2 leading-relaxed mb-4">
            {story.summary}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onSelectStory(story)}
            className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Story</span>
          </button>

          <button
            onClick={() => onQuickListen(story)}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-200/80 transition-colors"
            aria-label={`Listen to ${story.title} aloud`}
            title="Read Aloud with Gemini TTS"
          >
            <Volume2 className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      </div>
    </div>
  );
};
