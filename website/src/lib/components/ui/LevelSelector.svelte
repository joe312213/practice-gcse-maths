<!--
  Purpose: Present the same labelled challenge buttons in teaching and practice cards.

  Main contents: Controlled level choice with pressed and disabled states.

  Used By: DemoPlayer, PracticeActivity and CombinedPractice.

  Uses: domain/engine.mjs for the shared level names.

  Libs: Svelte for component props and rendering.
-->
<script>
  import { LEVELS } from '#lib/domain/engine.mjs';
  let { level, onchange, disabled = false, demo = false } = $props();
</script>

<div class="level-row level-selector" role="group" aria-label="Level">
  <span>Level:</span>
  {#each LEVELS as label, index}
    <button
      class="action-button"
      type="button"
      data-level={index}
      data-demo-level={demo ? index : undefined}
      aria-pressed={index === level}
      {disabled}
      onclick={() => onchange(index)}>{label}</button
    >
  {/each}
</div>
