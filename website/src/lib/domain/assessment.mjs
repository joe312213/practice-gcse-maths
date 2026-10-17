/** Completed assessment history owns the seven-day lock, including after JSON transfer. */
export const REASSESS_DELAY = 7 * 24 * 60 * 60 * 1000;

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
