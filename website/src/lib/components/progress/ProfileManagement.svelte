<!--
  Purpose: Explicit local profile controls; saved external files are never deleted or reset
  here.

  Main contents:
  - Rename/reset/delete forms with name confirmation and storage/file-link cleanup.

  Used By: website/src/routes/progress.html/+page.svelte.

  Uses: website/src/lib/adapters/progress-ownership.mjs,
  website/src/lib/domain/profile-management.mjs, website/src/lib/adapters/working-cache.mjs,
  website/src/lib/adapters/progress-file.mjs.

  Libs: bits-ui (accessible dialogs, popovers and choices).
-->
<script>
  import { progressTask } from '#lib/adapters/progress-ownership.mjs';
  import { Dialog } from 'bits-ui';
  import { editProfile } from '#lib/domain/profile-management.mjs';
  import { rekeyWorking } from '#lib/adapters/working-cache.mjs';
  import { learnerFileLink, withProgressFileLock } from '#lib/adapters/progress-file.mjs';
  let { store, profile, onchange } = $props();
  let name = $state(''),
    action = $state('reset'),
    confirmation = $state('');
  let open = $state(false),
    busy = $state(false),
    message = $state(''),
    error = $state('');
  let trigger;
  const apply = progressTask(async (kind) => {
    error = '';
    message = '';
    busy = true;
    try {
      const previous = profile;
      const next = editProfile(store, previous.key, { action: kind, name, confirmation });
      if (kind !== 'rename')
        await withProgressFileLock(previous, () => learnerFileLink(previous, null));
      // The parent persists before replacing the displayed store.
      onchange(next);
      try {
        rekeyWorking(
          sessionStorage,
          previous.key,
          kind === 'rename' ? next.profiles.find((p) => p.id === previous.id).key : null,
        );
      } catch {
        message =
          'The profile changed, but temporary working could not be updated in this browser.';
      }
      if (!message)
        message =
          kind === 'rename'
            ? 'Name updated. Progress kept.'
            : kind === 'reset'
              ? 'Progress reset in this browser. Saved files kept.'
              : 'Profile deleted from this browser. Saved files kept.';
      name = '';
      open = false;
    } catch (cause) {
      error = cause.message;
    } finally {
      busy = false;
    }
  });
</script>

<section class="card page-panel" aria-labelledby="profile-management-title">
  <h2 id="profile-management-title">Manage your profile</h2>
  <p>Student ID: <strong>{profile.studentId}</strong></p>
  <form
    onsubmit={(event) => {
      event.preventDefault();
      apply('rename');
    }}
  >
    <label for="rename-profile">New name for {profile.name}</label>
    <div class="level-row">
      <input id="rename-profile" class="text-field" maxlength="40" required bind:value={name} />
      <button class="action-button" disabled={busy}>Rename profile</button>
    </div>
  </form>
  <div class="level-row">
    {#each ['reset', 'delete'] as kind}<button
        type="button"
        class="action-button"
        disabled={busy}
        onclick={(event) => {
          action = kind;
          confirmation = '';
          error = '';
          trigger = event.currentTarget;
          open = true;
        }}>{kind === 'reset' ? 'Reset progress' : 'Delete profile'}</button
      >{/each}
  </div>
  {#if message}<p role="status">{message}</p>{/if}
  {#if error && !open}<p role="alert">{error}</p>{/if}
</section>
<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content
      class="dialog-panel"
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        trigger?.focus();
      }}
    >
      <Dialog.Title
        >{action === 'reset' ? 'Reset progress' : 'Delete profile'} for {profile.name}?</Dialog.Title
      >
      <Dialog.Description
        >{action === 'reset'
          ? 'Clear maths attempts, assessments, scores and revision records, keeping your name, preferences and other subjects.'
          : 'Remove this learner and their progress from this browser.'} Saved files will be kept and
        unlinked. Close other practice tabs first.</Dialog.Description
      >
      <form
        onsubmit={(event) => {
          event.preventDefault();
          apply(action);
        }}
      >
        <label for="confirm-profile">Type {profile.name} to confirm</label>
        <input
          id="confirm-profile"
          class="text-field"
          autocomplete="off"
          bind:value={confirmation}
        />
        {#if error}<p role="alert">{error}</p>{/if}
        <div class="level-row">
          <button class="action-button primary" disabled={busy || confirmation !== profile.name}
            >{action === 'reset' ? 'Confirm reset' : 'Confirm deletion'}</button
          >
          <Dialog.Close class="action-button" disabled={busy}>Cancel</Dialog.Close>
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
