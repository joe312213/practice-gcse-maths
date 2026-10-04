<script>
  import { Dialog } from 'bits-ui';
  import { LEVELS } from '#lib/domain/engine.mjs';
  let { open = $bindable(false), progress, catalogue, returnFocus } = $props();
  const activities = [
    ['plain', 'Independent practice'],
    ['errors', 'Spot the error'],
  ];
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content
      class="dialog-panel"
      id="progress-summary"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        returnFocus?.focus();
      }}
    >
      <Dialog.Title>Your progress</Dialog.Title>
      <Dialog.Description>Saved on this browser for your chosen name.</Dialog.Description>
      {#each progress as topic}
        <section>
          <h3>
            {catalogue.topics.find((item) => `${catalogue.subject}:${item.bank}` === topic.key)
              ?.title ?? topic.key}
          </h3>
          <p>{topic.submissions} answers submitted</p>
          <dl class="progress-summary">
            {#each activities as [mode, label]}
              <dt>{label}</dt>
              <dd>
                {topic.tracks[mode]
                  ? `Recommended · ${LEVELS[topic.tracks[mode].level]}`
                  : 'Not started'}
              </dd>
            {/each}
          </dl>
        </section>
      {:else}<p>No practice recorded yet.</p>{/each}
      <p class="muted">
        Recent success and reassessment details appear beside the activity. A combined topic score
        is not available yet.
      </p>
      <Dialog.Close class="action-button compact">Close</Dialog.Close>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
