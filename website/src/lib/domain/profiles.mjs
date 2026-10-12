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
export const validLearnerId = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
/** Add portable identity without changing the existing name keys, pages or history. */
export function ensureLearnerIds(store, uuid = () => crypto.randomUUID()) {
  const used = new Set();
  let changed = false;
  for (const profile of store.profiles) {
    if (profile.id !== undefined && (!validLearnerId(profile.id) || used.has(profile.id)))
      throw Error('Saved learner IDs cannot be read. Progress has not been overwritten.');
    if (!profile.id) {
      profile.id = uuid();
      changed = true;
    }
    used.add(profile.id);
  }
  return changed;
}
/** Compact FNV-1a filename tag only; the full UUID remains the identity in saved data. */
function learnerFileTag(id) {
  let hash = 0xcbf29ce484222325n;
  for (const character of id.toLowerCase())
    hash = BigInt.asUintN(64, (hash ^ BigInt(character.charCodeAt(0))) * 0x100000001b3n);
  return hash.toString(36).padStart(12, '0').slice(-12);
}
/** A portable filename, safe on Windows/macOS, with identity independent of the display name. */
export function progressFilename(profile, extension = 'json') {
  const name =
    profile.name
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}_-]+/gu, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'learner';
  return `practice_progress_${name}${profile.id ? `_${learnerFileTag(profile.id)}` : ''}.${extension}`;
}
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
 * Parameter name: learner display name before normalization.
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
    profile = {
      id: crypto.randomUUID(),
      key,
      name: String(name).trim().replace(/\s+/g, ' '),
      topics: {},
    };
    store.profiles.push(profile);
  }
  profile.id ??= crypto.randomUUID();
  store.last = key;
  return { profile };
}
