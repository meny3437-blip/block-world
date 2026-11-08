// Integrate vertical movement and keep the player grounded without sinking below terrain.
export function stepVerticalMotion(y, velocity, groundY, dt, gravity = 18) {
  const safeDt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.05)) : 0;
  const safeGround = Number.isFinite(groundY) ? groundY : 0;
  let nextVelocity = (Number.isFinite(velocity) ? velocity : 0) - gravity * safeDt;
  let nextY = (Number.isFinite(y) ? y : safeGround) + nextVelocity * safeDt;
  if (nextY <= safeGround) return { y: safeGround, velocity: 0, grounded: true };
  return { y: nextY, velocity: nextVelocity, grounded: false };
}

// Axis-aligned player capsule approximation against voxel blocks.
export function collidesWithBlocks(x, z, feetY, headY, hasBlock, radius = 0.28) {
  if (![x, z, feetY, headY, radius].every(Number.isFinite) || typeof hasBlock !== 'function') return true;
  const minX = Math.floor(x - radius - 0.5), maxX = Math.ceil(x + radius + 0.5);
  const minZ = Math.floor(z - radius - 0.5), maxZ = Math.ceil(z + radius + 0.5);
  const minY = Math.floor(feetY - 0.5), maxY = Math.ceil(headY + 0.5);
  for (let bx = minX; bx <= maxX; bx++) for (let bz = minZ; bz <= maxZ; bz++) {
    if (Math.abs(x - bx) >= radius + 0.5 || Math.abs(z - bz) >= radius + 0.5) continue;
    for (let by = minY; by <= maxY; by++) {
      if (by + 0.5 > feetY && by - 0.5 < headY && hasBlock(bx, by, bz)) return true;
    }
  }
  return false;
}
