<!--
  Purpose: Illustrate lattice place value with labelled product cells and diagonal sums.

  Main contents:
  - Two product cells; a complete 23 × 14 lattice with its carry explained.

  Used By: website/src/lib/components/teaching/MethodStep.svelte.

  Uses: no local module imports.

  Libs: none.
-->
<script>
  let { kind } = $props();
</script>

{#if kind === 'lattice-cells'}
  <svg
    viewBox="0 0 380 180"
    role="img"
    aria-label="7 times 8 is 56: 5 tens above the diagonal, 6 units below. 2 times 4 is 08: 0 tens above, 8 units below."
  >
    {#each [{ x: 30, label: '7 × 8 = 56', tens: 5, units: 6 }, { x: 220, label: '2 × 4 = 08', tens: 0, units: 8 }] as cell}
      <text x={cell.x + 55} y="20">{cell.label}</text>
      <path d={`M${cell.x} 35 h110 v110 h-110 Z M${cell.x} 145 l110 -110`} />
      <text x={cell.x + 28} y="70">{cell.tens}</text><text class="label" x={cell.x + 28} y="88"
        >tens</text
      >
      <text x={cell.x + 82} y="110">{cell.units}</text><text class="label" x={cell.x + 82} y="128"
        >units</text
      >
    {/each}
  </svg>
{:else if kind === 'lattice-diagonals'}
  <figure>
    <svg
      viewBox="0 0 380 260"
      role="img"
      aria-label="23 times 14. Cells 02, 03, 08, 12. Units: 2. Tens: 1 plus 8 plus 3 equals 12, write 2 carry 1. Hundreds: 0 plus 0 plus 2 plus carried 1 equals 3. Answer 322."
    >
      <text x="130" y="22">2</text><text x="210" y="22">3</text>
      <text x="270" y="82">1</text><text x="270" y="162">4</text>
      <path class="band" d="M130 198 L248 80" />
      <path
        d="M90 38 h160 v160 h-160 Z M170 38 v160 M90 118 h160 M90 118 L170 38 M90 198 L250 38 M170 198 L250 118 M90 118 L65 143 M90 198 L65 223 M170 198 L145 223 M250 198 L225 223"
      />
      {#each [{ x: 90, y: 38, t: 0, u: 2 }, { x: 170, y: 38, t: 0, u: 3 }, { x: 90, y: 118, t: 0, u: 8 }, { x: 170, y: 118, t: 1, u: 2 }] as cell}
        <text x={cell.x + 21} y={cell.y + 30}>{cell.t}</text><text x={cell.x + 59} y={cell.y + 65}
          >{cell.u}</text
        >
      {/each}
      <text x="49" y="143">0</text><text x="49" y="220">3</text><text x="132" y="239">2</text><text
        x="222"
        y="239">2</text
      >
      <text class="label" x="60" y="183">carry 1</text>
    </svg>
    <figcaption>
      23 × 14 = 322. Work from the bottom right: 2; then 1 + 8 + 3 = 12, so write 2 and carry 1;
      then 0 + 0 + 2 + 1 = 3. The shaded band is the tens diagonal.
    </figcaption>
  </figure>
{/if}

<style>
  svg {
    width: min(100%, 24rem);
    height: auto;
    display: block;
  }
  path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
  }
  .band {
    stroke: var(--accent-border);
    stroke-width: 35;
    opacity: 0.25;
  }
  text {
    fill: currentColor;
    text-anchor: middle;
    font-size: 20px;
  }
  .label {
    font-size: 12px;
  }
  figure {
    margin: 0.75rem 0;
  }
  figcaption {
    max-width: 38rem;
  }
</style>
