<!--
  Purpose: Keep learning-stage labels readable while fitting natural rows to available space.

  Main contents: Stage navigation and intrinsic row grouping.

  Used By: TopicPractice.svelte.

  Uses: stages.mjs for the shared labels and order.

  Libs: Svelte (state/tick); native ResizeObserver for available space.
-->
<script>
  import { tick } from 'svelte';
  import { MODES } from '#lib/domain/stages.mjs';

  let { mode, onselect } = $props();
  let rows = $state([MODES]);
  let sized = $state(false);
  const current = $derived(MODES.findIndex(([id]) => id === mode));

  // Only group rows here; flexbox owns growth, shrinking and one/two-line text layout.
  function fitRows(nav) {
    function measure() {
      const buttons = [...nav.querySelectorAll('button')];
      const next = [[]];
      let used = 0;
      for (const [index, button] of buttons.entries()) {
        const style = getComputedStyle(button);
        const phraseWidth = Math.max(
          ...[...button.querySelectorAll('.stage-label > span')].map(
            (phrase) => phrase.getBoundingClientRect().width,
          ),
        );
        const width =
          phraseWidth +
          [
            'paddingLeft',
            'paddingRight',
            'borderLeftWidth',
            'borderRightWidth',
            'marginLeft',
          ].reduce((sum, property) => sum + parseFloat(style[property]), 0);
        if (next.at(-1).length && used + width > nav.getBoundingClientRect().width) {
          next.push([]);
          // Wrapped-row padding offsets its first segment's negative notch margin.
          used = -parseFloat(style.marginLeft);
        }
        next.at(-1).push(MODES[index]);
        used += width;
      }
      if (next.map((row) => row.length).join() !== rows.map((row) => row.length).join()) {
        const focused = nav.contains(document.activeElement)
          ? document.activeElement.dataset.mode
          : null;
        rows = next;
        // Regrouping changes parent rows; retain keyboard focus on the same stage.
        if (focused)
          void tick().then(() =>
            nav.querySelector(`[data-mode="${focused}"]`)?.focus({ preventScroll: true }),
          );
      }
      sized = true;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    measure();
    return { destroy: () => observer.disconnect() };
  }
</script>

<nav class="learning-steps" class:sized aria-label="Topic learning steps" use:fitRows>
  {#each rows as row}
    <div class="stage-row">
      {#each row as [id, label] (id)}
        {@const index = MODES.findIndex(([stage]) => stage === id)}
        {@const split = label.lastIndexOf(' ')}
        <button
          class="action-button"
          type="button"
          data-mode={id}
          class:first-stage={index === 0}
          class:last-stage={index === MODES.length - 1}
          class:earlier-stage={index < current}
          aria-current={mode === id ? 'step' : undefined}
          onclick={() => onselect(id)}
        >
          <!-- A single permitted wrap keeps each complete label on at most two lines. -->
          <span class="stage-label"
            ><span>{label.slice(0, split)}</span>{' '}<span>{label.slice(split + 1)}</span></span
          >
        </button>
      {/each}
    </div>
  {/each}
</nav>
