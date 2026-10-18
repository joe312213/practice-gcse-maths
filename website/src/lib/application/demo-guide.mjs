/**
 * Purpose: Supply shared guide-construction frames before a method writes calculation ink.
 *
 * Main contents:
 * - guideFrames.
 *
 * Used By: website/src/lib/application/arithmetic-demo.mjs,
 * website/src/lib/application/equation-demo.mjs.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
/**
 * Return construction frames carrying method-owned detail. Called by equationFrames and arithmeticFrames.
 */
export function guideFrames(detail) {
  return [0, 0.25, 0.5, 0.75, 1].map((guideProgress) => ({
    step: 1,
    ...detail,
    guideProgress,
  }));
}
