import test from 'node:test';
import assert from 'node:assert/strict';
import { isCaveCell, oreAtDepth } from '../src/caves.js';

test('cave carving is deterministic for the same world seed', () => {
  assert.equal(isCaveCell(12, -7, -4, 12345), isCaveCell(12, -7, -4, 12345));
  assert.notEqual(isCaveCell(12, -7, -4, 12345), isCaveCell(12, -7, -4, 54321));
});

test('cave generation produces both solid and carved cells', () => {
  let carved = 0, solid = 0;
  for (let x = -20; x < 20; x++) for (let y = -12; y < -2; y++) for (let z = -20; z < 20; z++) {
    if (isCaveCell(x, y, z, 777)) carved++; else solid++;
  }
  assert.ok(carved > 0);
  assert.ok(solid > carved);
});

test('ore distribution is deterministic and depth-gated', () => {
  assert.equal(oreAtDepth(2, -10, 3, 99), oreAtDepth(2, -10, 3, 99));
  assert.equal(oreAtDepth(2, -2, 3, 99), null);
  assert.ok([null, 'coal', 'copper', 'iron', 'crystal', 'gold'].includes(oreAtDepth(2, -10, 3, 99)));
});
