export const CHUNK_SIZE: number;
export function chunkCoordinate(position: number, size?: number): number;
export function chunkKey(chunkX: number, chunkZ: number): string;

export function chunkNeighborhood(chunkX: number, chunkZ: number, radius?: number): { x: number; z: number; key: string }[];
