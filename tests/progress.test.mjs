/**
 * Purpose: Verify progress aggregation, revision recommendations and learner data transfer.
 *
 * Main contents:
 * - uid
 * - learner
 * - answers
 *
 * Used By: Node test runner.
 *
 * Uses: website/src/lib/domain/progress.mjs, website/src/lib/domain/revision.mjs, website/src/lib/domain/progress-transfer.mjs, website/src/lib/domain/engine.mjs, website/src/lib/domain/practice-code.mjs, website/src/lib/application/session.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions), node:fs/promises (asynchronous file access).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  topicProgress,
  weekKey,
  weeklyProgress,
  backupStatus,
  recordExport,
} from "../website/src/lib/domain/progress.mjs";
import {
  maintainRecommendations,
  completeRecommendation,
} from "../website/src/lib/domain/revision.mjs";
import {
  exportProgress,
  parseProgress,
  importProgress,
  exportCsv,
} from "../website/src/lib/domain/progress-transfer.mjs";
import { newTrack } from "../website/src/lib/domain/engine.mjs";
import { decodePracticeSet } from "../website/src/lib/domain/practice-code.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
const catalogue = JSON.parse(
  await readFile(
    new URL("../website/src/lib/content/practice-pages.json", import.meta.url),
  ),
);
catalogue.topics = catalogue.topics.filter((topic) => topic.bank === "M10");
const bank = JSON.parse(
  await readFile(
    new URL("../website/static/data/equations.json", import.meta.url),
  ),
);
let uidCount = 0; /**
 * Return the next deterministic recommendation identifier.
 */
const uid = () => `recommendation-${++uidCount}`;
const now = Date.parse("2026-10-04T12:00:00Z");
/**
 * Return an empty learner fixture with plain and error tracks.
 * Calls: newTrack.
 */
function learner() {
  return {
    name: "Student",
    key: "student",
    topics: {
      "maths:M10": {
        tracks: { plain: newTrack(), errors: newTrack() },
        pages: {},
        history: [],
      },
    },
  };
}
/**
 * Append count synthetic history events of the specified type, outcome and timestamp.
 * Parameter profile: learner record.
 * Parameter type: question-type code or activity ID.
 * Parameter count: number of fixture answers.
 * Parameter correct: whether the outcome is correct.
 * Parameter at: answer timestamp in milliseconds.
 */
