/** Native browser ink animation shared by all demo renderers; no animation dependency. */
export function createDemoMotion(root) {
  const animations = new Set();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function snapshot() {
    return new Map(
      [
        ...root.querySelectorAll(
          '.method-guide, .equation-divider, .balance td > span, .arithmetic-working text',
        ),
      ].map((element) => {
        const style = getComputedStyle(element);
        const property = element.matches('.method-guide')
          ? 'strokeDashoffset'
          : element.matches('.equation-divider')
            ? 'backgroundSize'
            : 'clipPath';
        const value =
          property === 'clipPath'
            ? style.visibility === 'hidden'
              ? null
              : 'inset(0 0 0 0)'
            : style[property];
        return [element, { property, value }];
      }),
    );
  }
  function cancel() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }
  return {
    snapshot,
    cancel,
    /** Interpolate only newly revealed ink; final layout and semantics remain in the renderer. */
    reveal(before, speed) {
      cancel();
      if (reduced.matches) return;
      for (const [element, { property, value }] of snapshot()) {
        const previous = before.get(element)?.value;
        if (value === null || previous === value) continue;
        const from = previous ?? (property === 'clipPath' ? 'inset(0 100% 0 0)' : value);
        const animation = element.animate([{ [property]: from }, { [property]: value }], {
          duration: 650,
          easing: 'linear',
        });
        animation.playbackRate = speed;
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    },
    pause() {
      for (const animation of animations) animation.pause();
    },
    resume() {
      for (const animation of animations) animation.play();
    },
    setSpeed(speed) {
      for (const animation of animations) animation.updatePlaybackRate(speed);
    },
  };
}
