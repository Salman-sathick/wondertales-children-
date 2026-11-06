/**
 * Story data models, pure helper functions, character customization,
 * child drawings, and interactive branching choices.
 */

export type ImageSize = '1K' | '2K' | '4K';
export type ReadingLevel = 'Ages 3-5' | 'Ages 6-8' | 'Ages 9-12';
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

export interface StoryPage {
  pageNumber: number;
  text: string;
  illustrationPrompt: string;
  illustrationUrl: string;
  illustrationResolution: ImageSize;
  artStyle: ArtStyle;
  audioUrl?: string;
  vocabularyWords: VocabularyWord[];
  childDrawing?: ChildDrawing;
  displayMode?: 'both' | 'child' | 'ai';
  drawingAcknowledgment?: string;
  choices?: StoryChoice[];
  chosenChoiceId?: string;
}

export interface Story {
  id: string;
  title: string;
  author: string;
  readingLevel: ReadingLevel;
  tag: string;
  summary: string;
  coverImage: string;
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
  const matches = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g);
  if (!matches) return [text.trim()];
  return matches.map((s) => s.trim()).filter(Boolean);
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
    author: 'WonderTales Studio',
    readingLevel: 'Ages 3-5',
    tag: 'Bedtime & Space',
    summary: 'A ruby red dragon with brass telescope goggles sets out to return a fallen star to the Great Celestial Moon.',
    coverImage: '/src/assets/images/story_dragon_stargazing_1793981895501.jpg',
    themeColor: 'from-amber-500/20 to-rose-500/20',
    createdAt: '2026-03-01',
    pages: [
      {
        pageNumber: 1,
        text: 'High above the Whispering Mountain, where the clouds felt like fluffy whipped cream, lived a tiny ruby dragon named Pip. Unlike the big dragons who practiced roaring, Pip loved polishing his oversized brass telescope goggles to watch the twinkle of the night sky.',
        illustrationPrompt: 'Pip the little ruby dragon sitting atop a mountain peak, peering eagerly through brass telescope goggles up into a sky swirling with friendly constellation shapes and glowing stardust.',
        illustrationUrl: '/src/assets/images/story_dragon_stargazing_1793981895501.jpg',
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
        illustrationPrompt: 'A tiny glowing star character with big friendly eyes sitting in a blueberry bush, covered in glowing blueberry jam, looking up at a curious little dragon.',
        illustrationUrl: '/src/assets/images/story_dragon_stargazing_1793981895501.jpg',
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
        illustrationPrompt: 'Pip the dragon flying through purple twilight clouds, holding the softly glowing star gently like a warm lantern, climbing toward a crescent moon.',
        illustrationUrl: '/src/assets/images/story_dragon_stargazing_1793981895501.jpg',
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
        illustrationPrompt: 'The whole night sky glittering with golden light, the Little Dipper shining brightly as Pip waves from a fluffy cloud with a proud smile.',
        illustrationUrl: '/src/assets/images/hero_storybook_magic_1793981897302.jpg',
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
    author: 'WonderTales Studio',
    readingLevel: 'Ages 3-5',
    tag: 'Playful & Cooking',
    summary: 'Barnaby the fluffy baker bear bakes cinnamon starlight muffins that float through the morning breeze.',
    coverImage: '/src/assets/images/story_bear_cloud_bakery_1793981896365.jpg',
    themeColor: 'from-orange-400/20 to-yellow-400/20',
    createdAt: '2026-03-02',
    pages: [
      {
        pageNumber: 1,
        text: 'Every morning before the rooster even cleared his throat, Barnaby Bear climbed the spiraling rainbow ladder to his sky-high bakery. His oven was carved right out of a puffy cumulus cloud, and it smelled of vanilla beans and warm honey.',
        illustrationPrompt: 'Barnaby Bear in a baker hat mixing pancake batter inside a cloud kitchen floating above emerald green hills, morning sunlight streaming in.',
        illustrationUrl: '/src/assets/images/story_bear_cloud_bakery_1793981896365.jpg',
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
        illustrationPrompt: 'Barnaby Bear delicately sprinkling golden sparkling dust over trays of hot cloud muffins with a giant wooden spoon.',
        illustrationUrl: '/src/assets/images/story_bear_cloud_bakery_1793981896365.jpg',
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
        illustrationPrompt: 'Golden star muffins floating upward into pastel clouds as Barnaby Bear hops happily trying to catch them with an apron.',
        illustrationUrl: '/src/assets/images/story_bear_cloud_bakery_1793981896365.jpg',
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
        illustrationPrompt: 'All the woodland creatures—bunnies, deer, foxes, and birds—eating cloud muffins under a shady tree with Barnaby sleeping peacefully against a cloud.',
        illustrationUrl: '/src/assets/images/hero_storybook_magic_1793981897302.jpg',
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
    author: 'WonderTales Studio',
    readingLevel: 'Ages 6-8',
    tag: 'Ocean & Mystery',
    summary: 'A brave sea turtle named Marina dives down into the glowing trench to restore the coral orchestra’s lost melody.',
    coverImage: '/src/assets/images/story_coral_kingdom_1793981896597.jpg',
    themeColor: 'from-cyan-500/20 to-teal-500/20',
    createdAt: '2026-03-03',
    pages: [
      {
        pageNumber: 1,
        text: 'Beneath the turquoise waves of Coral Bay, Marina the green sea turtle loved listening to the songs of the deep. But this afternoon, the coral polyps were silent. The musical anemones were not humming their customary ocean lullaby.',
        illustrationPrompt: 'Marina the sea turtle swimming through glowing violet and emerald coral formations, looking quizzically at quiet sea flowers.',
        illustrationUrl: '/src/assets/images/story_coral_kingdom_1793981896597.jpg',
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
        illustrationPrompt: 'A tiny hermit crab holding a shiny seashell speaking to the patient sea turtle near a glowing underwater archway.',
        illustrationUrl: '/src/assets/images/story_coral_kingdom_1793981896597.jpg',
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
        illustrationPrompt: 'Marina gently striking a golden tuning fork in a shimmering underwater cave, causing ripples of sparkling musical notes to swirl in the water.',
        illustrationUrl: '/src/assets/images/story_coral_kingdom_1793981896597.jpg',
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
        illustrationPrompt: 'A vibrant underwater musical festival with schools of glowing fish, dancing seahorses, and Marina swimming happily amidst swirling musical notes.',
        illustrationUrl: '/src/assets/images/story_coral_kingdom_1793981896597.jpg',
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
];
