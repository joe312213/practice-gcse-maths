# Website roadmap and scoring interpretations

Product authority: [web_format.md](../web_format.md) and later [standing decisions](UI_UX_RULES.md). Current implementation/status belongs in [HANDOFF](../HANDOFF.md); dated evidence belongs in [DEV_LOG](../DEV_LOG.md). This is a roadmap, not permission to start every item.

## Next session priorities

Recorded at the user's request on 10 October 2026. These are the agreed next discussion/work slices, not features already delivered or authorisation to provision a cloud service during this session.

1. **Review the implemented operation highlighting.** The 11 October follow-up implements arithmetic input/result/carry phases and equation-side highlighting. The repeatable [method animation contract](METHOD_ANIMATIONS.md) defines authoring, sequencing and verification for current and future methods. User visual review remains useful; custom-input animations remain V2.
2. **Personal cloud progress.** The 12 October decision selects locally synced college OneDrive as the recommended/default student workflow. Explicit linked-file Save/Open reuses schema-2 JSON, reviewed replacement and external-change checks; browser progress remains the working copy. Unsupported browsers use download/import. Automatic two-way merging, background cloud writes and provider sign-in are future work. See [standing rules](UI_UX_RULES.md). A later direct Microsoft integration would require an Entra app and delegated permission/college consent; [Microsoft app folders](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder) support personal and work/school storage. No provisioning is authorised.
3. **Practice countdowns.** The 12 October decision specifies user-started countdowns for Spot the error and Independent practice, default ceil(1.5 × page questions) minutes, adjustment before start, pause/reset and optional soft expiry chime. Separate from active-time measurement and authored timed sets. Scaffolded timer visibility remains a possible later decision.

## Future Go computer opponent

Documentation requested on 12 October; no opponent implementation is authorised. Strength around amateur 1 dan must be defined by board size, rules and a measured reference rating. A JavaScript download size alone cannot establish playing strength: model weights, runtime, search time and device matter.

