/**
 * Purpose: Verify real glyph rendering, missing-symbol honesty and cancellable preview playback.
 *
 * Main contents:
 * - checkHandwriting.
 *
 * Used By: website/scripts/browser/presentation-checks.mjs.
 *
 * Uses: website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions).
 *
 * Usage and output: Imported by the browser suite runner; call the exported check with its
 * browser/base URL arguments. Uses isolated test contexts and assertions, closing owned contexts
 * on exit. Normal entry point: npm run verify:changed from website/.
 */
import assert from 'node:assert/strict';
import { artifacts, createTestContext } from './support.mjs';

/** Run this focused browser scenario against the supplied browser and base URL. Called by the shared suite runner; isolated contexts and finally cleanup protect other sessions. Example: await checkHandwriting(browser, base). */
export async function checkHandwriting(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(`${base}handwriting.html`);
    await page.locator('[data-font="parisienne"] svg path').first().waitFor({ state: 'attached' });
    assert.equal(await page.locator('.font-card').count(), 17);
    const extended = page.locator('[data-font="pacifico-maths"]');
    assert.equal(await extended.locator('[data-missing]').count(), 0);
    await extended.getByRole('button', { name: 'Replay', exact: true }).first().click();
    await extended.getByRole('button', { name: 'Pause', exact: true }).first().click();
    assert.ok(
      await extended
        .locator('svg')
        .first()
        .evaluate((svg) =>
          svg.getAnimations({ subtree: true }).every((a) => a.playState === 'paused'),
        ),
    );
    await extended.getByRole('button', { name: 'End', exact: true }).first().click();
    await extended.screenshot({ path: `${artifacts}/handwriting-pacifico-maths.png` });
    const card = page.locator('[data-font="futural"]');
    await card.getByRole('button', { name: 'Replay', exact: true }).click();
    await card.getByRole('button', { name: 'Pause', exact: true }).click();
    const motion = await card
      .locator('svg')
      .first()
      .evaluate((svg) =>
        svg
          .getAnimations({ subtree: true })
          .map((a) => ({ state: a.playState, frames: a.effect.getKeyframes() })),
      );
    assert.ok(motion.length > 0 && motion.every((a) => a.state === 'paused'));
    assert.ok(motion.every((a) => a.frames[0].strokeDashoffset !== a.frames[1].strokeDashoffset));
    await card.getByRole('button', { name: 'Resume', exact: true }).click();
    await card.getByRole('button', { name: 'End', exact: true }).click();
    assert.equal(
      await card
        .locator('svg')
        .first()
        .evaluate((svg) => svg.getAnimations({ subtree: true }).length),
      0,
    );
    await page.locator('#stroke-text').fill('x² − 3 × π');
    await page.waitForFunction(() =>
      document.querySelector('[data-font="futural"] svg [data-missing="π"]'),
    );
    assert.deepEqual(
      await card
        .locator('svg')
        .first()
        .locator('[data-missing]')
        .evaluateAll((nodes) => nodes.map((n) => n.textContent)),
      ['²', '−', '×', 'π'],
    );
    assert.equal(await extended.locator('[data-missing]').count(), 0);
    const indices = await extended
      .locator('svg')
      .first()
      .evaluate((svg) => {
        const x = svg.querySelector('[data-glyph="x"]').getBoundingClientRect();
        const squared = svg.querySelector('[data-glyph="²"]').getBoundingClientRect();
        return { raised: squared.bottom < x.bottom, smaller: squared.height < x.height };
      });
    assert.ok(
      indices.raised && indices.smaller,
      'Pacifico indices reuse smaller, raised digit strokes',
    );
    await page.locator('#stroke-text').fill('2x + 3 = 11');
    await page.locator('#stroke-family').selectOption('Vara');
    await page.waitForFunction(() => document.querySelectorAll('.font-card').length === 5);
    await page.locator('.font-gallery').screenshot({ path: `${artifacts}/handwriting-vara.png` });
    await page.locator('#stroke-family').selectOption('Hershey');
    await page.waitForFunction(() => document.querySelectorAll('.font-card').length === 12);
    await page
      .locator('.font-card')
      .first()
      .screenshot({ path: `${artifacts}/handwriting-sans.png` });
    await page.setViewportSize({ width: 360, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.locator('#stroke-family').selectOption('Vara');
    await extended.waitFor();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await extended.screenshot({ path: `${artifacts}/handwriting-pacifico-maths-mobile.png` });
    await page.locator('#stroke-family').selectOption('Hershey');
    await card.waitFor();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await card.getByRole('button', { name: 'Replay', exact: true }).click();
    assert.equal(
      await card
        .locator('svg')
        .first()
        .evaluate((svg) => svg.getAnimations({ subtree: true }).length),
      0,
    );
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
