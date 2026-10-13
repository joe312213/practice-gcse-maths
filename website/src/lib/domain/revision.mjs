/**
 * Purpose: Maintain pending revision recommendations and credit completed recommended sets once.
 *
 * Main contents:
 * - REVISION_POLICY
 * - maintainRecommendations
 * - completeRecommendation
 *
 * Used By: tests/progress.test.mjs, website/src/lib/application/session.mjs, website/src/routes/progress.html/+page.svelte
 *
 * Uses: website/src/lib/domain/progress.mjs, website/src/lib/domain/practice-code.mjs.
 *
 * Libs: none.
 */
import { topicProgress, weeklyProgress } from './progress.mjs';
import { encodePracticeSet } from './practice-code.mjs';
export const REVISION_POLICY = { pending: 3, weeklyAutomaticLimit: 15 };

/**
 * Fill empty recommendation places on Progress load; never discard unfinished/completed records.
 * Fill pending revision slots from ranked evidence unless the automatic weekly limit is reached.
 * Parameter profile: learner record.
 * Parameter catalogue: authored topic/page catalogue.
 * Parameter now: current epoch milliseconds.
 * Parameter uuid: injected identifier factory.
 * Parameter requested: explicit request to generate recommendations beyond the automatic limit.
 * Calls: weeklyProgress, topicProgress, encodePracticeSet.
 * @example maintainRecommendations(profile, catalogue, Date.now(), makeId, true);
 */
export function maintainRecommendations(
  profile,
  catalogue,
  now = Date.now(),
  uuid = () => crypto.randomUUID(),
  requested = false,
) {
  profile.revision ??= { recommendations: [] };
  const list = profile.revision.recommendations;
  const pending = list.filter((item) => item.completedAt == null).length;
  if (
    pending >= REVISION_POLICY.pending ||
    (!requested && weeklyProgress(profile, now).current >= REVISION_POLICY.weeklyAutomaticLimit)
  )
    return list;
  const all = topicProgress(profile, catalogue, now).flatMap((row) =>
    row.current.map((item) => ({ ...item, topic: row.topic.code })),
  );
  let candidates = all.filter((item) => item.missing || item.rate < 75 || item.stale);
  if (!candidates.length && requested) candidates = all;
  candidates.sort(
    (a, b) =>
      priority(a) - priority(b) ||
      (a.rate ?? 0) - (b.rate ?? 0) ||
      (a.last ?? 0) - (b.last ?? 0) ||
      a.topic - b.topic ||
      a.id - b.id,
  );
  if (!candidates.length) return list;
  for (let index = pending; index < REVISION_POLICY.pending; index++) {
    const chosen = Array.from(
      { length: 4 },
      (_, slot) => candidates[(index * 4 + slot) % candidates.length],
    );
    const pages = chosen.map((item) => ({ topic: item.topic, type: item.id, slot: 0 }));
    list.push({
      id: uuid(),
      code: encodePracticeSet({ pages, level: 0, timing: 0 }),
      createdAt: now,
      reasons: chosen.map((item) => ({
        topic: item.topic,
        type: item.id,
        reason: item.missing
          ? 'Missing data'
          : item.rate < 75
            ? 'Recent success below 75%'
            : item.stale
              ? 'Stale data'
              : 'Skills check',
      })),
      openedAt: null,
      completedAt: null,
    });
  }
  return list;
}
/**
 * Rank missing evidence first, then weak success, then stale evidence.
 * Parameter item: question-type evidence record.
 */
function priority(item) {
  return item.missing ? 0 : item.rate < 75 ? 1 : 2;
}

// Teaching defaults, not measured population statistics. Learner evidence gradually replaces them.
const initialPriority = {
  M10: 0.95,
  M13: 0.9,
  M15: 0.85,
  M04: 0.8,
  M06: 0.7,
  M03: 0.6,
  M02: 0.5,
  M01: 0.4,
};

/** Blend the existing missing/weak/stale revision policy with a teaching prior over twenty eligible answers. */
export function topicPriority(row) {
  const prior = initialPriority[row.topic.bank] ?? 0.65;
  const count = row.current.reduce((sum, item) => sum + item.count, 0);
  const evidence = Math.min(1, count / 20);
  const urgency = row.current.length
    ? Math.max(
        ...row.current.map(
          (item) => (3 - priority(item) - (item.rate ?? 0) / 100 + (item.stale ? 0.25 : 0)) / 3,
        ),
      )
    : prior;
  return prior * (1 - evidence) + urgency * evidence;
}

/** Match every entered term anywhere in the title; sort without changing the source/prerequisite order. */
export function discoverTopics(topics, query, order, rows = []) {
  const terms = query.toLocaleLowerCase('en-GB').trim().split(/\s+/).filter(Boolean);
  const scores = new Map(rows.map((row) => [row.topic.bank, topicPriority(row)]));
  return topics
    .filter((topic) => terms.every((term) => topic.title.toLocaleLowerCase('en-GB').includes(term)))
    .sort(
      (a, b) =>
        (order === 'a-z'
          ? 0
          : (scores.get(b.bank) ?? initialPriority[b.bank] ?? 0.65) -
            (scores.get(a.bank) ?? initialPriority[a.bank] ?? 0.65)) ||
        a.title.localeCompare(b.title, 'en-GB'),
    );
}
/**
 * Credit a fully completed recommendation once; ignore expired or ordinary sets.
 * Parameter profile: learner record.
 * Parameter run: practice-set attempt.
 * Parameter now: current epoch milliseconds.
 */
export function completeRecommendation(profile, run, now) {
  if (!run?.recommendationId || run.finished !== 'complete') return false;
  const item = profile.revision?.recommendations.find((item) => item.id === run.recommendationId);
  if (!item || item.completedAt != null) return false;
  item.completedAt = now;
  return true;
}
