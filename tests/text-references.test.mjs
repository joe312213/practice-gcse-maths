/**
 * Purpose: Protect compact transport, delayed expansion and strict author-facing references.
 *
 * Main contents:
 * - Literal/template validation, full eager/lazy equivalence and bounded question retention.
 *
 * Used By: verify:changed logic job.
 *
 * Uses: read-topic-bank.mjs, content/text-references.mjs, content/topic-runtime.mjs,
 * content/topic-bank.mjs, content/topic-routes.mjs and domain/topic-pages.mjs.
 *
 * Libs: node:test and node:assert/strict for regression assertions.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readTopicParts } from "../website/scripts/read-topic-bank.mjs";
import {
  expandText,
  expandParts,
  topicPayload,
} from "../website/src/lib/content/text-references.mjs";
import { assembleTopic } from "../website/src/lib/content/topic-bank.mjs";
import {
  openTopic,
  resolveQuestion,
  exampleQuestion,
} from "../website/src/lib/content/topic-runtime.mjs";
import { foundationTopics } from "../website/src/lib/content/topic-routes.mjs";
import {
  findQuestion,
  topicPages,
} from "../website/src/lib/domain/topic-pages.mjs";

test("readable references substitute named values once and leave literal maths untouched", () => {
  const phrases = {
    divide: "Divide by {divisor}; check {divisor} × the result.",
    fraction: "Use {1/3} of the amount.",
  };
  assert.equal(
    expandText({ textRef: "divide", values: { divisor: 4 } }, phrases),
    "Divide by 4; check 4 × the result.",
  );
  assert.equal(
    expandText({ textRef: "fraction" }, phrases),
    "Use {1/3} of the amount.",
  );
  assert.equal(
    expandText("{divisor} is literal here", phrases),
    "{divisor} is literal here",
  );
  assert.equal(
    expandText({ textRef: "divide", values: { divisor: "{other}" } }, phrases),
    "Divide by {other}; check {other} × the result.",
  );
  for (const value of [
    { textRef: "missing" },
    { textRef: "divide" },
    { textRef: "divide", values: { divisor: 4, unused: 5 } },
    { textRef: "divide", values: { divisor: {} } },
    { textRef: "divide", values: { divisor: 4 }, typo: true },
  ])
    assert.throws(
      () => expandText(value, phrases),
      /Unknown|Missing|Unused|Unexpected/,
    );
});

test("expanding wording shares untouched working and diagrams without mutating source", () => {
  const question = {
    hint: { textRef: "hint" },
    diagram: {
      cells: [
        [7, 8],
        [2, 4],
      ],
    },
    steps: [{ input: "7 × 8", output: "56" }],
  };
  const result = expandText(question, { hint: "Check the tens and units." });
  assert.notEqual(result, question);
  assert.equal(result.diagram, question.diagram);
  assert.equal(result.steps, question.steps);
  assert.deepEqual(question.hint, { textRef: "hint" });
  assert.equal(expandText(question.diagram, {}), question.diagram);
});

test("defaults preserve overrides and cannot hide question identities or mathematics", () => {
  const parts = {
    text: {
      defaults: { practice: { source: "Shared attribution" } },
      phrases: {},
    },
    practice: [{ id: "one" }, { id: "two", source: "Specific attribution" }],
  };
  assert.deepEqual(expandParts(parts).practice, [
    { id: "one", source: "Shared attribution" },
    { id: "two", source: "Specific attribution" },
  ]);
  assert.equal(
    parts.practice[0].source,
    undefined,
    "assembly never mutates sources",
  );
  parts.practice[0].id = { textRef: "id" };
  parts.text.phrases.id = "one";
  assert.throws(() => expandParts(parts), /Keep id literal/);
  parts.practice[0].id = "one";
  parts.text.defaults.practice.answer = "4";
  assert.throws(() => expandParts(parts), /Invalid question defaults/);
});

test("every compact bank survives JSON transport and resolves to the full audited content", async () => {
  for (const { file } of foundationTopics) {
    const parts = await readTopicParts(file);
    const full = assembleTopic(parts);
    const payload = topicPayload(parts);
    const runtime = openTopic(JSON.parse(JSON.stringify(payload)));
    assert.deepEqual(
      runtime.questions.map(resolveQuestion),
      full.questions,
      file,
    );
    assert.deepEqual(
      runtime.retiredQuestions.map(resolveQuestion),
      full.retiredQuestions,
    );
    if (full.recap)
      assert.deepEqual(runtime.recap.map(resolveQuestion), full.recap);
    assert.deepEqual(runtime.problemTeaching, full.problemTeaching);
    assert.deepEqual(runtime.teaching.guidance, full.teaching.guidance);
    for (const [level, examples] of Object.entries(runtime.teaching.examples))
      for (const example of examples)
        assert.deepEqual(
          exampleQuestion(runtime, example),
          full.teaching.examples[level].find((item) => item.key === example.key)
            .question,
        );
    assert.ok(
      JSON.stringify(payload).length < JSON.stringify(full).length,
      `${file}: compact wire payload`,
    );
    assert.notEqual(
      typeof runtime.teaching.examples.start[0].question,
      "object",
      "teaching references remain references on the wire",
    );
  }
});

test("selection does not expand unused text and the recent-question cache is bounded across topics", async () => {
  const parts = await readTopicParts("solving-equations");
  let expansions = 0;
  Object.defineProperty(parts.text.phrases, "probe", {
    enumerable: true,
    get() {
      expansions++;
      return "Delayed explanation.";
    },
  });
  parts.practice[0].hint = { textRef: "probe" };
  const bank = openTopic({ format: "topic-parts-1", parts });
  const ids = topicPages(bank, "plain", 0)[0];
  assert.equal(
    expansions,
    0,
    "opening/filtering a bank leaves question wording compact",
  );
  const first = findQuestion(bank, parts.practice[0].id);
  assert.equal(first.hint, "Delayed explanation.");
  assert.ok(expansions > 0);
  assert.equal(
    findQuestion(bank, first.id),
    first,
    "page reads reuse expanded objects",
  );
  const combined = { questions: bank.questions };
  assert.equal(
    findQuestion(combined, first.id),
    first,
    "combined banks preserve each record dictionary",
  );
  for (const question of bank.questions
    .filter((question) => question.id !== first.id)
    .slice(0, 24))
    resolveQuestion(question);
  assert.notEqual(
    findQuestion(bank, first.id),
    first,
    "older expanded questions are not retained indefinitely",
  );
  assert.ok(ids.includes(first.id));
  assert.equal(findQuestion(bank, "absent"), undefined);
});
