import test from 'node:test';
import assert from 'node:assert/strict';
import { breakChestContents, depositBagIntoChest, withdrawChestToBag } from '../src/chests.js';

test('deposit transfers positive item counts and clears the carried bag', () => {
  const bag = { wood: 3, berry: 0, stone: 2 };
  const chest = { wood: 4, torch: 1 };
  const result = depositBagIntoChest(bag, chest);
  assert.deepEqual(result, { bag: {}, chest: { wood: 7, torch: 1, stone: 2 } });
  assert.deepEqual(bag, { wood: 3, berry: 0, stone: 2 });
  assert.deepEqual(chest, { wood: 4, torch: 1 });
});

test('withdraw transfers chest contents and empties the chest', () => {
  const bag = { wood: 1 };
  const chest = { wood: 4, torch: 2 };
  const result = withdrawChestToBag(bag, chest);
  assert.deepEqual(result, { bag: { wood: 5, torch: 2 }, chest: {} });
  assert.deepEqual(bag, { wood: 1 });
  assert.deepEqual(chest, { wood: 4, torch: 2 });
});

test('chest transfers reject invalid counts without mutating inputs', () => {
  const bag = { wood: -1 };
  const chest = { stone: 1 };
  assert.throws(() => depositBagIntoChest(bag, chest), RangeError);
  assert.deepEqual(bag, { wood: -1 });
  assert.deepEqual(chest, { stone: 1 });
  assert.throws(() => withdrawChestToBag({}, { torch: 1.5 }), RangeError);
});

test('breaking a chest returns its contents and removes its storage entry', () => {
  const bag = { wood: 1 };
  const storage = { '1,2,3': { torch: 4 }, '8,0,2': { stone: 2 } };
  const result = breakChestContents(bag, storage, '1,2,3');
  assert.deepEqual(result, { bag: { wood: 1, torch: 4 }, chestStorage: { '8,0,2': { stone: 2 } } });
  assert.deepEqual(storage, { '1,2,3': { torch: 4 }, '8,0,2': { stone: 2 } });
});
