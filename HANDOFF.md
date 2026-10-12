# Current handoff — 12 October 2026

## Current state

The authorised batch is complete and selected verification has passed. No process is running. Preserve the large existing uncommitted source and generated-build changes; no commit, publication or deployment was requested.

- **Header:** shared header-actions expands between logo and tools, with left/right flex groups. Welcome/profile controls stay left, Progress stays right beside the tools, and the logo gap is 2rem. `adapters/header-layout.mjs` measures natural content fit; there is no new viewport breakpoint. 684px/744px are test samples only. The existing below-768px welcome font rule now uses a class so measurement copies preserve it. Short-name one-row captures were inspected; responsive alignment/wrapping checks pass.
- **Help:** FAQ/troubleshooting now uses short, friendly student-facing answers. Technical storage/algorithm detail remains in development docs. Essential save-warning, backup, replacement and moving-computers advice remains.
- **Question pages:** three defined pages per ordinary stage/level (12 independent, 2 scaffolded, 4 errors). `domain/topic-pages.mjs` owns partitions; `session.mjs` retains attempts/index under `practicePages`, with active `pages` authoritative after reload. Prev/Next browses pages; chevrons select stages. Existing active work is preserved as page one; older history stacks remain stored. Adaptive trials keep the starting navigation level; retries are explicit.
- **Content/assessment:** 215 additions and 48 arithmetic error SVGs; all banks contain 171 questions. Original objects/revisions preserved. See [coverage/provenance](content/PRACTICE_PAGES.md). New assessments randomly sample two eligible independent questions per level, checking arithmetic complexity as well as metadata; saved draws remain fixed. Existing saved assessments remain unchanged. Answer example placeholders removed.
- **Automatic file saves:** local answers save per question; changed linked progress saves at page completion/page or stage changes/tab hiding/exit opportunities. Monotonic update and saved-through dates skip unchanged writes; content fingerprints ignore bookkeeping, byte fingerprints detect external edits, serial verified writes preserve new changes during an in-flight save. Background work never prompts for permission. Pending/error state persists. Browser exit writes are best effort; OneDrive uploads cannot be confirmed by the app.
- **Newer-file review:** first practice/Progress entry checks already-permitted linked files and offers Use file progress / Keep browser progress for newer differing data. Writes pause pending review; keeping browser progress leaves the file untouched. Reviewed imports are prepared separately and only replace browser state after successful local storage. No merge or silent import.
- **OneDrive copy:** “Choose your OneDrive folder, we'll save your progress in the Maths folder.” Direct backup action is Download backup. An existing selected Maths folder is reused; no Maths/Maths or deletion. Full UUID remains in data; filenames retain the 12-character hash. External Chrome folder saving was previously confirmed by the user; VS Code preview was the access problem.

## Verification evidence

`npm run verify:changed` passed all selected families across the batch: format, build, puzzle-library, new-topics, documentation links, logic, bank, Svelte/diagnostics, presentation, colours, startup, Practice sets, Progress and integration. The final implementation run passed Progress/integration with unaffected evidence cached. The final record-only documentation link check also passed.

Regression coverage includes page/level restoration and no duplicate scoring, exact bank/page coverage and arithmetic/equation validity, balanced random assessments, header alignment at narrow and wide widths, changed-only/in-flight file saves, denied access/external edits, newer-file accept/decline and failed import storage. Native pickers are stubbed with real origin-private file handles. No claim of actual OneDrive upload testing, guaranteed hard-exit saves, full manual inspection of every SVG, or physical-device touch/audio testing. Resolved intermediate failures are recorded in [DEV_LOG](DEV_LOG.md).

## Next-session outline

No required implementation remains in this batch. Later slices are separate from authorisation to publish:

1. **User/device review:** assess the corrected header and concise help in the user's browser; check actual college OneDrive sync between computers if available. Depends on user/device access, not further synthetic cloud claims. Fix concrete reported regressions while preserving progress.
2. **Next content round, already recorded for later:** replace the eleven older weak Confidence multiplication items and review diagrams pedagogically. Preserve IDs and update answers/hints/error explanations together; see [roadmap](docs/WEBSITE_PLAN.md). These original questions were deliberately retained in this expansion, and ineligible examples are excluded from new assessments.
3. **Deferred behaviour:** 48-hour working-cache lifetime is agreed for later implementation (currently three hours). Topic-card sorting needs a default/persistence decision; non-independent scoring windows and the gated requirements/test-quality review remain later work. Computer Go/provider OAuth/automatic cloud merging remain proposed features, not current scope.
4. **Publication:** only on request; follow publishing instructions and do not treat this verified local build as deployed.

## Earlier work and boundaries

GNU Go 3.8/WASM loads on demand for estimates, with distributed source/licences, [third-party notices](THIRD_PARTY_NOTICES.md) and [puzzle patches](docs/puzzles_patches.md). Human Go retains centred controls, coordinates, inclusive <=440px sizing, undo/redo/reset/counting and 5-minute + 3×30-second clocks. Topic countdowns, shared chevrons/mobile panels, puzzle touch/navigation and documented method-animation sequencing remain intact. This final header/help slice made no puzzle-module change.

Use [efficient verification](.agents/skills/maths-efficient-development/SKILL.md), [UI rules](docs/UI_UX_RULES.md), [UI taste](docs/UI_TASTE.md) and [architecture](website/README.md). Do not edit protected web_format.md, regenerate legacy slides, migrate schema-1 or delete student data. No subagents were used.

Temporary authoring script and exact pre-edit bank copies are in `/private/tmp/maths-three-pages/`. Live JSON banks are authoritative; do not casually rerun the temporary script over later edits. Content coverage is linked from INDEX; new logic tests are `tests/topic-pages.test.mjs` and `tests/progress-autosave.test.mjs`.
