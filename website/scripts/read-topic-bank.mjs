/**
 * Purpose: Read canonical topic parts for Node tests/tools, using the same assembly as Vite.
 * This is read-only: no generated source bank and no pre-build step are required.
 *
 * Main contents:
 * - readTopicParts, readTopicBank.
 *
 * Used By: tests/anonymous.test.mjs, tests/arithmetic.test.mjs, tests/content-quality.test.mjs,
 * tests/demo-sequence.test.mjs, tests/draft-topics.test.mjs, tests/error-investigation.test.mjs,
 * tests/practice-set.test.mjs.
 *
 * Uses: website/src/lib/content/topic-bank.mjs, text-references.mjs and shared-text.json.
 *
 * Libs: node:fs/promises (asynchronous file access), node:url (module/file URL conversion).
 *
 * Usage and output: Import readTopicBank(folderName), or from website/: node
 * scripts/read-topic-bank.mjs solving-equations. Reads canonical JSON parts and prints a keyed
 * bank object for CLI callers (including Python audits). No output file is written.
 */
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { topicPayload } from '../src/lib/content/text-references.mjs';
import { TOPIC_FILES, assembleTopic } from '../src/lib/content/topic-bank.mjs';
/** Read canonical parts for a public topic folder and include its used shared phrases.
 * Calls topicPayload; used by readTopicBank and compact-transport tests.
 * @example await readTopicParts("ratios"); // Compact parts; no question expansion.
 */
export async function readTopicParts(name) {
  const parts = await Promise.all(
    TOPIC_FILES.map(async (file) => [
      file,
      JSON.parse(
        await readFile(new URL(`../static/data/${name}/${file}.json`, import.meta.url), 'utf8'),
      ),
    ]),
  );
  const shared = JSON.parse(
    await readFile(new URL('../static/data/shared-text.json', import.meta.url), 'utf8'),
  );
  return topicPayload(Object.fromEntries(parts), shared).parts;
}

/** Read and validate a fully expanded bank by folder name for mathematical audits.
 * Calls readTopicParts and assembleTopic; used by Node/Python tools.
 * @example await readTopicBank("ratios");
 */
export async function readTopicBank(name) {
  return assembleTopic(await readTopicParts(name));
}

// Python content audits consume the same resolver instead of duplicating template rules.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const names = process.argv.slice(2);
  const banks = await Promise.all(names.map(async (name) => [name, await readTopicBank(name)]));
  process.stdout.write(JSON.stringify(Object.fromEntries(banks)));
}
