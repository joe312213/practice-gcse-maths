/**
 * Purpose: Verify arithmetic marking, adaptive progression, profiles and demo playback without a browser.
 *
 * Main contents:
 * - answer
 *
 * Used By: Node test runner.
 *
 * Uses: website/src/lib/domain/engine.mjs, website/src/lib/domain/profiles.mjs, website/src/lib/domain/errors.mjs, website/src/lib/application/player.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions), node:fs/promises (asynchronous file access).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  scoringWindow,
  weights,
  success,
  newTrack,
  newPage,
  submit,
  resolveChoice,
  manualLevel,
  markAnswer,
} from "../website/src/lib/domain/engine.mjs";
import {
  emptyStore,
  chooseProfile,
  load,
  KEY,
} from "../website/src/lib/domain/profiles.mjs";
/**
 * Submit one synthetic outcome to the supplied track and page.
 * Parameter t: adaptive track fixture.
 * Parameter p: question-page fixture.
 * Parameter correct: whether the outcome is correct.
 * Parameter assisted: whether help was used.
 * Calls: submit.
 */
const answer = (t, p, correct = true, assisted = false) =>
  submit(t, p, { id: `q${p.count}`, level: p.level, correct, assisted });
test("specified weighted examples, zero padding and short-page denominators", () => {
  assert.deepEqual(weights(), [1, 1, 1, 1, 1, 2, 2, 3, 3, 3]);
  assert.equal(success(Array(5).fill(true)), 1300 / 18);
  assert.equal(success(Array(6).fill(true)), 1400 / 18);
  assert.equal(success([true, true, true], 3), 100);
  assert.deepEqual(weights(6), [1, 1, 1, 2, 2, 2]);
  assert.equal(success([], 3), 0);
  assert.throws(() => weights(11));
});
test("six successes start trial; four harder successes confirm; history stays separate", () => {
  const t = newTrack(),
    p = newPage();
  for (let i = 0; i < 6; i++) answer(t, p);
  assert.equal(p.level, 1);
  assert.equal(t.level, 0);
  assert.equal(p.trial.passed, 0);
  for (let i = 0; i < 4; i++) answer(t, p);
  assert.equal(t.level, 1);
  assert.equal(p.trial, null);
  assert.equal(p.complete, true);
  assert.equal(t.histories[0].length, 6);
  assert.equal(t.histories[1].length, 4);
});
test("failed trial reverts and next page requires five eligible reassessment answers", () => {
  const t = newTrack(),
    p = newPage();
  for (let i = 0; i < 6; i++) answer(t, p);
  answer(t, p, false);
  assert.equal(p.level, 0);
  assert.equal(t.reassess, 5);
  for (let i = 0; i < 3; i++) answer(t, p);
  assert.equal(t.level, 0);
  assert.equal(p.trial, null);
  assert.equal(t.reassess, 5);
  const next = newPage();
  for (let i = 0; i < 4; i++) answer(t, next);
  assert.equal(next.trial, null);
  answer(t, next);
  assert.equal(t.reassess, 0);
  assert.equal(next.level, 1);
});
test("assisted correct is neutral; assisted incorrect counts; duplicate is ignored", () => {
  const t = newTrack(),
    p = newPage();
  answer(t, p);
  const before = [...t.histories[0]];
  answer(t, p, true, true);
  assert.deepEqual(t.histories[0], before);
  answer(t, p, false, true);
  assert.deepEqual(t.histories[0], [true, false]);
  submit(t, p, { id: "q0", level: 0, correct: true });
  assert.equal(p.count, 3);
});
test("late promotion with no trial answers requires explicit choice", () => {
  const t = newTrack(),
    p = newPage();
  for (const c of [
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
  ])
    answer(t, p, c);
  assert.equal(p.pendingChoice, true);
  assert.equal(t.level, 0);
  resolveChoice(t, p, false);
  assert.equal(t.level, 0);
  assert.equal(p.pendingChoice, false);
});
test("one trial answer is insufficient for automatic confirmation", () => {
  const t = newTrack(),
    p = newPage();
  for (const c of [
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
  ])
    answer(t, p, c);
  assert.equal(p.pendingChoice, true);
  assert.equal(p.trial.passed, 1);
  resolveChoice(t, p, true);
  assert.equal(t.level, 1);
});
test("short pages promote with consent; tiny pages need three correct across attempts", () => {
  const t = newTrack(),
    p = newPage(3);
  for (let i = 0; i < 3; i++) answer(t, p);
  assert.equal(p.pendingChoice, true);
  resolveChoice(t, p, true);
  assert.equal(t.level, 1);
  const u = newTrack();
  for (let i = 0; i < 2; i++) {
    const page = newPage(1);
    answer(u, page);
    assert.equal(page.pendingChoice, false);
  }
  const third = newPage(1);
  answer(u, third);
  assert.equal(third.pendingChoice, true);
});
test("Confidence never promotes beyond its boundary; Start offers recap", () => {
  const t = newTrack(2),
    p = newPage(10, 2);
  for (let i = 0; i < 10; i++) answer(t, p);
  assert.equal(t.level, 2);
  assert.equal(p.trial, null);
  const u = newTrack(),
    q = newPage();
  for (let i = 0; i < 5; i++) answer(u, q, false);
  assert.match(q.notice, /recap/);
});
test("two consecutive lower-level answers reset recommendation; manual upward level is explicit", () => {
  const t = newTrack(2),
    p = newPage(10, 2);
  manualLevel(t, p, 0);
  answer(t, p);
  assert.equal(t.level, 2);
  answer(t, p);
  assert.equal(t.level, 0);
  manualLevel(t, p, 1);
  assert.equal(t.level, 1);
  assert.equal(t.manual, true);
});
test("pending trials survive JSON persistence and cannot be bypassed with manual level", () => {
  let t = newTrack(),
    p = newPage();
  for (let i = 0; i < 6; i++) answer(t, p);
  [t, p] = JSON.parse(JSON.stringify([t, p]));
  assert.throws(() => manualLevel(t, p, 2));
  answer(t, p, false);
  assert.equal(t.reassess, 5);
});
test("exact numeric marking accepts equivalent forms and rejects code/zero denominators", () => {
  for (const a of ["x = −2.5", "-5/2", "-2 1/2", "-2.500"])
    assert.deepEqual(markAnswer(a, "-2.5"), { valid: true, correct: true });
  assert.equal(markAnswer("0.3333333333", "1/3").correct, false);
  for (const a of ["", "1/0", "1+2", "alert(1)", "Infinity", "NaN"])
    assert.equal(markAnswer(a, "3").valid, false);
});
test("local profiles normalise names, suggest typos, remain isolated and preserve malformed storage", () => {
  const s = emptyStore();
  assert.deepEqual(chooseProfile(s, "Jo"), { matches: [] });
  const jo = chooseProfile(s, "Jo", true).profile;
  jo.topics["maths:M10"] = {
    tracks: { plain: newTrack(2) },
    pages: {},
    history: [],
  };
  assert.equal(chooseProfile(s, " jo ").profile, jo);
  assert.deepEqual(chooseProfile(s, "Joe"), { matches: ["Jo"] });
  const sam = chooseProfile(s, "Sam", true).profile;
  assert.deepEqual(sam.topics, {});
  assert.equal(s.last, "sam");
  let writes = 0;
  assert.throws(() =>
    load({
      /** Storage-read fixture; return configured stored text for the supplied key. */
      getItem: () =>
        "{broken" /** Storage-write fixture; accept key/value and record the write for assertions. */,
      setItem: () => writes++,
    }),
  );
  assert.equal(writes, 0);
  assert.equal(
    load({
      /** Storage-read fixture; return configured stored text for the supplied key. */
      getItem: (key) => (key === KEY ? JSON.stringify(s) : null),
    }).profiles.length,
    2,
  );
});
test("94 preserved source questions plus three web additions; all answers parse", async () => {
  const bank = JSON.parse(
    await readFile(
      new URL("../website/static/data/equations.json", import.meta.url),
    ),
  );
  assert.equal(bank.questions.length, 97);
  assert.equal(new Set(bank.questions.map((q) => q.id)).size, 97);
  for (let l = 0; l < 3; l++)
    assert.equal(
      bank.questions.filter((q) => q.type === "plain" && q.level === l).length,
      24,
    );
  for (const q of bank.questions) {
    assert.ok(q.balance.length >= 3);
    assert.equal(markAnswer(q.answer, q.answer).correct, true);
    if (q.type === "errors") assert.ok(q.correct_balance && q.correction);
  }
});
test("short reassessment blocks promotion until its required evidence is collected", () => {
  const t = newTrack();
  t.reassess = 3;
  const p = newPage(3);
  answer(t, p);
  answer(t, p);
  assert.equal(p.trial, null);
  assert.equal(t.reassess, 1);
  answer(t, p);
  assert.equal(t.reassess, 0);
  assert.equal(p.pendingChoice, true);
});
test("assisted answers cannot initiate an early promotion from a previously high score", () => {
  const t = newTrack();
  t.histories[0] = Array(10).fill(true);
  const p = newPage();
  for (let i = 0; i < 5; i++) answer(t, p, true, true);
  assert.equal(p.trial, null);
  assert.equal(t.level, 0);
});
test("error metadata identifies actual mistakes, not a valid alternative method", async () => {
  const { questions } = JSON.parse(
    await readFile(
      new URL("../website/static/data/equations.json", import.meta.url),
    ),
  );
  const q = questions.find((q) => q.id === "maths:M10-SE-C2-Q3");
  assert.equal(q.errors[0].row, 2); // dividing by 5 on row 2 is a valid first step
  assert.equal(
    q.stepOptions.find((o) => o.id === q.errors[0].correction).text,
    "x + 2 = 9",
  );
  for (const item of questions.filter((q) => q.type === "errors")) {
    assert.ok(item.errors.length >= 1);
    for (const e of item.errors) {
      assert.ok(e.row > 0 && e.row < item.balance.length);
      assert.ok(item.stepOptions.some((o) => o.id === e.correction));
    }
  }
});

