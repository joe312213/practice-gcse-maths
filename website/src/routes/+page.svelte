<!--
  Purpose: Show prerequisite-ordered topic previews and forward old query links to topic routes.

  Main contents:
  - Topic cards; legacy-link forwarding.

  Used By: SvelteKit route loading/prerendering.

  Uses: website/src/lib/components/teaching/CalculationWorking.svelte,
  website/src/lib/components/teaching/MathText.svelte,
  website/src/lib/components/teaching/ArithmeticWorking.svelte,
  website/src/lib/components/teaching/EquationWorking.svelte,
  website/src/lib/content/topic-routes.mjs, website/src/lib/components/ui/SiteHeader.svelte,
  website/src/lib/components/ui/SiteFooter.svelte, website/src/lib/adapters/storage.mjs,
  website/src/lib/domain/progress.mjs, website/src/lib/domain/revision.mjs,
  website/src/lib/application/topic-masonry.mjs.

  Libs: svelte (component state, lifecycle and transitions), $app/navigation (SvelteKit
  navigation/route state), $app/paths (SvelteKit navigation/route state).
-->
<script>
  import CalculationWorking from '#lib/components/teaching/CalculationWorking.svelte';
  import MathText from '#lib/components/teaching/MathText.svelte';
  import ArithmeticWorking from '#lib/components/teaching/ArithmeticWorking.svelte';
  import EquationWorking from '#lib/components/teaching/EquationWorking.svelte';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { foundationTopics, topicPath } from '#lib/content/topic-routes.mjs';
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { openProgress } from '#lib/adapters/storage.mjs';
  import { topicProgress } from '#lib/domain/progress.mjs';
  import { discoverTopics } from '#lib/domain/revision.mjs';
  import { topicMasonry } from '#lib/application/topic-masonry.mjs';
  let { data } = $props();
  let search = $state(''),
    order = $state('priority'),
    rows = $state.raw([]);
  let adapter, learner;
  const visibleTopics = $derived(discoverTopics(data.topics, search, order, rows));
  function rememberSort() {
    if (!learner) return;
    learner.settings ??= {};
    learner.settings.topicSort = order;
    adapter.save(adapter.data);
  }
  // Keep already-shared query links usable while new links use directory routes.
  onMount(() => {
    let storage;
    try {
      storage = localStorage;
    } catch {
      /* Discovery works without saved progress. */
    }
    adapter = openProgress(storage);
    learner = adapter.data.profiles.find((profile) => profile.key === adapter.data.last);
    if (learner) {
      rows = topicProgress(learner, data.catalogue);
      order = learner.settings?.topicSort === 'a-z' ? 'a-z' : 'priority';
    }
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
  <div class="topic-discovery">
    <div class="topic-discovery-heading">
      <h1>Choose a topic</h1>
      <p>A little practice. A stronger method.</p>
    </div>
    <div class="topic-discovery-controls">
      <label class="sr-only" for="topic-search">Search topic titles</label>
      <input
        id="topic-search"
        class="text-field"
        type="search"
        placeholder="search"
        bind:value={search}
      />
      <fieldset class="topic-sort">
        <legend class="sr-only">Sort topics</legend>
        {#each ['priority', 'a-z'] as value}
          <label
            ><input
              type="radio"
              name="topic-sort"
              {value}
              bind:group={order}
              onchange={rememberSort}
            />{value}</label
          >
        {/each}
      </fieldset>
    </div>
  </div>
  <p class="sr-only" role="status">{visibleTopics.length} topics found</p>
  <section aria-labelledby="foundation-title">
    <h2 id="foundation-title">Foundation Maths <span class="muted">· FM</span></h2>
    <div class="topic-cards" use:topicMasonry>
      {#each visibleTopics as topic (topic.bank)}<div class="topic-card-slot">
          <a class="card topic-card" href={resolve(topic.path)}>
            {#if topic.draft}<span class="draft-stamp">Draft</span>{/if}
            <h3>{topic.title}</h3>
            <p class="topic-example"><MathText text={topic.example.q} /></p>
            <div class="topic-solution">
              {#if topic.example.method === 'calculation'}<CalculationWorking
                  question={topic.example}
                  compact
                />{:else if topic.example.method}<ArithmeticWorking
                  question={topic.example}
                  compact
                />
              {:else}<EquationWorking rows={topic.example.balance.slice(1)} />{/if}
            </div>
          </a>
        </div>{/each}
    </div>
    {#if !visibleTopics.length}<p>No topics match. Try a shorter search.</p>{/if}
  </section>
</main>
<SiteFooter>Choose a topic, then work through assessment, examples and practice.</SiteFooter>
