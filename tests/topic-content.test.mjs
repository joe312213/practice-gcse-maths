import defaults from "../website/static/data/defaults.json" with { type: "json" };
import handwriting from "../website/static/handwriting/pacifico-maths.json" with { type: "json" };
import { missingCharacters } from "../website/src/lib/application/handwriting.mjs";
import { workingText } from "../website/src/lib/application/error-working.mjs";
import { stageTextFor } from "../website/src/lib/content/stage-text.mjs";
/** Canonical topic parts, named guidance and runtime assembly must agree without generation. */
import test from "node:test";
import assert from "node:assert/strict";
import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";
import {
  guidanceFor,
  assembleTopic,
} from "../website/src/lib/content/topic-bank.mjs";
import { foundationTopics } from "../website/src/lib/content/topic-routes.mjs";

test("every topic assembles its complete bank and three named challenge guides", async () => {
  for (const { file } of foundationTopics) {
    const bank = await readTopicBank(file);
    assert.equal(bank.questions.length, 243);
    assert.equal(new Set(bank.questions.map((q) => q.id)).size, 243);
    assert.equal(bank.questions.filter((q) => q.investigation).length, 36);
    for (const question of bank.questions.filter((q) => q.investigation))
      for (const location of question.locations)
        assert.deepEqual(
          missingCharacters(handwriting, workingText(location.text)),
          [],
          `${question.id}: working must render without missing-glyph boxes`,
        );
    assert.ok(bank.retiredQuestions.length);
    if (!bank.stageText?.initialAssessment?.intro)
      assert.equal(
        stageTextFor(bank, "assessment", 6).intro,
        defaults.stageText.initialAssessment.intro.replaceAll(
          "{questionCount}",
          "6",
        ),
      );
    assert.ok(!Array.isArray(bank.teaching.guidance));
    for (const level of [0, 1, 2]) {
      const guide = guidanceFor(bank.teaching, level);
      assert.ok(guide.aim && guide.steps.length);
    }
    for (const [name, guide] of Object.entries(
      bank.teaching.guidance.byLevel,
    )) {
      assert.ok(["start", "build", "confidence"].includes(name));
      assert.notDeepEqual(guide, bank.teaching.guidance.default);
    }
  }
});

test("shared guidance falls back and level overrides replace the entire object", () => {
  const shared = { aim: "Shared", steps: ["One", "Two"] };
  const build = { aim: "Build", steps: ["Different"] };
  const teaching = { guidance: { default: shared, byLevel: { build } } };
  assert.equal(guidanceFor(teaching, 0), shared);
  assert.equal(guidanceFor(teaching, 1), build);
  assert.equal(guidanceFor(teaching, 2), shared);
  assert.throws(() => assembleTopic({}), /Missing topic content/);
});

test("stage text inherits shared copy, substitutes actual page size and isolates topic overrides", () => {
  const ordinary = stageTextFor({}, "assessment", 6);
  assert.equal(
    ordinary.intro,
    defaults.stageText.initialAssessment.intro.replaceAll(
      "{questionCount}",
      "6",
    ),
  );
  assert.equal(ordinary.note, "");
  const topic = {
    stageText: {
      initialAssessment: { intro: "Check these {questionCount} examples." },
      scaffolded: { intro: "Use the guide." },
    },
  };
  assert.equal(
    stageTextFor(topic, "assessment", 4).intro,
    "Check these 4 examples.",
  );
  assert.equal(stageTextFor({}, "assessment", 6).intro, ordinary.intro);
  const scaffolded = stageTextFor(topic, "scaffolded", 4);
  assert.equal(scaffolded.intro, "Use the guide.");
  assert.equal(scaffolded.note, defaults.stageText.scaffolded.note);
  assert.equal(
    stageTextFor({}, "plain", 12).intro,
    stageTextFor({}, "problem", 6).intro,
  );
  assert.equal(
    stageTextFor({ stageText: { scaffolded: { note: "" } } }, "scaffolded", 4)
      .note,
    "",
  );
});

test("named reasons expand values without changing saved IDs, and reject broken references", async () => {
  const { resolveInvestigations } =
    await import("../website/src/lib/content/topic-bank.mjs");
  const catalog = {
    types: {
      F1: {
        name: "Added denominators",
        example: "1/3 + 1/3 = 2/6",
        repairs: ["keep-denominator"],
      },
    },
    reasons: { "keep-denominator": "Keep denominator {0}." },
  };
  const question = {
    id: "existing-question",
    options: { repair: ["keep-denominator", "12"] },
    errors: [
      {
        location: "step-2",
        reason: "repair",
        misconception: "F1",
        feedback: ["keep-denominator", "12"],
      },
    ],
  };
  const [resolved] = resolveInvestigations([question], catalog);
  assert.deepEqual(resolved.options, [
    { id: "repair", text: "Keep denominator 12." },
  ]);
  assert.equal(resolved.errors[0].feedback, "Keep denominator 12.");
  assert.equal(resolved.errors[0].reason, "repair");
  assert.ok(
    Array.isArray(question.options.repair),
    "Authored input is not mutated",
  );
  for (const [change, message] of [
    [(q) => (q.options.repair[0] = "missing"), /Unknown error reason/],
    [(q) => (q.options.repair = "keep-denominator"), /Missing value/],
    [(q) => q.options.repair.push("unused"), /Unused values/],
    [(q) => (q.errors[0].misconception = "missing"), /Unknown error type/],
    [(q) => (q.errors[0].reason = "missing"), /Unlisted repair/],
  ]) {
    const broken = structuredClone(question);
    change(broken);
    assert.throws(() => resolveInvestigations([broken], catalog), message);
  }
});

