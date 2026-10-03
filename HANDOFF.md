# Migration underway — 3 October 2026

The user has authorised implementation. The earlier planning-only stop below is historical. Replace implementation workarounds while preserving intended appearance; in particular, use real divider gaps around equals signs.

# Framework migration planning checkpoint — 3 October 2026

**Planning complete; stop here.** The latest user request is to complete documentation only. No framework packages, application changes, hooks, builds, commits or deployments were performed in this planning phase.

**Additional visual constraint:** retain the current layout/design closely and match theme colours/gradients exactly throughout migration. Capture reproducible visual/computed-style baselines before replacing UI and compare each stage. Framework defaults must not alter the appearance; resolve any accessibility conflict with the user before changing the baseline.

Read [docs/FRAMEWORK_MIGRATION_PLAN.md](docs/FRAMEWORK_MIGRATION_PLAN.md) for the complete implementation handoff: selected stack, responsibility boundaries, semantic CSS composition, Bits UI/accessibility matrix, static/live-dev build workflow, saved-data protection, migration phases, acceptance checks and bounded open details. This supersedes earlier tentative framework recommendations and the immediate resume instructions below.

Selected direction: SvelteKit with static adapter and Vite; Tailwind/daisyUI with recurring utilities composed into semantic classes; Bits UI for applicable interactions; reusable activities backed by framework-independent learning logic and injectable storage. Existing themes/content/behaviour remain the baseline. The user has confirmed themes work.

Current baseline observed: `e4eb519`. The earlier implementation/feedback is now committed there; older statements below that all feedback work is uncommitted are historical. This planning phase leaves documentation edits uncommitted and preserves pre-existing UI-rule/dev-log edits. The application is still the plain ES-module prototype; existing run commands apply.

Next action, **only when implementation is requested**: phase 0 of the migration plan—inspect current changes and intended host stack if available, capture regression/storage/content baselines and select compatible package versions. Do not install dependencies or begin refactoring merely because the plan is complete. Open implementation checks concern host versions/base path, theme contrast across adjustments and manual device/screen-reader coverage; they do not block completion of this plan.

---

# Equation feedback update — 3 October 2026

The user reviewed the first equations draft and authorised six groups of changes. They are implemented and checked locally; review of the revised draft is still pending. This section supersedes the 2 October “review deferred” status and affected prototype descriptions below.

Detailed dated feedback, implementation decisions and checks: [docs/dev-log/2026-10-03-equations-feedback.md](docs/dev-log/2026-10-03-equations-feedback.md).

- Assessment clutter/repeat card removed; selectors use stable borders, no routine level labels and a 210px two-column minimum.
- Level-specific guidance and annotated Play/Pause/Replay demonstrations; secondary Previous/Next/End controls. Common-factor recap examples are playable.
- Paper mode collapses/restores working tools and starts unchecked in new sessions/attempts. Drafts survive collapse/reference use; changing the selected question still clears unsubmitted work.
- Error spotting now marks row, reason and corrected step for each error, plus final answer. Separate row-number gutter; explicit authored errors replace faulty solution-route comparison. Added one new two-error Confidence example: 95 total items, original 94 preserved.
- T-Level theme system reused (eight palettes and adjustments); smaller Not you control; footer About page with author, credits and agent-augmented development information.
- **19 Node tests and updated browser smoke passed.** Browser measurements confirm stable unsubmitted-question card/answer positioning and 210px two-column selector widths; desktop/mobile/theme/playback/error/paper behaviours checked. Original teaching outputs remain unchanged.

## Follow-up fixes — 3 October 2026

Refresh/name startup failure fixed: optional theme setup can no longer block profile/equation startup, and name selection waits for readiness. Reproduced the original pair of symptoms with incomplete theme markup; cached-refresh/fault/delay regressions now pass without clearing saved progress. Progress copy is now “recent success at this level”.

Correct submissions now advance to the next unanswered question (wrap/skip submitted), with correctness announcement and focus; incorrect submissions and completed pages stay put. Full browser checks include this behaviour. All 19 logic tests pass.

**Standing requirements:** [docs/UI_UX_RULES.md](docs/UI_UX_RULES.md), linked from AGENTS.md and web_format.md, persists the complete user feedback for future work. Startup regression: `node scripts/browser-startup.mjs`, using the same isolated Chrome/preview setup as the main smoke script.

The user also requires reusable, modular, clean, minimal and commented CSS/JavaScript. This is now explicit in AGENTS.md, web_format.md and the standing rules. Apply it to every subsequent fix/feature and improve affected code as it is touched; this documentation update does not claim a completed codebase refactor.

