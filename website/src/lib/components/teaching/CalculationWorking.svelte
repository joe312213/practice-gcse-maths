<!--
  Purpose: Authored calculation steps, shared by new-topic demos, feedback and incorrect
  working.

  Main contents:
  - Authored calculation rows, reveal frames, working notes and final highlights.

  Used By: website/src/lib/components/practice/Feedback.svelte,
  website/src/lib/components/practice/PracticeActivity.svelte,
  website/src/lib/components/teaching/DemoPlayer.svelte,
  website/src/lib/components/teaching/ProblemTips.svelte, website/src/routes/+page.svelte.

  Uses: website/src/lib/components/teaching/MathText.svelte.

  Libs: none.
-->
<script>
  import MathText from './MathText.svelte';
  let { question, steps = question.steps, frame = null, compact = false, font = null } = $props();
</script>

<div class="calculation-working" class:compact class:staged={Boolean(frame)}>
  {#each steps as row, index}
    {#if !frame || index < frame.step}
      {@const active = frame?.step === index + 1}
      {@const unit = row.outputUnit ?? (index === steps.length - 1 ? question.answerUnit : '')}
      <div class="calculation-step" data-step={index}>
        {#if !compact}<p class="step-caption">{row.title}</p>{/if}
        <p class="calculation-line">
          <span
            class:quantity={row.input === row.output && Boolean(unit)}
            class:method-active={active && (frame.phase === 'inspect' || row.input === row.output)}
            ><MathText text={row.input} unit={row.input === row.output ? unit : ''} {font} /></span
          >
          {#if row.input !== row.output && (!frame || !active || frame.phase === 'write')}
            <span class="calculation-equals" aria-hidden="true">
              <MathText text={row.approximate ? '≈' : '='} {font} />
            </span><span
              class:quantity={Boolean(unit)}
              class:method-active={active && frame.phase === 'write'}
              ><MathText text={row.output} {unit} {font} /></span
            >
          {/if}
        </p>
        {#if !compact && row.note && (!frame || !active || frame.phase === 'write')}<p
            class="step-caption"
          >
            {row.note}
          </p>{/if}
      </div>
    {/if}
  {/each}
</div>

<style>
  .calculation-working {
    min-width: 0;
    max-width: 100%;
  }
  .calculation-step {
    margin-block: 0.75rem;
  }
  .calculation-line {
    overflow-wrap: anywhere;
    font-size: 1.15rem;
  }
  .step-caption {
    font-size: 0.875rem;
    color: var(--muted);
  }
  .quantity {
    display: inline-block;
    white-space: nowrap;
  }
  .staged .calculation-line > span {
    padding-inline: 2px;
  }
  .calculation-line > .calculation-equals {
    display: inline-block;
    padding-inline: 0.25em;
  }
  .method-active {
    display: inline-block;
    background: var(--method-highlight, var(--selection-bg));
    color: var(--selection-text);
    border-radius: var(--radius-field);
  }
  .compact .calculation-step {
    margin-block: 0.35rem;
  }
  .compact .calculation-line {
    font-size: 0.8rem;
    margin: 0;
  }
</style>
