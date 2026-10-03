import assert from 'node:assert/strict';
import { createTestContext } from './support.mjs';

/** Current semantic contract, not historical palette snapshots. No fixed mix ratios. */
export async function checkColours(browser, base) {
  const context = await createTestContext(browser);
  const page = await context.newPage();
  try {
    await page.goto(base);
    await page.locator('#begin').waitFor();
    const failures = await page.evaluate(() => {
      const actual = document.createElement('div');
      const expected = document.createElement('div');
      const baseline = document.createElement('div');
      document.body.append(actual, expected, baseline);
      const failures = [];
      const paint = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
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
    console.log(
      'Semantic colours: five states across eight default palettes match their element defaults.',
    );
  } finally {
    await context.close();
  }
}
