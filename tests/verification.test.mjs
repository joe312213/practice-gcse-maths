import test from 'node:test';
import assert from 'node:assert/strict';
import { plan } from '../website/scripts/verification/plan.mjs';

const initial = {
  'HANDOFF.md': 'a',
  'website/src/lib/styles/theme-tokens.css': 'a',
  'website/src/lib/styles/components.css': 'a',
  'website/src/lib/application/session.mjs': 'a',
  'website/src/lib/domain/engine.mjs': 'a',
  'website/src/lib/components/teaching/ShowDemo.svelte': 'a',
  'website/scripts/verification/plan.mjs': 'a',
};
const cached = Object.fromEntries(plan(initial).map((job) => [job.id, job.hash]));
const selected = (files, cache = cached) => plan(files, cache).filter((job) => job.run).map((job) => job.id);

test('unchanged successful inputs skip every job; docs and theme changes stay narrow', () => {
  assert.deepEqual(selected(initial), []);
  assert.deepEqual(selected({ ...initial, 'HANDOFF.md': 'b' }), ['docs']);
  assert.deepEqual(selected({ ...initial, 'website/src/lib/styles/theme-tokens.css': 'b' }), ['colours', 'practice-sets']);
  assert.deepEqual(selected({ ...initial, 'website/src/lib/styles/components.css': 'b' }), ['presentation', 'colours', 'practice-sets']);
});
test('logic and demo changes use their actual verification families', () => {
  assert.deepEqual(selected({ ...initial, 'website/src/lib/domain/engine.mjs': 'b' }), ['logic', 'bank', 'svelte', 'practice-sets', 'progress']);
  assert.deepEqual(selected({ ...initial, 'website/src/lib/components/teaching/ShowDemo.svelte': 'b' }), ['svelte', 'presentation']);
});
test('deleted/new files, failed jobs, changed policy and environment invalidate evidence', () => {
  const removed = { ...initial }; delete removed['website/src/lib/styles/components.css'];
  assert.deepEqual(selected(removed), ['presentation', 'colours', 'practice-sets']);
  assert.ok(selected({ ...initial, 'tests/new.test.mjs': 'new' }).includes('logic'));
  const failed = { ...cached }; delete failed.colours;
  assert.deepEqual(selected(initial, failed), ['colours']);
  assert.equal(selected({ ...initial, 'website/scripts/verification/plan.mjs': 'b' }).length, plan(initial).length);
  assert.ok(plan(initial, cached, 'new runtime').every((job) => job.run));
});
