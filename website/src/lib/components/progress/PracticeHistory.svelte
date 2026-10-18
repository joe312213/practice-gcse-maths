<!--
  Purpose: Show measured practice time and weekly success by topic, activity and challenge
  level.

  Main contents:
  - Topic/type filters; current/previous week summary; weekly table.

  Used By: website/src/routes/progress.html/+page.svelte.

  Uses: website/src/lib/domain/practice-history.mjs, website/src/lib/domain/practice-code.mjs.

  Libs: none.
-->
<script>
  import { practiceHistory, practiceWeeks } from '#lib/domain/practice-history.mjs';
  import { SET_LEVELS } from '#lib/domain/practice-code.mjs';
  let { profile, topics } = $props();
  let scope = $state(''),
    mode = $state('plain');
  const history = $derived.by(() => {
    const now = Date.now();
    return { weeks: practiceHistory(profile, scope, mode, now), ...practiceWeeks(now) };
  });
  const weeks = $derived(history.weeks);
  const current = $derived(weeks.find((row) => row.week === history.current));
  const previous = $derived(weeks.find((row) => row.week === history.previous));
  const minutes = (ms) => (ms / 60000).toFixed(1);
</script>

<section class="card page-panel" aria-labelledby="practice-history-title">
  <h2 id="practice-history-title">Practice over time</h2>
  <label
    >Topic <select class="choice-field" bind:value={scope}>
      <option value="">All topics</option>
      {#each topics as topic}<option value={topic.key}>{topic.topic.title}</option>{/each}
    </select></label
  >
  <p>
    <strong>{minutes(current.milliseconds)} minutes</strong> this week ·
    <strong>{minutes(previous.milliseconds)} minutes</strong> last week.
  </p>
  <label
    >Compare success in <select class="choice-field" bind:value={mode}>
      <option value="plain">Independent practice</option><option value="errors"
        >Spot the error</option
      >
    </select></label
  >
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard users need to scroll this wide table on narrow screens.) -->
  <div class="history-table" tabindex="0" role="region" aria-label="Weekly practice history">
    <table>
      <caption>Weekly success: correct / scored answers.</caption>
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
</section>
