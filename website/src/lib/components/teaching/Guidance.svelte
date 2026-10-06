<!--
  Purpose: Present level-specific rules and teaching guidance from the bank.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte, website/src/lib/components/teaching/DemoPlayer.svelte

  Uses: no local module imports.

  Libs: none.
-->
<script>
  let { guidance } = $props();
</script>

<div class="guidance">
  <p>{guidance.aim}</p>
  <ol class="steps">
    {#each guidance.steps as step}<li>{step}</li>{/each}
  </ol>
</div>
