/**
 * Purpose: Inject startup faults to verify usable recovery from theme, storage and bank
 * failures.
 *
 * Main contents:
 * - checkStartup
 *
 * Used By: website/scripts/browser-checks.mjs.
 *
 * Uses: website/scripts/browser/support.mjs, website/scripts/read-topic-bank.mjs.
 *
 * Libs: node:assert/strict (assertions), @playwright/test (browser assertions).
 *
 * Usage and output: Imported by the browser suite runner; call the exported check with its
 * browser/base URL arguments. Uses isolated test contexts and assertions, closing owned contexts
 * on exit. Normal entry point: npm run verify:changed from website/.
 */
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { readTopicBank } from '../read-topic-bank.mjs';
import { createTestContext } from './support.mjs';

/**
 * Faults run in isolated contexts, never in a learner's saved browser profile.
 * Exercise bank, storage and theme failure scenarios in separate browser contexts.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: createTestContext.
 * @example await checkStartup(browser, "http://127.0.0.1:8766/"); // Check a running static preview.
 */
export async function checkStartup(browser, base) {
  await checkAnonymousVisit(browser, base);
  const context = await createTestContext(browser);
  try {
    const page = await context.newPage();
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Stage resume learner');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    for (const mode of ['plain', 'scaffolded', 'errors', 'problem', 'demo', 'assessment']) {
      await page.locator(`[data-mode="${mode}"]`).click();
      if (mode === 'plain')
        await page.getByRole('button', { name: 'Next page of questions', exact: true }).click();
      const before = await page.locator('.question-list').allTextContents();
      await page.reload();
      await page.locator(`[data-mode="${mode}"][aria-current="step"]`).waitFor();
      assert.deepEqual(
        await page.locator('.question-list').allTextContents(),
        before,
        `${mode}: restored question page`,
      );
    }
    async function selectTopic(page, id) {
      const names = {
        M01: 'Lattice multiplication',
        M02: 'Bus stop division',
        M10: 'Solving equations',
      };
      await page.getByLabel('Topic', { exact: true }).click();
      await page.keyboard.type(names[id].slice(0, 3));
      await page.keyboard.press('Enter');
      await page.getByRole('heading', { name: names[id], exact: true, level: 1 }).waitFor();
    }
    // Real topic navigation must restore the destination's own stage, never the source's.
    await page.locator('[data-mode="plain"]').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await selectTopic(page, 'M02');
    await page.locator('[data-mode="assessment"][aria-current="step"]').waitFor();
    await page.locator('[data-mode="demo"]').click();
    await page.evaluate(() => window.scrollTo(0, 0));
    await selectTopic(page, 'M10');
    await page.locator('[data-mode="plain"][aria-current="step"]').waitFor();
    await page.reload();
    await page.locator('[data-mode="plain"][aria-current="step"]').waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    await selectTopic(page, 'M02');
    await page.locator('[data-mode="demo"][aria-current="step"]').waitFor();
    await page.reload();
    await page.locator('[data-mode="demo"][aria-current="step"]').waitFor();
    await page.evaluate(() => window.scrollTo(0, 0));
    await selectTopic(page, 'M01');
    await page.locator('[data-mode="assessment"][aria-current="step"]').waitFor();
  } finally {
    await context.close();
  }

  for (const fault of [
    'delayed-bank',
    'theme',
    'storage-read',
    'storage-write',
    'corrupt-store',
    'bank',
  ]) {
    const context = await createTestContext(browser);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    let release;
    try {
      await context.addInitScript((fault) => {
        if (fault === 'theme') {
          const original = window.getComputedStyle;
          window.getComputedStyle = function (element, ...args) {
            if (element === document.documentElement) {
              window.getComputedStyle = original;
              throw Error('Simulated optional theme failure');
            }
            return original.call(window, element, ...args);
          };
        }
        if (fault === 'storage-read') {
          Storage.prototype.getItem = () => {
            throw Error('Storage unavailable');
          };
        }
        if (fault === 'storage-write') {
          Storage.prototype.setItem = () => {
            throw Error('Storage full');
          };
        }
        if (fault === 'corrupt-store') localStorage.setItem('maths-practice-v2', '{bad');
      }, fault);
      if (fault === 'bank')
        await page.route('**/data/solving-equations.json*', (route) =>
          route.fulfill({ status: 503, body: 'Unavailable' }),
        );
      if (fault === 'delayed-bank') {
        const gate = new Promise((resolve) => {
          release = resolve;
        });
        await page.route('**/data/solving-equations.json*', async (route) => {
          await gate;
          await route.continue();
        });
      }
      await page.goto(`${base}fm/solving-equations/`);
      if (fault === 'delayed-bank') {
        await page.getByText('Loading maths practice…', { exact: true }).waitFor();
        assert.equal(await page.locator('#profile-button').isDisabled(), true);
        release();
      }
      if (fault === 'bank') {
        await page.getByRole('alert').filter({ hasText: 'could not be loaded' }).waitFor();
        assert.equal(await page.locator('#profile-button').isDisabled(), true);
      } else {
        await page.locator('#begin').click();
        await page.locator('#username').fill('Startup Student');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        if (await page.locator('#profile-message').isVisible())
          await page.getByRole('button', { name: 'Continue', exact: true }).click();
        await page.locator('#answer').waitFor();
        if (fault === 'theme') await page.getByText(/Theme controls could not load/).waitFor();
        if (fault.startsWith('storage') || fault === 'corrupt-store')
          assert.ok(await page.locator('#storage-warning').innerText());
        if (fault === 'corrupt-store')
          assert.equal(
            await page.evaluate(() => localStorage.getItem('maths-practice-v2')),
            '{bad',
          );
      }
      assert.deepEqual(errors, [], `Startup: ${fault}`);
    } finally {
      release?.();
      await context.close();
    }
  }
  console.log(
    'Startup checks passed: chevron/page restoration, delayed/failed bank, optional theme failure, unavailable/full/corrupt storage.',
  );
}

