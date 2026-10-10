<!--
  Purpose: Show the current activity's recommended level, recent success and reassessment state.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/domain/engine.mjs.

  Libs: none.
-->
<script>
  import { LEVELS, success, scoringWindow } from '#lib/domain/engine.mjs';
  let { mode, page, track } = $props();
  const adaptive = $derived(['plain', 'errors'].includes(mode));
  const score = $derived(success(track.histories[track.level], scoringWindow(mode, page.size)));
</script>

{#if adaptive}
  <section class="progress-card" aria-label="Practice progress">
    <h2>Your progress</h2>
    <p>Level: {LEVELS[track.level]}</p>
    <p class="progress-value">{score.toFixed(1)}%</p>
    <progress
      class="progress-meter"
      max="100"
      value={score}
      aria-label="Recent success at this level"
    ></progress>
    <p class="progress-note">recent success</p>
    {#if track.reassess}<p>Reassessment: {track.reassess} eligible answers remaining.</p>{/if}
    {#if page.trial}<p>
        Trying {LEVELS[page.trial.to]}. Your previous level stays recorded.
      </p>{/if}
    <p id="progress-notice" role="status">{page.notice}</p>
  </section>
{/if}
