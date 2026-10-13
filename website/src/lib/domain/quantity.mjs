/** Format displayed quantities without changing the numeric values used for marking. */
export function formatQuantity(value, unit = '') {
  const text = String(value);
  if (!unit) return text;
  if (unit === '£') return text.replace(/^([-−+]?)(.*)$/, '$1£$2');
  if (unit === '%' && text.endsWith('%')) return text;
  return `${text}${['%', '°', '°C'].includes(unit) ? '' : ' '}${unit}`;
}
