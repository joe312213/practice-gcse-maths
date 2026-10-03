# Maths revision starters

## Purpose

Maximise students' chances of achieving grade 4+ in Foundation GCSE Maths. Most currently work at grades 2–3, with weak arithmetic, algebra, problem-solving skills and confidence. Use short regular starters and occasional pre-exam revision sessions to refresh learning and build accurate, independent work. These are not full lessons teaching every topic from scratch.

Computing lessons provide the time, not the subject matter. Use Foundation exam-style calculations and everyday problems. Difficulty should come from useful mathematical thinking, not confusing language or unnecessarily large numbers. The exam board is unspecified; do not assume its paper numbering or calculator arrangements.

Teach in prerequisite order: secure essential arithmetic, then prioritise equations, fraction addition/subtraction and percentages, with later applications and geometry building on those skills. Use short prerequisite recaps rather than delaying high-priority topics until every arithmetic module is built. Follow the sequence in the topic plan; module IDs and deck creation dates do not determine teaching order. Use assessments to identify missing foundations and revisit earlier skills in later starters.

For session status, current outputs and the next unfinished topic, read [HANDOFF.md](HANDOFF.md).

## Website delivery and current work

The user authorised website planning and initial conversion on 2 October 2026. [web_format.md](web_format.md) is the product specification and supersedes slide-specific delivery/layout rules. [docs/WEBSITE_PLAN.md](docs/WEBSITE_PLAN.md) records phases, implementation interpretations and checks; [docs/REFERENCE_REVIEW.md](docs/REFERENCE_REVIEW.md) records the separate T-Level code review. Earlier WEB_FORMAT_REVIEW.md findings are historical, not new approval gates.

- Maintain the website under `website/`. Current PowerPoints and standalone HTML are preserved teaching references; do not regenerate or maintain slide exports unless requested.
- Preserve existing questions, assessments, accepted methods and manual edits. Reconcile saved decks with source before importing; never assume an older generator reproduces current content. Keep permanent subject/topic/activity/column/question IDs, even as delivery changes.
- Keep exact authored content in `content/`; build website banks deterministically. M10 imports through `scripts/prepare_web_equations.py`. Update question, answer, full working, check and diagnostic notes together. Generation does not imply user acceptance.
- Preserve initial assessment → recap/demo → scaffolded practice → error spotting → independent practice as the topic learning path. A Practice set is a separate sequence of up to three activity pages. Adaptive independent pages serve one chosen level at a time; original three-column counts/arrow placements are not website layout requirements.
- Keep assessment free of hints/reference panels. Show complete written error methods without corrections before submission. Demos retain their full question, balanced steps and static fallback. Use the exact labels Start, Build, Confidence.
- Store progress by local username, subject, topic, page type and actual challenge level. Keep outcomes and assistance metadata, not only displayed percentages. Scoring transitions belong in a testable module, separate from UI and content.
- Apply the reviewed equation UI requirements in [the 3 October dev log](docs/dev-log/2026-10-03-equations-feedback.md): 210px minimum in two-column question selectors, no routine per-question level labels, stable selection geometry, level-specific guidance and annotated playback, session-only collapsible paper mode, and explicit per-error row/reason/correction metadata. Use the shared T-Level theme tokens and controls with Maths storage keys.
- Write reusable, modular, clean, minimal and meaningfully commented CSS and JavaScript. Follow the maintainability rules in [docs/UI_UX_RULES.md](docs/UI_UX_RULES.md): reuse shared components, keep responsibilities clear, prefer readable formatting over dense one-liners, and document non-obvious decisions. Apply these rules to fixes and new features alike.
- Framework migration must retain the current layout/design closely and match existing theme colours and gradients exactly. Use baseline visual/computed-style comparisons; do not substitute framework default palettes or silently redesign components. See the migration plan for verification and handling accessibility conflicts.
- Use shared website CSS tokens/components, accessible native controls and responsive layouts. Mathematical meaning must not depend on colour, pointer input or animation. Support keyboard/typed working alongside touch drawing.
- Read [TOPIC_PLAN.md](content/TOPIC_PLAN.md), [TEACHING_SPECIFICATIONS.md](content/TEACHING_SPECIFICATIONS.md), topic source and relevant answer/diagram specifications when working on that content. Their mathematical/teaching requirements remain; older PowerPoint geometry, HTML publication and animation timing requirements apply only to legacy exports. Preserve deterministic method-rendering and legibility principles.
- Latest user decisions take precedence. `initial_chat2.html`, `old_agents.md` and dated slide history are context, not active delivery instructions.

