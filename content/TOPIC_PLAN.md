> Current production requirement (30 September 2026): deliver questions as PowerPoint and separate answers as HTML, using stable filenames without `_vN`. Maintain all built topics individually under `topics/` and compile matching main files. Topic order and IA → recap/demo → scaffolded practice → SE → independent practice follow AGENTS.md and SLIDE_LAYOUT.md. Older slide-based answer layout notes below are historical; retain their answer/method/error/check content in HTML. Current outputs and build instructions are in HANDOFF.md.

# Topic plan

**Status: Draft — based on the user's topic list and subsequent refinements. Topic scope is confirmed; module splits and detailed examples below remain proposed for review.**

This is the scope and teaching-sequence plan. Listing a topic does not approve its exact content. Maintain complete Markdown content and normally agree it before slide production; when the user requests PowerPoint review, build a review draft directly. Each topic begins with the four-question assessment, followed by a rules recap where needed and its seven core teaching/practice slides. Keep answers separate.

## Aim and priorities

Maximise the chance of grade 4+ for students currently mostly at grades 2–3. Build arithmetic accuracy and confidence, then algebra and choosing steps in Foundation exam-style problems. Use the available starter time and possible pre-exam lessons; do not build computing-themed content. Depth should extend reasoning and independence while remaining relevant to Foundation preparation. Existing accepted arithmetic content is retained.

The user requires a logical sequence in which foundations precede topics that use them. Follow the sequence below when teaching and consolidating decks. Existing module IDs remain stable references; earlier production of ratio does not put ratio first. A complete draft is not automatically accepted content.

All topics’ answers must be collected in one separate HTML answer file. Preserve the existing M01–M03 questions and develop only their answer slides. All practice slides need matching student answers with short method notes and specific wrong-answer examples: see [ANSWER_SLIDES.md](ANSWER_SLIDES.md). Check older drafts for complete visible diagnostic notes before slide production; ratio and signed addition/subtraction already have separate HTML answer files.

## Accepted content

- Lattice multiplication — done.
- Bus stop division — done.
- One- and two-step problems using multiplication and division — done.
- Preserve the initial assessment already added to the deck.

## Required areas

| User's area | Proposed module sets | Current Markdown state |
| --- | --- | --- |
| Signed-number arithmetic | Addition/subtraction; multiplication/division and order of operations | Full new drafts: [M13](M13_signed_addition_and_subtraction.md), [M14](M14_signed_multiplication_division_and_order.md), including separate answer slides. |
| Fraction arithmetic: +, −, ×, ÷ | Addition and subtraction; multiplication; division | Planned below; full question banks not yet drafted. |
| Percentages | Amounts and percentage change; reverse percentages | Full drafts: [M06](M06_percentages_of_amounts_and_percentage_change.md), [M07](M07_reverse_percentages.md). |
| Ratio | Mix totals, known amounts and differences within columns; vary what must be found; then a separate set of ratio problems | Full draft of core work: [M04](M04_ratio.md). Application set planned below. |
| Area and volume, including missing lengths | Area calculations; volume calculations; missing lengths from area/volume | Full draft for missing lengths: [M08](M08_missing_lengths_from_area_and_volume.md). Forward calculations planned below. |
| Speed, distance and time, including Foundation problems | Select the calculation; convert time units; whole-journey problems | Full draft: [M12](M12_speed_distance_and_time.md). |
| Forming equations | Define an unknown; form an equation from words or geometry; solve and interpret | Full draft: [M11](M11_forming_and_solving_equations.md). |
| Solving equations | One step; two steps; brackets and unknowns on both sides | Built for review: [M10](M10_solving_equations.md). |
| Scaling, mirroring, rotating and translating 2D shapes | Enlargement; reflection; rotation; translation — a separate set for each | Planned below; diagrams and full question banks not yet drafted. |
| Polygons, angles and parallelogram area | Polygon angle totals; interior/exterior angles; parallelogram area | Scope confirmed by the user; detailed planning below. |
| Pythagoras’ theorem | Introduce the method, then apply it to problems | Separate topic confirmed by the user; detailed planning below. |

