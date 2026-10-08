/**
 * Purpose: Supply blank method guides in the working canvas coordinate system.
 *
 * Main contents: Method tools and guide line geometry.
 *
 * Used By: WorkingArea and drawing-assist tests.
 * Uses: no local modules.
 * Libs: none.
 */
export const drawingTools = {
  M01: {
    label: 'Grid',
    fields: [
      { key: 'columns', label: 'Columns', max: 4 },
      { key: 'rows', label: 'Rows', max: 4 },
    ],
  },
  M02: {
    label: 'Frame',
    fields: [{ key: 'columns', label: 'Digit spaces (including decimal places)', max: 8 }],
  },
};

/** Return blank guide strokes; margins reserve operand, carry and answer space. */
export function guideLines(topic, { columns, rows = 1 }) {
  const tool = drawingTools[topic];
  if (
    !tool ||
    !tool.fields.every(
      ({ key, max }) =>
        Number.isInteger(key === 'rows' ? rows : columns) &&
        (key === 'rows' ? rows : columns) >= 1 &&
        (key === 'rows' ? rows : columns) <= max,
    )
  )
    return [];
  if (topic === 'M02')
    return [
      [
        [115, 230],
        [115, 130],
        [115 + Math.min(515, columns * 85), 130],
      ],
    ];
  const width = Math.min(520 / columns, 260),
    height = Math.min(290 / rows, 180);
  const left = (700 - width * columns) / 2,
    top = 65;
  const lines = [];
  for (let c = 0; c <= columns; c++)
    lines.push([
      [left + c * width, top],
      [left + c * width, top + rows * height],
    ]);
  for (let r = 0; r <= rows; r++)
    lines.push([
      [left, top + r * height],
      [left + columns * width, top + r * height],
    ]);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++)
      lines.push([
        [left + c * width, top + (r + 1) * height],
        [left + (c + 1) * width, top + r * height],
      ]);
  return lines;
}
