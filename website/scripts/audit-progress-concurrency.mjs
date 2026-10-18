/**
 * Purpose: Opt-in reproduction of stale-tab data loss using production storage/file adapters.
 * Uses isolated browser storage and an in-memory file handle; never opens user data.
 *
 * Main contents:
 * - Two-tab storage/file races, recorded save evidence and JSON audit output.
 *
 * Used By: the documented command below.
 *
 * Uses: website/scripts/browser/support.mjs, website/src/lib/domain/profiles.mjs,
 * website/src/lib/adapters/progress-autosave.mjs, website/src/lib/adapters/progress-file.mjs,
 * website/src/lib/domain/progress-transfer.mjs, website/scripts/storage.mjs.
 *
 * Libs: node:fs/promises (asynchronous file access).
 *
 * Usage and output: From website/: node scripts/audit-progress-concurrency.mjs after a build.
 * Opt-in reproduction using isolated browser profiles and in-memory file handles; writes audit
 * evidence under test-results. Never opens learner files.
 */
import { writeFile } from 'node:fs/promises';
import { launchBrowser, serveStatic, artifacts } from './browser/support.mjs';
import { serializeStore } from '../src/lib/domain/profiles.mjs';
import { createProgressAutosave } from '../src/lib/adapters/progress-autosave.mjs';
import {
  readProgressFile,
  progressContentFingerprint,
} from '../src/lib/adapters/progress-file.mjs';
import { exportProgress, progressContent } from '../src/lib/domain/progress-transfer.mjs';

const ids = ['12345678-1234-4234-8234-123456789abc', '22345678-1234-4234-8234-123456789abc'];
const seed = {
  schema: 3,
  last: 'a',
  profiles: ids.map((id, index) => ({
    id,
    name: index ? 'B' : 'A',
    key: index ? 'b' : 'a',
    topics: {},
    progressUpdatedAt: 1,
  })),
};
const server = await serveStatic('src');
const browser = await launchBrowser();
const results = {};
try {
  const context = await browser.newContext();
  const first = await context.newPage(),
    second = await context.newPage();
  for (const page of [first, second]) await page.goto(`${server.url}lib/adapters/storage.mjs`);
  for (const scenario of [
    'same-learner',
    'different-learners',
    'preferences',
    'deletion',
    'other-subject',
  ]) {
    await first.evaluate(
      (raw) => localStorage.setItem('maths-practice-v2', raw),
      serializeStore(seed),
    );
    for (const page of [first, second])
      await page.evaluate(async () => {
        const { openProgress } = await import('./storage.mjs');
        window.audit = openProgress(localStorage);
      });
    await first.evaluate((scenario) => {
      const profile = audit.data.profiles[0];
      if (scenario === 'deletion') audit.data.profiles.shift();
      else if (scenario === 'other-subject')
        profile.otherSubjects = { english: { essays: ['new-work'] } };
      else
        profile.topics['maths:M01'] = {
          tracks: {},
          pages: {},
          history: [{ question: 'answer-from-a' }],
        };
      audit.save(audit.data);
    }, scenario);
    await second.evaluate((scenario) => {
      const profile = audit.data.profiles[scenario === 'different-learners' ? 1 : 0];
      if (scenario === 'same-learner' || scenario === 'different-learners')
        profile.topics['maths:M02'] = {
          tracks: {},
          pages: {},
          history: [{ question: 'answer-from-b' }],
        };
      else profile.settings = { topicSort: 'a-z' };
      audit.save(audit.data);
    }, scenario);
    const saved = await first.evaluate(() => JSON.parse(localStorage.getItem('maths-practice-v2')));
    const profile = saved.profiles.find((p) => p.id === ids[0]);
    results[scenario] =
      scenario === 'deletion'
        ? { deletedLearnerResurrected: Boolean(profile) }
        : scenario === 'other-subject'
          ? { otherSubjectLost: !profile.subjects.english }
          : { firstAnswerLost: !profile.subjects.maths.topics['maths:M01'] };
  }
  await context.close();
} finally {
  await browser.close();
  await server.close();
}

// Both tabs finish their initial file check before either changes its local snapshot.
let raw = exportProgress(seed.profiles[0], 1),
  writes = 0;
const handle = {
  getFile: async () => new Blob([raw]),
  queryPermission: async () => 'granted',
  createWritable: async () => ({
    write: async (value) => {
      raw = value;
      writes++;
    },
    close: async () => {},
    abort: async () => {},
  }),
};
let link = {
  handle,
  ...(await readProgressFile(handle)),
  contentFingerprint: await progressContentFingerprint(raw),
};
let tail = Promise.resolve();
const lock = (_profile, action) => {
  const next = tail.then(action);
  tail = next.catch(() => {});
  return next;
};
const tabs = [0, 1].map(() => {
  const data = structuredClone(seed),
    profile = data.profiles[0];
  let previous = progressContent(profile);
  const sync = createProgressAutosave({
    data,
    lock,
    fileLink: async (_profile, value) => {
      if (value) link = value;
      return link;
    },
    save: () => {
      const content = progressContent(profile);
      if (previous !== content) {
        profile.progressUpdatedAt++;
        previous = content;
      }
      return true;
    },
  });
  return { profile, sync };
});
for (const tab of tabs) await tab.sync.flush(tab.profile);
for (const [index, tab] of tabs.entries()) {
  tab.profile.topics[`maths:M0${index + 1}`] = {
    tracks: {},
    history: [{ question: `tab-${index + 1}` }],
  };
  await tab.sync.flush(tab.profile);
}
results['linked-file'] = {
  firstAnswerLost: !JSON.parse(raw).subjects.maths.topics['maths:M01'],
  writes,
  staleTabReportedSaved: tabs[1].profile.fileSync.state === 'saved',
};
await writeFile(
  `${artifacts}/progress-concurrency-audit.json`,
  JSON.stringify(results, null, 2) + '\n',
);
console.log(JSON.stringify(results, null, 2));
