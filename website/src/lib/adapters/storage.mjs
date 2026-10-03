import { KEY, emptyStore, load } from '../domain/profiles.mjs';

/** Preserve unreadable stores: in-memory practice must never overwrite their contents. */
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

export async function loadBank(url, fetcher = fetch) {
  const response = await fetcher(url, { cache: 'no-store' });
  if (!response.ok) throw Error('The equation bank could not be loaded.');
  const bank = await response.json();
  if (!Array.isArray(bank.questions) || !bank.revision)
    throw Error('The equation bank is invalid.');
  return bank;
}
