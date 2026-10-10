# Website roadmap and scoring interpretations

Product authority: [web_format.md](../web_format.md) and later [standing decisions](UI_UX_RULES.md). Current implementation/status belongs in [HANDOFF](../HANDOFF.md); dated evidence belongs in [DEV_LOG](../DEV_LOG.md). This is a roadmap, not permission to start every item.

## Next session priorities

Recorded at the user's request on 10 October 2026. These are the agreed next discussion/work slices, not features already delivered or authorisation to provision a cloud service during this session.

1. **Refine demo operation highlighting.** Build on the existing drawn guides and digit-by-digit playback. Highlight the numbers/digits participating in the current operation at relevant points in the working: operands, cell products, carries/remainders, or both sides of an equation as appropriate. Make the mathematical relationship clear, rather than merely highlighting newly appearing text. Agree the visual treatment and per-method sequence; preserve pause/replay/speed, reduced motion and non-colour cues. Use the shared frame/rendering boundaries.
2. **Plan personal cloud-based sync.** Clarify the intended personal account/provider and devices, manual versus automatic sync, authentication/permissions, offline behaviour and how to merge conflicting progress/history/time without duplicates or data loss. Decide the sync scope and backup/recovery path before implementation. Current local schema-2 JSON remains authoritative until a design is agreed; drawings are intentionally short-lived and excluded from durable backups. No provider, backend, storage migration or SQLite transition has been selected.

## Topic-card sorting backlog

Requested on 10 October 2026: add topic-card sorting by **alphabetical order** and by **revision priority**. Not implemented; the current prerequisite order remains unchanged. When implementing, reuse the existing revision-priority calculation rather than creating competing ranking logic. Confirm the default order and whether the learner's sorting choice is remembered.

## Future work

1. Refine the implemented M01/M02/M10 teaching flow before further expansion. Later topics still require saved-source audits; follow the prerequisite teaching sequence.
2. Expand the implemented one-to-four-page Practice sets with mixed-priority/problem-solving activities and reviewed banks. The 54-bit code contract below is implemented for current equations plain/error pages.
3. Review the implemented topic aggregation/recency defaults documented in website/README. Current aggregation uses plain ×2, other types ×1, excluding absent scores while flagging insufficient evidence; mixed-topic question attribution remains future work.
4. Add further profile management, issue-report destination, selected puzzles and college configuration when requested. Named-learner JSON export/import and CSV answer-history export are implemented. Subject/topic storage isolation is already implemented; no schema-1 migration is outstanding.
5. Complete relevant teaching/accessibility/device checks before rollout. Hosting/integration and publication remain separate decisions. Custom-input animations and an extra challenge tier are V2; slide export is deferred.

## Practice set implementation checkpoint — 4 October 2026

Initial implementation complete; code decisions settled. Whole-set timers/expiry and local resume are implemented. See DEV_LOG’s 4 October final-contract entry for rationale and superseded advice. Nine characters encode 54 bits: challenge 2, count-minus-one 2, timing 2, then four ordered topic/type/slot entries of 5/3/4 bits. Subject is selected outside the code. Slots are positions, not immutable identities: 0 random; 1–15 direct or modulo fallback when beyond the available count. Authors may replace/reuse slots and are responsible for reasonable continuity. Codes open current content. Saved topic/type learner levels override the whole-set challenge. Four challenge values are reserved; no Automatic level value is used. Variants remain session choices, not code fields.

This supersedes the three-page limit, per-page encoded challenge, frozen-release/UUID-registry proposals and the earlier prohibition on reusing authored page slots. Existing learner history is retained; unavailable topic/type/level combinations must be reported explicitly. Initial available pages are equations plain/error pages; other topics/types and Super challenge need authored content/logic before becoming selectable.

## Scoring interpretations currently used


These are engineering interpretations, not additional user decisions. Keep them isolated so they can be changed without rewriting content or UI.

- Target storage scope is subject/topic/page-type/level, alongside assisted outcomes. Schema 2 already scopes topics by subject/topic, with page-type tracks and actual-level histories. Old-data migration was waived. Correct assisted attempts leave scoring history unchanged; incorrect attempts enter as failures. A question remains assisted for the whole page attempt once a hint/reference is used. Retries are learning feedback, not additional scored attempts.
- Independent practice uses the last ten eligible outcomes with oldest-to-newest weights 1,1,1,1,1,2,2,3,3,3. Zero-pad missing history; do not reset at page boundaries. Short pages use a matching-length rolling window: equal weights for 1–4; the newest three weighted twice for 5–9. Denominator includes missing positions. Ordinary independent pages now contain twelve questions; this does not change their ten-answer scoring window.
- Reassessment requires min(5, page length) eligible answers; for 1–2-question pages require at least three across pages. Persist lockout/trial state. Short-page success cannot bypass reassessment.
- Promotion checks a type's own history. Trial answers are recorded at their actual level. Failure restores the previous recommendation and its history; no same-page retry unless five new consecutive unassisted successes follow the failure. At page end, a one/zero-question trial offers the specified choice; two or more correct trial answers confirm automatically.
- Two consecutive submitted questions at the same manually selected lower level lower the recommendation. A manual upward choice changes the recommendation, records its origin and uses the low-score recommendation rule; it does not masquerade as automatic mastery.
- Start has a recap recommendation instead of a lower-level offer; Confidence has no automatic higher level. Invalid input is not a submitted attempt. Only selected/started work is cleared when changing question; submitted feedback remains.
- Separate learning sequence navigation from independent Practice sets. Assessment/scaffolded answers do not promote. M10 error spotting now marks each independent error’s row, reason and corrected-step selection, plus the final x value; do not claim automatic checking of freehand working.
- Topic aggregation and share codes are implemented; their current contracts are documented in website/README. Distinguish displayed recommendations from demonstrated mastery.

## Teaching questions for a future review

These are recorded engineering interpretations, not urgent approval gates. Preserve current behaviour until reviewed:

- Short-page rolling history versus page-only scoring; handling future page-length changes; reassessment at lengths 5–9.
- Assisted correct trial answers currently neither fail the trial nor count toward confirmation. Opening a reference marks assistance even if the learner does not use it.
- Submitted answers are immutable within a page; decide whether future unscored retries or repeat-question eligibility intervals help learning.
- Distinguish manual level choice from demonstrated mastery in any future aggregate display.
- Initial assessment currently gives immediate feedback and no automatic placement or enforced stage order. Placement criteria remain undefined.
- Real host integration and profile rename/delete/reset remain unimplemented. Recorded history is retained; JSON progress export/import and CSV answer export are implemented.
