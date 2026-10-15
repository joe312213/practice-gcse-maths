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
import {
  emptyStore,
  KEY,
  serializeStore,
} from "../website/src/lib/domain/profiles.mjs";
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
function setup(data = emptyStore(), content = bank, random = () => 0) {
  let view,
    writes = 0;
  const session = createSession({
    bank: content,
    data /** Fixture persistence callback; record a write or leave the store in memory. */,
    save: () =>
      writes++ /** Fixture random source; return a deterministic selection value. */,
    random,
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

test("an assessment draw is saved once and survives refresh with a different random source", () => {
  const f = setup(emptyStore(), bank, () => 0.15);
  correct(f);
  const saved = JSON.parse(JSON.stringify(f.view.page));
  const resumed = setup(JSON.parse(JSON.stringify(f.data)), bank, () => 0.85);
  assert.deepEqual(JSON.parse(JSON.stringify(resumed.view.page)), saved);
  const other = setup(emptyStore(), bank, () => 0.85);
  assert.notDeepEqual(other.view.page.items, saved.items);
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
  let stored = serializeStore(f.data);
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

test("new error pages have four distinct questions without replacing a saved three-question page", () => {
  const f = setup();
  f.session.switchMode("errors");
  assert.equal(f.view.page.size, 4);
  assert.equal(new Set(f.view.page.items.map((item) => item.id)).size, 4);
  const saved = f.data.profiles[0].topics["maths:M10"].pages.errors;
  saved.size = 3;
  saved.items = saved.items.slice(0, 3);
  const before = structuredClone(saved);
  const resumed = setup(f.data);
  resumed.session.switchMode("errors");
  assert.deepEqual(resumed.view.page, before);
});

test("ordinary page navigation restores saved attempts and responses without rescoring", () => {
  const f = setup();
  f.session.switchMode("plain");
  assert.equal(f.view.pageNavigation.index, 0);
  correct(f);
  const first = structuredClone(f.view.page);
  const historyCount = f.data.profiles[0].topics["maths:M10"].history.length;
  f.session.nextPage();
  assert.equal(f.view.page.count, 0);
  assert.equal(f.view.selected, 0);
  assert.equal(f.view.pageNavigation.index, 1);
  f.session.select(3);
  correct(f);
  const second = structuredClone(f.view.page);
  f.session.previousPage();
  assert.deepEqual(f.view.page, first);
  f.session.select(0);
  assert.equal(f.session.submitAnswer().duplicate, true);
  assert.equal(
    f.data.profiles[0].topics["maths:M10"].history.length,
    historyCount + 1,
  );
  // Reload with a page ahead: Next must restore it rather than discard its responses.
  const resumed = setup(JSON.parse(JSON.stringify(f.data)));
  resumed.session.switchMode("plain");
  resumed.session.nextPage();
  assert.deepEqual(resumed.view.page, JSON.parse(JSON.stringify(second)));
  resumed.session.previousPage();
  assert.deepEqual(resumed.view.page, JSON.parse(JSON.stringify(first)));
  resumed.session.switchMode("errors");
  assert.equal(resumed.view.pageNavigation.index, 0);
  resumed.session.switchMode("plain");
  resumed.session.nextPage();
  assert.deepEqual(resumed.view.page, JSON.parse(JSON.stringify(second)));
  resumed.session.chooseName("Other student", true);
  resumed.session.switchMode("plain");
  assert.equal(resumed.view.pageNavigation.index, 0);
});

test("three-page navigation stops at boundaries and remembers a separate page per level and stage", () => {
  const f = setup();
  for (const mode of ["plain", "scaffolded", "errors"]) {
    f.session.switchMode(mode);
    assert.equal(f.view.pageNavigation.total, 3);
    const first = structuredClone(f.view.page.items);
    f.session.previousPage();
    assert.deepEqual(f.view.page.items, first);
    f.session.nextPage();
    f.session.nextPage();
    assert.equal(f.view.pageNavigation.index, 2);
    const third = structuredClone(f.view.page.items);
    assert.ok(third.every((item) => !first.some((old) => old.id === item.id)));
    f.session.nextPage();
    assert.deepEqual(f.view.page.items, third);
    f.session.changeLevel(1);
    assert.equal(f.view.pageNavigation.index, 0);
    assert.ok(f.view.page.items.every((item) => item.level === 1));
    f.session.nextPage();
    f.session.changeLevel(0);
    assert.equal(f.view.pageNavigation.index, 2);
    assert.deepEqual(f.view.page.items, third);
    f.session.changeLevel(1);
    assert.equal(f.view.pageNavigation.index, 1);
  }
});

test("completed assessment stays locked across reload and transfer until explicit reassessment after seven days", async () => {
  const { REASSESS_DELAY } =
    await import("../website/src/lib/domain/assessment.mjs");
  const { exportProgress, parseProgress } =
    await import("../website/src/lib/domain/progress-transfer.mjs");
  let now = 1000,
    view;
  const data = emptyStore();
  let api = createSession({ bank, data, save() {}, now: () => now });
  api.subscribe((v) => (view = v));
  api.chooseName("Assessment learner", true);
  for (const item of view.page.items) {
    api.select(view.page.items.findIndex((q) => q.id === item.id));
    api.updateDraft({
      answer: bank.questions.find((q) => q.id === item.id).answer,
    });
    api.submitAnswer();
  }
  const attempt = view.page.attempt;
  assert.equal(view.page.complete, true);
  assert.equal(api.reassess(), false);
  const transferred = parseProgress(exportProgress(data.profiles[0], now));
  const imported = {
    schema: 2,
    last: transferred.key,
    profiles: [transferred],
  };
  api = createSession({ bank, data: imported, save() {}, now: () => now });
  api.subscribe((v) => (view = v));
  assert.equal(view.page.attempt, attempt);
  assert.equal(view.page.complete, true);
  assert.equal(view.assessment.correct, 6);
  assert.ok(
    imported.profiles[0].topics["maths:M10"].history.every(
      (r) => typeof r.raw === "string",
    ),
  );
  now += REASSESS_DELAY - 1;
  assert.equal(api.reassess(), false);
  now++;
  assert.equal(api.reassess(), true);
  assert.notEqual(view.page.attempt, attempt);
  assert.equal(view.page.count, 0);
  assert.equal(imported.profiles[0].topics["maths:M10"].history.length, 6);
});

test("refresh restores each ordinary stage and its saved page without rescoring", () => {
  const f = setup();
  for (const mode of [
    "plain",
    "scaffolded",
    "errors",
    "problem",
    "demo",
    "assessment",
  ]) {
    f.session.switchMode(mode);
    if (mode === "plain") {
      correct(f);
      f.session.nextPage();
    }
    const before = structuredClone(f.view.page);
    const history = structuredClone(
      f.data.profiles[0].topics["maths:M10"].history,
    );
    const data = structuredClone(f.data);
    const resumed = createSession({
      bank,
      data,
      save() {},
      random: () => 0.99,
    });
    let view;
    resumed.subscribe((v) => (view = v));
    assert.equal(view.mode, mode);
    assert.deepEqual(view.page, before);
    // The route calls switchTopic during startup too; this must retain the stage.
    resumed.switchTopic("M10");
    assert.equal(view.mode, mode);
    assert.deepEqual(view.page, before);
    assert.deepEqual(data.profiles[0].topics["maths:M10"].history, history);
  }
});

test("saved chevrons are isolated by learner/topic and invalid stages fall back safely", async () => {
  const division = JSON.parse(
    await readFile(
      new URL("../website/static/data/division.json", import.meta.url),
    ),
  );
  const data = emptyStore();
  const api = createSession({ bank, banks: [bank, division], data, save() {} });
  let view;
  api.subscribe((v) => (view = v));
  api.chooseName("First learner", true);
  api.switchMode("errors");
  api.switchTopic(division.topic);
  assert.equal(view.mode, "assessment");
  api.switchMode("demo");
  api.switchTopic(bank.topic);
  assert.equal(view.mode, "errors");
  api.chooseName("Second learner", true);
  assert.equal(view.mode, "assessment");
  api.switchMode("plain");
  api.chooseName("First learner");
  assert.equal(view.mode, "errors");
  api.switchTopic(division.topic);
  assert.equal(view.mode, "demo");
  data.profiles[0].topics["maths:M10"].lastMode = "unknown";
  api.switchTopic(bank.topic);
  assert.equal(view.mode, "assessment");
});
