<!-- Shared brand, skip link, theme controls and route-specific header actions. -->
<script>
  import { resolve } from '$app/paths';
  import ThemeControls from './ThemeControls.svelte';
  let { section = 'practice', back = false, before, children } = $props();
</script>

<a class="skip" href="#main">Skip to {section}</a>
<header>
  <a class="brand" href={resolve('/')}
    >Maths<span> / {section === 'puzzles' ? 'puzzles' : 'practice'}</span></a
  >
  <div class="header-actions">
    {#if back}<a class="action-button quiet" href={resolve('/')}>Back to topics</a>{/if}
    {@render before?.()}
    <ThemeControls />
    {@render children?.()}
  </div>
</header>
