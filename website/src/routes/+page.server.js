/**
 * Purpose: Build compact homepage previews from the practice banks without sending complete banks to the homepage client.
 *
 * Main contents:
 * - load.
 *
 * Used By: Homepage +page.svelte through SvelteKit.
 *
 * Uses: topic-routes.mjs; static/data multiplication, division and equations banks.
 *
 * Libs: SvelteKit (server load convention).
 */
import { foundationTopics, topicPath } from '#lib/content/topic-routes.mjs';
import multiplication from '../../static/data/multiplication.json' with { type: 'json' };
import division from '../../static/data/division.json' with { type: 'json' };
import equations from '../../static/data/equations.json' with { type: 'json' };
import signedNumbers from '../../static/data/signed-numbers.json' with { type: 'json' };
import fractions from '../../static/data/fractions.json' with { type: 'json' };
import percentages from '../../static/data/percentages.json' with { type: 'json' };
import problems from '../../static/data/problems.json' with { type: 'json' };
const banks = {
  problems,
  multiplication,
  division,
  equations,
  'signed-numbers': signedNumbers,
  fractions,
  percentages,
};
/**
 * Select one Build demo per registered topic for the homepage. Calls topicPath; invoked by SvelteKit.
 */
export function load() {
  return {
    topics: foundationTopics.map((topic) => {
      const bank = banks[topic.file];
      const example = bank.questions.find(
        (question) => question.type === 'demo' && question.level === 1,
      );
      if (!example) throw Error(`Missing Build example for ${topic.bank}`);
      return { title: bank.title, draft: bank.draft, path: topicPath(topic.bank), example };
    }),
  };
}
