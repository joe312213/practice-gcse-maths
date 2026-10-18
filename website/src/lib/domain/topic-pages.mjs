/**
 * Purpose: Authored bank order defines distinct full pages within each topic, stage and level.
 *
 * Main contents:
 * - TOPIC_PAGE_SIZES, findQuestion, topicPages, assessmentPage, discardRetiredAttempts.
 *
 * Used By: tests/draft-topics.test.mjs, tests/error-investigation.test.mjs,
 * tests/topic-pages.test.mjs, website/src/lib/application/session.mjs,
 * website/src/lib/components/practice/PracticeActivity.svelte,
 * website/src/lib/components/practice/QuestionList.svelte,
 * website/src/lib/components/practice/TopicPractice.svelte.
 *
 * Uses: ../content/topic-runtime.mjs for selected-question expansion.
 *
 * Libs: none.
 */
import { resolveQuestion } from '../content/topic-runtime.mjs';

export const TOPIC_PAGE_SIZES = { plain: 12, scaffolded: 4, errors: 4, problem: 6 };

/** Historical records can resolve retired IDs; retired definitions never enter new draws. */
export function findQuestion(bank, id) {
  return resolveQuestion(
    bank.questions.find((q) => q.id === id) ?? bank.retiredQuestions?.find((q) => q.id === id),
  );
}

/** Group a bank’s authored questions into ordered pages for the supplied activity mode and level. Called by ordinary session navigation; stable IDs preserve page identity. */
export function topicPages(bank, mode, level) {
  const size = TOPIC_PAGE_SIZES[mode];
  if (!size) return [];
  const ids = bank.questions.filter((q) => q.type === mode && q.level === level).map((q) => q.id);
  return Array.from({ length: Math.ceil(ids.length / size) }, (_, index) =>
    ids.slice(index * size, (index + 1) * size),
  );
}

/** Sample two independent tasks per level; exclude older arithmetic whose labels overstate difficulty. */
export function assessmentPage(bank, random = Math.random) {
  return [0, 1, 2].flatMap((level) => {
    const candidates = bank.questions.filter((q) => {
      if (q.type !== 'plain' || q.level !== level) return false;
      if (bank.method === 'lattice') {
        const digits = [String(q.a).length, String(q.b).length];
        return level === 0
          ? digits[0] === 2 && digits[1] === 1
          : level === 1
            ? digits.every((n) => n === 2)
            : digits.every((n) => n >= 3) && digits.includes(4);
      }
      if (bank.method === 'bus') {
        if (level === 0) return [...String(q.a)].every((digit) => Number(digit) % q.b === 0);
        if (level === 1)
          return q.b < 10 && [...String(q.a)].some((digit) => Number(digit) % q.b !== 0);
        return q.a >= 1000 && q.b >= 10;
      }
      return true;
    });
    if (candidates.length < 2)
      throw Error('Assessment needs two suitable questions at every level.');
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    return candidates.slice(0, 2);
  });
}

/** Replace retired page content on load. The user prioritises the current UI over old attempt fidelity.
 * Recorded answer history/tracks stay intact; current question pages are never reset.
 */
export function discardRetiredAttempts(data, banks) {
  const retired = new Set(banks.flatMap((bank) => (bank.retiredQuestions ?? []).map((q) => q.id)));
  const outdated = (attempt) => attempt?.items.some((item) => retired.has(item.id));
  let changed = false;
  function resetSet(run) {
    if (!run?.attempts.some(outdated)) return;
    run.attempts = run.attempts.map((attempt) => (outdated(attempt) ? null : attempt));
    if (run.finished === 'complete') run.finished = null;
    changed = true;
  }
  for (const profile of data.profiles) {
    for (const topic of Object.values(profile.topics)) {
      for (const [mode, attempt] of Object.entries(topic.pages ?? {}))
        if (outdated(attempt)) {
          delete topic.pages[mode];
          changed = true;
        }
      for (const levels of Object.values(topic.practicePages ?? {}))
        for (const group of Object.values(levels)) {
          if (!group.attempts.some(outdated)) continue;
          group.attempts = group.attempts.map((attempt) => (outdated(attempt) ? null : attempt));
          changed = true;
        }
      for (const visits of Object.values(topic.pageHistory ?? {}))
        for (const direction of ['previous', 'next']) {
          if (!visits[direction].some(outdated)) continue;
          visits[direction] = visits[direction].filter((attempt) => !outdated(attempt));
          changed = true;
        }
    }
    resetSet(profile.practiceSet);
    for (const recommendation of profile.revision?.recommendations ?? [])
      resetSet(recommendation.savedAttempt);
  }
  return changed;
}
