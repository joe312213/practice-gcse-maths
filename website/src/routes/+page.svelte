<script>
  import ArithmeticWorking from '#lib/components/teaching/ArithmeticWorking.svelte';
  import EquationWorking from '#lib/components/teaching/EquationWorking.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { foundationTopics, topicPath } from '#lib/content/topic-routes.mjs';
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  let { data } = $props();
  // Keep already-shared query links usable while new links use directory routes.
  onMount(() => {
    const query = new URLSearchParams(location.search);
    const topic = foundationTopics.find((topic) => topic.bank === query.get('topic'));
    if (topic || query.has('recommendation')) {
      query.delete('topic');
      const suffix = query.toString();
      goto(`${resolve(topicPath(topic?.bank ?? 'M10'))}${suffix ? `?${suffix}` : ''}`, {
        replaceState: true,
      });
    }
  });
</script>

<svelte:head><title>Choose a topic · Maths practice</title></svelte:head>
<SiteHeader section="topics">
  <a class="action-button quiet" href={resolve('/puzzles.html')}>Puzzles</a>
  <a class="action-button quiet" href={resolve('/progress.html')}>Progress</a>
</SiteHeader>
<main id="main" tabindex="-1">
  <h1>Choose a topic</h1>
  <p>A little practice. A stronger method.</p>
  <section aria-labelledby="foundation-title">
    <h2 id="foundation-title">Foundation Maths <span class="muted">· FM</span></h2>
    <div class="topic-cards">
      {#each data.topics as topic}<a class="card topic-card" href={resolve(topic.path)}>
          <h3>{topic.title}</h3>
          <p class="topic-example">{topic.example.q}</p>
          <div class="topic-solution">
            {#if topic.example.method}<ArithmeticWorking question={topic.example} compact />
            {:else}<EquationWorking rows={topic.example.balance.slice(1)} />{/if}
          </div>
        </a>{/each}
    </div>
  </section>
</main>
<SiteFooter>Choose a topic, then work through assessment, examples and practice.</SiteFooter>
