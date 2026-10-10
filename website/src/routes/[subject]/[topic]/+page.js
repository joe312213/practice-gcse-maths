/** Prerender each known subject/topic as a directory index for static hosting. */
import { error } from '@sveltejs/kit';
import { foundationTopics } from '#lib/content/topic-routes.mjs';
export const trailingSlash = 'always';
export const entries = () => foundationTopics.map(({ slug }) => ({ subject: 'fm', topic: slug }));
export function load({ params }) {
  const topic =
    params.subject === 'fm' && foundationTopics.find((topic) => topic.slug === params.topic);
  if (!topic) error(404, 'Topic not found');
  return { topicId: topic.bank };
}
