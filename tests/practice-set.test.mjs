import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { encodePracticeSet, decodePracticeSet, resolvePracticePage } from '../website/src/lib/domain/practice-code.mjs';
import { createSession } from '../website/src/lib/application/session.mjs';
import { emptyStore } from '../website/src/lib/domain/profiles.mjs';
const bank = JSON.parse(await readFile(new URL('../website/static/data/equations.json', import.meta.url)));
const catalogue = JSON.parse(await readFile(new URL('../website/src/lib/content/practice-pages.json', import.meta.url)));
const entry = (type = 0, slot = 1, topic = 9) => ({ topic, type, slot });
const recipe = (pages = [entry()], level = 0, timing = 0) => ({ pages, level, timing });
function setup(data = emptyStore(), extra = {}) {
  let view, clock = 1000, count = 0;
  const session = createSession({ bank, catalogue, data, save: () => {}, random: () => 0, uuid: () => `attempt-${++count}`, now: () => clock, ...extra });
  session.subscribe(value => { view = value; });
  if (!view.profile) session.chooseName('Set Student', true);
  return { session, data, get view() { return view; }, advance: ms => { clock += ms; } };
}
function complete(f) {
  while (!f.view.page.complete) {
    const q = f.view.bank.questions.find(q => q.id === f.view.page.items[f.view.selected].id);
    f.session.updateDraft({ answer: q.answer, errors: q.errors ?? [] });
    f.session.submitAnswer();
  }
  if (f.view.page.pendingChoice) f.session.resolvePromotion(false);
}

test('54-bit codec preserves all field boundaries, page counts, order and duplicate page entries', () => {
  for (let length = 1; length <= 4; length++) for (let level = 0; level < 4; level++) for (let timing = 0; timing < 4; timing++) {
    const config = recipe(Array.from({ length }, (_, i) => entry(i === 0 ? 7 : 0, i === 0 ? 15 : 0, i === 0 ? 31 : 0)), level, timing);
    const code = encodePracticeSet(config);
    assert.equal(code.length, 9);
    assert.deepEqual(decodePracticeSet(code), config);
  }
  assert.equal(encodePracticeSet(recipe([entry(7, 15, 31),entry(7, 15, 31),entry(7, 15, 31),entry(7, 15, 31)],3,3)), '_________');
  assert.throws(() => decodePracticeSet('bad code'), /nine-character/);
  assert.throws(() => encodePracticeSet(recipe([entry(0,16)])), /slot/);
  assert.throws(() => decodePracticeSet('AAAAAAAAB'), /page count/);
});
test('catalogue references authored content; random, direct and modulo slots follow agreed semantics', () => {
  for (const topic of catalogue.topics) for (const page of topic.pages) for (let i = 1; i <= page.slots.length; i++) {
    assert.deepEqual(resolvePracticePage(catalogue,[bank],entry(page.type,i,topic.code),page.level).ids,page.slots[i-1]);
  }
  const a = resolvePracticePage(catalogue,[bank],entry(0,1),0);
  assert.deepEqual(resolvePracticePage(catalogue,[bank],entry(0,5),0).ids,a.ids);
  assert.equal(resolvePracticePage(catalogue,[bank],entry(0,0),0,()=>0.99).slot,4);
  const replacement = structuredClone(catalogue);
  const pages = replacement.topics[0].pages.find(p=>p.type===0 && p.level===0).slots;
  pages[0]=pages[1];
  assert.deepEqual(resolvePracticePage(replacement,[bank],entry(),0).ids,pages[1]);
  assert.throws(()=>resolvePracticePage(catalogue,[bank],entry(),3),/not available/);
});
test('codes start authored pages; saved levels override code and repeated page types create separate attempts', () => {
  const f=setup();
  f.session.startPracticeSet(encodePracticeSet(recipe([entry(),entry()],1)));
  assert.equal(f.view.page.level,1); assert.equal(f.view.page.size,6);
  const firstAttempt=f.view.page.attempt;
  complete(f); f.session.goSetPage(1);
  assert.notEqual(f.view.page.attempt,firstAttempt); assert.equal(f.view.page.count,0);
  f.session.goSetPage(0); assert.equal(f.view.page.attempt,firstAttempt); assert.equal(f.view.page.complete,true);
  f.session.leavePracticeSet();
  f.session.startPracticeSet(encodePracticeSet(recipe([entry()],0)));
  assert.equal(f.view.page.level,f.data.profiles[0].topics['maths:M10'].tracks.plain.level);
});
test('mixed topics use their own banks and saved levels', () => {
  const other = JSON.parse(JSON.stringify(bank).replaceAll('M10','M11'));
  const all = structuredClone(catalogue);
  all.topics.push(JSON.parse(JSON.stringify(all.topics[0]).replaceAll('M10','M11')));
  all.topics[1].code=10;
  const f=setup(emptyStore(),{ banks:[bank,other],catalogue:all });
  f.session.startPracticeSet(encodePracticeSet(recipe([entry(),entry(0,1,10)],1)));
  complete(f); f.session.goSetPage(1);
  assert.equal(f.view.bank.topic,'M11'); assert.equal(f.view.page.level,1);
  complete(f); assert.equal(f.view.practiceSet.finished,'complete');
  assert.ok(f.data.profiles[0].topics['maths:M10'].history.length);
  assert.ok(f.data.profiles[0].topics['maths:M11'].history.length);
});
test('deadlines persist across reload, block late answers and leave unanswered work unscored', () => {
  const f=setup(); f.session.startPracticeSet(encodePracticeSet(recipe([entry()],0,1)));
  const deadline=f.data.profiles[0].practiceSet.deadline;
  const resumed=setup(JSON.parse(JSON.stringify(f.data)),{now:()=>deadline+1});
  assert.equal(resumed.view.practiceSet.finished,'expired');
  resumed.session.updateDraft({answer:'1'}); assert.equal(resumed.session.submitAnswer().expired,true);
  assert.equal(resumed.view.page.count,0); assert.equal(resumed.data.profiles[0].topics['maths:M10'].history.length,0);
  const multiple=setup(); multiple.session.startPracticeSet(encodePracticeSet(recipe([entry(),entry(),entry()],0,1)));
  complete(multiple); multiple.session.goSetPage(1);
  const expired=setup(JSON.parse(JSON.stringify(multiple.data)),{now:()=>multiple.data.profiles[0].practiceSet.deadline+1});
  expired.session.goSetPage(0); assert.equal(expired.view.practiceSet.index,0);
  expired.session.goSetPage(1); assert.equal(expired.view.practiceSet.index,1);
  expired.session.goSetPage(2); assert.equal(expired.view.practiceSet.index,1); // No new page after expiry.

});
test('invalid/unavailable codes preserve the current run; profiles and free practice stay separate', () => {
  const f=setup(); f.session.switchMode('plain'); const free=f.view.page.attempt;
  f.session.startPracticeSet(encodePracticeSet(recipe([entry()],2)));
  assert.equal(f.view.page.level,0); // Existing saved plain level wins.
  const code=f.view.practiceSet.code;
  assert.throws(()=>f.session.startPracticeSet(encodePracticeSet(recipe([entry(7)]))),/not available/);
  assert.equal(f.view.practiceSet.code,code);
  f.session.leavePracticeSet(); f.session.switchMode('plain'); assert.equal(f.view.page.attempt,free);
  f.session.resumePracticeSet(); assert.equal(f.view.practiceSet.code,code);
  f.session.chooseName('Other Student',true); assert.equal(f.view.practiceSet,null);
});
