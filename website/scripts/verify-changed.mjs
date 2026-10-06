/**
 * Purpose: Run affected verification jobs serially, retaining passing fingerprints and named failure logs.
 *
 * Main contents:
 * - snapshot
 * - outputHash
 * - command
 *
 * Used By: Verification command entry points.
 *
 * Uses: website/scripts/verification/plan.mjs.
 *
 * Libs: node:fs/promises (asynchronous file access), node:child_process (Git/build subprocesses), node:url, node:path (filesystem paths).
 */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { plan, digest, fingerprint, isBuildInput, isFormatInput } from './verification/plan.mjs';

const website = fileURLToPath(new URL('..', import.meta.url));
const root = resolve(website, '..');
const directory = resolve(website, 'test-results/verification');
const stateFile = resolve(directory, 'state.json');
const args = new Set(process.argv.slice(2));
if ([...args].some((arg) => !['--plan', '--force'].includes(arg)))
  throw Error('Use --plan or --force.');
await mkdir(directory, { recursive: true });
let cache;
try {
  cache = JSON.parse(await readFile(stateFile, 'utf8'));
} catch {
  cache = { jobs: {}, format: {} };
}
const chromePath =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome = await stat(chromePath).catch(() => null);
const salt = JSON.stringify([
  process.version,
  process.platform,
  process.arch,
  process.env.BASE_PATH ?? '',
  chromePath,
  chrome?.size,
  chrome?.mtimeMs,
]);

/**
 * Fingerprint tracked and untracked relevant source files discovered by Git.
 * Calls: execFileSync, digest, readFile, resolve.
 * @example snapshot();
 */
async function snapshot() {
  const names = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: root },
  )
    .toString()
    .split('\0');
  const result = {};
  for (const path of new Set(names)) {
    // Do not read binary legacy decks, generated output or unrelated resources.
    if (
      !/\.(md|json|js|mjs|ts|css|svelte|py|html|svg)$/.test(path) ||
      /^(legacy|website\/(node_modules|build|\.svelte-kit|test-results))\//.test(path)
    )
      continue;
    try {
      result[path] = digest(await readFile(resolve(root, path)));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return result;
}
/**
 * Fingerprint build output recursively to detect stale or externally changed artifacts.
 * Parameter directory: filesystem directory.
 * Calls: visit, fingerprint.
 * @example outputHash(directory);
 */
async function outputHash(directory) {
  const files = {};
  /**
   * Visit children recursively and collect their file data.
   * Parameter path: repository-relative or walked filesystem path.
   * Calls: readdir, resolve, relative, digest, readFile.
   * Used by: outputHash.
   */
  async function visit(path) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      const child = resolve(path, entry.name);
      if (entry.isDirectory()) await visit(child);
      else files[relative(directory, child)] = digest(await readFile(child));
    }
  }
  try {
    await visit(directory);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
  return fingerprint(files, () => true);
}
/**
 * Run one verification command, capture its named log and fail on nonzero exit.
 * Parameter id: stable question/job identifier.
 * Parameter argv: Node command arguments.
 * Calls: resolve, writeFile.
 * @example command(id, argv);
 */
async function command(id, argv) {
  const log = resolve(directory, `${id}.log`);
  const start = Date.now();
  let output = '';
  const status = await new Promise((accept, reject) => {
    // No shell: paths and wildcards are interpreted by Node, never interpolated.
    const child = spawn(process.execPath, argv, {
      cwd: website,
      env: { ...process.env, BASE_URL: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (data) => {
      output += data;
    });
    child.stderr.on('data', (data) => {
      output += data;
    });
    child.on('error', reject);
    child.on('close', (code) => accept(code));
  });
  await writeFile(log, output);
  console.log(
    `${status === 0 ? 'PASS' : 'FAIL'} ${id} (${((Date.now() - start) / 1000).toFixed(1)}s)${status === 0 ? '' : ` — ${log}`}`,
  );
  if (status !== 0) throw Error(`${id} failed; see ${log}`);
}
const files = await snapshot();
const planned = plan(files, cache.jobs, salt, args.has('--force'));
const formatConfig = fingerprint(files, (path) => /^website\/[^/]+\.(js|json)$/.test(path), salt);
const formatFiles = Object.keys(files).filter(
  (path) =>
    isFormatInput(path) &&
    (args.has('--force') ||
      cache.formatConfig !== formatConfig ||
      cache.format[path] !== files[path]),
);
const buildKey = fingerprint(files, isBuildInput, salt);
const buildDirectory = resolve(website, 'build');
const output = await outputHash(buildDirectory);
// A deleted/replaced build invalidates browser evidence even with unchanged source.
if (cache.build && cache.build.output !== output)
  for (const job of planned) if (job.build) job.run = true;
const selected = planned.filter((job) => job.run);
const buildNeeded =
  selected.some((job) => job.build) &&
  (args.has('--force') || cache.build?.input !== buildKey || cache.build?.output !== output);
console.log(
  `Selected: ${[...(formatFiles.length ? ['format'] : []), ...(buildNeeded ? ['build'] : []), ...selected.map((job) => job.id)].join(', ') || 'none — relevant inputs unchanged'}`,
);
if (!args.has('--plan')) {
  /**
   * Write the successful verification cache to its JSON state file.
   * Calls: writeFile.
   */
  async function save() {
    await writeFile(stateFile, JSON.stringify(cache, null, 2) + '\n');
  }
  try {
    if (formatFiles.length) {
      await command('format', [
        'node_modules/prettier/bin/prettier.cjs',
        '--check',
        ...formatFiles.map((path) => relative(website, resolve(root, path))),
      ]);
      for (const path of formatFiles) cache.format[path] = files[path];
      cache.formatConfig = formatConfig;
      await save();
    }
    let built = false;
    for (const job of selected) {
      if (job.build && !built) {
        if (buildNeeded) {
          await command('build', ['node_modules/vite/bin/vite.js', 'build']);
          if (fingerprint(await snapshot(), isBuildInput, salt) !== buildKey)
            throw Error('Build inputs changed during verification; rerun.');
          cache.build = { input: buildKey, output: await outputHash(buildDirectory) };
          await save();
        }
        built = true;
      }
      await command(job.id, job.command);
      if (job.followup) await command(`${job.id}-diagnostics`, job.followup);
      const current = plan(await snapshot(), {}, salt).find((entry) => entry.id === job.id);
      if (current.hash !== job.hash)
        throw Error(`${job.id} inputs changed during verification; rerun.`);
      cache.jobs[job.id] = job.hash;
      await save();
    }
    console.log('Verification complete. Passing fingerprints saved; no unrelated checks run.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
