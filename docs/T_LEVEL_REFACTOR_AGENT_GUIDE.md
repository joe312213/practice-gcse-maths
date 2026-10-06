# Agent guide: refactor the T-Level starter with Svelte and semantic styling

This is a transferable implementation brief, based on the Maths project's refactoring. Read the destination repository's instructions first. Its requirements, data contracts and latest user decisions take precedence. Do not assume it shares the Maths project's paths, package versions, scoring, content or storage schema.

The T-Level starter currently uses plain HTML, CSS and JavaScript, with no component framework. This brief covers introducing the framework and build tooling as well as extracting components; do not assume Svelte, Vite, npm scripts or a persistence adapter already exist.

## Outcome and scope

Refactor the existing starter into maintainable Svelte components, using Tailwind for reusable styling composition, selected daisyUI foundations and Bits UI for complex accessible interactions. Preserve the starter's accepted content, behaviour, theme colours, gradients, layout and saved data unless the user authorises a change. A framework migration is not a redesign.

Work in small, reviewable slices. Complete the agreed migration and its checks; do not stop at installing libraries or producing a plan. Do not deploy, regenerate teaching resources or change unrelated features as side effects.

## Establish the baseline before editing

1. Inspect Git status and preserve existing user changes. Identify the current HTML entry points, serving/deployment workflow and any existing tooling before running npm commands.
2. Read the HTML, linked stylesheets and scripts, key user flows, theme definitions and storage code. Inspect any existing package manifest/lockfile or build configuration; their absence is expected for a plain static app. Choose compatible framework/tool versions and inspect their APIs before copying examples. Use official documentation where local evidence is insufficient.
3. Record what must survive: routes and hosting base path; content IDs and answers; learner/profile selection; stored settings/results; navigation, keyboard and touch interactions; visual geometry and default themes.
4. Choose whether to introduce SvelteKit for routes and prerendering or Vite with Svelte for the existing page structure. For a static deployment, preserve static hosting compatibility. Do not add a server just to support client state.
5. Run the relevant existing checks once and record pre-existing failures. Capture representative visual baselines before replacing the old UI. Use a temporary checkout or artifacts for comparison, not duplicate production trees.

## Introduce the framework incrementally

1. Establish the chosen build tooling with explicit development, checking and production-build commands, a lockfile and documented runtime requirements. Configure asset URLs and the hosting base path to match the existing deployment.
2. Bring the existing global CSS and theme variables across first, preserving stylesheet order and selectors. Render the page shell in Svelte and compare it with the original before changing its styling foundations.
3. Extract calculations and data transformations from DOM code into plain JavaScript modules. Preserve storage keys and stored values; wrap existing persistence rather than inventing a replacement schema.
4. Convert one complete interaction at a time: replace HTML string generation, inline handlers, query selectors and manual DOM updates with Svelte markup, state and event handlers. Ensure old listeners no longer operate on DOM owned by Svelte. Keep canvas or other imperative rendering behind a narrow lifecycle-managed boundary where needed.
5. Introduce Tailwind composition, selected daisyUI foundations and Bits UI controls in reviewable steps. Compare behaviour and appearance at each step so framework conversion and styling changes do not obscure each other's regressions.
6. Once feature parity is verified, remove replaced scripts/markup and switch the production entry point to the generated output. Document the new commands and deployment artifact; do not publish as part of this migration unless requested.

## Keep responsibilities clear

Use these boundaries where they fit the starter; names are illustrative:

| Boundary | Responsibility |
| --- | --- |
| Domain modules | Pure calculations, validation and state transitions; no DOM or browser storage |
| Application/session layer | Coordinates user actions, state transitions and injected persistence |
| Adapters | Storage, network and other browser/platform effects |
| Svelte components | Render state, collect input and invoke explicit callbacks |
| Route/page shell | Loads data and connects components to application services |
| Theme module and CSS | Authoritative theme values, semantic tokens and component appearance |

Prefer cohesive modules over a generic framework or many trivial wrappers. Keep JavaScript if that is the repository convention; do not add a TypeScript conversion to the scope automatically. Use the installed Svelte version's reactivity consistently. Dispose timers, subscriptions and listeners. Keep personal browser state out of module evaluation during prerendering.

Move one working flow at a time. Remove its obsolete implementation once the replacement is wired and verified. Keep a single production source of truth for content, state and styles.

## Use each UI library for a defined job

