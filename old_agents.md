# Maths revision starters

## Purpose and scope

The sole purpose is to maximise students’ chances of achieving grade 4 or above in Foundation GCSE Maths. Most currently work at grades 2–3 and have low confidence and weak arithmetic, algebra and problem-solving skills. Use short regular starters, with possible pre-exam revision lessons, to refresh learning and build accurate, increasingly independent work. These are not full lessons teaching every topic from scratch.

The vocational computing course provides the lesson time. It does not determine the maths content or contexts. Use Foundation GCSE-style numerical questions, wording, diagrams and everyday exam problems. Prioritise secure arithmetic, understanding relationships, choosing operations, algebra and checking work. Keep difficulty useful for this aim; do not equate longer numbers or longer reading with better exam preparation. Preserve the accepted multiplication and division challenge questions. The exam board is not yet specified; do not assume a particular board’s paper numbering or calculator arrangements.

Start with three separate modules: **Lattice Multiplication**, **Bus Stop Division**, and **Application to Exam Problems** using those methods. Lattice multiplication supersedes the earlier request for the box method. Ratio is a requested later topic; other Foundation topics can follow.

The remaining requested areas are signed-number arithmetic, fraction arithmetic (+, −, ×, ÷), percentages, ratio, area and volume including missing lengths, speed/distance/time and Foundation problems, forming equations, solving equations, 2D enlargement/reflection/rotation/translation, and two distinct geometry topics: polygons (total interior angles, interior/exterior angles and parallelogram area), and Pythagoras’ theorem. Pythagoras must include problems after the method introduction. Ratio must include application problems as well as core ratio calculations. See `content/TOPIC_PLAN.md` for proposed module splits. FDP equivalence and best buys are optional supporting drafts, not substitutes for the requested topics.

`initial_chat2.html` records the discussion. Follow the user's refinements, not every Gemini suggestion or its rejected AGENTS.md drafts. `initial_draft_GCSE_Maths_Resit_Starter_Grid.pptx` is an existing 21-slide first draft, not the final specification.

## Module structure

Develop and review each topic as separate PowerPoint files first, then consolidate when ready. Each topic starts with an initial assessment as physical slide 1, followed by its seven teaching/question slides. The assessment has four fresh questions: two at Guided level, one Core and one Depth. Give no hints, worked steps or method diagrams; assess what students already know. Keep assessment answers in the separate answer deck. Retain stable content references when prepending this slide. Its six practice answer sections go in one separate answer deck shared by all topics:

1. **Worked demo:** one full question at the top of each challenge column; subsequent rows show every essential step and its worked result.
2. **Two step-by-step practice slides:** new questions, the same row structure, and short prompts. Students do the work.
3. **Four independent practice slides:** three columns, each containing at least six full questions. No decomposed step rows. Provide varied practice, not repeated questions.

Use a consistent grid: three challenge columns labelled **Thread 1: Guided**, **Thread 2: Core**, **Thread 3: Depth**. On demo and step-by-step slides, each row represents one meaningful step; keep the whole question visible above it. On practice slides, a bold, rounded, editable curved arrow below Guided pointing to Core, and below Core pointing to Depth, encourages progression. Use the user’s reference shape, rotated a further 30° anticlockwise: curve down then up toward the next column. Use the arrow alone, without prompt text. The user's edited ratio v5 slide 2 (20 September 2026) is the approved colour and placement reference: light peach (theme accent6, 40% lighter; approximately #FABF90), 0.68 inches wide, straddling the grid's bottom edge at the next-column boundary. Preserve the two exact offsets saved in `content/progression_arrow.json`; adapt them relative to column boundaries and grid bottom for other layouts. Keep clear of question text and footers. Preserve manual edits when applying changes to saved decks. Iterate on an isolated arrow preview before rebuilding decks for a purely visual adjustment. Do not spread one question's steps over separate slides. Students record working in booklets or a webapp.

## Student answer slides

Keep practice answers off question slides. All topics’ answer slides belong in **one separate answer deck**, not interleaved with questions. During development, build a standalone question deck and a separate answer deck per topic; consolidate ready topics into one teaching/question deck and one shared answer deck. Preserve existing M01–M03 question slides; develop only their answer slides. Worked demos remain worked demos in the teaching deck. Each practice slide needs a matching answer slide with the same thread headings and question numbers, plus readable space for short method notes and examples of errors and the wrong answers they produce. Use the labels **Answer**, **Method**, **If you got…**, and **Check**. For an independent grid, show all answers and discuss selected questions by number; do not squeeze detailed solutions to all 18 questions onto one slide. Use an additional answer page if needed for readability.

