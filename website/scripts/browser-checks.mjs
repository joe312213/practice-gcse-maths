import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:8767';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1380, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const bank = JSON.parse(await readFile(new URL('../static/data/equations.json', import.meta.url)));
const artifacts = '/private/tmp/maths-svelte-checks';
await mkdir(artifacts, { recursive: true });
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('maths-practice-v2')));
const topic = async () => { const s = await state(); return s.profiles.find(p => p.key === s.last).topics['maths:M10']; };
const active = async mode => (await topic()).pages[mode];
async function chooseName(name) {
  await page.locator('#profile-button').click();
  await page.locator('#username').fill(name);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  if (await page.locator('#profile-message').isVisible()) await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator('[data-mode="assessment"]').waitFor();
}
async function submitCorrect(mode, index, wrongReason = false) {
  await page.locator(`[data-question="${index}"]`).click();
  const p = await active(mode), q = bank.questions.find(q => q.id === p.items[index].id);
  if (mode === 'errors') for (const [i, error] of q.errors.entries()) {
    await page.locator(`#error-row-${i}`).selectOption(String(error.row));
    await page.locator(`#error-reason-${i}`).selectOption(wrongReason ? bank.teaching.errorReasons.find(r => r.id !== error.reason).id : error.reason);
    await page.locator(`#error-step-${i}`).selectOption(error.correction);
  }
  await page.locator('#answer').fill(q.answer);
  await page.getByRole('button', { name: 'Check answer', exact: true }).click();
  const after = await active(mode);
  assert.equal(after.responses[q.id].correct, !wrongReason);
  const next = !wrongReason ? Array.from({ length: after.items.length - 1 }, (_, n) => (index + n + 1) % after.items.length).find(i => !after.responses[after.items[i].id]) : undefined;
  assert.equal(Number(await page.locator('[data-question][aria-current="true"]').getAttribute('data-question')), next ?? index);
  if (next !== undefined) {
    assert.equal(await page.locator('#answer').inputValue(), '');
    assert.equal(await page.evaluate(() => document.activeElement.id), mode === 'errors' ? 'error-row-0' : 'answer');
  }
}
async function accessibility(label) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  await writeFile(`${artifacts}/axe-${label}.json`, JSON.stringify(results.violations, null, 2));
  assert.deepEqual(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })), [], `Accessibility: ${label}`);
}
async function shot(label) { await page.screenshot({ path: `${artifacts}/${label}.png`, fullPage: true }); }
try {
  await page.goto(base); await page.locator('#begin').waitFor();
  await chooseName('Migration Student');
  assert.equal(await page.locator('#hint, #reference, .progress-card').count(), 0);
  await accessibility('assessment'); await shot('assessment');
  for (const i of [2, 3, 0, 1]) await submitCorrect('assessment', i);
  assert.equal(await page.locator('#new-page, .summary').count(), 0);
  await page.locator('[data-mode="demo"]').click();
  assert.equal(await page.locator('.guidance li').count(), 2);
  await page.locator('#demo-play').click();
  await page.getByRole('button', { name: 'Replay', exact: true }).waitFor({ timeout: 12000 });
  await page.locator('[data-demo-level="2"]').click();
  assert.equal(await page.locator('.guidance li').count(), 4);
  await page.locator('[data-demo-example]').selectOption('recap');
  await page.locator('#demo-next').click();
  assert.match(await page.locator('.demo-working').innerText(), /3 is a common factor/);
  assert.equal(await page.locator('.equals span').first().evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
  const gap = await page.locator('.equals:not(.operation)').first().evaluate(el => ({ before: getComputedStyle(el, '::before').bottom, after: getComputedStyle(el, '::after').top, height: el.getBoundingClientRect().height }));
  assert.ok(parseFloat(gap.before) > gap.height / 2 && parseFloat(gap.after) > gap.height / 2, 'Divider has a real gap');
  await accessibility('demo'); await shot('demo');
  await page.locator('[data-mode="scaffolded"]').click();
  await page.locator('#level').selectOption('2');
  assert.equal(await page.locator('.guidance li').count(), 4);
  await page.locator('#typed-working').fill('draft working');
  await page.locator('#paper').check(); assert.equal(await page.locator('#working-tools').isVisible(), false);
  await page.locator('#paper').uncheck(); assert.equal(await page.locator('#typed-working').inputValue(), 'draft working');
  await page.locator('#paper').check(); await page.reload(); await page.locator('#paper').waitFor();
  assert.equal(await page.locator('#paper').isChecked(), false);
  await page.locator('[data-mode="plain"]').click();
  const positions = [];
  for (let i = 0; i < 10; i++) { await page.locator(`[data-question="${i}"]`).click(); positions.push(await page.locator('#answer').evaluate(el => el.getBoundingClientRect().top + scrollY)); }
  assert.ok(Math.max(...positions) - Math.min(...positions) < .5, 'Answer position stable');
  for (let i = 0; i < 10; i++) await submitCorrect('plain', i);
  assert.equal((await topic()).tracks.plain.level, 1);
  await page.reload(); await page.locator('[data-mode="plain"]').click(); assert.equal((await active('plain')).complete, true);
  await page.locator('#new-page').click(); await page.locator('#hint').click();
  const before = (await topic()).tracks.plain.histories[1].length;
  await submitCorrect('plain', 0); assert.equal((await topic()).tracks.plain.histories[1].length, before);
  await page.locator('#reference').click(); assert.equal(await page.locator('.reference').count(), 1);
  await page.locator('#close-reference').click();
  await page.locator('[data-mode="errors"]').click();
  await submitCorrect('errors', 0, true);
  await page.locator('#level').selectOption('2');
  // Search successive small pages until the authored two-error item is selected.
  let two = -1;
  for (let attempt = 0; attempt < 8; attempt++) {
    const p = await active('errors'); two = p.items.findIndex(i => bank.questions.find(q => q.id === i.id).errors.length === 2);
    if (two >= 0) break;
    for (let i = 0; i < p.size; i++) if (!p.responses[p.items[i].id]) await submitCorrect('errors', i);
    if (await page.locator('#accept-promotion').count()) await page.locator('#accept-promotion').click();
    await page.locator('#new-page').click();
  }
  assert.ok(two >= 0); await page.locator(`[data-question="${two}"]`).click();
  assert.equal(await page.locator('.error-entry').count(), 2); await accessibility('two-errors'); await shot('two-errors');
  await submitCorrect('errors', two);
  for (const width of [1380, 1000, 768, 600, 390, 320]) {
    await page.setViewportSize({ width, height: 900 }); await page.locator('[data-mode="plain"]').click();
    const sizes = await page.evaluate(() => ({ columns: getComputedStyle(document.querySelector('.question-list')).gridTemplateColumns.split(' ').length, widths: [...document.querySelectorAll('.question-option')].map(el => el.getBoundingClientRect().width), overflow: document.documentElement.scrollWidth > innerWidth }));
    assert.equal(sizes.overflow, false, `No overflow at ${width}`);
    if (sizes.columns === 2) assert.ok(sizes.widths.every(w => w >= 210));
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#reference').click(); await page.getByRole('dialog', { name: 'Method reference' }).waitFor();
  await accessibility('reference-mobile'); await shot('reference-mobile');
  await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => document.activeElement.id), 'reference');
  const canvas = page.locator('#working'); await canvas.scrollIntoViewIfNeeded(); const box = await canvas.boundingBox();
  await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down(); await page.mouse.move(box.x + 75, box.y + 40); await page.mouse.up();
  assert.equal(await canvas.evaluate(el => el.getContext('2d').getImageData(0, 0, 700, 460).data.some((v, i) => i % 4 === 3 && v > 0)), true);
  await page.locator('#paper').check(); await page.locator('#paper').uncheck();
  assert.equal(await canvas.evaluate(el => el.getContext('2d').getImageData(0, 0, 700, 460).data.some((v, i) => i % 4 === 3 && v > 0)), true);
  await page.locator('[data-question="3"]').click(); assert.equal(await canvas.evaluate(el => el.getContext('2d').getImageData(0, 0, 700, 460).data.some((v, i) => i % 4 === 3 && v > 0)), false);
  await page.locator('#theme-picker').click();
  const captures = [];
  for (const mode of ['light', 'dark']) for (const palette of ['sage', 'blue', 'rose', 'apricot']) {
    await page.locator(`[data-theme-choice="${mode}:${palette}"]`).click(); await page.locator('#theme-reset').click();
    captures.push(await page.evaluate(() => { const root = getComputedStyle(document.documentElement), body = getComputedStyle(document.body), card = getComputedStyle(document.querySelector('.card')); return { mode: document.documentElement.dataset.theme, palette: document.documentElement.dataset.palette, background: body.backgroundColor, image: body.backgroundImage, text: body.color, cardImage: card.backgroundImage, main: root.getPropertyValue('--main'), selection: root.getPropertyValue('--selection-bg'), saturation: root.getPropertyValue('--theme-saturation'), lightness: root.getPropertyValue('--theme-bg-lightness') }; }));
  }
  const baseline = JSON.parse(await readFile('/private/tmp/maths-migration-theme-baseline.json'));
  const normalized = await page.evaluate(lists => {
    const probe = document.createElement('span');document.body.append(probe);
    const colour = value => { probe.style.color = value;return getComputedStyle(probe).color; };
    const result = lists.map(list => list.map(row => ({ ...row, main: colour(row.main), selection: colour(row.selection) })));
    probe.remove();return result;
  }, [captures, baseline]);
  assert.deepEqual(normalized[0], normalized[1], 'All eight rendered theme colours and gradients match exactly');
  await page.locator('[data-theme-choice="dark:blue"]').click();
  await page.locator('#theme-saturation').evaluate(el => { el.value = '70'; el.dispatchEvent(new Event('input', { bubbles: true })); }); await page.keyboard.press('Escape');
  await page.reload(); await page.locator('#theme-picker').click(); assert.equal(await page.locator('#theme-saturation').inputValue(), '70');
  await accessibility('theme-mobile'); await shot('theme-mobile'); await page.keyboard.press('Escape');
  await page.locator('footer a').click(); await page.getByRole('heading', { name: 'About Maths practice' }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.palette), 'blue'); await accessibility('about');
  await page.goto(base); await chooseName('Another Student'); assert.equal((await topic()).history.length, 0);
  await page.locator('[data-mode="plain"]').click(); await page.locator('#answer').fill('1/0'); await page.getByRole('button', { name: 'Check answer', exact: true }).click(); assert.equal((await active('plain')).count, 0);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('[data-mode="demo"]').click(); await page.locator('#demo-next').click(); assert.equal(await page.locator('.demo-working').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.deepEqual(errors, []);
  console.log('Browser checks passed: activity parity, accessible forms/dialogs, auto-advance, drawing, responsive geometry, exact theme colours/gradients, persistence and reduced motion.');
} catch (error) {
  await shot('failure'); console.error('Browser errors:', errors, '\nPage:', (await page.locator('body').innerText()).slice(0, 1200)); throw error;
} finally { await browser.close(); }
