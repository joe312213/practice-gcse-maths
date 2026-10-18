<!--
  Purpose: Configurable combined practice uses the same resolver and persisted attempts as
  Practice sets.

  Main contents:
  - start.

  Used By: website/src/lib/components/practice/TopicPractice.svelte.

  Uses: website/src/lib/components/ui/LevelSelector.svelte, website/src/lib/domain/practice-code.mjs,
  website/src/lib/domain/combined-practice.mjs.

  Libs: svelte (component state, lifecycle and transitions), $app/navigation (SvelteKit
  navigation/route state), $app/state (SvelteKit navigation/route state).
-->
<script>
  import { untrack } from 'svelte';
  import { replaceState } from '$app/navigation';
  import { page } from '$app/state';
  import LevelSelector from '../ui/LevelSelector.svelte';
  import { encodePracticeSet } from '#lib/domain/practice-code.mjs';
  import { COMBINED_CODE } from '#lib/domain/combined-practice.mjs';
  let { catalogue, session, initialTopics = [] } = $props();
  const topics = $derived(catalogue.topics.filter((t) => !t.aggregate));
  let selected = $state(
    untrack(() =>
      initialTopics.length
        ? initialTopics
        : catalogue.topics.filter((t) => !t.aggregate).map((t) => t.bank),
    ),
  );
  let level = $state(0),
    mode = $state(3),
    error = $state('');
  async function start() {
    error = '';
    try {
      const code = encodePracticeSet({
        level,
        timing: 0,
        pages: [{ topic: COMBINED_CODE, type: mode, slot: 0 }],
      });
      await session.startPracticeSet(code, null, { topics: selected });
      const url = new URL(location.href);
      url.searchParams.set('topics', selected.join(','));
      replaceState(url, page.state);
    } catch (cause) {
      error = cause.message;
    }
  }
</script>

<section class="card stage-panel" aria-labelledby="combined-title">
  <h2 id="combined-title">Choose your combined practice</h2>
  <p>Choose at least two topics. Each problem can need one to four operations.</p>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      start();
    }}
  >
    <fieldset>
      <legend>Topics to include</legend>
      <div class="combined-topics">
        {#each topics as topic}<label
            ><input type="checkbox" value={topic.bank} bind:group={selected} /> {topic.title}</label
          >{/each}
      </div>
    </fieldset>
    <div class="level-row">
      <LevelSelector {level} onchange={(value) => (level = value)} />
      <label
        >Practice <select class="choice-field" bind:value={mode}
          ><option value={3}>Combined problems</option><option value={2}>Mixed revision</option
          ></select
        ></label
      >
      <button class="action-button primary" disabled={selected.length < 2}
        >Start combined practice</button
      >
    </div>
    {#if error}<p role="alert">{error}</p>{/if}
  </form>
</section>

<style>
  .combined-topics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 0.5rem;
  }
</style>
