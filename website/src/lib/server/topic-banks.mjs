/** Server-only source imports let Vite reload content edits and prerender bank endpoints.
 * The homepage extracts compact previews; full banks never enter its client bundle.
 */
import { assembleTopic } from '../content/topic-bank.mjs';
import { foundationTopics } from '../content/topic-routes.mjs';
const sources = import.meta.glob('../../../static/data/*/*.json', {
  eager: true,
  import: 'default',
});
export const topicBanks = Object.fromEntries(
  foundationTopics.map(({ file }) => [
    file,
    assembleTopic(
      Object.fromEntries(
        Object.entries(sources)
          .filter(([path]) => path.startsWith(`../../../static/data/${file}/`))
          .map(([path, value]) => [path.split('/').at(-1).replace('.json', ''), value]),
      ),
    ),
  ]),
);
