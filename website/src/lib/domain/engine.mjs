/**
 * Purpose: Implement exact answer parsing and weighted adaptive challenge progression.
 *
 * Main contents:
 * - LEVELS
 * - weights
 * - success
 * - newTrack
 * - newPage
 * - manualLevel
 * - submit
 * - resolveChoice
 * - rational
 * - markAnswer
 * - profileKey
 * - distance
 *
 * Used By: tests/progress.test.mjs, tests/website.test.mjs, website/scripts/validate-bank.mjs, website/src/lib/application/session.mjs, website/src/lib/components/practice/PracticeActivity.svelte, website/src/lib/components/practice/Progress.svelte, website/src/lib/components/practice/QuestionList.svelte, website/src/lib/components/teaching/DemoPlayer.svelte, website/src/lib/domain/errors.mjs, website/src/lib/domain/profiles.mjs, website/src/lib/domain/progress-transfer.mjs, website/src/lib/domain/progress.mjs
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
// Maths progression is independent of DOM/content, so transitions can be checked directly.
export const LEVELS = ['Start', 'Build', 'Confidence'];
/**
 * Return scoring weights for a supported page size from one to ten.
 * Parameter size: question-page length.
 * Used by: success.
 */
export function weights(size = 10) {
  if (!Number.isInteger(size) || size < 1 || size > 10) throw Error('Page length must be 1–10.');
  return Array.from({ length: size }, (_, i) =>
    size === 10 ? (i >= 7 ? 3 : i >= 5 ? 2 : 1) : size >= 5 && i >= size - 3 ? 2 : 1,
  );
}
/**
 * Compute weighted recent success, padding insufficient history with unsuccessful outcomes.
 * Parameter history: ordered correctness outcomes.
 * Parameter size: question-page length.
 * Calls: weights.
 * Used by: submit.
 */
export function success(history = [], size = 10) {
  const w = weights(size),
    values = [...Array(size).fill(false), ...history].slice(-size);
  return (100 * w.reduce((s, n, i) => s + n * Number(values[i]), 0)) / w.reduce((a, b) => a + b, 0);
}
/**
 * Create adaptive history and reassessment state at the requested level.
 * Parameter level: zero-based challenge level.
 */
export function newTrack(level = 0) {
  return {
    level,
    histories: [[], [], []],
    reassess: 0,
    lowerCount: 0,
    lowerLevel: null,
    shortStreak: 0,
  };
}
/**
 * Create an unanswered page with the requested size and level.
 * Parameter size: question-page length.
 * Parameter level: zero-based challenge level.
 */
export function newPage(size = 10, level = 0) {
  return {
    size,
    level,
    count: 0,
    results: {},
    trial: null,
    pendingChoice: false,
    reverted: false,
    afterRevert: 0,
    streak: 0,
    notice: '',
    complete: false,
  };
}
/**
 * Validate and apply a manual level choice, resetting trial/reassessment state as needed.
 * Parameter track: mutable adaptive track.
 * Parameter page: mutable question-page state.
 * Parameter level: zero-based challenge level.
 */
export function manualLevel(track, page, level) {
  if (!Number.isInteger(level) || level < 0 || level > 2) throw Error('Unknown challenge level.');
  if (page.trial || page.pendingChoice) throw Error('Finish the current challenge trial first.');
  page.level = level;
  track.lowerCount = 0;
  track.lowerLevel = null;
  if (level > track.level) {
    track.level = level;
    track.manual = true;
  }
}
/**
 * Record one eligible outcome and apply reassessment, promotion or demotion rules without double counting.
 * Parameter track: mutable adaptive track.
 * Parameter page: mutable question-page state.
 * Parameter id: stable question/job identifier.
 * Parameter level: zero-based challenge level.
 * Parameter correct: whether the outcome is correct.
 * Parameter assisted: whether help was used.
 * Calls: success.
 * @example submit(track, page, { id, level, correct, assisted });
 */
export function submit(track, page, { id, level, correct, assisted = false }) {
  if (page.complete || Object.hasOwn(page.results, id)) return { duplicate: true };
  if (level !== page.level) throw Error('Question level does not match the current page.');
  const eligible = !assisted || !correct;
  page.results[id] = { level, correct, assisted };
  page.count++;
  if (eligible) {
    track.histories[level].push(Boolean(correct));
    track.histories[level] = track.histories[level].slice(-10);
  }
  page.streak = correct && !assisted ? page.streak + 1 : 0;
  page.notice = page.streak >= 3 ? `Well done, ${page.streak} question streak!` : '';
  if (level < track.level) {
    track.lowerCount = track.lowerLevel === level ? track.lowerCount + 1 : 1;
    track.lowerLevel = level;
    if (track.lowerCount >= 2) {
      track.level = level;
      track.lowerCount = 0;
      page.notice = `Your recommended level is now ${LEVELS[level]}.`;
    }
  } else {
    track.lowerCount = 0;
    track.lowerLevel = null;
  }
  if (page.trial) {
    if (!correct) {
      const from = page.trial.from;
      track.level = from;
      page.level = from;
      page.trial = null;
      page.reverted = true;
      page.afterRevert = 0;
      track.reassess = page.size <= 2 ? 3 : Math.min(5, page.size);
      page.notice =
        'You have returned to your previous level. Keep practising; the next page starts with a short reassessment.';
    } else if (!assisted) page.trial.passed++;
  } else if (page.reverted) {
    page.afterRevert = correct && !assisted ? page.afterRevert + 1 : 0;
    if (page.afterRevert >= 5) track.reassess = 0;
  } else if (eligible && level === track.level && track.reassess > 0) track.reassess--;
  const atRecommended = page.level === track.level;
  if (!page.trial && atRecommended)
    track.shortStreak = correct && !assisted ? track.shortStreak + 1 : 0;
  const rate = success(track.histories[track.level], page.size);
  const allPerfect = Object.values(page.results).every(
    (r) => r.correct && !r.assisted && r.level === track.level,
  );
  const shortReady =
    page.size < 5 &&
    page.count === page.size &&
    allPerfect &&
    (page.size >= 3 || track.shortStreak >= 3);
  const canAdvance =
    atRecommended &&
    track.level < 2 &&
    track.reassess === 0 &&
    (!page.reverted || page.afterRevert >= 5);
  if (
    !page.trial &&
    canAdvance &&
    correct &&
    !assisted &&
    ((page.count >= 5 && rate > 75) || shortReady)
  ) {
    page.trial = { from: track.level, to: track.level + 1, passed: 0 };
    page.level = track.level + 1;
    page.notice = 'Congratulations! Try some more challenging questions.';
  }
  page.complete = page.count === page.size;
  if (page.complete && page.trial) {
    if (page.trial.passed >= 2) {
      track.level = page.trial.to;
      track.shortStreak = 0;
      page.trial = null;
      page.notice = `Well done! ${LEVELS[track.level]} is now your recommended level.`;
    } else {
      page.pendingChoice = true;
      page.notice = 'Would you like to try harder questions of this type next time?';
    }
  }
  if (!page.trial && !page.reverted && page.count >= Math.min(5, page.size) && rate < 50) {
    page.notice =
      track.level === 0
        ? 'A method recap could help. Try the worked example before your next question.'
        : 'You could try a lower level for a little more practice.';
  }
  return { rate, eligible, level: page.level, notice: page.notice };
}
/**
 * Resolve the pending level trial without recording another question outcome.
 * Parameter track: mutable adaptive track.
 * Parameter page: mutable question-page state.
 * Parameter accept: learner acceptance of the offered promotion.
 */