import { markErrors } from "../website/src/lib/domain/errors.mjs";
import { createPlayer } from "../website/src/lib/application/player.mjs";
test("row, reason, corrected step and final answer all contribute to error marking", async () => {
  const { questions } = JSON.parse(
    await readFile(
      new URL("../website/static/data/equations.json", import.meta.url),
    ),
  );
  for (const q of questions.filter((q) => q.type === "errors")) {
    assert.equal(markErrors(q, q.errors, q.answer).correct, true, q.id);
    assert.equal(markErrors(q, q.errors, q.wrong).correct, false, q.id);
    assert.equal(
      markErrors(
        q,
        q.errors.map((e) => ({ ...e, reason: "not-the-reason" })),
        q.answer,
      ).correct,
      false,
    );
    assert.equal(
      markErrors(
        q,
        q.errors.map((e) => ({ ...e, row: 0 })),
        q.answer,
      ).correct,
      false,
    );
  }
  const q = questions.find((q) => q.errors?.length === 2);
  assert.equal(
    markErrors(q, q.errors.slice().reverse(), q.answer).correct,
    true,
  );
  assert.equal(
    markErrors(q, [q.errors[0], q.errors[0]], q.answer).correct,
    false,
  );
  assert.equal(markErrors(q, q.errors.slice(0, 1), q.answer).valid, false);
});
test("playback runs to end, pauses/resumes, restarts and cancels disposed timers", () => {
  let seq = 0,
    jobs = new Map(),
    last;
  const player = createPlayer({
    length: 4 /** Capture the emitted playback state for the test assertion. */,
    onFrame: (s) =>
      (last =
        s) /** Queue fn in the fake timer store; return its cancellation ID (delay is milliseconds). */,
    schedule: (fn) => {
      jobs.set(++seq, fn);
      return seq;
    } /** Remove the supplied timer ID from the fake timer store. */,
    cancel: (id) => jobs.delete(id),
  });
  /**
   * Execute and remove the next scheduled callback from the fake timer queue.
   */
  const tick = () => {
    const [id, fn] = jobs.entries().next().value;
    jobs.delete(id);
    fn();
  };
  player.play();
  assert.equal(last.step, 1);
  assert.equal(last.playing, true);
  tick();
  assert.equal(last.step, 2);
  player.pause();
  assert.equal(jobs.size, 0);
  player.play();
  assert.equal(last.step, 2);
  tick();
  tick();
  assert.equal(last.step, 4);
  assert.equal(last.playing, false);
  assert.equal(jobs.size, 0);
  player.play();
  assert.equal(last.step, 1);
  player.go(3);
  assert.equal(jobs.size, 0);
  player.play();
  player.dispose();
  assert.equal(jobs.size, 0);
  const saved = last;
  player.play();
  assert.equal(last, saved);
});
test("all demo/recap rows have authored reasons; Start guidance has fewer steps", async () => {
  const bank = JSON.parse(
    await readFile(
      new URL("../website/static/data/equations.json", import.meta.url),
    ),
  );
  assert.ok(
    bank.teaching.guidance[0].steps.length <
      bank.teaching.guidance[2].steps.length,
  );
  for (let i = 0; i < 3; i++) {
    const q = bank.questions.find((q) => q.type === "demo" && q.level === i);
    assert.equal(q.balance.length, bank.teaching.demoAnnotations[i].length);
    assert.equal(
      bank.recap[i].balance.length,
      bank.teaching.recapAnnotations[i].length,
    );
  }
  assert.match(bank.teaching.demoAnnotations[2][1], /every term/);
  assert.match(bank.teaching.recapAnnotations[2][1], /3 is a common factor/);
});

