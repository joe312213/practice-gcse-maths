<!-- Shared level/example selection and playback; each method keeps its own working renderer. -->
<script>
  import { guidanceFor } from '#lib/content/topic-bank.mjs';
  import { untrack } from 'svelte';
  import { LEVELS } from '#lib/domain/engine.mjs';
  import { equationFrames } from '#lib/application/equation-demo.mjs';
  import { arithmeticFrames } from '#lib/application/arithmetic-demo.mjs';
  import { calculationFrames } from '#lib/application/calculation-demo.mjs';
  import Guidance from './Guidance.svelte';
  import EquationWorking from './EquationWorking.svelte';
  import ArithmeticWorking from './ArithmeticWorking.svelte';
  import CalculationWorking from './CalculationWorking.svelte';
  import CalculationDiagram from './CalculationDiagram.svelte';
  import MathText from './MathText.svelte';
  import ShowDemo from './ShowDemo.svelte';
  import WrappingSelect from '../ui/WrappingSelect.svelte';
  let { bank, initialLevel = 0, onlevel = () => {}, speed = 1, onspeed = () => {} } = $props();
  let level = $state(untrack(() => initialLevel)),
    exampleKey = $state('demo');
  const exampleId = $props.id();
  const examples = $derived(bank.teaching.examples[['start', 'build', 'confidence'][level]]);
  const example = $derived(examples.find((item) => item.key === exampleKey) ?? examples[0]);
  const question = $derived(example.question);
  const arithmetic = $derived(['bus', 'lattice'].includes(bank.method));
  const calculation = $derived(bank.method === 'calculation');
  const frames = $derived(
    arithmetic
      ? arithmeticFrames(question)
      : calculation
        ? calculationFrames(question.steps)
        : equationFrames(question.balance),
  );
  const steps = $derived(
    arithmetic ? 5 : calculation ? question.steps.length : question.balance.length + 1,
  );
  function chooseLevel(value) {
    level = value;
    exampleKey = 'demo';
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
  {#if bank.calculator}<p class="muted">
      Calculator allowed. Keep intermediate values unrounded.
    </p>{/if}
  {#if !arithmetic}<Guidance guidance={guidanceFor(bank.teaching, level)} />{/if}
  {#if calculation && bank.teaching.answerNote}<p class="muted">{bank.teaching.answerNote}</p>{/if}
  <label for={exampleId}>Example</label>
  <WrappingSelect
    id={exampleId}
    data-demo-example
    aria-label="Example"
    value={example.key}
    options={examples.map((item, index) => ({ id: item.key, text: `${index + 1}. ${item.name}` }))}
    onchange={(value) => (exampleKey = value)}
  />
  {#key example}
    <ShowDemo {frames} {steps} {speed} {onspeed}>
      {#snippet introduction(step)}
        {#if arithmetic}<Guidance
            guidance={guidanceFor(bank.teaching, level)}
            activeStep={step}
          />{/if}
      {/snippet}
      {#snippet heading()}
        <p class="selected-equation" class:word-question={question.prose}>
          <MathText text={question.q ?? `${question.balance[0].l} = ${question.balance[0].r}`} />
        </p>
      {/snippet}
      {#snippet children(frame, font)}
        {#if arithmetic}<ArithmeticWorking {font} {question} {frame} />
        {:else if calculation}<CalculationDiagram {question} {frame} /><CalculationWorking
            {font}
            {question}
            {frame}
          />
        {:else}<EquationWorking
            {font}
            rows={question.balance}
            limit={Math.max(1, frame.step - 1)}
            part={frame.part}
            guideProgress={frame.guideProgress ?? 1}
            staged
            annotations={example.annotations}
          />{/if}
      {/snippet}
      {#snippet completion()}
        <div class="demo-check">
          {#if question.check}<p><strong>Check:</strong> <MathText text={question.check} /></p>{/if}
          {#each question.notes ?? [] as note}<p>{note}</p>{/each}
        </div>
      {/snippet}
    </ShowDemo>
  {/key}
</div>
