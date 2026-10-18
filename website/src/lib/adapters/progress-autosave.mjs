/**
 * Purpose: Save linked progress at practice boundaries and browser lifecycle opportunities.
 * Browser data is saved first; file writes are serial, verified and never request permissions in
 * the background. Pending work survives interrupted exits.
 *
 * Main contents:
 * - createProgressAutosave, bindProgressAutosave.
 *
 * Used By: tests/progress-autosave.test.mjs, website/scripts/audit-progress-concurrency.mjs,
 * website/src/lib/components/practice/TopicPractice.svelte.
 *
 * Uses: website/src/lib/adapters/progress-ownership.mjs,
 * website/src/lib/domain/progress-transfer.mjs, website/src/lib/domain/progress.mjs,
 * website/src/lib/adapters/progress-file.mjs.
 *
 * Libs: none.
 */
import { progressTask } from './progress-ownership.mjs';

import { exportProgress } from '../domain/progress-transfer.mjs';
import { recordExport } from '../domain/progress.mjs';
import {
  learnerFileLink,
  saveProgressFile,
  withProgressFileLock,
  readProgressFile,
  progressContentFingerprint,
  newerLinkedProgress,
} from './progress-file.mjs';

/** Create the injectable file-saving coordinator for a learner store. Queues boundary saves, checks linked-file freshness and reports status; bindProgressAutosave owns browser events. Example: createProgressAutosave({ data, save, status }). */
export function createProgressAutosave({
  data,
  save,
  status = () => {},
  newer = () => {},
  initialUpdated = new Map(),
  fileLink = learnerFileLink,
  write = saveProgressFile,
  lock = withProgressFileLock,
}) {
  const queues = new Map();
  const checks = new Map();
  const blocked = new Map();
  let previous = null;
  const learner = (view) => data.profiles.find((p) => p.id === view?.profile?.id);
  function check(profile) {
    if (checks.has(profile.id)) return checks.get(profile.id);
    // Capture local age before practice time or a new stage modifies this session's data.
    const localAt =
      initialUpdated.get(profile.id) ??
      profile.progressUpdatedAt ??
      Math.max(
        0,
        ...Object.values(profile.topics).flatMap((topic) =>
          (topic.history ?? []).map((item) => item.at),
        ),
      );
    const pending = progressTask(async () => {
      try {
        const link = await fileLink(profile);
        const update = await newerLinkedProgress(profile, link, localAt);
        if (!update) return true;
        report(
          profile,
          'review',
          'Your OneDrive file has newer progress. Use it on this computer?',
        );
        blocked.set(profile.id, profile.fileSync);
        newer(profile.id, update);
        return false;
      } catch (error) {
        report(
          profile,
          'error',
          `Could not check your linked file: ${error.message} Review it on Progress before saving.`,
        );
        blocked.set(profile.id, profile.fileSync);
        return false;
      }
    })();
    checks.set(profile.id, pending);
    return pending;
  }
  function report(profile, state, message) {
    profile.fileSync = { ...profile.fileSync, state, message };
    save(data);
    status(profile.id, profile.fileSync);
  }
  function flush(profile = learner(previous)) {
    if (!profile) return Promise.resolve();
    // Persist synchronously before starting any asynchronous file operation on exit.
    save(data);
    if (
      profile.progressUpdatedAt !== undefined &&
      profile.fileSync?.savedThrough >= profile.progressUpdatedAt &&
      profile.fileSync.state === 'saved'
    )
      return Promise.resolve();
    let queue = queues.get(profile.id);
    if (!queue) {
      queue = { pending: false, running: null, saved: null };
      queues.set(profile.id, queue);
    }
    queue.pending = true;
    if (queue.running) return queue.running;
    report(profile, 'pending', 'Checking and saving your linked progress file…');
    queue.running = progressTask(async () => {
      while (queue.pending) {
        queue.pending = false;
        try {
          await lock(profile, async () => {
            if (!(await check(profile))) {
              const { state, message } = blocked.get(profile.id);
              report(profile, state, message);
              return;
            }
            // Fetch inside the lock: another route/tab may have updated the fingerprint.
            const link = await fileLink(profile);
            if (!link) {
              delete profile.fileSync;
              save(data);
              status(profile.id, null);
              return;
            }
            const updatedAt = profile.progressUpdatedAt;
            const raw = exportProgress(profile);
            const content = await progressContentFingerprint(raw);
            // Old links have only a byte fingerprint: establish their content baseline by reading,
            // never by assuming the current browser data has already reached the file.
            let savedContent = link.contentFingerprint ?? queue.saved;
            if (!savedContent) {
              const file = await readProgressFile(link.handle);
              if (file.fingerprint !== link.fingerprint)
                throw Error(
                  'This file has changed. Open it and review the latest progress before saving.',
                );
              savedContent = await progressContentFingerprint(file.raw);
            }
            if (content === savedContent) {
              queue.saved = content;
              profile.fileSync.savedThrough = updatedAt;
              report(
                profile,
                'saved',
                'Progress saved to your linked file. OneDrive handles cloud syncing.',
              );
              return;
            }
            report(profile, 'pending', 'Saving progress to your linked file…');
            const updated = await write(link, raw, { interactive: false });
            await fileLink(profile, updated);
            queue.saved = content;
            profile.fileSync.savedThrough = updatedAt;
            recordExport(profile, 'json');
            if (profile.progressUpdatedAt > updatedAt) queue.pending = true;
            report(
              profile,
              'saved',
              'Progress saved to your linked file. OneDrive handles cloud syncing.',
            );
          });
        } catch (error) {
          queue.pending = false;
          report(
            profile,
            'error',
            `File save needs attention: ${error.message} Current progress remains in this tab.`,
          );
        }
      }
    })().finally(() => {
      queue.running = null;
    });
    return queue.running;
  }
  return {
    flush,
    select(view) {
      const old = previous;
      previous = view;
      if (!old) {
        const profile = learner(view);
        if (profile) void check(profile);
        if (profile?.fileSync) status(profile.id, profile.fileSync);
        if (profile?.fileSync?.state === 'pending') void flush(profile);
        return;
      }
      const changed =
        old.profile?.id !== view.profile?.id ||
        old.bank.topic !== view.bank.topic ||
        old.mode !== view.mode ||
        old.page?.attempt !== view.page?.attempt;
      if (changed) void flush(learner(old));
      if (old.profile?.id !== view.profile?.id && learner(view)) void check(learner(view));
      if (!changed && !old.page?.complete && view.page?.complete) void flush(learner(view));
    },
  };
}

/** Hidden includes tab switches. Exit events are best effort; they cannot delay tab closure. */
export function bindProgressAutosave(session, options, document, window) {
  const sync = createProgressAutosave(options);
  const unsubscribe = session.subscribe(sync.select);
  const flush = () => {
    void sync.flush();
  };
  const visibility = () => {
    if (document.hidden) flush();
  };
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', flush);
  window.addEventListener('beforeunload', flush);
  return () => {
    flush();
    unsubscribe();
    document.removeEventListener('visibilitychange', visibility);
    window.removeEventListener('pagehide', flush);
    window.removeEventListener('beforeunload', flush);
  };
}
