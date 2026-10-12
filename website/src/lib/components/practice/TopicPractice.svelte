<!--
  Purpose: Initialize the practice session and connect navigation, profile selection and activity components.

  Main contents:
  - switchStage

  Used By: SvelteKit route loading.

  Uses: storage, working-cache and practice-time adapters; session.mjs; LearningSteps.svelte; topic-routes.mjs and practice-pages.json; SiteHeader, SiteFooter, ProfileDialog, Progress, PracticeSets, PracticeActivity and MethodDemo.

  Libs: bits-ui (dialog/popover interaction), svelte (component lifecycle and state), $app/paths (base-aware URLs).
-->
<script>
  import { Select } from 'bits-ui';
  import { bindPracticeTimer } from '#lib/adapters/practice-time.mjs';
  import { bindProgressAutosave } from '#lib/adapters/progress-autosave.mjs';
  import { importProgress } from '#lib/domain/progress-transfer.mjs';
  import {
    learnerFileLink,
    readProgressFile,
    withProgressFileLock,
  } from '#lib/adapters/progress-file.mjs';
  import { createWorkingCache } from '#lib/adapters/working-cache.mjs';
  import { foundationTopics, topicPath } from '#lib/content/topic-routes.mjs';
  import { goto, replaceState } from '$app/navigation';
  import { page } from '$app/state';
  let { topicId } = $props();
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { onMount, tick } from 'svelte';
  import { asset, resolve } from '$app/paths';
  import { openProgress, loadBank } from '#lib/adapters/storage.mjs';
  import { createSession } from '#lib/application/session.mjs';
  import LearningSteps from './LearningSteps.svelte';
  import catalogue from '#lib/content/practice-pages.json';
  import PracticeSets from '#lib/components/practice/PracticeSets.svelte';

  import OneDriveReminder from '#lib/components/progress/OneDriveReminder.svelte';
  import ProfileDialog from '#lib/components/ui/ProfileDialog.svelte';
  import Progress from '#lib/components/practice/Progress.svelte';
  import PracticeActivity from '#lib/components/practice/PracticeActivity.svelte';
  import DemoPlayer from '#lib/components/teaching/MethodDemo.svelte';
  let view = $state.raw(null),
    session = $state.raw(null),
    error = $state(''),
    warning = $state(''),
    profileOpen = $state(false);
  let progressAdapter = $state.raw(null);
  let fileStatus = $state.raw({});
  let newerFile = $state.raw(null),
    fileReviewBusy = $state(false),
    useFile = $state.raw(null);
  const currentLearner = $derived(
    progressAdapter?.data.profiles.find((item) => item.key === view?.profile?.key),
  );
  let profileTrigger = $state();
  /** Switch to bank id through the session, then navigate to its public URL. Calls topicPath, resolve and goto. */
  async function selectTopic(id) {
    session.switchTopic(id);
    await goto(resolve(topicPath(id)));
  }
  /** Select/create learner name and open the URL topic/set. Called by ProfileDialog; create confirms a new name. */
  function chooseName(name, create) {
    const setCode = new URLSearchParams(location.search).get('set');
    const result = session.chooseName(name, create);
    if (result.profile) {
      session.switchTopic(topicId);
      if (setCode) openSet(setCode);
    }
    return result;
  }
  /** Resume the matching saved code or start a set; show validation failures without replacing the page. */
  function openSet(code) {
    try {
      if (view.savedSet?.code === code) session.resumePracticeSet();
      else session.startPracticeSet(code);
    } catch (cause) {
      warning = cause.message;
    }
  }
  // A set has its own shareable code; an unqualified topic URL always opens that topic.
  function syncSetUrl(value) {
    if (!value.profile) return;
    const url = new URL(location.href);
    if (value.practiceSet) url.searchParams.set('set', value.practiceSet.code);
    else url.searchParams.delete('set');
    if (url.href !== location.href) replaceState(url, page.state);
  }
  let menuTrigger = $state(null);
  let menuOpen = $state(false),
    creatorOpen = $state(false);
  /**
   * Switch the session activity, then focus the new stage heading.
   * Parameter mode: activity ID, such as assessment, scaffolded, errors or plain.
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
      ready = false,
      unsubscribe = () => {},
      stopTiming = () => {},
      stopSync = () => {};
    /**
     * Initialize learner storage, load the bank and subscribe the route to session updates.
     * Calls: openProgress, loadBank, asset, createSession.
     * @example await start(); // Load banks and bind the session after browser mount.
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
        progressAdapter = progress;
        const initialUpdated = new Map(
          progress.data.profiles.map((profile) => [
            profile.id,
            profile.progressUpdatedAt ??
              Math.max(
                0,
                ...Object.values(profile.topics).flatMap((topic) =>
                  (topic.history ?? []).map((record) => record.at),
                ),
              ),
          ]),
        );
        const banks = await Promise.all(
          foundationTopics.map(({ file }) => loadBank(asset(`data/${file}.json`))),
        );
        const bank = banks.find((b) => b.topic === topicId);
        if (disposed) return;
        let temporaryStorage;
        try {
          temporaryStorage = sessionStorage;
        } catch {
          /* In-memory working remains usable. */
        }
        session = createSession({
          workingCache: createWorkingCache(temporaryStorage, (text) => (warning = text)),
          bank,
          banks,
          catalogue,
          data: progress.data,
          save: progress.save,
        });
        const setCode = new URLSearchParams(location.search).get('set');
        unsubscribe = session.subscribe((value) => {
          view = value;
          if (ready) syncSetUrl(value);
        });
        stopTiming = bindPracticeTimer(
          session,
          { data: progress.data, save: progress.save },
          document,
          window,
        );
        if (view.profile) {
          if (!setCode || view.practiceSet?.code !== setCode) {
            session.switchTopic(topicId);
            if (setCode) openSet(setCode);
          }
        }
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
        ready = true;
        syncSetUrl(view);
        stopSync = bindProgressAutosave(
          session,
          {
            data: progress.data,
            save: progress.save,
            initialUpdated,
            newer: (id, value) => {
              if (!disposed) newerFile = { id, ...value };
            },
            status: (id, value) => {
              if (!disposed) fileStatus = { ...fileStatus, [id]: value };
            },
          },
          document,
          window,
        );
        useFile = async () => {
          const chosen = newerFile;
          fileReviewBusy = true;
          try {
            await withProgressFileLock({ id: chosen.id }, async () => {
              const file = await readProgressFile(chosen.link.handle);
              if (file.fingerprint !== chosen.link.fingerprint)
                throw Error('The file changed again. Review the latest version on Progress.');
              const next = structuredClone(progress.data);
              importProgress(next, chosen.imported, true);
              await learnerFileLink(chosen.imported, chosen.link);
              if (!progress.save(next))
                throw Error(
                  'This browser could not store the file progress. Keep this tab open and try again.',
                );
              // Cleanup must retain the newly imported store, not write the old snapshot back.
              Object.assign(progress.data, next);
            });
            location.reload();
          } catch (cause) {
            warning = cause.message;
          } finally {
            fileReviewBusy = false;
          }
        };
      } catch (cause) {
        error = `${cause.message} Refresh to try again.`;
      }
    }
    start();
    return () => {
      disposed = true;
      stopTiming();
      stopSync();
      unsubscribe();
    };
  });
