// Draw the divider first, then write each side in reading order.
// Operations have no equals sign, so omit that reveal rather than adding a pause.
export function equationFrames(rows) {
  return [
    { step: 1, part: 0 },
    ...rows.flatMap((row, index) =>
      (row.kind === 'op' ? [1, 3] : [1, 2, 3]).map((part) => ({ step: index + 1, part })),
    ),
  ];
}
