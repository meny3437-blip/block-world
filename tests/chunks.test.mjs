import test from 'node:test';
import assert from 'node:assert/strict';
import { CHUNK_SIZE, chunkCoordinate, chunkKey } from '../src/chunks.js';

test('chunk size is sixteen blocks', () => {
  assert.equal(CHUNK_SIZE, 16);
});

test('chunk coordinates handle positive and negative world positions', () => {
  assert.equal(chunkCoordinate(0), 0);
  assert.equal(chunkCoordinate(15.99), 0);
  assert.equal(chunkCoordinate(16), 1);
  assert.equal(chunkCoordinate(-0.01), -1);
  assert.equal(chunkCoordinate(-16), -1);
  assert.equal(chunkCoordinate(-16.01), -2);
});

test('chunk keys are stable and reject invalid coordinates', () => {
  assert.equal(chunkKey(-2, 3), '-2,3');
  assert.throws(() => chunkKey(1.5, 2), RangeError);
  assert.throws(() => chunkCoordinate(Infinity), RangeError);
});

import { chunkNeighborhood } from '../src/chunks.js';

test('chunk neighborhood returns the nine surrounding chunks in stable order', () => {
  const chunks = chunkNeighborhood(2, -1);
  assert.equal(chunks.length, 9);
  assert.deepEqual(chunks[0], { x: 1, z: -2, key: '1,-2' });
  assert.deepEqual(chunks[4], { x: 2, z: -1, key: '2,-1' });
  assert.deepEqual(chunks[8], { x: 3, z: 0, key: '3,0' });
});

test('chunk neighborhood supports bounded radii and rejects invalid input', () => {
  assert.equal(chunkNeighborhood(0, 0, 2).length, 25);
  assert.throws(() => chunkNeighborhood(0, 0, -1), RangeError);
  assert.throws(() => chunkNeighborhood(0, 0, 9), RangeError);
  assert.throws(() => chunkNeighborhood(0.5, 0), RangeError);
});
