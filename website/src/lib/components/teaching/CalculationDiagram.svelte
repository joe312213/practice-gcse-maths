<!--
  Purpose: Numerical diagrams use the same operands as the authored written calculation.

  Main contents:
  - Number-line moves, fraction bars and percentage-bar diagrams from question operands.

  Used By: website/src/lib/components/teaching/DemoPlayer.svelte.

  Uses: no local module imports.

  Libs: none.
-->
<script>
  let { question, frame = null } = $props();
  const diagram = $derived(question.diagram);
  const id = $props.id();
  const points = $derived(diagram?.points ?? []);
  const low = $derived(Math.min(0, ...points) - 1);
  const high = $derived(Math.max(0, ...points) + 1);
  const x = (value) => 20 + (280 * (value - low)) / (high - low);
  const ratio = (text) => {
    const [n, d = 1] = text.split('/').map(Number);
    return n / d;
  };
</script>

{#if diagram?.kind === 'number-line'}
  <svg viewBox="0 0 320 90" role="img" aria-label="Number line showing each signed move">
    <defs
      ><marker {id} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"
        ><path d="M0 0 L6 3 L0 6" fill="none" stroke="currentColor" /></marker
      ></defs
    >
    <path d="M20 60 H300" />
    {#each Array.from({ length: high - low + 1 }, (_, i) => low + i) as value}
      <path d={`M${x(value)} 57 v6`} />
      {#if value === 0 || points.includes(value)}<text x={x(value)} y="80">{value}</text>{/if}
    {/each}
    {#each points.slice(1) as end, i}
      {#if !frame || frame.step > (i + 1) * 2 || (frame.step === (i + 1) * 2 && frame.phase === 'write')}
        <path
          class:active={frame?.step === (i + 1) * 2}
          d={`M${x(points[i])} 53 Q${(x(points[i]) + x(end)) / 2} ${5 + i * 16} ${x(end)} 53`}
          marker-end={`url(#${id})`}
        />
      {/if}
    {/each}
  </svg>
{:else if diagram?.kind === 'fraction-bars'}
  {@const wholeCount = Math.ceil(Math.max(ratio(diagram.a), ratio(diagram.b), 1))}
  {@const common = !frame || frame.step > 2 || (frame.step === 2 && frame.phase === 'write')}
  <svg
    viewBox="0 0 320 110"
    role="img"
    aria-label={common
      ? `Equal-sized wholes divided into ${diagram.denominator} parts each; fractions ${diagram.a} and ${diagram.b}`
      : `Equal-sized wholes showing ${diagram.a} and ${diagram.b}`}
  >
    {#each [diagram.a, diagram.b] as value, row}
      {@const denominator = common ? diagram.denominator : Number(value.split('/')[1] ?? 1)}
      {@const divisions = denominator * wholeCount}
      <text x="160" y={18 + row * 54}>{value}</text>
      {#each Array.from({ length: divisions }) as _, i}
        <rect
          x={20 + (i * 280) / divisions}
          y={24 + row * 54}
          width={280 / divisions}
          height="22"
          class:shaded={i < ratio(value) * denominator}
          class:active={frame?.step === 2}
        />
      {/each}
      {#each Array.from({ length: wholeCount }) as _, whole}
        <rect
          x={20 + (whole * 280) / wholeCount}
          y={24 + row * 54}
          width={280 / wholeCount}
          height="22"
          class="whole-boundary"
        />
      {/each}
    {/each}
  </svg>
{:else if diagram?.kind === 'percentage-bar'}
  {@const showRate =
    question.model.task !== 'change' ||
    !frame ||
    (frame.step === question.steps.length && frame.phase === 'write')}
  {@const rate = Number(diagram.rate)}
  {@const scale = 280 / Math.max(100, rate)}
  <svg
    viewBox="0 0 320 90"
    role="img"
    aria-label={showRate
      ? `The whole is 100 percent; the highlighted amount is ${rate} percent of it`
      : 'The original amount represents 100 percent'}
  >
    <text x="160" y="18">Original amount = 100%</text>
    <rect x="20" y="26" width={100 * scale} height="22" />
    {#if showRate}<rect x="20" y="52" width={rate * scale} height="12" class="shaded" />
      <text x="160" y="82">{rate}% of the original</text>{/if}
  </svg>
{:else if diagram?.kind === 'ratio-bars'}
  {@const scale = 240 / Math.max(...diagram.parts)}
  <svg
    viewBox="0 0 320 150"
    role="img"
    aria-label={`Equal ratio parts: ${diagram.labels.join(' to ')}; ${diagram.known}`}
  >
    {#each diagram.parts as count, row}
      <text x="160" y={16 + row * 51}>{diagram.labels[row]}: {count} parts</text>
      {#each Array.from({ length: count }) as _, part}
        <rect
          x={40 + part * scale}
          y={24 + row * 51}
          width={scale}
          height="22"
          class:shaded={row === 1}
        />
      {/each}
    {/each}
    <text x="160" y="129">Known {diagram.known}</text>
    <text x="160" y="145">Every box is one equal part</text>
  </svg>
{:else if diagram?.kind === 'reverse-bar'}
  {@const scale = 280 / Math.max(100, diagram.rate)}
  <svg
    viewBox="0 0 320 110"
    role="img"
    aria-label={`Original is 100 percent; £${diagram.known} represents ${diagram.rate} percent, excluding delivery`}
  >
    <text x="160" y="16">Original = 100% = ?</text>
    <rect x="20" y="23" width={100 * scale} height="20" />
    <rect x="20" y="50" width={diagram.rate * scale} height="20" class="shaded" />
    <text x="160" y="87">{diagram.rate}% = £{diagram.known}</text>
    {#if diagram.fee}<text x="160" y="104">Delivery £{diagram.fee} is separate</text>{/if}
  </svg>
{:else if diagram?.kind === 'journey'}
  <svg
    viewBox="0 0 320 95"
    role="img"
    aria-label={`Journey information: ${diagram.legs.join('; ')}${diagram.stop ? '; includes a 0.25 hour stop' : ''}`}
  >
    <path d="M25 40 H295 M25 34 V46 M160 34 V46 M295 34 V46" />
    {#each diagram.legs as label, i}<text x={85 + i * 145} y="25">{label}</text>{/each}
    <text x="160" y="65">Use matching distance and time units</text>
    {#if diagram.stop}<text x="160" y="86">Include the 0.25 hour stop</text>{/if}
  </svg>
{/if}

<style>
  svg {
    display: block;
    width: 100%;
    max-width: 24rem;
    height: auto;
    color: var(--ink);
    margin-block: 1rem;
  }
  path,
  rect {
    stroke: currentColor;
    fill: none;
    stroke-width: 1;
  }
  text {
    fill: currentColor;
    text-anchor: middle;
    font-size: 11px;
  }
  .shaded {
    fill: var(--selection-bg);
  }
  .whole-boundary {
    stroke-width: 2;
  }
  .active {
    stroke: var(--brand);
    stroke-width: 2;
  }
</style>
