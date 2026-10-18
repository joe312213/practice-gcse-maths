/**
 * Purpose: Validate subject-scoped storage and select local learner identities without
 * authentication.
 *
 * Main contents:
 * - KEY
 * - emptyStore
 * - load
 * - chooseProfile
 *
 * Used By: tests/anonymous.test.mjs, tests/arithmetic.test.mjs,
 * tests/error-investigation.test.mjs, tests/learner-id.test.mjs, tests/practice-set.test.mjs,
 * tests/problem-solving.test.mjs, tests/reattempts.test.mjs.
 *
 * Uses: website/src/lib/domain/engine.mjs.
 *
 * Libs: none.
 */
import { profileKey, distance } from './engine.mjs';
export const KEY = 'maths-practice-v2';
const studentAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const normalizeStudentId = (value) => String(value).trim().toUpperCase().replaceAll('-', '');
export const validStudentId = (value) =>
  typeof value === 'string' && /^[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/.test(value);

/** Short portable selector; account services must enforce their own cross-device uniqueness. */
export function createStudentId(id, profiles = []) {
  const used = new Set(profiles.map((profile) => profile.studentId));
  for (let salt = 0; ; salt++) {
    let hash = learnerHash(salt ? `${id}:${salt}` : id);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code = studentAlphabet[Number(hash & 31n)] + code;
      hash >>= 5n;
    }
    code = `${code.slice(0, 4)}-${code.slice(4)}`;
    if (!used.has(code)) return code;
  }
}

export const validLearnerId = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
/** Add portable identity without changing the existing name keys, pages or history. */
export function ensureLearnerIds(store, uuid = () => crypto.randomUUID()) {
  const used = new Set();
  const studentIds = new Set();
  for (const profile of store.profiles) {
    if (profile.studentId === undefined) continue;
    if (!validStudentId(profile.studentId) || studentIds.has(profile.studentId))
      throw Error('Saved student IDs cannot be read. Progress has not been overwritten.');
    studentIds.add(profile.studentId);
  }
  let changed = false;
  for (const profile of store.profiles) {
    if (profile.id !== undefined && (!validLearnerId(profile.id) || used.has(profile.id)))
      throw Error('Saved learner IDs cannot be read. Progress has not been overwritten.');
    if (!profile.id) {
      profile.id = uuid();
      changed = true;
    }
    used.add(profile.id);
    if (!profile.studentId) {
      profile.studentId = createStudentId(profile.id, store.profiles);
      changed = true;
    }
  }
  return changed;
}
/** Compact FNV-1a filename tag only; the full UUID remains the identity in saved data. */
function learnerHash(id) {
  let hash = 0xcbf29ce484222325n;
  for (const character of id.toLowerCase())
    hash = BigInt.asUintN(64, (hash ^ BigInt(character.charCodeAt(0))) * 0x100000001b3n);
  return hash;
}
/** Derive a short stable filename suffix from the learner UUID via learnerHash; called by progressFilename. This is an identity tag, not an authentication token. */
function learnerFileTag(id) {
  return learnerHash(id).toString(36).padStart(12, '0').slice(-12);
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
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const mathsFields = ['topics', 'revision', 'practiceMeasuredFrom', 'practiceSet', 'lastTopic'];
/** Subject payloads are opaque outside maths; never interpret or discard a future subject. */
export function validSubjects(subjects) {
  return (
    object(subjects) &&
    Object.entries(subjects).every(
      ([key, value]) => /^[a-z][a-z0-9_-]*$/.test(key) && object(value),
    )
  );
}
/** Non-secret account linkage metadata, never evidence of authentication. */
export function validAccount(account) {
  return (
    object(account) &&
    ['issuer', 'subject'].every(
      (field) => typeof account[field] === 'string' && account[field].trim().length > 0,
    )
  );
}
/** Persist subject namespaces while retaining the maths session's existing record contract. */
export function serializeStore(store) {
  return JSON.stringify({
    ...store,
    schema: 3,
    profiles: store.profiles.map((profile) => {
      const { otherSubjects, ...shared } = profile;
      const maths = {};
      for (const field of mathsFields) {
        if (field in shared) maths[field] = shared[field];
        delete shared[field];
      }
      return { ...shared, subjects: { ...otherSubjects, maths } };
    }),
  });
}
/** Empty runtime store; schema 3 is written by the storage boundary. */
export function emptyStore() {
  return { schema: 3, last: null, profiles: [] };
}
/** Read schema 2 losslessly, or unpack the subject-scoped schema 3 representation. */
export function load(storage) {
  const raw = storage.getItem(KEY);
  if (!raw) return emptyStore();
  const data = JSON.parse(raw);
  const invalid = () => {
    throw Error('Saved progress cannot be read. It has not been overwritten.');
  };
  if (![2, 3].includes(data?.schema) || !Array.isArray(data.profiles)) invalid();
  for (let index = 0; index < data.profiles.length; index++) {
    let profile = data.profiles[index];
    if (!object(profile) || typeof profile.name !== 'string') invalid();
    if (profile.account !== undefined && !validAccount(profile.account)) invalid();
    if (data.schema === 3) {
      if (!validSubjects(profile.subjects)) invalid();
      if (profile.subjects.maths !== undefined && !object(profile.subjects.maths.topics)) invalid();
      const { subjects, ...shared } = profile;
      const { maths = { topics: {} }, ...otherSubjects } = subjects;
      profile = { ...maths, ...shared, otherSubjects };
      data.profiles[index] = profile;
    }
    if (!object(profile.topics)) invalid();
  }
  return data;
}
/**
 * Find a normalized learner name or return confirmation/suggestions before creating it.
 * Parameter store: runtime learner store.
 * Parameter name: learner display name before normalization.
 * Parameter create: whether learner creation was confirmed.
 * Calls: profileKey.
 * @example chooseProfile(store, "Student", true);
 */
export function chooseProfile(store, name, create = false) {
  const key = profileKey(name);
  if (!key || key.length > 40) throw Error('Use a name of 1–40 characters.');
  let profile = store.profiles.find((p) => p.key === key);
  const studentId = normalizeStudentId(name);
  profile ??= store.profiles.find(
    (p) => p.studentId && normalizeStudentId(p.studentId) === studentId,
  );
  if (!profile && validStudentId(String(name).trim().toUpperCase()))
    throw Error('That student ID is not saved in this browser. Open your progress file first.');
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
  profile.studentId ??= createStudentId(profile.id, store.profiles);
  store.last = profile.key;
  return { profile };
}
