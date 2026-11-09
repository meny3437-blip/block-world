export function normalizeStickInput(rawX, rawY, deadzone = 0.12) {
  let x = Math.max(-1, Math.min(1, Number.isFinite(rawX) ? rawX : 0));
  let y = Math.max(-1, Math.min(1, Number.isFinite(rawY) ? rawY : 0));
  const length = Math.hypot(x, y);
  if (length < deadzone) return { x: 0, y: 0 };
  if (length > 1) { x /= length; y /= length; }
  return { x, y };
}
