/** Focused checks for playback cosmetics, final highlights and the three working renderers. */
import assert from 'node:assert/strict';
import { artifacts, createTestContext } from './support.mjs';

async function checkEquationWidths(page) {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const level of [0, 1, 2]) {
      await page.locator(`[data-demo-level="${level}"]`).click();
      for (const example of ['demo', 'recap']) {
        await page.locator('[data-demo-example]').selectOption(example);
        await page.waitForFunction(() => !document.querySelector('#demo-play')?.disabled);
        if (await page.locator('#demo-all').isEnabled()) await page.locator('#demo-all').click();
        await page.waitForFunction(() => document.querySelector('.balance [data-stroke]'));
        const fit = await page.locator('.demo-working').evaluate((working) => {
          const bounds = working.getBoundingClientRect();
          const rows = [...working.querySelectorAll('.balance tr')];
          return {
            overflow: working.scrollWidth > working.clientWidth + 1,
            containerWidth: working.clientWidth,
            tableWidth: working.querySelector('table').getBoundingClientRect().width,
            cells: [...rows[0].cells].map((cell) => ({
              width: cell.getBoundingClientRect().width,
              padding: getComputedStyle(cell).padding,
            })),
            noteWidth: rows[0].querySelector('.step-note').getBoundingClientRect().width,
            strokesFit: rows.every((row) => {
              const note = row.querySelector('.step-note').getBoundingClientRect();
              return [...row.querySelectorAll('[data-stroke]')].every((path) => {
                const ink = path.getBoundingClientRect();
                return ink.left >= note.right - 1 && ink.right <= bounds.right - 1;
              });
            }),
          };
        });
        assert.ok(!fit.overflow && fit.strokesFit, JSON.stringify({ width, level, example, fit }));
        if (width === 360 && level === 0 && example === 'demo') {
          assert.ok(fit.noteWidth >= 150, `Short working leaves room for prose: ${fit.noteWidth}`);
          await page
            .locator('.demo-working')
            .screenshot({ path: `${artifacts}/equation-prose-360.png` });
        }
      }
    }
  }
  await page.setViewportSize({ width: 360, height: 900 });
}

export async function checkMethodPlayback(browser, base) {
  const context = await createTestContext(browser, { viewport: { width: 360, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    for (const topic of [
      'solving-equations',
      'lattice-multiplication',
      'fraction-addition-subtraction',
    ]) {
      await page.goto(`${base}fm/${topic}/`);
      await page.locator('#begin, [data-mode="demo"]').first().waitFor();
      if (await page.locator('#begin').isVisible()) {
        await page.locator('#begin').click();
        await page.locator('#username').fill('Playback review');
        await page.getByRole('button', { name: 'Continue', exact: true }).click();
        if (await page.locator('#profile-message').isVisible())
          await page.getByRole('button', { name: 'Continue', exact: true }).click();
      }
      await page.locator('[data-mode="demo"]').click();
      assert.equal(await page.locator('#demo-play').textContent(), 'Play demo');
      await page.locator('.demo-working').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('#demo-play').disabled);
      assert.ok(
        await page.locator('.demo-working [data-stroke]').count(),
        'The first teaching step already shows its working',
      );
      await page.locator('#demo-play').click();
      await page.waitForFunction(
        () => document.querySelector('.demo-working').getAnimations({ subtree: true }).length > 0,
      );
      await page.locator('#demo-all').click();
      await page.waitForFunction(() =>
        document.getAnimations().some((animation) => animation.id === 'method-highlight-fade'),
      );
      await page.locator('[data-demo-speed]').selectOption('2');
      const controls = await page.locator('.demo-controls').evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const buttons = [...element.querySelectorAll('button, select')].map((node) =>
          node.getBoundingClientRect(),
        );
        return {
          centred:
            Math.abs(
              Math.min(...buttons.map((box) => box.left)) +
                Math.max(...buttons.map((box) => box.right)) -
                bounds.left -
                bounds.right,
            ) < 2,
          oneRow:
            Math.max(...buttons.map((box) => box.y + box.height / 2)) -
              Math.min(...buttons.map((box) => box.y + box.height / 2)) <
            1,
        };
      });
      assert.ok(controls.centred && controls.oneRow, JSON.stringify(controls));
      assert.ok(await page.locator('.demo-working [data-stroke]').count());
      const fade = await page.locator('.demo-stage').evaluate((stage) => {
        const animations = stage
          .getAnimations({ subtree: true })
          .filter((animation) => animation.id === 'method-highlight-fade');
        const alpha = (target) => {
          const canvas = document.createElement('canvas');
          const paint = canvas.getContext('2d');
          paint.fillStyle =
            getComputedStyle(target)[target.matches('.method-focus') ? 'fill' : 'backgroundColor'];
          paint.fillRect(0, 0, 1, 1);
          return paint.getImageData(0, 0, 1, 1).data[3];
        };
        const samples = animations.map((animation) => {
          animation.pause();
          const timing = animation.effect.getTiming();
          animation.currentTime = 2999;
          const held = alpha(animation.effect.target);
          animation.currentTime = 3500;
          const halfway = alpha(animation.effect.target);
          animation.currentTime = 4001;
          const end = alpha(animation.effect.target);
          return {
            delay: timing.delay,
            duration: timing.duration,
            rate: animation.playbackRate,
            held,
            halfway,
            end,
          };
        });
        const note = stage.querySelector('.step-note[aria-current], .steps li[aria-current]');
        return {
          samples,
          accent: note ? getComputedStyle(note).boxShadow : 'none',
          inkVisible: [...stage.querySelectorAll('[data-written-ink]')].every(
            (svg) => getComputedStyle(svg).visibility === 'visible',
          ),
        };
      });
      assert.ok(fade.samples.length);
      for (const sample of fade.samples) {
        assert.equal(sample.delay, 3000);
        assert.equal(sample.duration, 1000);
        assert.equal(
          sample.rate,
          1,
          'The final highlight uses real seconds at every writing speed',
        );
        assert.ok(sample.held >= 215 && sample.held <= 218, JSON.stringify(sample));
        assert.ok(Math.abs(sample.halfway - sample.held / 2) <= 2, JSON.stringify(sample));
        assert.equal(sample.end, 0);
      }
      assert.equal(fade.accent, 'none');
      assert.ok(fade.inkVisible, 'Only the highlight fades, never the maths');
      await page.locator('#demo-play').click();
      assert.equal(
        await page
          .locator('.demo-stage')
          .evaluate(
            (stage) =>
              stage.getAnimations({ subtree: true }).filter((a) => a.id === 'method-highlight-fade')
                .length,
          ),
        0,
        'Replay cancels the old fade',
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.locator('#demo-all').click();
      await page.waitForFunction(() =>
        document.getAnimations().some((a) => a.id === 'method-highlight-fade'),
      );
      const reduced = await page.locator('.demo-stage').evaluate((stage) =>
        stage
          .getAnimations({ subtree: true })
          .filter((a) => a.id === 'method-highlight-fade')
          .map((a) => a.effect.getTiming()),
      );
      assert.ok(reduced.every((timing) => timing.delay === 3000 && timing.duration === 0));
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (topic === 'solving-equations') await checkEquationWidths(page);
    }
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
}
