/**
 * Purpose: Map authored quantity/unit metadata to consistent displayed answer units without
 * changing numeric marking.
 *
 * Main contents:
 * - formatQuantity.
 *
 * Used By: tests/quantity.test.mjs, website/src/lib/components/teaching/MathText.svelte.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
export function formatQuantity(value, unit = '') {
  const text = String(value);
  if (!unit) return text;
  if (unit === '£') return text.replace(/^([-−+]?)(.*)$/, '$1£$2');
  if (unit === '%' && text.endsWith('%')) return text;
  return `${text}${['%', '°', '°C'].includes(unit) ? '' : ' '}${unit}`;
}
