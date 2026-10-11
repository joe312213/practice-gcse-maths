/**
 * Purpose: Supply blank method guides in the working canvas coordinate system.
 *
 * Main contents:
 * - Method tools and guide line geometry.
 *
 * Used By: WorkingArea and drawing-assist tests.
 *
 * Uses: domain/working.mjs for shared canvas dimensions.
 *
 * Libs: none.
 */
import {
  DEFAULT_WORKING_HEIGHT,
  WORKING_BITMAP_WIDTH,
  WORKING_BITMAP_SCALE,
} from '../domain/working.mjs';

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

/** Fit centred guides in visible CSS pixels, then convert to stored bitmap coordinates. */
export function guideLines(
  topic,
  { columns, rows = 1 },
  {
    width: surfaceWidth = WORKING_BITMAP_WIDTH / WORKING_BITMAP_SCALE,
    height: surfaceHeight = DEFAULT_WORKING_HEIGHT,
  } = {},
) {
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
  // Two handwriting lines of clearance on every side, shared by all assistance tools.
  const writingMargin = 48;
  const availableWidth = surfaceWidth - 2 * writingMargin;
  const availableHeight = surfaceHeight - 2 * writingMargin;
  const toBitmap = (lines) =>
    lines.map((line) =>
      line.map(([x, y]) => [(x * WORKING_BITMAP_WIDTH) / surfaceWidth, y * WORKING_BITMAP_SCALE]),
    );
  if (topic === 'M02') {
    // A digit slot leaves handwriting room; the bracket need not fill the canvas.
    const width = Math.min(columns * 32, availableWidth);
    const height = Math.min(48, availableHeight);
    const left = (surfaceWidth - width) / 2;
    const top = (surfaceHeight - height) / 2;
    return toBitmap([
      [
        [left, top + height],
        [left, top],
        [left + width, top],
      ],
    ]);
  }
  // Square cells up to a comfortable writing size; larger grids fit inside the margins.
  const cell = Math.min(72, availableWidth / columns, availableHeight / rows);
  const left = (surfaceWidth - cell * columns) / 2;
  const top = (surfaceHeight - cell * rows) / 2;
  const lines = [];
  for (let c = 0; c <= columns; c++)
    lines.push([
      [left + c * cell, top],
      [left + c * cell, top + rows * cell],
    ]);
  for (let r = 0; r <= rows; r++)
    lines.push([
      [left, top + r * cell],
      [left + columns * cell, top + r * cell],
    ]);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++)
      lines.push([
        [left + c * cell, top + (r + 1) * cell],
        [left + (c + 1) * cell, top + r * cell],
      ]);
  return toBitmap(lines);
}
