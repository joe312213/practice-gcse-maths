/**
 * Purpose: Explicit file writes must reject outside edits and propagate failed writes.
 *
 * Main contents:
 * - saving a known version succeeds, an outside update never gets overwritten; oversized input
 *   and a failed write are not reported as saved; remembered-file permission is renewed before
 *   the first read; directory setup reuses Maths and never removes or overwrites existing user
 *   files; folder creation failures after selection are visible even for AbortError.
 *
 * Used By: verify:changed logic job and Node test runner.
 *
 * Uses: website/src/lib/adapters/progress-file.mjs,
 * website/src/lib/domain/progress-transfer.mjs.
 *
 * Libs: node:test (test runner), node:assert/strict (assertions).
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  readProgressFile,
  saveProgressFile,
} from "../website/src/lib/adapters/progress-file.mjs";
const handle = (initial = "") => {
  let raw = initial;
  return {
    name: "progress.json",
    getFile: async () => new Blob([raw]),
    requestPermission: async () => "granted",
    createWritable: async () => ({
      write: async (value) => {
        raw = value;
      },
      close: async () => {},
      abort: async () => {},
    }),
  };
};
test("saving a known version succeeds, an outside update never gets overwritten", async () => {
  const file = handle("first");
  const link = { handle: file, ...(await readProgressFile(file)) };
  const saved = await saveProgressFile(link, "second");
  assert.equal((await readProgressFile(file)).raw, "second");
  assert.notEqual(saved.fingerprint, link.fingerprint);
  await assert.rejects(saveProgressFile(link, "stale"), /has changed/);
  assert.equal((await readProgressFile(file)).raw, "second");
  file.requestPermission = async () => "denied";
  await assert.rejects(saveProgressFile(saved, "blocked"), /not granted/);
});
test("oversized input and a failed write are not reported as saved", async () => {
  const file = handle();
  const link = { handle: file, ...(await readProgressFile(file)) };
  file.createWritable = async () => ({
    write: async () => {
      throw Error("Disk full");
    },
    abort: async () => {},
  });
  await assert.rejects(saveProgressFile(link, "new"), /Disk full/);
  file.getFile = async () => ({ size: 11 * 1024 * 1024 });
  await assert.rejects(readProgressFile(file), /10 MB/);
});

test("remembered-file permission is renewed before the first read", async () => {
  const file = handle("old");
  const link = { handle: file, ...(await readProgressFile(file)) };
  const read = file.getFile;
  let permission = false;
  file.requestPermission = async () => {
    permission = true;
    return "granted";
  };
  file.getFile = () => {
    assert.equal(permission, true);
    return read();
  };
  await saveProgressFile(link, "new");
  await assert.rejects(
    saveProgressFile(link, "x".repeat(10 * 1024 * 1024 + 1)),
    /10 MB import limit/,
  );
});

test("directory setup reuses Maths and never removes or overwrites existing user files", async () => {
  const { chooseProgressFile } =
    await import("../website/src/lib/adapters/progress-file.mjs");
  const profile = { name: "Jo", id: "12345678-1234-4123-8123-123456789abc" };
  const existing = handle("existing user progress"),
    calls = [];
  const folder = {
    name: "Maths",
    getFileHandle: async (name, options) => {
      calls.push([name, options]);
      return existing;
    },
  };
  const root = {
    name: "OneDrive",
    getDirectoryHandle: async (name, options) => {
      assert.equal(name, "Maths");
      assert.deepEqual(options, { create: true });
      return folder;
    },
  };
  const selected = await chooseProgressFile(profile, {
    showDirectoryPicker: async () => root,
  });
  assert.equal(selected, existing);
  assert.equal(
    (await readProgressFile(existing)).raw,
    "existing user progress",
  );
  assert.match(calls[0][0], /^practice_progress_jo_.*\.json$/);
  await chooseProgressFile(profile, {
    showDirectoryPicker: async () => folder,
  });
  assert.equal(calls.length, 2);
});

test("folder creation failures after selection are visible even for AbortError", async () => {
  const { chooseProgressFile } =
    await import("../website/src/lib/adapters/progress-file.mjs");
  await assert.rejects(
    chooseProgressFile(
      { name: "Jo" },
      {
        showDirectoryPicker: async () => ({
          name: "OneDrive",
          getDirectoryHandle: async () => {
            throw new DOMException("Folder access interrupted", "AbortError");
          },
        }),
      },
    ),
    (error) =>
      error.name === "Error" &&
      /OneDrive\/Maths.*Folder access interrupted/.test(error.message),
  );
});

test("a save is not confirmed unless closing succeeds and the file contains our bytes", async () => {
  const file = handle("original");
  const link = { handle: file, ...(await readProgressFile(file)) };
  file.createWritable = async () => ({
    write: async () => {},
    close: async () => {
      throw Error("Disk full at close");
    },
    abort: async () => {},
  });
  await assert.rejects(saveProgressFile(link, "new"), /Disk full at close/);
  assert.equal((await readProgressFile(file)).raw, "original");
  file.createWritable = async () => ({
    write: async () => {},
    close: async () => {},
    abort: async () => {},
  });
  await assert.rejects(saveProgressFile(link, "new"), /could not be verified/);
  assert.equal((await readProgressFile(file)).raw, "original");
});

test("directory chooser rejection reports access failure and retains the browser error", async () => {
  const { chooseProgressFile } =
    await import("../website/src/lib/adapters/progress-file.mjs");
  const denied = new DOMException("The user aborted a request", "AbortError");
  await assert.rejects(
    chooseProgressFile(
      { name: "Jo" },
      {
        showDirectoryPicker: async () => {
          throw denied;
        },
      },
    ),
    (error) =>
      /Folder access was not granted/.test(error.message) &&
      error.cause === denied,
  );
});

test("legacy and subject-scoped files have the same content fingerprint", async () => {
  const { progressContentFingerprint } =
    await import("../website/src/lib/adapters/progress-file.mjs");
  const { exportProgress } =
    await import("../website/src/lib/domain/progress-transfer.mjs");
  const modern = JSON.parse(
    exportProgress({ name: "Jo", topics: {}, practiceMeasuredFrom: 12 }, 100),
  );
  const { subjects, ...shared } = modern;
  const legacy = {
    ...shared,
    ...subjects.maths,
    format: "maths-practice-progress",
    version: 2,
  };
  assert.equal(
    await progressContentFingerprint(JSON.stringify(modern)),
    await progressContentFingerprint(JSON.stringify(legacy)),
  );
  legacy.version = 42;
  assert.notEqual(
    await progressContentFingerprint(JSON.stringify(modern)),
    await progressContentFingerprint(JSON.stringify(legacy)),
    "Unsupported versions cannot be mistaken for equivalent saved progress",
  );
});
