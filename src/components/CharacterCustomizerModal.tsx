import React, { useState } from 'react';
import {
  User,
  Sparkles,
  X,
  Check,
  Palette,
  Heart,
  Shirt,
  Smile,
  Wand2,
} from 'lucide-react';
import { CharacterProfile, CHARACTER_PRESETS } from '../utils/story';

interface CharacterCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCharacter: CharacterProfile;
  onSaveCharacter: (character: CharacterProfile, applyToActiveStory: boolean) => void;
}

const SPECIES_OPTIONS = [
  { label: 'Human Kid Explorer', icon: '👦' },
  { label: 'Baby Ruby Dragon', icon: '🐉' },
  { label: 'Clever Bunny Adventurer', icon: '🐰' },
  { label: 'Space Cat Sailor', icon: '🐱' },
  { label: 'Cozy Fluffy Bear', icon: '🐻' },
  { label: 'Helpful Robot Friend', icon: '🤖' },
];

const HAIR_STYLES = [
  'Golden curls with a red headband',
  'Midnight blue braids with star beads',
  'Fiery red curly hair',
  'Chestnut waves tucked in goggles',
  'Spiky lavender anime spikes',
  'Fluffy round animal ears with a flower',
];

const CLOTHING_STYLES = [
  'Starry indigo cape and adventure boots',
  'Cozy baker apron with rainbow patches',
  'Explorer khaki overalls and brass goggles',
  'Royal emerald tunic with golden buttons',
  'Cosmic flight jacket with glowing zippers',
  'Soft velvet bedtime pajamas with bunny slippers',
];

const PERSONALITY_TRAITS = [
  'Brave & curious (always eager to explore)',
  'Playful & silly (loves giggles and snacks)',
  'Thoughtful & kind (helps every animal friend)',
  'Inventive & clever (builds wonderful gadgets)',
  'Gentle & calm (loves peaceful lullabies and stars)',
];

export const CharacterCustomizerModal: React.FC<CharacterCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentCharacter,
  onSaveCharacter,
}) => {
  const [name, setName] = useState(currentCharacter.name);
  const [species, setSpecies] = useState(currentCharacter.species);
  const [hairStyle, setHairStyle] = useState(currentCharacter.hairStyle);
  const [clothing, setClothing] = useState(currentCharacter.clothing);
  const [personality, setPersonality] = useState(currentCharacter.personality);
  const [favoriteItem, setFavoriteItem] = useState(currentCharacter.favoriteItem || 'Magic spyglass');
  const [applyToActiveStory, setApplyToActiveStory] = useState(true);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: CharacterProfile) => {
    setName(preset.name);
    setSpecies(preset.species);
    setHairStyle(preset.hairStyle);
    setClothing(preset.clothing);
    setPersonality(preset.personality);
    if (preset.favoriteItem) setFavoriteItem(preset.favoriteItem);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: CharacterProfile = {
      id: currentCharacter.id || `char-${Date.now()}`,
      name: name.trim() || 'Oliver',
      species,
      hairStyle,
      clothing,
      personality,
      favoriteItem: favoriteItem.trim(),
    };
    onSaveCharacter(updatedProfile, applyToActiveStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customizer-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Character Customizer
              </span>
              <h2 id="customizer-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Create Your Storybook Hero
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Preset Selector */}
        <div className="px-6 py-3 bg-amber-50/40 border-b border-amber-100/60 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-amber-900 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Hero Presets:</span>
          </span>
          {CHARACTER_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1 bg-white hover:bg-amber-100 text-stone-700 hover:text-amber-950 text-xs font-bold rounded-xl border border-stone-200 transition-colors whitespace-nowrap shrink-0"
            >
              {preset.name} ({preset.species.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hero Name & Species */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Hero Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Leo, Maya, Oliver"
                required
                className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1">
                Form / Species
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white"
              >
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s.label} value={s.label}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hair Color & Style */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>Hair Style & Colors</span>
            </label>
            <input
              type="text"
              value={hairStyle}
              onChange={(e) => setHairStyle(e.target.value)}
              placeholder="e.g. Golden curls with a red headband"
              className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {HAIR_STYLES.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHairStyle(h)}
                  className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-amber-100 text-stone-700 rounded-lg transition-colors border border-stone-200/60"
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Clothing & Outfit */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shirt className="w-3.5 h-3.5 text-amber-600" />
              <span>Clothing & Costume Style</span>
            </label>
            <input
              type="text"
              value={clothing}
              onChange={(e) => setClothing(e.target.value)}
              placeholder="e.g. Starry indigo cape and adventure boots"
              className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CLOTHING_STYLES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setClothing(c)}
                  className="px-2.5 py-1 text-xs bg-stone-100 hover:bg-amber-100 text-stone-700 rounded-lg transition-colors border border-stone-200/60"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Personality Trait */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-amber-600" />
              <span>Personality Trait (Shapes Story & Voice)</span>
            </label>
            <select
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white font-medium"
            >
              {PERSONALITY_TRAITS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Live Preview Card */}
          <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Story & Illustration Prompt Preview:</span>
            </div>
            <p className="font-serif text-sm text-stone-800 leading-relaxed italic">
              "Starring <strong>{name}</strong> the {species}, who sports {hairStyle}, wears {clothing}, and brings a {personality.split('(')[0].trim()} spirit to every page."
            </p>
          </div>

          {/* Apply to active story checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
              <input
                type="checkbox"
                checked={applyToActiveStory}
                onChange={(e) => setApplyToActiveStory(e.target.checked)}
                className="rounded border-stone-300 text-amber-500 focus:ring-amber-400"
              />
              <span>Apply this hero across the active book and newly generated illustrations</span>
            </label>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save & Use Hero</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
