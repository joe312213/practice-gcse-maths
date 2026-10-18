<!--
  Purpose: Accessible font specimen and optional writing controls.

  Main contents:
  - Font specimen output, missing-glyph reporting and optional writing controls.

  Used By: website/src/routes/handwriting.html/+page.svelte.

  Uses: website/src/lib/application/handwriting.mjs.

  Libs: none.
-->
<script>
  import { renderHandwriting } from '#lib/application/handwriting.mjs';
  let { font, text, animated = false } = $props();
  let svg, controller;
  let state = $state('finished');
  $effect(() => {
    controller = renderHandwriting(svg, font, text, () => {
      state = 'finished';
    });
    state = 'finished';
    return () => controller.dispose();
  });
</script>

<div class="stroke-sample">
  <svg bind:this={svg} role="img" aria-label={`${font.name}: ${text}`}></svg>
  {#if animated}
    <div class="actions">
      <button
        class="action-button"
        onclick={() => {
          state = 'playing';
          controller.play();
        }}>Replay</button
      >
      <button
        class="action-button"
        disabled={state === 'finished'}
        onclick={() => {
          if (state === 'playing') {
            controller.pause();
            state = 'paused';
          } else {
            controller.resume();
            state = 'playing';
          }
        }}>{state === 'paused' ? 'Resume' : 'Pause'}</button
      >
      <button class="action-button" onclick={() => controller.finish()}>End</button>
    </div>
  {/if}
</div>

<style>
  .stroke-sample {
    margin-block: 0.6rem;
  }
  svg {
    display: block;
    width: 100%;
    min-height: 1.5rem;
    overflow: visible;
  }
  .actions {
    margin-top: 0.75rem;
  }
</style>
