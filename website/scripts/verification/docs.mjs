/**
 * Purpose: Check actionable Markdown links and documentation-index coverage for maintained
 * Git-listed project files. Historical content links and fenced examples are excluded from the
 * active-link audit.
 *
 * Main contents:
 * - Git file discovery, INDEX coverage and local-link validation.
 *
 * Used By: the documented command below.
 *
 * Uses: no local module imports.
 *
 * Libs: node:fs/promises (asynchronous file access), node:child_process (Git and verification
 * subprocesses), node:path (filesystem path resolution).
 *
 * Usage and output: From website/: node scripts/verification/docs.mjs, normally selected by
 * verify:changed. Reads Git-listed Markdown and docs/INDEX.md; reports broken local links or
 * missing index entries. No writes or network requests.
 */
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';

// Active Markdown file links only; remote URLs/anchors are not network-audited.
const root = resolve('..');
const paths = execFileSync(
  'git',
  ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
  { cwd: root },
)
  .toString()
  .split('\0')
  .filter((path) => !path.startsWith('website/build/')); // Generated copies are not maintained documents.
const failures = [];
let checked = 0;
const indexPath = resolve(root, 'docs/INDEX.md');
const index = await readFile(indexPath, 'utf8');
const indexed = new Set(
  [...index.matchAll(/\]\(([^)]+)\)/g)]
    .map((match) => match[1].split('#')[0])
    .filter((link) => link && !/^(?:[a-z]+:|\/)/i.test(link))
    .map((link) => resolve(dirname(indexPath), decodeURIComponent(link))),
);
// Content and legacy Markdown need index routes too, although their historical links are not audited.
for (const path of new Set(paths.filter((path) => path.endsWith('.md')))) {
  if (path === 'docs/INDEX.md') continue;
  const absolute = resolve(root, path);
  try {
    await access(absolute);
  } catch {
    continue; // A tracked deletion is no longer a maintained document.
  }
  if (!indexed.has(absolute)) failures.push(`docs/INDEX.md: missing document ${path}`);
}
for (const path of new Set(
  paths.filter((path) => path.endsWith('.md') && !/^(legacy|content)\//.test(path)),
)) {
  let text;
  try {
    text = await readFile(resolve(root, path), 'utf8');
  } catch {
    continue;
  }
  // Fenced examples are prose/code, not actionable repository links.
  text = text.replace(/```[\s\S]*?```/g, '');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const link = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!link || /^(?:[a-z]+:|\/)/i.test(link)) continue;
    try {
      await access(resolve(dirname(resolve(root, path)), decodeURIComponent(link)));
      checked++;
    } catch {
      failures.push(`${path}: ${link}`);
    }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else
  console.log(`${checked} local documentation links resolve; INDEX covers all project Markdown.`);
