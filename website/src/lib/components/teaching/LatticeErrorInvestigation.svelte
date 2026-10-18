<!--
  Purpose: Prototype interaction: shared generated lattice, editable diagnoses and explicit
  final checking.

  Main contents:
  - choose, toggle, record, remove, isConsequence, reset.

  Used By: website/src/routes/spot-errors.html/+page.svelte.

  Uses: website/src/lib/components/teaching/ArithmeticWorking.svelte,
  website/src/lib/components/ui/WrappingSelect.svelte,
  website/src/lib/application/arithmetic-demo.mjs, website/src/lib/domain/errors.mjs.

  Libs: svelte (component state, lifecycle and transitions).
-->
<script>
  import { tick } from 'svelte';
  import ArithmeticWorking from './ArithmeticWorking.svelte';
  import WrappingSelect from '../ui/WrappingSelect.svelte';
  import { latticeModel } from '#lib/application/arithmetic-demo.mjs';
  import { markInvestigation } from '#lib/domain/errors.mjs';
  let { question, options } = $props();
  let selected = $state(''),
    showLocations = $state(false),
    entries = $state([]),
    answer = $state(''),
    result = $state(null);
  let root;
  const model = $derived(latticeModel(question.a, question.b, question.working));
  const correct = $derived(latticeModel(question.a, question.b));
  const region = $derived(model.regions.find((region) => region.id === selected));
  const entry = $derived(entries.find((entry) => entry.location === selected));
  const checkedEntry = $derived(result?.details.find((detail) => detail.location === selected));
  const sorted = $derived(
    model.regions.flatMap((region) => entries.filter((entry) => entry.location === region.id)),
  );
  const label = (id) => model.regions.find((region) => region.id === id).label;
  // Diagnosis is about the original printed working; selection never mutates that working.
  function choose(location) {
    selected = location;
  }
  function toggle(location) {
    if (selected === location || entries.some((entry) => entry.location === location)) {
      entries = entries.filter((entry) => entry.location !== location);
      if (selected === location) selected = '';
      result = null;
    } else choose(location);
  }
  function record(reason) {
    if (!reason) return;
    entries = [
      ...entries.filter((entry) => entry.location !== selected),
      { location: selected, reason },
    ];
    result = null;
  }
  async function remove(location) {
    entries = entries.filter((entry) => entry.location !== location);
    if (selected === location) selected = '';
    result = null;
    await tick();
    root.querySelector(`[data-location="${location}"]`)?.focus();
  }
  function isConsequence(location) {
    if (location.startsWith('cell:')) {
      const [, row, col] = location.split(':').map(Number);
      const value = (model) =>
        model.cells.find((cell) => cell.row === row && cell.col === col).value;
      return value(model) !== value(correct);
    }
    if (!location.startsWith('diagonal:')) return false;
    const index = Number(location.split(':')[1]);
    return ['digit', 'incoming', 'sum'].some(
      (key) => model.diagonals[index][key] !== correct.diagonals[index][key],
    );
  }
  function reset() {
    showLocations = false;
    entries = [];
    selected = '';
    answer = '';
    result = null;
  }
</script>

