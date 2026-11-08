export function stepVerticalMotion(y: number, velocity: number, groundY: number, dt: number, gravity?: number): { y: number; velocity: number; grounded: boolean };
export function collidesWithBlocks(x: number, z: number, feetY: number, headY: number, hasBlock: (x: number, y: number, z: number) => boolean, radius?: number): boolean;
