/**
 * Purpose: Exercise the calculation methods in the real app, including exact marking and
 * persisted page navigation.
 *
 * Main contents:
 * - checkDraftTopics.
 *
 * Used By: website/scripts/browser/new-topics-checks.mjs.
 *
 * Uses: website/scripts/read-topic-bank.mjs, website/src/lib/content/topic-routes.mjs,
 * website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions).
 *
 * Usage and output: Imported by the browser suite runner; call the exported check with its
 * browser/base URL arguments. Uses isolated test contexts and assertions, closing owned contexts
 * on exit. Normal entry point: npm run verify:changed from website/.
 */
import { readTopicBank } from '../read-topic-bank.mjs';

import assert from 'node:assert/strict';
import { foundationTopics, topicPath } from '../../src/lib/content/topic-routes.mjs';
import { createTestContext, artifacts, selectWrapped } from './support.mjs';
/** Run this focused browser scenario against the supplied browser and base URL. Called by the shared suite runner; isolated contexts and finally cleanup protect other sessions. Example: await checkDraftTopics(browser, base). */
export async function checkDraftTopics(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.clock.install();
  try {
    for (const topic of foundationTopics) {
      const bank = await readTopicBank(`${topic.file}`);
      if (bank.method !== 'calculation') continue;
      await page.goto(`${base}${topicPath(topic.bank).slice(1)}`);
      try {
        await page.locator('#begin, [data-mode="assessment"]').first().waitFor();
      } catch (cause) {
        throw new Error(
          `${topic.bank} startup: ${errors.join('; ')} ${await page.locator('body').innerText()}`,
          { cause },
        );
      }
      if (await page.locator('#begin').isVisible()) {
        await page.locator('#begin').click();
        await page.locator('#username').fill('Draft Reviewer');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        if (await page.locator('#profile-message').isVisible())
          await page.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      await page.locator('[data-mode="assessment"]').waitFor();
      assert.equal(await page.locator('h1 .draft-stamp').count(), 0);
      assert.equal(
        await page.locator('.learning-steps [data-mode]').count(),
        topic.bank === 'M03' ? 5 : 6,
      );
      assert.equal(
        await page.locator('[data-mode="problem"]').count(),
        topic.bank === 'M03' ? 0 : 1,
      );
      await page.locator('[data-mode="assessment"]').click();
      assert.equal(await page.locator('[data-question]').count(), 6);
      const saved = () =>
        page.evaluate(
          (id) =>
            JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].subjects.maths.topics[
              `maths:${id}`
            ],
          topic.bank,
        );
      if (topic.bank === 'M15') {
        assert.equal(await page.locator('#active-question .fraction').count(), 2);
        assert.ok(
          !(await page.locator('#active-question .selected-equation').textContent()).includes('{'),
        );
      }
      if (topic.bank === 'M15')
        await page
          .locator('#active-question')
          .screenshot({ path: `${artifacts}/fraction-active-question.png` });
      const attempt = (await saved()).pages.assessment;
      assert.deepEqual(
        attempt.items.map((q) => q.level),
        [0, 0, 1, 1, 2, 2],
      );
      await page
        .locator('#answer')
        .fill(bank.questions.find((q) => q.id === attempt.items[0].id).answer);
      await page.getByRole('button', { name: 'Check answer', exact: true }).click();
      assert.equal((await saved()).pages.assessment.count, 1);
      if (topic.bank === 'M15') {
        await page.locator('[data-question]').first().click();
        await page.locator('.feedback summary').click();
        assert.equal(
          await page.locator('.feedback details > p').first().locator('.fraction').count(),
          1,
        );
        await page.locator('.feedback').screenshot({ path: `${artifacts}/fraction-feedback.png` });
      }
      await page.locator('[data-mode="demo"]').click();
      if (topic.bank === 'M12')
        assert.match(
          await page.locator('.demo-body').innerText(),
          /In exams, include the correct units/,
        );
      for (const level of [0, 1, 2]) {
        await page.locator(`[data-demo-level="${level}"]`).click();
        await page.locator('#demo-play').click();
        await page.clock.runFor(700);
        assert.ok(await page.locator('.demo-working .method-active').count());
        assert.ok(
          await page.locator('.calculation-working [data-written-ink] [data-stroke]').count(),
        );
        assert.equal(await page.locator('.step-caption [data-written-ink]').count(), 0);
        assert.equal(await page.locator('.demo-working [data-missing]').count(), 0);
        if (await page.locator('#demo-all').isEnabled()) await page.locator('#demo-all').click();
        assert.equal(
          await page.locator('.demo-working .calculation-step').count(),
          bank.questions.find((q) => q.type === 'demo' && q.level === level).steps.length,
        );
        assert.equal(
          await page.locator('.demo-working svg:not([data-written-ink])').count(),
          topic.bank === 'M03' ? 0 : 1,
        );
      }
      const practiceModes =
        topic.bank === 'M03'
          ? ['scaffolded', 'errors', 'plain']
          : ['scaffolded', 'errors', 'plain', 'problem'];
      for (const mode of practiceModes) {
        await page.locator(`[data-mode="${mode}"]`).click();
        assert.equal(
          await page.locator('[data-question]').count(),
          { scaffolded: 4, errors: 4, plain: 12, problem: 6 }[mode],
        );
        if (topic.bank === 'M03' && mode === 'plain') {
          const tips = page.getByText('How to solve tips', { exact: true });
          await tips.click();
          assert.equal(await page.locator('.problem-tips[open]').count(), 1);
          await tips.click();
        }
        if (topic.bank === 'M04' && mode === 'scaffolded') {
          await page.locator('.question-panel [data-level="2"]').click();
          assert.match(
            await page.locator('#active-question .guidance').innerText(),
            /further calculation/,
          );
          const current = (await saved()).pages[mode];
          const question = bank.questions.find((q) => q.id === current.items[0].id);
          assert.ok(question.model.operations.length > 2);
          await page.locator('#answer').fill(question.answer);
          await page.getByRole('button', { name: 'Check answer', exact: true }).click();
          // Successful submissions advance; return to the answered question for its feedback.
          await page.locator('[data-question]').first().click();
          await page.locator('.feedback summary').click();
          assert.match(await page.locator('.feedback .calculation-step').last().innerText(), /£/);
        }
        const first = (await saved()).pages[mode];
        const next = page.getByRole('button', { name: 'Next page of questions', exact: true });
        await next.click();
        const second = (await saved()).pages[mode];
        assert.notEqual(second.attempt, first.attempt);
        await page.getByRole('button', { name: 'Previous page of questions', exact: true }).click();
        assert.equal((await saved()).pages[mode].attempt, first.attempt);
        if (mode === 'errors') {
          const q = bank.questions.find((q) => q.id === first.items[0].id);
          for (const error of q.errors) {
            await page.locator(`[data-location="${error.location}"]`).first().click();
            await selectWrapped(page, '#investigation-reason', error.reason);
          }
        }
        for (const width of [320, 768, 1280]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.clock.runFor(32);
          if (mode === 'errors') {
            assert.ok(
              await page
                .locator('#investigation-reason')
                .evaluate((control) => control.scrollWidth <= control.clientWidth + 1),
              'Selected prose fits at phone and desktop widths',
            );
          }
          await page.waitForFunction(() => document.documentElement.scrollWidth <= innerWidth);
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
            false,
            `${topic.bank}/${mode}/${width}: ${JSON.stringify(
              await page.evaluate(() =>
                [...document.querySelectorAll('main *')]
                  .filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
                  .slice(0, 8)
                  .map((e) => ({
                    tag: e.tagName,
                    cls: e.className,
                    width: e.getBoundingClientRect().width,
                    text: e.textContent.slice(0, 60),
                  })),
              ),
            )}`,
          );
        }
        if (mode === 'errors') {
          const q = bank.questions.find((q) => q.id === first.items[0].id);
          const fits = await page
            .locator('#investigation-reason')
            .evaluate((control) => control.scrollWidth <= control.clientWidth + 1);
          assert.ok(fits, `${q.id} selected correction wraps inside its control`);
          await page.locator('#answer').fill(q.answer);
          await page.getByRole('button', { name: 'Check answer', exact: true }).click();
          assert.equal((await saved()).pages.errors.responses[q.id].correct, true);
        }
      }
      if (topic.bank === 'M15') {
        await page.setViewportSize({ width: 390, height: 440 });
        await page.locator('[data-mode="demo"]').click();
        await page.locator('[data-demo-level="2"]').click();
        await page.locator('#demo-play').click();
        let totalScroll = 0;
        for (let i = 0; i < 7; i++) {
          const before = await page.evaluate(() => scrollY);
          await page.clock.runFor(650);
          const geometry = await page
            .locator('[data-demo-completion-end], [data-demo-working-end]')
            .last()
            .evaluate((el) => ({
              bottom: el.getBoundingClientRect().bottom,
              y: scrollY,
              height: innerHeight,
            }));
          const delta = geometry.y - before;
          const needed = Math.max(0, geometry.bottom + delta - geometry.height);
          assert.ok(Math.abs(delta - needed) <= 2, 'Scroll only by the newly clipped amount');
          assert.ok(geometry.bottom <= geometry.height + 1, 'Latest fraction working is visible');
          totalScroll += delta;
        }
        assert.ok(totalScroll > 0, 'Long fraction demo actually requires and receives scrolling');
        // Pausing or a finished playback must not pull a learner back after they scroll away.
        if (await page.getByRole('button', { name: 'Pause', exact: true }).count())
          await page.locator('#demo-play').click();
        await page.evaluate(() => scrollBy(0, -100));
        const paused = await page.evaluate(() => scrollY);
        await page.clock.runFor(1300);
        assert.equal(await page.evaluate(() => scrollY), paused);
      }
      await page.reload();
      await page.locator('[data-mode="plain"]').waitFor();
      assert.equal((await saved()).pages.assessment.count, 1);
      await page.setViewportSize({ width: 390, height: 1000 });
      await page.locator('[data-mode="demo"]').click();
      if (await page.locator('#demo-all').isEnabled()) await page.locator('#demo-all').click();
      await page.screenshot({ path: `${artifacts}/draft-${topic.bank}.png`, fullPage: true });
    }
    // Configurable combined practice keeps source attribution and assistance in the real UI.
    await page.goto(`${base}fm/combined-problems/`);
    await page.getByRole('heading', { name: 'Choose your combined practice' }).waitFor();
    const sourceChoices = page
      .getByRole('group', { name: 'Topics to include' })
      .getByRole('checkbox');
    for (const choice of await sourceChoices.all()) await choice.uncheck();
    await page
      .getByRole('checkbox', { name: 'Signed addition and subtraction', exact: true })
      .check();
    await page
      .getByRole('checkbox', { name: 'Fraction addition and subtraction', exact: true })
      .check();
    await page.getByRole('button', { name: 'Start combined practice' }).click();
    await page.locator('[data-question]').first().waitFor();
    assert.equal(await page.locator('[data-question]').count(), 6);
    await page.getByText('How to solve tips', { exact: true }).click();
    assert.ok(await page.locator('.problem-tips[open]').isVisible());
    await page.locator('.problem-tips #demo-play').click();
    await page.clock.runFor(700);
    if (await page.locator('.problem-tips #demo-all').isEnabled())
      await page.locator('.problem-tips #demo-all').click();
    assert.ok(await page.locator('.problem-tips .calculation-step').count());
    const combined = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].subjects.maths
          .practiceSet,
    );
    const selectedId = combined.attempts[0].items[0].id;
    const sourceTopic = foundationTopics.find((t) => selectedId.startsWith(`maths:${t.bank}-`));
    const sourceBank = await readTopicBank(`${sourceTopic.file}`);
    await page
      .locator('#answer')
      .fill(sourceBank.questions.find((q) => q.id === selectedId).answer);
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    const record = await page.evaluate(
      (topic) =>
        JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].subjects.maths.topics[
          `maths:${topic}`
        ].history.at(-1),
      sourceTopic.bank,
    );
    assert.equal(record.question, selectedId);
    assert.equal(record.assisted, true);
    assert.equal(record.type, 'problem');
    await page.reload();
    await page.locator('[data-question]').first().waitFor();
    const resumed = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].subjects.maths
          .practiceSet,
    );
    assert.deepEqual(resumed.attempts[0].items, combined.attempts[0].items);
    assert.equal(resumed.attempts[0].count, 1);

    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