### Tailwind: composition

Use utilities for small local layout needs. Put recurring combinations into a few meaningful shared classes, using supported `@apply` or ordinary CSS as appropriate. Avoid repeated long utility strings and layers of overrides.

Inspect the installed Tailwind major version before changing configuration. In the Maths migration, theme/utilities were imported without Preflight to preserve native typography and geometry. Make that choice from the starter's baseline, rather than applying a global reset blindly.

### daisyUI: selected foundations

Adopt only the component foundations needed. Map the starter's existing semantic tokens to daisyUI in one place. If retaining custom themes, avoid activating library themes that replace their colours or gradients. Explicitly check card layout, borders, radius, shadows, buttons, fields and progress bars after adoption.

Installing daisyUI is not evidence of integration: show which controls use its foundations and which intentionally remain custom. Do not force every visual through a library component.

### Bits UI: interaction primitives

Use Bits UI for suitable dialogs, popovers and other complex interactions. Keep native buttons, links, inputs and labels for ordinary controls. Use links for navigation and buttons for actions.

Bits UI supplies interaction primitives, not the application's visual design. Give every overlay an explicit surface, text colour, border, padding, stacking order, sensible width and scroll limits. Portal content can sit outside its trigger's DOM ancestors: ensure global theme variables and shared CSS still reach it.

Put reusable panel appearance on a class, not on one instance's ID. A concrete Maths defect was a progress popover carrying `class="theme-menu"` while its surface styling targeted only `#theme-menu`. The content opened correctly but appeared transparently over the page. Keep instance-specific control layout separate from shared panel appearance.

Verify accessible names, keyboard activation, Escape dismissal, focus behaviour, outside interaction and touch operation. If adding mouse hover opening, check pointer travel into the panel and switching between triggers; retain click/keyboard access. Library use alone does not establish accessibility.

## Preserve data and appearance deliberately

- Inspect existing storage keys and schemas. Preserve current saved data unless the user explicitly waives compatibility. The Maths project's old-schema waiver does not transfer to this repo.
- Keep persistence behind an adapter. Handle unavailable storage gracefully and avoid overwriting unreadable saved data with an empty default.
- Preserve accepted content and stable IDs. Do not regenerate source resources to simplify migration.
- Retain authoritative theme tokens and exact accepted colours/gradients. Check default-theme contrast and the actual rendered combinations. Follow the starter's policy on user-adjustable colours; do not invent a new restriction.
- Preserve intended layout rather than brittle implementation tricks. Replace masking/positioning hacks with structural layout only when equivalent rendering can be demonstrated.
- Use the destination framework's configured aliases and base-path helpers. Do not copy Maths-specific `#lib` aliases, routes, local paths or package versions without checking configuration.

## Verify efficiently and cover the migration risks

Use the repository's existing change-selected checks if available. Otherwise run the smallest relevant combination of logic tests, compiler/type checks, production build and browser scenarios. Use one verification process at a time and retain successful evidence; rerun unchanged passing suites only when dependencies or new findings justify it.

Test behaviours rather than mirroring the implementation. Prioritise:

- Existing saved data loading, profile switching and persistence after reload.
- The main task from start to completion, including error and empty states.
- Navigation and asset loading under the intended hosting base path.
- Dialog/popover keyboard and touch use, focus, viewport containment and visible opaque panel surfaces.
- Representative mobile/desktop layouts, default themes and long content.
- Production build output as well as development mode.

Use deterministic inputs and browser clocks for timing-sensitive tests. Avoid arbitrary sleeps. Automated accessibility checks are useful but do not prove visual correctness: a transparent overlay can escape them. Add a focused regression for each real defect discovered. Keep test profiles isolated from user data.

If adopting cached verification, map dependency families explicitly and ensure new components/styles select their relevant checks. A cache is only as good as its input coverage. Inspect named failing logs; do not repeatedly dump successful logs or run every historical visual audit.

## Finish with a reviewable handoff

Update the destination's existing run guide and current handoff rather than creating competing instruction documents. State the correct working directory, commands, architecture boundaries and remaining limitations. Keep historical decisions in the development log, not the current-state summary.

Before committing, inspect the complete change list, including untracked replacement components and deleted old files. Confirm each deletion has an intentional replacement or is genuinely obsolete. Report what changed, the checks actually run, any pre-existing or unresolved failures, and remaining manual review. Do not claim a migration is verified just because the build passes.
