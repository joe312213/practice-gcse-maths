# Current handoff — 3 October 2026

## Current state and next action

Verification automation is complete. Changes remain uncommitted alongside earlier migration/UI/documentation work; nothing deployed. No task server or watcher is left running.

Next feature: Practice set implementation is authorised but paused for three user decisions: recipe versus exact questions; saved level versus explicit code level; current content versus frozen bank release. Recommendations and implementation order are in [WEBSITE_PLAN](docs/WEBSITE_PLAN.md#practice-set-implementation-checkpoint--3-october-2026). Preserve the existing saved-level-over-previous-page-inheritance rule. Do not conflate Practice sets with the five learning stages.

## Verification workflow and evidence

- Default command from website/: `npm run verify:changed`. It selects checks from per-job content fingerprints, includes untracked/deleted inputs, retains successful evidence and reuses a verified current build. `-- --plan` previews; `-- --force` deliberately reruns everything mapped. First use establishes a baseline.
- `npm run verify:watch` is opt-in, debounced and serial. No hook installed. Use one verification process at a time. Sandbox filesystem watching hit EMFILE; approved normal-environment smoke passed and stopped cleanly.
- The [.agents testing skill](.agents/skills/maths-efficient-development/SKILL.md) is rewritten and validated. [README](website/README.md#automated-change-selected-verification) documents selection, cache behaviour and limits. The map lives in website/scripts/verification/plan.mjs; update it for new feature families.
- Final checks passed: 30 logic/dispatcher tests, docs, bank, Svelte, build, presentation, semantic colours, startup and activity integration. Controlled demo test is about 2.5s; integration about 13.5s. Confirmed unchanged runs select nothing and Markdown changes/watch events select docs only without rebuilding. Read named failure logs only; do not repeat passing checks or inspect screenshots without a specific visual question.
- Ignored evidence/cache: website/test-results/verification/. Failed jobs retain no new success fingerprint. Build source/output hashes detect stale outputs. Historical/extended audits remain opt-in; local link checking does not validate anchors/external URLs or importer/source-deck parity.
- Deterministic timing exposed a real ShowDemo speed-update bug: optional chaining prevented the initial effect from tracking speed. Fixed by reading speed before the optional player call. Browser tests now assert timing as well as persisted settings. Seeded randomness and virtual demo time reduce variability and waits.

## App context

- M10 equations remains the only implemented topic: 95 questions and three recaps, five learning stages, adaptive pages, profile-scoped progress and reusable ShowDemo playback. Method adapters own drawing frames/rendering; lattice remains future work.
- Semantic daisyUI styles and Bits UI interactions are in place. Questions are centred within buttons, long buttons are intrinsic-width/centred on their own row, number stays left; tuning variables live in components.css .question-list.
- Working fields default to flush/square; development-only Field style selector compares 8px-inset/10px-rounded fields while preserving text padding. Paper option is compact/regular-weight; Clear drawing is an accessible eraser icon with native tooltip.
- Latest user colour mix values are 92/86/82. Highlights mix with each element’s normal surface/border; preserve these user edits. Text colours remain semantic. User-adjusted contrast is accepted; do not reopen it. Historical selected-fill comparison is intentionally superseded, not silently treated as unchanged.
- Practice sets/codes, bank obfuscation, subject/topic search, mixed-topic pages and broader topics are not implemented. Existing schema-2 data must be preserved; old schema-1 migration was waived.

## Documentation and remaining limits

[AGENTS](AGENTS.md) routes to [all project docs](docs/INDEX.md), [standing rules](docs/UI_UX_RULES.md) and [dated decisions/issues](DEV_LOG.md). Protected web_format.md remains untouched. Legacy decks/resources are under legacy/; do not run historical slide publishers. Earlier consolidation verified 29 resource relocations, 33 protected documents and the unchanged bank.

Manual assistive-tech/device/zoom review, explicit HMR verification and future-host integration remain separate limits. No claim of full accessibility conformance or publication is made. UI visual review can continue without reopening completed verification programmes.
