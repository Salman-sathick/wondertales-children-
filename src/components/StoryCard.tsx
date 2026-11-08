import React from 'react';
import { Volume2, BookOpen, Sparkles, Play } from 'lucide-react';
import { Story } from '../utils/story';
import { StoryImage, StoryIllustrationType } from './StoryImage';

interface StoryCardProps {
  story: Story;
  onSelectStory: (story: Story) => void;
  onQuickListen: (story: Story) => void;
  isToddlerMode?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onSelectStory,
  onQuickListen,
  isToddlerMode = false,
}) => {
  const displayTitle = isToddlerMode && story.toddlerTitle ? story.toddlerTitle : story.title;
  const displaySummary = isToddlerMode && story.toddlerSummary ? story.toddlerSummary : story.summary;

  return (
    <div
      onClick={() => onSelectStory(story)}
      className={`group bg-white rounded-3xl border shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer active:scale-[0.98] ${
        isToddlerMode
          ? 'border-amber-300 ring-2 ring-amber-200/60 hover:ring-amber-400'
          : 'border-stone-200/80 hover:border-amber-300'
      }`}
    >
      {/* Cover Artwork Container */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <StoryImage
          src={story.coverImage}
          alt={displayTitle}
          type={(story.illustrationType as StoryIllustrationType) || 'dragon'}
          interactiveSparkles={true}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Clean subtle overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity pointer-events-none" />

        {/* Unboxed Metadata in corner (No Pill Enclosures) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/95 drop-shadow-md font-medium pointer-events-none">
          <span className="font-semibold tracking-wide">
            {isToddlerMode ? '👶 Ages 2-4' : story.readingLevel}
          </span>
          <span>{story.pages.length} Pages</span>
        </div>
      </div>

      {/* Story Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category kicker */}
          <div className="text-xs font-semibold text-amber-800 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
            <span>{story.tag}</span>
            <span aria-hidden="true">·</span>
            <span>By {story.author}</span>
          </div>

          <h3
            className={`font-serif font-bold text-stone-900 group-hover:text-amber-900 transition-colors line-clamp-1 mb-2 ${
              isToddlerMode ? 'text-2xl text-amber-950 font-extrabold' : 'text-xl'
            }`}
          >
            {displayTitle}
          </h3>

          <p
            className={`text-stone-600 line-clamp-2 leading-relaxed mb-4 ${
              isToddlerMode ? 'text-base font-medium text-stone-700' : 'text-sm'
            }`}
          >
            {displaySummary}
          </p>
        </div>

        {/* Action Controls */}
        <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectStory(story);
            }}
            className={`flex-1 py-3 px-4 font-bold rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
              isToddlerMode
                ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 text-base shadow-sm ring-2 ring-amber-300'
                : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm'
            }`}
          >
            {isToddlerMode ? (
              <>
                <Play className="w-5 h-5 fill-amber-950 text-amber-950" />
                <span>Play Story</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Read Story</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickListen(story);
            }}
            className={`p-3 rounded-2xl border transition-colors cursor-pointer ${
              isToddlerMode
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/80'
            }`}
            aria-label={`Listen to ${displayTitle} aloud`}
            title="Read Aloud with Gemini Voice"
          >
            <Volume2 className="w-5 h-5 text-amber-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

