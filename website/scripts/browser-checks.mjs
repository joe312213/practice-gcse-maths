import { checkProgress } from './browser/progress-checks.mjs';
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { artifacts, launchBrowser, serveStatic, createTestContext } from './browser/support.mjs';
import { checkVisuals } from './browser/visual-checks.mjs';
import { checkStartup } from './browser/startup-checks.mjs';
import { checkThemes } from './browser/theme-checks.mjs';
import { checkPresentation } from './browser/presentation-checks.mjs';
import AxeBuilder from '@axe-core/playwright';
import { checkPracticeSets } from './browser/practice-set-checks.mjs';
import { checkColours } from './browser/colour-checks.mjs';

const server = process.env.BASE_URL
  ? null
  : await serveStatic(
      fileURLToPath(new URL('../build/', import.meta.url)),
      process.env.BASE_PATH || '',
    );
const base = process.env.BASE_URL || server.url;
const browser = await launchBrowser();
const focused = {
  '--progress-only': checkProgress,
  '--practice-sets-only': checkPracticeSets,
  '--presentation-only': checkPresentation,
  '--colours-only': checkColours,
  '--startup-only': checkStartup,
};
const focus = Object.keys(focused).find((flag) => process.argv.includes(flag));
if (focus) {
  try {
    await focused[focus](browser, base);
  } finally {
    await browser.close();
    await server?.close();
  }
  process.exit(0);
}
const activitiesOnly = process.argv.includes('--activities-only');
const context = await createTestContext(browser, { viewport: { width: 1380, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const bank = JSON.parse(await readFile(new URL('../static/data/equations.json', import.meta.url)));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('maths-practice-v2')));
const topic = async () => {
  const s = await state();
  return s.profiles.find((p) => p.key === s.last).topics['maths:M10'];
};
const active = async (mode) => (await topic()).pages[mode];
async function chooseName(name) {
  await page.locator('#profile-button').click();
  await page.locator('#username').fill(name);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  if (await page.locator('#profile-message').isVisible())
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator('[data-mode="assessment"]').waitFor();
}
async function submitCorrect(mode, index, wrongReason = false) {
  await page.locator(`[data-question="${index}"]`).click();
  const p = await active(mode),
    q = bank.questions.find((q) => q.id === p.items[index].id);
  if (mode === 'errors')
    for (const [i, error] of q.errors.entries()) {
      await page.locator(`#error-row-${i}`).selectOption(String(error.row));
      await page
        .locator(`#error-reason-${i}`)
        .selectOption(
          wrongReason
            ? bank.teaching.errorReasons.find((r) => r.id !== error.reason).id
            : error.reason,
        );
      await page.locator(`#error-step-${i}`).selectOption(error.correction);
    }
  await page.locator('#answer').fill(q.answer);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  const after = await active(mode);
  assert.equal(after.responses[q.id].correct, !wrongReason);
  const next = !wrongReason
    ? Array.from(
        { length: after.items.length - 1 },
        (_, n) => (index + n + 1) % after.items.length,
      ).find((i) => !after.responses[after.items[i].id])
    : undefined;
  assert.equal(
    Number(
      await page.locator('[data-question][aria-current="true"]').getAttribute('data-question'),
    ),
    next ?? index,
  );
  if (next !== undefined) {
    assert.equal(await page.locator('#answer').inputValue(), '');
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      mode === 'errors' ? 'error-row-0' : 'answer',
    );
  }
}
async function accessibility(label) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  await writeFile(`${artifacts}/axe-${label}.json`, JSON.stringify(results.violations, null, 2));
  assert.deepEqual(
    results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
    `Accessibility: ${label}`,
  );
}
async function shot(label) {
  await page.screenshot({ path: `${artifacts}/${label}.png`, fullPage: true });
}
try {
  await page.goto(base);
  await page.locator('#begin').waitFor();
  await chooseName('Migration Student');
  assert.equal(await page.locator('#hint, #reference, .progress-card').count(), 0);
  await accessibility('assessment');
  await shot('assessment');
  for (const i of [2, 3, 0, 1]) await submitCorrect('assessment', i);
  assert.equal(await page.locator('#new-page, .summary').count(), 0);
  await page.locator('#assessment-next').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'stage-title');
  assert.equal(await page.locator('.guidance li').count(), 2);
  await page.locator('#demo-play').click();
  await page.getByRole('button', { name: 'Replay', exact: true }).waitFor({ timeout: 12000 });
  await page.locator('[data-demo-level="2"]').click();
  assert.equal(await page.locator('.guidance li').count(), 4);
  await page.locator('[data-demo-example]').selectOption('recap');
  await page.locator('#demo-next').click();
  assert.match(await page.locator('.demo-working').innerText(), /3 is a common factor/);
  assert.equal(
    await page
      .locator('.equals span')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgba(0, 0, 0, 0)',
  );
  const line = await page
    .locator('.equation-divider')
    .first()
    .evaluate((el) => ({
      image: getComputedStyle(el).backgroundImage,
      size: getComputedStyle(el).backgroundSize,
    }));
  assert.match(line.image, /linear-gradient/);
  assert.equal(line.size, '2px 100%', 'Continuous divider fills its column');
  const noteBesideStep = await page
    .locator('.balance tr[data-step]')
    .first()
    .evaluate((row) => {
      const note = row.querySelector('.step-note').getBoundingClientRect();
      const equation = row.querySelector('.lhs').getBoundingClientRect();
      return note.right <= equation.left && Math.abs(note.top - equation.top) < 1;
    });
  assert.ok(noteBesideStep, 'Explanation sits to the left of its equation step');
  await accessibility('demo');
  await shot('demo');
  await page.locator('#next-stage').click();
  assert.equal(await page.evaluate(() => document.activeElement.id), 'stage-title');
  await page.locator('#level').selectOption('2');
  assert.equal(await page.locator('.guidance li').count(), 4);
  await page.locator('#typed-working').fill('draft working');
  await page.locator('#paper').check();
  assert.equal(await page.locator('#working-tools').isVisible(), false);
  await page.locator('#paper').uncheck();
  assert.equal(await page.locator('#typed-working').inputValue(), 'draft working');
  await page.locator('#paper').check();
  await page.reload();
  await page.locator('#paper').waitFor();
  assert.equal(await page.locator('#paper').isChecked(), false);
  await page.locator('[data-mode="scaffolded"]').click();
  for (let i = 0; i < (await active('scaffolded')).size; i++) await submitCorrect('scaffolded', i);
  await page.locator('#next-stage').click();
  assert.equal(await page.locator('[data-mode="errors"]').getAttribute('aria-current'), 'step');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'stage-title');
  await page.locator('[data-mode="plain"]').click();
  const positions = [];
  for (let i = 0; i < 10; i++) {
    await page.locator(`[data-question="${i}"]`).click();
    positions.push(
      await page.locator('#answer').evaluate((el) => el.getBoundingClientRect().top + scrollY),
    );
  }
  assert.ok(Math.max(...positions) - Math.min(...positions) < 0.5, 'Answer position stable');
  for (let i = 0; i < 10; i++) await submitCorrect('plain', i);
  assert.equal((await topic()).tracks.plain.level, 1);
  assert.equal(await page.locator('#next-stage').count(), 0);
  await page.reload();
  await page.locator('[data-mode="plain"]').click();
  assert.equal((await active('plain')).complete, true);
  await page.locator('#new-page').click();
  await page.locator('#hint').click();
  const before = (await topic()).tracks.plain.histories[1].length;
  await submitCorrect('plain', 0);
  assert.equal((await topic()).tracks.plain.histories[1].length, before);
  await page.locator('#reference').click();
  assert.equal(await page.locator('.reference').count(), 1);
  await page.locator('#close-reference').click();
  await page.locator('[data-mode="errors"]').click();
  await submitCorrect('errors', 0, true);
  await page.locator('#level').selectOption('2');
  // Search successive small pages until the authored two-error item is selected.
  let two = -1;
  for (let attempt = 0; attempt < 8; attempt++) {
    const p = await active('errors');
    two = p.items.findIndex((i) => bank.questions.find((q) => q.id === i.id).errors.length === 2);
    if (two >= 0) break;
    for (let i = 0; i < p.size; i++)
      if (!p.responses[p.items[i].id]) await submitCorrect('errors', i);
    if (await page.locator('#accept-promotion').count())
      await page.locator('#accept-promotion').click();
    await page.locator('#new-page').click();
  }
  assert.ok(two >= 0);
  await page.locator(`[data-question="${two}"]`).click();
  assert.equal(await page.locator('.error-entry').count(), 2);
  await accessibility('two-errors');
  await shot('two-errors');
  await submitCorrect('errors', two);
  const errorPage = await active('errors');
  for (let i = 0; i < errorPage.size; i++)
    if (!errorPage.responses[errorPage.items[i].id]) await submitCorrect('errors', i);
  await page.locator('#next-stage').click();
  assert.equal(await page.locator('[data-mode="plain"]').getAttribute('aria-current'), 'step');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'stage-title');
  for (const width of [1380, 1000, 768, 600, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('[data-mode="plain"]').click();
    const sizes = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('.question-option')].map((el) =>
        el.getBoundingClientRect(),
      );
      return {
        pairedWidths: boxes
          .filter((box) =>
            boxes.some((other) => other !== box && Math.abs(other.top - box.top) < 1),
          )
          .map((box) => box.width),
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    assert.equal(sizes.overflow, false, `No overflow at ${width}`);
    assert.ok(
      sizes.pairedWidths.every((width) => width >= 210),
      'Two-card rows retain the minimum width',
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#reference').click();
  await page.getByRole('dialog', { name: 'Method reference' }).waitFor();
  await accessibility('reference-mobile');
  await shot('reference-mobile');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'reference');
  const canvas = page.locator('#working');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 75, box.y + 40);
  await page.mouse.up();
  assert.equal(
    await canvas.evaluate((el) =>
      el
        .getContext('2d')
        .getImageData(0, 0, 700, 460)
        .data.some((v, i) => i % 4 === 3 && v > 0),
    ),
    true,
  );
  await page.locator('#paper').check();
  await page.locator('#paper').uncheck();
  assert.equal(
    await canvas.evaluate((el) =>
      el
        .getContext('2d')
        .getImageData(0, 0, 700, 460)
        .data.some((v, i) => i % 4 === 3 && v > 0),
    ),
    true,
  );
  await page.locator('[data-question="3"]').click();
  assert.equal(
    await canvas.evaluate((el) =>
      el
        .getContext('2d')
        .getImageData(0, 0, 700, 460)
        .data.some((v, i) => i % 4 === 3 && v > 0),
    ),
    false,
  );
  if (!activitiesOnly)
    await checkThemes(browser, page, { extended: process.argv.includes('--extended') });
  else {
    await page.locator('#theme-picker').click();
    await page.locator('[data-theme-choice="dark:blue"]').click();
    await page.locator('#theme-reset').click();
  }
  await page.locator('#theme-saturation').evaluate((el) => {
    el.value = '70';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.keyboard.press('Escape');
  await page.reload();
  await page.locator('#theme-picker').click();
  assert.equal(await page.locator('#theme-saturation').inputValue(), '70');
  await accessibility('theme-mobile');
  await shot('theme-mobile');
  await page.keyboard.press('Escape');
  await page.locator('footer a').click();
  await page.getByRole('heading', { name: 'About Maths practice' }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.palette), 'blue');
  await accessibility('about');
  await page.goto(base);
  await chooseName('Another Student');
  assert.equal((await topic()).history.length, 0);
  await page.locator('[data-mode="plain"]').click();
  await page.locator('#answer').fill('1/0');
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  assert.equal((await active('plain')).count, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-mode="demo"]').click();
  await page.locator('#demo-next').click();
  assert.equal(
    await page.locator('.demo-working').evaluate((el) => getComputedStyle(el).animationName),
    'none',
  );
  assert.deepEqual(errors, []);
  if (!activitiesOnly) await checkStartup(browser, base);
  if (process.argv.includes('--extended')) await checkVisuals(browser, base);
  console.log(
    'Browser checks passed: activity parity, accessible forms/dialogs, auto-advance, drawing, responsive geometry, exact theme colours/gradients, persistence and reduced motion.',
  );
} catch (error) {
  await shot('failure');
  console.error(
    'Browser errors:',
    errors,
    '\nPage:',
    (await page.locator('body').innerText()).slice(0, 1200),
  );
  throw error;
} finally {
  await browser.close();
  await server?.close();
}
