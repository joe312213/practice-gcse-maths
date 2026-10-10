<!--
  Purpose: Offer the shared puzzles catalogue as a separate maths activity.
  Main contents: Type/challenge selection, variation navigation and source attribution.
  Used By: SvelteKit route loading.
  Uses: PuzzlePlayer, ThemeControls and the pinned puzzle package.
  Libs: Svelte lifecycle and SvelteKit URLs.
-->
<script>
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { onMount, tick } from 'svelte';
  import { resolve } from '$app/paths';
  import { puzzleTypes, challengeBands } from '@subject-apps/puzzles/metadata';
  import { puzzleTypeArt } from '@subject-apps/puzzles/graphics';
  import PuzzlePlayer from '#lib/components/puzzles/PuzzlePlayer.svelte';

  import '@subject-apps/puzzles/styles';
  import '#lib/styles/puzzles.css';
  let catalogue = $state.raw([]),
    type = $state(null),
    challenge = $state(1),
    index = $state(0),
    variationIndex = $state(0),
    error = $state('');
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
  // Keep keyboard focus on the new view when the chooser is replaced.
  async function chooseType(id) {
    type = id;
    challenge = 1;
    reset();
    await tick();
    document.getElementById('puzzle-heading')?.focus();
  }
  async function showTypes() {
    const previous = type;
    type = null;
    await tick();
    document.querySelector(`[data-puzzle-type="${previous}"]`)?.focus();
  }
  function reset() {
    index = 0;
    variationIndex = 0;
  }
  function next() {
    if (variationIndex + 1 < question.variations.length) variationIndex++;
    else {
      variationIndex = 0;
      index = (index + 1) % choices.length;
    }
  }
</script>

<svelte:head><title>Maths practice · Puzzles</title></svelte:head>
<SiteHeader section="puzzles" back
  ><a class="action-button quiet" href={resolve('/progress.html')}>Progress</a></SiteHeader
>
<main id="main" tabindex="-1">
  <section class="card full">
    <h1 id="puzzle-heading" tabindex="-1">
      {puzzleTypes.find((family) => family.id === type)?.name ?? 'Puzzles'}
    </h1>
    <p>Try a different kind of thinking. Puzzle marks are separate from your topic progress.</p>
    {#if !type}
      <nav class="puzzle-types" aria-label="Puzzle types">
        {#each selectableTypes as family}
          <button
            class="action-button puzzle-type"
            type="button"
            data-puzzle-type={family.id}
            onclick={() => chooseType(family.id)}
          >
            <span class="puzzle-type-art" aria-hidden="true">
              {@html puzzleTypeArt[family.id][0]}
            </span>
            <strong>{family.name}</strong>
            <small>{puzzleTypeArt[family.id][1]}</small>
          </button>
        {/each}
      </nav>
    {:else}
      <button class="action-button" type="button" onclick={showTypes}>Choose another puzzle</button>
      <div class="level-row">
        <label
          >Challenge<select
            class="choice-field"
            aria-label="Challenge"
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
      {#key `${question.id}:${variation.id}`}<PuzzlePlayer
          {variation}
          source={question.source}
        />{/key}
      <button class="action-button" type="button" onclick={next}>Next puzzle</button>
      <small class="source-ref">{question.id} · {variation.id}</small>
    {:else}<p>No puzzles at this challenge for this type. Choose another challenge.</p>{/if}
  </section>
</main>

<SiteFooter />
