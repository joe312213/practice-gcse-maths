/**
 * Purpose: Mark structured error-spotting entries and the final numeric answer.
 *
 * Main contents:
 * - markErrors
 *
 * Used By: tests/website.test.mjs, website/src/lib/application/session.mjs
 *
 * Uses: website/src/lib/domain/engine.mjs.
 *
 * Libs: none.
 */
import { markAnswer } from './engine.mjs';

// A final answer alone cannot validate an error-spotting response.
/**
 * Mark row/reason/correction entries and final answer against the authored error specification.
 * Parameter q: authored question.
 * Parameter entries: learner row/reason/correction entries.
 * Parameter raw: untrusted input text.
 * Calls: markAnswer.
 * @example markErrors(q, entries, raw);
 */
export function markErrors(q, entries, raw) {
  const answer = markAnswer(raw, q.answer);
  if (q.errorOptions) {
    const choice = entries[0]?.correction;
    const valid = answer.valid && q.errorOptions.some((option) => option.id === choice);
    return {
      valid,
      correct: valid && answer.correct && choice === q.correctionId,
      answerCorrect: answer.correct,
      unique: true,
    };
  }
  const valid =
    answer.valid &&
    entries.length === q.errors.length &&
    entries.every(
      (e) =>
        Number.isInteger(e.row) &&
        e.row >= 0 &&
        e.row < q.balance.length &&
        e.reason &&
        q.stepOptions.some((o) => o.id === e.correction),
    );
  if (!valid) return { valid: false, correct: false };
  const unique = new Set(entries.map((e) => e.row)).size === entries.length;
  const details = entries.map((e) => {
    const expected = q.errors.find((x) => x.row === e.row);
    return {
      row: e.row,
      rowCorrect: Boolean(expected),
      reasonCorrect: expected?.reason === e.reason,
      stepCorrect: expected?.correction === e.correction,
    };
  });
  return {
    valid: true,
    correct:
      unique &&
      answer.correct &&
      details.every((e) => e.rowCorrect && e.reasonCorrect && e.stepCorrect),
    answerCorrect: answer.correct,
    details,
    unique,
  };
}
