import React from 'react';
import { X, Sparkles, Download, Layers } from 'lucide-react';
import { ImageSize } from '../utils/story';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  storyTitle: string;
  pageNumber: number;
  resolution: ImageSize;
  prompt: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  storyTitle,
  pageNumber,
  resolution,
  prompt,
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative max-w-5xl w-full max-h-[95vh] flex flex-col bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800"
        role="dialog"
        aria-modal="true"
        aria-label="Full-size illustration viewer"
      >
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
              {resolution} Resolution
            </span>
            <span className="text-sm font-serif font-bold text-stone-200">
              {storyTitle} · Page {pageNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              download={`${storyTitle.replace(/\s+/g, '_')}_Page_${pageNumber}_${resolution}.png`}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
              title="Download High-Res Image"
              aria-label="Download image"
            >
              <Download className="w-5 h-5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
          <img
            src={imageUrl}
            alt={`${storyTitle} Page ${pageNumber} high resolution illustration`}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
          />
        </div>

        {/* Bottom prompt caption */}
        <div className="px-5 py-3 bg-stone-950/90 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between gap-4">
          <p className="truncate font-sans italic">
            "{prompt}"
          </p>
          <span className="shrink-0 text-[11px] text-amber-400/80 font-mono">
            gemini-3-pro-image-preview
          </span>
        </div>
      </div>
    </div>
  );
};