</script>

<svelte:head><title>Maths practice · {view?.bank.title ?? 'Foundation maths'}</title></svelte:head>
<SiteHeader
  bind:menuOpen
  bind:menuTrigger
  onMenuCloseAutoFocus={(event) => {
    if (creatorOpen) event.preventDefault();
  }}
>
  {#snippet before()}<span id="welcome" class="welcome"
      >{view?.profile ? `Welcome back, ${view.profile.name}!` : ''}</span
    ><button
      bind:this={profileTrigger}
      id="profile-button"
      class="action-button quiet"
      disabled={!session}
      onclick={() => (profileOpen = true)}>{view?.profile ? 'Not you?' : 'Choose name'}</button
    >{/snippet}

  {#if view?.profile}
    <a class="action-button quiet" href={resolve('/progress.html')}>Progress</a>
  {/if}
  {#snippet menuItems()}
    {#if view?.profile}
      <button
        class="action-button"
        onclick={() => {
          menuOpen = false;
          creatorOpen = true;
        }}>Create Practice set</button
      >
    {/if}
  {/snippet}
</SiteHeader>
<div id="storage-warning" role="alert">{warning}</div>
{#if view?.backup?.due}<p class="export-reminder" role="status">
    It has been 10 days or longer without a JSON backup. <a
      href={`${resolve('/progress.html')}#data-transfer`}
      >Save your progress in your OneDrive folder.</a
    >
  </p>{/if}
<main id="main" tabindex="-1">
  {#if error}<p role="alert">{error}</p>
  {:else if !view}<p>Loading maths practice…</p>
  {:else if !view.profile}
    <section class="card page-panel full">
      <p class="eyebrow"><a class="subject-link" href={resolve('/')}>Foundation maths</a></p>
      <h1 class:draft-title={view.bank.draft}>
        {view.bank.title}{#if view.bank.draft}<span class="draft-stamp">Draft</span>{/if}
      </h1>
      <p>Practise maths at your pace, with clear examples and feedback on each answer.</p>
      <button id="begin" class="action-button primary" onclick={() => (profileOpen = true)}
        >Choose your name to begin</button
      >
    </section>
  {:else}
    {#if currentLearner}<OneDriveReminder
        profile={currentLearner}
        onsaved={() => progressAdapter.save(progressAdapter.data)}
      />{/if}
    {#if newerFile?.id === view.profile.id && !newerFile.dismissed}
      <aside class="card page-panel" aria-label="Newer file progress">
        <p>Your OneDrive file has newer progress. Use it on this computer?</p>
        <p>
          This replaces browser progress, including unfinished pages. Drawings aren’t included in
          the file.
        </p>
        <div class="actions">
          <button class="action-button primary" disabled={fileReviewBusy} onclick={useFile}
            >Use file progress</button
          >
          <button
            class="action-button"
            disabled={fileReviewBusy}
            onclick={() => {
              newerFile = { ...newerFile, dismissed: true };
              fileStatus = {
                ...fileStatus,
                [view.profile.id]: {
                  state: 'error',
                  message:
                    'Browser progress kept. File saving is paused until you review the file on Progress.',
                },
              };
            }}>Keep browser progress</button
          >
        </div>
      </aside>
    {:else if fileStatus[view.profile.id]}
      <p class="onedrive-save-result" role="status">
        {newerFile?.id === view.profile.id && newerFile.dismissed
          ? 'Browser progress kept. File saving is paused until you review the file on Progress.'
          : fileStatus[view.profile.id].message}
        {#if ['error', 'review'].includes(fileStatus[view.profile.id].state)}
          <a href={`${resolve('/progress.html')}#data-transfer`}
            >Review file access or save a backup</a
          >
        {/if}
      </p>
    {/if}
    <PracticeSets {catalogue} {view} {session} bind:creatorOpen returnFocus={menuTrigger}>
      {#snippet topicSelector()}
        <Select.Root type="single" value={view.bank.topic} onValueChange={selectTopic}>
          <Select.Trigger class="choice-field topic-selector" aria-label="Topic"
            >Topic</Select.Trigger
          >
          <Select.Portal>
            <Select.Content
              class="popover-panel topic-options"
              align="end"
              sideOffset={4}
              collisionPadding={16}
            >
              <Select.Viewport>
                {#each catalogue.topics as topic}
                  <Select.Item class="topic-option" value={topic.bank} label={topic.title}>
                    {#snippet children({ selected })}
                      <span class="topic-option-tick" aria-hidden="true">{selected ? '✓' : ''}</span
                      >
                      {topic.title}
                    {/snippet}
                  </Select.Item>
                {/each}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      {/snippet}
      {#snippet title()}
        <p class="eyebrow"><a class="subject-link" href={resolve('/')}>Foundation maths</a></p>
        <h1 class:draft-title={view.bank.draft}>
          {view.bank.title}{#if view.bank.draft}<span class="draft-stamp">Draft</span>{/if}
        </h1>
      {/snippet}
      {#snippet description()}
        <p>
          Work through this topic in order: assess, learn, practise with support, spot errors, then
          practise independently.
        </p>
      {/snippet}
    </PracticeSets>
    <div class="learning-header">
      {#if !view.practiceSet}<LearningSteps mode={view.mode} onselect={switchStage} />{/if}
      {#if view.page && view.mode !== 'demo'}<Progress
          mode={view.mode}
          page={view.page}
          track={view.track}
        />{/if}
    </div>
    {#if view.mode === 'demo'}<section class="card stage-panel">
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
      </section>
    {:else}<PracticeActivity {view} {session} />{/if}
  {/if}
</main>
<SiteFooter
  question={view?.bank.questions.find((q) => q.id === view?.page?.items[view.selected]?.id)}
  topic={view?.bank.title ?? ''}
/>
<div id="toast" role="status" aria-live="polite">{view?.message ?? ''}</div>
{#if session}<ProfileDialog
    bind:open={profileOpen}
    {chooseName}
    returnFocus={profileTrigger}
  />{/if}
