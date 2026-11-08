export function selectWeapon(bag, ranged = false) {
  if (ranged && (bag.bow || 0) > 0) return 'bow';
  if ((bag.iron_sword || 0) > 0) return 'iron_sword';
  if ((bag.stone_sword || 0) > 0) return 'stone_sword';
  if ((bag.wood_sword || 0) > 0) return 'wood_sword';
  return 'hand';
}

export function getAttackDamage(bag, ranged = false) {
  const weapon = selectWeapon(bag, ranged);
  return weapon === 'bow' ? 36 : weapon === 'iron_sword' ? 60 : weapon === 'stone_sword' ? 42 : weapon === 'wood_sword' ? 28 : 18;
}

export function getIncomingDamage(bag, boss = false) {
  if ((bag.dragon_armor || 0) > 0) return boss ? 4 : 1;
  if ((bag.leather_armor || 0) > 0) return boss ? 7 : 3;
  return boss ? 12 : 5;
}
