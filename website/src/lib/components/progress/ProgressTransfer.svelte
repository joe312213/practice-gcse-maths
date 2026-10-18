<!--
  Purpose: Export or validate and import learner progress, with JSON backup reminders and
  replacement confirmation.

  Main contents:
  - download
  - readFile
  - applyImport

  Used By: website/src/routes/progress.html/+page.svelte.

  Uses: website/src/lib/adapters/progress-ownership.mjs,
  website/src/lib/adapters/progress-file.mjs, website/src/lib/domain/profiles.mjs,
  website/src/lib/domain/progress.mjs, website/src/lib/domain/progress-transfer.mjs.

  Libs: svelte (component state, lifecycle and transitions).
-->
<script>
  import { progressTask } from '#lib/adapters/progress-ownership.mjs';
  import { onMount } from 'svelte';
  import {
    readProgressFile,
    saveProgressFile,
    learnerFileLink,
    chooseProgressFile,
    downloadProgressFile,
    withProgressFileLock,
    newerLinkedProgress,
  } from '#lib/adapters/progress-file.mjs';
  import { progressFilename } from '#lib/domain/profiles.mjs';
  import { backupStatus, recordExport } from '#lib/domain/progress.mjs';
  let backup = $state.raw(null);
  let csvAvailable = $state(false);
  $effect(() => {
    backup = backupStatus(profile);
    csvAvailable = false;
  });
  import { exportProgress, parseProgress, importProgress } from '#lib/domain/progress-transfer.mjs';
  let { profile, store, save, onchange, initialUpdatedAt } = $props();
  let newerFile = $state.raw(null);
  let supported = $state(false),
    busy = $state(false),
    linked = $state.raw(null),
    pendingLink = null;
  onMount(() => {
    supported = 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
  });
  $effect(() => {
    const learner = profile;
    const key = learner?.id ?? learner?.key;
    let cancelled = false;
    linked = null;
    newerFile = null;
    pending = null;
    pendingLink = null;
    if (key)
      learnerFileLink(learner)
        .then(async (value) => {
          if (cancelled) return;
          linked = value;
          const update = await newerLinkedProgress(
            learner,
            value,
            initialUpdatedAt ?? learner.progressUpdatedAt ?? 0,
          );
          if (!cancelled) newerFile = update;
        })
        .catch((error) => {
          if (!cancelled) message = `Could not check your linked file: ${error.message}`;
        });
    return () => {
      cancelled = true;
    };
  });
  async function remember(learner, value) {
    try {
      await learnerFileLink(learner, value);
      return '';
    } catch {
      return ' This browser could not remember the file; choose it again next visit.';
    }
  }
  const fileAction = progressTask(async (open = false) => {
    const learner = profile;
    busy = true;
    message = '';
    try {
      const options = {
        types: [{ description: 'Maths progress', accept: { 'application/json': ['.json'] } }],
      };
      const handle = open
        ? (await window.showOpenFilePicker({ ...options, multiple: false }))[0]
        : (linked?.handle ?? (await chooseProgressFile(learner)));
      // A remembered handle may need permission renewed. Its save path requests access
      // before reading; freshly picked files already carry read permission.
      const file = !open && linked ? null : await readProgressFile(handle);
      if (profile?.key !== learner?.key) return;
      if (open || (!linked && file.raw.trim())) {
        pending = parseProgress(file.raw);
        replace = false;
        pendingLink = { handle, fingerprint: file.fingerprint };
        message =
          'Review this file before using it. Import replaces this browser’s copy; it does not merge results.';
      } else {
        // Ask while handling the user's click, then wait for any finishing automatic write.
        if (
          handle.requestPermission &&
          (await handle.requestPermission({ mode: 'readwrite' })) !== 'granted'
        )
          throw Error('File access was not granted. Choose your progress file again.');
        const { result, reminder } = await withProgressFileLock(learner, async () => {
          const current = linked
            ? await learnerFileLink(learner)
            : { handle, fingerprint: file.fingerprint };
          const result = await saveProgressFile(current, exportProgress(learner));
          return { result, reminder: await remember(learner, result) };
        });
        if (profile?.key !== learner?.key) return;
        linked = result;
        recordExport(learner, 'json');
        delete learner.fileSync;
        save(store);
        backup = backupStatus(learner);
        csvAvailable = true;
        message =
          'Saved to your progress file. Wait for OneDrive to finish syncing before switching computers.' +
          reminder;
      }
    } catch (error) {
      message =
        error.name === 'AbortError'
          ? 'File selection or saving was interrupted. Export JSON below to keep a backup before trying again.'
          : error.message;
    } finally {
      busy = false;
    }
  });
  const forgetFile = progressTask(async () => {
    busy = true;
    const warning = await remember(profile, null);
    if (!warning) linked = null;
    message = warning
      ? 'Could not forget the saved link. Try again.'
      : 'File link forgotten. Your file and browser progress are unchanged.';
    busy = false;
  });
  let pending = $state.raw(null),
    replace = $state(false),
    message = $state('');
  const collision = $derived(
    pending &&
      store.profiles.some(
        (item) => item.key === pending.key || (pending.id && item.id === pending.id),
      ),
  );
  /**
   * Trigger JSON/CSV export; record a backup date only for JSON downloads.
   * Parameter kind: JSON or CSV export format.
   * Calls: exportProgress, exportCsv, recordExport, backupStatus.
   * @example download("json"); // Export a restorable backup and record the reminder date.
   */
  function download(kind) {
    try {
      const json = kind === 'json';
      downloadProgressFile(profile, kind);
      // Browsers expose the download trigger, not whether a file reached cloud storage.
      if (json) {
        recordExport(profile, kind);
        save(store);
        backup = backupStatus(profile);
        csvAvailable = true;
      }
      message = `${kind.toUpperCase()} export started. Save the file to your cloud storage.`;
    } catch (error) {
      message = `Export failed: ${error.message}`;
    }
  }
  /**
   * Read a selected JSON file into a validated pending learner import without mutating storage.
   * Parameter event: DOM event supplied by the bound handler.
   * Calls: parseProgress.
   */
  async function readFile(event) {
    pending = null;
    pendingLink = null;
    replace = false;
    message = '';
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw Error('Choose a progress file smaller than 10 MB.');
      pending = parseProgress(await file.text());
    } catch (error) {
      message = error.message;
    }
    event.target.value = '';
  }
  /**
   * Apply the confirmed pending import, save it and refresh the parent view.
   * Calls: importProgress.
   */
  const applyImport = progressTask(async () => {
    busy = true;
    try {
      const next = JSON.parse(JSON.stringify(store));
      importProgress(next, pending, replace);
      if (save(next) === false)
        throw new Error(
          'Could not save the imported progress. Your existing progress is unchanged; please try again.',
        );
      Object.assign(store, next);
      const importedLearner = store.profiles.find((item) => item.key === store.last);
      const chosenLink = pendingLink;
      const reminder = chosenLink ? await remember(importedLearner, chosenLink) : '';
      onchange();
      linked = chosenLink;
      pendingLink = null;
      pending = null;
      newerFile = null;
      replace = false;
      csvAvailable = false;
      message = 'Progress imported. You’re ready to practise.' + reminder;
    } catch (error) {
      message = error.message;
    } finally {
      busy = false;
    }
  });
