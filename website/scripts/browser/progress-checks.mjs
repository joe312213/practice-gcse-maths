import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { createTestContext, artifacts } from './support.mjs';
export async function checkProgress(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto(base);
    await page.locator('#begin').click();
    await page.locator('#username').fill('Progress Student');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await page.locator('#profile-message').isVisible())
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('link', { name: 'Progress', exact: true }).click();
    await page.getByRole('heading', { name: 'Your progress', exact: true }).waitFor();
    await page.getByText('0 questions answered', { exact: true }).waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.locator('.challenge-stage').first().click();
    await page.getByRole('heading', { name: 'Start · Solving equations', exact: true }).waitFor();
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    assert.deepEqual(audit.violations, []);
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
    await page.getByRole('button', { name: 'Confirm import', exact: true }).click();
    await page.getByText('Progress imported.', { exact: true }).waitFor();
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
    await context.close();
  }
}
