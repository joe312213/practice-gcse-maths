/**
 * Purpose: Exercise student arithmetic and the actual portable puzzle control in the app.
 *
 * Main contents:
 * - Topic switching, guide persistence, demos, marking and puzzle lifecycle.
 *
 * Used By: focused browser runner.
 *
 * Uses: browser support and published banks.
 *
 * Libs: Node assertions, Playwright through shared support.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { foundationTopics, topicPath } from '../../src/lib/content/topic-routes.mjs';
import puzzles from '../../vendor/puzzles/catalogue.js';
import { createTestContext, artifacts } from './support.mjs';

export async function checkNewTopics(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    // The shared menu is available on every page, including before a learner signs in.
    for (const width of [360, 768]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of [
        '',
        'about.html',
        'progress.html',
        'puzzles.html',
        ...foundationTopics.map((topic) => topicPath(topic.bank).slice(1)),
      ]) {
        await page.goto(`${base}${route}`);
        const trigger = page.getByRole('button', { name: 'Menu', exact: true });
        assert.equal(await trigger.count(), 1);
        await trigger.focus();
        await page.keyboard.press('Enter');
        const menu = page.getByRole('dialog', { name: 'Site menu', exact: true });
        await menu.waitFor();
        for (const label of ['Topics', 'Progress', 'Puzzles', 'About'])
          assert.ok(await menu.getByRole('link', { name: label, exact: true }).isVisible());
        await page.keyboard.press('Escape');
        await menu.waitFor({ state: 'hidden' });
        assert.ok(await trigger.evaluate((button) => button === document.activeElement));
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await page.getByRole('heading', { name: 'Choose a topic', exact: true }).waitFor();
    assert.equal(await page.locator('.topic-card').count(), 3);
    assert.equal(await page.getByRole('button', { name: 'Copy topic link' }).count(), 0);
    for (const topic of foundationTopics) {
      const bank = JSON.parse(
        await readFile(new URL(`../../static/data/${topic.file}.json`, import.meta.url)),
      );
      const card = page.locator('.topic-card').filter({ hasText: bank.title });
      assert.equal(
        await card.locator('.topic-example').innerText(),
        bank.questions.find((q) => q.type === 'demo' && q.level === 1).q,
      );
      assert.equal(await card.locator('.topic-solution svg, .topic-solution table').count(), 1);
      const response = await context.request.get(`${base}${topicPath(topic.bank).slice(1)}`);
      assert.equal(response.status(), 200, 'Every topic exists on the static server');
    }
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
    for (const width of [320, 360, 390, 439, 440, 441, 480, 600, 768, 1100]) {
      await page.setViewportSize({ width, height: 900 });
      const layout = await page.locator('.topic-cards').evaluate((container) => {
        const bounds = container.getBoundingClientRect();
        const cards = [...container.querySelectorAll('.topic-card')];
        const rows = new Map();
        for (const card of cards) {
          const box = card.getBoundingClientRect();
          const top = Math.round(box.top);
          rows.set(top, [
            ...(rows.get(top) ?? []),
            { left: box.left, right: box.right, width: box.width },
          ]);
        }
        return {
          widths: cards.map((card) => card.getBoundingClientRect().width),
          rows: [...rows.values()].map((row) => ({
            count: row.length,
            centred: Math.abs(row[0].left + row.at(-1).right - bounds.left - bounds.right) < 1,
          })),
          fits: cards.every((card) => card.scrollWidth <= card.clientWidth + 1),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.equal(layout.overflow, false);
      assert.ok(layout.fits, `Topic content fits at ${width}px`);
      assert.ok(
        layout.widths.every((value) => value >= 140),
        'Topic cards respect the 140px minimum',
      );
      if (width >= 360)
        assert.ok(layout.rows[0].count >= 2, `At least two topic cards fit at ${width}px`);
      const equationScale = await page.locator('.topic-solution .balance').evaluate((table) => {
        const preview = table.closest('.topic-solution').getBoundingClientRect();
        const font = parseFloat(getComputedStyle(table).fontSize);
        return {
          ratio: font / preview.width,
          operation: parseFloat(getComputedStyle(table.querySelector('tr.op')).fontSize) / font,
          padding: parseFloat(getComputedStyle(table.querySelector('td')).paddingTop) / font,
        };
      });
      assert.ok(
        Math.abs(equationScale.ratio - 0.1) < 0.001,
        'Equation ink scales proportionally with preview width',
      );
      assert.equal(
        equationScale.operation,
        1,
        'Operation rows scale with the rest of the equation',
      );
      assert.ok(
        Math.abs(equationScale.padding - 0.25) < 0.001,
        'Equation spacing scales with its ink',
      );
      assert.ok(
        layout.rows.every((row) => row.centred),
        `Each topic row is centred at ${width}px`,
      );
      if (width >= 768) assert.equal(layout.rows.length, 1);
      if (width >= 360)
        assert.ok(layout.widths.every((value) => Math.abs(value - (width < 440 ? 150 : 180)) < 1));
      if ([360, 440, 480, 768, 1100].includes(width))
        await page.screenshot({ path: `${artifacts}/topic-home-${width}.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.topic-card').filter({ hasText: 'Bus stop division' }).click();
    await page.waitForURL(`${base}fm/bus-stop-division/`);
    await page.reload();
    await page.locator('#begin').waitFor();
    await page.goBack();
    await page.getByRole('heading', { name: 'Choose a topic', exact: true }).waitFor();
    // Previously shared query links remain usable and settle on the canonical address.
    await page.goto(`${base}?topic=M02`);
    await page.waitForURL(`${base}fm/bus-stop-division/`);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Arithmetic learner');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('heading', { name: 'Bus stop division', exact: true, level: 1 }).waitFor();
    assert.equal(await page.getByLabel('Topic', { exact: true }).inputValue(), '');
    for (const [topic, name, tool] of [
      ['M01', 'multiplication', 'Grid'],
      ['M02', 'division', 'Frame'],
    ]) {
      await page.getByLabel('Topic', { exact: true }).selectOption(topic);
      await page.waitForURL(`${base}${topicPath(topic).slice(1)}`);
      assert.equal(
        await page.locator('#working').evaluate((c) => c.getBoundingClientRect().height),
        246,
        'New working starts 16px taller',
      );
      await page.getByRole('button', { name: tool, exact: true }).click();
      await page.getByRole('button', { name: `Draw ${tool.toLowerCase()}`, exact: true }).click();
      const guide = await page.locator('#working').evaluate((canvas) => {
        const { width, height } = canvas.getBoundingClientRect();
        const ink = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
        let left = canvas.width,
          right = 0,
          top = canvas.height,
          bottom = 0,
          sample;
        for (let y = 0; y < canvas.height; y++)
          for (let x = 0; x < canvas.width; x++) {
            if (!ink[(y * canvas.width + x) * 4 + 3]) continue;
            // Sample solid ink; antialiased edge pixels can vary between canvas repaint paths.
            if (ink[(y * canvas.width + x) * 4 + 3] === 255) sample ??= { x, y };
            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
          }
        return {
          sample,
          left: (left * width) / canvas.width,
          right: (right * width) / canvas.width,
          top: (top * height) / canvas.height,
          bottom: (bottom * height) / canvas.height,
          width,
          height,
        };
      });
      assert.ok(guide.sample, 'Assistance guide is drawn');
      assert.ok(
        guide.left >= 46 &&
          guide.width - guide.right >= 46 &&
          guide.top >= 46 &&
          guide.height - guide.bottom >= 46,
        'Every guide leaves handwriting room on all four sides',
      );
      assert.ok(
        Math.abs(guide.left + guide.right - guide.width) < 2 &&
          Math.abs(guide.top + guide.bottom - guide.height) < 2,
        'Guide is centred horizontally and vertically',
      );
      if (topic === 'M01')
        assert.ok(
          Math.abs(guide.right - guide.left - (guide.bottom - guide.top)) < 2,
          'Default 2×2 grid has square cells',
        );
      await page
        .locator('.working')
        .screenshot({ path: `${artifacts}/working-guide-${topic}.png` });
      const before = await page.locator('#working').evaluate((c) => c.toDataURL());
      const handle = page.getByRole('button', { name: 'Resize drawing area', exact: true });
      await handle.focus();
      await handle.press('ArrowDown');
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 532);
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
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 672);
      const enlarged = await page.locator('#working').evaluate((c) => c.toDataURL());
      await handle.focus();
      for (let i = 0; i < 10; i++) await handle.press('ArrowUp');
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 272);
      for (let i = 0; i < 10; i++) await handle.press('ArrowDown');
      assert.equal(await page.locator('#working').evaluate((c) => c.toDataURL()), enlarged);
      await handle.press('Home');
      assert.equal(await page.locator('#working').evaluate((c) => c.toDataURL()), before);
      // Verify real pixel erasure and theme repaint, not only selected toolbar state.
      if (topic === 'M01')
        await page
          .locator('.working')
          .screenshot({ path: `${artifacts}/working-canvas-light.png` });
      async function stroke(label, x, y) {
        await page.getByRole('button', { name: label, exact: true }).click();
        await page.locator('#working').scrollIntoViewIfNeeded();
        const box = await page.locator('#working').boundingBox();
        const bitmap = await page
          .locator('#working')
          .evaluate((c) => ({ width: c.width, height: c.height }));
        await page.mouse.move(
          box.x + (x * box.width) / bitmap.width,
          box.y + (y * box.height) / bitmap.height,
        );
        await page.mouse.down();
        await page.mouse.move(
          box.x + ((x + 20) * box.width) / bitmap.width,
          box.y + (y * box.height) / bitmap.height,
        );
        await page.mouse.up();
      }
      const pixel = (x, y) =>
        page
          .locator('#working')
          .evaluate((canvas, p) => [...canvas.getContext('2d').getImageData(p.x, p.y, 1, 1).data], {
            x,
            y,
          });
      await stroke('Black pen', 250, 30);
      assert.deepEqual(await pixel(260, 30), [0, 0, 0, 255]);
      await stroke('Eraser', 250, 30);
      assert.equal((await pixel(260, 30))[3], 0);
      await stroke('Black pen', 280, 30);
      await page.locator('#theme-toggle').click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      assert.deepEqual(await pixel(290, 30), [255, 255, 255, 255]);
      if (topic === 'M01')
        await page.locator('.working').screenshot({ path: `${artifacts}/working-canvas-dark.png` });
      assert.notEqual(
        await page.locator('#working').evaluate((c) => getComputedStyle(c).backgroundColor),
        'rgb(32, 32, 32)',
        'Drawing paper takes a subtle tint from the theme surface',
      );
      await page.locator('#theme-toggle').click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
      assert.deepEqual(await pixel(290, 30), [0, 0, 0, 255]);
      await page.locator('#typed-working').fill('My saved method');
      const guidePixel = await pixel(guide.sample.x, guide.sample.y);
      await page.locator('[data-question="1"]').click();
      await page.locator('[data-question="0"]').click();
      assert.deepEqual(await pixel(290, 30), [0, 0, 0, 255]);
      assert.equal((await pixel(260, 30))[3], 0);
      assert.deepEqual(await pixel(guide.sample.x, guide.sample.y), guidePixel);
      await page.goto(`${base}${topicPath(topic).slice(1)}`);
      await page.locator('#working').waitFor();
      assert.equal(await page.locator('#typed-working').inputValue(), 'My saved method');
      assert.deepEqual(await pixel(290, 30), [0, 0, 0, 255]);
      assert.equal((await pixel(260, 30))[3], 0);
      assert.deepEqual(await pixel(guide.sample.x, guide.sample.y), guidePixel);
      await page.getByRole('button', { name: 'Report an issue', exact: true }).click();
      await page.locator('#report-description').fill('The working looks wrong.');
      assert.match(await page.locator('#report-preview').inputValue(), new RegExp(topic));
      await page
        .locator('#issue-report')
        .getByRole('button', { name: 'Close', exact: true })
        .click();
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
      await page.locator('#hint').click();
      assert.equal(await page.locator('#question-hint').textContent(), question.hint);
      const hintBounds = await page.locator('#question-hint').boundingBox();
      const buttonBounds = await page.locator('#hint').boundingBox();
      assert.ok(hintBounds.y >= buttonBounds.y && hintBounds.y - buttonBounds.y < 110);
      await page.locator('#hint').click();
      assert.equal(await page.locator('#question-hint').isVisible(), false);
      await page.locator('#answer').fill(question.answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      const store = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('maths-practice-v2')),
      );
      assert.equal(store.profiles[0].topics[`maths:${topic}`].history.at(-1).correct, true);
      assert.equal(store.profiles[0].topics[`maths:${topic}`].history.at(-1).assisted, true);
      assert.equal(await page.locator('#question-hint').isVisible(), false);
      await page.locator('[data-mode="errors"]').click();
      await page.locator('.error-working-image').waitFor();
      assert.equal(
        await page
          .locator('.error-working-image')
          .evaluate((img) => img.complete && img.naturalWidth > 0),
        true,
      );
    }
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await page
      .getByRole('dialog', { name: 'Site menu', exact: true })
      .getByRole('link', { name: 'Puzzles', exact: true })
      .click();
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
