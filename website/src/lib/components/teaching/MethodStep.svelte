<!--
  Purpose: Keyed concept help keeps authored method text and explanations together without HTML
  injection.

  Main contents:
  - Linked concept terms, independent disclosure state, authored explanations, tables and
  diagrams.

  Used By: website/src/lib/components/teaching/Guidance.svelte.

  Uses: website/src/lib/components/teaching/ConceptVisual.svelte,
  website/src/lib/components/teaching/MathText.svelte.

  Libs: none.
-->
<script>
  import ConceptVisual from './ConceptVisual.svelte';
  import MathText from './MathText.svelte';
  let { step } = $props();
  const id = $props.id();
  let expanded = $state({});
  const parts = $derived(Array.isArray(step) ? step : [step]);
</script>

{#each parts as part, index}
  {#if typeof part === 'string'}{part}{:else}<span class="concept-term"
      ><button
        type="button"
        class="concept-help"
        aria-label={`Explain ${part.text}`}
        aria-expanded={Boolean(expanded[index])}
        aria-controls={`${id}-${index}`}
        onclick={() => (expanded[index] = !expanded[index])}>{part.text}</button
      ></span
    >{/if}
{/each}
{#each parts as part, index}
  {#if typeof part !== 'string'}
    <div class="concept-explanation" id={`${id}-${index}`} hidden={!expanded[index]}>
      <strong>{part.help.title}</strong>
      <p><MathText text={part.help.explanation} /></p>
      <p><MathText text={part.help.guidance} /></p>
      {#if part.help.visual}<ConceptVisual kind={part.help.visual} />{/if}
      {#if part.help.table}
        <div class="concept-table">
          <table>
            <caption>{part.help.table.caption}</caption>
            <thead
              ><tr
                >{#each part.help.table.headers as heading}<th scope="col">{heading}</th>{/each}</tr
              ></thead
            >
            <tbody
              >{#each part.help.table.rows as row}<tr
                  >{#each row as cell}<td><MathText text={cell} /></td>{/each}</tr
                >{/each}</tbody
            >
          </table>
        </div>
      {/if}
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
    display: inline;
    padding: 0;
    font: inherit;
    color: var(--accent-text);
    text-decoration: underline;
    text-underline-offset: 0.15em;
    background: transparent;
    border: 0;
    cursor: pointer;
  }
  .concept-table {
    overflow-x: auto;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-block: 0.75rem;
  }
  caption {
    text-align: left;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  th,
  td {
    text-align: left;
    vertical-align: top;
    border: 1px solid var(--accent-border);
    padding: 0.5rem;
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
