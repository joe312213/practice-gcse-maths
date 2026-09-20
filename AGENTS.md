# Maths revision starters

## Purpose

Maximise students' chances of achieving grade 4+ in Foundation GCSE Maths. Most currently work at grades 2–3, with weak arithmetic, algebra, problem-solving skills and confidence. Use short regular starters and occasional pre-exam revision sessions to refresh learning and build accurate, independent work. These are not full lessons teaching every topic from scratch.

Computing lessons provide the time, not the subject matter. Use Foundation exam-style calculations and everyday problems. Difficulty should come from useful mathematical thinking, not confusing language or unnecessarily large numbers. The exam board is unspecified; do not assume its paper numbering or calculator arrangements.

Teach in prerequisite order: secure arithmetic first, then fractions and proportional reasoning, then algebra and applications, with geometry building on those skills. Follow the sequence in the topic plan; module IDs and deck creation dates do not determine teaching order. Use assessments to identify missing foundations and revisit earlier skills in later starters.

For session status, current outputs and the next unfinished topic, read [HANDOFF.md](HANDOFF.md).

## Content and review workflow

- Maintain exact content in `content/`: questions, row labels, prompts, worked steps, diagram specifications, answers and visible method/error/check notes. Keep it in step with the slides.
- Normally review Markdown before building. If the user requests PowerPoint for easier review, build the review draft without another approval gate. Distinguish draft content from accepted content; generating a deck does not imply acceptance.
- Develop separate question and answer decks per topic. Once the individual topics are finalised, compile them into one question PowerPoint in the agreed teaching sequence in `content/TOPIC_PLAN.md`. Use the same topic order in the separate shared answer PowerPoint. Compilation order follows that sequence, not module IDs, filenames or completion dates. Keep each topic's assessment first and preserve its internal slide order.
- Preserve accepted questions, assessments and manual slide edits. Do not regenerate a saved deck from older source without accounting for those edits. When changing a question, update its working, answer, diagrams and diagnostic notes together.
- Keep stable module/slide/thread/question references when inserting assessment or recap slides. Record current versions and review status in the topic README, not this file.

Read the relevant linked specifications before working on their content; they remain requirements:

- [Topic plan](content/TOPIC_PLAN.md): requested scope and proposed module splits. Module IDs do not prescribe teaching order. FDP equivalence and best buys are optional supporting topics.
- [Teaching specifications](content/TEACHING_SPECIFICATIONS.md): exact lattice/division methods, application row labels and challenge, and ratio variety requirements. Read alongside the relevant module Markdown.
- [Slide layout](content/SLIDE_LAYOUT.md): diagram alignment and approved progression arrows; exact arrow offsets are in [progression_arrow.json](content/progression_arrow.json).
- [Answer format](content/ANSWER_SLIDES.md) and [answer index](content/answers/README.md): student answer content and consolidation.

Latest user decisions take precedence over older drafts or notes. `initial_chat2.html` is historical context, not a requirement to adopt rejected Gemini suggestions. `old_agents.md` is an archive, not the active instruction file.

## Topic slide structure

1. **Initial assessment, always physical slide 1:** four fresh questions—two Guided level, one Core and one Depth. No hints, worked steps or method diagrams. Answers belong in the separate answer deck.
2. **Rules recap where needed:** clearly state the relevant rules with short examples. Give it a separate slide if combining it with the demo would impair readability. For signed arithmetic, distinguish operation signs from number signs; do not apply multiplication sign shortcuts to addition/subtraction.
3. **Worked demo:** one full question at the top of each challenge column, followed by every essential step and its result. Include clear editable diagrams where useful.
4. **Two step-by-step practice slides:** new questions with the same meaningful step rows and short prompts. Students do the work.
5. **Four independent practice slides:** at least six full questions per column; no decomposed step rows.

Use the exact headings **Thread 1: Guided**, **Thread 2: Core**, **Thread 3: Depth** on challenge grids. Keep the whole question visible above its steps. Students record working in booklets or a webapp. Use the approved arrow alone beneath the first two practice columns to encourage progression.

Arithmetic method practice stays numerical. Application practice uses clear Foundation exam problems and neutral prompts that leave students to choose the operations. Retain agreed row labels; do not rotate synonyms for variety.

## Question quality and variety

- Differentiate the thinking, not just the numbers. Guided is accessible; Core and Depth add interpretation or connected steps. Some overlap and spaced repetition are useful. Model harder features before expecting independent use.
- Vary question types, givens, objectives, contexts and relevant units **within each column**, across each slide and across the module. Arithmetic-only sets instead vary operations, signs, numerical relationships and result types.
- Do not let row position, repeated wording or column membership give away the method or answer. Worked-demo columns illustrate approaches; they do not assign one question type to every later question in that column.
- Changing names or scaling the same numbers is insufficient variety. Deliberate reversal and repetition can teach useful distinctions, but must sit alongside different relationships and objectives. Avoid repetitive clusters without introducing awkward numbers merely to meet a count.
- Review question banks as sets. Automated counts support, but do not replace, a teaching review. Apply the detailed ratio checks in the teaching specifications when relevant.
- Carry corrections into later modules. Keep language friendly and unambiguous; preserve meaningful challenge without unmodelled prerequisites or excessive reading.

## Separate student answers

Keep assessment and practice answers out of the question deck; worked demos remain worked. Match answers to the source thread and question numbers. Show all answers, with paired quantities clearly labelled.

Use **Answer**, **Method**, **If you got…**, and **Check**. Give short method notes and selected wrong-answer examples on readable separate pages when needed. Vary the questions discussed rather than always selecting Q1. Each error example must show an actual incorrect calculation, its result, the correction and a useful check. Describe a possible mistake, not a diagnosis proved by the answer. Help students locate their first wrong step.

Speaker notes and teacher keys do not replace visible student answer slides. Keep all topics' answers separate when consolidating.

## Production and checks

- Check new or changed mathematics: answers, intermediate steps, signs, carries, units, ratio order, remainder interpretation and wrong-answer examples. Confirm all requested questions and answers are present.
- Check projected readability, text fit and diagram accuracy. Never shrink text or remove questions to hide a layout problem. Number-line digits must be centred beneath ticks, with minus signs extending left; follow the layout specification.
- Match verification to the change. New content needs mathematical and teaching checks; a small visual fix needs a focused visual check and preservation of unrelated content, not a full audit. Update the generator as well as the output so fixes survive regeneration.
- Save new versions and preserve user edits. `scripts/build_starters.py` rebuilds only the original 21 slides and would lose the added assessment; `scripts/add_initial_assessment.py` adds another assessment on every run. Do not run either blindly against the current deck.
- Deliver complete, readable files and link the current outputs. Only claim a file is generated when it exists. Intentional diagram placeholders do not excuse missing questions or unfinished slides.
- Call a spade a spade: no inflated terminology, decorative filler or unnecessary permission requests. Use judgement for routine implementation while preserving the teaching decisions.
