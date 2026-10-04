# Website roadmap and scoring interpretations

Product authority: [web_format.md](../web_format.md) and later [standing decisions](UI_UX_RULES.md). Current implementation/status belongs in [HANDOFF](../HANDOFF.md); dated evidence belongs in [DEV_LOG](../DEV_LOG.md). This is a roadmap, not permission to start every item.

## Future work

1. Review the current equations teaching flow before scaling its UI. Audit M01 saved content before porting lattice diagrams/animation, then M02, M13, M15, M03 and M04 in the teaching sequence.
2. Expand the implemented one-to-four-page Practice sets with mixed-priority/problem-solving activities and reviewed banks. The 54-bit code contract below is implemented for current equations plain/error pages.
3. Define topic aggregation (plain ×2, other page types ×1), unattempted-type treatment and mixed-topic priority attribution. Do not present an invented composite score meanwhile.
4. Add profile export/import and management, issue-report destination, selected puzzles and college configuration when requested. Subject/topic storage isolation is already implemented; no schema-1 migration is outstanding.
5. Complete relevant teaching/accessibility/device checks before rollout. Hosting/integration and publication remain separate decisions. Custom-input animations and an extra challenge tier are V2; slide export is deferred.

## Practice set implementation checkpoint — 4 October 2026

Initial implementation complete; code decisions settled. Whole-set timers/expiry and local resume are implemented. See DEV_LOG’s 4 October final-contract entry for rationale and superseded advice. Nine characters encode 54 bits: challenge 2, count-minus-one 2, timing 2, then four ordered topic/type/slot entries of 5/3/4 bits. Subject is selected outside the code. Slots are positions, not immutable identities: 0 random; 1–15 direct or modulo fallback when beyond the available count. Authors may replace/reuse slots and are responsible for reasonable continuity. Codes open current content. Saved topic/type learner levels override the whole-set challenge. Four challenge values are reserved; no Automatic level value is used. Variants remain session choices, not code fields.

This supersedes the three-page limit, per-page encoded challenge, frozen-release/UUID-registry proposals and the earlier prohibition on reusing authored page slots. Existing learner history is retained; unavailable topic/type/level combinations must be reported explicitly. Initial available pages are equations plain/error pages; other topics/types and Super challenge need authored content/logic before becoming selectable.

## Scoring interpretations currently used


These are engineering interpretations, not additional user decisions. Keep them isolated so they can be changed without rewriting content or UI.

- Target storage scope is subject/topic/page-type/level, alongside assisted outcomes. Schema 2 already scopes topics by subject/topic, with page-type tracks and actual-level histories. Old-data migration was waived. Correct assisted attempts leave scoring history unchanged; incorrect attempts enter as failures. A question remains assisted for the whole page attempt once a hint/reference is used. Retries are learning feedback, not additional scored attempts.
- Ten-question pages use the last ten eligible outcomes with oldest-to-newest weights 1,1,1,1,1,2,2,3,3,3. Zero-pad missing history; do not reset at page boundaries. Short pages use a matching-length rolling window: equal weights for 1–4; the newest three weighted twice for 5–9. Denominator includes missing positions. Page size is fixed by page type in the initial prototype.
- Reassessment requires min(5, page length) eligible answers; for 1–2-question pages require at least three across pages. Persist lockout/trial state. Short-page success cannot bypass reassessment.
- Promotion checks a type's own history. Trial answers are recorded at their actual level. Failure restores the previous recommendation and its history; no same-page retry unless five new consecutive unassisted successes follow the failure. At page end, a one/zero-question trial offers the specified choice; two or more correct trial answers confirm automatically.
- Two consecutive submitted questions at the same manually selected lower level lower the recommendation. A manual upward choice changes the recommendation, records its origin and uses the low-score recommendation rule; it does not masquerade as automatic mastery.
- Start has a recap recommendation instead of a lower-level offer; Confidence has no automatic higher level. Invalid input is not a submitted attempt. Only selected/started work is cleared when changing question; submitted feedback remains.
- Separate learning sequence navigation from independent Practice sets. Assessment/scaffolded answers do not promote. M10 error spotting now marks each independent error’s row, reason and corrected-step selection, plus the final x value; do not claim automatic checking of freehand working.
- Topic aggregation and share codes are subsequent work. Display type-specific levels and scores honestly in the prototype rather than an invented composite percentage.

## Teaching questions for a future review

These are recorded engineering interpretations, not urgent approval gates. Preserve current behaviour until reviewed:

- Short-page rolling history versus page-only scoring; handling future page-length changes; reassessment at lengths 5–9.
- Assisted correct trial answers currently neither fail the trial nor count toward confirmation. Opening a reference marks assistance even if the learner does not use it.
- Submitted answers are immutable within a page; decide whether future unscored retries or repeat-question eligibility intervals help learning.
- Distinguish manual level choice from demonstrated mastery in any future aggregate display.
- Initial assessment currently gives immediate feedback and no automatic placement or enforced stage order. Placement criteria remain undefined.
- Real host integration, profile rename/delete/reset, history retention and export/import are not implemented.
