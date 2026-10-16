# Method animation contract

Teach the operations a learner performs on paper, in their mathematical order. Highlighting must explain why the next mark is written, not merely decorate newly appearing ink. This contract applies to every level, worked example and recap, including method references. [UI taste](UI_TASTE.md#teaching-animation) owns presentation; [UI/UX rules](UI_UX_RULES.md) owns interaction and accessibility.

## Author the sequence before the drawing

1. Start with a checked mathematical model: operands, intermediate values, place values, result and any carry/remainder. Reuse that model for the complete static solution and the animated solution.
2. List the ordered operations, their input marks, output location and dependency on earlier outputs. An incoming carry is an input to the next operation, not a new result of that operation.
3. Separate **inspect/calculate**, **write result**, and **transfer carry/remainder** whenever they are distinct acts. Do not reveal a result or carry before its calculation. Omit transfer frames when there is nothing to transfer. Preserve meaningful zeros.
4. Define each frame's visible ink and active region from its frame data, independent of elapsed wall time or the previous DOM. Revisiting a frame must reproduce the same state.
5. Supply concise numerical explanations as a non-colour alternative. Keep completed working visible, retire the previous highlight, and retain the current explanation. Avoid pulsing or flashing.

## Topic-owned sequences

Each topic specification owns a **Method animation** section: ordered operations, highlighted inputs, revealed outputs, dependencies, carry/remainder destinations and method-specific edge cases. Review and update it alongside changes to that method. This shared document owns the repeatable process and playback contract; do not duplicate competing sequence tables here.

- [Lattice multiplication](../content/M01_lattice_multiplication.md#method-animation)
- [Bus-stop division](../content/M02_bus_stop_division.md#method-animation)
- [Solving equations](../content/M10_solving_equations.md#method-animation)

- [Multiplication/division problems draft](../content/specs/M03.md#method-animation)
- [Signed numbers draft](../content/specs/M13.md#method-animation)
- [Fractions draft](../content/specs/M15.md#method-animation)
- [Percentages draft](../content/specs/M06.md#method-animation)

## Implementation boundaries

- `arithmetic-demo.mjs` and `equation-demo.mjs` create deterministic ordered frames from method data. Arithmetic uses the existing logical `step`/`count`, plus explicit operation `phase`, cell identity and carry target where required. Logical steps still drive guidance and Previous/Next; operation phases drive highlights and fine-grained playback.
- `ArithmeticWorking` and `EquationWorking` render a complete state for any frame. Drawing coordinates stay with the renderer; mathematical ordering stays with the model. No DOM inspection decides the next mathematical operation.
- `ShowDemo` and the shared player own timing, pause, speed, replay, step navigation and disposal. Highlight changes use the same frame cursor as ink; no separate highlight timer. `demo-motion` interpolates newly written ink only.
- Reuse semantic theme colours for a restrained fill and outline. Keep numerals legible over highlighted regions. The region/outline and numerical explanation supplement colour; static feedback and topic previews remain complete and unhighlighted.
- Reduced motion removes interpolation, not instructional frames or explanations. Pausing retains the current highlight. Speed changes affect time only. Replay resets both ink and highlights. Next animates the next logical step and pauses at its final frame; Previous and End present a coherent completed destination immediately. When new working extends below the visible area, the shared player scrolls by the minimum needed to reveal its bottom edge, including in scrollable method references. Fully visible frames and paused playback do not scroll. Keyboard focus stays unchanged; use immediate minimal movement without a smooth-scroll queue, including reduced motion.

## Repeatable review and evidence

For a new method or a changed sequence, review its operation table before coding. For every current example/recap and level, check mathematical dependencies and answer equality. Include an explicit carry example, a zero/no-carry case and any applicable decimal or remainder boundary; do not rely on one visually convenient example.

Pure sequence checks establish calculation → write → transfer order and validate carries against the next place. Browser checks establish that the prescribed region and new ink appear in those frames, earlier results remain visible, future results are absent, and final rendering is complete. Capture representative input, result and carry frames at phone width; inspect them for ambiguous highlight extent, contrast, cramped digits or clipping.

Reuse existing playback checks for pause/resume, speed, replay, stepping, reduced motion, method references and minimum-needed scrolling. Run change-selected verification; do not add a separate animation engine or an unrelated test programme. Record evidence and any unverified limitation in HANDOFF/DEV_LOG. A new topic is not animation-complete merely because it plays without errors.

## Handwriting-stroke investigation — 12 October 2026

Requested investigation, not a selected dependency. True pen writing needs centre-line glyph strokes in the correct order; converting ordinary outlined fonts to SVG traces letter outlines, not handwriting. A drawing library does not supply correct mathematical glyphs or their stroke order.

Measured downloaded release assets, UTF-8 bytes and gzip level 9 (mtime 0); these are asset sizes, not an integrated Vite bundle or a server-transfer guarantee:

| Option | Runtime bytes / gzip | Additional data | Adoption findings |
| --- | --- | --- | --- |
| [Vivus 0.4.6](https://github.com/maxwellito/vivus), [measured runtime](https://cdn.jsdelivr.net/npm/vivus@0.4.6/dist/vivus.min.js) | 12,755 / 4,233 | Ordered SVG glyph paths required; none included | MIT, no dependencies. One-by-one path drawing and playback controls. Cannot convert SVG text to paths; would add another animation controller beside existing Web Animations. Resize behaviour and controller synchronisation need checking. |
| [Vara 1.4.0](https://github.com/akzhy/Vara), [measured runtime](https://cdn.jsdelivr.net/npm/vara@1.4.0/lib/vara.min.js) | 10,568 / 3,514 | [SatisfySL font](https://cdn.jsdelivr.net/npm/vara@1.4.0/fonts/Satisfy/SatisfySL.json): 27,465 / 10,096 | Runtime + this font: 38,033 raw / 13,610 separately gzipped. Font contains digits but lacks Unicode minus, multiply, divide and pound signs. Cursive styling is not automatically suitable for accessible mathematical working. Source uses its own timers; coordinated pause/resume/seek/disposal would require additional work. Check both code and font redistribution terms before adoption. |
| [Hershey Text 2.0.0](https://github.com/techninja/hersheytextjs), [renderer](https://cdn.jsdelivr.net/npm/hersheytext@2.0.0/lib/hersheytext.js) | 7,094 / 2,528, **unminified, not a browser bundle** | [Complete JSON fonts](https://cdn.jsdelivr.net/npm/hersheytext@2.0.0/hersheytext.min.json): 334,415 / 61,455; extracted `futural` font: 7,503 / 1,996 | Useful single-line glyph source. npm entry imports fs/path/Cheerio and is not a drop-in browser runtime. Prefer build-time extraction of a reviewed subset; verify font provenance/licence and stroke order separately. Hershey engraving geometry is not necessarily natural school handwriting. |
| Existing native Web Animations + app-owned stroke glyphs | **0 additional third-party runtime bytes**; helper/glyph payload not yet built or measured | A small reviewed set of digits, x, operators, brackets, decimals, currency and percentage symbols | Recommended prototype: extend the existing shared motion owner, using ordered SVG paths. Most integration work is glyph quality, layout/baselines and accessible text equivalents, rather than animation code. |

Recommended app boundary: one `handwriting` glyph/layout helper and shared text component, with `demo-motion`/ShowDemo retaining playback ownership. Method components supply the expression and teaching frame only. The helper supplies geometry/ordered pen strokes; the existing player owns speed, pause/resume, seek, replay, disposal and reduced motion. Retain accessible ordinary text, static feedback and exact fractions/layout. Unsupported symbols need a clear non-animated text fallback, never silent substitution. Prototype digits/operators first and review legibility/stroke order before applying across methods. Do not scatter external-library calls through method components.

No package was installed and no animation behaviour changed during this investigation. Downloaded inspection assets are under `/private/tmp/maths-*`; measurements above are retained here so temporary files are not required to resume.

## Interactive font evaluation — 12 October 2026

Open the local website at `/handwriting.html`. It contains the twelve Latin Hershey JSON faces (Sans, Script, Serif and Gothic variants) and all four Vara JSON faces: Shadows Into Light, Satisfy, Pacifico and Parisienne. This is the candidate collection investigated above, not an exhaustive catalogue of every available stroke font. Letters, numbers and basic operators have visual specimens; expandable coverage lists exact missing Unicode characters, including Higher GCSE and additional notation. Unsupported characters remain boxed system text and are never silently substituted or counted as stroke support. Legacy Greek/symbol sheets need reviewed Unicode mapping before use and are excluded from the Latin candidates.

The gallery is opt-in and fetches its local font data only on that route. Repackaged font JSON: **338,111 bytes raw / 74,172 bytes gzip**. This includes every comparison face, not a proposed production payload. Font/package licences and upstream URLs ship at `website/static/handwriting/LICENSES.txt`; original path geometry is preserved. No third-party runtime or npm dependency was added.

`application/handwriting.mjs` owns SVG glyph layout, missing-character detection and the cancellable writing controller (play, pause/resume, seek, finish, dispose). `StrokeSample.svelte` supplies accessible text alternatives and evaluation controls. Native Web Animations draw the source paths in source order; bold/serif strokes can retrace and engraving paths are not guaranteed to match natural handwriting. Existing method players remain unchanged. After selection, review digit/operator stroke order, complete required maths glyphs and connect this helper to the existing method timeline. Fractions, indices, vectors and root bars still require mathematical layout; Unicode coverage alone is insufficient.


## Pacifico Maths extension — 12 October 2026

Authorised after the user's Pacifico preference. The gallery now has an additional **Pacifico Maths (extended)** specimen, preserving all sixteen original comparison faces. The separately loadable `website/static/handwriting/pacifico-maths.json` contains **158 glyphs**, retaining every original Pacifico glyph unchanged and adding 64 glyphs for the audited maths, currency, unit and index characters. All character groups displayed by the gallery are covered; this is not a claim of complete Unicode coverage. Unsupported characters still show explicit fallback boxes. Unit abbreviations reuse Pacifico letters; superscripts/subscripts reuse scaled Pacifico digits. Maths additions use the source's baseline/operator axis, rounded pen ends and the shared 1.5px pen. The multiplication cross remains distinct from cursive x.

Editable authoring source: `website/scripts/prepare-pacifico-maths.mjs`; run it from website/ with `node scripts/prepare-pacifico-maths.mjs`. It reads the original collection and writes only the standalone extended asset. Its deterministic output and coverage are checked in `tests/handwriting.test.mjs`. The derivative and original copyright/licence notices ship together under SIL OFL 1.1 in `website/static/handwriting/LICENSES.txt`. The shared handwriting helper accepts per-path scale, so indices preserve shape, stroke order and pen thickness through animation. No extra runtime dependency is installed.

Measured UTF-8 bytes; gzip level 9, each asset compressed separately. The helper was built in memory using the installed Vite production library build, ES-module output, minification enabled, no files written:

| Standalone asset | Raw/minified bytes | Gzip bytes |
| --- | ---: | ---: |
| Extended Pacifico font data | 37,078 | 11,176 |
| Shared handwriting JavaScript helper | 3,136 | 1,704 |
| **Font + helper** | **40,214** | **12,880** |

This is approximately **40.2 kB raw / 12.9 kB gzip**, including **1.7 kB gzip of JavaScript**. Original Pacifico alone, packaged the same way, is 25,915 / 9,457 bytes; the extended asset adds about 1.7 kB gzip. These figures exclude existing Svelte/application code, specimen controls and the other comparison fonts. The gallery deliberately loads both font files (original collection: 338,111 / 74,172 bytes); a method can load the standalone extended file only. The current local static server does not apply gzip, so compressed figures describe compression potential rather than its actual local transfer. This approach reuses Vara's glyph source with the app's native SVG/Web Animations helper; it does not load the separate Vara runtime.

The new specimen includes replayable currency, squared-unit and angle expressions, plus higher symbols and index samples. Method animation adoption remains a later step after visual review. Full mathematical typesetting—stacked fractions, extending root bars and vector accents—still belongs to shared mathematical layout; this glyph extension alone does not implement it.


## Pacifico method integration — 13 October 2026

User-approved Pacifico Maths now renders the written equation sides/signs, lattice and division digits/carries, final arithmetic result and authored calculation lines (including stacked fraction numerators/denominators). Questions, explanatory steps, annotations, check prose and illustrative diagram captions retain ordinary text. `WrittenInk` and opt-in `MathText` share the local stroke renderer; the existing method timeline owns sequential path drawing, speed, pause/resume, step jumps, replay and cleanup. Glyph geometry stays separate from fraction/grid layout. Static feedback and topic previews remain complete ordinary mathematics.

Only the 37,078-byte Pacifico Maths asset is fetched by method playback; the 16-font comparison collection and Vara runtime are not loaded. Controls wait for that fetch to settle, then use ordinary text if it failed. SVG ink retains text alternatives. Reduced-motion users receive completed ink per frame. Highlights use 85%-alpha fill without outlines, with 2px horizontal clearance; equation explanations have no extra gap before their working. Guide-only frames run at three times the numeric-writing pace through the shared player. Nested arithmetic SVGs set explicit viewport dimensions to preserve digit/carry baselines. The centred playback row fits at 360px and retains an accessible Speed name without displaying its label. Earlier extension-size figures describe the gallery helper before this integration, not the whole app bundle.


Final operation/explainer highlights hold for three seconds and fade for one second, without fading written ink or retaining the explainer’s former left accent. The shared motion controller owns their effects and cancels them on replay, navigation or disposal. Reduced motion uses the same hold then an instantaneous clear. Cosmetic controls/highlights are isolated in `method-playback.css` and have their own short verification job; shared sequence/rendering changes retain broader coverage.


On entry, show the complete first teaching step as a static preview. **Play demo** resets to its first reveal frame and animates from the beginning; **Replay** retains its label. Pausing/resuming preserves the existing timeline. Below 440px, control gaps and horizontal padding are slightly reduced to accommodate the longer label on one row.
