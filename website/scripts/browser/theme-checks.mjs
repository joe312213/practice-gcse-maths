/**
 * Purpose: Compare rendered themes with the frozen reference and optionally audit user adjustments.
 *
 * Main contents:
 * - checkThemes
 *
 * Used By: website/scripts/browser-checks.mjs
 *
 * Uses: website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions), node:fs/promises (asynchronous file access), @axe-core/playwright (accessibility checks).
 */
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { artifacts } from './support.mjs';

// Status fills have intentionally diverged from the historical palette;
// colour-checks.mjs owns their current element-relative contract.
// Resolve token formulas through real CSS properties, not source-string comparisons.
/**
 * Read rendered theme colours and geometry in the page context.
 * @example renderedTheme();
 */
function renderedTheme() {
  const body = getComputedStyle(document.body),
    card = getComputedStyle(document.querySelector('.card'));
  const probe = document.createElement('span');
  document.body.append(probe);
  const colours = Object.fromEntries(
    ['--main', '--selection-text', '--correct-text', '--incorrect-text', '--muted', '--line'].map(
      (token) => {
        probe.style.color = `var(${token})`;
        return [token, getComputedStyle(probe).color];
      },
    ),
  );
  probe.remove();
  return {
    background: body.backgroundColor,
    image: body.backgroundImage,
    text: body.color,
    cardImage: card.backgroundImage,
    ...colours,
  };
}

/**
 * Compare current defaults with the frozen reference; optionally inspect adjustment extremes.
 * Parameter browser: Playwright browser instance.
 * Parameter page: mutable question-page state.
 * Parameter extended: whether to include historical adjustment audits.
 * Calls: readFile, writeFile.
 * @example checkThemes(browser, page, { extended });
 */
export async function checkThemes(browser, page, { extended = false } = {}) {
  const reference = await browser.newPage();
  const contrast = [];
  try {
    const css = await readFile(
      new URL('../../../tests/fixtures/theme-reference.css', import.meta.url),
      'utf8',
    );
    await reference.setContent(
      `<style>${css}\nbody{background:var(--page) var(--page-image);color:var(--text)}.card{background:var(--card-image) padding-box,var(--card-border-image) border-box}</style><div class="card">Reference</div>`,
    );
    await page.locator('#theme-picker').click();
    for (const mode of ['light', 'dark'])
      for (const palette of ['sage', 'blue', 'rose', 'apricot']) {
        await page.locator(`[data-theme-choice="${mode}:${palette}"]`).click();
        await page.locator('#theme-reset').click();
        for (const adjustment of extended
          ? [
              null,
              [0, mode === 'light' ? 55 : 5],
              [50, mode === 'light' ? 75 : 25],
              [100, mode === 'light' ? 96 : 45],
            ]
          : [null]) {
          if (adjustment) {
            for (const [index, id] of ['theme-saturation', 'theme-lightness'].entries()) {
              await page.locator('#' + id).evaluate((element, value) => {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
              }, String(adjustment[index]));
            }
          }
          await reference.evaluate(
            ({ mode, palette, adjustment }) => {
              const root = document.documentElement;
              root.dataset.theme = mode;
              root.dataset.palette = palette;
              const styles = getComputedStyle(root);
              root.style.setProperty(
                '--theme-saturation',
                String(
                  adjustment
                    ? adjustment[0] / 100
                    : Math.round(
                        Number(styles.getPropertyValue('--theme-saturation-default')) * 100,
                      ) / 100,
                ),
              );
              root.style.setProperty(
                '--theme-bg-lightness',
                String(
                  adjustment
                    ? adjustment[1] / 100
                    : Math.round(Number(styles.getPropertyValue('--theme-bg-default')) * 100) / 100,
                ),
              );
            },
            { mode, palette, adjustment },
          );
          assert.deepEqual(
            await page.evaluate(renderedTheme),
            await reference.evaluate(renderedTheme),
            `Exact theme parity: ${mode}:${palette} ${adjustment ?? 'default'}`,
          );
          // Theme controls may trigger finite CSS transitions; audit the settled state.
          await page.evaluate(() =>
            Promise.all(
              document.getAnimations().map((animation) => animation.finished.catch(() => {})),
            ),
          );
          if (extended) {
            const audit = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
            if (audit.violations.length)
              contrast.push({ mode, palette, adjustment, violations: audit.violations });
          }
        }
      }
    if (extended)
      await writeFile(`${artifacts}/theme-contrast.json`, JSON.stringify(contrast, null, 2));
    if (extended)
      console.log(
        `Informational contrast audit: ${contrast.length} adjusted states flagged; unrestricted user adjustments are an accepted product decision.`,
      );
    // Return to a readable default after exercising intentionally wide adjustments.
    await page.locator('[data-theme-choice="dark:blue"]').click();
    await page.locator('#theme-reset').click();
    console.log(
      `Theme reference: ${extended ? 32 : 8} states match historical colours and gradients.`,
    );
  } finally {
    await reference.close();
  }
}