Trace each selected error with an actual incorrect calculation, its incorrect result, and the correction. Phrase diagnoses as possibilities: an answer alone does not prove which error occurred. Help students identify and correct their first wrong step. Speaker notes and teacher answer keys do not replace these visible student slides. See `content/ANSWER_SLIDES.md` and the shared deck index `content/answers/README.md`. Existing accepted questions stay accepted; new answer slides and notes still need Markdown review.

## Arithmetic method modules

Use numerical calculations, such as `43 × 6`, rather than word problems. Row headings and prompts must describe the actual algorithm. Use the same wording across practice slides and columns where the action is the same.

### Lattice multiplication

1. **Draw Grid & Arrange Digits:** Draw the grid with diagonals. Write the first number's digits left to right across the top and the second number's digits top to bottom down the right edge.
2. **Find & Fill Cell Products:** Multiply each column digit by each row digit. Put tens in the top half of the cell and units in the bottom half. Include a zero in the top half when the product is less than 10.
3. **Sum Diagonals & Track Carries:** Start at the bottom-right diagonal. Include any carry from the previous diagonal. Write the result digit at the bottom end of its diagonal; put any carry at the bottom end of the next diagonal in smaller text. Keep result digits and carries clearly distinct and consistently positioned.
4. **Write Final Answer:** Read from the digit beside the top-left diagonal, down the left edge and along the bottom. Omit leading zeros.

Scale from two digits × one digit (`43 × 6`), to two digits × two digits (`34 × 12`). The third column must include several four-digit × three-digit and four-digit × four-digit questions, with a larger multiplication demonstrated. Do not stop at four digits × two digits. The longer numbers are operands, not a limit on the answer's length.

### Bus stop division

1. **Draw Frame & Position Digits:** Put the dividend (the number being divided) inside the frame and the divisor outside on the left. Space digits clearly.
2. **Divide Left-to-Right & Carry:** Work left to right. Write how many whole times the divisor fits above the corresponding digit. Carry each remainder as a small prefix to the next digit. Preserve place-value zeros.
3. **Track Remainders or Decimals:** State the final remainder, or continue with a decimal point and zeros as required by the question. Align decimal points in dividend and answer.
4. **Write Final Quotient:** Write the complete answer, including the remainder or decimal part where required.

Scale from division without carrying (`63 ÷ 3`), through carrying and remainders (`145 ÷ 6`), to larger dividends and decimal answers. Include four-digit ÷ two-digit questions in the third column and demonstrate one (`4,834 ÷ 16`). Do not define the dividend as the “larger number” or describe division with remainders as fitting “perfectly”.

## Application to exam problems

Keep these distinct row labels:

1. **Keywords & Calculation:** Identify the keywords. Write down the calculation(s) needed.
2. **Written Method:** Set up and use the written method for the calculation(s).
3. **Ballpark Check & Math:** Check the answer using rough ballpark calculations.
4. **Final Answer:** Clearly state the answer to the question, with units where needed.

These labels preserve the wording reached in the chat; the prompts must ensure students calculate and actually check their result. Worked demos show the chosen operations and all working. Practice prompts must not reveal the operation or method: “draw a bus stop” gives away the decision students need to make.

Differentiate the thinking, not just the numbers:

- **Guided:** one clear operation. Example: share 84 tins equally among four boxes; find tins per box.
- **Core:** one operation requiring more thought to identify or interpret. Example: pack 130 biscuits in packs of six; find completely full packs.
- **Depth:** two operations, with the first result feeding the second. Example: transport 145 students in minibuses with nine passenger seats, each costing £40; find total hire cost. Students must round up before calculating cost.

Use clear, unambiguous questions. Difficulty should come from the maths, not confusing language. Vary contexts, units, information supplied and the quantity students must find within every challenge column. A thread must not identify the method just by its position. For ratio, mix total-known, amount-known and difference-known problems where suitable; include finding a difference, not only using a given difference. Mix multiplication and division in application practice so students must choose.

