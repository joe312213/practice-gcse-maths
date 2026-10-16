/** Read canonical topic parts for Node tests/tools, using the same assembly as Vite.
 * This is read-only: no generated source bank and no pre-build step are required.
 */
import { readFile } from 'node:fs/promises';
import { TOPIC_FILES, assembleTopic } from '../src/lib/content/topic-bank.mjs';
export async function readTopicBank(name) {
  const parts = await Promise.all(
    TOPIC_FILES.map(async (file) => [
      file,
      JSON.parse(
        await readFile(new URL(`../static/data/${name}/${file}.json`, import.meta.url), 'utf8'),
      ),
    ]),
  );
  return assembleTopic(Object.fromEntries(parts));
}
