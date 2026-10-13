/**
 * Purpose: Aggregate topic success, UK weekly completion records and JSON backup status.
 *
 * Main contents:
 * - PROGRESS_POLICY
 * - topicProgress
 * - weekKey
 * - weeklyProgress
 * - EXPORT_REMINDER_DAYS
 * - backupStatus
 * - recordExport
 *
 * Used By: tests/progress.test.mjs, website/src/lib/application/session.mjs, website/src/lib/components/progress/ProgressTransfer.svelte, website/src/lib/domain/revision.mjs, website/src/routes/progress.html/+page.svelte
 *
 * Uses: website/src/lib/domain/engine.mjs, website/src/lib/domain/practice-code.mjs.
 *
 * Libs: none.
 */
import { success, scoringWindow } from './engine.mjs';
import { PAGE_TYPES } from './practice-code.mjs';

// Share the existing page-size-dependent success scheme; evidence counts never truncate history.
export const PROGRESS_POLICY = { minimum: 5, staleDays: 28, timezone: 'Europe/London' };
const weekFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: PROGRESS_POLICY.timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
/**
 * Average measured type rates, weighting independent practice twice; null means no evidence.
 * Parameter details: type/level evidence with mode and nullable rate; called by topicProgress.
 * @example weightedRate([{ mode: 'plain', rate: 60 }, { mode: 'errors', rate: 90 }]); // 70
 */
function weightedRate(details) {
  let total = 0,
    weights = 0;
  for (const item of details) {
    if (item.rate === null) continue;
    const weight = item.mode === 'plain' ? 2 : 1;
    total += item.rate * weight;
    weights += weight;
  }
  return weights ? total / weights : null;
}
/**
 * Aggregate available catalogue topics by challenge level and recommended-level revision priority.
 * Parameter profile: learner record.
 * Parameter catalogue: authored topic/page catalogue.
 * Parameter now: current epoch milliseconds.
 * @example const rows = topicProgress(profile, catalogue, Date.now());
 */
export function topicProgress(profile, catalogue, now = Date.now()) {
  return catalogue.topics
    .filter((topic) => !topic.aggregate)
    .map((topic) => {
      const key = `${catalogue.subject}:${topic.bank}`;
      const saved = profile.topics[key];
      const history = saved?.history ?? [];
      const assessment = history
        .filter((item) => item.type === 'assessment')
        .sort((a, b) => a.at - b.at);
      const grouped = new Map();
      for (const item of assessment) {
        if (!grouped.has(item.attempt)) grouped.set(item.attempt, []);
        grouped.get(item.attempt).push(item);
      }
      const attempts = [...grouped.values()];
      // The first complete assessment is the baseline; show partial evidence explicitly until then.
      const initial =
        attempts.find((items) => items.length >= (items[0]?.pageSize ?? 4)) ?? attempts[0] ?? [];
      const baseline = initial.length
        ? {
            answered: initial.length,
            correct: initial.filter((item) => item.correct).length,
            at: initial.at(-1).at,
            size: initial[0].pageSize ?? 4,
            complete: initial.length >= (initial[0].pageSize ?? 4),
          }
        : null;
      const levels = [...new Set(topic.pages.map((page) => page.level))].sort();
      const types = PAGE_TYPES.filter((type) => topic.pages.some((page) => page.type === type.id));
      /**
       * Calculate one question type/level's answer count, weighted success and stale/missing status.
       * Parameter type: question-type code or activity ID.
       * Parameter level: zero-based challenge level.
       * Calls: success.
       * @example detail(PAGE_TYPES[0], 1); // Independent-practice evidence at Build level.
       */
      const detail = (type, level) => {
        const records = history.filter((item) => item.type === type.mode && item.level === level);
        const eligible = records.filter((item) => !item.assisted || !item.correct);
        // Histories also support older stores without detailed per-question records.
        const outcomes = eligible.length
          ? eligible.map((item) => item.correct)
          : (saved?.tracks[type.mode]?.histories[level] ?? []);
        const count = outcomes.length;
        const size =
          records.at(-1)?.pageSize ??
          saved?.pages[type.mode]?.size ??
          (type.mode === 'errors' ? 3 : 10);
        const rate = count ? success(outcomes, scoringWindow(type.mode, size)) : null;
        const last = records.length ? Math.max(...records.map((item) => item.at)) : null;
        const stale = last !== null && now - last >= PROGRESS_POLICY.staleDays * 86400000;
        return {
          ...type,
          level,
          count,
          answered: records.length,
          rate,
          last,
          stale,
          missing: count < PROGRESS_POLICY.minimum,
        };
      };
      const stages = levels.map((level) => {
        const breakdown = types
          .filter((type) =>
            topic.pages.some((page) => page.type === type.id && page.level === level),
          )
          .map((type) => detail(type, level));
        return { level, rate: weightedRate(breakdown), breakdown };
      });
      const current = types.map((type) => detail(type, saved?.tracks[type.mode]?.level ?? 0));
      const missing = current.some((item) => item.missing);
      const rate = weightedRate(current);
      const last = history.length ? Math.max(...history.map((item) => item.at)) : null;
      return {
        key,
        topic,
        stages,
        current,
        total: history.length,
        baseline,
        last,
        rate,
        missing,
        stale: current.some((item) => item.stale),
        status: missing ? 'missing' : rate < 50 ? 'red' : rate < 75 ? 'amber' : 'green',
      };
    });
}

