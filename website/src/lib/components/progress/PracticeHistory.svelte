<script>
  import { practiceHistory } from '#lib/domain/practice-history.mjs';
  import { SET_LEVELS } from '#lib/domain/practice-code.mjs';
  import { weekKey } from '#lib/domain/progress.mjs';
  let { profile, topics } = $props();
  let scope = $state(''),
    mode = $state('plain');
  const weeks = $derived(practiceHistory(profile, scope, mode));
  const current = $derived(weeks.find((row) => row.week === weekKey(Date.now())));
  const previous = $derived(
    weeks.find(
      (row) => row.week === weekKey(Date.parse(`${current.week}T12:00:00Z`) - 7 * 86400000),
    ),
  );
  const minutes = (ms) => (ms / 60000).toFixed(1);
</script>

<section class="card" aria-labelledby="practice-history-title">
  <h2 id="practice-history-title">Practice over time</h2>
  <label
    >Topic <select class="text-field" bind:value={scope}>
      <option value="">All topics</option>
      {#each topics as topic}<option value={topic.key}>{topic.topic.title}</option>{/each}
    </select></label
  >
  <p>
    <strong>{minutes(current.milliseconds)} minutes</strong> this week ·
    <strong>{minutes(previous.milliseconds)} minutes</strong> last week.
  </p>
  <p class="muted">
    Active time covers assessment, method learning and practice, including unfinished questions.
    Timing pauses when this page is hidden or after two minutes without interaction.
    {#if profile.practiceMeasuredFrom}Measurement began {new Date(
        profile.practiceMeasuredFrom,
      ).toLocaleDateString('en-GB')}; earlier time is unknown.{:else}No practice time has been
      measured yet.{/if}
  </p>
  <label
    >Compare success in <select class="text-field" bind:value={mode}>
      <option value="plain">Independent practice</option><option value="errors"
        >Spot the error</option
      >
    </select></label
  >
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this wide table on narrow screens.) -->
  <div class="history-table" tabindex="0" role="region" aria-label="Weekly practice history">
    <table>
      <caption
        >Weeks beginning Monday, UK time. Success is correct / scored answers at each challenge
        level.</caption
      >
      <thead
        ><tr
          ><th scope="col">Week</th><th scope="col">Minutes</th><th scope="col">All answers</th>
          {#each SET_LEVELS as level}<th scope="col">{level}</th>{/each}</tr
        ></thead
      >
      <tbody
        >{#each weeks as week}<tr
            ><th scope="row">{week.week}</th>
            <td>{week.milliseconds ? minutes(week.milliseconds) : '—'}</td><td>{week.answered}</td>
            {#each week.levels as level}<td
                >{level.scored
                  ? `${level.correct}/${level.scored} (${Math.round((level.correct / level.scored) * 100)}%)`
                  : '—'}</td
              >{/each}
          </tr>{/each}</tbody
      >
    </table>
  </div>
  <p class="muted">
    Assisted correct answers are excluded from these success figures. Weekly fractions use all
    scored answers in that week; the recent-success bars above use their rolling scoring window. A
    dash means no measured time or no scored answers. Initial assessment stays separate as your
    baseline.
  </p>
</section>
