# Development log

Concise dated record of decisions, work, evidence and problems. Append new entries; correct mistakes explicitly. This is not the resume plan: use [HANDOFF](HANDOFF.md). Detailed prior documents remain in Git history.

## By 20 September 2026 — initial design conversation (historical context)

Condensed on 6 October 2026 from `initial_chat2.html`, preserved in initial commit `3cefdfc` (20 September 2026). The export does not establish the exact conversation date. This entry records the user's refined intent, not every assistant suggestion or an additional current specification. The original export remains recoverable from Git after its working copy is removed.

- **Purpose and audience:** short, repeatable revision starters for college learners retaking Foundation GCSE Maths, rather than teaching every topic from scratch. Basic multiplication, division and ratio need attention alongside more involved GCSE questions. The current project narrows the audience to learners around grades 2–3 building towards grade 4+; follow prerequisite order and do not assume an exam board.
- **Structure:** show the complete question before its decomposed working steps. The settled slide-era module comprised one full worked demo, two step-by-step practice grids and four independent question grids, with three challenge columns and several questions per independent column. Students would record working in booklets or a webapp. Retain the progression from demonstration to guided and independent work; fixed slide counts and simultaneous columns do not override the website's current page/activity design.
- **Separate the method from its application:** lattice multiplication, bus stop division and applying those methods to exam problems were distinct modules. Pure method practice uses numerical calculations and row headings that describe the actual algorithm. Application practice requires students to decide the calculation, carry it out, check it and answer the original question. Generic problem-solving headings must not replace algorithm steps in method modules.
- **Lattice multiplication:** the user's intended method was the digit-by-digit lattice, not a partitioned box method. Arrange one operand across the top and the other down the side; draw diagonals; fill each cell's tens and units, including a zero tens digit for products below ten; sum diagonals from bottom right, including carries. Position result digits consistently at diagonal ends and show carries separately in smaller text. Read the result from the top-left-side digit down the left edge and along the bottom. The user rejected confusing diagrams: accepted saved diagrams and the current teaching specification take precedence over early assistant sketches.
- **Bus stop division:** use corresponding algorithm-specific steps: position dividend/divisor, divide left to right with place-value alignment and carried remainders, handle the required remainder or decimal continuation, then state the full quotient. Scale method difficulty through carrying, remainders/decimals and larger operands. The user explicitly requested three- and four-digit multiplication challenges and comparable division scaling; later exact operand requirements are retained in [Teaching specifications](content/TEACHING_SPECIFICATIONS.md).
- **Application prompts and differentiation:** keep the established sequence “Keywords & Calculation”, “Written Method”, “Ballpark Check & Math”, “Final Answer”. Worked examples demonstrate the chosen operations; student practice prompts must not reveal them (for example, telling a student to draw a bus stop gives away division). Differentiate reasoning as well as number size: one clear operation; an operation requiring interpretation, such as counting full packs; then linked operations, such as rounding up a transport requirement before calculating cost. Use accessible, unambiguous wording and genuine variation. The early assistant's fixed ratio method per column is superseded by the current requirement to vary givens, objectives and relationships within levels.
- **Language and agent guidance:** use stable mathematical terms, not synonym rotation for stylistic variety. Instructions should be concise, precise and centred on the user's decisions, with enough examples to clarify intent while leaving a capable agent room to choose implementation details. The user rejected verbose, generic handoff drafts that failed to retain the important distinctions.

Current authority: [web specification](web_format.md), [UI/UX rules](docs/UI_UX_RULES.md), [teaching specifications](content/TEACHING_SPECIFICATIONS.md) and the [topic plan](content/TOPIC_PLAN.md). Website delivery, Start/Build/Confidence labels, assessment/error-spotting activities and saved-data behaviour come from later decisions. This historical summary does not revive slide publishing, old challenge labels, fixed module counts or the assistant's unverified mathematical examples and contradictory tool/file-generation claims.

## 1–2 October 2026 — website conversion

- Website delivery replaced ongoing slide maintenance. Removed 206 historical output backups after checking Git copies; preserve current resources and manual edits, use Git for older versions.
- Reviewed the T-Level starter at pinned commit `8906225f458372b7238544341e5f293cc67e685a`; [reuse findings](docs/REFERENCE_REVIEW.md) retain provenance and feature differences.
- Imported 94 M10 items (72 independent questions) plus three recaps. All seven saved topic decks matched the 67-slide combined deck in text/basic geometry. Detailed media/style and other-topic source audits were not completed.
- Built the five-mode equations prototype. Initial checks reported 16 logic tests plus browser scenarios; this did not constitute teaching acceptance or whole-site accessibility verification.

## 3 October 2026 — feedback and startup fixes

- Implemented assessment simplification, stable question selectors, level-specific annotated playback, collapsible session-only paper mode, explicit per-error entries, compact profile switch and About credits. Added one two-error Confidence question: 95 items total.
- Correct answers advance to the next unanswered question with focus/announcement. Optional theme failure cannot block bank/profile readiness. Progress copy is “recent success at this level”. Requirements persist in [UI_UX_RULES](docs/UI_UX_RULES.md).
- Startup previously stuck on loading and name selection failed against uninitialised profiles. Added failure/delay checks; later browser runs passed. Theme selection was reported broken, but not reproduced in isolated Chrome; cache-versioning was used in the old runtime.

