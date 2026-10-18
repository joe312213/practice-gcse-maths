/**
 * Purpose: Load the isolated, authored lattice prototype; no learner data is read or written.
 *
 * Main contents:
 * - load.
 *
 * Used By: SvelteKit route loading/prerendering.
 *
 * Uses: content/lattice_error_prototype.json.
 *
 * Libs: none.
 */
import prototype from '../../../../content/lattice_error_prototype.json' with { type: 'json' };
/** Return authored prototype fixtures during prerender for the isolated review page. SvelteKit calls this server loader; it does not read or write learner progress. */
export function load() {
  return prototype;
}
