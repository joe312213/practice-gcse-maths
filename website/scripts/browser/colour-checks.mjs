/**
 * Purpose: Check semantic state colours and surface-preserving hover across default palettes.
 *
 * Main contents:
 * - checkColours
 *
 * Used By: website/scripts/browser-checks.mjs
 *
 * Uses: website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions).
 */
import assert from 'node:assert/strict';
import { createTestContext } from './support.mjs';

/**
 * Current semantic contract, not historical palette snapshots. No fixed mix ratios.
 * Verify semantic colours and real pointer hover across all default themes.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: createTestContext.
 * @example checkColours(browser, base);
 */
export async function checkColours(browser, base) {
  const context = await createTestContext(browser);
  const page = await context.newPage();
  try {
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin').waitFor();
    const failures = await page.evaluate(() => {
      const actual = document.createElement('div');
      const expected = document.createElement('div');
      const baseline = document.createElement('div');
      document.body.append(actual, expected, baseline);
      const failures = [];
      const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      /**
       * Rasterize a CSS colour into four 8-bit colour channels for comparison.
       * Parameter colour: CSS colour to rasterize.
       */
      const rgba = (colour) => {
        paint.clearRect(0, 0, 1, 1);
        paint.fillStyle = colour;
        paint.fillRect(0, 0, 1, 1);
        return paint.getImageData(0, 0, 1, 1).data;
      };
      for (const mode of ['light', 'dark'])
        for (const palette of ['sage', 'blue', 'rose', 'apricot']) {
          document.documentElement.dataset.theme = mode;
          document.documentElement.dataset.palette = palette;
          for (const [classes, state, feedback] of [
            ['question-option active', 'selection', false],
            ['question-option correct', 'correct', false],
            ['question-option incorrect', 'incorrect', false],
            ['feedback correct', 'correct', true],
            ['feedback incorrect', 'incorrect', true],
          ]) {
            actual.className = classes;
            baseline.className = feedback ? 'feedback' : 'question-option';
            // Recompute the mix at a probe using the *unhighlighted* element's
            // rendered colours. This verifies local inheritance and token wiring.
            expected.className = 'feedback';
            expected.style.setProperty(
              '--highlight-surface',
              getComputedStyle(baseline).backgroundColor,
            );
            expected.style.setProperty(
              '--highlight-border',
              getComputedStyle(baseline).borderLeftColor,
            );
            expected.style.background = `var(--${state}-bg)`;
            expected.style.borderColor = `var(--${state}-border)`;
            expected.style.color = `var(--${state}-text)`;
            for (const property of ['backgroundColor', 'borderLeftColor', 'color']) {
              // Computed oklab serialisation rounds decimals. Compare rendered
              // channels (one 8-bit step tolerance), not round-tripped CSS strings.
              const actualColour = rgba(getComputedStyle(actual)[property]);
              const expectedColour = rgba(getComputedStyle(expected)[property]);
              if (actualColour.some((value, index) => Math.abs(value - expectedColour[index]) > 1))
                failures.push(`${mode}:${palette} ${classes} ${property}`);
            }
          }
        }
      actual.remove();
      expected.remove();
      baseline.remove();
      return failures;
    });
    assert.deepEqual(failures, []);
    // Exercise real pointer hover in every default theme, including the opt-in class.
    for (const mode of ['light', 'dark'])
      for (const palette of ['sage', 'blue', 'rose', 'apricot']) {
        await page.evaluate(
          ({ mode, palette }) => {
            document.documentElement.dataset.theme = mode;
            document.documentElement.dataset.palette = palette;
            for (const [id, classes] of [
              ['hover-action', 'action-button'],
              ['hover-opt-in', 'hover-tint'],
            ]) {
              const button = document.createElement('button');
              button.id = id;
              button.className = classes;
              button.textContent = 'Hover probe';
              // Keep probes stable when the page scrolls or app content finishes loading.
              button.style.cssText = `position:fixed;top:10px;left:${id === 'hover-action' ? 10 : 220}px;z-index:9999`;
              document.body.append(button);
            }
          },
          { mode, palette },
        );
        for (const id of ['hover-action', 'hover-opt-in']) {
          await page.locator(`#${id}`).hover();
          const matches = await page.locator(`#${id}`).evaluate((element) => {
            const probe = document.createElement('div');
            probe.style.position = 'fixed';
            probe.style.pointerEvents = 'none';
            probe.style.background =
              'color-mix(in srgb, var(--surface) 75%, var(--selection-base))';
            document.body.append(probe);
            const actual = getComputedStyle(element).backgroundColor;
            const expected = getComputedStyle(probe).backgroundColor;
            probe.remove();
            return { actual, expected, hovered: element.matches(':hover') };
          });
          assert.ok(
            matches.hovered && matches.actual === matches.expected,
            `${mode}:${palette} ${id}: ${JSON.stringify(matches)}`,
          );
        }
        await page.evaluate(() => {
          document.getElementById('hover-action').remove();
          document.getElementById('hover-opt-in').remove();
        });
      }

    console.log(
      'Semantic colours: five states across eight default palettes match their element defaults.',
    );
  } finally {
    await context.close();
  }
}
