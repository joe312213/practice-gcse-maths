/** Pack topic cards in source order into the shortest column, taking the leftmost tie.
 * CSS owns column widths/gaps; the unenhanced grid remains a usable static fallback.
 */
export function topicMasonry(container) {
  let frame = 0,
    disposed = false;
  const observed = new Set();

  function layout() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (disposed || !container.clientWidth) return;
    const style = getComputedStyle(container);
    const columns = style.gridTemplateColumns.split(' ').length;
    const gap = parseFloat(style.columnGap);
    // Fit measured container space, including fractional tracks and Safari grid rounding.
    const width = (container.getBoundingClientRect().width - gap * (columns - 1)) / columns;
    const heights = Array(columns).fill(0);
    container.classList.add('masonry-ready');
    for (const item of container.children) item.style.width = `${width}px`;
    for (const item of container.children) {
      const column = heights.indexOf(Math.min(...heights));
      item.style.left = `${column * (width + gap)}px`;
      item.style.top = `${heights[column]}px`;
      // Each slot includes its own top gap, also reserving space for future Draft stamps.
      heights[column] += item.getBoundingClientRect().height;
    }
    container.style.height = `${Math.max(...heights)}px`;
  }

  function schedule() {
    if (!disposed && !frame) frame = requestAnimationFrame(layout);
  }
  const resize = new ResizeObserver(schedule);
  function observeCards() {
    for (const item of observed) {
      if (item.parentElement !== container) {
        resize.unobserve(item);
        observed.delete(item);
      }
    }
    for (const item of container.children) {
      if (!observed.has(item)) {
        observed.add(item);
        resize.observe(item);
      }
    }
    schedule();
  }
  const mutation = new MutationObserver(observeCards);
  mutation.observe(container, { childList: true });
  resize.observe(container);
  observeCards();
  window.addEventListener('resize', schedule);
  document.fonts.ready.then(schedule);
  layout();
  return {
    destroy() {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', schedule);
      container.classList.remove('masonry-ready');
      container.style.removeProperty('height');
      for (const item of container.children) {
        for (const property of ['width', 'left', 'top']) item.style.removeProperty(property);
      }
    },
  };
}
