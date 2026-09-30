# M04 — current topic files

- [Questions](Ratio_M04_questions.pptx): 9 slides.
- [HTML answers](Ratio_M04_answers.html): assessment, scaffolded practice, error corrections and independent answers.

Sequence: assessment → worked demo → two scaffolded practices → spot the errors (nine worked mistakes) → four independent practices. Original accepted teaching slides are preserved. New error activities are ready for manual review. Exact SE content is in [SPOT_ERRORS.md](../../content/SPOT_ERRORS.md).

Build with `python3 scripts/update_structure.py` from `practice/`. The builder reads the current topic deck when available, preserves teaching slides, refreshes SE from `content/spot_errors.json`, and compiles the main deck and HTML answers in teaching order. Edit SE in its structured source. Current filenames have no version suffix; replaced current outputs are archived as `_prevN`. Historical `_prevN` files and PDFs are not current outputs. Do not run legacy builders to publish current files.

Question wording reviewed on 1 October 2026. See the [full spot-the-errors review](../../content/SPOT_ERRORS_REVIEW.md) for clarified contexts and unchanged numerical answers.

## Historical record (superseded)

# Ratio — M04

## Current files

- [Questions v7](Ratio_M04_questions_prev9.pptx) · [PDF](Ratio_M04_questions_prev9.pdf): eight slides—assessment followed by the seven-slide topic set.
- [Answers v6](Ratio_M04_answers_prev6.pptx) · [PDF](Ratio_M04_answers_prev6.pdf): thirteen slides—assessment answers and six pairs of answer/diagnostic pages.
- [Question source](../../content/M04_ratio.md), [answer source](../../content/answers/M04_answers.md), [question audit](../../content/M04_ratio_audit.md).

The revised question bank and arrow design were accepted. The user subsequently requested the assessment, now included. No requested ratio correction remains. Scale, costs and changed-ratio applications still need their separate module.

Each independent column mixes contexts, units, givens, objectives and numerical relationships. The final arrows use the user's light-peach colour and grid-relative placement, recorded in `content/progression_arrow.json`. Earlier outputs are retained for history.

## Build caution

`build_ratio.py` generates questions v6 and answers v5 without the initial assessment. `add_ratio_assessment.py` reads those and produces questions v7 and answers v6. These scripts overwrite their output filenames. Do not rebuild blindly: preserve manual edits and choose new versions before running them. `verify_ratio.py` checks the pre-assessment build, not the complete current v7 deck. The assessment insertion was checked to preserve the existing slide shapes.

## Earlier revisions (historical)

Version 3 changes 44 of the independent ratios. Reversed and equivalent ratios count together: the 72 questions now use 36 relationships, with none repeated within a column, at most two occurrences per slide, and at most three across the four independent grids. The contexts, units, givens and objectives remain mixed. Matching quantities, worked answers and answer slides have been updated.

Version 4 includes two friendly given-difference/find-one-amount questions in Guided and two in Core on each independent slide. The corresponding answers and selected method/error/check notes have been updated. All six practice slides have a small editable curved arrow below Guided and Core, labelled “Try the next thread”, pointing into the next column.

Version 5 replaces the thin progression arrows with the approved bold, rounded orange shape, rotated 30° anticlockwise, with no prompt text. The shape remains an editable PowerPoint vector. Question and answer content is unchanged from version 4; the answer-deck XML was checked against v4 before reusing its PDF preview.
