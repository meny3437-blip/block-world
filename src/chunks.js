export const CHUNK_SIZE = 16;

export function chunkCoordinate(position, size = CHUNK_SIZE) {
  if (!Number.isFinite(position) || !Number.isSafeInteger(size) || size < 1) throw new RangeError('Invalid chunk coordinate input');
  return Math.floor(position / size);
}

export function chunkKey(chunkX, chunkZ) {
  if (!Number.isSafeInteger(chunkX) || !Number.isSafeInteger(chunkZ)) throw new RangeError('Chunk coordinates must be safe integers');
  return `${chunkX},${chunkZ}`;
}

export function chunkNeighborhood(chunkX, chunkZ, radius = 1) {
  if (!Number.isSafeInteger(chunkX) || !Number.isSafeInteger(chunkZ)
    || !Number.isSafeInteger(radius) || radius < 0 || radius > 8) {
    throw new RangeError('Invalid chunk neighborhood input');
  }
  const chunks = [];
  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dz = -radius; dz <= radius; dz += 1) {
      const x = chunkX + dx;
      const z = chunkZ + dz;
      chunks.push({ x, z, key: chunkKey(x, z) });
    }
  }
  return chunks;
}
