<!--
  Purpose: Shared navigation for ordered pages/questions; callers own availability and
  transitions.

  Main contents:
  - Previous/next controls, disabled state, labels and optional page summary snippet.

  Used By: website/src/lib/components/practice/NextStage.svelte,
  website/src/lib/components/practice/PracticeActivity.svelte,
  website/src/lib/components/practice/PracticeSets.svelte,
  website/src/routes/puzzles.html/+page.svelte.

  Uses: no local module imports.

  Libs: none.
-->
<script>
  let {
    onprevious,
    onnext,
    previousDisabled = false,
    nextDisabled = false,
    label = 'Page navigation',
    previousLabel = 'Prev',
    nextLabel = 'Next',
    nextId,
    children,
  } = $props();
</script>

<nav class="page-navigation" aria-label={label}>
  <button
    class="action-button"
    type="button"
    disabled={!onprevious || previousDisabled}
    onclick={onprevious}
    aria-label={previousLabel}>Prev</button
  >
  <span class="source-ref">{@render children?.()}</span>
  <button
    class="action-button"
    type="button"
    id={nextId}
    disabled={!onnext || nextDisabled}
    onclick={onnext}
    aria-label={nextLabel}>Next</button
  >
</nav>

<style>
  .page-navigation {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.5rem;
    margin-block: 1rem;
  }
  .source-ref {
    text-align: center;
    overflow-wrap: anywhere;
  }
</style>
