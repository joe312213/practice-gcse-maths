# M13 — current topic files

- [Questions](Signed_addition_subtraction_M13_questions.pptx): 10 slides.
- [HTML answers](Signed_addition_subtraction_M13_answers.html): assessment, scaffolded practice, error corrections and independent answers.

Sequence: assessment → rules recap → worked demo → two scaffolded practices → spot the errors (nine worked mistakes) → four independent practices. Original accepted teaching slides are preserved. New error activities are ready for manual review. Exact SE content is in [SPOT_ERRORS.md](../../../content/SPOT_ERRORS.md).

Historical build command: `python3 scripts/update_structure.py` from the project root (now `/Users/joehudson/Dev/Maths`). See [legacy tooling limits](../../README.md) before considering these old instructions. The builder requires the current topic deck, preserves teaching slides, refreshes SE from `content/spot_errors.json`, and compiles the main deck and HTML answers in teaching order. Edit SE in its structured source. Current filenames have no version suffix; history is retained in Git without backup copies. Historical `_prevN` files and PDFs have been removed; restore from Git if needed. Do not run legacy builders to publish current files.

## Historical record (superseded)

# Signed addition and subtraction — M13

## Current files

- [Questions v4](Signed_addition_subtraction_M13_questions_prev6.pptx) · [PDF](Signed_addition_subtraction_M13_questions_prev6.pdf): nine slides—assessment, rules recap, worked demo, two guided practices and four independent grids.
- [Answers v1](Signed_addition_subtraction_M13_answers_prev1.pptx) · [PDF](Signed_addition_subtraction_M13_answers_prev1.pdf): thirteen slides—assessment answers and six pairs of answer/diagnostic pages.
- [Content source](../../../content/M13_signed_addition_and_subtraction.md).

The user accepted the questions and the final digit alignment. The recap was expanded at their request; there is no outstanding requested correction. All number lines and progression arrows are editable. Centre the digit portion under each tick, excluding its sign. Earlier output versions are retained for history, not current use.

`python3 scripts/build_signed.py` generates questions v4 and answers v1. It overwrites those filenames; inspect saved decks for manual edits and choose new output versions before rebuilding. Preserve the existing files when making a small change.