FDP equivalence ([M05](M05_fractions_decimals_and_percentages.md)) and best buys ([M09](M09_best_buys_and_unit_costs.md)) were drafted from the earlier discussion. They are **optional supporting modules**, not additions to this required list unless requested.

## Fraction arithmetic

Keep the questions numerical while practising the method. Do not turn these into word-problem modules. Include worked examples of zeros, simplification and mixed numbers where relevant; do not put a harder feature in the question banks without modelling it.

### Addition and subtraction

- **Start:** common denominators, e.g. 2/7 + 3/7 = 5/7.
- **Build:** different denominators, one a multiple of the other, e.g. 1/3 + 1/6 = 1/2.
- **Confidence:** unrelated denominators and mixed numbers, e.g. 1 1/3 − 3/4 = 7/12.
- **Proposed row labels:** Prepare the Fractions → Use a Common Denominator → Add or Subtract → Simplify the Answer.
- **Step detail:** convert mixed numbers to improper fractions when needed; find a common denominator; change numerators and denominators together; operate on numerators only; simplify and give a mixed number when the question requests it.
- **Diagram:** editable equal-length fraction strips, partitioned into the same-sized parts before combining or subtracting. Do not draw unequal wholes.
- **Practice banks:** each grid mixes addition and subtraction; increase denominator and mixed-number demand across columns. Keep Guided subtraction results non-negative.

### Multiplication of fractions

- **Start:** fraction × whole number, e.g. 1/3 × 6 = 2.
- **Build:** proper fraction × proper fraction, e.g. 3/4 × 2/5 = 3/10.
- **Confidence:** mixed numbers and simplification, e.g. 1 2/3 × 2 1/4 = 3 3/4.
- **Proposed row labels:** Write as Fractions → Simplify Before Multiplying → Multiply → Simplify the Answer.
- **Step detail:** whole numbers have denominator 1; convert mixed numbers; cancel common factors across numerator and denominator where useful; multiply numerators and denominators; check the final form. Cancellation is division by a common factor, not deleting matching digits.
- **Diagram:** an editable rectangle can show 3/4 of 2/5 as 6 of 20 equal cells. Match the diagram precisely to the written product.
- **Practice banks:** include products below and above 1, with and without cancellation. Do not suggest multiplication always makes a number larger.

### Division of fractions

- **Start:** fraction ÷ whole number, e.g. 3/4 ÷ 3 = 1/4.
- **Build:** proper fraction ÷ proper fraction, e.g. 2/3 ÷ 4/5 = 5/6.
- **Confidence:** mixed numbers, e.g. 2 1/4 ÷ 1 1/2 = 1 1/2.
- **Proposed row labels:** Write as Fractions → Multiply by the Reciprocal → Multiply → Simplify the Answer.
- **Step detail:** convert mixed numbers first; leave the first fraction unchanged; replace division with multiplication by the reciprocal of the second fraction; simplify and multiply; check by multiplication.
- **Diagram:** show 3/4 divided into three equal shares for Guided. For a grouping example, show how many 1/4 lengths fit into 3/4. Explain that these are two interpretations of division.
- **Practice banks:** vary both fractions and include whole-number answers. Do not suggest division always makes a number smaller. Never use a zero divisor.

## Ratio and ratio problems

Use two sets so that practising the core ratio relationships is followed by applying them to varied situations.

### Core ratio work

[M04](M04_ratio.md) already contains complete drafts for sharing a total, finding an amount when another is known, and working from a difference. Its revised word questions mix contexts, units, givens and objectives within every column. The demo columns illustrate three approaches, not three fixed question types. This does not replace the application set below.

### Application to ratio problems

A separate seven-slide set: one full worked demo, two step-by-step practice slides, then four independent question grids.

