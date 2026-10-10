<!--
  Purpose: Collect drawing and typed working for one question.

  Main contents:
  - Canvas rendering and single-pointer stroke lifecycle.
  - Typed working, method guides and a pointer/keyboard canvas resize handle.

  Used By: PracticeActivity.svelte, which supplies the draft and update callbacks.

  Uses: drawing-assist.mjs; onworking update the parent session.

  Libs: Svelte onMount.
-->
<script>
  import { onMount } from 'svelte';
  import { drawStroke, INK_COLOURS, inkColour } from '#lib/application/drawing.mjs';
  import { drawingTools, guideLines } from '#lib/application/drawing-assist.mjs';
  let { topic, draft, onworking, embedded = false } = $props();
  let canvasHeight = $state(230),
    resizeDrag = null;
  const tool = $derived(drawingTools[topic]);
  let assistOpen = $state(false),
    dimensions = $state({ columns: 2, rows: 2 });
  let guides = $state.raw([]);
  let pen = $state('pen'),
    colour = $state('black'),
    dark = $state(false);
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
    points = $state(0);
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
    drawStroke(context(), stroke, dark);
  }
  function drawGuide(line) {
    draw({ points: line, tool: 'pen', colour: 'black' });
  }
  onMount(() => {
    canvasHeight = draft.canvasHeight ?? 230;
    canvas.height = canvasHeight * 2;
    strokes = structuredClone(draft.strokes);
    points = draft.points;
    guides = structuredClone(draft.guides ?? []);
    guides.forEach(drawGuide);
    dark = document.documentElement.dataset.theme === 'dark';
    repaint();
    const observer = new MutationObserver(() => {
      dark = document.documentElement.dataset.theme === 'dark';
      repaint();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  });
  /** Redraw stored ink and guides after a bitmap resize; cropped ink remains recoverable. */
  function repaint() {
    context().clearRect(0, 0, canvas.width, canvas.height);
    guides.forEach(drawGuide);
    strokes.forEach(draw);
    if (active) draw(active);
  }
  /** Extend/crop the canvas at the original two bitmap pixels per CSS pixel, without stretching ink. */
  function resize(height) {
    end();
    canvasHeight = Math.max(120, Math.min(800, Math.round(height)));
    canvas.height = canvasHeight * 2;
    repaint();
    onworking({ canvasHeight });
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
    active = { points: [point(event)], tool: pen, colour };
    if (pen === 'pen') points++;
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
    draw({ ...active, points: [active.points.at(-1), next] });
    active.points.push(next);
    if (active.tool === 'pen') points++;
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

<section class="working" class:card={!embedded} class:embedded>
  <div id="working-tools">
    <div class="drawing-surface">
      {#if points === 0 && guides.length === 0}<span class="canvas-prompt" aria-hidden="true"
          >Working</span
        >{/if}
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
    </div>
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
        <path d="M5 5 19 19 M19 5 5 19" />
      </svg>
    </button>
    <button
      class="action-button compact icon"
      type="button"
      aria-label="Eraser"
      title="Eraser · five times the pen area"
      aria-pressed={pen === 'eraser'}
      onclick={() => {
        end();
        pen = pen === 'eraser' ? 'pen' : 'eraser';
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"><path d="M3 14 14 3 21 10 10 21H7L3 17Z M8 9 15 16 M10 21H21" /></svg
      >
    </button>
    <div class="ink-colours" role="group" aria-label="Pen colour">
      {#each INK_COLOURS as ink}<button
          class="action-button compact ink-choice"
          type="button"
          aria-label={`${ink.label} pen`}
          title={`${ink.label} pen`}
          aria-pressed={pen === 'pen' && colour === ink.id}
          onclick={() => {
            end();
            pen = 'pen';
            colour = ink.id;
          }}><span style:background={inkColour(ink.id, dark)}></span></button
        >{/each}
    </div>
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
    <textarea
      id="typed-working"
      class="working-field"
      rows="3"
      aria-label="Typed working"
      placeholder="Or type your working here..."
      value={draft.working}
      oninput={(event) => onworking({ working: event.currentTarget.value })}></textarea>
  </div>
</section>
