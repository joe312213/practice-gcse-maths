<script>
  let { rows, limit = rows.length, numbered = false, annotations = [] } = $props();
</script>

<table
  class="balance"
  class:numbered
  aria-label={numbered ? 'Incorrect working, numbered by row' : 'Equation working'}
>
  <tbody>
    {#each rows.slice(0, limit) as row, index}
      <tr data-step={index} class:op={row.kind === 'op'}>
        {#if numbered}<th class="row-number" scope="row"
            ><span class="sr-only">Row </span>{index + 1}</th
          >{/if}
        <td class="lhs">{row.l}</td>
        <!-- Separate segments leave a genuine gap: no background masks the equals sign. -->
        <td class="equals" class:operation={row.kind === 'op'}
          ><span>{row.kind === 'op' ? '' : '='}</span></td
        >
        <td class="rhs">{row.r}</td>
      </tr>
      {#if annotations[index]}<tr class="step-note"
          ><td colspan={numbered ? 4 : 3}>{annotations[index]}</td></tr
        >{/if}
    {/each}
  </tbody>
</table>
