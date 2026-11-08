export function addItemToBag(bag, item, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('amount must be a positive integer');
  return { ...bag, [item]: (bag[item] || 0) + amount };
}

export function consumeItemFromBag(bag, item, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('amount must be a positive integer');
  if ((bag[item] || 0) < amount) return { bag, consumed: false };
  return { bag: { ...bag, [item]: bag[item] - amount }, consumed: true };
}

export function craftItemInBag(bag, cost, item, amount) {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError('amount must be a positive integer');
  if (Object.entries(cost).some(([key, count]) => !Number.isSafeInteger(count) || count <= 0 || (bag[key] || 0) < count)) {
    return { bag, crafted: false };
  }
  const next = { ...bag };
  for (const [key, count] of Object.entries(cost)) next[key] = (next[key] || 0) - count;
  next[item] = (next[item] || 0) + amount;
  return { bag: next, crafted: true };
}
