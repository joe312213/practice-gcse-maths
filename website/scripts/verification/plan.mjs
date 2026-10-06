import { createHash } from 'node:crypto';

// Deliberately small dependency map. Broaden here when adding a new feature family.
const config = /^website\/(package(?:-lock)?\.json|[^/]+\.(?:js|json))$/;
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
  /^(content\/M10.*\.json|scripts\/prepare_web_equations\.py|website\/static\/data\/|website\/src\/lib\/content\/practice-pages\.json)/;
const matches = (patterns) => (path) => patterns.some((pattern) => pattern.test(path));

export const jobs = [
  {
    id: 'docs',
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
      /^website\/src\/lib\/application\/(player|equation-demo)\.mjs$/,
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

export const isBuildInput = matches([source, config, /^website\/scripts\/validate-bank\.mjs$/]);
export const isFormatInput = (path) =>
  /^website\/(src\/|scripts\/|[^/]+$)/.test(path) && /\.(svelte|css|js|mjs|ts|json)$/.test(path);
export const digest = (value) => createHash('sha256').update(value).digest('hex');
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
export function plan(files, cached = {}, salt = '', force = false) {
  // Dispatcher changes invalidate the map itself, even if an input rule changed.
  const policy = fingerprint(files, (path) => runner.test(path), salt);
  return jobs.map((job) => {
    const hash = fingerprint(files, job.inputs, policy);
    return { ...job, hash, run: force || cached[job.id] !== hash };
  });
}