## 3 October 2026 — framework migration and interruption

- Selected SvelteKit/static adapter, Svelte, Vite, Tailwind/daisyUI semantic CSS composition and Bits UI. Pinned stable versions at implementation; this is not a claim of ongoing automatic upgrades.
- User waived preserving old active attempts/profile data. Adopted clean subject/topic-scoped schema 2. Keep exact themes and similar layout, but replace opaque equals-sign masking with real divider gaps.
- Initial migration was committed as `7e42613`, but left duplicate runtimes/banks, miswired browser tests, a missing temporary theme baseline and incomplete verification. Earlier “migration complete” wording overstated the result.
- Continuation added shared next-stage/focus behaviour, one bank/runtime, modular browser checks and a reproducible historical theme fixture. Retired the old runtime/CDP scripts. No site was deployed.
- Evidence before documentation consolidation: 24 Node tests; clean Svelte/format checks; static builds; activity/startup/browser checks including subdirectory serving and stage focus; exact colours/gradients in 32 theme states; five-mode layout geometry at three widths. Geometry tolerance was under 8px, not a pixel-identical assertion. Manual assistive-tech/device/zoom and explicit HMR testing were not completed.

## 3 October 2026 — excessive testing and corrected contrast decision

- The assistant spent excessive time/tokens repeatedly running whole suites while fixing harness details, and reopened a decision already settled by the user. This was inefficient and avoidable.
- Correct policy: accessible default themes; users may freely adjust them even when contrast falls. Eight defaults passed the sampled settled-state contrast check. Fifteen adjusted states failed; these are accepted personal settings, not outstanding defects. One apparent default failure was measurement during a CSS transition.
- Made historical/32-state audits opt-in. Final runner-flag edits were formatted but not browser-rerun. Focused individual browser-scenario selection is still missing; do not claim the lean runner is fully implemented.

## 3 October 2026 — documentation and legacy organisation

- User requested one dated development log, a separate regularly maintained current handoff, a task-based route from AGENTS to all docs, legacy slide storage and concise project-local skills.
- Consolidated current docs and retired overlapping reviews/logs. Added a complete document index and two small repository skills; kept a redirect for the protected specification’s migration-plan link.
- Moved 29 saved decks/answer resources/assets into legacy/ without byte changes; 33 protected documents are unchanged. Updated the active importer and reran it: saved-deck checks passed and bank hash is unchanged.
- Document routes/file links checked; no frontend test suite run. Skill validator could not start because PyYAML is absent in system Python; skill metadata/links were inspected, no dependency installed. Current resume details are in HANDOFF.

## 3 October 2026 — final resumption check

- Confirmed consolidation/relocation has no unfinished edits. Node syntax checks passed for the edited browser runner/theme checks; final whitespace check passed. No browser suite or build was repeated.
- Skill validator also lacks PyYAML under the available project Python; limitation remains documented, with no dependency installation or further retries.
- Work remains uncommitted, including intentional moves/deletions and new files. No reset, staging, commit or deployment performed. Current handoff distinguishes historical passing tests from final runner changes that have only syntax/format evidence.

## 3 October 2026 — outstanding validation completed

- User clarified that documenting uncompleted checks was insufficient. Completed the checks instead of treating the prior wrap-up request as a reason to leave them pending.
- Both skills passed the supplied validator after installing PyYAML in a temporary isolated environment; no repository dependency changes.
- Confirmed all 29 relocation hashes, 33 protected-document hashes, unchanged bank, all 53 Markdown index entries, active document file/heading links and eight legacy HTML pages’ resource links.
- Current source passes Svelte/format checks, 24 logic tests, static build and the standard browser suite, including the final default/opt-in runner wiring in standard mode. No failures required app changes. Expensive historical/adjustment audits were not repeated.
- Handoff now records completed evidence. Manual device/assistive-tech review, explicit HMR verification and integration into a future host remain separate product verification work, not unfinished documentation/relocation checks. Changes remain uncommitted; nothing deployed.

## 3 October 2026 — skill discovery correction

- User correctly identified that the initial plain skills/ directory was not a standard discovery location. AGENTS links alone did not register the skills automatically.
- Moved both skills to .agents/skills/, supported by native Codex and VS Code Copilot. Updated internal/document links, with no duplicate skill copies. Open practice/ as the workspace root; live VS Code discovery is not claimed as tested.

## 3 October 2026 — post-migration framework and equation review

- User questioned visible evidence of Tailwind/daisyUI/Bits adoption. Code review confirms genuine Bits dialogs/popover and useful JS separation, but only two Tailwind @apply rules and daisyUI’s button foundation; most CSS remains global custom styling. Calling the styling standardisation complete would be inaccurate.
- User revised the drawing requirement: continuous coloured line with equals signs over it, explanations to the left. Replaced split pseudo-elements with one table-column background and annotations in the corresponding rows; no opaque mask, no palette changes. Updated standing rules and the browser assertion.
- Svelte/format checks and static build pass. Focused browser checks passed all three demo levels at desktop/mobile widths, with intact equations, left annotations, no page overflow and transparent equals backgrounds; screenshots inspected. No unrelated full-suite rerun.
- Question cards still permit wrapping. Their fixed two-column threshold considers container width, not content fit; the selected equation also has overflow-wrap:anywhere. Sizing alternatives are being discussed before changing those layouts. The previous UI tests checked minimum width, not whether mathematical expressions stayed on one line.

