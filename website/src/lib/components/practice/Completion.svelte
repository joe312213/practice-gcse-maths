<script>
  import NextStage from './NextStage.svelte';
  let { page, mode, onstage, onnext, onpromotion, practiceSet = null, onSetNext } = $props();
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
      {#if !practiceSet}<NextStage {mode} onadvance={onstage} />{/if}
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
      {:else if practiceSet}
        {#if !practiceSet.finished && practiceSet.index < practiceSet.config.pages.length - 1}
          <button class="action-button primary" onclick={onSetNext}>Next Practice set page</button>
        {/if}
      {:else}<button class="action-button" type="button" id="new-page" onclick={onnext}
          >Practise another page</button
        >{/if}
    </section>
  {/if}
{/if}
