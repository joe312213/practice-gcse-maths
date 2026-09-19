# Content and review

Start with [TOPIC_PLAN.md](TOPIC_PLAN.md), which follows the user's latest topic list and distinguishes full drafts from areas still being planned.

## Workflow

1. Draft each module in a Markdown file here. Include all seven slides: exact student text, worked steps, diagram descriptions and teacher answers. Keep answers separate from student practice text.
2. Check the maths, progression, consistent labels and likely slide fit.
3. Ask the user to review the concrete draft. Record agreed changes and change its status to **Agreed** only when the user agrees it.
4. Build the PowerPoint from the agreed content. Do not rewrite questions or teaching instructions during layout work. Return substantive changes to Markdown for review.
5. Check the rendered slides and keep Markdown, slide notes, answer key and PDF preview in step.

Stable question references use module / local slide / thread / question, for example `M04-S04-T2-Q3`. They remain usable when assessment or other slides change the deck's page numbers. Module slide numbers below are local, not deck page numbers.

## Current resources — reviewed 19 September 2026

| Item | State |
| --- | --- |
| Modules 1–3: [Lattice Multiplication](M01_lattice_multiplication.md), [Bus Stop Division](M02_bus_stop_division.md), [Application to Exam Problems](M03_application_to_exam_problems.md) | Accepted by the user. Markdown transcriptions captured from the v3 source; keep their teaching content. |
| `GCSE_Maths_Revision_Starters_v3.pptx` | Current deck. OneDrive marks it online-only; reading it timed out during this review. Do not replace it with a rebuild. |
| `scripts/add_initial_assessment.py` | Adds a 12-question, no-calculator assessment before the original slides. Its questions and speaker-note answers have been reviewed from source. |
| Initial assessment in the saved deck | Reported added by the user; saved slide not yet independently inspected because of the OneDrive read timeout. |
| `scripts/build_starters.py` | Contains the accepted 21-slide content and renderer together. Running it overwrites v3 and loses the added assessment. |
| Assessment script on repeat runs | Adds another assessment; it does not check whether one already exists. |
| Existing v3 answer key | Starts with the multiplication demo as Slide 1; no assessment section. Its slide numbers therefore do not match a deck with the assessment prepended. |
| Existing v3 PDF preview | Predates the assessment addition; refresh it with the next agreed deck build. |

Before the next PowerPoint build, preserve the current assessment and any manual edits, make assessment insertion repeat-safe, and generate slide numbering, notes, answer key and preview together. Save a new version. This folder is currently a project directory without a Git repository.

## Initial assessment — recorded content

The assessment uses three **topic** columns, not challenge columns. Instruction: **Work through each question showing your full written method. No calculators.**

| Q | Multiplication | Division | Application in Exam Questions |
| --- | --- | --- | --- |
| 1 | 43 × 6 | 864 ÷ 4 | A ribbon is 144 cm long and cut into 6 equal pieces. Find the length of each piece. |
| 2 | 68 × 4 | 132 ÷ 8 | A hall has 14 rows with 25 seats in each row. How many seats are there altogether? |
| 3 | 476 × 82 | 165 ÷ 6 | 145 eggs are packed into boxes of 6. How many full boxes can be made? |
| 4 | 6,038 × 591 | 615 ÷ 12 | A coach hire company charges £75 per coach. 130 passengers need coaches with 24 seats each. Find the total hire cost. |

Teacher answers: multiplication **258; 272; 39,032; 3,568,458**. Division **216; 16.5 (16 r 4); 27.5 (27 r 3); 51.25 (51 r 3)**. Application **24 cm; 350 seats; 24 full boxes with 1 egg left; £450 for 6 coaches**. The saved source accepts either decimal or remainder answers in the division assessment.

## Complete draft modules

These drafts began from the earlier chat. The user's latest list is authoritative; M05 and M09 are now optional supporting content. Fraction arithmetic, forward area/volume calculations, transformations, a separate ratio-problem set, and polygons/angles/parallelogram area plus Pythagoras are planned in TOPIC_PLAN.md, but do not yet have complete question banks. File IDs are stable references, not a fixed teaching order.

| Module | Focus | Guided → Core → Depth |
| --- | --- | --- |
| [M04](M04_ratio.md) | Ratio: sharing and missing amounts | Share a total → given one amount → given a difference |
| [M05](M05_fractions_decimals_and_percentages.md) | Optional: fractions, decimals and percentages equivalence | Familiar equivalents → conversion with less familiar values → compare and order mixed forms |
| [M06](M06_percentages_of_amounts_and_percentage_change.md) | Percentages of amounts and percentage change | Find an amount → increase/decrease an amount → find percentage change |
| [M07](M07_reverse_percentages.md) | Reverse percentages | Recover 100% from a known percentage → undo an increase/decrease → identify the original value in context |
| [M08](M08_missing_lengths_from_area_and_volume.md) | Missing lengths from area and volume | Rectangle → triangle/parallelogram → cuboid, including consistent units |
| [M09](M09_best_buys_and_unit_costs.md) | Optional: best buys and unit costs | Find unit cost → compare two offers → compare whole-pack purchase costs |
| [M10](M10_solving_equations.md) | Solving equations | One-step equations → two-step equations → brackets and unknowns on both sides |
| [M11](M11_forming_and_solving_equations.md) | Forming and solving equations | Translate a short statement → form a two-step equation → form and solve from a geometric or cost relationship |
| [M12](M12_speed_distance_and_time.md) | Speed, distance and time | One calculation in matching units → time conversion → two connected calculations |

Separate solving equations from forming them, as with the accepted arithmetic method/application split. FDP equivalence does not substitute for the requested fraction arithmetic. The seven-slide pattern applies to every proposed module. No new assessment slides are assumed.

## Drafts ready for review

M04–M12 each have a complete seven-slide draft: 63 draft slides and 648 independent questions, including the two optional modules. Worked examples, two practice grids, diagram descriptions and teacher answers are included. These files are proposals, not approved additions. Start with the topic plan, then review modules individually. Calculator use is proposed per module rather than inherited from the no-calculator initial assessment.

The 648 independent answers were checked by recalculating from their question text. Repeated independent questions were checked within each module. Text lengths were checked against the existing question-column width; rendered slide checks will follow content agreement. No PowerPoint files were changed.

## Review record

- 19 September 2026: user accepted existing multiplication, division and related problem content and requested Markdown agreement before PowerPoint additions.
- New module content remains **Draft — awaiting review** until explicitly agreed.
- Latest scope update: use the user's explicit topic list, including fraction arithmetic, forward area/volume, transformations, and shape/angle/Pythagoras work. User clarification: split polygons/interior/exterior angles/parallelogram area from Pythagoras, with Pythagoras problems after the introduction. Include ratio problems as well as core ratio work.
