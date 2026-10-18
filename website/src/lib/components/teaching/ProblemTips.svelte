<!--
  Purpose: Level-matched application guidance shares the normal player and calculation renderer.

  Main contents:
  - Level-specific application tips and worked examples using the shared player.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte.

  Uses: website/src/lib/application/calculation-demo.mjs, website/src/lib/domain/engine.mjs,
  website/src/lib/components/teaching/MathText.svelte,
  website/src/lib/components/teaching/CalculationWorking.svelte,
  website/src/lib/components/teaching/ShowDemo.svelte.

  Libs: none.
-->
<script>
  import { calculationFrames } from '#lib/application/calculation-demo.mjs';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import MathText from './MathText.svelte';
  import CalculationWorking from './CalculationWorking.svelte';
  import ShowDemo from './ShowDemo.svelte';
  let { teaching, level, open = false, onopen, speed = 1, onspeed } = $props();
  const example = $derived(teaching.examples[level]);
</script>

<details class="problem-tips" {open} ontoggle={(event) => onopen(event.currentTarget.open)}>
  <summary>How to solve tips</summary>
  {#if open}
    <p>{LEVELS[level]} · Plan the calculation before you start.</p>
    <ol>
      {#each teaching.guidance as step}<li><strong>{step.title}:</strong> {step.text}</li>{/each}
    </ol>
    {#key example}
      <ShowDemo
        frames={calculationFrames(example.steps)}
        steps={example.steps.length}
        {speed}
        {onspeed}
      >
        {#snippet heading()}<p class="selected-equation word-question">
            <MathText text={example.q} />
          </p>{/snippet}
        {#snippet children(frame)}<CalculationWorking question={example} {frame} />{/snippet}
        {#snippet completion()}<p>
            <strong>Check:</strong>
            <MathText text={example.check} />
          </p>{/snippet}
      </ShowDemo>
    {/key}
  {/if}
</details>
