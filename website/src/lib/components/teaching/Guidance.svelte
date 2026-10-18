<!--
  Purpose: Present level-specific rules and teaching guidance from the bank.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte,
  website/src/lib/components/teaching/DemoPlayer.svelte.

  Uses: website/src/lib/components/teaching/MethodStep.svelte.

  Libs: none.
-->
<script>
  import MethodStep from './MethodStep.svelte';
  let { guidance, activeStep } = $props();
</script>

<div class="guidance">
  <p>{guidance.aim}</p>
  <ol class="steps">
    {#each guidance.steps as step, index}
      <li aria-current={activeStep === index + 1 ? 'step' : undefined}>
        {#key step}<MethodStep {step} />{/key}
      </li>
    {/each}
  </ol>
</div>
