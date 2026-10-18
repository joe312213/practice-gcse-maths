/**
 * Purpose: Mark structured error-spotting entries and the final numeric answer.
 *
 * Main contents:
 * - markErrors, markInvestigation
 *
 * Used By: tests/arithmetic.test.mjs, tests/draft-topics.test.mjs,
 * tests/error-investigation.test.mjs, tests/website.test.mjs,
 * website/src/lib/application/session.mjs,
 * website/src/lib/components/teaching/LatticeErrorInvestigation.svelte.
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
 * @example markErrors({ answer: "2", errorOptions: [{ id: "a" }], correctionId: "a" }, [{ correction: "a" }], "2"); // correct: true
 */
export function markErrors(q, entries, raw) {
  if (q.investigation) return markInvestigation(q, entries, raw);
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

/** Check a student-chosen set of independent locations/repairs in any discovery order.
 * Question errors contain { location, reason }; the final answer uses the shared exact marker.
 * Consequential locations are not authored errors and cannot earn independent-error credit.
 */
export function markInvestigation(question, entries, raw) {
  const answer = markAnswer(raw, question.answer);
  const unique = new Set(entries.map((entry) => entry.location)).size === entries.length;
  const details = entries.map((entry) => {
    const expected = question.errors.find((error) => error.location === entry.location);
    return {
      location: entry.location,
      locationCorrect: Boolean(expected),
      reasonCorrect: Boolean(expected && expected.reason === entry.reason),
    };
  });
  const missing = question.errors.some(
    (error) => !entries.some((entry) => entry.location === error.location),
  );
  const valid =
    answer.valid &&
    (!question.locations ||
      entries.every(
        (entry) =>
          question.locations.some((location) => location.id === entry.location) &&
          question.options.some((option) => option.id === entry.reason),
      ));
  return {
    valid,
    unique,
    correct:
      valid &&
      unique &&
      !missing &&
      answer.correct &&
      details.every((entry) => entry.reasonCorrect),
    answerCorrect: answer.correct,
    answerValid: answer.valid,
    missing,
    details,
  };
}
