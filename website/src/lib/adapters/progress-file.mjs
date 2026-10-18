/**
 * Purpose: Adapt portable learner progress to browser file/folder handles, downloads and
 * IndexedDB handle storage. Permission checks, fingerprints and per-file locks prevent silent
 * replacement of conflicting progress.
 *
 * Main contents:
 * - readProgressFile, progressContentFingerprint, newerLinkedProgress, saveProgressFile,
 *   withProgressFileLock, progressFileLink, chooseProgressFile, learnerFileLink,
 *   downloadProgressFile.
 *
 * Used By: tests/progress-autosave.test.mjs, tests/progress-file.test.mjs,
 * website/scripts/audit-progress-concurrency.mjs,
 * website/src/lib/adapters/progress-autosave.mjs,
 * website/src/lib/components/practice/TopicPractice.svelte,
 * website/src/lib/components/progress/OneDriveReminder.svelte,
 * website/src/lib/components/progress/ProfileManagement.svelte.
 *
 * Uses: website/src/lib/adapters/progress-ownership.mjs, website/src/lib/domain/profiles.mjs,
 * website/src/lib/domain/progress-transfer.mjs.
 *
 * Libs: none.
 */
import { progressTask } from './progress-ownership.mjs';

import { progressFilename } from '../domain/profiles.mjs';
import { exportProgress, exportCsv, parseProgress } from '../domain/progress-transfer.mjs';
const limit = 10 * 1024 * 1024;
/** Read a size-limited file handle and fingerprint its text for conflict review; callers validate its JSON. Called by import/autosave flows; never writes the file. */
export async function readProgressFile(handle) {
  const file = await handle.getFile();
  if (file.size > limit) throw Error('Choose a progress file smaller than 10 MB.');
  const raw = await file.text();
  return { raw, fingerprint: await fingerprint(raw) };
}
/** Hash serialised file content for change detection. Called by progress-file reads/writes; matching hashes compare content, not learner authentication. */
async function fingerprint(raw) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
/** Ignore export bookkeeping, and object key order, when detecting actual progress changes. */
export async function progressContentFingerprint(raw) {
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!['maths-practice-progress', 'practice-progress'].includes(value?.format)) return null;
  // Compare equivalent old/new envelopes without hiding unvalidated external changes.
  if (value.format === 'maths-practice-progress' && [1, 2].includes(value.version)) {
    const { topics, revision, practiceMeasuredFrom, ...shared } = value;
    value = {
      ...shared,
      format: 'practice-progress',
      version: 3,
      subjects: {
        maths: {
          topics,
          revision,
          ...(practiceMeasuredFrom === undefined ? {} : { practiceMeasuredFrom }),
        },
      },
    };
  }
  const { exportedAt, backup, progressUpdatedAt, ...content } = value;
  const ordered = (item) =>
    Array.isArray(item)
      ? item.map(ordered)
      : item && typeof item === 'object'
        ? Object.fromEntries(
            Object.keys(item)
              .sort()
              .map((key) => [key, ordered(item[key])]),
          )
        : item;
  return fingerprint(JSON.stringify(ordered(content)));
}
/** Read an already-permitted link on entry; never request access or import automatically. */
export async function newerLinkedProgress(profile, link, localAt = profile.progressUpdatedAt ?? 0) {
  if (!link || (await link.handle.queryPermission?.({ mode: 'readwrite' })) !== 'granted')
    return null;
  const file = await readProgressFile(link.handle);
  const envelope = JSON.parse(file.raw);
  if ((envelope.progressUpdatedAt ?? envelope.exportedAt ?? 0) <= localAt) return null;
  const contentFingerprint = await progressContentFingerprint(file.raw);
  if (contentFingerprint === (await progressContentFingerprint(exportProgress(profile))))
    return null;
  const imported = parseProgress(file.raw);
  if (imported.id !== profile.id)
    throw Error('The linked file belongs to a different learner. Review it on Progress.');
  return {
    imported,
    link: { handle: link.handle, fingerprint: file.fingerprint, contentFingerprint },
  };
}
/** Re-read before every write; an external edit requires a fresh, reviewed import. */
export async function saveProgressFile(link, raw, { interactive = true } = {}) {
  if (new TextEncoder().encode(raw).byteLength > limit)
    throw Error('Progress exceeds the 10 MB import limit. Export a separate backup instead.');
  if (!interactive) {
    if ((await link.handle.queryPermission?.({ mode: 'readwrite' })) !== 'granted')
      throw Error(
        'Automatic saving needs file access. Use Save to OneDrive on Progress to allow access again.',
      );
  } else if (
    link.handle.requestPermission &&
    (await link.handle.requestPermission({ mode: 'readwrite' })) !== 'granted'
  )
    throw Error('File access was not granted. Choose your progress file again.');
  const current = await readProgressFile(link.handle);
  if (current.fingerprint !== link.fingerprint)
    throw Error('This file has changed. Open it and review the latest progress before saving.');
  const writable = await link.handle.createWritable();
  try {
    await writable.write(raw);
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    throw error;
  }
  const saved = await readProgressFile(link.handle);
  if (saved.raw !== raw)
    throw Error(
      'The saved file could not be verified. Keep this tab open and export a separate JSON backup from Progress.',
    );
  return {
    handle: link.handle,
    fingerprint: saved.fingerprint,
    contentFingerprint: await progressContentFingerprint(raw),
  };
}

