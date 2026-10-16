/** Serve assembled banks in dev and emit the same JSON URLs during static builds. */
import { json, error } from '@sveltejs/kit';
import { topicBanks } from '#lib/server/topic-banks.mjs';
export const prerender = true;
export const entries = () => Object.keys(topicBanks).map((bank) => ({ bank }));
export function GET({ params }) {
  const bank = topicBanks[params.bank];
  if (!bank) error(404, 'Unknown topic');
  return json(bank);
}
