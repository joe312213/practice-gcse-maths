import { profileKey, distance } from './engine.mjs';
export const KEY = 'maths-practice-v2';
export function emptyStore() {
  return { schema: 2, last: null, profiles: [] };
}
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
