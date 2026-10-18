<!--
  Purpose: Supply the topic stage labels and actions to shared chevron steps.

  Main contents:
  - Topic stage labels and callbacks composed through ChevronSteps.

  Used By: website/src/lib/components/practice/TopicPractice.svelte.

  Uses: website/src/lib/components/ui/ChevronSteps.svelte, website/src/lib/domain/stages.mjs.

  Libs: none.
-->
<script>
  import ChevronSteps from '#lib/components/ui/ChevronSteps.svelte';
  import { topicStages } from '#lib/domain/stages.mjs';
  let { bank, mode, onselect, onmeasure } = $props();
  const stages = $derived(topicStages(bank).map(([id, label], index) => ({ id, label, index })));
  const current = $derived(stages.findIndex((stage) => stage.id === mode));
</script>

<ChevronSteps
  {onmeasure}
  items={stages}
  tag="nav"
  class="learning-steps"
  label="Topic learning steps"
>
  {#snippet segment(stage, attributes)}
    {@const split = stage.label.lastIndexOf(' ')}
    <button
      {...attributes}
      class={`action-button ${attributes.class}`}
      type="button"
      data-mode={stage.id}
      class:earlier-stage={stage.index < current}
      aria-current={mode === stage.id ? 'step' : undefined}
      onclick={() => onselect(stage.id)}
    >
      <span class="stage-label"
        ><span class="chevron-measure">{stage.label.slice(0, split)}</span>{' '}<span
          class="chevron-measure">{stage.label.slice(split + 1)}</span
        ></span
      >
    </button>
  {/snippet}
</ChevronSteps>
