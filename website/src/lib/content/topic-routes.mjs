/**
 * Purpose: Stable public topic addresses, separate from saved question/progress IDs.
 *
 * Main contents:
 * - foundationTopics, topicPath.
 *
 * Used By: tests/error-investigation.test.mjs, tests/problem-solving.test.mjs,
 * tests/topic-content.test.mjs, website/scripts/browser/draft-topics-checks.mjs,
 * website/scripts/browser/error-investigation-checks.mjs,
 * website/scripts/browser/new-topics-checks.mjs,
 * website/scripts/browser/presentation-checks.mjs.
 *
 * Uses: no local module imports.
 *
 * Libs: none.
 */
export const foundationTopics = [
  { bank: 'M01', slug: 'lattice-multiplication', file: 'lattice-multiplication' },
  { bank: 'M02', slug: 'bus-stop-division', file: 'bus-stop-division' },
  {
    bank: 'M03',
    slug: 'multiplication-division-problems',
    file: 'multiplication-division-problems',
  },
  { bank: 'M13', slug: 'signed-addition-subtraction', file: 'signed-addition-subtraction' },
  { bank: 'M10', slug: 'solving-equations', file: 'solving-equations' },
  { bank: 'M15', slug: 'fraction-addition-subtraction', file: 'fraction-addition-subtraction' },
  { bank: 'M04', slug: 'ratios', file: 'ratios' },
  { bank: 'M06', slug: 'percentages', file: 'percentages' },
  { bank: 'M07', slug: 'reverse-percentages', file: 'reverse-percentages' },
  { bank: 'M12', slug: 'speed-distance-time', file: 'speed-distance-time' },
];
/** Return the stable Foundation Maths path for a saved bank ID. */
export const combinedTopic = { bank: 'combined', slug: 'combined-problems' };
/** Resolve a stable bank ID to its public Foundation Maths URL, rejecting unknown IDs. Used by topic links and navigation. Example: topicPath("M01"). */
export function topicPath(bank) {
  if (bank === combinedTopic.bank) return `/fm/${combinedTopic.slug}/`;
  const topic = foundationTopics.find((topic) => topic.bank === bank);
  if (!topic) throw Error('This topic is unavailable.');
  return `/fm/${topic.slug}/`;
}
