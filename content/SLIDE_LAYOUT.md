# Shared slide layout requirements

Read this file when building or adjusting slides. Topic Markdown supplies the exact content; this file supplies shared visual requirements.

## Readability and diagrams

Use editable PowerPoint text and shapes for worked diagrams. Preserve whole questions above their worked steps; do not spread one calculation over several slides. Keep labels consistent, diagrams mathematically accurate, and digits and carries distinct. Use readable projected text rather than shrinking it to fit. Add a separate recap or answer page when needed.

For number-line tick labels, centre the digit portion (the absolute value), excluding the minus sign. The sign extends left. Apply this to positive, zero, negative and multi-digit values. A centred full label can be shifted left by half the measured minus-sign width in the actual font. Do not centre the sign and digits together or align by character count. The M13 generator implements this correction.

## Progression arrows

Place one bold, rounded, editable curved arrow below Guided towards Core and one below Core towards Depth on practice question slides. No adjacent prompt text. Do not add them to assessments, recaps, worked demos or answer slides.

The user's edited ratio v5 slide 2 is the approved shape, colour and placement reference:

- Curve down then up towards the next column, matching the supplied reference rotated a further 30° anticlockwise.
- Light peach: theme accent6 with lumMod 60000 and lumOff 40000 (40% lighter; approximately #FABF90 in the current theme).
- Width 0.68 inches; retain the shape's proportions and thick rounded stroke.
- Straddle the grid's bottom edge at each next-column boundary. Keep clear of question text and footers.
- Use the exact per-arrow offsets in [progression_arrow.json](progression_arrow.json), relative to the column boundary and grid bottom. Adapt these references to the actual layout; do not copy absolute positions between different grids.

Preserve user edits when modifying saved decks. When developing a new arrow shape, use an isolated preview before rebuilding decks. Routine application of the approved design does not require another approval.

## Focused visual checks

For a small layout correction, inspect the affected slide or diagram and confirm unrelated content was preserved. A full question audit or deck rebuild is unnecessary unless the change affects it. For new decks, check text fit, diagram accuracy and completeness, then render and inspect representative layouts and any dense or unusual slides.

## Topic sequence and error-spotting layout — 30 September 2026

Every topic uses: **initial assessment → technique intro/rules recap if needed → worked demo → two scaffolded practices → spot the errors → four independent question slides**. The assessment is immediately before the intro/recap, or before the demo when there is no separate recap. M01, M02 and M03 reuse their four original assessment questions each. M13 retains its separate rules recap. M04 retains its assessment before the demo. Stable references S01–S07 remain unchanged; use IA for assessments and SE for error-spotting.

Spot the errors uses the full-width three-column challenge format: **Thread 1: Guided**, **Thread 2: Core**, **Thread 3: Depth**. Each column has exactly three numbered questions, each with complete attempted working and an incorrect final answer. Use common plausible mistakes; students identify the first wrong step, correct it and finish. Lattice examples use editable grids and diagonal calculations, including mistaken carry digits, omitted carries and wrong diagonal halves. Keep every solution together in its card. Do not show corrections on the question slide; include all nine corrections and checks in the HTML answers. Exact examples are in [SPOT_ERRORS.md](SPOT_ERRORS.md); structured source is `spot_errors.json`.

Current built sequences: M01, M02, M03 and M04 each have nine slides; M13 has ten because of its separate recap. The combined deck currently orders them M01 → M02 → M13 → M03 → M04, omitting unbuilt modules from the full teaching plan.

Maintain matching topic files in `topics/<topic>/` and combined files at the project root. Current question PowerPoints and HTML answers have no version suffix. Archive superseded current files with `_prev1`, `_prev2`, etc.; retain older snapshots under `_prevN` as historical inputs. Generate HTML answers in the same topic/activity order, with fixed module/thread/question references.

## Student-style working on error slides

Show what a student would actually write. Lattice work includes every cell, result digits around the perimeter and carries beside the next diagonal; a deliberately oversized carry can be confused with an answer digit. Division uses a complete bus-stop frame, dividend and quotient aligned by place value, small remainder prefixes, decimal points and final remainders. Application questions use these written methods or vertical arithmetic for their calculations. Ratio work shows the full calculations and quantities; signed-number work uses an equality chain with each transformation on its own line.

Do not replace working with lists of algorithm steps, `c1` shorthand, semicolon-separated summaries or prose such as “ignore the remainder” that tells students the mistake. The visible layout itself must provide the evidence. Keep all three questions per column and their full working. Incorrect written-work diagrams are also embedded in the HTML answers beside the correction and check. `scripts/student_workings.py` renders the editable diagrams and their matching HTML SVGs.

## Avoid answer-pattern shortcuts

Review all nine correct and nine deliberately incorrect final results together on each SE slide. Repeated answers must not provide a shortcut around interpreting the question or inspecting the working. Check across topics as well as within each column; vary results without making arithmetic unnecessarily difficult. See `SPOT_ERRORS_ANSWER_PATTERNS.md` for the current inventory. Apply this principle to future assessment and practice banks too.
