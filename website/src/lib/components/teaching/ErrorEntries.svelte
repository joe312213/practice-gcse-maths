<!--
  Purpose: Collect the wrong row, reason and correction for each authored error.

  Main contents:
  - update

  Used By: website/src/lib/components/practice/AnswerForm.svelte.

  Uses: website/src/lib/components/ui/WrappingSelect.svelte.

  Libs: none.
-->
<script>
  import WrappingSelect from '../ui/WrappingSelect.svelte';
  let { question, reasons, entries, disabled = false, onchange } = $props();
  /**
   * Replace one error entry field while retaining the other row/reason/correction values.
   * Parameter index: zero-based error-entry position.
   * Parameter field: error-entry field name.
   * Parameter value: selected row number, reason ID or correction text for field.
   */
  function update(index, field, value) {
    const next = question.errors.map((_, i) => ({
      row: null,
      reason: '',
      correction: '',
      ...entries[i],
    }));
    next[index][field] = value;
    onchange(next);
  }
</script>

<div class="error-fields">
  <p>
    Find {question.errors.length === 1 ? 'the independent error' : 'both independent errors'}. For
    each correction, use the working immediately above the selected row. Then solve the original
    equation for the final answer.
  </p>
  {#if question.errors.length > 1}<p>
      Treat each error box separately: use the line as printed, without carrying your earlier
      correction into the next box. In your full solution, correct both errors together.
    </p>{/if}
  {#each question.errors as _, index}
    {@const entry = entries[index] ?? {}}
    <fieldset class="error-entry">
      <legend>Error {index + 1}</legend>
      <label for={`error-row-${index}`}>Row</label>
      <select
        class="choice-field"
        id={`error-row-${index}`}
        data-error-row
        required
        {disabled}
        value={entry.row ?? ''}
        onchange={(event) =>
          update(
            index,
            'row',
            event.currentTarget.value === '' ? null : Number(event.currentTarget.value),
          )}
      >
        <option value="">Choose a row</option>{#each question.balance as _, row}<option value={row}
            >Row {row + 1}</option
          >{/each}
      </select>
      <label for={`error-reason-${index}`}>Reason</label>
      <WrappingSelect
        id={`error-reason-${index}`}
        data-error-reason
        options={reasons.map((reason) => ({ id: reason.id, text: reason.label }))}
        placeholder="Choose a reason"
        {disabled}
        value={entry.reason ?? ''}
        onchange={(value) => update(index, 'reason', value)}
      />
      <label for={`error-step-${index}`}>Corrected step</label>
      <WrappingSelect
        id={`error-step-${index}`}
        data-error-step
        options={question.stepOptions}
        placeholder="Choose the corrected step"
        {disabled}
        value={entry.correction ?? ''}
        onchange={(value) => update(index, 'correction', value)}
      />
    </fieldset>
  {/each}
</div>