## 3 October 2026 — shared component foundations and playback UX

- User approved semantic daisyUI components/variants with Bits UI interactions, modest equation typography adjustments and full-width longer cards through flex sizing, scroll-on-play, remembered speed and tighter left-hand explanations.
- Implemented shared controls.css using daisyUI @apply foundations for buttons/fields/selects/checkbox/cards/progress. Removed broad native-control rules and repeated button geometry; kept theme tokens and Bits dialog/popover behaviour. An automated attribute edit initially broke Svelte arrows/comparisons; corrected before validation. A conflicting legacy checkbox-width rule was also removed after visual inspection.
- Question cards now use intrinsic flex minimum sizes, with no JS character thresholds. Current bank expressions stay intact across nine widths; a longer fixture demonstrably takes a full row while neighbours remain paired.
- Speed is profile-scoped (0.5×/1×/1.5×/2×), shared with reference demos and persisted without affecting learning history. Timer updates keep one scheduled callback and retain the current step. Play scrolls the stage into view; long solutions follow the current row without moving focus. Explanations use smaller text, less gap and reduced row padding.
- Added a focused --presentation-only browser entry. Svelte/format/build and 26 logic tests passed; focused browser checks passed flex layout, scrolling, speed persistence and reference sharing. Final integration browser run passed all activity/startup/accessibility scenarios and exact eight-default-theme comparisons. Handoff records current commands and remaining manual coverage limits.

## 3 October 2026 — restore equation readability and full-width working

- User found the reduced equation text too small. Restored pre-adjustment sizes: question cards 1.2rem desktop/1.08rem mobile, selected equations 1.8rem/1.55rem. Retained intrinsic flex sizing and intact expressions; demo annotation sizing stays unchanged.
- Explicitly made canvas and typed working block-level, full-width fields inside the working card, overriding library sizing. Preserved canvas print hiding.
- Static build, changed-file formatting and focused browser checks passed, including both working-field widths and equation fit across nine viewport widths. No unrelated logic or integration suite rerun.

## 3 October 2026 — correct working-card inset

- User screenshot showed that the previous full-width change retained the card’s wide padding. The earlier test measured fields against the content box and therefore did not establish the intended visual widening; suggesting a refresh was insufficient.
- Reduced only the working card’s horizontal inset to 8px at all breakpoints. Both writing areas now extend closer to the card border.
- Static build and CSS formatting passed. Browser visual review was not rerun for this padding-only change; user review remains pending.

## 3 October 2026 — preserve text inset; extend only writing fields

- Previous correction misunderstood the request again: narrowing all working-card padding moved text unnecessarily. Restored normal text/control padding. Only canvas and typed input now extend to the card’s inner border edges, using the shared responsive card-padding variable for width and negative inline margins. No markup wrappers or JS needed.
- Replaced the insufficient content-box width assertion with checks of both field edges against the card’s inner borders and the heading’s original inset. Focused browser checks passed at nine widths; static build and changed-file formatting passed.

## 3 October 2026 — working-option typography and square fields

- Made the paper option smaller and regular-weight, with daisyUI’s extra-small checkbox and a clickable label retaining a 32px minimum height. Replaced the misleading inline-radio class with paper-option.
- Removed corner rounding from both full-width writing surfaces in their shared style definition. Preserved text padding and field width.
- Static build and changed-file formatting passed; no browser suite rerun for these cosmetic edits.

## 3 October 2026 — compact clear-drawing control

- Replaced Clear drawing text with an eraser SVG in a reusable compact icon-button variant. Native title tooltip and aria-label both say “Clear drawing”; existing click/keyboard action unchanged.
- Static build and changed-file formatting passed. No browser rerun for this presentational change.

## 3 October 2026 — field comparison and reusable ordered demos

- Added a development-only selector between the existing flush/square working fields and an 8px-inset/10px-rounded variant. Text padding and field contents are preserved; production keeps the flush default. The selector resets with the working component, intentionally outside learner preferences.
- Extracted shared ShowDemo playback/controls/scrolling from the equation adapter. Callers supply frames and rendering snippets; only logical step numbers belong to the shared contract. User clarified lattice needs grid/diagonals → numbers → cell products → diagonal sums → answer/carry digits. Documented this method-owned sequencing; lattice itself is not implemented.
- Equation frames now show the full line first, then left/equals/right, skipping equals for operations. Invisible ink reserves cell geometry, so the line and columns stay fixed. Pause holds the current partial row, navigation shows complete logical steps, and changing examples cancels playback.
- 27 logic tests, Svelte/format/static build and focused browser checks passed. Browser evidence covers reveal ordering, pause/resume, field variant geometry, saved speed and scrolling. A temporary Vite check verified the actual dev selector in both directions, default-theme demo axe checks and cancellation on level change; screenshots inspected. No unrelated full integration/theme audit rerun.
- Initial check found Svelte initial-value warnings, resolved with explicit untracked initialisation. The temporary axe harness initially used the wrong browser context and was corrected. Vite exposed the deprecated $app/environment import; switched to installed Kit 3’s $app/env. A favicon 404 remains incidental to the dev preview, not a playback failure.

## 3 October 2026 — centred question selectors and compact single rows

