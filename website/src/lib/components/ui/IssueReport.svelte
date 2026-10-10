<!-- Reviewable report draft, following the T-Level report workflow; sending belongs to the email app. -->
<script>
  import { Dialog } from 'bits-ui';
  import { makeReport, emailURL } from '#lib/domain/issue-report.mjs';
  let { question = null, topic = '' } = $props();
  let open = $state(false),
    kind = $state('bug'),
    description = $state(''),
    context = $state({}),
    status = $state(''),
    preview;
  const report = $derived(makeReport(context, kind, description));
  function prepare() {
    context = {
      page: location.href,
      topic,
      question: question ? `${question.id}: ${question.q}` : '',
      browser: navigator.userAgent,
      time: new Date().toISOString(),
    };
    description = '';
    status = '';
    kind = 'bug';
  }
  async function submit(event) {
    event.preventDefault();
    if (!description.trim()) {
      status = 'Please describe the issue.';
      return;
    }
    if (event.submitter?.value === 'email') {
      location.href = emailURL(report);
      status =
        'Email draft opened. Review it, enter your teacher’s address and send it from your email app.';
    } else {
      try {
        await navigator.clipboard.writeText(report.body);
        status = 'Report copied. Paste it into your email.';
      } catch {
        preview.focus();
        preview.select();
        status = 'Copy the selected report text.';
      }
    }
  }
</script>

<Dialog.Root
  bind:open
  onOpenChange={(value) => {
    if (value) prepare();
  }}
>
  <Dialog.Trigger class="action-button quiet">Report an issue</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay class="dialog-overlay" />
    <Dialog.Content class="dialog-panel" id="issue-report">
      <Dialog.Title>Report an issue</Dialog.Title>
      <Dialog.Description
        >Describe what happened and what you expected. Review the report before sharing it.</Dialog.Description
      >
      <form onsubmit={submit}>
        <label for="report-kind">Issue type</label>
        <select id="report-kind" class="choice-field" bind:value={kind}
          ><option value="bug">Something is not working</option><option value="content"
            >Question or answer issue</option
          ></select
        >
        <label for="report-description">Describe the issue</label>
        <textarea
          id="report-description"
          class="text-field"
          rows="4"
          maxlength="1500"
          required
          bind:value={description}></textarea>
        <label for="report-preview">Report preview</label>
        <textarea
          id="report-preview"
          class="text-field"
          rows="7"
          readonly
          value={report.body}
          bind:this={preview}></textarea>
        <p>
          The report includes the page and current question, where available. Saved progress, your
          name and answers are not attached.
        </p>
        <p role="status">{status}</p>
        <div class="actions">
          <Dialog.Close class="action-button">Close</Dialog.Close><button
            class="action-button"
            type="submit"
            value="copy">Copy report</button
          ><button class="action-button primary" type="submit" value="email"
            >Open email draft</button
          >
        </div>
      </form>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
