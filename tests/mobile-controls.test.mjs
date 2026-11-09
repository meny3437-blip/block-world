import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeStickInput } from '../src/mobile-controls.js';

test('mobile stick ignores accidental touches inside deadzone', () => {
  assert.deepEqual(normalizeStickInput(0.04, -0.05), { x: 0, y: 0 });
});
test('mobile stick clamps and normalizes diagonal movement', () => {
  const value = normalizeStickInput(1, 1);
  assert.ok(Math.abs(Math.hypot(value.x, value.y) - 1) < 1e-10);
  assert.ok(Math.abs(value.x - Math.SQRT1_2) < 1e-10);
  assert.ok(Math.abs(value.y - Math.SQRT1_2) < 1e-10);
});
test('mobile stick preserves analog direction and clamps edge input', () => {
  assert.deepEqual(normalizeStickInput(0.5, -0.25), { x: 0.5, y: -0.25 });
  assert.deepEqual(normalizeStickInput(3, 0), { x: 1, y: 0 });
});
