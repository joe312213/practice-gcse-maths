/** Retry policy shared by marking, progress aggregation and presentation. Times are milliseconds. */
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

export function countsForProgress(record) {
  return !record.earlyReattempt && (!record.assisted || !record.correct);
}
