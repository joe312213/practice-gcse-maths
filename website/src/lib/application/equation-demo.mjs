/**
 * Purpose: Translate equation rows into ordered reveal frames for the shared demo player.
 *
 * Main contents:
 * - equationFrames
 *
 * Used By: tests/demo-sequence.test.mjs, website/src/lib/components/teaching/DemoPlayer.svelte
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
// Draw the divider first, then write each side in reading order.
// Operations have no equals sign, so omit that reveal rather than adding a pause.
/**
 * Return reveal frames for equation terms and operations in teaching order.
 * Parameter rows: ordered equation working rows.
 */
export function equationFrames(rows) {
  return [
    { step: 1, part: 0 },
    ...rows.flatMap((row, index) =>
      (row.kind === 'op' ? [1, 3] : [1, 2, 3]).map((part) => ({ step: index + 1, part })),
    ),
  ];
}
