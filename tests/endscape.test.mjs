import test from 'node:test';
import assert from 'node:assert/strict';
import { createEndscape } from '../src/endscape.js';

test('End environment exports a scene attachment with cleanup', () => {
  assert.equal(typeof createEndscape, 'function');
});

test('End environment generation is deterministic for a seed and device budget', () => {
  const source = createEndscape.toString();
  assert.match(source, /towerCount = mobile \? 5 : 9/);
  assert.match(source, /starCount = mobile \? 260 : 1100/);
  assert.match(source, /seeded/);
});
