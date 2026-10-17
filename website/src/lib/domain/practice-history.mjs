/**
 * Purpose: Derive UK weekly time and success from durable records without storing percentages or inventing historical timing.
 *
 * Main contents:
 * - practiceWeeks; practiceHistory.
 *
 * Used By: PracticeHistory.svelte and practice-time tests.
 *
 * Uses: progress.mjs (weekKey).
 *
 * Libs: None.
 */
import { weekKey } from './progress.mjs';
import { countsForProgress } from './reattempts.mjs';
/**
 * Return this and last Monday's UK date keys for an epoch-millisecond timestamp.
 * Calls weekKey; used by practiceHistory and PracticeHistory.svelte.
 * @example practiceWeeks(Date.UTC(2026, 9, 10)); // { current: '2026-10-05', previous: '2026-09-28' }
 */
export function practiceWeeks(now = Date.now()) {
  const current = weekKey(now);
  // Noon UTC avoids ambiguity around UK clock changes.
  const previous = new Date(Date.parse(`${current}T12:00:00Z`) - 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  return { current, previous };
}
/**
 * Aggregate profile records for optional topic scope and activity mode at now.
 * Calls weekKey; used by PracticeHistory.svelte. Empty current/previous weeks remain visible.
 * @example const weeks = practiceHistory(profile, "maths:M10", "plain", now);
 */
export function practiceHistory(profile, scope = '', mode = 'plain', now = Date.now()) {
  const weeks = new Map();
  const row = (key) => {
    if (!weeks.has(key))
      weeks.set(key, {
        week: key,
        milliseconds: 0,
        answered: 0,
        levels: Array.from({ length: 4 }, () => ({ correct: 0, scored: 0 })),
      });
    return weeks.get(key);
  };
  const { current, previous } = practiceWeeks(now);
  row(current);
  row(previous);
  for (const [key, topic] of Object.entries(profile.topics)) {
    if (scope && scope !== key) continue;
    for (const item of topic.history) {
      if (item.earlyReattempt) continue;
      const week = row(weekKey(item.at));
      week.answered++;
      if (item.type === mode && countsForProgress(item)) {
        const level = week.levels[item.level];
        level.scored++;
        if (item.correct) level.correct++;
      }
    }
    for (const item of topic.practice ?? [])
      row(weekKey(item.at)).milliseconds += item.milliseconds;
  }
  return [...weeks.values()].sort((a, b) => b.week.localeCompare(a.week));
}
