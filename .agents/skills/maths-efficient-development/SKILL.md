---
name: maths-efficient-development
description: Use cached, change-selected verification for implementation and fixes in this Maths project, with concise results and interruption-safe handoffs. Do not expand a status request into testing.
---

Read [HANDOFF](../../../HANDOFF.md) for current state. The [verification guide](../../../website/README.md#automated-change-selected-verification) explains selection, cache scope and commands; the executable dependency map is `website/scripts/verification/plan.mjs`.

- After a coherent edit, run `npm run verify:changed` from website/. It selects checks by input fingerprints, retains successful evidence and reuses a current build. Use `-- --plan` only when selection itself needs inspection; do not routinely run both commands.
- Treat a successful summary as sufficient. Do not read passing logs, dump source, rerun suites or request screenshots without a specific unresolved visual question. On failure, inspect only the named log, fix the cause and rerun the same command; unchanged passing checks are skipped automatically.
- Routine colour, layout and playback assertions belong in the existing focused browser modules, not temporary inline scripts. Install the browser clock before application startup when testing time; use injected time/randomness for logic tests. Keep real integration checks where timing/network interaction is the subject.
- Use `npm run verify:watch` only for requested ongoing source-save verification, and do not run it alongside another verification process. No Git hook or watcher is installed/started implicitly.
- `-- --force` deliberately reruns the mapped checks; reserve it for a requested clean audit or cache concerns. Historical/extended visual comparisons remain opt-in. User-adjusted contrast is accepted; do not reopen it as a gate.
- Update the dependency map when adding a feature family/import path. It is an explicit conservative map, not an automatic import-graph proof. New external boundaries or content import changes may need a specific check beyond the current generated-bank validator; do not claim coverage the runner lacks.
- Keep production changes direct and modular. Record decisions/failures honestly in DEV_LOG and current resumable state in HANDOFF at milestones and before stopping. Documentation edits normally select only local-link checks.
