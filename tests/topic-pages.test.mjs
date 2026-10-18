/**
 * Purpose: Defined pages partition banks; new authored equations are checked independently by
 * substitution.
 *
 * Main contents:
 * - evaluate, balanced.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/scripts/read-topic-bank.mjs, website/src/lib/domain/topic-pages.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions), node:fs/promises (asynchronous
 * file access).
 */
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";

import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  topicPages,
  TOPIC_PAGE_SIZES,
  assessmentPage,
} from "../website/src/lib/domain/topic-pages.mjs";
const banks = await Promise.all(
  ["lattice-multiplication", "bus-stop-division", "solving-equations"].map(
    async (name) => await readTopicBank(`${name}`),
  ),
);

test("random assessments vary by draw but always contain two appropriately pitched tasks per level", () => {
  for (const bank of banks) {
    const first = assessmentPage(bank, () => 0),
      other = assessmentPage(bank, () => 0.9);
    assert.notDeepEqual(
      first.map((q) => q.id),
      other.map((q) => q.id),
    );
    for (const page of [first, other]) {
      assert.equal(new Set(page.map((q) => q.id)).size, 6);
      for (let level = 0; level < 3; level++)
        assert.equal(page.filter((q) => q.level === level).length, 2);
      if (bank.method === "lattice") {
        assert.ok(
          page.filter((q) => q.level === 0).every((q) => q.a < 100 && q.b < 10),
        );
        assert.ok(
          page
            .filter((q) => q.level === 1)
            .every((q) => q.a >= 10 && q.a < 100 && q.b >= 10 && q.b < 100),
        );
        assert.ok(
          page
            .filter((q) => q.level === 2)
            .every(
              (q) => Math.max(q.a, q.b) >= 1000 && Math.min(q.a, q.b) >= 100,
            ),
        );
      }
    }
  }
});

test("every topic/stage/level has three full, distinct authored pages", () => {
  for (const bank of banks)
    for (const [mode, size] of Object.entries(TOPIC_PAGE_SIZES))
      for (let level = 0; level < 3; level++) {
        const pages = topicPages(bank, mode, level);
        assert.deepEqual(
          pages.map((page) => page.length),
          [size, size, size],
          `${bank.topic}/${mode}/${level}`,
        );
        assert.equal(new Set(pages.flat()).size, size * 3);
        const questions = pages
          .flat()
          .map((id) => bank.questions.find((q) => q.id === id));
        assert.equal(
          new Set(questions.map((q) => q.q)).size,
          questions.length,
          `${bank.topic}/${mode}/${level}: distinct tasks`,
        );
      }
});

// Only trusted arithmetic tokens are accepted before evaluating the authored test expression.
/** Evaluate a supported equation side independently for the page-bank audit. */
function evaluate(expression, x) {
  const source = expression
    .replaceAll("−", "-")
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replace(/(\d|\))(?=x|\()/g, "$1*");
  assert.match(source, /^[\d\s.x+*/()\-]+$/);
  return Function("x", `return (${source});`)(x);
}
/** Check that the fixture equation evaluates equally on both sides for the supplied value. */
function balanced(row, x) {
  return Math.abs(evaluate(row.l, x) - evaluate(row.r, x)) < 1e-8;
}

test("new equation solutions satisfy every correct row; diagnosed rows fail and their repairs work", () => {
  for (const q of [...banks[2].questions, ...banks[2].retiredQuestions].filter(
    (q) => q.id.includes("-P3-"),
  )) {
    const answer = evaluate(q.answer, 0),
      wrong = evaluate(q.wrong, 0);
    for (const row of q.correct_balance ?? q.balance)
      if (row.kind !== "op")
        assert.ok(balanced(row, answer), `${q.id}: ${JSON.stringify(row)}`);
    if (q.type !== "errors") continue;
    const first = q.errors[0].row;
    for (let i = 0; i < first; i++)
      assert.ok(
        balanced(q.balance[i], answer),
        `${q.id}: prematurely incorrect row ${i}`,
      );
    assert.equal(balanced(q.balance[first], answer), false, q.id);
    for (let i = first; i < q.balance.length; i++)
      assert.ok(
        balanced(q.balance[i], wrong),
        `${q.id}: wrong answer does not follow working at row ${i}`,
      );
    const fix = q.stepOptions
      .find((option) => option.id === q.errors[0].correction)
      .text.split("=");
    assert.ok(balanced({ l: fix[0], r: fix[1] }, answer), q.id);
    assert.equal(
      new Set(q.stepOptions.map((option) => option.text)).size,
      3,
      q.id,
    );
  }
});

test("new arithmetic respects level structure and all error diagrams exist", async () => {
  for (const bank of banks.slice(0, 2))
    for (const q of [...bank.questions, ...bank.retiredQuestions].filter((q) =>
      q.id.includes("-P3-"),
    )) {
      if (bank.method === "lattice") {
        const shape = [String(q.a).length, String(q.b).length];
        if (q.level === 0) assert.deepEqual(shape, [2, 1], q.id);
        if (q.level === 1) assert.deepEqual(shape, [2, 2], q.id);
        if (q.level === 2)
          assert.ok(shape.every((n) => n >= 3) && shape.includes(4), q.id);
      } else {
        if (q.level === 0)
          for (const digit of String(q.a))
            assert.equal(Number(digit) % q.b, 0, q.id);
        if (q.level === 1) assert.ok(q.b >= 6 && q.b <= 9, q.id);
        if (q.level === 2) assert.ok(q.a >= 1000 && q.b >= 12, q.id);
      }
      if (q.errorImage)
        assert.match(
          await readFile(
            new URL(`../website/static/${q.errorImage}`, import.meta.url),
            "utf8",
          ),
          /<svg/,
        );
    }
});
