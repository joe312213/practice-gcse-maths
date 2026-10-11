/**
 * Purpose: Ensure historical reference output cannot replace authoritative bank files.
 *
 * Main contents:
 * - Isolated candidate-directory and path-escape checks.
 *
 * Used By: Node test runner.
 *
 * Uses: scripts/bank_candidates.py.
 *
 * Libs: node:test/assert/child_process; Python standard library, no slide dependencies.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("reference candidates preserve newer content and cannot escape their fresh directory", () => {
  const output = execFileSync(
    process.env.PYTHON || "python3",
    [
      "-B",
      "-c",
      `
import sys, tempfile, json, contextlib, io
from pathlib import Path
sys.path.insert(0, sys.argv[1])
import bank_candidates
with tempfile.TemporaryDirectory() as temporary:
    root = Path(temporary)
    bank_candidates.ROOT = root
    tempfile.tempdir = temporary
    bank = root / 'website/static/data/example.json'
    bank.parent.mkdir(parents=True)
    bank.write_text('new reviewed content')
    with contextlib.redirect_stdout(io.StringIO()):
        first = bank_candidates.write_candidates({'website/static/data/example.json': 'old reference'})
        second = bank_candidates.write_candidates({'website/static/data/example.json': 'another reference'})
    assert first != second
    assert bank.read_text() == 'new reviewed content'
    assert (first / 'website/static/data/example.json').read_text() == 'old reference'
    assert json.loads((first / 'comparison.json').read_text())['files'][0]['status'] == 'differs'
    for path in [str(bank), '../example.json', 'nested/../../example.json']:
        try:
            bank_candidates.write_candidates({path: 'must not be written'})
        except ValueError:
            pass
        else:
            raise AssertionError(path)
    assert bank.read_text() == 'new reviewed content'
print('candidate isolation passed')
`,
      fileURLToPath(new URL("../scripts", import.meta.url)),
    ],
    { encoding: "utf8" },
  );
  assert.match(output, /candidate isolation passed/);
});
