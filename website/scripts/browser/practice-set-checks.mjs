/**
 * Purpose: Exercise practice-set creation, codes, timers and page navigation in an isolated browser profile.
 *
 * Main contents:
 * - checkPracticeSets
 *
 * Used By: website/scripts/browser-checks.mjs
 *
 * Uses: website/scripts/browser/support.mjs, website/src/lib/domain/practice-code.mjs.
 *
 * Libs: node:assert/strict (assertions), node:fs/promises (asynchronous file access), @axe-core/playwright (accessibility checks).
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { createTestContext, artifacts } from './support.mjs';
import { decodePracticeSet, encodePracticeSet } from '../../src/lib/domain/practice-code.mjs';

/**
 * Exercise code creation, navigation and timer expiry against the supplied base URL.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: readFile, createTestContext, decodePracticeSet, state, encodePracticeSet.
 * @example checkPracticeSets(browser, base);
 */
export async function checkPracticeSets(browser, base) {
  const banks = await Promise.all(
    ['equations', 'multiplication', 'division'].map(async (name) =>
      JSON.parse(await readFile(new URL(`../../static/data/${name}.json`, import.meta.url))),
    ),
  );
  const questions = banks.flatMap((bank) => bank.questions);
  const context = await createTestContext(browser, { viewport: { width: 1100, height: 1000 } });
  const page = await context.newPage();
  await page.clock.install();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Practice Set Student');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    assert.equal(await page.locator('#practice-code').isVisible(), true);
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page.getByRole('button', { name: 'Create Practice set', exact: true }).click();
    for (let i = 0; i < 3; i++)
      await page.getByRole('button', { name: 'Add page', exact: true }).click();
    assert.equal(
      await page.getByRole('button', { name: 'Add page', exact: true }).isDisabled(),
      true,
    );
    for (let i = 1; i <= 4; i++)
      await page.getByLabel(`Page ${i} slot`, { exact: true }).selectOption(String(i));
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const audit = await new AxeBuilder({ page })
      .include('.practice-set-builder')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(audit.violations, []);
    await page.getByRole('button', { name: 'Create code', exact: true }).click();
    const code = await page.locator('#practice-code').inputValue();
    assert.equal(decodePracticeSet(code).pages.length, 4);
    await page.locator('.practice-set-builder').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Go', exact: true }).click();
    /**
     * Read the browser's stored learner data for assertions.
     * Used by: checkPracticeSets.
     */
    const state = () =>
      page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('maths-practice-v2'));
        return data.profiles.find((profile) => profile.key === data.last).practiceSet;
      });
    for (let index = 0; index < 4; index++) {
      let run = await state();
      assert.equal(run.index, index);
      while (!run.attempts[index].complete) {
        const currentIndex = Number(
          await page.locator('.question-option[aria-current="true"]').getAttribute('data-question'),
        );
        const id = run.attempts[index].items[currentIndex].id;
        await page.locator('#answer').fill(questions.find((question) => question.id === id).answer);
        await page.getByRole('button', { name: 'Check answer', exact: true }).click();
        run = await state();
      }
      if (await page.locator('#decline-promotion').isVisible())
        await page.locator('#decline-promotion').click();
      if (index < 3) await page.locator('#next-set-page').click();
    }
    assert.equal((await state()).finished, 'complete');
    await page.reload();
    await page.getByText('Practice set complete.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Leave Practice set', exact: true }).click();
    await page.getByRole('link', { name: 'Progress', exact: true }).click();
    await page.getByText('24 questions answered', { exact: true }).waitFor();
    await page.getByRole('link', { name: 'Back to topics', exact: true }).click();
    await page.locator('.topic-card').filter({ hasText: 'Solving equations' }).click();
    const input = page.getByPlaceholder('practice code or search', { exact: true });
    await input.fill('multiplication');
    await page.getByRole('button', { name: 'Go', exact: true }).click();
    assert.deepEqual(
      (await state()).config.pages.map((p) => p.topic),
      [0],
    );
    await page.getByRole('button', { name: 'Leave Practice set', exact: true }).click();
    await input.fill('lattice');
    await input.press('Enter');
    assert.deepEqual(
      (await state()).config.pages.map((p) => p.topic),
      [0],
    );
    await page.getByRole('button', { name: 'Leave Practice set', exact: true }).click();
    await input.fill('equations');
    await input.press('Enter');
    assert.deepEqual(
      (await state()).config.pages.map((p) => p.topic),
      [9],
    );
    await page.getByRole('button', { name: 'Leave Practice set', exact: true }).click();
    const [field, go] = await Promise.all([
      input.boundingBox(),
      page.getByRole('button', { name: 'Go', exact: true }).boundingBox(),
    ]);
    assert.ok(
      go.x >= field.x + field.width &&
        Math.abs(go.y + go.height / 2 - field.y - field.height / 2) < 2,
      'Go stays beside the search field on mobile',
    );
    await page.locator('#practice-code').fill('bad');
    await page.getByRole('button', { name: 'Go', exact: true }).click();
    assert.match(await page.locator('#practice-set-error').innerText(), /nine-character/);
    const timed = encodePracticeSet({
      level: 0,
      timing: 1,
      pages: [{ topic: 9, type: 0, slot: 15 }],
    });
    await page.clock.pauseAt(new Date());
    await page.locator('#practice-code').fill(timed);
    await page.getByRole('button', { name: 'Go', exact: true }).click();
    assert.equal((await state()).attempts[0].authoredSlot, 3);
    await page.clock.fastForward(300001);
    assert.equal((await state()).finished, 'expired');
    assert.equal(
      await page.getByRole('button', { name: 'Check answer', exact: true }).isDisabled(),
      true,
    );
    assert.equal((await state()).attempts[0].count, 0);
    assert.deepEqual(errors, []);
    console.log(
      'Practice sets: four authored pages, adaptation, reload, invalid code, modulo, expiry and mobile accessible builder pass.',
    );
  } catch (error) {
    await page.screenshot({ path: `${artifacts}/practice-set-failure.png`, fullPage: true });
    throw error;
  } finally {
    await context.close();
  }
}
