/** Measure the header's natural contents so tools stay top-right without a viewport breakpoint.
 * The clones are inert, hidden and removed in the same frame. Grid owns the final layout.
 * Used by SiteHeader; observe content changes as well as available width (learner names vary).
 */
export function bindHeaderLayout(header) {
  const brand = header.querySelector('.brand');
  const actions = header.querySelector('.header-actions');
  const tools = header.querySelector('.header-tools');
  const naturalWidth = (element) => {
    const copy = element.cloneNode(true);
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
    copy.inert = true;
    copy.setAttribute('aria-hidden', 'true');
    Object.assign(copy.style, {
      position: 'absolute',
      visibility: 'hidden',
      width: 'max-content',
      maxWidth: 'none',
      whiteSpace: 'nowrap',
      flexWrap: 'nowrap',
      margin: '0',
    });
    header.append(copy);
    const width = copy.getBoundingClientRect().width;
    copy.remove();
    return width;
  };
  function layout() {
    const style = getComputedStyle(header);
    const available =
      header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const logoGap = parseFloat(getComputedStyle(actions).marginLeft);
    const toolGap = parseFloat(style.getPropertyValue('--control-gap'));
    const fits =
      naturalWidth(brand) +
        naturalWidth(actions) +
        logoGap +
        tools.getBoundingClientRect().width +
        toolGap <=
      available;
    header.classList.toggle('header-single-row', fits);
  }
  const resize = new ResizeObserver(layout);
  const content = new MutationObserver(layout);
  resize.observe(header);
  content.observe(actions, { childList: true, characterData: true, subtree: true });
  layout();
  return () => {
    resize.disconnect();
    content.disconnect();
  };
}

/** Keep a complete stage row before placing progress alongside it; grid still owns geometry. */
export function fitLearningHeader(header, { stageWidth }) {
  let minimum = stageWidth;
  const resize = new ResizeObserver(layout);
  function layout() {
    const progress = header.querySelector('.progress-card');
    const style = getComputedStyle(header);
    const available =
      header.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const required =
      minimum + (progress?.getBoundingClientRect().width ?? 0) + parseFloat(style.columnGap);
    header.classList.toggle(
      'progress-alongside',
      Boolean(minimum && progress && required <= available),
    );
  }
  function observe() {
    resize.disconnect();
    resize.observe(header);
    const progress = header.querySelector('.progress-card');
    if (progress) resize.observe(progress);
    layout();
  }
  observe();
  return {
    update({ stageWidth }) {
      minimum = stageWidth;
      observe();
    },
    destroy() {
      resize.disconnect();
    },
  };
}
