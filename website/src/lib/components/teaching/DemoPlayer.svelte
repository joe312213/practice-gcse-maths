<!--
  Purpose: Connect the challenge selector and teaching data to the shared demo presentation.

  Main contents:
  - chooseLevel

  Used By: website/src/lib/components/practice/PracticeActivity.svelte, website/src/routes/+page.svelte

  Uses: website/src/lib/domain/engine.mjs, website/src/lib/application/equation-demo.mjs, website/src/lib/components/teaching/Guidance.svelte, website/src/lib/components/teaching/EquationWorking.svelte, website/src/lib/components/teaching/ShowDemo.svelte.

  Libs: svelte (component lifecycle and state).
-->
<script>
  import { untrack } from 'svelte';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { equationFrames } from '#lib/application/equation-demo.mjs';
  import Guidance from './Guidance.svelte';
  import EquationWorking from './EquationWorking.svelte';
  import ShowDemo from './ShowDemo.svelte';
  let { bank, initialLevel = 0, onlevel = () => {}, speed = 1, onspeed = () => {} } = $props();
  let level = $state(untrack(() => initialLevel)),
    example = $state('demo');
  const exampleId = $props.id();
  const question = $derived(
    example === 'demo'
      ? bank.questions.find((q) => q.type === 'demo' && q.level === level)
      : bank.recap[level],
  );
  const annotations = $derived(
    bank.teaching[example === 'demo' ? 'demoAnnotations' : 'recapAnnotations'][level],
  );
  const frames = $derived(equationFrames(question.balance));
  /**
   * Publish the selected demonstration level to its parent.
   * Parameter value: new value to apply or validate.
   */
  function chooseLevel(value) {
    level = value;
    onlevel(value);
  }
</script>

<div class="demo-body">
  <div class="level-row" role="group" aria-label="Demonstration challenge">
    {#each LEVELS as label, index}<button
        class="action-button"
        type="button"
        data-demo-level={index}
        aria-pressed={index === level}
        onclick={() => chooseLevel(index)}>{label}</button
      >{/each}
  </div>
  <Guidance guidance={bank.teaching.guidance[level]} />
  <label for={exampleId}>Example</label>
  <select class="choice-field" id={exampleId} data-demo-example bind:value={example}
    ><option value="demo">Worked example</option><option value="recap"
      >{bank.recap[level].title}</option
    ></select
  >
  {#key question}
    <ShowDemo {frames} steps={question.balance.length} {speed} {onspeed}>
      {#snippet heading()}
        <p class="selected-equation">
          {question.q ?? `${question.balance[0].l} = ${question.balance[0].r}`}
        </p>
      {/snippet}
      {#snippet children(frame)}
        <EquationWorking
          rows={question.balance}
          limit={frame.step}
          part={frame.part}
          staged
          {annotations}
        />
      {/snippet}
      {#snippet completion()}
        <div class="demo-check">
          {#if question.check}<p><strong>Check:</strong> {question.check}</p>{/if}
          {#each question.notes ?? [] as note}<p>{note}</p>{/each}
        </div>
      {/snippet}
    </ShowDemo>
  {/key}
</div>
