import test from 'node:test';
import assert from 'node:assert/strict';
import { stepVerticalMotion } from '../src/physics.js';

test('falling player lands on the terrain and stops', () => {
  const result = stepVerticalMotion(1.2, -8, 1, 0.05);
  assert.deepEqual(result, { y: 1, velocity: 0, grounded: true });
});

test('jump velocity moves the player upward before gravity slows the ascent', () => {
  const result = stepVerticalMotion(2, 6.2, 1, 0.05);
  assert.ok(result.y > 2);
  assert.ok(result.velocity > 0);
  assert.equal(result.grounded, false);
});

test('large frame times are capped to keep physics stable', () => {
  const result = stepVerticalMotion(2, 0, 1, 1);
  assert.equal(result.y, 1.955);
  assert.equal(result.grounded, false);
});
