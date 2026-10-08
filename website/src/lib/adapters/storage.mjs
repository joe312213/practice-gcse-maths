/**
 * Purpose: Load and save learner progress safely and fetch the validated question bank.
 *
 * Main contents:
 * - openProgress
 * - loadBank
 *
 * Used By: tests/session.test.mjs, website/src/routes/+page.svelte, website/src/routes/progress.html/+page.svelte
 *
 * Uses: website/src/lib/domain/profiles.mjs.
 *
 * Libs: none.
 */
import { KEY, emptyStore, load } from '../domain/profiles.mjs';

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
  } catch (error) {
    writable = false;
    data = emptyStore();
    onWarning(`${error.message} Practice can continue without saving.`);
  }
  return {
    data,
    /**
     * Persist a learner store only if the original data was readable; report write failures.
     * Parameter value: new value to apply or validate.
     */
    save(value) {
      if (!writable) return;
      try {
        storage.setItem(KEY, JSON.stringify(value));
      } catch {
        onWarning(
          'This browser could not save your progress. Keep this tab open; your current work is still available here.',
        );
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
