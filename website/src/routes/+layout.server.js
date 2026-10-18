/**
 * Purpose: Give static pages content-addressed bank URLs so browser caches survive visits and a
 * content edit selects a fresh URL without relying on manual revision bumps.
 *
 * Main contents:
 * - load: the small bank version manifest, computed during prerender.
 *
 * Used By: SvelteKit route loading/prerendering.
 *
 * Uses: website/src/lib/server/topic-banks.mjs.
 *
 * Libs: node:crypto (content fingerprints).
 */
import { createHash } from 'node:crypto';
import { topicPayloads } from '#lib/server/topic-banks.mjs';
const bankVersions = Object.fromEntries(
  Object.entries(topicPayloads).map(([file, bank]) => [
    file,
    createHash('sha256').update(JSON.stringify(bank)).digest('hex').slice(0, 16),
  ]),
);
/** Return only hashes to the browser; full banks remain separate static requests. */
export function load() {
  return { bankVersions };
}
