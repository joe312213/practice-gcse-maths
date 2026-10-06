<!--
  Purpose: Show the current activity's recommended level, recent success and reassessment state.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/PracticeActivity.svelte

  Uses: website/src/lib/domain/engine.mjs.

  Libs: none.
-->
<script>
  import { LEVELS, success } from '#lib/domain/engine.mjs';
  let { mode, page, track } = $props();
  const adaptive = $derived(['plain', 'errors'].includes(mode));
  const score = $derived(success(track.histories[track.level], page.size));
</script>

{#if mode !== 'assessment'}
  <section class="card progress-card">
    <h2>{adaptive ? 'Your progress' : 'Learning practice'}</h2>
    {#if adaptive}
      <div class="meta">Recommended · {LEVELS[track.level]}</div>
      <p class="progress-value">{score.toFixed(1)}%</p>
      <progress
        class="progress-meter"
        max="100"
        value={score}
        aria-label="Recent success at this level"
      ></progress>
      <p class="progress-note">recent success at this level</p>
      {#if track.reassess}<p>Reassessment: {track.reassess} eligible answers remaining.</p>{/if}
      {#if page.trial}<p>
          Trying {LEVELS[page.trial.to]}. Your previous level stays recorded.
        </p>{/if}
    {:else}<p>
        These answers help you practise and do not change your independent challenge level.
      </p>{/if}
    <p id="progress-notice" role="status">{page.notice}</p>
  </section>
{/if}
