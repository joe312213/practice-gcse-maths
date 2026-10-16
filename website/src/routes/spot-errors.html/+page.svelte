<!-- Separate review route; the prototype does not replace live questions or record progress. -->
<script>
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import LatticeErrorInvestigation from '#lib/components/teaching/LatticeErrorInvestigation.svelte';
  let { data } = $props();
  let index = $state(0);
</script>

<svelte:head><title>Spot the error prototype · Maths practice</title></svelte:head>
<SiteHeader back />
<main id="main" tabindex="-1">
  <h1>Spot the error: lattice prototype</h1>
  <p>Try the location-selection approach. This review page does not save progress.</p>
  <label for="prototype-example">Example</label>
  <select class="choice-field" id="prototype-example" bind:value={index}>
    {#each data.cases as question, i}<option value={i}>Example {i + 1}: {question.q}</option>{/each}
  </select>
  <section class="card page-panel">
    {#key index}<LatticeErrorInvestigation
        question={data.cases[index]}
        options={data.options}
      />{/key}
  </section>
</main>
<SiteFooter>Choose places, explain mistakes, then check your corrected answer.</SiteFooter>
