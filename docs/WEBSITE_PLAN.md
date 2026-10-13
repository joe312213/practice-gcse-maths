# Website roadmap and scoring interpretations

Product authority: [web_format.md](../web_format.md) and later [standing decisions](UI_UX_RULES.md). Current implementation/status belongs in [HANDOFF](../HANDOFF.md); dated evidence belongs in [DEV_LOG](../DEV_LOG.md). This is a roadmap, not permission to start every item.

## Current implementation programme — 12 October 2026

The user now authorises working through the outstanding list in order, documenting each slice: Draft teaching review; multiplication Confidence correction; 48-hour working cache; topic discovery; fixed non-independent scoring windows; both forms of problem solving; Practice-set expansion; further topics; profile/college features. [HANDOFF](../HANDOFF.md) owns the live sequence and evidence.

Additional instructions: fix iPhone Draft-stamp clipping; provide partial-title search and `priority` / `a-z` sorting in the 40% side of a 60%/40% heading/control row; blend initial topic difficulty with learner revision evidence. Add a sixth application/problem-solving stage and combined problems using 1–4 operations, with reusable collapsible level-matched `How to solve tips`. Ratios and percentages are next, followed by calculator-paper content. Investigate handwriting stroke animation libraries, report payload/adoption issues and keep any integration behind a shared helper.

This authorisation supersedes earlier documentation-only deferrals for these slices. It does not authorise publishing, provisioning external services, inventing college destinations, a Go opponent or adopting an animation dependency without the requested investigation. Highlighting, linked progress saving and countdowns from the previous priority list are implemented.

## Future Go computer opponent

Documentation requested on 12 October; no opponent implementation is authorised. Strength around amateur 1 dan must be defined by board size, rules and a measured reference rating. A JavaScript download size alone cannot establish playing strength: model weights, runtime, search time and device matter.

