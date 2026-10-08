<!--
  Purpose: Initialize the practice session and connect navigation, profile selection and activity components.

  Main contents:
  - switchStage

  Used By: SvelteKit route loading.

  Uses: website/src/lib/adapters/storage.mjs, website/src/lib/application/session.mjs, website/src/lib/domain/stages.mjs, website/src/lib/content/practice-pages.json, website/src/lib/components/practice/PracticeSets.svelte, website/src/lib/components/practice/NextStage.svelte, website/src/lib/components/ui/ThemeControls.svelte, website/src/lib/components/ui/ProfileDialog.svelte, website/src/lib/components/practice/PracticeActivity.svelte, website/src/lib/components/teaching/DemoPlayer.svelte.

  Libs: bits-ui (dialog/popover interaction), svelte (component lifecycle and state), $app/paths (base-aware URLs).
-->
<script>
  import { Popover } from 'bits-ui';
  import { onMount, tick } from 'svelte';
  import { asset, resolve } from '$app/paths';
  import { openProgress, loadBank } from '#lib/adapters/storage.mjs';
  import { createSession } from '#lib/application/session.mjs';
  import { MODES } from '#lib/domain/stages.mjs';
  import catalogue from '#lib/content/practice-pages.json';
  import PracticeSets from '#lib/components/practice/PracticeSets.svelte';
  import NextStage from '#lib/components/practice/NextStage.svelte';
  import ThemeControls from '#lib/components/ui/ThemeControls.svelte';
  import ProfileDialog from '#lib/components/ui/ProfileDialog.svelte';
  import PracticeActivity from '#lib/components/practice/PracticeActivity.svelte';
  import DemoPlayer from '#lib/components/teaching/MethodDemo.svelte';
  let view = $state.raw(null),
    session = $state.raw(null),
    error = $state(''),
    warning = $state(''),
    profileOpen = $state(false);
  let profileTrigger = $state();
  let menuTrigger = $state(null);
  let menuOpen = $state(false),
    creatorOpen = $state(false);
  /**
   * Switch the session activity, then focus the new stage heading.
   * Parameter mode: learning activity or theme mode, as used here.
   * Calls: tick.
   */
  async function switchStage(mode) {
    session.switchMode(mode);
    await tick();
    document.getElementById('stage-title')?.focus();
  }
  onMount(() => {
    /**
     * Provide a no-op subscription cleanup until session initialization completes.
     */
    let disposed = false,
      unsubscribe = () => {};
    /**
     * Initialize learner storage, load the bank and subscribe the route to session updates.
     * Calls: openProgress, loadBank, asset, createSession.
     * @example start();
     */
    async function start() {
      try {
        let storage;
        try {
          storage = localStorage;
        } catch {
          /* The adapter will provide unsaved practice. */
        }
        const progress = openProgress(storage, (text) => (warning = text));
        const banks = await Promise.all(
          ['equations', 'multiplication', 'division'].map((name) =>
            loadBank(asset(`data/${name}.json`)),
          ),
        );
        const learnerTopic = progress.data.profiles.find(
          (p) => p.key === progress.data.last,
        )?.lastTopic;
        const bank = banks.find((b) => b.topic === learnerTopic) ?? banks[0];
        if (disposed) return;
        session = createSession({
          bank,
          banks,
          catalogue,
          data: progress.data,
          save: progress.save,
        });
        unsubscribe = session.subscribe((value) => (view = value));
        const recommendationId = new URLSearchParams(window.location.search).get('recommendation');
        if (recommendationId) {
          const learner = progress.data.profiles.find((item) => item.key === progress.data.last);
          const recommended = learner?.revision?.recommendations.find(
            (item) => item.id === recommendationId,
          );
          try {
            if (!recommended)
              throw Error(
                'Choose the learner who owns this recommendation from the Progress page.',
              );
            session.startPracticeSet(recommended.code, recommendationId);
          } catch (cause) {
            warning = cause.message;
          }
        }
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

<svelte:head><title>Maths practice · {view?.bank.title ?? 'Foundation maths'}</title></svelte:head>
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
    <a class="action-button quiet" href={resolve('/puzzles.html')}>Puzzles</a>
    {#if view?.profile}
      <a class="action-button quiet" href={resolve('/progress.html')}>Progress</a>
      <Popover.Root bind:open={menuOpen}>
        <Popover.Trigger class="action-button quiet" bind:ref={menuTrigger}>Menu</Popover.Trigger>
        <Popover.Portal
          ><Popover.Content
            class="theme-menu"
            align="end"
            sideOffset={8}
            collisionPadding={16}
            aria-label="Practice options"
            onCloseAutoFocus={(event) => {
              if (creatorOpen) event.preventDefault();
            }}
          >
            <button
              class="action-button"
              onclick={() => {
                menuOpen = false;
                creatorOpen = true;
              }}>Create Practice set</button
            >
          </Popover.Content></Popover.Portal
        >
      </Popover.Root>
    {/if}
  </div>
</header>
<div id="storage-warning" role="alert">{warning}</div>
{#if view?.backup?.due}<p class="export-reminder" role="status">
    It has been 10 days or longer without a JSON backup. <a
      href={`${resolve('/progress.html')}#data-transfer`}
      >Export your progress to your cloud storage.</a
    >
  </p>{/if}
<main id="main" tabindex="-1">
  {#if error}<p role="alert">{error}</p>
  {:else if !view}<p>Loading maths practice…</p>
  {:else if !view.profile}
    <section class="card full">
      <div class="eyebrow">Foundation maths</div>
      <h1>A little practice.<br />A stronger method.</h1>
      <p>
        Practise multiplication, division and equations at your pace, with clear examples and
        feedback on each answer.
      </p>
      <button id="begin" class="action-button primary" onclick={() => (profileOpen = true)}
        >Choose your name to begin</button
      >
    </section>
  {:else}
    <PracticeSets {catalogue} {view} {session} bind:creatorOpen returnFocus={menuTrigger}>
      {#snippet topicSelector()}
        <label class="topic-selector"
          >Topic
          <select
            class="choice-field"
            aria-label="Topic"
            value={view.bank.topic}
            onchange={(event) => session.switchTopic(event.currentTarget.value)}
          >
            {#each catalogue.topics as topic}<option value={topic.bank}>{topic.title}</option
              >{/each}
          </select>
        </label>
      {/snippet}
      {#snippet title()}
        <div class="eyebrow">Foundation maths</div>
        <h1>{view.bank.title}</h1>
        <p>
          Work through this topic in order: assess, learn, practise with support, spot errors, then
          practise independently.
        </p>
      {/snippet}
    </PracticeSets>
    {#if !view.practiceSet}<nav aria-label="Topic learning steps">
        {#each MODES as [id, label]}<button
            class="action-button"
            type="button"
            data-mode={id}
            aria-current={view.mode === id ? 'step' : undefined}
            onclick={() => switchStage(id)}>{label}</button
          >{/each}
      </nav>{/if}
    {#if view.mode === 'demo'}<section class="card full">
        <h2 id="stage-title" tabindex="-1">
          {view.bank.method ? view.bank.title : 'Keep the equation balanced'}
        </h2>
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
  Maths practice · Progress stays in this browser · Show your method, then check your answer. <a
    href={resolve('/about.html')}>About</a
  >
</footer>
<div id="toast" role="status" aria-live="polite">{view?.message ?? ''}</div>
{#if session}<ProfileDialog
    bind:open={profileOpen}
    chooseName={session.chooseName}
    returnFocus={profileTrigger}
  />{/if}
