/**
 * Purpose: Review regressions: derive answers from prompts and check every displayed correct
 * step.
 *
 * Main contents:
 * - arithmetic, atom, product, sum, correct, at.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/src/lib/content/topic-bank.mjs, website/scripts/read-topic-bank.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import { guidanceFor } from "../website/src/lib/content/topic-bank.mjs";
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";

import test from "node:test";
import assert from "node:assert/strict";
const names = [
  "ratios",
  "fraction-addition-subtraction",
  "signed-addition-subtraction",
  "percentages",
  "multiplication-division-problems",
  "reverse-percentages",
  "speed-distance-time",
  "lattice-multiplication",
  "bus-stop-division",
  "solving-equations",
];
const banks = await Promise.all(
  names.map(async (name) => await readTopicBank(`${name}`)),
);
// These regressions inspect the original model/step schema, including definitions kept
// for saved attempts. Live investigations have their own exact-arithmetic/trace audit.
for (const bank of banks)
  bank.questions = [
    ...bank.questions.filter((q) => !q.investigation),
    ...bank.retiredQuestions,
  ];
const items = (b) => [
  ...b.questions,
  ...(b.recap ?? []),
  ...b.problemTeaching.examples,
];

// A small arithmetic grammar, not eval: only numbers, signs, brackets and four operations.
/** Evaluate this test’s arithmetic expression independently of production marking. */
function arithmetic(source) {
  const text = String(source)
    .replace(/(\d+)\s+\{(\d+\/\d+)\}/g, "($1+($2))")
    .replace(/[{}]/g, (m) => (m === "{" ? "(" : ")"))
    .replaceAll("−", "-")
    .replaceAll("×", "*")
    .replaceAll("÷", "/")
    .replaceAll(":", "/")
    .replace(/%$/, "")
    .replace(/\s/g, "");
  const tokens = text.match(/\d+(?:\.\d+)?|[()+*/-]/g) ?? [];
  assert.equal(tokens.join(""), text, `Unparsed calculation: ${source}`);
  let i = 0;
  function atom() {
    if (tokens[i] === "-") {
      i++;
      return -atom();
    }
    if (tokens[i] === "+") {
      i++;
      return atom();
    }
    if (tokens[i] === "(") {
      i++;
      const value = sum();
      assert.equal(tokens[i++], ")");
      return value;
    }
    assert.match(tokens[i] ?? "", /^\d/);
    return Number(tokens[i++]);
  }
  function product() {
    let n = atom();
    while (["*", "/"].includes(tokens[i])) {
      const op = tokens[i++],
        b = atom();
      n = op === "*" ? n * b : n / b;
    }
    return n;
  }
  function sum() {
    let n = product();
    while (["+", "-"].includes(tokens[i])) {
      const op = tokens[i++],
        b = product();
      n = op === "+" ? n + b : n - b;
    }
    return n;
  }
  const result = sum();
  assert.equal(i, tokens.length);
  assert.ok(Number.isFinite(result));
  return result;
}
const numbers = (text) =>
  [...text.matchAll(/\{[-\d]+\/\d+\}|[-−]?\d+(?:\.\d+)?/g)].map((m) =>
    arithmetic(m[0]),
  );
/** Recompute the expected mathematical result for a question fixture. */
function correct(q, expected) {
  assert.ok(
    Math.abs(arithmetic(q.answer) - expected) < 0.00501,
    `${q.id ?? q.q}: ${q.answer} versus ${expected}`,
  );
}

test("all ten banks have consistent displayed correct calculations, including ratio reductions", () => {
  for (const bank of banks)
    for (const q of items(bank))
      for (const step of q.steps ?? []) {
        const remainder = String(step.output).match(/^(\d+) r (\d+)$/);
        if (remainder) {
          const operands = step.input.match(/^(\d+) ÷ (\d+)$/);
          assert.ok(operands, `${q.id}: remainder working must show division`);
          const [, total, divisor] = operands.map(Number);
          const [, quotient, left] = remainder.map(Number);
          assert.equal(quotient, Math.floor(total / divisor));
          assert.equal(left, total % divisor);
          assert.equal(quotient * divisor + left, total);
          continue;
        }
        const values = [step.input, step.output].flatMap((s) =>
          String(s).split("=").map(arithmetic),
        );
        assert.ok(
          values.every((v) => Math.abs(v - values[0]) < 0.00501),
          `${q.id ?? q.q}: ${step.input} = ${step.output}`,
        );
      }
});

