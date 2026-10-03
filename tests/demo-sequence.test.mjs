import test from 'node:test';
import assert from 'node:assert/strict';
import { equationFrames } from '../website/src/lib/application/equation-demo.mjs';

test('equation playback draws the line, then left, equals and right; operations skip equals', () => {
  const frames = equationFrames([{ kind: 'equation' }, { kind: 'op' }, { kind: 'equation' }]);
  assert.deepEqual(frames, [
    { step: 1, part: 0 },
    { step: 1, part: 1 }, { step: 1, part: 2 }, { step: 1, part: 3 },
    { step: 2, part: 1 }, { step: 2, part: 3 },
    { step: 3, part: 1 }, { step: 3, part: 2 }, { step: 3, part: 3 },
  ]);
});
