<!--
  Purpose: Offer existing and new browser learners a direct, non-blocking OneDrive setup.
  Uses: portable JSON export and file adapter; host supplies the real learner and persistence callback.
  No automatic picker, file overwrite or account connection; Later lasts for this tab session.
-->
<script>
  import { progressTask } from '#lib/adapters/progress-ownership.mjs';
  import { resolve } from '$app/paths';
  import {
    learnerFileLink,
    chooseProgressFile,
    downloadProgressFile,
    readProgressFile,
    saveProgressFile,
  } from '#lib/adapters/progress-file.mjs';
  import { exportProgress } from '#lib/domain/progress-transfer.mjs';
  import { recordExport } from '#lib/domain/progress.mjs';
  let { profile, onsaved } = $props();
  let visible = $state(false),
    busy = $state(false),
    message = $state(''),
    supported = $state(false);
  $effect(() => {
    const learner = profile;
    let disposed = false;
    visible = false;
    message = '';
    supported = 'showDirectoryPicker' in window || 'showSaveFilePicker' in window;
    let later = false;
    try {
      later = Boolean(sessionStorage.getItem(`maths-onedrive-later:${learner.id}`));
    } catch {
      /* Remain usable without session storage. */
    }
    if (!later)
      learnerFileLink(learner)
        .then((link) => {
          if (!disposed) visible = !link;
        })
        .catch(() => {
          if (!disposed) visible = true;
        });
    return () => {
      disposed = true;
    };
  });
  const setup = progressTask(async () => {
    const learner = profile;
    busy = true;
    message = '';
    try {
      const handle = await chooseProgressFile(learner);
      const file = await readProgressFile(handle);
      if (file.raw.trim())
        throw Error(
          'That progress file already exists. Open it on Progress and review it before replacing anything.',
        );
      const link = await saveProgressFile(
        { handle, fingerprint: file.fingerprint },
        exportProgress(learner),
      );
      recordExport(learner, 'json');
      onsaved();
      try {
        await learnerFileLink(learner, link);
      } catch {
        throw Error(
          'File saved, but this browser could not remember the link. Open it on Progress next time.',
        );
      }
      if (profile.id === learner.id) {
        visible = false;
        message = 'Progress saved in your Maths folder. Wait for OneDrive to finish syncing.';
      }
    } catch (error) {
      message =
        error.name === 'AbortError'
          ? 'Saving was interrupted. No save was confirmed. Download a JSON backup to keep a copy of your current progress.'
          : error.message;
    } finally {
      busy = false;
    }
  });
  function downloadBackup() {
    try {
      downloadProgressFile(profile);
      recordExport(profile, 'json');
      onsaved();
      message =
        'JSON download started. Check the file is saved before closing this tab. In another browser, import it on Progress to continue with the same learner.';
    } catch (error) {
      message = `Download failed: ${error.message}. Keep this tab open; your current progress remains available here.`;
    }
  }
  function later() {
    try {
      sessionStorage.setItem(`maths-onedrive-later:${profile.id}`, '1');
    } catch {
      /* In-memory dismissal still works. */
    }
    visible = false;
  }
</script>

{#if visible}
  <aside class="card page-panel onedrive-reminder" aria-label="Save browser progress to OneDrive">
    {#if supported}
      <p>Choose your OneDrive folder, we'll save your progress in the Maths folder.</p>
    {:else}
      <p>
        Export your progress file, then save it in OneDrive. On iPhone, open the download, choose
        Share → Save to Files and select OneDrive. Enable OneDrive in the Files app if it is
        missing.
      </p>
    {/if}
    <div class="actions">
      {#if supported}<button class="action-button primary" disabled={busy} onclick={setup}
          >Save to OneDrive</button
        >{/if}
      <a class="action-button" href={resolve('/progress.html')}>Open an existing file</a>
      <button class="action-button" disabled={busy} onclick={downloadBackup}
        >{supported ? 'Download backup' : 'Export progress file'}</button
      >
      <button class="action-button" disabled={busy} onclick={later}>Later</button>
    </div>
  </aside>
{/if}
{#if message}<p role="status" class="onedrive-save-result">{message}</p>{/if}
