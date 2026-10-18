<!--
  Purpose: Render readable place-value arithmetic working with staged cells, digits and carries.

  Main contents:
  - Lattice and bus stop diagrams with text explanations.

  Used By: website/src/lib/components/practice/Feedback.svelte,
  website/src/lib/components/teaching/DemoPlayer.svelte,
  website/src/lib/components/teaching/InvestigationWorking.svelte,
  website/src/lib/components/teaching/LatticeErrorInvestigation.svelte,
  website/src/routes/+page.svelte.

  Uses: website/src/lib/application/error-working.mjs,
  website/src/lib/components/teaching/WrittenInk.svelte,
  website/src/lib/components/teaching/MathText.svelte,
  website/src/lib/application/arithmetic-demo.mjs.

  Libs: none.
-->
<script>
  import { markerPath } from '#lib/application/error-working.mjs';
  import WrittenInk from './WrittenInk.svelte';
  import MathText from './MathText.svelte';
  import { latticeModel, divisionModel } from '#lib/application/arithmetic-demo.mjs';
  let {
    question,
    frame = { step: 5, count: Infinity },
    compact = false,
    font = null,
    working = null,
    authoredModel = null,
    selectionDisabled = false,
    selectedLocation = '',
    entries = [],
    onselect = null,
  } = $props();
  const guideProgress = $derived(frame.guideProgress ?? 1);
  const lattice = $derived(
    question.method === 'lattice'
      ? (authoredModel ?? latticeModel(question.a, question.b, working ?? {}))
      : null,
  );
  const activeCell = $derived(frame.cell ?? -1);
  const activeDiagonal = $derived(frame.step === 4 ? frame.count - 1 : -1);
  const division = $derived(question.method === 'bus' ? divisionModel(question) : null);
</script>

