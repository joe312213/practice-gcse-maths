/**
 * Purpose: Author the app's Pacifico maths extension as a standalone stroke-font asset.
 *
 * Main contents:
 * - extendPacifico.
 *
 * Used By: tests/handwriting.test.mjs.
 *
 * Uses: no local module imports.
 *
 * Libs: node:fs/promises (asynchronous file access), node:url (module/file URL conversion),
 * node:path (filesystem path resolution).
 *
 * Usage and output: From website/: node scripts/prepare-pacifico-maths.mjs. Reads the pinned
 * Pacifico stroke data and writes static/handwriting/pacifico-maths.json. Import the exported
 * constructor for read-only coverage checks.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/** Match the original's baseline near y=24, number height 12 and operator axis y=18. */
export function extendPacifico(original) {
  const font = structuredClone(original);
  font.id = 'pacifico-maths';
  font.name = 'Pacifico Maths (extended)';
  font.source = 'Vara Pacifico with app-authored maths strokes; SIL OFL 1.1; see LICENSES.txt';
  const add = (char, advance, ...paths) => {
    font.glyphs[char] = { advance, paths: paths.map((d) => ({ d, x: 0, y: 0 })) };
  };
  // Gentle curves, round pen ends and separate strokes preserve a handwritten rhythm.
  add('−', 16, 'M1 18 Q7 17.7 14 18');
  add('×', 14, 'M2 12 Q6 17 11 23', 'M12 12 Q7 18 1 23');
  add(
    '÷',
    16,
    'M7 12 C6 11 6 13 7 13 C8 13 8 11 7 12',
    'M1 18 Q7 17.7 14 18',
    'M7 24 C6 23 6 25 7 25 C8 25 8 23 7 24',
  );
  add(
    '£',
    15,
    'M13 12 C12 7 4 8 4 13 C4 17 8 19 3 23 C1 25 0 23 3 23 C7 21 10 26 14 22',
    'M1 17 Q6 16.8 10 17',
  );
  add('€', 16, 'M14 11 C3 4 -2 26 12 24', 'M1 15 Q7 14.7 12 15', 'M0 20 Q6 19.7 11 20');
  add('°', 8, 'M4 8 C0 7 0 13 3 13 C7 13 8 8 4 8');
  add('±', 16, 'M8 11 Q7 16 7 21', 'M1 16 Q8 15.7 14 16', 'M1 24 Q7 23.7 14 24');
  add('≤', 16, 'M14 11 Q7 14 1 17 Q7 20 13 22', 'M1 26 Q7 25.7 14 26');
  add('≥', 16, 'M2 11 Q8 14 14 17 Q8 20 1 22', 'M1 26 Q7 25.7 14 26');
  add('≠', 16, 'M1 15 Q7 14.7 14 15', 'M1 21 Q7 20.7 14 21', 'M12 10 Q8 18 4 26');
  add('≈', 17, 'M1 15 C5 10 10 19 15 14', 'M1 22 C5 17 10 26 15 21');
  add('√', 19, 'M1 19 L4 17 L7 25 L13 7 Q15 6.7 18 7');
  add('π', 17, 'M1 14 Q8 12.5 15 14', 'M6 14 Q5 21 3 25', 'M12 14 C10 20 9 26 15 23');
  add('θ', 13, 'M8 10 C1 7 -1 25 5 25 C12 25 15 9 8 10', 'M2 18 Q7 16.5 10 18');
  add('∞', 21, 'M10 18 C4 7 -4 22 3 24 C10 26 13 10 18 13 C25 17 16 30 10 18');
  add('∝', 20, 'M17 12 C10 11 10 27 3 24 C-4 20 4 8 9 16 C12 22 14 25 18 23');
  add('∈', 15, 'M13 12 C-1 10 -2 26 12 24', 'M2 18 Q7 17.7 12 18');
  add('∉', 15, ...font.glyphs['∈'].paths.map((p) => p.d), 'M12 8 Q8 18 3 28');
  add('∪', 16, 'M3 11 C0 27 13 29 14 11');
  add('∩', 16, 'M1 25 C1 8 16 6 13 25');
  add('∅', 15, 'M9 11 C0 8 -2 24 5 25 C14 27 17 11 9 11', 'M14 8 Q8 18 0 28');
  add('⊂', 15, 'M13 12 C-1 10 -2 26 12 24');
  add('⊆', 15, ...font.glyphs['⊂'].paths.map((p) => p.d), 'M1 28 Q7 27.7 13 28');
  add('′', 6, 'M4 8 Q3 12 1 14');
  add('″', 11, 'M4 8 Q3 12 1 14', 'M9 8 Q8 12 6 14');
  add('→', 21, 'M1 18 Q10 17.7 19 18', 'M13 12 L19 18 L12 24');
  add('∠', 18, 'M14 10 L1 24 Q8 23.7 16 24');
  add('⊥', 17, 'M9 10 Q8 17 8 24', 'M1 24 Q8 23.7 15 24');
  add('∥', 11, 'M5 10 Q3 17 1 25', 'M10 10 Q8 17 6 25');
  add('α', 16, 'M11 15 C5 9 -2 21 3 24 C8 27 12 17 13 13 C10 19 10 27 15 23');
  add('β', 14, 'M1 30 C3 22 1 8 8 8 C17 8 10 17 5 17 C18 13 14 26 5 24');
  add('γ', 14, 'M1 14 C7 8 13 27 8 30 C3 33 6 20 13 12');
  add('μ', 15, 'M5 13 Q2 23 1 30', 'M4 17 C1 27 9 26 12 13 C10 23 10 26 14 23');
  font.glyphs['µ'] = structuredClone(font.glyphs['μ']);
  add('Σ', 17, 'M15 9 Q8 8.7 2 9 L9 17 L1 25 Q8 24.7 15 25');
  font.glyphs['∑'] = structuredClone(font.glyphs['Σ']);
  add('ℕ', 17, 'M1 25 L3 9 L13 25 L15 9', 'M5 9 L3 25');
  add('ℤ', 17, 'M2 9 L15 9 L1 25 L14 25', 'M13 9 L-1 25');
  add('ℝ', 17, 'M1 25 L3 9 C20 6 18 19 2 18', 'M6 9 L4 25', 'M8 18 Q12 22 15 25');
  // Reuse the exact Pacifico digit shapes for indices, with baseline/scale explicit in data.
  const scaled = (char, from, scale, offsetY) => {
    const source = font.glyphs[from];
    font.glyphs[char] = {
      advance: source.advance * scale,
      paths: source.paths.map((p) => ({ ...p, x: p.x * scale, y: p.y * scale + offsetY, scale })),
    };
  };
  [...'⁰¹²³⁴⁵⁶⁷⁸⁹'].forEach((c, i) => scaled(c, String(i), 0.6, 0));
  [...'₀₁₂₃₄₅₆₇₈₉'].forEach((c, i) => scaled(c, String(i), 0.6, 13));
  scaled('⁻', '−', 0.6, 0);
  scaled('⁺', '+', 0.6, 0);
  scaled('⁽', '(', 0.6, 0);
  scaled('⁾', ')', 0.6, 0);
  font.glyphs['∛'] = {
    advance: 22,
    paths: [
      ...font.glyphs['³'].paths.map((p) => ({ ...p, y: p.y - 1 })),
      ...font.glyphs['√'].paths.map((p) => ({ ...p, x: p.x + 4 })),
    ],
  };
  return font;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = new URL('../static/handwriting/', import.meta.url);
  const fonts = JSON.parse(await readFile(new URL('fonts.json', directory), 'utf8'));
  const font = extendPacifico(fonts.find((item) => item.id === 'pacifico'));
  await writeFile(new URL('pacifico-maths.json', directory), JSON.stringify(font) + '\n');
  console.log(`Wrote ${Object.keys(font.glyphs).length} glyphs to pacifico-maths.json`);
}
