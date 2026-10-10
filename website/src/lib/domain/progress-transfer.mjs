/**
 * Purpose: Validate portable learner records and serialize JSON backups or spreadsheet-safe CSV history.
 *
 * Main contents:
 * - exportProgress
 * - parseProgress
 * - importProgress
 * - exportCsv
 *
 * Used By: tests/progress.test.mjs, website/src/lib/components/progress/ProgressTransfer.svelte
 *
 * Uses: website/src/lib/domain/engine.mjs, website/src/lib/domain/practice-code.mjs.
 *
 * Libs: none.
 */
import { newTrack, profileKey, MAX_PAGE_SIZE } from './engine.mjs';
import { decodePracticeSet } from './practice-code.mjs';

const format = 'maths-practice-progress';
/**
 * Reject an invalid imported value with the standard non-destructive import error.
 * Parameter condition: required validation condition.
 * Used by: parseProgress.
 */
function requireValue(condition) {
  if (!condition) throw Error('Invalid progress file. No saved data has been changed.');
}
/**
 * Recognize non-array object values used in import validation.
 * Parameter value: new value to apply or validate.
 * Used by: parseProgress.
 */
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
/**
 * Recognize finite nonnegative numeric values used in import validation.
 * Parameter value: new value to apply or validate.
 * Used by: parseProgress.
 */
const number = (value) => Number.isFinite(value) && value >= 0;
/**
 * Recognize string values used in import validation.
 * Parameter value: new value to apply or validate.
 * Used by: parseProgress.
 */
const text = (value) => typeof value === 'string';
/**
 * Recognize supported challenge-level integers in an imported record.
 * Parameter value: new value to apply or validate.
 * Used by: parseProgress.
 */
const level = (value) => Number.isInteger(value) && value >= 0 && value < 4;

/**
 * Versioned learner progress, not executable state or incomplete answer drafts.
 * Serialize a learner's history, levels and revision records as a versioned JSON envelope.
 * Parameter profile: learner record.
 * Parameter now: current time in milliseconds or injected clock, as declared.
 * @example const json = exportProgress(profile);
 */
export function exportProgress(profile, now = Date.now()) {
  return JSON.stringify(
    {
      format,
      version: 2,
      practiceMeasuredFrom: profile.practiceMeasuredFrom,
      exportedAt: now,
      username: profile.name,
      backup: { since: profile.backup?.since ?? now, lastExportAt: now, lastExportType: 'json' },
      topics: Object.fromEntries(
        Object.entries(profile.topics).map(([key, value]) => [
          key,
          { tracks: value.tracks, history: value.history, practice: value.practice },
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
/**
 * Validate an untrusted JSON envelope and return a normalized learner record.
 * Parameter raw: untrusted input text.
 * Calls: requireValue, text, object, profileKey, level, newTrack, number, decodePracticeSet.
 * @example const learner = parseProgress(exportProgress(profile));
 */
export function parseProgress(raw) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    throw Error('This is not a valid JSON progress file.');
  }
  requireValue(
    value?.format === format &&
      [1, 2].includes(value.version) &&
      text(value.username) &&
      object(value.topics),
  );
  const name = value.username.trim(),
    key = profileKey(name);
  requireValue(key.length > 0 && key.length <= 40);
  const profile = { name, key, topics: {}, revision: { recommendations: [] } };
  if (value.practiceMeasuredFrom !== undefined) {
    requireValue(
      number(value.practiceMeasuredFrom) && value.practiceMeasuredFrom <= 8640000000000000,
    );
    profile.practiceMeasuredFrom = value.practiceMeasuredFrom;
  }
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
      if (clean.pageSize !== undefined)
        requireValue(clean.pageSize >= 1 && clean.pageSize <= MAX_PAGE_SIZE);
      result.history.push(clean);
    }
    if (saved.practice !== undefined) {
      requireValue(Array.isArray(saved.practice));
      const ids = new Set();
      result.practice = saved.practice.map((record) => {
        requireValue(
          object(record) &&
            text(record.id) &&
            record.id.length > 0 &&
            text(record.attempt) &&
            ['assessment', 'demo', 'scaffolded', 'plain', 'errors'].includes(record.type) &&
            number(record.at) &&
            record.at <= 8640000000000000 &&
            record.at % 3600000 === 0 &&
            Number.isInteger(record.milliseconds) &&
            record.milliseconds > 0 &&
            record.milliseconds <= 3600000,
        );
        const id = `${record.id}:${record.at}`;
        requireValue(!ids.has(id));
        ids.add(id);
        const { id: visit, at, attempt, type, milliseconds } = record;
        return { id: visit, at, attempt, type, milliseconds };
      });
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
/**
 * Insert or explicitly replace a learner record and make it current.
 * Parameter store: schema-2 learner store.
 * Parameter profile: learner record.
 * Parameter replace: explicit permission to replace a matching learner.
 */
export function importProgress(store, profile, replace = false) {
  const index = store.profiles.findIndex((item) => item.key === profile.key);
  if (index >= 0 && !replace)
    throw Error('This learner already has saved progress. Confirm replacement first.');
  if (index >= 0) store.profiles[index] = structuredClone(profile);
  else store.profiles.push(structuredClone(profile));
  store.last = profile.key;
}
/**
 * Serialize answer history with quoted fields and neutralized spreadsheet formula prefixes.
 * Parameter profile: learner record.
 * @example const csv = exportCsv(profile);
 */
export function exportCsv(profile) {
  // Quote every field and neutralise spreadsheet formula prefixes in user-controlled text.
  /**
   * Quote one CSV field and neutralize leading spreadsheet formula characters.
   * Parameter value: new value to apply or validate.
   */
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
