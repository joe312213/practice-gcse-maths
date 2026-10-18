<!--
  Purpose: Controlled live diagnoses; transient selection stays mounted while session drafts
  change.

  Main contents:
  - toggle, remove, record.

  Used By: website/src/lib/components/practice/AnswerForm.svelte.

  Uses: website/src/lib/components/teaching/InvestigationWorking.svelte,
  website/src/lib/components/ui/WrappingSelect.svelte,
  website/src/lib/components/teaching/MathText.svelte,
  website/src/lib/application/error-working.mjs.

  Libs: svelte (component state, lifecycle and transitions).
-->
<script>
  import { tick } from 'svelte';
  import InvestigationWorking from './InvestigationWorking.svelte';
  import WrappingSelect from '../ui/WrappingSelect.svelte';
  import MathText from './MathText.svelte';
  import { workingText } from '#lib/application/error-working.mjs';
  let { question, entries, response, onchange } = $props();
  let selected = $state(''),
    showLocations = $state(false),
    root;
  const sorted = $derived(
    question.locations.flatMap((location) =>
      entries.filter((entry) => entry.location === location.id),
    ),
  );
  const region = $derived(question.locations.find((location) => location.id === selected));
  const entry = $derived(entries.find((entry) => entry.location === selected));
  const checked = (id) => response?.details?.find((detail) => detail.location === id);
  const result = (id) =>
    checked(id) ? (checked(id).reasonCorrect ? 'correct' : 'incorrect') : undefined;
  const label = (id) => question.locations.find((location) => location.id === id)?.label;
  function toggle(location) {
    if (response) return;
    if (selected === location || entries.some((entry) => entry.location === location)) {
      onchange(entries.filter((entry) => entry.location !== location));
      if (selected === location) selected = '';
    } else selected = location;
  }
  async function remove(location) {
    onchange(entries.filter((entry) => entry.location !== location));
    if (selected === location) selected = '';
    await tick();
    root.querySelector(`[data-location="${location}"]`)?.focus();
  }
  function record(reason) {
    if (reason)
      onchange([
        ...entries.filter((entry) => entry.location !== selected),
        { location: selected, reason },
      ]);
  }
</script>

<div class="error-investigation live-investigation" bind:this={root}>
  <InvestigationWorking
    {question}
    {selected}
    entries={sorted}
    disabled={Boolean(response)}
    onselect={toggle}
  />
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
      options={question.locations.map((location) => ({ id: location.id, text: location.label }))}
      value={selected}
      placeholder="Choose a location"
      required={false}
      disabled={Boolean(response)}
      onchange={(id) => (selected = id)}
    />
  </div>
  {#if region && !response}
    <h4>Selected: {region.label}</h4>
    {#if question.diagram?.kind === 'lattice'}<p>
        <MathText text={workingText(region.text)} />
      </p>{/if}
    <label class="sr-only" for="investigation-reason">Reason</label>
    <WrappingSelect
      id="investigation-reason"
      options={question.options}
      value={entry?.reason ?? ''}
      placeholder="Choose a reason"
      required={false}
      disabled={Boolean(response)}
      data-answer-result={result(selected)}
      onchange={record}
    />
  {/if}
  {#if sorted.length}
    <ol class="error-selection-list" aria-label="Your selected errors">
      {#each sorted as entry}
        <li class="answer-result" data-answer-result={result(entry.location)}>
          <button
            class="action-button quiet"
            type="button"
            onclick={() => (selected = entry.location)}
            aria-pressed={selected === entry.location}
            >{response ? '' : 'Edit: '}{label(entry.location)}</button
          >
          <p>{question.options.find((option) => option.id === entry.reason)?.text}</p>
          {#if response}<p>
              <strong
                >{checked(entry.location)?.reasonCorrect ? 'Correct' : 'Needs correction'}</strong
              >
            </p>
          {:else}<button
              type="button"
              class="action-button compact"
              aria-label={`Remove ${label(entry.location)}`}
              onclick={() => remove(entry.location)}>Remove</button
            >{/if}
        </li>
      {/each}
    </ol>
  {/if}
  <span class="sr-only" aria-live="polite"
    >{entries.length} {entries.length === 1 ? 'location recorded' : 'locations recorded'}.</span
  >
</div>