test("reverse percentages and journeys agree with the givens in their question text", () => {
  for (const q of items(banks[5])) {
    const n = numbers(q.q);
    let expected;
    if (q.q.includes("% of an amount")) expected = (n[1] * 100) / n[0];
    else {
      const multiplier = 1 + ((q.q.includes("discount") ? -1 : 1) * n[0]) / 100;
      expected = q.q.includes("delivery")
        ? (n[2] - n[1]) / multiplier
        : n[1] / multiplier;
      if (q.q.includes("such items")) expected *= n[3];
    }
    correct(q, expected);
  }
  for (const q of items(banks[6])) {
    const n = numbers(q.q);
    let expected;
    if (q.q.includes("whole journey"))
      expected =
        (n[0] + n[2]) / (n[1] + n[3] + (q.q.includes("stop") ? n[4] : 0));
    else if (q.q.includes("Find the distance"))
      expected = (n[0] * n[1]) / (q.q.includes("minutes") ? 60 : 1);
    else if (q.q.includes("Find the time")) expected = n[0] / n[1];
    else expected = (n[0] / n[1]) * (q.q.includes("minutes") ? 60 : 1);
    correct(q, expected);
  }
});

test("percentage questions agree with stated amounts, changes and charges", () => {
  for (const q of items(banks[3])) {
    const n = numbers(q.q);
    let expected;
    if (q.q.startsWith("Find ")) expected = (n[0] * n[1]) / 100;
    else if (q.q.includes("changes from") || q.q.includes("change from"))
      expected = (Math.abs(n[1] - n[0]) / n[0]) * 100;
    else if (q.q.includes("deposit")) expected = (n[0] * n[1]) / 100;
    else if (q.q.startsWith("Each of"))
      expected = n[0] * n[1] * (1 - n[2] / 100) + n[3] - n[4];
    else if (q.q.includes("Delivery costs"))
      expected = n[0] * (1 - n[1] / 100) + n[2];
    else
      expected =
        n[0] * (1 + ((q.q.includes("decreases") ? -1 : 1) * n[1]) / 100);
    correct(q, expected);
    if (q.answerUnit === "people")
      assert.equal(Number.isInteger(expected), true, q.id);
  }
});

test("fraction applications require real combination, with no cancelling add/subtract pair", () => {
  for (const q of items(banks[1])) {
    if (q.model.kind !== "application") {
      correct(q, arithmetic(q.q));
      continue;
    }
    const n = numbers(q.q);
    let expected = n[0];
    if (q.level > 0) {
      assert.notEqual(n[1], n[2], q.id);
    }
    for (const sentence of q.q.split(". ").slice(1, -1)) {
      const amount = numbers(sentence)[0];
      expected += sentence.includes("used") ? -amount : amount;
    }
    correct(q, expected);
    assert.notEqual(expected, n[0], q.id);
  }
});

test("signed scenarios retain units, varied answers and plausible diver positions", () => {
  for (const q of items(banks[2])) {
    if (q.model.kind !== "application") {
      correct(q, arithmetic(q.q));
      continue;
    }
    const opening = q.q.split(". ")[0];
    let current = opening.includes("diver")
      ? Number(opening.match(/position (-\d+)/)[1])
      : numbers(opening.replace("−£", "−"))[0];
    for (const sentence of q.q.split(". ").slice(1, -1)) {
      const amount = numbers(sentence)[0];
      const down = /falls|descend|withdrawn|loses/.test(sentence);
      current += down ? -amount : amount;
      if (opening.includes("diver")) assert.ok(current <= 0, q.id);
    }
    correct(q, current);
    assert.doesNotMatch(q.q, /The value then|It increases by \d+, then/);
  }
  for (const level of [0, 1])
    assert.ok(
      new Set(
        banks[2].questions
          .filter((q) => q.type === "problem" && q.level === level)
          .map((q) => q.answer),
      ).size >= 6,
    );
});

test("ratio solutions include explicit simplification and use the simplified parts consistently", () => {
  const simplified = items(banks[0]).filter((q) => q.ratioModel.simplifyBy);
  assert.ok(simplified.length >= 3);
  assert.ok(simplified.some((q) => q.type === "demo"));
  for (const q of simplified) {
    const m = q.ratioModel,
      g = m.simplifyBy;
    assert.equal(m.a % g, 0);
    assert.equal(m.b % g, 0);
    assert.equal(q.steps[0].output, `${m.a / g} : ${m.b / g}`);
    assert.equal(Number(q.model.operations[0][1]), m.knownParts / g);
    assert.equal(Number(q.model.operations[1][1]), m.targetParts / g);
  }
});

