/**
 * Purpose: One mobile flow covers native retry controls, saved state and the distinct success
 * surface.
 *
 * Main contents:
 * - checkReattempts.
 *
 * Used By: website/scripts/browser/progress-checks.mjs.
 *
 * Uses: website/scripts/browser/support.mjs, website/scripts/read-topic-bank.mjs.
 *
 * Libs: node:assert/strict (assertions), @playwright/test (browser automation and assertions).
 *
 * Usage and output: Imported by the browser suite runner; call the exported check with its
 * browser/base URL arguments. Uses isolated test contexts and assertions, closing owned contexts
 * on exit. Normal entry point: npm run verify:changed from website/.
 */
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { createTestContext } from './support.mjs';
import { readTopicBank } from '../read-topic-bank.mjs';
/** Run this focused browser scenario against the supplied browser and base URL. Called by the shared suite runner; isolated contexts and finally cleanup protect other sessions. Example: await checkReattempts(browser, base). */
export async function checkReattempts(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  try {
    const page = await context.newPage();
    await page.clock.install({ time: new Date('2026-10-17T10:00:00Z') });
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Retry learner');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Later', exact: true }).click();
    await page.locator('[data-mode="plain"]').click();
    const bank = await readTopicBank('solving-equations');
    const saved = () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].subjects.maths.topics[
            'maths:M10'
          ],
      );
    const id = (await saved()).pages.plain.items[0].id;
    const answer = bank.questions.find((q) => q.id === id).answer;
    await page.locator('#answer').fill('999999');
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.locator('#answer').click();
    await expect(page.locator('#answer')).toBeFocused();
    await expect(page.locator('#answer')).toHaveValue('');
    await page.locator('#answer').fill(answer);
    const answerBounds = await page.locator('#answer').boundingBox();
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(page.locator('.answer-flash')).toHaveText('✓');
    await expect(page.locator('.feedback-flash')).toContainText('Correct.');
    await expect(page.locator('#answer')).toHaveValue('');
    assert.equal((await page.locator('#answer').boundingBox()).width, answerBounds.width);
    await expect(page.locator('.answer-flash')).toHaveCSS('position', 'absolute');
    for (const selector of ['.answer-flash', '.feedback-flash']) {
      const opacity = await page.locator(selector).evaluate((element) => {
        const animation = element.getAnimations()[0];
        animation.pause();
        animation.currentTime = 900;
        const held = Number(getComputedStyle(element).opacity);
        animation.currentTime = 1500;
        const fading = Number(getComputedStyle(element).opacity);
        return { held, fading };
      });
      assert.equal(opacity.held, 1, 'Feedback holds fully visible for one second');
      assert.ok(opacity.fading > 0 && opacity.fading < 1, 'Feedback then fades');
    }
    await page.clock.fastForward(2100);
    await expect(page.locator('.answer-flash')).toHaveCount(0);
    const tile = page.locator('[data-question="0"]');
    await expect(tile).toHaveClass(/early-reattempt/);
    await expect(tile.locator('.question-outcome')).toHaveText('✓');
    const earlyColour = await tile.evaluate((el) => getComputedStyle(el).backgroundColor);
    assert.deepEqual((await saved()).tracks.plain.histories[0], [false]);
    await page.reload();
    await tile.click();
    await expect(page.locator('.feedback')).toContainText('does not count towards progress');
    await page.clock.fastForward(2 * 60 * 60 * 1000);
    await page.locator('#retry-question').click();
    await page.locator('#answer').fill(answer);
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(tile).not.toHaveClass(/early-reattempt/);
    await expect(tile).toHaveClass(/correct/);
    assert.notEqual(await tile.evaluate((el) => getComputedStyle(el).backgroundColor), earlyColour);
    const result = await saved();
    assert.deepEqual(result.tracks.plain.histories[0], [false, true]);
    assert.equal(result.pages.plain.count, 1);
    assert.equal(result.pages.plain.responses[id].correct, false);
  } finally {
    await context.close();
  }
}
