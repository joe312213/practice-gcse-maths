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

## 8 October 2026 — Drawing assistance, three student topics and shared puzzles

Implemented the user's request for method-specific drawing assistance, the updated T-Level puzzles module, and initial coverage of lattice multiplication, bus stop division and equations. The user clarified that the primary student journey is topic-led: initial assessment → method learning/demo → scaffolded practice → spot-the-errors practice → independent practice. Practice sets remain secondary and may mix methods/types. Navigation labels and optional code entry now express that distinction; the standing rule is in UI_UX_RULES.

Grid/Frame tools collect dimensions beneath the canvas. Guide geometry reserves writing space; guide replacement retains ink, and blank guides are excluded from the working count. Guides are transient, collapse with the existing paper option, and clear with the question. Arithmetic method adapters use the existing ShowDemo controller; lattice frames reveal cells/diagonal carries and division frames preserve quotient zeros, remainders and decimal placement. Remainder-format marking and properly grouped numeric answers are supported without eval or floating-point tolerance.

Imported M01/M02 via the new read-only `prepare_web_arithmetic.py`: 94 questions each, stable source IDs, questions checked against saved decks, assessment questions read from those decks, and 18 original spot-error SVGs/corrections retained from saved answer HTML. Source hashes and audit coverage are in ARITHMETIC_IMPORT_AUDIT.json. Arithmetic error activities require a correction choice plus a final answer. The original 95-item equation bank, protected specification, authored topic Markdown and legacy files remain unchanged. Topic selection, mixed-topic coded sets, Progress and recommendations now consume all three banks. Existing schema-2 history remains intact.

Downloaded the updated https://github.com/jhudshcg/starters source at `69560b227aaedefe72457241a53205ee93b7e024`. Its `packages/puzzles` directory is copied unchanged into `website/vendor/puzzles`; exact tree comparison passed. A local npm dependency supplies its declared mathjs 15.2.0 dependency. `/puzzles.html` loads the catalogue on that route only, mounts/disposes the package's own controls, and supplies type/challenge selection, checking, hints, solutions, next variation and source attribution. Theme tokens map to the package style contract. All nine families are exposed; working/marks are transient and explicitly separate from topic progress/exports. Upstream difficulty labels are retained, not recalibrated.

Verification initially exposed equations-only test fixture assumptions and stale loading text; focused fixtures now explicitly scope their catalogue and new tests exercise the three real banks. The arithmetic validator initially used floating-point multiplication for decimal checks; it now checks exact fractions. Browser test server binding was blocked by the sandbox and succeeded with permission. Svelte diagnostics reported a circular `esrap` public type export. A proposed 2.3.6 pin was declined; investigation found the original cached 2.4.0 archive had correct declarations and matched the locked SHA-512, while the installed copy differed. Restored the original 2.4.0 package locally; after normal build/sync/diagnostics its tree still matched the archive. No downgrade or permanent patch was needed; cause of the installed-file alteration is unknown. About source was whitespace-formatted only to satisfy the formatter baseline; authored wording is retained.

Final selected verification passed: formatting/docs, 50 logic tests, bank/catalogue validation, portable puzzle-library tests, zero-error/zero-warning Svelte diagnostics, production build, new-topic/puzzle mobile scenario, presentation/default colours, startup faults, Practice sets, Progress and activity integration. The new browser scenario covers guide retention, both demos, answer history, original error images, correct/blank puzzle checks, hint reset, solutions and mounting all nine types without page overflow. Manual touch/stylus/assistive-technology review and classroom puzzle calibration remain unclaimed. No commit, push or deployment performed.


## 8 October 2026 — Compact search entry and resizable sketch canvas

Replaced the visible Optional Practice set label and large submit button with an accessible hidden label, exact placeholder `practice code or search`, and compact Go button kept immediately to the field's right. Removed the nine-character input limit so free text works; underlying case-sensitive codes are unchanged. Topic title/ID/tag word-prefix search accepts lattice/multiplication, grid/multiply, bus stop/divide and equations/algebra aliases. Words in one query all match the same topic; commas combine topics. Each match contributes one random independent-practice page to an untimed set, with the existing saved challenge override. Known text matches precede code syntax to handle the nine-letter word “equations”. No match gives suggestions without replacing the activity. Arithmetic bank regeneration now preserves catalogue search tags.

Added a separate touch/pen/mouse resize grip below the canvas, keyboard Up/Down adjustment and Home reset. Default height remains 230px; range is 120–800px. Bitmap height changes at the existing vertical scale and stored strokes/guides are repainted. Shrinking hides rather than deletes lower working; expansion restores it. Paper collapse keeps the chosen height and question changes reset it. The resize pointer lifecycle is separate from drawing and ends on cancellation/capture loss/window blur.

All selected verification passed: formatting, production build, docs, 51 logic tests, bank/catalogue, Svelte diagnostics (zero errors/warnings), new-topic browser scenario with pointer/keyboard resize and bitmap recovery, presentation/default colours, startup, mobile Practice set/search, Progress and activity integration. Browser checks needed the existing local-server permission. Existing development server remains at http://127.0.0.1:8766/; no commit or deployment performed.


## 8 October 2026 — Header control placement and smaller canvas grip

Moved code/search to the top right of the topic header beneath the main navigation, with the topic selector directly below it. The Go button uses the standard action-button size. Both controls remain responsive and retain their existing accessible labels and behaviour. Reduced the canvas grip from 64×24px to 40×16px. Selected formatting/build, logic, Svelte diagnostics, new-topic/resize, presentation, colours, startup, Practice sets/search, Progress and integration checks passed; no new tests were added for this layout-only change. Development site remains running; no commit or deployment performed.


## 8 October 2026 — Compact search width on all screen sizes

Reduced the search field to a preferred 15rem width and made its row/header controls use their content width rather than fill the mobile container. The row stays right-aligned and may shrink when necessary to avoid overflow. Selected formatting, build, docs, new-topic interactions, presentation, colours and mobile Practice set/search checks passed. Development server remains running; no deployment.


## 8 October 2026 — Consistent topic-header right gutter

Fixed intrinsic grid sizing that allowed the controls to extend beyond their allocated flex width. The title now has a named, shrinkable flex item; the controls use an explicit minmax(0, 1fr) track, keeping both rows within the header without compensating margins or clipping. Compact search width and standard Go size remain. Presentation regression checks passed for all three topics at seven viewport widths (320–1600px), asserting both controls share the header’s right gutter and search stays compact. Selected verification results are recorded in HANDOFF.


## 8 October 2026 — Notes containment and medium-width header

Capped writing surfaces at their calculated card width and restricted the notes textarea to vertical resizing, preserving edge-to-edge and inset variants. Replaced the header’s fixed 767px stacking rule with flex wrapping and an 18rem preferred title basis: medium widths wrap the title/description beside the controls, while phones stack them. Selected formatting, production build, new-topic, presentation, colour and Practice set checks passed. Presentation covers eight header widths including 720px side-by-side and phone stacking, plus oversized textarea width containment across nine viewports. No deployment performed.


## 8 October 2026 — Puzzle icon selection and development loading fix

Replaced the puzzle-type dropdown with wrapping illustrated buttons using the unchanged shared graphics/captions, following the cached T-Level source’s `js/puzzle-cards.js` pattern. The initial screen has no selected type or challenge field; choosing a type exposes its challenge selector and puzzle. Buttons expose their selection state and keyboard activation. The existing new-topic scenario now exercises this selection flow and challenge switching, along with all nine families. Its first run exposed a missing test navigation wait, which was corrected.

The user also reported “Puzzles could not load”. The running Vite log proved the dynamic vendor catalogue was outside SvelteKit’s serving allow-list. Added only `vendor/puzzles` to the Vite development allow-list; the live development browser scenario then passed, including all nine puzzle families. Production bundling had previously passed because it does not use this serving restriction. No package contents changed.

The user supplied a visual example and requested hiding the grid after choosing. Tiles now use the reference’s lavender/green/gold artwork backgrounds; selecting a family hides the grid, names the family in the heading and focuses it. “Choose another puzzle” reopens the grid and restores focus to that family. Browser coverage checks hiding, keyboard entry and return focus as well as all nine families.

The Go reference screenshot prompted a dedicated Svelte composition using the package’s supported render/bind APIs, with no vendor edits: strategy/next-move hints above the board, coordinate/source/rules below, and unhighlighted turn text. Go challenge labels now include the same kyu ranges as T-Level. Regression checks cover both hint controls, attribution placement, turn styling, a played move, Undo, checking and solution replay. Svelte diagnostics identified non-reactive component references in the wrapper; those were made reactive. The user then requested hiding maths puzzles; the Classic maths tile is excluded, leaving eight selectable types, while library content is preserved.


## 8 October 2026 — Remove development field-style selector

Removed the Field style (dev) selector, its state/import, the unused inset CSS variant and its obsolete browser assertion. Both writing surfaces now always use the existing full-card-width square-corner style, with the width cap and vertical-only textarea resize retained. Existing responsive full-width checks remain.


## 8 October 2026 — Hamburger menu trigger

Replaced the visible Menu text with a three-line SVG icon, retaining the Menu accessible name and tooltip, a 44px target and the existing Bits UI popover/focus behaviour.

The user also selected Rose as the default theme. Updated initial HTML palette and theme-preference fallback; saved choices still take precedence.

## 10 October 2026 — live question, hint and answer-note review

Review only, using maths-problem-development: inspected all 283 live M01/M02/M10 questions, teaching text, error choices and feedback/hint rendering. Arithmetic answers were recomputed exactly; equation answers with coefficients were checked by substitution, with the remaining nine error-question answers checked manually. No incorrect final answers found. This was not a visual audit of the saved error diagrams, a puzzle review or a review of unimported topic drafts. No question, source deck or application code changed.

Candidates, in priority order:

1. All 18 arithmetic error questions expose final answers in correction choices, reusing corrections from neighbouring questions as distractors (`scripts/prepare_web_arithmetic.py`). Use plausible corrections to this question's working without final answers. Preserve full explanations for post-answer feedback.
2. Hints are topic-wide templates (`website/src/lib/application/session.mjs`, hint action), not question-specific. They appear in the global toast; the text beside Hint only explains assisted scoring. Repeated presses do not hide the hint. Use a small question-specific prompt near the button, with separate visibility and permanent assistance tracking. Examples: 227 ÷ 6 — “After 22 ÷ 6, how does the remainder change the next digit, 7?”; 3(x − 4) = x − 16 — “What must 3 multiply inside the bracket?”
3. M10-S06-C1-Q3, x ÷ 2 = 0: `wrong` equals the correct answer 0. An incorrect method can accidentally yield the right result. Retain zero if useful, but remove this misleading wrong-answer note; assessing the operation requires a method response.
4. Ordinary arithmetic questions have worked diagrams and checks but no diagnostic notes: only 9/94 questions per arithmetic bank have notes, all error questions. Existing source answer notes provide useful candidates, e.g. M02-S03-C3-Q1, 3,827 ÷ 25 = 153.08: explain why 20 ÷ 25 requires a tenths zero, targeting 153.8.
5. Decimal division checks use integer quotient × divisor + remainder. True, but they do not verify the displayed decimal conversion. M02-S02-C3-Q1: supplement 320 × 16 + 2 = 5,122 with 2/16 = 0.125 and/or 320.125 × 16 = 5,122.
6. Confidence division has repeated halving questions: M02-S04/S05/S06/S07-C3-Q2 are 785/943/859/967 ÷ 2. Consider retaining one bridge question and replacing/reclassifying the repeats to exercise carrying with less immediate divisors, while respecting terminating-decimal requirements. Start has 8/24 independent answers equal to 11 or 111; reduce repeated-digit patterns while retaining accessible no-carry practice.
7. Some lattice questions test size more than carrying: M01-S04-C2-Q3 (51 × 22) has no diagonal carry; M01-S04-C3-Q4 (2,105 × 304) has many zero/unit-factor cells. Retain selected zero-place-value examples; consider stronger carrying examples elsewhere. Large four-digit products remain an explicit project requirement.
8. Equation notes repeat category wording instead of identifying the actual numbers/signs. Example M10-S03-C1-Q1, 6x = −18: explain dividing both sides by 6 and why the result is negative. M10 Confidence factor questions such as S04-C3-Q2 (5x + 10 = 20) can be solved by ordinary Build-level steps; explicitly ask for/explain the common-factor route if that is what should be assessed.
9. Equation error corrections sometimes switch method in the full worked answer (M10-SE-C2-Q3 and SE-C3-Q1), despite asking learners to repair a particular step. Show the repaired route first, then the alternative. M10-SE2-C3-Q1 intentionally marks a later correction against the displayed erroneous line (subtract 3), while repairing the original equation requires subtract 6; clarify this distinction in the task prompt.

These are proposed improvements, not authorisation to replace accepted questions. Next implementation should prioritise answer leakage and hints, then diagnostic feedback, then an agreed challenge rebalance. Existing unrelated CODE_STYLE and skill changes were left untouched.

Review-record verification: the default runner was first invoked from the root (no matching script), then correctly from website/. It selected broader checks, passed formatting/build, and stopped at a browser server bind denied by the sandbox (EPERM). Browser execution is unnecessary for this source review and was not escalated. Generated build changes from this invocation were reverted to the previously clean build state. The documentation link check was run separately.

## 10 October 2026 — question-review improvements implemented

The user authorised all review candidates and requested exploratory bracket hints: “What would the left side look like after expanding the brackets? Does it help?”

- All 283 questions now have authored hints. The Hint button expands/collapses nearby text, with accessible state; visibility resets on navigation and remains separate from persisted assistance. Hiding/revisiting/reloading does not restore unassisted scoring.
- All ordinary arithmetic questions now have specific method and likely-error notes. Decimal checks multiply the complete decimal quotient back by the divisor. Source notes about missing integer/tenths zeros were incorporated. Arithmetic error choices now contain three plausible repairs to the same calculation, without final answers; correct choice IDs and saved wrong diagrams are preserved. Repeated correction text is not shown twice.
- M10 notes use the actual operations/numbers/signs. The zero division question retains its answer but no longer calls it a wrong answer; its note explains why an incorrect operation can accidentally produce zero. Six common-factor questions explicitly request the factor method. Full error solutions follow the repaired route before mentioning alternatives, and the two-error instructions distinguish local printed-line repairs from correcting the full solution. Redundant final division-by-one steps were removed where x was already isolated.
- Eleven web-only arithmetic revisions retain their stable IDs: multiplication S04-C2-Q3 becomes 57 × 26, S04-C3-Q3 becomes 4,876 × 357, S04-C3-Q4 becomes 6,785 × 347; division S05/S06/S07-C3-Q2 become 943 ÷ 8, 859 ÷ 5, 967 ÷ 16. Five repeated Start patterns become 86 ÷ 2, 966 ÷ 3, 848 ÷ 2, 684 ÷ 2, 693 ÷ 3. One Confidence halving bridge and purposeful zero examples remain.
- Authored arithmetic support lives in `content/M01_M02_web_support.json`, applied after auditing legacy source expressions. The import audit records all source/website replacements. Both importers ran successfully; saved decks and all 18 error SVGs remain unchanged. Existing revision handling refreshes outdated attempts while preserving submitted history and tracks; no schema migration was added.
- The first full selected verification passed formatting/build, bank checks, 52 logic tests, Svelte diagnostics and browser scenarios (arithmetic/puzzles, presentation, colours, startup, Practice sets, Progress and activities). Browser tests needed local-server permission after the sandbox denied binding. Final wording cleanup and documentation are awaiting the final selected rerun at this checkpoint. No commit, push or deployment performed.

Final verification: `npm run verify:changed` passed after the content/feedback cleanup (format/build, new-topics, docs, 52 logic tests, bank, Svelte/diagnostics, presentation, startup, Practice sets, Progress and integration). Earlier unchanged colour evidence was reused. Saved decks, error SVGs and catalogue are unchanged. A whitespace review found only the pre-existing CODE_STYLE trailing space; that unrelated authored change was left untouched. No processes from verification remain running.

## 10 October 2026 — layout, progress and drawing fixes; storage discussion

User requested a shared-template audit, overlapping progress-popup fix, shareable topic links, baseline confirmation, retained question working, drawing tools/colours, issue reporting and progress/time history. User explicitly selected the T-Level timing algorithm, then asked to discuss alternative storage options. No persistence schema has been changed while that decision is pending.

Independent implementation: SiteHeader/SiteFooter now own common brand/navigation/theme/report markup across routes; generic popovers share one panel style instead of borrowing a theme-specific class. Shared notification CSS removes duplicate declarations. Progress panels use a grid-wide open identity, delayed hover dismissal and preserved keyboard/touch controls. Stable topic URLs survive learner selection and have a copy action. Initial assessment is derived from existing history as the first complete assessment (or explicitly incomplete evidence), separately from practice scoring.

Drawing uses a shared renderer and theme-independent stroke colour IDs, an X clear action, a separate eraser with five times pen area, and four inks whose HSL lightness inverts in dark mode. Erasing removes ink to the canvas background, including over guides. The issue dialog follows the T-Level preview/copy/email-draft pattern. These changes are undergoing selected verification; working persistence and timing/history presentation remain unfinished pending storage decisions.


## 10 October 2026 — JSON progress and session working agreed

User chose to retain JSON storage and clarified that drawings need only last a session/about three hours. Implemented an expiring sessionStorage working cache, separate from durable progress. Retained schema-2 local progress; added measured active time in per-topic visit/hour buckets and JSON export v2 with v1 import support. Integrated the T-Level two-minute idle/five-second poll/hidden-pause rules; transient clocks never charge absence after reload. Added weekly minutes and per-level success views, with explicit unknown historic timing and a separate initial assessment baseline. SQLite remains deferred; no backend/storage engine migration is authorised or needed for this slice.

Independent shared header/footer/report controls, share links, popup dismissal, drawing tools/colours/theme inversion are implemented. Browser restoration tests exposed Chromium edge-rasterisation differences between canvas instances; tests now assert restored ink/erasure/guide pixels with exact logical-stroke tests separately. Removing an unnecessary stroke-end repaint preserves pointer-release bitmap behaviour. Verification is still in progress; no final pass claimed here yet.


Final verification: `npm run verify:changed` passed, with cached selected coverage of 59 logic tests, format/build, Svelte diagnostics (zero errors/warnings), drawing/topic restoration, presentation, default colours, startup faults, Practice sets, Progress/accessibility and activity integration. The installed browser test clock confirmed 65 seconds of unfinished practice appears as 1.1 minutes on Progress. The weekly table is a labelled, focusable scroll region for keyboard users on small screens; its Svelte noninteractive-tabindex exception is explicitly documented, and the automated accessibility check passes. No verification process remains running. No commit, push or deployment was performed. Manual touch/stylus/screen-reader review remains unclaimed.


## 10 October 2026 — softer drawing surface and tool selection

User requested a more subtle selected-pen highlight and reduced canvas contrast. Changed the shared selection outline from solid two-pixel text colour to a one-pixel muted outline, preserving keyboard focus. Canvas backgrounds are now off-white `#f2f2f2` and dark grey `#202020`. Updated the existing browser expectation. `npm run verify:changed` passed all selected checks: formatting/build, drawing/topic, docs, presentation, colours and Practice sets. No commit or deployment performed.


## 10 October 2026 — topic homepage and clean subject/topic URLs

User approved Build-level card examples and lowercase Foundation Maths routes. Implemented the topic homepage, server-built previews from existing banks, shared TopicPractice and explicit prerendered `/fm/[topic]/` directory pages. Removed ShareTopic and its styles, updated dropdown/Progress/recommendation links, and retained forwarding for already-shared query links. No progress ID or storage schema changes.

The first Practice-set browser run exposed that an active mixed-topic set could be replaced by the URL's topic on reload. Active sets now carry their existing shareable code in `?set=...`; reload resumes the matching saved set, while a plain topic link reliably opens its topic. Set links also work through name selection. All selected verification subsequently passed: formatting/build, bank, 59 logic tests, puzzle library, Svelte (zero diagnostics), homepage/examples/accessibility/static routes/Back/reload, drawing/topic flows, presentation, colours, startup, Practice sets, Progress and activity integration. No verification process remains running; no commit, push or deployment was performed.


## 10 October 2026 — compact, minimal topic cards

Removed the example/Build label and practice call to action from the topic cards, leaving the title and question only. Gave the homepage its own compact wrapping card layout, with 20rem preferred widths and full-width cards on screens 480px and below. Progress layout remains separately defined. `npm run verify:changed` passed all selected checks: format/build, docs, logic, Svelte, topic cards, presentation, colours, startup, Practice sets, Progress and integration. No commit or deployment performed.


## 10 October 2026 — narrower multi-card rows and layout discussion

Reduced topic-card width to two-thirds when multiple cards fit, using a card-container query; preserved single-card/mobile widths. `npm run verify:changed` passed all selected checks (format/build, topics, docs, presentation, colours, Practice sets). No commit or deployment performed. Worked-method previews and the topic-page sketch (wider question area, integrated working, progress above) remain under discussion, as does a twelve-question independent page. Inspection confirms 24 independent questions per level/topic, a ten-answer adaptive history cap and weights that currently reject sizes above ten. No question count or scoring change made.

