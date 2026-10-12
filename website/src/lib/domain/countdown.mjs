/**
 * Purpose: Pure page-countdown arithmetic, separate from measured active practice time.
 *
 * Main contents: Duration defaults, remaining time and minute/second display.
 *
 * Used By: PracticeCountdown, Go clock display and countdown tests.
 *
 * Uses: None. Libs: None.
 */
export const practiceMinutes = (questions) => Math.max(1, Math.ceil(questions * 1.5));
export const remainingTime = (deadline, now) => Math.max(0, deadline - now);
export function clockText(milliseconds) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
