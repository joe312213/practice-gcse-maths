/** Verify short-lived working restores without entering durable learner progress. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWorkingCache, WORKING_TTL } from '../website/src/lib/adapters/working-cache.mjs';
import { createSession } from '../website/src/lib/application/session.mjs';
import { emptyStore } from '../website/src/lib/domain/profiles.mjs';
const bank = JSON.parse(await readFile(new URL('../website/static/data/equations.json', import.meta.url)));
function storage() {
  const data = new Map();
  return { get length() { return data.size; }, key: (i) => [...data.keys()][i], getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}
test('working survives cache recreation, expires after three hours and is excluded from progress', () => {
  let now = 10;
  const temporary = storage(), data = emptyStore();
  function session() {
    let view;
    const api = createSession({ bank, data, save() {}, workingCache: createWorkingCache(temporary, () => {}, () => now) });
    api.subscribe((next) => view = next);
    api.chooseName('Student', true);
    return { api, get view() { return view; } };
  }
  const first = session();
  const stroke = { tool: 'pen', colour: 'red', points: [[12, 20], [30, 40]] };
  first.api.updateDraft({ working: 'subtract six', strokes: [stroke], points: 2, canvasHeight: 360 });
  first.api.select(1);
  assert.equal(first.view.draft.working, '');
  first.api.select(0);
  assert.equal(first.view.draft.working, 'subtract six');
  assert.equal(session().view.draft.canvasHeight, 360);
  assert.deepEqual(session().view.draft.strokes, [stroke]);
  assert.ok(!JSON.stringify(data).includes('subtract six'));
  now += WORKING_TTL;
  assert.equal(session().view.draft.working, '');
  assert.equal(temporary.length, 0);
});
test('working cache contains no final answers and keeps learner/attempt keys separate', () => {
  const cache = createWorkingCache(storage());
  cache.save('learner-a/attempt-a/q1', { answer: '17', working: 'a step', strokes: [], points: 0 });
  assert.equal(cache.load('learner-b/attempt-a/q1'), null);
  assert.equal(cache.load('learner-a/attempt-b/q1'), null);
  assert.equal(cache.load('learner-a/attempt-a/q1').answer, undefined);
});
