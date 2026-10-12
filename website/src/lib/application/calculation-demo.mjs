/** Deterministic inspect/write frames for authored numerical methods. Shared playback owns timing. */
export function calculationFrames(steps) {
  return steps.flatMap((_, index) => [
    { step: index + 1, phase: 'inspect' },
    { step: index + 1, phase: 'write' },
  ]);
}
