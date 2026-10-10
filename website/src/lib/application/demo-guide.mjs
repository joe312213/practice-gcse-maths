/** Shared construction frames: draw the method guide before writing any calculation. */
export function guideFrames(detail) {
  return [0, 0.25, 0.5, 0.75, 1].map((guideProgress) => ({
    step: 1,
    ...detail,
    guideProgress,
  }));
}
