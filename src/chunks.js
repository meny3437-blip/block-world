export const CHUNK_SIZE = 16;

export function chunkCoordinate(position, size = CHUNK_SIZE) {
  if (!Number.isFinite(position) || !Number.isSafeInteger(size) || size < 1) throw new RangeError('Invalid chunk coordinate input');
  return Math.floor(position / size);
}

export function chunkKey(chunkX, chunkZ) {
  if (!Number.isSafeInteger(chunkX) || !Number.isSafeInteger(chunkZ)) throw new RangeError('Chunk coordinates must be safe integers');
  return `${chunkX},${chunkZ}`;
}
