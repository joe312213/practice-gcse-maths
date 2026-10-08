<!--
  Purpose: Connect arithmetic teaching to the shared playback controller.
  Main contents: Challenge selection, guidance and staged method drawing.
  Used By: MethodDemo.
  Uses: ArithmeticWorking, Guidance, ShowDemo, arithmetic-demo and engine.
  Libs: Svelte state and derivation.
-->
<script>
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { arithmeticFrames } from '#lib/application/arithmetic-demo.mjs';
  import ArithmeticWorking from './ArithmeticWorking.svelte';
  import ShowDemo from './ShowDemo.svelte';
  import Guidance from './Guidance.svelte';
  let { bank, initialLevel = 0, onlevel = () => {}, speed = 1, onspeed = () => {} } = $props();
  const question = $derived(
    bank.questions.find((q) => q.type === 'demo' && q.level === initialLevel),
  );
  const frames = $derived(arithmeticFrames(question));
</script>

<div class="demo-body">
  <div class="level-row" role="group" aria-label="Demonstration challenge">
    {#each LEVELS as label, level}<button
        type="button"
        class="action-button"
        data-demo-level={level}
        aria-pressed={initialLevel === level}
        onclick={() => onlevel(level)}>{label}</button
      >{/each}
  </div>
  <Guidance guidance={bank.teaching.guidance[initialLevel]} />
  {#key question}
    <ShowDemo {frames} steps={4} {speed} {onspeed}>
      {#snippet heading()}<p class="selected-equation">{question.q}</p>{/snippet}
      {#snippet children(frame)}<ArithmeticWorking {question} {frame} />{/snippet}
      {#snippet completion()}<p><strong>Check:</strong> {question.check}</p>{/snippet}
    </ShowDemo>
  {/key}
</div>