- **Start:** straightforward recipe, mixture or sharing questions. Example: flour:sugar is 3:2; 300 g flour requires **200 g sugar**.
- **Build:** decide which ratio amount is represented and interpret the units or total. Example: juice:water is 1:4; making 2.5 litres requires **500 ml juice**. Map-scale example: 1:50,000 and 4 cm on the map represents **2 km**.
- **Confidence:** use a ratio calculation in a further decision or calculation. Example: blue:white paint is 2:3; a 15-litre mixture uses 6 litres blue at £8/L and 9 litres white at £5/L, costing **£93**. A change-of-ratio example: girls:boys is 3:2 in a class of 30; four boys join, making the new ratio **9:8**.
- **Row labels:** Keywords & Calculation → Written Method → Ballpark Check & Math → Final Answer. Practice prompts stay neutral; students choose the calculation(s).
- **Worked diagrams:** equal-part bars, labelled with the known total or amount; map problems give the scale explicitly. Use actual units in labels.
- **Independent banks:** include recipes/mixtures, sharing in context, scale/unit conversion, and cost or changed-quantity problems. Do not fill the whole set with the same A-and-B money question with different numbers.
- **Checks:** ratios follow the stated order; quantities use compatible units; count questions have whole-number answers; changed ratios are simplified. Additional people or ingredients change the relevant quantity, not both quantities automatically.

This application set is planned but does not yet have a complete question bank. Confirm its scope before writing its exact slide content.

## Area and volume

Separate calculating area/volume from working backwards to a length. The existing missing-length draft does not cover this whole area by itself.

### Area calculations

- **Start:** rectangles and squares, e.g. 8 cm × 5 cm gives 40 cm².
- **Build:** triangles and parallelograms with a clearly identified perpendicular height, e.g. triangle base 12 cm and height 7 cm gives 42 cm².
- **Confidence:** trapezia and compound rectilinear shapes, e.g. parallel sides 8 cm and 14 cm with perpendicular height 5 cm gives 55 cm².
- **Proposed row labels:** Identify the Shape & Dimensions → Write the Calculation → Calculate the Area → Check & State the Area.
- **Diagram:** editable shapes with all required dimensions, right-angle marks, and “Not to scale”. A sloping side must not look like the required perpendicular height. Compound diagrams must contain enough dimensions to work out every part.
- **Practice banks:** vary orientation as well as dimensions; include splitting and subtracting parts for compound area. Require square units.

### Volume calculations

- **Start:** cubes and cuboids, e.g. 4 cm × 3 cm × 5 cm gives 60 cm³.
- **Build:** right triangular prisms, e.g. triangular cross-section base 6 cm and perpendicular height 4 cm, prism length 10 cm, gives 120 cm³.
- **Confidence:** cylinders and compound cuboids, e.g. radius 3 cm and height 10 cm gives 90π cm³ (about 282.7 cm³ to 1 decimal place).
- **Proposed row labels:** Identify the Cross-section → Find the Cross-sectional Area → Calculate the Volume → Check & State the Volume.
- **Diagram:** distinguish perpendicular cross-section dimensions from prism length. For cylinders label radius or diameter explicitly, not an ambiguous line.
- **Practice banks:** include radius/diameter interpretation and simple unit consistency. Specify exact answers in terms of π or a rounding requirement. Calculator use is proposed for the cylinder questions.
- **Review point:** compound cuboids require splitting the solid; adapt the cross-section prompts where that is the actual work, rather than forcing an unsuitable instruction.

### Missing lengths

The complete M08 draft covers rectangles, triangles, parallelograms and cuboids, including mm/cm conversion. Keep this as a separate set. If missing prism lengths or cylinder dimensions are wanted, extend its scope explicitly before adding questions.

## 2D transformations

Use the standard mathematical names consistently: **enlargement (scaling)**, **reflection (mirroring)**, **rotation**, **translation**. Introduce each plain-language equivalent once. Do not rotate between names for variety afterwards.

Each module needs its own worked demo, two practice grids and four independent grids. Every independent question must supply the complete starting shape and transformation information. A coordinate list may supplement an editable diagram; it must not leave students guessing which shape to transform. Use equally scaled axes and a visible unit grid. Provide enough space for the image as well as the original shape.

### Enlargement

