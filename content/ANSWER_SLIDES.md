# Student HTML answers

Current specification — 1 October 2026. Answers are HTML, despite this historical document filename. Maintain one file per built topic and a combined file in the same teaching order as the question deck. Current filenames have no `_vN` suffix; history is retained in Git, with no backup copies. Markdown is content source, not the delivered answer format.

Use **Start**, **Build**, **Confidence** throughout questions and answers. Do not print “Thread” in column headings. Retain stable internal module/activity/column/question references when slides move.

## Content and checks

Show every assessment and practice answer with units and any interpretation of remainders. Use **Answer**, **Method**, **If you got…**, **Check**. Identify the selected question beside each method/error example; vary the selection. Explain the possible first mistake and how to correct it. Spot-the-errors answers include the shown incorrect working, the correct solution, explanation and a useful check for every question.

Arithmetic checks should be easy mental **ballpark checks**, using rounded numbers or simple bounds and friendly multiplication. Do not ask students to verify a large product by a demanding inverse division, or a decimal quotient by a demanding exact multiplication. For example, 53 × 7 lies between 50 × 7 = 350 and 60 × 7 = 420. Label estimates/bounds as reasonableness checks: they cannot certify every digit. Retain cheap exact checks where useful: substituting small values into an equation, comparing a ratio's total/difference, or checking enough seats. Contextual feasibility and correct units still matter.

## Page layout

- Each topic starts with a tall coloured horizontal separator and prominent title. Alternate subtle topic background colours. A sticky left rail carries the vertically rotated topic name; it follows scrolling within that topic. The top navigation links directly to each topic.
- Answer grids show all answers. **Worked diagrams and steps** is one three-column row, aligned Start / Build / Confidence, with a completed diagram and concise explanation in each card. Do not publish prose telling someone to draw a diagram in place of the diagram itself.
- Spot-the-errors corrections use three columns too: each column contains its three numbered questions, with incorrect work, explanation and correction together. Completed correct lattice/bus-stop working is also supplied. Equation and fraction corrections show every necessary written step.
- On narrow mobile screens, columns stack to preserve readability. Print removes sticky positioning. Longer complete independent solutions can sit in a clearly labelled expandable section; the main answer grid and selected workings remain visible.

## Deterministic rendering

Use `scripts/answer_layout.py` for the shared HTML layout and `scripts/rendering/` for mathematical working. Separate skill modules are `lattice.py`, `bus_stop.py`, `equations.py`, `fractions.py`, `signed_numbers.py`, `ratio.py`, and `applications.py`; `canvas.py` supplies drawing primitives, while `estimates.py` supplies easy arithmetic checks. `student_workings.py` retains the established deliberately incorrect arithmetic diagrams.

Render from explicit operands/steps. Lattice rendering computes all cell products, diagonal totals, carries and perimeter result digits. Bus-stop rendering aligns quotient and dividend digits and marks small carried remainders; decimal extensions keep zeros and decimal points. Equation rendering shows the centre line and operations on both sides. Fraction rendering uses stacked numerators/denominators and equal-length whole strips. Other skill scripts format their supplied calculations; they must not invent a method from an answer alone.

This avoids manual positioning and duplicated descriptions, gives clear consistent diagrams, and makes later numerical edits efficient and reproducible. Use native editable shapes in PowerPoint and inline SVG in HTML, without a browser/server dependency for the delivered answers. Keep carry digits visually distinct from answer digits. Never compress full student-style working into algorithm shorthand to fit a card.

For answer-only changes, run `python3 scripts/refresh_answers.py`. It refreshes all current HTML without rebuilding or archiving question decks.

## Consistent practice headings and compact assessments

Each practice diagnostic block has the heading **Method and error check — practice N**, or **Method and error check — scaffolded practice N**, immediately followed by its table. Use the same Start / Build / Confidence columns and Method / If you got… / Check rows for every topic, including equations and fractions. Show selected question references within the cells. Keep complete diagrams in the method cells or the existing aligned worked-diagram row. Remove production prose such as “Full-answer page”, “Show this on a second answer page” and “Each column identifies…” from delivered student HTML.

Initial assessment answers occupy **one table cell containing all four numbered solutions**. Lay those solutions side by side on desktop, wrapping on narrow screens. Keep working and final answers together, cap diagram widths at a readable compact size, and omit diagnostic cards and redundant operations such as dividing by one. Do not stretch a single solution diagram across the page. Fraction answer grids use CSS-sized text with stacked numerators/denominators; do not scale a wide SVG canvas down to represent a single answer.

Lattice carry placement follows SLIDE_LAYOUT.md: small digits anchored close to the receiving grid edge, before the corresponding large answer digit. Apply the same positioning to multiplication and application diagrams; keep deliberate oversized-carry mistakes recognisable in SE examples.


## CSS source of truth

`styles/answers.css` owns all answer-page typography, spacing, colours, responsive rules and diagram display sizes. Generators embed its contents into each delivered HTML file, keeping files portable without a separate stylesheet dependency. Edit this CSS source, then run `python3 scripts/refresh_answers.py`; do not edit generated HTML or add stylesheet strings in topic generators.

Use the named `:root` tokens for shared adjustments: `--answer-size` for final fraction/whole/mixed answers, `--fraction-digit-scale` for numerator/denominator text, `--assessment-diagram-width` and `--method-diagram-width` for worked diagrams. Final fraction answers use `.math-answer` and `.fraction` markup from the shared renderer, with no fixed-width SVG or empty canvas. Default answer size is 1.5rem; fraction digits are .85em of that size. All 72 fraction answers use this same component.

Keep CSS selectors organised by component, with responsive and print rules together at the end. No inline display styles, `!important` overrides or duplicate topic-specific CSS. SVG coordinates and internal glyph sizes remain mathematical drawing geometry; CSS controls each complete diagram's displayed size. PowerPoint renderers keep their separate native geometry.
