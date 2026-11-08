// Deterministic, seed-driven cave pockets and underground ore veins.
export function isCaveCell(x, y, z, seed = 0) {
  if (![x, y, z, seed].every(Number.isFinite)) return false;
  const s = Math.trunc(seed) * 0.00017;
  const field = Math.sin(x * 0.19 + z * 0.11 + s)
    + Math.cos(z * 0.17 - y * 0.31 - s * 1.7)
    + Math.sin(y * 0.37 + x * 0.07 - z * 0.05 + s * 0.6);
  return field > 1.78;
}

export function oreAtDepth(x, y, z, seed = 0) {
  if (![x, y, z, seed].every(Number.isFinite)) return null;
  const v = Math.sin((x + seed) * 127.1 + (y - seed) * 269.5 + (z + seed) * 311.7) * 43758.5453;
  const roll = v - Math.floor(v);
  const depth = Math.abs(y);
  if (depth >= 9 && roll > 0.997) return 'gold';
  if (depth >= 6 && roll > 0.991) return 'crystal';
  if (depth >= 4 && roll > 0.978) return 'iron';
  if (depth >= 3 && roll > 0.957) return 'copper';
  if (roll > 0.935) return 'coal';
  return null;
}
