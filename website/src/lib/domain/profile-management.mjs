/** Validate explicit profile edits and return a new store, preserving unrelated learners. */
import { profileKey } from './engine.mjs';
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
        key: profile.key,
        name: profile.name,
        settings: profile.settings,
        topics: {},
      };
    }
  }
  return next;
}
