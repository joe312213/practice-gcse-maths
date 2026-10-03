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
