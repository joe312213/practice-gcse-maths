/** Practice duration rounding and elapsed-time display do not depend on interval frequency. */
import test from "node:test";
import assert from "node:assert/strict";
import {
  practiceMinutes,
  remainingTime,
  clockText,
} from "../website/src/lib/domain/countdown.mjs";
import { createChime } from "../website/src/lib/adapters/chime.mjs";
test("page defaults round up, delayed updates expire and display rounds remaining seconds up", () => {
  assert.equal(practiceMinutes(3), 5);
  assert.equal(practiceMinutes(4), 6);
  assert.equal(practiceMinutes(12), 18);
  assert.equal(remainingTime(60000, 80000), 0);
  assert.equal(clockText(60001), "1:01");
  assert.equal(clockText(0), "0:00");
});
test("unavailable audio is optional and never prevents timer use", () => {
  const chime = createChime(null);
  chime.unlock();
  assert.equal(chime.play(), false);
  chime.dispose();
});

test("gesture unlock reuses one audio context and expiry schedules two quiet tones", async () => {
  const starts = [],
    peaks = [];
  let instances = 0,
    closed = 0;
  class Audio {
    constructor() {
      instances++;
      this.state = "running";
      this.currentTime = 10;
    }
    resume() {
      return Promise.resolve();
    }
    close() {
      closed++;
      return Promise.resolve();
    }
    createOscillator() {
      return {
        frequency: {},
        connect() {},
        start(at) {
          starts.push(at);
        },
        stop() {},
        disconnect() {},
      };
    }
    createGain() {
      return {
        connect() {},
        disconnect() {},
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime(value) {
            peaks.push(value);
          },
          exponentialRampToValueAtTime() {},
        },
      };
    }
  }
  const chime = createChime(Audio);
  assert.equal(chime.play(), false);
  await chime.unlock();
  await chime.unlock();
  assert.equal(chime.play(), true);
  assert.deepEqual(starts, [10, 10.18]);
  assert.deepEqual(peaks, [0.06, 0.06]);
  chime.dispose();
  assert.equal(instances, 1);
  assert.equal(closed, 1);
});
