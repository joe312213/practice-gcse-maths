/**
 * Purpose: Verify change-selected verification dependencies and cache invalidation.
 *
 * Main contents:
 * - selected
 *
 * Used By: Node test runner.
 *
 * Uses: website/scripts/verification/plan.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { plan, isFormatInput } from "../website/scripts/verification/plan.mjs";

const initial = {
  "HANDOFF.md": "a",
  "website/src/lib/styles/theme-tokens.css": "a",
  "website/src/lib/styles/components.css": "a",
  "website/src/lib/application/session.mjs": "a",
  "website/src/lib/domain/engine.mjs": "a",
  "website/src/lib/components/teaching/ShowDemo.svelte": "a",
  "website/scripts/verification/plan.mjs": "a",
};
const cached = Object.fromEntries(
  plan(initial).map((job) => [job.id, job.hash]),
);
/**
 * Return verification job IDs selected for the supplied file fingerprints and cache.
 * Parameter files: path-to-fingerprint map.
 * Parameter cache: successful verification fingerprints.
 * Calls: plan.
 */
const selected = (files, cache = cached) =>
  plan(files, cache)
    .filter((job) => job.run)
    .map((job) => job.id);

test("unchanged successful inputs skip every job; docs and theme changes stay narrow", () => {
  assert.deepEqual(selected(initial), []);
  assert.deepEqual(selected({ ...initial, "HANDOFF.md": "b" }), ["docs"]);
  assert.deepEqual(
    selected({ ...initial, "website/src/lib/styles/theme-tokens.css": "b" }),
    ["new-topics", "method-playback", "colours", "practice-sets"],
  );
  assert.deepEqual(
    selected({ ...initial, "website/src/lib/styles/components.css": "b" }),
    [
      "new-topics",
      "presentation",
      "method-playback",
      "colours",
      "practice-sets",
      "progress",
    ],
  );
});
test("logic and demo changes use their actual verification families", () => {
  assert.deepEqual(
    selected({ ...initial, "website/src/lib/domain/engine.mjs": "b" }),
    [
      "new-topics",
      "logic",
      "bank",
      "svelte",
      "practice-sets",
      "progress",
      "integration",
    ],
  );
  assert.deepEqual(
    selected({
      ...initial,
      "website/src/lib/components/teaching/ShowDemo.svelte": "b",
    }),
    ["new-topics", "svelte", "presentation", "method-playback"],
  );
});
test("deleted/new files, failed jobs, changed policy and environment invalidate evidence", () => {
  const removed = { ...initial };
  delete removed["website/src/lib/styles/components.css"];
  assert.deepEqual(selected(removed), [
    "new-topics",
    "presentation",
    "method-playback",
    "colours",
    "practice-sets",
    "progress",
  ]);
  assert.ok(
    selected({ ...initial, "tests/new.test.mjs": "new" }).includes("logic"),
  );
  const failed = { ...cached };
  delete failed.colours;
  assert.deepEqual(selected(initial, failed), ["colours"]);
  assert.equal(
    selected({ ...initial, "website/scripts/verification/plan.mjs": "b" })
      .length,
    plan(initial).length,
  );
  assert.ok(plan(initial, cached, "new runtime").every((job) => job.run));
});

test("moved startup and history/session dependencies select their browser checks", () => {
  const cases = [
    ["website/src/lib/styles/breakpoints.css", "presentation"],
    ["website/src/lib/styles/breakpoints.css", "startup"],
    ["website/src/lib/styles/breakpoints.css", "progress"],
    ["website/src/lib/components/practice/TopicPractice.svelte", "startup"],
    ["website/src/lib/components/ui/ThemeControls.svelte", "startup"],
    ["website/src/lib/components/ui/SiteHeader.svelte", "startup"],
    ["website/src/lib/domain/practice-history.mjs", "progress"],
    ["website/src/lib/domain/practice-time.mjs", "progress"],
    ["website/src/lib/domain/practice-code.mjs", "progress"],
    ["website/src/lib/domain/errors.mjs", "integration"],
    ["website/src/lib/domain/profiles.mjs", "integration"],
  ];
  for (const [path, required] of cases) {
    const files = { ...initial, [path]: "before" };
    const cache = Object.fromEntries(
      plan(files).map((job) => [job.id, job.hash]),
    );
    assert.ok(
      selected({ ...files, [path]: "after" }, cache).includes(required),
      `${path} must select ${required}`,
    );
  }
  assert.equal(isFormatInput("tests/working-cache.test.mjs"), true);
  assert.equal(isFormatInput("website/vendor/puzzles/tests/go.test.js"), false);
});

test("playback cosmetics select only the focused playback browser job", () => {
  assert.deepEqual(
    selected({
      ...initial,
      "website/src/lib/styles/method-playback.css": "new",
    }),
    ["method-playback"],
  );
  assert.deepEqual(
    selected({
      ...initial,
      "website/scripts/browser/method-playback-checks.mjs": "new",
    }),
    ["method-playback"],
  );
  assert.ok(
    selected({
      ...initial,
      "website/src/lib/application/session.mjs": "changed",
    }).includes("startup"),
  );
});
