# Maths revision starters

## Purpose and scope

Create regular short starter activities for Level 2 college students retaking Foundation GCSE Maths. Refresh prior learning, practise weak arithmetic skills, and break common exam problems into useful steps. These are not lessons teaching each topic from scratch.

Start with three separate modules: **Lattice Multiplication**, **Bus Stop Division**, and **Application to Exam Problems** using those methods. Lattice multiplication supersedes the earlier request for the box method. Ratio is a requested later topic; other Foundation topics can follow.

The remaining requested areas are fraction arithmetic (+, −, ×, ÷), percentages, ratio, area and volume including missing lengths, speed/distance/time and Foundation problems, forming equations, solving equations, 2D enlargement/reflection/rotation/translation, and two distinct geometry topics: polygons (total interior angles, interior/exterior angles and parallelogram area), and Pythagoras’ theorem. Pythagoras must include problems after the method introduction. Ratio must include application problems as well as core ratio calculations. See `content/TOPIC_PLAN.md` for proposed module splits. FDP equivalence and best buys are optional supporting drafts, not substitutes for the requested topics.

`initial_chat2.html` records the discussion. Follow the user's refinements, not every Gemini suggestion or its rejected AGENTS.md drafts. `initial_draft_GCSE_Maths_Resit_Starter_Grid.pptx` is an existing 21-slide first draft, not the final specification.

## Module structure

Each skill gets a seven-slide set:

1. **Worked demo:** one full question at the top of each challenge column; subsequent rows show every essential step and its worked result.
2. **Two step-by-step practice slides:** new questions, the same row structure, and short prompts. Students do the work.
3. **Four independent practice slides:** three columns, each containing at least six full questions. No decomposed step rows. Provide varied practice, not repeated questions.

Use a consistent grid: three challenge columns labelled **Thread 1: Guided**, **Thread 2: Core**, **Thread 3: Depth**. On demo and step-by-step slides, each row represents one meaningful step; keep the whole question visible above it. Do not spread one question's steps over separate slides. Students record working in booklets or a webapp.

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

Use clear, unambiguous questions. Difficulty should come from the maths, not confusing language. Mix multiplication and division in application practice so students must choose.

## Working rules

- Develop new content in `content/` Markdown files before adding it to PowerPoint. Include the exact questions, row labels, prompts, worked steps, diagram descriptions and teacher answers. Mark drafts clearly. Only add a module to PowerPoint after the user agrees its content; record what was agreed.
- Treat the existing multiplication, division and application content as accepted. Preserve the added initial assessment. The current `build_starters.py` rebuilds only the original 21 slides, and `add_initial_assessment.py` adds another assessment each time it runs; do not run them blindly against the current deck.
- Call a spade a spade. No synonym rotation, inflated terminology, marketing language, or decorative filler. Keep labels stable; change wording when it fixes an error, not for variety.
- Include clear, editable diagrams in worked demos; the user can replace them. Keep answer digits and carries consistently positioned. Do not substitute confusing ASCII diagrams.
- Check calculations, intermediate steps, carries, units, remainder interpretation, and actual differences in challenge. Check projected readability and text fit when producing slides.
- Deliver complete requested files. Diagram placeholders are intentional; missing questions or “repeat this for the remaining slides” are unfinished work. Only claim a file is generated when it exists.
- Use judgement for implementation and new question content. Preserve these teaching decisions without turning every incidental Gemini suggestion into a requirement.
