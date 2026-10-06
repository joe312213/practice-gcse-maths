# Current handoff — 6 October 2026

## Current state and next action

Work now uses `/Users/joehudson/Dev/Maths`; the user moved the project contents here and deleted the former `practice/` folder. Skills are correctly under `.agents/skills/`; the user discarded Pylance’s unsaved Python import rewrites. No `.git` directory is present and `git status` fails: repository history/status and Git-dependent verification are currently unavailable. The Progress implementation was observed in commit `18f4c08` before the old folder was deleted; the previous claim that it was uncommitted was stale. No deployment or watcher started.

Relocation documentation review is complete: current run paths, legacy topic root references and legacy links to `content/` are corrected. Direct checking found all 139 non-archive local links in 22 development/legacy Markdown files resolve; eight links to retired `_prevN` slide/PDF archives remain historical references. `npm run verify:changed` could not start its checks because Git metadata is missing. Git metadata recovery is a separate outstanding task; restore the original `.git` before relying on Git history or Git-dependent checks.

Dedicated `/progress.html` page is implemented: topic grid, three available level bars and type breakdowns, totals/dates, revision colours/missing-data/stale texture, JSON export/import and CSV export. Header Progress is a real link; obsolete summary dialog removed. Existing success scheme is reused, not a new fixed-five/ten scheme. New answer events include pageSize; legacy events use saved/default window. All recorded outcomes retained. Five is minimum initial evidence only.

Recommendations: preserve/fill three pending four-page sets on Progress load, rank missing then weak success then stale, retain separate local attempts, praise only completion, flag opened unfinished sets, record weekly completions/personal best. Automatic generation stops at 15 UK-week completions; explicit generation can fill spaces beyond that. Requirements/refinements in web_format.md; implementation defaults and transfer limits in website/README and DEV_LOG.

Before relocation, 45 logic tests and all selected checks passed. The latest addition is learner-scoped export date/type and reminders after ten days on practice/Progress; metadata travels in JSON; only JSON download triggers reset it. CSV is a temporary follow-up offer after JSON export and never resets the backup reminder. The JSON-only correction is verified; no checks remain running. See DEV_LOG for evidence. Next: user review of Progress; wider topic content and manual device/assistive-tech review remain separate. Current content still only M10 equations/plain/error at three levels; other topics/types/Super challenge need content/logic. A 28-day stale threshold and topic aggregation policy are documented implementation defaults for review. Import restores history/levels/revision records, not partial page attempts/drawings; confirms same-name replacement. Existing local saved page attempts remain intact during ordinary use.

## Logical next work slices

Suggested order, subject to user review; this outline is not automatic authorisation to implement every roadmap item.

1. **Review and settle the Progress experience.** Take user feedback on the topic grid, breakdowns, recommendation follow-up, weekly limits and export prompts. Review the documented 28-day stale threshold, aggregation and legacy-window defaults, plus import replacement/partial-attempt limits. Outcome: agreed behaviour and focused fixes, with requirements updated where decisions change.
2. **Close the relevant accessibility and device gaps.** Check keyboard, touch/hover breakdowns, zoom and screen-reader announcements on the new page and existing equations flow. Add repeatable regression checks only for actual gaps; use the cached verification runner. Outcome: reviewed flows before copying them into more topics.
3. **Add a second real topic end to end.** Audit M01 saved teaching/source content before importing it; implement its method-specific lattice demo using ShowDemo, bank and authored page catalogue. Extend bank loading/topic selection so mixed-topic sets and revision priorities work with real content, not only test fixtures. Outcome: a reusable second-topic path, preserving the agreed teaching sequence.
4. **Expand content and discovery incrementally.** Follow the roadmap sequence M02, M13, M15, M03, M04. Add subject/topic search and mixed-priority/problem-solving page types as reviewed content becomes available. Decide attribution for mixed-topic questions before scoring those activities. Outcome: useful breadth without duplicating component/domain logic.
5. **Prepare delivery and integration when requested.** Review bank obfuscation and its purpose, host/base-path integration and publication needs. Profile management, teacher reporting, puzzles and the fourth challenge tier remain separate scope decisions. Outcome: an explicit delivery plan; no implied deployment or parent-app sync work.

## Verification workflow and evidence

- Default command from website/: `npm run verify:changed`. It selects checks from per-job content fingerprints, includes untracked/deleted inputs, retains successful evidence and reuses a verified current build. `-- --plan` previews; `-- --force` deliberately reruns everything mapped. First use establishes a baseline.
- `npm run verify:watch` is opt-in, debounced and serial. No hook installed. Use one verification process at a time. Sandbox filesystem watching hit EMFILE; approved normal-environment smoke passed and stopped cleanly.
- The [.agents testing skill](.agents/skills/maths-efficient-development/SKILL.md) is rewritten and validated. [README](website/README.md#automated-change-selected-verification) documents selection, cache behaviour and limits. The map lives in website/scripts/verification/plan.mjs; update it for new feature families.
- Baseline checks passed: 45 logic/dispatcher tests, docs, bank, Svelte, build, presentation, semantic colours, startup, Practice sets, Progress and activity integration. Controlled demo test is about 2.5s; integration about 13.5s. Confirmed unchanged runs select nothing and Markdown changes/watch events select docs only without rebuilding. Read named failure logs only; do not repeat passing checks or inspect screenshots without a specific visual question.
- Ignored evidence/cache: website/test-results/verification/. Failed jobs retain no new success fingerprint. Build source/output hashes detect stale outputs. Historical/extended audits remain opt-in; local link checking does not validate anchors/external URLs or importer/source-deck parity.
- Deterministic timing exposed a real ShowDemo speed-update bug: optional chaining prevented the initial effect from tracking speed. Fixed by reading speed before the optional player call. Browser tests now assert timing as well as persisted settings. Seeded randomness and virtual demo time reduce variability and waits.

## App context

- M10 equations remains the only implemented topic: 95 questions and three recaps, five learning stages, adaptive pages, profile-scoped progress and reusable ShowDemo playback. Method adapters own drawing frames/rendering; lattice remains future work.
- Semantic daisyUI styles and Bits UI interactions are in place. Questions are centred within buttons, long buttons are intrinsic-width/centred on their own row, number stays left; tuning variables live in components.css .question-list.
- Working fields default to flush/square; development-only Field style selector compares 8px-inset/10px-rounded fields while preserving text padding. Paper option is compact/regular-weight; Clear drawing is an accessible eraser icon with native tooltip.
- Latest user colour mix values are 92/86/82. Highlights mix with each element’s normal surface/border; preserve these user edits. Text colours remain semantic. User-adjusted contrast is accepted; do not reopen it. Historical selected-fill comparison is intentionally superseded, not silently treated as unchanged.
- Practice sets/codes and whole-set timers are implemented. Bank obfuscation, subject/topic search, mixed-priority/problem-solving pages and broader authored topics remain outstanding. Existing schema-2 data must be preserved; old schema-1 migration was waived.

## Documentation and remaining limits

[AGENTS](AGENTS.md) routes to [all project docs](docs/INDEX.md), [standing rules](docs/UI_UX_RULES.md) and [dated decisions/issues](DEV_LOG.md). web_format.md remains user-controlled; the progress requirements and refinements added on 4 October were explicitly authorised. Legacy decks/resources are under legacy/; do not run historical slide publishers. Earlier consolidation verified 29 resource relocations, 33 protected documents and the unchanged bank.

Manual assistive-tech/device/zoom review, explicit HMR verification and future-host integration remain separate limits. No claim of full accessibility conformance or publication is made. UI visual review can continue without reopening completed verification programmes.
