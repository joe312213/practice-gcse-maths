<script>
  let { question, reasons, entries, disabled = false, onchange } = $props();
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
  {#each question.errors as _, index}
    {@const entry = entries[index] ?? {}}
    <fieldset class="error-entry">
      <legend>Error {index + 1}</legend>
      <label for={`error-row-${index}`}>Row</label>
      <select
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
      <select
        id={`error-reason-${index}`}
        data-error-reason
        required
        {disabled}
        value={entry.reason ?? ''}
        onchange={(event) => update(index, 'reason', event.currentTarget.value)}
      >
        <option value="">Choose a reason</option>{#each reasons as reason}<option value={reason.id}
            >{reason.label}</option
          >{/each}
      </select>
      <label for={`error-step-${index}`}>Corrected step</label>
      <select
        id={`error-step-${index}`}
        data-error-step
        required
        {disabled}
        value={entry.correction ?? ''}
        onchange={(event) => update(index, 'correction', event.currentTarget.value)}
      >
        <option value="">Choose the corrected step</option
        >{#each question.stepOptions as step}<option value={step.id}>{step.text}</option>{/each}
      </select>
    </fieldset>
  {/each}
</div>
