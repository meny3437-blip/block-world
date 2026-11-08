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

import { chunkColumnRange } from '../src/chunks.js';

test('chunk columns are generated in bounded slices without gaps or overlaps', () => {
  const first = chunkColumnRange(-2, 0, 4);
  assert.deepEqual(first, { start: -32, end: -28, nextColumn: 4, complete: false });
  const second = chunkColumnRange(-2, first.nextColumn, 4);
  const third = chunkColumnRange(-2, second.nextColumn, 4);
  const fourth = chunkColumnRange(-2, third.nextColumn, 4);
  assert.deepEqual([first.start, second.start, third.start, fourth.start], [-32, -28, -24, -20]);
  assert.equal(fourth.end, -16);
  assert.equal(fourth.complete, true);
});

test('chunk column ranges reject invalid progress and budgets', () => {
  assert.throws(() => chunkColumnRange(0, -1, 4), RangeError);
  assert.throws(() => chunkColumnRange(0, 16, 4), RangeError);
  assert.throws(() => chunkColumnRange(0, 0, 0), RangeError);
  assert.throws(() => chunkColumnRange(0, 0, 17), RangeError);
});

import { visibleChunkKeys } from '../src/chunks.js';

test('visible chunk keys match the render neighborhood and shift without stale entries', () => {
  const first = visibleChunkKeys(0, 0);
  assert.equal(first.size, 9);
  assert.equal(first.has('0,0'), true);
  assert.equal(first.has('2,0'), false);
  const shifted = visibleChunkKeys(1, 0);
  assert.equal(shifted.has('2,0'), true);
  assert.equal(shifted.has('-2,0'), false);
});

import { chunkVisibilityDelta } from '../src/chunks.js';

test('chunk visibility delta hides departed chunks and shows newly entered chunks', () => {
  const previous = ['0,0', '0,1', '1,0', '1,1'];
  const next = ['0,1', '0,2', '1,1', '1,2'];
  assert.deepEqual(chunkVisibilityDelta(previous, next), {
    hide: ['0,0', '1,0'],
    show: ['0,2', '1,2']
  });
});

test('chunk visibility delta handles unchanged sets and rejects invalid keys', () => {
  assert.deepEqual(chunkVisibilityDelta(['-1,0'], ['-1,0']), { hide: [], show: [] });
  assert.deepEqual(chunkVisibilityDelta([], ['0,0']), { hide: [], show: ['0,0'] });
  assert.throws(() => chunkVisibilityDelta([''], []), TypeError);
  assert.throws(() => chunkVisibilityDelta(null, []), TypeError);
});
