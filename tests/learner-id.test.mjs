/** Stable additive identities preserve schema-2 progress and survive portable-file round trips. */
import test from "node:test";
import assert from "node:assert/strict";
import {
  ensureLearnerIds,
  createStudentId,
  chooseProfile,
  validStudentId,
  progressFilename,
} from "../website/src/lib/domain/profiles.mjs";
import {
  exportProgress,
  parseProgress,
  importProgress,
} from "../website/src/lib/domain/progress-transfer.mjs";
const id = "12345678-1234-4123-8123-123456789abc";
const learner = () => ({
  name: "Jo / Hudson",
  key: "jo / hudson",
  topics: {},
  id,
});
test("existing data gains one stable ID without rewriting names, topics or pages", () => {
  const profile = {
    name: "Jo",
    key: "jo",
    topics: { saved: { pages: { example: 42 } } },
  };
  const topics = profile.topics,
    store = { schema: 2, last: "jo", profiles: [profile] };
  assert.equal(
    ensureLearnerIds(store, () => id),
    true,
  );
  assert.equal(
    ensureLearnerIds(store, () => {
      throw Error("must not allocate again");
    }),
    false,
  );
  assert.equal(profile.topics, topics);
  assert.equal(profile.id, id);
  assert.equal(store.last, "jo");
  const filename = progressFilename(learner());
  assert.match(filename, /^practice_progress_jo_hudson_[a-z0-9]{12}\.json$/);
  assert.equal(
    filename,
    progressFilename({ ...learner(), id: id.toUpperCase() }),
  );
  assert.equal(
    filename,
    progressFilename(parseProgress(exportProgress(learner()))),
  );
  assert.notEqual(
    filename,
    progressFilename({
      ...learner(),
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    }),
  );
  assert.equal(learner().id, id);
});
test("portable identity survives imports; legacy files keep the confirmed browser identity", () => {
  const profile = learner(),
    imported = parseProgress(exportProgress(profile));
  assert.equal(imported.id, id);
  const store = { profiles: [profile], last: profile.key };
  const old = parseProgress(exportProgress({ ...profile, id: undefined }));
  importProgress(store, old, true);
  assert.equal(store.profiles[0].id, id);
  assert.throws(
    () =>
      parseProgress(
        JSON.stringify({
          ...JSON.parse(exportProgress(profile)),
          learnerId: "wrong",
        }),
      ),
    /Invalid progress/,
  );
});
test("same ID matches renamed imports, but a name already held by another learner cannot be overwritten", () => {
  const profile = learner(),
    store = { profiles: [profile], last: profile.key };
  const renamed = { ...profile, name: "Renamed", key: "renamed" };
  assert.throws(() => importProgress(store, renamed), /Confirm replacement/);
  importProgress(store, renamed, true);
  assert.equal(store.profiles.length, 1);
  assert.equal(store.last, "renamed");
  store.profiles.push({
    ...learner(),
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  });
  assert.throws(
    () => importProgress(store, learner(), true),
    /Another learner/,
  );
});

test("schema-2 migration preserves complete maths state, identity and shared settings", async () => {
  const { openProgress } =
    await import("../website/src/lib/adapters/storage.mjs");
  const { load, KEY } = await import("../website/src/lib/domain/profiles.mjs");
  const old = {
    schema: 2,
    last: "jo",
    profiles: [
      {
        id: "12345678-1234-4234-8234-123456789abc",
        key: "jo",
        name: "Jo",
        topics: {
          "maths:M10": {
            tracks: {},
            history: [{ raw: "x=5", at: 10 }],
            pages: { plain: { attempt: "kept", raw: "draft" } },
            lastMode: "errors",
          },
        },
        revision: { recommendations: [{ savedAttempt: { id: "resume" } }] },
        practiceSet: { active: true, code: "saved" },
        lastTopic: "M10",
        practiceMeasuredFrom: 12,
        settings: { demoSpeed: 2 },
        backup: { since: 1 },
        fileSync: { state: "saved" },
      },
    ],
  };
  let raw = JSON.stringify(old);
  const storage = {
    getItem: () => raw,
    setItem: (key, value) => {
      assert.equal(key, KEY);
      raw = value;
    },
  };
  const opened = openProgress(storage);
  assert.equal(opened.data.schema, 3);
  const saved = JSON.parse(raw);
  assert.equal(saved.schema, 3);
  assert.deepEqual(
    saved.profiles[0].subjects.maths.topics,
    old.profiles[0].topics,
  );
  assert.equal(saved.profiles[0].topics, undefined);
  const restored = load(storage).profiles[0];
  const { otherSubjects, studentId, ...maths } = restored;
  assert.ok(validStudentId(studentId));
  assert.deepEqual(maths, old.profiles[0]);
  assert.deepEqual(otherSubjects, {});
  const original = JSON.stringify(old);
  const warnings = [];
  const full = openProgress(
    {
      getItem: () => original,
      setItem: () => {
        throw Error("full");
      },
    },
    (text) => warnings.push(text),
  );
  assert.deepEqual(full.data.profiles[0].topics, old.profiles[0].topics);
  assert.equal(warnings.length, 1);
});

