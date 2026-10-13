/**
 * Purpose: Render supplied stroke glyphs and provide cancellable, seekable writing playback.
 * Used by: StrokeSample.svelte, WrittenInk.svelte and demo-motion.mjs.
 * Uses: normalized local glyph data. Libs: native SVG and Web Animations APIs only.
 */
export const characterGroups = [
  ['Uppercase', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
  ['Lowercase', 'abcdefghijklmnopqrstuvwxyz'],
  ['Digits', '0123456789'],
  ['Basic maths', '+−×÷=<>():.%£/'],
  ['Higher GCSE notation', '≤≥≠≈±√∛πθ°²³⁻¹∝∞∈∉∪∩∅⊂⊆′→∠⊥∥'],
  ['Additional notation', 'αβγΣ∑ℕℤℝ![]{}|'],
  ['Units and currency', '£€$°µμ′″'],
  ['Indices', '⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾₀₁₂₃₄₅₆₇₈₉'],
];

/** Return unique unsupported characters, without silently substituting lookalikes. */
export function missingCharacters(font, text) {
  return [...new Set([...text].filter((char) => char !== ' ' && !font.glyphs[char]))];
}

/** Create an SVG child, keeping text input as text rather than interpolated markup. */
function element(parent, tag, attributes) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  parent.append(node);
  return node;
}

/**
 * Draw one line and return its writing controller. Each glyph follows the supplied path order.
 * Missing characters are boxed system text, deliberately excluded from the animated strokes.
 * Caller must dispose before changing text/font or removing the SVG.
 */
export function renderHandwriting(svg, font, text, onFinish = () => {}, method = false) {
  svg.replaceChildren();
  if (method) element(svg, 'title', {}).textContent = text;
  const line = element(svg, 'g', {
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': font.stroke,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  let cursor = 2;
  for (const char of text) {
    if (char === ' ') {
      cursor += font.space;
      continue;
    }
    const glyph = font.glyphs[char];
    const group = element(line, 'g', { 'data-glyph': char });
    if (glyph) {
      for (const path of glyph.paths)
        element(group, 'path', {
          d: path.d,
          transform: `translate(${path.x},${path.y}) scale(${path.scale ?? 1})`,
          'data-stroke': '',
          'vector-effect': 'non-scaling-stroke',
          'stroke-width': 1.5,
        });
      const bounds = group.getBBox();
      group.setAttribute('transform', `translate(${cursor - bounds.x},0)`);
      cursor += Math.max(glyph.advance, bounds.width + 2);
    } else {
      element(group, 'rect', { x: cursor, y: 1, width: 24, height: 29, 'stroke-dasharray': '2 2' });
      const label = element(group, 'text', {
        x: cursor + 12,
        y: 23,
        fill: 'currentColor',
        stroke: 'none',
        'font-size': 20,
        'text-anchor': 'middle',
        'data-missing': char,
      });
      label.textContent = char;
      cursor += 28;
    }
  }
  const box = line.getBBox(),
    inset = Math.max(3, font.stroke * 2);
  const width = Math.max(cursor, box.x + box.width) + inset;
  const height = Math.max(30, box.height) + inset * 2;
  // Pacifico's baseline is y=24; an 18-unit em retains normal numeral/x heights.
  // Overflow stays visible for capitals and descenders in the method component.
  svg.setAttribute('viewBox', method ? `0 6 ${width} 18` : `0 ${box.y - inset} ${width} ${height}`);
  svg.style.aspectRatio = `${width} / ${height}`;
  svg.style.maxWidth = `${(width / height) * 2.5}rem`;
  const strokes = [...svg.querySelectorAll('[data-stroke]')];
  let animations = [],
    duration = 0;
  /** Cancel owned animations; the underlying completed drawing becomes visible. */
  const dispose = () => {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  };
  return {
    /** Restart ordered pen strokes, with short pauses for pen lifts. */
    play() {
      dispose();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !strokes.length) {
        onFinish();
        return;
      }
      duration = 0;
      animations = animateStrokes(strokes);
      duration = Math.max(
        ...animations.map((animation) => animation.effect.getComputedTiming().endTime),
      );
      animations.at(-1).onfinish = onFinish;
    },
    pause() {
      animations.forEach((animation) => animation.pause());
    },
    resume() {
      animations.forEach((animation) => animation.play());
    },
    /** Seek a fraction of the complete line for integration with a method timeline. */
    seek(fraction) {
      animations.forEach((animation) => {
        animation.pause();
        animation.currentTime = Math.max(0, Math.min(1, fraction)) * duration;
      });
    },
    finish() {
      dispose();
      onFinish();
    },
    dispose,
  };
}

/** Draw ordered paths, optionally fitting the whole sequence to a method frame's duration. */
export function animateStrokes(strokes, frameDuration) {
  let elapsed = 0;
  const timings = strokes.map((path) => {
    // Non-scaling strokes express dash lengths in screen units too.
    const transform = path.getScreenCTM();
    const length = path.getTotalLength() * Math.hypot(transform.a, transform.b);
    const duration = Math.max(55, length * 5);
    const delay = elapsed;
    elapsed += duration + 35;
    return { path, length, duration, delay };
  });
  const scale = frameDuration ? frameDuration / Math.max(1, elapsed - 35) : 1;
  return timings.map(({ path, length, duration, delay }) =>
    path.animate(
      [
        { strokeDasharray: `${length + 1} ${length + 1}`, strokeDashoffset: length + 1 },
        { strokeDasharray: `${length + 1} ${length + 1}`, strokeDashoffset: 0 },
      ],
      { delay: delay * scale, duration: duration * scale, fill: 'both', easing: 'linear' },
    ),
  );
}