- **Start:** positive integer scale factor about the origin.
- **Build:** enlargement from a stated centre away from the origin.
- **Confidence:** fractional scale factors (reductions), or identify the centre and scale factor from two shapes. Negative scale factors are not assumed in this Foundation plan.
- **Example:** A(1,1), B(3,1), C(1,2), enlarged by scale factor 2 about (0,0), becomes A′(2,2), B′(6,2), C′(2,4).
- **Proposed row labels:** Mark the Centre & Scale Factor → Scale Each Vertex → Draw the Image → Check Corresponding Lengths.
- **Key check:** measure from the centre of enlargement, not necessarily from the origin. Use prime labels for the image.

### Reflection

- **Start:** horizontal and vertical mirror lines drawn on a grid.
- **Build:** lines x = a or y = b, including negative coordinates.
- **Confidence:** diagonal lines y = x and y = −x, or identify the mirror line.
- **Example:** reflecting A(1,1), B(3,1), C(1,2) in x = 0 gives A′(−1,1), B′(−3,1), C′(−1,2).
- **Proposed row labels:** Mark the Mirror Line → Reflect Each Vertex → Draw the Image → Check Perpendicular Distances.
- **Key check:** corresponding vertices lie equal perpendicular distances from the mirror line. A vertex on the line stays fixed.

### Rotation

- **Start:** quarter- and half-turns about a marked grid point, with direction stated for quarter-turns.
- **Build:** 90°/180° rotations about a stated centre, including centres away from the origin.
- **Confidence:** describe a rotation completely or perform a less familiar orientation such as 270° clockwise, with centre and direction explicit.
- **Example:** A(1,1), B(3,1), C(1,2), rotated 90° anticlockwise about (0,0), becomes A′(−1,1), B′(−1,3), C′(−2,1).
- **Proposed row labels:** Mark the Centre, Angle & Direction → Rotate Each Vertex → Draw the Image → Check Distances & Turn.
- **Key check:** a complete description needs centre, angle and direction (direction is unnecessary for 180°). Use an asymmetric shape so a rotation can be identified without ambiguity.

### Translation

- **Start:** stated horizontal and vertical moves.
- **Build:** positive and negative column vectors.
- **Confidence:** infer the vector from corresponding shapes, or combine two translations.
- **Example:** translating A(1,1), B(3,1), C(1,2) by 4 left and 2 up gives A′(−3,3), B′(−1,3), C′(−3,4).
- **Proposed row labels:** Read the Translation → Move Each Vertex → Draw the Image → Check the Movement.
- **Key check:** every vertex moves the same amount; shape size and orientation stay the same. Draw vectors as proper two-entry columns on slides; in Markdown label horizontal and vertical components explicitly.

### Transformation layout requirement

Six diagram questions in each of three projected columns can become unreadable. Before approving those question banks, choose a concrete format: concise vertex coordinates plus transformation instructions on the slide, with matching response grids in the booklet/webapp; or a legible diagram arrangement that genuinely fits. Do not silently reduce the six-question requirement or use tiny grids. The worked demos must still contain clear diagrams.

## Polygons, angles and parallelogram area

This is distinct from Pythagoras. The user confirmed the scope: total interior angles of polygons, interior and exterior angles, and area of parallelograms.

### Polygon angles

- **Start:** total interior angle sums, initially triangles and quadrilaterals, then other polygons. Example: a pentagon has (5 − 2) × 180° = **540°** in total.
- **Build:** individual interior and exterior angles of a regular polygon. Example: a regular hexagon has exterior angle 360° ÷ 6 = **60°**, and interior angle **120°**.
- **Confidence:** work backwards to the number of sides or combine angle facts. Example: a regular polygon with exterior angle 24° has **15 sides**. Its interior angle is **156°**.
- **Proposed row labels:** Identify the Angle Fact → Write the Calculation → Find the Missing Value → State the Answer & Reason.
- **Essential distinctions:** (n − 2) × 180° gives the interior-angle **total**; divide by n for an individual angle only when the polygon is regular. One exterior angle at each vertex totals 360° for the convex polygons used here. An interior angle and its adjacent exterior angle sum to 180°.
- **Diagram:** draw and label an exterior angle on an extended side. Mark regular polygons as regular; do not assume regularity from appearance. Use convex polygons and diagrams marked “Not to scale”.
- **Practice banks:** distinguish a total from an individual angle, include an unknown angle of an irregular polygon, and require reasons as well as numerical answers. Do not imply that all angles of an irregular polygon are equal.

