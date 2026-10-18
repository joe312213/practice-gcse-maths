<!--
  Purpose: Share the brand, skip link, theme controls, a universal menu and route-specific
  header actions.

  Main contents:
  - SiteHeader with shared navigation and optional page-specific menu items.

  Used By: website/src/lib/components/practice/TopicPractice.svelte,
  website/src/routes/+page.svelte, website/src/routes/about.html/+page.svelte,
  website/src/routes/go.html/+page.svelte, website/src/routes/handwriting.html/+page.svelte,
  website/src/routes/help.html/+page.svelte, website/src/routes/progress.html/+page.svelte.

  Uses: website/src/lib/components/ui/ThemeControls.svelte,
  website/src/lib/adapters/header-layout.mjs.

  Libs: $app/paths (SvelteKit navigation/route state), bits-ui (accessible dialogs, popovers and
  choices), svelte (component state, lifecycle and transitions).
-->
<script>
  import { resolve } from '$app/paths';
  import { Popover } from 'bits-ui';
  import ThemeControls from './ThemeControls.svelte';
  import { onMount } from 'svelte';
  import { bindHeaderLayout } from '#lib/adapters/header-layout.mjs';
  let header;
  onMount(() => bindHeaderLayout(header));
  let {
    section = 'practice',
    back = false,
    before,
    children,
    menuItems,
    menuOpen = $bindable(false),
    menuTrigger = $bindable(null),
    onMenuCloseAutoFocus,
  } = $props();
  const links = [
    { href: '/', label: 'Topics' },
    { href: '/progress.html', label: 'Progress' },
    { href: '/puzzles.html', label: 'Puzzles' },
    { href: '/about.html', label: 'About' },
  ];
</script>

<a class="skip" href="#main">Skip to {section}</a>
<header bind:this={header}>
  <a class="brand" href={resolve('/')}>Maths{' '}<span>practice</span></a>
  <div class="header-actions">
    {#if back || before}
      <div class="header-actions-left">
        {#if back}<a class="action-button quiet" href={resolve('/')}>Back to topics</a>{/if}
        {@render before?.()}
      </div>
    {/if}
    {#if children}<div class="header-actions-right">{@render children()}</div>{/if}
  </div>
  <div class="header-tools">
    <ThemeControls />
    <Popover.Root bind:open={menuOpen}>
      <Popover.Trigger
        class="action-button quiet menu-toggle"
        bind:ref={menuTrigger}
        aria-label="Menu"
        title="Menu"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          class="popover-panel site-menu"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          role="dialog"
          aria-label="Site menu"
          onCloseAutoFocus={onMenuCloseAutoFocus}
        >
          <nav class="site-menu-links" aria-label="Site pages">
            {#each links as link}
              <a
                class="action-button quiet"
                href={resolve(link.href)}
                onclick={() => (menuOpen = false)}>{link.label}</a
              >
            {/each}
          </nav>
          {@render menuItems?.()}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  </div>
</header>
