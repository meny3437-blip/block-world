export interface StickInput {
  x: number;
  y: number;
}

export function normalizeStickInput(rawX: number, rawY: number, deadzone?: number): StickInput;
