/**
 * Purpose: Verify equation reveal frames and method-independent playback ordering.
 *
 * Main contents:
 * - equation playback draws the line, then left, equals and right; operations skip equals;
 *   lattice writes operand digits and cell tens/units separately in row order; lattice sums each
 *   diagonal before writing its digit and carrying to the next; division calculates before
 *   writing, then transfers a remainder to the next numeric place; construction is a named
 *   standalone step before arithmetic setup at every level.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/scripts/read-topic-bank.mjs, website/src/lib/application/arithmetic-demo.mjs,
 * website/src/lib/application/equation-demo.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";
const [multiplicationBank, divisionBank] = await Promise.all(
  ["lattice-multiplication", "bus-stop-division"].map(readTopicBank),
);

import test from "node:test";
import assert from "node:assert/strict";
import {
  arithmeticFrames,
  latticeModel,
  divisionModel,
} from "../website/src/lib/application/arithmetic-demo.mjs";
import { equationFrames } from "../website/src/lib/application/equation-demo.mjs";

test("equation playback draws the line, then left, equals and right; operations skip equals", () => {
  const frames = equationFrames([
    { kind: "equation" },
    { kind: "op" },
    { kind: "equation" },
  ]);
  assert.deepEqual(frames, [
    ...[0, 0.25, 0.5, 0.75, 1].map((guideProgress) => ({
      step: 1,
      part: 0,
      label: "Draw the dividing line",
      guideProgress,
    })),
    { step: 2, part: 1 },
    { step: 2, part: 2 },
    { step: 2, part: 3 },
    { step: 3, part: 1 },
    { step: 3, part: 3 },
    { step: 4, part: 1 },
    { step: 4, part: 2 },
    { step: 4, part: 3 },
  ]);
});

test("lattice writes operand digits and cell tens/units separately in row order", () => {
  const frames = arithmeticFrames({ method: "lattice", a: 34, b: 12 });
  assert.deepEqual(
    frames
      .filter((frame) => frame.step === 2 && frame.guideProgress === undefined)
      .map((frame) => frame.count),
    [1, 2, 3, 4],
  );
  assert.deepEqual(
    frames
      .filter((frame) => frame.step === 3 && frame.phase !== "multiply")
      .map((frame) => frame.count),
    [1, 2, 3, 4, 5, 6, 7, 8],
  );
});

test("lattice sums each diagonal before writing its digit and carrying to the next", () => {
  for (const [a, b] of [
    ...multiplicationBank.questions
      .filter((q) => q.type === "demo")
      .map((q) => [q.a, q.b]),
    [57, 8],
    [76, 48],
    [6874, 759],
  ]) {
    const model = latticeModel(a, b);
    const frames = arithmeticFrames({ method: "lattice", a, b });
    for (const [i, cell] of model.cells.entries()) {
      assert.deepEqual(
        frames.filter((f) => f.cell === i).map((f) => f.phase),
        ["multiply", "tens", "units"],
      );
      assert.equal(cell.value, model.top[cell.col] * model.right[cell.row]);
    }
    let carry = 0,
      value = 0;
    for (const [i, d] of model.diagonals.entries()) {
      assert.equal(d.incoming, carry);
      assert.equal(d.total, d.sum + carry);
      const phases = frames
        .filter((f) => f.step === 4 && f.count === i + 1)
        .map((f) => f.phase);
      assert.deepEqual(
        phases,
        d.carry ? ["sum", "write", "carry"] : ["sum", "write"],
      );
      carry = d.carry;
      value += d.digit * 10 ** i;
    }
    assert.equal(value, a * b);
    assert.equal(carry, 0);
  }
});

test("division calculates before writing, then transfers a remainder to the next numeric place", () => {
  for (const question of [
    ...divisionBank.questions.filter((q) => q.type === "demo"),
    { method: "bus", a: 609, b: 3, answer: "203" },
    { method: "bus", a: 374, b: 7, answer: "53 r 3" },
    { method: "bus", a: 1575, b: 12, answer: "131.25" },
  ]) {
    const model = divisionModel(question),
      frames = arithmeticFrames(question);
    for (const [i, place] of model.places.entries()) {
      const operation = frames.filter((f) => f.phase && f.count === i + 1);
      if (place.digit === ".")
        assert.deepEqual(
          operation.map((f) => f.phase),
          ["decimal"],
        );
      else {
        assert.equal(
          place.value,
          question.b * place.quotient + place.remainder,
        );
        assert.deepEqual(
          operation.slice(0, 2).map((f) => f.phase),
          ["divide", "write"],
        );
        const carry = operation.find((f) => f.phase === "carry");
        if (carry) {
          assert.ok(carry.target > i);
          assert.notEqual(model.places[carry.target].digit, ".");
          assert.equal(model.places[carry.target].incoming, place.remainder);
        }
      }
    }
  }
});

test("construction is a named standalone step before arithmetic setup at every level", () => {
  for (const bank of [multiplicationBank, divisionBank]) {
    for (const question of bank.questions.filter((q) => q.type === "demo")) {
      const frames = arithmeticFrames(question);
      const construction = frames.filter((frame) => frame.step === 1);
      assert.ok(
        construction.every(
          (frame) => frame.label.startsWith("Draw ") && frame.count === 0,
        ),
      );
      assert.equal(construction.at(-1).guideProgress, 1);
      assert.deepEqual(
        [...new Set(frames.map((frame) => frame.step))],
        [1, 2, 3, 4, 5],
      );
      assert.ok(
        frames
          .filter((frame) => frame.step === 2)
          .every((frame) => !frame.phase && frame.guideProgress === undefined),
      );
      assert.equal(bank.teaching.guidance.default.steps.length, 5);
    }
  }
});
