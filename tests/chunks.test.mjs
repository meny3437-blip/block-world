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
