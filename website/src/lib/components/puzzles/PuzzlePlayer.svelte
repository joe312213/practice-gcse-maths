<!--
  Purpose: Own explicit puzzle checking and assistance around the portable puzzle control.

  Main contents:
  - Mount/dispose boundary, check, hint and solution actions.

  Used By: puzzles route.

  Uses: GoPuzzle.

  Libs: Svelte lifecycle; @subject-apps/puzzles/player for portable puzzle controls.
-->
<script>
  import { onMount } from 'svelte';
  import { mountPuzzle } from '@subject-apps/puzzles/player';
  import GoPuzzle from './GoPuzzle.svelte';
  let { variation, source, initialState = null } = $props();
  const isGo = $derived(variation.parts.every((part) => part.kind === 'go'));
  let root = $state(),
    control = $state.raw();
  let result = $state(null),
    assisted = $state(false),
    hint = $state(false),
    solution = $state(false),
    message = $state('');
  onMount(() => {
    if (initialState) {
      result = initialState.result;
      assisted = initialState.assisted;
      hint = initialState.hint;
      solution = initialState.solution;
      message = initialState.message;
    }
    if (isGo) {
      if (initialState) control.setState(initialState.board);
      return;
    }
    control = mountPuzzle(root, variation, {
      onAssist: () => (assisted = true),
      onChange: () => {
        result = null;
        message = '';
      },
      onMessage: (text) => (message = text),
    });
    if (initialState) {
      control.setState(initialState.board);
      control.setResult(initialState.result);
      control.showHint(hint);
      control.showSolution(solution);
    }
    return () => control.destroy();
  });
  export function getState() {
    return $state.snapshot({
      board: control?.getState(),
      result,
      assisted,
      hint,
      solution,
      message,
    });
  }
  /** Explicitly check the current board without revealing or replacing the student's answer. */
  function check() {
    const checked = control.evaluate();
    control.setResult(checked);
    result = checked;
  }
</script>

{#if isGo}
  <GoPuzzle
    {variation}
    {source}
    bind:this={control}
    onAssist={() => (assisted = true)}
    onChange={() => {
      result = null;
      message = '';
    }}
    onMessage={(text) => (message = text)}
  />
{:else}
  <div class="puzzle-controls" bind:this={root}></div>
{/if}
<div class="actions">
  {#if !isGo}<button class="action-button primary" type="button" onclick={check}
      >Check puzzle</button
    >{/if}
  {#if !isGo}<button
      class="action-button"
      type="button"
      aria-pressed={hint}
      onclick={() => {
        hint = !hint;
        if (hint) assisted = true;
        control.showHint(hint);
      }}>{hint ? 'Hide hint' : 'Hint'}</button
    >{/if}
  <button
    class="action-button"
    type="button"
    aria-pressed={solution}
    onclick={() => {
      solution = !solution;
      if (solution) assisted = true;
      control.showSolution(solution);
    }}>{solution ? 'Hide solution' : 'Show solution'}</button
  >
</div>
<p role="status">
  {message}{result
    ? `${result.complete ? 'Well done! ' : 'Keep trying. '}${result.earned} of ${result.maximum} marks.${assisted ? ' Assisted practice.' : ''}`
    : ''}
</p>
{#if assisted}<small>You have used help on this puzzle.</small>{/if}
