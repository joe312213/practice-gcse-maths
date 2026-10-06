import { success } from './engine.mjs';
import { PAGE_TYPES } from './practice-code.mjs';

// Share the existing page-size-dependent success scheme; evidence counts never truncate history.
export const PROGRESS_POLICY = { minimum: 5, staleDays: 28, timezone: 'Europe/London' };
export function topicProgress(profile, catalogue, now = Date.now()) {
  return catalogue.topics.map((topic) => {
    const key = `${catalogue.subject}:${topic.bank}`;
    const saved = profile.topics[key];
    const history = saved?.history ?? [];
    const levels = [...new Set(topic.pages.map((page) => page.level))].sort();
    const types = PAGE_TYPES.filter((type) => topic.pages.some((page) => page.type === type.id));
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
      const rate = count ? success(outcomes, size) : null;
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
        .filter((type) => topic.pages.some((page) => page.type === type.id && page.level === level))
        .map((type) => detail(type, level));
      const measured = breakdown.filter((item) => item.rate !== null);
      const weight = (item) => (item.mode === 'plain' ? 2 : 1);
      const rate = measured.length
        ? measured.reduce((sum, item) => sum + item.rate * weight(item), 0) /
          measured.reduce((sum, item) => sum + weight(item), 0)
        : null;
      return { level, rate, breakdown };
    });
    const current = types.map((type) => detail(type, saved?.tracks[type.mode]?.level ?? 0));
    const missing = current.some((item) => item.missing);
    const measured = current.filter((item) => item.rate !== null);
    const rate = measured.length
      ? measured.reduce((sum, item) => sum + item.rate * (item.mode === 'plain' ? 2 : 1), 0) /
        measured.reduce((sum, item) => sum + (item.mode === 'plain' ? 2 : 1), 0)
      : null;
    const last = history.length ? Math.max(...history.map((item) => item.at)) : null;
    return {
      key,
      topic,
      stages,
      current,
      total: history.length,
      last,
      rate,
      missing,
      stale: current.some((item) => item.stale),
      status: missing ? 'missing' : rate < 50 ? 'red' : rate < 75 ? 'amber' : 'green',
    };
  });
}

/** Stable local calendar weeks, including UK daylight-saving boundaries. */
export function weekKey(timestamp) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PROGRESS_POLICY.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(timestamp);
  const get = (name) => Number(parts.find((part) => part.type === name).value);
  const date = new Date(Date.UTC(get('year'), get('month') - 1, get('day')));
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}
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
/** Old learners use their first recorded activity; new learners start a persisted clock. */
export function backupStatus(profile, now = Date.now()) {
  if (!profile) return null;
  const first = Object.values(profile.topics)
    .flatMap((topic) => topic.history)
    .reduce((earliest, item) => Math.min(earliest, item.at), now);
  const since = profile.backup?.since ?? first;
  const lastExportAt =
    profile.backup?.lastExportType === 'json' ? profile.backup.lastExportAt : null;
  return {
    since,
    lastExportAt,
    lastExportType: profile.backup?.lastExportType ?? null,
    due: now - (lastExportAt ?? since) >= EXPORT_REMINDER_DAYS * 86400000,
  };
}
export function recordExport(profile, kind, now = Date.now()) {
  if (kind !== 'json') return;
  profile.backup = {
    since: backupStatus(profile, now).since,
    lastExportAt: now,
    lastExportType: kind,
  };
}
