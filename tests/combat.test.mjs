import test from 'node:test';
import assert from 'node:assert/strict';
import { getAttackDamage, getIncomingDamage, selectWeapon } from '../src/combat.js';

test('unarmed attacks use the base damage', () => {
  assert.equal(selectWeapon({}), 'hand');
  assert.equal(getAttackDamage({}), 18);
});

test('the strongest carried melee sword is selected', () => {
  assert.equal(selectWeapon({ wood_sword: 1, stone_sword: 1 }), 'stone_sword');
  assert.equal(selectWeapon({ wood_sword: 1, stone_sword: 1, iron_sword: 1 }), 'iron_sword');
  assert.equal(getAttackDamage({ wood_sword: 1 }), 28);
  assert.equal(getAttackDamage({ stone_sword: 1 }), 42);
  assert.equal(getAttackDamage({ iron_sword: 1 }), 60);
});

test('bow attacks require a bow and use ranged damage', () => {
  assert.equal(selectWeapon({ bow: 1 }, true), 'bow');
  assert.equal(getAttackDamage({ bow: 1 }, true), 36);
  assert.equal(selectWeapon({ iron_sword: 1 }, true), 'iron_sword');
});

test('dragon armor gives the strongest protection', () => {
  assert.equal(getIncomingDamage({ dragon_armor: 1, leather_armor: 1 }), 1);
  assert.equal(getIncomingDamage({ dragon_armor: 1 }, true), 4);
});

test('leather armor reduces normal and boss damage', () => {
  assert.equal(getIncomingDamage({ leather_armor: 1 }), 3);
  assert.equal(getIncomingDamage({ leather_armor: 1 }, true), 7);
});

test('unarmored players take full damage', () => {
  assert.equal(getIncomingDamage({}), 5);
  assert.equal(getIncomingDamage({}, true), 12);
});
