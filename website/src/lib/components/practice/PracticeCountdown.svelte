<!--
  Purpose: A learner-started page countdown with adjustment, pause and a soft expiry chime.
  Main contents: Transient timer controls and one expiry announcement.
  Used By: PracticeActivity, keyed by page attempt.
  Uses: countdown domain arithmetic and chime adapter.
  Libs: Svelte lifecycle; browser interval/visibility events only repaint the deadline.
-->
<script>
  import { onMount, untrack } from 'svelte';
  import { practiceMinutes, remainingTime, clockText } from '#lib/domain/countdown.mjs';
  import { createChime } from '#lib/adapters/chime.mjs';
  let { questions, complete = false } = $props();
  // The parent keys this component by attempt, so selecting a question keeps the clock.
  let minutes = $state(untrack(() => practiceMinutes(questions))),
    remaining = $state(0),
    deadline = $state(null),
    started = $state(false),
    expired = $state(false),
    chime;
  const display = $derived(started ? remaining : minutes * 60000);
  function refresh() {
    if (deadline === null) return;
    remaining = remainingTime(deadline, Date.now());
    if (!remaining) {
      deadline = null;
      expired = true;
      chime?.play();
    }
  }
  function start() {
    void chime?.unlock();
    if (!started) remaining = minutes * 60000;
    started = true;
    expired = false;
    deadline = Date.now() + remaining;
  }
  function pause() {
    refresh();
    deadline = null;
  }
  function reset() {
    deadline = null;
    started = false;
    expired = false;
    remaining = 0;
  }
  onMount(() => {
    chime = createChime();
    const interval = setInterval(refresh, 250);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
      chime.dispose();
    };
  });
  $effect(() => {
    if (complete && deadline !== null) pause();
  });
</script>

<section class="practice-countdown" class:started aria-label="Practice timer">
  <div class="timer-display">
    <strong>Timer</strong><output role="timer" aria-live="off" aria-label="Time remaining"
      >{clockText(display)}</output
    >
  </div>
  <div class="timer-controls">
    {#if !started}
      <button
        class="action-button compact timer-adjustment"
        disabled={complete}
        aria-label="Add one minute"
        onclick={() => minutes++}>+</button
      >
      <button
        class="action-button compact timer-adjustment"
        disabled={minutes <= 1 || complete}
        aria-label="Subtract one minute"
        onclick={() => minutes--}>−</button
      >
    {/if}
    {#if deadline !== null}
      <button class="action-button compact" aria-label="Pause timer" onclick={pause}>Pause</button>
    {:else}
      <button
        class="action-button compact"
        aria-label={started ? 'Resume timer' : 'Start timer'}
        disabled={expired || complete}
        onclick={start}>{started ? 'Resume' : 'Start'}</button
      >
    {/if}
    {#if started}<button class="action-button compact" aria-label="Reset timer" onclick={reset}
        >Reset</button
      >{/if}
  </div>
  <p role="status">{expired ? 'Time is up. You can keep working or reset the timer.' : ''}</p>
</section>

<style>
  .practice-countdown {
    margin-inline-start: auto;
    text-align: right;
    color: var(--muted);
    flex: 0 0 auto;
    max-width: 100%;
  }
  .timer-display,
  .timer-controls {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0;
  }
  .timer-display {
    gap: 0.65rem;
  }
  .timer-controls .action-button {
    color: inherit;
    background: transparent;
    border-color: transparent;
    padding-inline: 0.25rem;
    min-width: 1.8rem;
    font-weight: 650;
  }
  .timer-controls .timer-adjustment {
    min-width: 1.5rem;
  }
  .timer-controls .action-button:not(.timer-adjustment) {
    margin-inline-start: 0.35rem;
  }
  .started output {
    color: var(--ink);
  }
  output {
    font-variant-numeric: tabular-nums;
    font-weight: 650;
    min-width: 5ch;
  }
  p {
    max-width: 15rem;
  }
  p:empty {
    display: none;
  }
</style>
