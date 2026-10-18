/**
 * Purpose: Protect independent mistakes, propagated consequences and unordered investigation
 * marking.
 *
 * Main contents:
 * - prototype faults produce consistent wrong working and preserve the correct model; checking
 *   requires every independent mistake, no extras, correct reasons and final answer; reversed
 *   setup propagates through every cell; oversized carry changes reading, not addition; wrong
 *   lattice products include reversed digits under one accepted diagnosis; Confidence lattice
 *   investigations demand varied multi-digit multiplication with carrying.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/scripts/read-topic-bank.mjs, content/lattice_error_prototype.json,
 * website/src/lib/application/arithmetic-demo.mjs, website/src/lib/domain/errors.mjs,
 * website/src/lib/content/topic-routes.mjs, website/src/lib/domain/topic-pages.mjs,
 * website/src/lib/application/error-working.mjs, website/src/lib/application/session.mjs,
 * website/src/lib/adapters/working-cache.mjs, website/src/lib/domain/profiles.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";

import test from "node:test";
import assert from "node:assert/strict";
import prototype from "../content/lattice_error_prototype.json" with { type: "json" };
import { latticeModel } from "../website/src/lib/application/arithmetic-demo.mjs";
import { markInvestigation } from "../website/src/lib/domain/errors.mjs";

test("prototype faults produce consistent wrong working and preserve the correct model", () => {
  assert.deepEqual(
    prototype.cases.map((q) => latticeModel(q.a, q.b, q.working).answer),
    ["158", "523", "922", "2074", "5132"],
  );
  for (const q of prototype.cases) {
    const model = latticeModel(q.a, q.b, q.working),
      correct = latticeModel(q.a, q.b);
    assert.equal(correct.answer, q.answer);
    assert.equal(Number(q.answer), q.a * q.b);
    assert.deepEqual(
      model.regions.map(({ label, ...geometry }) => geometry),
      correct.regions.map(({ label, ...geometry }) => geometry),
      "Selectable regions must not disclose faults",
    );
    for (const [k, d] of model.diagonals.entries()) {
      const incoming =
        q.working.carries?.[k] ?? (k ? model.diagonals[k - 1].carry : 0);
      assert.equal(d.incoming, incoming);
      assert.equal(d.total, d.sum + incoming);
      assert.equal(d.digit, d.total % 10);
    }
    for (const error of q.errors) {
      const region = model.regions.find(
        (region) => region.id === error.location,
      );
      assert.ok(region);
      assert.equal(
        prototype.options[region.kind].filter(
          (option) => option.id === error.reason,
        ).length,
        1,
      );
    }
  }
  const q = prototype.cases[2];
  assert.equal(
    latticeModel(q.a, q.b, { cells: q.working.cells }).answer,
    "1022",
  );
  assert.equal(
    latticeModel(q.a, q.b, { carries: q.working.carries }).answer,
    "1122",
  );
});

test("checking requires every independent mistake, no extras, correct reasons and final answer", () => {
  for (const q of prototype.cases) {
    assert.equal(
      markInvestigation(q, [...q.errors].reverse(), q.answer).correct,
      true,
    );
    assert.equal(
      markInvestigation(q, q.errors.slice(1), q.answer).correct,
      false,
    );
    assert.equal(
      markInvestigation(q, [...q.errors, q.errors[0]], q.answer).correct,
      false,
    );
    assert.equal(
      markInvestigation(
        q,
        q.errors.map((e) => ({ ...e, reason: "wrong" })),
        q.answer,
      ).correct,
      false,
    );
    assert.equal(markInvestigation(q, q.errors, "0").correct, false);
    assert.equal(markInvestigation(q, q.errors, "not a number").correct, false);
    assert.equal(
      markInvestigation(
        q,
        [...q.errors, { location: "cell:0:1", reason: "cell-fact" }],
        q.answer,
      ).correct,
      false,
    );
  }
  const q = prototype.cases[0];
  const consequence = { location: "diagonal:2", reason: "diagonal-sum" };
  assert.equal(latticeModel(q.a, q.b, q.working).diagonals[2].digit, 1);
  assert.equal(latticeModel(q.a, q.b).diagonals[2].digit, 2);
  const result = markInvestigation(q, [consequence], q.answer);
  assert.equal(result.missing, true);
  assert.equal(
    result.details[0].locationCorrect,
    false,
    "A wrong consequence is not an independent mistake",
  );
});

test("reversed setup propagates through every cell; oversized carry changes reading, not addition", () => {
  const reversed = prototype.cases[3];
  const model = latticeModel(reversed.a, reversed.b, reversed.working);
  assert.deepEqual(model.right, [6, 1]);
  assert.equal(Number(model.answer), 34 * 61);
  for (const cell of model.cells)
    assert.equal(cell.value, model.top[cell.col] * model.right[cell.row]);
  assert.deepEqual(reversed.errors, [
    { location: "operand:right", reason: "operand-order" },
  ]);
  const oversized = prototype.cases[4];
  const wrong = latticeModel(oversized.a, oversized.b, oversized.working);
  const correct = latticeModel(oversized.a, oversized.b);
  assert.equal(wrong.diagonals[2].incoming, 1);
  assert.equal(wrong.diagonals[2].carryAsDigit, true);
  assert.deepEqual(
    wrong.diagonals.map((d) => d.total),
    correct.diagonals.map((d) => d.total),
  );
  assert.equal(wrong.answer, "5132");
  assert.equal(correct.answer, "532");
  assert.ok(correct.diagonals.every((d) => !d.carryAsDigit));
});

import { foundationTopics } from "../website/src/lib/content/topic-routes.mjs";
import {
  findQuestion,
  topicPages,
} from "../website/src/lib/domain/topic-pages.mjs";
import { investigationLattice } from "../website/src/lib/application/error-working.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
import { createWorkingCache } from "../website/src/lib/adapters/working-cache.mjs";
import { emptyStore } from "../website/src/lib/domain/profiles.mjs";
const liveBanks = await Promise.all(
  foundationTopics.map(async (topic) => await readTopicBank(`${topic.file}`)),
);

test("wrong lattice products include reversed digits under one accepted diagnosis", () => {
  const bank = liveBanks.find((bank) => bank.topic === "M01");
  let reversed = 0,
    other = 0;
  for (const q of bank.questions.filter((q) => q.investigation)) {
    assert.ok(q.errors.every((error) => error.misconception !== "L5"));
    for (const error of q.errors.filter(
      (error) => error.misconception === "L1",
    )) {
      const cell = q.diagram.cells.find(
        (cell) => `cell-${cell.row}-${cell.column}` === error.location,
      );
      const correct = cell.topDigit * cell.sideDigit;
      const shown = cell.tens * 10 + cell.units;
      assert.notEqual(shown, correct);
      assert.equal(cell.fact, shown);
      assert.ok(
        q.locations
          .find((location) => location.id === error.location)
          .text.includes(`= ${shown};`),
      );
      const options = q.options.filter(
        (option) => option.text === "The product is wrong.",
      );
      assert.equal(options.length, 1);
      assert.equal(options[0].id, error.reason);
      assert.ok(
        q.options.every((option) => !/halves|swap|fact/i.test(option.text)),
      );
      assert.equal(markInvestigation(q, q.errors, q.answer).correct, true);
      for (const option of q.options.filter(
        (option) => option.id !== error.reason,
      )) {
        assert.equal(
          markInvestigation(
            q,
            q.errors.map((entry) =>
              entry === error ? { ...entry, reason: option.id } : entry,
            ),
            q.answer,
          ).correct,
          false,
        );
      }
      if (cell.tens === correct % 10 && cell.units === Math.floor(correct / 10))
        reversed++;
      else other++;
    }
  }
  assert.equal(reversed, 6, "Keep reversed-digit examples as wrong products");
  assert.equal(other, 9, "Keep other wrong-product examples too");
});

test("Confidence lattice investigations demand varied multi-digit multiplication with carrying", () => {
  const questions = liveBanks
    .find((bank) => bank.topic === "M01")
    .questions.filter((q) => q.investigation && q.level === 2);
  assert.equal(questions.length, 12);
  for (const q of questions) {
    const { a, b } = q.diagram;
    const sizes = [String(a).length, String(b).length];
    assert.ok(
      sizes.every((size) => size >= 3 && size <= 4) && sizes.includes(4),
      q.id,
    );
    const correct = latticeModel(a, b);
    assert.ok(
      correct.cells.filter((cell) => cell.value >= 10).length >
        correct.cells.length / 2,
      `${q.id}: mostly two-digit cell products`,
    );
    assert.ok(
      correct.diagonals.filter((diagonal) => diagonal.carry > 0).length >= 3,
      `${q.id}: multiple diagonal carries`,
    );
    assert.equal(Number(q.answer), a * b);
  }
  assert.ok(
    new Set(questions.map((q) => q.diagram.b)).size >= 6,
    "Avoid repeating one multiplier through the set",
  );
  for (const page of [1, 2, 3]) {
    assert.ok(
      questions.some(
        (q) =>
          q.page === page &&
          String(q.diagram.a).length === 4 &&
          String(q.diagram.b).length === 4,
      ),
      `Page ${page} includes 4×4 multiplication`,
    );
  }
});

test("contextual rounding and simplification options avoid accidentally valid repairs", () => {
  const problems = liveBanks.find((bank) => bank.topic === "M03");
  for (const q of problems.questions.filter(
    (q) => q.investigation && q.errors.some((e) => e.misconception === "A4"),
  )) {
    const [, quotient] = q.locations[0].text.match(/= (\d+) remainder/);
    const alternative = q.options.find(
      (option) => option.id === "alternative-1",
    ).text;
    assert.doesNotMatch(alternative, /nearest/);
    if (q.q.includes("people")) {
      assert.match(alternative, /ignore the people left over/);
      assert.notEqual(Number(quotient), Number(q.answer));
    } else {
      assert.match(alternative, /one more complete pack/);
      assert.notEqual(Number(quotient) + 1, Number(q.answer));
    }
  }
  const fractions = liveBanks.find((bank) => bank.topic === "M15");
  for (const q of fractions.questions.filter(
    (q) => q.investigation && q.errors.some((e) => e.misconception === "F6"),
  )) {
    // Dividing the denominator of the already altered result can repair these examples.
    // Every choice must instead identify what to do to the original fraction.
    for (const option of q.options) assert.match(option.text, /original/);
    assert.match(
      q.options.find((option) => option.id === "repair").text,
      /both.*same factor/,
    );
  }
});

test("all 360 live investigations require exactly the independent diagnoses and corrected answer", () => {
  let count = 0;
  for (const bank of liveBanks) {
    for (const level of [0, 1, 2])
      assert.deepEqual(
        topicPages(bank, "errors", level).map((p) => p.length),
        [4, 4, 4],
      );
    for (const q of bank.questions.filter((q) => q.investigation)) {
      count++;
      assert.equal(q.subject, bank.subject);
      assert.equal(q.topic, bank.topic);
      assert.match(q.id, /^maths:/);
      const entries = q.errors.map(({ location, reason }) => ({
        location,
        reason,
      }));
      assert.equal(
        markInvestigation(q, [...entries].reverse(), q.answer).correct,
        true,
        q.id,
      );
      assert.equal(
        markInvestigation(q, [], q.answer).valid,
        true,
        "The learner decides when all mistakes are found",
      );
      assert.equal(
        markInvestigation(q, entries.slice(1), q.answer).correct,
        false,
        q.id,
      );
      assert.equal(
        markInvestigation(q, [...entries, entries[0]], q.answer).unique,
        false,
      );
      assert.equal(
        markInvestigation(
          q,
          entries.map((entry) => ({
            ...entry,
            reason: q.options.find((o) => o.id !== entry.reason).id,
          })),
          q.answer,
        ).correct,
        false,
      );
      assert.equal(markInvestigation(q, entries, "987654321").correct, false);
      assert.equal(
        markInvestigation(
          q,
          [{ location: "unknown", reason: q.options[0].id }],
          q.answer,
        ).valid,
        false,
      );
      for (const location of q.locations.filter(
        (location) => !q.errors.some((e) => e.location === location.id),
      )) {
        const result = markInvestigation(
          q,
          [...entries, { location: location.id, reason: q.options[0].id }],
          q.answer,
        );
        assert.equal(result.correct, false);
        assert.equal(result.details.at(-1).locationCorrect, false);
      }
      if (q.diagram?.kind === "lattice") {
        const model = investigationLattice(q);
        assert.deepEqual(
          model.cells.map((c) => c.value),
          q.diagram.cells.map((c) => 10 * c.tens + c.units),
        );
        assert.deepEqual(
          model.diagonals.map((d) => [d.digit, d.incoming, d.carry]),
          q.diagram.diagonals.map((d) => [d.digit, d.incoming, d.outgoing]),
        );
        assert.equal(model.answer, q.diagram.readOff);
        assert.deepEqual(
          new Set(model.regions.map((r) => r.id)),
          new Set(
            q.locations
              .filter((l) => l.id !== "answer-read-off")
              .map((l) => l.id),
          ),
        );
      }
    }
    for (const q of bank.retiredQuestions) {
      assert.equal(findQuestion(bank, q.id), q);
      assert.ok(!bank.questions.some((newQ) => newQ.id === q.id));
    }
  }
  assert.equal(count, 360);
});

test("retired question pages automatically restart with current content while recorded results remain", () => {
  for (const bank of liveBanks) {
    const original = {
      ...bank,
      questions: [
        ...bank.questions.filter((q) => !q.investigation),
        ...bank.retiredQuestions,
      ],
      retiredQuestions: [],
    };
    const data = emptyStore(),
      workingCache = createWorkingCache(null);
    let view;
    const start = (source) => {
      const session = createSession({
        bank: source,
        data,
        workingCache,
        save: () => {},
        random: () => 0,
      });
      session.subscribe((v) => (view = v));
      session.chooseName("Returning learner", true);
      session.switchMode("errors");
      return session;
    };
    const old = start(original);
    const first = findQuestion(original, view.page.items[0].id);
    old.updateDraft({
      answer: first.answer,
      errors: first.errorOptions
        ? [{ correction: first.correctionId }]
        : first.errors,
    });
    old.submitAnswer();
    old.updateDraft({
      working: "Keep these calculations",
      strokes: [
        {
          tool: "pen",
          colour: "black",
          points: [
            [20, 20],
            [40, 40],
          ],
        },
      ],
      points: 2,
    });
    const before = structuredClone(view.page);
    const topic = data.profiles[0].topics[`maths:${bank.topic}`];
    const history = structuredClone(topic.history);
    const integrated = start(bank);
    assert.notEqual(view.page.attempt, before.attempt);
    assert.equal(view.page.size, 4);
    assert.equal(view.page.count, 0);
    assert.deepEqual(topic.history, history);
    assert.ok(
      view.page.items.every(
        (item) => findQuestion(bank, item.id).investigation,
      ),
    );
    const current = structuredClone(view.page);
    start(bank);
    assert.deepEqual(
      view.page,
      current,
      "current attempts must not be reset on reload",
    );
    integrated.nextPage();
    assert.ok(
      view.page.items.every(
        (item) => findQuestion(bank, item.id).investigation,
      ),
    );
  }
});

test("retired pages are removed from saved sets, recommendation copies and page navigation only", async () => {
  const { discardRetiredAttempts } =
    await import("../website/src/lib/domain/topic-pages.mjs");
  const old = { items: [{ id: "old" }] },
    current = { items: [{ id: "current" }] };
  const run = () => ({
    attempts: [old, current],
    finished: "complete",
    deadline: 1000,
  });
  const data = {
    profiles: [
      {
        topics: {
          example: {
            pages: { errors: old, plain: current },
            history: [{ question: "old", correct: true }],
            practicePages: {
              errors: { 0: { attempts: [old, current], index: 0 } },
            },
            pageHistory: { errors: { previous: [old, current], next: [old] } },
          },
        },
        practiceSet: run(),
        revision: { recommendations: [{ savedAttempt: run() }] },
      },
    ],
  };
  const banks = [{ retiredQuestions: [{ id: "old" }] }];
  assert.equal(discardRetiredAttempts(data, banks), true);
  const p = data.profiles[0],
    topic = p.topics.example;
  assert.equal(topic.pages.errors, undefined);
  assert.equal(topic.pages.plain, current);
  assert.deepEqual(topic.history, [{ question: "old", correct: true }]);
  assert.deepEqual(topic.practicePages.errors[0].attempts, [null, current]);
  assert.deepEqual(topic.pageHistory.errors, { previous: [current], next: [] });
  for (const saved of [
    p.practiceSet,
    p.revision.recommendations[0].savedAttempt,
  ]) {
    assert.deepEqual(saved.attempts, [null, current]);
    assert.equal(saved.finished, null);
    assert.equal(saved.deadline, 1000);
  }
  assert.equal(discardRetiredAttempts(data, banks), false);
});

test("fraction denominator targets preserve marking and offer correct neighbouring expressions", () => {
  const q = liveBanks
    .find((b) => b.topic === "M15")
    .questions.find((q) => q.id === "maths:M15-WEB-ERRORS-R2-C1-Q01");
  const row = q.locations.find((l) => l.id === "step-2");
  assert.equal(row.targets.find((t) => t.id === "step-2").text, "(12+12)");
  assert.equal(
    row.targets.find((t) => t.text === "(11+2)").id,
    "step-2-part-1",
  );
  assert.equal(markInvestigation(q, q.errors, q.answer).correct, true);
  assert.equal(
    markInvestigation(
      q,
      [{ location: "step-2-part-1", reason: q.errors[0].reason }],
      q.answer,
    ).correct,
    false,
  );
});
