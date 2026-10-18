<!--
  Purpose: Initialize the practice session and connect navigation, profile selection and
  activity components.

  Main contents:
  - switchStage

  Used By: website/src/routes/[subject]/[topic]/+page.svelte.

  Uses: website/src/lib/domain/topic-pages.mjs, website/src/lib/adapters/header-layout.mjs,
  website/src/lib/adapters/practice-time.mjs, website/src/lib/adapters/progress-autosave.mjs,
  website/src/lib/domain/progress-transfer.mjs, website/src/lib/adapters/progress-file.mjs,
  website/src/lib/adapters/working-cache.mjs, website/src/lib/content/topic-routes.mjs,
  website/src/lib/components/ui/SiteHeader.svelte,
  website/src/lib/components/ui/SiteFooter.svelte,
  website/src/lib/adapters/progress-ownership.mjs, website/src/lib/adapters/storage.mjs,
  website/src/lib/application/session.mjs,
  website/src/lib/components/practice/LearningSteps.svelte,
  website/src/lib/content/practice-pages.json,
  website/src/lib/components/practice/PracticeSets.svelte,
  website/src/lib/components/practice/CombinedPractice.svelte,
  website/src/lib/components/progress/OneDriveReminder.svelte,
  website/src/lib/components/ui/ProfileDialog.svelte,
  website/src/lib/components/practice/Progress.svelte,
  website/src/lib/components/practice/PracticeActivity.svelte,
  website/src/lib/components/teaching/MethodDemo.svelte.

  Libs: bits-ui (accessible dialogs, popovers and choices), $app/navigation (SvelteKit
  navigation/route state), $app/state (SvelteKit navigation/route state), svelte (component
  state, lifecycle and transitions), $app/paths (SvelteKit navigation/route state).
