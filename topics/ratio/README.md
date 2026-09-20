# Ratio — M04

## Current files

- [Questions v7](Ratio_M04_questions_v7.pptx) · [PDF](Ratio_M04_questions_v7.pdf): eight slides—assessment followed by the seven-slide topic set.
- [Answers v6](Ratio_M04_answers_v6.pptx) · [PDF](Ratio_M04_answers_v6.pdf): thirteen slides—assessment answers and six pairs of answer/diagnostic pages.
- [Question source](../../content/M04_ratio.md), [answer source](../../content/answers/M04_answers.md), [question audit](../../content/M04_ratio_audit.md).

The revised question bank and arrow design were accepted. The user subsequently requested the assessment, now included. No requested ratio correction remains. Scale, costs and changed-ratio applications still need their separate module.

Each independent column mixes contexts, units, givens, objectives and numerical relationships. The final arrows use the user's light-peach colour and grid-relative placement, recorded in `content/progression_arrow.json`. Earlier outputs are retained for history.

## Build caution

`build_ratio.py` generates questions v6 and answers v5 without the initial assessment. `add_ratio_assessment.py` reads those and produces questions v7 and answers v6. These scripts overwrite their output filenames. Do not rebuild blindly: preserve manual edits and choose new versions before running them. `verify_ratio.py` checks the pre-assessment build, not the complete current v7 deck. The assessment insertion was checked to preserve the existing slide shapes.

## Earlier revisions (historical)

Version 3 changes 44 of the independent ratios. Reversed and equivalent ratios count together: the 72 questions now use 36 relationships, with none repeated within a column, at most two occurrences per slide, and at most three across the four independent grids. The contexts, units, givens and objectives remain mixed. Matching quantities, worked answers and answer slides have been updated.

Version 4 includes two friendly given-difference/find-one-amount questions in Guided and two in Core on each independent slide. The corresponding answers and selected method/error/check notes have been updated. All six practice slides have a small editable curved arrow below Guided and Core, labelled “Try the next thread”, pointing into the next column.

Version 5 replaces the thin progression arrows with the approved bold, rounded orange shape, rotated 30° anticlockwise, with no prompt text. The shape remains an editable PowerPoint vector. Question and answer content is unchanged from version 4; the answer-deck XML was checked against v4 before reusing its PDF preview.
