/**
 * Purpose: Check the authored live spot-error banks without building or rewriting content.
 * Main contents: complete live-bank arithmetic and coverage check.
 * Used By: Node test runner and change-selected verification.
 * Uses: scripts/review_spot_error_drafts.py and website/static/data/.
 * Libs: node:test, node:child_process and node:url for the read-only Python audit.
 */
import test from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("all live spot-error questions satisfy coverage, answer and working-trace checks", () => {
  execFileSync("python3", ["-B", "scripts/review_spot_error_drafts.py"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: "pipe",
  });
});

test("quality guards reject easy, repetitive and accidentally valid error cases", () => {
  execFileSync("python3", ["-B", "tests/spot_error_quality_test.py"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: "pipe",
  });
});
