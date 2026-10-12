<!-- Authored calculation steps, shared by new-topic demos, feedback and incorrect working. -->
<script>
  import MathText from './MathText.svelte';
  let { question, steps = question.steps, frame = null, compact = false } = $props();
</script>

<div class="calculation-working" class:compact>
  {#each steps as row, index}
    {#if !frame || index < frame.step}
      {@const active = frame?.step === index + 1}
      <div class="calculation-step" data-step={index}>
        {#if !compact}<p class="step-caption">{row.title}</p>{/if}
        <p class="calculation-line">
          <span
            class:method-active={active && (frame.phase === 'inspect' || row.input === row.output)}
            ><MathText text={row.input} /></span
          >
          {#if row.input !== row.output && (!frame || !active || frame.phase === 'write')}
            <span aria-hidden="true"> = </span><span
              class:method-active={active && frame.phase === 'write'}
              ><MathText text={row.output} /></span
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
  .method-active {
    display: inline-block;
    background: var(--selection-bg);
    color: var(--selection-text);
    outline: 1px solid var(--selection-border);
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
