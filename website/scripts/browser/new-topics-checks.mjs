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
import { checkDraftTopics } from './draft-topics-checks.mjs';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { foundationTopics, topicPath } from '../../src/lib/content/topic-routes.mjs';
import puzzles from '../../vendor/puzzles/catalogue.js';
import { createTestContext, artifacts, selectTopic } from './support.mjs';

export async function checkNewTopics(browser, base) {
  await checkDraftTopics(browser, base);
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.clock.install();
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
    assert.equal(await page.locator('.topic-card').count(), foundationTopics.length);
    assert.equal(await page.getByRole('button', { name: 'Copy topic link' }).count(), 0);
    for (const topic of foundationTopics) {
      const bank = JSON.parse(
        await readFile(new URL(`../../static/data/${topic.file}.json`, import.meta.url)),
      );
      const card = page.locator('.topic-card').filter({ hasText: bank.title });
      if (topic.bank === 'M15') assert.ok(await card.locator('.topic-example .fraction').count());
      else
        assert.equal(
          await card.locator('.topic-example').innerText(),
          bank.questions.find((q) => q.type === 'demo' && q.level === 1).q,
        );
      assert.equal(
        await card
          .locator(
            '.topic-solution svg, .topic-solution table, .topic-solution .calculation-working',
          )
          .count(),
        1,
      );
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
        layout.widths.every((value) => Math.abs(value - layout.widths[0]) < 1),
        'Masonry columns have equal widths',
      );
      const columns = await page
        .locator('.topic-cards')
        .evaluate((el) => getComputedStyle(el).columnWidth);
      assert.notEqual(columns, 'auto', 'Native masonry columns are active');
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
    assert.equal(await page.getByLabel('Topic', { exact: true }).textContent(), 'Topic');
    for (const [topic, name, tool] of [
      ['M01', 'multiplication', 'Grid'],
      ['M02', 'division', 'Frame'],
    ]) {
      await selectTopic(page, topic);
      await page.waitForURL(`${base}${topicPath(topic).slice(1)}`);
      assert.equal(
        await page.locator('#working').evaluate((c) => c.getBoundingClientRect().height),
        262,
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
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 564);
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
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 704);
      const enlarged = await page.locator('#working').evaluate((c) => c.toDataURL());
      await handle.focus();
      for (let i = 0; i < 10; i++) await handle.press('ArrowUp');
      assert.equal(await page.locator('#working').evaluate((c) => c.height), 304);
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
      const pageNav = page.getByRole('navigation', { name: 'Practice page navigation' });
      const beforeNavigation = await page.evaluate(
        (topic) =>
          JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics[`maths:${topic}`]
            .pages.plain,
        topic,
      );
      await pageNav.getByRole('button', { name: 'Next page of questions', exact: true }).click();
      const afterNavigation = await page.evaluate(
        (topic) =>
          JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics[`maths:${topic}`]
            .pages.plain,
        topic,
      );
      assert.notEqual(afterNavigation.attempt, beforeNavigation.attempt);
      assert.equal(afterNavigation.items.length, 12);
      await pageNav
        .getByRole('button', { name: 'Previous page of questions', exact: true })
        .click();
      assert.deepEqual(
        await page.evaluate(
          (topic) =>
            JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics[
              `maths:${topic}`
            ].pages.plain,
          topic,
        ),
        beforeNavigation,
      );
      assert.equal(await page.getByRole('timer', { name: 'Time remaining' }).innerText(), '18:00');
      const id = await page.locator('.question-code').textContent();
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
      const timer = page.getByRole('region', { name: 'Practice timer' });
      assert.equal(await timer.getByRole('timer').innerText(), '6:00');
      assert.equal(await timer.getByRole('checkbox').count(), 0);
      assert.equal(
        await timer.getByRole('button', { name: 'Start timer', exact: true }).innerText(),
        'Start',
      );
      for (let n = 0; n < 5; n++)
        await timer.getByRole('button', { name: 'Subtract one minute' }).click();
      await timer.getByRole('button', { name: 'Start timer', exact: true }).click();
      await page.clock.runFor(10000);
      await timer.getByRole('button', { name: 'Pause timer', exact: true }).click();
      const paused = await timer.getByRole('timer').innerText();
      await page.clock.runFor(10000);
      assert.equal(await timer.getByRole('timer').innerText(), paused);
      await timer.getByRole('button', { name: 'Resume timer', exact: true }).click();
      await page.clock.runFor(51000);
      assert.match(await timer.innerText(), /Time is up/);
      await timer.getByRole('button', { name: 'Reset timer', exact: true }).click();
      assert.ok(await timer.getByRole('button', { name: 'Add one minute' }).isEnabled());
      for (const level of [0, 1, 2]) {
        await page.locator('#level').selectOption(String(level));
        const added = bank.questions.find((q) => q.id === `maths:${topic}-SE-C${level + 1}-Q4`);
        await page.locator('.question-option').filter({ hasText: added.q }).click();
        await page.locator('.error-working-image').evaluate((img) => img.decode());
        await page
          .locator('#active-question')
          .screenshot({ path: `${artifacts}/error-added-${topic}-${level}.png` });
      }
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
    assert.equal(await page.getByLabel('Level', { exact: true }).count(), 0);
    assert.equal(await page.locator('.puzzle-type').count(), 8);
    assert.equal(await page.locator('[data-puzzle-type="classic maths"]').count(), 0);
    await page.locator('[data-puzzle-type="sequences"]').focus();
    await page.keyboard.press('Enter');
    await page.getByLabel('Level', { exact: true }).waitFor();
    assert.equal(await page.getByText('Choose another puzzle', { exact: true }).count(), 0);
    assert.equal(await page.locator('.puzzle-type').count(), 0);
    assert.equal(
      await page
        .locator('#puzzle-heading')
        .evaluate((heading) => document.activeElement === heading),
      true,
    );
    await page.getByLabel('Level', { exact: true }).selectOption('2');
    await page.getByLabel('Level', { exact: true }).selectOption('1');
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
    const firstCode = await page.locator('.page-navigation .source-ref').innerText();
    assert.ok(
      await page.getByRole('button', { name: 'Previous puzzle', exact: true }).isDisabled(),
    );
    await page.getByRole('button', { name: 'Next puzzle', exact: true }).click();
    assert.notEqual(await page.locator('.page-navigation .source-ref').innerText(), firstCode);
    await page.getByRole('button', { name: 'Previous puzzle', exact: true }).click();
    assert.equal(await page.locator('.page-navigation .source-ref').innerText(), firstCode);
    assert.equal(await page.getByText('You have used help on this puzzle.').count(), 0);
    await page.goBack();
    await page.locator('.puzzle-type').first().waitFor();
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
      await page.goBack();
      await page.locator('.puzzle-type').first().waitFor();
      await page.locator(`[data-puzzle-type="${type}"]`).click();
      await page.locator('.puzzle-controls > *').first().waitFor();
      if (type === 'go') {
        assert.match(await page.getByLabel('Level', { exact: true }).innerText(), /25k\+/);
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
        assert.equal(
          await page.getByRole('button', { name: 'Check puzzle', exact: true }).count(),
          0,
        );
        await page.getByRole('button', { name: 'Show solution', exact: true }).click();
        await page.locator('[data-go-replay]').waitFor();
      }
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        type,
      );
    }
    for (const width of [320, 390, 767, 768]) {
      await page.setViewportSize({ width, height: 956 });
      for (const type of new Set(
        puzzles.map((q) => q.type).filter((id) => id !== 'classic maths'),
      )) {
        await page.goto(`${base}puzzles.html`);
        await page.locator(`[data-puzzle-type="${type}"]`).click();
        await page.getByLabel('Level', { exact: true }).waitFor();
        for (const level of ['1', '2', '3', '4']) {
          await page.getByLabel('Level', { exact: true }).selectOption(level);
          await page.locator('.puzzle-controls').first().waitFor();
          const overflow = await page.locator('.puzzle-controls').evaluateAll((roots) =>
            roots
              .flatMap((root) => [root, ...root.querySelectorAll('.board-scroll')])
              .filter((node) => node.scrollWidth > node.clientWidth + 1)
              .map((node) => node.className),
          );
          assert.deepEqual(overflow, [], `${type} level ${level} fits at ${width}px`);
          const grids = await page.locator('.candidate-table').evaluateAll((tables) =>
            tables.map((table) => {
              const axes = [...table.querySelectorAll('.candidate-axis')];
              return {
                widths: [...table.querySelectorAll('button')].map(
                  (button) => button.getBoundingClientRect().width,
                ),
                headingMetrics: [...table.querySelectorAll('th[scope="col"], th[scope="row"]')].map(
                  (cell) => ({
                    text: cell.textContent,
                    width: cell.getBoundingClientRect().width,
                    font: getComputedStyle(cell).font,
                    padding: getComputedStyle(cell).padding,
                    tableWidth: table.getBoundingClientRect().width,
                  }),
                ),
                shortHeadingsFit: [...table.querySelectorAll('th[scope="col"], th[scope="row"]')]
                  .filter((cell) => /^\S{1,7}$/.test(cell.textContent))
                  .every((cell) => {
                    const range = document.createRange();
                    range.selectNodeContents(cell);
                    return range.getClientRects().length === 1;
                  }),
                axisSizes: axes.map((axis) => getComputedStyle(axis).fontSize),
                vertical: getComputedStyle(table.querySelector('.candidate-axis-vertical span'))
                  .writingMode,
              };
            }),
          );
          for (const grid of grids) {
            assert.ok(
              grid.widths.every((value) => value >= 24),
              `${type} candidate hit targets remain usable`,
            );
            assert.ok(
              grid.shortHeadingsFit,
              `${type} short row/value labels fit without splitting words: ${JSON.stringify(grid.headingMetrics)}`,
            );
            assert.equal(new Set(grid.axisSizes).size, 1);
            assert.equal(grid.vertical, 'vertical-rl');
          }

          if (
            width === 320 &&
            level === '4' &&
            ['sudoku', 'go', 'logic grids', 'logic equations'].includes(type)
          )
            await page.screenshot({
              path: `${artifacts}/puzzle-${type.replaceAll(' ', '-')}-320.png`,
              fullPage: true,
            });
        }
        await page.goBack();
        await page.locator('.puzzle-type').first().waitFor();
        await page.goForward();
        await page.locator('.puzzle-controls').first().waitFor();
        assert.equal(new URL(page.url()).searchParams.get('type'), type);
        assert.equal(
          await page.getByLabel('Level', { exact: true }).inputValue(),
          '4',
          'Forward restores the level in that history entry',
        );
      }
    }
    await page.goto(`${base}puzzles.html`);
    await page.locator('[data-puzzle-type="go"]').click();
    await page.getByLabel('Level', { exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Next puzzle', exact: true }).click();
    const sourceCode = await page.locator('.page-navigation .source-ref').innerText();
    await page.getByRole('button', { name: 'Show next move', exact: true }).click();
    // Use the recorded answer from the selected source, then let its reply settle.
    const [questionId, variationId] = sourceCode.split(' · ');
    const sourcePart = puzzles
      .find((q) => q.id === questionId)
      .variations.find((v) => v.id === variationId).parts[0];
    await page.locator(`.go-point[data-value="${JSON.parse(sourcePart.answer).moves[0]}"]`).click();
    await page.waitForFunction(
      () => !document.querySelector('.go-status')?.textContent.includes('follows'),
    );
    const sourceMoves = await page.locator('.go-moves').innerText();
    const engineRequests = [];
    page.on('request', (request) => {
      if (request.url().includes('/engines/gnugo/')) engineRequests.push(request.url());
    });
    await page.getByRole('link', { name: 'Demo board', exact: true }).click();
    await page.getByRole('heading', { name: 'Go demo board', exact: true }).waitFor();
    await page.getByLabel('Board size', { exact: true }).selectOption('5');
    assert.equal(await page.locator('.go-point').count(), 25);
    await page.locator('.go-point[data-value="12"]').focus();
    await page.keyboard.press('Enter');
    await page.locator('[data-go-stone="12"]').waitFor();
    assert.equal(engineRequests.length, 0, 'GNU Go is absent before counting');
    await page.getByRole('button', { name: 'Pass', exact: true }).click();
    await page.getByRole('button', { name: 'Pass', exact: true }).click();
    await page.getByRole('button', { name: 'Resume play', exact: true }).waitFor();
    await page.getByText(/GNU Go estimate/).waitFor();
    assert.ok(engineRequests.some((url) => url.endsWith('gnugo.wasm')));
    await page.getByLabel('Estimate open territory', { exact: true }).uncheck();
    await page.locator('.go-point[data-value="12"]').click();
    assert.match(
      await page.locator('.go-point[data-value="12"]').getAttribute('aria-label'),
      /marked dead/,
    );
    assert.ok(await page.getByText('Black: 0 · White: 6.5', { exact: true }).isVisible());
    await page.getByRole('button', { name: 'Resume play', exact: true }).click();
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    assert.equal(await page.locator('[data-go-stone]').count(), 0);
    await page.getByRole('button', { name: 'Redo', exact: true }).click();
    assert.equal(await page.locator('[data-go-stone]').count(), 1);
    await page.getByRole('button', { name: 'Count', exact: true }).click();
    await page.getByRole('button', { name: 'Resume play', exact: true }).click();
    await page.getByRole('button', { name: 'Reset board', exact: true }).click();
    assert.equal(await page.locator('[data-go-stone]').count(), 0);
    await page.getByText('Timing options', { exact: true }).click();
    assert.equal(await page.getByLabel('Main time', { exact: true }).inputValue(), '5');
    assert.equal(await page.getByLabel('Byo-yomi seconds', { exact: true }).inputValue(), '30');
    assert.equal(await page.getByLabel('Byo-yomi periods', { exact: true }).inputValue(), '3');
    await page.getByLabel('Main time', { exact: true }).selectOption('0');
    await page.getByLabel('Byo-yomi seconds', { exact: true }).selectOption('10');
    await page.getByLabel('Byo-yomi periods', { exact: true }).selectOption('3');
    assert.ok(await page.getByText(/Settings apply to each player/).isVisible());
    await page.getByRole('button', { name: 'Start clocks', exact: true }).click();
    assert.equal(await page.getByText(/Settings apply to each player/).count(), 0);
    assert.equal(await page.getByLabel('Main time', { exact: true }).isVisible(), false);
    await page.getByRole('button', { name: 'Pause clocks', exact: true }).click();
    assert.equal(await page.getByLabel('Main time', { exact: true }).isVisible(), false);
    assert.equal(await page.getByText(/Settings apply to each player/).isVisible(), false);
    await page.getByText('Timing options', { exact: true }).click();
    assert.ok(await page.getByText(/Settings apply to each player/).isVisible());
    await page.getByText('Timing options', { exact: true }).click();
    await page.getByRole('button', { name: 'Resume clocks', exact: true }).click();
    await page.getByRole('button', { name: 'Count', exact: true }).click();
    assert.ok(await page.getByRole('button', { name: 'Resume clocks', exact: true }).isDisabled());
    assert.equal(await page.getByText(/Settings apply to each player/).isVisible(), false);
    await page.getByRole('button', { name: 'Resume play', exact: true }).click();
    assert.ok(await page.getByRole('button', { name: 'Pause clocks', exact: true }).isVisible());
    await page.getByRole('button', { name: 'Pass', exact: true }).click();
    assert.match(await page.locator('.go-clocks .active').innerText(), /White/);
    await page.getByRole('button', { name: 'Undo', exact: true }).click();
    assert.ok(await page.getByRole('button', { name: 'Resume clocks', exact: true }).isVisible());
    for (const size of ['9', '13', '19']) {
      await page.getByLabel('Board size', { exact: true }).selectOption(size);
      assert.equal(await page.locator('.go-point').count(), Number(size) ** 2);
    }
    assert.equal(await page.locator('.go-axis-label').count(), 76);
    for (const width of [320, 390, 439, 440, 441]) {
      await page.setViewportSize({ width, height: 956 });
      const geometry = await page.locator('.go-board').evaluate((board) => {
        const bounds = board.getBoundingClientRect(),
          panel = board.closest('.page-panel');
        const padding = parseFloat(getComputedStyle(panel).paddingLeft);
        const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return {
          left: bounds.left,
          right: innerWidth - bounds.right,
          expected: (padding + 0.4 * root) / (innerWidth <= 440 ? 2 : 1),
        };
      });
      assert.ok(
        Math.abs(geometry.left - geometry.expected) < 1,
        JSON.stringify({ width, ...geometry }),
      );
      if (width <= 440)
        assert.ok(Math.abs(geometry.right - geometry.expected) < 1, JSON.stringify(geometry));
    }
    await page.getByLabel('Board size', { exact: true }).selectOption('9');
    for (const move of [13, 46, 24, 56, 34, 67])
      await page.locator(`.go-point[data-value="${move}"]`).click();
    await page.getByRole('button', { name: 'Count', exact: true }).click();
    await page.getByLabel('Estimate open territory', { exact: true }).check();
    await page.getByText(/GNU Go estimate/).waitFor();
    assert.equal(
      await page.locator('[data-go-estimate="8"]').getAttribute('data-go-ownership'),
      'B',
    );
    assert.equal(
      await page.locator('[data-go-estimate="72"]').getAttribute('data-go-ownership'),
      'W',
    );
    assert.equal(await page.locator('[data-go-estimate="40"]').count(), 0);
    await page.getByLabel('Estimate open territory', { exact: true }).uncheck();
    assert.equal(await page.locator('[data-go-estimate]').count(), 0);
    await page.getByLabel('Estimate open territory', { exact: true }).check();
    await page.getByText(/GNU Go estimate/).waitFor();
    await page.setViewportSize({ width: 320, height: 956 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    assert.equal(
      await page
        .locator('.go-point')
        .first()
        .evaluate((point) => getComputedStyle(point).touchAction),
      'pinch-zoom',
    );
    assert.doesNotMatch(
      await page.locator('meta[name="viewport"]').getAttribute('content'),
      /user-scalable=no|maximum-scale/,
    );
    assert.ok(await page.getByRole('link', { name: 'Go rules reminder', exact: true }).isVisible());
    await page.screenshot({ path: `${artifacts}/go-human-320.png`, fullPage: true });
    await page.goBack();
    await page.locator('.go-moves').waitFor();
    assert.equal(await page.getByLabel('Level', { exact: true }).inputValue(), '2');
    assert.equal(await page.locator('.page-navigation .source-ref').innerText(), sourceCode);
    assert.equal(await page.locator('.go-moves').innerText(), sourceMoves);
    for (const width of [320, 767, 768]) {
      await page.setViewportSize({ width, height: 956 });
      for (const route of ['puzzles.html', 'progress.html', 'about.html', 'help.html']) {
        await page.goto(`${base}${route}`);
        await page.locator('.page-panel').first().waitFor();
        const panels = await page.locator('.page-panel').evaluateAll((items) =>
          items.map((item) => {
            const bounds = item.getBoundingClientRect(),
              style = getComputedStyle(item);
            return {
              left: bounds.left,
              right: bounds.right,
              border: parseFloat(style.borderLeftWidth),
              top: parseFloat(style.borderTopWidth),
              radius: parseFloat(style.borderRadius),
            };
          }),
        );
        assert.ok(
          panels.every((panel) =>
            width < 768
              ? Math.abs(panel.left) < 1 &&
                Math.abs(panel.right - width) < 1 &&
                panel.border === 0 &&
                panel.top > 0 &&
                panel.radius === 0
              : panel.left > 0 && panel.right < width && panel.border > 0 && panel.radius > 0,
          ),
          `${route} main panels at ${width}px`,
        );
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
          route,
        );
        if (route === 'progress.html' && width === 320)
          await page.screenshot({ path: `${artifacts}/progress-refined-320.png`, fullPage: true });
      }
    }
    await checkPuzzleTouch(browser, base);
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

/** Exercise real touch streams, including browser scroll arbitration and implicit capture. */
async function checkPuzzleTouch(browser, base) {
  const context = await createTestContext(browser, {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  try {
    await page.clock.install();
    await page.goto(`${base}puzzles.html?type=go`);
    const go = puzzles.find((q) => q.type === 'go' && q.challenge === 1).variations[0].parts[0];
    const moves = JSON.parse(go.answer).moves;
    const target = page.locator(`.go-point[data-value="${moves[0]}"]`);
    await target.scrollIntoViewIfNeeded();
    const start = page.locator('.go-point[aria-label$="empty"]').first();
    const point = async (locator) => {
      const b = await locator.boundingBox();
      return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    };
    const from = await point(start),
      to = await point(target);
    const cdp = await context.newCDPSession(page);
    const touch = (type, position) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: position ? [{ ...position, id: 1 }] : [],
      });
    const scroll = await page.evaluate(() => scrollY);
    await touch('touchStart', from);
    await page.locator('[data-go-preview]').waitFor();
    await touch('touchMove', to);
    await page.locator(`[data-go-preview="${moves[0]}"]`).waitFor();
    await page.locator('.go-board').screenshot({ path: `${artifacts}/go-touch-preview.png` });
    assert.equal(await page.evaluate(() => scrollY), scroll, 'Go drag does not scroll');
    await touch('touchCancel');
    assert.equal(await page.locator('[data-go-preview]').count(), 0);
    await page.locator('.go-moves').filter({ hasText: 'none yet' }).waitFor();
    await touch('touchStart', from);
    await touch('touchMove', to);
    await touch('touchEnd');
    await page.clock.runFor(1000);
    await page.locator('.go-moves').filter({ hasText: '1.' }).waitFor();
    for (let i = 2; i < moves.length; i += 2) {
      await page.locator(`.go-point[data-value="${moves[i]}"]`).tap();
      await page.clock.runFor(1000);
    }
    await page.locator('.go-success').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Check puzzle', exact: true }).count(), 0);
    await page.getByRole('button', { name: 'Reset', exact: true }).tap();
    await page.locator('.go-moves').filter({ hasText: 'none yet' }).waitFor();
    await target.focus();
    await page.keyboard.down(' ');
    await page.locator('[data-go-preview]').waitFor();
    await page.keyboard.press('Escape');
    await page.keyboard.up(' ');
    await page.locator('.go-moves').filter({ hasText: 'none yet' }).waitFor();
    await page.keyboard.press('Enter');
    await page.clock.runFor(1000);
    await page.locator('.go-moves').filter({ hasText: '1.' }).waitFor();
    await page.goto(`${base}go.html`);
    await page.locator('.go-point').first().waitFor();
    await page.locator('.go-board').scrollIntoViewIfNeeded();
    const humanStart = await point(page.locator('.go-point[data-value="30"]'));
    const humanEnd = await point(page.locator('.go-point[data-value="40"]'));
    const humanScroll = await page.evaluate(() => scrollY);
    await touch('touchStart', humanStart);
    await touch('touchMove', humanEnd);
    await page.locator('[data-go-preview="40"]').waitFor();
    await touch('touchEnd');
    assert.equal(await page.locator('[data-go-stone]').count(), 1, 'Human drag commits one stone');
    assert.equal(await page.evaluate(() => scrollY), humanScroll);
    await page.getByRole('button', { name: 'Undo', exact: true }).tap();
    await page.locator('.go-board').scrollIntoViewIfNeeded();
    const pinchStart = await point(page.locator('.go-point[data-value="30"]'));
    const pinchOther = await point(page.locator('.go-point[data-value="50"]'));
    await touch('touchStart', pinchStart);
    await page.locator('[data-go-preview]').waitFor();
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { ...pinchStart, id: 1 },
        { ...pinchOther, id: 2 },
      ],
    });
    assert.equal(
      await page.locator('[data-go-preview]').count(),
      0,
      'Second finger cancels the pending stone for browser zoom',
    );
    await touch('touchCancel');
    assert.equal(await page.locator('[data-go-stone]').count(), 0);
    await page.goto(`${base}puzzles.html?type=cover%20paths`);
    const board = page.locator('[data-path-board]');
    {
      await board.waitFor();
      await board.scrollIntoViewIfNeeded();
      const path = puzzles.find((q) => q.type === 'cover paths' && q.challenge === 1).variations[0]
        .parts[0];
      const route = JSON.parse(path.answer);
      const dots = route
        .slice(0, 3)
        .map((i) => page.locator(`[data-challenge-action="path"][data-value="${i}"]`));
      const before = await page.evaluate(() => scrollY);
      await touch('touchStart', await point(dots[0]));
      for (const dot of dots.slice(1)) await touch('touchMove', await point(dot));
      await touch('touchEnd');
      assert.match(await page.locator('.path-count').innerText(), /^3 \/ /);
      assert.equal(await page.evaluate(() => scrollY), before, 'Path drag does not scroll');
    }
    for (const type of [
      'logic grids',
      'logic equations',
      'sudoku',
      'number constraints',
      'tangrams',
      'sequences',
    ]) {
      await page.goto(`${base}puzzles.html?type=${encodeURIComponent(type)}`);
      await page.locator('.puzzle-controls > *').first().waitFor();
      if (type.startsWith('logic')) {
        const cell = page.locator('.candidate').first();
        await cell.tap();
        assert.equal(await cell.innerText(), '×');
        await cell.tap();
        assert.equal(await cell.innerText(), '✓');
      } else if (['sudoku', 'number constraints'].includes(type)) {
        const cell = page.locator('.digit-cell:not(.given)').first();
        await cell.tap();
        await page.locator('[data-challenge-action="digit"][data-value="1"]').tap();
        assert.equal(await cell.locator('strong').innerText(), '1');
      } else if (type === 'tangrams') {
        await page.locator('[data-challenge-action="piece"]').first().tap();
        const board = page.locator('[data-tiling-board]');
        const before = await board.locator('polygon').count();
        await board.tap();
        assert.ok((await board.locator('polygon').count()) > before);
      } else {
        const field = page.locator('.puzzle-controls input[data-part]').first();
        await field.tap();
        assert.ok(await field.evaluate((el) => document.activeElement === el));
      }
    }
  } finally {
    await context.close();
  }
}
