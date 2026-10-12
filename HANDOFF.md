# Current handoff — 12 October 2026

## Current state

This local batch is complete and verified. Seven topics are registered in prerequisite order: M01, M02, **Draft M03**, **Draft M13**, M10, **Draft M15**, **Draft M06**. Preserve the existing uncommitted source and generated-build changes. No commit, publication or deployment was requested. No task process remains running.

- **Four new Draft topics:** multiplication/division problems, signed addition/subtraction, fraction addition/subtraction and percentages. Each has 171 questions plus three recaps, full ordinary stage/level pages (12 independent, 2 scaffolded, 4 errors; three pages each) and random six-question assessments with two per level. Draft stamps overlay the topic cards and headings. Specs in [INDEX](docs/INDEX.md#teaching-content) define Foundation grounding, challenge and animation sequences. Teacher review is still needed before removing Draft.
- **Historical application content:** M03 retains the saved slide questions and reviewed errors with historical IDs; extensions complete the page banks. The old answers HTML informs answer/units, worked method, likely mistake and check. Saved decks and directly authored source Markdown are untouched. See [M03 specification](content/specs/M03.md).
- **Maths presentation:** calculation components share the existing player and marking/session/storage. Signed working separates sign conversion from the simplified calculation chain. Fractions render stacked in buttons, the active question, feedback, demos and checks. Word problems wrap; money answers prefix £. The topic chooser uses native CSS-column masonry, reading down columns then across, with existing preferred widths/gaps.
- **Growing animations:** shared ShowDemo scrolls only enough to reveal newly clipped working/final checks, including inside a scrollable reference panel. Visible frames and paused playback do not scroll or move focus. Fresh Play/replay retains initial positioning; resume does not recenter. This supersedes earlier no-auto-scroll wording in the log. See [animation contract](docs/METHOD_ANIMATIONS.md).
- **Header:** existing intrinsic one-row/two-row layout remains; actions expand between logo and tools, welcome stays left and Progress stays right. Logo gap is 2rem. Below the existing 768px boundary, bottom padding is now 12px instead of 24px. No hidden/new breakpoint. Earlier 684px/744px values are test samples only.
- **Preserved practice/progress behaviour:** Prev/Next browses full pages within stage/level; chevrons select stages. Existing attempts stay saved. Per-question local saves and changed-only linked-file autosaves at completion/navigation/tab hiding/exit opportunities remain intact. Exit saves are best effort. Newer differing files require review; no automatic merging or deletion. Actual external Chrome OneDrive folder saving was previously user-confirmed; embedded VS Code preview does not provide equivalent access.

## Verification evidence

`npm run verify:changed` passed all selected families across this batch: format, build, new-topics, docs, 104 logic tests, bank validation, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. The final scrolling/header run passed its selected checks; unaffected checks reused passing fingerprints. The final documentation-only link check also passed.

New checks cover independent mathematical recalculation, bank/page counts and IDs, marking, balanced assessments, new-topic playback/submission/navigation, fraction rendering, responsive wrapping and minimum-needed scrolling on a short screen (including no following while paused). Inspected screenshots include active fractions, fraction feedback and draft-topic layouts. The Progress fresh-computer fixture uses an isolated browser context, avoiding a race with live autosaves. Resolved failures are recorded in [DEV_LOG](DEV_LOG.md).

This evidence is not teacher acceptance of every new question, actual cross-computer OneDrive uploads, guaranteed hard-exit saves or physical-device touch/audio/zoom testing.

## Next-session outline

1. **Review Draft teaching content:** user/teacher review of the four new specs, question challenge, feedback and method sequences; fix concrete issues while preserving IDs. Removing Draft depends on that review, not merely passing automated tests. Live JSON is authoritative.
2. **Previously recorded content improvement:** eleven older weak Confidence multiplication questions and further diagram review remain later work; see [roadmap](docs/WEBSITE_PLAN.md). They were deliberately preserved and unsuitable examples remain excluded from new assessments.
3. **Problem-solving design decision:** choose a later mixed arithmetic topic, an application stage per topic, or both. The user requested documentation of these options only; do not add stages or change progress semantics without agreement. [Options and dependencies](docs/WEBSITE_PLAN.md#arithmetic-problem-solving-options).
4. **Deferred behaviour/device review:** working-cache lifetime is still three hours; the agreed 48-hour lifetime remains a later implementation slice. College-device OneDrive review, topic sorting/persistence, non-independent scoring windows and the gated requirements/test-quality review remain later work. Computer Go, provider OAuth and automatic cloud merging are proposed features.
5. **Publication:** only on request, using the publishing instructions; this working local build is not deployed.

## Boundaries and working files

Use [efficient verification](.agents/skills/maths-efficient-development/SKILL.md), [UI rules](docs/UI_UX_RULES.md), [UI taste](docs/UI_TASTE.md) and [architecture](website/README.md). Do not edit protected web_format.md, regenerate legacy slides, migrate schema-1 or delete student data. No subagents were used.

Temporary authoring scripts `/private/tmp/draft_topics.py`, `/private/tmp/m03_author.py` and earlier `/private/tmp/maths-three-pages/` are not publishers. Live banks contain subsequent reviewed refinements; do not rerun scripts over them. New tests are `tests/draft-topics.test.mjs` and `website/scripts/browser/draft-topics-checks.mjs`.

GNU Go/WASM, human Go controls/clocks/coordinates, touch handling and [puzzle patches](docs/puzzles_patches.md) remain unchanged by this topic batch. Earlier header, concise help, countdowns and progress-save features remain part of the working site.
