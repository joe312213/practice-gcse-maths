<script>
  let { guidance } = $props();
</script>

<div class="guidance">
  <p>{guidance.aim}</p>
  <ol class="steps">
    {#each guidance.steps as step}<li>{step}</li>{/each}
  </ol>
</div>
