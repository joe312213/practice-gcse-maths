/**
 * Purpose: Validate schema-2 storage and select local learner identities without authentication.
 *
 * Main contents:
 * - KEY
 * - emptyStore
 * - load
 * - chooseProfile
 *
 * Used By: tests/practice-set.test.mjs, tests/session.test.mjs, tests/website.test.mjs, website/src/lib/adapters/storage.mjs, website/src/lib/application/session.mjs
 *
 * Uses: website/src/lib/domain/engine.mjs.
 *
 * Libs: none.
 */
import { profileKey, distance } from './engine.mjs';
export const KEY = 'maths-practice-v2';
/**
 * Create empty schema-2 learner storage.
 * Used by: load.
 */
export function emptyStore() {
  return { schema: 2, last: null, profiles: [] };
}
/**
 * Read and validate current learner storage without migrating older schemas.
 * Parameter storage: Storage-compatible adapter.
 * Calls: emptyStore.
 */
export function load(storage) {
  const raw = storage.getItem(KEY);
  if (!raw) return emptyStore();
  const data = JSON.parse(raw);
  if (
    data.schema !== 2 ||
    !Array.isArray(data.profiles) ||
    data.profiles.some(
      (p) => !p || typeof p.name !== 'string' || !p.topics || typeof p.topics !== 'object',
    )
  )
    throw Error('Saved progress cannot be read. It has not been overwritten.');
  return data;
}
/**
 * Find a normalized learner name or return confirmation/suggestions before creating it.
 * Parameter store: schema-2 learner store.
 * Parameter name: learner name or requested field name.
 * Parameter create: whether learner creation was confirmed.
 * Calls: profileKey.
 * @example chooseProfile(store, "Student", true);
 */
export function chooseProfile(store, name, create = false) {
  const key = profileKey(name);
  if (!key || key.length > 40) throw Error('Use a name of 1–40 characters.');
  let profile = store.profiles.find((p) => p.key === key);
  if (!profile && !create)
    return { matches: store.profiles.filter((p) => distance(key, p.key) <= 2).map((p) => p.name) };
  if (!profile) {
    profile = { key, name: String(name).trim().replace(/\s+/g, ' '), topics: {} };
    store.profiles.push(profile);
  }
  store.last = key;
  return { profile };
}