| Option | Likely use and payload evidence | Decision needed |
| --- | --- | --- |
| [Moka](https://github.com/millionco/moka) | Tiny 9×9 browser model; its README reports roughly 103 KB compressed weights plus runtime overall. No evidence of 19×19 or amateur 1 dan strength. | Consider only for a lightweight 9×9 experiment; benchmark strength first. |
| [KataGo WebGPU/WASM](https://github.com/saigo-online/katago-webgpu) | Browser search with 9/13/19 boards. Expect an engine/runtime plus separately loaded neural weights, potentially tens of MB or more depending on network. This is an estimate, not a measured app bundle. | Benchmark actual compressed payload, memory, cold startup, phone move latency and calibrated strength before choosing a network. |
| [Pachi](https://github.com/pasky/pachi) | Established C engine; a browser/WASM port needs integration work. Published native ratings depend on hardware/search settings and cannot be carried over to mobile. | Check GPL obligations, browser portability, CPU/worker budgets and observed strength. |
| Hosted engine | Small browser client, while engine/models remain on a server. Can offer controlled strength without a large student download. | Requires hosting, operating cost, network availability, rate limits and a data/privacy design. |

Prefer a separately loaded worker/engine adapter if pursued. The reusable puzzle module retains legal moves and board state; the app owns opponent choice and loading UI. Cancel/discard replies after undo/reset/size changes, enforce time limits, keep human play usable without loading AI, and measure against a fixed opponent/test set on school computers and phones. Choose board-size/rating targets before selecting a model. See the [patch register](puzzles_patches.md) for existing human-game boundaries.

## Next content round — multiplication Confidence correction

Reported and confirmed on 11 October 2026; **document now, fix in the next content update round**. Every multiplication Confidence question must use **4-digit × 3-digit, 3-digit × 4-digit, or 4-digit × 4-digit** operands. The current M01 bank includes eleven 3-digit × 2-digit questions: eight independent-practice questions (`maths:M01-S04-C3-Q1/Q2` through `maths:M01-S07-C3-Q1/Q2`) and three error-spotting questions (`maths:M01-SE-C3-Q1`, `Q2`, `Q3`). For example, `342 × 15` and `234 × 56` are currently labelled Confidence.

Replace those questions with appropriately challenging products in the permitted digit ranges; review carries as well as operand length. Update answers, hints, method/check notes and plausible errors together, preserving stable IDs and page-slot references. Audit every Confidence activity type and strengthen bank validation for this requirement. Current bank content remains unchanged until that round.

## Agreed working-cache lifetime — implementation deferred

Increase the temporary drawing/typed-working cache lifetime from three to **48 hours after the last edit**. The user requested documentation first and code later. Keep sessionStorage and exclusion from durable progress/backups; closing the tab can still end the cache. Update the TTL and expiry-boundary tests together in that later slice.

## Topic-card sorting backlog

Requested on 10 October 2026: add topic-card sorting by **alphabetical order** and by **revision priority**. Not implemented; the current prerequisite order remains unchanged. When implementing, reuse the existing revision-priority calculation rather than creating competing ranking logic. Confirm the default order and whether the learner's sorting choice is remembered.

## Future work

1. Refine the implemented M01/M02/M10 teaching flow before further expansion. For each later topic, inspect saved resources for provenance, level and style, then review and refine its website content; follow the prerequisite teaching sequence and [current content guidance](../website/README.md#current-content-and-historical-references).
2. Expand the implemented one-to-four-page Practice sets with mixed-priority/problem-solving activities and reviewed banks. The [54-bit code contract](../website/README.md#practice-sets-codes-and-authored-pages) is implemented for M01/M02/M10 plain/error pages.
3. Review the implemented topic aggregation/recency defaults documented in website/README. Current aggregation uses plain ×2, other types ×1, excluding absent scores while flagging insufficient evidence; mixed-topic question attribution remains future work.
4. Add further profile management, issue-report destination and college configuration when requested. Named-learner JSON export/import and CSV answer-history export are implemented. Subject/topic storage isolation is already implemented; no schema-1 migration is outstanding.
5. Complete relevant teaching/accessibility/device checks before rollout. Hosting/integration and publication remain separate decisions. Custom-input animations and an extra challenge tier are V2; slide export is deferred.

## Practice set implementation checkpoint — 4 October 2026

The implemented [Practice set contract and authoring guide](../website/README.md#practice-sets-codes-and-authored-pages) owns code fields, slot reuse/resolution, timing and resume behaviour. The 4 October DEV_LOG final-contract entry records why it superseded the three-page limit, per-page challenge, frozen-release/UUID registry and non-reusable slot proposals. Four challenge values are reserved, with no Automatic value; variants remain session choices. Mixed-priority/problem-solving pages and Super challenge require reviewed content/logic before becoming selectable.

## Scoring interpretations currently used

This section records scoring decisions and implementation interpretations. Explicit user decisions take precedence; other interpretations remain reviewable without rewriting teaching content or UI.

- Target storage scope is subject/topic/page-type/level, alongside assisted outcomes. Schema 2 already scopes topics by subject/topic, with page-type tracks and actual-level histories. Old-data migration was waived. Correct assisted attempts leave scoring history unchanged; incorrect attempts enter as failures. A question remains assisted for the whole page attempt once a hint/reference is used. Retries are learning feedback, not additional scored attempts.
- Independent practice uses the last ten eligible outcomes with oldest-to-newest weights 1,1,1,1,1,2,2,3,3,3. Zero-pad missing history; do not reset at page boundaries. For page types that typically have few than ten questions, use a rolling window that matches the typical number of questions on that page type: equal weights for 1–4 questions; the newest three weighted twice for typical 5–9 question pages. Denominator includes missing positions. Ordinary independent pages now contain twelve questions; this does not change their ten-answer scoring window.
- **Implementation gap confirmed 10 October:** “typical number” means a fixed scoring-window length for each page type, even when an individual page differs. Current `scoringWindow(mode, pageSize)` instead uses the actual page length for non-independent activities, capped at ten. Independent practice already uses ten. Agree the fixed lengths for the other page types and review the code/test changes in step 3; no scoring change is authorised by this documentation edit.
- Reassessment requires min(5, page length) eligible answers; for 1–2-question pages require at least three across pages. Persist lockout/trial state. Short-page success cannot bypass reassessment.
- Promotion checks a type's own history. Trial answers are recorded at their actual level. Failure restores the previous recommendation and its history; no same-page retry unless five new consecutive unassisted successes follow the failure. At page end, a one/zero-question trial offers the specified choice; two or more correct trial answers confirm automatically.
- Two consecutive submitted questions at the same manually selected lower level lower the recommendation. A manual upward choice changes the recommendation, records its origin and uses the low-score recommendation rule; it does not masquerade as automatic mastery.
- Start has a recap recommendation instead of a lower-level offer; Confidence has no automatic higher level. Invalid input is not a submitted attempt. Drawing and typed working restore per question from the temporary cache; unsubmitted answer entry resets when changing question and submitted feedback remains.
- Separate learning sequence navigation from independent Practice sets. Assessment/scaffolded answers do not promote. M10 error spotting now marks each independent error’s row, reason and corrected-step selection, plus the final x value; do not claim automatic checking of freehand working.
- Topic aggregation and share codes are implemented; their current contracts are documented in website/README. Distinguish displayed recommendations from demonstrated mastery.

## Teaching questions for a future review

These are recorded engineering interpretations, not urgent approval gates. Preserve current behaviour until reviewed:

- Set the fixed typical scoring-window length for each non-independent page type, independent of individual page length; review reassessment at lengths 5–9 separately.
- Assisted correct trial answers currently neither fail the trial nor count toward confirmation. Opening a reference marks assistance even if the learner does not use it.
- Submitted answers are immutable within a page; decide whether future unscored retries or repeat-question eligibility intervals help learning.
- Distinguish manual level choice from demonstrated mastery in any future aggregate display.
- Initial assessment currently gives immediate feedback and no automatic placement or enforced stage order. Placement criteria remain undefined.
- Real host integration and profile rename/delete/reset remain unimplemented. Recorded history is retained; JSON progress export/import and CSV answer export are implemented.

## Arithmetic problem-solving options

Requested 12 October 2026. The authorised first slice is the Draft [M03 multiplication/division problems topic](../content/specs/M03.md), based on historical teaching material, with contextual rounding and linked calculations.

Two later options need a teaching/navigation decision before implementation:

- **Mixed arithmetic problems topic:** varied situations requiring students to choose among addition, subtraction, multiplication, division, percentages and ratio, including linked operations. Prerequisites should govern availability/order; do not signal the operation by grouping all questions of one type together.
- **Application stage within topics:** contextual problems using that topic after numerical practice, with its own full pages, challenge bands, feedback and progress treatment. Decide whether it replaces or adds a stage, how timers and completion work, and whether mastered mixed questions belong in a separate topic too.

These options may coexist, but avoid duplicating identical practice or fragmenting progress. Neither a new stage nor a general arithmetic topic is implemented or authorised by this note. Preserve existing stage IDs and saved progress when a later design is agreed.
