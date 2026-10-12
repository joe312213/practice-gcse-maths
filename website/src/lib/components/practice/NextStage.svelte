<!--
  Purpose: Offer the next prerequisite learning stage after the current activity.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/Completion.svelte, website/src/routes/+page.svelte

  Uses: website/src/lib/domain/stages.mjs.

  Libs: none.
-->
<script>
  import PageNavigation from '../ui/PageNavigation.svelte';
  import { MODES, nextStage } from '#lib/domain/stages.mjs';
  let { mode, onadvance, id = 'next-stage' } = $props();
  const previous = $derived(MODES[MODES.findIndex(([id]) => id === mode) - 1]);
  const next = $derived(nextStage(mode));
</script>

<PageNavigation
  label="Learning stage navigation"
  previousLabel={previous ? `Previous: ${previous[1]}` : 'Previous stage'}
  nextLabel={next ? `Next: ${next[1]}` : 'Next stage'}
  onprevious={previous ? () => onadvance(previous[0]) : undefined}
  onnext={next ? () => onadvance(next[0]) : undefined}
  nextId={id}
/>
