<script>
  import { nextStage } from '#lib/domain/stages.mjs';
  let { mode, onadvance, id = 'next-stage' } = $props();
  const next = $derived(nextStage(mode));
</script>

{#if next}
  <div class="stage-actions">
    <button type="button" class="action-button primary" {id} onclick={() => onadvance(next[0])}>
      Next: {next[1].split(' · ')[1]}
    </button>
  </div>
{/if}
