# Website conversion — 2 October 2026

Authorised to begin by the user after successive reviews of web_format.md. Website delivery supersedes slide maintenance. Preserve current teaching assets and use Git for history. This is a phased conversion, not a claim that the complete site is implemented.

Update 3 October: the user reviewed the prototype and its six feedback groups are implemented; see [the development log](dev-log/2026-10-03-equations-feedback.md). Review of the revised draft is pending. The earlier checkpoint below remains useful for unrelated decisions. The user initially deferred prototype review after the initial stage. See [the current checkpoint](../HANDOFF.md#checkpoint--review-deferred-by-the-user) for the decision register, exact restart steps and Git status. Prototype behaviour has not yet been accepted by the user.

## Current work plan

1. Review a separate clone of https://github.com/jhudshcg/starters at commit 8906225f458372b7238544341e5f293cc67e685a. Record reusable approaches and differences; never modify or publish the reference site.
2. Reconcile saved topic decks, combined deck and structured sources. Record evidence and preserve manual changes before importing.
3. Update active instructions and define stable question identities, profile storage and executable progression examples.
4. Build an equations (M10) vertical prototype: initial assessment, recap, click-driven balanced-equation demo, scaffolded practice, error spotting, adaptive independent practice, final-answer marking, drawing/typed working and local profiles.
5. Check source preservation, mathematical correctness, scoring transitions, profile isolation, keyboard/mobile behaviour and rendered layouts. Record limitations and next actions.

## Subsequent phases

- Refine the prototype against teaching review, then migrate M01, M02, M13, M15, M03 and M04 using their existing method renderers and saved content.
- Expand short banks with reviewed content; add mixed-priority/problem-solving Practice sets and permanent nine-character configuration codes. Do not claim unsupported banks or placeholder topics are usable.
- Adapt themes, timers, issue reporting, priorities, puzzles and configurable college links from the reference. Add import/export and storage migrations before rollout.
- Complete accessibility and device checks, content parity review and static hosting packaging. Publishing is separate from local implementation.
- Custom-value animations and an extra challenge tier remain V2. PowerPoint export remains deferred.

## Implementation defaults to make reviewable

These are engineering interpretations, not additional user decisions. Keep them isolated so they can be changed without rewriting content or UI.

- Target storage scope is subject/topic/page-type/level, alongside assisted outcomes. The single-M10 prototype currently keys tracks by page type with separate level histories; introduce subject/topic keys and a schema migration before multi-topic expansion. Correct assisted attempts leave scoring history unchanged; incorrect attempts enter as failures. A question remains assisted for the whole page attempt once a hint/reference is used. Retries are learning feedback, not additional scored attempts.
- Ten-question pages use the last ten eligible outcomes with oldest-to-newest weights 1,1,1,1,1,2,2,3,3,3. Zero-pad missing history; do not reset at page boundaries. Short pages use a matching-length rolling window: equal weights for 1–4; the newest three weighted twice for 5–9. Denominator includes missing positions. Page size is fixed by page type in the initial prototype.
- Reassessment requires min(5, page length) eligible answers; for 1–2-question pages require at least three across pages. Persist lockout/trial state. Short-page success cannot bypass reassessment.
- Promotion checks a type's own history. Trial answers are recorded at their actual level. Failure restores the previous recommendation and its history; no same-page retry unless five new consecutive unassisted successes follow the failure. At page end, a one/zero-question trial offers the specified choice; two or more correct trial answers confirm automatically.
- Two consecutive submitted questions at the same manually selected lower level lower the recommendation. A manual upward choice changes the recommendation, records its origin and uses the low-score recommendation rule; it does not masquerade as automatic mastery.
- Start has a recap recommendation instead of a lower-level offer; Confidence has no automatic higher level. Invalid input is not a submitted attempt. Only selected/started work is cleared when changing question; submitted feedback remains.
- Separate learning sequence navigation from independent Practice sets. Assessment/scaffolded answers do not promote. M10 error spotting now marks each independent error’s row, reason and corrected-step selection, plus the final x value; do not claim automatic checking of freehand working.
- Topic aggregation and share codes are subsequent work. Display type-specific levels and scores honestly in the prototype rather than an invented composite percentage.

## Checks and status

Completed audit: all 67 combined-deck slides match their corresponding saved topic slides in text and basic geometry, in registry order (10/9/10/10/10/9/9). M10 source parity is checked; other-topic source parity and detailed styles/media remain outstanding. No legacy output has been rewritten.

## Completed initial stage — 2 October 2026

- [x] Reference source review, recorded in REFERENCE_REVIEW.md with exact commit.
- [x] All 67 saved-topic/combined slides match in text, shape count/type, positions, dimensions and rotation. See CONTENT_AUDIT.json; detailed styles/media and the other topics' source parity remain outside this initial check.
- [x] Website-first AGENTS instructions; preserved mathematical/teaching requirements and Git-only history.
- [x] Imported all 94 M10 structured items with stable source IDs and full working. Checked all 94 question texts against the saved deck and 85 coefficient-based answers using exact rational arithmetic. Added the three saved recap examples and eight recap notes to `content/M10_web_recap.json`; importer verifies their text against the saved deck.
- [x] Equations prototype at `website/`: five learning sections, three levels, step-controlled demos with static complete examples/recaps, individual marking, first-wrong-row error spotting, adaptive independent/error pages, local named profiles, hints/reference assistance, touch drawing, typed/paper working, light/dark themes, persisted completed and active attempts.
- [x] 16 Node checks passed. CDP browser checks passed for complete promotion/replacement flow, saved-page reload, hint persistence after question switching, discarded text/sketches, pointer drawing, error correction, desktop sidebar/mobile modal, dark theme, profile separation, invalid input and reduced-motion behaviour. Basic keyboard navigation checked. No complete screen-reader or real-device classroom audit claimed.
- [x] Inspected desktop demo/reference and mobile dark screenshots. Kept outputs under `/private/tmp/maths-*.png`, not in source history. Fixed method centre-line layout and avoided stale-bank caching during local iteration.

### Exact next actions

Review the prototype's teaching flow and responsive layout before scaling the UI across seven topics. Then add Practice-set navigation/codes, profile export/import and priority aggregation using the recorded reference decisions. Audit M01 deck/source parity next and port lattice rendering/step animation, preserving carry placement. Multi-subject selector, college configuration, timers, issue reporting, puzzles and larger content banks remain planned. No deployment has occurred.

### Known prototype limits

- Only M10 is interactive; full site conversion remains incomplete. No nine-character share-code implementation or multi-page Practice-set runner yet.
- Assessment is diagnostic practice, not automatic placement. Guided practice uses the two accepted questions per selected level. Error spotting now requires row/reason/corrected-step selections for each error plus final x; freehand methods are never automatically marked.
- First submitted answers remain immutable on that page; solutions are available for review. A fresh page permits another attempt. There is no four-hour repeat restriction inherited from the T-Level app.
- New page types currently start at Start; inheritance from a previous page belongs to the future Practice-set runner. Per-type state and separate actual-level histories already exist.
- The topic-wide aggregate bar is deliberately deferred; current display shows the active type's actual recommendation and weighted score.
- Draft drawing/text is memory-only and is discarded on changing question/section/profile or reload. Assistance flags and submitted records survive. When reviewing the full method section from an active practice question, that question is marked assisted.
- Bank revision changes discard incompatible active pages, preserve historical outcomes, and include both question and recap sources in the revision hash. Storage export/import, comprehensive malformed-state recovery and history pruning still need rollout work.
- The prototype has no dependency installation or production bundling requirement. Deployment should introduce cache-consistent versioned assets; bank fetch currently requests fresh content.