- Centred equations within their buttons while keeping question numbers at the left. Longer buttons occupy their own row without stretching across it; the containing flex slot centres the intrinsic-width button. Removed the unused outcome column and placed results at lower-right to reduce width requirements without shrinking fonts.
- Collected spacing knobs in .question-list and documented their roles in the website README, including the number-gutter constraint on true centring. Buttons remain appropriate native controls for in-place question selection.
- Static build, formatting and focused browser checks passed. Updated geometry assertions check equation centring at nine widths and a centred, non-stretched longer fixture beside paired shorter questions. Screenshot inspected. No unrelated full suite rerun.

## 3 October 2026 — semantic colour wiring and Practice set decision pause

- Preserved the user’s edited theme mix percentages (84/80/76). Removed incorrect text-colour aliases for status borders; selected/correct/incorrect question states and feedback now use matching semantic border/background/text tokens. Selected-question outline still separately identifies current selection.
- Static build, formatting and focused computed-style browser check passed for the five affected selection/feedback styles. No historical palette comparison: changed mix values are intentional user edits.
- Began Practice set implementation review. Existing scope establishes up to three pages, nine-character subject-scoped codes and per-question progress, but reproducibility, explicit code-level precedence and revision behaviour remain unresolved. Asked these three questions and paused dependent implementation as requested. Concrete next steps and recommendations are in WEBSITE_PLAN; no speculative codec or UI stub added.

## 3 October 2026 — blend highlights with element defaults

- User requested element-native highlight mixing. Preserved their latest percentages found on disk (92/86/82, superseding the earlier 84/80/76). Question highlights now mix with surface/control-border. Feedback resolves the same formulas locally against its normal soft surface and brand border; semantic text colours are unchanged.
- Build/formatting passed. Focused browser checks verified backgrounds, borders and text for all five status styles in light/dark mode. Practice set decisions remain pending; this colour change does not select a codec policy.

## 3 October 2026 — automate routine verification and reduce token overhead

- Replaced agent-by-agent test selection with `verify:changed`: explicit file-family mappings, per-job content fingerprints including untracked files/deletions, retained successful checks, changed-file formatting and one reusable build. This addresses the large existing uncommitted diff: HEAD alone would keep selecting the whole app forever. Full output stays in ignored logs; normal output is a short selection/pass/fail summary.
- Added opt-in `verify:watch` with debounced, serial save-triggered runs. No Git hook installed. Split colour/startup/activity browser entry points, made the recent colour probes a maintained scenario, seeded browser randomness, and replaced demo sleeps with a controlled clock. Extended/historical audits remain separate rather than normal prerequisites.
- Rewrote and validated the efficient-development skill: run the command, trust passing summaries, inspect only failed logs, rerun the same command to reuse evidence, avoid temporary inline probes, and maintain dependency mappings for new feature families. README documents commands, mappings, cache rules and limits. No new production dependency.
- Added three dispatcher tests for narrow selection, unchanged skips, deletions/new inputs, failed-job retry and policy/runtime invalidation. The full logic suite now has 30 tests. Initial cache establishment found pre-existing Prettier-config formatting, which was corrected without semantic changes.
- Controlled-clock work exposed a real demo-speed bug: optional chaining skipped reading speed before player mount, so Svelte did not subscribe to speed changes. Reading speed before the optional call fixes live timer updates. Tests now assert reveal timing, not only saved preference. Harness fixes also installed the clock before app timer capture and allowed for Confidence’s extra equation reveals.
- Colour probes initially compared rounded CSS strings and produced false mismatches; now compare rendered channels with one 8-bit step tolerance. Removed only the historical selection-fill equality superseded by explicit user colour decisions; retained other historical comparisons. No palette values were changed.
- Final validation passed: 30 logic/dispatcher tests, local documentation links, bank validation, Svelte, build, controlled-clock presentation, semantic colours, startup faults and activity integration. Presentation now completes in about 2.5s; the full activity check took 13.5s. A second unchanged run selected no checks; documentation edits selected docs only. Watch smoke verified Markdown creation/deletion triggered only docs, with no app build/tests, and the watcher was stopped. The macOS sandbox blocked filesystem watching (EMFILE); the approved normal-environment retry passed. No watcher is left running.

## 4 October 2026 — Practice set code decisions

- Confirmed: codes reproduce page combinations with adaptive questions; saved learner levels override code-embedded challenge levels.
- Bank update/version behaviour remains under discussion. No codec/revision policy has been selected or implemented by implication. Updated roadmap and handoff; documentation-only verification applies.

## 4 October 2026 — reference check for persistent identity and parent integration

- User raised UUID-based parent-app definitions/work and asked whether T-Level durable codes are the right model. Fresh clone confirmed the same reference commit; reviewed implemented resolver, identity tooling, compatibility tests and rollover decisions without rerunning an unrelated suite.
- Confirmed stable identity/current content is the T-Level policy, with retirement/removal distinctions and preserved historical results. Also identified the deliberate generation-rollover limit: old compact codes may collide after version reuse. Do not represent that model as indefinitely persistent.
- Recommended separate canonical definition/element UUIDs, content/behaviour revisions, permanent compact addresses and per-attempt/work UUIDs. UUIDs identify entities; they do not preserve old grading/rendering behaviour alone. Existing Maths page attempt UUIDs/revision history are a foundation, not full host integration. No codec or UUID migration implemented during this discussion.

## 4 October 2026 — final Practice set code contract and author responsibility

