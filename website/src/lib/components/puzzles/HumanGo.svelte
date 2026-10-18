<!--
  Purpose: Human game controls belong to the app; rules, geometry and pointer handling to the
  puzzle module.

  Main contents:
  - resetBoard, refreshClock, play.

  Used By: website/src/routes/go.html/+page.svelte.

  Uses: website/src/lib/components/puzzles/GoClock.svelte.

  Libs: svelte (component state, lifecycle and transitions), @subject-apps/puzzles/go-board
  (shared puzzle package go-board), @subject-apps/puzzles/go-press (shared puzzle package
  go-press), @subject-apps/puzzles/rules/go-game (shared puzzle package go-game),
  @subject-apps/puzzles/rules/go-clock (shared puzzle package go-clock),
  @subject-apps/puzzles/gnugo-client (shared puzzle package gnugo-client), $app/paths (SvelteKit
  navigation/route state).
-->
<script>
  import { onMount, tick } from 'svelte';
  import { renderGoBoard } from '@subject-apps/puzzles/go-board';
  import { bindGoPress } from '@subject-apps/puzzles/go-press';
  import {
    newGoGame,
    goBoardSizes,
    currentGoPosition,
    playHumanGo,
    undoHumanGo,
    redoHumanGo,
    countHumanGo,
    setHumanGoClock,
    resumeHumanGo,
    toggleDeadGroup,
    scoreGoArea,
  } from '@subject-apps/puzzles/rules/go-game';
  import {
    newGoClock,
    advanceGoClock,
    startGoClock,
    pauseGoClock,
  } from '@subject-apps/puzzles/rules/go-clock';
  import { createGnuGoEstimator } from '@subject-apps/puzzles/gnugo-client';
  import { asset } from '$app/paths';
  import GoClock from './GoClock.svelte';
  let game = $state.raw(newGoGame()),
    size = $state(9),
    komi = $state(6.5),
    message = $state(''),
    estimate = $state(true),
    engineResult = $state.raw(null),
    estimating = $state(false),
    estimateError = $state(''),
    retry = $state(0),
    root;
  const estimator = createGnuGoEstimator(asset('/engines/gnugo/worker.js'));
  const position = $derived(currentGoPosition(game));
  const counting = $derived(game.counting || position.passes >= 2);
  const boardSize = $derived(game.size);
  const score = $derived(counting && !estimate ? scoreGoArea(game, komi) : null);
  const estimatePosition = $derived({
    size: boardSize,
    board: [...position.board].map((stone, i) => (game.dead.includes(i) ? '.' : stone)).join(''),
    turn: position.turn,
    komi: Number(komi),
  });
  $effect(() => {
    retry;
    const snapshot = estimatePosition;
    engineResult = null;
    estimateError = '';
    estimating = counting && estimate;
    if (!counting || !estimate) return;
    const controller = new AbortController();
    estimator
      .estimate(snapshot, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          engineResult = result;
          estimating = false;
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          estimateError = error.message;
          estimating = false;
        }
      });
    return () => controller.abort();
  });
  const html = $derived(
    renderGoBoard({
      size: game.size,
      board: position.board,
      last: position.move,
      dead: game.dead,
      zoom: true,
      coordinates: true,
      ownership: counting && estimate ? (engineResult?.ownership ?? []) : [],
    }),
  );
  function resetBoard() {
    game = newGoGame(Number(size));
    message = '';
  }
  function refreshClock() {
    if (game.clock?.running) game = { ...game, clock: advanceGoClock(game.clock, Date.now()) };
  }
  onMount(() => {
    const interval = setInterval(refreshClock, 250);
    document.addEventListener('visibilitychange', refreshClock);
    return () => {
      estimator.dispose();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshClock);
    };
  });
  function play(move) {
    const result = playHumanGo(game, move, Date.now());
    message = result.error ?? '';
    if (result.game) game = result.game;
  }
  $effect(() => {
    html;
    const controller = new AbortController();
    bindGoPress(
      root,
      { size: boardSize, view: [0, 0, boardSize - 1, boardSize - 1] },
      {
        getState: () => game,
        isLocked: () => false,
        signal: controller.signal,
        validate: (state, move) =>
          counting ? { error: 'Counting' } : playHumanGo(state, move, Date.now()),
        getColour: (state) => currentGoPosition(state).turn,
      },
    );
    root.addEventListener(
      'click',
      async (event) => {
        const button = event.target.closest('[data-challenge-action="go"]');
        if (!button) return;
        const move = Number(button.dataset.value);
        if (counting) game = toggleDeadGroup(game, move);
        else play(move);
        await tick();
        root?.querySelector(`[data-value="${move}"]`)?.focus({ preventScroll: true });
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  });
</script>

<div class="level-row">
  <label
    >Board size <select
      class="choice-field"
      aria-label="Board size"
      bind:value={size}
      onchange={(event) => {
        size = Number(event.currentTarget.value);
        resetBoard();
      }}
      >{#each goBoardSizes as value}<option {value}>{value} × {value}</option>{/each}</select
    ></label
  >
  <button class="action-button" onclick={resetBoard}>Reset board</button>
  <label
    >White’s komi <select class="choice-field" aria-label="White’s komi" bind:value={komi}
      >{#each [0, 5.5, 6.5, 7.5] as value}<option {value}>{value}</option>{/each}</select
    ></label
  >
</div>
<GoClock
  clock={game.clock}
  {counting}
  onstart={(settings) => {
    game = setHumanGoClock(game, startGoClock(newGoClock(settings, position.turn), Date.now()));
    message = '';
  }}
  ontoggle={() => {
    game = {
      ...game,
      clock: game.clock.running
        ? pauseGoClock(game.clock, Date.now())
        : startGoClock(game.clock, Date.now()),
    };
  }}
  onreset={() => {
    game = setHumanGoClock(game, null);
    message = '';
  }}
/>
<div class="puzzle-controls human-go-controls" bind:this={root}>{@html html}</div>
<p role="status">
  {message ||
    (game.clock?.expired
      ? `${game.clock.expired === 'b' ? 'Black' : 'White'} ran out of time. Reset clocks to continue or choose new timing.`
      : '') ||
    (counting
      ? 'Counting: agree on dead groups, then tap them to remove or restore them in the count. Clocks are paused.'
      : `${position.turn === 'b' ? 'Black' : 'White'} to play.${position.passes ? ' The other player passed.' : ''}`)}
</p>
<div class="actions go-play-controls">
  {#if counting}<button
      class="action-button"
      onclick={() => {
        game = resumeHumanGo(game, Date.now());
        message = '';
      }}>Resume play</button
    >
  {:else}<button
      class="action-button"
      onclick={() => {
        game = countHumanGo(game, Date.now());
        message = '';
      }}>Count</button
    ><button
      class="action-button primary"
      disabled={Boolean(game.clock?.expired)}
      onclick={() => play(null)}>Pass</button
    >{/if}
  <button
    class="action-button"
    disabled={game.positions.length === 1}
    onclick={() => {
      game = undoHumanGo(game);
      message = '';
    }}>Undo</button
  >
  <button
    class="action-button"
    disabled={!game.future?.length}
    onclick={() => {
      game = redoHumanGo(game);
      message = '';
    }}>Redo</button
  >
</div>
{#if counting}
  <label><input type="checkbox" bind:checked={estimate} /> Estimate open territory</label>
  {#if estimate}
    {#if estimating}<p role="status">Estimating with GNU Go…</p>
    {:else if estimateError}<p role="alert">{estimateError}</p>
      <button class="action-button compact" onclick={() => retry++}>Try estimate again</button>
    {:else if engineResult}
      <p aria-live="polite">
        <strong
          >GNU Go estimate — {Math.abs(engineResult.lead) < 0.05
            ? 'Even.'
            : `${engineResult.lead > 0 ? 'White' : 'Black'} leads by ${Math.abs(engineResult.lead).toFixed(1)}.`}</strong
        >
        Includes {komi} komi, using area scoring.
      </p>
      <p>
        Squares show GNU Go’s estimated territory. This is a prediction, not a final result. Mark
        agreed dead groups, or turn off estimates for the current area count.
      </p>
    {/if}
  {:else if score}
    <p aria-live="polite">
      Area count — <strong>Black: {score.black} · White: {score.white}</strong>
      (includes {komi} komi). {score.black === score.white
        ? 'Draw.'
        : `${score.black > score.white ? 'Black' : 'White'} leads by ${Math.abs(score.black - score.white)}.`}
    </p>
    <p>
      Area count: living stones + surrounded empty points. {score.neutral} neutral points. Fill open borders
      before treating this as a final score; captures are not added again.
    </p>
  {/if}
{/if}
<details>
  <summary>Counting and rules</summary>
  <p>
    White receives komi to balance Black’s first move. Count at any point, or pass twice to start
    counting. Marked dead groups are faded; GNU Go predictions do not override your agreed dead
    groups. Area counting uses your agreed dead groups. Suicide and moves repeating an earlier board
    position are forbidden. Undo and Redo review moves and passes with clocks paused. Reset board
    clears the game; changing size starts an empty board immediately.
  </p>
</details>
