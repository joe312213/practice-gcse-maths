/**
 * Purpose: Verify visit isolation and lossless adoption into durable named progress.
 *
 * Main contents:
 * - Reload/new-tab boundaries; new/existing names; original result preservation.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/src/lib/adapters/storage.mjs, website/src/lib/domain/anonymous.mjs,
 * website/src/lib/domain/profiles.mjs, website/src/lib/application/session.mjs,
 * website/scripts/read-topic-bank.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { openProgress } from "../website/src/lib/adapters/storage.mjs";
import {
  beginAnonymous,
  nameAnonymous,
} from "../website/src/lib/domain/anonymous.mjs";
import {
  KEY,
  chooseProfile,
  emptyStore,
  serializeStore,
} from "../website/src/lib/domain/profiles.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";
const bank = await readTopicBank("solving-equations");
const memory = () => {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};
/** Create an isolated anonymous practice session and submit one known correct answer; returns the session/profile for persistence assertions. */
function answerVisit(adapter) {
  const api = createSession({
    bank,
    data: adapter.data,
    save: adapter.save,
    random: () => 0,
  });
  let view;
  api.subscribe((value) => {
    view = value;
  });
  api.beginAnonymous();
  api.switchMode("plain");
  const question = bank.questions.find((q) => q.id === view.page.items[0].id);
  api.updateDraft({ answer: question.answer });
  api.submitAnswer();
  return {
    api,
    profile: adapter.data.profiles.find((p) => p.anonymous),
    question,
  };
}
test("anonymous results survive route reloads but never enter local storage or a fresh tab", () => {
  const storage = memory(),
    temporary = memory();
  const initial = emptyStore();
  chooseProfile(initial, "Returning learner", true);
  storage.setItem(KEY, serializeStore(initial));
  const adapter = openProgress(storage, () => {}, temporary);
  const { profile } = answerVisit(adapter);
  assert.equal(profile.topics["maths:M10"].history.length, 1);
  const persisted = JSON.parse(storage.getItem(KEY));
  assert.equal(persisted.profiles.length, 1);
  assert.equal(persisted.profiles[0].name, "Returning learner");
  assert.equal(
    openProgress(storage, () => {}, temporary).data.last,
    "__anonymous__",
  );
  const fresh = openProgress(storage, () => {}, memory());
  assert.equal(
    fresh.data.profiles.some((p) => p.anonymous),
    false,
  );
  assert.equal(fresh.data.last, initial.last);
  beginAnonymous(adapter.data);
  assert.deepEqual(adapter.data.profiles.find((p) => p.anonymous).topics, {});
});
test("naming a visit retains identity, current pages and results, and clears temporary storage", () => {
  const storage = memory(),
    temporary = memory();
  const adapter = openProgress(storage, () => {}, temporary);
  const { api, profile } = answerVisit(adapter);
  const before = structuredClone(profile.topics);
  assert.equal(api.chooseName("Sam").profile, undefined);
  assert.ok(profile.anonymous);
  const named = api.chooseName("Sam", true).profile;
  assert.equal(named.id, profile.id);
  assert.deepEqual(named.topics, before);
  assert.equal(named.anonymous, undefined);
  const reloaded = openProgress(storage, () => {}, temporary).data;
  assert.equal(reloaded.profiles.length, 1);
  assert.equal(reloaded.profiles[0].name, "Sam");
  assert.equal(
    reloaded.profiles[0].topics["maths:M10"].history[0].correct,
    true,
  );
  assert.equal(temporary.getItem("maths-anonymous-visit"), null);
});
test("adopting a visit into an existing name preserves both sets of original answers", () => {
  const adapter = openProgress(memory(), () => {}, memory());
  const first = answerVisit(adapter);
  const named = nameAnonymous(adapter.data, "Sam", true).profile;
  const original = structuredClone(named.topics["maths:M10"].pages.plain);
  const second = answerVisit(adapter);
  const visitId = second.profile.topics["maths:M10"].pages.plain.attempt;
  nameAnonymous(adapter.data, "Sam");
  const topic = named.topics["maths:M10"];
  assert.deepEqual(topic.pages.plain, original);
  assert.equal(topic.history.length, 2);
  assert.equal(topic.pageHistory.plain.previous.at(-1).attempt, visitId);
  assert.equal(adapter.data.profiles.length, 1);
  assert.equal(first.profile.id, named.id);
});
