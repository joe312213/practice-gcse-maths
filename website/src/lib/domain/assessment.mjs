/**
 * Purpose: Completed assessment history owns the seven-day lock, including after JSON transfer.
 *
 * Main contents:
 * - REASSESS_DELAY, latestAssessment, assessmentStatus.
 *
 * Used By: tests/reattempts.test.mjs, tests/session.test.mjs,
 * website/src/lib/application/session.mjs.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
export const REASSESS_DELAY = 7 * 24 * 60 * 60 * 1000;

/** Group original assessment history by attempt and return the latest complete result. Retries never change this baseline; called by assessmentStatus and the session. */
export function latestAssessment(history = []) {
  const attempts = new Map();
  for (const record of history) {
    if (record.type !== 'assessment' || record.reattempt) continue;
    if (!attempts.has(record.attempt)) attempts.set(record.attempt, []);
    attempts.get(record.attempt).push(record);
  }
  return (
    [...attempts.values()]
      .filter(
        (records) => new Set(records.map((r) => r.question)).size >= (records[0].pageSize ?? 4),
      )
      .sort((a, b) => Math.max(...b.map((r) => r.at)) - Math.max(...a.map((r) => r.at)))[0] ?? null
  );
}

/** Return the latest assessment and its next available date for the supplied history and epoch time. Calls latestAssessment; consumed by the practice UI. Example: assessmentStatus(topic.history, Date.now()). */
export function assessmentStatus(history, now) {
  const records = latestAssessment(history);
  if (!records) return null;
  const completedAt = Math.max(...records.map((r) => r.at));
  return {
    completedAt,
    availableAt: completedAt + REASSESS_DELAY,
    available: now >= completedAt + REASSESS_DELAY,
    correct: records.filter((r) => r.correct).length,
    size: records.length,
  };
}
