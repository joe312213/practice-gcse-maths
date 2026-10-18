/**
 * Purpose: Retry policy shared by marking, progress aggregation and presentation. Times are
 * milliseconds.
 *
 * Main contents:
 * - REATTEMPT_POLICY, earlyReattempt, latestResponse, countsForProgress.
 *
 * Used By: tests/reattempts.test.mjs, website/src/lib/application/session.mjs,
 * website/src/lib/components/practice/PracticeActivity.svelte,
 * website/src/lib/components/practice/QuestionList.svelte,
 * website/src/lib/domain/practice-history.mjs, website/src/lib/domain/progress.mjs.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
export const REATTEMPT_POLICY = { 'count-reattempt-mintime': 2 * 60 * 60 * 1000 };

/** Look across pages and restored history so restarting a page cannot bypass the waiting time. */
export function earlyReattempt(history, question, now) {
  let lastWrong = -Infinity;
  for (const record of history)
    if (record.question === question && !record.correct) lastWrong = Math.max(lastWrong, record.at);
  return now - lastWrong < REATTEMPT_POLICY['count-reattempt-mintime'];
}

/** Original responses remain authoritative for page/set totals; selectors show the latest practice. */
export function latestResponse(page, question) {
  return page.reattempts?.[question] ?? page.responses[question];
}

/** Return whether an outcome is eligible for scoring: early retries never count, and assisted successes do not count. Used by session marking and progress calculations. */
export function countsForProgress(record) {
  return !record.earlyReattempt && (!record.assisted || !record.correct);
}
