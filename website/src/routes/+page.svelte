<script>
  import { onMount, tick } from 'svelte';
  import { asset, resolve } from '$app/paths';
  import { openProgress, loadBank } from '#lib/adapters/storage.mjs';
  import { createSession } from '#lib/application/session.mjs';
  import { MODES } from '#lib/domain/stages.mjs';
  import NextStage from '#lib/components/practice/NextStage.svelte';
  import ThemeControls from '#lib/components/ui/ThemeControls.svelte';
  import ProfileDialog from '#lib/components/ui/ProfileDialog.svelte';
  import PracticeActivity from '#lib/components/practice/PracticeActivity.svelte';
  import DemoPlayer from '#lib/components/teaching/DemoPlayer.svelte';
  let view = $state.raw(null),
    session = $state.raw(null),
    error = $state(''),
    warning = $state(''),
    profileOpen = $state(false);
  let profileTrigger = $state();
  async function switchStage(mode) {
    session.switchMode(mode);
    await tick();
    document.getElementById('stage-title')?.focus();
  }
  onMount(() => {
    let disposed = false,
      unsubscribe = () => {};
    async function start() {
      try {
        let storage;
        try {
          storage = localStorage;
        } catch {
          /* The adapter will provide unsaved practice. */
        }
        const progress = openProgress(storage, (text) => (warning = text));
        const bank = await loadBank(asset('data/equations.json'));
        if (disposed) return;
        session = createSession({ bank, data: progress.data, save: progress.save });
        unsubscribe = session.subscribe((value) => (view = value));
      } catch (cause) {
        error = `${cause.message} Refresh to try again.`;
      }
    }
    start();
    return () => {
      disposed = true;
      unsubscribe();
    };
  });
</script>

<svelte:head><title>Maths practice · Solving equations</title></svelte:head>
<a class="skip" href="#main">Skip to practice</a>
<header>
  <a class="brand" href={resolve('/')}>Maths<span> / practice</span></a>
  <div class="header-actions">
    <span id="welcome">{view?.profile ? `Welcome back, ${view.profile.name}!` : ''}</span><button
      bind:this={profileTrigger}
      id="profile-button"
      class="action-button quiet"
      disabled={!session}
      onclick={() => (profileOpen = true)}>{view?.profile ? 'Not you?' : 'Choose name'}</button
    ><ThemeControls />
  </div>
</header>
<div id="storage-warning" role="alert">{warning}</div>
<main id="main" tabindex="-1">
  {#if error}<p role="alert">{error}</p>
  {:else if !view}<p>Loading equations…</p>
  {:else if !view.profile}
    <section class="card full">
      <div class="eyebrow">Foundation maths</div>
      <h1>A little practice.<br />A stronger method.</h1>
      <p>Work through equations at your pace, with clear examples and feedback on each answer.</p>
      <button id="begin" class="action-button primary" onclick={() => (profileOpen = true)}
        >Choose your name to begin</button
      >
    </section>
  {:else}
    <section class="intro">
      <div>
        <div class="eyebrow">Foundation maths · Algebra</div>
        <h1>Solving equations</h1>
        <p>Make a start, keep both sides balanced, and build your confidence.</p>
      </div>
    </section>
    <nav aria-label="Topic learning steps">
      {#each MODES as [id, label]}<button
          class="action-button"
          type="button"
          data-mode={id}
          aria-current={view.mode === id ? 'step' : undefined}
          onclick={() => switchStage(id)}>{label}</button
        >{/each}
    </nav>
    {#if view.mode === 'demo'}<section class="card full">
        <h2 id="stage-title" tabindex="-1">Keep the equation balanced</h2>
        <DemoPlayer
          bank={view.bank}
          initialLevel={view.demoLevel}
          onlevel={session.setDemoLevel}
          speed={view.demoSpeed}
          onspeed={session.setDemoSpeed}
        />
        <NextStage mode="demo" onadvance={switchStage} />
      </section>
    {:else}<PracticeActivity {view} {session} onstage={switchStage} />{/if}
  {/if}
</main>
<footer>
  Equations preview · Progress stays in this browser · Show your method, then check your answer. <a
    href={resolve('/about.html')}>About</a
  >
</footer>
<div id="toast" role="status" aria-live="polite">{view?.message ?? ''}</div>
{#if session}<ProfileDialog
    bind:open={profileOpen}
    chooseName={session.chooseName}
    returnFocus={profileTrigger}
  />{/if}
