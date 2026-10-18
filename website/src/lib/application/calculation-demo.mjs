/**
 * Purpose: Translate authored calculation steps into the shared method-player reveal frames. The
 * timeline coordinates writing, active steps and completed working without recalculating
 * authored answers.
 *
 * Main contents:
 * - calculationFrames.
 *
 * Used By: tests/draft-topics.test.mjs, tests/topic-content.test.mjs,
 * website/src/lib/components/teaching/DemoPlayer.svelte,
 * website/src/lib/components/teaching/ProblemTips.svelte.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
export function calculationFrames(steps) {
  return steps.flatMap((_, index) => [
    { step: index + 1, phase: 'inspect' },
    { step: index + 1, phase: 'write' },
  ]);
}
