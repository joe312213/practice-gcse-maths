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
assert.equal(bank.questions.length, 95);
assert.equal(new Set(bank.questions.map((q) => q.id)).size, 95);
assert.equal(bank.recap.length, 3);
assert.ok(bank.revision);
for (const question of bank.questions)
  assert.ok(markAnswer(question.answer, question.answer).correct, question.id);
console.log('Equation bank validated: 95 unique items and three recaps.');

// Authored Practice set slots must reference real questions of the matching type/level.
const { resolvePracticePage } = await import('../src/lib/domain/practice-code.mjs');
const catalogue = JSON.parse(
  await readFile(new URL('../src/lib/content/practice-pages.json', import.meta.url)),
);
for (const topic of catalogue.topics)
  for (const page of topic.pages) {
    assert.ok(page.slots.length > 0 && page.slots.length <= 15);
    for (let slot = 1; slot <= page.slots.length; slot++)
      resolvePracticePage(
        catalogue,
        [bank],
        { topic: topic.code, type: page.type, slot },
        page.level,
      );
  }
console.log('Authored Practice set slots validated.');
