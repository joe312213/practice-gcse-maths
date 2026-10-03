<script>
  import { Dialog } from 'bits-ui';
  let { open = $bindable(false), chooseName, returnFocus } = $props();
  let name = $state(''),
    pending = $state(null),
    message = $state(''),
    matches = $state([]);
  $effect(() => {
    if (open) {
      name = '';
      pending = null;
      message = '';
      matches = [];
    }
  });
  function submit(event) {
    event.preventDefault();
    try {
      const result = chooseName(name, pending === name);
      if (result.profile) {
        open = false;
        return;
      }
      pending = name;
      matches = result.matches;
      message =
        'Check for typos. If this is the name you want, select Continue again to create a new profile.';
    } catch (error) {
      message = error.message;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content
      id="profile-dialog"
      class="dialog-panel"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        returnFocus?.focus();
      }}
    >
      <Dialog.Title>Your practice, your progress</Dialog.Title>
      <Dialog.Description>Choose a name to keep your progress on this device.</Dialog.Description>
      <form id="profile-form" onsubmit={submit}>
        <label for="username">Your name</label>
        <input
          id="username"
          class="answer-input"
          bind:value={name}
          maxlength="40"
          autocomplete="off"
          required
        />
        <p id="profile-message" role="status">{message}</p>
        <div id="profile-matches">
          {#each matches as match}<button
              type="button"
              data-name={match}
              onclick={() => {
                chooseName(match);
                open = false;
              }}>Use {match}</button
            >{/each}
        </div>
        <button type="submit">Continue</button>
        <Dialog.Close id="profile-cancel">Cancel</Dialog.Close>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
