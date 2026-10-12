<!-- Draft numerical methods use authored input/result steps with the existing playback controls. -->
<script>
  import { untrack } from 'svelte';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { calculationFrames } from '#lib/application/calculation-demo.mjs';
  import CalculationDiagram from './CalculationDiagram.svelte';
  import CalculationWorking from './CalculationWorking.svelte';
  import MathText from './MathText.svelte';
  import Guidance from './Guidance.svelte';
  import ShowDemo from './ShowDemo.svelte';
  let { bank, initialLevel = 0, onlevel = () => {}, speed = 1, onspeed = () => {} } = $props();
  let level = $state(untrack(() => initialLevel)),
    example = $state('demo');
  const id = $props.id();
  const question = $derived(
    example === 'demo'
      ? bank.questions.find((q) => q.type === 'demo' && q.level === level)
      : bank.recap[level],
  );
  const frames = $derived(calculationFrames(question.steps));
</script>

<div class="demo-body">
  <div class="level-row" role="group" aria-label="Demonstration challenge">
    {#each LEVELS as label, index}<button
        class="action-button"
        data-demo-level={index}
        aria-pressed={index === level}
        onclick={() => {
          level = index;
          onlevel(index);
        }}>{label}</button
      >{/each}
  </div>
  <Guidance guidance={bank.teaching.guidance[level]} />
  <label for={id}>Example</label>
  <select class="choice-field" {id} data-demo-example bind:value={example}
    ><option value="demo">Worked example</option><option value="recap"
      >Another worked example</option
    ></select
  >
  {#key question}
    <ShowDemo {frames} steps={question.steps.length} {speed} {onspeed}>
      {#snippet heading()}<p class="selected-equation" class:word-question={question.prose}>
          <MathText text={question.q} />
        </p>{/snippet}
      {#snippet children(frame)}<CalculationDiagram {question} {frame} /><CalculationWorking
          {question}
          {frame}
        />{/snippet}
      {#snippet completion()}<p>
          <strong>Check:</strong>
          <MathText text={question.check} />
        </p>{/snippet}
    </ShowDemo>
  {/key}
</div>
