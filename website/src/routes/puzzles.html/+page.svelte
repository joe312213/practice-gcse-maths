<!--
  Purpose: Offer the shared puzzles catalogue as a separate maths activity.

  Main contents:
  - Type/challenge selection, variation navigation and source attribution.

  Used By: SvelteKit route loading.

  Uses: PuzzlePlayer, SiteHeader, SiteFooter and puzzle theme styles.

  Libs: Svelte lifecycle, SvelteKit URLs and the pinned puzzle package catalogue, metadata, graphics and styles.
-->
<script>
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { onMount, tick } from 'svelte';
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { puzzleTypes, challengeBands } from '@subject-apps/puzzles/metadata';
  import { puzzleTypeArt } from '@subject-apps/puzzles/graphics';
  import PageNavigation from '#lib/components/ui/PageNavigation.svelte';
  import PuzzlePlayer from '#lib/components/puzzles/PuzzlePlayer.svelte';

  import '@subject-apps/puzzles/styles';
  import '#lib/styles/puzzles.css';
  let catalogue = $state.raw([]),
    challenge = $state(1),
    index = $state(0),
    variationIndex = $state(0),
    error = $state(''),
    player = $state.raw(),
    restoredState = $state.raw(null),
    restoreVersion = $state(0);
  // SvelteKit snapshots belong to this history entry, including the exact board working.
  export const snapshot = {
    capture: () => ({ challenge, index, variationIndex, state: player?.getState() }),
    restore: (value) => {
      challenge = value.challenge;
      index = value.index;
      variationIndex = value.variationIndex;
      restoredState = value.state;
      restoreVersion++;
    },
  };
  const type = $derived(
    selectableTypes.find(
      (family) => family.id === (browser ? page.url.searchParams.get('type') : null),
    )?.id ?? null,
  );
  const choices = $derived(catalogue.filter((q) => q.type === type && q.challenge === challenge));
  const question = $derived(choices[index]);
  const variation = $derived(question?.variations[variationIndex]);
  const goRanks = ['25k+', '18–24k', '12–17k', '11k and stronger'];
  const selectableTypes = puzzleTypes.filter((family) => family.id !== 'classic maths');
  onMount(() => {
    let disposed = false;
    import('@subject-apps/puzzles/catalogue')
      .then(({ default: data }) => {
        if (!disposed) catalogue = data;
      })
      .catch(() => {
        error = 'Puzzles could not load. Refresh to try again.';
      });
    return () => {
      disposed = true;
    };
  });
  // Real URLs preserve the chooser in browser history, including Back/Forward.
  afterNavigate(async ({ from, to, type: navigationType }) => {
    if (from?.url.pathname !== to?.url.pathname) return;
    // History restoration has already supplied this entry's snapshot.
    if (navigationType !== 'popstate') {
      challenge = 1;
      reset();
    }
    const previous = from.url.searchParams.get('type');
    await tick();
    if (type) document.getElementById('puzzle-heading')?.focus();
    else document.querySelector(`[data-puzzle-type="${previous}"]`)?.focus();
  });
  function reset() {
    index = 0;
    variationIndex = 0;
    restoredState = null;
  }
  function previous() {
    restoredState = null;
    if (variationIndex > 0) variationIndex--;
    else if (index > 0) {
      index--;
      variationIndex = choices[index].variations.length - 1;
    }
  }
  function next() {
    restoredState = null;
    if (variationIndex + 1 < question.variations.length) variationIndex++;
    else {
      variationIndex = 0;
      index++;
    }
  }
</script>

<svelte:head><title>Maths practice · Puzzles</title></svelte:head>
<SiteHeader section="puzzles"
  ><a class="action-button quiet" href={resolve('/puzzles.html')}>Puzzles</a><a
    class="action-button quiet"
    href={resolve('/progress.html')}>Progress</a
  ></SiteHeader
>
<main id="main" tabindex="-1">
  <section class="card page-panel full">
    <div class="puzzle-title-row">
      <h1 id="puzzle-heading" tabindex="-1">
        {puzzleTypes.find((family) => family.id === type)?.name ?? 'Puzzles'}
      </h1>
      {#if type === 'go'}<a href={resolve('/go.html')}>Demo board</a>{/if}
    </div>
    <p>Try a different kind of thinking. Puzzle marks are separate from your topic progress.</p>
    {#if !type}
      <nav class="puzzle-types" aria-label="Puzzle types">
        {#each selectableTypes as family}
          <a
            class="action-button puzzle-type"
            data-puzzle-type={family.id}
            href={`${resolve('/puzzles.html')}?type=${encodeURIComponent(family.id)}`}
          >
            <span class="puzzle-type-art" aria-hidden="true">
              {@html puzzleTypeArt[family.id][0]}
            </span>
            <strong>{family.name}</strong>
            <small>{puzzleTypeArt[family.id][1]}</small>
          </a>
        {/each}
      </nav>
    {:else}
      <div class="level-row">
        <label
          >Level{' '}<select
            class="choice-field"
            aria-label="Level"
            bind:value={challenge}
            onchange={reset}
            >{#each challengeBands as band}<option value={band.level}
                >{band.defaultLabel}{type === 'go' ? ` · ${goRanks[band.level - 1]}` : ''}</option
              >{/each}</select
          ></label
        >
      </div>
    {/if}
    {#if error}<p role="alert">{error}</p>
    {:else if !type}<p>Choose a puzzle above to get started.</p>
    {:else if !catalogue.length}<p>Loading puzzles…</p>
    {:else if question && variation}
      <h2>{question.title}</h2>
      <p>{variation.prompt}</p>
      {#if question.rank}<p>Source rank: {question.rank.value} {question.rank.unit}</p>{/if}
      {#if question.source?.url && type !== 'go'}<p>
          <a href={question.source.url} target="_blank" rel="noreferrer"
            >{question.source.title ?? question.source.name ?? 'Puzzle source'}</a
          >{question.source.note ? ` · ${question.source.note}` : ''}
        </p>{/if}
      {#key `${question.id}:${variation.id}:${restoreVersion}`}<PuzzlePlayer
          bind:this={player}
          initialState={restoredState}
          {variation}
          source={question.source}
        />{/key}
      <PageNavigation
        label="Puzzle navigation"
        previousLabel="Previous puzzle"
        nextLabel="Next puzzle"
        onprevious={previous}
        onnext={next}
        previousDisabled={index === 0 && variationIndex === 0}
        nextDisabled={index === choices.length - 1 &&
          variationIndex === question.variations.length - 1}
        >{question.id} · {variation.id}</PageNavigation
      >
    {:else}<p>No puzzles at this level. Choose another level.</p>{/if}
  </section>
</main>

<SiteFooter />