## Maintainability and theme follow-up

A focused refactor is warranted: readable formatting/comments first, then extract working-area and activity UI responsibilities from app.mjs, share duplicated escape/theme-preference logic, and consolidate CSS sections/overrides. Existing engine/profile boundaries are useful. Refactor not yet performed; see the dated dev log for assessment.

Theme selection now has rendered-colour and real-pointer checks in `scripts/browser-theme.mjs` (passed for all eight themes and refresh). Reported failure was not reproduced in isolated Chrome. Versioned CSS/entry URLs on both pages address stale styling after the rebuild; verify the user's browser on ordinary refresh if the report persists.

## Resume here

Review the revised prototype at http://127.0.0.1:8766 (restart command below if needed). Confirm teaching wording/playback pacing and the explicitly stated per-error correction convention before enlarging the error bank. Continue the remaining conversion plan only after addressing review feedback. Broader scoring/Practice-set/storage decisions remain in the earlier decision register below.

New authored source is `content/M10_web_teaching.json`; regenerate with the existing import command. New UI/marking/playback module is `website/teaching.mjs`; theme files and `website/about.html` are now part of the site. The base implementation is in commit `a668b03`; the current feedback changes and documentation edits are saved but **uncommitted**. No deployment occurred.

---

# Website handoff — 2 October 2026

This section supersedes the historical slide handoff below. The user authorised website planning and initial actions. Website delivery is primary; no ongoing slide exports or backup stacks.

## Current result

- Local equations prototype: `website/`, served at **http://127.0.0.1:8766** while the preview server is running. Restart command: `python3 -m http.server 8766 --bind 127.0.0.1 --directory website` from practice/.
- Plan and implementation interpretations: [docs/WEBSITE_PLAN.md](docs/WEBSITE_PLAN.md). Reference code review: [docs/REFERENCE_REVIEW.md](docs/REFERENCE_REVIEW.md). Content audit: [docs/CONTENT_AUDIT.json](docs/CONTENT_AUDIT.json).
- Imported 94 M10 items (72 independent questions), plus saved recap examples/notes. Active website sources: `content/M10_equations.json` and `content/M10_web_recap.json`. Generate bank using `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3 -B scripts/prepare_web_equations.py`.
- All seven topic decks match the 67-slide combined deck in text and basic shape geometry. Source questions and recap text checked against M10 deck; existing PPTX/HTML assets untouched.
- Implemented assessment, method/demo/recap, guided practice, error spotting and adaptive independent practice. Named browser-local profiles, individual exact-number marking, working canvas/typed/paper options, assistance flags, persisted attempt/progress state, light/dark themes and responsive reference panel/modal.
- Verified **16 unit/content tests**, plus isolated Chrome interaction checks and desktop/mobile visual inspection. Node path in this environment is `/opt/homebrew/bin/node`. Run `/opt/homebrew/bin/node --test tests/*.test.mjs`. Browser checks: `scripts/browser-smoke.mjs`, with local server on 8766 and isolated Chrome debugging port 9238; it only clears that test browser's Maths storage.

## Checkpoint — review deferred by the user

The user will review another time and requested documentation only at this stopping point. The prototype is implemented and checked, **not yet reviewed or accepted by the user**. No further conversion work was performed for this checkpoint. Resume from this section rather than the historical slide tasks below.

### Remaining decisions and implementation details

These are recorded for the next review/design session, not questions requiring an answer now. `web_format.md` remains the product specification; prototype defaults below must not be mistaken for approved teaching decisions.

