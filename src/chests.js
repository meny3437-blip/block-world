function validateCounts(items) {
  for (const count of Object.values(items)) {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError('item counts must be non-negative safe integers');
    }
  }
}

function addCounts(target, source) {
  const result = { ...target };
  for (const [item, count] of Object.entries(source)) {
    if (count === 0) continue;
    const total = (result[item] || 0) + count;
    if (!Number.isSafeInteger(total)) {
      throw new RangeError('combined item count exceeds the safe integer range');
    }
    result[item] = total;
  }
  return result;
}

export function depositBagIntoChest(bag, chest) {
  validateCounts(bag);
  validateCounts(chest);
  return { bag: {}, chest: addCounts(chest, bag) };
}

export function withdrawChestToBag(bag, chest) {
  validateCounts(bag);
  validateCounts(chest);
  return { bag: addCounts(bag, chest), chest: {} };
}

export function breakChestContents(bag, chestStorage, chestKey) {
  validateCounts(bag);
  const contents = chestStorage[chestKey] || {};
  validateCounts(contents);
  const nextBag = addCounts(bag, contents);
  const nextStorage = { ...chestStorage };
  delete nextStorage[chestKey];
  return { bag: nextBag, chestStorage: nextStorage };
}

export function breakChestContents(bag, chestStorage, chestId) {
  const result = withdrawChestToBag(bag, chestStorage[chestId] || {});
  const nextStorage = { ...chestStorage };
  delete nextStorage[chestId];
  return { bag: result.bag, chestStorage: nextStorage };
}
