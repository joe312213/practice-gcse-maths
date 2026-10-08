/**
 * Purpose: Exercise student arithmetic and the actual portable puzzle control in the app.
 * Main contents: Topic switching, guide persistence, demos, marking and puzzle lifecycle.
 * Used By: focused browser runner.
 * Uses: browser support and published banks.
 * Libs: Node assertions, Playwright through shared support.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import puzzles from '../../vendor/puzzles/catalogue.js';
import { createTestContext } from './support.mjs';

export async function checkNewTopics(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(base);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Arithmetic learner');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    for (const [topic, name, tool] of [
      ['M01', 'multiplication', 'Grid'],
      ['M02', 'division', 'Frame'],
    ]) {
      await page.getByLabel('Topic', { exact: true }).selectOption(topic);
      await page.getByRole('button', { name: tool, exact: true }).click();
      await page.getByRole('button', { name: `Draw ${tool.toLowerCase()}`, exact: true }).click();
      const before = await page.locator('#working').evaluate((c) => c.toDataURL());
      const handle = page.getByRole('button', { name: 'Resize drawing area', exact: true });
      await handle.focus();
      await handle.press('ArrowDown');
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 500);
      await handle.press('Home');
      assert.equal(await page.locator('#working').evaluate((c) => c.toDataURL()), before);
      await handle.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      const bounds = await handle.boundingBox();
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2 + 90, {
        steps: 5,
      });
      await page.mouse.up();
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 640);
      const enlarged = await page.locator('#working').evaluate((c) => c.toDataURL());
      await handle.focus();
      for (let i = 0; i < 10; i++) await handle.press('ArrowUp');
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 240);
      for (let i = 0; i < 10; i++) await handle.press('ArrowDown');
      assert.equal(await page.locator('#working').evaluate((c) => c.toDataURL()), enlarged);
      await handle.press('Home');
      await page.locator('#paper').check();
      await page.locator('#paper').uncheck();
      assert.equal(await page.locator('#working').evaluate((c) => c.toDataURL()), before);
      await page.locator('[data-mode="demo"]').click();
      await page.locator('[data-demo-level="2"]').click();
      await page.locator('#demo-all').click();
      const bank = JSON.parse(
        await readFile(new URL(`../../static/data/${name}.json`, import.meta.url)),
      );
      await page
        .getByText(
          `${bank.questions.find((q) => q.type === 'demo' && q.level === 2).q} = ${bank.questions.find((q) => q.type === 'demo' && q.level === 2).answer}`,
          { exact: true },
        )
        .waitFor();
      await page.locator('[data-mode="plain"]').click();
      await page.locator('#level').selectOption('1');
      const id = await page.locator('#active-question .source-ref').textContent();
      const question = bank.questions.find((q) => q.id === id.trim());
      await page.locator('#answer').fill(question.answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      const store = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('maths-practice-v2')),
      );
      assert.equal(store.profiles[0].topics[`maths:${topic}`].history.at(-1).correct, true);
      await page.locator('[data-mode="errors"]').click();
      await page.locator('.error-working-image').waitFor();
      assert.equal(
        await page
          .locator('.error-working-image')
          .evaluate((img) => img.complete && img.naturalWidth > 0),
        true,
      );
    }
    await page.getByRole('link', { name: 'Puzzles', exact: true }).click();
    await page.getByRole('navigation', { name: 'Puzzle types', exact: true }).waitFor();
    assert.equal(await page.getByLabel('Challenge', { exact: true }).count(), 0);
    assert.equal(await page.locator('.puzzle-type').count(), 8);
    assert.equal(await page.locator('[data-puzzle-type="classic maths"]').count(), 0);
    await page.locator('[data-puzzle-type="sequences"]').focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Choose another puzzle', exact: true }).waitFor();
    assert.equal(await page.locator('.puzzle-type').count(), 0);
    assert.equal(
      await page
        .locator('#puzzle-heading')
        .evaluate((heading) => document.activeElement === heading),
      true,
    );
    await page.getByLabel('Challenge', { exact: true }).selectOption('2');
    await page.getByLabel('Challenge', { exact: true }).selectOption('1');
    await page.locator('.puzzle-controls [data-part]').first().waitFor();
    await page.getByRole('button', { name: 'Check puzzle', exact: true }).click();
    await page.getByText(/of .* marks\./).waitFor();
    const sequence = puzzles.find((q) => q.type === 'sequences' && q.challenge === 1).variations[0];
    for (const part of sequence.parts)
      await page
        .locator(`.puzzle-controls input[data-part="${part.id}"]`)
        .fill(String(part.answer));
    await page.getByRole('button', { name: 'Check puzzle', exact: true }).click();
    await page.getByText(/Well done!/).waitFor();
    await page.getByRole('button', { name: 'Hint', exact: true }).click();
    await page.getByText('You have used help on this puzzle.').waitFor();
    await page.getByRole('button', { name: 'Next puzzle', exact: true }).click();
    assert.equal(await page.getByText('You have used help on this puzzle.').count(), 0);
    await page.getByRole('button', { name: 'Choose another puzzle', exact: true }).click();
    assert.equal(
      await page
        .locator('[data-puzzle-type="sequences"]')
        .evaluate((button) => document.activeElement === button),
      true,
    );
    await page.locator('[data-puzzle-type="sudoku"]').click();
    await page.locator('.puzzle-controls .digit-cell').first().waitFor();
    await page.getByRole('button', { name: 'Show solution', exact: true }).click();
    await page.getByRole('button', { name: 'Hide solution', exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    for (const type of new Set(
      puzzles.map((q) => q.type).filter((type) => type !== 'classic maths'),
    )) {
      await page.getByRole('button', { name: 'Choose another puzzle', exact: true }).click();
      await page.locator(`[data-puzzle-type="${type}"]`).click();
      await page.locator('.puzzle-controls > *').first().waitFor();
      if (type === 'go') {
        assert.match(await page.getByLabel('Challenge', { exact: true }).innerText(), /25k\+/);
        await page
          .locator('.go-hint-actions')
          .getByRole('button', { name: 'Show hint', exact: true })
          .click();
        await page.locator('.hint-text').waitFor();
        await page
          .locator('.go-hint-actions')
          .getByRole('button', { name: 'Show next move', exact: true })
          .click();
        await page.getByText('You have used help on this puzzle.').waitFor();
        await page
          .locator('.go-reference')
          .getByRole('link', { name: 'Puzzle source', exact: true })
          .waitFor();
        assert.equal(
          await page
            .locator('.go-status')
            .evaluate((node) => getComputedStyle(node).backgroundColor),
          'rgba(0, 0, 0, 0)',
        );
        const go = puzzles.find((q) => q.type === 'go' && q.challenge === 1).variations[0].parts[0];
        const move = JSON.parse(go.answer).moves[0];
        await page.locator(`.go-point[data-value="${move}"]`).click();
        await page.locator('.go-moves').filter({ hasText: '1.' }).waitFor();
        await page.getByRole('button', { name: 'Undo', exact: true }).click();
        await page.locator('.go-moves').filter({ hasText: 'none yet' }).waitFor();
        await page.getByRole('button', { name: 'Check puzzle', exact: true }).click();
        await page.getByText(/of .* marks\./).waitFor();
        await page.getByRole('button', { name: 'Show solution', exact: true }).click();
        await page.locator('[data-go-replay]').waitFor();
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        type,
      );
    }
    assert.deepEqual(errors, []);
    console.log('Arithmetic guides, both demos, marking, saved topics and mounted puzzles passed.');
  } catch (error) {
    console.error('Browser errors:', errors);
    console.error('Visible page:', (await page.locator('body').innerText()).slice(0, 2500));
    throw error;
  } finally {
    await context.close();
  }
}
