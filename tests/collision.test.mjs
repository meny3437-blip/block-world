import test from 'node:test';
import assert from 'node:assert/strict';
import { collidesWithBlocks } from '../src/physics.js';

const has = (set) => (x, y, z) => set.has(`${x},${y},${z}`);

test('player collides with a block in the walking path', () => {
  const blocks = new Set(['1,1,0']);
  assert.equal(collidesWithBlocks(1, 0, 0.5, 2.2, has(blocks)), true);
});

test('player can stand on a floor block without colliding with it', () => {
  const blocks = new Set(['0,0,0']);
  assert.equal(collidesWithBlocks(0, 0, 0.5, 2.2, has(blocks)), false);
});

test('player can pass through an empty space', () => {
  assert.equal(collidesWithBlocks(4, -3, 0.5, 2.2, has(new Set())), false);
});
