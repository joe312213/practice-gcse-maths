/**
 * Purpose: Verify session actions, marking, assistance and profile-isolated state.
 *
 * Main contents:
 * - setup
 * - correct
 *
 * Used By: Node test runner.
 *
 * Uses: website/src/lib/application/session.mjs, website/src/lib/domain/profiles.mjs, website/src/lib/adapters/storage.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions), node:fs/promises (asynchronous file access).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createSession } from "../website/src/lib/application/session.mjs";
import { emptyStore, KEY } from "../website/src/lib/domain/profiles.mjs";
import { openProgress } from "../website/src/lib/adapters/storage.mjs";
const bank = JSON.parse(
  await readFile(
    new URL("../website/static/data/equations.json", import.meta.url),
  ),
);
/**
 * Create an isolated session fixture with injected deterministic dependencies.
 * Parameter data: mutable learner store.
 * Parameter content: question-bank fixture.
 * Calls: emptyStore, createSession.
 */
function setup(data = emptyStore(), content = bank) {
  let view,
    writes = 0;
  const session = createSession({
    bank: content,
    data /** Fixture persistence callback; record a write or leave the store in memory. */,
    save: () =>
      writes++ /** Fixture random source; return a deterministic selection value. */,
    random: () =>
      0 /** Fixture identifier source; return the configured attempt ID. */,
    uuid: () =>
      "test-attempt" /** Fixture clock; return the configured time in milliseconds. */,
    now: () => 1,
  });
  session.subscribe((value) => (view = value));
  session.chooseName("Student", true);
  return {
    session,
    data /**
     * Return the fixture's current view value.
     */,
    get view() {
      return view;
    } /**
     * Return the fixture's current writes value.
     */,
    get writes() {
      return writes;
    },
  };
}
/**
 * Submit the fixture's current authored answer.
 * Parameter fixture: session fixture.
 */
function correct(fixture) {
  const question = bank.questions.find(
    (q) => q.id === fixture.view.page.items[fixture.view.selected].id,
  );
  fixture.session.updateDraft({ answer: question.answer });
  return fixture.session.submitAnswer();
}
test("session composes with injected persistence and emits isolated view snapshots", () => {
  const f = setup();
  f.view.page.items.length = 0;
  f.session.updateDraft({ working: "typed method" });
  assert.equal(f.view.page.items.length, 6);
  assert.equal(
    f.data.profiles[0].topics["maths:M10"].pages.assessment.count,
    0,
  );
});
test("correct advances, wraps, clears drafts and cannot score a submitted item twice", () => {
  const f = setup();
  f.session.select(f.view.page.size - 1);
  f.session.updateDraft({ working: "method", points: 10 });
  assert.equal(correct(f).advanced, true);
  assert.equal(f.view.selected, 0);
  assert.equal(f.view.draft.working, "");
  f.session.select(f.view.page.size - 1);
  assert.equal(f.session.submitAnswer().duplicate, true);
  assert.equal(f.view.page.count, 1);
  assert.equal(f.data.profiles[0].topics["maths:M10"].history.length, 1);
});
test("invalid and wrong answers stay and preserve working drafts", () => {
  const f = setup();
  f.session.updateDraft({ answer: "1/0", working: "draft" });
  assert.equal(f.session.submitAnswer().invalid, true);
  assert.equal(f.view.page.count, 0);
  assert.equal(f.view.draft.working, "draft");
  f.session.updateDraft({ answer: "99999" });
  f.session.submitAnswer();
  assert.equal(f.view.selected, 0);
  f.session.nextPage();
});
test("subjects/topics isolate progress without a migration or app-global dependency", () => {
  const f = setup();
  correct(f);
  const other = setup(f.data, { ...bank, subject: "other" });
  assert.equal(other.view.page.count, 0);
  assert.equal(
    f.data.profiles[0].topics["maths:M10"].pages.assessment.count,
    1,
  );
  assert.equal(
    f.data.profiles[0].topics["other:M10"].pages.assessment.count,
    0,
  );
});
test("hints toggle locally, reset on navigation and retain assistance through reload and scoring", () => {
  const f = setup();
  f.session.switchMode("plain");
  const id = f.view.page.items[0].id;
  f.session.hint();
  assert.equal(f.view.hintVisible, true);
  assert.equal(f.view.page.assisted[id], true);
  f.session.hint();
  assert.equal(f.view.hintVisible, false);
  assert.equal(f.view.page.assisted[id], true);
  f.session.hint();
  f.session.select(1);
  assert.equal(f.view.hintVisible, false);
  f.session.select(0);
  assert.equal(f.view.page.assisted[id], true);
  const resumed = setup(f.data);
  resumed.session.switchMode("plain");
  assert.equal(resumed.view.hintVisible, false);
  assert.equal(resumed.view.page.assisted[id], true);
  correct(resumed);
  const history = resumed.data.profiles[0].topics["maths:M10"].history;
  assert.equal(history.at(-1).assisted, true);
  assert.equal(resumed.view.track.histories[0].length, 0);
});
test("new schema roundtrip preserves sessions, while corrupt storage never gets overwritten", () => {
  const f = setup();
  correct(f);
  let stored = JSON.stringify(f.data);
  const adapter = openProgress({
    /** Storage-read fixture; return configured stored text for the supplied key. */
    getItem: () =>
      stored /** Storage-write fixture; accept key/value and record the write for assertions. */,
    setItem: (key, value) => {
      assert.equal(key, KEY);
      stored = value;
    },
  });
  const resumed = setup(adapter.data);
  assert.equal(resumed.view.page.count, 1);
  let writes = 0,
    warning = "";
  const blocked = openProgress(
    {
      /** Storage-read fixture; return configured stored text for the supplied key. */
      getItem: () =>
        "{bad" /** Storage-write fixture; accept key/value and record the write for assertions. */,
      setItem: () => writes++,
    },
    (text) => (warning = text),
  );
  blocked.save(emptyStore());
  assert.equal(writes, 0);
  assert.match(warning, /without saving/);
});

test("demo speed is saved per profile, survives reload, and leaves learning history alone", () => {
  const f = setup();
  f.session.setDemoSpeed(1.5);
  assert.equal(f.view.demoSpeed, 1.5);
  assert.equal(f.view.page.count, 0);
  const resumed = setup(JSON.parse(JSON.stringify(f.data)));
  assert.equal(resumed.view.demoSpeed, 1.5);
  resumed.session.chooseName("Other learner", true);
  assert.equal(resumed.view.demoSpeed, 1);
  resumed.session.setDemoSpeed(2);
  resumed.session.chooseName("Student", true);
  assert.equal(resumed.view.demoSpeed, 1.5);
});
