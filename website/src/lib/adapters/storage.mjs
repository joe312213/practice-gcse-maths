/**
 * Purpose: Load and save learner progress safely and fetch the validated question bank.
 *
 * Main contents:
 * - openProgress
 * - loadBank
 *
 * Used By: tests/anonymous.test.mjs, tests/learner-id.test.mjs, tests/session.test.mjs,
 * website/src/lib/components/practice/TopicPractice.svelte, website/src/routes/+page.svelte,
 * website/src/routes/progress.html/+page.svelte.
 *
 * Uses: website/src/lib/content/topic-runtime.mjs, website/src/lib/domain/profiles.mjs, website/src/lib/domain/progress-transfer.mjs.
 *
 * Libs: none.
 */
import { openTopic } from '../content/topic-runtime.mjs';
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
export function openProgress(storage, onWarning = () => {}, temporary) {
  const visitKey = 'maths-anonymous-visit';
  if (temporary === undefined) {
    try {
      temporary = globalThis.sessionStorage;
    } catch {
      /* In-memory visit remains usable. */
    }
  }
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
  // A fresh tab has no visit. Never recover an anonymous learner from durable storage.
  data.profiles = data.profiles.filter((profile) => !profile.anonymous);
  const namedLast = data.last === '__anonymous__' ? null : data.last;
  let lastNamed = namedLast;
  try {
    const visit = JSON.parse(temporary?.getItem(visitKey) ?? 'null');
    if (visit?.anonymous && visit.topics) {
      data.profiles.push(visit);
      data.last = visit.key;
    }
  } catch {
    /* A damaged temporary visit cannot replace saved named progress. */
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
      const guest = value.profiles.find((profile) => profile.anonymous);
      try {
        if (guest && value.last === guest.key) temporary?.setItem(visitKey, JSON.stringify(guest));
        else temporary?.removeItem(visitKey);
      } catch {
        onWarning(
          'This visit is only available while this page stays open. Enter a name to save your progress.',
        );
      }
      if (!writable) return false;
      try {
        if (value.last !== '__anonymous__') lastNamed = value.last;
        storage.setItem(
          KEY,
          serializeStore({
            ...value,
            last: lastNamed,
            profiles: value.profiles.filter((profile) => !profile.anonymous),
          }),
        );
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
  const response = await fetcher(url, { cache: 'force-cache' });
  if (!response.ok) throw Error('The question bank could not be loaded.');
  const bank = openTopic(await response.json());
  if (!Array.isArray(bank.questions) || !bank.revision)
    throw Error('The question bank is invalid.');
  return bank;
}
