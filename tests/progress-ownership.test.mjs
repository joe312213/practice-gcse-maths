/**
 * Purpose: Handover must drain full asynchronous operations, including their final local save.
 *
 * Main contents:
 * - pause stops timers first and waits for file transactions and nested final saves; exclusive
 *   ownership is released only after cleanup; failed cleanup retains it; initial competing
 *   startup never requests an unapproved handover.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/src/lib/adapters/progress-ownership.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  progressTask,
  pauseProgress,
  onProgressPause,
  ownProgress,
} from "../website/src/lib/adapters/progress-ownership.mjs";

test("pause stops timers first and waits for file transactions and nested final saves", async () => {
  const events = [];
  let complete;
  const gate = new Promise((resolve) => {
    complete = resolve;
  });
  const unregister = onProgressPause(() => events.push("timer stopped"));
  const operation = progressTask(async () => {
    await gate;
    events.push("file saved");
    await progressTask(async () => {
      await Promise.resolve();
      events.push("local saved");
    })();
  })();
  let done = false;
  const pause = pauseProgress().then(() => {
    done = true;
  });
  await Promise.resolve();
  assert.deepEqual(events, ["timer stopped"]);
  assert.equal(done, false);
  complete();
  await pause;
  await operation;
  unregister();
  assert.deepEqual(events, ["timer stopped", "file saved", "local saved"]);
});

test("exclusive ownership is released only after cleanup; failed cleanup retains it", async () => {
  for (const fail of [false, true]) {
    const states = [];
    let finish,
      released = false;
    const paused = new Promise((resolve, reject) => {
      finish = () => (fail ? reject(Error("failed")) : resolve());
    });
    const channel = { postMessage() {}, close() {} };
    const owner = ownProgress({
      locks: {
        request: async (name, options, callback) => {
          await callback({ name });
          released = true;
        },
      },
      channel,
      change: (state) => states.push(state),
      pause: () => paused,
    });
    assert.equal(states.at(-1), "active");
    channel.onmessage({ data: "handover" });
    assert.equal(states.at(-1), "yielding");
    assert.equal(released, false);
    finish();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(states.at(-1), fail ? "failed" : "standby");
    assert.equal(released, !fail);
    if (!fail) owner.close();
  }
});

test("initial competing startup never requests an unapproved handover", async () => {
  const messages = [],
    callbacks = [];
  const channel = {
    postMessage: (message) => messages.push(message),
    close() {},
  };
  const owner = ownProgress({
    locks: {
      request: (name, options, callback) =>
        new Promise((resolve) => {
          callbacks.push(async (lock) => {
            await callback(lock);
            resolve();
          });
        }),
    },
    channel,
    change() {},
    pause: async () => {},
  });
  channel.onmessage({ data: "active" });
  assert.deepEqual(messages, []);
  await callbacks.shift()(null);
  owner.request();
  assert.deepEqual(messages, ["handover"]);
  owner.close();
  await callbacks.shift()(null);
});
