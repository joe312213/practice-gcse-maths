/** One writable application per origin. Drain complete operations before releasing its lease. */
const pending = new Set();
const pauses = new Set();

/** Preserve user-gesture timing while tracking the complete async operation, including its final save. */
export function progressTask(action) {
  return (...args) => {
    const task = Promise.resolve(action(...args));
    pending.add(task);
    const remove = () => pending.delete(task);
    task.then(remove, remove);
    return task;
  };
}

/** Practice registers an idempotent timer/autosave cleanup for navigation and handover. */
export function onProgressPause(stop) {
  pauses.add(stop);
  return () => pauses.delete(stop);
}

export async function pauseProgress() {
  for (const stop of pauses) stop();
  while (pending.size) await Promise.allSettled([...pending]);
}

/** Never steal a lease: an outstanding picker or file write must finish before another writer starts. */
export function ownProgress({ locks, channel, change, pause }) {
  let release,
    waiting = false,
    requested = false,
    closed = false,
    yielding = false;
  const abort = new AbortController();
  function request(explicit = false) {
    if (closed || waiting || release) return;
    waiting = true;
    requested = explicit;
    change(explicit ? 'waiting' : 'starting');
    const options = explicit ? { signal: abort.signal } : { ifAvailable: true };
    void locks
      .request('maths-progress-writer', options, async (lock) => {
        if (closed) return;
        waiting = false;
        requested = false;
        if (!lock) return change('standby');
        await new Promise((resolve) => {
          release = resolve;
          change('active');
          channel.postMessage('active');
        });
        release = null;
      })
      .catch(() => {
        if (!closed) change('unavailable');
      });
    if (explicit) channel.postMessage('handover');
  }
  async function handover() {
    if (!release || yielding) return;
    yielding = true;
    change('yielding');
    try {
      await pause();
      change('standby');
      release();
    } catch {
      // Keep ownership if cleanup failed; silently releasing would risk stale writes.
      change('failed');
    } finally {
      yielding = false;
    }
  }
  channel.onmessage = ({ data }) => {
    if (data === 'handover') void handover();
    if (data === 'active' && waiting && requested) channel.postMessage('handover');
  };
  request();
  return {
    request: () => request(true),
    close() {
      closed = true;
      abort.abort();
      channel.close();
      void pause().then(() => release?.());
    },
  };
}
