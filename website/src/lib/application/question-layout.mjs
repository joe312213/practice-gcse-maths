/**
 * Purpose: Fit question tiles to measured content, balancing rows while retaining full-width
 * slots for long expressions. DOM observers update layout when available width or text metrics
 * change.
 *
 * Main contents:
 * - balancedQuestionRows, fitQuestionRows.
 *
 * Used By: tests/question-layout.test.mjs,
 * website/src/lib/components/practice/QuestionList.svelte.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
/** Use the fewest rows allowed by capacity, then distribute items as evenly as possible. */
export function balancedQuestionRows(count, capacity) {
  const rows = Math.ceil(count / capacity);
  return Array.from(
    { length: rows },
    (_, row) => Math.floor(count / rows) + (row < count % rows ? 1 : 0),
  );
}

/** Bind question-grid measurement to the supplied question-list element. Balance row sizes using measured content and return observer cleanup; called as a Svelte action by QuestionList. */
export function fitQuestionRows(list) {
  let frame = 0,
    disposed = false;
  /** Measure actual maths markup at its default size, then choose columns and bounded fonts. */
  function fit() {
    cancelAnimationFrame(frame);
    frame = 0;
    const style = getComputedStyle(list),
      width = list.clientWidth;
    if (!width) return;
    const minimum = parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.875;
    const gap = parseFloat(style.gap),
      preferred = Number(style.getPropertyValue('--question-columns'));
    const items = [...list.children].map((item) => {
      item.style.removeProperty('--question-fit-font');
      const equation = item.querySelector('.equation'),
        button = item.querySelector('button');
      const buttonStyle = getComputedStyle(button);
      const inset =
        parseFloat(buttonStyle.paddingLeft) +
        parseFloat(buttonStyle.paddingRight) +
        parseFloat(buttonStyle.borderLeftWidth) +
        parseFloat(buttonStyle.borderRightWidth);
      const size = parseFloat(getComputedStyle(equation).fontSize);
      // Measure the ink, not a span box that browser button layout can constrain.
      const range = document.createRange();
      range.selectNodeContents(equation);
      return {
        item,
        prose: item.classList.contains('word-problem'),
        natural: range.getBoundingClientRect().width,
        range,
        inset,
        size,
      };
    });
    const cell = (columns) => (width - gap * (columns - 1)) / columns;
    // Three columns remain an option on assessments/wide panels, but two readable columns take precedence.
    const capacity =
      preferred === 3 &&
      items.every((item) =>
        item.prose ? cell(3) >= 224 : (item.natural * minimum) / item.size + item.inset <= cell(3),
      )
        ? 3
        : 2;
    const columns = balancedQuestionRows(items.length, capacity)[0] ?? 1;
    list.style.setProperty('--question-layout-columns', String(columns));
    for (const { item, prose, natural, inset, size, range } of items) {
      const available = cell(columns) - inset;
      let fitted = Math.min(size, (size * available) / Math.max(1, natural));
      let wide = prose ? cell(columns) < 224 : fitted < minimum;
      if (!prose && !wide) {
        // Optical sizing/hinting need not scale linearly. Confirm the resulting ink fits.
        for (let pass = 0; pass < 3; pass++) {
          item.style.setProperty('--question-fit-font', `${Math.max(minimum, fitted)}px`);
          const actual = range.getBoundingClientRect().width;
          if (actual <= available) break;
          fitted = (fitted * available) / actual - 0.03;
          if (fitted < minimum) break;
        }
        wide = fitted < minimum || range.getBoundingClientRect().width > available;
      }
      item.classList.toggle('wide-question', wide);
      if (wide) item.style.removeProperty('--question-fit-font');
    }
    // Full-width expressions separate runs. Balance each run without moving DOM nodes
    // or stretching a shorter row's cards; symmetric margins force its row boundary.
    let run = [];
    function balanceRun() {
      let offset = 0;
      for (const count of balancedQuestionRows(run.length, columns)) {
        const inset = `calc((100% + var(--question-gap)) * ${columns - count} / ${2 * columns})`;
        run[offset].style.marginInlineStart = inset;
        run[offset + count - 1].style.marginInlineEnd = inset;
        offset += count;
      }
      run = [];
    }
    for (const { item } of items) {
      item.style.removeProperty('margin-inline-start');
      item.style.removeProperty('margin-inline-end');
      if (item.classList.contains('wide-question')) balanceRun();
      else run.push(item);
    }
    balanceRun();
  }
  /** Coalesce resize, text and page changes into one measurement before paint. */
  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(fit);
  }
  let previousWidth = 0;
  const resize = new ResizeObserver(([entry]) => {
    if (entry.contentRect.width !== previousWidth) {
      previousWidth = entry.contentRect.width;
      fit();
    }
  });
  const mutation = new MutationObserver(schedule);
  resize.observe(list);
  mutation.observe(list, { subtree: true, childList: true, characterData: true });
  window.addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  schedule();
  return {
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', schedule);
    },
  };
}
