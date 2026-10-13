/** Authored bank order defines distinct full pages within each topic, stage and level. */
export const TOPIC_PAGE_SIZES = { plain: 12, scaffolded: 4, errors: 4, problem: 6 };

export function topicPages(bank, mode, level) {
  const size = TOPIC_PAGE_SIZES[mode];
  if (!size) return [];
  const ids = bank.questions.filter((q) => q.type === mode && q.level === level).map((q) => q.id);
  return Array.from({ length: Math.ceil(ids.length / size) }, (_, index) =>
    ids.slice(index * size, (index + 1) * size),
  );
}

/** Sample two independent tasks per level; exclude older arithmetic whose labels overstate difficulty. */
export function assessmentPage(bank, random = Math.random) {
  return [0, 1, 2].flatMap((level) => {
    const candidates = bank.questions.filter((q) => {
      if (q.type !== 'plain' || q.level !== level) return false;
      if (bank.method === 'lattice') {
        const digits = [String(q.a).length, String(q.b).length];
        return level === 0
          ? digits[0] === 2 && digits[1] === 1
          : level === 1
            ? digits.every((n) => n === 2)
            : digits.every((n) => n >= 3) && digits.includes(4);
      }
      if (bank.method === 'bus') {
        if (level === 0) return [...String(q.a)].every((digit) => Number(digit) % q.b === 0);
        if (level === 1)
          return q.b < 10 && [...String(q.a)].some((digit) => Number(digit) % q.b !== 0);
        return q.a >= 1000 && q.b >= 10;
      }
      return true;
    });
    if (candidates.length < 2)
      throw Error('Assessment needs two suitable questions at every level.');
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    return candidates.slice(0, 2);
  });
}