test("every topic has working concept references; missing keys and incomplete explanations fail assembly", async () => {
  const { resolveTeaching } =
    await import("../website/src/lib/content/topic-bank.mjs");
  for (const { file } of foundationTopics) {
    const bank = await readTopicBank(file);
    for (const level of [0, 1, 2]) {
      const parts = guidanceFor(bank.teaching, level).steps.flat();
      assert.ok(
        parts.some((part) => part.help?.examples.length),
        `${file} level ${level}`,
      );
    }
  }
  const teaching = {
    guidance: {
      default: {
        aim: "Undo",
        steps: [
          ["Choose ", { concept: "inverse", text: "the opposite operation" }],
        ],
      },
      byLevel: {},
    },
  };
  const concepts = {
    inverse: {
      title: "Opposite operation",
      explanation: "Undo an operation.",
      guidance: "Apply it to both sides.",
      examples: ["x + 3 = 7 gives x = 4."],
    },
  };
  assert.equal(
    resolveTeaching(teaching, concepts).guidance.default.steps[0][1].help,
    concepts.inverse,
  );
  assert.throws(() => resolveTeaching(teaching, {}), /Invalid method concept/);
  assert.throws(
    () =>
      resolveTeaching(teaching, {
        inverse: { ...concepts.inverse, examples: [] },
      }),
    /Incomplete concept/,
  );
});

test("method catalogues cover every declared sub-method with at least two runnable examples per level", async () => {
  const { arithmeticFrames } =
    await import("../website/src/lib/application/arithmetic-demo.mjs");
  const { equationFrames } =
    await import("../website/src/lib/application/equation-demo.mjs");
  const { calculationFrames } =
    await import("../website/src/lib/application/calculation-demo.mjs");
  for (const topic of foundationTopics) {
    assert.equal(
      topic.file,
      topic.slug,
      "Canonical data folders use the specific public topic name",
    );
    const bank = await readTopicBank(topic.file);
    for (const [level, examples] of Object.entries(bank.teaching.examples)) {
      assert.ok(examples.length >= 2, `${topic.file}/${level}`);
      for (const example of examples) {
        const q = example.question;
        assert.doesNotMatch(example.name, /worked example/i);
        const frames =
          bank.method === "calculation"
            ? calculationFrames(q.steps)
            : bank.method
              ? arithmeticFrames(q)
              : equationFrames(q.balance);
        assert.ok(
          frames.length &&
            frames.every((frame) => Number.isInteger(frame.step)),
          `${topic.file}: ${example.name}`,
        );
      }
      for (const [key, spec] of Object.entries(bank.teaching.submethods))
        if (spec.levels.includes(level))
          assert.ok(
            examples.some((example) => example.submethods.includes(key)),
            key,
          );
    }
  }
});

test("method validation rejects coverage gaps, vague names, wrong levels and mismatched narration", async () => {
  const { readFile } = await import("node:fs/promises");
  const { TOPIC_FILES } =
    await import("../website/src/lib/content/topic-bank.mjs");
  const parts = Object.fromEntries(
    await Promise.all(
      TOPIC_FILES.map(async (file) => [
        file,
        JSON.parse(
          await readFile(
            new URL(
              `../website/static/data/solving-equations/${file}.json`,
              import.meta.url,
            ),
          ),
        ),
      ]),
    ),
  );
  for (const [mutate, error] of [
    [(p) => p.method.examples.start.splice(1), /At least two/],
    [(p) => p.method.examples.start.pop(), /Missing start example/],
    [
      (p) => (p.method.examples.start[0].name = "Worked example"),
      /Invalid method example/,
    ],
    [
      (p) => (p.method.examples.start[0].question = p.demos[1].id),
      /Invalid example source/,
    ],
    [
      (p) => p.method.examples.start[0].annotations.pop(),
      /Incomplete equation narration/,
    ],
    [
      (p) => p.method.examples.start[0].submethods.push("not-a-method"),
      /Unknown or inapplicable/,
    ],
  ]) {
    const changed = structuredClone(parts);
    mutate(changed);
    assert.throws(() => assembleTopic(changed), error);
  }
});
