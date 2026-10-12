<!-- Render authored {numerator/denominator} tokens as accessible stacked fractions; never HTML. -->
<script>
  let { text = '' } = $props();
  const parts = $derived(String(text).split(/(\{[-\d]+\/\d+\})/g));
</script>

{#each parts as part}
  {#if /^\{[-\d]+\/\d+\}$/.test(part)}
    {@const [n, d] = part.slice(1, -1).split('/')}
    <span class="fraction" role="math" aria-label={`${n} over ${d}`}
      ><span aria-hidden="true">{n}</span><span aria-hidden="true">{d}</span></span
    >
  {:else}{part}{/if}
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
