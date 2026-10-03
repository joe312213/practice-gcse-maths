<script>
  import NextStage from './NextStage.svelte';
  let { page, mode, onstage, onnext, onpromotion } = $props();
</script>

{#if page.complete}
  {@const correct = Object.values(page.responses).filter((r) => r.correct).length}
  {#if mode === 'assessment'}
    <p class="assessment-complete" role="status">
      Assessment complete · {correct} of {page.size} correct.
    </p>
    <NextStage {mode} onadvance={onstage} id="assessment-next" />
  {:else}
    <section class="card summary">
      <h2>Page complete</h2>
      <p>{correct} of {page.size} correct on first submission.</p>
      <NextStage {mode} onadvance={onstage} />
      {#if page.pendingChoice}<p>Would you like to try harder questions of this type next time?</p>
        <button
          class="action-button"
          type="button"
          id="accept-promotion"
          onclick={() => onpromotion(true)}>Yes, try harder</button
        >
        <button
          class="action-button"
          type="button"
          id="decline-promotion"
          onclick={() => onpromotion(false)}>Keep this level</button
        >
      {:else}<button class="action-button" type="button" id="new-page" onclick={onnext}
          >Practise another page</button
        >{/if}
    </section>
  {/if}
{/if}
