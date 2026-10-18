/**
 * Purpose: Compute place-value working and ordered reveal frames for arithmetic methods.
 *
 * Main contents:
 * - latticeModel, divisionModel, arithmeticFrames.
 *
 * Used By: tests/arithmetic.test.mjs, tests/demo-sequence.test.mjs,
 * tests/error-investigation.test.mjs, tests/topic-content.test.mjs,
 * website/scripts/browser/error-investigation-checks.mjs,
 * website/src/lib/application/error-working.mjs,
 * website/src/lib/components/teaching/ArithmeticWorking.svelte.
 *
 * Uses: website/src/lib/application/demo-guide.mjs.
 *
 * Libs: none.
 */
import { guideFrames } from './demo-guide.mjs';
/** Compute cell products and carries from the bottom right.
 * Optional authored setup/cell/carry faults propagate through later working; defaults stay correct.
 * Regions and text coordinates share this geometry for teaching and error investigation.
 */
export function latticeModel(a, b, working = {}) {
  const top = [...String(a)].map(Number),
    right = [...String(b)].map(Number);
  if (working.reverseRight) right.reverse();
  const cells = right.flatMap((digit, row) =>
    top.map((value, col) => ({
      row,
      col,
      value: working.cells?.[`${row}:${col}`] ?? value * digit,
      x: 60 + col * 70,
      y: 50 + row * 70,
    })),
  );
  const totals = Array(top.length + right.length).fill(0);
  for (const { row, col, value } of cells) {
    const k = top.length + right.length - 2 - row - col;
    totals[k] += value % 10;
    totals[k + 1] += Math.floor(value / 10);
  }
  let carry = 0;
  const diagonals = totals.map((sum, k) => {
    const incoming = working.carries?.[k] ?? carry,
      total = sum + incoming;
    carry = Math.floor(total / 10);
    return {
      sum,
      incoming,
      total,
      digit: total % 10,
      carry,
      carryAsDigit: Boolean(incoming && working.carryAsDigits?.includes(k)),
      x: k < top.length ? 95 + (top.length - 1 - k) * 70 : 25,
      y: k < top.length ? 90 + right.length * 70 : 95 + (right.length - 1 - (k - top.length)) * 70,
      carryX: k < top.length ? 113 + (top.length - 1 - k) * 70 : 43,
      carryY: k < top.length ? 67 + right.length * 70 : 42 + (right.length - (k - top.length)) * 70,
    };
  });
  const width = top.length * 70,
    height = right.length * 70;
  const guides = [
    ...Array.from({ length: right.length + 1 }, (_, row) => `M60,${50 + row * 70} h${width}`),
    ...Array.from({ length: top.length + 1 }, (_, col) => `M${60 + col * 70},50 v${height}`),
    ...cells.map(({ row, col }) => `M${60 + col * 70},${120 + row * 70} l70,-70`),
  ];
  const regions = [
    {
      id: 'operand:right',
      kind: 'operand',
      label: 'Right-hand number',
      x: 60 + width,
      y: 50,
      width: 60,
      height,
    },
    ...cells.map((cell) => ({
      id: `cell:${cell.row}:${cell.col}`,
      kind: 'cell',
      label: `Row ${cell.row + 1}, column ${cell.col + 1}: ${top[cell.col]} × ${right[cell.row]} cell`,
      x: cell.x,
      y: cell.y,
      width: 70,
      height: 70,
    })),
    ...diagonals.map((diagonal, k) => ({
      id: `diagonal:${k}`,
      kind: 'diagonal',
      label: `${['Units', 'Tens', 'Hundreds', 'Thousands', 'Ten-thousands', 'Hundred-thousands', 'Millions', 'Ten-millions'][k] ?? `Diagonal ${k + 1}`} total${k ? ' and carry' : ''}`,
      x: k < top.length ? diagonal.x - 35 : 0,
      y: k < top.length ? 50 + height : diagonal.y - 45,
      width: k < top.length ? 70 : 60,
      height: k < top.length ? 65 : 70,
    })),
  ];
  return {
    top,
    right,
    cells,
    diagonals,
    guides,
    regions,
    width: width + 120,
    height: height + 130,
    answer: diagonals
      // An oversized carry can be misread as an extra digit after its diagonal's output.
      .map((d) => `${d.digit}${d.carryAsDigit ? d.incoming : ''}`)
      .reverse()
      .join('')
      .replace(/^0+(?=\d)/, ''),
  };
}

/** Divide each place in order; decimal questions append zeros until their exact answer ends. */
export function divisionModel(question) {
  const { a, b, answer } = question;
  const decimals = answer.includes('.') ? answer.split('.')[1].length : 0;
  const digits = [...String(a), ...(decimals ? ['.', ...'0'.repeat(decimals)] : [])];
  let remainder = 0;
  const places = digits.map((digit, index) => {
    if (digit === '.') return { digit, quotient: '.', index };
    const incoming = remainder,
      value = incoming * 10 + Number(digit);
    const quotient = Math.floor(value / b);
    remainder = value % b;
    return { digit, quotient, incoming, value, remainder, index };
  });
  return { places, remainder, integerLength: String(a).length };
}

/** Build method-owned frames for the shared five-step playback controller. */
export function arithmeticFrames(question) {
  const frames = guideFrames({
    count: 0,
    label: question.method === 'lattice' ? 'Draw the grid and diagonals' : 'Draw the bus stop',
  });
  if (question.method === 'lattice') {
    const model = latticeModel(question.a, question.b);
    // Write operands across the top, then down the side; each cell follows row order.
    for (let count = 1; count <= model.top.length + model.right.length; count++)
      frames.push({ step: 2, count });
    model.cells.forEach((_, cell) => {
      for (const [offset, phase] of ['multiply', 'tens', 'units'].entries())
        frames.push({ step: 3, count: cell * 2 + offset, cell, phase });
    });
    model.diagonals.forEach((diagonal, index) => {
      for (const phase of ['sum', 'write', ...(diagonal.carry ? ['carry'] : [])])
        frames.push({ step: 4, count: index + 1, phase });
    });
  } else {
    const model = divisionModel(question);
    frames.push({ step: 2, count: 0 });
    model.places.forEach((place, index) => {
      for (const phase of [
        ...(place.digit === '.' ? ['decimal'] : ['divide', 'write']),
        ...(place.remainder && index < model.places.length - 1 ? ['carry'] : []),
      ])
        frames.push({
          step: index < model.integerLength ? 3 : 4,
          count: index + 1,
          phase,
          // A carried remainder crosses a decimal marker to the next numeric place.
          target:
            phase === 'carry'
              ? model.places.findIndex((next, i) => i > index && next.digit !== '.')
              : index,
        });
    });
    if (!model.places.some((p) => p.digit === '.'))
      frames.push({ step: 4, count: model.places.length });
  }
  frames.push({ step: 5, count: Infinity });
  return frames;
}
