/**
 * Purpose: Debounce source changes into serial change-selected verification runs.
 *
 * Main contents:
 * - run
 * - changed
 *
 * Used By: Verification command entry points.
 *
 * Uses: no local module imports.
 *
 * Libs: node:fs (file access), node:child_process (Git/build subprocesses), node:url, node:path (filesystem paths).
 */
import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// Opt-in source-save trigger. Do not watch dependency/build trees or install hooks.
const website = fileURLToPath(new URL('..', import.meta.url));
const root = resolve(website, '..');
let child,
  timer,
  pending = false,
  stopped = false;
/**
 * Start verification or queue one rerun if a process is already active.
 * Calls: spawn.
 */
function run() {
  if (stopped) return;
  if (child) {
    pending = true;
    return;
  }
  pending = false;
  child = spawn(process.execPath, ['scripts/verify-changed.mjs'], {
    cwd: website,
    stdio: 'inherit',
  });
  child.on('close', () => {
    child = null;
    if (pending) run();
  });
}
/**
 * Debounce a relevant filesystem event into the next verification run.
 * Parameter _: unused filesystem event kind.
 * Parameter name: learner name or requested field name.
 */
function changed(_, name) {
  if (!name || !/\.(md|json|js|mjs|ts|css|svelte|py|html|svg)$/.test(String(name))) return;
  clearTimeout(timer);
  timer = setTimeout(run, 500);
}
const watchers = [watch(root, changed), watch(website, changed)];
for (const path of [
  'docs',
  'tests',
  'scripts',
  'content',
  '.agents/skills',
  'website/src',
  'website/static',
  'website/scripts',
]) {
  watchers.push(watch(resolve(root, path), { recursive: true }, changed));
}
process.on('SIGINT', () => {
  stopped = true;
  clearTimeout(timer);
  watchers.forEach((watcher) => watcher.close());
  child?.kill('SIGINT');
});
console.log('Watching source saves; checks run serially. Ctrl-C stops.');
run();
