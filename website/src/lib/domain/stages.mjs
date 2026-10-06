/**
 * Purpose: Define prerequisite learning-stage order and the next-stage lookup.
 *
 * Main contents:
 * - MODES
 * - nextStage
 *
 * Used By: website/src/lib/components/practice/NextStage.svelte, website/src/lib/components/practice/PracticeActivity.svelte, website/src/routes/+page.svelte
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
// Shared learning-path order; activity components do not own routing.
export const MODES = [
  ['assessment', '1 · Check your starting point'],
  ['demo', '2 · Review the method'],
  ['scaffolded', '3 · Guided practice'],
  ['errors', '4 · Spot the error'],
  ['plain', '5 · Independent practice'],
];

/**
 * Return the next prerequisite stage after the supplied mode, or null at the end.
 * Parameter mode: learning activity or theme mode, as used here.
 */
export function nextStage(mode) {
  const index = MODES.findIndex(([id]) => id === mode);
  return index < 0 ? null : (MODES[index + 1] ?? null);
}
