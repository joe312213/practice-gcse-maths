/** Real same-origin tabs must hand over fresh progress, never stale snapshots. */
import assert from 'node:assert/strict';
import { expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createTestContext } from './support.mjs';

export async function checkProgressTabs(browser, base) {
  const context = await createTestContext(browser);
  const bank = JSON.parse(
    await readFile(new URL('../../static/data/equations.json', import.meta.url)),
  );
  const state = (page) =>
    page.evaluate(() => JSON.parse(localStorage.getItem('maths-practice-v2')));
  const history = async (page) =>
    (await state(page)).profiles[0].subjects.maths.topics['maths:M10'].history;
  const continueHere = async (page) => {
    await page.getByRole('button', { name: 'Continue in this tab', exact: true }).click();
    await page.locator('#answer').waitFor();
  };
  async function answer(page, index) {
    const data = await state(page);
    const attempt = data.profiles[0].subjects.maths.topics['maths:M10'].pages.assessment;
    const question = bank.questions.find((q) => q.id === attempt.items[index].id);
    await page.locator(`[data-question="${index}"]`).click();
    await page.locator('#answer').fill(question.answer);
    await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  }
  try {
    const first = await context.newPage();
    await first.goto(`${base}fm/solving-equations/`);
    await first.locator('#begin').click();
    await first.locator('#username').fill('Two tabs');
    await first.getByRole('button', { name: 'Continue', exact: true }).click();
    if (await first.locator('#profile-message').isVisible())
      await first.getByRole('button', { name: 'Continue', exact: true }).click();
    await first.locator('#answer').waitFor();
    const second = await context.newPage();
    await second.goto(`${base}fm/solving-equations/`);
    await second.getByRole('button', { name: 'Continue in this tab' }).waitFor();
    assert.equal(await second.locator('#answer').count(), 0);
    await answer(first, 0);
    const before = await history(first);
    await continueHere(second);
    await first.getByRole('button', { name: 'Continue in this tab' }).waitFor();
    assert.deepEqual(await history(second), before);
    assert.equal(await first.locator('#answer').count(), 0);
    await answer(second, 1);
    const both = await history(second);
    assert.equal(both.length, 2);
    await continueHere(first);
    assert.deepEqual(await history(first), both);
    // Closing the owner releases the browser lease; no forced timeout/steal is used.
    await first.close();
    await continueHere(second);
    assert.deepEqual(await history(second), both);
    await second.getByRole('link', { name: 'Progress', exact: true }).click();
    await second.locator('#rename-profile').fill('Renamed in active tab');
    await second.getByRole('button', { name: 'Rename profile', exact: true }).click();
    await expect
      .poll(async () => (await state(second)).profiles[0].name)
      .toBe('Renamed in active tab');
    const code = (await state(second)).profiles[0].studentId;
    assert.match(
      await second.locator('#profile-management-title').locator('..').innerText(),
      new RegExp(code),
    );
    await second.reload();
    await second.locator('#rename-profile').waitFor();
    assert.deepEqual(await history(second), both);
    assert.equal((await state(second)).profiles[0].studentId, code);
    // A picker and its subsequent real file transaction must finish before the next tab mounts.
    const third = await context.newPage();
    await third.goto(`${base}fm/solving-equations/`);
    await third.getByRole('button', { name: 'Continue in this tab' }).waitFor();
    await second.evaluate(() => {
      window.showDirectoryPicker = () =>
        new Promise((resolve) => {
          window.finishPicker = resolve;
        });
    });
    await second.getByRole('button', { name: 'Choose OneDrive folder', exact: true }).click();
    await second.waitForFunction(() => Boolean(window.finishPicker));
    await third.getByRole('button', { name: 'Continue in this tab' }).click();
    await third.getByText(/Finishing saves in the active tab/).waitFor();
    assert.equal(await third.locator('#answer').count(), 0);
    await second.evaluate(async () => {
      window.finishPicker(await navigator.storage.getDirectory());
    });
    await third.locator('#answer').waitFor();
    await second.getByRole('button', { name: 'Continue in this tab' }).waitFor();
    assert.deepEqual(await history(third), both);
    const written = await third.evaluate(async () => {
      const folder = await (await navigator.storage.getDirectory()).getDirectoryHandle('Maths');
      for await (const handle of folder.values())
        if (handle.name.endsWith('.json')) return JSON.parse(await (await handle.getFile()).text());
    });
    assert.deepEqual(written.subjects.maths.topics['maths:M10'].history, both);
    assert.equal(written.studentId, code);
    assert.equal((await state(third)).profiles[0].backup.lastExportType, 'json');
    console.log(
      'Progress tabs: standby, repeated handover, fresh answers, close, navigation and identity passed.',
    );
  } finally {
    await context.close();
  }
}