<div class="error-investigation" bind:this={root}>
  <h2>Work out {question.q}</h2>
  <p>Check the working, find the error(s). Click/tap where you find them and choose the reason.</p>
  <div class="error-investigation-workspace">
    <div>
      <div class="error-working lattice-error-paper">
        <ArithmeticWorking
          {question}
          working={question.working}
          compact
          selectedLocation={selected}
          entries={sorted}
          onselect={toggle}
        />
      </div>
      <button
        type="button"
        class="action-button quiet"
        aria-expanded={showLocations}
        aria-controls="investigation-location-panel"
        onclick={() => (showLocations = !showLocations)}>Choose by location</button
      >
      <div id="investigation-location-panel" hidden={!showLocations}>
        <label for="investigation-location">Location</label>
        <WrappingSelect
          id="investigation-location"
          options={model.regions.map((region) => ({ id: region.id, text: region.label }))}
          value={selected}
          placeholder="Choose a location"
          required={false}
          onchange={choose}
        />
      </div>
    </div>
    <div>
      {#if region}
        <h3>Selected: {region.label}</h3>
        <label class="sr-only" for="investigation-reason">Reason</label>
        <WrappingSelect
          id="investigation-reason"
          data-answer-result={checkedEntry
            ? checkedEntry.reasonCorrect
              ? 'correct'
              : 'incorrect'
            : undefined}
          options={options[region.kind]}
          value={entry?.reason ?? ''}
          placeholder="Choose an explanation and repair"
          required={false}
          onchange={record}
        />
      {/if}
      <h3>Your selected errors</h3>
      {#if sorted.length}
        <ol class="error-selection-list" aria-label="Your selected errors">
          {#each sorted as entry}
            {@const area = model.regions.find((region) => region.id === entry.location)}
            {@const checked = result?.details.find((detail) => detail.location === entry.location)}
            <li
              class="answer-result"
              data-answer-result={checked
                ? checked.reasonCorrect
                  ? 'correct'
                  : 'incorrect'
                : undefined}
            >
              <button
                class="action-button quiet"
                type="button"
                onclick={() => choose(entry.location)}
                aria-pressed={selected === entry.location}>Edit: {label(entry.location)}</button
              >
              <p>{options[area.kind].find((option) => option.id === entry.reason).text}</p>
              {#if checked}<p>
                  <strong>{checked.reasonCorrect ? 'Correct' : 'Needs correction'}</strong>
                </p>{/if}
              <button
                class="action-button compact"
                type="button"
                aria-label={`Remove ${label(entry.location)}`}
                onclick={() => remove(entry.location)}>Remove</button
              >
            </li>
          {/each}
        </ol>
      {:else}<p>No errors selected yet.</p>{/if}
      <span class="sr-only" aria-live="polite"
        >{entries.length} {entries.length === 1 ? 'location recorded' : 'locations recorded'}.</span
      >
      <form
        onsubmit={(event) => {
          event.preventDefault();
          result = markInvestigation(question, sorted, answer);
        }}
      >
        <label for="investigation-answer">Corrected answer</label>
        <input
          id="investigation-answer"
          class="text-field answer-result corrected-answer-field"
          data-answer-result={result ? (result.answerCorrect ? 'correct' : 'incorrect') : undefined}
          inputmode="numeric"
          autocomplete="off"
          required
          value={answer}
          oninput={(event) => {
            answer = event.currentTarget.value;
            result = null;
          }}
        />
        <div class="actions">
          <button class="action-button primary" type="submit">Check answer</button>
          <button class="action-button" type="button" onclick={reset}>Start again</button>
        </div>
      </form>
      {#if result}
        <div
          class="feedback"
          class:correct={result.correct}
          class:incorrect={!result.correct}
          role="status"
          data-investigation-result={result.correct ? 'correct' : 'revise'}
        >
          {#if result.correct}<p>
              Correct. You found the method mistakes and calculated the corrected answer.
            </p>
          {:else}
            {#each result.details as detail}
              {#if !detail.locationCorrect}<p>
                  <strong>{label(detail.location)}:</strong>
                  {isConsequence(detail.location)
                    ? 'This follows from an earlier mistake. Select the place where that mistake began.'
                    : 'There is no independent method mistake here. Remove this selection.'}
                </p>
              {:else if !detail.reasonCorrect}<p>
                  <strong>{label(detail.location)}:</strong>
                  There is a mistake here. Reconsider its explanation and repair.
                </p>{/if}
            {/each}
            {#if result.missing}<p>There is still a method mistake to find.</p>{/if}
            <p>
              {result.answerCorrect
                ? 'Your corrected answer is right.'
                : result.answerValid
                  ? 'Recheck your corrected calculation.'
                  : 'Enter a valid number for the corrected answer.'}
            </p>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>
