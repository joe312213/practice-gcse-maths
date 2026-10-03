// Shared learning-path order; activity components do not own routing.
export const MODES = [
  ['assessment', '1 · Check your starting point'],
  ['demo', '2 · Review the method'],
  ['scaffolded', '3 · Guided practice'],
  ['errors', '4 · Spot the error'],
  ['plain', '5 · Independent practice'],
];

export function nextStage(mode) {
  const index = MODES.findIndex(([id]) => id === mode);
  return index < 0 ? null : (MODES[index + 1] ?? null);
}
