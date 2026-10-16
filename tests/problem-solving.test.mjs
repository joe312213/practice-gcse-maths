import { readTopicBank } from "../website/scripts/read-topic-bank.mjs";
/** Problem mathematics, help assistance and combined source attribution are independent of rendering. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { foundationTopics } from "../website/src/lib/content/topic-routes.mjs";
import { rational, markAnswer } from "../website/src/lib/domain/engine.mjs";
import { createSession } from "../website/src/lib/application/session.mjs";
import { topicStages, nextStage } from "../website/src/lib/domain/stages.mjs";
import { emptyStore } from "../website/src/lib/domain/profiles.mjs";
import {
  encodePracticeSet,
  resolvePracticePage,
} from "../website/src/lib/domain/practice-code.mjs";
const banks = await Promise.all(
  foundationTopics.map(async (t) => await readTopicBank(`${t.file}`)),
);
const catalogue = JSON.parse(
  await readFile(
    new URL("../website/src/lib/content/practice-pages.json", import.meta.url),
  ),
);
test("all application problems have one to four operations, distinct pages and independently correct answers", () => {
  for (const bank of banks) {
    for (const level of [0, 1, 2]) {
      const qs = bank.questions.filter(
        (q) => q.type === "problem" && q.level === level,
      );
      assert.equal(qs.length, 18);
      assert.equal(new Set(qs.map((q) => q.q)).size, 18);
    }
    for (const q of [
      ...[...bank.questions, ...bank.retiredQuestions].filter(
        (q) =>
          !q.investigation &&
          (q.type === "problem" || ["M04", "M07", "M12"].includes(bank.topic)),
      ),
      ...(bank.recap ?? []).filter(() =>
        ["M04", "M07", "M12"].includes(bank.topic),
      ),
      ...bank.problemTeaching.examples,
    ]) {
      if (q.wrong)
        assert.equal(
          markAnswer(q.wrong, q.answer).correct,
          false,
          `${q.id}: wrong example must be wrong`,
        );
      let [n, d] = rational(q.model.start);
      assert.ok(
        (q.operationCount ?? q.model.operations.length) >= 1 &&
          (q.type !== "problem" ||
            (q.operationCount ?? q.model.operations.length) <= 4),
        q.id,
      );
      for (const [op, value] of q.model.operations) {
        const [a, b] = rational(value);
        if (op === "multiply") {
          n *= a;
          d *= b;
        } else if (op === "divide") {
          n *= b;
          d *= a;
        } else {
          n = n * b + (op === "add" ? 1n : -1n) * a * d;
          d *= b;
        }
      }
      assert.ok(
        markAnswer(
          q.answer,
          q.roundTo === undefined
            ? `${n}/${d}`
            : (Number(n) / Number(d)).toFixed(q.roundTo),
        ).correct,
        q.id,
      );
      assert.ok(
        q.hint && q.check && q.steps.length >= q.model.operations.length,
      );
    }
  }
});
test("ratio questions request an unknown quantity and agree with the ratio, not just their calculation chain", () => {
  const bank = banks.find((bank) => bank.topic === "M04");
  for (const q of [
    ...bank.questions.filter((q) => !q.investigation),
    ...bank.retiredQuestions,
    ...bank.recap,
    ...bank.problemTeaching.examples,
  ]) {
    const { a, b, scale, known, target, knownParts, targetParts } =
      q.ratioModel;
    const parts = { first: a, second: b, total: a + b, difference: b - a };
    assert.notEqual(
      known,
      target,
      `${q.id}: requested quantity is already given`,
    );
    assert.equal(knownParts, parts[known], q.id);
    assert.equal(targetParts, parts[target], q.id);
    assert.equal(Number(q.model.start), parts[known] * scale, q.id);
    let expected = parts[target] * scale;
    for (const [operation, operand] of q.model.operations.slice(2)) {
      const [n, d] = rational(operand);
      const amount = Number(n) / Number(d);
      expected =
        operation === "multiply"
          ? expected * amount
          : operation === "divide"
            ? expected / amount
            : operation === "subtract"
              ? expected - amount
              : expected + amount;
    }
    assert.equal(Number(q.answer), expected, q.id);
    assert.doesNotMatch(q.q, /Find the combined amount/, q.id);
  }
});
test("sixth-stage tips count as assistance, including after selecting another question", () => {
  let view;
  const data = emptyStore();
  const api = createSession({
    bank: banks[0],
    banks,
    catalogue,
    data,
    save() {},
  });
  api.subscribe((v) => (view = v));
  api.chooseName("Problem learner", true);
  api.switchMode("problem");
  assert.equal(view.page.size, 6);
  api.setProblemTips(true);
  api.select(1);
  const q = view.bank.questions.find((q) => q.id === view.page.items[1].id);
  api.updateDraft({ answer: q.answer });
  api.submitAnswer();
  const record = data.profiles[0].topics["maths:M01"].history.at(-1);
  assert.equal(record.assisted, true);
  assert.equal(record.type, "problem");
  assert.equal(view.track.histories[0].length, 0);
});
test("combined problems use selected topics, retain exact questions on resume and credit actual source topics", () => {
  let view;
  const data = emptyStore();
  let api = createSession({
    bank: banks[0],
    banks,
    catalogue,
    data,
    save() {},
    random: () => 0.3,
  });
  api.subscribe((v) => (view = v));
  api.chooseName("Combined learner", true);
  const code = encodePracticeSet({
    level: 1,
    timing: 0,
    pages: [{ topic: 31, type: 3, slot: 0 }],
  });
  api.startPracticeSet(code, null, { topics: ["M13", "M15"] });
  const ids = view.page.items.map((q) => q.id);
  assert.equal(new Set(ids.map((id) => id.split("-")[0])).size, 2);
  for (const id of ids) {
    api.select(view.page.items.findIndex((q) => q.id === id));
    const q = view.bank.questions.find((q) => q.id === id);
    api.updateDraft({ answer: q.answer });
    api.submitAnswer();
  }
  for (const topic of ["M13", "M15"]) {
    const saved = data.profiles[0].topics[`maths:${topic}`];
    assert.equal(saved.history.length, 3);
    assert.equal(saved.tracks.problem.level, 1);
  }
  assert.equal(data.profiles[0].topics["maths:combined"].history.length, 0);
  api = createSession({
    bank: banks[0],
    banks,
    catalogue,
    data,
    save() {},
    random: () => 0.9,
  });
  api.subscribe((v) => (view = v));
  assert.deepEqual(
    view.page.items.map((q) => q.id),
    ids,
  );
  assert.equal(view.page.complete, true);
});

test("new topic codes are unique and resolve to their own banks without changing existing addresses", () => {
  const codes = catalogue.topics.map((topic) => topic.code);
  assert.equal(new Set(codes).size, codes.length);
  for (const [bank, code] of Object.entries({
    M01: 0,
    M02: 1,
    M03: 6,
    M13: 3,
    M10: 9,
    M15: 4,
    M06: 5,
  }))
    assert.equal(
      catalogue.topics.find((topic) => topic.bank === bank).code,
      code,
    );
  for (const topic of catalogue.topics)
    for (const page of topic.pages) {
      const resolved = resolvePracticePage(
        catalogue,
        banks,
        { topic: topic.code, type: page.type, slot: 1 },
        page.level,
      );
      assert.equal(resolved.bank.topic, topic.bank);
    }
});

test("dedicated problem topics finish at independent practice while preserving authored sets and history", () => {
  const bank = banks.find((b) => b.topic === "M03");
  assert.equal(topicStages(bank).length, 5);
  assert.equal(nextStage("plain", bank), null);
  assert.equal(nextStage("errors", bank)[0], "plain");
  assert.equal(nextStage("plain", banks[0])[0], "problem");
  let view;
  const data = emptyStore();
  const api = createSession({ bank, banks, catalogue, data, save() {} });
  api.subscribe((v) => (view = v));
  api.chooseName("Application learner", true);
  api.switchTopic("M03");
  const entry = catalogue.topics.find((t) => t.bank === bank.topic);
  const code = encodePracticeSet({
    level: 0,
    timing: 0,
    pages: [{ topic: entry.code, type: 3, slot: 0 }],
  });
  api.startPracticeSet(code);
  assert.equal(view.mode, "problem");
  const q = view.bank.questions.find((q) => q.id === view.page.items[0].id);
  api.updateDraft({ answer: q.answer });
  api.submitAnswer();
  const history = structuredClone(data.profiles[0].topics["maths:M03"].history);
  api.switchMode("problem");
  assert.equal(view.mode, "plain");
  assert.equal(view.page.size, 12);
  assert.deepEqual(data.profiles[0].topics["maths:M03"].history, history);
  api.setProblemTips(true);
  api.select(1);
  const independent = view.bank.questions.find(
    (q) => q.id === view.page.items[1].id,
  );
  api.updateDraft({ answer: independent.answer });
  api.submitAnswer();
  const record = data.profiles[0].topics["maths:M03"].history.at(-1);
  assert.equal(record.type, "plain");
  assert.equal(record.assisted, true);
});