## 10 October 2026 — revised workspace, worked topic cards and six-question assessment

Implemented the user's approved twelve-question independent pages while retaining the last ten eligible answers for scoring/adaptation. Added six-question assessments with two questions per level, preserving original question IDs, full history and completed four-question baselines. Two new authored assessment questions per topic live in `content/web_assessments.json`; both importers audit saved sources before applying these additions. Generated banks now contain 96 arithmetic questions each and 97 equations; saved slide resources were untouched.

Topic cards now show a Build demo question and compact worked solution using shared renderers. The topic panel spans the available width with up to three question columns, compact progress above, and selected question/answer alongside embedded working (stacked on small screens). Footer links have more space. Practice-set slots retain their authored lengths.

Verification: both importers passed source audits; `npm run verify:changed` passed all selected/cached jobs, including 61 logic tests, bank validation, formatting/build, Svelte diagnostics and all browser scenarios. The first runs identified generated-catalogue formatting and two outdated baseline/navigation test expectations; corrected before the passing run. Desktop homepage/topic and mobile topic screenshots were inspected. No commit, push or deployment performed.

## 10 October 2026 — chevron navigation and centred working

Replaced numbered stage buttons with joined right-facing chevrons. Moved shared Progress into the topic header, allocating about two thirds to stages and one third to progress at viewport widths ≥768px. Smaller screens stack/wrap. Centred and bounded the question/working columns with a smaller gap; removed the working heading and added a pointer-transparent canvas prompt which disappears on ink or guides and returns after clear.

Selected verification passed (build, 61 logic tests, Svelte and browser scenarios); desktop rendering inspected. Initial browser execution needed local-server permission. The drawing check caught a structured-clone failure from proxied guide state; raw reactive guide state fixed it and the rerun passed. No commit or deployment.

## 10 October 2026 — simplified working controls and straight stage end caps

Removed the paper checkbox/collapse behaviour and unused session state/styles. Drawing and typed working remain visible. Removed the textarea heading, kept its accessible name, and set “Or type your working here...” as its placeholder. Initial assessment has a straight left edge; Independent practice has a straight right edge.

Selected checks passed, including 61 logic tests, build, Svelte diagnostics, responsive presentation, drawing restoration and integration. An intermediate malformed responsive selector was caught by the 320px overflow check and corrected. No commit or deployment.

## 10 October 2026 — softer stage end corners

Reduced Initial assessment left padding to 0.6rem and rounded the outside corners of the first/last stage buttons to the standard 10px. Internal chevron joins remain. Selected verification passed: format/build, docs, topic/drawing, presentation, colours and Practice sets. No publication.

## 10 October 2026 — monotonic responsive workspace width

The 767→768px reversal came from card padding jumping from 18px to 24px and crossing the workspace container threshold. Replaced that jump with a continuous clamp and removed redundant mobile block-layout rules. Added a 2em active-question content inset, excluding the title. Added explicit 767/768/769px regression assertions. Selected verification passed, including responsive checks down to 320px, build, Svelte diagnostics and drawing/activity integration. No publication.

## 10 October 2026 — compact right-anchored progress

Kept progress content left aligned while anchoring its compact block to the right. Reduced the meter to 7rem. Replaced the fixed one-third progress track with a fluid bounded column, allowing stages more width near 768px without another breakpoint. Selected format/build, topic/drawing, responsive presentation, colour and Practice-set checks passed. No publication.

## 10 October 2026 — compact progress, hint note and stable header menu

Progress uses a compact right-anchored grid with “Level: [level]” and “recent success”, switching to a horizontal wrapping strip below 678px. Reduced active-question inset to 1em. The assisted note is 70% size and hides with the hint; scoring assistance remains recorded. Reserved header space keeps the hamburger top-right while other actions wrap. Desktop rendering inspected; all selected checks passed, including build, Svelte, responsive/drawing checks and integration. Documentation changed during one verification run, so the runner stopped and the remaining checks were rerun successfully. No publication.

## 10 October 2026 — corrected stage gaps and question title

Added 1em left margin to the active-question title. Reduced intro bottom spacing, set a 2rem gap between stages and progress, and replaced the reserved progress track with a content-sized track at the right gutter. The user's clarified meter sizes are 4rem below 1024px and 6rem at/above. Desktop rendering inspected; final selected build/format, docs, topic/drawing, presentation, colour and Practice-set checks passed. No publication.

## 10 October 2026 — UI taste and corrected spacing interpretation

The user rejected the over-tight intro/stage gap and requested persistent visual guidance. Added UI_TASTE.md and linked it from INDEX, UI rules and the framework skill. Restored a single 1.5rem gap owned by the stage header; assessment no longer reserves an empty progress column. Inspected the lattice assessment screenshot and added responsive gap assertions.

The user then corrected an implementation error: the title needs 1em left margin and remaining answer-column content 2em. I had collapsed these distinct requirements into one shared rule. Separated the rules and added computed-margin assertions at all presentation widths. Consolidated chevron depth and end variations in the shared stylesheet; existing semantic navigation remains the sole markup source. Final selected format/build, docs, topic/drawing, presentation, colour and Practice-set checks passed. No publication.

## 10 October 2026 — guide construction and native demo ink animation

Added shared guide-construction frames before arithmetic/equation writing. Lattice shows grid/diagonals being drawn, division draws its bus-stop bracket, equations draw the central line. Short first-step prompts connect construction to paper/exam working. Shared native Web Animations interpolate SVG strokes, divider height and text clipping; existing pause/resume/speed/replay/disposal coordinate them. Reduced motion keeps the instructional sequence without interpolation. No dependency added; static solutions remain complete. Text reveals in its existing font rather than tracing handwritten glyphs.

During this work the user reported collapsed scaffolded navigation. Root cause was my earlier unbounded intrinsic progress track: the scaffolded explanation consumed the row. Bounded the shared track and moved non-scoring explanation into the activity panel. No copied or stage-specific chevron implementation. Added layout coverage for all five stages at phone/tablet/desktop widths and inspected corrected scaffolded output at 768px.

Final selected verification passed, including 61 logic tests, banks, build/format, puzzle library, Svelte diagnostics, docs, native animation/pause assertions for all three guides, responsive layout and all selected browser integration scenarios. No publication.

## 10 October 2026 — digit-by-digit lattice and consistent stage spacing

Split lattice operand writing into individual digits, top left-to-right then side top-to-bottom. Cell products write tens and units in separate frames, proceeding across rows. Existing diagonal-addition order is retained. Fixed actual stage-button top spacing at 2rem by top-aligning the shared row; previous centre alignment allowed taller progress blocks to shift the buttons. Added subtle tint for stages before the active stage and removed topic-card gradients in favour of the theme surface.

Updated UI taste and standing rules. Added frame-order and browser digit-count checks, plus equal actual stage gaps and earlier-stage counts across all five stages at three widths. Final selected verification passed (62 logic tests, build, Svelte, responsive/drawing and all selected browser scenarios); homepage inspected. Initial integration axe audit reported the small visible portion of a button behind the theme popup as a target-size failure. The popup is now audited while open and the complete page after closure, retaining coverage of both surfaces; both passed. No publication.

## 10 October 2026 — session-close UI consolidation and next-session priorities

Distilled the current visual choices into UI_TASTE.md and reconciled UI_UX_RULES so outdated paper-collapse, two-column-only, fixed-third and earlier meter rules no longer compete with current guidance. Condensed HANDOFF to current state, evidence and ordered next work; corrected stale README descriptions. Historical decisions remain in this log/Git.

At the user's request, recorded next-session work: refine demos with number/digit highlighting to show the operands and current operations throughout the working, then plan personal cloud sync. No highlighting implementation, provider choice, cloud provisioning or storage migration was performed.

The user found flat topic cards too white, so restored a restrained gradient mixing 4–10% theme main colour into the surface. Reduced multi-card width to 13rem so all three fit at 768px. Added an exact-width browser assertion and inspected the resulting screenshot. Final selected format/build, docs, topic/drawing, responsive presentation, colour and Practice-set checks passed. No publication.

## 10 October 2026 — natural topic-card heights and quiet borders

Stopped flex-row stretching so each topic card keeps its content height. Added a 2px solid border using shared neutral control-border colour with a small main-theme tint; retained the subtle card gradient and three-card fit at 768px. Recorded masonry as the desired direction for a larger topic collection; no packing library or new layout engine added. Selected format/build, docs, topic/drawing, presentation, colour and Practice-set checks passed; inspected the 768px result. No publication.

## 10 October 2026 — softer topic-card borders

Reduced normal topic-card border contrast by blending 65% theme surface with 35% control-border, retaining 2px width. Recorded the lower-contrast preference in UI taste. Selected format/build, docs, topic/drawing, presentation, colour and Practice-set checks passed. No publication.

## 10 October 2026 — topic-card sorting backlog

Recorded the user's requested alphabetical and revision-priority sorting options in the roadmap and linked them from HANDOFF. Backlog only; current prerequisite ordering is unchanged.

## 10 October 2026 — raise adjacent progress summary

Applied the requested -1.5em logical top margin to progress at widths ≥768px, where it sits beside stage navigation. Stage-button spacing and stacked/mobile progress remain unchanged. UI taste updated. Selected build/format, docs, Svelte, responsive presentation, colours, startup, Practice-set, Progress and integration checks passed. No publication.

## 10 October 2026 — progress offset refinement

Increased the adjacent progress offset to -2.5em at the user’s request, superseding -1.5em. UI taste and HANDOFF updated. Selected format/build, docs, topic/drawing, presentation, colour and Practice-set checks passed.

## 10 October 2026 — timer-display preference backlog

Recorded next-session user selection for displaying a timer on scaffolded practice, spot the error and independent practice. Added to roadmap and HANDOFF; timer meaning/default/persistence remain open. No implementation or timing-rule change.

## 10 October 2026 — method-description highlighting backlog

Extended next-session demo highlighting to include the textual method-description step corresponding to the currently animated portion. Recorded in roadmap and HANDOFF; not implemented.


## 10 October 2026 — refactor review: docs alignment

Step 1 evaluation found conflicting hook/persistence guidance, stale feature status, missing skill links, misplaced content evidence and incomplete source comments. The user authorised action across all review steps, changed the intended working-cache lifetime to 48 hours with code explicitly deferred, and corrected the teaching-skill example themselves. Their CODE_STYLE addition requires keeping code/documentation alignment explicit; preserved both user-edited files.

Corrected README path, active publishing-hook guidance, JSON v2 contract, temporary-working description, arithmetic totals and eight-family selector. Reconciled roadmap availability and working retention; indexed both missing skills and grouped arithmetic evidence with teaching content. Kept the protected-specification redirect and both intentionally retained T-Level briefs. Historical log entries remain unchanged. UI_UX_RULES records the 48-hour requirement with an explicit three-hour implementation caveat; roadmap/HANDOFF identify the later TTL/test slice. Comment conformance proceeds in step 2. No tests run at this checkpoint; no runtime changes yet.


## 10 October 2026 — refactor review: code quality

Step 2 reviewed active domain/session/adapters, shared components, drawing/playback lifecycle and semantic styling against CODE_STYLE/CODE_COMMENTS. Found missing structured headers in ten JS/MJS modules and six Svelte components/routes, stale session/component dependencies, incorrect drawing-function examples and a malformed browser-test header containing stray source fragments. Added concise purpose/contents/consumer/dependency/library blocks and targeted function notes; repaired the stale comments. No architecture, theme, storage contract or mathematical behaviour was changed. Remaining comment work should follow the same policy as files evolve, rather than a generated caller-list rewrite. The legacy publishing scripts and imported puzzle package were not refactored.

Review of the resulting edits: timing/cache modules now explain injection and lifecycle; drawing/playback modules explain rendering ownership and disposal; route/shared component headers describe current consumers. Session comments distinguish restored working from reset answer entry. No new abstraction or dependency was introduced. Selected verification will run after the remaining coherent review fixes.

## 10 October 2026 — refactor review: implemented requirements

Step 3 compared startup/storage recovery, topic routing, five-stage navigation, answer advancement, assistance/scoring/history, assessment baselines, working restoration/tools, demo lifecycle, Progress/recommendations/export, puzzles and shared controls with the current rules and existing focused checks. Confirmed the apparent persistence/topic/puzzle mismatches were stale documentation. Clarified the standing error-spotting requirement: equation row/reason/correction entries versus the implemented arithmetic correction-choice flow; both still require the final answer. Corrected the assessment prompt's “messure” typo. No new runtime behaviour defect was established by this review.

Implemented: three-topic sets, six-question assessments, twelve-question independent pages with ten-answer scoring, JSON v2/v1 import, temporary working and active-time history. Explicitly deferred: 48-hour cache lifetime (current three hours unchanged), operation/method-step highlighting, timer visibility choice, sorting and cloud sync. These are not reported as delivered or defects to fix opportunistically. Visual/manual device claims remain limited to recorded evidence and the checks about to run.


## 10 October 2026 — refactor review: test quality and selection

Step 4 reviewed unit/session/browser boundaries, deterministic time/randomness, bank validation, cached selection and test readability. Existing tests cover exact arithmetic, adaptive thresholds/assistance, immutable submissions, set expiry/resume, import validation, recommendations, startup faults, drawing restoration, playback and responsive/accessibility behaviour. Found selection omissions after moving startup to TopicPractice and adding practice-history/time domains: their focused checks could remain cached. Added startup mappings for TopicPractice/shared header/theme controls, Progress mappings for history/time/code, and integration mappings for session-domain dependencies; regression cases assert these selections. Root Node tests now participate in changed-file formatting, addressing compressed newer test code.

Added working-cache tests for copy isolation, read-versus-edit expiry and blocked-storage fallback with one warning. Tests preserve the currently implemented TTL; the 48-hour change remains deferred. Enhanced docs verification to require INDEX entries for all maintained Markdown, including routed content/legacy documents, alongside existing active-link checks. No external-link/anchor audit or legacy deck regeneration is implied. README describes the adjusted verification boundaries. Verification pending.


## 10 October 2026 — correction: refactor discussion gates skipped

The user pointed out that the agent skipped the report/discuss stages for steps 2–4. The agent had incorrectly treated “action all steps” as permission to bypass those gates. Step 1 was agreed; later edits described above were made prematurely and must be treated as proposals awaiting separate review, not accepted changes. Stop implementation and resume with the step 2 evaluation/discussion. Preserve all user edits; no automatic rollback was performed.

Verification had already started: initial browser server bind failed with sandbox EPERM; an authorised rerun reused the completed format/build/puzzle checks. Additional checks reported passing through Practice sets before the correction. Verification rebuilt tracked website/build assets; no commit or publication occurred. Any passing result establishes technical evidence only, not user approval of the edits.

The already-running verification subsequently completed: all selected checks passed, including Progress and integration. No verification process remains running; the final pause-record edits were not rechecked.


## 10 October 2026 — step 1 repeated, discussed and corrected

The first step-1 completion claim was too broad: duplication, ambiguity and the full documentation inventory were not sufficiently covered. After the user strengthened project-refactor-checks, the agent repeated the evaluation and reported all nine criteria before editing. Coverage included current policy/guidance, teaching-source status/instructions/links, historical and vendor-document scope, and original-source header presence/shape. This was not a recalculation of every question or full behavioural/code review.

Findings: (1) stale slide-era “current” instructions and audit/resource claims; (2) overlapping rule owners and ambiguous short-page scoring; (3) no strong case for new files or deleting distinct source/audit/vendor documents; (4) repeated workflow and Practice-set contracts; (5) scattered README demo/working/search material and duplicated next-session scope; (6) misleading source-status instructions and broken historical links; (7) unexplained guided/scaffolded and plain/independent terms; (8) missing/incomplete/compact file headers; (9) deferred 48-hour cache and, after clarification, fixed-type scoring divergence. User had already corrected the maths skill example; it remains untouched.

The user approved surgical corrections, required faithful preservation of CODE_STYLE and README meaning, and clarified source authority: reviewed website questions, hints and feedback for implemented topics take precedence over stale slide/document examples. Slides primarily provide examples and inspiration for level/style; each new topic's website content is reviewed/refined during implementation. This does not prove every item is superior or error-free. Saved resources, mathematics and IDs were not changed by this pass.

The user rewrote the scoring bullet and then confirmed that “typical number” means one fixed window per page type, even when a particular page differs. The bullet is preserved verbatim. Current non-independent scoring uses actual page length capped at ten, so this is a recorded step-3 implementation gap. Agree the fixed lengths before implementation. Independent practice already uses ten; runtime scoring and the three-hour cache are unchanged.

### Documentation changes by file

| File | Change and preservation account |
| --- | --- |
| AGENTS.md | Replaced the mandatory slide-parity import direction with the user's reviewed-website precedence and slide-inspiration decision; retained preservation of IDs, mathematics and original resources. |
| website/README.md | Regrouped all substantive paragraphs into setup, architecture, routes, content/imports, Practice sets/search, progress, time/working, controls, demos, puzzles and verification. Added content authority and terminology. Removed only obsolete runtime-removal wording and a redundant flex-sizing sentence already covered by the spacing section; retained original commands, parameters, contracts and limits. Other targeted wording changes identify current scoring versus the agreed gap, scaffolded terminology and upstream-only vendor instructions. |
| docs/UI_UX_RULES.md | Replaced duplicated implementation/testing sections with links to CODE_STYLE, comment policy, skills and README; retained product behaviour and linked detailed slot mechanics. Added the fixed-type scoring decision and current gap. |
| docs/CODE_STYLE.md | No edits or moves in this pass; checked against the start-of-turn snapshot. All user-authored text retained. |
| docs/WEBSITE_PLAN.md | Preserved the user's scoring bullet, recorded its clarified meaning/current code gap, revised the future-review item and source-use guidance, and replaced repeated code-contract details with a README link while retaining superseded-proposal context and future limits. |
| docs/INDEX.md | Routed teaching work through current website content authority; scoped retained teaching and historical material explicitly. No files added or retired. |
| content/TOPIC_PLAN.md | Added historical-context notice, relabelled the dated production requirement and corrected the fraction overview to acknowledge the later M15 slide build. Existing teaching sequence, examples and historical details retained. |
| content/README.md | Added historical-context notice, relabelled slide production and repaired the teaching-sequence anchor; retained historical content. |
| content/answers/README.md | Added historical-context notice and labelled the saved HTML/production statements as slide-era; preserved answer material. |
| content/TEACHING_SPECIFICATIONS.md | Added source-status/website-precedence notice; teaching requirements unchanged. |
| content/M01_lattice_multiplication.md | Added source-status/website-refinements link only; question source unchanged. |
| content/M02_bus_stop_division.md | Added source-status/website-refinements link only; question source unchanged. |
| content/M10_solving_equations.md | Added source-status/website-refinements link only; question source unchanged. |
| content/M04_ratio.md | Replaced two broken historical-version links with preserved filenames and links to saved ratio resources. |
| legacy/README.md | Explained slide-inspiration role, reviewed website precedence and importer provenance/refinement boundaries. |
| legacy/topics/multiplication/README.md | Corrected saved slide count from nine to ten, confirmed from the PPTX archive without regeneration. |
| legacy/topics/ratio/README.md | Labelled historical checkpoint; retained four retired filenames as Git-recoverable references rather than broken links. |
| legacy/topics/signed_numbers/README.md | Same historical checkpoint/link treatment for its four retired filenames. |
| docs/CONTENT_AUDIT.json | Limited the report's scope claim to its own coverage and pointed to separate arithmetic evidence; audit measurements unchanged. |
| scripts/prepare_web_equations.py | Updated only the emitted report-scope string so regeneration preserves that correction; no bank-generation logic change. |
| HANDOFF.md | Recorded current step-1 work, separate later discussion gates, fixed-type scoring gap and deferred TTL; shortened next-session outline by linking the roadmap's detailed scope. |
| DEV_LOG.md | Recorded this evaluation, user decisions, preservation account and pending verification. Earlier premature steps remain historical records followed by the correction, not accepted work. |

### Consolidated rule ownership

Nothing moved out of CODE_STYLE. UI rules' generic modularity/readability/semantic CSS guidance remains fully covered by that unchanged policy and the existing framework skill. Application-specific details moved to README architecture/shared-controls: wider-app reuse, explicit inputs/events, separate content/scoring/storage/rendering, daisyUI foundations, centralised theme adaptations, descriptive multiline code, removing obsolete code/overrides, attribution, lifecycle constraints, review of affected code, and assembled-site accessibility. UI verification directions now link the existing efficient skill and README; README retains direct commands, isolated browser profiles, broad-boundary checks, no speculative compatibility/tests, and no expanding status requests or recurring manual-coverage gates. Practice-set encoding/resolution is owned by README; UI rules retain user-visible policy and roadmap retains future scope and historical rationale.

### Header-only changes by file

All following edits are file-header documentation only; no function bodies, imports, assertions or runtime behaviour were changed in this pass:

| File | Header repair |
| --- | --- |
| scripts/prepare_web_arithmetic.py | Separated fields and made contents a list. |
| tests/arithmetic.test.mjs | Separated fields and made contents a list. |
| tests/practice-time.test.mjs | Added purpose, contents, consumers, project dependencies and library uses. |
| tests/working-cache.test.mjs | Replaced the one-line header with the five required fields. |
| website/scripts/browser/new-topics-checks.mjs | Separated fields and made contents a list. |
| website/src/lib/application/arithmetic-demo.mjs | Separated fields and made contents a list. |
| website/src/lib/application/drawing-assist.mjs | Separated fields and made contents a list. |
| website/src/lib/application/equation-demo.mjs | Final header review found an import before the file header; moved the header above it and recorded the existing guideFrames dependency. Executable statements unchanged. |
| website/src/lib/components/puzzles/GoPuzzle.svelte | Added missing fields and separated package APIs from local dependencies. |
| website/src/lib/components/puzzles/PuzzlePlayer.svelte | Separated fields; recorded GoPuzzle locally and portable controls under libraries. |
| website/src/lib/components/teaching/ArithmeticDemo.svelte | Separated fields and made contents a list. |
| website/src/lib/components/teaching/ArithmeticWorking.svelte | Separated fields and made contents a list. |
| website/src/lib/components/teaching/MethodDemo.svelte | Separated fields and made contents a list. |
| website/src/lib/content/topic-routes.mjs | Added Libs field, separated fields and listed contents. |
| website/src/routes/puzzles.html/+page.svelte | Separated fields, listed contents and corrected local/package dependency fields. |

A filesystem restriction prevented an attempted edit to the framework skill. No skill file was changed; the unique application guidance was preserved in README instead. This needed no broader filesystem access. All prior user edits to skills, CODE_STYLE and the scoring bullet remain intact.

Verification pending: preservation/header review, targeted local links/anchors and the cached selected checks. Earlier steps 2–4 implementation proposals remain unapproved; this step-1 agreement does not accept their code/test changes.

First selected verification passed format/build, then the new-topics browser check could not bind 127.0.0.1 under the sandbox (EPERM). An authorised local-server rerun is required; this is not evidence of an application failure. Final header review also found equation-demo’s header below its import; corrected before rerunning checks.

Final step-1 review: CODE_STYLE, protected web_format and the user’s revised scoring bullet match the start-of-turn snapshot. The user added a further refactor-skill instruction during the pass to preserve wording when reorganising; it was reread and retained. All substantive original README paragraphs are accounted for; moved paragraphs retain their wording except the targeted changes listed above. Fifteen original-source files differ only in header documentation/placement; Python AST comparison confirms the equation importer differs only in the emitted audit-scope string. Header presence/field/block structure passed across 118 original Python/JS/Svelte sources (imported package, HTML and lighter-touch CSS excluded). All 221 local file/heading links in changed Markdown resolved, including content/legacy links omitted by the routine checker.

Selected verification passed format, build, new-topics, docs, logic, bank, Svelte sync/diagnostics, presentation, startup, Practice sets, Progress and integration. The authorised rerun resolved the sandbox server restriction. It refreshed tracked build assets; no commit, push, deployment, bank regeneration or slide edit occurred. No verification process remains running. Final record-only updates are followed by the cached documentation check. Step 1 is complete; next is step-2 evaluation/report/discussion, with no acceptance or implementation of later-step proposals implied.

The final record-only cached verification selected docs alone and passed; no unchanged application suites were repeated.

## 10 October 2026 — Refactor step 2 evaluation and agreement

Reviewed maintained application logic/components/styles, active content importers and verification orchestration against CODE_STYLE; historical tooling received structural/sample inspection only. Reported six findings: dense importer code and partial writes; inaccurate/boilerplate comments; redundant history scans/date formatter creation; whole-cache pruning on every edit and retained expired memory; duplicated aggregation/week/reset logic; overridden and obsolete CSS. In-memory probes measured 1,003 date formatter constructions for 1,000 answer records and 100 storage reads for one edit with 100 cached records, without claiming visible lag.

The user approved all six bounded fixes. Clarification: current application JSON question banks are authoritative; slides are historical examples of content/style/level, not a regeneration authority. Retain import scripts only as useful reference tools and prevent them overwriting improved banks. Plan: fresh temporary candidate output only; local performance/helpers/comment corrections; test CSS baseline before consolidation/removal. Preserve question content/IDs, current schema-2 progress, theme/layout and deferred scoring/48-hour changes. Step 3 requirements and step 4 test-quality decisions remain separate. Previous step-2 comment proposals may now be corrected/retained under this approval; previous step-3/4 changes remain unapproved.

Implementation/verification in progress.

### Step-2 implementation and per-file review

| File / architectural element | Agreed change and review |
| --- | --- |
| scripts/prepare_web_equations.py | Replaced dense statements with named source/answer preparation; exact Fraction validation shared for original/additional questions. Removed combined-slide geometry/provenance processing and PowerPoint dependency. Reconstructs historical JSON reference candidates only. Candidate equation bank is byte-identical to the isolated original output. |
| scripts/prepare_web_arithmetic.py | Separated exact answer/check calculation, correction validation and per-topic preparation. Readable names/branches replace nested answer expressions. Both topics and all SVG/catalogue/audit text are prepared before writing; all writes go through the candidate writer. All 22 arithmetic outputs are byte-identical to the isolated original output. Saved examples are historical provenance only. |
| scripts/bank_candidates.py (new) | Single output boundary for both tools: creates a fresh temporary directory, rejects absolute/traversing paths, uses exclusive file creation and records read-only comparisons with current files. No output-directory/overwrite option. Live bank/catalogue/audit files cannot be targeted. |
| website/src/lib/domain/progress.mjs | Reuses one UK date formatter; groups sorted assessment records in one pass; shares weighted-rate calculation; only reads history for the backup start when no saved start exists. Existing scoring, baseline ordering and date semantics preserved. Corrected parameter/examples comments. |
| website/src/lib/domain/practice-history.mjs | Owns shared current/previous UK-week keys via practiceWeeks; keeps the existing history-array API and aggregation semantics. |
| website/src/lib/components/progress/PracticeHistory.svelte | Gets both summaries from shared week keys using one captured time per derivation; filters/table/markup unchanged. Updated dependency header. |
| website/src/lib/adapters/working-cache.mjs | Prunes on construction and when the earliest known expiry arrives, including memory entries; saves remain immediate. Validates expiry metadata, retains clone isolation and warning/in-memory fallback. Current three-hour TTL unchanged pending step 3. |
| website/src/lib/application/session.mjs | Four identical selection/reference/message/draft resets now use resetActivity. Assistance, bank/mode assignment, restore, ensure-page and persistence order unchanged. Corrected switchTopic/switchMode contracts, challenge-level description, clock/value/ID parameters and examples. |
| website/src/lib/styles/components.css | Combined demo-controls declarations at the effective 10px gap; combined demo balance width/margin declarations; removed unused row-reveal animation and old builder-summary selector. Existing computed geometry/theme preserved. |
| website/scripts/browser/presentation-checks.mjs | Added rendered flex/10px/sticky baseline assertions and confirmed no old reveal-class row; passed before and after CSS edits. Improved invocation example. |
| tests/import-candidates.test.mjs (new) | Exercises real Python standard-library writer with a newer existing bank, repeated runs, diff reporting, absolute paths and traversal; proves source preservation and separate outputs. No PowerPoint dependency. |
| tests/working-cache.test.mjs | Added unrelated-read avoidance, cleanup deadline, renewal and unrelated-key preservation regression. Earlier step-4 test proposals remain separately pending. |
| tests/progress.test.mjs | Added saved-backup/history-bypass and chronologically grouped baseline regression, including incomplete attempt and durable-history order preservation. |
| tests/practice-time.test.mjs | Added shared current/previous week checks across both UK clock changes. |
| website/scripts/verification/plan.mjs | Added bank_candidates.py to the relevant input family; corrected digest parameter comment. This addition does not approve the separate earlier step-4 map changes. |
| website/README.md | Explicitly identifies current application JSON banks as authoritative/directly maintained; replaces unsafe regeneration directions with optional candidate-only commands and review boundaries. Records equation standard-library use, arithmetic reference dependency and Python requirement for output-isolation tests. Preserves topic counts, IDs, stages and unrelated guidance. |
| legacy/README.md | Replaces live-bank importer description with historical candidate workflow; retains old-generator and original-resource preservation boundaries. |
| HANDOFF.md | Marks step 2 complete, records actual verification/preservation and keeps steps 3/4 discussion gates and product backlog separate. |
| DEV_LOG.md | Records evaluation, user agreement, implementation/per-file review, tests and the limits below; earlier history retained. |

Additional comments-only corrections (compiler comparison confirmed unchanged executable JS/Svelte output for all 31 files):

| File | Correction |
| --- | --- |
| website/src/lib/adapters/storage.mjs | Schema-2 save parameter. |
| website/src/lib/application/player.mjs | Playback-delay unit. |
| website/src/lib/components/practice/Feedback.svelte | Both solution-renderer dependencies. |
| website/src/lib/components/practice/PracticeSets.svelte | Creating a code fills/focuses the field; it does not start the set. |
| website/src/lib/components/practice/TopicPractice.svelte | Stage parameter and mounted initialization example. |
| website/src/lib/components/progress/ProgressTransfer.svelte | Concrete JSON backup example. |
| website/src/lib/components/progress/TopicProgress.svelte | Timestamp/null formatting contract. |
| website/src/lib/components/teaching/DemoPlayer.svelte | Zero-based demo-level parameter. |
| website/src/lib/components/teaching/ErrorEntries.svelte | Error-entry index and row/reason/correction value. |
| website/src/lib/components/teaching/Guidance.svelte | Arithmetic demo caller. |
| website/src/lib/components/ui/ProfileDialog.svelte | Actual topic-practice caller. |
| website/src/lib/components/ui/ThemeControls.svelte | Actual shared-header caller. |
| website/src/lib/domain/engine.mjs | Stable question ID, learner name and concrete marking example. |
| website/src/lib/domain/errors.mjs | Concrete correction-choice marking example. |
| website/src/lib/domain/practice-code.mjs | Numeric code-field and timestamp parameters. |
| website/src/lib/domain/profiles.mjs | Learner display-name parameter. |
| website/src/lib/domain/progress-transfer.mjs | Imported-field/CSV parameters and numeric export timestamp. |
| website/src/lib/domain/revision.mjs | Numeric timestamp parameters. |
| website/src/lib/domain/stages.mjs | Actual caller and stage parameter. |
| website/src/lib/theme/preferences.mjs | Light/dark mode contract and persistence example. |
| website/src/routes/about.html/+page.svelte | Shared header/footer dependencies. |
| website/src/routes/progress.html/+page.svelte | Explicit recommendation refresh example. |
| website/scripts/browser/colour-checks.mjs | Concrete awaited preview invocation. |
| website/scripts/browser/practice-set-checks.mjs | Concrete awaited preview invocation. |
| website/scripts/browser/progress-checks.mjs | Concrete awaited preview invocation. |
| website/scripts/browser/startup-checks.mjs | Concrete awaited preview invocation. |
| website/scripts/browser/theme-checks.mjs | Page-context sampling and theme-check examples. |
| website/scripts/browser/visual-checks.mjs | Concrete awaited preview invocation. |
| website/scripts/browser-checks.mjs | Activity/name contracts and wrong-reason scenario example. |
| website/scripts/verify-changed.mjs | Verification job-name contract and useful hash/command examples. |
| website/scripts/verify-watch.mjs | Filesystem event name, replacing the erroneous learner-name wording. |

Earlier proposed step-2 comment repairs for working restoration, drawing, demo motion, timing and report drafting are retained under this approval. This does not claim every comment in historical tooling has been semantically reviewed.

### Verification and preservation

- Before CSS edits, the focused presentation suite passed with the new computed-style assertion. Static source inspection confirmed the removed selectors have no current consumers. After edits, selected presentation/colour checks and other browser suites passed.
- Focused logic passed 30 tests before the added week-key case; the final selected logic suite passed with all new cases. Regression coverage is limited to changed behaviour/contracts; the full test-quality evaluation remains step 4.
- Fifty deterministic mixed-history profiles produced identical topicProgress and backupStatus output before/after. Synthetic operation counts: 1,000 answers now construct one date formatter instead of 1,003; one edit with 100 cached records now performs zero unrelated storage reads instead of 100 before expiry. No user-visible latency benchmark is claimed.
- Original importers were run only in an isolated temporary repository with read-only historical inputs and separate outputs. All 23 new reference outputs match those originals byte for byte. The three reconstructed banks also match the live banks; the reconstructed catalogue differs, and the authoritative live catalogue remains untouched. This validates the practical need for isolated candidate output. Existing audit files are not rewritten.
- Protected-file hashes confirm 53 files unchanged: live banks/diagrams, catalogue, original slide resources, CODE_STYLE and protected web_format. The only changed file within the broader legacy snapshot is the explicitly authorised legacy README guidance. No question/answer/hint/feedback content changed.
- Compiler comparison found only the five intended application logic/component files changed executable JS/Svelte output; 31 further source/tooling files changed comments only. Tooling executable changes are the presentation assertion and candidate dependency rule. CSS/Python changes reviewed separately above.
- Formatting and build passed. The sandbox blocked the browser server (127.0.0.1 EPERM); the authorised rerun reused passing results. Final selected checks passed puzzle-library, new-topics, docs, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. No process remains running. Tracked build artifacts refreshed; no commit/push/deployment.
- A first formatter invocation from the repository root failed resolving the website formatter setup; rerunning from website/ formatted only edited files and the selected format check passed. Whole-tree diff whitespace checks identify only existing user-edited skill whitespace, which was preserved.

Step 2 is implemented and reviewed. Fixed typical scoring lengths, the agreed 48-hour TTL and earlier step-3/4 proposals remain for their respective discussion stages. Final record-only documentation verification passed. Its first run caught a log entry accidentally written to website/DEV_LOG.md; the entry was moved into the existing root DEV_LOG and the unintended file removed. The rerun selected docs alone and passed.

## 10–11 October 2026 — Step-2 follow-up: shared responsive thresholds

### Evaluation and agreement

The user correctly identified a gap in the earlier CSS review: breakpoint proliferation, consistency and rationale were not adequately evaluated. Follow-up inventory found viewport values 479, 480, 678, 767, 768, 1024 and 1150; container thresholds 28rem, 480px, 650px and 780px; and a duplicated 767px JavaScript reference-dialog condition. Existing docs recorded some outcomes but did not explain every exact threshold. The old sticky-working override is redundant for the sole current embedded working-area consumer.

Agreed approach: one executable register with clear names, rationale/consumer documentation, purpose comments at each query, modern < / >= boundaries, and review of thresholds within 20px in the same measurement scope. Viewport and container thresholds remain distinct. Compared explicit media queries using theme() with Tailwind @variant; both compile identically, but theme() is deprecated. The user selected @variant and requested clear names. Checked the installed Tailwind compiler for named viewport/container variants before editing.

### Changes and review

| File | Change |
| --- | --- |
| website/src/lib/styles/breakpoints.css (new) | Authoritative register: viewport-small/medium/large, viewport-progress-grid, viewport-reference-columns and four purpose-named container thresholds. Static theme tokens expose the same values to browser consumers. Comments explain scope and variant direction. |
| website/src/lib/styles/app.css | Imports the register once into the existing pipeline; no dependency/configuration change or Preflight added. |
| website/src/lib/styles/components.css | Replaces 12 numeric width queries with named viewport/container variants. Adds purpose comments and a register reference; removes only the redundant sticky-working override. Native reduced-motion/print/forced-colour queries retain their conditions and gain purpose comments. |
| website/src/lib/styles/progress.css | Uses the shared max-viewport-medium variant and explains topic-grid stacking. |
| website/src/lib/styles/theme-controls.css | Adds a purpose comment to the unchanged forced-colour query. |
| website/src/lib/components/practice/PracticeActivity.svelte | Reads --breakpoint-viewport-medium after mount and uses it for the reference dialog's matchMedia query; removes the independent numeric breakpoint. Listener cleanup unchanged. |
| docs/UI_TASTE.md | Adds the central breakpoint register/rationale/consumer table, variant naming and boundary convention, 20px consolidation rule, scope distinction, JS sharing and verification expectations. Labels 678px's missing historical derivation honestly. Updates the homepage full-row wording from <=480 to <480. Existing visual requirements otherwise preserved. |
| docs/CODE_COMMENTS.md | Adds the requested one-line purpose-comment requirement with a link to the shared register; existing policy text preserved. |
| docs/INDEX.md | Links directly to the register within existing UI taste; no new Markdown document. |
| website/README.md | Adds the responsive source/documentation entry point and shared browser-consumer rule. |
| website/scripts/browser/presentation-checks.mjs | Expands all-five-stage checks to below/at/above viewport thresholds; checks stage wrapping, progress strip/grid, meter size and header columns. Adds open-reference resizing in both directions, reference columns and fractional question-panel container boundaries. |
| website/scripts/verification/plan.mjs | Maps register changes to presentation, startup and progress checks, alongside existing CSS-dependent families. Existing CSS changes do not gain unrelated startup/progress checks. |
| tests/verification.test.mjs | Checks that register changes select those three consumers. Other earlier step-4 proposals remain separate. |
| HANDOFF.md / DEV_LOG.md | Record the agreed follow-up, current evidence and separate later review gates. |

The 479/480 viewport pair is now a single 480px boundary and 767/768 a single 768px boundary. All authored width queries use >= on entry and < below; max- is explicitly documented as exclusive. Former <=480 (topic cards and question container), <=650 (working container) and <=1150 (reference columns) therefore switch to their wider state at the exact threshold; fractional-width holes around 480/768 are removed. Container 780 and viewport 768 are retained separately because they measure different spaces. Custom 678/1150 viewport thresholds and existing container thresholds preserve current layout intent; documentation does not invent a precise historical derivation or label these as device sizes.

### Verification

Before CSS edits, the expanded presentation baseline passed all five stages at 16 viewport widths around the existing thresholds. Named-variant compilation was checked in memory using the installed compiler. CODE_STYLE matches the start-of-follow-up snapshot; no bank, scoring, cache-lifetime, palette or protected specification changes. Source diff review confirms style declarations are otherwise preserved. Verification in progress: format/build passed; the sandbox blocked browser serving with 127.0.0.1 EPERM, so an authorised rerun is using cached passing results.


Final selected verification passed format, puzzle-library, build, new-topics, docs, logic, bank, Svelte sync/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. The 16-width/five-stage checks, reference resizing across 768/1150 and fractional container cases at 480/650/780 all passed. Register-only changes select the appropriate consumers. No process remains running; generated build assets refreshed, with no commit/publication. No additional dependency or bespoke CSS transformer was introduced. The retained 678px exception has an explicit purpose but no claimed historical numeric derivation. Responsive follow-up complete; final record-only documentation check selected docs alone and passed.


## 11 October 2026 — shared dimensions and derived geometry

### Evaluation and agreement

Reviewed all of components.css, related shared styles, component consumers and relevant Git history before editing. Reported six changes: header/menu geometry, common control dimensions, existing radius reuse, chevron overlap, overlay clearance and canvas default/bitmap height. The user approved these, asked for consolidation of similar values serving similar purposes, extra care for values <=8px, and clear justification for one-offs. Recommended rem for shared paragraph reading width; chose 38rem (646px at the current 17px root) rather than an awkward exact conversion from 650px. Other dimensions remain unchanged. Paragraph width and the working-layout threshold have different purposes; Git records no derived formula for the 17px number slot. Neither has been artificially coupled to an unrelated value.

### Changes and per-file review

| File | Change |
| --- | --- |
| website/src/lib/styles/controls.css | Owns normal/compact control sizes and standard control gap; control dimensions reuse these; corners reuse existing mapped selector/field radii. Native select-arrow inset stays independent with a purpose comment. |
| website/src/lib/styles/components.css | Shared page gutters and vertical padding drive header/menu alignment; menu reservation derives from control width plus clearance. Paragraph measure uses a named rem limit. Common control groups share the gap. Chevron overlap derives from depth and fine seam; outside corners share the selector radius. Dialog clearance is explicit. Removes overridden canvas height; documents the tuned question-number slot. |
| website/src/lib/styles/theme-controls.css | Uses shared normal/compact dimensions. Names the existing font-relative popover edge clearance, preserving its distinction from fixed dialog/progress clearance. |
| website/src/lib/styles/progress.css | Derives horizontal/vertical available dimensions from twice the shared fixed overlay edge clearance. |
| website/src/lib/domain/working.mjs (new) | Single default working-height constant, independent of browser or persistence code. |
| website/src/lib/components/practice/WorkingArea.svelte | Uses the default for initial state, restore fallback, Home reset and initial bitmap height; a local bitmap scale replaces repeated multipliers. Resize ordering, stored coordinates and repaint semantics preserved. |
| website/src/lib/adapters/working-cache.mjs | Uses the same domain default when saving a draft without a canvas height. Cache TTL remains unchanged and deferred. |
| website/scripts/browser/presentation-checks.mjs | Adds actual menu-gutter/action-clearance checks across existing widths/topics and number/expression separation to existing question-fit checks. |
| website/scripts/verification/plan.mjs | Selects presentation for the new working-default module; Progress also tracks shared layout styles that now own its clearance. Existing runtime mapping covers logic/cache and new-topic canvas checks. |
| tests/verification.test.mjs | Updates expected selection for shared-layout edits/removals to include Progress, whose clearance now depends on those styles. |
| docs/UI_TASTE.md / docs/INDEX.md | Adds and links concise dimensions/spacing guidance, ownership, consolidation rule, small-value caution and retained exceptions; no new Markdown file. |
| HANDOFF.md / DEV_LOG.md | Records authorised scope, review, baseline and verification status. |