/**
 * Stable local calendar weeks, including UK daylight-saving boundaries.
 * Return the Monday date for a timestamp's UK calendar week.
 * Parameter timestamp: milliseconds since Unix epoch.
 * Calls: get.
 * Used by: weeklyProgress, practiceWeeks and practiceHistory.
 * @example weekKey(Date.UTC(2026, 9, 6)); // "2026-10-05".
 */
export function weekKey(timestamp) {
  const parts = weekFormatter.formatToParts(timestamp);
  /**
   * Read a numeric date part from the localized formatter result.
   * Parameter name: year, month or day from the localized date parts.
   * Used by: weekKey.
   */
  const get = (name) => Number(parts.find((part) => part.type === name).value);
  const date = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
/**
 * Count completed recommendations by UK week and return this week's total and personal best.
 * Parameter profile: learner record.
 * Parameter now: current epoch milliseconds.
 * Calls: weekKey.
 */
export function weeklyProgress(profile, now = Date.now()) {
  const weeks = {};
  for (const item of profile.revision?.recommendations ?? []) {
    if (item.completedAt == null) continue;
    const week = weekKey(item.completedAt);
    weeks[week] = (weeks[week] ?? 0) + 1;
  }
  return { weeks, current: weeks[weekKey(now)] ?? 0, best: Math.max(0, ...Object.values(weeks)) };
}

export const EXPORT_REMINDER_DAYS = 10;
/**
 * Old learners use their first recorded activity; new learners start a persisted clock.
 * Derive the learner's last JSON backup and whether the reminder interval has elapsed.
 * Parameter profile: learner record.
 * Parameter now: current epoch milliseconds.
 * Used by: recordExport.
 * @example if (backupStatus(profile)?.due) showBackupReminder();
 */
export function backupStatus(profile, now = Date.now()) {
  if (!profile) return null;
  let since = profile.backup?.since;
  if (since == null) {
    since = now;
    for (const topic of Object.values(profile.topics))
      for (const item of topic.history) since = Math.min(since, item.at);
  }
  const lastExportAt =
    profile.backup?.lastExportType === 'json' ? profile.backup.lastExportAt : null;
  return {
    since,
    lastExportAt,
    lastExportType: profile.backup?.lastExportType ?? null,
    due: now - (lastExportAt ?? since) >= EXPORT_REMINDER_DAYS * 86400000,
  };
}
/**
 * Record a JSON download trigger; ignore CSV for backup-reminder timing.
 * Parameter profile: learner record.
 * Parameter kind: JSON or CSV export format.
 * Parameter now: current epoch milliseconds.
 * Calls: backupStatus.
 */
export function recordExport(profile, kind, now = Date.now()) {
  if (kind !== 'json') return;
  profile.backup = {
    since: backupStatus(profile, now).since,
    lastExportAt: now,
    lastExportType: kind,
  };
}
