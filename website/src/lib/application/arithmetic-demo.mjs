/**
 * Purpose: Compute place-value working and ordered reveal frames for arithmetic methods.
 *
 * Main contents: latticeModel, divisionModel, arithmeticFrames.
 * Used By: ArithmeticWorking, ArithmeticDemo and arithmetic tests.
 * Uses: no local modules.
 * Libs: none.
 */
/** Compute cell products and diagonal carries, beginning at the bottom right. */
export function latticeModel(a, b) {
  const top = [...String(a)].map(Number),
    right = [...String(b)].map(Number);
  const cells = right.flatMap((digit, row) =>
    top.map((value, col) => ({ row, col, value: value * digit })),
  );
  const totals = Array(top.length + right.length).fill(0);
  for (const { row, col, value } of cells) {
    const k = top.length + right.length - 2 - row - col;
    totals[k] += value % 10;
    totals[k + 1] += Math.floor(value / 10);
  }
  let carry = 0;
  const diagonals = totals.map((sum) => {
    const incoming = carry,
      total = sum + incoming;
    carry = Math.floor(total / 10);
    return { sum, incoming, total, digit: total % 10, carry };
  });
  return { top, right, cells, diagonals };
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

/** Build method-owned frames for the shared four-step playback controller. */
export function arithmeticFrames(question) {
  const frames = [{ step: 1, count: 0 }];
  if (question.method === 'lattice') {
    const model = latticeModel(question.a, question.b);
    model.cells.forEach((_, index) => frames.push({ step: 2, count: index + 1 }));
    model.diagonals.forEach((_, index) => frames.push({ step: 3, count: index + 1 }));
  } else {
    const model = divisionModel(question);
    model.places.forEach((_, index) =>
      frames.push({ step: index < model.integerLength ? 2 : 3, count: index + 1 }),
    );
    if (!model.places.some((p) => p.digit === '.'))
      frames.push({ step: 3, count: model.places.length });
  }
  frames.push({ step: 4, count: Infinity });
  return frames;
}
