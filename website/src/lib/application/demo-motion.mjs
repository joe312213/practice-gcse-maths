/**
 * Purpose: Interpolate newly revealed demo ink through native browser animations, preserving static rendering and reduced motion.
 *
 * Main contents:
 * - createDemoMotion and its snapshot, playback and cleanup controls.
 *
 * Used By: ShowDemo.svelte.
 *
 * Uses: handwriting.mjs for shared ordered pen strokes.
 *
 * Libs: None; uses Web Animations and browser style/media APIs.
 */
import { animateStrokes } from './handwriting.mjs';

/**
 * Create ink animation controls for renderer root. Called by ShowDemo; dispose with cancel on unmount.
 * @example const motion = createDemoMotion(root); const before = motion.snapshot(); // Reveal after the renderer updates.
 */
export function createDemoMotion(root) {
  const animations = new Set();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  /**
   * Capture rendered ink state by element. Called before frame updates and by reveal.
   */
  function snapshot() {
    return new Map(
      [
        ...root.querySelectorAll(
          '.method-guide, .equation-divider, [data-written-ink] [data-stroke]',
        ),
      ].map((element) => {
        const style = getComputedStyle(element);
        const property = element.matches('.method-guide')
          ? 'strokeDashoffset'
          : element.matches('.equation-divider')
            ? 'backgroundSize'
            : 'ink';
        const value =
          property === 'ink' ? (style.visibility === 'hidden' ? null : 'visible') : style[property];
        return [element, { property, value }];
      }),
    );
  }
  /**
   * Cancel all live native animations. Called by reveal, manual navigation and component cleanup.
   */
  function cancel() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }
  return {
    snapshot,
    cancel,
    /** Interpolate only newly revealed ink; final layout and semantics remain in the renderer. */
    reveal(before, speed, duration = 650) {
      cancel();
      if (reduced.matches) return;
      const strokes = [];
      const own = (animation) => {
        animation.playbackRate = speed;
        animations.add(animation);
        animation.onfinish = () => {
          animation.cancel();
          animations.delete(animation);
        };
      };
      for (const [element, { property, value }] of snapshot()) {
        const previous = before.get(element)?.value;
        if (value === null || previous === value) continue;
        if (property === 'ink') strokes.push(element);
        else
          own(
            element.animate([{ [property]: previous ?? value }, { [property]: value }], {
              duration,
              easing: 'linear',
            }),
          );
      }
      animateStrokes(strokes, duration).forEach(own);
    },
    /** Hold the final highlight for 3s, then fade only its background (never the written ink). */
    fadeHighlights() {
      const targets = root.querySelectorAll(
        '.balance .method-active > span, .calculation-working .method-active, .method-focus, .step-note[aria-current="step"], .steps li[aria-current="step"]',
      );
      for (const target of targets) {
        const property = target.matches('.method-focus') ? 'fill' : 'backgroundColor';
        const animation = target.animate(
          [{ [property]: getComputedStyle(target)[property] }, { [property]: 'transparent' }],
          { delay: 3000, duration: reduced.matches ? 0 : 1000, fill: 'forwards', easing: 'linear' },
        );
        animation.id = 'method-highlight-fade';
        // Retain the finished effect until replay, navigation or disposal cancels it.
        animations.add(animation);
      }
    },
    pause() {
      for (const animation of animations) animation.pause();
    },
    resume() {
      for (const animation of animations) animation.play();
    },
    setSpeed(speed) {
      for (const animation of animations)
        if (animation.id !== 'method-highlight-fade') animation.updatePlaybackRate(speed);
    },
  };
}
