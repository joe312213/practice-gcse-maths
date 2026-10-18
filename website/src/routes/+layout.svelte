<!--
  Purpose: Load shared styles and provide browser-initialized theme state to every route.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: SvelteKit route loading/prerendering.

  Uses: website/src/lib/adapters/progress-ownership.mjs, website/src/lib/theme/preferences.mjs,
  website/src/lib/styles/app.css.

  Libs: svelte (component state, lifecycle and transitions), $app/navigation (SvelteKit
  navigation/route state), svelte/store (reactive store subscriptions).
-->
<script>
  import { onMount, setContext, tick } from 'svelte';
  import { onNavigate } from '$app/navigation';
  import { ownProgress, pauseProgress } from '#lib/adapters/progress-ownership.mjs';
  import { writable } from 'svelte/store';
  import { createThemeController } from '#lib/theme/preferences.mjs';
  import '#lib/styles/app.css';
  let { children } = $props();
  const theme = writable(null);
  let themeWarning = $state('');
  setContext('theme', theme);
  let ownership = $state('starting');
  let navigating = $state(false);
  let owner;
  onNavigate(async ({ from, to }) => {
    if (ownership !== 'active' || from?.url.pathname === to?.url.pathname) return;
    navigating = true;
    await pauseProgress();
    return () => {
      navigating = false;
    };
  });
  onMount(() => {
    // Capture also covers dialog portals outside the route wrapper during handover.
    const block = (event) => {
      if (ownership === 'yielding' || navigating) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    const events = ['click', 'submit', 'keydown', 'pointerdown', 'input'];
    events.forEach((name) => document.addEventListener(name, block, true));
    if (navigator.locks && typeof BroadcastChannel !== 'undefined') {
      owner = ownProgress({
        locks: navigator.locks,
        channel: new BroadcastChannel('maths-progress-ownership'),
        change: (state) => {
          ownership = state;
        },
        pause: async () => {
          await tick();
          await pauseProgress();
        },
      });
    } else ownership = 'unavailable';
    const restore = (event) => {
      if (event.persisted) location.reload();
    };
    window.addEventListener('pageshow', restore);
    return () => {
      events.forEach((name) => document.removeEventListener(name, block, true));
      window.removeEventListener('pageshow', restore);
      owner?.close();
    };
  });
  // Optional styling cannot prevent routes, profiles or the bank from starting.
  onMount(() => {
    try {
      theme.set(
        createThemeController(
          localStorage,
          document.documentElement,
          (text) => (themeWarning = text),
        ),
      );
    } catch {
      themeWarning =
        'Theme controls could not load. You can still use the practice pages; refresh to try again.';
    }
  });
</script>

<svelte:head><title>Maths practice</title></svelte:head>

{#if ownership === 'active'}
  <div inert={navigating}>{@render children()}</div>
{:else}
  <main class="page-shell">
    <section class="card page-panel" aria-labelledby="tab-title">
      <h1 id="tab-title">
        {ownership === 'standby' ? 'Practice is open in another tab' : 'Preparing your practice'}
      </h1>
      <p role="status">
        {ownership === 'standby'
          ? 'Use one tab at a time to keep your progress safe.'
          : ownership === 'waiting' || ownership === 'yielding'
            ? 'Finishing saves in the active tab. Complete or cancel any open file chooser there.'
            : ownership === 'unavailable'
              ? 'This browser cannot coordinate progress tabs. Open this site in a current browser over HTTPS or localhost.'
              : ownership === 'failed'
                ? 'Tab handover could not finish. Keep this tab open and refresh to recover your browser progress.'
                : 'Loading your saved progress…'}
      </p>
      {#if ownership === 'standby'}
        <button class="action-button primary" onclick={() => owner.request()}
          >Continue in this tab</button
        >
      {/if}
    </section>
  </main>
{/if}
{#if themeWarning}<p class="theme-warning" role="status">{themeWarning}</p>{/if}
