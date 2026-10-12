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
import { foundationTopics } from '../../src/lib/content/topic-routes.mjs';
import { artifacts, createTestContext, selectTopic } from './support.mjs';

/**
 * Focused visual behaviour checks, runnable without the full activity suite.
 * Exercise responsive layout, canvas release handling and deterministic demo timing.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: createTestContext, image.
 * @example await checkPresentation(browser, "http://127.0.0.1:8766/"); // Check a running static preview.
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
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Presentation Student');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const topicSelector = page.getByLabel('Topic', { exact: true });
    const originalTopic = 'M10';
    const topics = foundationTopics.map((topic) => topic.bank);
    for (const width of [
      320, 360, 375, 439, 440, 441, 600, 684, 720, 744, 767, 800, 1024, 1280, 1600,
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.runFor(32);
      for (const topic of topics) {
        await selectTopic(page, topic);
        await page.locator('.intro').waitFor();
        await page.locator('.question-list li').first().waitFor();
        if (width >= 720 || (width === 600 && topic === 'M01')) {
          const rows = await page.locator('.question-list li').evaluateAll((items) => {
            const first = items[0].getBoundingClientRect();
            return items.filter(
              (item) => Math.abs(item.getBoundingClientRect().top - first.top) < 1,
            ).length;
          });
          assert.equal(
            rows,
            3,
            `${topic} assessment uses three columns when content fits at ${width}px`,
          );
        }
        if ([439, 440, 600, 768, 800].includes(width) && topic === 'M01')
          await page.screenshot({ path: `${artifacts}/topic-header-${width}.png`, fullPage: true });
        if (width === 800 && topic === 'M01')
          await page.screenshot({ path: `${artifacts}/assessment-spacing.png`, fullPage: true });
        const stageGap = await page
          .locator('.intro')
          .evaluate(
            (intro) =>
              (document.querySelector('.learning-header').getBoundingClientRect().top -
                intro.getBoundingClientRect().bottom) /
              parseFloat(getComputedStyle(document.documentElement).fontSize),
          );
        assert.ok(Math.abs(stageGap - 2) < 0.05, `Intro/stage breathing room at ${width}px`);
        const layout = await page.locator('.intro').evaluate((intro) => {
          const bounds = intro.getBoundingClientRect();
          const input = intro.querySelector('#practice-code');
          const go = intro.querySelector('button[type="submit"]').getBoundingClientRect();
          const select = intro.querySelector('.topic-selector').getBoundingClientRect();
          const title = intro.querySelector('.intro-title').getBoundingClientRect();
          const controls = intro.querySelector('.intro-controls').getBoundingClientRect();
          const inputStyle = getComputedStyle(input);
          const textMeasure = document.createElement('canvas').getContext('2d');
          textMeasure.font = `${inputStyle.fontWeight} ${inputStyle.fontSize} ${inputStyle.fontFamily}`;
          return {
            sameRow: Math.abs(title.top - controls.top) < 1,
            right: bounds.right,
            left: bounds.left,
            goRight: go.right,
            selectRight: select.right,
            inputLeft: input.getBoundingClientRect().left,
            inputWidth: input.getBoundingClientRect().width,
            preferredWidth: 15 * parseFloat(getComputedStyle(document.documentElement).fontSize),
            columnGap: controls.left - title.right,
            titleSize: parseFloat(getComputedStyle(intro.querySelector('h1')).fontSize),
            subjectSize: parseFloat(getComputedStyle(intro.querySelector('.eyebrow')).fontSize),
            promptFits:
              textMeasure.measureText(input.placeholder).width <=
              input.clientWidth -
                parseFloat(inputStyle.paddingLeft) -
                parseFloat(inputStyle.paddingRight),
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
        assert.ok(layout.promptFits, `Complete search prompt fits at ${width}/${topic}`);
        assert.equal(
          await page.locator('header').getByRole('link', { name: 'Puzzles', exact: true }).count(),
          0,
        );
        assert.equal(
          await page
            .locator('header')
            .getByRole('link', { name: 'Back to topics', exact: true })
            .count(),
          0,
        );
        assert.equal(
          await page
            .locator('.intro-title')
            .getByRole('link', { name: 'Foundation maths', exact: true })
            .getAttribute('href'),
          '/',
        );
        if ([684, 744].includes(width) && topic === 'M01') {
          const welcome = await page.locator('#welcome').innerText();
          await page.locator('#welcome').evaluate((el) => (el.textContent = 'Welcome back, test!'));
          await page.clock.runFor(32);
          assert.ok(
            await page.locator('header').evaluate((header) => {
              const brand = header.querySelector('.brand').getBoundingClientRect(),
                actions = header.querySelector('.header-actions').getBoundingClientRect();
              return Math.abs(brand.top + brand.height / 2 - actions.top - actions.height / 2) < 1;
            }),
            'A short account name fits on one header line below 768px',
          );
          await page
            .locator('header')
            .screenshot({ path: `${artifacts}/header-intrinsic-${width}.png` });
          await page.locator('#welcome').evaluate((el, text) => (el.textContent = text), welcome);
          await page.clock.runFor(32);
        }
        const headerFlow = await page.locator('header').evaluate((header) => {
          const style = getComputedStyle(header),
            brand = header.querySelector('.brand').getBoundingClientRect(),
            actions = header.querySelector('.header-actions').getBoundingClientRect(),
            tools = header.querySelector('.header-tools').getBoundingClientRect();
          const available =
            header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          const needed =
            brand.width +
            actions.width +
            tools.width +
            32 +
            parseFloat(style.getPropertyValue('--control-gap')) +
            5;
          const progress = header
            .querySelector('a[href$="/progress.html"]')
            .getBoundingClientRect();
          return {
            natural:
              needed > available ||
              Math.abs(brand.top + brand.height / 2 - actions.top - actions.height / 2) < 1,
            margin: getComputedStyle(header.querySelector('.header-actions')).marginLeft === '32px',
            progress: Math.abs(progress.right - actions.right) < 1,
            rightEdge: header.classList.contains('header-single-row')
              ? Math.abs(
                  tools.left -
                    progress.right -
                    parseFloat(style.columnGap || 0) -
                    parseFloat(getComputedStyle(header.querySelector('.header-tools')).marginLeft),
                ) < 1
              : Math.abs(
                  actions.right -
                    header.getBoundingClientRect().right +
                    parseFloat(style.paddingRight),
                ) < 1,
            logoGap:
              !header.classList.contains('header-single-row') ||
              Math.abs(actions.left - brand.right - 32) < 1,
            mainNotCentred: getComputedStyle(document.querySelector('main')).textAlign !== 'center',
            footerCentred:
              getComputedStyle(document.querySelector('footer')).textAlign === 'center',
          };
        });
        assert.ok(Object.values(headerFlow).every(Boolean), JSON.stringify(headerFlow));
        const menuLayout = await page.locator('header').evaluate((header) => {
          const menu = header.querySelector('.menu-toggle').getBoundingClientRect();
          const picker = header.querySelector('#theme-picker').getBoundingClientRect();
          const toggle = header.querySelector('#theme-toggle').getBoundingClientRect();
          const brand = header.querySelector('.brand').getBoundingClientRect();
          const main = document.querySelector('main');
          return {
            menuRight: menu.right,
            atTop:
              Math.abs(
                menu.top -
                  header.getBoundingClientRect().top -
                  parseFloat(getComputedStyle(header).paddingTop),
              ) < 1,
            contentRight:
              main.getBoundingClientRect().right - parseFloat(getComputedStyle(main).paddingRight),
            ordered:
              brand.right <= picker.left &&
              picker.right <= toggle.left &&
              toggle.right <= menu.left,
            aligned: Math.abs(picker.top - menu.top) < 1 && Math.abs(toggle.top - menu.top) < 1,
          };
        });
        assert.ok(
          Math.abs(menuLayout.menuRight - menuLayout.contentRight) < 1,
          `Menu shares the page gutter: ${width}/${topic}`,
        );
        assert.ok(
          menuLayout.ordered && menuLayout.aligned && menuLayout.atTop,
          `Theme controls stay beside menu: ${width}/${topic}`,
        );
        assert.equal(await topicSelector.textContent(), 'Topic');
        assert.ok(layout.titleSize >= 28, 'Topic heading starts at the chosen 28px scale');
        assert.ok(
          Math.abs(layout.subjectSize - 12.48) < 0.05,
          'Preserve the subject eyebrow scale',
        );
        if (width >= 440) {
          assert.ok(layout.sameRow, `Header text wraps beside controls at ${width}/${topic}`);
          assert.ok(layout.columnGap >= 28 - 1, `Header columns have breathing room at ${width}`);
        }
        if (width < 440)
          assert.ok(!layout.sameRow, `Header controls stack on small screens: ${width}/${topic}`);
        assert.ok(
          layout.inputWidth <= layout.preferredWidth + 1,
          `Search stays compact: ${width}/${topic}`,
        );
      }
    }
    await page.setViewportSize({ width: 1280, height: 1000 });
    await selectTopic(page, originalTopic);
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
    for (const width of [1280, 1000, 940, 920, 769, 768, 767, 600, 480, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.runFor(32);
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
      if (width >= 767 && width <= 769) {
        const columns = await page
          .locator('.question-workspace')
          .evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
        assert.equal(columns, 2, `Question/working remain side by side at ${width}px`);
      }
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
          const number = document.createRange();
          number.selectNodeContents(card.querySelector('.num'));
          return (
            rects.length === 1 &&
            number.getBoundingClientRect().bottom < rects[0].top &&
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
      const insets = await page.locator('#active-question').evaluate((question) =>
        ['#active-question-title', '.active-question-content'].map((selector) => {
          const style = getComputedStyle(question.querySelector(selector));
          return parseFloat(style.marginInlineStart) / parseFloat(style.fontSize);
        }),
      );
      assert.deepEqual(insets, [1, 2], `Separate title/content insets at ${width}px`);
      const workingFits = await page.locator('#working-tools').evaluate((tools) => {
        const card = tools.closest('.working');
        const bounds = card.getBoundingClientRect();
        const style = getComputedStyle(card);
        const left = bounds.left + parseFloat(style.borderLeftWidth);
        const right = bounds.right - parseFloat(style.borderRightWidth);
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
      assert.ok(layout.rows.every((row) => row.length <= 3));
      if (width >= 1000) assert.equal(layout.rows[0].length, 3);
      for (const row of layout.rows)
        assert.ok(
          Math.max(...row) - Math.min(...row) < 1,
          `Equal button widths per row at ${width}px`,
        );
      if ([940, 390].includes(width))
        await page.screenshot({ path: `${artifacts}/flex-questions-${width}.png`, fullPage: true });
    }
    // Phone cards use the available viewport width; short questions pair without shrinking maths.
    await selectTopic(page, 'M01');
    await page.locator('[data-mode="plain"]').click();
    await page.locator('#level').selectOption('0');
    for (const width of [360, 390, 440, 767, 768]) {
      await page.setViewportSize({ width, height: 956 });
      const mobile = await page.locator('.question-panel').evaluate((panel) => {
        const bounds = panel.getBoundingClientRect();
        const style = getComputedStyle(panel);
        const rows = new Map();
        for (const button of panel.querySelectorAll('.question-option')) {
          const box = button.getBoundingClientRect();
          const top = Math.round(box.top);
          rows.set(top, [...(rows.get(top) ?? []), box.width]);
        }
        return {
          left: bounds.left,
          right: bounds.right,
          sideBorder: parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth),
          topBorder: parseFloat(style.borderTopWidth),
          bottomBorder: parseFloat(style.borderBottomWidth),
          rows: [...rows.values()],
          background: style.backgroundImage,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      if (width < 768) {
        assert.ok(Math.abs(mobile.left) < 1 && Math.abs(mobile.right - width) < 1);
        assert.equal(mobile.sideBorder, 0);
        assert.ok(mobile.topBorder > 0 && mobile.bottomBorder > 0);
        assert.ok(
          mobile.background.includes('90deg'),
          'Phone card border gradient runs horizontally',
        );
      } else {
        assert.ok(mobile.left > 0 && mobile.right < width && mobile.sideBorder > 0);
      }
      assert.ok(
        mobile.rows.every((row) => row.length === 2 && Math.max(...row) - Math.min(...row) < 1),
        `Short questions pair equally at ${width}px`,
      );
      assert.equal(mobile.overflow, false);
      if ([360, 390, 768].includes(width))
        await page.screenshot({
          path: `${artifacts}/mobile-questions-${width}.png`,
          fullPage: true,
        });
    }
    await page.locator('#level').selectOption('2');
    for (const width of [360, 394, 768]) {
      await page.setViewportSize({ width, height: 956 });
      await page.clock.runFor(32);
      // ResizeObserver regrouping is native; a virtual-clock step does not guarantee its delivery.
      await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
      assert.equal(await page.getByRole('combobox', { name: 'Level', exact: true }).count(), 1);
      // Read both controls in one layout snapshot; regrouping can move the whole panel.
      const { method, level } = await page.locator('.level-row').evaluate((row) => ({
        method: row.querySelector('#reference').getBoundingClientRect().toJSON(),
        level: row.querySelector('#level').getBoundingClientRect().toJSON(),
      }));
      assert.ok(
        method.x >= level.x + level.width &&
          Math.abs(method.y + method.height / 2 - level.y - level.height / 2) < 4,
        `Check method stays beside Level at ${width}px: ${JSON.stringify({ method, level })}`,
      );
      const confidence = await page.locator('.question-list').evaluate((list) => {
        const buttons = [...list.querySelectorAll('.question-option')];
        const boxes = buttons.map((button) => button.getBoundingClientRect());
        return {
          fourByFour: buttons.filter((button) => /\d,\d{3} × \d,\d{3}/.test(button.textContent))
            .length,
          paired: boxes.every((box) => {
            const row = boxes.filter((other) => Math.abs(other.top - box.top) < 1);
            return row.length === 2 && row.every((other) => Math.abs(other.width - box.width) < 1);
          }),
          clear: buttons.every((button) => {
            const content = button.querySelector('.question-content').getBoundingClientRect();
            const number = button.querySelector('.num').getBoundingClientRect();
            // Exercise a result marker without changing learner state.
            button.querySelector('.question-outcome').textContent = '✓';
            const outcome = button.querySelector('.question-outcome').getBoundingClientRect();
            const bounds = button.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(button.querySelector('.equation'));
            const text = range.getBoundingClientRect();
            return (
              number.bottom <= content.top &&
              content.bottom <= outcome.top &&
              text.left > bounds.left &&
              text.right < bounds.right &&
              Math.abs(text.left + text.right - bounds.left - bounds.right) < 2
            );
          }),
          overflow: document.documentElement.scrollWidth > innerWidth,
          outside: [...document.querySelectorAll('body *')]
            .filter((node) => {
              const box = node.getBoundingClientRect();
              return box.width && box.right > innerWidth + 1;
            })
            .map((node) => ({
              tag: node.tagName,
              class: node.className,
              right: node.getBoundingClientRect().right,
            })),
        };
      });
      assert.ok(confidence.fourByFour > 0, 'Confidence sample includes 4×4-digit questions');
      assert.ok(
        confidence.paired && confidence.clear && !confidence.overflow,
        `Confidence pairs, corner labels and centred maths at ${width}px: ${JSON.stringify(confidence)}`,
      );
      await page.locator('.question-outcome').evaluateAll((markers) =>
        markers.forEach((marker) => {
          marker.textContent = '';
        }),
      );
      await page.screenshot({
        path: `${artifacts}/confidence-questions-${width}.png`,
        fullPage: true,
      });
    }
    await selectTopic(page, originalTopic);
    await page.locator('[data-mode="plain"]').click();
    await page.locator('#level').selectOption('2');
    // A longer expression can share an equal-width pair if both still fit.
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
        fills: Math.abs(boxes[0].width - row.width) < 1,
        equalRows: boxes.every((box) =>
          boxes
            .filter((other) => Math.abs(other.top - box.top) < 1)
            .every((other) => Math.abs(other.width - box.width) < 1),
        ),
        centred: Math.abs((boxes[0].left + boxes[0].right - row.left - row.right) / 2) < 1,
        paired,
      };
    });
    assert.ok(
      extended.fills && extended.centred && extended.paired && extended.equalRows,
      `Long expressions stay centred; shorter cards can still share rows: ${JSON.stringify(extended)}`,
    );
    await page.screenshot({ path: `${artifacts}/flex-mixed-widths.png`, fullPage: true });
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.locator('[data-mode="errors"]').click();
    assert.equal(await page.locator('.question-option').count(), 4);
    const partial = await page.locator('.question-list').evaluate((list) => {
      const boxes = [...list.querySelectorAll('li')].map((item) => item.getBoundingClientRect());
      const bounds = list.getBoundingClientRect(),
        last = boxes.at(-1);
      return {
        count: boxes.filter((box) => Math.abs(box.top - last.top) < 1).length,
        centred: Math.abs(last.left + last.right - bounds.left - bounds.right) < 1,
        natural: last.width < bounds.width / 2,
      };
    });
    assert.ok(partial.count === 1 && partial.centred && partial.natural, JSON.stringify(partial));
    await page.screenshot({ path: `${artifacts}/error-questions-four.png`, fullPage: true });
    await page.locator('[data-mode="plain"]').click();
    console.log(
      'Flex layout: intact bank expressions, equal row widths and short-question pairs down to 360px.',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('[data-mode="demo"]').click();
    assert.deepEqual(
      await page.locator('.demo-controls').evaluate((element) => {
        const style = getComputedStyle(element);
        return { gap: style.gap, display: style.display, position: style.position };
      }),
      { gap: '10px', display: 'flex', position: 'static' },
      'Demo controls retain their spacing below the animated working',
    );
    assert.equal(await page.locator('.balance tr.reveal').count(), 0);

    // Pause ahead of the browser clock; screenshot work can leave it ahead of host time.
    await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
    await page.locator('[data-demo-speed]').selectOption('0.5');
    await page.locator('#demo-play').click();
    const firstRow = page.locator('.demo-working tr').first();
    const leftInk = firstRow.locator('.lhs span');
    const equalsInk = firstRow.locator('.equals span');
    const rightInk = firstRow.locator('.rhs span');
    assert.equal(await leftInk.isVisible(), false, 'Line precedes all writing');
    await page.clock.runFor(1300);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    const dividerMotion = await page.locator('.demo-working .equation-divider').evaluate((col) => {
      const animation = col.getAnimations()[0];
      return { state: animation?.playState, frames: animation?.effect.getKeyframes() };
    });
    assert.equal(dividerMotion.state, 'paused', 'Pausing also holds native guide animation');
    assert.notEqual(dividerMotion.frames[0].backgroundSize, dividerMotion.frames[1].backgroundSize);
    await page.locator('#demo-play').click();
    await page.clock.runFor(3 * 1300);
    assert.equal(await leftInk.isVisible(), false, 'Finish drawing the divider before writing');
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
    assert.equal(await page.locator('.demo-working .balance .unwritten').count(), 0);
    await page.locator('[data-demo-speed]').selectOption('2');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#demo-play').click();
    await page.waitForFunction(() => {
      const rect = document.querySelector('.demo-stage').getBoundingClientRect();
      return rect.top >= 0 && rect.top < innerHeight;
    });
    await page.clock.runFor(2600);
    assert.equal(await page.locator('.demo-working tr[data-step]').count(), 2);
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.locator('[data-demo-level="2"]').click();
    await page.locator('#demo-play').click();
    const readingPosition = await page.evaluate(() => scrollY);
    // Confidence may begin with two equation rows (three reveals each).
    await page.clock.runFor(3900);
    assert.ok((await page.locator('.demo-working tr[data-step]').count()) >= 3);
    assert.equal(
      await page.evaluate(() => scrollY),
      readingPosition,
      'Playback preserves the reading position',
    );
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.screenshot({ path: `${artifacts}/demo-speed-mobile.png`, fullPage: true });
    // Demos start compact, then grow below the question without automatic scrolling.
    for (const width of [360, 768]) {
      await page.setViewportSize({ width, height: 956 });
      for (const topic of ['M01', 'M02', 'M10']) {
        await selectTopic(page, topic);
        await page.locator('[data-mode="demo"]').click();
        await page.locator('[data-demo-level="2"]').click();
        await page.locator('[data-demo-speed]').selectOption('2');
        assert.equal(
          await page.locator('.demo-working').count(),
          0,
          'No empty drawing area before playback',
        );
        const controlsBefore = await page
          .locator('.demo-controls')
          .evaluate((el) => el.getBoundingClientRect().top + scrollY);
        if (topic === 'M01' && width === 360)
          await page.screenshot({ path: `${artifacts}/method-ready-360.png`, fullPage: true });
        await page.locator('#demo-play').click();
        const controlsAfter = await page
          .locator('.demo-controls')
          .evaluate((el) => el.getBoundingClientRect().top + scrollY);
        assert.ok(controlsAfter > controlsBefore, 'Controls move down when working appears');
        const start = await page.evaluate(() => scrollY);
        const descriptions = page.locator(
          topic === 'M10' ? '.demo-working .step-note' : '.demo-stage .steps li',
        );
        const count = await descriptions.count();
        assert.ok(count > 0);
        const phases = new Set();
        let previousInk = null;
        for (let elapsed = 0; elapsed < 40000; elapsed += 325) {
          await page.clock.runFor(325);
          const phase =
            topic === 'M10'
              ? null
              : await page
                  .locator('.demo-working .arithmetic-working')
                  .getAttribute('data-method-phase');
          if (topic === 'M01') {
            const ink = await page.locator('.demo-working svg text').count();
            if (['sum', 'write', 'carry'].includes(phase) && previousInk !== null)
              assert.equal(
                ink - previousInk,
                phase === 'sum' ? 0 : 1,
                `${phase}: sum before writing, then carry before the next sum`,
              );
            previousInk = ink;
          }
          if (topic === 'M10')
            assert.ok(
              await page
                .locator('.demo-working .balance')
                .evaluate((table) =>
                  [...table.querySelectorAll('tr:last-child :is(.lhs, .rhs)')].every(
                    (cell) =>
                      cell.classList.contains('unwritten') !==
                      cell.classList.contains('method-active'),
                  ),
                ),
            );
          if (phase) {
            assert.ok(
              await page.locator('.demo-working [data-method-highlight]').count(),
              `${topic}/${phase} has an operation highlight`,
            );
            if (
              width === 360 &&
              !phases.has(phase) &&
              ['sum', 'write', 'carry', 'divide'].includes(phase)
            ) {
              await page.locator('.demo-working').screenshot({
                path: `${artifacts}/method-highlight-${topic}-${phase}.png`,
                animations: 'disabled',
              });
            }
            if (
              width === 360 &&
              topic === 'M01' &&
              phase === 'sum' &&
              !phases.has('wide-diagonal') &&
              (await page.locator('[data-method-highlight="diagonal"]').count()) >= 3
            ) {
              await page.locator('.demo-working').screenshot({
                path: `${artifacts}/method-highlight-M01-diagonal.png`,
                animations: 'disabled',
              });
              phases.add('wide-diagonal');
            }
            phases.add(phase);
          }
          assert.equal(
            await page.evaluate(() => scrollY),
            start,
            `${topic} playback does not scroll at ${width}px`,
          );
          const highlighting = await page.locator('.demo-stage').evaluate((stage) => {
            const notes = [...stage.querySelectorAll('.steps li, .step-note')];
            return {
              count: notes.length,
              active: notes.flatMap((note, index) =>
                note.getAttribute('aria-current') === 'step' ? [index + 1] : [],
              ),
              step: Number(stage.querySelector('.demo-status').textContent.match(/Step (\d+)/)[1]),
            };
          });
          assert.equal(highlighting.count, topic === 'M10' ? highlighting.step : count);
          assert.deepEqual(
            highlighting.active,
            [highlighting.step],
            'Highlight follows the current logical step',
          );
        }
        if (topic === 'M01')
          for (const phase of ['multiply', 'tens', 'units', 'sum', 'write', 'carry'])
            assert.ok(phases.has(phase), phase);
        if (topic === 'M02')
          for (const phase of ['divide', 'write', 'carry']) assert.ok(phases.has(phase), phase);
        const geometry = await page.locator('.demo-stage').evaluate((stage) => {
          const question = stage.querySelector('.selected-equation').getBoundingClientRect();
          const working = stage.querySelector('.demo-working').getBoundingClientRect();
          const controls = stage.querySelector('.demo-controls').getBoundingClientRect();
          const descriptions = [...stage.querySelectorAll('.steps li, .step-note')];
          return {
            ordered: question.bottom <= working.top && working.bottom <= controls.top,
            sizes: descriptions.map((item) => getComputedStyle(item).fontSize),
            visible: descriptions.every((item) => getComputedStyle(item).visibility === 'visible'),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        assert.ok(geometry.ordered && geometry.visible && !geometry.overflow);
        assert.ok(
          geometry.sizes.every((size) => size === (width < 768 ? '14px' : '16px')),
          `${topic} description sizes at ${width}px: ${geometry.sizes}`,
        );
        if (topic !== 'M10') {
          assert.equal(
            await page.locator('.demo-working ol').count(),
            1,
            'Calculation notes remain below the diagram',
          );
          assert.equal(
            await page.locator('.demo-working p').count(),
            1,
            'The final answer remains below the calculation notes',
          );
        }
        if (topic !== 'M10') {
          const note = await page.locator('.demo-working ol li').first().innerText();
          assert.match(
            note,
            topic === 'M01'
              ? /^\d+ \+ carry \d+ = \d+: write \d/
              : /^\d+ ÷ \d+ = \d+, remainder \d+/,
          );
          assert.doesNotMatch(
            await page.locator('.demo-working').innerText(),
            /Draw the grid|Draw the bus-stop|Tens go above/,
          );
        }
        // Timers are virtual; settle native ink interpolation for a complete end-state capture.
        await page
          .locator('.demo-stage')
          .evaluate((stage) =>
            stage.getAnimations({ subtree: true }).forEach((animation) => animation.finish()),
          );
        await page.screenshot({
          path: `${artifacts}/method-layout-${topic}-${width}.png`,
          fullPage: true,
        });
      }
    }
    await selectTopic(page, originalTopic);
    await page.locator('[data-mode="demo"]').click();
    await page.setViewportSize({ width: 390, height: 844 });
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
    for (const width of [
      320, 360, 390, 439, 440, 441, 480, 510, 540, 677, 678, 679, 767, 768, 769, 1023, 1024, 1025,
      1149, 1150, 1151, 1600,
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.runFor(32);
      for (const mode of ['assessment', 'demo', 'scaffolded', 'errors', 'plain']) {
        await page.locator(`[data-mode="${mode}"]`).click();
        // ResizeObserver groups rows before their final flex sizing is measured.
        await page.waitForFunction(() => document.querySelector('.learning-steps.sized'));
        await page.clock.runFor(32);
        const geometry = await page.locator('.learning-header').evaluate((header) => {
          const nav = header.querySelector('nav');
          const navBounds = nav.getBoundingClientRect();
          return {
            width: navBounds.width,
            rowsInsideGutter: [...nav.querySelectorAll('.stage-row')].every(
              (row) =>
                Math.abs(row.firstElementChild.getBoundingClientRect().left - navBounds.left) < 1 &&
                row.lastElementChild.getBoundingClientRect().right <= navBounds.right + 1,
            ),
            fillsFirstRow:
              Math.abs(
                nav.querySelector('.stage-row').lastElementChild.getBoundingClientRect().right -
                  navBounds.right,
              ) < 1,
            naturalLaterRows: [...nav.querySelectorAll('.stage-row')].slice(1).every((row) => {
              const buttons = [...row.querySelectorAll('button')];
              const sizes = buttons.map((button) => {
                const label = button.querySelector('.stage-label');
                const probe = label.cloneNode(true);
                probe.style.cssText = 'position:absolute;white-space:nowrap;width:max-content';
                button.append(probe);
                const style = getComputedStyle(button);
                const natural =
                  probe.getBoundingClientRect().width +
                  ['paddingLeft', 'paddingRight', 'borderLeftWidth', 'borderRightWidth'].reduce(
                    (sum, property) => sum + parseFloat(style[property]),
                    0,
                  );
                probe.remove();
                return {
                  natural,
                  actual: button.getBoundingClientRect().width,
                  margin: parseFloat(style.marginLeft),
                };
              });
              const roomForNaturalWidths =
                sizes.reduce((sum, size) => sum + size.natural + size.margin, 0) <=
                navBounds.width - parseFloat(getComputedStyle(row).paddingLeft);
              return sizes.every(
                ({ actual, natural }) =>
                  actual <= natural + 1 &&
                  (!roomForNaturalWidths || Math.abs(actual - natural) < 1),
              );
            }),
            labelLines: [...nav.querySelectorAll('.stage-label')].map((label) => {
              const tops = new Set(
                [...label.querySelectorAll('span')].flatMap((phrase) =>
                  [...phrase.getClientRects()].map((rect) => Math.round(rect.top)),
                ),
              );
              return tops.size;
            }),
            joins: [...nav.querySelectorAll('button')].every((button) => {
              if (!button.previousElementSibling) return true;
              const previous = button.previousElementSibling.getBoundingClientRect();
              const current = button.getBoundingClientRect();
              if (Math.abs(previous.top - current.top) > 1) return true;
              const depth = parseFloat(getComputedStyle(button).clipPath.split(',').at(-1));
              // Read the resolved notch coordinate from the final polygon point.
              return Math.abs(previous.right - current.left - depth) < 0.1;
            }),
            progress: header.querySelector('.progress-card')
              ? {
                  display: getComputedStyle(header.querySelector('.progress-card')).display,
                  meter: getComputedStyle(header.querySelector('.progress-card'))
                    .getPropertyValue('--meter-width')
                    .trim(),
                  columns: getComputedStyle(header).gridTemplateColumns.split(' ').length,
                }
              : null,
            ratio: nav.getBoundingClientRect().width / header.getBoundingClientRect().width,
            gapRem:
              (nav.getBoundingClientRect().top -
                document.querySelector('.intro').getBoundingClientRect().bottom) /
              parseFloat(getComputedStyle(document.documentElement).fontSize),
            labelSize: getComputedStyle(nav.querySelector('button')).fontSize,
            earlier: nav.querySelectorAll('.earlier-stage').length,
            overflow: document.documentElement.scrollWidth > innerWidth,
            buttonsFit: [...nav.querySelectorAll('button')].every((button) => {
              const style = getComputedStyle(button);
              const range = document.createRange();
              range.selectNodeContents(button);
              const bounds = button.getBoundingClientRect();
              return (
                button.scrollWidth <= button.clientWidth + 1 &&
                [...range.getClientRects()].every(
                  (text) =>
                    text.left >= bounds.left + parseFloat(style.paddingLeft) - 1 &&
                    text.right <= bounds.right - parseFloat(style.paddingRight) + 1,
                )
              );
            }),
          };
        });
        assert.ok(
          geometry.fillsFirstRow,
          `${mode} first row fills its available width at ${width}px`,
        );
        assert.ok(geometry.naturalLaterRows, `${mode} later rows use natural widths at ${width}px`);
        assert.ok(
          geometry.rowsInsideGutter,
          `${mode} chevron forks stay inside the gutters at ${width}px`,
        );
        if (width >= 768) assert.ok(geometry.width <= 780, 'Desktop navigation is capped at 780px');
        assert.ok(
          geometry.labelLines.every((lines) => lines <= 2),
          `${mode} stage labels need at most two lines at ${width}px`,
        );
        if (width === 1600)
          assert.ok(
            geometry.labelLines.every((lines) => lines === 1),
            'Labels use one line when space permits',
          );
        assert.ok(
          Math.abs(geometry.gapRem - 2) < 0.05,
          `${mode} has the same stage gap at ${width}px`,
        );
        assert.equal(
          geometry.earlier,
          ['assessment', 'demo', 'scaffolded', 'errors', 'plain'].indexOf(mode),
        );
        assert.ok(geometry.joins, `${mode} chevron joins have no background gap at ${width}px`);
        if ([390, 480, 510, 540, 768].includes(width) && ['assessment', 'plain'].includes(mode))
          await page.locator('.learning-steps').screenshot({
            path: `${artifacts}/chevron-joins-${mode}-${width}.png`,
          });
        assert.equal(geometry.labelSize, '15px', `${mode} stage labels retain the chosen size`);
        assert.equal(geometry.overflow, false, `${mode} header fits at ${width}px`);
        const panel = await page.locator('.stage-panel').evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            left: bounds.left,
            right: bounds.right,
            sides: parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth),
            top: parseFloat(style.borderTopWidth),
            bottom: parseFloat(style.borderBottomWidth),
            radius: parseFloat(style.borderTopLeftRadius),
            background: style.backgroundImage,
          };
        });
        if (width < 768) {
          assert.ok(
            Math.abs(panel.left) < 1 && Math.abs(panel.right - width) < 1,
            `${mode} fills viewport at ${width}px`,
          );
          assert.equal(panel.sides, 0);
          assert.equal(panel.radius, 0);
          assert.ok(panel.top > 0 && panel.bottom > 0 && panel.background.includes('90deg'));
        } else {
          assert.ok(
            panel.left > 0 && panel.right < width && panel.sides > 0 && panel.radius > 0,
            `${mode} restores inset card at ${width}px`,
          );
        }
        if (geometry.progress) {
          assert.equal(geometry.progress.display, width < 678 ? 'flex' : 'grid');
          assert.equal(geometry.progress.meter, width < 1024 ? '4rem' : '6rem');
          assert.equal(geometry.progress.columns, width < 768 ? 1 : 2);
        }

        assert.equal(geometry.buttonsFit, true, `${mode} stage labels fit at ${width}px`);
        if (width >= 768 && width < 1600)
          assert.ok(geometry.ratio >= 0.6, `${mode} cannot squeeze stage navigation`);
        if (width === 768 && mode === 'scaffolded')
          await page.screenshot({ path: `${artifacts}/scaffolded-header.png`, fullPage: true });
      }
    }
    const focusedStage = page.locator('[data-mode="plain"]');
    await focusedStage.focus();
    for (const width of [360, 1600]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.runFor(32);
      // Wait for the new row layout and restored focus in the same DOM snapshot.
      await page.waitForFunction((width) => {
        const rows = document.querySelectorAll('.learning-steps .stage-row').length;
        return (
          (width === 360 ? rows > 1 : rows === 1) &&
          document.activeElement?.matches('[data-mode="plain"]')
        );
      }, width);
    }
    await page.locator('[data-mode="plain"]').click();
    await page.setViewportSize({ width: 767, height: 1000 });
    await page.locator('#reference').click();
    for (const width of [767, 768, 769, 1149, 1150, 1151, 767]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.clock.runFor(32);
      const dialog = page.getByRole('dialog', { name: 'Method reference' });
      if (width < 768) await dialog.waitFor();
      else {
        await page.locator('.layout.with-reference').waitFor();
        assert.equal(await dialog.count(), 0);
        const columns = await page
          .locator('.layout')
          .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
        assert.equal(columns, width < 1150 ? 1 : 2, `Reference columns at ${width}px`);
      }
    }
    await page.keyboard.press('Escape');
    // Fractional panel widths verify the half-open container boundaries without viewport rounding.
    await page.setViewportSize({ width: 1280, height: 1000 });
    const panel = page.locator('.question-panel');
    for (const width of [479.5, 480, 480.5, 649.5, 650, 650.5, 779.5, 780, 780.5]) {
      const layout = await panel.evaluate((element, width) => {
        element.style.width = `${width}px`;
        element.style.boxSizing = 'content-box';
        return {
          columns: getComputedStyle(element.querySelector('.question-list'))
            .getPropertyValue('--question-columns')
            .trim(),
          workspace: getComputedStyle(
            element.querySelector('.question-workspace'),
          ).gridTemplateColumns.split(' ').length,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      }, width);
      assert.equal(layout.columns, width >= 780 ? '3' : '2');
      assert.equal(layout.workspace, width < 650 ? 1 : 2);
      assert.equal(layout.overflow, false);
    }
    await panel.evaluate((element) => {
      element.style.removeProperty('width');
      element.style.removeProperty('box-sizing');
    });
    for (const topic of ['M01', 'M02']) {
      await selectTopic(page, topic);
      await page.locator('[data-mode="demo"]').click();
      await page.locator('[data-demo-speed]').selectOption('1');
      await page.locator('#demo-play').click();
      assert.equal(await page.locator('.arithmetic-working svg text').count(), 0);
      await page.clock.runFor(650);
      await page.getByRole('button', { name: 'Pause', exact: true }).click();
      const strokes = await page.locator('.method-guide').evaluateAll((paths) =>
        paths.flatMap((path) =>
          path.getAnimations().map((animation) => ({
            state: animation.playState,
            frames: animation.effect.getKeyframes(),
          })),
        ),
      );
      assert.ok(strokes.length > 0, `${topic} draws its guide with native stroke animation`);
      assert.ok(strokes.every((stroke) => stroke.state === 'paused'));
      assert.ok(
        strokes.some(
          (stroke) => stroke.frames[0].strokeDashoffset !== stroke.frames[1].strokeDashoffset,
        ),
      );
      await page.locator('#demo-all').click();
      assert.ok((await page.locator('.arithmetic-working svg text').count()) > 0);
    }
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
