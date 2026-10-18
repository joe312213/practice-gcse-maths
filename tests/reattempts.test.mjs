/**
 * Purpose: Retry outcomes must never rewrite original results or leak early practice into
 * progress.
 *
 * Main contents:
 * - fixture, reload.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/scripts/read-topic-bank.mjs, website/src/lib/application/session.mjs,
 * website/src/lib/domain/profiles.mjs, website/src/lib/domain/reattempts.mjs,
 * website/src/lib/domain/progress.mjs, website/src/lib/domain/practice-history.mjs,
 * website/src/lib/domain/assessment.mjs, website/src/lib/domain/progress-transfer.mjs,
 * website/src/lib/domain/practice-code.mjs, website/src/lib/content/practice-pages.json.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
import { emptyStore } from "../website/src/lib/domain/profiles.mjs";
import {
  REATTEMPT_POLICY,
  latestResponse,
} from "../website/src/lib/domain/reattempts.mjs";
import { topicProgress } from "../website/src/lib/domain/progress.mjs";
import { practiceHistory } from "../website/src/lib/domain/practice-history.mjs";
import { assessmentStatus } from "../website/src/lib/domain/assessment.mjs";
import {
  exportProgress,
  parseProgress,
} from "../website/src/lib/domain/progress-transfer.mjs";
import { encodePracticeSet } from "../website/src/lib/domain/practice-code.mjs";
import catalogue from "../website/src/lib/content/practice-pages.json" with { type: "json" };
const bank = await readTopicBank("solving-equations");
const delay = REATTEMPT_POLICY["count-reattempt-mintime"];
/** Create deterministic injected state, time and dependencies for this test module; returns controls for the exercised lifecycle. */
function fixture() {
  let time = Date.UTC(2026, 9, 17, 10),
    id = 0,
    view,
    session;
  let data = emptyStore();
  function reload() {
    data = JSON.parse(JSON.stringify(data));
    session = createSession({
      bank,
      banks: [bank],
      catalogue,
      data,
      save() {},
      now: () => time,
      uuid: () => `retry-${++id}`,
      random: () => 0,
    });
    session.subscribe((value) => (view = value));
    if (!view.profile) session.chooseName("Retry learner", true);
  }
  reload();
  return {
    get session() {
      return session;
    },
    get view() {
      return view;
    },
    get profile() {
      return data.profiles[0];
    },
    get saved() {
      return data.profiles[0].topics["maths:M10"];
    },
    get time() {
      return time;
    },
    advance(ms) {
      time += ms;
    },
    reload,
    question() {
      return bank.questions.find(
        (q) => q.id === view.page.items[view.selected].id,
      );
    },
    answer(correct) {
      session.updateDraft({
        answer: correct ? this.question().answer : "999999",
      });
      return session.submitAnswer();
    },
  };
}
test("early retries survive reload, preserve originals and do not affect any progress measure", () => {
  const f = fixture();
  f.session.switchMode("plain");
  const id = f.question().id;
  f.answer(false);
  const original = structuredClone(f.view.page.responses[id]);
  const track = structuredClone(f.view.track);
  const progress = topicProgress(f.profile, catalogue, f.time);
  const weekly = practiceHistory(f.profile, "", "plain", f.time);
  assert.equal(f.session.retryQuestion(), true);
  f.answer(true);
  f.session.select(0);
  assert.equal(latestResponse(f.view.page, id).earlyReattempt, true);
  assert.equal(latestResponse(f.view.page, id).correct, true);
  assert.deepEqual(f.view.page.responses[id], original);
  assert.equal(f.view.page.count, 1);
  assert.deepEqual(f.view.track, track);
  assert.deepEqual(topicProgress(f.profile, catalogue, f.time), progress);
  assert.deepEqual(practiceHistory(f.profile, "", "plain", f.time), weekly);
  f.reload();
  assert.equal(latestResponse(f.view.page, id).earlyReattempt, true);
  assert.equal(f.session.submitAnswer().duplicate, true);
  const imported = parseProgress(exportProgress(f.profile, f.time));
  assert.deepEqual(imported.topics["maths:M10"].history, f.saved.history);
  assert.deepEqual(topicProgress(imported, catalogue, f.time), progress);
});
test("the boundary is inclusive, and another wrong retry restarts the wait", () => {
  const f = fixture();
  f.session.switchMode("plain");
  const id = f.question().id;
  f.answer(false);
  f.advance(delay - 1);
  f.session.retryQuestion();
  f.answer(false);
  assert.equal(f.saved.history.at(-1).earlyReattempt, true);
  f.advance(1);
  f.session.retryQuestion();
  f.answer(true);
  f.session.select(0);
  assert.equal(latestResponse(f.view.page, id).earlyReattempt, true);
  f.advance(delay - 1);
  f.session.retryQuestion();
  f.answer(true);
  f.session.select(0);
  assert.equal(latestResponse(f.view.page, id).earlyReattempt, undefined);
  assert.deepEqual(f.view.track.histories[0], [false, true]);
  assert.equal(f.view.page.count, 1);
  assert.equal(f.session.retryQuestion(), false);
  assert.equal(f.session.submitAnswer().duplicate, true);
});
test("restarting a whole page cannot bypass the delay or trigger promotion from early answers", () => {
  const f = fixture();
  f.session.switchMode("plain");
  for (let i = 0; i < f.view.page.size; i++) {
    f.session.select(i);
    f.answer(false);
  }
  const track = structuredClone(f.view.track);
  f.session.restartPage();
  for (let i = 0; i < f.view.page.size; i++) f.answer(true);
  assert.equal(f.view.page.complete, true);
  assert.ok(
    Object.values(f.view.page.responses).every((r) => r.earlyReattempt),
  );
  assert.deepEqual(f.view.track, track);
  assert.equal(f.view.page.pendingChoice, false);
});
test("late assisted retries stay excluded and abandoning a retry does not unlock answers", () => {
  const f = fixture();
  f.session.switchMode("plain");
  f.answer(false);
  f.session.retryQuestion();
  f.session.select(1);
  f.session.select(0);
  assert.equal(f.session.submitAnswer().duplicate, true);
  f.advance(delay);
  f.session.retryQuestion();
  f.session.hint();
  f.answer(true);
  assert.deepEqual(f.view.track.histories[0], [false]);
  assert.equal(f.saved.history.at(-1).assisted, true);
});
test("assessment retries leave the original baseline and seven-day lock unchanged", () => {
  const f = fixture();
  f.answer(false);
  const original = structuredClone(f.view.page.responses);
  assert.equal(f.session.retryQuestion(), true);
  f.answer(true);
  assert.deepEqual(f.view.page.responses, original);
  assert.equal(f.view.page.count, 1);
  f.session.select(0);
  for (let i = 1; i < f.view.page.size; i++) {
    f.session.select(i);
    f.answer(true);
  }
  const baseline = assessmentStatus(f.saved.history, f.time);
  f.session.select(0);
  f.advance(delay);
  f.session.retryQuestion();
  f.answer(true);
  assert.deepEqual(assessmentStatus(f.saved.history, f.time), baseline);
  assert.equal(f.saved.history.at(-1).type, "plain");
  assert.deepEqual(f.saved.tracks.plain.histories[0], [true]);
  assert.equal(
    Object.values(f.view.page.responses).filter((r) => r.correct).length,
    5,
  );
  assert.equal(f.view.page.count, 6);
});
test("finished timed sets allow practice retries without rewriting the set result", () => {
  const f = fixture();
  const topic = catalogue.topics.find((t) => t.bank === "M10");
  const code = encodePracticeSet({
    level: 0,
    timing: 1,
    pages: [{ topic: topic.code, type: 0, slot: 0 }],
  });
  f.session.startPracticeSet(code);
  f.answer(false);
  const original = structuredClone(f.view.page.responses);
  assert.equal(f.session.retryQuestion(), true);
  f.answer(true);
  assert.deepEqual(f.view.page.responses, original);
  assert.equal(f.view.page.count, 1);
  f.session.select(0);
  f.advance(24 * 3600000);
  f.session.tick();
  assert.equal(f.view.practiceSet.finished, "expired");
  assert.equal(f.session.retryQuestion(), true);
  f.answer(true);
  assert.equal(f.view.practiceSet.finished, "expired");
  assert.equal(f.view.page.count, 1);
  assert.equal(f.view.page.responses[f.view.page.items[0].id].correct, false);
});

test("error-spotting retries still require every reason as well as the corrected answer", () => {
  const f = fixture();
  f.session.switchMode("errors");
  const q = f.question();
  f.session.updateDraft({ answer: q.answer, errors: [] });
  assert.equal(f.session.submitAnswer().correct, false);
  f.session.retryQuestion();
  f.session.updateDraft({
    answer: q.answer,
    errors: q.errors.map(({ location, reason }) => ({ location, reason })),
  });
  assert.equal(f.session.submitAnswer().correct, true);
  assert.deepEqual(f.view.track.histories[0], [false]);
  assert.equal(f.saved.history.at(-1).earlyReattempt, true);
});
