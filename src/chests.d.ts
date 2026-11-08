export function depositBagIntoChest(bag: Record<string, number>, chest: Record<string, number>): { bag: Record<string, number>; chest: Record<string, number> };
export function withdrawChestToBag(bag: Record<string, number>, chest: Record<string, number>): { bag: Record<string, number>; chest: Record<string, number> };
export function breakChestContents(bag: Record<string, number>, chestStorage: Record<string, Record<string, number>>, chestId: string): { bag: Record<string, number>; chestStorage: Record<string, Record<string, number>> };