-->
<script>
  import { findQuestion } from '#lib/domain/topic-pages.mjs';
  import { Select } from 'bits-ui';
  import { fitLearningHeader } from '#lib/adapters/header-layout.mjs';
  let stageWidth = $state(0);
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
  let { topicId, bankVersions } = $props();
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { onMount, tick } from 'svelte';
  import { onProgressPause, progressTask } from '#lib/adapters/progress-ownership.mjs';
  import { asset, resolve } from '$app/paths';
  import { openProgress, loadBank } from '#lib/adapters/storage.mjs';
  import { createSession } from '#lib/application/session.mjs';
  import LearningSteps from './LearningSteps.svelte';
  import catalogue from '#lib/content/practice-pages.json';
  // Sorting this copy keeps teaching priority and encoded catalogue addresses unchanged.
  const selectorTopics = [...catalogue.topics].sort((a, b) =>
    a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }),
  );
  import PracticeSets from '#lib/components/practice/PracticeSets.svelte';
  import CombinedPractice from './CombinedPractice.svelte';
  const combined = $derived(topicId === 'combined');
  let initialTopics = $state([]);

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
    await goto(resolve(topicPath(id)));
  }
  /** Select/create learner name and open the URL topic/set. Called by ProfileDialog; create confirms a new name. */
  async function chooseName(name, create) {
    const setCode = new URLSearchParams(location.search).get('set');
    const result = session.chooseName(name, create);
    if (result.profile) {
      session.switchTopic(combined ? 'M01' : topicId);
      if (setCode) await openSet(setCode);
    }
    return result;
  }
  /** Resume the matching saved code or start a set; show validation failures without replacing the page. */
  const matchesTopics = (saved) =>
    !initialTopics.length ||
    (saved?.topics?.length === initialTopics.length &&
      initialTopics.every((topic) => saved.topics.includes(topic)));
  async function openSet(code) {
    try {
      if (view.savedSet?.code === code && matchesTopics(view.savedSet))
        await session.resumePracticeSet();
      else
        await session.startPracticeSet(code, null, {
          topics: initialTopics.length ? initialTopics : undefined,
        });
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
        const params = new URLSearchParams(location.search);
        const needsAll = combined || params.has('set') || params.has('recommendation');
        const fetchTopic = ({ file }) =>
          loadBank(`${asset(`data/${file}.json`)}?v=${bankVersions[file]}`);
        const banks = await Promise.all(
          foundationTopics.filter((topic) => needsAll || topic.bank === topicId).map(fetchTopic),
        );
        // Multi-topic sets load extra banks only when requested; ordinary topic visits stay small.
        let loadingBanks;
        const ensureBanks = () =>
          (loadingBanks ??= Promise.all(
            foundationTopics
              .filter((topic) => !banks.some((bank) => bank.topic === topic.bank))
              .map(fetchTopic),
          )
            .then((extra) => banks.push(...extra))
            .catch((cause) => {
              loadingBanks = null;
              throw cause;
            }));
        const bank = combined ? banks[0] : banks.find((b) => b.topic === topicId);
        initialTopics = (new URLSearchParams(location.search).get('topics') ?? '')
          .split(',')
          .filter((id) => banks.some((b) => b.topic === id));
        if (disposed) return;
        let temporaryStorage;
        try {
          temporaryStorage = sessionStorage;
        } catch {
          /* In-memory working remains usable. */
        }
        // A plain topic URL leaves a saved set parked until Resume is selected.
        if (!needsAll) {
          const learner = progress.data.profiles.find((item) => item.key === progress.data.last);
          if (learner?.practiceSet) learner.practiceSet.active = false;
        }
        const api = createSession({
          workingCache: createWorkingCache(temporaryStorage, (text) => (warning = text)),
          bank,
          banks,
          catalogue,
          data: progress.data,
          save: progress.save,
        });
        session = {
          ...api,
          async startPracticeSet(...args) {
            await ensureBanks();
            if (!disposed) return api.startPracticeSet(...args);
          },
          async resumePracticeSet(...args) {
            await ensureBanks();
            if (!disposed) return api.resumePracticeSet(...args);
          },
        };
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
          if (!setCode || view.practiceSet?.code !== setCode || !matchesTopics(view.practiceSet)) {
            session.switchTopic(combined ? 'M01' : topicId);
            if (setCode) await openSet(setCode);
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
            await session.startPracticeSet(recommended.code, recommendationId);
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
        useFile = progressTask(async () => {
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
            if (!disposed) location.reload();
          } catch (cause) {
            warning = cause.message;
          } finally {
            fileReviewBusy = false;
          }
        });
      } catch (cause) {
        error = `${cause.message} Refresh to try again.`;
      }
    }
    const stop = () => {
      if (disposed) return;
      disposed = true;
      stopTiming();
      stopSync();
      unsubscribe();
    };
    const unregister = onProgressPause(stop);
    start();
    return () => {
      stop();
      unregister();
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
      >{view?.profile?.anonymous
        ? 'Practice for this visit'
        : view?.profile
          ? `Welcome back, ${view.profile.name}!`
          : ''}</span
    ><button
      bind:this={profileTrigger}
      id="profile-button"
      class="action-button quiet"
      disabled={!session}
      onclick={() => (profileOpen = true)}
      >{view?.profile && !view.profile.anonymous ? 'Not you?' : 'Choose name'}</button
    >{/snippet}

  <a class="action-button quiet" href={resolve('/progress.html')}>Progress</a>
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
        {combined && !view.practiceSet
          ? 'Combined problems'
          : view.bank.title}{#if view.bank.draft}<span class="draft-stamp">Draft</span>{/if}
      </h1>
      <p>Practise maths at your pace, with clear examples and feedback on each answer.</p>
      <button id="begin" class="action-button primary" onclick={() => (profileOpen = true)}
        >Choose your name to begin</button
      >
      <p>Enter a name to keep your progress beyond this visit. It is optional.</p>
      <button class="action-button" id="begin-anonymous" onclick={() => session.beginAnonymous()}
        >Continue without a name</button
      >
    </section>
  {:else}
    {#if currentLearner && !currentLearner.anonymous}<OneDriveReminder
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
                {#each selectorTopics as topic}
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
          {combined && !view.practiceSet
            ? 'Combined problems'
            : view.bank.title}{#if view.bank.draft}<span class="draft-stamp">Draft</span>{/if}
        </h1>
      {/snippet}
      {#snippet description()}
        <p>
          Work through this topic in order: assess, learn, practise with support, spot errors, then
          {view.bank.problemSolvingTopic
            ? 'solve problems independently.'
            : 'practise independently and solve problems.'}
        </p>
      {/snippet}
    </PracticeSets>
    {#if combined && !view.practiceSet}<CombinedPractice {catalogue} {session} {initialTopics} />
    {:else}
      <div
        class="learning-header"
        use:fitLearningHeader={{ stageWidth: view.practiceSet ? 0 : stageWidth, mode: view.mode }}
      >
        {#if !view.practiceSet}<LearningSteps
            bank={view.bank}
            mode={view.mode}
            onselect={switchStage}
            onmeasure={(width) => {
              stageWidth = width;
            }}
          />{/if}
        {#if view.page && view.mode !== 'demo' && !view.bank.combined}<Progress
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
  {/if}
</main>
<SiteFooter
  question={view && findQuestion(view.bank, view.page?.items[view.selected]?.id)}
  topic={view?.bank.title ?? ''}
/>
<div id="toast" role="status" aria-live="polite">{view?.message ?? ''}</div>
{#if session}<ProfileDialog
    bind:open={profileOpen}
    {chooseName}
    onanonymous={() => session.beginAnonymous()}
    returnFocus={profileTrigger}
  />{/if}