### Verification

Pre-edit presentation baseline passed. Sandbox initially blocked the local server (127.0.0.1 EPERM); approved rerun passed. Source comparison against `/private/tmp/maths-dimensions-before` confirms the intended substitutions; CODE_STYLE is byte-identical to that snapshot. No bank, palette, breakpoint or protected-specification edits. Existing browser checks cover resize/restore/Home reset and ink preservation. Selected post-change verification is pending.


Final selected verification passed format/build, puzzle-library, new-topics, docs, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. Formatting initially flagged two files; only those were formatted before rerunning. Browser serving again required approved local-server access after sandbox EPERM; cached passing work was reused. New menu-gutter/action-clearance and number/expression-separation checks passed, alongside existing all-stage/breakpoint/overlay and canvas resize/Home-reset/ink-preservation coverage. CODE_STYLE remains unchanged; generated build assets refreshed. No process remains running, and no commit/publication or manual touch/stylus review is claimed. Final record-only documentation check passed through verify:changed from website/.

The first direct record-only docs invocation used the repository root instead of its required website/ working directory and failed before checking links; the normal verify:changed invocation from website/ selected docs alone and passed.


## 11 October 2026 — concrete CSS review checklist

The user approved adding the proposed checklist as a level-3 subsection under CODE_STYLE's HTML and styling section. Appended seven review checks for unusual values, derived dimensions, consolidation/small-value caution, unit choice, cross-file ownership, registered breakpoints and evidence for exceptions. A byte-prefix comparison confirms all prior CODE_STYLE content is preserved exactly; its pre-edit snapshot is `/private/tmp/maths-code-style-before-checklist.md`.

UI_TASTE now links to the general rules instead of repeating them; its application-specific ownership, rem paragraph measure and retained exceptions remain. The moved guidance preserves semantic sharing, variable locality, one-off justification, <=8px caution and the distinction between breakpoint tolerance and ordinary spacing. Corrected the number-slot description: fit checks establish separation, not that 17px is necessary. INDEX links the new subsection; HANDOFF records current state. No CSS, root font, number width or other app code changed.

History places the 17px root font in the initial migrated stylesheet and the number-slot variable in the later question-layout refactor. No recorded derivation or comparative 16/18px evidence was found. A readability compromise for the root and two-digit capacity for the slot are plausible explanations, not established historical reasons. Change-selected documentation verification passed (docs only).


## 11 October 2026 — 16px / 18px visual comparison

At the user's request, captured eight lattice-multiplication independent-practice comparisons: root font and question-number slot both at 16px or both at 18px, at 390×844, 440×956, 768×1024 and 1024×1200 logical browser viewports. Used the latest verified static build, an isolated fresh profile, default Start challenge, default light Rose theme, identical deterministic questions and device scale 1. Overrides exist only in browser styles; production CSS remains unchanged at 17px.

Phone viewport-only captures stopped before the question buttons. Replaced them with eight full-page captures at the same requested browser viewport sizes, explained during the task, so number slots and working are visible. Artifacts are under `website/test-results/browser/font-comparison/`: eight PNGs, `index.html` side-by-side viewer and `manifest.json` recording computed values, viewport/image dimensions and shared question text. Capture script is `/private/tmp/maths-font-comparison.mjs`; no source/test implementation changed. HANDOFF records review availability and the pending decision.

Inspected all eight final images. Neither size produces horizontal page overflow; question grids remain one/two/three columns at phone/768/1024 widths respectively. At 18px, text/controls are larger and the page is taller; the progress strip wraps further at 390px. Screenshot assertions confirmed both requested computed values, unchanged questions, viewport dimensions and PNG widths. Local browser/server access needed permission after sandbox EPERM; all processes closed. This is requested visual evidence, not a new full verification run or approval to change the application's typography.


## 11 October 2026 — chosen 16px scale and stage-label refinement

The user selected the 16px root and question-number slot after reviewing the eight comparison screenshots. Requested stage labels matching the larger 18px-root comparison, then clarified a preference for 15px rather than the exact 15.3px. Also authorised a wider and/or higher-contrast chevron divider, suggesting the existing stage-border colour.

Previewed a 1px wider gap at the four comparison viewports; it remained faint because the clipped button border does not draw its diagonal edge. Implemented a 2px explicit diagonal stroke using the existing --line stage-border colour and shared --chevron-depth geometry, preserving the original small join clearance. No copied navigation or additional markup.

Files: components.css sets root/number slot to 16px, stage labels to 0.9375rem (15px), and adds one shared non-interactive separator pseudo-element except on the final stage. UI_TASTE records the new baseline and paragraph measure's resulting 608px width. Presentation checks retain the intended 2rem stage gap using root-relative measurements, replacing assumptions tied to the old 17px root; all-stage checks also require the chosen 15px labels. HANDOFF records remaining verification. No bank, scoring, persistence, breakpoint, protected specification or CODE_STYLE edits. Selected verification and final visual inspection pending.


Verification complete: selected format/build, new-topics, docs, presentation, colours, Practice sets and Progress passed. Browser jobs needed approved local-server access following sandbox EPERM; passing build/format results were reused. All five stages retained the chosen 15px labels and fit the existing boundary checks. Visually inspected final actual-build lattice screenshots at all four requested viewports under `website/test-results/browser/stage-refinement/`; confirmed root 16px, label 15px, clearer diagonal borders and no horizontal page overflow. Gap-only previews are labelled `-preview`; final images have only the viewport in their filenames. Per-file source diff reviewed: only the intended root/slot/label/stroke changes are in components.css. Generated build refreshed; no browser/server left running, no commit or publication. Final record-only docs check passed.


## 11 October 2026 — mobile question layout and stable header tools

The user requested documenting undersized Confidence multiplication questions for the next content round, and implementing fuller use of mobile width, adaptive equal-width question rows, top-right theme controls and mobile-first styling. Confirmed eleven current Confidence violations: S04–S07 C3 Q1/Q2 (eight independent) and SE C3 Q1–Q3 (three errors), all 3×2 digits. WEBSITE_PLAN records the required 4×3/3×4/4×4 digit range, IDs, coordinated teaching/answer updates and deferred timing. No bank content changed.

Implementation: SiteHeader adds one tools slot containing the theme controls and caller-provided hamburger; TopicPractice supplies its existing menu through that slot with behaviour/refs preserved. components.css uses a phone-first two-column header plus full-width lower actions, restores a three-column header from 768px, expands the phone question card through the page gutters with no side borders/corners, and restores desktop card styling from 768px. Removes fixed 210px question minimum and the forced-single-column query, with buttons filling intrinsic-content flex slots. theme-tokens.css supplies horizontal card-border gradients from the same palette stops. breakpoints.css removes the unused question-two-columns token. UI_TASTE and website/README align the current styling/ownership/spacing description. Presentation coverage adds 360px header/card checks, short-question pairing, equal row widths, top/bottom-only horizontal borders and the 768px restoration. HANDOFF records recovery instructions and deferred content work.

Source snapshot `/private/tmp/maths-mobile-layout-before`; build/format passed. Initial browser serving blocked by sandbox EPERM; selected permitted rerun and final visual review pending.


Follow-up verification: all originally selected jobs passed, including integration, after replacing its obsolete 210px minimum assertion with equal widths within each actual row. The initial long-expression test incorrectly required a full row; measurement showed an equal 429.5px pair fit, so the assertion now accepts that valid result. Tablet screenshot review also prompted explicit top alignment of header tools. Phone/tablet screenshots confirmed the requested edge-to-edge card and header arrangement.

The user then identified the remaining 4×4-digit wrapping at widths below 394px and transparent chevron seams. Moved question numbers to the top-left, preserving the 10px left inset and 16px slot; removed the 29px horizontal number clearance and its obsolete variables. Equation padding is now 8px horizontally with 1.5rem vertical clearance for number/result labels; equation font sizes remain unchanged. Presentation checks assert Confidence pairs at 360/394/768px, centred intact maths and number/result separation. The displayed 360px page includes four 4×4 products, all paired. README/UI_TASTE now describe corner-label spacing.

Removed the intentional 0.05rem chevron gap, aligned pseudo-element strokes to the outer clip (absolute positioning previously used the inset padding box), and outlined the left notch so wrapped edges retain a border. Preserved stage labels, colours, depth, order and native controls. Latest selected format/build, new-topics, presentation, colours, Practice sets and Progress passed. Added final join-gap assertions and close-up captures for matching the user's assessment example; final presentation/docs verification pending. No content, scoring, persistence, CODE_STYLE or protected specification changes in this follow-up.


Chevron close-ups at 390/768px and the no-gap assertion passed. Inspected the assessment phone close-up against the user's example: continuous border-colour joins, no intentional background seam. The first final run exposed a pre-existing test-clock race (pauseAt(host time) could fall behind browser time); corrected the test to pause one second ahead of its own browser clock and the focused rerun passed.

The user additionally requested “Level” instead of “Challenge” beside the practice selector and a “Check method” text link on the same row. PracticeActivity now uses the shared quiet button style for that action, preserves its reference toggle/focus handling, and exposes its expanded state. Presentation checks cover the requested same-row relationship; UI_TASTE records it. Final change-selected verification pending.


Final verification passed: format/build, new-topics, docs, Svelte/diagnostics, presentation, Practice sets, Progress and integration; the passing colour result remained valid and was reused. The new label assertion initially used Playwright's exact label-text matcher, which also collected nested option text; switched to the combobox's accessible name “Level”, which passed. Reviewed the final 360px Confidence screenshot: two-column 4×4 products, top-left numbers, and Check method beside Level. Inspected assessment chevron close-ups at both 390 and 768px; joins use continuous border colour. Captures are `confidence-questions-{360,394,768}.png` and `chevron-joins-{assessment,plain}-{390,768}.png` under website/test-results/browser/. Targeted diff whitespace check passed; unrelated pre-existing skill whitespace remains untouched. Build assets refreshed, no test/server running, no commit or publication. HANDOFF now records completion and the deferred content correction.


## 11 October 2026 — stable method-page playback and visible descriptions

User requested method-step descriptions near 14px by default and 16px at >=768px; animated working directly beneath the question and above playback controls; no automatic scrolling during animation, allowing one reposition on Play; descriptions remaining visible with the current step highlighted. Removed ShowDemo's per-frame scroll callback, retained initial positioning, and moved the drawing before normal-flow controls. An optional introduction snippet receives the logical step for arithmetic Guidance highlighting. Equation annotations stay visible and highlight the matching current row; mathematical ink still reveals in its original sequence. CSS supplies shared responsive description sizing, stable highlight geometry and disabled demo scroll anchoring. Existing pause/resume/speed/replay/reduced-motion logic remains.

Updated UI_UX_RULES to supersede the old follow-current-step scrolling requirement, UI_TASTE for visual rules, README for playback ownership, and HANDOFF for recovery. No bank content, scoring or persistence changes. Presentation coverage now checks all three Confidence methods at 360/768px through playback, plus existing reveal ordering, pause/speed and references. Verification/visual inspection pending.


Playback regression checks exposed indirect scrolling beyond the removed explicit followStep: disappearing arithmetic notes shortened the document, and at wider widths the footer became a browser scroll anchor when completion appeared. Reserved arithmetic-note height with overlapping intrinsic grid cells and unrevealed list items, reserved equation guide-note space, and disabled anchoring on the document/dialog scroller while a demo is present. Removed obsolete data-demo-current markers. An older equation annotation selector initially overrode the requested font size; corrected selector specificity. Tests now confirm fixed scroll for the six method/width Confidence cases. The expanded test left a tablet viewport before an existing phone-only reference check, so it is explicitly restored; final full selected pass pending. Screenshots settle native animations after virtual timers finish so their end-state ink is complete.


Final selected verification passed: format/build, new-topics, docs, Svelte/diagnostics, presentation, colours, Practice sets and Progress, reusing unchanged successful results. Browser coverage samples all three Confidence methods at 360 and 768px throughout playback/completion: exact unchanged scroll positions, 14/16px description sizes, stable description counts, active highlight matching the logical step, and question/working/control order. Existing reveal sequencing, pause/resume/speed persistence, reduced-motion and responsive reference checks passed.

Inspected all three phone captures plus lattice/equation tablet captures. The smaller descriptions and current-step treatment are clear; longer examples still require manual scrolling and no universal simultaneous viewport fit is claimed. Captures: website/test-results/browser/method-layout-{M01,M02,M10}-{360,768}.png. Current-step text highlighting is now implemented; separate mathematical operand/cell/carry highlighting remains proposed in the roadmap. Source whitespace check passed, obsolete followStep/data-demo-current references removed, banks/specification/CODE_STYLE unchanged. Build refreshed, no processes running, no commit or publication.


## 11 October 2026 — compact demo starts and centred topic-card pairs

User rejected repeated guide instructions beneath the diagram and blank space reserved before playback. Shared ShowDemo now mounts working only after Play or manual step navigation. ArithmeticDemo uses the existing compact renderer; removed duplicated setup prose and the reserved note grid, retaining detailed numeric calculations in full answer feedback and the final answer in compact output. Removed the reserved equation guide paragraph; equation working renders only reached rows, so controls move down naturally. Automatic scrolling remains disabled after initial Play positioning, with scroller anchoring disabled. These changes supersede the previous reserved-space approach.

Topic cards now use centred wrapping flex rows with a shared width/gap, 150px preference below the existing 480px breakpoint and 180px from it (rem-based), capped at half the usable row width after the gap. Reduced card padding, heading and question typography to fit readable previews; preserved content, colours, natural heights and links. Removed the unused topic-card container threshold and aligned UI_TASTE, UI_UX_RULES, README and HANDOFF. Added browser checks for compact initial demos, natural control movement, duplicate-note removal, and centred topic pairs/content fit at 320, 360, 390, 440, 479, 480, 481, 600, 768 and 1100px. Verification and visual review pending.


Verification complete: selected format/build, new-topics, docs, Svelte/diagnostics, presentation, colours, startup, Practice sets and Progress all passed on the first implementation run. Checked compact initial demos and normal-flow control movement, unchanged scroll throughout all three Confidence demos at 360/768px, progressive equation rows with current-row highlighting, and arithmetic demos containing no repeated note list. Topic cards fit their content, preserve centred partial rows and allow at least two per row across 320–1100px; the registered 480px transition gives 150px/180px preferred widths, and all three current topics fit at 768px.

Inspected topic-home-360/480.png, method-ready-360.png and the refreshed method-layout-M01-360.png. Cards and example content fit; the initial demo has the question immediately above controls, with no reserved drawing area; after playback the diagram/final answer sit above the lowered controls. Other viewport/method captures are in website/test-results/browser/. Source diff whitespace check passed and no live bank changed. No new dependency, breakpoint, JS sizing calculation, commit or publication; removed the obsolete container threshold and reused existing compact renderer/style tokens. HANDOFF records completion; no process remains running.


## 11 October 2026 — restore calculation notes and unify stage card width

The user clarified that the prior removal was too broad: only repeated general step text should disappear, while calculation-specific working notes/descriptions must remain beneath the animation. Removed ArithmeticDemo's compact flag, restoring the existing progressively revealed diagonal sums/carries and division quotients/remainders/decimal continuation. Repeated setup prose stays omitted; no empty pre-play drawing area is reintroduced. The earlier compact-demo decision in this log is superseded by this correction.

Extracted the phone edge-to-edge and >=768px inset card rules into one shared stage-panel class, applied to both PracticeActivity and the Learn the method section in TopicPractice. Question-panel retains its container role. Every stage now shares square phone corners, no side borders and horizontal top/bottom gradient borders. Updated UI_TASTE/UI_UX_RULES/README/HANDOFF, and presentation assertions now require calculation notes, reject repeated setup prose, and check card geometry in all five stages. Verification/visual review pending; no content-bank or CODE_STYLE edits.


Verification complete: selected format/build, new-topics, docs, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration all passed. The regression check now distinguishes real numeric working from repeated general instructions: it requires diagonal carry or division remainder calculations, retains the final answer and rejects repeated setup text. Every learning stage passes phone/full-width and >=768px/inset geometry/border checks; compact initial demos and no-scroll playback continue to pass.

Inspected refreshed 360px multiplication and division method screenshots under website/test-results/browser/method-layout-M01-360.png and method-layout-M02-360.png: the calculation notes are restored and the full-width card has only horizontal top/bottom borders. Shared stage-panel owns those rules once. Whitespace check passed; topic-card sizing and question banks unchanged. Build refreshed, no process running, no commit or publication. HANDOFF records the correction and final evidence.


## 11 October 2026 — minimum topic width, proportional previews and universal menu

User requires 140px minimum topic cards and equation working that scales with preview width like lattice/bus-stop diagrams. Set the minimum while retaining 150/180px preferences and centred wrapping; widths below the minimum pair's space may wrap. Topic-solution is now an inline-size container; equation font/operation rows, cell spacing and divider use proportional container/em dimensions. Semantic EquationWorking remains reused, with no JS measurement or separate math markup. UI_TASTE/README document the requirement.

The missing hamburger was caused by its placement inside a profile-gated TopicPractice tools snippet. Moved the existing Bits UI trigger/popover into SiteHeader so every page has it, before or after profile selection. Added common Topics/Progress/Puzzles/About links; TopicPractice supplies its existing Create Practice set action through a contextual snippet and retains bound open/trigger state plus the dialog focus handoff. UI_UX_RULES/UI_TASTE/README/HANDOFF align. Browser checks now cover minimum width and proportional equation geometry, menu keyboard open/close/focus on every route at phone/tablet widths, with existing practice-set checks covering the creator.

The first new menu check failed because Bits UI's content had no dialog role despite the trigger's dialog popup semantics. Added the explicit role alongside its accessible name. Final selected format/build, new-topics, docs, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration all passed. Verified all seven routes at 360/768px and preview geometry across ten widths; inspected refreshed 360/480px topic screenshots. The 140px floor takes precedence below the space required for a pair (320px now wraps); two cards still fit at 360px. Scoped whitespace check passed. No bank, CODE_STYLE or protected-specification edits in this follow-up. Build refreshed; no running process, commit or publication.

## 11 October 2026 — canvas space, tinted paper and intrinsic wrapping

Raised the shared working default from 230 to 246 CSS pixels and newly inserted lattice grid origin from bitmap y=65 to 85 (10 logical pixels lower); cached heights/coordinates remain intact. Canvas paper now mixes its established light/dark neutral with 15% theme surface. Assessment requests three equal slots with intrinsic maths widths deciding wrapping. Replaced the forced single-row chevron rule at 480px with longest-word sizing and depth-derived horizontal padding, allowing wrapping wherever needed without another breakpoint. Standing visual guidance and run guide updated.

Reviewed framework integration: semantic controls still compose daisyUI button/field/card/progress foundations through the shared theme mapping; Bits UI owns dialogs/popovers, including the universal menu. Canvas and mathematical/chevron layout remain appropriate custom presentation. Selected format/build, new-topics, docs, logic, Svelte/diagnostics, presentation, colours, Practice sets, Progress and integration passed. Browser checks verify default canvas height, lower grid ink, resize/reset/restoration, subtle tint across eight theme combinations, assessment three-column rows and actual chevron text padding across all stages, including 480/510/540px. Inspected light/dark canvas screenshots and chevron crops at those three widths: no clipping; intrinsic wrapping currently gives four plus one stages at 480px and one row at 510/540px in assessment. Scoped whitespace check passed. Build refreshed; no running process, commit or publication.

## 11 October 2026 — two-line stage labels and natural chevron widths

The user rejected three-line stage labels and stretched final rows. TopicPractice now groups each shared label into two unbreakable phrases at its final space; content remains sourced from MODES. Chevrons use non-growing intrinsic flex bases, so complete and partial rows retain content-based widths. No extra breakpoint, fixed pixel width or clipped label. UI_TASTE updated. Selected verification and visual inspection pending.

The initial non-growing implementation passed selected checks, then the user clarified that the first row should fill its width and labels should stay on one line where possible. User approved a small row-grouping helper and a 780px maximum from the existing 768px breakpoint. Extracted LearningSteps: ResizeObserver measures phrase widths/padding to group rows; native flex sizing expands the first row and naturally sizes/shrinks later rows. No added wrapping breakpoints or repeated labels. Regrouping restores focused stage. Updated focused checks and documentation; new verification pending.

Final verification passed format/build, new-topics, docs, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. Fixed the navigation grid item’s intrinsic minimum with min-width:0. Verification initially exposed asynchronous topic loading and resize measurements: checks now wait for actual question content/settled overflow and read related controls together. Final checks cover all five stages across 320–1600px, first-row fill, content-sized later rows, label line limits, the desktop cap and focus after regrouping. Inspected fresh 390/480/540/768px chevron crops; at 390px the first three fill the first row and the remaining two use natural single-line labels. No extra wrapping breakpoints, label copies or change to native stage-button semantics. Scoped whitespace check passed; build refreshed, no running process or publication.

