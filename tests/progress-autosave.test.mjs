/** Boundary/lifecycle saves must coalesce, skip unchanged progress and retain work on failure. */
import test from "node:test";
import assert from "node:assert/strict";
import {
  createProgressAutosave,
  bindProgressAutosave,
} from "../website/src/lib/adapters/progress-autosave.mjs";
import {
  readProgressFile,
  saveProgressFile,
  progressContentFingerprint,
} from "../website/src/lib/adapters/progress-file.mjs";
import {
  exportProgress,
  progressContent,
} from "../website/src/lib/domain/progress-transfer.mjs";

async function fixture() {
  const profile = {
    id: "12345678-1234-4123-8123-123456789abc",
    key: "student",
    name: "Student",
    topics: {},
    progressUpdatedAt: 10,
  };
  const data = { profiles: [profile] };
  let raw = exportProgress(profile, 1),
    writes = 0,
    requests = 0,
    permission = "granted",
    local;
  const handle = {
    getFile: async () => new Blob([raw]),
    queryPermission: async () => permission,
    requestPermission: async () => {
      requests++;
      return "granted";
    },
    createWritable: async () => ({
      write: async (value) => {
        writes++;
        raw = value;
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
  let content = progressContent(profile);
  const options = {
    data,
    save: () => {
      const next = progressContent(profile);
      if (next !== content) {
        profile.progressUpdatedAt++;
        content = next;
      }
      local = JSON.stringify(data);
    },
    lock: async (_profile, action) => action(),
    fileLink: async (_profile, value) => {
      if (value) link = value;
      return link;
    },
  };
  return {
    profile,
    options,
    get raw() {
      return raw;
    },
    set raw(value) {
      raw = value;
    },
    get writes() {
      return writes;
    },
    get requests() {
      return requests;
    },
    get local() {
      return local;
    },
    deny: () => {
      permission = "prompt";
    },
  };
}
const view = (complete = false, mode = "plain") => ({
  profile: { id: "12345678-1234-4123-8123-123456789abc" },
  bank: { topic: "M01" },
  mode,
  page: { attempt: "page-one", complete },
});

test("timestamps alone never write; changed results save once despite overlapping triggers", async () => {
  const f = await fixture(),
    sync = createProgressAutosave(f.options);
  sync.select(view());
  await sync.flush();
  assert.equal(f.writes, 0);
  f.profile.topics.M01 = { history: [{ question: "q1", correct: true }] };
  await Promise.all([sync.flush(), sync.flush(), sync.flush()]);
  assert.equal(f.writes, 1);
  assert.equal(JSON.parse(f.raw).topics.M01.history.length, 1);
  assert.equal(f.profile.fileSync.state, "saved");
  assert.equal(f.requests, 0);
  // A new route's coordinator uses the persisted confirmed fingerprint too.
  const next = createProgressAutosave(f.options);
  next.select(view());
  await next.flush();
  assert.equal(f.writes, 1);
});

test("completion and stage changes save; rendering and within-page selection do not", async () => {
  const f = await fixture(),
    sync = createProgressAutosave(f.options);
  sync.select(view());
  f.profile.topics.M01 = { history: [{ question: "q1" }] };
  sync.select(view());
  assert.equal(f.writes, 0);
  sync.select(view(true));
  await sync.flush();
  assert.equal(f.writes, 1);
  f.profile.topics.M01.history.push({ question: "q2" });
  sync.select(view(false, "errors"));
  await sync.flush();
  assert.equal(f.writes, 2);
});

test("denied background access and external changes retain local answers and never overwrite", async () => {
  for (const failure of ["permission", "external"]) {
    const f = await fixture(),
      sync = createProgressAutosave(f.options);
    sync.select(view());
    f.profile.topics.M01 = { history: [{ question: "retained" }] };
    if (failure === "permission") f.deny();
    else f.raw = "external edit";
    const before = f.raw;
    await sync.flush();
    assert.equal(f.raw, before);
    assert.equal(f.writes, 0);
    assert.equal(f.requests, 0);
    assert.equal(f.profile.fileSync.state, "error");
    assert.match(f.local, /retained/);
  }
});

test("tab hiding and browser exit attempt saving, and disposal removes lifecycle listeners", async () => {
  const f = await fixture();
  const document = new EventTarget(),
    window = new EventTarget();
  document.hidden = false;
  let notify;
  const stop = bindProgressAutosave(
    {
      subscribe(fn) {
        notify = fn;
        fn(view());
        return () => {
          notify = null;
        };
      },
    },
    f.options,
    document,
    window,
  );
  f.profile.topics.M01 = { history: [{ question: "unfinished-page-result" }] };
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(f.writes, 0);
  document.hidden = true;
  document.dispatchEvent(new Event("visibilitychange"));
  // Local persistence and interrupted-save marker happen synchronously, before the async write.
  assert.match(f.local, /unfinished-page-result/);
  assert.equal(f.profile.fileSync.state, "pending");
  window.dispatchEvent(new Event("pagehide"));
  window.dispatchEvent(new Event("beforeunload"));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(f.writes, 1);
  stop();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(notify, null);
  f.profile.topics.M01.history.push({ question: "after-disposal" });
  window.dispatchEvent(new Event("pagehide"));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(f.writes, 1);
});

test("a newer changed file on first load prompts for review and blocks automatic overwriting", async () => {
  const f = await fixture();
  f.raw = exportProgress(
    { ...f.profile, name: "Updated Student", progressUpdatedAt: 20 },
    30,
  );
  let offered;
  const sync = createProgressAutosave({
    ...f.options,
    newer: (id, value) => {
      offered = { id, ...value };
    },
  });
  sync.select(view());
  await sync.flush();
  assert.equal(offered.imported.name, "Updated Student");
  assert.equal(f.profile.name, "Student");
  assert.equal(f.profile.fileSync.state, "review");
  assert.equal(f.writes, 0);
  f.profile.topics["maths:M01"] = { tracks: {}, history: [] };
  await sync.flush();
  assert.equal(f.writes, 0);
  assert.match(f.raw, /Updated Student/);
});

test("a newer export date with identical results does not prompt or write", async () => {
  const f = await fixture();
  f.raw = exportProgress(f.profile, 100);
  let offered = false;
  const sync = createProgressAutosave({
    ...f.options,
    newer: () => {
      offered = true;
    },
  });
  sync.select(view());
  await sync.flush();
  assert.equal(offered, false);
  assert.equal(f.writes, 0);
});

test("answers saved locally during a file write are included in a following write", async () => {
  const f = await fixture();
  let release, started;
  const writing = new Promise((resolve) => {
    started = resolve;
  });
  const hold = new Promise((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const sync = createProgressAutosave({
    ...f.options,
    write: async (...args) => {
      if (++calls === 1) {
        started();
        await hold;
      }
      return saveProgressFile(...args);
    },
  });
  sync.select(view());
  f.profile.topics.M01 = { history: [{ question: "first" }] };
  const pending = sync.flush();
  await writing;
  f.profile.topics.M01.history.push({ question: "during-write" });
  f.options.save();
  release();
  await pending;
  assert.equal(calls, 2);
  assert.equal(JSON.parse(f.raw).topics.M01.history.length, 2);
  assert.equal(f.profile.fileSync.savedThrough, f.profile.progressUpdatedAt);
});
