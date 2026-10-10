import test from 'node:test';
import assert from 'node:assert/strict';
import { createPracticeTimer } from '../website/src/lib/adapters/practice-time.mjs';
import { practiceHistory } from '../website/src/lib/domain/practice-history.mjs';
import { exportProgress, parseProgress } from '../website/src/lib/domain/progress-transfer.mjs';
function setup(start = Date.UTC(2026, 9, 4, 22, 59, 30)) {
  let time = start, serial = 0;
  const profile = { key: 'student', name: 'Student', topics: {} };
  const data = { schema: 2, profiles: [profile] };
  const timer = createPracticeTimer({ data, save() {}, now: () => time, uuid: () => String(++serial) });
  const view = { profile, bank: { subject: 'maths', topic: 'M10' }, mode: 'plain', page: { attempt: 'a' } };
  timer.select(view);
  return { timer, profile, view, advance(ms) { time += ms; }, now: () => time,
    total() { return Object.values(profile.topics).flatMap(topic => topic.practice ?? []).reduce((sum, row) => sum + row.milliseconds, 0); } };
}
test('T-Level timing: idle cap, resumed interaction, hidden pause and no reload absence', () => {
  const s = setup();
  s.advance(300000); s.timer.poll(); assert.equal(s.total(), 120000);
  s.timer.interact(); s.advance(5000); s.timer.poll(); assert.equal(s.total(), 125000);
  s.advance(1000); s.timer.pause(); s.advance(3600000); s.timer.resume();
  s.advance(4000); s.timer.pause(); assert.equal(s.total(), 130000);
  const restored = parseProgress(exportProgress(s.profile));
  const reload = createPracticeTimer({ data: { profiles: [restored] }, save() {}, now: s.now });
  s.advance(3600000); reload.select(s.view); s.advance(5000); reload.pause();
  const total = Object.values(restored.topics).flatMap(t => t.practice).reduce((sum, r) => sum + r.milliseconds, 0);
  assert.equal(total, 135000);
});
test('credited time splits across UK week boundary, follows topic and respects deadlines/completion', () => {
  const s = setup(); s.advance(60000); s.timer.pause();
  const weeks = practiceHistory(s.profile, '', 'plain', s.now());
  assert.equal(weeks[0].milliseconds, 30000); assert.equal(weeks[1].milliseconds, 30000);
  s.view.bank.topic = 'M01'; s.view.timingDeadline = s.now() + 10000;
  s.timer.select(s.view); s.advance(20000); s.timer.poll();
  assert.equal(s.profile.topics['maths:M01'].practice[0].milliseconds, 10000);
  s.view.page.complete = true; s.timer.select(s.view); s.advance(5000); s.timer.poll(); assert.equal(s.total(), 70000);
});
test('JSON timing round trips, accepts older backups without inferred time and rejects malformed intervals', () => {
  const s = setup(); s.advance(5000); s.timer.pause();
  const exported = JSON.parse(exportProgress(s.profile)); assert.equal(exported.version, 2);
  const restored = parseProgress(JSON.stringify(exported)); assert.deepEqual(restored.topics, s.profile.topics);
  assert.equal(restored.practiceMeasuredFrom, s.profile.practiceMeasuredFrom);
  exported.topics['maths:M10'].practice[0].milliseconds = -1;
  assert.throws(() => parseProgress(JSON.stringify(exported)), /Invalid/);
  delete exported.topics['maths:M10'].practice; delete exported.practiceMeasuredFrom; exported.version = 1;
  assert.equal(parseProgress(JSON.stringify(exported)).practiceMeasuredFrom, undefined);
});
test('weekly success separates assessments and assisted success and compares like challenge levels', () => {
  const s = setup();
  s.profile.topics['maths:M10'].history = [
    { at: s.now(), type: 'assessment', correct: true, level: 0 },
    { at: s.now(), type: 'plain', correct: true, assisted: true, level: 0 },
    { at: s.now(), type: 'plain', correct: false, assisted: true, level: 1 },
    { at: s.now(), type: 'plain', correct: true, assisted: false, level: 1 },
  ];
  const row = practiceHistory(s.profile, 'maths:M10', 'plain', s.now())[0];
  assert.equal(row.answered, 4); assert.deepEqual(row.levels[0], { correct: 0, scored: 0 });
  assert.deepEqual(row.levels[1], { correct: 1, scored: 2 });
});
