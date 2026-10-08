/**
 * Purpose: Check responsive question layout, working-pad interaction and controlled demo playback.
 *
 * Main contents:
 * - checkPresentation
 *
 * Used By: website/scripts/browser-checks.mjs
 *
 * Uses: website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions).
 */
import assert from 'node:assert/strict';
import { artifacts, createTestContext } from './support.mjs';

/**
 * Focused visual behaviour checks, runnable without the full activity suite.
 * Exercise responsive layout, canvas release handling and deterministic demo timing.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: createTestContext, image.
 * @example checkPresentation(browser, base);
 */
export async function checkPresentation(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 1280, height: 1000 } });
  const page = await context.newPage();
  // Install before app startup so its injected timer captures the controlled clock.
  await page.clock.install();
  const errors = [],
    consoleErrors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  try {
    await page.goto(base);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Presentation Student');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const topicSelector = page.getByLabel('Topic', { exact: true });
    const originalTopic = await topicSelector.inputValue();
    const topics = await topicSelector
      .locator('option')
      .evaluateAll((options) => options.map((option) => option.value));
    for (const width of [320, 375, 600, 720, 800, 1024, 1280, 1600]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const topic of topics) {
        await topicSelector.selectOption(topic);
        const layout = await page.locator('.intro').evaluate((intro) => {
          const bounds = intro.getBoundingClientRect();
          const input = intro.querySelector('#practice-code');
          const go = intro.querySelector('button[type="submit"]').getBoundingClientRect();
          const select = intro.querySelector('select').getBoundingClientRect();
          const title = intro.querySelector('.intro-title').getBoundingClientRect();
          const controls = intro.querySelector('.intro-controls').getBoundingClientRect();
          return {
            sameRow: Math.abs(title.top - controls.top) < 1,
            right: bounds.right,
            left: bounds.left,
            goRight: go.right,
            selectRight: select.right,
            inputLeft: input.getBoundingClientRect().left,
            inputWidth: input.getBoundingClientRect().width,
            preferredWidth: 15 * parseFloat(getComputedStyle(document.documentElement).fontSize),
          };
        });
        assert.ok(
          Math.abs(layout.goRight - layout.right) < 1,
          `Go respects gutter: ${width}/${topic}`,
        );
        assert.ok(
          Math.abs(layout.selectRight - layout.right) < 1,
          `Topic respects gutter: ${width}/${topic}`,
        );
        assert.ok(layout.inputLeft >= layout.left - 1, `Search fits header: ${width}/${topic}`);
        if (width >= 720)
          assert.ok(layout.sameRow, `Header text wraps beside controls at ${width}/${topic}`);
        if (width <= 375)
          assert.ok(!layout.sameRow, `Header controls stack on small screens: ${width}/${topic}`);
        assert.ok(
          layout.inputWidth <= layout.preferredWidth + 1,
          `Search stays compact: ${width}/${topic}`,
        );
      }
    }
    await page.setViewportSize({ width: 1280, height: 1000 });
    await topicSelector.selectOption(originalTopic);
    await page.locator('[data-mode="plain"]').click();
    await page.locator('#level').selectOption('2');
    const pad = page.locator('#working');
    /**
     * Return the working canvas PNG data URL for before/after stroke comparisons.
     * Used by: checkPresentation.
     */
    const image = () => pad.evaluate((canvas) => canvas.toDataURL());
    for (const loseCapture of [false, true]) {
      await pad.evaluate((canvas) => canvas.scrollIntoView({ block: 'center' }));
      const box = await pad.boundingBox();
      const start = { x: box.x + 30, y: box.y + 30 };
      await page.mouse.move(start.x, start.y);
      await page.mouse.down();
      await page.mouse.move(start.x + 40, start.y + 40);
      if (loseCapture) {
        // Model capture loss before an outside release (e.g. browser interruption).
        await pad.evaluate((canvas) => {
          canvas.addEventListener(
            'pointermove',
            (event) => {
              canvas.releasePointerCapture(event.pointerId);
            },
            { once: true },
          );
        });
        await page.mouse.move(start.x + 45, start.y + 45);
      }
      await page.mouse.move(box.x + box.width + 15, start.y + 50);
      await page.mouse.up();
      const released = await image();
      await page.mouse.move(start.x + 80, start.y + 80);
      await page.mouse.move(start.x + 100, start.y + 100);
      assert.ok(
        (await image()) === released,
        `Hover after outside release must not draw (capture loss: ${loseCapture})`,
      );
      await page.mouse.down();
      await page.mouse.move(start.x + 120, start.y + 120);
      await page.mouse.up();
      assert.ok((await image()) !== released, 'A fresh press starts a new stroke');
      await page.locator('#clear-working').click();
      await pad.scrollIntoViewIfNeeded();
    }

    // A re-entry with no pressed button ends the stroke before another move.
    await pad.evaluate((canvas) => canvas.scrollIntoView({ block: 'center' }));
    const entryBox = await pad.boundingBox();
    await page.mouse.move(entryBox.x + 25, entryBox.y + 25);
    await pad.evaluate((canvas) => {
      canvas.addEventListener(
        'pointerdown',
        (event) => {
          canvas.dataset.testPointer = String(event.pointerId);
        },
        { once: true },
      );
    });
    await page.mouse.down();
    await page.mouse.move(entryBox.x + 45, entryBox.y + 45);
    const beforeEntry = await image();
    await pad.evaluate((canvas) => {
      const pointerId = Number(canvas.dataset.testPointer);
      canvas.dispatchEvent(new PointerEvent('pointerenter', { pointerId, buttons: 0 }));
      // Even a later pressed move cannot revive the ended stroke without a new down.
      const bounds = canvas.getBoundingClientRect();
      canvas.dispatchEvent(
        new PointerEvent('pointermove', {
          pointerId,
          buttons: 1,
          clientX: bounds.x + 100,
          clientY: bounds.y + 100,
        }),
      );
      delete canvas.dataset.testPointer;
    });
    assert.ok((await image()) === beforeEntry, 'Unpressed re-entry lifts the pen');
    await page.mouse.up();
    await page.locator('#clear-working').click();
    for (const width of [1280, 1000, 940, 920, 768, 600, 480, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const layout = await page.locator('.question-list').evaluate((list) => {
        const cards = [...list.querySelectorAll('.question-option')];
        const boxes = cards.map((card) => card.getBoundingClientRect());
        const rows = new Map();
        for (const box of boxes) {
          const top = Math.round(box.top);
          rows.set(top, [...(rows.get(top) ?? []), box.width]);
        }
        const intact = cards.every((card) => {
          const text = card.querySelector('.equation');
          const range = document.createRange();
          range.selectNodeContents(text);
          const rects = [...range.getClientRects()];
          const bounds = card.getBoundingClientRect();
          return (
            rects.length === 1 &&
            rects[0].left >= bounds.left &&
            rects[0].right <= bounds.right &&
            Math.abs((rects[0].left + rects[0].right - bounds.left - bounds.right) / 2) < 1
          );
        });
        return {
          intact,
          rows: [...rows.values()],
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      const workingFits = await page.locator('#working-tools').evaluate((tools) => {
        const card = tools.closest('.card');
        const bounds = card.getBoundingClientRect();
        const style = getComputedStyle(card);
        const left = bounds.left + parseFloat(style.borderLeftWidth);
        const right = bounds.right - parseFloat(style.borderRightWidth);
        const heading = card.querySelector('h2').getBoundingClientRect();
        if (Math.abs(heading.left - left - parseFloat(style.paddingLeft)) > 1) return false;
        // Native resize writes an inline width; even an oversized value must remain contained.
        const notes = tools.querySelector('textarea');
        notes.style.width = '2000px';
        const notesFit = notes.getBoundingClientRect().right <= right + 1;
        notes.style.removeProperty('width');
        if (!notesFit || getComputedStyle(notes).resize !== 'vertical') return false;
        return [...tools.querySelectorAll('canvas, textarea')].every((field) => {
          const rect = field.getBoundingClientRect();
          return Math.abs(rect.left - left) < 1 && Math.abs(rect.right - right) < 1;
        });
      });
      assert.ok(workingFits, `Drawing and typed working fill the card at ${width}px`);
      assert.equal(layout.intact, true, `Equations stay intact inside cards at ${width}px`);
      assert.equal(layout.overflow, false, `No page overflow at ${width}px`);
      for (const row of layout.rows)
        if (row.length === 2) assert.ok(row.every((size) => size >= 210));
      if ([940, 390].includes(width))
        await page.screenshot({ path: `${artifacts}/flex-questions-${width}.png`, fullPage: true });
    }
    // Exercise a future longer expression without adding it to authored content.
    await page.setViewportSize({ width: 1000, height: 1000 });
    const extended = await page.locator('.question-list').evaluate((list) => {
      const first = list.querySelector('.question-option');
      first.querySelector('.equation').textContent = '12(x + 10) − 8 = 3(x − 4) + 24';
      const boxes = [...list.querySelectorAll('.question-option')].map((el) =>
        el.getBoundingClientRect(),
      );
      const paired = boxes
        .slice(1)
        .some((box, index, rest) =>
          rest.some((other) => other !== box && Math.abs(other.top - box.top) < 1),
        );
      const row = first.closest('li').getBoundingClientRect();
      const container = list.getBoundingClientRect();
      return {
        full: Math.abs(row.width - container.width) < 1,
        compact: boxes[0].width < row.width - 10,
        centred: Math.abs((boxes[0].left + boxes[0].right - row.left - row.right) / 2) < 1,
        paired,
      };
    });
    assert.ok(
      extended.full && extended.compact && extended.centred && extended.paired,
      'Long button is intrinsic-width and centred in its own row; shorter cards remain paired',
    );
    await page.screenshot({ path: `${artifacts}/flex-mixed-widths.png`, fullPage: true });
    console.log(
      'Flex layout: intact bank expressions at nine widths; longer expression expands to a full row.',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-mode="demo"]').click();
    await page.clock.pauseAt(new Date());
    await page.locator('[data-demo-speed]').selectOption('0.5');
    await page.locator('#demo-play').click();
    const firstRow = page.locator('.demo-working tr').first();
    const leftInk = firstRow.locator('.lhs span');
    const equalsInk = firstRow.locator('.equals span');
    const rightInk = firstRow.locator('.rhs span');
    assert.equal(await leftInk.isVisible(), false, 'Line precedes all writing');
    await page.clock.runFor(1300);
    assert.ok(await leftInk.isVisible());
    assert.equal(await equalsInk.isVisible(), false, 'Left precedes equals');
    assert.equal(await rightInk.isVisible(), false, 'Left precedes right');
    await page.clock.runFor(1300);
    assert.ok(await equalsInk.isVisible());
    assert.equal(await rightInk.isVisible(), false, 'Equals precedes right');
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.clock.runFor(1400);
    assert.equal(await rightInk.isVisible(), false, 'Pause holds a partially written row');
    await page.locator('#demo-play').click();
    await page.clock.runFor(1300);
    assert.ok(await rightInk.isVisible());
    await page.locator('#demo-all').click();
    assert.equal(await page.locator('.demo-working .unwritten').count(), 0);
    await page.locator('[data-demo-speed]').selectOption('2');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#demo-play').click();
    await page.waitForFunction(() => {
      const rect = document.querySelector('.demo-stage').getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= innerHeight;
    });
    await page.clock.runFor(1300);
    assert.equal(await page.locator('.demo-working tr[data-step]').count(), 2);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.locator('[data-demo-level="2"]').click();
    await page.locator('#demo-play').click();
    // Confidence may begin with two equation rows (three reveals each).
    await page.clock.runFor(2600);
    assert.ok((await page.locator('.demo-working tr[data-step]').count()) >= 3);
    const row = await page.locator('.demo-working tr[data-step]').last().boundingBox();
    assert.ok(row.y >= 0 && row.y + row.height <= 845, 'Playback follows the current step');
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.screenshot({ path: `${artifacts}/demo-speed-mobile.png`, fullPage: true });
    await page.clock.resume();
    await page.reload();
    await page.locator('[data-mode="demo"]').click();
    assert.equal(
      await page.locator('[data-demo-speed]').inputValue(),
      '2',
      'Speed survives reload',
    );
    await page.locator('[data-mode="plain"]').click();
    await page.locator('#reference').click();
    assert.equal(
      await page.locator('[data-demo-speed]').inputValue(),
      '2',
      'Reference shares the profile setting',
    );
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, []);
    console.log(
      'Presentation checks passed: flex equations, play scrolling, speed persistence and shared reference settings.',
    );
  } catch (error) {
    if (errors.length || consoleErrors.length)
      console.error('Browser errors:', [...errors, ...consoleErrors]);
    await page.screenshot({ path: `${artifacts}/presentation-failure.png`, fullPage: true });
    throw error;
  } finally {
    await context.close();
  }
}
