// Integrate vertical movement and keep the player grounded without sinking below terrain.
export function stepVerticalMotion(y, velocity, groundY, dt, gravity = 18) {
  const safeDt = Number.isFinite(dt) ? Math.max(0, Math.min(dt, 0.05)) : 0;
  const safeGround = Number.isFinite(groundY) ? groundY : 0;
  let nextVelocity = (Number.isFinite(velocity) ? velocity : 0) - gravity * safeDt;
  let nextY = (Number.isFinite(y) ? y : safeGround) + nextVelocity * safeDt;
  if (nextY <= safeGround) return { y: safeGround, velocity: 0, grounded: true };
  return { y: nextY, velocity: nextVelocity, grounded: false };
}
