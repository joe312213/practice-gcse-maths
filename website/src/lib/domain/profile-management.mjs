/**
 * Purpose: Validate explicit rename, reset and delete actions and return an isolated updated
 * store. Other learners and external files remain untouched; destructive actions require the
 * displayed-name confirmation.
 *
 * Main contents:
 * - editProfile.
 *
 * Used By: tests/learner-id.test.mjs, tests/profile-management.test.mjs,
 * website/src/lib/components/progress/ProfileManagement.svelte.
 *
 * Uses: website/src/lib/domain/engine.mjs.
 *
 * Libs: none.
 */
import { profileKey } from './engine.mjs';
/** Apply a validated rename/reset/delete request to a cloned store. Parameters identify the learner and action/name/confirmation; called by ProfileManagement. Throws before any persistence on invalid input. Example: editProfile(store, key, { action: "rename", name: "Sam" }). */
export function editProfile(store, key, { action, name, confirmation }) {
  const next = structuredClone(store);
  const index = next.profiles.findIndex((profile) => profile.key === key);
  if (index < 0) throw Error('Choose an existing learner first.');
  const profile = next.profiles[index];
  if (action === 'rename') {
    const newKey = profileKey(name);
    if (!newKey || newKey.length > 40) throw Error('Use a name of 1–40 characters.');
    if (next.profiles.some((other, i) => i !== index && other.key === newKey))
      throw Error('That name is already used by another learner.');
    profile.name = String(name).trim().replace(/\s+/g, ' ');
    profile.key = newKey;
    if (next.last === key) next.last = newKey;
  } else {
    if (!['reset', 'delete'].includes(action)) throw Error('Unknown profile action.');
    if (confirmation !== profile.name) throw Error('Type the learner name exactly to confirm.');
    if (action === 'delete') {
      next.profiles.splice(index, 1);
      if (next.last === key) next.last = null;
    } else {
      next.profiles[index] = {
        id: profile.id,
        studentId: profile.studentId,
        key: profile.key,
        name: profile.name,
        settings: profile.settings,
        account: profile.account,
        otherSubjects: profile.otherSubjects,
        topics: {},
      };
    }
  }
  return next;
}
