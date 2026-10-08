<!--
  Purpose: Collect drawing and typed working for one question, retaining strokes while tools are collapsed.

  Main contents:
  - Canvas rendering and single-pointer stroke lifecycle.
  - Paper toggle, typed working, method guides and a pointer/keyboard canvas resize handle.

  Used By: PracticeActivity.svelte, which supplies the draft and update callbacks.

  Uses: drawing-assist.mjs; onworking/onpaper update the parent session.

  Libs: Svelte onMount; SvelteKit development flag.
-->
<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  import { drawingTools, guideLines } from '#lib/application/drawing-assist.mjs';
  let { number, topic, paper, draft, onpaper, onworking } = $props();
  let fieldStyle = $state('flush');
  let canvasHeight = $state(230),
    resizeDrag = null;
  const tool = $derived(drawingTools[topic]);
  let assistOpen = $state(false),
    dimensions = $state({ columns: 2, rows: 2 });
  let guides = [];
  /** Replace only the blank guide, preserving the learner’s ink and working count. */
  function insertGuide() {
    end();
    guides = guideLines(topic, dimensions);
    repaint();
    onworking({ guides });
    assistOpen = false;
  }
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
    guides = structuredClone(draft.guides ?? []);
    guides.forEach(draw);
    strokes.forEach(draw);
  });
  /** Redraw stored ink and guides after a bitmap resize; cropped ink remains recoverable. */
  function repaint() {
    context().clearRect(0, 0, canvas.width, canvas.height);
    guides.forEach(draw);
    strokes.forEach(draw);
  }
  /** Extend/crop the canvas at the original two bitmap pixels per CSS pixel, without stretching ink. */
  function resize(height) {
    end();
    canvasHeight = Math.max(120, Math.min(800, Math.round(height)));
    canvas.height = canvasHeight * 2;
    repaint();
  }
  /** Capture a resize gesture separately from drawing, including touch and pen pointers. */
  function beginResize(event) {
    if (event.button !== 0 || resizeDrag) return;
    event.preventDefault();
    end();
    event.currentTarget.focus({ preventScroll: true });
    resizeDrag = {
      pointer: event.pointerId,
      y: event.clientY,
      height: canvasHeight,
      handle: event.currentTarget,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function moveResize(event) {
    if (resizeDrag?.pointer !== event.pointerId) return;
    resize(resizeDrag.height + event.clientY - resizeDrag.y);
  }
  /** End a resize on release, cancellation, capture loss or window blur. */
  function endResize(event) {
    if (!resizeDrag || (event && event.pointerId !== resizeDrag.pointer)) return;
    const { handle, pointer } = resizeDrag;
    resizeDrag = null;
    if (handle.hasPointerCapture(pointer)) handle.releasePointerCapture(pointer);
  }
  /** Offer the same resize operation without dragging; Home restores the default height. */
  function resizeKey(event) {
    if (!['ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    resize(event.key === 'Home' ? 230 : canvasHeight + (event.key === 'ArrowDown' ? 20 : -20));
  }
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
    guides = [];
    points = 0;
    onworking({ strokes, points, guides });
  }
</script>

<svelte:window
  onblur={() => {
    end();
    endResize();
  }}
/>

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
      style:height={`${canvasHeight}px`}
      aria-label="Drawing space; typed working is available below"
      onpointerdown={begin}
      onpointermove={move}
      onpointerenter={enter}
      onpointerup={end}
      onpointercancel={end}
      onlostpointercapture={end}
    ></canvas>
    <button
      class="canvas-resize"
      type="button"
      aria-label="Resize drawing area"
      aria-controls="working"
      aria-describedby="canvas-resize-help"
      title="Drag to resize; ↑/↓ adjust height; Home restores default"
      onpointerdown={beginResize}
      onpointermove={moveResize}
      onpointerup={endResize}
      onpointercancel={endResize}
      onlostpointercapture={endResize}
      onkeydown={resizeKey}
      ><svg viewBox="0 0 40 12" aria-hidden="true"
        ><path d="M8 4H32 M8 8H32" fill="none" stroke="currentColor" stroke-width="2" /></svg
      ></button
    >
    <span id="canvas-resize-help" class="sr-only"
      >Drag up or down, or use the up and down arrow keys. Home restores the default height. Current
      height: {canvasHeight} pixels.</span
    >
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
    {#if tool}
      <button
        type="button"
        class="action-button compact"
        aria-expanded={assistOpen}
        onclick={() => (assistOpen = !assistOpen)}>{tool.label}</button
      >
      {#if assistOpen}
        <form
          class="drawing-assist"
          onsubmit={(event) => {
            event.preventDefault();
            insertGuide();
          }}
        >
          {#each tool.fields as field}
            <label
              >{field.label}<input
                class="text-field"
                type="number"
                min="1"
                max={field.max}
                step="1"
                required
                bind:value={dimensions[field.key]}
              /></label
            >
          {/each}
          <button class="action-button compact" type="submit"
            >Draw {tool.label.toLowerCase()}</button
          >
          <small>Replaces the guide; keeps your drawing.</small>
        </form>
      {/if}
    {/if}
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