{#snippet digitValue(value, x, y, focused = false, small = false, inRegion = false)}
  <g data-method-highlight={focused ? 'digit' : undefined}>
    {#if focused}<rect
        class="method-focus"
        x={x - (small ? 11 : 17)}
        y={y - (small ? 17 : 29)}
        width={small ? 22 : 34}
        height={small ? 23 : 38}
        rx="4"
      />{/if}
    <text
      visibility={font ? 'hidden' : undefined}
      aria-hidden={font ? 'true' : undefined}
      {x}
      {y}
      class:carry={small}
      class:focused={focused || inRegion}>{value}</text
    >
    {#if font}<WrittenInk
        {font}
        text={value}
        {x}
        {y}
        size={small ? 15 : 27}
        focused={focused || inRegion}
      />{/if}
  </g>
{/snippet}

<div class="arithmetic-working" data-method-phase={frame.phase}>
  {#if lattice}
    {@const n = lattice.top.length}
    {@const m = lattice.right.length}
    <div
      class="lattice-diagram"
      class:selectable={Boolean(onselect)}
      style={onselect ? `aspect-ratio:${lattice.width}/${lattice.height}` : undefined}
    >
      <svg
        viewBox={`0 0 ${lattice.width} ${lattice.height}`}
        role={onselect ? 'group' : 'img'}
        aria-label={`${working ? 'Student working' : 'Lattice'} for ${question.q}`}
      >
        {#if onselect}
          {#each lattice.regions as region}
            {#if selectedLocation === region.id || entries.some((entry) => entry.location === region.id)}
              <path
                class="working-marker"
                data-location-marker={region.id}
                d={markerPath(region, selectedLocation === region.id)}
                aria-hidden="true"
              />
            {/if}
          {/each}
        {/if}
        {#if frame.phase === 'sum'}
          {#each lattice.cells as cell}
            {@const x = cell.x}
            {@const y = cell.y}
            {@const diagonal = n + m - 2 - cell.row - cell.col}
            {#if diagonal === activeDiagonal}<polygon
                class="method-focus"
                data-method-highlight="diagonal"
                points={`${x + 70},${y} ${x + 70},${y + 70} ${x},${y + 70}`}
              />{/if}
            {#if diagonal + 1 === activeDiagonal}<polygon
                class="method-focus"
                data-method-highlight="diagonal"
                points={`${x},${y} ${x + 70},${y} ${x},${y + 70}`}
              />{/if}
          {/each}
        {/if}
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
            {#if frame.step > 2 || col < frame.count}{@render digitValue(
                digit,
                95 + col * 70,
                32,
                (frame.step === 2 && col === frame.count - 1) ||
                  (frame.step === 3 && lattice.cells[activeCell]?.col === col),
              )}{/if}
          {/each}
          {#each lattice.right as digit, row}
            {#if frame.step > 2 || n + row < frame.count}{@render digitValue(
                digit,
                85 + n * 70,
                88 + row * 70,
                (frame.step === 2 && n + row === frame.count - 1) ||
                  (frame.step === 3 && lattice.cells[activeCell]?.row === row),
              )}{/if}
          {/each}
        {/if}
        {#each lattice.cells as cell, index}
          {@const x = cell.x}
          {@const y = cell.y}
          {#if frame.step > 3 || (frame.step === 3 && index * 2 < frame.count)}
            {@render digitValue(
              Math.floor(cell.value / 10),
              x + 19,
              y + 29,
              index === activeCell && frame.phase === 'tens',
              false,
              frame.phase === 'sum' && n + m - 1 - cell.row - cell.col === activeDiagonal,
            )}
          {/if}
          {#if frame.step > 3 || (frame.step === 3 && index * 2 + 1 < frame.count)}
            {@render digitValue(
              cell.value % 10,
              x + 51,
              y + 60,
              index === activeCell && frame.phase === 'units',
              false,
              frame.phase === 'sum' && n + m - 2 - cell.row - cell.col === activeDiagonal,
            )}
          {/if}
        {/each}
        {#each lattice.diagonals as diagonal, k}
          {@const x = diagonal.x}
          {@const y = diagonal.y}
          {#if frame.step > 4 || (frame.step === 4 && (k < activeDiagonal || (k === activeDiagonal && frame.phase !== 'sum')))}
            {@render digitValue(
              diagonal.digit,
              x,
              y,
              k === activeDiagonal && frame.phase === 'write',
            )}
          {/if}
          {#if diagonal.incoming && (frame.step > 4 || (frame.step === 4 && (k <= activeDiagonal || (k === activeDiagonal + 1 && frame.phase === 'carry'))))}
            {@render digitValue(
              diagonal.incoming,
              diagonal.carryX,
              diagonal.carryY,
              (k === activeDiagonal && frame.phase === 'sum') ||
                (k === activeDiagonal + 1 && frame.phase === 'carry'),
              !diagonal.carryAsDigit,
            )}
          {/if}
        {/each}
      </svg>
      {#if onselect}
        {#each lattice.regions as region}
          {@const number = entries.findIndex((entry) => entry.location === region.id) + 1}
          <button
            type="button"
            class="working-location lattice-location"
            style={`left:${(100 * region.x) / lattice.width}%;top:${(100 * region.y) / lattice.height}%;width:${(100 * region.width) / lattice.width}%;height:${(100 * region.height) / lattice.height}%`}
            disabled={selectionDisabled}
            data-location={region.id}
            aria-label={region.label}
            aria-pressed={selectedLocation === region.id || number > 0}
            onclick={() => onselect(region.id)}
          >
            {#if number}<span class="location-number" aria-hidden="true">{number}</span>{/if}
          </button>
        {/each}
      {/if}
    </div>
    {#if !compact && frame.step === 3 && activeCell >= 0}
      <p class="method-calculation">
        {lattice.top[lattice.cells[activeCell].col]} × {lattice.right[
          lattice.cells[activeCell].row
        ]} = {lattice.cells[activeCell].value}: {frame.phase === 'multiply'
          ? 'multiply the highlighted digits.'
          : frame.phase === 'tens'
            ? 'write the tens above the diagonal.'
            : 'write the units below the diagonal.'}
      </p>
    {/if}
    {#if !compact && frame.step >= 4}
      <ol aria-label="Diagonal totals from bottom right">
        {#each lattice.diagonals.slice(0, frame.step === 4 ? frame.count : undefined) as d}<li>
            {d.sum} + carry {d.incoming} = {d.total}: write {d.digit}{d.carry
              ? `, carry ${d.carry}`
              : ''}.
          </li>{/each}
      </ol>
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
      {#if frame.step >= 2 && guideProgress === 1}{@render digitValue(
          question.b,
          35,
          112,
          frame.phase === 'divide',
        )}{/if}
      {#each division.places as place, index}
        {@const previous = division.places.findLastIndex((p, i) => i < index && p.digit !== '.')}
        {@const carried =
          place.incoming &&
          (previous < frame.count - 1 || (previous === frame.count - 1 && frame.phase === 'carry'))}
        {@const decimalSetup =
          frame.phase === 'carry' &&
          frame.target > frame.count &&
          index >= frame.count &&
          index <= frame.target}
        {#if frame.step >= 2 && guideProgress === 1 && (index < division.integerLength || (frame.step >= 4 && index < frame.count) || carried || decimalSetup)}
          {@render digitValue(
            place.digit,
            100 + index * 55,
            112,
            (index === frame.count - 1 && ['divide', 'decimal'].includes(frame.phase)) ||
              decimalSetup,
          )}
        {/if}
        {#if frame.step > 2 && (index < frame.count - 1 || (index === frame.count - 1 && frame.phase !== 'divide') || (decimalSetup && place.digit === '.'))}
          {@render digitValue(
            place.quotient,
            100 + index * 55,
            49,
            (index === frame.count - 1 && ['write', 'decimal'].includes(frame.phase)) ||
              (decimalSetup && place.digit === '.'),
          )}
        {/if}
        {#if carried && frame.step > 2}
          {@render digitValue(
            place.incoming,
            80 + index * 55,
            88,
            (index === frame.count - 1 && ['divide', 'decimal'].includes(frame.phase)) ||
              decimalSetup ||
              (index === frame.target && frame.phase === 'carry'),
            true,
          )}
        {/if}
      {/each}
    </svg>
    {#if !compact && frame.step > 2}<ol>
        {#each division.places.slice(0, frame.count) as p}
          <li>
            {p.digit === '.'
              ? 'Align decimal points and append zeros.'
              : `${p.value} ÷ ${question.b} = ${p.quotient}, remainder ${p.remainder}.`}
          </li>
        {/each}
      </ol>{/if}
  {/if}
  {#if frame.step === 5}<p>
      <strong
        ><MathText
          text={`${question.q} = ${working ? lattice.answer : question.answer}`}
          {font}
        /></strong
      >
    </p>{/if}
</div>

<style>
  .lattice-diagram {
    position: relative;
  }
  .lattice-diagram.selectable > svg {
    max-height: none;
    height: 100%;
  }
  .lattice-location {
    position: absolute;
  }
  .arithmetic-working > svg,
  .lattice-diagram > svg {
    display: block;
    width: 100%;
    max-height: 420px;
    color: var(--ink);
  }
  .method-guide {
    stroke: var(--working-line, currentColor);
  }
  text {
    fill: currentColor;
    text-anchor: middle;
    font-size: 27px;
  }
  .method-focus {
    fill: var(--method-highlight, var(--selection-bg));
  }
  text.focused {
    fill: var(--selection-text);
  }
  text.carry {
    font-size: 15px;
  }
</style>
