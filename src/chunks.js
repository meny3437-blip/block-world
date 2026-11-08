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

export function chunkColumnRange(chunkX, nextColumn = 0, columnBudget = 4) {
  if (!Number.isSafeInteger(chunkX)
    || !Number.isSafeInteger(nextColumn) || nextColumn < 0 || nextColumn >= CHUNK_SIZE
    || !Number.isSafeInteger(columnBudget) || columnBudget < 1 || columnBudget > CHUNK_SIZE) {
    throw new RangeError('Invalid chunk column range input');
  }
  const endColumn = Math.min(CHUNK_SIZE, nextColumn + columnBudget);
  return {
    start: chunkX * CHUNK_SIZE + nextColumn,
    end: chunkX * CHUNK_SIZE + endColumn,
    nextColumn: endColumn,
    complete: endColumn === CHUNK_SIZE
  };
}

export function visibleChunkKeys(chunkX, chunkZ, radius = 1) {
  return new Set(chunkNeighborhood(chunkX, chunkZ, radius).map((chunk) => chunk.key));
}

export function chunkVisibilityDelta(previousKeys, nextKeys) {
  if (!Array.isArray(previousKeys) || !Array.isArray(nextKeys)
    || [...previousKeys, ...nextKeys].some(key => typeof key !== 'string' || key.length === 0)) {
    throw new TypeError('Chunk visibility keys must be non-empty strings');
  }
  const previous = new Set(previousKeys);
  const next = new Set(nextKeys);
  return {
    hide: [...previous].filter(key => !next.has(key)),
    show: [...next].filter(key => !previous.has(key))
  };
}