- Confirmed format: nine case-sensitive URL-safe base64 characters = 54 bits. Header: 2 bits for whole-set challenge (all four values reserved for Start/Build/Confidence/future Super challenge), 2 bits for page count minus one (1–4), 2 bits for timing (untimed/5/10/15 minutes). Each of four entries uses 5 topic bits (32 topics per selected subject), 3 page-type bits (8 types), 4 authored-page-slot bits. Topics may differ between pages. Unused trailing entries are zero. Subject is external; no bank revision or format-version field fits this layout.
- Codes reproduce ordered page combinations with adaptive questions. A saved learner level for the topic/type overrides the code’s set-wide challenge. Questions and session-selected variants may change; variants are not indexed in this code. No parent-app UUID/sync/version system is being introduced.
- Slot 0 randomly chooses an eligible authored page. Slots 1–15 select the corresponding authored page at the effective topic/type/level; when beyond the available page count, use (slot - 1) modulo pageCount. This intentionally permits slightly off codes to yield close activities. Such overflow mappings may change as the bank grows. A topic/type/level with no pages is explicitly unavailable, not silently replaced by a different activity.
- IMPORTANT correction to earlier assistant advice: page slots are reusable. An author may replace one page with another; keeping reasonable similarity where continuity matters is the author’s responsibility. There are no permanent-slot tombstones or mandatory new IDs for replaced pages. Avoid wasting the limited slots or importing unnecessary parent-app complexity. A code promises configuration/position, not immutable page content. This supersedes the earlier no-reuse proposals in the reference discussion.
- Implementation begins with codec, explicit authored-page catalogue, adaptive session integration and create/open/continue UI. The current bank only implements equations/plain/error pages; codec capacity does not imply unimplemented topics/types/Super challenge exist. New timer behaviour will use a persisted whole-set deadline; expiry will stop further submissions without treating unanswered questions as failures, preserving first-submission scoring.

## 4 October 2026 — Practice set implementation and evidence

- Implemented the agreed pure codec/resolver, explicit author-editable catalogue, session coordination and semantic create/open/resume/page-navigation controls. Current content: four six-question plain pages and one spot-error page per existing level. Adaptive changes prioritise the corresponding authored page, with eligible bank fallback to avoid repeating submitted questions. No content source or user-authored specification was modified.
- Set attempts are separate from ordinary learning-stage attempts, while sharing learner levels/history. Codes allow duplicate page entries and mixed topics; actual extra topics still require bank/catalogue/loading work. Unavailable combinations report an error. Super challenge is reserved, not implemented.
- Timers persist an absolute whole-set deadline. Expiry blocks answers without scoring unanswered work. Initial review found expired runs could move backwards but not forwards to an already-entered page; corrected that boundary and added a regression assertion. New pages remain blocked after expiry.
- Initial cached verification passed: 36 Node tests, authored catalogue/bank, formatting, Svelte diagnostics, static build, presentation, semantic colours, startup, Practice sets and existing activity integration. The new deterministic browser scenario covers four-page code creation/completion, reload, invalid input, modulo fallback, virtual-clock expiry and the mobile builder's automated accessibility checks (about four seconds). The final navigation correction passed the affected jobs. Presentation initially hit ETIMEDOUT writing a screenshot in the synced workspace; the cached retry passed (2.6s), as did Practice sets (3.5s) and existing integration (13.1s). No application assertion failed.
- Added the Practice set job to the dependency map; untouched bank/colour/startup results were reused on the corrective run. Documentation records bit layout, authoring/replacement policy and present limits. No deployment or commit; manual device/assistive-technology review remains outstanding.

## 4 October 2026 — header code entry, hidden creator and progress access

- Moved code entry to the right of the topic title, with a stacked narrow-screen layout. The existing creator now opens from Menu → Create Practice set in a Bits UI dialog; generating a code closes it and focuses the entry field. Active-set status remains below the title.
- Added a clear Progress header control opening an accessible saved-progress summary: submission totals and recommended independent/error-spotting levels per topic. It reads existing profile data; marking/adaptation are unchanged. The existing activity panel still provides recent success, trial and reassessment information.
- This is a summary, not the full planned reporting feature. Combined topic scoring, detailed history views, export/import and cross-device reporting remain outstanding. No invented aggregate percentage was introduced.
- Browser testing caught a real 500 rendering regression after name selection: the new Bits UI trigger ref was bound to undefined, conflicting with its default. Initialising the ref to null fixed it. Compilation had passed and did not detect this runtime failure. Added captured console errors to presentation failure logs because Svelte handled the error without a pageerror event; this avoids opaque selector timeouts during diagnosis. Corrected build, presentation, colours, startup and new Practice set/menu/progress checks pass. The dialog-close test initially asserted immediate DOM removal; changed it to await the accessible dialog becoming hidden, matching the asynchronous close lifecycle.

- Final evidence: all selected checks passed, including 36 logic tests and existing activity integration (12.7s). The final browser scenario verifies the four-page flow, mobile dialog accessibility, 24 saved submissions in Progress and focus return. No deployment or commit.

## 4 October 2026 — dedicated progress page specification