</script>

<section class="card page-panel" id="data-transfer" aria-labelledby="transfer-title">
  <h2 id="transfer-title">Save your progress in OneDrive</h2>
  {#if newerFile}
    <p>Your OneDrive file has newer progress. Use it on this computer?</p>
    <p>
      This replaces browser progress, including unfinished pages. Drawings aren’t included in the
      file.
    </p>
    <div class="actions">
      <button
        class="action-button primary"
        disabled={busy}
        onclick={progressTask(async () => {
          try {
            const latest = await readProgressFile(newerFile.link.handle);
            if (latest.fingerprint !== newerFile.link.fingerprint)
              throw Error('The file changed again. Open the latest file before importing.');
            pending = newerFile.imported;
            pendingLink = newerFile.link;
            replace = true;
            await applyImport();
          } catch (error) {
            message = error.message;
          }
        })}>Use file progress</button
      >
      <button
        class="action-button"
        disabled={busy}
        onclick={() => {
          newerFile = null;
          message =
            'Browser progress kept. Your file is unchanged; review it before saving over it.';
        }}>Keep browser progress</button
      >
    </div>
  {/if}
  <p>
    <strong>Recommended for students:</strong> keep your progress file in your college’s synced OneDrive
    folder. Open it before practising on another computer, then save when you finish. This browser keeps
    your working copy.
  </p>
  {#if profile}<p class="progress-file-path">
      Suggested file: <strong>Maths/{progressFilename(profile)}</strong>
    </p>{/if}
  {#if supported}
    {#if !linked}<p>
        Choose your synced OneDrive folder. We create its Maths folder and save your existing
        browser progress there.
      </p>{/if}
    <div class="actions">
      <button
        class="action-button primary"
        disabled={!profile || busy || Boolean(pending)}
        onclick={() => fileAction(false)}
        >{linked ? 'Save progress file' : 'Choose OneDrive folder'}</button
      >
      <button class="action-button" disabled={busy} onclick={() => fileAction(true)}
        >Open progress file</button
      >
      {#if linked}<button class="action-button" disabled={busy} onclick={forgetFile}
          >Forget file link</button
        >{/if}
    </div>
    {#if linked}<p>
        Linked file: {linked.handle.name}. Practice saves automatically at page and stage
        boundaries.
      </p>{/if}
  {:else}
    <p>
      Use Export JSON below. On iPhone, open the download and choose Share → Save to Files →
      OneDrive. Enable OneDrive in the Files app if it is missing. Import the latest file here
      before continuing on another device; this browser cannot save automatically to a linked
      folder.
    </p>
  {/if}
  {#if supported}<p>
      Tab switches and leaving practice also attempt a save. Check any save warning before closing.
      Wait for OneDrive to sync; use one computer at a time. Opening a file still requires your
      review.
    </p>{/if}
  {#if backup}
    <p>
      Last JSON backup: {backup.lastExportAt === null
        ? 'Not yet exported'
        : `${new Date(backup.lastExportAt).toLocaleDateString('en-GB')} (${backup.lastExportType.toUpperCase()})`}
    </p>
    {#if backup.due}<p class="export-reminder" role="status">
        Save a current progress file in your OneDrive folder.
      </p>{/if}
  {/if}
  <h3>Download or import a copy</h3>
  <div class="actions">
    <button class="action-button" disabled={!profile || busy} onclick={() => download('json')}
      >Export JSON</button
    >
  </div>
  {#if csvAvailable}
    <p>Would you also like to save a CSV version to view in Excel?</p>
    <button class="action-button" onclick={() => download('csv')}>Export CSV</button>
  {/if}
  <label for="progress-import">Import progress JSON</label><input
    class="text-field"
    id="progress-import"
    type="file"
    accept=".json,application/json"
    disabled={busy}
    onchange={readFile}
  />
  {#if pending}
    <p>Import progress for <strong>{pending.name}</strong>.</p>
    {#if pending.id && store.profiles.some((item) => item.key === pending.key && item.id && item.id !== pending.id)}<p
      >
        This file has a different learner ID from the browser profile with this name. Confirm
        replacement only if it is yours.
      </p>{/if}
    {#if collision}<label
        ><input type="checkbox" bind:checked={replace} /> Replace this learner's existing progress on
        this browser. Export a backup first if needed.</label
      >{/if}
    <div class="actions">
      <button
        class="action-button primary"
        disabled={busy || (collision && !replace)}
        onclick={applyImport}>Confirm import</button
      ><button
        class="action-button"
        disabled={busy}
        onclick={() => {
          pending = null;
          pendingLink = null;
        }}>Cancel import</button
      >
    </div>
  {/if}
  <p role="status">{message}</p>
</section>

<style>
  .progress-file-path {
    overflow-wrap: anywhere;
  }
</style>
