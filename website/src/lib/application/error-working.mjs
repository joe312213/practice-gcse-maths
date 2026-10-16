/**
 * Purpose: Share marker geometry and adapt authored erroneous lattice data to teaching geometry.
 * Main contents: markerPath, investigationLattice.
 * Used By: ArithmeticWorking and InvestigationWorking.
 * Uses: arithmetic-demo.mjs. Libs: none.
 */
import { latticeModel } from './arithmetic-demo.mjs';
// Chisel-tip ends; the quadratic midpoint bows by 3% of the mark's length.
export function markerPath(region, active) {
  const half = active ? 0.23 : 0.19;
  const vertical = region.kind === 'operand';
  const points = vertical
    ? [
        [0.32 - half, 0.17],
        [0.32 + half, 0.09],
        [0.58 + half, 0.83],
        [0.58 - half, 0.91],
      ]
    : [
        [0.12, 0.33 - half],
        [0.94, 0.64 - half],
        [0.84, 0.64 + half],
        [0.06, 0.33 + half],
      ];
  const corners = points.map(([x, y]) => [
    region.x + region.width * x,
    region.y + region.height * y,
  ]);
  const start = corners[vertical ? 1 : 0],
    end = corners[vertical ? 2 : 1];
  const bend = 0.03 * 2; // Quadratic midpoint displacement is half the control offset.
  const bow = [-(end[1] - start[1]) * bend, (end[0] - start[0]) * bend];
  const edges = corners.map((from, index) => {
    const to = corners[(index + 1) % corners.length];
    const longEdge = index % 2 === (vertical ? 1 : 0);
    return longEdge
      ? `Q${(from[0] + to[0]) / 2 + bow[0]},${(from[1] + to[1]) / 2 + bow[1]} ${to}`
      : `L${to}`;
  });
  return `M${corners[0]} ${edges.join(' ')} Z`;
}

/** Keep the renderer's grid geometry while displaying explicitly authored faults and consequences. */
export function investigationLattice(question) {
  const data = question.diagram;
  const model = latticeModel(data.a, data.b);
  model.top = data.top;
  model.right = data.right;
  model.cells = model.cells.map((cell, i) => ({
    ...cell,
    value: data.cells[i].tens * 10 + data.cells[i].units,
  }));
  model.diagonals = model.diagonals.map((place, i) => ({
    ...place,
    digit: data.diagonals[i].digit,
    incoming: data.diagonals[i].incoming,
    total: data.diagonals[i].sum,
    carry: data.diagonals[i].outgoing,
    carryAsDigit: data.oversizedCarryPowers?.includes(i),
  }));
  model.regions = model.regions.map((region) => ({
    ...region,
    id: region.id.replace('operand:right', 'operand-right').replaceAll(':', '-'),
  }));
  model.regions.unshift({
    id: 'operand-top',
    kind: 'top',
    x: 60,
    y: 0,
    width: data.top.length * 70,
    height: 50,
  });
  model.regions = model.regions.map((region) => ({
    ...region,
    label: question.locations.find((location) => location.id === region.id)?.label ?? region.label,
  }));
  model.answer = data.readOff;
  return model;
}

/** Format authored fractions and human-readable cell references without interpreting HTML. */
export function workingText(text) {
  return String(text)
    .replace(/(?<![\d{])(-?\d+\/\d+)(?![\d}])/g, '{$1}')
    .replace(
      /cell-(\d+)-(\d+)/g,
      (_, row, col) => `row ${Number(row) + 1}, column ${Number(col) + 1}`,
    )
    .replace(/10\^(\d+)/g, (_, power) => `${10 ** Number(power)}s`);
}