## 11 October 2026 — lattice grid clearance and wrapped chevron inset

User requested more writing space beside the canvas lattice grid and wrapped chevron forks inside the left gutter. Added one 0.9 scale for new grid width/height, retaining horizontal centring and y=85. Existing cached guide geometry remains untouched. Wrapped stage rows now take padding from the shared chevron-depth token; grouping reserves the matching space from the resolved notch margin. Existing grid geometry and responsive browser checks updated; selected verification pending.

Selected format/build, new-topics, docs, logic, Svelte/diagnostics, presentation, colours, Practice sets, Progress and integration passed. The initial presentation run failed at immediate focus comparison after resize; the existing check now awaits asynchronous focus restoration. Grid checks cover all 16 supported row/column combinations, side margins and horizontal centring; responsive checks assert every chevron row stays within the navigation gutters. Inspected refreshed light canvas and 390/480px assessment chevron screenshots. Scoped whitespace check passed; build refreshed, no running process, commit or publication.

## 11 October 2026 — 440px topic header and centred assistance guides

User supplied an annotated topic header and clarified that guides need vertical centring, squarer cells and handwriting space on every side. User explicitly approved replacing the shared 480px breakpoint with 440px, including larger preferred topic cards. Topic pages now use a Foundation maths breadcrumb instead of Back in the header; Puzzles remains in the universal menu/homepage and Progress remains a header shortcut. Introduction and compact controls become two columns from 440px; Topic label moves above the smaller-text select to preserve readable options.

Guide insertion now lays out in current visible canvas dimensions before converting to the shared bitmap coordinate system. Both lattice and division frames are centred with 48px minimum handwriting margins; lattice cells are square and capped at 72px. Saved guides and strokes are preserved through resizing/restoration. This supersedes the earlier fixed y=85 and 90% scaling. Updated existing pure geometry checks and browser coverage; verification and visual inspection pending.


### Development-log recovery and final verification

Found that documentation commands had appended a DEV_LOG entry and then mistakenly written the previous HANDOFF buffer to DEV_LOG. Restored the saved pre-dimensions log and replayed 30 recorded log edits, preserving their original text and order, while excluding the stale-buffer writes and one command that failed before its log edit. Recovery source: `/private/tmp/maths-dimensions-before/DEV_LOG.md` plus this session's recorded edit commands. The reconstruction is retained at `/private/tmp/maths-restored-DEV_LOG.md`; the overwritten file was also saved before replacement. No historical entries were intentionally condensed or dropped.

Initial selected verification passed, then visual review found a clipped search placeholder at 440px. Compact inline padding and a 3:4 introduction/control column ratio retain the complete prompt; a browser text-measurement assertion now covers it. Guide restoration checks sample fully opaque ink rather than unstable antialiased edge pixels. Presentation, drawing and colour checks passed; the subsequent Progress check exposed an existing reload/hydration race. It now awaits the restored recommendation link before checking its count. Final change-selected verification pending.

Final change-selected verification passed: format/build, new-topics, docs, logic, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration, reusing unchanged successful fingerprints. Inspected refreshed header captures at 439/440/600px and both guide types; the 440px prompt is complete and lattice cells are visibly square with balanced clearance. Artifacts: website/test-results/browser/topic-header-{439,440,600,800}.png and working-guide-{M01,M02}.png. Scoped whitespace check passed. Git confirms the restored DEV_LOG has additions only, with no deletion of committed historical lines. Build refreshed; no running process, commit or publication.

## 11 October 2026 — preserve header typography and simplify topic navigation

User requested narrower right-column controls and more separation, restored subject/topic appearance, and suggested Topic as the selector’s visible value. Restored the shared heading scale and subject eyebrow; the subject is now a link with inherited styling, replacing the separate breadcrumb. A shared 12px clearance adjustment reduces the former 22rem controls maximum and increases the column gap. Intrinsic title width keeps long words intact. The native selector is a navigation action with a reset Topic prompt and full names in its options; removed the duplicate label and shortened the visible search placeholder while retaining its accessible name. Standing guidance and browser checks updated. Verification pending.

During review the user selected a 28px minimum topic title instead of the restored 32px. Added a topic-header-only 1.75rem minimum, retaining 4vw scaling and the existing 3.2rem maximum. Initial checks passed through startup; Practice sets then timed out looking for the old placeholder. Its locator now uses the persistent accessible name instead of placeholder copy. Selected verification continuing.

Final selected format/build, new-topics, docs, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration checks passed, reusing unchanged passing evidence. Responsive coverage checks the 28px-minimum title, original subject scale, linked subject, column clearance, intact search prompt and resetting Topic navigation control; the existing route and Practice-set flows passed. Inspected the restored header arrangement at 440px before the final title-size refinement; fresh final screenshots are under website/test-results/browser/topic-header-{439,440,600,800}.png. Scoped whitespace check passed. No running process, commit or publication.


## 11 October 2026 — puzzle navigation, consistent panels and reusable Progress chevrons

Implemented the user's fixes 1–10. Puzzle family links now participate in browser history and restore selection on Back, with the shared Maths practice/Puzzles/Progress header, Level label and no duplicate chooser button. App-owned responsive overrides fit puzzle boards within their containers. Main page panels share the topic practice mobile treatment below 768px: full viewport width, square corners and top/bottom borders only. Question rows retain natural widths and centre partial rows. Text links use theme colours and button-shaped links omit underlines; intentional quiet text actions retain theirs. Progress copy is shorter, with supporting explanations on /help.html linked from the footer. The imported puzzle package is unchanged.

The user explicitly approved nine additional Spot the error questions, one per level per topic, to support four-question new pages. Added question-specific hints/checks/corrections and six arithmetic working SVGs. New lattice questions include a 4×3-digit Confidence product; existing deferred Confidence content remains untouched. Equation examples distinguish arithmetic errors from invalid transformations. Arithmetic banks now contain 99 questions each; equations has 100 plus three recaps, with four selected from five Confidence error questions. Compared original question objects and bank revisions against HEAD: preserved. Saved three-question pages retain their existing questions, covered by session checks. Authored Practice-set slots remain unchanged.

The user then requested a reusable ChevronSteps component with the existing topic navigation behaviour. Extracted geometry, intrinsic row grouping, first/last treatment, clipping and focus restoration into components/ui/ChevronSteps.svelte. LearningSteps supplies topic labels/actions; TopicProgress supplies level meters through existing Bits UI popover triggers. Progress removes padding on internal sides only, retains outside padding and uses square meter ends; content clips to each segment even with a maximum width. The final clarification retains the previous arrow borders: existing 2px diagonal separators and 1px notch outlines use the theme border colour and paint above the complete bars. No palette change. Focused checks verify padding, capped widths, clipped connected bars and painted border geometry/colour.

Verification completed through verify:changed: selected format/build, new-topics, docs, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration passed, with unchanged successful fingerprints reused. Local browser tests required approved server access after sandbox restrictions. Fixed prerender access to puzzle URL state and removed a help link to a client-only fragment. Updated obsolete browser assumptions about the already-existing Bits UI Topic selector and single-link footer; no Topic selector behaviour change was introduced. Resize checks now await both new row grouping and restored focus. Complete-bar screenshots use reduced-motion mode so native progress transitions cannot capture an intermediate fill. The final focused format/Progress verification passed, including border assertions. Final record-only docs verification passed; git diff --check passed.

Inspected puzzle-go-320.png, puzzle-sudoku-320.png, progress-refined-{320,390}.png, error-questions-four.png, new Confidence arithmetic diagrams and progress-complete-chevron-joins.png under website/test-results/browser/. Completed bars visually connect across the clipped joins while the original pale diagonal outlines remain visible. Build refreshed; no commit, publication or module refactor.

Report-only modularity findings (point 11): vendor/puzzles is the documented unchanged @subject-apps/puzzles 0.1.0 package pinned to upstream commit 69560b227aaedefe72457241a53205ee93b7e024. It owns content, metadata/artwork, marking/rules, renderers/interactions and optional scoped base styles, without application routing, persistence or theme-choice dependencies. Maths owns selection/history, checking/reveal policy and theme/fit wrappers. GoPuzzle uses public render/bind/evaluate APIs without duplicating Go rules, but relies on generated .go-* markup and strategy-hint hooks, making it the main integration seam to check on updates. Distribution is a manual local vendored dependency rather than a separately versioned repository update. A future extraction should move applicable authoring tools, independent validators, cached source evidence and authoring instructions with the runtime package, then retain pinned updates and consumer integration checks. The existing boundary is already close to the desired modular format; no architectural rewrite is needed first. Review is based on this checkout and pinned package documentation, not a fresh upstream comparison.


## 11 October 2026 — touch puzzle controls and methodical operation highlighting

Implemented the user's nine refinements. Progress has equal outside padding and rounded external meter ends, with square internal joins. Selected chevrons retain the shared border colour instead of a dark rectangular border that left ticks at diagonal corners; the fill clips to the padding box. Native selectors/file inputs use content sizing with container limits; the user chose normal browser sizing as the fallback on older browsers. The Bits UI Topic control is unchanged. Removed the historical full-width error-selector override. Canvas default is 262px (+16), preserving existing saved dimensions/ink. Header brand/actions wrap at intrinsic widths, reserving only the tools' first line through a width derived from shared control sizes/gaps; actions gain 1rem left margin and their trailing Progress link aligns right. No new breakpoint. Footer uses centred author credit and spaced links; removed the old practice/storage slogan and obsolete left margins.

The user authorised a patch inside the portable puzzle module rather than an app workaround. ui/go-press.js now hit-tests current board coordinates through implicit touch capture, previews the nearest intersection, cancels on leaving/cancellation and commits once on release through the existing rule-backed click handler. Keyboard previews/activation remain available. styles/layout.css reserves Go board touch gestures without disabling scrolling elsewhere. ui/go.js removes references to a redundant Check action in live failure guidance. PuzzlePlayer omits Check for Go; the module already confirms recorded wins automatically. The README records these three vendor changes for reconciliation with future upstream updates. No rule/content changes or upstream publication.

Following the user's request for a methodical, repeatable approach, added docs/METHOD_ANIMATIONS.md and linked it from INDEX, UI_UX_RULES, UI_TASTE and the run guide. It specifies checked mathematical models, operation inputs/output/dependencies, separate calculation/write/transfer phases, per-method sequencing, deterministic rendering, shared timer ownership, non-colour explanations and verification expectations for future topics. Lattice now highlights operand pairs, each written cell digit, contributing diagonal half-cells/incoming carry, then the answer digit and any carry separately. Division highlights divisor/current place, quotient, remainder transfer and decimal continuation; carried remainders pass over decimal markers to numeric places and remain visible. Equations highlight the active expressions/operations on each side while retaining explanation highlighting. Static solutions remain complete. No new animation engine, question edits or automatic scrolling.

Pure tests validate every current arithmetic demo level plus zero/carry/decimal edge cases, including sum/write/carry ordering and mathematical identities. Browser checks use the paused clock to verify that diagonal summing adds no ink, writing adds one answer digit and carrying adds one carry; inspect operation highlights and equation sides, retain pause/speed/replay/reduced-motion/reference checks and preserve scroll. Actual Chromium touch streams test Go preview/cancel/release/completion, keyboard cancellation/activation, continuous cover-path drawing and tap controls across the remaining puzzle families. New sizing/header checks verify selected-option width changes, native file sizing, equal Progress padding, rounded outside ends, and one header line with a short account name at 744px.

Verification encountered stale canvas bitmap-height expectations, a wrapped-label locator that needed partial matching, an overly broad centring rule caught in visual review, and an About footer link too close to the next link row. Corrected each; footer-only alignment and paragraph spacing are now checked. All selected format/build, puzzle-library, new-topics, docs, logic, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration passed before the last selector/footer margin cleanup. Final selected verification pending for that cleanup. Inspected method-highlight-M01-{sum,write,carry,diagonal}.png, method-highlight-M02-{divide,write,carry}.png, go-touch-preview.png, header-intrinsic-744.png and progress-complete-chevron-joins.png. Touch evidence is browser emulation, not a physical-device audit. No commit or publication.


Final verification complete: the last format/build, new-topics, docs, presentation, colours, Practice sets and Progress checks passed after the selector/footer cleanup; other current passing fingerprints were reused. Integration and Svelte checks passed after the footer markup/accessibility correction. Inspected the final 744px short-name header, connected rounded meters and a multi-cell highlighted lattice diagonal. Source whitespace check passed. Build refreshed; no running process, commit or publication. The approved CSS fallback and vendor patch are documented, and HANDOFF records completion and optional physical-device review.


## 12 October 2026 — topic animation specifications, puzzle navigation and human Go

The user placed topic-specific animation sequences in each topic specification. Added a Method animation section to M01, M02 and M10 with ordered input/calculation/write/transfer operations, dependencies and method-specific edge cases. Existing historical teaching/source text is preserved byte for byte; Git shows additions only in those files. METHOD_ANIMATIONS now links those sections and retains the shared deterministic-frame, accessibility, playback and verification contract. No question-bank or animation-runtime change in this follow-up.

Added shared PageNavigation for puzzle variations, selected maths questions, learning stages and Practice-set pages: Prev / centred identifier / Next, disabled endpoints, and existing completion/promotion gates. Puzzle paging stays within the current browser entry. SvelteKit snapshots preserve level, question, variation, working and assistance/reveal state across history; Back from the new Go demo restores the originating puzzle and moves. Forward restores the previous level rather than resetting it. PuzzlePlayer and GoPuzzle expose only serialisable snapshot state; app history remains outside the module.

Portable puzzle sizing replaces the earlier app-only shrinking overrides. Logic grids now have a vertical Variable/Person row-group axis and a matching-size category heading centred above the values. Candidate cells retain useful preferred widths, bounded by the container; row names and short value headings stay whole at 320px. Dense eight-variable grids retain at least 24px-wide cells in the tested layouts. Digit grids and Go preserve proportional geometry/hit targets; replay controls wrap. Visual review caught short headings and then a row name breaking across lines; adjusted column allocation and header padding/emphasis, and extended the existing layout checks to cover both row and value text. All eight families at all four levels pass the selected width checks.

Added /go.html with human 5/9/13/19 boards, Black/White turns, explicit New board, pass, undo, komi, resume and area counting. Both passes open counting; players mark agreed dead groups, and the package counts living stones plus exclusively surrounded empty intersections, with mixed/unbordered regions neutral. Captures are not added again. This is not automated life/death judgement. Reuses applyGoMove for captures/suicide and adds positional superko/history in rules/go-game.js. Shared ui/go-board.js owns the board geometry for puzzles and human games; go-press accepts optional legality/colour callbacks with unchanged puzzle defaults. A second pointer cancels placement; native pinch zoom is enabled on the human board and its buttons. The title-line demo link matches the hint-link type size; the demo includes the existing Go rules reference. No computer opponent or durable game storage added.

Added docs/puzzles_patches.md, linked through INDEX/README/UI_UX_RULES. It records every local vendor patch, including the preceding touch/feedback patch, the new public exports, human-game rules, geometry/style changes, app companions and reconciliation/test instructions. Package ownership remains content/rules/marking/drawing/default geometry, with app routing, controls and theme composition outside. No new dependency or upstream publication.

Verification: selected format/build, puzzle-library, new-topics, docs, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration passed, reusing unchanged successful fingerprints. Package tests cover alternation, capture, suicide, immediate/older repeated positions, pass/undo/resume, the absence of the puzzle 100-move cap, neutral/owned regions, komi and whole dead-group toggling. Browser checks cover navigation reversal, history/level/move restoration, every human board size, keyboard play, counting/resume/undo, native zoom policy, touch drag and second-finger cancellation, plus existing puzzle-family gestures. Updated stale question-code, selector-label and final-stage endpoint expectations. An immediate presentation-overflow observation during level/viewport changes did not recur with added failure diagnostics; the Practice-set width check now waits for responsive layout settling rather than measuring immediately after resize. Final integration passed. Inspected updated logic-grid/equation-grid and human Go captures at 320px. Physical-device pinch quality remains untested; Chromium touch emulation is the evidence.

Researched browser AI payloads only: Moka reports about 103KB total for its specialised 9×9 model and 17MB for its KataGo b6c96 ONNX comparison; web-katrain distinguishes a 3.6MB test network from its roughly 96MB analysis network. These figures do not establish 19×19 amateur-1-dan play on target phones; engine/model/search-time benchmarking is needed before promising strength. No AI code or weights downloaded. Source references: https://github.com/millionco/moka and https://github.com/Sir-Teo/web-katrain .

Build refreshed; source whitespace and final record-only documentation checks passed. No process remains running, no commit, deployment or publication.

## 12 October 2026 — learner countdowns, human Go clocks and recommended OneDrive files

Implemented user-started countdowns for Spot the error and Independent practice: ceil(1.5 × actual page question count) minutes, ±1 minute before start, pause/resume/reset, one expiry announcement and optional quiet gesture-unlocked Web Audio chime. Expiry leaves ordinary questions usable. Per-attempt lifecycle preserves question selection, pauses completion and resets on page/stage departure; existing authored timed sets and active-time measurement retain their rules. Pure duration/audio helpers sit outside the Svelte control.

Human Go size selection now applies immediately, including explicitly reading the changed select value before Svelte's binding update. Default komi is 6.5. Added redo, reset, counting at any point and optional main time/Japanese byo-yomi seconds/periods. Portable go-clock rules charge delayed/background time, lose overtime periods at exact boundaries, reset the surviving period on a legal move/pass and block play at timeout. Counting pauses/restores running state; undo/redo restore paused clock snapshots, branching drops redo, and changing clock policy clears historical timing snapshots without changing stones. Updated puzzles_patches with every module/app change. Documented future Moka, browser KataGo, Pachi and hosted-opponent options in WEBSITE_PLAN, with payload/strength/benchmark caveats; no AI engine added.

User confirmed locally synced college OneDrive folders and then made this the recommended/default student workflow. Profile entry and Progress now recommend the synced file, with a returning-learner link before practice. Explicit Save/Open uses native file pickers, per-learner remembered IndexedDB handles, existing validated/reviewed JSON import and SHA-256 content checks before overwriting. Fresh browsers can open progress without first creating a learner. Existing nonempty files are reviewed, never silently replaced during setup. Permission is renewed before reading remembered files; rejected permission, failed writes and oversized files are handled. A file changed externally requires Open/review. Forget file link leaves the file and browser working copy intact. Unsupported browsers retain download/import. Save/Open are manual; OneDrive owns upload/download. There is no provider sign-in, provisioning, background sync, cross-device lock or automatic merge. Schema-2 progress/export formats and transient working exclusions are unchanged. Actual college-account syncing was not exercised.

Verification: all selected format/build, portable puzzle rules, new-topics, docs, logic, Svelte/diagnostics, presentation, startup, Practice sets, Progress and integration passed; unchanged bank/colour evidence was reused. Deterministic checks cover countdown rounding, optional audio and two quiet tones, main/overtime/exact timeout/multiple lost periods/pause/history/counting, file permission ordering/refusal, external-change rejection and failed/oversized writes. Browser checks exercise timer adjustment/pause/expiry, Go immediate size changes/default komi/redo/reset/counting/clock turns, and real origin-private file handles for writes, IndexedDB reload, conflict refusal, reviewed import and fresh-browser opening; only picker selection is stubbed. Existing touch, accessibility and responsive checks still pass. Physical-device audio and real OneDrive desktop syncing remain user-device checks.

Initial formatting omissions were corrected. The first build exposed a FAQ fragment link whose target exists only after hydration; changed it to the prerendered Progress route. A later presentation run observed the already-known native ResizeObserver/virtual-clock timing race after viewport resize; the Confidence geometry check now waits for the real layout to fit, as existing related checks do. The subsequent selected run passed. No source-bank changes in this slice, commit, publication or deployment.


## 12 October 2026 — portable learner identity, OneDrive onboarding and Go estimates

User approved stable random learner UUIDs, preserved across exports/imports without accounts or passwords. Additive schema-2 loading retains all existing name-keyed progress and results. Personalised file names are `Maths/practice_progress_<safe name>_<UUID>.json`. Directory setup reuses or creates Maths without removing existing contents; selecting Maths itself avoids nesting. Existing nonempty files require validated import/review, never silent initial replacement. Native handles move from prior name keys to learner IDs when applicable. Imports match identity first and name second, reject ambiguous identity/name collisions and retain explicit replacement review; legacy files receive/preserve an ID. Practice now shows a nonblocking save-to-OneDrive prompt for learners without a linked file, including existing browser learners; Later dismisses for the tab. The direct save action preserves existing files and reports conflicts. Browser working progress remains intact. No automatic cloud merge or provider authentication.

