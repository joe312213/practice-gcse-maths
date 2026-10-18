/**
 * Purpose: Trim authored error SVG canvases without changing any working shapes or text. Run
 * with --write to update assets; otherwise report whether their bounds need cropping. Native
 * dimensions retain 20–22-unit writing at 15–16.5 CSS pixels, with no CSS enlargement.
 *
 * Main contents:
 * - Referenced SVG discovery, browser getBBox measurements and optional root-bound updates.
 *
 * Used By: the documented command below.
 *
 * Uses: website/scripts/browser/support.mjs, website/scripts/read-topic-bank.mjs,
 * website/src/lib/content/topic-routes.mjs.
 *
 * Libs: node:fs/promises (asynchronous file access).
 *
 * Usage and output: From website/: node scripts/crop-error-working.mjs checks existing SVG
 * bounds; --write updates their root bounds/dimensions. Reads referenced error diagrams and uses
 * an isolated browser for SVG measurements; preserves mathematical paths and text.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { launchBrowser } from './browser/support.mjs';

import { readTopicBank } from './read-topic-bank.mjs';
import { foundationTopics } from '../src/lib/content/topic-routes.mjs';
const paths = new Set();
for (const { file } of foundationTopics) {
  const bank = await readTopicBank(file);
  for (const question of [...bank.questions, ...bank.retiredQuestions])
    if (question.errorImage) paths.add(question.errorImage);
}
const browser = await launchBrowser();
let changed = 0;
try {
  const page = await browser.newPage();
  for (const path of [...paths].sort()) {
    const file = new URL(`../static/${path}`, import.meta.url);
    const svg = await readFile(file, 'utf8');
    await page.setContent(svg);
    // Measure at one authored unit per CSS pixel. Text hinting otherwise changes
    // the rounded bounds after the previous crop changes the SVG's display scale.
    await page.locator('svg').evaluate((element) => {
      element.setAttribute('viewBox', '0 0 1000 1000');
      element.setAttribute('width', '1000');
      element.setAttribute('height', '1000');
    });
    await page.evaluate(() => document.fonts.ready);
    const box = await page.locator('svg').evaluate((svg) => {
      const bounds = svg.getBBox();
      // Half a normal written character around the ink also clears all current strokes.
      const margin = 12;
      const x = Math.floor(bounds.x - margin),
        y = Math.floor(bounds.y - margin);
      return {
        x,
        y,
        width: Math.ceil(bounds.x + bounds.width + margin) - x,
        height: Math.ceil(bounds.y + bounds.height + margin) - y,
      };
    });
    const next = svg.replace(/<svg\b[^>]*>/, (tag) => {
      tag = tag.replace(/\s(?:viewBox|width|height)="[^"]*"/g, '');
      return (
        tag.slice(0, -1) +
        ` viewBox="${box.x} ${box.y} ${box.width} ${box.height}" width="${box.width * 0.75}" height="${box.height * 0.75}">`
      );
    });
    if (next === svg) continue;
    changed++;
    if (process.argv.includes('--write')) await writeFile(file, next);
  }
  console.log(
    `${paths.size} error diagrams measured; ${changed} ${process.argv.includes('--write') ? 'cropped' : 'need cropping'}.`,
  );
  if (changed && !process.argv.includes('--write')) process.exitCode = 1;
} finally {
  await browser.close();
}
