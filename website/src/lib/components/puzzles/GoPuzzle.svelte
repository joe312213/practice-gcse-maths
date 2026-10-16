<!--
  Purpose: Compose the shared Go board with parent-owned hints and source links.

  Main contents:
  - Board rendering, binding disposal and assistance callbacks.

  Used By: PuzzlePlayer.

  Uses: No local modules.

  Libs: Svelte tick for DOM updates; @subject-apps/puzzles render, boards and evaluation APIs for Go controls and checking.
-->
<script>
  import { tick } from 'svelte';
  import { renderPart, renderHint, renderSolution, escapeHTML } from '@subject-apps/puzzles/render';
  import { bindChallenges } from '@subject-apps/puzzles/boards';
  import { evaluatePuzzle } from '@subject-apps/puzzles/evaluation';
  let { variation, source, onAssist, onChange, onMessage } = $props();
  let root;
  let answers = $state.raw({}),
    result = $state.raw(null),
    hint = $state(false),
    solution = $state(false);
  const instanceId = $props.id();
  const html = $derived(
    variation.parts
      .map((part, index) =>
        renderPart(part, answers[part.id] ?? '', {
          instanceId,
          index,
          result: result?.parts[index],
          guidanceActionsHTML: `<button type="button" class="puzzle-link" data-strategy-hint aria-expanded="${hint}">${hint ? 'Hide hint' : 'Show hint'}</button>`,
          guidanceHTML: hint ? renderHint(variation) : '',
          referenceHTML: source?.url
            ? `<a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer">Puzzle source</a>`
            : '',
        }),
      )
      .join('') + (solution ? renderSolution(variation, instanceId, { assistance: false }) : ''),
  );

  // Bind only the package-owned board DOM; dispose pending replies on redraw/unmount.
  $effect(() => {
    html;
    const dispose = bindChallenges(root, {
      getPart: (_, id) => variation.parts.find((part) => part.id === id),
      getAnswer: (_, id) => answers[id],
      isLocked: () => false,
      onChange: async (_, id, value, selector) => {
        answers = { ...answers, [id]: value };
        const checked = evaluatePuzzle(variation, answers);
        const reset = Object.values(answers).every((answer) => !JSON.parse(answer).moves?.length);
        result = reset ? null : result?.complete ? result : checked.complete ? checked : null;
        onChange(result);
        await tick();
        if (selector) root?.querySelector(selector)?.focus({ preventScroll: true });
      },
      onAssist,
      notify: onMessage,
    });
    const toggleHint = async (event) => {
      if (event.target.closest('[data-strategy-hint]')) {
        hint = !hint;
        if (hint) onAssist();
        await tick();
        root?.querySelector('[data-strategy-hint]')?.focus({ preventScroll: true });
      }
    };
    root.addEventListener('click', toggleHint);
    return () => {
      dispose();
      root.removeEventListener('click', toggleHint);
    };
  });
  export function getState() {
    return $state.snapshot({ answers, result, hint, solution });
  }
  export function setState(state) {
    answers = state.answers;
    result = state.result;
    hint = state.hint;
    solution = state.solution;
  }
  export function evaluate() {
    return evaluatePuzzle(variation, answers);
  }
  export function setResult(value) {
    result = value;
  }
  export function showSolution(value) {
    solution = value;
  }
</script>

<div class="puzzle-controls" bind:this={root}>{@html html}</div>
