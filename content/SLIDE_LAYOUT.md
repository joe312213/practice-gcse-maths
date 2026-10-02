# Shared slide layout requirements

Read this file when building or adjusting slides. Topic Markdown supplies the exact content; this file supplies shared visual requirements.

## Readability and diagrams

Use editable PowerPoint text and shapes for worked diagrams. Preserve whole questions above their worked steps; do not spread one calculation over several slides. Keep labels consistent, diagrams mathematically accurate, and digits and carries distinct. Use readable projected text rather than shrinking it to fit. Add a separate recap or answer page when needed.

For number-line tick labels, centre the digit portion (the absolute value), excluding the minus sign. The sign extends left. Apply this to positive, zero, negative and multi-digit values. A centred full label can be shifted left by half the measured minus-sign width in the actual font. Do not centre the sign and digits together or align by character count. The M13 generator implements this correction.

## Progression arrows

Place one bold, rounded, editable curved arrow below Start towards Build and one below Build towards Confidence on practice question slides. No adjacent prompt text. Do not add them to assessments, recaps, worked demos or answer slides.

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

Spot the errors uses the full-width three-column challenge format: **Start**, **Build**, **Confidence**. Each column has exactly three numbered questions, each with complete attempted working and an incorrect final answer. Use common plausible mistakes; students identify the first wrong step, correct it and finish. Lattice examples use editable grids and diagonal calculations, including mistaken carry digits, omitted carries and wrong diagonal halves. Keep every solution together in its card. Do not show corrections on the question slide; include all nine corrections and checks in the HTML answers. Exact examples are in [SPOT_ERRORS.md](SPOT_ERRORS.md); structured source is `spot_errors.json`.

Current built counts and order are recorded in the dated additions below and in `topic_registry.json`; omit unbuilt modules.

Maintain matching topic files in `topics/<topic>/` and combined files at the project root. Current question PowerPoints and HTML answers have no version suffix. Replace current outputs in place; retain history in Git, without backup copies. Generate HTML answers in the same topic/activity order, with fixed module/thread/question references.

## Student-style working on error slides

Show what a student would actually write. Lattice work includes every cell, result digits around the perimeter and carries beside the next diagonal; a deliberately oversized carry can be confused with an answer digit. Division uses a complete bus-stop frame, dividend and quotient aligned by place value, small remainder prefixes, decimal points and final remainders. Application questions use these written methods or vertical arithmetic for their calculations. Ratio work shows the full calculations and quantities; signed-number work uses an equality chain with each transformation on its own line.

Do not replace working with lists of algorithm steps, `c1` shorthand, semicolon-separated summaries or prose such as “ignore the remainder” that tells students the mistake. The visible layout itself must provide the evidence. Keep all three questions per column and their full working. Incorrect written-work diagrams are also embedded in the HTML answers beside the correction and check. `scripts/student_workings.py` renders the editable diagrams and their matching HTML SVGs.

## Avoid answer-pattern shortcuts

Review all nine correct and nine deliberately incorrect final results together on each SE slide. Repeated answers must not provide a shortcut around interpreting the question or inspecting the working. Check across topics as well as within each column; vary results without making arithmetic unnecessarily difficult. See `SPOT_ERRORS_ANSWER_PATTERNS.md` for the current inventory. Apply this principle to future assessment and practice banks too.

## Current additions — 1 October 2026

All challenge headings are **Start**, **Build**, **Confidence**, without “Thread”. Apply the approved curved progression arrows to **every independent question grid** as well as scaffolded practice. Keep arrows relative to the actual grid bottom and column boundaries.

M01 includes an additional template slide after its demo: empty 2×2, 3×2, 3×3, 4×3 and 4×4 lattice grids, with diagonals drawn for students to copy. Templates do not reveal practice answers.

Equation work uses a vertical line through the equals sign, with the same operation shown on each side. Include simplification, useful common-factor factorising and advice on choosing a short first step. In dense error cards, operations may be placed beside the transition between equations, but must remain visible. Fractions use stacked notation and equal-whole strips, including conversion of mixed numbers and simplification.

The current deck has 67 slides: M01 (10), M02 (9), M13 (10), M10 (10), M15 (10), M03 (9), M04 (9). The registry in `topic_registry.json` controls compilation. See [ANSWER_SLIDES.md](ANSWER_SLIDES.md) for the three-column completed diagrams/error corrections, ballpark checks, alternating topic sections and sticky topic labels in HTML.

## Planned animated demonstrations

See [ANIMATED_DEMOS_PLAN.md](ANIMATED_DEMOS_PLAN.md) for the next-session prototype, skill-specific reveal sequences, deterministic renderer changes, compiler timing preservation and focused manual checks. This is a plan, not implemented animation behaviour.

Lattice carries sit in a consistent small-digit position immediately beside the receiving diagonal's grid boundary: near the left edge for diagonals ending on the left, and just below the bottom edge for those ending at the bottom. Place the carry before and closer to the grid than the large answer digit, with enough clearance to distinguish the two. Anchor positions to the grid, not to the varying width of an answer glyph. The deliberate oversized-carry SE misconception is the explicit exception; retain that error as the activity's evidence.