function answers(profile, type, count = 10, correct = true, at = now) {
  for (let i = 0; i < count; i++)
    profile.topics["maths:M10"].history.push({
      attempt: "a" + i,
      question: "q" + i,
      type,
      level: 0,
      correct,
      assisted: false,
      at,
    });
}
test("topic stages separate evidence, weighted success, total count and staleness", () => {
  const p = learner();
  let row = topicProgress(p, catalogue, now)[0];
  assert.equal(row.status, "missing");
  assert.equal(row.stages.length, 3);
  answers(p, "plain");
  answers(p, "errors", 10, false);
  row = topicProgress(p, catalogue, now)[0];
  assert.equal(row.status, "amber");
  assert.equal(row.total, 20);
  assert.equal(row.rate, 200 / 3);
  p.topics["maths:M10"].history.forEach((r) => (r.correct = false));
  assert.equal(topicProgress(p, catalogue, now)[0].status, "red");
  p.topics["maths:M10"].history.forEach((r) => {
    r.correct = true;
    r.at = now - 29 * 86400000;
  });
  row = topicProgress(p, catalogue, now)[0];
  assert.equal(row.status, "green");
  assert.equal(row.stale, true);
  answers(p, "assessment", 1);
  row = topicProgress(p, catalogue, now)[0];
  assert.equal(row.total, 21);
  assert.equal(row.last, now);
  assert.equal(row.stale, true);
  p.topics["maths:M10"].history
    .filter((r) => r.type === "plain")
    .forEach((r) => (r.assisted = true));
  row = topicProgress(p, catalogue, now)[0];
  assert.equal(row.missing, true);
  assert.equal(row.stages[0].breakdown[0].count, 0);
});
test("recommendations rank missing then low success then stale and persist until completion", () => {
  const p = learner();
  answers(p, "plain", 10, false);
  let list = maintainRecommendations(p, catalogue, now, uid);
  const firstId = list[0].id;
  let code = decodePracticeSet(list[0].code);
  assert.equal(code.pages.length, 4);
  assert.equal(code.pages[0].type, 1);
  assert.equal(list[0].reasons[0].reason, "Missing data");
  answers(p, "errors");
  assert.equal(maintainRecommendations(p, catalogue, now, uid)[0].id, firstId);
  assert.equal(
    completeRecommendation(
      p,
      { recommendationId: firstId, finished: null },
      now,
    ),
    false,
  );
  list[0].openedAt = now;
  assert.equal(
    completeRecommendation(
      p,
      { recommendationId: firstId, finished: "complete" },
      now,
    ),
    true,
  );
  assert.equal(
    completeRecommendation(
      p,
      { recommendationId: firstId, finished: "complete" },
      now,
    ),
    false,
  );
  list = maintainRecommendations(p, catalogue, now, uid);
  assert.equal(list.length, 4);
  assert.equal(list[3].reasons[0].reason, "Recent success below 75%");
  const stale = learner();
  answers(stale, "plain", 10, true, now - 30 * 86400000);
  answers(stale, "errors");
  assert.equal(
    maintainRecommendations(stale, catalogue, now, uid)[0].reasons[0].reason,
    "Stale data",
  );
});
test("weekly records use UK Mondays across daylight-saving changes, once per completed recommendation", () => {
  assert.equal(weekKey(Date.parse("2026-10-04T23:30:00Z")), "2026-10-05");
  assert.equal(weekKey(Date.parse("2026-10-25T23:30:00Z")), "2026-10-19");
  const p = learner();
  p.revision = {
    recommendations: [
      { completedAt: now },
      { completedAt: now - 7 * 86400000 },
      { completedAt: now - 7 * 86400000 },
      { completedAt: null },
    ],
  };
  const w = weeklyProgress(p, now);
  assert.equal(w.current, 1);
  assert.equal(w.best, 2);
});
test("progress transfer round-trips data and identity; invalid/colliding imports cannot overwrite silently", () => {
  const p = learner();
  answers(p, "plain");
  maintainRecommendations(p, catalogue, now, uid);
  const restored = parseProgress(exportProgress(p, now));
  assert.equal(restored.name, p.name);
  assert.deepEqual(restored.topics, p.topics);
  assert.deepEqual(restored.revision, p.revision);
  const store = { profiles: [p], last: p.key };
  assert.throws(() => importProgress(store, restored), /Confirm replacement/);
  importProgress(store, restored, true);
  assert.equal(store.profiles.length, 1);
  const bad = JSON.parse(exportProgress(p));
  bad.topics["maths:M10"].tracks.plain.histories[0] = ["not boolean"];
  assert.throws(() => parseProgress(JSON.stringify(bad)), /Invalid/);
  bad.version = 42;
  assert.throws(() => parseProgress(JSON.stringify(bad)), /Invalid/);
  assert.throws(() => parseProgress("{"));
  p.name = '=formula,"quoted"';
  const csv = exportCsv(p);
  assert.match(csv, /'=formula,""quoted""/);
  assert.equal(csv.split("\r\n").length, 12);
});
test("recommended session resumes, recognises completion once, and retains weekly history", () => {
  const p = learner();
  const rec = maintainRecommendations(p, catalogue, now, uid)[0];
  const data = { schema: 2, last: p.key, profiles: [p] };
  let view,
    count = 0;
  const options = {
    bank,
    catalogue,
    data /** Fixture persistence callback; record a write or leave the store in memory. */,
    save: () => {} /** Fixture clock; return the configured time in milliseconds. */,
    now: () =>
      now /** Fixture identifier source; return the configured attempt ID. */,
    uuid: () =>
      `attempt-${++count}` /** Fixture random source; return a deterministic selection value. */,
    random: () => 0,
  };
  let session = createSession(options);
  session.subscribe((value) => (view = value));
  session.startPracticeSet(rec.code, rec.id);
  assert.equal(rec.openedAt, now);
  assert.equal(view.message, "Recommended practice set");
  assert.equal(weeklyProgress(p, now).current, 0);
  const attempt = view.page.attempt;
  session = createSession(options);
  session.subscribe((value) => (view = value));
  session.startPracticeSet(rec.code, rec.id);
  assert.equal(view.page.attempt, attempt);
  for (let index = 0; index < 4; index++) {
    while (!view.page.complete) {
      const q = bank.questions.find(
        (q) => q.id === view.page.items[view.selected].id,
      );
      session.updateDraft({ answer: q.answer, errors: q.errors ?? [] });
      session.submitAnswer();
    }
    if (view.page.pendingChoice) session.resolvePromotion(false);
    if (index < 3) session.goSetPage(index + 1);
  }
  assert.equal(view.practiceSet.finished, "complete");
  assert.match(view.message, /Well done!/);
  assert.equal(weeklyProgress(p, now).current, 1);
  session.startPracticeSet(rec.code, rec.id);
  assert.equal(weeklyProgress(p, now).current, 1);
  assert.throws(
    () => session.startPracticeSet(rec.code, "unknown"),
    /not found/,
  );
});

test("three pending recommendations refill on load, stop at 15 completions, and allow explicit extras", () => {
  const p = learner();
  let list = maintainRecommendations(p, catalogue, now, uid);
  assert.equal(list.length, 3);
  for (let i = 0; i < 15; i++) {
    const rec = list.find((r) => r.completedAt === null);
    rec.openedAt = now;
    rec.completedAt = now;
    list = maintainRecommendations(p, catalogue, now, uid);
  }
  const length = list.length;
  maintainRecommendations(p, catalogue, now, uid);
  assert.equal(list.length, length);
  assert.equal(list.filter((r) => r.completedAt === null).length, 2);
  maintainRecommendations(p, catalogue, now, uid, true);
  assert.equal(list.length, length + 1);
  assert.equal(list.filter((r) => r.completedAt === null).length, 3);
  list
    .filter((r) => r.completedAt === null)
    .forEach((r) => {
      r.openedAt = now;
      r.completedAt = now;
    });
  const prior = list.length;
  maintainRecommendations(p, catalogue, now + 7 * 86400000, uid);
  assert.equal(list.length, prior + 3);
});

test("minimum evidence does not replace short-page success weighting or cap stored outcomes", () => {
  const p = learner();
  answers(p, "errors", 3);
  p.topics["maths:M10"].history.forEach((r) => (r.pageSize = 3));
  let row = topicProgress(p, catalogue, now)[0];
  assert.equal(
    row.stages[0].breakdown.find((r) => r.mode === "errors").rate,
    100,
  );
  assert.equal(row.status, "missing");
  answers(p, "errors", 30, false);
  row = topicProgress(p, catalogue, now)[0];
  assert.equal(row.total, 33);
  assert.equal(
    row.stages[0].breakdown.find((r) => r.mode === "errors").count,
    33,
  );
});
test("switching recommended sets preserves separate page attempts", () => {
  const p = learner();
  const recs = maintainRecommendations(p, catalogue, now, uid);
  const data = { schema: 2, last: p.key, profiles: [p] };
  let view,
    count = 0;
  const session = createSession({
    bank,
    catalogue,
    data /** Fixture persistence callback; record a write or leave the store in memory. */,
    save: () => {} /** Fixture clock; return the configured time in milliseconds. */,
    now: () =>
      now /** Fixture identifier source; return the configured attempt ID. */,
    uuid: () =>
      `switch-${++count}` /** Fixture random source; return a deterministic selection value. */,
    random: () => 0,
  });
  session.subscribe((value) => (view = value));
  session.startPracticeSet(recs[0].code, recs[0].id);
  const first = view.page.attempt;
  const q = bank.questions.find(
    (q) => q.id === view.page.items[view.selected].id,
  );
  session.updateDraft({ answer: q.answer, errors: q.errors ?? [] });
  session.submitAnswer();
  session.startPracticeSet(recs[1].code, recs[1].id);
  assert.notEqual(view.page.attempt, first);
  session.startPracticeSet(recs[0].code, recs[0].id);
  assert.equal(view.page.attempt, first);
  assert.equal(view.page.count, 1);
  const copy = parseProgress(exportProgress(p));
  assert.equal(copy.revision.recommendations[0].savedAttempt, undefined);
});

test("export reminders become due at ten days, persist per learner and reset only for JSON", () => {
  const p = learner();
  answers(p, "plain", 1, true, now - 10 * 86400000);
  assert.equal(backupStatus(p, now - 1).due, false);
  assert.equal(backupStatus(p, now).due, true);
  recordExport(p, "json", now);
  assert.equal(backupStatus(p, now).due, false);
  assert.equal(p.backup.lastExportAt, now);
  const restored = parseProgress(exportProgress(p, now));
  assert.equal(backupStatus(restored, now + 10 * 86400000).due, true);
  recordExport(restored, "csv", now + 10 * 86400000);
  assert.equal(backupStatus(restored, now + 10 * 86400000).due, true);
  assert.equal(restored.backup.lastExportType, "json");
  assert.equal(restored.backup.lastExportAt, now);
  assert.equal(backupStatus(p, now + 10 * 86400000).due, true); // Separate learner data was not altered.
  const legacy = learner();
  legacy.backup = {
    since: now - 11 * 86400000,
    lastExportAt: now,
    lastExportType: "csv",
  };
  assert.equal(backupStatus(legacy, now).due, true);
  assert.equal(backupStatus(learner(), now).due, false);
});
