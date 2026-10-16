/** Shared row allocation: balance within readable capacity without adding needless rows. */
import test from "node:test";
import assert from "node:assert/strict";
import { balancedQuestionRows } from "../website/src/lib/application/question-layout.mjs";

test("question rows favour even counts within the available column capacity", () => {
  assert.deepEqual(balancedQuestionRows(4, 3), [2, 2]);
  assert.deepEqual(balancedQuestionRows(5, 3), [3, 2]);
  assert.deepEqual(balancedQuestionRows(7, 3), [3, 2, 2]);
  assert.deepEqual(balancedQuestionRows(0, 3), []);
  for (let count = 1; count <= 24; count++) {
    for (let capacity = 1; capacity <= 4; capacity++) {
      const rows = balancedQuestionRows(count, capacity);
      assert.equal(rows.length, Math.ceil(count / capacity));
      assert.equal(
        rows.reduce((sum, size) => sum + size, 0),
        count,
      );
      assert.ok(Math.max(...rows) <= capacity);
      assert.ok(Math.max(...rows) - Math.min(...rows) <= 1);
    }
  }
});
