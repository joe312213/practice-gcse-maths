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
