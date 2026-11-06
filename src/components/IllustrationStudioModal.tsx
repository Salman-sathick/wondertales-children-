import React, { useState } from 'react';
import { Sparkles, X, Wand2, Check, RefreshCw, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { ArtStyle, ImageSize, CharacterProfile } from '../utils/story';

interface IllustrationStudioModalProps {
  pageNumber: number;
  currentPrompt: string;
  currentImageUrl: string;
  currentSize: ImageSize;
  currentStyle: ArtStyle;
  characterProfile?: CharacterProfile;
  isOpen: boolean;
  onClose: () => void;
  onApplyIllustration: (pageNumber: number, newImageUrl: string, size: ImageSize, style: ArtStyle, prompt: string) => void;
}

const AVAILABLE_STYLES: { id: ArtStyle; name: string; description: string }[] = [
  { id: 'Classic Gouache Storybook', name: 'Classic Fairytale Gouache', description: 'Rich storybook brushstrokes and charming textures' },
  { id: 'Whimsical Watercolor', name: 'Soft Watercolor', description: 'Dreamy translucent washes on textured paper' },
  { id: 'Playful Claymation', name: 'Claymation Miniature', description: 'Handcrafted polymer clay stop-motion look' },
  { id: 'Dreamy Soft Pastels', name: 'Gentle Bedtime Pastels', description: 'Peaceful chalk pastels and glowing highlights' },
  { id: '3D Animated Magic', name: '3D Animated Adventure', description: 'Vibrant studio animated movie character style' },
  { id: 'Handmade Paper Cutout', name: 'Layered Paper Craft', description: 'Charming textured paper collage with drop shadows' },
];

const QUICK_DETAIL_CHIPS = [
  '✨ Add glowing stardust sparkles',
  '🌅 Warm golden hour sunlight',
  '🌙 Cozy night with glowing lanterns',
  '🦋 Friendly fluttering butterflies',
  '🌈 Faint rainbow arch in the sky',
  '🍄 Giant glowing fairy mushrooms',
];

export const IllustrationStudioModal: React.FC<IllustrationStudioModalProps> = ({
  pageNumber,
  currentPrompt,
  currentImageUrl,
  currentSize,
  currentStyle,
  characterProfile,
  isOpen,
  onClose,
  onApplyIllustration,
}) => {
  const [selectedSize, setSelectedSize] = useState<ImageSize>(currentSize || '1K');
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(currentStyle || 'Classic Gouache Storybook');
  const [promptText, setPromptText] = useState(currentPrompt);
  const [extraDetails, setExtraDetails] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-illustration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          size: selectedSize,
          style: selectedStyle,
          extraNotes: extraDetails,
          aspectRatio: '4:3',
          characterProfile: characterProfile || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setGeneratedPreviewUrl(data.imageUrl);
      } else {
        throw new Error('No illustration returned');
      }
    } catch (err: any) {
      console.error('Illustration generation failed:', err);
      setErrorMsg(
        err.message?.includes('GEMINI_API_KEY')
          ? 'Notice: To generate custom Gemini 3 Pro images, ensure your GEMINI_API_KEY is configured in Settings > Secrets. You can also preview the pre-rendered artwork!'
          : err.message || 'Unable to generate illustration right now.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedPreviewUrl) {
      onApplyIllustration(pageNumber, generatedPreviewUrl, selectedSize, selectedStyle, promptText);
      onClose();
    }
  };

  const addQuickChip = (chip: string) => {
    const cleanChip = chip.replace(/^[^\w]+/, '').trim();
    if (extraDetails.includes(cleanChip)) return;
    setExtraDetails(prev => (prev ? `${prev}, ${cleanChip}` : cleanChip));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="studio-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-amber-950">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Illustration Studio · Page {pageNumber}
              </span>
              <h2 id="studio-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                New Page Illustration
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top row: Current preview vs Generated preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Image */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
                Current Illustration
              </span>
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border border-stone-200 bg-stone-100">
                <img
                  src={currentImageUrl}
                  alt={`Current Page ${pageNumber} Illustration`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono rounded-md">
                  {currentSize}
                </div>
              </div>
            </div>

            {/* Generated Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gemini 3 Pro Preview ({selectedSize})</span>
                </span>
                {generatedPreviewUrl && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Ready
                  </span>
                )}
              </div>

              <div className="relative aspect-4/3 rounded-2xl overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50/40 flex items-center justify-center">
                {isGenerating ? (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-amber-600 rounded-full animate-spin mx-auto" />
                    <div>
                      <p className="font-serif font-bold text-stone-900 text-base">
                        Painting with Gemini 3 Pro...
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        Rendering at {selectedSize} resolution in {selectedStyle}
                      </p>
                    </div>
                  </div>
                ) : generatedPreviewUrl ? (
                  <>
                    <img
                      src={generatedPreviewUrl}
                      alt="Generated illustration preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-amber-900/80 backdrop-blur-xs text-amber-100 text-xs font-bold rounded-md">
                      {selectedSize} · High Res
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2 text-stone-400">
                    <ImageIcon className="w-10 h-10 mx-auto text-amber-300" />
                    <p className="text-sm font-medium text-stone-600">
                      Configure details below and click generate
                    </p>
                    <p className="text-xs text-stone-400">
                      Powered by model <span className="font-mono text-stone-600">gemini-3-pro-image-preview</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {characterProfile && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <span className="font-bold">Incorporating Hero:</span>
              <span>{characterProfile.name} ({characterProfile.species}) with {characterProfile.hairStyle}, wearing {characterProfile.clothing}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              {errorMsg}
            </div>
          )}

          {/* CRITICAL AFFORDANCE: User selects Image Size (1K, 2K, 4K) */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              Illustration Resolution (Gemini 3 Pro Affordance)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => {
                const isSelected = selectedSize === size;
                const descriptions: Record<ImageSize, string> = {
                  '1K': '1024px · Standard Storybook',
                  '2K': '2048px · Crisp High-Definition',
                  '4K': '4096px · Ultra Fine Detail Gallery',
                };
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-white ring-2 ring-amber-400/40 shadow-xs'
                        : 'border-stone-200 bg-white/70 hover:bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-serif font-bold text-base ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                        {size}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                    </div>
                    <span className="text-[11px] text-stone-500 block leading-tight">
                      {descriptions[size]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Art Style Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
              Storybook Art Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVAILABLE_STYLES.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-400 text-amber-950'
                        : 'border-stone-200 hover:border-amber-300 bg-white text-stone-700'
                    }`}
                  >
                    <span className="font-semibold text-xs block truncate mb-0.5">
                      {style.name}
                    </span>
                    <span className="text-[10px] text-stone-500 line-clamp-1">
                      {style.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Editor & Details */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              Illustration Scene Prompt
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              rows={2}
              className="w-full p-3 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none font-sans"
              placeholder="Describe the magical scene for this page..."
            />

            {/* Quick Detail Chips */}
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                Add magical details:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_DETAIL_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => addQuickChip(chip)}
                    className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 rounded-lg transition-colors border border-stone-200/60"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {extraDetails && (
              <div className="flex items-center gap-2 pt-1 text-xs text-amber-900">
                <span className="font-semibold">Added details:</span>
                <span className="italic truncate">{extraDetails}</span>
                <button
                  type="button"
                  onClick={() => setExtraDetails('')}
                  className="text-stone-400 hover:text-stone-600 underline text-[11px]"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || !promptText.trim()}
              className="px-4 sm:px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>
                {isGenerating ? 'Generating Illustration...' : `Generate in ${selectedSize}`}
              </span>
            </button>

            {generatedPreviewUrl && (
              <button
                type="button"
                onClick={handleApply}
                className="px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Use on Page {pageNumber}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
