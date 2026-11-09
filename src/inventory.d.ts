export function addItemToBag(bag: Record<string, number>, item: string, amount: number): Record<string, number>;
export function consumeItemFromBag(bag: Record<string, number>, item: string, amount: number): { bag: Record<string, number>; consumed: boolean };
export function craftItemInBag(bag: Record<string, number>, cost: Record<string, number>, item: string, amount: number): { bag: Record<string, number>; crafted: boolean };
export function assignHotbarSlot(hotbar: string[], slot: number, item: string, allowedItems: string[]): string[];
