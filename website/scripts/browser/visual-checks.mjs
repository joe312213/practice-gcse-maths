import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { artifacts, serveStatic } from './support.mjs';

/** Reconstruct the reviewed prototype only in a disposable test directory.
 * Git is the source of history; no parallel legacy runtime is maintained. */
export async function checkVisuals(browser, base) {
  const directory = await mkdtemp(join(tmpdir(), 'maths-visual-'));
  let server;
  const contexts = [];
  try {
    const root = fileURLToPath(new URL('../../../', import.meta.url));
    const files = [
      'index.html',
      'app.mjs',
      'engine.mjs',
      'profiles.mjs',
      'teaching.mjs',
      'theme.mjs',
      'styles.css',
      'theme-tokens.css',
      'theme-controls.css',
      'data/equations.json',
    ];
    for (const file of files) {
      const path = join(directory, file);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(
        path,
        execFileSync('git', ['show', `e4eb519:website/${file}`], { cwd: root }),
      );
    }
    server = await serveStatic(directory);
    const pages = [];
    for (const url of [server.url, base]) {
      const context = await browser.newContext({ viewport: { width: 1380, height: 1000 } });
      contexts.push(context);
      // Identical deterministic selection makes geometry comparisons meaningful.
      await context.addInitScript(() => {
        Math.random = () => 0.25;
      });
      const page = await context.newPage();
      await page.goto(url);
      await page.locator('#begin').click();
      await page.locator('#username').fill('Visual Student');
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      if (await page.locator('#profile-message').isVisible())
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page.locator('[data-mode="assessment"]').waitFor();
      pages.push(page);
    }
    const measurements = [];
    for (const width of [1380, 768, 390]) {
      for (const mode of ['assessment', 'demo', 'scaffolded', 'errors', 'plain']) {
        const pair = [];
        for (const [index, page] of pages.entries()) {
          await page.setViewportSize({ width, height: 1000 });
          await page.locator(`[data-mode="${mode}"]`).click();
          if (mode === 'demo') await page.getByRole('button', { name: 'End', exact: true }).click();
          // Focus scrolling differs intentionally; compare document coordinates.
          await page.evaluate(() => window.scrollTo(0, 0));
          pair.push(
            await page.evaluate(() => {
              const rect = (selector) => {
                const element = document.querySelector(selector);
                if (!element) return null;
                const box = element.getBoundingClientRect();
                return { x: box.x + scrollX, y: box.y + scrollY, width: box.width };
              };
              return {
                header: rect('header'),
                card: rect('main .card'),
                answer: rect('#answer'),
                equation: rect('.selected-equation'),
                overflow: document.documentElement.scrollWidth > innerWidth,
              };
            }),
          );
          await page.screenshot({
            path: join(artifacts, `${index ? 'current' : 'reference'}-${mode}-${width}.png`),
            fullPage: true,
          });
        }
        measurements.push({ width, mode, reference: pair[0], current: pair[1] });
        assert.equal(pair[1].overflow, false, `${mode} at ${width}: no overflow`);
        // Allow subpixel font rasterisation; major layout differences need review.
        for (const element of ['header', 'card', 'answer', 'equation']) {
          if (!pair[0][element] || !pair[1][element]) continue;
          for (const axis of ['x', 'y', 'width'])
            assert.ok(
              Math.abs(pair[0][element][axis] - pair[1][element][axis]) < 8,
              `${mode} at ${width}: ${element}.${axis}: ${pair[0][element][axis]} → ${pair[1][element][axis]}`,
            );
        }
      }
    }
    await writeFile(join(artifacts, 'visual-geometry.json'), JSON.stringify(measurements, null, 2));
    console.log(
      'Historical layout comparison passed: five activities at three widths; screenshots saved.',
    );
  } finally {
    for (const context of contexts) await context.close();
    await server?.close();
    await rm(directory, { recursive: true, force: true });
  }
}
