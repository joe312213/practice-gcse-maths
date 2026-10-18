/**
 * Purpose: Topic discovery blends authored teaching priority with existing evidence without
 * altering source order.
 *
 * Main contents:
 * - partial title terms combine, ignore case, and preserve the input list; eligible evidence
 *   gradually replaces the prior; weak arithmetic can outrank successful equations.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/src/lib/domain/revision.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  discoverTopics,
  topicPriority,
} from "../website/src/lib/domain/revision.mjs";
const topics = [
  { bank: "M01", title: "Lattice multiplication" },
  { bank: "M10", title: "Solving equations" },
  { bank: "M13", title: "Signed addition and subtraction" },
];
test("partial title terms combine, ignore case, and preserve the input list", () => {
  assert.deepEqual(
    discoverTopics(topics, "ign ADD", "priority").map((t) => t.bank),
    ["M13"],
  );
  assert.equal(discoverTopics(topics, "absent", "priority").length, 0);
  assert.deepEqual(
    discoverTopics(topics, "", "priority").map((t) => t.bank),
    ["M10", "M13", "M01"],
  );
  assert.deepEqual(
    discoverTopics(topics, "", "a-z").map((t) => t.bank),
    ["M01", "M13", "M10"],
  );
  assert.equal(topics[0].bank, "M01");
});
test("eligible evidence gradually replaces the prior; weak arithmetic can outrank successful equations", () => {
  const row = (bank, count, rate) => ({
    topic: { bank },
    current: [{ count, rate, missing: count < 5, stale: false }],
  });
  assert.ok(
    topicPriority(row("M10", 1, 100)) > topicPriority(row("M10", 20, 100)),
  );
  assert.deepEqual(
    discoverTopics(topics, "", "priority", [
      row("M01", 20, 20),
      row("M10", 20, 100),
      row("M13", 20, 90),
    ]).map((t) => t.bank),
    ["M01", "M13", "M10"],
  );
});
