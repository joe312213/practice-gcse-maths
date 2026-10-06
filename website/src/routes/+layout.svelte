<!--
  Purpose: Load shared styles and provide browser-initialized theme state to every route.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: SvelteKit route loading.

  Uses: website/src/lib/theme/preferences.mjs, website/src/lib/styles/app.css.

  Libs: svelte (component lifecycle and state), svelte/store.
-->
<script>
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { createThemeController } from '#lib/theme/preferences.mjs';
  import '#lib/styles/app.css';
  let { children } = $props();
  const theme = writable(null);
  let themeWarning = $state('');
  setContext('theme', theme);
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

{@render children()}
{#if themeWarning}<p class="theme-warning" role="status">{themeWarning}</p>{/if}
