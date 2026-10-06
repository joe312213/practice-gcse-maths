<!--
  Purpose: Export or validate and import learner progress, with JSON backup reminders and replacement confirmation.

  Main contents:
  - download
  - readFile
  - applyImport

  Used By: website/src/routes/progress.html/+page.svelte

  Uses: website/src/lib/domain/progress.mjs, website/src/lib/domain/progress-transfer.mjs.

  Libs: none.
-->
<script>
  import { backupStatus, recordExport } from '#lib/domain/progress.mjs';
  let backup = $state.raw(null);
  let csvAvailable = $state(false);
  $effect(() => {
    backup = backupStatus(profile);
    csvAvailable = false;
  });
  import {
    exportProgress,
    parseProgress,
    importProgress,
    exportCsv,
  } from '#lib/domain/progress-transfer.mjs';
  let { profile, store, save, onchange } = $props();
  let pending = $state.raw(null),
    replace = $state(false),
    message = $state('');
  const collision = $derived(pending && store.profiles.some((item) => item.key === pending.key));
  /**
   * Trigger JSON/CSV export; record a backup date only for JSON downloads.
   * Parameter kind: JSON or CSV export format.
   * Calls: exportProgress, exportCsv, recordExport, backupStatus.
   * @example download(kind);
   */
  function download(kind) {
    try {
      const json = kind === 'json';
      const blob = new Blob([json ? exportProgress(profile) : exportCsv(profile)], {
        type: json ? 'application/json' : 'text/csv;charset=utf-8',
      });
      const url = URL.createObjectURL(blob),
        link = document.createElement('a');
      link.href = url;
      link.download = `maths-progress.${kind}`;
      try {
        link.click();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
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
  function applyImport() {
    try {
      importProgress(store, pending, replace);
      save(store);
      onchange();
      pending = null;
      replace = false;
      csvAvailable = false;
      message = 'Progress imported.';
    } catch (error) {
      message = error.message;
    }
  }
</script>

<section class="card" id="data-transfer" aria-labelledby="transfer-title">
  <h2 id="transfer-title">Export or import progress</h2>
  {#if backup}
    <p>
      Last JSON backup: {backup.lastExportAt === null
        ? 'Not yet exported'
        : `${new Date(backup.lastExportAt).toLocaleDateString('en-GB')} (${backup.lastExportType.toUpperCase()})`}
    </p>
    {#if backup.due}<p class="export-reminder" role="status">
        It has been 10 days or longer without a JSON backup. Export your progress to your cloud
        storage. Choose JSON to keep a restorable copy.
      </p>{/if}
  {/if}
  <p>
    JSON includes your username, results, levels and revision records. Import restores these, but
    not partly completed page attempts or drawings. CSV contains submitted-answer history.
  </p>
  <div class="actions">
    <button class="action-button" disabled={!profile} onclick={() => download('json')}
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
    onchange={readFile}
  />
  {#if pending}
    <p>Import progress for <strong>{pending.name}</strong>.</p>
    {#if collision}<label
        ><input type="checkbox" bind:checked={replace} /> Replace this learner's existing progress on
        this browser. Export a backup first if needed.</label
      >{/if}
    <div class="actions">
      <button class="action-button primary" disabled={collision && !replace} onclick={applyImport}
        >Confirm import</button
      ><button class="action-button" onclick={() => (pending = null)}>Cancel import</button>
    </div>
  {/if}
  <p role="status">{message}</p>
</section>
