/**
 * Purpose: Stable public topic addresses, separate from saved question/progress IDs.
 *
 * Main contents:
 * - foundationTopics, topicPath.
 *
 * Used By: homepage, topic route, practice and progress links.
 *
 * Uses: question-bank file names and IDs.
 *
 * Libs: none.
 */
export const foundationTopics = [
  { bank: 'M01', slug: 'lattice-multiplication', file: 'multiplication' },
  { bank: 'M02', slug: 'bus-stop-division', file: 'division' },
  { bank: 'M03', slug: 'multiplication-division-problems', file: 'problems', draft: true },
  { bank: 'M13', slug: 'signed-addition-subtraction', file: 'signed-numbers', draft: true },
  { bank: 'M10', slug: 'solving-equations', file: 'equations' },
  { bank: 'M15', slug: 'fraction-addition-subtraction', file: 'fractions', draft: true },
  { bank: 'M06', slug: 'percentages', file: 'percentages', draft: true },
];
/** Return the stable Foundation Maths path for a saved bank ID. */
export function topicPath(bank) {
  const topic = foundationTopics.find((topic) => topic.bank === bank);
  if (!topic) throw Error('This topic is unavailable.');
  return `/fm/${topic.slug}/`;
}
