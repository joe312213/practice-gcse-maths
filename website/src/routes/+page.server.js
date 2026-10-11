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
const banks = { multiplication, division, equations };
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
      return { title: bank.title, path: topicPath(topic.bank), example };
    }),
  };
}
