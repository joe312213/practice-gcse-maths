// Timer is injectable for deterministic tests; every component owns and cancels its timer.
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
  const clear = () => {
    if (timer !== null) cancel(timer);
    timer = null;
  };
  const emit = () => {
    if (!disposed) onFrame({ step, playing });
  };
  const tick = () => {
    timer = null;
    if (disposed || !playing) return;
    step = Math.min(length, step + 1);
    if (step === length) playing = false;
    emit();
    if (playing) timer = schedule(tick, delay);
  };
  return {
    play() {
      if (disposed) return;
      clear();
      if (!paused || step === length) step = 1;
      paused = false;
      playing = true;
      emit();
      timer = schedule(tick, delay);
    },
    pause() {
      clear();
      playing = false;
      paused = true;
      emit();
    },
    go(n) {
      clear();
      playing = false;
      paused = false;
      step = Math.max(1, Math.min(length, n));
      emit();
    },
    dispose() {
      clear();
      playing = false;
      disposed = true;
    },
    get step() {
      return step;
    },
    get playing() {
      return playing;
    },
  };
}