export function resolveChoice(track, page, accept) {
  if (!page.pendingChoice) return;
  track.level = accept ? page.trial.to : page.trial.from;
  page.level = track.level;
  page.pendingChoice = false;
  page.trial = null;
  track.shortStreak = 0;
  page.notice = accept
    ? `Next time: ${LEVELS[track.level]}.`
    : 'Keep practising at your current level.';
}

// Restricted exact rational grammar, never eval or Function. Handles x=, decimals,
// simple fractions and mixed numbers without floating-point tolerance.
/**
 * Parse integer, decimal, fraction or mixed-number input into exact integer numerator/denominator values.
 * Parameter raw: untrusted input text.
 * Calls: decimal.
 * Used by: markAnswer.
 * @example rational("1 1/2"); // Same value as 1.5.
 */
export function rational(raw) {
  let value = String(raw)
    .trim()
    .replace(/−/g, '-')
    .replace(/^x\s*=\s*/i, '');
  if (value.length > 80) return null;
  if (/^[+-]?\d{1,3}(,\d{3})+(?:\.\d+)?$/.test(value)) value = value.replaceAll(',', '');
  const mixed = /^([+-]?)(\d+)\s+(\d+)\/(\d+)$/.exec(value);
  if (mixed) {
    const d = BigInt(mixed[4]);
    if (!d) return null;
    return [(mixed[1] === '-' ? -1n : 1n) * (BigInt(mixed[2]) * d + BigInt(mixed[3])), d];
  }
  /**
   * Parse decimal text into an exact rational pair, returning null for invalid syntax.
   * Parameter s: numeric input text.
   * Used by: rational.
   */
  const decimal = (s) => {
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) return null;
    const sign = s[0] === '-' ? -1n : 1n;
    s = s.replace(/^[+-]/, '');
    const [a, b = ''] = s.split('.');
    return [sign * BigInt((a || '0') + b), 10n ** BigInt(b.length)];
  };
  const parts = value.split('/').map((s) => s.trim());
  if (parts.length > 2) return null;
  const a = decimal(parts[0]),
    b = parts.length === 2 ? decimal(parts[1]) : [1n, 1n];
  if (!a || !b || b[0] === 0n) return null;
  return [a[0] * b[1], a[1] * b[0]];
}
/**
 * Compare parsed learner and expected answers by exact cross multiplication.
 * Parameter raw: untrusted input text.
 * Parameter expected: authored expected answer.
 * Calls: rational.
 */
export function markAnswer(raw, expected) {
  const remainder = /^(\d+)\s*r\s*(\d+)$/i.exec(String(expected).trim());
  if (remainder) {
    const entered = /^(\d+)\s*(?:r|remainder)\s*(\d+)$/i.exec(String(raw).trim());
    return {
      valid: Boolean(entered),
      correct: Boolean(
        entered &&
        BigInt(entered[1]) === BigInt(remainder[1]) &&
        BigInt(entered[2]) === BigInt(remainder[2]),
      ),
    };
  }
  const a = rational(raw),
    b = rational(expected);
  return { valid: Boolean(a && b), correct: Boolean(a && b && a[0] * b[1] === b[0] * a[1]) };
}
/**
 * Normalize a learner name into a stable case-insensitive local identity key.
 * Parameter name: learner name or requested field name.
 * Used by: distance.
 */
export const profileKey = (name) =>
  String(name).normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-GB');
/**
 * Compute edit distance between normalized learner names for similar-name suggestions.
 * Parameter a: first normalized name or operand.
 * Parameter b: second normalized name or operand.
 * Calls: profileKey.
 */
export function distance(a, b) {
  a = profileKey(a);
  b = profileKey(b);
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const row = [i + 1];
    for (let j = 0; j < b.length; j++)
      row.push(Math.min(row[j] + 1, prev[j + 1] + 1, prev[j] + Number(a[i] !== b[j])));
    prev = row;
  }
  return prev[b.length];
}