| Option | Likely use and payload evidence | Decision needed |
| --- | --- | --- |
| [Moka](https://github.com/millionco/moka) | Tiny 9×9 browser model; its README reports roughly 103 KB compressed weights plus runtime overall. No evidence of 19×19 or amateur 1 dan strength. | Consider only for a lightweight 9×9 experiment; benchmark strength first. |
| [KataGo WebGPU/WASM](https://github.com/saigo-online/katago-webgpu) | Browser search with 9/13/19 boards. Expect an engine/runtime plus separately loaded neural weights, potentially tens of MB or more depending on network. This is an estimate, not a measured app bundle. | Benchmark actual compressed payload, memory, cold startup, phone move latency and calibrated strength before choosing a network. |
| [Pachi](https://github.com/pasky/pachi) | Established C engine; a browser/WASM port needs integration work. Published native ratings depend on hardware/search settings and cannot be carried over to mobile. | Check GPL obligations, browser portability, CPU/worker budgets and observed strength. |
| Hosted engine | Small browser client, while engine/models remain on a server. Can offer controlled strength without a large student download. | Requires hosting, operating cost, network availability, rate limits and a data/privacy design. |

Prefer a separately loaded worker/engine adapter if pursued. The reusable puzzle module retains legal moves and board state; the app owns opponent choice and loading UI. Cancel/discard replies after undo/reset/size changes, enforce time limits, keep human play usable without loading AI, and measure against a fixed opponent/test set on school computers and phones. Choose board-size/rating targets before selecting a model. See the [patch register](puzzles_patches.md) for existing human-game boundaries.

## Implemented programme and later work

The authorised batch implements Confidence operand corrections, a 48-hour working cache, partial-title discovery with blended revision priority, fixed scoring windows, four-question scaffolded pages, the seven-day explicit assessment lock, sixth-stage/combined problems, ratios and calculator practice, and local profile controls. Exact verification and any remaining checks belong in [HANDOFF](../HANDOFF.md), with the dated record in [DEV_LOG](../DEV_LOG.md).

1. M03/M13/M15/M04/M06/M07/M12 are accepted for unmarked display following the user’s 13 October request; continue reviewing application content from teaching feedback. Keep IDs and source provenance; follow prerequisite order for subsequent expansion.
2. Device acceptance remains separate from browser automation, including the reported physical iPhone Safari layout.
3. College integration is later design work: proposed central hosting, college accounts, teacher-configured links and college-code URLs. No college infrastructure is implemented. Issue reporting retains an empty email recipient.
4. Extra/Super challenge and custom-input animations remain V2; slide export is deferred. The handwriting investigation is complete in [METHOD_ANIMATIONS](METHOD_ANIMATIONS.md#handwriting-stroke-investigation--12-october-2026); adoption must use a shared helper and reviewed glyph paths.
5. Publication and hosting remain separate actions. No Go opponent is authorised by this programme.

## Practice set implementation checkpoint — 4 October 2026

The implemented [Practice set contract and authoring guide](../website/README.md#practice-sets-codes-and-authored-pages) owns code fields, slot reuse/resolution, timing and resume behaviour. The 4 October DEV_LOG final-contract entry records why it superseded the three-page limit, per-page challenge, frozen-release/UUID registry and non-reusable slot proposals. Four challenge values are reserved, with no Automatic value; variants remain session choices. Mixed-priority and problem-solving pages are implemented, including Combined topics; Super challenge remains reserved for reviewed V2 content.

## Scoring interpretations currently used

This section records scoring decisions and implementation interpretations. Explicit user decisions take precedence; other interpretations remain reviewable without rewriting teaching content or UI.

- Target storage scope is subject/topic/page-type/level, alongside assisted outcomes. Schema 2 already scopes topics by subject/topic, with page-type tracks and actual-level histories. Old-data migration was waived. Correct assisted attempts leave scoring history unchanged; incorrect attempts enter as failures. A question remains assisted for the whole page attempt once a hint/reference is used. Retries are learning feedback, not additional scored attempts.
- Independent practice uses the last ten eligible outcomes with oldest-to-newest weights 1,1,1,1,1,2,2,3,3,3. Zero-pad missing history; do not reset at page boundaries. For page types that typically have few than ten questions, use a rolling window that matches the typical number of questions on that page type: equal weights for 1–4 questions; the newest three weighted twice for typical 5–9 question pages. Denominator includes missing positions. Ordinary independent pages now contain twelve questions; this does not change their ten-answer scoring window.
- **Implemented 12 October:** fixed scoring windows are four for scaffolded/errors, six for problem solving and ten for independent/mixed revision. Scaffolded pages contain four questions. Initial assessment has six questions and no promotion, with explicit reassessment only after a seven-day lock and complete attempt history.
- Adaptive level reassessment (separate from Initial assessment) requires min(5, page length) eligible answers; for 1–2-question pages require at least three across pages. Persist lockout/trial state. Short-page success cannot bypass reassessment.
- Promotion checks a type's own history. Trial answers are recorded at their actual level. Failure restores the previous recommendation and its history; no same-page retry unless five new consecutive unassisted successes follow the failure. At page end, a one/zero-question trial offers the specified choice; two or more correct trial answers confirm automatically.
- Two consecutive submitted questions at the same manually selected lower level lower the recommendation. A manual upward choice changes the recommendation, records its origin and uses the low-score recommendation rule; it does not masquerade as automatic mastery.
- Start has a recap recommendation instead of a lower-level offer; Confidence has no automatic higher level. Invalid input is not a submitted attempt. Drawing and typed working restore per question from the temporary cache; unsubmitted answer entry resets when changing question and submitted feedback remains.
- Separate learning sequence navigation from independent Practice sets. Assessment/scaffolded answers do not promote. M10 error spotting now marks each independent error’s row, reason and corrected-step selection, plus the final x value; do not claim automatic checking of freehand working.
- Topic aggregation and share codes are implemented; their current contracts are documented in website/README. Distinguish displayed recommendations from demonstrated mastery.

## Teaching questions for a future review

These are recorded engineering interpretations, not urgent approval gates. Preserve current behaviour until reviewed:

- Fixed scoring windows are settled above; any later review of adaptive level reassessment at lengths 5–9 should preserve those windows.
- Assisted correct trial answers currently neither fail the trial nor count toward confirmation. Opening a reference marks assistance even if the learner does not use it.
- Submitted answers are immutable within a page; decide whether future unscored retries or repeat-question eligibility intervals help learning.
- Distinguish manual level choice from demonstrated mastery in any future aggregate display.
- Initial assessment currently gives immediate feedback and no automatic placement or enforced stage order. Placement criteria remain undefined.
- Local profile rename/delete/reset is implemented; real college host integration remains deferred. Recorded history is retained; JSON progress export/import and CSV answer export are implemented.

## Arithmetic problem-solving implementation

The user selected **both** on 12 October: a sixth application stage within topics and combined arithmetic problems, involving **1–4 operations**. Use accessible varied situations requiring students to select operations and interpret results. Mixed problems must not reveal their operation by grouping; prerequisites govern teaching order.

Both problem-solving pages and the sixth chevron stage offer a reveal/hide **How to solve tips** section: short steps, specific tips and a worked example matching the current challenge level, sharing the teaching renderer. Assistance follows the existing scoring contract. Preserve original stage IDs, existing page slots and saved progress; keep problem-solving histories separate from plain method practice. Do not duplicate identical practice across topic and combined paths.

Ratios then percentages are the next content priorities; M06 already exists and should be refined/extended rather than duplicated. Subsequent content should support Foundation papers permitting calculators, without assuming an exam board. See [HANDOFF](../HANDOFF.md) for the ordered work slices.
