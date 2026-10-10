<!--
  Purpose: Load the current learner's topic overview, revision recommendations and transfer controls.

  Main contents:
  - refresh
  - label

  Used By: SvelteKit route loading.

  Uses: website/src/lib/content/practice-pages.json, website/src/lib/adapters/storage.mjs, website/src/lib/domain/progress.mjs, website/src/lib/domain/revision.mjs, website/src/lib/components/progress/TopicProgress.svelte, website/src/lib/components/progress/ProgressTransfer.svelte, website/src/lib/components/ui/ThemeControls.svelte, website/src/lib/domain/practice-code.mjs.

  Libs: svelte (component lifecycle and state), $app/paths (base-aware URLs).
-->
<script>
  import PracticeHistory from '#lib/components/progress/PracticeHistory.svelte';
  import { topicPath } from '#lib/content/topic-routes.mjs';
  import SiteHeader from '#lib/components/ui/SiteHeader.svelte';
  import SiteFooter from '#lib/components/ui/SiteFooter.svelte';
  import { onMount } from 'svelte';
  import { resolve } from '$app/paths';
  import catalogue from '#lib/content/practice-pages.json';
  import { openProgress } from '#lib/adapters/storage.mjs';
  import {
    topicProgress,
    weeklyProgress,
    backupStatus,
    PROGRESS_POLICY,
  } from '#lib/domain/progress.mjs';
  import { maintainRecommendations, REVISION_POLICY } from '#lib/domain/revision.mjs';
  import TopicProgress from '#lib/components/progress/TopicProgress.svelte';
  import ProgressTransfer from '#lib/components/progress/ProgressTransfer.svelte';

  import { PAGE_TYPES } from '#lib/domain/practice-code.mjs';
  let store = $state.raw(null),
    profile = $state.raw(null),
    rows = $state.raw([]),
    weekly = $state.raw(null),
    recommendations = $state.raw([]),
    warning = $state('');
  let save = $state.raw(() => {});
  let openBreakdown = $state(null);
  /**
   * Refresh the current learner's summaries, recommendations and backup baseline, then persist.
   * Parameter requested: explicit request to generate recommendations beyond the automatic limit.
   * Calls: backupStatus, maintainRecommendations, topicProgress, weeklyProgress.
   * @example refresh(requested);
   */
  function refresh(requested = false) {
    profile = store.profiles.find((item) => item.key === store.last) ?? null;
    if (!profile) return;
    profile.backup ??= {
      since: backupStatus(profile).since,
      lastExportAt: null,
      lastExportType: null,
    };
    recommendations = structuredClone(
      maintainRecommendations(profile, catalogue, Date.now(), undefined, requested),
    );
    rows = topicProgress(profile, catalogue);
    weekly = weeklyProgress(profile);
    save(store);
  }
  onMount(() => {
    let storage;
    try {
      storage = localStorage;
    } catch {
      /* Read-only fallback still permits import/export in memory. */
    }
    const adapter = openProgress(storage, (text) => (warning = text));
    store = adapter.data;
    save = adapter.save;
    refresh();
  });
  /**
   * Format a recommendation reason with its catalogue topic and question-type labels.
   * Parameter reason: recommendation topic/type/reason record.
   */
  const label = (reason) =>
    `${catalogue.topics.find((item) => item.code === reason.topic)?.title ?? reason.topic} · ${PAGE_TYPES.find((item) => item.id === reason.type)?.label ?? reason.type}: ${reason.reason}`;
</script>

<svelte:head><title>Your progress · Maths practice</title></svelte:head>
<SiteHeader section="progress" back></SiteHeader>
<main id="main" tabindex="-1">
  <h1>Your progress</h1>
  {#if warning}<p role="alert">{warning}</p>{/if}
  {#if !store}<p>Loading progress…</p>
  {:else}
    {#if profile}
      <p>Progress for <strong>{profile.name}</strong> · saved on this browser.</p>
      <section aria-label="Progress by topic" class="topic-grid">
        {#each rows as row}<TopicProgress {row} bind:openBreakdown />{/each}
      </section>
      <p class="muted">
        Independent recent success uses the latest 10 eligible answers at each level, regardless of
        page length. Other question types retain their shorter scoring windows. All submitted
        outcomes are retained; the minimum evidence threshold is not a storage limit. Plain
        questions count twice in the topic average. Missing data means fewer than {PROGRESS_POLICY.minimum}
        scored answers in a question type at its recommended level. Stale means {PROGRESS_POLICY.staleDays}
        days without practice in that type and level.
      </p>
      <PracticeHistory {profile} topics={rows} />
      <section class="card" aria-labelledby="revision-title">
        <h2 id="revision-title">Recommended revision Practice sets</h2>
        <p>
          <strong>{weekly.current}</strong> recommended sets completed this week · Personal weekly
          record: <strong>{weekly.best}</strong>.
        </p>
        <p>Can you beat your record this week?</p>
        {#if weekly.current >= REVISION_POLICY.weeklyAutomaticLimit}
          <p class="weekly-celebration">
            Extra well done! You have completed {weekly.current} recommended sets this week. Automatic
            recommendations are paused until next week.
          </p>
          <button
            class="action-button"
            disabled={recommendations.filter((item) => item.completedAt === null).length >=
              REVISION_POLICY.pending}
            onclick={() => refresh(true)}>Generate more recommended sets</button
          >
          <p>
            Continue any remaining sets below, or choose to generate more when a space is available.
          </p>
        {/if}
        <p class="muted">
          Weeks run Monday–Sunday, UK time. Complete all four pages to count; answers need not all
          be correct.
        </p>
        {#each recommendations.filter((item) => item.completedAt === null) as item}
          <article class="revision-recommendation">
            <h3>Recommended practice set</h3>
            <ol>
              {#each item.reasons as reason}<li>{label(reason)}</li>{/each}
            </ol>
            {#if item.openedAt !== null}<p class="revision-followup">
                Did you find a problem with the practice set? What stopped you from completing it?
                Please let your teacher know.
              </p>{/if}
            <a
              class="action-button primary"
              href={`${resolve(topicPath('M10'))}?recommendation=${encodeURIComponent(item.id)}`}
              >{item.openedAt === null ? 'Open recommended set' : 'Continue recommended set'}</a
            >
          </article>
        {:else}<p>
            No revision priorities currently need a recommended set. Keep practising to check your
            skills.
          </p>{/each}
        <details>
          <summary>Completed recommendations and weekly record</summary>
          {#each Object.entries(weekly.weeks).sort( ([a], [b]) => b.localeCompare(a) ) as [week, count]}<p
            >
              Week beginning {week}: {count} completed
            </p>{:else}<p>No recommended sets completed yet.</p>{/each}
          {#each recommendations.filter((item) => item.completedAt !== null) as item}<p>
              Completed {new Date(item.completedAt).toLocaleDateString('en-GB')} ·
              <code>{item.code}</code>
            </p>{/each}
        </details>
      </section>
    {:else}<p>
        Choose your name on the <a href={resolve('/')}>practice page</a>, or import your progress
        below.
      </p>{/if}
    <ProgressTransfer {profile} {store} {save} onchange={() => refresh()} />
  {/if}
</main>
<SiteFooter>Progress stays on this browser. Export JSON to take it with you.</SiteFooter>
