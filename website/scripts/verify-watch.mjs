/**
 * Purpose: Debounce source changes into serial change-selected verification runs.
 *
 * Main contents:
 * - run
 * - changed
 *
 * Used By: the documented command below.
 *
 * Uses: no local module imports.
 *
 * Libs: node:fs (filesystem reads/watchers), node:child_process (Git and verification
 * subprocesses), node:url (module/file URL conversion), node:path (filesystem path resolution).
 *
 * Usage and output: From website/: npm run verify:watch, only when ongoing verification is
 * requested. Watches maintained inputs and serialises verify-changed runs; stop with Ctrl-C. The
 * child verifier owns logs/cache/build writes.
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
 * Parameter name: changed filesystem entry, supplied by the watcher.
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
