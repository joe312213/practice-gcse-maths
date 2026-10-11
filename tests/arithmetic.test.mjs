/**
 * Purpose: Verify arithmetic answer formats, place value, guides and real multi-topic sessions.
 *
 * Main contents:
 * - Exact answers, demo invariants, error marking and topic isolation.
 *
 * Used By: Node test runner.
 *
 * Uses: arithmetic-demo, drawing-assist, engine, errors, session and published banks.
 *
 * Libs: Node test/assert/fs.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  latticeModel,
  divisionModel,
} from "../website/src/lib/application/arithmetic-demo.mjs";
import { guideLines } from "../website/src/lib/application/drawing-assist.mjs";
import { markAnswer } from "../website/src/lib/domain/engine.mjs";
import { markErrors } from "../website/src/lib/domain/errors.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
import { emptyStore } from "../website/src/lib/domain/profiles.mjs";
import { encodePracticeSet } from "../website/src/lib/domain/practice-code.mjs";
const banks = await Promise.all(
  ["equations", "multiplication", "division"].map(async (name) =>
    JSON.parse(
      await readFile(
        new URL(`../website/static/data/${name}.json`, import.meta.url),
      ),
    ),
  ),
);
const catalogue = JSON.parse(
  await readFile(
    new URL("../website/src/lib/content/practice-pages.json", import.meta.url),
  ),
);

test("arithmetic working preserves every answer and internal zero in the imported banks", () => {
  for (const bank of banks.slice(1))
    for (const q of bank.questions) {
      if (q.method === "lattice") {
        const digits = latticeModel(q.a, q.b)
          .diagonals.map((d) => d.digit)
          .reverse()
          .join("");
        assert.equal(Number(digits), Number(q.answer), q.id);
      } else {
        const model = divisionModel(q);
        const quotient = model.places.map((p) => p.quotient).join("");
        const [whole, remainder] = q.answer.split(" r ");
        assert.equal(Number(quotient), Number(whole), q.id);
        assert.equal(model.remainder, Number(remainder ?? 0), q.id);
      }
    }
});
test("remainder answers require the right quotient and remainder; grouping is accepted", () => {
  assert.ok(markAnswer("24 remainder 1", "24 r 1").correct);
  assert.ok(markAnswer("24 R 1", "24 r 1").correct);
  assert.equal(markAnswer("24 r 2", "24 r 1").correct, false);
  assert.equal(markAnswer("24.1", "24 r 1").valid, false);
  assert.ok(markAnswer("25,192,338", "25192338").correct);
  assert.equal(markAnswer("25,19,2338", "25192338").valid, false);
});
test("guide geometry reserves margins and validates dimensions", () => {
  for (const width of [280, 350, 600])
    for (const height of [120, 246, 480])
      for (const topic of ["M01", "M02"])
        for (let rows = 1; rows <= (topic === "M01" ? 4 : 1); rows++)
          for (
            let columns = 1;
            columns <= (topic === "M01" ? 4 : 8);
            columns++
          ) {
            const lines = guideLines(
              topic,
              { columns, rows },
              { width, height },
            );
            assert.equal(
              lines.length,
              topic === "M01" ? columns + rows + 2 + columns * rows : 1,
            );
            const xs = lines.flat().map(([x]) => (x * width) / 700);
            const ys = lines.flat().map(([, y]) => y / 2);
            const left = Math.min(...xs),
              right = Math.max(...xs);
            const top = Math.min(...ys),
              bottom = Math.max(...ys);
            assert.ok(left >= 48 - 1e-9 && right <= width - 48 + 1e-9);
            assert.ok(top >= 48 - 1e-9 && bottom <= height - 48 + 1e-9);
            assert.ok(Math.abs(left + right - width) < 1e-9);
            assert.ok(Math.abs(top + bottom - height) < 1e-9);
            if (topic === "M01")
              assert.ok(
                Math.abs((right - left) / columns - (bottom - top) / rows) <
                  1e-9,
              );
          }
  assert.deepEqual(guideLines("M01", { columns: 0, rows: 2 }), []);
  assert.deepEqual(guideLines("M01", { columns: 2.5, rows: 2 }), []);
  assert.notDeepEqual(
    guideLines("M02", { columns: 3 }),
    guideLines("M02", { columns: 7 }),
  );
});
test("arithmetic errors need a correction as well as the answer", () => {
  for (const bank of banks.slice(1))
    for (const q of bank.questions.filter((q) => q.type === "errors")) {
      assert.ok(
        markErrors(q, [{ correction: q.correctionId }], q.answer).correct,
      );
      assert.equal(markErrors(q, [], q.answer).valid, false);
      assert.equal(
        markErrors(
          q,
          [{ correction: String((Number(q.correctionId) + 1) % 3) }],
          q.answer,
        ).correct,
        false,
      );
    }
});
test("three real topics preserve separate progress and work together in a coded set", () => {
  const data = emptyStore();
  let view;
  const session = createSession({
    bank: banks[0],
    banks,
    catalogue,
    data,
    save: () => {},
    random: () => 0.3,
  });
  session.subscribe((v) => (view = v));
  session.chooseName("Learner", true);
  for (const topic of ["M01", "M02", "M10"]) {
    session.switchTopic(topic);
    const q = view.bank.questions.find(
      (q) => q.id === view.page.items[view.selected].id,
    );
    session.updateDraft({
      answer: q.answer,
      guides: guideLines(topic, { columns: 2, rows: 2 }),
    });
    assert.equal(view.draft.points, 0);
    session.submitAnswer();
    assert.equal(data.profiles[0].topics[`maths:${topic}`].history.length, 1);
  }
  const code = encodePracticeSet({
    level: 0,
    timing: 0,
    pages: [0, 1, 9].map((topic) => ({ topic, type: 0, slot: 1 })),
  });
  session.startPracticeSet(code);
  for (let i = 0; i < 3; i++) {
    session.goSetPage(i);
    assert.equal(view.bank.topic, ["M01", "M02", "M10"][i]);
    while (!view.page.complete) {
      const q = view.bank.questions.find(
        (q) => q.id === view.page.items[view.selected].id,
      );
      session.updateDraft({ answer: q.answer });
      session.submitAnswer();
    }
    if (view.page.pendingChoice) session.resolvePromotion(false);
  }
});
