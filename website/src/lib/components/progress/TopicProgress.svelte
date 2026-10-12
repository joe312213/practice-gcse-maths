<!--
  Purpose: Present topic revision priority and per-level, per-question-type success breakdowns.

  Main contents:
  - date

  Used By: website/src/routes/progress.html/+page.svelte

  Uses: website/src/lib/domain/practice-code.mjs.

  Libs: bits-ui (dialog/popover interaction).
-->
<script>
  import ChevronSteps from '#lib/components/ui/ChevronSteps.svelte';
  import { Popover } from 'bits-ui';
  import { topicPath } from '#lib/content/topic-routes.mjs';
  import { resolve } from '$app/paths';
  import { onDestroy } from 'svelte';
  import { SET_LEVELS } from '#lib/domain/practice-code.mjs';
  let { row, openBreakdown = $bindable(null) } = $props();
  const stages = $derived(row.stages.map((stage) => ({ ...stage, id: stage.level })));
  let closeTimer;
  let hovering = false;
  const key = (level) => `${row.key}:${level}`;
  function cancelClose() {
    clearTimeout(closeTimer);
  }
  function leave(level) {
    cancelClose();
    closeTimer = setTimeout(() => {
      if (openBreakdown === key(level)) openBreakdown = null;
    }, 180);
  }
  onDestroy(cancelClose);
  /**
   * Format a timestamp in UK date format, or the unpractised label for null.
   * Parameter value: epoch milliseconds, or null when no practice is recorded.
   */
  const date = (value) =>
    value === null ? 'Not yet practised' : new Date(value).toLocaleDateString('en-GB');
</script>

<article class="card page-panel topic-progress" class:stale={row.stale} data-priority={row.status}>
  <div>
    <h2><a href={resolve(topicPath(row.topic.bank))}>{row.topic.title}</a></h2>
    <p>Last practised: {date(row.last)}</p>
    <p>{row.total} questions answered</p>
    {#if row.baseline}<p class="assessment-baseline">
        <strong>Initial assessment:</strong>
        {row.baseline.correct}/{row.baseline.answered} correct · {date(row.baseline.at)}{row
          .baseline.complete
          ? ''
          : ` · incomplete (${row.baseline.size} questions in total)`}
      </p>{:else}<p>Initial assessment: not yet recorded.</p>{/if}
  </div>
  <div>
    <ChevronSteps
      items={stages}
      class="challenge-stages"
      wrap={false}
      label={`${row.topic.title} success by challenge level`}
    >
      {#snippet segment(stage, attributes)}
        <Popover.Root
          open={openBreakdown === key(stage.level)}
          onOpenChange={(open) => {
            if (open) openBreakdown = key(stage.level);
            else if (openBreakdown === key(stage.level)) openBreakdown = null;
          }}
        >
          <Popover.Trigger
            {...attributes}
            class={`action-button challenge-stage ${attributes.class}`}
            onpointerenter={(event) => {
              if (event.pointerType === 'mouse') {
                cancelClose();
                hovering = true;
                openBreakdown = key(stage.level);
              }
            }}
            onpointerleave={(event) => {
              if (event.pointerType === 'mouse') leave(stage.level);
            }}
            onkeydown={() => {
              hovering = false;
              cancelClose();
            }}
          >
            <span>{SET_LEVELS[stage.level]}</span>
            <progress
              class="progress-meter"
              max="100"
              value={stage.rate ?? 0}
              aria-label={`${SET_LEVELS[stage.level]} recent success`}
            ></progress>
            <span>{stage.rate === null ? 'No data' : `${stage.rate.toFixed(1)}%`}</span>
          </Popover.Trigger>
          <Popover.Portal
            ><Popover.Content
              class="popover-panel progress-breakdown"
              onpointerenter={cancelClose}
              onpointerleave={(event) => {
                if (event.pointerType === 'mouse') leave(stage.level);
              }}
              onOpenAutoFocus={(event) => {
                if (hovering) event.preventDefault();
              }}
              onCloseAutoFocus={(event) => {
                if (hovering) event.preventDefault();
              }}
              sideOffset={8}
              collisionPadding={16}
              aria-label={`${SET_LEVELS[stage.level]} question type breakdown`}
            >
              <h3>{SET_LEVELS[stage.level]} · {row.topic.title}</h3>
              {#each stage.breakdown as item}<p>
                  <strong>{item.label}</strong><br />{item.rate === null
                    ? 'No scored data'
                    : `${item.rate.toFixed(1)}% recent success`} · {item.answered} questions answered
                  ({item.count} scored){item.missing ? ' · missing data' : ''}
                </p>{/each}
              <Popover.Close class="action-button compact">Close</Popover.Close>
            </Popover.Content></Popover.Portal
          >
        </Popover.Root>
      {/snippet}
    </ChevronSteps>
    {#if row.missing}<p>Missing data - do some practice to assess revision priority</p>
    {:else}<p>
        {row.rate.toFixed(1)}% at recommended levels · {row.status === 'red'
          ? 'Revision priority: high'
          : row.status === 'amber'
            ? 'Revision priority: practise more'
            : 'Recent success: strong'}
      </p>{/if}
    {#if row.stale}<p>Stale data - practice now to check you still have the skills</p>{/if}
  </div>
</article>
