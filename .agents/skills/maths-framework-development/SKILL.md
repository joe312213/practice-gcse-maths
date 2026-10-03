---
name: maths-framework-development
description: Implement this project's SvelteKit static UI using semantic CSS composition, reusable JavaScript boundaries and accessible controls. Use when changing website components, styles or application logic.
---

Read the relevant [standing UI rules](../../../docs/UI_UX_RULES.md) and [architecture/run guide](../../../website/README.md#architecture-boundaries); do not duplicate them in new component-specific policy files.

- Put marking/progression in pure domain modules, interaction orchestration in the injected session, browser persistence in adapters and presentation in Svelte components. Pass data/callbacks explicitly. Keep cohesive responsibilities together rather than creating generic frameworks or trivial wrapper layers.
- Use readable JavaScript and existing Svelte conventions. Comment non-obvious reset/lifecycle/accessibility decisions. Cancel listeners/timers when disposed; keep personal/browser state out of prerender module evaluation.
- Compose recurring utility combinations into a few semantic classes. Use supported Tailwind `@apply` or ordinary shared CSS, whichever is clearer; do not scatter repeated utility strings or duplicate overrides. Keep original theme tokens and the single daisyUI mapping authoritative.
- Use Bits UI for applicable dialogs/popovers and native semantic controls for ordinary inputs/buttons. Preserve labels, keyboard flow, return focus and announcements; library adoption alone does not establish accessibility.
- Preserve exact theme colours/gradients and intended geometry; do not copy brittle masking hacks. Default contrast matters; personal theme adjustments remain unrestricted.
- Inspect installed versions/APIs before adding dependencies or copying examples. Existing SvelteKit 3 imports use `#lib` and `$app/paths` helpers; follow nearby working code. A routine feature change is not a dependency-upgrade task.
- Use the [efficient-development workflow](../maths-efficient-development/SKILL.md) to select checks. Record actual evidence and remaining limits in HANDOFF/DEV_LOG.
