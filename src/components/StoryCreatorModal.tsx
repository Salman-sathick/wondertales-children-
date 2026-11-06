import React, { useState } from 'react';
import { Sparkles, Wand2, X, Compass, User, Palette, Layers, AlertCircle } from 'lucide-react';
import { ArtStyle, ImageSize, ReadingLevel, Story, validateStoryCreationInput, CharacterProfile, DEFAULT_CHARACTER } from '../utils/story';

interface StoryCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (newStory: Story) => void;
  activeCharacter: CharacterProfile;
}

const SETTING_PRESETS = [
  { name: 'Stardust Moon & Constellations', icon: '🌌' },
  { name: 'Enchanted Whispering Forest', icon: '🌲' },
  { name: 'Bioluminescent Coral Reef', icon: '🐠' },
  { name: 'Cloud Kingdom & Sky Bakery', icon: '☁️' },
  { name: 'Secret Dinosaur Valley', icon: '🦕' },
  { name: 'Candy Crystal Mountains', icon: '🍭' },
];

export const StoryCreatorModal: React.FC<StoryCreatorModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated,
  activeCharacter = DEFAULT_CHARACTER,
}) => {
  const [heroName, setHeroName] = useState(activeCharacter.name || 'Oliver');
  const [heroType, setHeroType] = useState(activeCharacter.species || 'Brave Fluffy Bunny');
  const [setting, setSetting] = useState('Enchanted Whispering Forest');
  const [plotIdea, setPlotIdea] = useState('Finding the glowing acorn that lights up the treehouse for bedtime');
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('Ages 3-5');
  const [artStyle, setArtStyle] = useState<ArtStyle>('Classic Gouache Storybook');
  const [imageSize, setImageSize] = useState<ImageSize>('2K');
  const [isWeaving, setIsWeaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateStoryCreationInput({
      heroName,
      heroType,
      setting,
      plotIdea,
      readingLevel,
      artStyle,
      imageSize,
      characterProfile: activeCharacter,
    });

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    setIsWeaving(true);
    setStatusMessage('Consulting the bedtime storyteller...');

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroName,
          heroType,
          setting,
          plotIdea,
          readingLevel,
          artStyle,
          imageSize,
          characterProfile: {
            ...activeCharacter,
            name: heroName,
            species: heroType,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to weave story');
      }

      if (data.story) {
        onStoryCreated(data.story);
        onClose();
      }
    } catch (err: any) {
      console.warn('Backend story generation unavailable, creating instant offline dream story:', err);
      // Seamless kid-delight fallback so the kid never gets stuck!
      const fallbackStory: Story = {
        id: `custom-${Date.now()}`,
        title: `${heroName} and the Quest of ${setting.split(' ')[0]}`,
        author: `${heroName}'s Dream Guild`,
        readingLevel,
        tag: 'New Adventure',
        summary: `A delightful bedtime adventure featuring ${heroName} the ${heroType} exploring ${setting}.`,
        coverImage: '/src/assets/images/story_dragon_stargazing_1793981895501.jpg',
        themeColor: 'from-amber-400/20 to-teal-400/20',
        createdAt: new Date().toISOString().split('T')[0],
        isCustom: true,
        activeCharacter: {
          ...activeCharacter,
          name: heroName,
          species: heroType,
        },
        pages: [
          {
            pageNumber: 1,
            text: `Once upon a sunny afternoon in ${setting}, ${heroName} the ${heroType} strapped on a tiny satchel and set off with a happy hop!`,
            illustrationPrompt: `${heroName} the ${heroType} packing a tiny satchel in ${setting}, wearing ${activeCharacter.clothing}`,
            illustrationUrl: '/src/assets/images/story_dragon_stargazing_1793981895501.jpg',
            illustrationResolution: imageSize,
            artStyle: artStyle,
            displayMode: 'both',
            choices: [
              {
                id: 'custom-c1-1',
                text: 'Follow the glowing butterfly path over the mossy brook',
                consequenceSummary: 'The butterflies lead to a hidden musical glade.',
                illustrationHint: `${heroName} crossing stepping stones surrounded by glowing butterflies.`,
              },
              {
                id: 'custom-c1-2',
                text: 'Climb the great golden oak tree to look out with spyglass',
                consequenceSummary: `${heroName} spots a sparkling rainbow lantern in the distance.`,
                illustrationHint: `${heroName} perched on a sturdy tree branch peering through a telescope.`,
              },
            ],
            vocabularyWords: [
              {
                word: 'Satchel',
                phonetic: 'SATCH-uhl',
                definition: 'A small bag with a strap worn over the shoulder.',
                childFriendly: 'A handy pocket bag for adventure snacks!',
              },
            ],
          },
          {
            pageNumber: 2,
            text: `Along the winding trail, ${heroName} discovered a mystery: ${plotIdea}! A gentle breeze whispered helpful clues among the leaves.`,
            illustrationPrompt: `${heroName} discovering glowing clues along a mossy trail in ${setting}`,
            illustrationUrl: '/src/assets/images/story_bear_cloud_bakery_1793981896365.jpg',
            illustrationResolution: imageSize,
            artStyle: artStyle,
            displayMode: 'both',
            choices: [
              {
                id: 'custom-c2-1',
                text: 'Team up with a wise little forest hedgehog',
                consequenceSummary: 'The hedgehog shares delicious wild berry snacks and safe paths.',
                illustrationHint: `${heroName} sharing berries with a friendly hedgehog wearing a leaf hat.`,
              },
              {
                id: 'custom-c2-2',
                text: 'Solve the riddle written in sparkling tree bark',
                consequenceSummary: 'The tree blossoms into glowing star flowers.',
                illustrationHint: `${heroName} tracing glowing letters on an ancient oak trunk.`,
              },
            ],
            vocabularyWords: [
              {
                word: 'Courage',
                phonetic: 'KUR-ij',
                definition: 'Bravery when facing something new or tricky.',
                childFriendly: 'Taking a brave step even when your knees feel wiggly!',
              },
            ],
          },
          {
            pageNumber: 3,
            text: `With big teamwork and clever thinking, ${heroName} solved the puzzle! Friendly woodland companions gathered to cheer and clap.`,
            illustrationPrompt: `Friendly animals celebrating with ${heroName} under a canopy of rainbow light`,
            illustrationUrl: '/src/assets/images/story_coral_kingdom_1793981896597.jpg',
            illustrationResolution: imageSize,
            artStyle: artStyle,
            displayMode: 'both',
            choices: [
              {
                id: 'custom-c3-1',
                text: 'Dance the Starlight Reel with all the woodland friends',
                consequenceSummary: 'Music rings through the forest as fireflies twirl.',
                illustrationHint: `All the animals dancing in a circle around ${heroName}.`,
              },
              {
                id: 'custom-c3-2',
                text: 'Snuggle down for cozy bedtime lullabies under the moon',
                consequenceSummary: `${heroName} drifts into peaceful sleep with a warm heart.`,
                illustrationHint: `${heroName} sleeping under a starlight blanket.`,
              },
            ],
            vocabularyWords: [
              {
                word: 'Triumph',
                phonetic: 'TRY-umf',
                definition: 'A wonderful victory and joyful achievement.',
                childFriendly: 'A giant cheer when you finish a great goal!',
              },
            ],
          },
          {
            pageNumber: 4,
            text: `As the cozy twilight stars drifted into view, ${heroName} curled up warm and safe, dreaming of tomorrow\'s big journeys. Goodnight, brave friend!`,
            illustrationPrompt: `${heroName} sleeping peacefully under glowing starry blankets in a cozy hollow`,
            illustrationUrl: '/src/assets/images/hero_storybook_magic_1793981897302.jpg',
            illustrationResolution: imageSize,
            artStyle: artStyle,
            displayMode: 'both',
            choices: [],
            vocabularyWords: [
              {
                word: 'Slumber',
                phonetic: 'SLUM-ber',
                definition: 'To sleep peacefully and rest deeply.',
                childFriendly: 'Dreamy cozy sleeping!',
              },
            ],
          },
        ],
      };

      onStoryCreated(fallbackStory);
      onClose();
    } finally {
      setIsWeaving(false);
      setStatusMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Story Studio Wizard
              </span>
              <h2 id="creator-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Weave a Brand New Tale
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close creator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {validationErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Please check the following:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hero Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Who is the Story Hero?</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  Hero Name
                </label>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) => setHeroName(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Oliver, Maya, Pip"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-500 block mb-1">
                  Creature or Persona
                </label>
                <input
                  type="text"
                  value={heroType}
                  onChange={(e) => setHeroType(e.target.value)}
                  className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="e.g. Brave Bunny, Space Robot"
                  required
                />
              </div>
            </div>

            {/* Customizer appearance badge */}
            <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-center justify-between">
              <div>
                <span className="font-bold">Active Hero Appearance:</span>{' '}
                <span className="italic">{activeCharacter.hairStyle}, wearing {activeCharacter.clothing}</span>
              </div>
            </div>
          </div>

          {/* Setting Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              <span>Magical Setting & World</span>
            </label>
            <input
              type="text"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              placeholder="e.g. Floating Island of Windmills"
              required
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1">
              {SETTING_PRESETS.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSetting(s.name)}
                  className={`p-2 text-left rounded-lg border text-xs transition-all flex items-center gap-1.5 ${
                    setting === s.name
                      ? 'border-amber-400 bg-amber-50 text-amber-950 font-semibold'
                      : 'border-stone-200 bg-white hover:border-amber-200 text-stone-700'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Plot / Mission */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
              What adventure or quest happens?
            </label>
            <textarea
              value={plotIdea}
              onChange={(e) => setPlotIdea(e.target.value)}
              rows={2}
              className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none"
              placeholder="e.g. Finding a lost baby dragon egg before nightfall"
            />
          </div>

          {/* Reading Level & Resolution Config */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Reading Level
              </label>
              <div className="flex gap-2">
                {(['Ages 3-5', 'Ages 6-8', 'Ages 9-12'] as ReadingLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setReadingLevel(level)}
                    className={`flex-1 py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                      readingLevel === level
                        ? 'border-amber-500 bg-amber-50 text-amber-950'
                        : 'border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Illustration Resolution Affordance (1K, 2K, 4K) */}
            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                Illustration Size (Gemini 3 Pro)
              </label>
              <div className="flex gap-2">
                {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                      imageSize === size
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300 bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Art Style selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>Default Illustration Art Style</span>
            </label>
            <select
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
              className="w-full p-2.5 text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none bg-white"
            >
              <option value="Classic Gouache Storybook">Classic Fairytale Gouache</option>
              <option value="Whimsical Watercolor">Soft Whimsical Watercolor</option>
              <option value="Playful Claymation">Handcrafted Claymation</option>
              <option value="Dreamy Soft Pastels">Gentle Bedtime Pastels</option>
              <option value="3D Animated Magic">3D Animated Movie Style</option>
              <option value="Handmade Paper Cutout">Layered Paper Cutout Collage</option>
            </select>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isWeaving}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isWeaving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || 'Weaving Storybook...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Weave 4-Page Story</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
