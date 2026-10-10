<!--
  Purpose: Render readable place-value arithmetic working with staged cells, digits and carries.
  Main contents: Lattice and bus stop diagrams with text explanations.
  Used By: ArithmeticDemo and Feedback.
  Uses: arithmetic-demo.mjs.
  Libs: Svelte reactive derivation.
-->
<script>
  import { latticeModel, divisionModel } from '#lib/application/arithmetic-demo.mjs';
  let { question, frame = { step: 4, count: Infinity }, compact = false } = $props();
  const guideProgress = $derived(frame.guideProgress ?? 1);
  const lattice = $derived(
    question.method === 'lattice' ? latticeModel(question.a, question.b) : null,
  );
  const division = $derived(question.method === 'bus' ? divisionModel(question) : null);
</script>

<div class="arithmetic-working" data-demo-current>
  {#if lattice}
    {@const n = lattice.top.length}
    {@const m = lattice.right.length}
    <svg
      viewBox={`0 0 ${n * 70 + 120} ${m * 70 + 130}`}
      role="img"
      aria-label={`Lattice for ${question.q}`}
    >
      {#each lattice.guides as path, index}
        <path
          class="method-guide"
          d={path}
          fill="none"
          stroke="currentColor"
          pathLength="1"
          stroke-dasharray="1"
          stroke-dashoffset={1 -
            Math.max(0, Math.min(1, guideProgress * lattice.guides.length - index))}
        />
      {/each}
      {#if guideProgress === 1}
        {#each lattice.top as digit, col}
          {#if frame.step > 1 || col < frame.count}<text x={95 + col * 70} y="32">{digit}</text
            >{/if}
        {/each}
        {#each lattice.right as digit, row}
          {#if frame.step > 1 || n + row < frame.count}<text x={85 + n * 70} y={88 + row * 70}
              >{digit}</text
            >{/if}
        {/each}
      {/if}
      {#each lattice.cells as cell, index}
        {@const x = 60 + cell.col * 70}
        {@const y = 50 + cell.row * 70}
        {#if frame.step > 2 || (frame.step === 2 && index * 2 < frame.count)}
          <text x={x + 19} y={y + 29}>{Math.floor(cell.value / 10)}</text>
        {/if}
        {#if frame.step > 2 || (frame.step === 2 && index * 2 + 1 < frame.count)}
          <text x={x + 51} y={y + 60}>{cell.value % 10}</text>
        {/if}
      {/each}
      {#each lattice.diagonals as diagonal, k}
        {#if frame.step > 3 || (frame.step === 3 && k < frame.count)}
          {@const x = k < n ? 95 + (n - 1 - k) * 70 : 25}
          {@const y = k < n ? 90 + m * 70 : 95 + (m - 1 - (k - n)) * 70}
          <text {x} {y}>{diagonal.digit}</text>
          {#if diagonal.incoming}<text x={x + 18} y={y - 23} class="carry">{diagonal.incoming}</text
            >{/if}
        {/if}
      {/each}
    </svg>
    {#if !compact}
      {#if frame.step === 1}<p>
          Draw the grid and its diagonals first, as you would on paper in an exam. Then put the
          first number across the top and the second down the right.
        </p>
      {:else if frame.step === 2}<p>Tens go above the diagonal; units below. Keep tens zeros.</p>
      {:else}
        <ol aria-label="Diagonal totals from bottom right">
          {#each lattice.diagonals.slice(0, frame.step === 3 ? frame.count : undefined) as d}<li>
              {d.sum} + carry {d.incoming} = {d.total}: write {d.digit}{d.carry
                ? `, carry ${d.carry}`
                : ''}.
            </li>{/each}
        </ol>
      {/if}
    {/if}
  {:else if division}
    <svg
      viewBox={`0 0 ${division.places.length * 55 + 110} 155`}
      role="img"
      aria-label={`Bus stop working for ${question.q}`}
    >
      <path
        class="method-guide"
        pathLength="1"
        stroke-dasharray="1"
        stroke-dashoffset={1 - guideProgress}
        d={`M70,140 V65 H${division.places.length * 55 + 85}`}
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
      {#if guideProgress === 1}<text x="35" y="112">{question.b}</text>{/if}
      {#each division.places as place, index}
        {#if guideProgress === 1 && (index < division.integerLength || (frame.step >= 3 && index < frame.count))}
          <text x={100 + index * 55} y="112">{place.digit}</text>
        {/if}
        {#if frame.step > 1 && index < frame.count}
          <text x={100 + index * 55} y="49">{place.quotient}</text>
          {#if place.incoming}<text x={80 + index * 55} y="88" class="carry">{place.incoming}</text
            >{/if}
        {/if}
      {/each}
    </svg>
    {#if frame.step === 1}<p>
        Draw the bus-stop bracket first, as you would on paper in an exam. Dividend inside; divisor
        outside on the left. Write each answer digit above its matching digit.
      </p>{/if}
    {#if !compact}<ol>
        {#each division.places.slice(0, frame.step === 1 ? 0 : frame.count) as p}
          <li>
            {p.digit === '.'
              ? 'Align decimal points and append zeros.'
              : `${p.value} ÷ ${question.b} = ${p.quotient}, remainder ${p.remainder}.`}
          </li>
        {/each}
      </ol>{/if}
  {/if}
  {#if frame.step === 4}<p><strong>{question.q} = {question.answer}</strong></p>{/if}
</div>

<style>
  .arithmetic-working svg {
    display: block;
    width: 100%;
    max-height: 420px;
    color: var(--text);
  }
  text {
    fill: currentColor;
    text-anchor: middle;
    font-size: 27px;
  }
  text.carry {
    font-size: 15px;
  }
</style>
