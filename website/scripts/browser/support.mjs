/**
 * Purpose: Provide isolated browser contexts and a temporary static server for browser verification.
 *
 * Main contents:
 * - artifacts
 * - launchBrowser
 * - serveStatic
 * - createTestContext
 *
 * Used By: website/scripts/browser-checks.mjs, website/scripts/browser/colour-checks.mjs, website/scripts/browser/practice-set-checks.mjs, website/scripts/browser/presentation-checks.mjs, website/scripts/browser/progress-checks.mjs, website/scripts/browser/startup-checks.mjs, website/scripts/browser/theme-checks.mjs, website/scripts/browser/visual-checks.mjs
 *
 * Uses: no local module imports.
 *
 * Libs: @playwright/test (browser automation), node:fs (file access), node:fs/promises (asynchronous file access), node:http (local test server), node:url, node:path (filesystem paths).
 */
import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve, relative, extname, join } from 'node:path';

export const artifacts = fileURLToPath(new URL('../../test-results/browser/', import.meta.url));

/**
 * Prefer an explicitly selected browser, then a local Chrome, then Playwright's
installed Chromium. Every launch uses a fresh isolated browser profile.
 * Launch Chromium using configured or locally available browser binaries.
 * Calls: existsSync, mkdir.
 */
export async function launchBrowser() {
  const macChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const executablePath = process.env.CHROME_PATH || (existsSync(macChrome) ? macChrome : undefined);
  await mkdir(artifacts, { recursive: true });
  return chromium.launch({ executablePath, headless: true });
}

/**
 * A real static server (no SPA fallback) catches missing prerendered routes.
An ephemeral port keeps tests independent of the user's development server.
 * Serve the given build directory beneath an optional URL base path; return shutdown controls.
 * Parameter directory: filesystem directory.
 * Parameter basePath: URL prefix for static hosting.
 * Calls: resolve, createServer.
 * @example const server = await serveStatic("build", "/maths");
 */
export async function serveStatic(directory, basePath = '') {
  const root = resolve(directory);
  const types = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith(basePath + '/')) throw Error('Not found');
      let file = resolve(root, '.' + pathname.slice(basePath.length));
      if (relative(root, file).startsWith('..')) throw Error('Not found');
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const data = await readFile(file);
      response.writeHead(200, {
        'Content-Type': types[extname(file)] || 'application/octet-stream',
      });
      response.end(data);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', accept);
  });
  return {
    url: `http://127.0.0.1:${server.address().port}${basePath}/`,
    /** Stop the local HTTP server and resolve when it has closed; used by runner cleanup. */
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

/**
 * Fixed pseudo-randomness gives every browser scenario reproducible question sets.
 * Create an isolated browser context and install deterministic randomness.
 * Parameter browser: Playwright browser instance.
 * Parameter options: browser-context options.
 */
export async function createTestContext(browser, options = {}) {
  const context = await browser.newContext(options);
  await context.addInitScript(() => {
    let seed = 123456789;
    Math.random = () => {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      return (seed >>> 0) / 4294967296;
    };
  });
  return context;
}