test("changing playback speed reschedules one timer without skipping a step", () => {
  let id = 0,
    jobs = new Map(),
    frame;
  const player = createPlayer({
    length: 3 /** Capture the emitted playback state for the test assertion. */,
    onFrame: (value) =>
      (frame =
        value) /** Queue fn in the fake timer store; return its cancellation ID (delay is milliseconds). */,
    schedule: (fn, delay) => {
      jobs.set(++id, { fn, delay });
      return id;
    } /** Remove the supplied timer ID from the fake timer store. */,
    cancel: (key) => jobs.delete(key),
  });
  player.play();
  player.setDelay(1300);
  assert.equal(jobs.size, 1);
  assert.equal([...jobs.values()][0].delay, 1300);
  assert.equal(frame.step, 1);
  const [key, job] = jobs.entries().next().value;
  jobs.delete(key);
  job.fn();
  assert.equal(frame.step, 2);
  assert.equal(jobs.size, 1);
  player.pause();
  player.setDelay(5200);
  assert.equal(jobs.size, 0);
  player.play();
  assert.equal(frame.step, 2);
  assert.equal([...jobs.values()][0].delay, 5200);
  player.dispose();
  assert.equal(jobs.size, 0);
});


test('independent scores retain the same ten-answer window for 9, 10 and 12-question pages', () => {
  const results = [];
  for (const size of [9, 10, 12]) {
    const track = newTrack(2), page = newPage(size, 2);
    let result;
    for (let i = 0; i < 9; i++) result = submit(track, page, { id: String(i), level: 2, correct: i % 3 !== 0, window: scoringWindow("plain", size) });
    results.push(result.rate);
    for (let i = 9; i < size; i++) submit(track, page, { id: String(i), level: 2, correct: true, window: scoringWindow("plain", size) });
    assert.equal(page.complete, true);
    assert.equal(track.histories[2].length, Math.min(size, 10));
  }
  assert.equal(results[0], results[1]);
  assert.equal(results[1], results[2]);
});
