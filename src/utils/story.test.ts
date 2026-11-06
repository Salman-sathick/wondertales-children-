import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitIntoSentences,
  getReadingTimeMinutes,
  formatPromptForIllustration,
  validateStoryCreationInput,
  applyCharacterToStory,
  generateFallbackDrawingAcknowledgment,
  DEFAULT_CHARACTER,
  DEFAULT_STORIES,
  CharacterProfile,
} from './story.js';

test('splitIntoSentences breaks text into proper sentence fragments', () => {
  const sample = 'Pip polished his goggles. A golden ping bounced across the meadow! "Achoo! Where did my star go?" Pip asked.';
  const sentences = splitIntoSentences(sample);
  assert.equal(sentences.length >= 3, true);
  assert.equal(sentences[0].includes('Pip polished'), true);
});

test('formatPromptForIllustration includes character customization features', () => {
  const customHero: CharacterProfile = {
    id: 'test-hero',
    name: 'Zara',
    species: 'Space Bunny',
    hairStyle: 'Lilac floofy ears',
    clothing: 'Silver astronaut suit with star patches',
    personality: 'Brave & curious',
  };

  const prompt = formatPromptForIllustration(
    'Zara gazing at the moons',
    '3D Animated Magic',
    'High detail',
    customHero
  );

  assert.equal(prompt.includes('Zara (Space Bunny)'), true);
  assert.equal(prompt.includes('Lilac floofy ears'), true);
  assert.equal(prompt.includes('Silver astronaut suit'), true);
  assert.equal(prompt.includes('3D animated film style'), true);
});

test('applyCharacterToStory attaches active character and updates page illustration prompts', () => {
  const baseStory = DEFAULT_STORIES[0];
  const customHero: CharacterProfile = {
    id: 'custom-hero',
    name: 'Leo',
    species: 'Human Explorer Kid',
    hairStyle: 'Fiery red curly hair',
    clothing: 'Emerald velvet coat and compass belt',
    personality: 'Gentle & thoughtful',
  };

  const updated = applyCharacterToStory(baseStory, customHero);
  assert.equal(updated.activeCharacter?.name, 'Leo');
  assert.equal(updated.pages[0].illustrationPrompt.includes('Leo'), true);
  assert.equal(updated.pages[0].illustrationPrompt.includes('Fiery red curly hair'), true);
});

test('generateFallbackDrawingAcknowledgment provides celebratory narrative', () => {
  const acknowledgment = generateFallbackDrawingAcknowledgment('golden dragon wings', 'Pip');
  assert.equal(acknowledgment.includes('golden dragon wings'), true);
  assert.equal(acknowledgment.includes('Pip'), true);
});

test('DEFAULT_STORIES contains choices on every page for interactive branching', () => {
  for (const story of DEFAULT_STORIES) {
    for (const page of story.pages) {
      assert.equal(Array.isArray(page.choices), true);
      assert.equal((page.choices?.length ?? 0) >= 1, true);
      assert.equal(typeof page.choices?.[0].text, 'string');
    }
  }
});
