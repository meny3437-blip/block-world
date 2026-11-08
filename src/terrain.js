// Seeded, continuous height noise shared by all generated dimensions.
export function terrainWave(x, z, seed = 0) {
  const safeSeed = Number.isFinite(seed) ? Math.abs(Math.trunc(seed)) : 0;
  const seedX = (safeSeed % 997) * 0.0037;
  const seedZ = ((safeSeed * 7 + 13) % 991) * 0.0031;
  return Math.sin((x + seedX) * 0.22) * 1.7
    + Math.cos((z + seedZ) * 0.19) * 1.4
    + Math.sin((x + z + seedX - seedZ) * 0.12) * 1.2;
}
