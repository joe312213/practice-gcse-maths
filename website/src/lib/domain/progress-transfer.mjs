import { newTrack, profileKey } from './engine.mjs';
import { decodePracticeSet } from './practice-code.mjs';

const format = 'maths-practice-progress';
function requireValue(condition) {
  if (!condition) throw Error('Invalid progress file. No saved data has been changed.');
}
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const number = (value) => Number.isFinite(value) && value >= 0;
const text = (value) => typeof value === 'string';
const level = (value) => Number.isInteger(value) && value >= 0 && value < 4;

/** Versioned learner progress, not executable state or incomplete answer drafts. */
export function exportProgress(profile, now = Date.now()) {
  return JSON.stringify(
    {
      format,
      version: 1,
      exportedAt: now,
      username: profile.name,
      backup: { since: profile.backup?.since ?? now, lastExportAt: now, lastExportType: 'json' },
      topics: Object.fromEntries(
        Object.entries(profile.topics).map(([key, value]) => [
          key,
          { tracks: value.tracks, history: value.history },
        ]),
      ),
      revision: {
        recommendations: (profile.revision?.recommendations ?? []).map(
          ({ savedAttempt, ...record }) => record,
        ),
      },
    },
    null,
    2,
  );
}
export function parseProgress(raw) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw Error('This is not a valid JSON progress file.');
  }
  requireValue(
    value?.format === format && value.version === 1 && text(value.username) && object(value.topics),
  );
  const name = value.username.trim(),
    key = profileKey(name);
  requireValue(key.length > 0 && key.length <= 40);
  const profile = { name, key, topics: {}, revision: { recommendations: [] } };
  for (const [topic, saved] of Object.entries(value.topics)) {
    requireValue(
      /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(topic) &&
        object(saved) &&
        object(saved.tracks) &&
        Array.isArray(saved.history),
    );
    const result = { tracks: {}, pages: {}, history: [] };
    for (const [mode, track] of Object.entries(saved.tracks)) {
      requireValue(
        ['plain', 'errors', 'scaffolded', 'assessment', 'mixed', 'problem'].includes(mode) &&
          object(track) &&
          level(track.level) &&
          Array.isArray(track.histories) &&
          track.histories.length >= 3 &&
          track.histories.length <= 4,
      );
      requireValue(
        track.histories.every(
          (items) =>
            Array.isArray(items) &&
            items.length <= 10 &&
            items.every((item) => typeof item === 'boolean'),
        ),
      );
      const clean = newTrack(track.level);
      clean.histories = structuredClone(track.histories);
      for (const field of ['reassess', 'lowerCount', 'shortStreak']) {
        requireValue(Number.isInteger(track[field]) && track[field] >= 0);
        clean[field] = track[field];
      }
      requireValue(track.lowerLevel === null || level(track.lowerLevel));
      clean.lowerLevel = track.lowerLevel;
      if (track.manual !== undefined) {
        requireValue(typeof track.manual === 'boolean');
        clean.manual = track.manual;
      }
      result.tracks[mode] = clean;
    }
    for (const record of saved.history) {
      requireValue(
        object(record) &&
          text(record.question) &&
          text(record.attempt) &&
          text(record.type) &&
          level(record.level) &&
          typeof record.correct === 'boolean' &&
          typeof record.assisted === 'boolean' &&
          number(record.at) &&
          record.at <= 8640000000000000,
      );
      const clean = {};
      for (const field of ['question', 'attempt', 'type', 'level', 'correct', 'assisted', 'at'])
        clean[field] = record[field];
      for (const field of ['revision', 'practiceCode'])
        if (record[field] !== undefined) {
          requireValue(text(record[field]));
          clean[field] = record[field];
        }
      for (const field of ['practicePage', 'authoredSlot', 'pageSize'])
        if (record[field] !== undefined) {
          requireValue(Number.isInteger(record[field]) && record[field] >= 0);
          clean[field] = record[field];
        }
      if (clean.pageSize !== undefined) requireValue(clean.pageSize >= 1 && clean.pageSize <= 10);
      result.history.push(clean);
    }
    profile.topics[topic] = result;
  }
  requireValue(object(value.revision) && Array.isArray(value.revision.recommendations));
  const ids = new Set();
  for (const item of value.revision.recommendations) {
    requireValue(
      object(item) &&
        text(item.id) &&
        item.id.length > 0 &&
        !ids.has(item.id) &&
        text(item.code) &&
        number(item.createdAt),
    );
    const config = decodePracticeSet(item.code);
    requireValue(config.pages.length === 4);
    ids.add(item.id);
    for (const field of ['openedAt', 'completedAt'])
      requireValue(
        item[field] === null ||
          (number(item[field]) && item[field] <= 8640000000000000 && item[field] >= item.createdAt),
      );
    requireValue(
      item.completedAt === null || (item.openedAt !== null && item.completedAt >= item.openedAt),
    );
    requireValue(
      Array.isArray(item.reasons) &&
        item.reasons.length === 4 &&
        item.reasons.every(
          (reason) =>
            object(reason) &&
            Number.isInteger(reason.topic) &&
            Number.isInteger(reason.type) &&
            text(reason.reason),
        ),
    );
    profile.revision.recommendations.push({
      id: item.id,
      code: item.code,
      createdAt: item.createdAt,
      openedAt: item.openedAt,
      completedAt: item.completedAt,
      reasons: item.reasons.map(({ topic, type, reason }) => ({ topic, type, reason })),
    });
  }
  if (value.backup !== undefined) {
    requireValue(
      object(value.backup) &&
        number(value.backup.since) &&
        number(value.backup.lastExportAt) &&
        value.backup.lastExportAt <= 8640000000000000 &&
        ['json', 'csv'].includes(value.backup.lastExportType),
    );
    profile.backup = {
      since: value.backup.since,
      lastExportAt: value.backup.lastExportAt,
      lastExportType: value.backup.lastExportType,
    };
  } else if (number(value.exportedAt))
    profile.backup = {
      since: value.exportedAt,
      lastExportAt: value.exportedAt,
      lastExportType: 'json',
    };
  return profile;
}
export function importProgress(store, profile, replace = false) {
  const index = store.profiles.findIndex((item) => item.key === profile.key);
  if (index >= 0 && !replace)
    throw Error('This learner already has saved progress. Confirm replacement first.');
  if (index >= 0) store.profiles[index] = structuredClone(profile);
  else store.profiles.push(structuredClone(profile));
  store.last = profile.key;
}
export function exportCsv(profile) {
  // Quote every field and neutralise spreadsheet formula prefixes in user-controlled text.
  const cell = (value) => {
    let str = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(str)) str = `'${str}`;
    return `"${str.replaceAll('"', '""')}"`;
  };
  const rows = [
    [
      'username',
      'topic',
      'question_type',
      'challenge_level',
      'question',
      'correct',
      'assisted',
      'answered_at',
      'attempt',
    ],
  ];
  for (const [topic, saved] of Object.entries(profile.topics))
    for (const item of saved.history)
      rows.push([
        profile.name,
        topic,
        item.type,
        item.level,
        item.question,
        item.correct,
        item.assisted,
        new Date(item.at).toISOString(),
        item.attempt,
      ]);
  return rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
