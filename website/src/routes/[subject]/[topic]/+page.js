/**
 * Purpose: Prerender supported subject/topic directory routes and reject unknown topics.
 *
 * Main contents:
 * - trailingSlash; entries; load.
 *
 * Used By: SvelteKit and the adjacent +page.svelte.
 *
 * Uses: topic-routes.mjs.
 *
 * Libs: @sveltejs/kit (HTTP errors).
 */
import { error } from '@sveltejs/kit';
import { foundationTopics } from '#lib/content/topic-routes.mjs';
export const trailingSlash = 'always';
/**
 * Enumerate Foundation Maths topic slugs for SvelteKit static generation.
 */
export const entries = () => foundationTopics.map(({ slug }) => ({ subject: 'fm', topic: slug }));
/**
 * Resolve route params to a saved bank ID; call error for unknown subject/topic. Invoked by SvelteKit.
 */
export function load({ params }) {
  const topic =
    params.subject === 'fm' && foundationTopics.find((topic) => topic.slug === params.topic);
  if (!topic) error(404, 'Topic not found');
  return { topicId: topic.bank };
}
