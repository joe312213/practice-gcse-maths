<!--
  Purpose: Share joined, clipped chevrons and intrinsic row fitting across different step contents.
  Main contents: Caller-rendered segments, first/last geometry and focus-preserving row grouping.
  Used By: LearningSteps and TopicProgress.
  Uses: No application/domain modules.
  Libs: Svelte tick; native ResizeObserver.
-->
<script>
  import { tick } from 'svelte';

  let {
    items,
    segment,
    label,
    tag = 'div',
    class: className = '',
    wrap = true,
    onmeasure = () => {},
  } = $props();
  let rowLengths = $state([]);
  let sized = $state(false);
  let compact = $state(false);
  const equalRows = $derived(rowLengths.length > 1 && rowLengths.every((n) => n === rowLengths[0]));
  const rows = $derived.by(() => {
    let offset = 0;
    const grouped = rowLengths.map((length) => items.slice(offset, (offset += length)));
    if (offset < items.length) grouped.push(items.slice(offset));
    return grouped.filter((row) => row.length);
  });

  // The caller marks indivisible label phrases; flexbox fits the content within each row.
  function fitRows(root) {
    function measure() {
      const segments = [...root.querySelectorAll('[data-chevron-id]')];
      const available = root.getBoundingClientRect().width;
      const widths = segments.map((segment) => {
        const style = getComputedStyle(segment);
        const phrases = [...segment.querySelectorAll('.chevron-measure')];
        const phraseWidth = Math.max(
          0,
          ...phrases.map((phrase) => phrase.getBoundingClientRect().width),
        );
        const padding = [
          'paddingLeft',
          'paddingRight',
          'borderLeftWidth',
          'borderRightWidth',
          'marginLeft',
        ].reduce((sum, property) => sum + parseFloat(style[property]), 0);
        const label = segment.querySelector('.stage-label');
        const probe = label?.cloneNode(true);
        let natural = phraseWidth;
        if (probe) {
          probe.style.cssText = 'position:absolute;white-space:nowrap;width:max-content';
          for (const phrase of probe.children) phrase.style.display = 'inline';
          segment.append(probe);
          natural = probe.getBoundingClientRect().width;
          probe.remove();
        }
        return {
          min: phraseWidth + padding,
          natural: natural + padding,
          inset: -parseFloat(style.marginLeft),
        };
      });
      const rowWidth = (start, count, property = 'min') =>
        (start ? widths[start].inset : 0) +
        widths.slice(start, start + count).reduce((sum, width) => sum + width[property], 0);
      // The parent can reserve a complete compact row before adding adjacent content.
      onmeasure(Math.ceil(rowWidth(0, widths.length)));
      const lengths = [0];
      let start = 0;
      for (let i = 0; i < widths.length; i++) {
        if (wrap && lengths.at(-1) && rowWidth(start, lengths.at(-1) + 1) > available) {
          start = i;
          lengths.push(0);
        }
        lengths[lengths.length - 1]++;
      }
      // Keep the minimum row count, then move trailing stages down while their phrases fit.
      let changed;
      do {
        changed = false;
        let offset = widths.length;
        for (let i = lengths.length - 1; i > 0; i--) {
          offset -= lengths[i];
          if (
            lengths[i - 1] > lengths[i] + 1 &&
            rowWidth(offset - 1, lengths[i] + 1) <= available
          ) {
            lengths[i - 1]--;
            lengths[i]++;
            offset--;
            changed = true;
          }
        }
      } while (changed);
      compact = lengths.length > 1 && rowWidth(0, lengths[0], 'natural') > available;
      if (lengths.join() !== rowLengths.join()) {
        const focused = root.contains(document.activeElement)
          ? document.activeElement.closest('[data-chevron-id]')?.dataset.chevronId
          : null;
        rowLengths = lengths;
        // Regrouping replaces parent rows; restore the same caller-supplied control.
        if (focused !== null && focused !== undefined)
          void tick().then(() =>
            [...root.querySelectorAll('[data-chevron-id]')]
              .find((segment) => segment.dataset.chevronId === focused)
              ?.focus({ preventScroll: true }),
          );
      }
      sized = true;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    measure();
    return { update: measure, destroy: () => observer.disconnect() };
  }
</script>

<svelte:element
  this={tag}
  class={`chevron-steps ${className}`}
  class:sized
  class:compact
  class:equal-rows={equalRows}
  aria-label={label}
  use:fitRows={{ items, wrap }}
>
  {#each rows as row}
    <div class="stage-row">
      {#each row as item (item.id)}
        {@render segment(item, {
          class: `chevron-segment ${item.id === items[0].id ? 'first-stage' : ''} ${item.id === items.at(-1).id ? 'last-stage' : ''}`,
          'data-chevron-id': String(item.id),
        })}
      {/each}
    </div>
  {/each}
</svelte:element>

<style>
  .chevron-steps {
    --chevron-depth: 0.6rem;
    --chevron-divider-width: 2px;
    --chevron-border-width: 1px;

    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.3rem;
    margin: 0;
  }
  .stage-row {
    display: flex;
    flex-wrap: wrap;
  }
  /* Cancel the first segment's negative notch margin on each wrapped row. */
  .stage-row:not(:first-child) {
    padding-inline-start: var(--chevron-depth);
  }
  /* The helper groups by minimum phrase width; flexbox fits the complete labels within each row. */
  .chevron-steps.sized .stage-row {
    flex-wrap: nowrap;
  }
  .compact :global(.stage-label > span) {
    display: block;
    width: max-content;
    margin-inline: auto;
  }
  .stage-row:first-child :global(.chevron-segment) {
    flex-grow: 1;
  }
  :global(:where(.chevron-steps) .chevron-segment) {
    position: relative;
    /* Natural widths may shrink to two label lines within their measured row. */
    flex: 0 1 auto;
    min-width: 0;
    max-width: var(--chevron-segment-max-width, none);
    overflow: hidden;
    min-height: 4.5rem;
    /* Match the adjoining notch exactly; a positive seam exposes the page background. */
    margin: 0 0 0 calc(-1 * var(--chevron-depth));
    padding-block: 0.6rem;
    padding-inline: var(--chevron-padding-start, calc(var(--chevron-depth) + 0.5rem))
      var(--chevron-padding-end, calc(var(--chevron-depth) + 0.5rem));
    border-radius: 0;
    border-width: var(--chevron-border-width);
    /* 15px labels at the agreed 16px root, scaling with root text size. */
    font-size: 0.9375rem;
    line-height: 1.3;
    clip-path: polygon(
      0 0,
      calc(100% - var(--chevron-depth)) 0,
      100% 50%,
      calc(100% - var(--chevron-depth)) 100%,
      0 100%,
      var(--chevron-depth) 50%
    );
  }
  /* Paint both diagonal edges, including the exposed notch when navigation wraps. */
  :global(:where(.chevron-steps) .chevron-segment[aria-current='step']) {
    /* A rectangular selected-colour border leaves dark ticks where the diagonal meets it. */
    border-color: var(--line);
    background-clip: padding-box;
  }
  :global(:where(.chevron-steps) .chevron-segment:not(.first-stage)::before),
  :global(:where(.chevron-steps) .chevron-segment:not(.last-stage)::after) {
    content: '';
    position: absolute;
    /* Absolute positioning starts inside the border; align this polygon with the outer clip. */
    inset: calc(-1 * var(--chevron-border-width));
    pointer-events: none;
    z-index: 1;
    background: var(--line);
  }
  :global(:where(.chevron-steps) .chevron-segment:not(.first-stage)::before) {
    clip-path: polygon(
      0 0,
      var(--chevron-border-width) 0,
      calc(var(--chevron-depth) + var(--chevron-border-width)) 50%,
      var(--chevron-border-width) 100%,
      0 100%,
      var(--chevron-depth) 50%
    );
  }
  :global(:where(.chevron-steps) .chevron-segment:not(.last-stage)::after) {
    clip-path: polygon(
      calc(100% - var(--chevron-depth) - var(--chevron-divider-width)) 0,
      calc(100% - var(--chevron-depth)) 0,
      100% 50%,
      calc(100% - var(--chevron-depth)) 100%,
      calc(100% - var(--chevron-depth) - var(--chevron-divider-width)) 100%,
      calc(100% - var(--chevron-divider-width)) 50%
    );
  }
  :global(:where(.chevron-steps) .chevron-segment.first-stage) {
    margin-left: 0;
    padding-left: var(--chevron-first-padding-start, 0.6rem);
    border-radius: var(--radius-selector) 0 0 var(--radius-selector);
    clip-path: polygon(
      0 0,
      calc(100% - var(--chevron-depth)) 0,
      100% 50%,
      calc(100% - var(--chevron-depth)) 100%,
      0 100%
    );
  }
  :global(:where(.chevron-steps) .chevron-segment.last-stage) {
    padding-right: var(
      --chevron-last-padding-end,
      var(--chevron-padding-end, calc(var(--chevron-depth) + 0.5rem))
    );
    border-radius: 0 var(--radius-selector) var(--radius-selector) 0;
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, var(--chevron-depth) 50%);
  }
  :global(:where(.chevron-steps) .chevron-segment.first-stage.last-stage) {
    clip-path: none;
    border-radius: var(--radius-selector);
  }
  :global(:where(.chevron-steps) .chevron-segment:focus-visible) {
    outline-offset: -4px;
  }
</style>
