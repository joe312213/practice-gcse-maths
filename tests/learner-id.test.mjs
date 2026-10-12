/** Stable additive identities preserve schema-2 progress and survive portable-file round trips. */
import test from "node:test";
import assert from "node:assert/strict";
import {
  ensureLearnerIds,
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
