import test from 'node:test';
import assert from 'node:assert/strict';
import { addItemToBag, consumeItemFromBag, craftItemInBag } from '../src/inventory.js';

test('adding items returns a new bag and preserves previous contents', () => {
  const original = { wood: 2 };
  const next = addItemToBag(original, 'wood', 3);
  assert.deepEqual(next, { wood: 5 });
  assert.deepEqual(original, { wood: 2 });
});

test('consuming available items succeeds without mutating the source bag', () => {
  const original = { berry: 4 };
  const result = consumeItemFromBag(original, 'berry', 2);
  assert.equal(result.consumed, true);
  assert.deepEqual(result.bag, { berry: 2 });
  assert.deepEqual(original, { berry: 4 });
});

test('consuming unavailable items fails atomically', () => {
  const original = { stone: 1 };
  const result = consumeItemFromBag(original, 'stone', 2);
  assert.equal(result.consumed, false);
  assert.equal(result.bag, original);
  assert.deepEqual(original, { stone: 1 });
});

test('crafting validates all ingredients before consuming any', () => {
  const original = { stick: 2, stone: 1 };
  const result = craftItemInBag(original, { stick: 1, stone: 3 }, 'stone_sword', 1);
  assert.equal(result.crafted, false);
  assert.equal(result.bag, original);
  assert.deepEqual(original, { stick: 2, stone: 1 });
});

test('crafting consumes ingredients and adds output in one operation', () => {
  const result = craftItemInBag({ stick: 2, stone: 3 }, { stick: 1, stone: 2 }, 'stone_sword', 1);
  assert.equal(result.crafted, true);
  assert.deepEqual(result.bag, { stick: 1, stone: 1, stone_sword: 1 });
});

test('inventory helpers reject invalid amounts', () => {
  assert.throws(() => addItemToBag({}, 'wood', 0), RangeError);
  assert.throws(() => consumeItemFromBag({}, 'wood', -1), RangeError);
  assert.throws(() => craftItemInBag({}, {}, 'torch', 1.5), RangeError);
});

test('inventory rejects invalid existing counts before changing state', () => {
  assert.throws(() => addItemToBag({ wood: -1 }, 'wood', 1), RangeError);
  assert.throws(() => consumeItemFromBag({ stone: 1.5 }, 'stone', 1), RangeError);
  assert.throws(() => craftItemInBag({ wood: Number.NaN }, { wood: 1 }, 'plank', 1), RangeError);
});

test('adding or crafting cannot overflow a safe item count', () => {
  assert.throws(() => addItemToBag({ wood: Number.MAX_SAFE_INTEGER }, 'wood', 1), RangeError);
  assert.throws(() => craftItemInBag({ plank: Number.MAX_SAFE_INTEGER }, { wood: 1 }, 'plank', 1), RangeError);
});

test('crafting rejects malformed costs before consuming ingredients', () => {
  const bag = { wood: 4 };
  assert.throws(() => craftItemInBag(bag, { wood: -1 }, 'plank', 1), RangeError);
  assert.deepEqual(bag, { wood: 4 });
});