| Area | Current prototype / recorded interpretation | Still to settle or check |
| --- | --- | --- |
| Short-page score history | Rolling history survives page boundaries. Ten-question pages use the last ten eligible outcomes; short pages use a window matching page length, with the specified weights and zero padding. | Confirm rolling versus page-only scoring for short pages and how a future change in page length affects the displayed score. |
| Reassessment | `min(5, page length)` eligible answers; a minimum of three for hypothetical one/two-question pages. Assisted correct answers do not consume this counter. | Confirm this exact interpretation of “less than 5”; check five-to-nine-question page cases before those lengths enter the UI. |
| Assistance and trials | Assisted correct answers leave history unchanged; assisted incorrect answers count as failures. Assistance survives switching questions. Trials count unassisted correct answers towards the two-answer confirmation minimum. | Confirm how a correct assisted answer during a trial affects confirmation: currently it neither fails the trial nor contributes to the minimum. Also decide whether merely opening a reference should count when it was not used. |
| Retries / repeated practice | Each question can be submitted once per page. Solutions are available after submission; a new page can include a previously answered question. No T-Level four-hour restriction is inherited. | Decide whether to offer a same-page unscored retry, and whether repeated questions on new pages need a progress-eligibility interval. |
| Manual difficulty | Two consecutive submissions at the same lower level change the recommendation. Choosing a higher level changes the recommendation immediately and records manual origin. | Decide how to distinguish manual choice from demonstrated mastery in the future aggregate bar; check interaction with reassessment before expanding the progression UI. |
| Topic progress / priorities | Only the active page type's recommendation and score are displayed. No aggregate bar or revision-priority list yet. | Define the three-stage bar calculation using plain ×2 and other types ×1, treatment of unattempted types, and attribution/ranking for mixed-topic pages. |
| Initial assessment | Four accepted questions, no inline hints/reference, immediate individual feedback; no automatic placement. | Decide placement criteria, whether students should complete assessment before other sections, and whether freely navigating to the demo during an unfinished assessment is acceptable. |
| Error-spotting marking | Updated 3 October: each independent error requires row, reason and corrected-step selection; one final x entry. One new Confidence item has two errors. All components must be correct for the scored result. | Review the local correction convention documented in the dated log; establish formats for other topics and any partial credit. Freehand working is never automatically marked. |
| Practice sets and codes | Not implemented. Stable subject-qualified question IDs exist; one topic learning sequence is available. | Define subject + nine-character configuration encoding, reproducibility under adaptation, bank revisions, compatibility with T-Level codes, and the up-to-three-page runner. Implement saved-level precedence and first-use inheritance there. |
| Profiles and stored data | Browser-local names, typo suggestions, separate histories and persisted active pages; no authentication. Current track/page keys are page types within the single Maths/M10 prototype. | Before adding another topic, namespace these keys by subject/topic/type and migrate schema 1. Decide rename/delete/reset, export/import, history limits and handling corrupt/incompatible data. Never silently merge names. |
| Working area / accessibility | Unsubmitted text/sketches clear when switching questions; typed and paper alternatives exist. Desktop reference panel and mobile modal are checked. | Review practical layout, scrolling and discard behaviour with the teacher; conduct screen-reader, high-zoom and real touch-device checks before rollout. A blank-working reminder is not method assessment. |
| Site boundary and feature scope | Local standalone Maths prototype. Light/dark themes, streak messages and method animations exist. | Confirm standalone deployment versus integration with the T-Level site. Plan timers/expiry behaviour, issue-report destination, selected puzzle families, college links/configuration and any additional theme controls. Do not publish as a side effect of local work. |

Custom-input animations and an extra challenge tier remain V2. Slide export remains deferred until explicitly requested; these are already decided and need not be asked again.

### Exact next action when work resumes

1. Read this checkpoint, `AGENTS.md`, the latest `web_format.md` and `docs/WEBSITE_PLAN.md`; check Git status for intervening user changes.
2. Restart the preview if needed and let the user review the current equations prototype. Address that feedback before scaling the layout. Do not infer approval from implementation or test results.
3. Before importing another topic, generalise subject/topic storage keys and add migration/isolation tests. Define the next Practice-set and progress-bar behaviour with concrete examples from the decision table.
4. Audit M01 source against its saved deck, then port the accepted lattice working/animation with the correct carry placement. Continue M02, M13, M15, M03 and M04 in the teaching sequence. All six remain non-interactive.
5. Add the remaining Practice-set, export/import, priority, timer/report/puzzle and college configuration features in the plan. Complete content, accessibility and deployment checks before rollout.

### File map

- `website/app.mjs`: topic navigation, page selection, marking UI, method/recap renderer, working area, profile switching and persistence integration.
- `website/engine.mjs`: exact numeric answer parser, weighted scores, promotion/reversion/reassessment and manual level changes.
- `website/profiles.mjs`: storage schema/key, name normalisation, typo suggestions and local profile selection.
- `website/index.html`, `website/styles.css`: page shell and responsive/theme styles.
- `website/data/equations.json`: generated bank; edit the content sources, not this file.
- `content/M10_equations.json`, `content/M10_web_recap.json`: authored equations and recap material.
- `scripts/prepare_web_equations.py`: bank import and source/deck audit; writes the bank and `docs/CONTENT_AUDIT.json`, never the decks.
- `tests/website.test.mjs`: 16 recorded unit/content checks. `scripts/browser-smoke.mjs`: isolated Chrome interaction checks.
- `docs/REFERENCE_REVIEW.md`: findings from reference commit `8906225f458372b7238544341e5f293cc67e685a`. Reference clone: `/private/tmp/maths-starters-reference` (temporary, not a dependency of the prototype).

### Restart and verification commands

