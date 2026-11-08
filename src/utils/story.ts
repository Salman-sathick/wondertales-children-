/**
 * Story data models, pure helper functions, character customization,
 * child drawings, and interactive branching choices.
 */

export type ImageSize = '1K' | '2K' | '4K';
export type ReadingLevel = 'Ages 3-5' | 'Ages 6-8' | 'Ages 8-10' | 'Ages 9-12';
export type ArtStyle = 
  | 'Whimsical Watercolor'
  | 'Classic Gouache Storybook'
  | 'Playful Claymation'
  | 'Dreamy Soft Pastels'
  | '3D Animated Magic'
  | 'Handmade Paper Cutout';

export interface VocabularyWord {
  word: string;
  phonetic?: string;
  definition: string;
  childFriendly: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  species: string; // 'Human Kid' | 'Ruby Dragon' | 'Fluffy Bear' | 'Clever Bunny' | 'Space Cat' | 'Robot Friend'
  hairStyle: string; // e.g. 'Golden curls', 'Spiky midnight blue', 'Fiery braids'
  clothing: string; // e.g. 'Starry cape & boots', 'Explorer goggles & jacket', 'Cozy baker apron'
  personality: string; // 'Brave & curious', 'Playful & silly', 'Thoughtful & kind', 'Inventive & clever'
  favoriteItem?: string; // e.g. 'Brass telescope', 'Wooden mixing spoon', 'Singing shell'
}

export interface ChildDrawing {
  pageNumber: number;
  dataUrl: string; // Base64 canvas drawing
  caption?: string; // What the child drew
  createdAt: string;
}

export interface StoryChoice {
  id: string;
  text: string;
  consequenceSummary: string;
  illustrationHint: string;
}

export interface SimpleChoice {
  id: string;
  emoji: string;
  text: string;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  simpleText?: string; // 1 simple, adorable sentence for a 2-year-old toddler
  illustrationPrompt: string;
  illustrationUrl: string;
  illustrationResolution: ImageSize;
  illustrationType?: 'dragon' | 'bear' | 'turtle' | 'pegasus' | 'hero' | 'puppy' | 'bunny' | 'dino';
  artStyle: ArtStyle;
  audioUrl?: string;
  vocabularyWords: VocabularyWord[];
  childDrawing?: ChildDrawing;
  displayMode?: 'both' | 'child' | 'ai';
  drawingAcknowledgment?: string;
  choices?: StoryChoice[];
  simpleChoices?: SimpleChoice[]; // 2 giant simple emoji buttons for toddlers
  chosenChoiceId?: string;
}

export interface Story {
  id: string;
  title: string;
  toddlerTitle?: string;
  author: string;
  readingLevel: ReadingLevel;
  tag: string;
  summary: string;
  toddlerSummary?: string;
  coverImage: string;
  illustrationType?: 'dragon' | 'bear' | 'turtle' | 'pegasus' | 'hero' | 'puppy' | 'bunny' | 'dino';
  themeColor: string;
  pages: StoryPage[];
  createdAt: string;
  isCustom?: boolean;
  activeCharacter?: CharacterProfile;
}

export interface CreateStoryInput {
  heroName: string;
  heroType: string;
  setting: string;
  plotIdea: string;
  readingLevel: ReadingLevel;
  artStyle: ArtStyle;
  imageSize: ImageSize;
  characterProfile?: CharacterProfile;
}

export const DEFAULT_CHARACTER: CharacterProfile = {
  id: 'default-hero',
  name: 'Oliver',
  species: 'Brave Little Explorer',
  hairStyle: 'Golden curls with a red headband',
  clothing: 'Starry indigo cape and adventure boots',
  personality: 'Brave & curious',
  favoriteItem: 'Brass pocket telescope',
};

export const CHARACTER_PRESETS: CharacterProfile[] = [
  {
    id: 'preset-oliver',
    name: 'Oliver',
    species: 'Brave Human Kid',
    hairStyle: 'Golden curls with a red headband',
    clothing: 'Starry indigo cape and adventure boots',
    personality: 'Brave & curious',
    favoriteItem: 'Brass pocket spyglass',
  },
  {
    id: 'preset-maya',
    name: 'Maya',
    species: 'Clever Space Sailor',
    hairStyle: 'Midnight blue braids tied with star beads',
    clothing: 'Emerald flight jacket and light-up boots',
    personality: 'Inventive & clever',
    favoriteItem: 'Cosmic compass',
  },
  {
    id: 'preset-pip',
    name: 'Pip',
    species: 'Baby Ruby Dragon',
    hairStyle: 'Tiny curved golden horns',
    clothing: 'Oversized brass telescope goggles',
    personality: 'Playful & starry-eyed',
    favoriteItem: 'Goggles of Stardust',
  },
  {
    id: 'preset-barnaby',
    name: 'Barnaby',
    species: 'Cuddly Baker Bear',
    hairStyle: 'Soft fuzzy round ears',
    clothing: 'Puffy white chef hat and striped apron',
    personality: 'Gentle & warmhearted',
    favoriteItem: 'Giant wooden mixing spoon',
  },
];

