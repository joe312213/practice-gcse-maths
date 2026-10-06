<!--
  Purpose: Render method-specific frames with shared playback controls and step-following scroll.

  Main contents:
  - followStep
  - play
  - go

  Used By: website/src/lib/components/teaching/DemoPlayer.svelte

  Uses: website/src/lib/application/player.mjs.

  Libs: svelte (component lifecycle and state).
-->
<script>
  import { onMount, tick, untrack } from 'svelte';
  import { createPlayer } from '#lib/application/player.mjs';

  // Each frame has a logical step plus caller-owned drawing data. Renderers mark
  // the current drawing target with data-demo-current; no equation layout is assumed.
  let { frames, steps, heading, children, completion, speed = 1, onspeed = () => {} } = $props();
  let cursor = $state(untrack(() => frames.findLastIndex((frame) => frame.step === 1)));
  let playing = $state(false);
  let player;
  let stage;
  const speedId = $props.id();
  const frame = $derived(frames[cursor]);
  const step = $derived(frame.step);
  const finished = $derived(cursor === frames.length - 1);
  $effect(() => {
    // Read speed even before player mounts, so the effect subscribes to changes.
    const delay = 650 / speed;
    player?.setDelay(delay);
  });
  /**
   * Wait for the revealed frame and scroll its current step into view.
   * Calls: tick.
   */
  async function followStep() {
    await tick();
    stage
      ?.querySelector('[data-demo-current]')
      ?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }
  /**
   * Toggle playback and scroll its controls into view after Svelte updates.
   * Calls: tick.
   */
  async function play() {
    if (playing) {
      player.pause();
      return;
    }
    player.play();
    await tick();
    stage.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  /**
   * Translate the requested teaching step into its last reveal-frame index.
   * Parameter step: one-based teaching step.
   */
  function go(step) {
    step = Math.min(steps, step);
    player.go(frames.findLastIndex((frame) => frame.step === step) + 1);
  }
  onMount(() => {
    player = createPlayer({
      length: frames.length,
      delay: 650 / speed,
      /** Player frame callback: update cursor/playing from next and follow an advancing step after rendering. */
      onFrame: (next) => {
        const advancing = playing && next.step > cursor + 1;
        cursor = next.step - 1;
        playing = next.playing;
        if (advancing) followStep();
      },
    });
    return () => player.dispose();
  });
</script>

<section class="demo-stage" bind:this={stage} aria-label="Worked solution playback">
  {@render heading()}
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
  <div class="demo-working">{@render children(frame)}</div>
  {#if finished}{@render completion?.()}{/if}
</section>
