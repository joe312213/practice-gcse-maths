<!--
  Purpose: App route for the portable human Go board. Native Back restores the puzzle route
  snapshot.

  Main contents:
  - Portable Go board route and back-navigation state.

  Used By: SvelteKit route loading/prerendering.

  Uses: website/src/lib/components/ui/SiteHeader.svelte,
  website/src/lib/components/ui/SiteFooter.svelte,
  website/src/lib/components/puzzles/HumanGo.svelte, website/src/lib/styles/puzzles.css.

  Libs: $app/paths (SvelteKit navigation/route state), @subject-apps/puzzles/metadata (shared
  puzzle package metadata), @subject-apps/puzzles/styles (shared puzzle package styles).
-->
<script>
  import { resolve } from '$app/paths';
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import HumanGo from '#lib/components/puzzles/HumanGo.svelte';
  import { puzzleTypes } from '@subject-apps/puzzles/metadata';
  import '@subject-apps/puzzles/styles';
  import '#lib/styles/puzzles.css';
  const rules = puzzleTypes.find((type) => type.id === 'go').links[0];
</script>

<svelte:head><title>Maths practice · Go demo board</title></svelte:head>
<SiteHeader section="puzzles"
  ><a class="action-button quiet" href={resolve('/puzzles.html')}>Puzzles</a><a
    class="action-button quiet"
    href={resolve('/progress.html')}>Progress</a
  ></SiteHeader
>
<main id="main" tabindex="-1">
  <section class="card page-panel full">
    <div class="puzzle-title-row">
      <h1>Go demo board</h1>
      <a href={rules.url} target="_blank" rel="noreferrer">{rules.label}</a>
    </div>
    <div class="human-go"><HumanGo /></div>
  </section>
</main>
<SiteFooter />