- User requested requirements documentation only. With explicit permission to update the spec, appended a dedicated section to web_format.md; preserved the existing authored text. No application behaviour changed in this task.
- Recorded a separate header-linked progress page with topic rows, three/future-four challenge stages showing each level's success rate, last-practised date and proposed topic answer totals. Tap/hover detail shows success and answer counts by question type; keyboard access follows the existing whole-site accessibility requirement.
- Recorded working JSON export/import and CSV export on that page; JSON must contain username. These controls are required future work, not implemented or placeholders accepted as complete.
- Recorded exact revision bands (<50% red; 50–<75% amber; ≥75% green), insufficient-data grey with the requested missing-data message, and stale-data icy texture with the requested retained-skills message. Text accompanies visual indicators.
- Kept undefined details explicit: minimum evidence, stale interval, row-level score/overlapping-state policy, aggregate/window/counting rules, import scope/schema/collision handling and fourth-stage availability. Did not invent defaults or conflate absent data with failure. Current implementation remains a basic summary dialog plus in-activity progress; the new page and transfers are not yet built.

## 4 October 2026 — revision recommendations and completion recognition

- Added the requested automatically compiled, persisted revision Practice set list and weekly recommended-set completion history to the progress-page spec. Each recommendation has four pages. Priority order is explicitly missing/insufficient data first, then success-percentage priorities, then stale data; weaker success is the revision target.
- Incorporated the user's correction: opening shows “Recommended practice set”; only completion shows the “Well done! Your focused practice will help your grades” encouragement. This supersedes the assistant's earlier opening-time praise suggestion. Opening alone earns no weekly completion.
- Opened but unfinished recommendations must be identified and flagged with the requested question about problems/barriers and instruction to let the teacher know. No automatic teacher messaging is implied. Opening, completion and weekly records persist with learner progress and its JSON transfer; repeated refresh/reopening of one completed attempt cannot duplicate credit.
- Recorded this week's completed recommended-set count, personal weekly record and “Can you beat your record this week?” self-competition. Refreshing the recommendation list must retain unfinished follow-up and completion history.
- Still open: refresh/list/tie/page-allocation rules, follow-up timing, timed/partial completion criteria, credit for a fresh repeat attempt, and week boundaries. No implementation or invented thresholds in this documentation task.

## 4 October 2026 — progress tracking implementation started

- Using the moved repository at /Users/joehudson/Dev/Maths/practice. The old copy still exists; edits apply only to the new checkout. Earlier interruption left no progress-feature edits in this checkout.
- Implementation defaults (adjustable policy, not earlier user decisions): dashboard uses ten weighted recent scored answers per type/level, missing evidence below five, stale at 28 days, UK Monday–Sunday weeks. Plain type weight ×2, others ×1; missing types are excluded from numeric averages but force the grey state. Row colour uses each type's recommended level; stale texture can coexist. Manual recommendation changes do not themselves create success evidence.
- Counts/last practice use recorded first submissions, including assisted/assessment/guided answers; retries are not extra records. Success excludes assisted correct outcomes, as existing adaptation does. Three stages shown for current content; fourth appears when authored content exists.
- Keep one pending four-page recommendation, preserving its recipe until completed; then generate another if priorities remain. Rank missing data, then rates below 75%, then stale. Cycle ranked eligible topic/type choices to fill four slots; current bank has only one topic. Fresh generated recommendations can earn credit, but a completed recommendation cannot earn a second credit. Completion means all four pages submitted, not all correct. Expired partial sets do not count. Returning to Progress with an opened incomplete recommendation shows the teacher follow-up.
- JSON v1 transfers one named learner's history, tracks and revision records, not drawings or partial page attempts. CSV exports submitted-answer rows. Imports validate first and require explicit replacement confirmation on username collision; no silent merge. These defaults are recorded openly for review.
- Page/domain/transfer source is now being installed; tests and browser verification remain to be completed. No deployment.

## 4 October 2026 — scoring clarification and recommendation generation limits

- User clarified: retain the established percentage scheme and all recorded outcomes by topic/type/level. Five scored answers is only a minimum initial evidence threshold. Supersedes the assistant's proposed fixed ten-answer dashboard window; use the existing page-size-dependent weighting/window, recording page size with future submission events. Existing history is not truncated.
- On Progress page load, preserve and fill the list to three unfinished four-page recommendations. Supersedes the assistant's one-pending-set default. At 15 completed recommendations in the current week, stop automatic generation, retain existing pending work, congratulate the learner and offer explicit generation of more sets.
- Requirements persisted in web_format.md under the existing authorisation to document progress requirements. Implementation is being revised to match; no claim of completed verification yet.

## 4 October 2026 — progress implementation and verification checkpoint

- Built the dedicated static Progress page, topic/level/type summaries, dated totals, colour/grey priority, stale texture and accessible Bits breakdown. Header uses a real page link. Removed the old summary dialog; existing in-activity scoring is retained.
- Implemented selected-learner JSON transfer (username included), strict validation before mutation, explicit same-name replacement and CSV history export. Import deliberately restores history/levels/revision records, not partial page attempts or sketches; stated in UI and README. New answer records retain pageSize so summaries reuse the exact existing scoring scheme. Legacy records use saved/default page size because the original window was not recorded.
- Implemented three pending recommendations on Progress load, separate resumable local attempts, priority ordering, completion-only credit/praise, unfinished follow-up, UK weekly totals/personal best, and automatic-generation cutoff at 15 with optional extras. These supersede the initial one-set/fixed-window proposals above.
- 44 logic tests and all selected checks passed before final dead-code cleanup: bank, Svelte, static build, presentation, colours, startup, Practice sets, new Progress browser flow and activity integration. New Progress browser flow took 2.1s. Early verification caught a non-reactive save callback (fixed); test selectors needed updating for three recommendations and asynchronous navigation. A second formatter pass resolved a new browser-file formatting warning. No known application assertion remains failing.
- Final cleanup removes the obsolete summary snapshot/styles; cached verification will cover its affected inputs. Manual screen-reader/device review and wider-topic content remain future work. No deployment; user .DS_Store changes untouched.

