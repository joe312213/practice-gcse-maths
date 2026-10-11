<!--
  Purpose: Present level-specific rules and teaching guidance from the bank.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte, website/src/lib/components/teaching/DemoPlayer.svelte, website/src/lib/components/teaching/ArithmeticDemo.svelte

  Uses: no local module imports.

  Libs: none.
-->
<script>
  let { guidance, activeStep } = $props();
</script>

<div class="guidance">
  <p>{guidance.aim}</p>
  <ol class="steps">
    {#each guidance.steps as step, index}
      <li aria-current={activeStep === index + 1 ? 'step' : undefined}>{step}</li>
    {/each}
  </ol>
</div>