### Parallelogram area

- Teach area = base × **perpendicular** height. A sloping side is not the height unless it is perpendicular to the chosen base.
- Example: base 9 cm and perpendicular height 4 cm give **36 cm²**; a labelled sloping side of 5 cm does not change this calculation.
- Cover forward calculations in the proposed **Area calculations** set and missing base/height in **M08**. This keeps area practice together rather than putting an unrelated area question into an angle-solving column.
- Include editable diagrams with dashed heights and right-angle marks, including a height drawn outside the shape.

## Pythagoras’ theorem

A separate topic. Introduce the theorem and method first, then include Foundation GCSE problems that use it.

- **Start:** find the hypotenuse, e.g. legs 6 cm and 8 cm give **10 cm**.
- **Build:** find a shorter side, e.g. hypotenuse 13 cm and one leg 5 cm give **12 cm**.
- **Confidence:** find a length and use it in a problem, e.g. a right triangle with hypotenuse 10 cm and one leg 8 cm has another leg of **6 cm** and area **24 cm²**.
- **Proposed row labels for the method introduction:** Identify the Hypotenuse → Write the Equation → Calculate the Missing Length → Check & Answer the Question.
- **Step detail:** identify the right angle; identify the opposite side as the hypotenuse; use a² + b² = c²; subtract when finding a shorter side; take the square root; complete any further calculation required.
- **Diagram:** right-angle marker and clear side labels on every relevant triangle. Vary orientation so the hypotenuse is not always in the same position. State any geometric assumptions needed by a word problem.

### Seven-slide progression

1. Full worked demo across the three columns. The Depth demo shows a length used in a simple area calculation.
2. Step-by-step practice: identify the hypotenuse, form the equation and find the required side.
3. Step-by-step practice: a further set including a diagram embedded in a short problem.
4. Independent grid: direct missing-side questions, to secure the method.
5. Independent grid: context problems such as ladders against vertical walls, rectangular diagonals and shortest straight-line routes.
6. Independent grid: mixed missing-side problems with units and explicit rounding where needed.
7. Independent grid: further applications, including using the calculated side in area, perimeter or a length comparison. Every column still has six complete questions.

For example, a 5 m ladder has its foot 3 m from a vertical wall on horizontal ground: its top reaches **4 m**. A rectangle with diagonal 17 cm and width 8 cm has length **15 cm** and area **120 cm²**. The detailed banks must include this kind of application after the introduction, not just bare triangles throughout.

Use integer triples initially and some non-integer results later. Propose calculator use for non-integer lengths, state the rounding requirement, and keep unrounded values for a subsequent area calculation. Check that the hypotenuse is longest. Pythagoras finds side lengths in right-angled triangles; it does not find unknown angles. Trigonometry is not included.

## Teaching sequence — priority and prerequisites (1 October 2026)

Prioritise secure methods that recur across Foundation questions and open access to later topics. This is a teaching judgement for this grade-2/3 retake group, not a measured national ranking of its biggest weaknesses. Use the initial assessments to adjust time and revisit gaps. Do not delay equations and percentages until every number topic is complete; provide short prerequisite recaps where needed.

**M10 solving equations and M15 fraction addition/subtraction are built for review and integrated. Next implementation: M06 percentages of amounts and percentage change.** M15 is a new stable ID for the already-planned fraction set, not a new scope addition. Fraction multiplication and division remain separate later sets.

