/**
 * Purpose: Exercise progress breakdowns, backup transfer and revision recommendations at mobile width.
 *
 * Main contents:
 * - checkProgress
 *
 * Used By: website/scripts/browser-checks.mjs
 *
 * Uses: website/scripts/browser/support.mjs.
 *
 * Libs: node:assert/strict (assertions), node:fs/promises (download reads), @axe-core/playwright (accessibility checks).
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { createTestContext, artifacts } from './support.mjs';
import { progressFilename } from '../../src/lib/domain/profiles.mjs';
/**
 * Exercise progress panels, transfers and recommendation persistence at mobile width.
 * Parameter browser: Playwright browser instance.
 * Parameter base: test server base URL.
 * Calls: createTestContext, readFile.
 * @example await checkProgress(browser, "http://127.0.0.1:8766/"); // Check a running static preview.
 */
export async function checkProgress(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  let page = await context.newPage();
  let freshContext;
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.clock.install({ time: new Date(2026, 9, 10, 12) });
    await page.goto(`${base}fm/solving-equations/`);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Progress Student');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('complementary', { name: 'Save browser progress to OneDrive' }).waitFor();
    await page.getByRole('button', { name: 'Later', exact: true }).click();
    await page.clock.runFor(65000);
    await page.getByRole('link', { name: 'Progress', exact: true }).click();
    await page.getByRole('heading', { name: 'Your progress', exact: true }).waitFor();
    await page.getByText('0 questions answered', { exact: true }).first().waitFor();
    await page.getByText('1.1 minutes', { exact: true }).waitFor();
    assert.equal(
      await page
        .getByRole('link', { name: 'Back to topics', exact: true })
        .evaluate(
          (element) =>
            getComputedStyle(element).color ===
            getComputedStyle(document.querySelector('.theme-icon')).color,
        ),
      true,
      'Back link uses the themed header control colour',
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    const presentation = await page.evaluate(() => {
      const panels = [...document.querySelectorAll('.page-panel')];
      const stages = [
        ...document.querySelector('.challenge-stages').querySelectorAll('.challenge-stage'),
      ];
      return {
        edgePanels: panels.every((panel) => {
          const bounds = panel.getBoundingClientRect(),
            style = getComputedStyle(panel);
          return (
            Math.abs(bounds.left) < 1 &&
            Math.abs(bounds.right - innerWidth) < 1 &&
            parseFloat(style.borderLeftWidth) === 0 &&
            parseFloat(style.borderTopWidth) > 0
          );
        }),
        chevrons: stages.every((stage) => getComputedStyle(stage).clipPath.startsWith('polygon')),
        links: [...document.querySelectorAll('a.action-button.primary')].every(
          (link) => getComputedStyle(link).textDecorationLine === 'none',
        ),
        topicLink:
          getComputedStyle(document.querySelector('.topic-progress h2 a')).color ===
          getComputedStyle(document.querySelector('footer a')).color,
      };
    });
    assert.ok(Object.values(presentation).every(Boolean), JSON.stringify(presentation));
    const selector = page.getByLabel(/Compare success in/);
    const wide = (await selector.boundingBox()).width;
    await selector.selectOption('errors');
    assert.ok(
      (await selector.boundingBox()).width < wide,
      'Selector follows the shorter selected option',
    );
    await selector.selectOption('plain');
    assert.ok(
      await page
        .locator('#progress-import')
        .evaluate((el) => getComputedStyle(el).fieldSizing === 'content'),
    );
    await page.screenshot({ path: `${artifacts}/progress-refined-390.png`, fullPage: true });
    // Exercise bounded, complete bars without changing the learner's saved results.
    const chevrons = page.locator('.challenge-stages').first();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await chevrons.evaluate((group) => {
      group.style.setProperty('--chevron-segment-max-width', '7rem');
      group.querySelectorAll('progress').forEach((meter) => {
        meter.value = 100;
        meter.nextElementSibling.textContent = '100%';
      });
    });
    const joins = await chevrons.evaluate((group) => {
      const segments = [...group.querySelectorAll('.challenge-stage')];
      return segments.map((segment, index) => {
        const style = getComputedStyle(segment),
          box = segment.getBoundingClientRect();
        const meter = segment.querySelector('progress');
        const bar = meter.getBoundingClientRect();
        const previous = segments[index - 1]?.getBoundingClientRect();
        const arrow = getComputedStyle(segment, '::after');
        const notch = getComputedStyle(segment, '::before');
        return {
          padding:
            (index === 0 || parseFloat(style.paddingLeft) === 0) &&
            (index === segments.length - 1 || parseFloat(style.paddingRight) === 0),
          bounded:
            box.width <= 7 * parseFloat(getComputedStyle(document.documentElement).fontSize) + 1,
          clipped: style.overflow === 'hidden' && style.clipPath.startsWith('polygon'),
          ends: (() => {
            const barStyle = getComputedStyle(meter);
            return (
              parseFloat(barStyle.borderTopLeftRadius) > 0 === (index === 0) &&
              parseFloat(barStyle.borderTopRightRadius) > 0 === (index === segments.length - 1)
            );
          })(),
          equalOutsidePadding:
            index !== 0 || style.paddingLeft === getComputedStyle(segments.at(-1)).paddingRight,
          complete: meter.value === meter.max,
          touches:
            (index === 0 ||
              Math.abs(bar.left - box.left - parseFloat(style.borderLeftWidth)) < 1) &&
            (index === segments.length - 1 ||
              Math.abs(bar.right - box.right + parseFloat(style.borderRightWidth)) < 1),
          joined: !previous || box.left < previous.right,
          outlined:
            style.getPropertyValue('--chevron-divider-width').trim() === '2px' &&
            [index > 0 && notch, index < segments.length - 1 && arrow]
              .filter(Boolean)
              .every(
                (edge) =>
                  edge.content !== 'none' &&
                  edge.backgroundColor === style.borderTopColor &&
                  edge.clipPath.startsWith('polygon') &&
                  Number(edge.zIndex) > 0,
              ),
        };
      });
    });
    assert.ok(
      joins.every((join) => Object.values(join).every(Boolean)),
      JSON.stringify(joins),
    );
    await chevrons.screenshot({
      path: `${artifacts}/progress-complete-chevron-joins.png`,
      animations: 'disabled',
    });
    await chevrons.evaluate((group) => {
      group.style.removeProperty('--chevron-segment-max-width');
      group.querySelectorAll('progress').forEach((meter) => {
        meter.value = 0;
        meter.nextElementSibling.textContent = 'No data';
      });
    });
    await page.emulateMedia({ reducedMotion: null });
    await page.locator('.challenge-stage').first().hover();
    await page
      .getByRole('heading', { name: 'Start · Lattice multiplication', exact: true })
      .waitFor();
    await page.locator('.progress-breakdown[data-state="open"]').waitFor();
    const panel = await page.locator('.progress-breakdown').evaluate((element) => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return {
        background: style.backgroundColor,
        padding: parseFloat(style.paddingTop),
        border: parseFloat(style.borderTopWidth),
        zIndex: Number(style.zIndex),
        fits: bounds.left >= 0 && bounds.right <= innerWidth,
      };
    });
    assert.notEqual(panel.background, 'rgba(0, 0, 0, 0)', 'Breakdown needs a visible surface');
    assert.ok(panel.padding > 0 && panel.border > 0 && panel.zIndex > 0, JSON.stringify(panel));
    assert.ok(panel.fits, 'Breakdown stays inside the viewport');
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(audit.violations, []);
    await page.keyboard.press('Escape');
    await page.locator('.challenge-stage').nth(3).hover();
    await page.getByRole('heading', { name: 'Start · Bus stop division', exact: true }).waitFor();
    assert.equal(
      await page.locator('.progress-breakdown').count(),
      1,
      'Only one topic breakdown can be open',
    );
    await page.mouse.move(0, 0);
    await page.locator('.progress-breakdown').waitFor({ state: 'detached' });
    await page.locator('.challenge-stage').first().focus();
    await page.keyboard.press('Enter');
    await page.locator('.progress-breakdown').waitFor();
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('maths-practice-v2'));
      data.profiles[0].backup = {
        since: Date.now() - 11 * 86400000,
        lastExportAt: null,
        lastExportType: null,
      };
      localStorage.setItem('maths-practice-v2', JSON.stringify(data));
    });
    await page.reload();
    await page.locator('.export-reminder').waitFor();
    assert.equal(await page.getByRole('button', { name: 'Export CSV', exact: true }).count(), 0);
    const downloadJson = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export JSON', exact: true }).click();
    const json = await readFile(await (await downloadJson).path(), 'utf8');
    const data = JSON.parse(json);
    assert.equal(data.username, 'Progress Student');
    assert.equal(await page.locator('.export-reminder').count(), 0);
    assert.equal(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].backup.lastExportType,
      ),
      'json',
    );
    assert.equal(data.revision.recommendations.length, 3);
    const exportedAt = await page.evaluate(
      () => JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].backup.lastExportAt,
    );
    const downloadCsv = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV', exact: true }).click();
    assert.match(await readFile(await (await downloadCsv).path(), 'utf8'), /username/);
    await page
      .locator('#progress-import')
      .setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{}') });
    await page
      .getByText('Invalid progress file. No saved data has been changed.', { exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].backup.lastExportAt,
      ),
      exportedAt,
    );
    await page.reload();
    assert.equal(await page.locator('.export-reminder').count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Export CSV', exact: true }).count(), 0);
    await page.locator('#progress-import').setInputFiles({
      name: 'progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(json),
    });
    assert.equal(
      await page.getByRole('button', { name: 'Confirm import', exact: true }).isDisabled(),
      true,
    );
    await page.getByRole('checkbox').check();
    const beforeFailedImport = await page.evaluate(() => localStorage.getItem('maths-practice-v2'));
    await page.evaluate(() => {
      window.restoreStorageWrites = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'maths-practice-v2') throw new DOMException('Full', 'QuotaExceededError');
        return window.restoreStorageWrites.call(this, key, value);
      };
    });
    await page.getByRole('button', { name: 'Confirm import', exact: true }).click();
    await page
      .getByText(
        'Could not save the imported progress. Your existing progress is unchanged; please try again.',
        { exact: true },
      )
      .waitFor();
    assert.equal(
      await page.evaluate(() => localStorage.getItem('maths-practice-v2')),
      beforeFailedImport,
    );
    await page.evaluate(() => {
      Storage.prototype.setItem = window.restoreStorageWrites;
      delete window.restoreStorageWrites;
    });
    await page.getByRole('button', { name: 'Confirm import', exact: true }).click();
    await page
      .getByText('Progress imported. You’re ready to practise.', {
        exact: true,
      })
      .waitFor();
    // Real origin-private file handles exercise writes and IndexedDB cloning; only native pickers are stubbed.
    const learnerFile = progressFilename(
      await page.evaluate(() => JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0]),
    );
    assert.match(learnerFile, /^practice_progress_progress_student_[a-z0-9]{12}\.json$/);
    await page.evaluate(async (filename) => {
      const root = await navigator.storage.getDirectory();
      const folder = await root.getDirectoryHandle('Maths', { create: true });
      const notes = await folder.getFileHandle('existing-homework.txt', { create: true });
      const writer = await notes.createWritable();
      await writer.write('Keep this homework');
      await writer.close();
      sessionStorage.setItem('test-progress-file', filename);
      window.testProgressHandle = await folder.getFileHandle(filename, { create: true });
      window.showDirectoryPicker = async () => root;
      window.showSaveFilePicker = async () => window.testProgressHandle;
      window.showOpenFilePicker = async () => [window.testProgressHandle];
    }, learnerFile);
    await page.getByRole('button', { name: 'Choose OneDrive folder', exact: true }).click();
    await page.getByText(/Saved to your progress file/).waitFor();
    assert.equal(
      await page.evaluate(async () => {
        const root = await navigator.storage.getDirectory();
        const folder = await root.getDirectoryHandle('Maths');
        return (await (await folder.getFileHandle('existing-homework.txt')).getFile()).text();
      }),
      'Keep this homework',
    );
    assert.equal(
      await page.evaluate(
        async () => JSON.parse(await (await window.testProgressHandle.getFile()).text()).username,
      ),
      'Progress Student',
    );
    await page.reload();
    await page.getByRole('button', { name: 'Save progress file', exact: true }).waitFor();
    await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const folder = await root.getDirectoryHandle('Maths');
      const handle = await folder.getFileHandle(sessionStorage.getItem('test-progress-file'));
      window.showOpenFilePicker = async () => [handle];
      const value = JSON.parse(await (await handle.getFile()).text());
      value.exportedAt += 1;
      const writer = await handle.createWritable();
      await writer.write(JSON.stringify(value));
      await writer.close();
    });
    await page.getByRole('button', { name: 'Save progress file', exact: true }).click();
    await page.getByText(/This file has changed/).waitFor();
    await page.getByRole('button', { name: 'Open progress file', exact: true }).click();
    assert.ok(await page.getByRole('button', { name: 'Confirm import', exact: true }).isDisabled());
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Confirm import', exact: true }).click();
    await page.getByText(/Progress imported/).waitFor();
    await page.getByRole('button', { name: 'Save progress file', exact: true }).click();
    await page.getByText(/Saved to your progress file/).waitFor();
    await page.getByRole('button', { name: 'Forget file link', exact: true }).click();
    await page.getByRole('button', { name: 'Choose OneDrive folder', exact: true }).waitFor();
    await page.evaluate(() => sessionStorage.clear());
    await page.goto(`${base}fm/solving-equations/`);
    await page.getByRole('complementary', { name: 'Save browser progress to OneDrive' }).waitFor();
    await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      window.showDirectoryPicker = async () => root;
    });
    // Cancellation must give feedback, rather than silently leaving the invitation unchanged.
    await page.evaluate(() => {
      window.showDirectoryPicker = async () => {
        throw new DOMException('Cancelled', 'AbortError');
      };
    });
    await page.getByRole('button', { name: 'Save to OneDrive', exact: true }).click();
    await page.getByText(/Folder access was not granted/).waitFor();
    const beforeBackup = await page.evaluate(
      () => JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0],
    );
    const fallbackDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download backup', exact: true }).click();
    const backupDownload = await fallbackDownload;
    assert.equal(backupDownload.suggestedFilename(), learnerFile);
    const fallbackData = JSON.parse(await readFile(await backupDownload.path(), 'utf8'));
    assert.equal(fallbackData.learnerId, beforeBackup.id);
    assert.equal(fallbackData.username, beforeBackup.name);
    assert.deepEqual(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics,
      ),
      beforeBackup.topics,
    );
    await page.getByText(/JSON download started/).waitFor();
    assert.equal(
      await page.getByRole('button', { name: 'Save to OneDrive', exact: true }).count(),
      1,
    );
    await page.evaluate(() => {
      window.showDirectoryPicker = () => navigator.storage.getDirectory();
    });
    // Same personalised file already exists: setup must leave its bytes untouched.
    await page.getByRole('button', { name: 'Save to OneDrive', exact: true }).click();
    await page.getByText(/That progress file already exists/).waitFor();
    await page.evaluate(async () => {
      const root = await navigator.storage.getDirectory();
      const destination = await root.getDirectoryHandle('second-onedrive', { create: true });
      window.showDirectoryPicker = async () => destination;
    });
    await page.getByRole('button', { name: 'Save to OneDrive', exact: true }).click();
    await page.getByText(/Progress saved in your Maths folder/).waitFor();
    assert.equal(
      await page.evaluate(async (filename) => {
        const root = await navigator.storage.getDirectory();
        const selected = await root.getDirectoryHandle('second-onedrive');
        const maths = await selected.getDirectoryHandle('Maths');
        const saved = await maths.getFileHandle(filename);
        return JSON.parse(await (await saved.getFile()).text()).username;
      }, learnerFile),
      'Progress Student',
    );
    assert.equal(
      await page.getByRole('complementary', { name: 'Save browser progress to OneDrive' }).count(),
      0,
    );

    // Submitted answers save locally first; changing stage flushes the linked native file.
    await page.locator('[data-mode="plain"]').click();
    assert.equal(await page.locator('#answer').getAttribute('placeholder'), null);
    await page.locator('#answer').fill('999999');
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
    const submittedCount = await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics['maths:M10']
          .history.length,
    );
    await page.locator('[data-mode="demo"]').click();
    await page.waitForFunction(
      async ({ filename, count }) => {
        const root = await navigator.storage.getDirectory();
        const folder = await (
          await root.getDirectoryHandle('second-onedrive')
        ).getDirectoryHandle('Maths');
        const saved = JSON.parse(
          await (await (await folder.getFileHandle(filename)).getFile()).text(),
        );
        return saved.topics['maths:M10'].history.length === count;
      },
      { filename: learnerFile, count: submittedCount },
    );
    // An external newer result is offered on reload; declining leaves its file untouched.
    await page.evaluate(async (filename) => {
      const root = await navigator.storage.getDirectory();
      const folder = await (
        await root.getDirectoryHandle('second-onedrive')
      ).getDirectoryHandle('Maths');
      const handle = await folder.getFileHandle(filename);
      const saved = JSON.parse(await (await handle.getFile()).text());
      saved.progressUpdatedAt = Date.now() + 60000;
      saved.topics['maths:M10'].history.push({
        ...saved.topics['maths:M10'].history[0],
        attempt: 'cloud-newer-result',
        at: saved.progressUpdatedAt,
      });
      const writer = await handle.createWritable();
      await writer.write(JSON.stringify(saved));
      await writer.close();
    }, learnerFile);
    await page.reload();
    await page.getByRole('button', { name: 'Keep browser progress', exact: true }).click();
    assert.equal(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics[
          'maths:M10'
        ].history.some((item) => item.attempt === 'cloud-newer-result'),
      ),
      false,
    );
    await page.reload();
    await page.getByRole('button', { name: 'Use file progress', exact: true }).click();
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem('maths-practice-v2')).profiles[0].topics[
        'maths:M10'
      ].history.some((item) => item.attempt === 'cloud-newer-result'),
    );
    await page.locator('[data-mode="assessment"]').waitFor();

    await page.getByRole('link', { name: 'Progress', exact: true }).click();
    await page.evaluate(
      (filename) => sessionStorage.setItem('test-progress-file', filename),
      learnerFile,
    );
    // A genuinely separate browser store models a new computer. Clearing a live store can
    // race with outstanding autosaves and recreate the old learner before the import.
    const portable = await page.evaluate(async (filename) => {
      const root = await navigator.storage.getDirectory();
      const folder = await root.getDirectoryHandle('Maths');
      return (await (await folder.getFileHandle(filename)).getFile()).text();
    }, learnerFile);
    freshContext = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
    page = await freshContext.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.install({ time: new Date(2026, 9, 10, 12) });
    await page.goto(`${base}progress.html`);
    await page.getByRole('button', { name: 'Open progress file', exact: true }).waitFor();
    await page.evaluate(
      async ({ filename, raw }) => {
        const root = await navigator.storage.getDirectory();
        const handle = await root.getFileHandle(filename, { create: true });
        const writer = await handle.createWritable();
        await writer.write(raw);
        await writer.close();
        window.showOpenFilePicker = async () => [handle];
      },
      { filename: learnerFile, raw: portable },
    );
    await page.getByRole('button', { name: 'Open progress file', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm import', exact: true }).click();
    await page.getByText(/Progress imported/).waitFor();
    await page.getByRole('link', { name: 'Open recommended set', exact: true }).first().click();
    await page.getByRole('heading', { name: /Recommended practice set/, level: 2 }).waitFor();
    assert.equal(
      await page
        .getByText('Well done! Your focused practice will help your grades.', { exact: true })
        .count(),
      0,
    );
    await page.getByRole('link', { name: 'Progress', exact: true }).click();
    await page.locator('.revision-followup').waitFor();
    const id = await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('maths-practice-v2'));
      return data.profiles[0].revision.recommendations[0].id;
    });
    await page.reload();
    // Recommendation links render after the saved profile is restored on mount.
    await page.getByRole('link', { name: 'Continue recommended set', exact: true }).waitFor();
    assert.equal(
      await page.getByRole('link', { name: 'Continue recommended set', exact: true }).count(),
      1,
    );
    assert.equal(
      await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('maths-practice-v2'));
        return data.profiles[0].revision.recommendations[0].id;
      }),
      id,
    );
    await page.evaluate(() => {
      const data = JSON.parse(localStorage.getItem('maths-practice-v2')),
        profile = data.profiles[0],
        sample = profile.revision.recommendations[0],
        at = Date.now();
      profile.revision.recommendations = Array.from({ length: 15 }, (_, i) => ({
        ...sample,
        id: `completed-${i}`,
        createdAt: at,
        openedAt: at,
        completedAt: at,
      }));
      localStorage.setItem('maths-practice-v2', JSON.stringify(data));
    });
    await page.reload();
    await page.locator('.weekly-celebration').waitFor();
    assert.equal(
      await page.getByRole('link', { name: 'Open recommended set', exact: true }).count(),
      0,
    );
    await page.getByRole('button', { name: 'Generate more recommended sets', exact: true }).click();
    assert.equal(
      await page.getByRole('link', { name: 'Open recommended set', exact: true }).count(),
      3,
    );
    assert.deepEqual(errors, []);
    console.log(
      'Progress: mobile topic details, accessibility, JSON/CSV downloads, validated import, recommended opening and unfinished persistence pass.',
    );
  } catch (error) {
    await page.screenshot({ path: `${artifacts}/progress-failure.png`, fullPage: true });
    throw error;
  } finally {
    await freshContext?.close();
    await context.close();
  }
}
