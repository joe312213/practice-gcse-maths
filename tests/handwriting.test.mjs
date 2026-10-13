/** Purpose: Keep glyph coverage honest and prevent malformed bundled stroke data. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { extendPacifico } from "../website/scripts/prepare-pacifico-maths.mjs";
import {
  characterGroups,
  missingCharacters,
} from "../website/src/lib/application/handwriting.mjs";
const fonts = JSON.parse(
  readFileSync(
    new URL("../website/static/handwriting/fonts.json", import.meta.url),
  ),
);
test("Stroke fonts cover the example and report exact missing Unicode symbols", () => {
  assert.equal(fonts.length, 16);
  for (const font of fonts) {
    assert.deepEqual(
      missingCharacters(
        font,
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 +-=()",
      ),
      [],
      font.name,
    );
    assert.ok(missingCharacters(font, "−×÷π√").length > 0, font.name);
    for (const glyph of Object.values(font.glyphs)) {
      assert.ok(Number.isFinite(glyph.advance) && glyph.advance > 0);
      assert.ok(
        glyph.paths.every(
          (path) =>
            path.d && Number.isFinite(path.x) && Number.isFinite(path.y),
        ),
      );
    }
  }
});

test("Pacifico maths covers the audited symbols and preserves original strokes with matching indices", () => {
  const original = fonts.find((f) => f.id === "pacifico");
  const extended = JSON.parse(
    readFileSync(
      new URL(
        "../website/static/handwriting/pacifico-maths.json",
        import.meta.url,
      ),
    ),
  );
  assert.deepEqual(
    extended,
    extendPacifico(original),
    "generated font matches its editable source",
  );
  for (const [name, chars] of characterGroups)
    assert.deepEqual(missingCharacters(extended, chars), [], name);
  for (const [char, glyph] of Object.entries(original.glyphs))
    assert.deepEqual(extended.glyphs[char], glyph, char);
  assert.deepEqual(
    missingCharacters(
      extended,
      "£12.50 × 3 = £37.50 25 cm² = 0.0025 m² θ = 30° π ≈ 3.142 µm kg km/h",
    ),
    [],
  );
  assert.deepEqual(missingCharacters(extended, "☃"), ["☃"]);
  for (const [char, glyph] of Object.entries(extended.glyphs)) {
    assert.ok(Number.isFinite(glyph.advance) && glyph.advance > 0, char);
    assert.ok(glyph.paths.length > 0, char);
    for (const p of glyph.paths) {
      assert.ok(p.d && Number.isFinite(p.x) && Number.isFinite(p.y), char);
      assert.ok(p.scale === undefined || p.scale > 0, char);
    }
  }
  assert.equal(
    extended.glyphs["²"].paths[0].d,
    original.glyphs["2"].paths[0].d,
  );
  assert.equal(extended.glyphs["²"].paths[0].scale, 0.6);
  assert.notDeepEqual(extended.glyphs["×"], extended.glyphs.x);
});