test("multiplication/division story models use givens present in the prompt", () => {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
  ];
  for (const q of items(banks[4])) {
    const text = q.q.replace(
      /\b(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/gi,
      (m) => String(words.indexOf(m.toLowerCase())),
    );
    const givens = numbers(text);
    for (const value of [
      q.model.start,
      ...q.model.operations.map((op) => op[1]),
    ]) {
      const number = arithmetic(value);
      if (number === 100 && /\bm\b/.test(q.q) && /\bcm\b/.test(q.q)) continue;
      assert.ok(
        givens.includes(number),
        `${q.id}: model uses unstated ${number}`,
      );
    }
  }
});

/** Substitute into a linear expression, making implicit multiplication explicit. */
function at(expression, x) {
  return arithmetic(
    expression.replace(/(\d|\))\s*(?=x|\()/g, "$1*").replaceAll("x", `(${x})`),
  );
}
test("equations have one solution, and every correct working row preserves it", () => {
  for (const q of items(banks[9])) {
    if (q.model) continue;
    const original = q.q ?? `${q.balance[0].l} = ${q.balance[0].r}`;
    const [l, r] = original.split("=");
    const constant = at(l, 0) - at(r, 0),
      slope = at(l, 1) - at(r, 1) - constant;
    assert.notEqual(slope, 0, `${q.id ?? original}: no unique solution`);
    const rows = q.correct_balance ?? q.balance;
    correct({ ...q, answer: q.answer ?? rows.at(-1).r }, -constant / slope);
    for (const row of rows) {
      if (row.kind === "op")
        assert.equal(row.l, row.r, `${q.id}: balance operation differs`);
      else
        assert.ok(
          Math.abs(
            at(row.l, -constant / slope) - at(row.r, -constant / slope),
          ) < 1e-8,
          `${q.id}: incorrect working ${row.l} = ${row.r}`,
        );
    }
  }
});

test("lattice and bus-stop prompts match their operands and exact answers/remainders", () => {
  for (const bank of banks.slice(7, 9))
    for (const q of items(bank)) {
      if (q.model) continue;
      const [a, b] = numbers(q.q.replaceAll(",", ""));
      assert.equal(a, q.a, q.id);
      assert.equal(b, q.b, q.id);
      assert.ok(b > 1, q.id);
      if (bank.topic === "M01") correct(q, a * b);
      else if (q.answer.includes(" r ")) {
        const [quotient, remainder] = q.answer.split(" r ").map(Number);
        assert.equal(quotient, Math.floor(a / b), q.id);
        assert.equal(remainder, a % b, q.id);
        assert.ok(remainder > 0 && remainder < b, q.id);
      } else correct(q, a / b);
    }
});

test("non-draft application answers follow the quantities and requests in their prompts", () => {
  for (const bank of banks.slice(7))
    for (const q of items(bank)) {
      if (!q.model) continue;
      const n = numbers(q.q);
      let expected;
      if (bank.topic === "M01") {
        expected = n[0] * n[1];
        if (q.level === 1) expected -= n[2];
        if (q.level === 2) expected = expected * n[2] - n[3] + (n[4] ?? 0);
      } else if (bank.topic === "M02") {
        expected =
          q.level === 2
            ? ((n[0] - n[1]) / n[2]) * n[3] - (n[4] ?? 0)
            : n[0] / n[1] + (n[2] ?? 0);
        if (q.level === 2) assert.equal((n[0] - n[1]) % n[2], 0, q.id);
      } else {
        expected = q.level === 0 ? n[1] / n[0] : (n[2] - n[1]) / n[0];
        if (q.level === 2) expected = expected * n[3] + n[1];
      }
      correct(q, expected);
      if (q.level === 2 && bank.topic !== "M10")
        assert.match(q.q, /buys all|All full packs are sold/, q.id);
    }
});

