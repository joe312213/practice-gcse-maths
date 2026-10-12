<!--
  Purpose: Render method-specific frames with shared playback controls and a stable reading position.

  Main contents:
  - play
  - go

  Used By: DemoPlayer.svelte and ArithmeticDemo.svelte

  Uses: application/player.mjs and application/demo-motion.mjs.

  Libs: svelte (component lifecycle and state).
-->
<script>
  import { onMount, tick } from 'svelte';
  import { createDemoMotion } from '#lib/application/demo-motion.mjs';
  import { createPlayer } from '#lib/application/player.mjs';

  // Each frame has a logical step plus caller-owned drawing data; no equation layout is assumed.
  let {
    frames,
    steps,
    introduction,
    heading,
    children,
    completion,
    speed = 1,
    onspeed = () => {},
  } = $props();
  let cursor = $state(0);
  let started = $state(false);
  let playing = $state(false);
  let player;
  let motion;
  let disposed = false;
  let stage;
  const speedId = $props.id();
  const frame = $derived(frames[cursor]);
  const step = $derived(frame.step);
  const finished = $derived(cursor === frames.length - 1);
  $effect(() => {
    // Read speed even before player mounts, so the effect subscribes to changes.
    const delay = 650 / speed;
    player?.setDelay(delay);
    motion?.setSpeed(speed);
  });
  /**
   * Toggle playback, positioning a fresh demonstration once and revealing clipped new working.
   * Calls: tick.
   */
  async function play() {
    if (playing) {
      player.pause();
      return;
    }
    const fresh = !started || finished;
    started = true;
    player.play();
    await tick();
    if (disposed) return;
    if (fresh) stage.scrollIntoView({ block: 'start', behavior: 'instant' });
    revealLatest();
  }
  /**
   * Translate the requested teaching step into its last reveal-frame index.
   * Parameter step: one-based teaching step.
   */
  function go(step) {
    started = true;
    step = Math.min(steps, step);
    player.go(frames.findLastIndex((frame) => frame.step === step) + 1);
  }
  /** Keep the new bottom edge visible, including inside a scrollable method-reference dialog.
   * Native nearest scrolling moves only the necessary ancestors; no focus or smooth-scroll queue.
   */
  function revealLatest() {
    const target =
      stage.querySelector('[data-demo-completion-end]') ??
      stage.querySelector('[data-demo-working-end]');
    if (!target) return;
    let bottom = window.visualViewport
      ? window.visualViewport.offsetTop + window.visualViewport.height
      : window.innerHeight;
    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (/(auto|scroll|hidden)/.test(getComputedStyle(parent).overflowY)) {
        const rect = parent.getBoundingClientRect();
        bottom = Math.min(bottom, rect.top + parent.clientTop + parent.clientHeight);
      }
    }
    if (target.getBoundingClientRect().bottom > bottom + 1)
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  }
  onMount(() => {
    motion = createDemoMotion(stage);
    player = createPlayer({
      length: frames.length,
      delay: 650 / speed,
      /** Player frame callback: update cursor/playing and animate advancing ink after rendering. */
      onFrame: async (next) => {
        const changed = next.step - 1 !== cursor;
        const advancing = playing && next.step > cursor + 1;
        const before = changed ? motion.snapshot() : null;
        cursor = next.step - 1;
        playing = next.playing;
        if (!changed) {
          if (playing) motion.resume();
          else motion.pause();
        } else {
          motion.cancel();
          await tick();
          if (disposed) return;
          if (advancing) motion.reveal(before, speed);
          revealLatest();
        }
      },
    });
    return () => {
      disposed = true;
      player.dispose();
      motion.cancel();
    };
  });
</script>

<section class="demo-stage" bind:this={stage} aria-label="Worked solution playback">
  {@render introduction?.(step)}
  {@render heading()}
  {#if started}<div class="demo-working">
      {@render children(frame)}
      <div data-demo-working-end aria-hidden="true"></div>
    </div>{/if}
  <div class="demo-controls">
    <button type="button" class="action-button primary" id="demo-play" onclick={play}
      >{playing ? 'Pause' : finished ? 'Replay' : 'Play'}</button
    >
    <div class="secondary-controls">
      <button
        class="action-button compact"
        type="button"
        id="demo-back"
        disabled={step <= 1}
        onclick={() => go(step - 1)}>Previous</button
      >
      <button
        class="action-button compact"
        type="button"
        id="demo-next"
        disabled={finished}
        onclick={() => go(step + 1)}>Next</button
      >
      <button
        class="action-button compact"
        type="button"
        id="demo-all"
        disabled={finished}
        onclick={() => go(steps)}>End</button
      >
    </div>
    <label class="demo-speed" for={speedId}
      >Speed
      <select
        class="choice-field compact"
        id={speedId}
        data-demo-speed
        value={speed}
        onchange={(event) => onspeed(Number(event.currentTarget.value))}
      >
        <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}
          >1.5×</option
        ><option value={2}>2×</option>
      </select>
    </label>
  </div>
  <!-- Visual progress stays readable without announcing every playback frame. -->
  <p class="demo-status">Step {step} of {steps}{playing ? ' · playing' : ''}</p>
  {#if finished}{@render completion?.()}
    <div data-demo-completion-end aria-hidden="true"></div>{/if}
</section>
