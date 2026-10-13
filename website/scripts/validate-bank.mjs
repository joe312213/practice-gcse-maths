/**
 * Purpose: Validate the published equation bank against authored IDs, answers and teaching annotations.
 *
 * Main contents:
 * - Module initialization and configuration.
 *
 * Used By: Verification command entry points.
 *
 * Uses: website/src/lib/domain/engine.mjs.
 *
 * Libs: node:fs/promises (asynchronous file access), node:assert/strict (assertions).
 */
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { markAnswer } from '../src/lib/domain/engine.mjs';
const bank = JSON.parse(await readFile(new URL('../static/data/equations.json', import.meta.url)));
assert.equal(bank.questions.length, 243);
assert.equal(new Set(bank.questions.map((q) => q.id)).size, 243);
assert.equal(bank.recap.length, 3);
assert.ok(bank.revision);
for (const question of bank.questions)
  assert.ok(markAnswer(question.answer, question.answer).correct, question.id);
console.log('Equation bank validated: 243 unique items and three recaps.');

// Authored Practice set slots must reference real questions of the matching type/level.
const { resolvePracticePage } = await import('../src/lib/domain/practice-code.mjs');
const catalogue = JSON.parse(
  await readFile(new URL('../src/lib/content/practice-pages.json', import.meta.url)),
);
const banks = [
  bank,
  ...(await Promise.all(
    ['multiplication', 'division'].map(async (name) =>
      JSON.parse(await readFile(new URL(`../static/data/${name}.json`, import.meta.url))),
    ),
  )),
];
for (const topic of banks) {
  for (const q of topic.questions) {
    assert.ok(q.hint?.trim(), `Missing authored hint: ${q.id}`);
    if (q.type !== 'errors') assert.ok(q.method_note?.trim(), `Missing method note: ${q.id}`);
    if (q.wrong)
      assert.equal(
        markAnswer(q.wrong, q.answer).correct,
        false,
        `Correct answer labelled wrong: ${q.id}`,
      );
    if (q.errorOptions) {
      assert.equal(new Set(q.errorOptions.map((option) => option.text)).size, 3, q.id);
      assert.ok(
        q.errorOptions.some((option) => option.id === q.correctionId),
        q.id,
      );
      for (const option of q.errorOptions) {
        assert.doesNotMatch(option.text, /answer:|quotient is/i, q.id);
        assert.ok(
          !option.text.includes(q.answer),
          `Final answer exposed in correction choice: ${q.id}`,
        );
      }
    }
  }
}
for (const topic of banks) {
  for (const level of [0, 1, 2])
    assert.ok(
      topic.questions.filter((q) => q.type === 'errors' && q.level === level).length === 12,
      `${topic.topic}: twelve error questions at level ${level}`,
    );
  const assessment = topic.questions.filter((q) => q.type === 'assessment');
  assert.equal(assessment.length, 6);
  assert.deepEqual(
    [0, 1, 2].map((level) => assessment.filter((q) => q.level === level).length),
    [2, 2, 2],
  );
}
for (const arithmetic of banks.slice(1)) {
  assert.equal(arithmetic.questions.length, 243);
  assert.equal(new Set(arithmetic.questions.map((q) => q.id)).size, 243);
  for (const q of arithmetic.questions.filter((q) => q.type !== 'problem')) {
    if (q.method === 'lattice' && q.level === 2) {
      const digits = [String(q.a).length, String(q.b).length];
      assert.ok(
        digits.every((n) => n === 3 || n === 4) && digits.includes(4),
        `Confidence multiplication needs 4×3, 3×4 or 4×4 digits: ${q.id}`,
      );
    }
    assert.ok(markAnswer(q.answer, q.answer).correct, q.id);
    const parts = q.answer.split(' r ');
    if (parts.length === 2) {
      assert.equal(Number(parts[0]) * q.b + Number(parts[1]), q.a, q.id);
      assert.ok(Number(parts[1]) > 0 && Number(parts[1]) < q.b, q.id);
    } else {
      assert.ok(
        markAnswer(q.answer, arithmetic.method === 'lattice' ? String(q.a * q.b) : `${q.a}/${q.b}`)
          .correct,
        q.id,
      );
    }
  }
}
for (const name of [
  'signed-numbers',
  'fractions',
  'percentages',
  'problems',
  'ratios',
  'reverse-percentages',
  'speed-distance-time',
]) {
  const accepted = JSON.parse(
    await readFile(new URL(`../static/data/${name}.json`, import.meta.url)),
  );
  assert.equal(accepted.questions.length, 243);
  assert.equal(Boolean(accepted.draft), false);
  for (const q of accepted.questions) assert.ok(markAnswer(q.answer, q.answer).correct, q.id);
  banks.push(accepted);
}
assert.equal(
  new Set(catalogue.topics.map((topic) => topic.code)).size,
  catalogue.topics.length,
  'Practice-set topic codes must be unique',
);
for (const topic of catalogue.topics)
  for (const page of topic.pages) {
    assert.ok(page.slots.length > 0 && page.slots.length <= 15);
    for (let slot = 1; slot <= page.slots.length; slot++)
      assert.equal(
        resolvePracticePage(
          catalogue,
          banks,
          { topic: topic.code, type: page.type, slot },
          page.level,
        ).bank.topic,
        topic.bank,
        `Practice-set code ${topic.code} resolves to ${topic.bank}`,
      );
  }
console.log('Authored Practice set slots validated.');