Human Go gains four-sided coordinates, an inclusive <=440px half effective outer gutter and original conservative nearby-influence estimates with ownership squares. Open corners in the supplied position are recognised; distant/contested space stays undecided. Users can switch back to the existing agreed-dead-group area count. No automatic life/death/seki judgement. Researched Goscorer and OGS score-estimator but included/adapted neither; no new third-party licence needed. Future vendored dependencies should retain licences in a linked THIRD_PARTY_NOTICES.md. All portable/app changes are recorded in puzzles_patches.

Removed the human-board instruction paragraph; clock explanation appears during setup/paused review and hides while running. Default timing is 5 minutes main and 3 × 30-second Japanese byo-yomi per player. Timing controls now use the same compact shared level-row as size and komi, with no fieldset margin.

Selected format/build, puzzle-library, new-topics, docs, logic, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration passed across this slice. The new fresh-browser Progress scenario initially reloaded before navigation completed; waiting for its destination heading fixed the race and the rerun passed. Real origin-private directory/file tests cover existing Maths content preservation, personalised filenames, direct prompt save/refusal and fresh-browser import; picker selection is stubbed. Actual college OneDrive sync remains untested. Inspected the 320px coordinate/estimated-corner capture. Physical touch/pinch/audio remains a device check.

Subsequent grid-spacing corrections: a viewBox-only expansion moved labels slightly outward; fixing their relative positions still changed text scaling and constrained the grid too much. Latest user instruction freezes labels' positions and sizes and expands only the inner playing grid. Renderer now retains the coordinate layer/viewBox and transforms a separate grid/stones/markers group by .2 grid units per edge (about 8px on the normal 9×9 board). Buttons share that transform; drag hit-testing uses the inverse SVG screen matrix and preview circles belong to the transformed group. Removed the former clearance cap. Focused estimate/geometry tests pass 4/4, including fixed label positions/sizes, enlarged grid and unchanged puzzle viewBox. **Full final verification permission was declined: final grid/pointer browser verification and build refresh remain outstanding.** Earlier passing browser checks do not cover this last correction. No commit, publication or deployment.


## 12 October 2026 — aligned Go coordinates, persistent timer disclosure and scoring research

Further enlarged the human playing grid to .3 grid units per edge (about 12px at standard 9×9 size, about 4px beyond the prior revision). Label centres along each edge now use the same transformed positions as the corresponding grid lines. Font size and normal distance from the board edges remain fixed. Existing geometry tests now check every line/label on all four supported sizes. The user confirmed the result was better.

Starting Go clocks closes Timing options. Manual pause and pauses for counting/history do not reopen selectors/explanation; the user can explicitly reopen the native disclosure. Explanation remains absent while clocks run. Updated the existing browser scenario for initial closure, manual pause, explicit review and count pause. Selected package/build/new-topics/docs passed for grid changes, then format/build/new-topics/docs/Svelte/diagnostics/presentation passed for disclosure changes. Sandbox initially blocked the local test server (EPERM); the approved rerun passed. This resolves the previous turn's outstanding grid/pointer browser check. No running process, commit or publication.

User challenged the score-estimate map and requested research. Inspected the current distance heuristic and primary documentation/source for Goscorer, OGS's C++/WASM estimator/current wrapper, GNU Go, KataGo and Tenuki. Recorded the comparison, licences, limitations and proposed separation of provisional estimates/final rules-based counting in puzzles_patches. Recommended replacing the ad hoc cutoff, Goscorer for final scores, and evaluating the OGS estimator for offline provisional estimates; noted OGS calls the local path somewhat deprecated. No scoring implementation or dependency changed in this research. No library benchmark or stronger-engine accuracy claim.

## 12 October 2026 — GNU Go, compact timer and verified progress-file saves

User selected GNU Go loaded on demand, screenshot-directed timer placement, a short filename hash, and tighter muted timer controls (time returns to normal ink after start). Implemented GNU Go 3.8/WASM worker estimation with base-aware host URL, cancel/stale-response protection, timeout/error/retry UI and manual area-count alternative. Official source, full licence, bridge/worker and reproducible Emscripten 4.0.22 build are distributed together; About and THIRD_PARTY_NOTICES link them. Old distance heuristic removed; patch register updated. No computer opponent or scoring-rule change.

Build failures resolved: modern compiler duplicate globals, GNU configure lacking SIZEOF_INT, and old Makefiles selecting the native archiver despite configure AR. Build script now patches single definitions, fixes hash words to 32 bits for both native generators/WASM, and explicitly passes emar/emranlib to make. Final clean build succeeded at /private/tmp/maths-gnugo-release3. WASM is 4,721,699 bytes (415,619 gzip, if hosting compresses it); glue is 12,504 bytes. Original GNU archive SHA-256: da68d7a65f44dcf6ce6e4e630b6f6dd9897249d34425920bfdd4e07ff1866a72. WASM SHA-256: 1d514701c21adfdefcdcb0faae255e3a9a328d0a2d341925c96cc39630080d36.

Suggested progress filenames now use 12 lowercase base-36 characters derived from FNV-1a 64-bit UUID hashing; full UUID stays in JSON, file links and identity. Existing linked names stay unchanged. Topic timer now uses a two-line right-aligned header layout, adjacent adjustments, muted label/controls and normal time colour after starting. Soft expiry sound remains without a checkbox.

User reported selecting OneDrive root but seeing only the original save invitation. Device/browser cause remains unconfirmed. Found cancellation/interrupted AbortError was silently ignored; now report it, and contextualise failures after directory selection. File success requires close and read-back matching the exported bytes. Browser working data is not cleared by file-save failure. Tests cover new Maths creation with actual browser file handles, preservation of unrelated files/nonempty progress, cancellation status, changed-file conflicts, permission, failed write/close and mismatched read-back. Native pickers remain stubbed; actual college OneDrive and cloud sync need user retry.

Verification: selected format/build, puzzle-library, new-topics, docs, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration passed. Formatting issues were corrected; a sandbox localhost denial was resolved by an approved rerun with cached passing checks retained. A progress commentary prematurely attributed the folder-check pass; immediately corrected, then actual Progress checks passed. No publication, deployment or data deletion.

## 12 October 2026 — centre the human Go playing area

Centred the board, setup/action rows, timing disclosure/clocks and status/counting text in an app-owned route wrapper. Preserved the title/rules row, board dimensions and inclusive <=440px mobile gutters. Documented in UI taste and puzzles_patches; no portable module changes. Selected format/build, new-topics, docs, logic, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration passed; existing puzzle-library/bank evidence was reused. No running processes or publication.

## 12 October 2026 — embedded browser folder-access recovery

