import test from 'node:test';
import assert from 'node:assert/strict';
import { depositBagIntoChest, withdrawChestToBag } from '../src/chests.js';
import { getAttackDamage, getIncomingDamage, selectWeapon } from '../src/combat.js';

test('deposit transfers all positive item counts and leaves both inputs unchanged', () => {
  const bag = { wood: 4, berry: 2, empty: 0 };
  const chest = { stone: 3, wood: 1 };
  const result = depositBagIntoChest(bag, chest);
  assert.deepEqual(result, { bag: {}, chest: { stone: 3, wood: 5, berry: 2 } });
  assert.deepEqual(bag, { wood: 4, berry: 2, empty: 0 });
  assert.deepEqual(chest, { stone: 3, wood: 1 });
});

test('depositing an empty bag preserves chest contents', () => {
  assert.deepEqual(depositBagIntoChest({}, { stone: 2 }), { bag: {}, chest: { stone: 2 } });
});

test('deposit rejects invalid item counts without mutating source objects', () => {
  for (const count of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1]) {
    const bag = { wood: count };
    const chest = { stone: 2 };
    assert.throws(() => depositBagIntoChest(bag, chest), RangeError);
    assert.equal(bag.wood, count);
    assert.deepEqual(chest, { stone: 2 });
  }
});

test('withdraw combines chest contents with the bag atomically', () => {
  const bag = { wood: 2, berry: 1 };
  const chest = { stone: 4, wood: 3 };
  const result = withdrawChestToBag(bag, chest);
  assert.deepEqual(result, { bag: { wood: 5, berry: 1, stone: 4 }, chest: {} });
  assert.deepEqual(bag, { wood: 2, berry: 1 });
  assert.deepEqual(chest, { stone: 4, wood: 3 });
});

test('withdrawing an empty chest preserves the bag', () => {
  assert.deepEqual(withdrawChestToBag({ wood: 2 }, {}), { bag: { wood: 2 }, chest: {} });
});

test('withdraw rejects invalid stored counts without mutating source objects', () => {
  for (const count of [-1, 2.25, Number.NaN, Number.POSITIVE_INFINITY]) {
    const bag = { wood: 2 };
    const chest = { stone: count };
    assert.throws(() => withdrawChestToBag(bag, chest), RangeError);
    assert.deepEqual(bag, { wood: 2 });
    assert.equal(chest.stone, count);
  }
});

test('weapon selection prefers the strongest carried melee weapon', () => {
  assert.equal(selectWeapon({ wood_sword: 1 }), 'wood_sword');
  assert.equal(selectWeapon({ wood_sword: 1, stone_sword: 1 }), 'stone_sword');
  assert.equal(selectWeapon({ wood_sword: 1, stone_sword: 1, iron_sword: 1 }), 'iron_sword');
  assert.equal(selectWeapon({}), 'hand');
});

test('ranged weapon selection uses a bow when available', () => {
  assert.equal(selectWeapon({ bow: 1, iron_sword: 1 }, true), 'bow');
  assert.equal(getAttackDamage({ bow: 1, iron_sword: 1 }, true), 36);
  assert.equal(selectWeapon({ iron_sword: 1 }, true), 'iron_sword');
});

test('attack damage matches weapon tiers', () => {
  assert.equal(getAttackDamage({}), 18);
  assert.equal(getAttackDamage({ wood_sword: 1 }), 28);
  assert.equal(getAttackDamage({ stone_sword: 1 }), 42);
  assert.equal(getAttackDamage({ iron_sword: 1 }), 60);
});

test('incoming damage applies the strongest available armor', () => {
  assert.equal(getIncomingDamage({}), 5);
  assert.equal(getIncomingDamage({ leather_armor: 1 }), 3);
  assert.equal(getIncomingDamage({ dragon_armor: 1 }), 1);
  assert.equal(getIncomingDamage({ leather_armor: 1, dragon_armor: 1 }), 1);
  assert.equal(getIncomingDamage({}, true), 12);
  assert.equal(getIncomingDamage({ leather_armor: 1 }, true), 7);
  assert.equal(getIncomingDamage({ dragon_armor: 1 }, true), 4);
});

test('deposit rejects a combined count that exceeds the safe integer range', () => {
  const bag = { wood: Number.MAX_SAFE_INTEGER };
  const chest = { wood: 1 };
  assert.throws(() => depositBagIntoChest(bag, chest), RangeError);
  assert.deepEqual(bag, { wood: Number.MAX_SAFE_INTEGER });
  assert.deepEqual(chest, { wood: 1 });
});

test('withdraw rejects a combined count that exceeds the safe integer range', () => {
  const bag = { stone: Number.MAX_SAFE_INTEGER };
  const chest = { stone: 1 };
  assert.throws(() => withdrawChestToBag(bag, chest), RangeError);
  assert.deepEqual(bag, { stone: Number.MAX_SAFE_INTEGER });
  assert.deepEqual(chest, { stone: 1 });
});

test('transfers validate pre-existing destination counts before mutation', () => {
  assert.throws(() => depositBagIntoChest({ wood: 1 }, { stone: -1 }), RangeError);
  assert.throws(() => withdrawChestToBag({ wood: 1.5 }, { stone: 1 }), RangeError);
});