| Order | Topic | Priority and rationale |
| --- | --- | --- |
| 1 | M01 written multiplication | Built; retrieve essential facts/place value as needed. |
| 2 | M02 written division | Built; supports fractions, percentages and inverse operations. |
| 3 | M13 signed addition/subtraction | Built; supports rearranging equations and negative answers. |
| 4 | M10 solving equations | Built: balanced operations, one/two steps, then brackets and both sides. Short signed-division recap supports negative solutions. |
| 5 | M15 fraction addition/subtraction | Built: equivalence, common denominators, simplification, then mixed numbers. |
| 6 | M06 percentages of amounts and percentage change | Next priority: basic percentages, original amount, increase/decrease; recap fraction/decimal equivalence in this topic. |
| 7 | M03 multiplication/division problems | Built; revisit choosing operations and interpreting remainders. |
| 8 | M04 core ratio | Built; equal parts, known totals/amounts/differences. |
| 9 | Fraction multiplication | Secure fraction structure and cancellation, including fractions of amounts. |
| 10 | Fraction division | Follow multiplication with reciprocal reasoning and mixed numbers. |
| 11 | M11 forming and solving equations | Apply the equation method to clear word and geometry problems. |
| 12 | Ratio applications | Recipes, mixtures, scales, costs and changed ratios. |
| 13 | Area calculations | Rectangles, triangles, parallelograms, trapezia and compound shapes. |
| 14 | Polygons and angles | Straight-line/full-turn/triangle facts, then polygon angles. |
| 15 | M14 signed multiplication/division and order | Consolidate the earlier short sign recaps into a full varied set. Bring forward if assessments show a gap. |
| 16 | Volume calculations | Follow area and units. |
| 17 | M08 missing lengths from area/volume | Connect equations to geometry; follow direct calculations. |
| 18 | M12 speed, distance and time | Connected arithmetic plus time/unit conversions. |
| 19 | M07 reverse percentages | Follow confidence with ordinary percentage change and inverse reasoning. |
| 20 | Translation → reflection → rotation → enlargement | Four separate sets; use coordinates, angle facts and scaling. |
| 21 | Pythagoras and applications | Squares, roots, right triangles and choice of length. |

Keep earlier topics alive through retrieval rather than treating this as a rigid once-through course. This order governs the main deck; omit unbuilt sets and preserve each topic's internal sequence. Optional M05 FDP equivalence and M09 best buys remain supporting resources, not required extra modules.

### Evidence informing the priority

- [AQA June 2023 Foundation Paper 1 examiner report](https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-83001F-WRE-JUN23.PDF), Q8–12, Q22, Q24–25: errors with negative substitution, FDP equivalence, percentage increase, signs in expansion, forming equations and mixed-number work. Performance varies by question; this does not establish a retaker-only ranking.
- [AQA Foundation assessment objectives](https://www.aqa.org.uk/subjects/mathematics/gcse/mathematics-8300/specification/scheme-of-assessment): approximately 50% standard techniques, 25% reasoning and 25% problem solving. Keep written methods, error evaluation and interpretation together.
- [AQA question-level analysis guidance](https://www.aqa.org.uk/discover-qlapd-maths): question performance data can support later adjustment alongside this group's actual assessment responses.

The exam board remains unspecified. These sources inform common teaching priorities; the resources do not adopt AQA-specific paper assumptions.

## Final compiled PowerPoints

Once all individual topic decks are finalised, include them in the single compiled question PowerPoint in the teaching sequence above. This order is required for compilation, not merely a suggested lesson order. Preserve each topic's assessment as its first slide, followed by its finalised internal slide sequence. Use the same topic order in the separate compiled HTML answer file, with matching stable references. Module IDs, filenames and dates of completion do not determine inclusion order. Include optional topics only if agreed, placing them according to their prerequisites.

## Development and review

The existing accepted M01–M03 questions are retained. Ratio was developed first at the user's request and now has question/HTML answer files with its own assessment. Signed addition/subtraction has accepted questions, a clearer rules recap and corrected number-line labels; see the topic READMEs for current files.

The revised build priority is M10 solving equations, M15 fraction addition/subtraction, then M06 percentages; use the dated sequence above. Development may reuse completed modules without rebuilding them merely to change teaching order. Keep topic decks separate during review; consolidate later in the sequence above, preserving assessments, stable references and user edits. Review may take place in Markdown or directly in PowerPoint as requested.
