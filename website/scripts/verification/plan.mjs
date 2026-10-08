/**
 * Purpose: Map source families to verification jobs and fingerprint their inputs for cached selection.
 *
 * Main contents:
 * - jobs
 * - isBuildInput
 * - isFormatInput
 * - digest
 * - fingerprint
 * - plan
 *
 * Used By: tests/verification.test.mjs, website/scripts/verify-changed.mjs
 *
 * Uses: no local module imports.
 *
 * Libs: node:crypto (fingerprints).
 */
import { createHash } from 'node:crypto';

// Deliberately small dependency map. Broaden here when adding a new feature family.
const config = /^website\/(package(?:-lock)?\.json|[^/]+\.(?:js|json))$/;
const puzzles = /^website\/vendor\/puzzles\//;
const source = /^website\/(src|static)\//;
const runtime = /^website\/src\/(lib\/(application|domain|adapters)\/|routes\/)/;
const interaction =
  /^website\/src\/(lib\/(application\/session\.mjs|adapters\/|components\/(practice|ui)\/)|routes\/)/;
const layout = /^website\/src\/lib\/styles\/(components|controls|app)\.css$/;
const components = /^website\/src\/lib\/components\//;
const styles = /^website\/src\/lib\/styles\//;
const theme = /^website\/src\/lib\/(theme\/|styles\/theme-)/;
const runner = /^website\/scripts\/(verify-changed\.mjs|verification\/)/;
const browser = /^website\/scripts\/browser(?:-checks\.mjs|\/support\.mjs)$/;
const bank =
  /^(content\/(?:M(?:01|02|10).*\.(?:json|md)|spot_errors\.json)|scripts\/prepare_web_(?:equations|arithmetic)\.py|website\/static\/data\/|website\/src\/lib\/content\/practice-pages\.json)/;
/**
 * Build a path predicate matching any supplied regular expression.
 * Parameter patterns: path-matching regular expressions.
 */
const matches = (patterns) => (path) => patterns.some((pattern) => pattern.test(path));

export const jobs = [
  {
    id: 'puzzle-library',
    inputs: matches([puzzles, config]),
    command: ['--test', 'vendor/puzzles/tests/*.test.js'],
  },
  {
    id: 'new-topics',
    inputs: matches([
      puzzles,
      runtime,
      components,
      styles,
      bank,
      config,
      browser,
      /^website\/scripts\/browser\/new-topics-checks\.mjs$/,
    ]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--new-topics-only'],
  },
  {
    id: 'docs',
    /** Select active Markdown paths for the documentation-link verification job. */
    inputs: (path) => path.endsWith('.md') && !/^(legacy|content)\//.test(path),
    command: ['scripts/verification/docs.mjs'],
  },
  // These tests take well under a second; the whole small logic suite is cheaper
  // and safer than maintaining individual function-to-test associations.
  {
    id: 'logic',
    inputs: matches([runtime, /^tests\/.*\.test\.mjs$/, bank, runner, config]),
    command: ['--test', '../tests/*.test.mjs'],
  },
  {
    id: 'bank',
    inputs: matches([
      bank,
      /^website\/scripts\/validate-bank\.mjs$/,
      /^website\/src\/lib\/domain\/engine\.mjs$/,
      config,
    ]),
    command: ['scripts/validate-bank.mjs'],
  },
  {
    id: 'svelte',
    inputs: matches([/^website\/src\/.*\.(svelte|js|mjs|ts)$/, config]),
    command: ['node_modules/@sveltejs/kit/svelte-kit.js', 'sync'],
    followup: ['node_modules/svelte-check/bin/svelte-check', '--fail-on-warnings'],
  },
  {
    id: 'presentation',
    inputs: matches([
      components,
      layout,
      /^website\/src\/lib\/application\/(player|equation-demo|arithmetic-demo|drawing-assist)\.mjs$/,
      /^website\/src\/routes\//,
      bank,
      config,
      browser,
      /^website\/scripts\/browser\/presentation-checks\.mjs$/,
    ]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--presentation-only'],
  },
  {
    id: 'colours',
    inputs: matches([
      theme,
      styles,
      /^website\/src\/routes\/\+layout/,
      config,
      browser,
      /^website\/scripts\/browser\/colour-checks\.mjs$/,
    ]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--colours-only'],
  },
  {
    id: 'startup',
    inputs: matches([
      /^website\/src\/lib\/(adapters|theme)\//,
      /^website\/src\/routes\//,
      bank,
      config,
      browser,
      /^website\/scripts\/browser\/startup-checks\.mjs$/,
    ]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--startup-only'],
  },
  {
    id: 'practice-sets',
    inputs: matches([
      interaction,
      bank,
      config,
      browser,
      styles,
      /^website\/src\/lib\/domain\/(practice-code|engine|profiles)\.mjs$/,
      /^website\/scripts\/browser\/practice-set-checks\.mjs$/,
    ]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--practice-sets-only'],
  },
  {
    id: 'progress',
    inputs: matches([
      interaction,
      bank,
      config,
      browser,
      /^website\/src\/lib\/domain\/(progress|revision|progress-transfer|engine|profiles)\.mjs$/,
      /^website\/src\/lib\/components\/progress\//,
      /^website\/src\/lib\/styles\/progress\.css$/,
      /^website\/scripts\/browser\/progress-checks\.mjs$/,
    ]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--progress-only'],
  },
  // Broad interaction checks do not depend on cosmetic CSS edits.
  {
    id: 'integration',
    inputs: matches([interaction, bank, config, browser]),
    build: true,
    command: ['scripts/browser-checks.mjs', '--activities-only'],
  },
];

export const isBuildInput = matches([
  source,
  puzzles,
  config,
  /^website\/scripts\/validate-bank\.mjs$/,
]);
/**
 * Recognize maintained website source/config files covered by formatting checks.
 * Parameter path: repository-relative or walked filesystem path.
 */
export const isFormatInput = (path) =>
  /^website\/(src\/|scripts\/|[^/]+$)/.test(path) && /\.(svelte|css|js|mjs|ts|json)$/.test(path);
/**
 * Return the SHA-256 hex digest of the supplied string.
 * Parameter value: new value to apply or validate.
 * Calls: createHash.
 * Used by: fingerprint.
 */
export const digest = (value) => createHash('sha256').update(value).digest('hex');
/**
 * Hash included file fingerprints in stable path order with the policy salt.
 * Parameter files: path-to-fingerprint map.
 * Parameter include: predicate selecting relevant paths.
 * Parameter salt: cache policy/version salt.
 * Calls: digest.
 * Used by: plan.
 */
export function fingerprint(files, include, salt = '') {
  return digest(
    JSON.stringify([
      salt,
      Object.entries(files)
        .filter(([path]) => include(path))
        .sort(([a], [b]) => a.localeCompare(b)),
    ]),
  );
}
/**
 * Select verification jobs whose input fingerprints differ from the successful cache.
 * Parameter files: path-to-fingerprint map.
 * Parameter cached: successful job fingerprints.
 * Parameter salt: cache policy/version salt.
 * Parameter force: whether to select every job.
 * Calls: fingerprint.
 */
export function plan(files, cached = {}, salt = '', force = false) {
  // Dispatcher changes invalidate the map itself, even if an input rule changed.
  const policy = fingerprint(files, (path) => runner.test(path), salt);
  return jobs.map((job) => {
    const hash = fingerprint(files, job.inputs, policy);
    return { ...job, hash, run: force || cached[job.id] !== hash };
  });
}