Run from `practice/`:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory website
```

Open http://127.0.0.1:8766. The URL requires a running local server; its availability is not guaranteed across sessions. No npm install/build is currently required. Do not test by opening index.html with `file://`.

```sh
/opt/homebrew/bin/node --test tests/*.test.mjs
/Users/joehudson/.pyenv/versions/3.13.3/bin/python3 -B scripts/prepare_web_equations.py
```

For browser checks, run the local server and start a separate test Chrome instance:

```sh
'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' --headless --disable-gpu --no-first-run --no-default-browser-check --user-data-dir=/private/tmp/maths-web-browser --remote-debugging-port=9238 about:blank
/opt/homebrew/bin/node scripts/browser-smoke.mjs
```

The smoke script clears the isolated test browser's Maths storage; do not attach it to the user's review browser. It saves screenshots as `/private/tmp/maths-*.png`. Temporary clone, screenshots and browser profile may disappear; durable source, audit and instructions are in the project. Sandbox approval may be needed for the local server, Chrome and loopback connections.

### Saved-work status and verification limits

Rechecked on 2 October 2026: the conversion work and previous checkpoint are now committed in `a668b03` — “initial work on website conversion. not fully checked”. The working tree was clean before this documentation refresh. This refresh updates only the handoff and its plan reference; it does not change application code or create a commit. No live deployment was performed. Original PPTX/HTML outputs remain preserved. User review is still pending; the commit is not evidence of acceptance or full verification.

The recorded 16 tests and browser/visual checks passed during the implementation turn. This documentation-only checkpoint did not rerun them or change application code. The content audit compares text/basic shape geometry, not every style/media detail; only M10 source parity was checked. Browser checks cover an isolated Chrome instance, not all browsers or classroom devices. Full screen-reader/accessibility, other-topic migration and production deployment checks remain outstanding.

---

# Session handoff — 1 October 2026

Read [AGENTS.md](AGENTS.md), [SLIDE_LAYOUT.md](content/SLIDE_LAYOUT.md) and [ANSWER_SLIDES.md](content/ANSWER_SLIDES.md).

## Current outputs

- [Combined questions](GCSE_Maths_Revision_Starters.pptx): **67 slides**.
- [Combined HTML answers](GCSE_Maths_Revision_Starters_answers.html): matching order, every assessment/practice answer and all **63 error-spotting corrections**.
- Order: M01 multiplication (10) → M02 division (9) → M13 signed addition/subtraction (10) → **M10 equations (10)** → **M15 fraction addition/subtraction (10)** → M03 multiplication/division problems (9) → M04 ratio (9).
- All seven topics have suffix-free question PowerPoints and HTML answers under `topics/`. Registry: `content/topic_registry.json`. Output history is retained in Git; do not create backup files.

## Completed in this continuation

- Built and integrated equations: assessment, technique recap, demo, two scaffolded practices, nine fully worked incorrect solutions, four independent grids (72 questions). Uses the vertical-line balancing method, operations on both sides, collecting like terms, useful factorising and tips for a shorter first step. HTML includes full correct working and error explanations.
- Built and integrated fraction addition/subtraction next, following the requested one-topic-at-a-time sequence. Includes common/unrelated denominators, mixed numbers, simplification and equal-whole strip diagrams; same ten-slide structure and 72 independent questions. Every independent grid mixes addition and subtraction. Each new SE slide has 18 distinct correct/incorrect final values; each new independent grid has 18 distinct answers. Fractions across the four independent grids repeat at most twice.
- Applied Start / Build / Confidence headings throughout current decks and HTML, without “Thread”. Added approved curved arrows to every plain question grid. M01 has a copyable empty-lattice template slide with 2×2, 3×2, 3×3, 4×3 and 4×4 grids.
- Replaced arithmetic answer-page diagram instructions with completed lattice/bus-stop diagrams in one three-column row. Application scaffolded answers also contain actual diagrams. Arithmetic checks use easy mental ballpark multiplication/bounds; retained useful cheap exact/substitution/context checks.
- All SE answer sections use three columns and show the incorrect written work, explanation, correct solution and check. Correct lattice/division/signed/ratio/application working is rendered too. New equation and fraction corrections show complete written solutions.
- Added shared HTML layout: tall topic separators, alternating subtle backgrounds, sticky vertical topic name bars and topic navigation. Narrow screens stack columns.
- Added deterministic skill-specific rendering scripts under `scripts/rendering/`; documented the clarity, consistency and efficient regeneration rationale in ANSWER_SLIDES.md. Kept existing accepted teaching content/manual edits while changing headings/arrows and refreshing SE.
- Retained the earlier question-clarity and answer-diversity corrections, including the organisers sharing 18 prizes at £12 (£54 each). Full previous reviews remain in `content/SPOT_ERRORS_REVIEW.md` and `SPOT_ERRORS_ANSWER_PATTERNS.md`.

