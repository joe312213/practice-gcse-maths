import defaults from "../website/static/data/defaults.json" with { type: "json" };
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
