/**
 * Purpose: Verify temporary working restoration and its separation from durable progress.
 *
 * Main contents:
 * - Cache expiry, isolation, storage failures and session restoration scenarios.
 *
 * Used By: Node test runner.
 *
 * Uses: working-cache adapter, session, profiles and the equation bank.
 *
 * Libs: node:test, node:assert/strict and node:fs/promises for tests, assertions and fixture loading.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createWorkingCache,
  WORKING_TTL,
} from "../website/src/lib/adapters/working-cache.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
import { emptyStore } from "../website/src/lib/domain/profiles.mjs";
const bank = JSON.parse(
  await readFile(
    new URL("../website/static/data/equations.json", import.meta.url),
  ),
);
function storage() {
  const data = new Map();
  return {
    get length() {
      return data.size;
    },
    key: (i) => [...data.keys()][i],
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}
test("working survives cache recreation, expires after three hours and is excluded from progress", () => {
  let now = 10;
  const temporary = storage(),
    data = emptyStore();
  function session() {
    let view;
    const api = createSession({
      bank,
      data,
      save() {},
      workingCache: createWorkingCache(
        temporary,
        () => {},
        () => now,
      ),
    });
    api.subscribe((next) => (view = next));
    api.chooseName("Student", true);
    return {
      api,
      get view() {
        return view;
      },
    };
  }
  const first = session();
  const stroke = {
    tool: "pen",
    colour: "red",
    points: [
      [12, 20],
      [30, 40],
    ],
  };
  first.api.updateDraft({
    working: "subtract six",
    strokes: [stroke],
    points: 2,
    canvasHeight: 360,
  });
  first.api.select(1);
  assert.equal(first.view.draft.working, "");
  first.api.select(0);
  assert.equal(first.view.draft.working, "subtract six");
  assert.equal(session().view.draft.canvasHeight, 360);
  assert.deepEqual(session().view.draft.strokes, [stroke]);
  assert.ok(!JSON.stringify(data).includes("subtract six"));
  now += WORKING_TTL;
  assert.equal(session().view.draft.working, "");
  assert.equal(temporary.length, 0);
});
test("working cache contains no final answers and keeps learner/attempt keys separate", () => {
  const cache = createWorkingCache(storage());
  cache.save("learner-a/attempt-a/q1", {
    answer: "17",
    working: "a step",
    strokes: [],
    points: 0,
  });
  assert.equal(cache.load("learner-b/attempt-a/q1"), null);
  assert.equal(cache.load("learner-a/attempt-b/q1"), null);
  assert.equal(cache.load("learner-a/attempt-a/q1").answer, undefined);
});

test("cache reads are isolated and only edits extend the current expiry", () => {
  let now = 0;
  const cache = createWorkingCache(
    storage(),
    () => {},
    () => now,
  );
  const draft = {
    working: "first step",
    strokes: [{ points: [[10, 20]], tool: "pen", colour: "red" }],
    points: 1,
  };
  cache.save("q1", draft);
  draft.strokes[0].points[0][0] = 999;
  const loaded = cache.load("q1");
  assert.equal(loaded.strokes[0].points[0][0], 10);
  loaded.working = "not an edit";
  now = WORKING_TTL - 1;
  assert.equal(cache.load("q1").working, "first step");
  now = WORKING_TTL;
  assert.equal(cache.load("q1"), null, "reading must not extend expiry");
  cache.save("q1", { ...draft, working: "second step" });
  now += WORKING_TTL - 1;
  assert.equal(cache.load("q1").working, "second step");
  now++;
  assert.equal(cache.load("q1"), null);
});

test("blocked storage retains current working in memory and warns once", () => {
  let now = 0;
  const warnings = [];
  const blocked = {
    get length() {
      throw Error("Blocked");
    },
    getItem() {
      throw Error("Blocked");
    },
    setItem() {
      throw Error("Blocked");
    },
  };
  const cache = createWorkingCache(
    blocked,
    (message) => warnings.push(message),
    () => now,
  );
  cache.save("q1", { working: "still available", strokes: [], points: 0 });
  assert.equal(cache.load("q1").working, "still available");
  assert.equal(cache.load("q2"), null);
  assert.equal(warnings.length, 1);
  now = WORKING_TTL;
  assert.equal(cache.load("q1"), null);
});

test("working edits avoid unrelated reads until expiry and retain renewed records", () => {
  let now = 0,
    reads = 0;
  const temporary = storage();
  const read = temporary.getItem;
  temporary.getItem = (key) => {
    reads++;
    return read(key);
  };
  temporary.setItem("unrelated", "keep");
  temporary.setItem(
    "maths-working-v1:expired",
    JSON.stringify({ expiresAt: 5, working: { working: "old" } }),
  );
  const cache = createWorkingCache(
    temporary,
    () => {},
    () => now,
  );
  cache.save("renewed", { working: "first", strokes: [], points: 0 });
  reads = 0;
  now = 1;
  cache.save("renewed", { working: "latest", strokes: [], points: 0 });
  assert.equal(reads, 0, "editing must not parse unrelated cached drawings");
  now = 5;
  assert.equal(cache.load("expired"), null);
  assert.equal(temporary.getItem("maths-working-v1:expired"), null);
  assert.equal(cache.load("renewed").working, "latest");
  now = WORKING_TTL;
  assert.equal(
    cache.load("renewed").working,
    "latest",
    "renewal moves the deadline",
  );
  now++;
  assert.equal(
    cache.load("renewed"),
    null,
    "renewed storage and memory both expire",
  );
  assert.equal(temporary.length, 1);
  assert.equal(temporary.getItem("unrelated"), "keep");
});
