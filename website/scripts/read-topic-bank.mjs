/** Read canonical topic parts for Node tests/tools, using the same assembly as Vite.
 * This is read-only: no generated source bank and no pre-build step are required.
 */
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
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

// Python content audits consume the same resolver instead of duplicating template rules.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const names = process.argv.slice(2);
  const banks = await Promise.all(names.map(async (name) => [name, await readTopicBank(name)]));
  process.stdout.write(JSON.stringify(Object.fromEntries(banks)));
}