/**
 * Splits text into sentences for sentence-by-sentence read-aloud highlighting.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) return [];
  const matches = text.match(/[^.!?]+[.!?]+["'”’]*(?:\s+|$)|[^.!?]+$/g);
  if (!matches) return [text.trim()];
  return matches
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s !== '"' && s !== '”' && s !== "'");
}

/**
 * Calculates estimated reading time in minutes.
 */
export function getReadingTimeMinutes(text: string, wordsPerMinute = 120): number {
  if (!text) return 1;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Formats a rich illustration prompt incorporating the character's customized appearance.
 */
export function formatPromptForIllustration(
  basePrompt: string,
  style: ArtStyle,
  extraNotes?: string,
  character?: CharacterProfile
): string {
  const styleInstructions: Record<ArtStyle, string> = {
    'Whimsical Watercolor': 'Gentle glowing watercolor on cold-press paper with soft translucent washes, delicate pencil contours, warm natural lighting, cozy children picture book art.',
    'Classic Gouache Storybook': 'Rich opaque gouache and colored ink illustration, textured brush strokes, warm storybook fairytale atmosphere, detailed charming characters.',
    'Playful Claymation': 'Charming handcrafted polymer clay miniature scene, tactile fingerprint textures, studio softbox lighting, stop-motion animation aesthetic, vibrant whimsical colors.',
    'Dreamy Soft Pastels': 'Soft chalk pastel and colored pencil blend on velour paper, ethereal dreamy twilight glow, gentle highlights, peaceful bedtime story illustration.',
    '3D Animated Magic': 'High-end 3D animated film style, expressive character modeling, subsurface scattering, cinematic warm volumetric lighting, Disney/Pixar aesthetic.',
    'Handmade Paper Cutout': 'Layered paper craft collage with textured cardstock, drop shadows between paper layers, clean crisp silhouettes, tactile folk art fairy tale aesthetic.',
  };

  const styleDescriptor = styleInstructions[style] || styleInstructions['Whimsical Watercolor'];
  
  let characterDescriptor = '';
  if (character) {
    characterDescriptor = ` Starring main character ${character.name} (${character.species}), who has ${character.hairStyle}, wears ${character.clothing}, and expresses a ${character.personality} spirit.`;
  }

  const notes = extraNotes && extraNotes.trim().length > 0 ? ` Additional art details: ${extraNotes.trim()}.` : '';

  return `${basePrompt}.${characterDescriptor} Art Style: ${styleDescriptor}.${notes} Kid-friendly, family-safe, visually captivating high quality children's book illustration.`;
}

/**
 * Generates celebratory acknowledgment text when a child saves their drawing.
 */
export function generateFallbackDrawingAcknowledgment(
  caption: string,
  heroName: string
): string {
  const clean = caption.trim() || 'your wonderful drawing';
  const acknowledgments = [
    `"${heroName} smiled with joy looking at ${clean}—its colorful magic made the adventure shine even brighter!"`,
    `"What a masterpiece! ${heroName} proudly held up ${clean}, feeling inspired to take the next brave step."`,
    `"${heroName} marveled at ${clean}: 'With your amazing art by my side, we can do anything!'"`
  ];
  return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
}

/**
 * Injects a customized character profile into an existing story's text and illustration prompts.
 */
export function applyCharacterToStory(story: Story, character: CharacterProfile): Story {
  // Replace default protagonist references
  const updatedPages = story.pages.map((p) => {
    // Generate an updated prompt that explicitly includes the character's clothing and look
    const updatedPrompt = `${p.illustrationPrompt}. Main character ${character.name} (${character.species}), with ${character.hairStyle}, wearing ${character.clothing}.`;

    return {
      ...p,
      illustrationPrompt: updatedPrompt,
    };
  });

  return {
    ...story,
    activeCharacter: character,
    pages: updatedPages,
  };
}

/**
 * Validates user input when creating a custom story.
 */
export function validateStoryCreationInput(input: Partial<CreateStoryInput>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input.heroName || input.heroName.trim().length < 2) {
    errors.push('Please give your hero a name (at least 2 letters).');
  }
  if (!input.heroType || input.heroType.trim().length < 2) {
    errors.push('Please specify what kind of hero they are (e.g. Brave Puppy, Star Explorer).');
  }
  if (!input.setting || input.setting.trim().length < 2) {
    errors.push('Please choose or enter a setting for the story.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Curated default stories with rich seeded branching choices on every page.
 */
export const DEFAULT_STORIES: Story[] = [
  {
    id: 'dragon-stargazing',
    title: 'Pip and the Lost Stardust',
    toddlerTitle: '🐲 Pip the Baby Dragon',
    author: 'WonderTales Studio',
    readingLevel: 'Ages 3-5',
    tag: 'Bedtime & Space',
    summary: 'A cute ruby red dragon with brass telescope goggles sets out to return a fallen star to the Great Celestial Moon.',
    toddlerSummary: 'Pip plays with a cute little star!',
    illustrationType: 'dragon',
    coverImage: '/images/story_dragon_pip.jpg',
    themeColor: 'from-amber-500/20 to-rose-500/20',
    createdAt: '2026-03-01',
    pages: [
      {
        pageNumber: 1,
        text: 'High above the Whispering Mountain, where the clouds felt like fluffy whipped cream, lived a tiny ruby dragon named Pip. Unlike the big dragons who practiced roaring, Pip loved polishing his oversized brass telescope goggles to watch the twinkle of the night sky.',
        simpleText: 'Hello Pip! Pip loves the big smiling moon! 🌙',
        simpleChoices: [
          { id: 'choice-toddler-star', emoji: '⭐', text: 'Touch the Star' },
          { id: 'choice-toddler-moon', emoji: '🌙', text: 'Fly to Moon' },
        ],
        illustrationPrompt: 'Pip the little ruby dragon sitting atop a mountain peak, peering eagerly through brass telescope goggles up into a sky swirling with friendly constellation shapes and glowing stardust.',
        illustrationUrl: '/images/story_dragon_pip.jpg',
        illustrationResolution: '2K',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-1-meadow',
            text: 'Investigate the glowing sound in the blueberry meadow',
            consequenceSummary: 'Pip scampers down into the sweet berry patch to find who sneezed.',
            illustrationHint: 'Pip peeking curiously through giant blue leaves at a tiny star.',
          },
          {
            id: 'choice-1-telescope',
            text: 'Point the telescope towards the singing crescent moon',
            consequenceSummary: 'Pip discovers a celestial constellation map shining with gold secrets.',
            illustrationHint: 'Pip looking through his brass spyglass seeing music notes on the moon.',
          },
          {
            id: 'choice-1-whistle',
            text: 'Blow a magical starlight whistle to summon friendly fireflies',
            consequenceSummary: 'A swarm of twinkling fireflies lights up a secret glowing path.',
            illustrationHint: 'Pip blowing a tiny whistle as glowing bugs swirl like a friendly lantern.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Telescope',
            phonetic: 'TEL-uh-skope',
            definition: 'A magical tube with lenses that makes distant stars and planets look big and close.',
            childFriendly: 'A zoom-in spyglass for looking at the stars!',
          },
          {
            word: 'Constellation',
            phonetic: 'kon-stuh-LAY-shun',
            definition: 'A group of stars that forms an imaginary picture like a bear, dragon, or boat in the sky.',
            childFriendly: 'A dot-to-dot star drawing in the sky!',
          },
        ],
      },
      {
        pageNumber: 2,
        text: 'Suddenly, a golden ping bounced across the moonlit meadow! A baby shooting star had tripped on a comet tail and tumbled down into a bush of sweet blueberries. The tiny star let out a soft sneeze: "Achoo! Where did my constellation go?"',
        simpleText: 'Look! A tiny baby star fell in the berries! "Achoo!" ⭐',
        simpleChoices: [
          { id: 'choice-toddler-hug', emoji: '🤗', text: 'Give a Hug' },
          { id: 'choice-toddler-berry', emoji: '🍓', text: 'Eat a Berry' },
        ],
        illustrationPrompt: 'A tiny glowing star character with big friendly eyes sitting in a blueberry bush, covered in glowing blueberry jam, looking up at a curious little dragon.',
        illustrationUrl: '/images/story_dragon_pip.jpg',
        illustrationResolution: '2K',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-2-snack',
            text: 'Feed the little star a sweet warm marshmallow snack',
            consequenceSummary: 'The star nibbles the marshmallow and glows with joyful pink stardust.',
            illustrationHint: 'Pip feeding a tiny star a cloud marshmallow with a big smile.',
          },
          {
            id: 'choice-2-wings',
            text: 'Offer to carry the star in a cozy velvet pouch to the moon',
            consequenceSummary: 'Pip nestles the star safely into his pouch and spreads his wings.',
            illustrationHint: 'Pip putting the gentle star in a snug pouch on his chest.',
          },
          {
            id: 'choice-2-sing',
            text: 'Sing a gentle lullaby to remind the star of its song',
            consequenceSummary: 'The melody causes the star to bounce high into the air with delight.',
            illustrationHint: 'Pip humming musical notes as the star dances in mid-air.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Comet',
            phonetic: 'KOM-it',
            definition: 'A speedy space snowball made of ice, dust, and rock that glides with a glowing tail.',
            childFriendly: 'A zooming glittery space snowball!',
          },
        ],
      },
      {
        pageNumber: 3,
        text: 'Pip gently cradled the little star in his warm, scale-covered paws. "Don\'t worry, little spark," Pip whispered. "I know every constellation path by heart. We will climb the crescent moon ladder together!" Pip unfurled his ruby wings and soared upward.',
        simpleText: 'Pip cuddles the little star! They zoom up into the sky! 🚀',
        simpleChoices: [
          { id: 'choice-toddler-loop', emoji: '🌈', text: 'Rainbow Zoom' },
          { id: 'choice-toddler-star', emoji: '⭐', text: 'Twinkle High' },
        ],
        illustrationPrompt: 'Pip the dragon flying through purple twilight clouds, holding the softly glowing star gently like a warm lantern, climbing toward a crescent moon.',
        illustrationUrl: '/images/story_dragon_pip.jpg',
        illustrationResolution: '2K',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-3-dipper',
            text: 'Leap directly toward the shining Big Dipper constellation',
            consequenceSummary: 'The star snaps into place like the crown jewel of the night sky.',
            illustrationHint: 'Pip tossing the star softly into the sparkling Dipper handle.',
          },
          {
            id: 'choice-3-dance',
            text: 'Do a barrel roll through a rainbow cloud ring first',
            consequenceSummary: 'Pip and the star shower the sleeping world in colorful sweet dreams.',
            illustrationHint: 'Pip flying in a spiral leaving a trail of rainbow stardust.',
          },
          {
            id: 'choice-3-wish',
            text: 'Make a secret bedtime wish before saying goodbye',
            consequenceSummary: 'The celestial moon blushes with warm silver light to grant the wish.',
            illustrationHint: 'Pip whispering with his eyes closed to the gentle crescent moon.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Unfurl',
            phonetic: 'un-FURL',
            definition: 'To open up or spread out, like wings or a pirate flag caught in the wind.',
            childFriendly: 'To flap and stretch wide open!',
          },
        ],
      },
      {
        pageNumber: 4,
        text: 'With a gentle leap, the star bounced back into the Great Dipper constellation, clicking into place like a luminous puzzle piece! The entire sky lit up with warm golden sparkles, raining down sweet bedtime dreams on all the sleeping creatures below.',
        simpleText: 'The little star is safe in the sky! Goodnight Pip! 💤',
        simpleChoices: [
          { id: 'choice-toddler-kiss', emoji: '💖', text: 'Blow a Kiss' },
          { id: 'choice-toddler-sleep', emoji: '🌙', text: 'Sweet Dreams' },
        ],
        illustrationPrompt: 'The whole night sky glittering with golden light, the Little Dipper shining brightly as Pip waves from a fluffy cloud with a proud smile.',
        illustrationUrl: '/images/story_dragon_pip.jpg',
        illustrationResolution: '2K',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-4-nest',
            text: 'Fly back down to curl up in the cozy mountain nest',
            consequenceSummary: 'Pip cuddles into soft cloud blankets, falling fast asleep.',
            illustrationHint: 'Pip sleeping warmly in a mossy dragon nest under starry skies.',
          },
          {
            id: 'choice-4-party',
            text: 'Celebrate with the moon owls by drinking honey tea',
            consequenceSummary: 'All the friendly night birds raise tiny acorn cups in a cheerful toast.',
            illustrationHint: 'Pip clinking acorn cups with a wise owl on a tree branch.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Luminous',
            phonetic: 'LOO-mi-nus',
            definition: 'Glowing with a bright, warm, and gentle light.',
            childFriendly: 'Shining and glowing like a nightlight!',
          },
        ],
      },
    ],
  },
  {
    id: 'bear-cloud-bakery',
    title: 'Barnaby Bear’s Cloud Bakery',
    toddlerTitle: '🐻 Barnaby the Baker Bear',
    author: 'WonderTales Studio',
    readingLevel: 'Ages 3-5',
    tag: 'Playful & Cooking',
    summary: 'Barnaby the fluffy baker bear bakes cinnamon starlight muffins that float through the morning breeze.',
    toddlerSummary: 'Barnaby bakes yummy sweet cupcakes!',
    illustrationType: 'bear',
    coverImage: '/images/story_bear_barnaby.jpg',
    themeColor: 'from-orange-400/20 to-yellow-400/20',
    createdAt: '2026-03-02',
    pages: [
      {
        pageNumber: 1,
        text: 'Every morning before the rooster even cleared his throat, Barnaby Bear climbed the spiraling rainbow ladder to his sky-high bakery. His oven was carved right out of a puffy cumulus cloud, and it smelled of vanilla beans and warm honey.',
        simpleText: 'Barnaby Bear puts on his puffy white chef hat! 🐻',
        simpleChoices: [
          { id: 'choice-toddler-hat', emoji: '👨‍🍳', text: 'Chef Hat' },
          { id: 'choice-toddler-spoon', emoji: '🥄', text: 'Mix Mix' },
        ],
        illustrationPrompt: 'Barnaby Bear in a baker hat mixing pancake batter inside a cloud kitchen floating above emerald green hills, morning sunlight streaming in.',
        illustrationUrl: '/images/story_bear_barnaby.jpg',
        illustrationResolution: '2K',
        artStyle: 'Whimsical Watercolor',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-bear-1-berry',
            text: 'Add fresh wild strawberries picked from dewdrop hill',
            consequenceSummary: 'The batter turns a charming pastel pink that smells like summer.',
            illustrationHint: 'Barnaby dumping a basket of giant plump berries into a cloud bowl.',
          },
          {
            id: 'choice-bear-1-cinnamon',
            text: 'Dust the cloud pan with spicy sweet cinnamon stars',
            consequenceSummary: 'Golden sparkles burst from the pan with a mouthwatering aroma.',
            illustrationHint: 'Barnaby shaking a shaker shaped like a star with cinnamon dust swirling.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Cumulus',
            phonetic: 'KYOO-myuh-lus',
            definition: 'Fluffy white clouds that look like giant mounds of cotton or popcorn floating in blue skies.',
            childFriendly: 'Giant popcorn clouds in the sunshine!',
          },
        ],
      },
      {
        pageNumber: 2,
        text: 'Today was the Grand Sky Picnic! Barnaby needed special ingredients: two scoops of sunrise pink sugar, a pinch of cinnamon breeze, and three sparkling starlight sprinkles collected from morning dew.',
        simpleText: 'Stir, stir, stir! The sweet dough smells so yummy! 🧁',
        simpleChoices: [
          { id: 'choice-toddler-sprinkles', emoji: '✨', text: 'Add Sparkles' },
          { id: 'choice-toddler-honey', emoji: '🍯', text: 'Pour Honey' },
        ],
        illustrationPrompt: 'Barnaby Bear delicately sprinkling golden sparkling dust over trays of hot cloud muffins with a giant wooden spoon.',
        illustrationUrl: '/images/story_bear_barnaby.jpg',
        illustrationResolution: '2K',
        artStyle: 'Whimsical Watercolor',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-bear-2-oven',
            text: 'Slide the muffin trays into the warmest sunbeam oven',
            consequenceSummary: 'The muffins rise to double their size and begin to float gently.',
            illustrationHint: 'Muffins puffing up like tiny golden hot air balloons.',
          },
          {
            id: 'choice-bear-2-frosting',
            text: 'Whip up fluffy rainbow whipped cream frosting first',
            consequenceSummary: 'Barnaby pipes lovely swirl crowns on top of every muffin.',
            illustrationHint: 'Barnaby piping rainbow swirl frosting with a chef hat tilted.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Ingredient',
            phonetic: 'in-GREE-dee-unt',
            definition: 'One of the foods or items you combine together to cook a delicious meal or treat.',
            childFriendly: 'The yummy things you mix together to bake!',
          },
        ],
      },
      {
        pageNumber: 3,
        text: 'Ding! The cloud oven chimed. Out came a dozen star muffins! But wait—these muffins were so light, they started floating right off the baking sheet like tiny delicious hot-air balloons!',
        simpleText: 'Pop! The sweet cupcakes float up like balloons! 🎈',
        simpleChoices: [
          { id: 'choice-toddler-catch', emoji: '🧁', text: 'Catch Muffin' },
          { id: 'choice-toddler-sing', emoji: '🎵', text: 'Sing a Song' },
        ],
        illustrationPrompt: 'Golden star muffins floating upward into pastel clouds as Barnaby Bear hops happily trying to catch them with an apron.',
        illustrationUrl: '/images/story_bear_barnaby.jpg',
        illustrationResolution: '2K',
        artStyle: 'Whimsical Watercolor',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-bear-3-birds',
            text: 'Whistle to the flock of bluebirds to herd the floaty muffins',
            consequenceSummary: 'The birds catch the muffins with silk ribbons and deliver them below.',
            illustrationHint: 'Bluebirds carrying muffin baskets gently in the breeze.',
          },
          {
            id: 'choice-bear-3-parachute',
            text: 'Toss miniature maple leaf parachutes onto each muffin',
            consequenceSummary: 'The muffins drift down to the forest meadow like autumn leaves.',
            illustrationHint: 'Muffins gliding softly under colorful leaf parachutes.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Buoyant',
            phonetic: 'BOY-unt',
            definition: 'Able to float easily on top of water or in the air.',
            childFriendly: 'Super light and floaty!',
          },
        ],
      },
      {
        pageNumber: 4,
        text: 'Luckily, the woodland birds swooped by and helped catch the muffins, landing gently at the picnic table. Everyone took a bite: "Crisp like sunshine, soft like a cuddle!" Barnaby smiled and took a big bear nap.',
        simpleText: 'Yum yum in my tum! Goodnight Barnaby Bear! 💤',
        simpleChoices: [
          { id: 'choice-toddler-yum', emoji: '😋', text: 'Yummy!' },
          { id: 'choice-toddler-nap', emoji: '🧸', text: 'Bear Nap' },
        ],
        illustrationPrompt: 'All the woodland creatures—bunnies, deer, foxes, and birds—eating cloud muffins under a shady tree with Barnaby sleeping peacefully against a cloud.',
        illustrationUrl: '/images/story_bear_barnaby.jpg',
        illustrationResolution: '2K',
        artStyle: 'Whimsical Watercolor',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-bear-4-tea',
            text: 'Sip warm chamomile clover tea before curling up',
            consequenceSummary: 'Barnaby yawns and snuggles into a mountain of soft cushions.',
            illustrationHint: 'Barnaby holding a mug of steamy tea with sleepy eyes.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Feast',
            phonetic: 'FEEST',
            definition: 'A big, joyful celebration meal filled with delicious foods shared with dear friends.',
            childFriendly: 'A super party with endless yummy snacks!',
          },
        ],
      },
    ],
  },
  {
    id: 'coral-kingdom',
    title: 'Marina and the Whispering Reef',
    toddlerTitle: '🐢 Marina the Baby Turtle',
    author: 'WonderTales Studio',
    readingLevel: 'Ages 6-8',
    tag: 'Ocean & Mystery',
    summary: 'A cute green sea turtle named Marina dives into the warm turquoise reef to restore the coral orchestra’s sweet song.',
    toddlerSummary: 'Marina swims and splashes in the blue sea!',
    illustrationType: 'turtle',
    coverImage: '/images/story_turtle_marina.jpg',
    themeColor: 'from-cyan-500/20 to-teal-500/20',
    createdAt: '2026-03-03',
    pages: [
      {
        pageNumber: 1,
        text: 'Beneath the turquoise waves of Coral Bay, Marina the green sea turtle loved listening to the songs of the deep. But this afternoon, the coral polyps were silent. The musical anemones were not humming their customary ocean lullaby.',
        simpleText: 'Splash! Little Marina swims in the warm blue sea! 🐢',
        simpleChoices: [
          { id: 'choice-toddler-splash', emoji: '🌊', text: 'Big Splash' },
          { id: 'choice-toddler-wave', emoji: '👋', text: 'Wave Hello' },
        ],
        illustrationPrompt: 'Marina the sea turtle swimming through glowing violet and emerald coral formations, looking quizzically at quiet sea flowers.',
        illustrationUrl: '/images/story_turtle_marina.jpg',
        illustrationResolution: '2K',
        artStyle: 'Dreamy Soft Pastels',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-marina-1-crab',
            text: 'Ask Barnaby Crab sitting atop the sunken pirate bell',
            consequenceSummary: 'The crab points his claw toward the glowing crystal trench.',
            illustrationHint: 'Marina conferring with a tiny crab wearing a sailor hat.',
          },
          {
            id: 'choice-marina-1-cave',
            text: 'Dive into the bioluminescent kelp forest',
            consequenceSummary: 'Luminescent jellyfish light the path to the lost melody conch.',
            illustrationHint: 'Marina gliding through glowing green kelp stalks.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Bioluminescent',
            phonetic: 'by-oh-loo-mi-NES-ent',
            definition: 'Living creatures or plants that make their own natural glowing light underwater or in the dark.',
            childFriendly: 'Animals that glow like living neon lights!',
          },
        ],
      },
      {
        pageNumber: 2,
        text: 'A shy hermit crab tapped Marina\'s shell with a silver seashell. "The Great Conch Shell at the center of the reef lost its tuning fork when a playful dolphin pod danced through," the crab explained.',
        simpleText: 'Look! Shiny bubbles go pop, pop, pop! 🫧',
        simpleChoices: [
          { id: 'choice-toddler-bubbles', emoji: '🫧', text: 'Pop Bubbles' },
          { id: 'choice-toddler-starfish', emoji: '⭐', text: 'Say Hi Starfish' },
        ],
        illustrationPrompt: 'A tiny hermit crab holding a shiny seashell speaking to the patient sea turtle near a glowing underwater archway.',
        illustrationUrl: '/images/story_turtle_marina.jpg',
        illustrationResolution: '2K',
        artStyle: 'Dreamy Soft Pastels',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-marina-2-dolphins',
            text: 'Swim to the dolphin pod playing in the sunlit currents',
            consequenceSummary: 'The dolphins lead Marina right to the secret sponge grotto.',
            illustrationHint: 'Marina swimming alongside joyful leaping dolphins.',
          },
          {
            id: 'choice-marina-2-search',
            text: 'Inspect the pearl oysters in the deep singing trench',
            consequenceSummary: 'An oyster reveals the shimmering gold tuning fork nestled inside.',
            illustrationHint: 'A giant oyster opening to reveal a magical glowing tuning fork.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Anemone',
            phonetic: 'uh-NEM-uh-nee',
            definition: 'A soft underwater sea creature that looks like a colorful flower with wiggling tentacles.',
            childFriendly: 'A flower-like sea creature that waves hello in the water!',
          },
        ],
      },
      {
        pageNumber: 3,
        text: 'Marina glided into the secret grotto. There, resting between two giant sea sponges, was the golden pearl tuning fork. With gentle flippers, Marina tapped it against the reef stone: *TIIING!*',
        simpleText: 'Wiggle wiggle! Marina dances with the cute fishies! 🐠',
        simpleChoices: [
          { id: 'choice-toddler-dance', emoji: '💃', text: 'Wiggle Dance' },
          { id: 'choice-toddler-coral', emoji: '🪸', text: 'Swim Through' },
        ],
        illustrationPrompt: 'Marina gently striking a golden tuning fork in a shimmering underwater cave, causing ripples of sparkling musical notes to swirl in the water.',
        illustrationUrl: '/images/story_turtle_marina.jpg',
        illustrationResolution: '2K',
        artStyle: 'Dreamy Soft Pastels',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-marina-3-melody',
            text: 'Lead the seahorse choir in a triumphant joyful waltz',
            consequenceSummary: 'The entire reef reverberates with glorious harmonized song.',
            illustrationHint: 'Seahorses singing in harmony with swirling golden treble clefs.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Grotto',
            phonetic: 'GRAH-toh',
            definition: 'A picturesque, small cave or cavern near water.',
            childFriendly: 'A cozy secret cave underwater!',
          },
        ],
      },
      {
        pageNumber: 4,
        text: 'The ocean instantly burst into harmonious song! The starfish tapped their rhythms, the coral lit up in hues of sapphire and gold, and all the baby seahorses danced in circles. The reef had found its magical voice once again.',
        simpleText: 'Marina rests on the soft warm sand! Sweet dreams! 🌊',
        simpleChoices: [
          { id: 'choice-toddler-rest', emoji: '💤', text: 'Sleep Tight' },
          { id: 'choice-toddler-sing', emoji: '🎵', text: 'Ocean Song' },
        ],
        illustrationPrompt: 'A vibrant underwater musical festival with schools of glowing fish, dancing seahorses, and Marina swimming happily amidst swirling musical notes.',
        illustrationUrl: '/images/story_turtle_marina.jpg',
        illustrationResolution: '2K',
        artStyle: 'Dreamy Soft Pastels',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-marina-4-drift',
            text: 'Float on the gentle night tide under the ocean moon',
            consequenceSummary: 'Marina rests peacefully surrounded by glowing fish lullabies.',
            illustrationHint: 'Marina resting on soft sea moss with glowing fish circling softly.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Harmonious',
            phonetic: 'har-MOH-nee-us',
            definition: 'Sounds or voices that blend together in a pleasing, sweet, and orderly way.',
            childFriendly: 'Musical sounds that fit together perfectly like a hug!',
          },
        ],
      },
    ],
  },
  {
    id: 'clockwork-pegasus',
    title: 'The Clockwork Pegasus and the Sky Observatory',
    toddlerTitle: '🦄 Golden Flying Pony',
    author: 'WonderTales Studio',
    readingLevel: 'Ages 8-10',
    tag: 'Magic & Inventions',
    summary: 'In a floating cloud city, young inventor Elio restores an antique brass pegasus with crystal wings to rekindle the fading northern starlight.',
    toddlerSummary: 'A golden pony flies through the starry night sky!',
    illustrationType: 'pegasus',
    coverImage: '/images/story_clockwork_pegasus.jpg',
    themeColor: 'from-amber-600/20 to-sky-600/20',
    createdAt: '2026-03-04',
    pages: [
      {
        pageNumber: 1,
        text: 'High above the storm clouds in the floating brass city of Aethelgard, young apprentice Elio worked late inside the Great Sky Observatory. Resting on a velvet workbench was an ancient marvel: a mechanical winged pegasus with gears of polished brass and wings of prismatic light crystal. "Tonight," Elio murmured, tightening a golden gear, "we discover why the northern stars have dimmed."',
        simpleText: 'Look at the magical golden pony with shiny wings! 🦄✨',
        simpleChoices: [
          { id: 'choice-pegasus-wind', emoji: '✨', text: 'Wind the Key' },
          { id: 'choice-pegasus-pat', emoji: '💖', text: 'Gentle Pat' },
        ],
        illustrationPrompt: 'A glowing brass mechanical clockwork pegasus with intricate gear-carved wings perched on an antique starry observatory balcony above fluffy pastel clouds, looking up at constellation star charts, warm golden lighting, gouache style.',
        illustrationUrl: '/images/story_clockwork_pegasus.jpg',
        illustrationResolution: '2K',
        illustrationType: 'pegasus',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-pegasus-1-key',
            text: 'Turn the filigree clockwork key inside the pegasus’s heart',
            consequenceSummary: 'A gentle humming resonance wakes the crystal wings with cyan luminescence.',
            illustrationHint: 'Elio inserting a glowing key as the clockwork pegasus eyes open with warm amber light.',
          },
          {
            id: 'choice-pegasus-1-charts',
            text: 'Consult the brass armillary sphere for celestial navigation',
            consequenceSummary: 'The brass rings align with the Polaris vortex, revealing an ancient aerial airway.',
            illustrationHint: 'Elio studying spinning glowing brass constellation rings.',
          },
          {
            id: 'choice-pegasus-1-telescope',
            text: 'Peer through the giant copper roof telescope at the aurora',
            consequenceSummary: 'Elio spots a magnificent crystal prism adrift in the cosmic stratosphere.',
            illustrationHint: 'Elio peering through an enormous ornate brass telescope at purple auroras.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Apprentice',
            phonetic: 'uh-PREN-tis',
            definition: 'A curious learner who trains alongside a master craftsperson to master an art or science.',
            childFriendly: 'A student learning amazing skills from a master inventor!',
          },
          {
            word: 'Celestial',
            phonetic: 'suh-LES-chul',
            definition: 'Belonging or relating to the deep starry sky and the wondrous outer heavens.',
            childFriendly: 'Everything magical belonging to the stars and planets!',
          },
        ],
      },
      {
        pageNumber: 2,
        text: 'As the winding key turned, a harmonious chime echoed through the copper domes. The clockwork pegasus flexed its bronze wings and whinnied with a voice like silver bells. It nudged Elio’s shoulder, unfurling its crystal pinions into the crisp stratosphere breeze, ready to take flight.',
        simpleText: 'Flap, flap, flap! The pretty pony flies into the clouds! ☁️',
        simpleChoices: [
          { id: 'choice-pegasus-high', emoji: '🌈', text: 'Fly to Rainbow' },
          { id: 'choice-pegasus-star', emoji: '⭐', text: 'Touch Star' },
        ],
        illustrationPrompt: 'The clockwork brass pegasus standing gracefully on the edge of the open observatory balcony, wings spread wide catching starlight and wind, with young Elio holding the reins.',
        illustrationUrl: '/images/story_clockwork_pegasus.jpg',
        illustrationResolution: '2K',
        illustrationType: 'pegasus',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-pegasus-2-vault',
            text: 'Soar into the glowing heart of the shimmering Aurora Veil',
            consequenceSummary: 'The pegasus glides through ribboned green and violet lights like a sailing ship.',
            illustrationHint: 'The clockwork pegasus galloping across a bridge of green and purple northern lights.',
          },
          {
            id: 'choice-pegasus-2-cloud',
            text: 'Dive beneath the cloud barrier to inspect the brass lighthouse',
            consequenceSummary: 'The lighthouse beacon needs a spark from the pegasus’s crystal heart.',
            illustrationHint: 'Flying close to an ornate floating brass lighthouse tower.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Pinion',
            phonetic: 'PIN-yun',
            definition: 'The outer flight feathers or flight mechanism of an avian or winged creature.',
            childFriendly: 'The majestic outer flight feathers of a wing!',
          },
        ],
      },
      {
        pageNumber: 3,
        text: 'Up they climbed into the Aurora Veil, where ribbons of emerald and violet fire rippled across the black velvet sky. At the vortex of the aurora floated the Grand Star Dynamo—an antique celestial clock that powered all the night lights, its pendulum caught on a cluster of cosmic ice crystals.',
        simpleText: 'Twinkle twinkle! The big clock goes tick-tock, tick-tock! ⏰',
        simpleChoices: [
          { id: 'choice-pegasus-tick', emoji: '🔔', text: 'Ring Bell' },
          { id: 'choice-pegasus-glow', emoji: '🌟', text: 'Shine Bright' },
        ],
        illustrationPrompt: 'A gigantic floating celestial clockwork dynamo mechanism in deep space surrounded by emerald aurora lights, with the clockwork pegasus approaching.',
        illustrationUrl: '/images/story_clockwork_pegasus.jpg',
        illustrationResolution: '2K',
        illustrationType: 'pegasus',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-pegasus-3-heat',
            text: 'Use the pegasus’s warm bronze breath to melt the cosmic ice',
            consequenceSummary: 'The steam releases into glittering diamond rain and the pendulum swings freely.',
            illustrationHint: 'Warm golden light melting the frost from the gigantic celestial pendulum.',
          },
          {
            id: 'choice-pegasus-3-gear',
            text: 'Carefully slot an extra bronze gear into the dynamo escapement',
            consequenceSummary: 'The great gears lock into rhythmic perfection with a thundering chime of triumph.',
            illustrationHint: 'Elio fitting a shining gear into place with precision tools.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Dynamo',
            phonetic: 'DY-nuh-moh',
            definition: 'A machine or generator that converts mechanical motion into glowing electrical energy.',
            childFriendly: 'A magical engine that turns spinning motion into dazzling power!',
          },
        ],
      },
      {
        pageNumber: 4,
        text: 'With a mighty *TOCK*, the Great Dynamo roared back to life! Brilliant beams of sapphire, gold, and ruby starlight cascaded across the skies of the world below. Aethelgard cheered from their balconies, and the clockwork pegasus circled the observatory with joyful triumph, a guardian of the endless skies.',
        simpleText: 'Hooray! The stars shine bright like diamonds! Night night! 🌟',
        simpleChoices: [
          { id: 'choice-pegasus-clap', emoji: '👏', text: 'Clap Hands' },
          { id: 'choice-pegasus-sleep', emoji: '💤', text: 'Sleepy Pony' },
        ],
        illustrationPrompt: 'The whole night sky illuminated with glorious aurora colors and radiant stars, with the clockwork pegasus and Elio flying heroically above the glowing city of Aethelgard.',
        illustrationUrl: '/images/story_clockwork_pegasus.jpg',
        illustrationResolution: '2K',
        illustrationType: 'pegasus',
        artStyle: 'Classic Gouache Storybook',
        displayMode: 'both',
        choices: [
          {
            id: 'choice-pegasus-4-home',
            text: 'Touch down gracefully on the observatory roof to record the discovery in the journal',
            consequenceSummary: 'Elio sketches the star dynamo in gold ink, ready for the next adventure.',
            illustrationHint: 'Elio writing in a leather journal by candlelight as the pegasus rests beside him.',
          },
        ],
        vocabularyWords: [
          {
            word: 'Cascade',
            phonetic: 'kas-KAYD',
            definition: 'To fall or flow downward in large, rich amounts like a shimmering waterfall.',
            childFriendly: 'To flow down like a sparkling waterfall of light!',
          },
        ],
      },
    ],
  },
];

