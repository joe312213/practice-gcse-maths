<!--
  Purpose: Render one written token with shared Pacifico strokes; ShowDemo owns its motion. SVG
  placement uses the same baseline for digits, carries and inline mathematical working.

  Main contents:
  - Measured stroke paths, baselines and clipping for a single animated maths token.

  Used By: website/src/lib/components/teaching/ArithmeticWorking.svelte,
  website/src/lib/components/teaching/MathText.svelte.

  Uses: website/src/lib/application/handwriting.mjs.

  Libs: none.
-->
<script>
  import { renderHandwriting } from '#lib/application/handwriting.mjs';
  let { font, text, x = null, y = null, size = 27, focused = false } = $props();
  let svg;
  $effect(() => {
    const controller = renderHandwriting(svg, font, String(text), () => {}, true);
    const { width, height: em } = svg.viewBox.baseVal;
    svg.style.removeProperty('aspect-ratio');
    svg.style.removeProperty('max-width');
    if (x === null) svg.style.width = `${width / em}em`;
    else {
      svg.setAttribute('x', x - (width * size) / (em * 2));
      svg.setAttribute('y', y - size);
      svg.setAttribute('width', (width * size) / em);
      svg.setAttribute('height', size);
      svg.style.width = `${(width * size) / em}px`;
      svg.style.height = `${size}px`;
    }
    return () => controller.dispose();
  });
</script>

<svg bind:this={svg} class:focused data-written-ink role="img" aria-label={String(text)}></svg>

<style>
  svg {
    display: inline-block;
    height: 1em;
    overflow: visible;
    vertical-align: baseline;
  }
  svg.focused {
    color: var(--selection-text);
  }
</style>