Read and maintain [docs/UI_UX_RULES.md](docs/UI_UX_RULES.md) as the standing UI/UX requirements for every website change. It includes startup resilience, profile readiness, automatic advancement after correct answers and the 3 October feedback. Do not treat completed feedback as disposable implementation notes.

The framework migration is planned in [docs/FRAMEWORK_MIGRATION_PLAN.md](docs/FRAMEWORK_MIGRATION_PLAN.md): SvelteKit static output, Tailwind/daisyUI semantic class composition and Bits UI interaction primitives. As of 3 October, planning is complete and implementation has not begun; the latest user instruction authorises documentation only. Follow the migration plan when implementation is subsequently requested.

## Question quality and variety

- Differentiate the thinking, not just the numbers. Start is accessible; Build and Confidence add interpretation or connected steps. Some overlap and spaced repetition are useful. Model harder features before expecting independent use.
- Vary question types, givens, objectives, contexts and relevant units **within each column**, across each slide and across the module. Arithmetic-only sets instead vary operations, signs, numerical relationships and result types.
- Do not let row position, repeated wording or column membership give away the method or answer. Worked-demo columns illustrate approaches; they do not assign one question type to every later question in that column.
- Changing names or scaling the same numbers is insufficient variety. Deliberate reversal and repetition can teach useful distinctions, but must sit alongside different relationships and objectives. Avoid repetitive clusters without introducing awkward numbers merely to meet a count.
- Review the correct and deliberately incorrect final answers as a set, not only the question wording. Avoid repeated results, clusters, simple sequences and position/sign cues that let students guess from memory. For SE slides, aim for distinct final results across all nine correct and nine incorrect answers; also inspect repetition across topics. Normalise currency/units when comparing. Keep numbers accessible rather than forcing global uniqueness. Update `correct_result` and `incorrect_result` with the full working and answer explanations; `scripts/review_answer_patterns.py` inventories these during the build.
- Review question banks as sets. Automated counts support, but do not replace, a teaching review. Apply the detailed ratio checks in the teaching specifications when relevant.
- For error-spotting contexts, name the objects and the quantity requested; state equal cost-sharing and capacity assumptions explicitly. Use plausible situations that do not require students to invent a reason for the numbers. Keep the difficulty in the intended mathematical error, not the wording. See `content/SPOT_ERRORS_REVIEW.md` for the full question review.
- Carry corrections into later modules. Keep language friendly and unambiguous; preserve meaningful challenge without unmodelled prerequisites or excessive reading.

## Answers and feedback

Mark each question on submission. Keep full correct working, Answer, Method, If you got… and Check available as appropriate after submission. Explain a possible first mistake rather than diagnosing from a final answer alone. Use easy mental ballpark checks for arithmetic and meaningful substitution/context checks where useful. Never substitute prose instructions for a required worked diagram. Preserve assessment, diagram and diagnostic content during conversion.

## Production and checks

- Check changed mathematics, intermediate steps, signs, carries, units, remainder interpretation and deliberate errors. Check content counts and stable IDs against preserved source.
- Validate adaptive rules, first-attempt scoring, assistance, profile isolation and persistence with meaningful tests. Match visual checks to changed layouts; cover mobile, keyboard and reduced motion. Do not claim browser behaviour verified from unit tests alone.
- Use `node --test tests/*.test.mjs` for website logic tests and the documented browser smoke command for interaction checks. `python3 scripts/prepare_web_equations.py` requires python-pptx; the known local interpreter is `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3`.
- Use Git commits for history. Do not create `_prevN`, `_vN` or other output backup stacks. Preserve current resources; do not run legacy publishers during website work.
- Record implemented behaviour, limitations and the next action in HANDOFF.md. Keep website build/run instructions beside the website. Do not publish/deploy as a side effect of local checks.
- Call a spade a spade: no inflated terminology, decorative filler or unnecessary permission requests. Use judgement for routine implementation while preserving teaching decisions.
