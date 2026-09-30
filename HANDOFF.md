# Session handoff — 30 September 2026

Read [AGENTS.md](AGENTS.md) and [content/SLIDE_LAYOUT.md](content/SLIDE_LAYOUT.md) for current requirements.

## Current outputs

- [Combined questions](GCSE_Maths_Revision_Starters.pptx): 46 slides, in order M01 multiplication → M02 division → M13 signed addition/subtraction → M03 multiplication/division problems → M04 ratio. Unbuilt modules are omitted.
- [Combined HTML answers](GCSE_Maths_Revision_Starters_answers.html): same topic order; includes assessment answers, practice answers/method notes, and all 45 error-spotting corrections/checks.
- Every built topic has its own current question PowerPoint and HTML answers under `topics/`: `multiplication`, `division`, `signed_numbers`, `problem_solving`, `ratio`. Each README links its files.

## Completed changes

- Read project state, teaching specifications, layout and answer docs. Preserved accepted saved teaching slides and editable diagrams.
- Split the original twelve-question assessment into three four-question slides, keeping its questions unchanged. Each now sits immediately before the relevant topic’s intro/demo. Signed numbers and ratio retain their own assessments; signed numbers retains its recap.
- Added one spot-the-errors slide after the two scaffolded practices and before independent practice in each of the five built topics. Each has three challenge columns with three fully worked incorrect solutions. Corrected methods and checks are in HTML answers.
- Recorded exact new content in `content/spot_errors.json` and generated `content/SPOT_ERRORS.md`. Documented structure and output conventions in AGENTS and SLIDE_LAYOUT.
- Current filenames have no `_vN`; question outputs are `.pptx`, answers are `.html`. Later replacements archive current outputs as `_prevN`. Legacy snapshots now use `_prevN` filenames and remain available for provenance and initial-build fallback.

## Build and review

Run `python3 scripts/update_structure.py` from `practice/`. It reads current individual topic decks when present, updates SE from structured content, preserves their other slides, and compiles the combined files. The original main v3 plus ratio v7/signed v4 are first-build fallback snapshots. Legacy build scripts are not the current publication route. A combined-deck manual edit should also be carried into its topic file before recompiling.

Focused checks cover generated text fit, output readability as PPTX packages, topic ordering and question counts. Full PowerPoint visual review is left to the user as requested; no PDF previews were regenerated. New error content is a review draft, not implicitly accepted by generation.

## Next unbuilt work

M14 signed multiplication/division and order of operations, then fraction arithmetic, following `content/TOPIC_PLAN.md`. This update does not build those drafts. Check older draft content against current topic structure and answer requirements.

## Archive filename cleanup

Renamed all remaining `_vN` decks, historical answer files and PDF previews to `_prevN`, without replacing existing archives. Matching legacy deck/PDF versions share their archive number. Updated filename references in scripts and docs, including the active builder’s fallback inputs. Current suffix-free outputs are unchanged. The exact mapping is recorded in `content/archive_renames.json`; archive numbers identify saved files, not a chronological ranking across the migration.

## Review correction — student-style error workings

Replaced all five SE slides’ shorthand with actual student-style written solutions. Lattice cards now show the result digits and carries on the grid; division cards use bus-stop diagrams; applications use bus stops and column arithmetic; ratio uses full written calculations and signed numbers use line-by-line equality chains. Removed prose that reveals the intended mistake. HTML answers now embed the matching incorrect diagrams alongside the solution, explanation and check. Two ratio attempts were revised to plausible student calculations; questions and answer explanations remain matched.

The current individual and combined outputs were regenerated, with earlier outputs archived as `_prevN`. The slide count and ordering remain unchanged. Rendering is in `scripts/student_workings.py`; structured content remains `content/spot_errors.json`. Only the five changed SE slides require visual review for this update.

Validation: rendered and inspected the five changed SE slides. Checked the written layouts and text fit; corrected the deliberately misplaced decimal point so the visible quotient matches its stated wrong answer. Existing topic structure and all other teaching slides remain unchanged.

## Question clarity review — 1 October 2026

Reviewed all 45 SE prompts alongside their incorrect written solutions and corrected answers. Changed 14 prompts: replaced the ticket scenario with four organisers splitting the cost of 18 prizes at £12 each (£54 per organiser); replaced the ambiguous five-seat-car scenario with tents; clarified table hire, drinks served, ratio objects, requested counts and comparison targets. The remaining 31 prompts are clear and retained. Operands, ratios and correct numerical answers are unchanged.

The full question-by-question review and wording changes are in `content/SPOT_ERRORS_REVIEW.md`. Updated structured content, current topic/combined question decks and HTML answers together. Preserved the visual student-working format and existing IA/practice content. The prize attempt still incorrectly discards the remainder from 18 ÷ 4 and gives £48; its corrected explanation explicitly includes the cost of all 18 prizes.

Validation: visually checked the revised problem-solving and ratio slides at the existing font sizes; no text/working overlap. Confirmed all 41 non-SE slides were preserved, and both relevant HTML answer files include the prizes question and £54-per-organiser explanation.

## Answer diversity — 1 October 2026

Acted on the user's requirement to prevent answer-pattern guessing. Reviewed all 45 SE questions' correct and incorrect final results. Varied 12 examples: removed the ratio cluster of three 10s, the signed-arithmetic cluster of four −3s, reused wrong answers and correct/wrong overlaps on the same slide, and the repeated 132 ÷ 8 bill calculation. Preserved each misconception and the approved clear contexts. The organisers/prizes answer remains £54.

All 18 final results on each topic's SE slide are distinct; across the five topics no value appears more than twice. This is a teaching review, not a requirement to make every answer in the whole curriculum unique. Updated quantities, written work, corrections and HTML answers together. `content/SPOT_ERRORS_ANSWER_PATTERNS.md` records every final result; `scripts/review_answer_patterns.py` runs during the build. Maintain its result metadata when changing content. Other assessment/practice banks were not rewritten by this SE-focused update; apply the same pattern review to future work.