## 4 October 2026 — persisted export date and ten-day reminder

- User requested a locally persisted last-export event date and a reminder at ten days or longer to export to cloud storage. Added learner-scoped backup metadata and visible reminders on practice and Progress, with a direct link to the export controls.
- Both JSON and CSV download triggers update the date/type; failed triggers do not. The browser cannot confirm cloud delivery, so UI says export started and asks the learner to save the file. JSON carries backup metadata through import. New learners start the reminder clock at first Progress visit or first recorded activity; older learners use their earliest activity if no export metadata exists.
- Added exact-ten-day, JSON/CSV reset, import and learner-isolation logic coverage, plus browser reminder/date persistence checks. Verification pending for this final addition; preceding feature checks all passed.

- Final export-reminder evidence: 45 logic tests and all mapped checks pass (format/docs/bank evidence, Svelte/static build, presentation, colours, startup, Practice sets, Progress and existing integration). Browser Progress flow (2.1s) verified overdue reminder, export timestamp persistence and clearing across reload, plus transfers/recommendations/weekly cap. Integration passed in 12.5s. No task processes left running; changes remain uncommitted.

## 4 October 2026 — JSON-only backup reminders; CSV as a follow-up

- User corrected the backup rule: only JSON export resets the persisted backup date/reminder. CSV export no longer updates it; previous CSV-only dates are ignored as backup evidence. This supersedes the earlier both-formats rule above.
- CSV is offered only after a JSON download is triggered during the current page visit, with “Would you also like to save a CSV version to view in Excel?” Reload/import/learner change hides the offer again. JSON remains the primary restorable export.
- Updated spec, reminder wording, logic/browser assertions and handoff. All selected checks passed, including 45 logic tests and browser checks confirming CSV stays hidden until JSON export and does not alter the backup date.


## 6 October 2026 — project moved to Maths root

- User moved project contents from `/Users/joehudson/Dev/Maths/practice` to `/Users/joehudson/Dev/Maths`, corrected `.agents/skills/`, discarded Pylance’s unsaved import rewrites and deleted the old folder. Earlier dated paths above describe the previous layout; open `Maths/` as the workspace root now.
- Updated HANDOFF, the website run directory and five legacy topic README root references. Corrected eleven legacy README links to the existing root `content/` directory. Internal project-relative paths otherwise survive the move; no specification, Python or application changes were needed.
- `.git` was previously inside the deleted folder and is absent from the new root. Git status fails; the normal verification command from `website/` fails during Git file discovery. An initial invocation from the project root also failed because the npm script belongs to `website/`. No Git metadata recovery or new repository initialisation was attempted.
- Direct file-link verification across 22 development/legacy Markdown documents: 139 non-archive links resolve; eight historical links to retired `_prevN` PowerPoint/PDF artifacts remain unavailable. No application tests or legacy publishers ran. Restore original Git metadata before Git-dependent verification or history work.


## 6 October 2026 — recovered layout, refactoring guide and Progress styling

- User restored the project to `Maths/practice`, recovered Git metadata from the older backup and committed the reviewed current files as `bbf7db1`. This supersedes the previous root-layout and missing-Git state. Website commands run from `practice/website/`.
- Added `docs/T_LEVEL_REFACTOR_AGENT_GUIDE.md` as a standalone transferable implementation brief for the T-Level starter. It covers migration boundaries, incremental delivery, Svelte state, Tailwind composition, daisyUI foundations, Bits UI behaviour versus appearance, persistence, theme preservation and focused verification.
- Investigated missing-file concerns before accepting the styling correction: all six CSS files in backup commit `1997610` remain present, the new `progress.css` exists and is imported, and the root layout still imports the shared stylesheet. Backup and recovery versions of `theme-controls.css` are identical. Only the obsolete ProgressDialog was removed from application source. The later original commit `18f4c08` is not available in the recovered object database, so this comparison cannot prove completeness of never-backed-up changes.
- Actual defect: shared panel classes were present on the Progress popover but its surface/padding/border/stacking CSS targeted only the theme picker ID. Moved shared appearance to `.theme-menu`; theme-picker-specific child styling stays scoped to its ID. Progress header's Back to practice link now uses existing themed navigation classes.
- Added browser assertions for nontransparent panel background, border/padding/stacking, viewport containment and themed back-link colour. All selected format, docs, logic, bank, Svelte diagnostics, build, presentation, colours, startup, practice-set, progress and integration checks passed. Initial browser run was blocked by sandbox local-server EPERM; rerun outside the sandbox passed. No deployment or source-resource regeneration.


## 6 October 2026 — surface-preserving button hover

