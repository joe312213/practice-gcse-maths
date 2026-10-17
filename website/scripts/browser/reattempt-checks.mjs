/** One mobile flow covers native retry controls, saved state and the distinct success surface. */
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { createTestContext } from './support.mjs';
import { readTopicBank } from '../read-topic-bank.mjs';
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
    await page.locator('#retry-question').click();
    await expect(page.locator('#answer')).toBeFocused();
    await expect(page.locator('#answer')).toHaveValue('');
    await page.locator('#answer').fill(answer);
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
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
