import { stageTextFor } from '../../src/lib/content/stage-text.mjs';
import { readTopicBank } from '../read-topic-bank.mjs';
/** Exercise the isolated lattice prototype through pointer, keyboard and the shared choices. */
import assert from 'node:assert/strict';
import { foundationTopics, topicPath } from '../../src/lib/content/topic-routes.mjs';
import AxeBuilder from '@axe-core/playwright';
import { expect } from '@playwright/test';
import { createTestContext, selectWrapped, artifacts } from './support.mjs';
import { latticeModel } from '../../src/lib/application/arithmetic-demo.mjs';
import { investigationLattice } from '../../src/lib/application/error-working.mjs';
const captureVisuals = process.env.CAPTURE_VISUALS === '1';
import prototype from '../../../content/lattice_error_prototype.json' with { type: 'json' };

async function checkPrototypeInvestigation(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(`${base}spot-errors.html`);
    await page.locator('[data-location]').first().waitFor();
    const storage = await page.evaluate(() => localStorage.getItem('maths-practice-v2'));
    assert.equal(await page.locator('[data-location]').count(), 6);
    assert.equal(await page.locator('#investigation-reason').count(), 0);
    const locationToggle = page.getByRole('button', { name: 'Choose by location', exact: true });
    await expect(locationToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#investigation-location')).toBeHidden();
    await locationToggle.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#investigation-location')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#investigation-location')).toBeHidden();
    for (const width of [320, 390, 900]) {
      await page.setViewportSize({ width, height: 900 });
      const sizes = await page.locator('[data-location]').evaluateAll((buttons) =>
        buttons.map((button) => {
          const box = button.getBoundingClientRect();
          return [box.width, box.height];
        }),
      );
      assert.ok(
        sizes.every(([w, h]) => w >= 44 && h >= 44),
        JSON.stringify({ width, sizes }),
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    // A correct cell remains selectable, including by keyboard; it receives no premature feedback.
    await page.locator('[data-location="cell:0:1"]').focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-location-marker]')).toHaveCount(0);
    await expect(page.locator('#investigation-reason')).toHaveCount(0);
    await page.keyboard.press('Enter');
    await selectWrapped(page, '#investigation-reason', 'cell-fact');
    await expect(page.locator('.error-selection-list li')).toHaveCount(1);
    await expect(page.locator('[data-answer-result]')).toHaveCount(0);
    await page.locator('[data-location="cell:0:1"]').click();
    await expect(page.locator('[data-location-marker]')).toHaveCount(0);
    await expect(page.locator('.error-selection-list li')).toHaveCount(0);
    await page.locator('[data-location="cell:0:1"]').click();
    await selectWrapped(page, '#investigation-reason', 'cell-fact');
    assert.equal(await page.locator('[data-investigation-result]').count(), 0);
    await page.getByRole('button', { name: /^Remove / }).click();
    await expect(page.locator('.error-selection-list li')).toHaveCount(0);
    assert.ok(
      await page
        .locator('[data-location="cell:0:1"]')
        .evaluate((button) => button === document.activeElement),
    );
    // Select a consequentially wrong total; checking must direct attention to its earlier cause.
    await locationToggle.click();
    await selectWrapped(page, '#investigation-location', 'diagonal:2');
    await locationToggle.click();
    await expect(page.locator('#investigation-location')).toBeHidden();
    await expect(page.locator('#investigation-reason')).toBeVisible();
    await selectWrapped(page, '#investigation-reason', 'diagonal-sum');
    await page.locator('#investigation-answer').fill('258');
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await expect(page.locator('[data-investigation-result]')).toContainText('earlier mistake');
    await page.getByRole('button', { name: 'Start again' }).click();
    for (const [index, q] of prototype.cases.entries()) {
      await page.locator('#prototype-example').selectOption(String(index));
      const original = await page.locator('.error-working svg text').allTextContents();
      if (q.working.reverseRight) {
        // Cell products follow the displayed factor: the setup, not those cells, is faulty.
        await expect(page.locator('#investigation-location')).toBeHidden();
        await locationToggle.click();
        await selectWrapped(page, '#investigation-location', 'cell:0:0');
        await selectWrapped(page, '#investigation-reason', 'cell-fact');
        await page.locator('#investigation-answer').fill(q.answer);
        await page.getByRole('button', { name: 'Check answer', exact: true }).click();
        await expect(page.locator('[data-investigation-result]')).toContainText('earlier mistake');
        await page.getByRole('button', { name: 'Start again' }).click();
      }
      if (q.working.carryAsDigits) {
        const sizes = await page
          .locator('.error-working svg text')
          .evaluateAll((texts) =>
            texts.filter((t) => t.textContent === '1').map((t) => getComputedStyle(t).fontSize),
          );
        assert.ok(sizes.includes('27px'), 'Oversized carry must appear at answer-digit size');
        await expect(page.locator('.arithmetic-working')).toContainText('5132');
      }
      if (captureVisuals && index >= 3)
        await page.screenshot({
          path: `${artifacts}/lattice-error-example-${index + 1}-390.png`,
          fullPage: true,
        });
      for (const error of [...q.errors].reverse()) {
        await page.locator(`[data-location="${error.location}"]`).click();
        await selectWrapped(page, '#investigation-reason', error.reason);
      }
      assert.deepEqual(await page.locator('.error-working svg text').allTextContents(), original);
      if (captureVisuals && q.working.reverseRight) {
        await page
          .locator('.error-working')
          .screenshot({ path: `${artifacts}/lattice-error-vertical-marker-390.png` });
      }
      await expect(page.locator('.error-selection-list li')).toHaveCount(q.errors.length);
      // Changing a diagnosis edits the entry rather than adding a second entry at that place.
      const first = q.errors[0];
      await page
        .getByRole('button', {
          name: `Edit: ${latticeModel(q.a, q.b, q.working).regions.find((r) => r.id === first.location).label}`,
          exact: true,
        })
        .click();
      const alternative = prototype.options[
        latticeModel(q.a, q.b, q.working).regions.find((r) => r.id === first.location).kind
      ].find((option) => option.id !== first.reason).id;
      await selectWrapped(page, '#investigation-reason', alternative);
      await expect(page.locator('.error-selection-list li')).toHaveCount(q.errors.length);
      await page.locator('#investigation-answer').fill(q.answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(page.locator('[data-investigation-result]')).toContainText('Reconsider');
      await expect(page.locator('#investigation-answer')).toHaveAttribute(
        'data-answer-result',
        'correct',
      );
      await expect(page.locator('#investigation-reason')).toHaveAttribute(
        'data-answer-result',
        'incorrect',
      );
      await expect(
        page.locator('.error-selection-list li[data-answer-result="incorrect"]'),
      ).toHaveCount(1);
      await selectWrapped(page, '#investigation-reason', first.reason);
      await page.locator('#investigation-answer').fill('0');
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(page.locator('[data-investigation-result]')).toContainText('Recheck');
      await expect(page.locator('#investigation-answer')).toHaveAttribute(
        'data-answer-result',
        'incorrect',
      );
      await expect(
        page.locator('.error-selection-list li[data-answer-result="correct"]'),
      ).toHaveCount(q.errors.length);
      await page.locator('#investigation-answer').fill(q.answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      await expect(page.locator('[data-investigation-result]')).toHaveAttribute(
        'data-investigation-result',
        'correct',
      );
    }
    // Side-of-grid selection is a marker behind the maths, never an extra cell border.
    await expect(page.locator('[data-location-marker="diagonal:2"]')).toHaveCount(1);
    await expect(page.locator('[data-location="diagonal:2"]')).toHaveCSS('border-width', '0px');
    for (const mode of ['light', 'dark']) {
      if (mode === 'dark')
        await page.getByRole('button', { name: 'Switch to paired dark theme' }).click();
      if (captureVisuals)
        await page.screenshot({
          path: `${artifacts}/lattice-error-marker-${mode}-390.png`,
          fullPage: true,
        });
      for (const selector of [
        '#investigation-answer',
        '#investigation-reason',
        '.error-selection-list li',
        '[data-investigation-result]',
      ]) {
        assert.ok(
          await page.locator(selector).evaluate((element) => {
            const swatch = document.createElement('span');
            swatch.style.backgroundColor =
              getComputedStyle(element).getPropertyValue('--correct-bg');
            element.parentElement.append(swatch);
            const expected = getComputedStyle(swatch).backgroundColor;
            swatch.remove();
            return getComputedStyle(element).backgroundColor === expected;
          }),
          `${mode}: ${selector} must use the shared correct colour`,
        );
      }
    }
    await page.getByRole('button', { name: 'Switch to paired light theme' }).click();
    await page.locator('[data-location="diagonal:2"]').click();
    await expect(page.locator('[data-location-marker]')).toHaveCount(0);
    await expect(page.locator('[data-answer-result]')).toHaveCount(0);
    await expect(page.locator('.error-selection-list li')).toHaveCount(0);
    assert.deepEqual((await new AxeBuilder({ page }).analyze()).violations, []);
    assert.equal(await page.evaluate(() => localStorage.getItem('maths-practice-v2')), storage);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

/** Real stages share the question/canvas boundary, exact marker and durable session responses. */
async function checkLiveInvestigations(browser, base) {
  const context = await createTestContext(browser, {
    viewport: { width: 1200, height: 1000 },
    hasTouch: true,
  });
  const page = await context.newPage(),
    errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    for (const topic of foundationTopics) {
      const bank = await readTopicBank(`${topic.file}`);
      await page.goto(`${base}${topicPath(topic.bank).slice(1)}`);
      await page.locator('#begin, [data-mode="assessment"]').first().waitFor();
      if (await page.locator('#begin').isVisible()) {
        await page.locator('#begin').click();
        await page.locator('#username').fill('Investigation reviewer');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        if (await page.locator('#profile-message').isVisible())
          await page.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      await page.locator('[data-mode="assessment"]').click();
      await expect(
        page.getByText(stageTextFor(bank, 'assessment', 6).intro, { exact: true }),
      ).toBeVisible();
      await page.locator('[data-mode="errors"]').click();
      if (topic.bank === 'M01') {
        // Retired saved pages automatically open current questions, without an opt-in banner.
        const old = bank.retiredQuestions.filter((q) => q.level === 0).slice(0, 4);
        // Leave the live session before seeding storage; pagehide flushes its current state.
        await page.goto(`${base}about.html`);
        await page.evaluate(
          ({ old, topic }) => {
            const data = JSON.parse(localStorage.getItem('maths-practice-v2'));
            const saved = data.profiles[0].subjects.maths.topics[`maths:${topic}`];
            saved.pages.errors.items = old.map((q) => ({ id: q.id, level: q.level }));
            localStorage.setItem('maths-practice-v2', JSON.stringify(data));
          },
          { old, topic: topic.bank },
        );
        await page.goto(`${base}${topicPath(topic.bank).slice(1)}`);
        await page.locator('[data-mode="errors"]').click();
        await expect(
          page.getByRole('button', { name: 'Start updated questions', exact: true }),
        ).toHaveCount(0);
        await expect(page.locator('#error-correction, #error-row-0')).toHaveCount(0);
      }
      await expect(page.locator('.live-investigation')).toBeVisible();
      const saved = () =>
        page.evaluate(
          (id) =>
            JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].subjects.maths.topics[
              `maths:${id}`
            ].pages.errors,
          topic.bank,
        );
      const attempt = await saved(),
        q = bank.questions.find((q) => q.id === attempt.items[0].id);
      assert.equal(attempt.items.length, 4);
      await page.locator('.error-working [data-written-ink]').first().waitFor();
      if (q.diagram?.kind === 'lattice') {
        await page.setViewportSize({ width: 390, height: 844 });
        const model = investigationLattice(q);
        const points = [
          ...model.right.map((_, row) => ({
            id: 'operand-right',
            x: 85 + model.top.length * 70,
            y: 78 + row * 70,
          })),
          ...model.diagonals.map((d, i) => ({ id: `diagonal-${i}`, x: d.x, y: d.y - 10 })),
          ...model.cells.map((cell) => ({
            id: `cell-${cell.row}-${cell.col}`,
            x: cell.x + 19,
            y: cell.y + 20,
          })),
        ];
        for (const point of points) {
          const target = page.locator(`.lattice-location[data-location="${point.id}"]`);
          await target.scrollIntoViewIfNeeded();
          const position = await page.locator('.lattice-diagram > svg').evaluate((svg, point) => {
            const screen = new DOMPoint(point.x, point.y).matrixTransform(svg.getScreenCTM());
            return {
              x: screen.x,
              y: screen.y,
              hit: document.elementFromPoint(screen.x, screen.y)?.closest('[data-location]')
                ?.dataset.location,
            };
          }, point);
          assert.equal(position.hit, point.id, 'Visible digit must hit its own region');
          await page.touchscreen.tap(position.x, position.y);
          await expect(target).toHaveAttribute('aria-pressed', 'true');
          await page.touchscreen.tap(position.x, position.y);
          await expect(target).toHaveAttribute('aria-pressed', 'false');
        }
        await page.setViewportSize({ width: 1200, height: 1000 });
      }

      await expect(page.locator('#investigation-location')).toBeHidden();
      await expect(page.locator('#answer')).toHaveValue('');
      await page.locator('#answer').pressSequentially('123');
      await expect(page.locator('#answer')).toBeFocused();
      await expect(page.locator('#answer')).toHaveValue('123');
      await page.locator('#typed-working').pressSequentially('My calculation');
      await expect(page.locator('#typed-working')).toBeFocused();
      // Keep the actual canvas node alive through each diagnosis/answer state update.
      await page.locator('.working canvas').evaluate((canvas) => (window.liveCanvas = canvas));
      const correctLocation = q.locations.find(
        (location) =>
          !q.errors.some((e) => e.location === location.id) &&
          !q.consequences.includes(location.id),
      );
      const toggle = page.getByRole('button', { name: 'Choose by location', exact: true });
      await toggle.click();
      await selectWrapped(page, '#investigation-location', correctLocation.id);
      await selectWrapped(page, '#investigation-reason', q.options[0].id);
      await expect(page.locator('.error-selection-list li')).toHaveCount(1);
      await page
        .getByRole('button', { name: `Remove ${correctLocation.label}`, exact: true })
        .click();
      await toggle.click();
      for (const error of q.errors) {
        const target = page.locator(`[data-location="${error.location}"]`).first();
        await target.focus();
        await page.keyboard.press('Enter');
        await expect(target).toHaveAttribute('aria-pressed', 'true');
        if (await target.locator('.working-line-content').count()) {
          const bounds = await target.evaluate((button) => {
            const box = (selector) => button.querySelector(selector).getBoundingClientRect();
            return {
              marker: box('.line-marker'),
              text: box('.working-expression'),
              label: box('.working-line-label'),
            };
          });
          assert.ok(bounds.marker.width <= bounds.text.width + 12, 'Marker hugs working width');
          assert.ok(bounds.marker.top >= bounds.label.bottom, 'Marker excludes the label');
        }
        await selectWrapped(page, '#investigation-reason', error.reason);
      }
      assert.ok(
        await page.evaluate(() => window.liveCanvas === document.querySelector('.working canvas')),
      );
      await expect(page.locator('#typed-working')).toHaveValue('My calculation');
      if (['M01', 'M02', 'M15'].includes(topic.bank)) {
        for (const width of [320, 390, 720, 768, 950, 1200]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
          const dimensions = await page.locator('.question-workspace').evaluate((workspace) => {
            const [question, working] = [...workspace.children].map((child) =>
              child.getBoundingClientRect(),
            );
            return {
              question: { x: question.x, y: question.y, right: question.right },
              working: { x: working.x, y: working.y, width: working.width },
              columns: getComputedStyle(workspace).gridTemplateColumns.split(' ').length,
            };
          });
          if (dimensions.columns === 2) {
            assert.ok(dimensions.working.x > dimensions.question.right, JSON.stringify(dimensions));
            assert.ok(Math.abs(dimensions.working.y - dimensions.question.y - 16) < 2);
            assert.ok(dimensions.working.width >= 250);
          } else assert.ok(dimensions.working.y > dimensions.question.y);
          assert.ok(
            await page
              .locator('#investigation-reason')
              .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
          );
          assert.ok(
            await page
              .locator('#answer')
              .evaluate(
                (e) =>
                  e.getBoundingClientRect().width <
                  e.closest('.active-question-content').getBoundingClientRect().width,
              ),
          );
        }
        if (topic.bank === 'M01') {
          if (captureVisuals)
            await page
              .locator('.question-workspace')
              .screenshot({ path: `${artifacts}/live-errors-canvas-1200.png` });
          await page.setViewportSize({ width: 390, height: 1000 });
          if (captureVisuals)
            await page
              .locator('.question-workspace')
              .screenshot({ path: `${artifacts}/live-errors-canvas-390.png` });
          await page.setViewportSize({ width: 1200, height: 1000 });
        }
      }
      const canvas = page.locator('.working canvas');
      await canvas.scrollIntoViewIfNeeded();
      const box = await canvas.boundingBox();
      await page.mouse.move(box.x + 30, box.y + 30);
      await page.mouse.down();
      await page.mouse.move(box.x + 90, box.y + 70, { steps: 8 });
      await page.mouse.up();
      const cache = await page.evaluate(() =>
        Object.keys(sessionStorage)
          .filter((key) => key.startsWith('maths-working-v1:'))
          .map((key) => JSON.parse(sessionStorage.getItem(key))),
      );
      assert.ok(
        cache.some((record) => record.working.strokes.some((stroke) => stroke.points.length >= 8)),
      );
      // Reproduce the reported 80 × 7 cell-placement feedback, including the rejected diagnosis.
      const expectedCorrect = topic.bank !== 'M01';
      if (!expectedCorrect) await selectWrapped(page, '#investigation-reason', 'alternative-1');
      await page.locator('#answer').fill(q.answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      assert.equal((await saved()).responses[q.id].correct, expectedCorrect, q.id);
      await page.locator('[data-question]').first().click();
      await expect(
        page.locator(
          `.error-selection-list li[data-answer-result="${expectedCorrect ? 'correct' : 'incorrect'}"]`,
        ),
      ).toHaveCount(q.errors.length);
      await expect(page.locator('#answer')).toHaveAttribute('data-answer-result', 'correct');
      await expect(page.locator('#investigation-reason')).toHaveCount(0);
      if (topic.bank === 'M01') {
        await page.locator('.feedback summary').click();
        for (const width of [390, 1200]) {
          await page.setViewportSize({ width, height: 1000 });
          const layout = await page.locator('.question-workspace').evaluate((workspace) => {
            const box = (e) => e.getBoundingClientRect();
            const bounds = box(workspace),
              feedback = box(workspace.querySelector('.feedback'));
            const question = box(workspace.querySelector('#active-question'));
            const working = box(workspace.querySelector('.working'));
            const summary = box(workspace.querySelector('.feedback-summary'));
            const details = box(workspace.querySelector('.feedback details'));
            return { bounds, feedback, question, working, summary, details };
          });
          assert.ok(Math.abs(layout.feedback.left - layout.question.left) < 1);
          assert.ok(Math.abs(layout.feedback.right - layout.working.right) < 1);
          if (width === 1200) {
            assert.ok(layout.details.x > layout.summary.x, 'Review uses both columns');
            assert.ok(layout.working.y - layout.question.y >= 16, 'Canvas has top breathing room');
          } else {
            assert.ok(layout.details.y >= layout.summary.bottom, 'Review stacks on mobile');
            assert.ok(
              layout.working.y >= layout.feedback.bottom,
              'Feedback precedes canvas on mobile',
            );
          }
          if (captureVisuals)
            await page
              .locator('.question-workspace')
              .screenshot({ path: `${artifacts}/live-error-feedback-${width}.png` });
        }
      }
      await page.reload();
      await expect(page.locator('.live-investigation')).toBeVisible();
      assert.equal((await saved()).responses[q.id].correct, expectedCorrect);
      await page.locator('[data-question]').first().click();
      await expect(page.locator('#typed-working')).toHaveValue('My calculation');
      if (topic.bank === 'M10')
        assert.deepEqual(
          (await new AxeBuilder({ page }).include('.question-workspace').analyze()).violations,
          [],
        );
    }
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}

export async function checkErrorInvestigation(browser, base) {
  await checkPrototypeInvestigation(browser, base);
  await checkLiveInvestigations(browser, base);
}