test("other subjects and account linkage survive maths browser and file saves", async () => {
  const { serializeStore, load } =
    await import("../website/src/lib/domain/profiles.mjs");
  const { exportProgress, parseProgress, importProgress } =
    await import("../website/src/lib/domain/progress-transfer.mjs");
  const { editProfile } =
    await import("../website/src/lib/domain/profile-management.mjs");
  const profile = {
    id: "12345678-1234-4234-8234-123456789abc",
    name: "Jo",
    key: "jo",
    topics: {},
    account: { issuer: "https://accounts.example.edu", subject: "account-123" },
    otherSubjects: {
      english: {
        version: 7,
        essays: [{ id: "essay-1", score: 4 }],
        settings: { level: "B" },
      },
    },
  };
  const store = { schema: 3, last: "jo", profiles: [profile] };
  const raw = serializeStore(store);
  assert.deepEqual(load({ getItem: () => raw }).profiles[0], profile);
  const parsed = parseProgress(exportProgress(profile));
  assert.deepEqual(parsed.otherSubjects, profile.otherSubjects);
  assert.deepEqual(parsed.account, profile.account);
  const legacy = JSON.parse(exportProgress(profile));
  Object.assign(legacy, legacy.subjects.maths, {
    format: "maths-practice-progress",
    version: 2,
  });
  delete legacy.subjects;
  delete legacy.account;
  importProgress(store, parseProgress(JSON.stringify(legacy)), true);
  assert.deepEqual(store.profiles[0].otherSubjects, profile.otherSubjects);
  assert.deepEqual(store.profiles[0].account, profile.account);
  const reset = editProfile(store, "jo", {
    action: "reset",
    confirmation: "Jo",
  });
  assert.deepEqual(reset.profiles[0].otherSubjects, profile.otherSubjects);
  assert.deepEqual(reset.profiles[0].account, profile.account);
  const malformed = JSON.parse(raw);
  malformed.profiles[0].subjects = [];
  assert.throws(
    () => load({ getItem: () => JSON.stringify(malformed) }),
    /not been overwritten/,
  );
});

test("student IDs are compact, portable selectors; UUID stays authoritative", async () => {
  const profile = learner();
  const store = { profiles: [profile], last: null };
  ensureLearnerIds(store);
  const code = profile.studentId;
  assert.ok(validStudentId(code));
  assert.equal(code, createStudentId(profile.id.toUpperCase()));
  assert.notEqual(createStudentId(profile.id, store.profiles), code);
  for (const input of [code, code.toLowerCase(), code.replace("-", "")]) {
    assert.equal(chooseProfile(store, input).profile, profile);
    assert.equal(store.last, profile.key);
  }
  assert.throws(() => chooseProfile(store, "2222-2222", true), /not saved/);
  assert.equal(store.profiles.length, 1);
  const parsed = parseProgress(exportProgress(profile));
  assert.equal(parsed.studentId, code);
  assert.equal(parsed.id, id);
  importProgress(store, { ...profile, studentId: undefined }, true);
  assert.equal(store.profiles[0].studentId, code);
  const { editProfile } =
    await import("../website/src/lib/domain/profile-management.mjs");
  for (const action of ["rename", "reset"]) {
    const next = editProfile(store, profile.key, {
      action,
      name: "New name",
      confirmation: profile.name,
    });
    assert.equal(next.profiles[0].studentId, code);
    assert.equal(next.profiles[0].id, id);
  }
  const before = JSON.stringify(store);
  assert.throws(
    () =>
      importProgress(store, {
        ...profile,
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        name: "Other",
        key: "other",
      }),
    /student ID/,
  );
  assert.equal(JSON.stringify(store), before);
});
