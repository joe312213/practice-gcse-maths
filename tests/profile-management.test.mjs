/**
 * Purpose: Profile changes require explicit identity checks and never affect another learner's
 * records.
 *
 * Main contents:
 * - rename preserves identity, history and settings, and rejects name collisions; reset and
 *   delete require the displayed name and only affect the selected learner; temporary working
 *   follows a rename without extending expiry; reset removes only that learner.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/src/lib/domain/profile-management.mjs,
 * website/src/lib/adapters/working-cache.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { editProfile } from "../website/src/lib/domain/profile-management.mjs";
import {
  rekeyWorking,
  createWorkingCache,
} from "../website/src/lib/adapters/working-cache.mjs";
const original = () => ({
  schema: 2,
  last: "jo",
  profiles: [
    {
      id: "first-id",
      key: "jo",
      name: "Jo",
      settings: { topicSort: "a-z" },
      topics: { "maths:M01": { history: [{ question: "q1", correct: true }] } },
      practiceSet: { active: true },
      revision: { recommendations: [{ id: "revision" }] },
    },
    {
      id: "second-id",
      key: "sam",
      name: "Sam",
      topics: { other: { history: [1] } },
    },
  ],
});
test("rename preserves identity, history and settings, and rejects name collisions", () => {
  const before = original();
  const after = editProfile(before, "jo", {
    action: "rename",
    name: "  Jo   Smith  ",
  });
  assert.equal(after.last, "jo smith");
  assert.equal(after.profiles[0].id, before.profiles[0].id);
  assert.equal(after.profiles[0].name, "Jo Smith");
  assert.deepEqual(after.profiles[0].topics, before.profiles[0].topics);
  assert.deepEqual(after.profiles[1], before.profiles[1]);
  assert.equal(before.last, "jo");
  assert.throws(
    () => editProfile(before, "jo", { action: "rename", name: "SAM" }),
    /already used/,
  );
  assert.throws(
    () => editProfile(before, "jo", { action: "rename", name: " " }),
    /1–40/,
  );
});
test("reset and delete require the displayed name and only affect the selected learner", () => {
  const before = original();
  for (const action of ["reset", "delete"]) {
    assert.throws(
      () => editProfile(before, "jo", { action, confirmation: "Sam" }),
      /exactly/,
    );
    const after = editProfile(before, "jo", { action, confirmation: "Jo" });
    assert.deepEqual(
      after.profiles.find((p) => p.key === "sam"),
      before.profiles[1],
    );
    if (action === "reset") {
      assert.deepEqual(after.profiles[0].topics, {});
      assert.equal(after.profiles[0].id, "first-id");
      assert.deepEqual(after.profiles[0].settings, { topicSort: "a-z" });
      assert.equal(after.profiles[0].practiceSet, undefined);
      assert.equal(after.profiles[0].revision, undefined);
    } else {
      assert.equal(after.profiles.length, 1);
      assert.equal(after.last, null);
    }
  }
  assert.deepEqual(before, original());
});
test("temporary working follows a rename without extending expiry; reset removes only that learner", () => {
  const values = new Map();
  const storage = {
    get length() {
      return values.size;
    },
    key: (i) => [...values.keys()][i],
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const key = (name) => JSON.stringify([name, "maths:M01", "attempt", "q1"]);
  const cache = createWorkingCache(
    storage,
    () => {},
    () => 10,
  );
  cache.save(key("jo"), { working: "first" });
  cache.save(key("sam"), { working: "second" });
  const expiry = JSON.parse([...values.values()][0]).expiresAt;
  rekeyWorking(storage, "jo", "jo smith");
  const renamed = createWorkingCache(
    storage,
    () => {},
    () => 20,
  );
  assert.equal(renamed.load(key("jo")), null);
  assert.equal(renamed.load(key("jo smith")).working, "first");
  assert.ok(
    [...values.values()].some(
      (value) => JSON.parse(value).expiresAt === expiry,
    ),
  );
  rekeyWorking(storage, "jo smith");
  assert.equal(
    createWorkingCache(
      storage,
      () => {},
      () => 30,
    ).load(key("jo smith")),
    null,
  );
  assert.equal(
    createWorkingCache(
      storage,
      () => {},
      () => 30,
    ).load(key("sam")).working,
    "second",
  );
});
