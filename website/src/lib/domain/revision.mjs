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
 * Parameter now: current time in milliseconds or injected clock, as declared.
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
/**
 * Credit a fully completed recommendation once; ignore expired or ordinary sets.
 * Parameter profile: learner record.
 * Parameter run: practice-set attempt.
 * Parameter now: current time in milliseconds or injected clock, as declared.
 */
export function completeRecommendation(profile, run, now) {
  if (!run?.recommendationId || run.finished !== 'complete') return false;
  const item = profile.revision?.recommendations.find((item) => item.id === run.recommendationId);
  if (!item || item.completedAt != null) return false;
  item.completedAt = now;
  return true;
}
