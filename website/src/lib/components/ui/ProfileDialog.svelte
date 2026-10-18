<!--
  Purpose: Choose or create a local learner profile with explicit similar-name confirmation.

  Main contents:
  - submit

  Used By: website/src/lib/components/practice/TopicPractice.svelte.

  Uses: no local module imports.

  Libs: bits-ui (accessible dialogs, popovers and choices), $app/paths (SvelteKit
  navigation/route state).
-->
<script>
  import { Dialog } from 'bits-ui';
  import { resolve } from '$app/paths';
  let { open = $bindable(false), chooseName, returnFocus, onanonymous } = $props();
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
  /**
   * Submit the component's current form and update feedback/focus.
   * Parameter event: DOM event supplied by the bound handler.
   */
  async function submit(event) {
    event.preventDefault();
    try {
      const result = await chooseName(name, pending === name);
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
      <Dialog.Description
        >Enter a name to keep progress beyond this visit, or use your saved student ID. A name is
        optional.</Dialog.Description
      >
      <form id="profile-form" onsubmit={submit}>
        <label for="username">Your name or student ID</label>
        <input
          id="username"
          class="text-field"
          bind:value={name}
          maxlength="40"
          autocomplete="off"
          required
        />
        <p id="profile-message" role="status">{message}</p>
        <div id="profile-matches">
          {#each matches as match}<button
              class="action-button"
              type="button"
              data-name={match}
              onclick={async () => {
                await chooseName(match);
                open = false;
              }}>Use {match}</button
            >{/each}
        </div>
        <button class="action-button" type="submit">Continue</button>
        {#if onanonymous}<button
            class="action-button"
            type="button"
            onclick={() => {
              onanonymous();
              open = false;
            }}>Continue without a name</button
          >{/if}
        <Dialog.Close class="action-button" id="profile-cancel">Cancel</Dialog.Close>
      </form>
      <p>
        Recommended: keep your progress file in your college’s synced OneDrive folder. Returning on
        another computer? <a href={resolve('/progress.html')}>Open your progress file</a> before practising.
        New students can set up their file on Progress after choosing a name.
      </p>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
