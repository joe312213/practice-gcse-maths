/**
 * Purpose: Prepare reviewable report text and email draft URLs, adapted from T-Level starters
 * issue-report.js.
 *
 * Main contents:
 * - makeReport; emailURL.
 *
 * Used By: website/src/lib/components/ui/IssueReport.svelte.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
/**
 * Format context, issue kind and learner description into a subject/body. Called by IssueReport; no sending or storage.
 */
export function makeReport(context, kind, description) {
  const subject = `Maths practice ${kind === 'content' ? 'content issue' : 'bug'}`;
  const body = [
    subject,
    '',
    description.trim(),
    '',
    ...Object.entries(context)
      .filter(([, value]) => value)
      .map(([key, value]) => `${key[0].toUpperCase() + key.slice(1)}: ${value}`),
  ].join('\n');
  return { subject, body };
}
/**
 * Encode report subject/body as a mailto draft, normalising line endings. Called by IssueReport.submit.
 */
export function emailURL({ subject, body }) {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`;
}
