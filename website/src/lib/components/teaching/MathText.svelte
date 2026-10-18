<!--
  Purpose: Render authored {numerator/denominator} tokens as accessible stacked fractions; never
  HTML.

  Main contents:
  - Fraction token parsing and accessible stacked numerator/denominator markup.

  Used By: website/src/lib/components/practice/Feedback.svelte,
  website/src/lib/components/practice/PracticeActivity.svelte,
  website/src/lib/components/practice/QuestionList.svelte,
  website/src/lib/components/teaching/ArithmeticWorking.svelte,
  website/src/lib/components/teaching/CalculationWorking.svelte,
  website/src/lib/components/teaching/DemoPlayer.svelte,
  website/src/lib/components/teaching/EquationWorking.svelte.

  Uses: website/src/lib/components/teaching/WrittenInk.svelte,
  website/src/lib/domain/quantity.mjs.

  Libs: none.
-->
<script>
  import WrittenInk from './WrittenInk.svelte';
  import { formatQuantity } from '#lib/domain/quantity.mjs';
  let { text = '', unit = '', font = null } = $props();
  const parts = $derived(formatQuantity(text, unit).split(/(\{[-\d]+\/\d+\})/g));
</script>

{#snippet token(value)}
  {#if font}{#each String(value).split(/(\s+)/) as word}{#if word.trim()}<WrittenInk
          {font}
          text={word}
        />{:else}{word}{/if}{/each}{:else}{value}{/if}
{/snippet}

{#each parts as part}
  {#if /^\{[-\d]+\/\d+\}$/.test(part)}
    {@const [n, d] = part.slice(1, -1).split('/')}
    <span class="fraction" role="math" aria-label={`${n} over ${d}`}
      ><span aria-hidden="true">{@render token(n)}</span><span aria-hidden="true"
        >{@render token(d)}</span
      ></span
    >
  {:else}{@render token(part)}{/if}
{/each}

<style>
  .fraction {
    display: inline-flex;
    flex-direction: column;
    vertical-align: middle;
    text-align: center;
    line-height: 1.1;
    margin-inline: 0.12em;
  }
  .fraction > span {
    padding: 0.1em 0.18em;
  }
  .fraction > span:first-child {
    border-bottom: 1px solid currentColor;
  }
</style>