## Build commands (from practice/)

- `python3 scripts/update_structure.py`: preserve current original-five topic teaching slides, refresh their SE/HTML, compile **all registered topics**, including newer saved topics.
- `python3 scripts/build_priority_topic.py`: regenerate M10 from `content/M10_equations.json`, then compile all topics.
- `python3 scripts/build_fraction_topic.py`: regenerate M15 from `content/M15_fractions.json`, then compile all topics.
- `python3 scripts/refresh_answers.py`: refresh all current topic/combined HTML from source, preserving question decks. Use for answer-only formatting changes.
- `python3 scripts/compile_starters.py`: combine saved topic outputs only; does not rewrite topic content.
- `equation_content.py` and `fraction_content.py` author the structured banks. Run them only when deliberately regenerating those sources; direct edits to JSON must also be reflected in authoring logic where applicable.
- Other original generators are historical; do not run them to overwrite accepted topic decks. Carry any future combined-deck manual edits back into the individual topic deck before recompiling.

In this environment the working interpreter is `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3`; the default non-login shell's Python lacks python-pptx. No new dependency installation was needed.

## Review and next work

Exact rational arithmetic, question counts and new answer variety were checked. Focused renders covered equations recap/demo/SE, fractions recap/demo/scaffold/SE/independent, and the revised three-column multiplication HTML example. Fixed fraction spacing and question-number wrapping found in that review. No broad automated test suite was added. Current decks are built for user review; generation does not imply approval of new content.

**Next unbuilt priority: M06 percentages of amounts and percentage change.** Equations and fraction addition/subtraction, the two requested topics, are implemented. The full remaining sequence and rationale are in `content/TOPIC_PLAN.md`. Further topics remain planned; do not imply their drafts are implemented.

## Answer formatting follow-up

Standardised all 42 practice diagnostic blocks to “Method and error check — practice N” (or “scaffolded practice N”), followed directly by a table. Equations and fractions now match the earlier topics. Removed leaked production instructions. All initial assessments use one compact table cell containing four numbered solutions; equation/fraction diagrams no longer expand across the full page. Fraction answer-grid diagrams also have a compact width. Updated generators and refreshed all seven topic HTML files plus combined HTML; question decks are unchanged.

Future-session animation work is planned in `content/ANIMATED_DEMOS_PLAN.md`: click-driven method steps, a one-equation prototype first, skill-specific reveal orders, preservation of timing during compilation, and a static fallback. No animations implemented yet.

Carry-placement follow-up: moved lattice carries close to their receiving grid boundary, before and separate from answer digits. Updated the shared correct renderer, SE renderer and legacy generator, and patched the saved M01 native grids/SE with `scripts/fix_lattice_carries.py`; the combined question deck remains 67 slides. Other topic question decks were preserved. Retained the intentionally oversized SE carry. Refreshed matching HTML diagrams and documented the placement rule. Focused output checks confirm 42 consistent diagnostic headings, seven single-cell assessments containing four solutions each, and no leaked production instructions.


## Fraction answer sizing and CSS consolidation

Replaced the 110px-wide SVG answer thumbnails with CSS-sized stacked fraction text. Whole, fractional and mixed answers now share a readable 1.5rem base size (fraction digits .85em). Consolidated all answer CSS in `styles/answers.css`, removed Python CSS strings/topic overrides and inline SVG display sizing, and documented shared tokens and the refresh workflow. Refreshed all current HTML outputs; question decks were untouched.

## Website review and backup cleanup — 1 October 2026

Website conversion is pending discussion of [WEB_FORMAT_REVIEW.md](WEB_FORMAT_REVIEW.md), reviewing [web_format.md](web_format.md). Do not continue with M06 or begin conversion before that discussion. The reference T-Level repository still needs cloning and review before implementation.

Removed 206 committed `_prevN` outputs/previews; all matched Git HEAD before removal. Current outputs and the uncommitted combined PowerPoint edits are preserved. Git is the only output history: no backup rotation. Active builds now read ratio/signed assessment answers from `content/assessment_answers.json` and require current saved topic decks, with no archived-deck fallback. Restore missing accepted decks from Git explicitly. Legacy publishing scripts are disabled. Assessment HTML equivalence, Python syntax, no-backup saving and unchanged current-file hashes were checked. Historical links to removed snapshots in older notes can be resolved through Git; those notes are not current output instructions.
