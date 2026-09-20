# Separate student answer slides

**Status: Working specification; ratio is now built separately for review.** The user has requested separate answers with short method notes and common errors, including the wrong answers they cause. Exact presentation and content below are proposed.

## Structure and exact labels

Keep **one teaching/question deck and one separate answer deck for all topics**. Do not interleave answers with questions. Build separate topic question/answer pairs during development, then consolidate ready topics into the two final decks. Retain the seven teaching/question slides per module. S01 is the worked demo. S02–S07 each have a matching section, S02-A–S07-A, in the shared answer deck. An extra answer page is allowed when the working needs more room. Keep stable question references when inserting pages.

Question slides contain questions and the agreed practice prompts, without solutions or diagnostic hints that reveal the operation. Switch to the matching section of the separate answer deck after students attempt the questions. Use the same thread headings and question numbers.

Use these labels:

- **Answer:** complete answers, including required units, rounding and interpretation.
- **Method:** concise working for the step-by-step questions; selected, explicitly numbered examples for independent practice.
- **If you got…:** a specific wrong answer, the incorrect calculation that could produce it, and the correction.
- **Check:** a short numerical or contextual check, or an instruction to find and correct the first wrong step.

For independent grids, all 18 answers must be visible. Reserve roughly the upper 60% for the answer grid and the lower 40% for method/error/check notes aligned to the columns. Start with one selected question per column. This is a layout proposal to test when rendering, not a reason to shrink text. If notes do not fit at a readable projected size, use a second answer page. Retain editable diagrams where they explain the method. Speaker notes may contain fuller explanations.

An incorrect answer is evidence to investigate, not a unique diagnosis. Say “If you got 22, check whether you rounded up…” rather than claiming the student definitely did so. Check the faulty calculation as carefully as the correct one. Avoid generic notes such as “watch your signs” without a worked consequence.

## Concrete example: M03-S04-A

**Answers to Application to Exam Problems — independent practice 1.** This proposes an answer partner for the accepted questions in [M03](M03_application_to_exam_problems.md); it does not change those questions.

### Answer

| Q | Thread 1: Guided | Thread 2: Core | Thread 3: Depth |
| --- | --- | --- | --- |
| 1 | 448 books | 21 full cartons | £670 |
| 2 | 15 students in each group | 7 cars | £975 |
| 3 | 1,066 bottles | 10 chocolates left | £338 |
| 4 | 37 m | £476 | £315 |
| 5 | 1,105 seats | 23 full bags | £405 |
| 6 | £35 each | £16.50 each | £1,440 |

Notes below the answers, each referring to **Q1** in its column:

| Label | Thread 1: Guided | Thread 2: Core | Thread 3: Depth |
| --- | --- | --- | --- |
| Method | 14 × 32 = 14 × 30 + 14 × 2 = 420 + 28 = 448 books. | 130 ÷ 6 = 21 remainder 4. Only full cartons count: 21. | 45 × £16 = £720. £720 − £50 = £670. |
| If you got… | 420: check whether you calculated only 14 × 30. Include 14 × 2 = 28. | 22: check whether you rounded up 21 remainder 4. A 22nd full carton needs 2 more eggs. | £770: check whether you used £720 + £50. A discount reduces the total: subtract £50. |
| Check | 448 ÷ 14 = 32 books per shelf. | 21 × 6 + 4 = 130; 22 × 6 = 132, too many. | £670 + £50 = £720, the price before the discount. |

Student instruction: **Compare your working. Correct the first wrong step, then redo the calculation.**

## Completion status

[The shared answer-deck index](answers/README.md) links complete drafts for all six practice answer sections in each of M01, M02 and M03. Their accepted questions remain unchanged. The example above illustrates M03-S04-A; the module answer file is authoritative if edited later. M13 and M14 contain all six answer sections within their module Markdown files; these sections also belong in the shared answer deck. M04–M12 still need visible method/error/check notes. No new PowerPoint files have been produced; these drafts await content agreement.


## Topic build workflow — 20 September 2026

The user requested standalone topic slide decks first, starting with ratio. During development, each topic has a teaching/question file and a separate answer file. Consolidate ready topics into one teaching/question deck and one shared answer deck later; do not interleave practice answers. The M04 core-ratio build is in `topics/ratio/` at the project root. The additional ratio-application set is still planned.
