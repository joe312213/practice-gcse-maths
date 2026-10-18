/**
 * Purpose: Serve compact banks with their dictionaries in dev and emit the same JSON URLs during static builds.
 *
 * Main contents:
 * - prerender, entries, GET.
 *
 * Used By: SvelteKit route loading/prerendering.
 *
 * Uses: website/src/lib/server/topic-banks.mjs.
 *
 * Libs: @sveltejs/kit (route responses/errors).
 */
import { json, error } from '@sveltejs/kit';
import { topicPayloads } from '#lib/server/topic-banks.mjs';
export const prerender = true;
export const entries = () => Object.keys(topicPayloads).map((bank) => ({ bank }));
/** Serve the compact bank named by route params, or return 404. SvelteKit calls this in development and prerender; json serialises the shared server payload without writing source files. */
export function GET({ params }) {
  const bank = topicPayloads[params.bank];
  if (!bank) error(404, 'Unknown topic');
  return json(bank);
}
