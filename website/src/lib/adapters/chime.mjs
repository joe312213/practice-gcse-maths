/**
 * Purpose: A quiet, optional timer chime unlocked by the user's Start action.
 *
 * Main contents: Lazy AudioContext creation, short bell tones and disposal.
 *
 * Used By: PracticeCountdown.
 *
 * Uses: None. Libs: Native Web Audio; no downloaded sound asset.
 */
export function createChime(Audio = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  let context;
  return {
    // Call synchronously inside the user gesture; unavailable/blocked audio is non-fatal.
    unlock() {
      try {
        context ??= Audio ? new Audio() : null;
        return context?.resume().catch(() => {});
      } catch {
        return undefined;
      }
    },
    play() {
      if (!context || context.state !== 'running') return false;
      try {
        for (const [frequency, delay] of [
          [659.25, 0],
          [880, 0.18],
        ]) {
          const oscillator = context.createOscillator(),
            gain = context.createGain();
          const at = context.currentTime + delay;
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, at);
          gain.gain.linearRampToValueAtTime(0.06, at + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, at + 0.7);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
          oscillator.start(at);
          oscillator.stop(at + 0.75);
        }
        return true;
      } catch {
        return false;
      }
    },
    dispose() {
      void context?.close().catch(() => {});
      context = null;
    },
  };
}
