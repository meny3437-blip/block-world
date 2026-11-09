function validateCounts(items) {
  for (const count of Object.values(items)) {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError('item counts must be non-negative safe integers');
    }
  }
}

function addCount(target, item, amount) {
  const total = (target[item] || 0) + amount;
  if (!Number.isSafeInteger(total)) {
    throw new RangeError('combined item count exceeds the safe integer range');
  }
  return total;
}

export function addItemToBag(bag, item, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('amount must be a positive integer');
  validateCounts(bag);
  return { ...bag, [item]: addCount(bag, item, amount) };
}

export function consumeItemFromBag(bag, item, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('amount must be a positive integer');
  validateCounts(bag);
  if ((bag[item] || 0) < amount) return { bag, consumed: false };
  return { bag: { ...bag, [item]: bag[item] - amount }, consumed: true };
}

export function craftItemInBag(bag, cost, item, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('amount must be a positive integer');
  validateCounts(bag);
  for (const count of Object.values(cost)) {
    if (!Number.isSafeInteger(count) || count <= 0) {
      throw new RangeError('crafting costs must be positive safe integers');
    }
  }
  if (Object.entries(cost).some(([key, count]) => (bag[key] || 0) < count)) {
    return { bag, crafted: false };
  }
  const next = { ...bag };
  for (const [key, count] of Object.entries(cost)) next[key] = (next[key] || 0) - count;
  next[item] = addCount(next, item, amount);
  return { bag: next, crafted: true };
}

export function assignHotbarSlot(hotbar, slot, item, allowedItems) {
  if (!Array.isArray(hotbar) || hotbar.length !== 9) throw new RangeError('hotbar must contain exactly nine slots');
  if (!Number.isInteger(slot) || slot < 0 || slot >= 9) throw new RangeError('hotbar slot must be between 0 and 8');
  if (typeof item !== 'string' || !allowedItems.includes(item)) throw new RangeError('item is not allowed in the hotbar');
  return hotbar.map((current, index) => index === slot ? item : current);
}
