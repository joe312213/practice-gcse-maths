/**
 * Purpose: Server-only source imports let Vite reload content edits and prerender bank
 * endpoints. The homepage extracts compact previews; full banks never enter its client bundle.
 *
 * Main contents:
 * - topicBanks, topicPayloads.
 *
 * Used By: website/src/routes/+layout.server.js, website/src/routes/+page.server.js,
 * website/src/routes/data/[bank].json/+server.js.
 *
 * Uses: website/static/data/shared-text.json, content/text-references.mjs,
 * website/src/lib/content/topic-bank.mjs, website/src/lib/content/topic-routes.mjs.
 *
 * Libs: none.
 */
import { assembleTopic } from '../content/topic-bank.mjs';
import sharedText from '../../../static/data/shared-text.json';
import { topicPayload } from '../content/text-references.mjs';
import { foundationTopics } from '../content/topic-routes.mjs';
const sources = import.meta.glob('../../../static/data/*/*.json', {
  eager: true,
  import: 'default',
});
export const topicPayloads = Object.fromEntries(
  foundationTopics.map(({ file }) => [
    file,
    topicPayload(
      Object.fromEntries(
        Object.entries(sources)
          .filter(([path]) => path.startsWith(`../../../static/data/${file}/`))
          .map(([path, value]) => [path.split('/').at(-1).replace('.json', ''), value]),
      ),
      sharedText,
    ),
  ]),
);

// Validate all content for build-time consumers; browsers receive the compact payload only.
export const topicBanks = Object.fromEntries(
  Object.entries(topicPayloads).map(([file, payload]) => [file, assembleTopic(payload.parts)]),
);
