/** Units are presentation metadata; arithmetic and accepted numeric answers stay unchanged. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { formatQuantity } from "../website/src/lib/domain/quantity.mjs";
import { markAnswer } from "../website/src/lib/domain/engine.mjs";
const load = async (name) =>
  JSON.parse(
    await readFile(
      new URL(`../website/static/data/${name}.json`, import.meta.url),
    ),
  );
const items = (b) => [
  ...b.questions,
  ...(b.recap ?? []),
  ...b.problemTeaching.examples,
];

test("money signs, fraction units and percentage symbols are formatted without changing precision", () => {
  for (const [value, unit, expected] of [
    ["-5", "£", "-£5"],
    ["−5", "£", "−£5"],
    ["16.50", "£", "£16.50"],
    ["{4/3}", "km/min", "{4/3} km/min"],
    ["80", "km/h", "80 km/h"],
    ["25%", "%", "25%"],
    ["25", "%", "25%"],
    ["−3", "°C", "−3°C"],
    ["3 : 5", "", "3 : 5"],
  ])
    assert.equal(formatQuantity(value, unit), expected);
});

test("journey rates, times and distances carry the appropriate intermediate units", async () => {
  const bank = await load("speed-distance-time");
  const demo = bank.questions.find((q) => q.type === "demo" && q.level === 1);
  assert.deepEqual(
    demo.steps.map((s) => formatQuantity(s.output, s.outputUnit)),
    ["{4/3} km/min", "80 km/h"],
  );
  for (const q of items(bank)) {
    assert.ok(markAnswer(q.answer, q.answer).correct, q.id);
    assert.equal(
      q.steps.at(-1).outputUnit,
      q.answerUnit === "hours" ? "h" : q.answerUnit,
    );
    for (const s of q.steps)
      assert.ok(["km/h", "km/min", "km", "h"].includes(s.outputUnit));
  }
});

test("money working distinguishes item counts, ratio parts and percentage proportions from prices", async () => {
  for (const name of [
    "multiplication",
    "division",
    "problems",
    "ratios",
    "percentages",
    "reverse-percentages",
    "equations",
    "signed-numbers",
  ]) {
    const bank = await load(name);
    for (const q of items(bank)) {
      if (q.answerUnit === "£" && q.steps?.length) {
        assert.equal(q.steps.at(-1).outputUnit, "£", q.id);
        assert.ok(markAnswer(q.answer, q.answer).correct, q.id);
      }
      for (const s of q.steps ?? []) {
        if (s.title.startsWith("Find the total number of "))
          assert.notEqual(s.outputUnit, "£");
        if (
          s.title === "Compare with the original" ||
          s.title.startsWith("Simplify the ratio")
        )
          assert.equal(s.outputUnit, "");
        if (s.title === "Find the number of full packs")
          assert.equal(s.outputUnit, "packs");
      }
      if (name === "percentages" && q.answerUnit === "%") {
        const unit = q.q.includes("£")
          ? "£"
          : q.q.match(/\b(people|km|litres|g)\b/)[1];
        assert.equal(q.steps[0].outputUnit, unit);
      }
    }
  }
});
