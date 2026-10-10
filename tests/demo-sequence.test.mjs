/**
 * Purpose: Verify equation reveal frames and method-independent playback ordering.
 *
 * Main contents:
 * - Module initialization and configuration.
 *
 * Used By: Node test runner.
 *
 * Uses: website/src/lib/application/equation-demo.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { arithmeticFrames } from "../website/src/lib/application/arithmetic-demo.mjs";
import { equationFrames } from "../website/src/lib/application/equation-demo.mjs";

test("equation playback draws the line, then left, equals and right; operations skip equals", () => {
  const frames = equationFrames([
    { kind: "equation" },
    { kind: "op" },
    { kind: "equation" },
  ]);
  assert.deepEqual(frames, [
    ...[0, 0.25, 0.5, 0.75, 1].map((guideProgress) => ({ step: 1, part: 0, guideProgress })),
    { step: 1, part: 1 },
    { step: 1, part: 2 },
    { step: 1, part: 3 },
    { step: 2, part: 1 },
    { step: 2, part: 3 },
    { step: 3, part: 1 },
    { step: 3, part: 2 },
    { step: 3, part: 3 },
  ]);
});

test("lattice writes operand digits and cell tens/units separately in row order", () => {
  const frames = arithmeticFrames({ method: "lattice", a: 34, b: 12 });
  assert.deepEqual(frames.filter((frame) => frame.step === 1 && frame.guideProgress === undefined).map((frame) => frame.count), [1, 2, 3, 4]);
  assert.deepEqual(frames.filter((frame) => frame.step === 2).map((frame) => frame.count), [1, 2, 3, 4, 5, 6, 7, 8]);
});
