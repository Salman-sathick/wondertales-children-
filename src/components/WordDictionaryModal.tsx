import React from 'react';
import { Volume2, Sparkles, X, Check } from 'lucide-react';
import { VocabularyWord } from '../utils/story';

interface WordDictionaryModalProps {
  wordData: VocabularyWord | null;
  onClose: () => void;
  onPronounce: (word: string) => void;
  isSpeaking: boolean;
}

export const WordDictionaryModal: React.FC<WordDictionaryModalProps> = ({
  wordData,
  onClose,
  onPronounce,
  isSpeaking,
}) => {
  if (!wordData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-amber-300 relative transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="word-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          aria-label="Close word details"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-amber-950 shadow-sm">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              Magic Word Spark
            </span>
            <h2 id="word-title" className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900">
              {wordData.word}
            </h2>
          </div>
        </div>

        {wordData.phonetic && (
          <div className="flex items-center gap-3 mb-4 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/60">
            <button
              onClick={() => onPronounce(wordData.word)}
              disabled={isSpeaking}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse' : ''}`} />
              <span>{isSpeaking ? 'Listening...' : 'Say it aloud'}</span>
            </button>
            <span className="text-sm font-medium text-amber-900 font-mono">
              /{wordData.phonetic}/
            </span>
          </div>
        )}

        {/* Kid Friendly Explanation */}
        <div className="space-y-3 mb-6">
          <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/50">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-wide block mb-1">
              What it means for you:
            </span>
            <p className="text-stone-800 font-medium text-base leading-relaxed">
              "{wordData.childFriendly}"
            </p>
          </div>

          <div className="px-1 text-xs text-stone-500 leading-relaxed">
            <span className="font-semibold text-stone-600">Grown-up dictionary:</span> {wordData.definition}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 text-emerald-400" />
          <span>I Learned It! Keep Reading</span>
        </button>
      </div>
    </div>
  );
};
