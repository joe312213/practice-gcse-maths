/** Build reviewable issue text and an email draft URL. Adapted from T-Level starters issue-report.js. */
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
export function emailURL({ subject, body }) {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, '\r\n'))}`;
}
