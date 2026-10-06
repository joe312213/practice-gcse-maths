/**
 * Purpose: Check local links in active Markdown documents discovered through Git.
 *
 * Main contents:
 * - Module initialization and configuration.
 *
 * Used By: Verification command entry points.
 *
 * Uses: no local module imports.
 *
 * Libs: node:fs/promises (asynchronous file access), node:child_process (Git/build subprocesses), node:path (filesystem paths).
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
  .split('\0');
const failures = [];
let checked = 0;
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
} else console.log(`${checked} local documentation links resolve.`);
