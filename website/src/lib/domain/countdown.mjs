/**
 * Purpose: Pure page-countdown arithmetic, separate from measured active practice time.
 *
 * Main contents:
 * Duration defaults, remaining time and minute/second display.
 *
 * Used By: tests/countdown.test.mjs,
 * website/src/lib/components/practice/PracticeCountdown.svelte,
 * website/src/lib/components/puzzles/GoClock.svelte.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
export const practiceMinutes = (questions) => Math.max(1, Math.ceil(questions * 1.5));
export const remainingTime = (deadline, now) => Math.max(0, deadline - now);
/** Format remaining milliseconds as minutes:seconds for PracticeCountdown. Negative values display zero; no timer or clock state is changed. */
export function clockText(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
