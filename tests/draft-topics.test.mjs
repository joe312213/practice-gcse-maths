/** Independently check draft-bank mathematics, page coverage and deterministic teaching phases. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rational, markAnswer } from "../website/src/lib/domain/engine.mjs";
import { markErrors } from "../website/src/lib/domain/errors.mjs";
import {
  topicPages,
  assessmentPage,
} from "../website/src/lib/domain/topic-pages.mjs";
import { calculationFrames } from "../website/src/lib/application/calculation-demo.mjs";
const banks = await Promise.all(
  ["signed-numbers", "fractions", "percentages", "problems"].map(async (file) =>
    JSON.parse(
      await readFile(
        new URL(`../website/static/data/${file}.json`, import.meta.url),
      ),
    ),
  ),
);
function expected(m) {
  if (m.kind === "application") {
    let [n, d] = rational(String(m.start));
    for (const [op, operand] of m.operations) {
      const b = BigInt(operand);
      if (op === "multiply") n *= b;
      else if (op === "divide") d *= b;
      else if (op === "add") n += b * d;
      else if (op === "subtract") n -= b * d;
      else {
        assert.equal(d, 1n);
        if (op === "floor") n /= b;
        else if (op === "ceil") n = (n + b - 1n) / b;
        else if (op === "remainder") n %= b;
        else assert.fail(op);
      }
    }
    return `${n}/${d}`;
  }
  if (m.kind === "signed")
    return String(
      m.values
        .slice(1)
        .reduce((v, n, i) => (m.ops[i] === "+" ? v + n : v - n), m.values[0]),
    );
  if (m.kind === "fractions") {
    const [an, ad] = rational(m.a),
      [bn, bd] = rational(m.b);
    return `${an * bd + (m.op === "+" ? 1n : -1n) * bn * ad}/${ad * bd}`;
  }
  const [n, d] = rational(m.original),
    [pn, pd] = rational(m.rate);
  if (m.task === "change") return `${pn < 0n ? -pn : pn}/${pd}`;
  if (m.task === "amount") return `${n * pn}/${d * pd * 100n}`;
  return `${n * (100n * pd + (m.task === "increase" ? pn : -pn))}/${d * pd * 100n}`;
}
for (const bank of banks)
  test(`${bank.topic}: complete draft pages and checked mathematical answers`, () => {
    assert.equal(bank.draft, true);
    assert.equal(bank.questions.length, 171);
    assert.equal(new Set(bank.questions.map((q) => q.id)).size, 171);
    for (const level of [0, 1, 2])
      for (const [mode, size] of Object.entries({
        plain: 12,
        scaffolded: 2,
        errors: 4,
      })) {
        const pages = topicPages(bank, mode, level);
        assert.deepEqual(
          pages.map((p) => p.length),
          [size, size, size],
        );
        const questions = bank.questions.filter(
          (q) => q.level === level && q.type === mode,
        );
        assert.equal(new Set(questions.map((q) => q.q)).size, questions.length);
      }
    assert.deepEqual(
      assessmentPage(bank, () => 0.3).map((q) => q.level),
      [0, 0, 1, 1, 2, 2],
    );
    for (const q of [...bank.questions, ...bank.recap]) {
      assert.ok(
        markAnswer(q.answer, expected(q.model)).correct,
        `${q.id}: ${q.q}`,
      );
      assert.ok(
        !markAnswer(q.wrong, q.answer).correct,
        `${q.id}: wrong answer is actually right`,
      );
      assert.ok(q.hint && q.check && q.method_note);
      assert.ok(q.steps.every((s) => s.input && s.output && s.note));
      const frames = calculationFrames(q.steps);
      for (let i = 0; i < q.steps.length; i++)
        assert.deepEqual(frames.slice(2 * i, 2 * i + 2), [
          { step: i + 1, phase: "inspect" },
          { step: i + 1, phase: "write" },
        ]);
      if (q.type === "errors") {
        assert.equal(new Set(q.errorOptions.map((o) => o.text)).size, 3);
        assert.ok(q.errorSteps.length);
        assert.ok(
          markAnswer(q.errorSteps.at(-1).output.replace(/[{}]/g, ""), q.wrong)
            .correct,
          q.id,
        );
        assert.ok(
          markErrors(q, [{ correction: q.correctionId }], q.answer).correct,
        );
        assert.equal(
          markErrors(
            q,
            [
              {
                correction: q.errorOptions.find((o) => o.id !== q.correctionId)
                  .id,
              },
            ],
            q.answer,
          ).correct,
          false,
        );
      }
      if (q.model.kind === "fractions") {
        const [, ad] = rational(q.model.a),
          [, bd] = rational(q.model.b);
        if (q.level === 0) assert.equal(ad, bd);
        if (q.level === 1) assert.ok(ad % bd === 0n || bd % ad === 0n);
        if (q.type === "scaffolded") assert.ok(rational(q.answer)[0] >= 0n);
      }
    }
  });