User identified the failing browser as Chrome inside VS Code, then confirmed the same save works in external Chrome. This isolates the observed failure to their preview environment; no OneDrive account/folder configuration change was needed. Reviewed [VS Code integrated-browser permission and storage documentation](https://code.visualstudio.com/docs/debugtest/integrated-browser) and the [directory-picker specification](https://wicg.github.io/file-system-access/#api-showdirectorypicker): picker visibility alone does not establish a granted handle, and AbortError does not uniquely mean user cancellation. Do not claim a specific VS Code internal defect was proven.

Kept the recovery improvements: direct Download JSON backup in the reminder, shared permission-independent download helper with Progress JSON/CSV, accurate folder-access failure guidance and help instructions to export before switching browser stores. Preserve original error causes. Downloads report started, not confirmed saved/synced; normal linked-file saves retain read-back verification. Browser test rejects the picker, downloads the backup, checks learner ID/name and unchanged browser topics, then confirms normal folder setup still works. Existing JSON/CSV import/export checks retained.

Selected format/build, new-topics, docs, logic, Svelte/diagnostics, presentation, startup, Practice sets, Progress and integration passed; unchanged puzzle-library/bank/colour evidence reused. User confirmed actual external-Chrome save success; automated picker tests still use real origin-private handles with a stubbed native chooser. No storage clearing, settings changes or publication.

## 12 October 2026 — topic navigation advances full question pages

Corrected ordinary topic Prev/Next from individual-question selection to page-attempt navigation. Next restores a saved later page or creates another at the forward end; Prev restores earlier questions/responses. Browser-persisted previous/next stacks are scoped by learner/topic/stage, alongside the existing active page. Revisits never score answers again. Pending promotion choices still require resolution before advancing. The single-page assessment has no duplicate pager; Practice sets retain their ordered navigation. Question selection/automatic answer advancement and attempt-keyed temporary working remain unchanged. JSON exports continue to contain results rather than page attempts.

Browser regression verifies a new 12-question attempt and exact restoration on Prev; domain checks cover responses, no duplicate scoring, reload with a page ahead, and learner/stage isolation. An initial test compared an in-memory undefined field against JSON where that field is absent; corrected the expected persisted representation. Selected format/build, new-topics, docs, logic, Svelte/diagnostics, presentation, Practice sets, Progress and integration passed; unrelated passing fingerprints reused. No publication or deployment.


## 12 October 2026 — three-page banks, automatic file saves and balanced assessments

Replaced the open-ended ordinary-page sequence with three defined full pages per topic/stage/level: independent 12, scaffolded 2 and errors 4. Saved attempts and indices are isolated by learner/topic/stage/level; Prev/Next restores responses, while chevrons navigate stages. Legacy active questions and answers remain the first saved page; old history stacks remain stored. Adaptive trials retain the original navigation level, and explicit retries preserve answer history. Practice-set slots are unchanged.

Added 215 reviewed questions (108 independent, 36 scaffolded, 71 errors) and 48 arithmetic error diagrams. Each bank now has 171 questions. Original question objects and bank revisions were compared with pre-edit copies and preserved. New arithmetic answers/level structure, equation steps and erroneous continuations, repair choices, exact page sizes and nonduplicate coverage are tested. A Start division item with carrying was caught and corrected to a no-carry example. Coverage and provenance are recorded in content/PRACTICE_PAGES.md and linked from INDEX. This is not a claim of manual visual review of every new SVG. Previously deferred weak Confidence multiplication replacements remain separate.

New assessments randomly draw two eligible independent questions per level, using actual arithmetic complexity to exclude mislabelled examples; attempts retain their draw across reloads. Existing saved assessments and dedicated assessment objects remain unchanged. Removed example answer placeholders.

Linked OneDrive files now save changed transferable progress after page completion, page/stage changes, tab hiding and browser-exit opportunities. Per-question browser saves continue. Monotonic local update dates and saved-through dates skip unchanged writes; content fingerprints ignore backup/export timestamps, byte fingerprints detect external edits, and Web Locks serialize verified writes where supported. Changes during a write trigger a further write. Background saves only query permission, retain pending/error status and never request access. Closing a tab/process may interrupt asynchronous writes; successful local-folder writes do not establish OneDrive cloud upload.

On first practice/Progress entry, an already-permitted newer differing linked file offers Use file progress / Keep browser progress. Writes pause pending review. Import validates identity/fingerprint; confirmed replacement is prepared separately and applied only if browser storage succeeds. A rejected save/import keeps existing results. The invitation is now “Choose your OneDrive folder, we'll save your progress in the Maths folder.” Selecting Maths directly reuses it, without a nested Maths folder; the direct backup button reads Download backup. No deletion, automatic merge or provider authentication.

Verification across this batch passed format/build, puzzle-library, new-topics, docs, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. Tests include in-flight file changes, denied permissions/external edits, failed browser import storage, native origin-private file writes with stubbed pickers, newer-file accept/decline and finite page restoration. A Practice-set clock test now pauses relative to the browser clock instead of the host clock. Sandbox localhost denial was resolved by the approved verifier rerun. Actual cloud upload, abrupt process termination and physical-device checks are not automated claims.

## 12 October 2026 — header alignment and student-friendly help

Corrected the shrink-to-content account area: header-actions fills its grid track and contains left/right flex groups. Welcome/profile controls stay left; Progress is right beside the theme tools. Increased logo-to-account spacing to 2rem. Tools stay top-right, and the account area moves to a full second row only when its natural contents do not fit. A small shared adapter measures content on resize/name changes; CSS owns geometry. No new media query or fixed header breakpoint was added. The 684px and 744px values are regression-test viewports only; the existing 768px compact welcome font rule remains.

The user caught an intermediate premature two-row layout. The hidden measurement copy had lost the ID-based welcome font rule; moving that rule to a semantic class preserves the mobile font in measurements. Grouping follows the user's explicit left/right-container suggestion. Responsive checks and inspected 684px/744px captures now show the short-name state on one row, with the intended logo gap and Progress-to-tools alignment. Longer names and narrower widths retain wrapping.

Rewrote FAQ/troubleshooting as short, friendly student actions, especially saving/OneDrive guidance. Retained essential backup, replacement and interrupted-save advice; removed internal algorithm/schema/permission details from the student page. Standing requirements live in UI_UX_RULES/UI_TASTE, architecture/content counts in website/README, dated evidence here and current state in HANDOFF.

Final selected verification passed. One Progress test initially expected superseded import-success text; updated it. Another checked enabled state before the asynchronous file read finished; the existing auto-waiting Confirm import click now waits for readiness. Passing unrelated checks were reused. No running process, commit, publication or deployment at completion.

## 12 October 2026 — four Draft topics, masonry and growing animations

- Added working Draft M13 signed addition/subtraction, M15 fraction addition/subtraction and M06 percentages, followed by the user's M03 multiplication/division problems request. Each bank has 171 questions plus three recaps and three full pages per ordinary stage/level (12 independent, 2 scaffolded, 4 errors); assessments sample two independent questions per level. Existing M01/M02/M10 banks and saved question IDs are unchanged. Appended catalogue codes 3/4/5/6; original equations code 9 remains unchanged.
- Added topic specifications under `content/specs/`, linked through INDEX and the method-animation contract. Grounding uses official DfE/AQA Foundation requirements without selecting an exam board. Draft stamps overlay cards and topic introductions without changing their flow. Native CSS columns provide the requested masonry topic chooser, with prerequisite DOM/keyboard order down columns then across and no new breakpoint or dependency.
- M03 retains 72 historical independent questions, six scaffolded questions, three demos and nine reviewed errors, with historical S/SE IDs. Read the saved deck and answers HTML, and cross-checked source question text (one whitespace-only difference). The answers HTML informed answer/units, worked method, specific “If you got…” explanations and checks. Preserve operand roles from the questions where old illustrative answer captions swap hours and rates. Added contextual extension questions and misconception choices. No slides or authored historical sources were rewritten.
- Shared calculation components render authored inspect/write phases, signed number lines, equal-whole fraction bars and percentage bars. Updated the signed example and corresponding bank steps to separate sign conversion from calculation: + (−3) = −3, then 6 + (−3) = 6 − 3 = 3. Fractions now use the shared stacked renderer in the active question and feedback as well as buttons, demos and checks. Screenshot inspection confirmed the reported raw-brace defect is fixed. Long word problems wrap in demos and active questions; money answers place £ before the amount.
- Documented the future mixed-arithmetic topic (+, −, ×, ÷, percentages and ratio) and/or per-topic application stage in WEBSITE_PLAN. Neither additional design is implemented by this batch.
- Latest user decision supersedes the former no-scroll-during-playback rule: ShowDemo reveals the newest working edge with native minimum-needed scrolling when it is clipped below the document or scrollable reference panel. It retains initial positioning for fresh Play/replay, avoids recentering on resume, and leaves focus unchanged. Visible content and paused playback do not cause scrolling; final checks are revealed too. Short-screen fraction playback checks assert both the exact required scroll distance and pause behaviour. Existing arithmetic/equation presentation checks now verify visible latest working. Reduced-motion users receive the same immediate, non-animated positioning.
- Reduced header bottom padding from 24px to 12px below the existing 768px boundary, preserving intrinsic header wrapping and alignment. No new width breakpoint.
- Resolved verification findings: new Practice-set slots initially exceeded their ten-item limit (ordinary topic pages remain 12; encoded independent slots now six); a one-step demo can already be finished before a test presses End; broad “multiplication” searches correctly include M03 and required updated expectations. Formatting was corrected. The Progress fresh-computer import fixture now uses a separate browser context rather than clearing live storage while pending autosaves can repopulate it; production storage behaviour was not changed for this fixture.
- Evidence: selected verification passed format, production build, new-topics, docs, 104 logic tests, bank validation, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration across this batch. The final scrolling/header run passed all selected checks, with unaffected evidence cached. Responsive screenshots of new topics, active fractions and fraction feedback were inspected. This is not a teacher acceptance review of every question or physical-device testing. No commit, publication or deployment was requested or performed.

## 12 October 2026 — ordered implementation programme authorised

- User authorised working through the outstanding feature list in order, documenting each slice. Recorded the programme in HANDOFF and updated roadmap/standing requirements before code changes. The working tree was clean at entry, superseding the earlier handoff's uncommitted-batch note.
- Selected both sixth-stage topic applications and combined 1–4-operation problems with reveal/hide, challenge-matched How to solve tips. Prioritised ratios then percentages, followed by calculator-paper content.
- Requested partial-title search, compact 60%/40% heading/controls, priority/a-z sorting blending teaching difficulty with observed revision data, and an iPhone Draft-stamp clipping fix.
- Requested handwriting-stroke library investigation including JS sizes/adoption issues; agreed that any implementation belongs behind a shared animation helper. No library selected yet. No code or tests changed at this documentation milestone.

### Slice 1 — Draft content review

Reviewed the four specifications, level samples, error choices and shared diagrams. Corrected nine historical M03 repair choices that disclosed final answers; kept the full explanations in submitted feedback. Same-denominator fraction hints now focus on counting equal parts; mixed-number strips now mark whole boundaries. Percentage feedback now explains the mistake rather than giving it as an instruction, with explicit inverse checks for amounts/new amounts. Normalised signed inverse-check minus signs. IDs, models, accepted answers and Draft status are preserved. Independent bank recalculation and browser verification are pending for this slice. This is an agent review, not teacher acceptance.

### Follow-up decisions — assessment and deferred colleges

User selected four-question scaffolded pages/window. Initial assessment should be completed once, remain locked showing the score, and offer explicit Reassess only seven days after completion (muted/disabled before; stronger/enabled afterwards). Retain every assessment attempt. Other proposed windows accepted. Issue reports retain the existing composed email with blank recipient. College configuration is later documentation-only work: central hosting, college accounts, teacher-configured links and shared college-code URLs. No college infrastructure in this batch.

### Slice 2 — multiplication Confidence correction

Replaced all eleven undersized Confidence questions with 4×3, 3×4 or 4×4 digit products involving carries. Updated answers, checks, specific hints, carry explanations and the three affected website error SVGs/options; retained IDs/page slots and preserved legacy decks. Build validation now enforces the operand-size requirement across Confidence activity types. Verification is running.

### Slice 3 — 48-hour working cache

Changed the session-only drawing/typed-working TTL to 48 hours after an edit. Reads do not extend expiry; existing short-lived entries keep their recorded expiry until edited. Added an explicit 48-hour assertion alongside existing exact-boundary/renewal tests. Durable progress and backups still exclude working. Verification pending.

### Slice 4 — topic discovery and Draft stamps

Added all-term partial-title search and priority/a-z sorting in a 3:2 heading/control grid. Priority blends explicit teaching priors with the existing missing/weak/stale calculation over twenty eligible answers; it does not claim population statistics. Sort choice is stored for the current learner. Compact native controls wrap within their cell. An indivisible padded column wrapper contains the rotated Draft stamp, addressing Safari column fragmentation without changing the stamp. Added search/sort logic tests and browser containment checks, including 440px.

First content verification: build and new-topic browser checks passed. Logic found a duplicate replacement multiplication task; corrected it. The initial browser launch was sandbox-blocked at localhost and rerun with approved permission. Further verification pending after slices 3–4.

### Slice 5 — fixed scoring and assessment lifecycle

Implemented fixed windows (independent/mixed 10, scaffolded/errors 4, problem solving/assessment 6). Expanded every existing scaffolded bank to three four-question pages per level using existing reviewed independent examples with new scaffold IDs/provenance; existing saved page attempts remain intact. Reassessment thresholds still depend on page size; assessment/scaffolded answers do not promote independent levels.

Completed initial assessments now retain their score and disable Reassess for seven days; explicit Reassess alone starts a fresh draw. Completed attempts can be restored from durable history after JSON transfer. Raw submitted answers are now retained in answer history/export; historical records without raw values remain readable. Added exact lock-boundary/transfer/history tests. Verification pending for this slice.

Slices 1–4: the second run passed format/build, new-topic browser checks (including search, sorting and stamp containment), docs, logic, bank and Svelte diagnostics before slice 5 edits; remaining browser families were running. Chrome evidence does not establish physical iPhone Safari acceptance.

### Slices 1–5 verification milestone

All selected checks passed, including 108 logic tests and all browser families. Updated the old three-question error-page test to expect 75% under the now-fixed four-answer window. An earlier run detected source changes during presentation and correctly refused to cache stale evidence; the final run completed on stable inputs. No process remains running. User also selected a configurable Combined problems topic page in addition to the Practice-set builder entry; both will share selection/resolution and actual-topic attribution.

### Slices 6–7 — problem solving and combined practice in progress

Added sixth-stage problem banks (54 applications per existing topic), level-matched shared tips/playback and source-topic Practice-set slots. Added combined problem/mixed revision resolution, a builder entry and a configurable Combined problems route. Answers and active time use the actual source topic; mixed pages do not automatically promote across topics. Exact chosen IDs persist in saved attempts. The existing nine-character code contract is retained; selected-topic URLs add a topics query. New mathematics, assistance and source-attribution tests are in place. Implementation is not yet verified.

## 12 October 2026 — lattice and topic-selector refinements (current priority)

User clarified the non-calculator lattice check: round both factors to one significant figure and multiply for a ballpark estimate; do not teach inverse division as the check. Move left-edge carries lower towards the trailing end of their diagonal using grid-relative coordinates; preserve the accepted bottom-edge placement. Keep “Choose a topic” on one line by fitting its size to its available width. Search placeholder is “search”; sorting uses small native radio labels “priority” and “a-z” in the existing 60:40 heading/control row. These refinements take priority within the ongoing implementation batch.

### Slices 6–7 and lattice refinements — verified milestone

Added the sixth problem-solving stage, level-matched reveal/hide tips, combined mixed/problem pages in the builder and a configurable Combined problems topic page. Source question IDs and topic attribution persist across resume; assistance is recorded and combined work does not automatically promote multiple topics. Lattice checks now use rounded-factor estimates, including application examples; left-edge carries anchor near their diagonal’s lower endpoint. The 60:40 selector has a single-line fitted heading, “search” and small sorting radios.

`npm run verify:changed` passed format/build, new-topics, docs, logic/bank, Svelte diagnostics, presentation, colours, startup, Practice sets, Progress and integration. New problem logic checks cover arithmetic, assistance and cross-topic attribution. Two legacy progress fixtures needed problem-stage evidence; the presentation assertion expecting every label on one line at desktop was updated because six labels share the accepted 780px cap (two lines remain the limit). Inspected the 440px selector and the exact 4,312 × 156 Confidence diagram: left carry is lower and bottom carry unchanged. Physical iPhone Safari remains unverified. Further combined-page browser coverage accompanies the next topic slice.

### Slice 8 — ratios and calculator practice; verification in progress

Registered Draft M04 ratios before M06 percentages, then M07 reverse percentages and M12 speed/distance/time. M06 remains the reviewed existing topic with its added application stage. New banks each have 243 items, three recaps, level-matched application help and stable source provenance. Diagrams use labelled equal ratio parts, original/known percentage bars and journey information. Calculator permission is visible for M07/M12; rounded results use ≈. Historical authored source files remain untouched.

New-topic browser checks and all 112 logic tests passed, including independently recalculated new questions and combined-page source/assistance/reload. Bank validation caught new Practice-set independent slots using the ordinary twelve-question length, exceeding the existing ten-item contract; corrected to the established six-question Practice-set slots without changing ordinary twelve-question pages. Remaining verification follows with profile controls. A shared combined URL now compares its selected topics before resuming an identically coded saved set.

### Slices 8–9 — final source verification

Completed ratios, retained/refined percentages, and calculator-allowed reverse percentages and speed/distance/time. Combined configuration/help/source-credit/reload now has direct browser coverage. Updated shared-URL resumption to consider selected topics as well as the encoded recipe. Added local profile rename/reset/delete with exact-name confirmation for destructive actions, UUID/history preservation on rename, temporary-working identity/expiry handling and file unlinking without deleting external files. Browser tests cover rename, reset, cancelled deletion and confirmed deletion; pure tests confirm unrelated learners remain unchanged. College account/hosting work remains documentation-only; issue reporting already drafts email with an empty recipient.

`npm run verify:changed` passed format/build, new-topics, docs, all **115 logic tests**, bank, Svelte diagnostics, presentation, startup, Practice sets, Progress and integration. Unchanged colour evidence was reused. The new arithmetic tests cover all new-bank question answers/incorrect examples and operation counts; the new combined and profile browser checks passed. The tips browser fixture initially attempted End after its one-step example had already finished; it now respects the disabled completed control. Existing M03 recap floor/remainder models were excluded from the new exact-rational-chain check and retain their established topic-specific tests.

Reconciled HANDOFF, roadmap, standing UI rules, UI taste, architecture/run guidance and INDEX with current counts/stages and the user's later decisions. Physical iPhone Safari and teacher acceptance remain outstanding; Draft flags remain. No deployment/commit occurred. Final changed-document link verification follows.

### Final catalogue review — correcting new topic addresses

After the passing source run, manual catalogue review found M04/M07 had reused codes 3/6, which already belong to M13/M03. The catalogue validator had resolved by code without asserting the resolved bank matched the loop's topic, so it missed this collision. Assigned unused codes **M04=7, M07=8**, retaining M12=11 and every pre-existing address. Added unique-code and resolved-topic identity assertions, plus a regression explicitly freezing existing codes. The final documentation-only check passed before this newly found source correction; another selected verification run is required now.

### Final completion checkpoint

The catalogue correction passed the complete selected verification sequence: format/build, new-topics, documentation links, **116 logic tests**, bank validation, presentation, startup, Practice sets, Progress and integration. Unchanged Svelte/colour evidence remains cached and valid. Existing topic codes are frozen by regression; all catalogue pages now assert their resolved bank identity. One run deliberately stopped because documentation changed while it was checking it; the follow-up reused unchanged passes and finished successfully. No implementation failure or running task process remains. HANDOFF now lists teacher/device acceptance and explicitly deferred choices as next work.

## 12 October 2026 — handwriting evaluation and mobile refinements (current priority)

User requests an interactive visual comparison of available stroke fonts, with letters, digits, maths symbols, basic animations and explicit missing-symbol coverage including Higher GCSE needs. Build a reusable evaluation helper rather than embedding library calls in method classes; this is evaluation, not wholesale replacement of existing animations.

Mobile: use the screenshot's 60:40 question-heading/control arrangement (Check method upper right; timer grouped beneath it), preserve current question font size by default and allow modest shrinkage to a readable minimum to fit two questions per row. Complete rows fill the available width; incomplete rows retain the normal full-row slot width unless their content needs more. When topic introduction collapses to one column, search/topic controls precede subject/topic; make the topic selector content-sized through shared control styling. Always label answer inputs “Answer”, retaining units where needed. Each topic specification supplies a default question prefix; show “Solve the equation” above an equation in the answering section. Add practical quick-check guidance to every implemented topic specification, distinguishing calculator/non-calculator use.

Implementation pass: added a 16-font local stroke gallery and common native SVG/Web Animations helper, explicit glyph coverage and bundled attribution; no method font replaced. Added bounded selector-font fitting with equal-width row slots, responsive intro order/content-sized selects, 60:40 practice header, universal Answer label with separate units, and bank-owned prefixes. Added M01/M02/M10 website specs and quick-check guidance to all ten implemented topic specs; protected historical sources are unchanged. Verification pending.

Follow-up: user prefers a 12.5px minimum for short question-button content. Use 0.78125rem at the default 16px root, retaining default font sizes whenever content fits and keeping the active question larger. Explained CSS 12pt = 16 CSS pixels for both Samsung and Apple; hardware pixel density does not alter that ratio. Gallery mobile overflow was caught and fixed; comparison paths now use a consistent 1.5px pen. First presentation run after that caught a transient 320px question containment measurement; width-triggered fitting now runs directly in ResizeObserver before paint, with content changes still coalesced. Reverification pending.

Final font-floor decision: after comparing CSS px/pt sizes, the user chose **14px**, replacing the interim 12.5px preference. Defaults remain unchanged and long questions take wider slots. The 320px failure persisted after observer timing was tightened: diagnostics showed some spans reporting narrower bounds than their actual text. Fitting now measures a DOM Range around the maths content, matching the actual-ink containment check.

### Completed and verified — handwriting/mobile refinement batch

- Sixteen locally bundled Latin stroke-font candidates now have letters/digits/basic-symbol specimens, exact missing Basic/Higher/additional character lists and a configurable example with Replay, Pause/Resume and End. Unsupported glyphs are boxed ordinary text. The common `handwriting.mjs` helper owns layout and native stroke playback, including cancellation/seek/reduced motion; methods retain their existing animations. Font licences ship with the gallery. Source-order engraving strokes still require teaching review before adoption.
- Final question-font minimum is **14px** (0.875rem), retaining original default sizes when they fit. Short questions use equal row slots; incomplete last rows keep the full-row slot width, centred. Long content gets a wider slot. The header uses left 60% heading/Level and right 40% Check method/timer; collapsed topic introductions put controls first and selector triggers share content sizing.
- The visible answer label is always **Answer**, with units separately described. Topic-bank defaults supply question prefixes; contextual applications can override them. All ten website topic specs include practical checks matched to calculator permission. New M01/M02/M10 specs are indexed; authored historical sources remain untouched.
- Failure trail: gallery phone overflow corrected by bounding its nested cards. Thin source pens were normalised to a 1.5px display stroke, with screen-space dash lengths. Question fitting now measures DOM Range bounds and confirms the final ink width instead of relying only on proportional font scaling. The residual 320px assertion was reading before native ResizeObserver delivery; waiting for actual settled containment fixed the test without weakening its centring/containment assertions. An earlier note suggesting observer timing alone fixed it was provisional; this is the final evidence.
- `npm run verify:changed` passed all selected jobs: format/build, puzzle library, new topics, docs, 117 logic tests, bank validation, Svelte diagnostics, presentation, colours, startup, Practice sets, Progress and integration. Inspected the font specimens and exact 360px equation header/button captures. This does not constitute physical iPhone/Samsung acceptance.
- Gallery preview is running at http://127.0.0.1:8767/handwriting.html (exec session 65392). The existing occupant of port 8766 was not changed. No commit/publication/deployment. Final documentation link verification follows this entry.

## 12 October 2026 — compact introduction and alphabetical topic switcher

Reduced controls-to-subject/title spacing by about **1.5rem only below 440px**, where the introduction is one column; the screenshot showed excessive empty space. Preserved the separate description and chevron gaps. Topic dropdown options now sort **A–Z by title** to make a named topic easier to find; sorting a copy preserves teaching priorities and stable catalogue addresses. Selected verification is pending for these two refinements.

### Whole-session decision recap and rationale

Cross-checked the complete conversation against the dated slices above. This recap records final choices; the earlier entries retain implementation milestones, failures and validation evidence.

| Final choice | Rationale |
| --- | --- |
| Review Draft hints/errors/diagrams; strengthen eleven multiplication Confidence questions, retaining IDs | Avoid answer leakage and make challenge depend on carrying/method complexity. |
| Keep temporary working for 48 hours after its last edit | Allow return to unfinished work without mixing scratch work into durable progress. |
| Method-topic sixth stages **and** configurable Combined problems, also in the builder; dedicated problem topics finish at stage five; 1–4 operations | Practise both individual methods and choosing/combining methods. Credit the actual source topic without automatic multi-topic promotion. |
| Reveal/hide How to solve tips with steps, advice and a level-matched example | Offer relevant help; record its use as assistance. |
| Ratios, then reviewed percentages, then reverse percentages and speed/distance/time with calculator permission | Follow teaching prerequisites and extend calculator-paper practice. Draft still means teacher review pending. |
| Four scaffolded questions/page; fixed scoring windows 10 independent/mixed, 4 scaffolded/errors, 6 problems/assessment | Keep scoring comparable across page lengths. |
| Completed initial assessment remains locked with its score; explicit Reassess enabled after seven days; all history retained | Preserve a meaningful baseline and make reassessment deliberate. |
| Partial-title search and compact 60:40 homepage controls; small priority/a-z radios; fitted single-line heading | Find topics quickly in limited space. Priority starts from teaching difficulty and blends in learner evidence. |
| Reserve complete masonry slots around rotated Draft stamps | Prevent top/bottom column clipping without changing the stamp design. |
| Lattice check rounds both factors to 1sf; left carries move lower along their grid diagonal | Keep checks practical without a calculator and reduce carry-position ambiguity; accepted bottom placement stays. |
| Investigate stroke-library sizes/licences; provide 16-font coverage/animation gallery behind one helper | Evaluate writing clarity and missing GCSE/Higher symbols before changing methods; avoid repeated library integration. |
| Equal-width question slots, including partial rows; keep default font, shrink only to **14px** | Use mobile space while preserving readable signs/digits. The interim 12.5px idea was withdrawn after the px/pt comparison. |
| 60:40 practice header; Check method above timer; collapsed topic controls precede subject/title; content-sized selects | Keep controls compact and consistently placed on phones. Below 440px, search/Go and Topic share a wrapping row with a useful search minimum; normal title spacing is restored. |
| Always label input **Answer**; topic-owned question prefixes; calculator-appropriate quick checks in every topic spec | Make the task explicit (e.g. Solve the equation) and keep teaching/checking conventions systematic. |
| Alphabetical topic-switcher options | Make an already-known topic quick to locate without changing homepage revision ordering. |
| Local profile rename/reset/delete with precise confirmation and external-file unlinking only | Complete learner controls while protecting other profiles and saved files. |
| Issue reporting keeps a composed email with blank recipient; college accounts/links/code URLs remain later work | Retain student control of the destination and keep current scope focused. |

Library measurements and adoption limits remain in [METHOD_ANIMATIONS](docs/METHOD_ANIMATIONS.md#handwriting-stroke-investigation--12-october-2026); standing behaviour is in UI_UX_RULES/UI_TASTE and current state in HANDOFF. No publication was requested. Physical-device and teacher acceptance are not implied by browser checks.

Latest refinement validation: `npm run verify:changed` passed format/build, new-topics, docs, Svelte diagnostics, presentation, colours, startup, Practice sets, Progress and integration; unchanged logic/bank results were reused. Browser assertions cover alphabetic option order and the approximately 2px controls-to-subject gap below 440px, with the wider two-column layout unchanged. The whole-session recap was checked against all user requests. Preview remains on port 8767; no publication or commit.


## 12 October 2026 — one-row phone controls and application-topic stages

Latest user decision supersedes the earlier collapsed-title margin reduction: below 440px, search/Go and the content-sized Topic selector share one wrapping row. Reserve enough search width for its prompt; allow wrapping below approximately 360px rather than compressing it. Restore normal subject/title top spacing because the controls now occupy less height.

Dedicated problem-solving topics finish at Independent practice (five stages), because this already applies methods to problems. Mark M03 explicitly in its bank; method topics retain their sixth application stage, and Combined problems retains its configurable page. Keep How to solve tips on M03 independent pages, all historical answers and authored problem questions/Practice-set slots. Use shared stage selection for navigation rather than a topic-specific hidden button. Implementation and selected verification are pending.


Preview correction: the running Vite static preview retained its asset inventory across rebuilds, so the updated handwriting HTML referenced CSS/JS files it returned as 404. Reproduced the stylesheet 404 at port 8767; replaced the stale process. This was a preview-serving failure, not missing font data. The first new stage regression also exposed a fixture mistake: creating a learner with all banks selects the first bank; explicitly select M03 before testing its home-stage navigation.

Latest spacing request: reduce the shared active-question-to-Answer-label gap by **0.5rem**, bringing the input closer to the question without changing either text size.


Completed verification: `npm run verify:changed` passed format/build, new topics, docs, **118 logic tests**, bank validation, Svelte diagnostics, presentation, colours, startup, Practice sets, Progress and integration. Phone checks confirm search/Go + Topic share a row at 360–439px, wrap at 320px with a ≥160px search field, restore the 26px controls-to-subject gap, and preserve the ≥440px layout. M03 has five chevrons, independent tips and retained Practice-set/history behaviour; other Draft method topics retain six. The active-question bottom margin is reduced by 0.5rem.

The handwriting gallery passed its focused browser checks at the actual `http://127.0.0.1:8767/` address, first under Vite development and again after switching to a direct static-file server. Final preview uses `python3 -m http.server 8767 --bind 127.0.0.1 --directory build` (exec session **41579**), which reads changed asset files without retaining Vite preview's stale inventory. Sixteen font specimens, playback, missing-character fallbacks, responsive layout and reduced motion passed; inspected the styled Sans specimen. No font/runtime change was needed. No commit, publication or physical-device acceptance is implied. Final documentation reconciliation follows.


## 12 October 2026 — Pacifico preference and preview address

User prefers Vara **Pacifico** and asks how to keep maths symbols/units visually consistent. Inspected the vendored stroke data: all Latin letters/digits and common alphabetic units are present; exact − × ÷ £ ° ± ≤ ≥ ≈ √ π θ ∞ and superscript ²/³ are absent. Proposed next step (not yet implemented): extend the shared helper's Pacifico glyph set with matching maths pen paths, reuse its letters for units, and position existing digits for powers; fractions/root bars require shared mathematical layout. Review a short maths/unit specimen before integrating into teaching animations.

Port check: the complete app responds at `http://127.0.0.1:8767/`, with the gallery at `/handwriting.html`; port 8766 still has a listener but timed out without an HTTP response. Its unrelated existing process was left untouched. No application source changed for this advice/status request.


## 12 October 2026 — Pacifico maths extension and shorter question buttons

User authorises extending Pacifico with matching maths/unit strokes and requests measured package size. Build a separate, reusable extended-font asset and show it alongside the original in the gallery, with units, higher symbols and powers; preserve the original 16 specimens and use the existing shared writing controller. This authorises the extension/evaluation, not replacing every method animation yet. Report font data and shared helper bytes separately from the optional Vara runtime and the full comparison collection.

Reduce question-button top and bottom padding by 0.5rem each (1.5rem → 1rem); lower the old minimum height accordingly so it does not cancel the requested height reduction. Preserve readable text, number/outcome clearance and 44px minimum targets. Implementation/verification pending.


The user identified `.question-option` minimum height as a likely constraint; confirmed the existing 78px floor would mask much of a padding-only reduction. Both padding and floor are reduced together (62px floor at the default root). Corner number/result markers keep their font size but use single-line boxes and 2px edge insets to remain clear of the tighter content area. First selected run passed build/new topics and the new font coverage test, but hit an unrelated timing assertion in the existing autosave lifecycle test (25ms wait, expected one save, observed zero); rechecking before considering any change to that subsystem.


Pacifico extension and first shortened-button trial passed all selected verification, including **119 logic tests**, generated-data equality/coverage, raised-index rendering, animation controls, mobile containment and marker clearance. The earlier autosave timing test passed on rerun without changing that subsystem (its wait is 20ms; 25ms was the reported test duration). Inspected desktop/mobile extended glyph specimens and the 360px equation-button capture.

User's visual refinement: add **2px to question-content padding on every side**, explicitly preserving the question-number position. Final padding is 18px block / 10px inline at the default root. Minimum height now derives from the existing 30px text/border floor plus twice block padding: **66px**, so a later padding adjustment cannot be masked by an unrelated height floor. Question number offsets remain unchanged. The previous 62px trial is superseded; selected verification follows this refinement.

Measured the standalone extended font (37,078 bytes raw / 11,176 gzip) plus minified shared helper (3,136 / 1,704): **40,214 bytes raw / 12,880 gzip**, with no Vara runtime dependency. The generator adds 64 glyphs for 158 total, retaining the original letter/digit strokes; all audited Basic/Higher/additional/unit/index groups pass, with explicit fallback for unsupported characters. Detailed reproducibility, scope, licence and local-server compression limits are in METHOD_ANIMATIONS.


Final 2px refinement verified: `npm run verify:changed` passed format/build, new topics, docs, presentation, colours, Practice sets and Progress; unchanged logic/Svelte/startup/integration evidence was reused. The final button minimum is 66px, block padding 18px and inline padding 10px at the default root. Number offsets and marker positions were preserved exactly through this last refinement. Pacifico Maths is live at `http://127.0.0.1:8767/handwriting.html#pacifico-maths`; the full app remains on port 8767. No method-wide font replacement, commit or publication was performed. Final documentation reconciliation follows.


## 12 October 2026 — quieter question numbers

User requests approximately 10% smaller question numbers and 10% less contrast against their surface, with no retest and personal visual confirmation. Changed only `.question-option .num`: 0.8rem → 0.72rem (12.8px → 11.52px at the default root), opacity 0.9 to blend the existing muted colour 10% towards the actual button surface across normal/selected/result states. Corner offsets, question content and result markers are unchanged. Refreshing the static build for port 8767; no tests or verification suites are being run, as requested. Appearance awaits user confirmation.

Static build completed successfully using Vite directly (no test/validation command). Updated preview is ready on port 8767 for the user’s appearance check.


## 12 October 2026 — preserve number line-box position

User approves the smaller number size/colour but reports the digits appearing higher. The absolute top inset had not changed; unitless `line-height: 1` shrank the number’s line box from 0.8rem to 0.72rem with the font, also changing the visible glyph’s vertical placement. Keep the approved 0.72rem/90% opacity and restore a fixed 0.8rem line height, preserving the earlier line-box height and corner offsets. Result-marker line height remains 1. No tests requested/run; rebuild only, with visual confirmation left to the user.

Vite-only build completed successfully; the line-box correction is available on port 8767. Visual confirmation remains pending.


## 12 October 2026 — number inset correction and refresh stage restoration

User reports the line-box correction did not fix the perceived upward movement. Traced the earlier shorter-button change: the shared number/result inset had also changed from 4px to 2px. Restore **4px specifically for question numbers**, leaving the smaller font, 90% opacity, fixed line height and 2px result-marker inset intact. The earlier claim that font metrics alone explained the movement was incomplete. User continues visual acceptance; no appearance suite is requested.

New authorised behaviour: refresh restores the current chevron stage. Persist `lastMode` with each learner/topic in existing schema-2 browser progress, restore it on session creation/topic/profile selection, and leave ordinary stage selection intact while inside a Practice set. Invalid/missing values fall back to assessment; a retired M03 sixth-stage selection maps to independent practice. Existing page attempts, submitted answers and assessment lock remain authoritative. Functional verification will cover reload, stage/topic/learner isolation and Practice-set separation.


User confirms the inset correction and requests a further **1px downward** adjustment: final question-number `top` is **5px**, with approved size/opacity and result-marker positions unchanged. The first focused browser check stalled because its new fixture omitted the existing second Continue confirmation for a new profile; the run timed out waiting for the first stage button; corrected the fixture. Session/Practice-set/problem-solving tests had already passed (27 tests).


Completed: rebuilt the static site; **27 focused session/Practice-set/problem-solving tests passed**, and the focused startup browser checks passed with actual reloads through all six ordinary stages and saved second-page restoration. Profile/topic isolation, assessment locking and ordinary-stage separation from saved sets were covered by the focused logic tests. Appearance/colour suites were not rerun, respecting the user's manual appearance review. Final number top inset is 5px. Changes are available at port 8767; no commit/publication.


## 13 October 2026 — method handwriting and compact playback/progress

Current authorised priority: integrate reviewed Pacifico Maths pen strokes into learner-written method working through the shared helper and existing timeline; leave explanatory prose in the normal font. Remove the active-working highlight outline and add 2px horizontal clearance. Fit Play/Previous/Next/End/speed on one row at 360px, omit the visible Speed label while preserving its accessible name. Progress becomes “Your progress [bar] [percentage]” then “Level: [level]”, without “recent success”. Silently ignore occupied-intersection attempts in Go puzzles while preserving other invalid-move feedback. These reduce visual clutter and make the animation resemble student working. Implementation and verification pending.


Follow-up authorised during this batch: keep the human/practice Go board’s Count, Pass, Undo and Redo on one row at 360px, with Count first (also in keyboard order), retaining 44px targets. Add the repository README’s deployed-site link explicitly labelled “Live demo for testing”. A root README did not exist, so a concise entry point is added and registered in INDEX. First verifier attempt passed formatting, build and puzzle-library tests, then the browser job was blocked by sandbox localhost permissions (EPERM); rerun with the established elevated verification command. No application failure was established by that attempt.


Intermediate checks: all topic/Go scenarios, 119 logic tests, Svelte diagnostics and docs passed. Two new presentation assertions needed correction: Chromium reported the default 3px outline width despite `outline-style: none`, and `innerText` includes screen-reader-only Speed text. Assertions now check the actual visible outline style and clipped accessible label. Preserved highlight clearance only in staged working, leaving static previews’ spacing unchanged. Added explicit reduced-motion and failed-font-fetch fallback checks.


User follow-up: guide lines should draw **3× faster**, highlights should use **0.85 background alpha** so underlying lines remain visible, and equation-explainer/working horizontal clearance should be effectively zero to reduce prose wrapping. Apply a guide-only pace multiplier through the existing player (numeric handwriting retains its speed), shared translucent highlight colour, and remove the adjacent note/right and maths/left padding.

The first full run passed presentation, colours, startup, Practice sets and Progress; integration flagged the previously approved quieter question numbers for colour contrast. Preserve the user's explicit visual choice; narrowly exclude those numbers from that one rule while retaining raw audit reports and checks on all other content. Visual review also caught a real arithmetic SVG placement issue missed by earlier layout assertions: the nested viewport needed explicit width/height geometry as well as CSS sizing. Added a regression check comparing every placed handwritten digit/carry with the original mathematical baseline. Verification of these refinements is pending.


All selected verification passed for the Pacifico integration, corrected digit/carry baselines, 3× guide pace, translucent highlights, reduced explanation gap, compact Go controls, progress layout and README link. Inspected corrected phone lattice and equation captures. No dependency, commit or publication was added.

Latest refinement: centre the method playback controls as one group. User clarifies that chevron memory is per topic: restore each destination’s previous stage, or Initial assessment for a new topic. Code review confirms existing per-learner `topics[subject:topic].lastMode` and `restoreStage()` already implement this. Keep that logic; extend the real-browser startup check to alternate equations/independent → new division/assessment → division/method → equations/independent, reload each saved destination, then visit new multiplication/assessment. Verify centring at 360px without sacrificing the single row.


The added topic-navigation browser scenario initially stopped before the stage assertion because automatic scrolling left the dropdown option outside the viewport. The fixture now scrolls to the topic header before opening the selector, matching ordinary visible navigation; no persistence failure was observed. Also removed an unintended extra topic-selector maximum introduced while bounding the progress block; shared content-sized selector styling remains authoritative.


User requests more surgical verification, removal of the explainer’s left accent and a final-highlight fade (hold 3 seconds, fade for 1 second). The previous shared-CSS dependency map reran unrelated puzzle/topic scenarios for small playback cosmetics. Isolate playback-control/highlight CSS and add a short focused browser job; its style-only changes must not select the broad topic/puzzle, presentation, Progress or Practice-set suites. Retain broad checks for shared layout/runtime changes. One policy-change verification establishes the new cache; subsequent cosmetic edits use the narrow job.

The final fade belongs to the existing disposable motion controller, affects highlight backgrounds/fills only, cancels on navigation/replay and retains written ink. Reduced motion clears the highlight instantly after the same three-second hold. Native keyboard topic selection is used in the stage-memory regression to avoid the pointer fixture’s off-screen option, preserving actual app navigation and reload assertions.


The focused playback job passed in **2.1 seconds**, covering 360px centred controls, equation/arithmetic/fraction working, 85%-alpha highlights, 3s hold/1s fade, replay cancellation and reduced motion. The broader presentation suite also passed. Keep the final highlight timing in real seconds even if the student changes writing speed after the demonstration completes. Dependency-map tests now ensure a change confined to playback CSS selects only this browser job (plus ordinary build/format checks).

The keyboard-based topic-switch regression successfully restored the second topic’s Learn the method stage, then hit an ambiguous test heading (both h1 and method h2 read “Bus stop division”). Tighten the fixture to h1; no application persistence change is required. Subsequent selected verification passed, including focused playback (2.2s) and startup/topic restoration (5.0s).

User requests approximately another 2em for equation explanations without losing RHS working. Replace the annotated animation table’s fixed 56% explanation allocation with intrinsic, non-wrapping maths columns and a remaining-space explanation column; reduce unused outer RHS cell padding to 2px. This moves short working right without transforms or fixed offsets, while longer expressions retain their required width. Check every equation demo/recap at phone widths for actual stroke containment and readable explanation width. Verification pending.


Equation-layout verification: the first fixture attempted End on an already completed example; corrected it to wait for font readiness and skip End when already finished. Actual containment then exposed the longest Confidence example overflowing at 320px. Compact 4px inner maths gutters alone were insufficient; added a panel-width-based mobile font clamp from the existing 1.1rem to a 1rem minimum (normal 360px size retained). All six demo/recap examples now pass at 320/360/390px, checking actual strokes against explanation and right boundary. The short 360px example gives prose at least 150px; its capture was visually reviewed. Format/build, docs and focused playback passed; the expanded playback job took 3.9s. No broad suite rerun was needed. Reconciled HANDOFF to current state, removing superseded pending-integration/test claims.


## 13 October 2026 — reported missing additional topic cards

User reports missing cards on local port 8767. Inspected the homepage loader and the actual served HTML, then loaded that same preview in a fresh 360px browser context: all 11 cards render, including ratios, percentages, reverse percentages and speed/distance/time. Actual card bounds stay within the viewport; the full-page capture confirms visible cards and no clipping. No registration/rendering defect reproduced and no production change made. An older open tab retaining earlier client data is a possible explanation, not an established cause; ask for a direct homepage refresh before further diagnosis. This was a focused inspection, not a full verification rerun.


## 13 October 2026 — ratio question defect and topic-card working

User identified that the ratio preview gives the total then asks for the same total. Audit found 42 affected ratio items (24 independent, 8 scaffolded, 8 spot-error and 2 demos), all with known=target=total. Correct Build items to request a named share and Confidence items to request the difference, keeping IDs and aligning mathematical models, answers, working, hints, checks and error repairs. The Build/card example now shares £160 between Ada and Ben in ratio 3:5 and asks for Ben’s £100 share. Existing saved histories remain intact; no migration or source-deck rewriting. Prior arithmetic validation established calculation consistency but missed this pedagogical defect; add an independent given/requested-quantity regression. User also requests slightly larger, centred working on topic cards; scope styling to previews and check narrow cards. Verification pending.


User extends review to every other draft topic: parse for answers already given and other serious defects; also show explicit simplification in selected ratio solutions. Review will use prompt-derived calculations and context checks in addition to the existing model-derived answer checks. Current verification passed topic-card containment/centring, but the new ratio assertion incorrectly treated a two-batch final answer as the one-batch share; correct the test to account for later application operations. No production mathematics failure was indicated by that assertion.


Draft-bank review covers 1,743 question/example records across all seven draft topics (249 per bank, including three problem-tip examples). Parsed prompt families, independently recalculated correct displayed working and added durable prompt-derived checks for percentages, reverse percentages, journeys, signed arithmetic and fractions; M03 also checks every model input against the prompt’s numeric/spelled givens. These checks complement model-based mathematics; they do not replace teacher acceptance.

Findings/fixes: 42 ratio questions requested the supplied total; corrected and clarified units/context throughout the ratio bank. Added 33 explicit Build ratio reductions, including the worked/card example 6:10 → 3:5; subsequent arithmetic/diagrams consistently use simplified parts. Removed cancelling add/subtract pairs from 38 fraction applications and corrected addition-only questions to ask the amount altogether. Signed application sets previously repeated one answer throughout Start/Build and had divers rising above sea level: varied first changes, retained divers at/below sea level and replaced generic changes with explicit units/actions in 57 scenarios. Clarified that all full packs sell and what sales/delivery amount is requested in 19 M03 applications; corrected transport step wording and percentage-sales grammar. No additional answer/given contradictions were found in the reviewed reverse-percentage or journey templates; independent prompt calculations pass.

The new prompt checks caught a repair-script mistake that replaced both used quantities in four-operation fraction questions; reconstructed each quantity from its corresponding operation and reran the targeted checks. A signed prompt parser initially missed the minus before £; corrected the parser. All 13 focused content/application tests now pass, including every displayed correct calculation (4,288 steps). Full change-selected verification and final card capture are pending. Existing IDs and saved histories remain intact; no publication.


Draft audit/card batch completed: all selected checks passed (new topics, content/logic, bank, Svelte, presentation, playback, colours, startup, Practice sets, Progress and integration). User now requests the same quality/sense audit for the three non-draft topics and about half the vertical spacing between priority/a–z radios. Remove inherited form-label block margins and halve the sort row gap from 0.5rem to 0.25rem; keep horizontal spacing. Audit all ordinary/recap/application items plus arithmetic teaching recaps; verify equation solutions/steps independently and review arithmetic question/answer/remainder relationships and application wording. Work in progress.


Non-draft review: 741 records (246 multiplication, 246 division, 249 equations), including application tips and equation recaps. Independent prompt/operand checks found no incorrect ordinary answers or remainders; all equations have a unique stated solution and all 976 correct balance rows preserve it. The expanded calculation check covers all ten topics. Clarified 19 multiplication application examples to specify purchase of all items and 19 division sales examples to specify sale of all full packs and any packaging deduction. No mathematical answer/ID changes were needed in these three banks. Their 379 application steps also pass arithmetic checks. The new equation test initially assumed recaps had an answer field; it now uses the final working row where that field is absent. All ten focused content-quality tests pass.

Sort-radio refinement removes inherited 12px/6px label margins and halves the flex row gap from 8px to 4px, reducing the space between stacked choices to about half their previous centre-to-centre distance. Native radio labels and horizontal spacing remain. Final browser verification pending.


All selected checks passed for the non-draft audit and compact radio controls. Final 360px captures confirmed the reduced radio spacing and centred/enlarged previews, but exposed a ratio reduction wrapping inside its output. Use the conventional short equivalent-ratio line (6:10 = 3:5), with both explicit divisions (6÷2=3 and 10÷2=5) in its teaching explanation. The step title still states the common divisor. This avoids splitting the resulting ratio in a narrow card without shrinking the entire preview. Reverification pending for this final content refinement.


## 13 October 2026 — units and acceptance of additional topics

- User requests units in speed/distance/time working and stated answers, including intermediate rates (4/3 km/min, then 80 km/h), so conversions are understandable. Learn the method must remind students to include units in exams; app entry stays numeric.
- Extend the same rule to prices and all unit-bearing answers, placing £ before monetary amounts. Preserve mathematical answers and marking.
- User accepts removing Draft stamps from all seven additional topics (M03, M13, M15, M04, M06, M07, M12). Update current status and retain content checks independently of Draft status. This does not authorise deployment. Implementation/verification pending.

- Implemented shared quantity formatting and authored intermediate result units; raw calculation operands/answers remain unchanged. Cards, demos and feedback use the same labels. Keep each unit with its result when wrapping. Corrected M03 sticker answer labels that still said cards. Bank-owned teaching notes remind students about exam units.
- Removed Draft flags from all seven banks and route metadata; updated specifications/current rules. Preserved both browser coverage families by selecting calculation versus symbolic methods, independently of Draft status.
- Initial selected run passed build, new-topic browser checks, logic, bank validation and Svelte diagnostics. Presentation then exposed an old test assumption: `!draft` selected symbolic questions, but now included prose M03 and incorrectly demanded three columns at 720px. Select symbolic methods explicitly; calculation-topic responsive checks remain separate. The 360px capture also showed a detached km/min label; result/unit wrapping is tightened before rechecking.

- Final unit/status batch passed all selected checks, including presentation, startup, Practice sets, Progress and integration; passing content/logic checks were cached. No deployment.

## 13 October 2026 — remainder working and Build challenge review

- User queries the last card sitting at the bottom of the right column. Current native columns read down then across; they do not place each next card in the shortest column. Explained the cause; no packing change requested explicitly.
- Replace inverse-identity-first remainder working with division showing quotient/remainder, followed by the contextual answer; retain inverse identities as checks. Review all M03 practice content, not just its card.
- Homepage already selects Build (level 1 in zero-based data), but the M03 130 ÷ 6 example is too gentle. Replace it with a more substantial Build example and audit tier separation. Found ten Build records that only multiply a rate/area by a quantity, overlapping Start; add a meaningful quantity-combination step while preserving IDs, provenance and historical saved attempts. Implementation/verification pending.

- Replaced 65 inverse-identity working rows across M03 questions/recaps with explicit division and `r` notation; checks keep the useful inverse identity. The new Build demo adds a 66th remainder example: 146 pupils + 9 adults = 155 people; 155 ÷ 12 = 12 r 11; 13 minibuses are needed. Its source ID/provenance are retained with a dated website refinement.
- Strengthened ten Build rate/area records (including scaffolded/error copies): combine two times or counts before multiplying. Aligned models, answers, units, hints, misconception repairs and checks. Start stays primarily one direct operation; Build adds interpretation/grouping; Confidence links an intermediate result to another quantity/cost. Other card examples already select their topic’s Build demo. Added independent remainder reconstruction and prompt-derived grouping checks; practice-set references continue to use the same bank IDs. Verification pending.

- Remainder/Build batch passed build, new-topic browser checks, content/logic and bank validation; the 360px new card was visually inspected. Presentation then failed the existing 14–17.29px font assertion immediately after resizing from desktop. The test now waits (bounded to three seconds) for the same font bounds while advancing the mock animation clock, allowing ResizeObserver delivery; it retains the original bounds and adds size diagnostics. Rerun pending; no production layout change was made for this failure.

- Final selected verification passed, including presentation (30.1s), startup, Practice sets, Progress and integration; unchanged passing build/content checks were reused. The 360px homepage capture confirms the revised Build question, quotient/remainder working, unit labels and absence of Draft stamps. No masonry, stored-history, commit or deployment changes.


## 13 October 2026 — packed masonry and calculation spacing

- User clarifies masonry must place each next card at the highest available position, choosing left to right for equal heights. This supersedes down-column reading order. Preserve priority/a–z DOM and keyboard order while packing in that sequence. Keep natural card heights, responsive widths and stamp clearance.
- Add explicit space on both sides of displayed equals/approximate signs; component-boundary whitespace currently disappears beside results such as £24. Use shared calculation-renderer spacing. Implementation and verification pending.

- Implemented `topicMasonry`: CSS owns equal responsive track widths; the action places each source-ordered card in the shortest column, with leftmost ties. It responds to resizing, card-size changes and search/sort mutations, reserves the full container height and cleans up observers/frames on navigation. A normal CSS grid is the static fallback; no library dependency.
- Shared calculation equals/approximation spans now have 0.25em padding on both sides, fixing the missing gap before results/currency. Existing maths/content is unchanged.
- User confirms sorting must match the sequence students see scrolling down, not column-first reading. This is the new packing/DOM/keyboard sequence and is recorded in standing rules.
- Verification passed all selected checks: format/build, responsive packing (320–1100px), filter/empty/single-result/sort packing, content containment/sign spacing, logic, Svelte, presentation, playback, colours, startup, Practice sets, Progress and integration. Inspected the 360px screenshot. No content, progress, commit or deployment changes.


## 13 October 2026 — ratio Confidence majority

- User wants the majority of level-three (Confidence) ratio practice to link ratio reasoning to further calculations, rather than relying on basic sharing/difference questions. Foundation suitability depends on reasoning and arithmetic, not step count alone.
- Audit found all 36 independent, 12 scaffolded and 12 error questions still ended at the ratio result; only the 18 problem-stage questions continued further. Target at least 75% in each ordinary practice type, plus matching demonstrations/recap/help. Retain a minority of core ratio questions. Keep each problem within four arithmetic operations and preserve stable IDs/provenance/saved histories.
- Use varied, plausible links: price per litre, repeated recipe batches, additional rest, beads used, centimetres to metres, and a simple percentage of a money share. Replace unrealistic Confidence costs per gram/minute/centimetre while reviewing those linked questions. Implementation/verification pending.

- User refines the target to two thirds and explicitly includes Learn the method and scaffolded stages. Implemented 24/36 independent, 8/12 scaffolded and 8/12 errors, with a retained core-ratio third; all 18 problem questions remain linked. Updated 63 records including the demo, two stored assessment candidates, recap and help example. Stable IDs/provenance retained; saved histories untouched.
- Learn the method now demonstrates cost after finding a ratio share, with a metres-conversion recap; problem help demonstrates saving 25% of a money share. Confidence guidance and all eight linked scaffolded examples include the final calculation. Six contexts cover cost, repeated batches, extra rest, beads used, unit conversion and simple percentage saving. Replaced unrealistic linked-question prices and repaired a contradictory one-part-difference note.
- Authoring script first stopped on an unset local variable before writing any bank changes; corrected and completed. Targeted content/coverage verification pending.

- User additionally requests a light sprinkling of simple two-step Build questions. Added one quarter of ordinary Build practice (9/36 independent, 3/12 scaffolded, 3/12 errors) and the recap. One given ratio part makes the first arithmetic step multiplication; the second is a small cost/addition/subtraction calculation. This is two actual operations, with an identity row explaining the known part. Retained the main Build simplification demo and the majority of core-ratio practice.
- Added prompt-derived checks for all revised linked contexts, exact per-tier/type proportions and teaching examples, plus a browser check that Confidence scaffolded guidance and feedback include the further calculation. Verification pending.

- Initial verification built successfully, then the new scaffold-feedback browser assertion waited on the next question: a correct submission had automatically advanced. Updated the test to revisit the answered question before inspecting its feedback, matching existing assessment checks. No product change required; rerun pending.

- Scaffolded feedback check now passes. A later homepage resize assertion then caught stale masonry positions before the layout frame settled; the existing packing wait checked ordering/height but omitted horizontal containment. Added horizontal containment to that same bounded wait so it waits for resize completion without relaxing the overflow check. Also removed the same contradictory one-part note from remaining lower-level ratio examples. Rerun pending.

- Final verification initially stopped on formatting in the edited masonry wait; formatted that file, then all selected checks passed: format/build, new-topic browser checks (including ratio scaffolded feedback), docs, logic/content, bank, presentation, startup, Practice sets, Progress and integration. Passing unchanged checks were cached. The prompt-derived ratio checks cover linked arithmetic and units independently of the stored model; exact Build/Confidence proportions are checked. Preview build regenerated; no commit or deployment.

- Remaining coverage reviewed against the original topic plan and wider Foundation content. Outstanding planned areas include signed multiplication/division and order, fraction multiplication/division, forming equations, area/volume and missing lengths, angles/polygons and Pythagoras; FDP conversion and best buys remain optional source drafts. User chose to defer further topics to another time. Current implementation is complete; await new instructions. Handoff updated with this decision; no additional application tests needed for this documentation-only closeout.
