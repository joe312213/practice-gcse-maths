/**
 * Purpose: Inject startup faults to verify usable recovery from theme, storage and bank failures.
 *
 * Main contents:
 * - checkStartup
 *
 * Used By: website/scripts/browser-checks.mjs
 *
 * Uses: website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions).
 */
import assert from 'node:assert/strict';
import { createTestContext } from './support.mjs';

/**
 * Faults run in isolated contexts, never in a learner's saved browser profile.
 * Exercise bank, storage and theme failure scenarios in separate browser contexts.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: createTestContext.
 * @example checkStartup(browser, base);
 */
export async function checkStartup(browser, base) {
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
        await page.route('**/data/equations.json', (route) =>
          route.fulfill({ status: 503, body: 'Unavailable' }),
        );
      if (fault === 'delayed-bank') {
        const gate = new Promise((resolve) => {
          release = resolve;
        });
        await page.route('**/data/equations.json', async (route) => {
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
    'Startup checks passed: delayed/failed bank, optional theme failure, unavailable/full/corrupt storage.',
  );
}