/** Serialize remembered-link transactions, including across tabs/routes on this origin. */
export function withProgressFileLock(profile, action) {
  return navigator.locks
    ? navigator.locks.request(`maths-progress-file:${profile.id ?? profile.key}`, action)
    : action();
}
/** IndexedDB can retain native handles, unlike localStorage. No permission prompt on load. */
export async function progressFileLink(key, value) {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('maths-progress-files', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('links');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(
        'links',
        value === undefined ? 'readonly' : 'readwrite',
      );
      const store = transaction.objectStore('links');
      const request =
        value === undefined
          ? store.get(key)
          : value === null
            ? store.delete(key)
            : store.put(
                {
                  handle: value.handle,
                  fingerprint: value.fingerprint,
                  contentFingerprint: value.contentFingerprint,
                },
                key,
              );
      transaction.oncomplete = () => resolve(request.result ?? null);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

/** User picks the synced OneDrive root; create Maths inside that granted directory only. */
export async function chooseProgressFile(profile, picker = window) {
  if (picker.showDirectoryPicker) {
    let root;
    try {
      root = await picker.showDirectoryPicker({ id: 'maths-progress', mode: 'readwrite' });
    } catch (error) {
      throw Error(
        'Folder access was not granted. The folder chooser may have been cancelled, or this browser may not support granting access. Download a JSON backup before trying the site in a normal Chrome or Edge window.',
        { cause: error },
      );
    }
    try {
      const folder =
        root.name.toLowerCase() === 'maths'
          ? root
          : await root.getDirectoryHandle('Maths', { create: true });
      return await folder.getFileHandle(progressFilename(profile), { create: true });
    } catch (error) {
      // An AbortError after selection is a file-operation failure, not picker cancellation.
      throw Error(
        `Could not create the progress file in ${root.name}/Maths: ${error.message || error.name}. Your current progress remains available in this tab. Try choosing the folder again, or export JSON from Progress.`,
        { cause: error },
      );
    }
  }
  return picker.showSaveFilePicker({
    id: 'maths-progress',
    suggestedName: progressFilename(profile),
    types: [{ description: 'Maths progress', accept: { 'application/json': ['.json'] } }],
  });
}
/** Upgrade existing name-keyed shortcuts once; all new links follow portable learner identity. */
export const learnerFileLink = progressTask(async (profile, value) => {
  const key = profile.id ?? profile.key;
  if (value !== undefined) return progressFileLink(key, value);
  const link = await progressFileLink(key);
  if (link || key === profile.key) return link;
  const previous = await progressFileLink(profile.key);
  if (previous) {
    await progressFileLink(key, previous);
    await progressFileLink(profile.key, null);
  }
  return previous;
});

/** Download fallback needs no directory permission; completion is controlled by the browser. */
export function downloadProgressFile(profile, kind = 'json') {
  const blob = new Blob([kind === 'json' ? exportProgress(profile) : exportCsv(profile)], {
    type: kind === 'json' ? 'application/json' : 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob),
    link = document.createElement('a');
  link.href = url;
  link.download = progressFilename(profile, kind);
  try {
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
