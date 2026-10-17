<!-- Keyed concept help keeps authored method text and explanations together without HTML injection. -->
<script>
  import MathText from './MathText.svelte';
  let { step } = $props();
  const id = $props.id();
  let expanded = $state({});
  const parts = $derived(Array.isArray(step) ? step : [step]);
</script>

{#each parts as part, index}
  {#if typeof part === 'string'}{part}{:else}<span class="concept-term"
      >{part.text}<button
        type="button"
        class="concept-help"
        aria-label={`Explain ${part.text}`}
        aria-expanded={Boolean(expanded[index])}
        aria-controls={`${id}-${index}`}
        onclick={() => (expanded[index] = !expanded[index])}
        ><span aria-hidden="true">?</span></button
      ></span
    >{/if}
{/each}
{#each parts as part, index}
  {#if typeof part !== 'string'}
    <div class="concept-explanation" id={`${id}-${index}`} hidden={!expanded[index]}>
      <strong>{part.help.title}</strong>
      <p><MathText text={part.help.explanation} /></p>
      <p><MathText text={part.help.guidance} /></p>
      {#each part.help.examples as example}<p>
          <strong>Example:</strong>
          <MathText text={example} />
        </p>{/each}
    </div>
  {/if}
{/each}

<style>
  .concept-term {
    display: inline;
  }
  .concept-help {
    display: inline-grid;
    place-items: center;
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0.25rem;
    vertical-align: middle;
    color: var(--accent-text);
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  .concept-help span {
    display: grid;
    place-items: center;
    width: 1.25em;
    height: 1.25em;
    border: 1px solid currentColor;
    border-radius: 50%;
    font-weight: 700;
  }
  .concept-explanation {
    margin-block: 0.5rem;
    padding: 0.75rem;
    border-inline-start: 3px solid var(--accent-border);
    background: var(--accent-bg);
    color: var(--accent-text);
  }
  .concept-explanation p {
    margin-block: 0.5rem 0;
  }
</style>