## Quality and variety checks

Variety is a teaching requirement: it supports engagement and helps students recognise and apply a method in unfamiliar questions. Different names or numbers alone do not make a varied question bank. Apply these checks within each challenge column, across each slide and across the full module.

- Vary contexts and relevant units within each column. Use plausible Foundation GCSE exam situations. Do not assign one context or unit to an entire column, or arrange rows so their positions reveal the question type. Arithmetic-only method modules remain numerical.
- Vary the information supplied and the objective. Students should have to decide what the quantities represent and what calculation is needed. For ratio, mix a given total, one known amount and a given difference where appropriate to the challenge. Ask for either amount, both labelled amounts, a total, or a difference. Depth must not always supply a difference. Include a couple of friendly given-difference/find-one-amount questions in each of the first two columns as well, using manageable numbers; do not reserve that reasoning for Depth. The worked-demo columns illustrate methods; they do not prescribe one method for every question in that column.
- Vary the underlying numerical relationships, not just their scale. Audit ratios after simplifying and ignoring reversal: 3:7, 7:3 and 6:14 count as the same relationship for repetition checks. Deliberate reversal has teaching value: it checks whether students follow the order of the quantities, identify which amount is given, and recognise which amount is larger. Include it alongside genuinely different numerical relationships, givens and objectives; reversal must not be the main source of variety. Some spaced repetition is also useful, but avoid clusters and repeated patterns. For the current six-question ratio columns, aim for six different relationships per column, at most two occurrences per independent slide and at most three across the four independent banks. These are default checks for this format, not absolute bans: a purposeful reversal/comparison pair can justify a local repeat when the rest of the bank is varied. Do not introduce awkward numbers merely to make every ratio unique.
- Preserve meaningful challenge. Guided should be accessible; Core and Depth should require more interpretation or connected steps. Some overlap supports retrieval. Do not obtain variety by adding confusing wording, unmodelled prerequisites, excessive calculation or unrealistic quantities. Prefer manageable arithmetic that leaves attention available for choosing and checking the method.
- Review the actual questions as a set before building: contexts, units, givens, objectives, numerical relationships and repeated structures. Check whether a student could guess the method from the thread, row position or a repeated wording pattern. Automated counts supplement this teaching review; they do not replace it.
- When a question changes, update its Markdown working, answer, units, labels, diagrams, selected method/error/check notes and slide references together. Verify that each incorrect-answer example really follows from the stated error and still refers to the intended question. Keep paired answers labelled.
- Recalculate answers and verify ratio order, known totals/amounts/differences, whole-number counts and units. Check every question and answer is present in the generated files. Render and inspect the slides for readability, wrapping and diagram accuracy; do not shrink text or remove questions to hide a layout problem.
- Carry user corrections into subsequent modules. Do not wait for the user to repeatedly identify the same lack of variety or quality.

## Working rules

- Develop new content in `content/` Markdown files before adding it to PowerPoint. Include the exact questions, row labels, prompts, worked steps, diagram descriptions, all answers and the visible method/error/check text for separate answer slides. Mark drafts clearly. Normally agree Markdown content before adding it to PowerPoint; record what was agreed. The user may explicitly authorise a PowerPoint draft for easier content review, as for M13 on 20 September 2026. In that case build the review deck without another approval gate, retaining Markdown as the content source.
- Treat the existing multiplication, division and application content as accepted. Preserve the added initial assessment. The current `build_starters.py` rebuilds only the original 21 slides, and `add_initial_assessment.py` adds another assessment each time it runs; do not run them blindly against the current deck.
- Call a spade a spade. No synonym rotation, inflated terminology, marketing language, or decorative filler. Keep labels stable; change wording when it fixes an error, not for variety.
- Include clear, editable diagrams in worked demos; the user can replace them. Keep answer digits and carries consistently positioned. Do not substitute confusing ASCII diagrams.
- Check calculations, intermediate steps, carries, units, remainder interpretation, and actual differences in challenge. Check projected readability and text fit when producing slides.
- Deliver complete requested files. Diagram placeholders are intentional; missing questions or “repeat this for the remaining slides” are unfinished work. Only claim a file is generated when it exists.
- Use judgement for implementation and new question content. Preserve these teaching decisions without turning every incidental Gemini suggestion into a requirement.
