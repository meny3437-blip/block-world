export function depositBagIntoChest(bag, chest) {
  const stored = { ...chest };
  for (const [item, count] of Object.entries(bag)) {
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('item counts must be non-negative integers');
    if (count > 0) stored[item] = (stored[item] || 0) + count;
  }
  return { bag: {}, chest: stored };
}

export function withdrawChestToBag(bag, chest) {
  const nextBag = { ...bag };
  for (const [item, count] of Object.entries(chest)) {
    if (!Number.isSafeInteger(count) || count < 0) throw new RangeError('item counts must be non-negative integers');
    if (count > 0) nextBag[item] = (nextBag[item] || 0) + count;
  }
  return { bag: nextBag, chest: {} };
}
