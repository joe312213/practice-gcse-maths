<!--
  Purpose: Collect drawing and typed working for one question, retaining strokes while tools are collapsed.

  Main contents:
  - Canvas rendering and single-pointer stroke lifecycle.
  - Paper toggle, typed working, clear control and development-only field styling.

  Used By: PracticeActivity.svelte, which supplies the draft and update callbacks.

  Uses: no local modules; onworking/onpaper update the parent session.

  Libs: Svelte onMount; SvelteKit development flag.
-->
<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  let { number, paper, draft, onpaper, onworking } = $props();
  let fieldStyle = $state('flush');
  let canvas;
  let strokes = [],
    active = null,
    activePointer = null,
    points = 0;
  /** Return the canvas 2D context; used by draw and clear. No parameters or local calls. */
  function context() {
    return canvas.getContext('2d');
  }
  /**
   * Paint a stroke of canvas-coordinate [x, y] points; called by mount, begin and move.
   * Uses context; one point paints a dot, multiple points paint connected segments.
   * @example draw([[20, 30]])
   * @example draw([[20, 30], [40, 50]])
   */
  function draw(stroke) {
    const ctx = context();
    ctx.strokeStyle = '#20352f';
    ctx.fillStyle = '#20352f';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    if (stroke.length === 1) {
      ctx.beginPath();
      ctx.arc(...stroke[0], 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(...stroke[0]);
    for (const point of stroke.slice(1)) ctx.lineTo(...point);
    ctx.stroke();
  }
  onMount(() => {
    strokes = structuredClone(draft.strokes);
    points = draft.points;
    strokes.forEach(draw);
  });
  /** Convert a pointer event's viewport coordinates to canvas coordinates; used by begin/move. */
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return [
      ((event.clientX - bounds.left) * canvas.width) / bounds.width,
      ((event.clientY - bounds.top) * canvas.height) / bounds.height,
    ];
  }
  /**
   * Start a primary-button stroke from a pointerdown event; calls point and draw.
   * Captures this pointer and ignores additional presses while a stroke is active.
   * @example A left-button press starts a dot; a second pointer leaves it unchanged.
   */
  function begin(event) {
    if (event.button !== 0 || active) return;
    canvas.setPointerCapture(event.pointerId);
    activePointer = event.pointerId;
    active = [point(event)];
    points++;
    draw(active);
  }
  /** Handle pointerenter; call end when the returning pointer has no primary button pressed. */
  function enter(event) {
    // Re-entry must lift the pen even if an outside release was never delivered.
    if (!(event.buttons & 1)) end(event);
  }
  /** Extend the active pointer's stroke on pointermove; calls point and draw. */
  function move(event) {
    if (!active || event.pointerId !== activePointer) return;
    const next = point(event);
    draw([active.at(-1), next]);
    active.push(next);
    points++;
  }
  /**
   * Commit the stroke through onworking and release capture; ignore unrelated pointer events.
   * Called by release/cancel/capture-loss handlers, enter, window blur and clear.
   * @param {PointerEvent} [event] Omit to end the stroke regardless of pointer identity.
   * @example end() // Window blur ends any active stroke.
   */
  function end(event) {
    if (!active || (event && event.pointerId !== activePointer)) return;
    const pointer = activePointer;
    strokes.push(active);
    active = null;
    activePointer = null;
    if (canvas.hasPointerCapture(pointer)) canvas.releasePointerCapture(pointer);
    onworking({ strokes, points });
  }
  /** Clear-button handler: finish via end, erase via context, then send an empty draft to onworking. */
  function clear() {
    end();
    context().clearRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    points = 0;
    onworking({ strokes, points });
  }
</script>

<svelte:window onblur={() => end()} />

<section class="card working" class:working-inset={fieldStyle === 'inset'}>
  <h2>Working · question {number}</h2>
  {#if dev}
    <label class="working-style-control"
      >Field style (dev)
      <select class="choice-field compact" bind:value={fieldStyle}>
        <option value="flush">Full width · square</option>
        <option value="inset">Small inset · rounded</option>
      </select>
    </label>
  {/if}
  <label class="paper-option"
    ><input
      type="checkbox"
      class="paper-toggle"
      id="paper"
      checked={paper}
      aria-controls="working-tools"
      aria-expanded={!paper}
      onchange={(event) => onpaper(event.currentTarget.checked)}
    /> I’m working on paper</label
  >
  <!-- Keep the same canvas mounted during collapse, so strokes are never lost. -->
  <div id="working-tools" hidden={paper}>
    <canvas
      bind:this={canvas}
      id="working"
      width="700"
      height="460"
      aria-label="Drawing space; typed working is available below"
      onpointerdown={begin}
      onpointermove={move}
      onpointerenter={enter}
      onpointerup={end}
      onpointercancel={end}
      onlostpointercapture={end}
    ></canvas>
    <button
      class="action-button compact icon"
      type="button"
      id="clear-working"
      title="Clear drawing"
      aria-label="Clear drawing"
      onclick={clear}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 14 14 3 21 10 10 21H7L3 17Z M8 9 15 16 M10 21H21" />
      </svg>
    </button>
    <label for="typed-working">Or type your working</label>
    <textarea
      id="typed-working"
      class="working-field"
      rows="3"
      placeholder="Write your steps here…"
      value={draft.working}
      oninput={(event) => onworking({ working: event.currentTarget.value })}></textarea>
    <small>Working clears on question change.</small>
  </div>
</section>
