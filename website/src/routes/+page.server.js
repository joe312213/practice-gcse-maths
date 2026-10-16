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
import { topicBanks as banks } from '#lib/server/topic-banks.mjs';
import catalogue from '#lib/content/practice-pages.json' with { type: 'json' };
/**
 * Select one Build demo per registered topic for the homepage. Calls topicPath; invoked by SvelteKit.
 */
export function load() {
  return {
    catalogue: {
      subject: catalogue.subject,
      topics: catalogue.topics.map(({ pages, ...topic }) => ({
        ...topic,
        pages: pages.map(({ type, level }) => ({ type, level })),
      })),
    },
    topics: [
      ...foundationTopics.map((topic) => {
        const bank = banks[topic.file];
        const example = bank.questions.find(
          (question) => question.type === 'demo' && question.level === 1,
        );
        if (!example) throw Error(`Missing Build example for ${topic.bank}`);
        return {
          bank: bank.topic,
          title: bank.title,
          draft: bank.draft,
          path: topicPath(topic.bank),
          example,
        };
      }),
      {
        bank: 'combined',
        title: 'Combined problems',
        path: topicPath('combined'),
        example: banks.problems.problemTeaching.examples[1],
      },
    ],
  };
}
