/**
 * Purpose: Load and save learner progress safely and fetch the validated question bank.
 *
 * Main contents:
 * - openProgress
 * - loadBank
 *
 * Used By: tests/session.test.mjs, website/src/lib/components/practice/TopicPractice.svelte, website/src/routes/progress.html/+page.svelte
 *
 * Uses: website/src/lib/domain/profiles.mjs.
 *
 * Libs: none.
 */
import { KEY, emptyStore, load, ensureLearnerIds, serializeStore } from '../domain/profiles.mjs';
import { progressContent } from '../domain/progress-transfer.mjs';

/**
 * Preserve unreadable stores: in-memory practice must never overwrite their contents.
 * Load learner data and return a guarded persistence adapter; preserve unreadable stored data.
 * Parameter storage: Storage-compatible adapter.
 * Parameter onWarning: warning callback.
 * Calls: load, emptyStore.
 * @example const progress = openProgress(localStorage, showWarning);
 */
export function openProgress(storage, onWarning = () => {}) {
  let writable = true;
  let data;
  try {
    data = load(storage);
    const idsChanged = ensureLearnerIds(data);
    if (idsChanged || data.schema === 2) {
      data.schema = 3;
      try {
        storage.setItem(KEY, serializeStore(data));
      } catch {
        onWarning(
          'Updated progress could not be saved in this browser. Save a progress file to keep it.',
        );
      }
    }
  } catch (error) {
    writable = false;
    data = emptyStore();
    onWarning(`${error.message} Practice can continue without saving.`);
  }
  const contents = new Map(data.profiles.map((profile) => [profile.id, progressContent(profile)]));
  return {
    data,
    /**
     * Persist a learner store only if the original data was readable; report write failures.
     * Parameter value: complete runtime learner store to serialize.
     */
    save(value) {
      for (const profile of value.profiles) {
        const content = progressContent(profile);
        if (contents.get(profile.id) !== content) {
          // Monotonic even for two updates in one millisecond or a clock adjustment.
          profile.progressUpdatedAt = Math.max(Date.now(), (profile.progressUpdatedAt ?? 0) + 1);
          contents.set(profile.id, content);
        }
      }
      if (!writable) return false;
      try {
        storage.setItem(KEY, serializeStore(value));
        return true;
      } catch {
        onWarning(
          'This browser could not save your progress. Keep this tab open; your current work is still available here.',
        );
        return false;
      }
    },
  };
}

/**
 * Fetch a bank URL and reject failed responses or invalid bank shape.
 * Parameter url: question-bank URL.
 * Parameter fetcher: injected fetch implementation.
 */
export async function loadBank(url, fetcher = fetch) {
  const response = await fetcher(url, { cache: 'no-store' });
  if (!response.ok) throw Error('The question bank could not be loaded.');
  const bank = await response.json();
  if (!Array.isArray(bank.questions) || !bank.revision)
    throw Error('The question bank is invalid.');
  return bank;
}