/** Verify one-bank startup, cached revisits and adoption of an anonymous visit on Progress. */
async function checkAnonymousVisit(browser, base) {
  const context = await createTestContext(browser);
  try {
    const page = await context.newPage();
    const banks = [];
    page.on('request', (request) => {
      if (/\/data\/[^/]+\.json\?v=/.test(request.url())) banks.push(request.url());
    });
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin-anonymous').click();
    assert.equal(banks.length, 1, 'ordinary topic startup requests only its own bank');
    assert.match(banks[0], /solving-equations\.json\?v=[a-f0-9]{16}$/);
    await page.locator('[data-mode="plain"]').click();
    const visit = () =>
      page.evaluate(() => JSON.parse(sessionStorage.getItem('maths-anonymous-visit')));
    const before = await visit();
    const id = before.topics['maths:M10'].pages.plain.items[0].id;
    const bank = await readTopicBank('solving-equations');
    await page
      .locator('#answer')
      .fill(bank.questions.find((question) => question.id === id).answer);
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    await page.reload();
    await page.locator('#answer').waitFor();
    assert.equal((await visit()).topics['maths:M10'].history.length, 1);
    assert.equal(banks.length, 2, 'reload still only requests this topic');
    assert.equal(banks[0], banks[1], 'unchanged content keeps its cache key');
    const transfer = await page.evaluate(
      () =>
        performance
          .getEntriesByType('resource')
          .find((entry) => /\/data\/solving-equations\.json\?v=/.test(entry.name))?.transferSize,
    );
    assert.equal(
      transfer,
      0,
      'the revisit serves the bank from browser cache without transferring its body',
    );
    await page.getByRole('link', { name: 'Progress', exact: true }).click();
    await page.locator('#progress-name').fill('Visit learner');
    await page.getByRole('button', { name: 'Save name', exact: true }).click();
    await page.getByRole('button', { name: 'Save name', exact: true }).click();
    await expect(page.locator('#progress-name')).toHaveCount(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('maths-practice-v2')));
    assert.equal(saved.profiles.length, 1);
    assert.equal(saved.profiles[0].name, 'Visit learner');
    assert.equal(saved.profiles[0].subjects.maths.topics['maths:M10'].history.length, 1);
    assert.equal(await visit(), null, 'naming clears the anonymous session copy');
  } finally {
    await context.close();
  }
}
