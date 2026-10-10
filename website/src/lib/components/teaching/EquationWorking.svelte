<!--
  Purpose: Render balanced equation rows and their staged reveal state.

  Main contents:
  - Component markup, input props and event bindings.

  Used By: website/src/lib/components/practice/Feedback.svelte, website/src/lib/components/practice/PracticeActivity.svelte, website/src/lib/components/teaching/DemoPlayer.svelte

  Uses: no local module imports.

  Libs: none.
-->
<script>
  let {
    rows,
    limit = rows.length,
    numbered = false,
    annotations = [],
    staged = false,
    part = 3,
    guideProgress = 1,
  } = $props();
</script>

<table
  class="balance"
  style:--guide-height={`${guideProgress * 100}%`}
  class:numbered
  class:annotated={annotations.length > 0}
  aria-label={numbered ? 'Incorrect working, numbered by row' : 'Equation working'}
>
  <colgroup>
    {#if annotations.length}<col class="annotation-column" />{/if}
    {#if numbered}<col />{/if}
    <col /><col class="equation-divider" /><col />
  </colgroup>
  <tbody>
    {#each rows.slice(0, staged ? rows.length : limit) as row, index}
      {@const visible = index < limit - 1 ? 3 : index === limit - 1 ? part : 0}
      <tr
        data-step={index < limit ? index : undefined}
        data-demo-current={staged && index === limit - 1 ? '' : undefined}
        class:op={row.kind === 'op'}
      >
        {#if annotations.length}<td class="step-note" class:unwritten={visible < 1}
            ><span>{annotations[index] ?? ''}</span></td
          >{/if}
        {#if numbered}<th class="row-number" scope="row"
            ><span class="sr-only">Row </span>{index + 1}</th
          >{/if}
        <td class="lhs" class:unwritten={visible < 1}><span>{row.l}</span></td>
        <!-- The column paints one continuous line behind the transparent equation cells. -->
        <td class="equals" class:unwritten={visible < 2} class:operation={row.kind === 'op'}
          ><span>{row.kind === 'op' ? '' : '='}</span></td
        >
        <td class="rhs" class:unwritten={visible < 3}><span>{row.r}</span></td>
      </tr>
    {/each}
  </tbody>
</table>
