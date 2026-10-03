<script>
  import { onMount } from 'svelte';
  import { dev } from '$app/env';
  let { number, paper, draft, onpaper, onworking } = $props();
  let fieldStyle = $state('flush');
  let canvas;
  let strokes = [],
    active = null,
    points = 0;
  function context() {
    return canvas.getContext('2d');
  }
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
  function point(event) {
    const bounds = canvas.getBoundingClientRect();
    return [
      ((event.clientX - bounds.left) * canvas.width) / bounds.width,
      ((event.clientY - bounds.top) * canvas.height) / bounds.height,
    ];
  }
  function begin(event) {
    if (event.button !== 0) return;
    canvas.setPointerCapture(event.pointerId);
    active = [point(event)];
    points++;
    draw(active);
  }
  function move(event) {
    if (!active) return;
    const next = point(event);
    draw([active.at(-1), next]);
    active.push(next);
    points++;
  }
  function end() {
    if (!active) return;
    strokes.push(active);
    active = null;
    onworking({ strokes, points });
  }
  function clear() {
    context().clearRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    points = 0;
    active = null;
    onworking({ strokes, points });
  }
</script>

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
      onpointerup={end}
      onpointercancel={end}
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
