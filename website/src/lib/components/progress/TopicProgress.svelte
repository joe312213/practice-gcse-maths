<!--
  Purpose: Present topic revision priority and per-level, per-question-type success breakdowns.

  Main contents:
  - date

  Used By: website/src/routes/progress.html/+page.svelte

  Uses: website/src/lib/domain/practice-code.mjs.

  Libs: bits-ui (dialog/popover interaction).
-->
<script>
  import { Popover } from 'bits-ui';
  import { SET_LEVELS } from '#lib/domain/practice-code.mjs';
  let { row } = $props();
  let openLevel = $state(null);
  /**
   * Format a timestamp in UK date format, or the unpractised label for null.
   * Parameter value: new value to apply or validate.
   */
  const date = (value) =>
    value === null ? 'Not yet practised' : new Date(value).toLocaleDateString('en-GB');
</script>

<article class="card topic-progress" class:stale={row.stale} data-priority={row.status}>
  <div>
    <h2>{row.topic.title}</h2>
    <p>Last practised: {date(row.last)}</p>
    <p>{row.total} questions answered</p>
  </div>
  <div>
    <div class="challenge-stages" aria-label={`${row.topic.title} success by challenge level`}>
      {#each row.stages as stage}
        <Popover.Root
          open={openLevel === stage.level}
          onOpenChange={(open) => (openLevel = open ? stage.level : null)}
        >
          <Popover.Trigger
            class="challenge-stage"
            onpointerenter={(event) => {
              if (event.pointerType === 'mouse') openLevel = stage.level;
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
              class="theme-menu progress-breakdown"
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
      {/each}
    </div>
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
