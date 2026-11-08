import test from 'node:test';
import assert from 'node:assert/strict';
import { terrainWave } from '../src/terrain.js';

test('terrain generation is deterministic for the same coordinates and seed', () => {
  assert.equal(terrainWave(12, -7, 12345), terrainWave(12, -7, 12345));
});

test('different world seeds produce different terrain profiles', () => {
  const first = Array.from({ length: 12 }, (_, i) => terrainWave(i - 5, i * 2, 123));
  const second = Array.from({ length: 12 }, (_, i) => terrainWave(i - 5, i * 2, 456));
  assert.notDeepEqual(first, second);
});

test('terrain height remains continuous between neighboring columns', () => {
  const a = terrainWave(4, 9, 9876);
  const b = terrainWave(4.01, 9, 9876);
  assert.ok(Math.abs(a - b) < 0.1);
});
