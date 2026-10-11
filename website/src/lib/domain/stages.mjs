/**
 * Purpose: Define prerequisite learning-stage order and the next-stage lookup.
 *
 * Main contents:
 * - MODES
 * - nextStage
 *
 * Used By: website/src/lib/components/practice/NextStage.svelte, website/src/lib/components/practice/PracticeActivity.svelte, website/src/lib/components/practice/TopicPractice.svelte
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
// Shared learning-path order; activity components do not own routing.
export const MODES = [
  ['assessment', 'Initial assessment'],
  ['demo', 'Learn the method'],
  ['scaffolded', 'Scaffolded practice'],
  ['errors', 'Spot the error'],
  ['plain', 'Independent practice'],
];

/**
 * Return the next prerequisite stage after the supplied mode, or null at the end.
 * Parameter mode: activity ID, such as assessment, scaffolded, errors or plain.
 */
export function nextStage(mode) {
  const index = MODES.findIndex(([id]) => id === mode);
  return index < 0 ? null : (MODES[index + 1] ?? null);
}
