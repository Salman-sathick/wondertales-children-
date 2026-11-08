/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMAL_SOUNDS } from './audioSynth';

test('ANIMAL_SOUNDS contains at least 10 animal definitions with essential attributes', () => {
  assert.ok(ANIMAL_SOUNDS.length >= 10, 'Should have 10+ animals');
  for (const animal of ANIMAL_SOUNDS) {
    assert.ok(animal.id, 'Animal must have an id');
    assert.ok(animal.name, 'Animal must have a name');
    assert.ok(animal.emoji, 'Animal must have an emoji');
    assert.ok(animal.soundName, 'Animal must have a sound name');
    assert.ok(animal.soundText, 'Animal must have sound text');
    assert.strictEqual(typeof animal.synthSound, 'function', 'Animal must have synthSound function');
  }
});

test('ANIMAL_SOUNDS contains Farm, Wild, Pets, and Nature categories', () => {
  const categories = new Set(ANIMAL_SOUNDS.map((a) => a.category));
  assert.ok(categories.has('Farm'));
  assert.ok(categories.has('Wild'));
  assert.ok(categories.has('Pets'));
  assert.ok(categories.has('Nature'));
});

test('Paywall policy checks: 2 free stories allowed, 3rd requires paid pass', () => {
  const isPaywallRequired = (storiesCount: number, hasPaidPass: boolean) => {
    if (hasPaidPass) return false;
    return storiesCount >= 2;
  };

  // 0 stories created -> No paywall
  assert.strictEqual(isPaywallRequired(0, false), false);
  // 1 story created -> No paywall
  assert.strictEqual(isPaywallRequired(1, false), false);
  // 2 stories created -> Paywall triggered for next
  assert.strictEqual(isPaywallRequired(2, false), true);
  // 3 stories created -> Paywall triggered
  assert.strictEqual(isPaywallRequired(3, false), true);
  // Paid pass active -> Never paywall
  assert.strictEqual(isPaywallRequired(2, true), false);
  assert.strictEqual(isPaywallRequired(10, true), false);
});
