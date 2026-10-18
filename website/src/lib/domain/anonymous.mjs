/**
 * Purpose: Keep unnamed practice as a tab visit and adopt its evidence into a named learner.
 *
 * Main contents:
 * - beginAnonymous; nameAnonymous.
 *
 * Used By: tests/anonymous.test.mjs, website/src/lib/application/session.mjs,
 * website/src/routes/progress.html/+page.svelte.
 *
 * Uses: website/src/lib/domain/profiles.mjs.
 *
 * Libs: none.
 */
import { chooseProfile } from './profiles.mjs';

/** Start a fresh visit, removing only earlier anonymous records. Called by Continue without a name. */
export function beginAnonymous(store) {
  store.profiles = store.profiles.filter((profile) => !profile.anonymous);
  const profile = {
    id: crypto.randomUUID(),
    key: '__anonymous__',
    name: 'Guest',
    anonymous: true,
    topics: {},
  };
  store.profiles.push(profile);
  store.last = profile.key;
  return profile;
}

/**
 * Adopt the current visit after name confirmation. Existing learner pages stay intact;
 * visit pages are retained in their page history, and dated evidence/time are combined.
 * Parameters: store is the mutable runtime store; name/create follow chooseProfile.
 * Called by session.chooseName and the Progress name form; calls chooseProfile.
 * @example nameAnonymous(store, 'Sam', true); // Save this visit under Sam.
 */
export function nameAnonymous(store, name, create = false) {
  const guest = store.profiles.find((profile) => profile.key === store.last && profile.anonymous);
  const existing = new Set(store.profiles);
  const result = chooseProfile(store, name, create);
  if (!guest || !result.profile || result.profile === guest) return result;
  const target = result.profile;
  if (!existing.has(target)) {
    // Keep visit identity, unfinished pages and settings when this is a new name.
    const { key, name: displayName, studentId } = target;
    Object.assign(target, guest, { key, name: displayName, studentId });
    delete target.anonymous;
  } else {
    for (const [scope, visit] of Object.entries(guest.topics)) {
      const saved = target.topics[scope];
      if (!saved) {
        target.topics[scope] = visit;
        continue;
      }
      saved.history = [...saved.history, ...visit.history].sort((a, b) => a.at - b.at);
      for (const [mode, track] of Object.entries(visit.tracks)) {
        if (!saved.tracks[mode]) saved.tracks[mode] = track;
        else
          for (let level = 0; level < 3; level++) {
            saved.tracks[mode].histories[level] = [
              ...saved.tracks[mode].histories[level],
              ...track.histories[level],
            ].slice(-10);
          }
      }
      for (const [mode, page] of Object.entries(visit.pages)) {
        if (!saved.pages[mode]) saved.pages[mode] = page;
        else {
          saved.pageHistory ??= {};
          const history = (saved.pageHistory[mode] ??= { previous: [], next: [] });
          history.previous.push(page);
        }
      }
      saved.practice = [...(saved.practice ?? []), ...(visit.practice ?? [])];
    }
    target.practiceMeasuredFrom = Math.min(
      target.practiceMeasuredFrom ?? Infinity,
      guest.practiceMeasuredFrom ?? Infinity,
    );
    if (!Number.isFinite(target.practiceMeasuredFrom)) delete target.practiceMeasuredFrom;
    if (guest.practiceSet && !target.practiceSet) target.practiceSet = guest.practiceSet;
  }
  store.profiles = store.profiles.filter((profile) => profile !== guest);
  store.last = target.key;
  return result;
}
