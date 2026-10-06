/**
 * Purpose: Manage cancellable demo playback using injected timing and frame callbacks.
 *
 * Main contents:
 * - createPlayer
 *
 * Used By: tests/website.test.mjs, website/src/lib/components/teaching/ShowDemo.svelte
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
// Timer is injectable for deterministic tests; every component owns and cancels its timer.
/**
 * Create playback controls with injected timers and a frame callback.
 * Parameter length: number of reveal frames.
 * Parameter onFrame: callback receiving playback state.
 * Parameter schedule: timer scheduling dependency.
 * Parameter cancel: timer cancellation dependency.
 * Parameter delay: frame delay in milliseconds.
 * @example const player = createPlayer({ length: frames.length, onFrame }); player.play();
 */
export function createPlayer({
  length,
  onFrame,
  schedule = setTimeout,
  cancel = clearTimeout,
  delay = 2600,
}) {
  let step = 1,
    playing = false,
    timer = null,
    disposed = false,
    paused = false;
  /**
   * Cancel and forget the scheduled frame timer.
   * Used by: play, pause, go, setDelay, dispose.
   */
  const clear = () => {
    if (timer !== null) cancel(timer);
    timer = null;
  };
  /**
   * Notify the frame callback unless the player has been disposed.
   * Used by: tick, play, pause, go.
   */
  const emit = () => {
    if (!disposed) onFrame({ step, playing });
  };
  /**
   * Advance one frame, emit it and schedule the next frame while playback remains active.
   * Calls: emit.
   */
  const tick = () => {
    timer = null;
    if (disposed || !playing) return;
    step = Math.min(length, step + 1);
    if (step === length) playing = false;
    emit();
    if (playing) timer = schedule(tick, delay);
  };
  return {
    /**
     * Start or resume frame playback using the current delay.
     * Calls: clear, emit.
     */
    play() {
      if (disposed) return;
      clear();
      if (!paused || step === length) step = 1;
      paused = false;
      playing = true;
      emit();
      timer = schedule(tick, delay);
    },
    /**
     * Cancel the timer and preserve the current frame for resumption.
     * Calls: clear, emit.
     */
    pause() {
      clear();
      playing = false;
      paused = true;
      emit();
    },
    /**
     * Clamp the requested frame index and stop automatic playback.
     * Parameter n: requested one-based frame.
     * Calls: clear, emit.
     */
    go(n) {
      clear();
      playing = false;
      paused = false;
      step = Math.max(1, Math.min(length, n));
      emit();
    },
    /**
     * Replace the playback delay and reschedule an active timer.
     * Parameter value: new value to apply or validate.
     * Calls: clear.
     */
    setDelay(value) {
      delay = value;
      if (playing) {
        clear();
        timer = schedule(tick, delay);
      }
    },
    /**
     * Cancel playback permanently so no later callback updates an unmounted component.
     * Calls: clear.
     */
    dispose() {
      clear();
      playing = false;
      disposed = true;
    },
    /**
     * Return the current reveal-frame index.
     */
    get step() {
      return step;
    },
    /**
     * Return whether playback is active.
     */
    get playing() {
      return playing;
    },
  };
}
