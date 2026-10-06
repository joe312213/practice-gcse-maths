<script>
  import { Dialog } from 'bits-ui';
  import { onMount, tick, untrack } from 'svelte';
  import {
    encodePracticeSet,
    PAGE_TYPES,
    SET_LEVELS,
    TIMINGS,
  } from '#lib/domain/practice-code.mjs';
  let { catalogue, view, session, title, creatorOpen = $bindable(false), returnFocus } = $props();
  let entries = $state(untrack(() => [{ topic: catalogue.topics[0].code, type: 0, slot: 0 }]));
  let level = $state(0),
    timing = $state(0),
    code = $state(''),
    error = $state('');
  const run = $derived(view.practiceSet);
  const types = (topic) =>
    PAGE_TYPES.filter((type) =>
      catalogue.topics
        .find((item) => item.code === Number(topic))
        ?.pages.some((page) => page.type === type.id),
    );
  onMount(() => {
    const timer = setInterval(() => session.tick(), 1000);
    return () => clearInterval(timer);
  });
  async function action(fn) {
    error = '';
    try {
      fn();
      await tick();
      document.getElementById('stage-title')?.focus();
    } catch (cause) {
      error = cause.message;
    }
  }
  function makeCode() {
    error = '';
    try {
      code = encodePracticeSet({ level, timing, pages: entries });
      creatorOpen = false;
      tick().then(() => document.getElementById('practice-code')?.focus());
    } catch (cause) {
      error = cause.message;
    }
  }
</script>

<section class="intro">
  <div>{@render title()}</div>
  <form
    class="practice-set-code"
    onsubmit={(event) => {
      event.preventDefault();
      action(() => session.startPracticeSet(code));
    }}
  >
    <label for="practice-code">Practice set code (Maths)</label>
    <div class="actions">
      <input
        class="text-field"
        id="practice-code"
        bind:value={code}
        maxlength="9"
        spellcheck="false"
        autocapitalize="off"
        autocomplete="off"
        required
      />
      <button class="action-button primary" type="submit">Start Practice set</button>
      {#if view.savedSet}<button
          class="action-button"
          type="button"
          onclick={() => action(session.resumePracticeSet)}>Resume saved set</button
        >{/if}
    </div>
  </form>
</section>

{#if run}
  <section class="card practice-set-status" aria-label="Current Practice set">
    <h2>
      {run.recommendationId ? 'Recommended practice set' : 'Practice set'} <code>{run.code}</code>
    </h2>
    <p>Page {run.index + 1} of {run.config.pages.length} · {view.bank.title}</p>
    {#if run.finished}<p role="status">
        {run.finished === 'expired'
          ? 'Time is up. Unanswered questions are not scored.'
          : run.recommendationId
            ? 'Well done! Your focused practice will help your grades.'
            : 'Practice set complete.'}
      </p>
    {:else if run.remaining !== null}<p role="timer" aria-live="off">
        Time remaining: {Math.floor(run.remaining / 60)}:{String(run.remaining % 60).padStart(
          2,
          '0',
        )}
      </p>{/if}
    <div class="actions">
      {#if run.index > 0}<button
          class="action-button compact"
          onclick={() => action(() => session.goSetPage(run.index - 1))}>Previous page</button
        >{/if}
      {#if run.index < run.config.pages.length - 1}<button
          class="action-button primary"
          id="next-set-page"
          disabled={run.finished
            ? run.index + 1 >= run.completed.length
            : !view.page.complete || view.page.pendingChoice}
          onclick={() => action(() => session.goSetPage(run.index + 1))}
          >Next Practice set page</button
        >{/if}
      <button class="action-button compact" onclick={() => action(session.leavePracticeSet)}
        >Leave Practice set</button
      >
    </div>
  </section>
{/if}
<Dialog.Root bind:open={creatorOpen}>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content
      class="dialog-panel practice-set-builder"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        if (code) document.getElementById('practice-code')?.focus();
        else returnFocus?.focus();
      }}
    >
      <Dialog.Title>Create a Practice set</Dialog.Title>
      <Dialog.Description
        >Choose 1–4 pages. Saved challenge levels take precedence.</Dialog.Description
      >
      <form
        onsubmit={(event) => {
          event.preventDefault();
          makeCode();
        }}
      >
        <fieldset>
          <legend>Create a Practice set</legend>
          <div class="level-row">
            <label
              >Starting challenge <select class="choice-field" bind:value={level}
                >{#each SET_LEVELS as label, index}<option value={index} disabled={index === 3}
                    >{label}{index === 3 ? ' (not available yet)' : ''}</option
                  >{/each}</select
              ></label
            >
            <label
              >Timing <select class="choice-field" bind:value={timing}
                >{#each TIMINGS as minutes, index}<option value={index}
                    >{minutes ? `${minutes} minutes` : 'Untimed'}</option
                  >{/each}</select
              ></label
            >
          </div>
          {#each entries as entry, index}
            <fieldset class="practice-set-entry">
              <legend>Page {index + 1}</legend>
              <label
                >Topic <select
                  class="choice-field"
                  aria-label={`Page ${index + 1} topic`}
                  bind:value={entry.topic}
                  onchange={() => {
                    entry.type = types(entry.topic)[0].id;
                  }}
                >
                  {#each catalogue.topics as topic}<option value={topic.code}>{topic.title}</option
                    >{/each}
                </select></label
              >
              <label
                >Page type <select
                  class="choice-field"
                  aria-label={`Page ${index + 1} type`}
                  bind:value={entry.type}
                  >{#each types(entry.topic) as type}<option value={type.id}>{type.label}</option
                    >{/each}</select
                ></label
              >
              <label
                >Authored page <select
                  class="choice-field"
                  aria-label={`Page ${index + 1} slot`}
                  bind:value={entry.slot}
                >
                  <option value={0}>Choose randomly</option
                  >{#each Array.from({ length: 15 }, (_, i) => i + 1) as slot}<option value={slot}
                      >{slot}</option
                    >{/each}
                </select></label
              >
              {#if entries.length > 1}<button
                  class="action-button compact"
                  type="button"
                  aria-label={`Remove page ${index + 1}`}
                  onclick={() => entries.splice(index, 1)}>Remove</button
                >{/if}
            </fieldset>
          {/each}
          <p class="muted">
            Page numbers beyond the available pages wrap around to an available page. Variants are
            not fixed by the code.
          </p>
          <div class="actions">
            <button
              class="action-button"
              type="button"
              disabled={entries.length === 4}
              onclick={() => entries.push({ topic: catalogue.topics[0].code, type: 0, slot: 0 })}
              >Add page</button
            >
            <button class="action-button" type="submit">Create code</button>
          </div>
        </fieldset>
      </form>
      <Dialog.Close class="action-button compact">Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
{#if error}<p role="alert" id="practice-set-error">{error}</p>{/if}
