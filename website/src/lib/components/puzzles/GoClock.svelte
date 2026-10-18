<!--
  Purpose: Configure and display the human game's optional two-player clock.

  Main contents:
  Main time, Japanese byo-yomi, player displays and clock controls.

  Used By: website/src/lib/components/puzzles/HumanGo.svelte.

  Uses: website/src/lib/domain/countdown.mjs.

  Libs: none.
-->
<script>
  import { clockText } from '#lib/domain/countdown.mjs';
  let { clock, counting, onstart, ontoggle, onreset } = $props();
  let minutes = $state(5),
    seconds = $state(30),
    periods = $state(3);
  let settingsOpen = $state(false);
</script>

<details class="go-clock-settings" bind:open={settingsOpen}>
  <summary>Timing options</summary>
  <fieldset disabled={Boolean(clock)}>
    <div class="level-row">
      <label
        >Main time <select class="choice-field" aria-label="Main time" bind:value={minutes}
          >{#each [0, 1, 5, 10, 15, 20, 30, 45, 60] as value}<option {value}>{value} min</option
            >{/each}</select
        ></label
      >
      <label
        >Byo-yomi <select
          class="choice-field"
          aria-label="Byo-yomi seconds"
          bind:value={seconds}
          disabled={Boolean(clock) || periods === 0}
          >{#each [10, 15, 20, 30, 45, 60] as value}<option {value}>{value} sec</option
            >{/each}</select
        ></label
      >
      <label
        >Periods <select class="choice-field" aria-label="Byo-yomi periods" bind:value={periods}
          >{#each [0, 1, 3, 5, 10] as value}<option {value}>{value === 0 ? 'None' : value}</option
            >{/each}</select
        ></label
      >
    </div>
  </fieldset>
  {#if !clock}<button
      class="action-button"
      disabled={counting || (!minutes && !periods)}
      onclick={() => {
        settingsOpen = false;
        onstart({ mainMs: minutes * 60000, periodMs: seconds * 1000, periods });
      }}>Start clocks</button
    >{/if}
  {#if !clock?.running}
    <p>
      Settings apply to each player. After main time, each move gets a fresh surviving byo-yomi
      period. Taking longer uses up periods. Clocks keep running in background tabs; pause before
      stepping away.
    </p>
  {/if}
</details>
{#if clock}
  <div class="go-clocks" aria-label="Game clocks">
    {#each ['b', 'w'] as colour}
      {@const player = clock.players[colour]}
      <div class:active={clock.active === colour}>
        <strong
          >{colour === 'b' ? 'Black' : 'White'}{clock.active === colour ? ' · to play' : ''}</strong
        >
        <output
          role="timer"
          aria-live="off"
          aria-label={`${colour === 'b' ? 'Black' : 'White'} time`}
          >{clockText(player.mainMs || (player.periods ? player.periodMs : 0))}</output
        >
        <small
          >{player.mainMs
            ? 'Main time'
            : `${player.periods} byo-yomi ${player.periods === 1 ? 'period' : 'periods'} left`}</small
        >
      </div>
    {/each}
  </div>
  <div class="actions">
    <button
      class="action-button compact"
      disabled={counting || Boolean(clock.expired)}
      onclick={ontoggle}>{clock.running ? 'Pause clocks' : 'Resume clocks'}</button
    >
    <button class="action-button compact" onclick={onreset}>Reset clocks</button>
  </div>
{/if}

<style>
  .go-clock-settings {
    margin-block: 1rem;
  }
  fieldset {
    margin: 0;
    border: 0;
    padding: 0;
    min-width: 0;
  }
  .go-clocks {
    display: flex;
    flex-wrap: wrap;
    gap: var(--control-gap);
    margin-block: 1rem;
  }
  .go-clocks > div {
    display: grid;
    gap: 0.25rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-selector);
    padding: 0.5rem;
    flex: 1 1 8rem;
  }
  .active {
    background: var(--surface-soft);
  }
  output {
    font-size: 1.5rem;
    font-variant-numeric: tabular-nums;
  }
</style>