- User requested a shared hover rule retaining mostly the normal surface with a subtle selected-colour tint. Replaced ordinary action-button hover's `--surface-soft` with 90% normal surface / 10% `--selection-base`; reusable `.hover-tint` supports other surface controls and a `--hover-surface` override. Primary/current-step/quiet actions retain their existing treatment; disabled buttons do not receive the tint.
- Added the standing rule to UI_UX_RULES. Browser regression exercises real pointer hover for action buttons and opt-in controls across all eight default palettes/modes. Selected format, docs, build, presentation, semantic-colour and practice-set checks passed.


## 6 October 2026 — sketch-pad interrupted release

- Investigated strokes continuing after outside release. Normal captured outside release passed; deliberately losing capture before release reproduced continued drawing on return. Previously only pointerup/cancel ended a stroke.
- WorkingArea now tracks the drawing pointer, ends on capture loss or window blur, and checks the pressed-button bit on pointer entry and movement. Unpressed re-entry explicitly lifts the pen; movement retains a cheap fallback for missing releases without a new entry. Existing strokes are retained, and a new press starts a fresh stroke.
- Browser regression covers normal outside release, lost capture, unpressed re-entry and drawing again. Format, Svelte diagnostics, build, presentation, colours, practice sets, progress and integration passed.
- Preserved the user's current 75/25 surface/selection hover mix and aligned its earlier 90/10 test and standing rule. Colour-test probes now have stable positions. Progress test now uses hover to open the panel: its old mouse click could immediately close the hover-opened panel before style inspection. An attempted positioning wait did not address that race and was removed. No app popover behaviour changes in this fix.


## 6 October 2026 — simplify sketch pointer handling

- At the user's request, removed the redundant button-state check from pointer movement. The entry handler only checks pressed state and delegates to the shared `end` function; movement only checks active-stroke/pointer ownership. Removed unused boolean returns and a duplicate reset in Clear. Release, cancellation, capture loss and window blur still share the same stroke-ending path.
- Final format, build, Svelte diagnostics, presentation (including outside-release/re-entry regression), practice sets, progress and integration checks passed. The preceding run detected the final simplification arriving during verification and correctly required a rerun; results above cover the final source.


## 6 October 2026 — code-comment policy and concise transfer brief

- Reviewed the user's CODE_COMMENTS policy and linked it from INDEX and the architecture guide. The user's later clarification supplies exact header labels, excludes HTML sources and requests lighter CSS headers. Policy wording was preserved; noted spelling nits (`synomym`, `uncessary`) and the maintenance cost of caller/callee documentation.
- User explicitly requested a retrofit of all original source, including legacy Python and tests. Documented 96 source files: 57 JavaScript/Svelte sources, 31 Python modules and eight stylesheets. Headers describe purpose, main contents, consumers, local dependencies and library roles; CSS uses concise headers. Named functions have purpose/parameter/call notes, with examples for non-trivial behaviour and brief callback notes.
- Excluded dependencies, build artifacts, generated teaching HTML, exported chat, JSON data and the frozen CSS visual-reference fixture. No legacy publisher or content generator was executed. Syntax-tree comparison confirms unchanged executable structure for all 57 JavaScript/Svelte files and all 31 Python modules (161 documented functions); CSS declarations and the original HTML shell are unchanged. Test formatting adds only syntactic parentheses/whitespace, accounted for by structural comparison.
- Final selected format, documentation links, logic, bank, Svelte diagnostics, build, presentation, colours, startup, practice sets, progress and integration checks passed. Initial formatting from the repository root could not resolve the Svelte Prettier plugin; formatting from website/ succeeded.
- Added T_LEVEL_REFACTOR_AGENT_GUIDE_V2.md at the user's request: a 345-word transfer brief emphasizing required Svelte/Tailwind/daisyUI/Bits UI roles and an incremental, evidence-based migration while leaving architectural judgment to the destination agent. Kept and indexed the original guide.
- Empty docs/dev-log is a leftover from deleting its last dated log in commit 4bfc9d8 during consolidation into DEV_LOG.md. It has no current references and was left untouched.


## 6 October 2026 — local production builds and Pages deployment

- User chose a pre-commit local production build, with generated assets committed alongside source; a push to main deploys those assets through GitHub Pages without building on GitHub.
- Added and activated the tracked pre-commit hook, removed the build-directory ignore, and added the deployment workflow and publishing instructions. Hook tests cover failure blocking and staging of new/deleted assets; the local production build and selected browser checks passed (local-server sandbox restriction required an authorised rerun). Documentation links and whitespace checks passed. Hosting path configuration awaits the repository name. No publication occurred.

## 6 October 2026 — defer the publishing hook

- At the user’s request, unset local `core.hooksPath` until publishing is ready. Kept the hook and deployment workflow for later activation; normal commits no longer run the production build.

## 6 October 2026 — enable local production builds for GitHub Pages

- Confirmed origin joe312213/practice-gcse-maths, configured the production base path, and re-enabled the tracked pre-commit hook. The actual hook successfully built and staged production assets. Existing push-to-main workflow already uploads website/build and deploys without a GitHub source build.
- GitHub Pages activation remains pending: the CLI's active jhudshcg account lacks write access, while its stored joe312213 token is invalid. No commit, push or deployment was performed.

## 6 October 2026 — GitHub Pages activated

- Verified refreshed CLI authentication as joe312213 and enabled Pages with workflow publishing. Confirmed site URL https://joe312213.github.io/practice-gcse-maths/. No deployment runs exist yet; local production/configuration changes still need committing and pushing to main.
