import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSession } from '../website/src/lib/application/session.mjs';
import { emptyStore, KEY } from '../website/src/lib/domain/profiles.mjs';
import { openProgress } from '../website/src/lib/adapters/storage.mjs';
const bank = JSON.parse(await readFile(new URL('../website/static/data/equations.json', import.meta.url)));
function setup(data = emptyStore(), content = bank) {
  let view, writes = 0;
  const session = createSession({ bank: content, data, save: () => writes++, random: () => 0, uuid: () => 'test-attempt', now: () => 1 });
  session.subscribe(value => view = value);
  session.chooseName('Student', true);
  return { session, data, get view() { return view; }, get writes() { return writes; } };
}
function correct(fixture) {
  const question = bank.questions.find(q => q.id === fixture.view.page.items[fixture.view.selected].id);
  fixture.session.updateDraft({ answer: question.answer });
  return fixture.session.submitAnswer();
}
test('session composes with injected persistence and emits isolated view snapshots', () => {
  const f = setup();
  f.view.page.items.length = 0;
  f.session.updateDraft({ working: 'typed method' });
  assert.equal(f.view.page.items.length, 4);
  assert.equal(f.data.profiles[0].topics['maths:M10'].pages.assessment.count, 0);
});
test('correct advances, wraps, clears drafts and cannot score a submitted item twice', () => {
  const f = setup();f.session.select(3);f.session.updateDraft({ working: 'method', points: 10 });
  assert.equal(correct(f).advanced, true);assert.equal(f.view.selected, 0);assert.equal(f.view.draft.working, '');
  f.session.select(3);assert.equal(f.session.submitAnswer().duplicate, true);
  assert.equal(f.view.page.count, 1);assert.equal(f.data.profiles[0].topics['maths:M10'].history.length, 1);
});
test('invalid and wrong answers stay; paper collapse preserves drafts but new pages reset it', () => {
  const f = setup();f.session.updateDraft({ answer: '1/0', working: 'draft' });
  assert.equal(f.session.submitAnswer().invalid, true);assert.equal(f.view.page.count, 0);
  f.session.setPaper(true);f.session.setPaper(false);assert.equal(f.view.draft.working, 'draft');
  f.session.updateDraft({ answer: '99999' });f.session.submitAnswer();assert.equal(f.view.selected, 0);
  f.session.setPaper(true);f.session.nextPage();assert.equal(f.view.paper, false);
});
test('subjects/topics isolate progress without a migration or app-global dependency', () => {
  const f = setup();correct(f);
  const other = setup(f.data, { ...bank, subject: 'other' });
  assert.equal(other.view.page.count, 0);
  assert.equal(f.data.profiles[0].topics['maths:M10'].pages.assessment.count, 1);
  assert.equal(f.data.profiles[0].topics['other:M10'].pages.assessment.count, 0);
});
test('new schema roundtrip preserves sessions, while corrupt storage never gets overwritten', () => {
  const f = setup();correct(f);
  let stored = JSON.stringify(f.data);
  const adapter = openProgress({ getItem: () => stored, setItem: (key, value) => { assert.equal(key, KEY); stored = value; } });
  const resumed = setup(adapter.data);assert.equal(resumed.view.page.count, 1);
  let writes = 0, warning = '';
  const blocked = openProgress({ getItem: () => '{bad', setItem: () => writes++ }, text => warning = text);
  blocked.save(emptyStore());assert.equal(writes, 0);assert.match(warning, /without saving/);
});


test('demo speed is saved per profile, survives reload, and leaves learning history alone', () => {
  const f = setup();
  f.session.setDemoSpeed(1.5);
  assert.equal(f.view.demoSpeed, 1.5);
  assert.equal(f.view.page.count, 0);
  const resumed = setup(JSON.parse(JSON.stringify(f.data)));
  assert.equal(resumed.view.demoSpeed, 1.5);
  resumed.session.chooseName('Other learner', true);
  assert.equal(resumed.view.demoSpeed, 1);
  resumed.session.setDemoSpeed(2);
  resumed.session.chooseName('Student', true);
  assert.equal(resumed.view.demoSpeed, 1.5);
});
