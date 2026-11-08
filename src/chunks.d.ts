export const CHUNK_SIZE: number;
export function chunkCoordinate(position: number, size?: number): number;
export function chunkKey(chunkX: number, chunkZ: number): string;

export function chunkNeighborhood(chunkX: number, chunkZ: number, radius?: number): { x: number; z: number; key: string }[];

export function chunkColumnRange(chunkX: number, nextColumn?: number, columnBudget?: number): { start: number; end: number; nextColumn: number; complete: boolean };

export function visibleChunkKeys(chunkX: number, chunkZ: number, radius?: number): Set<string>;

export function chunkVisibilityDelta(previousKeys: string[], nextKeys: string[]): { hide: string[]; show: string[] };
