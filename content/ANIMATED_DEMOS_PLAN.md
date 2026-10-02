# Animated method demonstrations — future session

Status: plan only. No animations added in this session.

Purpose: let the teacher reveal one meaningful written step at a time, while the original question and all completed steps remain visible. Keep the accepted examples, Start / Build / Confidence columns and editable mathematical diagrams. Animate worked demos only initially; assessment and practice questions remain immediately readable.

## Proposed sequence

1. Prototype one equation demonstration on an isolated copy. First show the equation and centre line; on each click reveal the operation on **both sides together**, then the resulting equation. Finish with substitution. Confirm legibility and click behaviour in the PowerPoint version used for teaching before wider rollout.
2. Add one lattice example: question and empty grid → edge digits → each complete two-digit cell product → diagonal totals from bottom right → small carried digits and corresponding result digits → final product → easy ballpark check. Reveal carries separately from answer digits; never rely on colour alone.
3. Extend the same step model to division (current dividend/remainder → quotient digit → carried remainder → decimal extension if needed), fractions (mixed-number conversion → common denominator → equivalent fractions → operation → simplification), signed numbers (rewrite signs → calculate in order), ratio (identify known parts → one part → requested quantity), and applications (identify quantities → arithmetic → interpret result and units).
4. Apply approved behaviour to other worked demos, keeping each column’s clicks together in Start, Build, Confidence order. Avoid three simultaneous streams of movement. Agree any exception during prototype review.

## Implementation approach

- Extend the deterministic skill renderers to return named shape groups and ordered reveal events, as well as the final diagram. Give each event a stable semantic identifier, e.g. `operation_both_sides_1`, rather than depending on shape-list positions.
- Prototype native PowerPoint appear/reveal timing for those shape IDs. Inspect a minimal PowerPoint-authored example to establish the required timing structure; do not assume the current Python library exposes a complete animation API. Keep any OOXML manipulation in a small dedicated helper.
- Prefer teacher-controlled clicks, no autoplay, sound, bouncing or decorative movement. Keep the final completed state identical to the accepted static diagram. Do not reveal future steps early.
- Ensure topic compilation preserves slide timing and shape IDs. The current compiler clones shapes/background/notes; animation timing will need explicit preservation. Reuse source step data for HTML static answers; answers must remain readable without animation.
- If native timing does not survive reliably in the teaching environment, propose a progressive-slide fallback for review before publishing it: each subsequent slide reveals one more step. This changes slide counts, so preserve stable activity references and record the choice.

## Review and delivery

Manually test one prototype in slideshow mode: click order, rewind/replay, both sides revealed together, hidden future steps and final state. Check the prototype after combining topic decks, and check printing/PDF/static export separately. Treat cross-application behaviour as unverified until tested; keep a static usable fallback.

Once the prototype is accepted, roll out one skill at a time. Preserve manual edits, retain output history in Git without backup copies, keep current filenames suffix-free, and update SLIDE_LAYOUT.md plus HANDOFF.md with the approved behaviour and any export limitations. No broad test suite is needed for the planning stage.
