<!-- Render authored wrong working as selectable diagram regions or named working lines. -->
<script>
  import { onMount } from 'svelte';
  import { asset } from '$app/paths';
  import ArithmeticWorking from './ArithmeticWorking.svelte';
  import MathText from './MathText.svelte';
  import {
    investigationLattice,
    markerPath,
    workingText,
  } from '#lib/application/error-working.mjs';
  let { question, selected, entries, disabled, onselect } = $props();
  let font = $state(null);
  onMount(() => {
    const abort = new AbortController();
    fetch(asset('handwriting/pacifico-maths.json'), { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Font unavailable');
        return response.json();
      })
      .then((data) => {
        font = data;
      })
      .catch(() => {
        /* Keep ordinary maths readable if the optional handwriting fails. */
      });
    return () => abort.abort();
  });
  const lattice = $derived(
    question.diagram?.kind === 'lattice' ? investigationLattice(question) : null,
  );
  const bus = $derived(question.diagram?.kind === 'bus-stop' ? question.diagram : null);
  const active = (id) => selected === id || entries.some((entry) => entry.location === id);
  // Authored IDs link diagram targets to working lines; labels can be edited freely.
  const busLocation = (column, transfer = false) =>
    question.locations.find(
      (location) => location.id === (transfer ? column.transferLocation : column.workingLocation),
    );
</script>

{#snippet selectionNumber(id)}
  {@const number = entries.findIndex((entry) => entry.location === id) + 1}
  {#if number}<span class="location-number" aria-hidden="true">{number}</span>{/if}
{/snippet}

{#snippet line(location)}
  <button
    type="button"
    class="working-location working-line"
    {disabled}
    data-location={location.id}
    aria-label={`${location.label}: ${location.text}`}
    aria-pressed={active(location.id)}
    onclick={() => onselect(location.id)}
  >
    <span class="working-line-label">{location.label}</span>
    <span class="working-line-content">
      {#if active(location.id)}<svg
          class="line-marker"
          viewBox="0 0 300 60"
          preserveAspectRatio="none"
          aria-hidden="true"
          ><path
            class="working-marker"
            d={markerPath({ x: 0, y: 0, width: 300, height: 60 }, selected === location.id)}
          /></svg
        >{/if}
      <span class="working-expression"><MathText text={workingText(location.text)} {font} /></span>
    </span>
    {@render selectionNumber(location.id)}
  </button>
{/snippet}

<div class="error-working investigation-paper">
  {#if lattice}
    <div class="investigation-diagram-scroll">
      <div style={`min-width:${(lattice.width * 44) / 50}px`}>
        <ArithmeticWorking
          question={{
            ...question,
            method: 'lattice',
            a: question.diagram.a,
            b: question.diagram.b,
            q: `${question.diagram.a} × ${question.diagram.b}`,
          }}
          {font}
          working={{}}
          authoredModel={lattice}
          compact
          selectedLocation={selected}
          {entries}
          selectionDisabled={disabled}
          {onselect}
        />
      </div>
    </div>
    {@render line(question.locations.find((location) => location.id === 'answer-read-off'))}
    <details class="investigation-working-details">
      <summary>Working details</summary>
      {#each question.locations.filter((location) => location.id !== 'answer-read-off') as location}{@render line(
          location,
        )}{/each}
    </details>
  {:else}
    {#if bus}
      <div class="investigation-diagram-scroll">
        <div
          class="investigation-bus"
          style={`grid-template-columns:3rem repeat(${bus.columns.length}, minmax(2.75rem, 1fr))`}
          aria-label="Student bus stop working"
        >
          <span></span>
          {#each bus.columns as column}
            {@const location = busLocation(column)}
            <button
              type="button"
              class="working-location bus-quotient"
              {disabled}
              data-location={location?.id}
              aria-label={location?.label}
              aria-pressed={active(location?.id)}
              onclick={() => location && onselect(location.id)}
            >
              {#if active(location?.id)}<svg
                  class="line-marker"
                  viewBox="0 0 60 60"
                  aria-hidden="true"
                  ><path
                    class="working-marker"
                    d={markerPath({ x: 0, y: 0, width: 60, height: 60 }, false)}
                  /></svg
                >{/if}
              <span><MathText text={column.quotientDigit} {font} /></span>
              {@render selectionNumber(location.id)}
            </button>
          {/each}
          <span class="bus-divisor"><MathText text={bus.divisor} {font} /></span>
          {#each bus.columns as column, index}
            {@const location = busLocation(column, true)}
            <button
              type="button"
              class="working-location bus-dividend"
              class:bus-first={index === 0}
              {disabled}
              data-location={location.id}
              aria-label={location.label}
              aria-pressed={active(location.id)}
              onclick={() => onselect(location.id)}
            >
              {#if active(location.id)}<svg
                  class="line-marker"
                  viewBox="0 0 60 60"
                  aria-hidden="true"
                  ><path
                    class="working-marker"
                    d={markerPath({ x: 0, y: 0, width: 60, height: 60 }, false)}
                  /></svg
                >{/if}
              <span
                >{#if column.previousRemainder}<sup
                    ><MathText text={column.previousRemainder} {font} /></sup
                  >{/if}<MathText text={column.digit} {font} /></span
              >
              {@render selectionNumber(location.id)}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    {#each question.locations as location}{@render line(location)}{/each}
  {/if}
</div>