test("M03 Build combines quantities or interprets division, and remainder working precedes the contextual answer", () => {
  const bank = banks[4];
  let grouped = 0,
    remainderRows = 0;
  for (const q of items(bank)) {
    if (q.level === 1) {
      assert.ok(
        !(
          q.model.operations.length === 1 &&
          q.model.operations[0][0] === "multiply"
        ),
        q.id,
      );
      if (
        q.steps[0].title === "Combine the quantities before applying the rate"
      ) {
        const [rate, first, second] = numbers(q.q);
        correct(q, rate * (first + second));
        assert.equal(
          q.steps[0].outputUnit,
          q.q.includes("tiles")
            ? "tiles"
            : q.q.includes("hours")
              ? "hours"
              : "minutes",
        );
        grouped++;
      }
    }
    if (
      q.model.operations.some(([op]) =>
        ["floor", "ceil", "remainder"].includes(op),
      )
    ) {
      const index = q.steps.findIndex((s) => /^\d+ r \d+$/.test(s.output));
      assert.ok(index >= 0 && index < q.steps.length - 1, q.id);
      assert.match(q.steps[index].input, /^\d+ ÷ \d+$/);
      assert.equal(q.steps[index].outputUnit, "");
      remainderRows++;
    }
  }
  assert.equal(grouped, 10);
  assert.equal(remainderRows, 66);
  const example = bank.questions.find(
    (q) => q.type === "demo" && q.level === 1,
  );
  correct(example, Math.ceil((146 + 9) / 12));
  assert.deepEqual(
    example.steps.map((s) => s.output),
    ["155", "12 r 11", "13"],
  );
  assert.equal(example.answerUnit, "minibuses");
});

test("ratio challenge mix introduces two-step Build links and makes two thirds of Confidence practice linked", () => {
  const bank = banks[0];
  for (const [type, total] of [
    ["plain", 36],
    ["scaffolded", 12],
    ["errors", 12],
  ]) {
    for (const [level, fraction] of [
      [1, 1 / 4],
      [2, 2 / 3],
    ]) {
      const questions = bank.questions.filter(
        (q) => q.type === type && q.level === level,
      );
      const linked = questions.filter((q) => q.model.operations.length > 2);
      assert.equal(questions.length, total);
      assert.equal(linked.length, total * fraction, `${type}/${level}`);
      for (const q of linked) {
        assert.ok(q.operationCount <= 4);
        if (level === 1) {
          assert.equal(q.operationCount, 2);
          assert.equal(q.ratioModel.a, 1);
          assert.equal(q.steps.filter((s) => s.input !== s.output).length, 2);
        }
        assert.ok(q.steps.at(-1).outputUnit);
        assert.notEqual(q.wrong, q.answer);
      }
    }
  }
  for (const q of [
    bank.questions.find((q) => q.type === "demo" && q.level === 2),
    bank.recap[2],
    bank.problemTeaching.examples[2],
  ]) {
    assert.ok(q.model.operations.length > 2);
    assert.match(guidanceFor(bank.teaching, 2).aim, /further calculation/);
  }
  assert.equal(
    bank.questions.find((q) => q.type === "demo" && q.level === 2).answer,
    "147",
  );
  assert.equal(bank.recap[2].answer, "1.35");
  assert.equal(bank.problemTeaching.examples[2].answer, "20");
});

test("revised linked ratio answers follow the stated ratio, givens and follow-on instruction", () => {
  const kinds = new Set();
  for (const q of items(banks[0])) {
    if (!/linked calculation reviewed 13 October 2026/.test(q.source)) continue;
    const [a, b, given, extra] = numbers(q.q);
    const total =
      /altogether\.|mixture weighs|journey takes|combined length|share £/.test(
        q.q,
      );
    const difference =
      /more white paint|more sugar|longer than travelling|more blue beads|longer than ribbon A|more than Ada/.test(
        q.q,
      );
    const share = (given / (total ? a + b : difference ? b - a : a)) * b;
    let expected, kind;
    if (/White paint costs/.test(q.q)) {
      expected = share * extra;
      kind = "cost";
    } else if (/identical batches/.test(q.q)) {
      expected = share * extra;
      kind = "batches";
    } else if (/extra .*rest is added/.test(q.q)) {
      expected = share + extra;
      kind = "rest";
    } else if (/blue beads are used/.test(q.q)) {
      expected = share - extra;
      kind = "used";
    } else if (/in metres/.test(q.q)) {
      expected = share / 100;
      kind = "units";
    } else if (/cm is then added/.test(q.q)) {
      expected = share + extra;
      kind = "added";
    } else if (/Ben saves/.test(q.q)) {
      expected = (share * extra) / 100;
      kind = "percentage";
    } else assert.fail(q.q);
    correct(q, expected);
    kinds.add(kind);
    assert.doesNotMatch(q.q, /£\d+ per (gram|minute|centimetre)/);
  }
  assert.deepEqual([...kinds].sort(), [
    "added",
    "batches",
    "cost",
    "percentage",
    "rest",
    "units",
    "used",
  ]);
});
