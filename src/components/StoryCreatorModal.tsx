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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      const lowerHero = `${heroName} ${heroType}`.toLowerCase();
      let detectedIllustrationType: 'dragon' | 'bear' | 'turtle' | 'pegasus' | 'hero' | 'puppy' | 'bunny' | 'dino' = 'bunny';
      if (lowerHero.includes('dragon') || lowerHero.includes('pip')) {
        detectedIllustrationType = 'dragon';
      } else if (lowerHero.includes('bear') || lowerHero.includes('barnaby')) {
        detectedIllustrationType = 'bear';
      } else if (lowerHero.includes('turtle') || lowerHero.includes('marina') || setting.toLowerCase().includes('reef')) {
        detectedIllustrationType = 'turtle';
      } else if (lowerHero.includes('pony') || lowerHero.includes('pegasus') || lowerHero.includes('starla')) {
        detectedIllustrationType = 'pegasus';
      } else if (lowerHero.includes('dino')) {
        detectedIllustrationType = 'dino';
      } else if (lowerHero.includes('dog') || lowerHero.includes('puppy')) {
        detectedIllustrationType = 'puppy';
      } else if (lowerHero.includes('human') || lowerHero.includes('kid') || lowerHero.includes('child')) {
        detectedIllustrationType = 'hero';
      }

      if (data.story) {
        const enrichedStory: Story = {
          ...data.story,
          illustrationType: data.story.illustrationType || detectedIllustrationType,
          pages: (data.story.pages || []).map((p: any) => ({
            ...p,
            illustrationType: p.illustrationType || detectedIllustrationType,
          })),
        };
        onStoryCreated(enrichedStory);
        onClose();
        return;
      }
    } catch (err: any) {
      console.warn('Backend story generation unavailable, creating instant offline dream story:', err);

      const lowerHero = `${heroName} ${heroType}`.toLowerCase();
      let detectedIllustrationType: 'dragon' | 'bear' | 'turtle' | 'pegasus' | 'hero' | 'puppy' | 'bunny' | 'dino' = 'bunny';
      if (lowerHero.includes('dragon') || lowerHero.includes('pip')) {
        detectedIllustrationType = 'dragon';
      } else if (lowerHero.includes('bear') || lowerHero.includes('barnaby')) {
        detectedIllustrationType = 'bear';
      } else if (lowerHero.includes('turtle') || lowerHero.includes('marina') || setting.toLowerCase().includes('reef')) {
        detectedIllustrationType = 'turtle';
      } else if (lowerHero.includes('pony') || lowerHero.includes('pegasus') || lowerHero.includes('starla')) {
        detectedIllustrationType = 'pegasus';
      } else if (lowerHero.includes('dino')) {
        detectedIllustrationType = 'dino';
      } else if (lowerHero.includes('dog') || lowerHero.includes('puppy')) {
        detectedIllustrationType = 'puppy';
      } else if (lowerHero.includes('human') || lowerHero.includes('kid') || lowerHero.includes('child')) {
        detectedIllustrationType = 'hero';
      }

      // Seamless kid-delight fallback so the kid never gets stuck!
      const fallbackStory: Story = {
        id: `custom-${Date.now()}`,
        title: `${heroName} and the Quest of ${setting.split(' ')[0]}`,
        toddlerTitle: `${heroName}'s Adventure ✨`,
        author: `${heroName}'s Dream Guild`,
        readingLevel,
        tag: 'New Adventure',
        summary: `A delightful bedtime adventure featuring ${heroName} the ${heroType} exploring ${setting}.`,
        toddlerSummary: `${heroName} explores ${setting.split(' ')[0]}!`,
        coverImage: '/images/story_custom_adventure.jpg',
        illustrationType: detectedIllustrationType,
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
            simpleText: `Look! ${heroName} is ready for an adventure in ${setting.split(' ')[0]}! ✨`,
            simpleChoices: [
              { id: 'c-toddler-1', emoji: '🌟', text: 'Follow Stars' },
              { id: 'c-toddler-2', emoji: '🦋', text: 'Chase Butterfly' },
            ],
            illustrationPrompt: `${heroName} the ${heroType} packing a tiny satchel in ${setting}, wearing ${activeCharacter.clothing}`,
            illustrationUrl: '/images/story_custom_adventure.jpg',
            illustrationResolution: imageSize,
            illustrationType: detectedIllustrationType,
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
            illustrationUrl: '/images/story_bear_barnaby.jpg',
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
            illustrationUrl: '/images/story_turtle_marina.jpg',
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
            illustrationUrl: '/images/hero_storybook.jpg',
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

  const HERO_QUICK_PRESETS = [
    { name: activeCharacter.name || 'Oliver', species: activeCharacter.species || 'Brave Bunny', icon: '🐰' },
    { name: 'Pip', species: 'Baby Dragon', icon: '🐲' },
    { name: 'Barnaby', species: 'Baker Bear', icon: '🐻' },
    { name: 'Starla', species: 'Flying Pony', icon: '🦄' },
  ];

  const WORLD_PRESETS = [
    { name: 'Enchanted Whispering Forest', label: 'Whispering Forest', icon: '🌲', color: 'from-emerald-100 to-green-100 border-emerald-300' },
    { name: 'Stardust Moon & Constellations', label: 'Starry Moon', icon: '🌌', color: 'from-indigo-100 to-sky-100 border-indigo-300' },
    { name: 'Bioluminescent Coral Reef', label: 'Coral Reef Ocean', icon: '🐠', color: 'from-cyan-100 to-teal-100 border-cyan-300' },
    { name: 'Cloud Kingdom & Sky Bakery', label: 'Cloud Bakery', icon: '☁️', color: 'from-amber-100 to-rose-100 border-amber-300' },
  ];

  const QUEST_PRESETS = [
    { title: 'Finding the glowing acorn that lights up the treehouse for bedtime', label: '⭐ Find the Glowing Acorn' },
    { title: 'Baking a gigantic rainbow marshmallow cake with woodland friends', label: '🎂 Bake a Rainbow Cake' },
    { title: 'Returning a lost baby star back to the silver night sky', label: '🌙 Help a Baby Star Fly Home' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-xl w-full my-auto shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-100 via-rose-50 to-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Story Wizard (Simple 3-Tap Studio)
              </span>
              <h2 id="creator-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Weave a New Story! ✨
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white/60 rounded-full transition-colors cursor-pointer"
            aria-label="Close creator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simplified Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {validationErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
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

          {/* STEP 1: PICK A HERO */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <span>Pick Your Story Hero</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HERO_QUICK_PRESETS.map((h) => {
                const isSelected = heroName === h.name;
                return (
                  <button
                    key={h.name}
                    type="button"
                    onClick={() => {
                      setHeroName(h.name);
                      setHeroType(h.species);
                    }}
                    className={`p-2.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 shadow-xs ring-2 ring-amber-300'
                        : 'border-stone-200 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{h.icon}</span>
                    <span className="font-bold text-xs text-stone-900 truncate max-w-full">
                      {h.name}
                    </span>
                    <span className="text-[10px] text-stone-500 truncate max-w-full">
                      {h.species}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom hero name write-in */}
            <div className="pt-1">
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Or type a custom hero name..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* STEP 2: PICK A WORLD */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <span>Where does the adventure happen?</span>
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              {WORLD_PRESETS.map((w) => {
                const isSelected = setting === w.name;
                return (
                  <button
                    key={w.name}
                    type="button"
                    onClick={() => setSetting(w.name)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 shadow-xs ring-2 ring-amber-300'
                        : 'border-stone-200 hover:border-amber-200 bg-white'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{w.icon}</span>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 block">
                        {w.label}
                      </span>
                      <span className="text-[10px] text-stone-500">Tap to choose</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: PICK A GOAL */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <span>What is the fun mission?</span>
            </span>

            <div className="space-y-1.5">
              {QUEST_PRESETS.map((q) => {
                const isSelected = plotIdea === q.title;
                return (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setPlotIdea(q.title)}
                    className={`w-full p-2.5 text-left rounded-xl border-2 transition-all cursor-pointer text-xs sm:text-sm font-semibold flex items-center justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 text-amber-950 shadow-2xs ring-1 ring-amber-300'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <span>{q.label}</span>
                    {isSelected && <span className="text-amber-600 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Advanced Settings (Keeps UI uncluttered) */}
          <div className="pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options (Reading Level, Art Style)</span>
            </button>

            {showAdvanced && (
              <div className="pt-3 space-y-3 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      Reading Level
                    </label>
                    <select
                      value={readingLevel}
                      onChange={(e) => setReadingLevel(e.target.value as ReadingLevel)}
                      className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="Ages 3-5">Ages 3-5 (Toddler / Preschool)</option>
                      <option value="Ages 6-8">Ages 6-8 (Early Reader)</option>
                      <option value="Ages 8-10">Ages 8-10 (Chapter Explorer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 uppercase block mb-1">
                      Illustration Style
                    </label>
                    <select
                      value={artStyle}
                      onChange={(e) => setArtStyle(e.target.value as ArtStyle)}
                      className="w-full p-2 text-xs rounded-xl border border-stone-200 bg-white"
                    >
                      <option value="Classic Gouache Storybook">Classic Gouache</option>
                      <option value="Whimsical Watercolor">Whimsical Watercolor</option>
                      <option value="Dreamy Soft Pastels">Dreamy Soft Pastels</option>
                      <option value="3D Animated Magic">3D Animated Magic</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-500 hover:text-stone-800 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isWeaving}
              className="flex-1 max-w-xs py-3.5 px-5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-sm sm:text-base rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isWeaving ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{statusMessage || 'Weaving Story...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-900" />
                  <span>Weave My Story! ✨</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
