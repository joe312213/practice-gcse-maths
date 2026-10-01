# Session handoff — 1 October 2026

Read [AGENTS.md](AGENTS.md), [SLIDE_LAYOUT.md](content/SLIDE_LAYOUT.md) and [ANSWER_SLIDES.md](content/ANSWER_SLIDES.md).

## Current outputs

- [Combined questions](GCSE_Maths_Revision_Starters.pptx): **67 slides**.
- [Combined HTML answers](GCSE_Maths_Revision_Starters_answers.html): matching order, every assessment/practice answer and all **63 error-spotting corrections**.
- Order: M01 multiplication (10) → M02 division (9) → M13 signed addition/subtraction (10) → **M10 equations (10)** → **M15 fraction addition/subtraction (10)** → M03 multiplication/division problems (9) → M04 ratio (9).
- All seven topics have suffix-free question PowerPoints and HTML answers under `topics/`. Registry: `content/topic_registry.json`. Superseded files use `_prevN`; old previews use the same convention.

## Completed in this continuation

- Built and integrated equations: assessment, technique recap, demo, two scaffolded practices, nine fully worked incorrect solutions, four independent grids (72 questions). Uses the vertical-line balancing method, operations on both sides, collecting like terms, useful factorising and tips for a shorter first step. HTML includes full correct working and error explanations.
- Built and integrated fraction addition/subtraction next, following the requested one-topic-at-a-time sequence. Includes common/unrelated denominators, mixed numbers, simplification and equal-whole strip diagrams; same ten-slide structure and 72 independent questions. Every independent grid mixes addition and subtraction. Each new SE slide has 18 distinct correct/incorrect final values; each new independent grid has 18 distinct answers. Fractions across the four independent grids repeat at most twice.
- Applied Start / Build / Confidence headings throughout current decks and HTML, without “Thread”. Added approved curved arrows to every plain question grid. M01 has a copyable empty-lattice template slide with 2×2, 3×2, 3×3, 4×3 and 4×4 grids.
- Replaced arithmetic answer-page diagram instructions with completed lattice/bus-stop diagrams in one three-column row. Application scaffolded answers also contain actual diagrams. Arithmetic checks use easy mental ballpark multiplication/bounds; retained useful cheap exact/substitution/context checks.
- All SE answer sections use three columns and show the incorrect written work, explanation, correct solution and check. Correct lattice/division/signed/ratio/application working is rendered too. New equation and fraction corrections show complete written solutions.
- Added shared HTML layout: tall topic separators, alternating subtle backgrounds, sticky vertical topic name bars and topic navigation. Narrow screens stack columns.
- Added deterministic skill-specific rendering scripts under `scripts/rendering/`; documented the clarity, consistency and efficient regeneration rationale in ANSWER_SLIDES.md. Kept existing accepted teaching content/manual edits while changing headings/arrows and refreshing SE.
- Retained the earlier question-clarity and answer-diversity corrections, including the organisers sharing 18 prizes at £12 (£54 each). Full previous reviews remain in `content/SPOT_ERRORS_REVIEW.md` and `SPOT_ERRORS_ANSWER_PATTERNS.md`.

## Build commands (from practice/)

- `python3 scripts/update_structure.py`: preserve current original-five topic teaching slides, refresh their SE/HTML, compile **all registered topics**, including newer saved topics.
- `python3 scripts/build_priority_topic.py`: regenerate M10 from `content/M10_equations.json`, then compile all topics.
- `python3 scripts/build_fraction_topic.py`: regenerate M15 from `content/M15_fractions.json`, then compile all topics.
- `python3 scripts/refresh_answers.py`: refresh all current topic/combined HTML from source, preserving question decks. Use for answer-only formatting changes.
- `python3 scripts/compile_starters.py`: combine saved topic outputs only; does not rewrite topic content.
- `equation_content.py` and `fraction_content.py` author the structured banks. Run them only when deliberately regenerating those sources; direct edits to JSON must also be reflected in authoring logic where applicable.
- Other original generators are historical; do not run them to overwrite accepted topic decks. Carry any future combined-deck manual edits back into the individual topic deck before recompiling.

In this environment the working interpreter is `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3`; the default non-login shell's Python lacks python-pptx. No new dependency installation was needed.

## Review and next work

Exact rational arithmetic, question counts and new answer variety were checked. Focused renders covered equations recap/demo/SE, fractions recap/demo/scaffold/SE/independent, and the revised three-column multiplication HTML example. Fixed fraction spacing and question-number wrapping found in that review. No broad automated test suite was added. Current decks are built for user review; generation does not imply approval of new content.

**Next unbuilt priority: M06 percentages of amounts and percentage change.** Equations and fraction addition/subtraction, the two requested topics, are implemented. The full remaining sequence and rationale are in `content/TOPIC_PLAN.md`. Further topics remain planned; do not imply their drafts are implemented.

## Answer formatting follow-up

Standardised all 42 practice diagnostic blocks to “Method and error check — practice N” (or “scaffolded practice N”), followed directly by a table. Equations and fractions now match the earlier topics. Removed leaked production instructions. All initial assessments use one compact table cell containing four numbered solutions; equation/fraction diagrams no longer expand across the full page. Fraction answer-grid diagrams also have a compact width. Updated generators and refreshed all seven topic HTML files plus combined HTML; question decks are unchanged.

Future-session animation work is planned in `content/ANIMATED_DEMOS_PLAN.md`: click-driven method steps, a one-equation prototype first, skill-specific reveal orders, preservation of timing during compilation, and a static fallback. No animations implemented yet.

Carry-placement follow-up: moved lattice carries close to their receiving grid boundary, before and separate from answer digits. Updated the shared correct renderer, SE renderer and legacy generator, and patched the saved M01 native grids/SE with `scripts/fix_lattice_carries.py`; the combined question deck remains 67 slides. Other topic question decks were preserved. Retained the intentionally oversized SE carry. Refreshed matching HTML diagrams and documented the placement rule. Focused output checks confirm 42 consistent diagnostic headings, seven single-cell assessments containing four solutions each, and no leaked production instructions.


## Fraction answer sizing and CSS consolidation

Replaced the 110px-wide SVG answer thumbnails with CSS-sized stacked fraction text. Whole, fractional and mixed answers now share a readable 1.5rem base size (fraction digits .85em). Consolidated all answer CSS in `styles/answers.css`, removed Python CSS strings/topic overrides and inline SVG display sizing, and documented shared tokens and the refresh workflow. Refreshed all current HTML outputs; question decks were untouched.
