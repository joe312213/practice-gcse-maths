<!--
  Purpose: Offer the next prerequisite learning stage after the current activity.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/Completion.svelte, website/src/routes/+page.svelte

  Uses: website/src/lib/domain/stages.mjs.

  Libs: none.
-->
<script>
  import { nextStage } from '#lib/domain/stages.mjs';
  let { mode, onadvance, id = 'next-stage' } = $props();
  const next = $derived(nextStage(mode));
</script>

{#if next}
  <div class="stage-actions">
    <button type="button" class="action-button primary" {id} onclick={() => onadvance(next[0])}>
      Next: {next[1]}
    </button>
  </div>
{/if}
