# Framework migration plan — 3 October 2026

**Status: planning complete; implementation not started.** The user requested completion of the planning/documentation phase only. This plan selects the migration approach discussed in the conversation; it does not authorise package installation, code migration, Git hooks, commits or deployment in this phase.

Read with [web_format.md](../web_format.md), [UI_UX_RULES.md](UI_UX_RULES.md) and [WEBSITE_PLAN.md](WEBSITE_PLAN.md). The product requirements and existing teaching/scoring decisions remain authoritative. This plan changes implementation architecture, not the scope of learning activities.

## 1. Outcome and scope

Migrate the existing equations site to reusable Svelte components, semantic composed CSS and a reproducible static build. Preserve all five learning sections, current content, working themes and browser-local progress. Make activities suitable for later integration into a broader SvelteKit education app using the same styling frameworks.

Included: application shell, assessment, review/demo/recap, guided practice, error spotting, independent practice, working tools, profiles, progress, reference panels/dialogs, themes and About. Include accessibility and regression verification of the whole site.

Excluded: additional topics/questions, revised progression rules, authentication, remote persistence, Practice-set codes, new reporting/timer/puzzle features, publishing, and maintaining slide exports. These remain in the broader website plan. Do not combine a framework move with a storage-schema or teaching-policy redesign.

## 2. Baseline and current weaknesses

The baseline commit observed during planning is `e4eb519` (after the first feedback round, working themes and animated demos). There were already uncommitted updates to the UI rules and dev log; preserve them. Recheck Git status before implementation rather than assuming this baseline is still current.

- `website/` currently contains static HTML, ES modules and CSS; no npm/Svelte/Vite project is present.
- The bank contains 95 items: 94 original imported items plus one new two-error Confidence item, with three recap examples. Permanent IDs, authored explanations, content revision and generation inputs must survive unchanged.
- `engine.mjs` already separates numerical marking/progression from the DOM; `profiles.mjs` supplies profile/store logic.
- `app.mjs` combines session orchestration, rendering, DOM events, drawing, focus and persistence. `teaching.mjs` combines error marking, equation rendering and playback UI. Both need clearer boundaries.
- `styles.css` and several JS modules are densely formatted; escaping and theme restoration are duplicated. Separate token/control CSS exists, but responsive rules and styling ownership need consolidation.
- The user confirmed themes work. Earlier checks reported 19 Node tests plus interaction, startup and rendered-theme browser checks passing. These are historical results, not tests rerun during this documentation phase.

## 3. Selected architecture

| Layer | Decision | Boundary |
| --- | --- | --- |
| Application | SvelteKit with its static adapter, using Vite | Static hosting; no runtime Node backend required |
| UI | Svelte components with explicit inputs and callback outputs | Reusable activities do not import route stores or own browser persistence |
| Styling | Tailwind + daisyUI, existing theme tokens adapted through one mapping layer | Semantic composed classes; no repeated utility lists across activity markup |
| Interaction | Bits UI primitives for applicable complex controls | Bits owns focus/keyboard/open state; daisyUI supplies styling, not a second behaviour implementation |
| Learning logic | Framework-independent JS modules | No Svelte, DOM, browser storage or routing dependencies |
| Persistence | Injected storage adapter; existing schema and keys retained | Future host can substitute persistence without rewriting activities |
| Tooling | npm scripts, lockfile, formatting/lint/component checks and existing regression coverage | Build and verification work without Git hooks |

Select mutually compatible stable package versions at implementation start, preferably matching the intended host application's manifest and lockfile. Record Node/npm versions and dependency choices then; do not invent version pins in this plan. Default to readable JS with documented/JSDoc contracts for existing logic; avoid an unrelated whole-codebase TypeScript conversion.

SvelteKit can prerender static routes with `adapter-static`; browser interactivity remains available afterwards. Vite provides live development updates independently of SvelteKit. See [SvelteKit static generation](https://svelte.dev/docs/kit/adapter-static) and [Vite features](https://vite.dev/guide/features).

### Proposed source layout

Keep the application inside `website/` and authored content/import scripts at their existing repository locations. Paths below are planned, not created:

```text
website/
  src/routes/                 thin root layout, equations page and About route
  src/lib/domain/             marking, progression, profiles, question selection
  src/lib/application/        practice-session coordinator and lifecycle
  src/lib/adapters/           local storage, bank loading, theme preferences
  src/lib/components/ui/      styled Bits primitives and native-control wrappers
  src/lib/components/practice/ question list, answer, working, feedback, progress
  src/lib/components/teaching/ equation rows, guidance, error entries, demo player
  src/lib/theme/              theme definitions, preference validation and mapping
  src/lib/styles/             tokens, base, semantic components and activity CSS
  static/data/               deterministically generated equation bank
  package.json, package-lock.json, build/tool configuration
```

Treat this as responsibility guidance, not a quota of folders/files. Keep cohesive small responsibilities together. Do not create an empty package hierarchy or generic renderer framework before a real reuse need exists.

### State, interfaces and migration map

| Existing source | Target responsibility |
| --- | --- |
| `engine.mjs` | Domain progression/marking; retain tested outcomes and signatures initially |
| `profiles.mjs` | Pure profile selection/validation plus a separate persistence adapter |
| `app.mjs` | Session coordinator, thin route shell, practice components and working-area lifecycle |
| `teaching.mjs` | Domain error marking, equation/guidance components and disposable demo playback controller |
| `theme.mjs`, `theme-page.mjs` | One preference/validation service and shared layout theme application |
| `styles.css` | Readable component/layout styles, composed semantic classes and consolidated responsive rules |
| `theme-tokens.css`, `theme-controls.css` | Preserved palette definitions, daisyUI token mapping and themed control components |

The coordinator receives the bank, persisted session and adapters. It owns question selection, scoring transitions, assistance, first-submission protection and auto-advance. Components receive the selected question/view state and callbacks such as select, submit, request-reference and change-working; they do not mutate global state or write localStorage.

Keep persisted profile/page/history data separate from ephemeral selected-question drafts, canvas strokes, paper mode, reference visibility and playback timers. The coordinator defines reset boundaries; opening a reference or collapsing paper mode must not accidentally clear drafts. Cancel playback/listeners on activity change or component disposal. Store mutation and persistence happen once per accepted action; reactive rerenders must not duplicate marking/history writes.

Svelte escaped text rendering replaces manual HTML-string construction. Preserve maths structure without introducing raw-HTML rendering of user answers or names. Document each module's responsibility, important invariants and non-obvious accessibility/lifecycle decisions.

## 4. Semantic CSS composition and framework integration

The user's requirement is specific: common utility combinations become one or a few CSS classes named for their role, not long repeated utility strings hidden only by larger Svelte components.

- Examples: `question-option`, `answer-input`, `practice-panel`, `working-tools`, `method-controls`. Use a small explicit variant or state attribute when needed.
- Define shared classes once in the component styling layer. Use Tailwind utility composition (`@apply` where supported) or ordinary CSS declarations against shared tokens; choose the more readable implementation.
- daisyUI component classes such as `btn` and `input` may remain as a small foundation alongside a purpose-specific class. Do not assume arbitrary daisyUI/custom classes can be composed using `@apply`; verify the chosen Tailwind version and use supported selectors or component styling instead.
- Keep foundational tokens and shared components global; keep genuinely local layout rules scoped. Establish one documented cascade order: tokens/base, library components, semantic components, narrowly scoped activity rules, intentional utilities. Avoid specificity escalation and broad element selectors that leak into Bits primitives.
- Use native semantics and meaningful class names together; a class name does not supply an accessible role. Avoid unnecessary wrapper elements.
- Build a single mapping from current theme tokens to daisyUI colour/shape tokens, including selected, correct and incorrect states. Preserve all eight palettes, adjustments and saved preferences. Retain reuse attribution.
- Keep theme variants and utility candidates statically discoverable. Do not interpolate partial utility names. Configure source scanning explicitly if shared components later move to a package outside normal discovery.
- Limit daisyUI components/themes to what is used, inspect output CSS and check representative states in the production build. Vite's JS tree shaking is not general-purpose removal of unused CSS selectors.

Tailwind documents [utility composition](https://tailwindcss.com/docs/functions-and-directives) and [class detection](https://tailwindcss.com/docs/detecting-classes-in-source-files). daisyUI documents [component/theme inclusion configuration](https://daisyui.com/docs/config/).

### Visual continuity — required throughout migration

The user explicitly requires the layout and design to remain visually similar to the current site, with **exactly matching theme colours and gradients**. Framework adoption is not a redesign. The current working site's tokens, formulas and rendered appearance are the reference, not stock Tailwind/daisyUI themes.

- Preserve all eight palettes' colour values, transparency, gradient types/directions/stops, border gradients and adjustment calculations. Match identical saved saturation/lightness settings as well as defaults. Do not approximate values with nearby framework palette colours or alter colour-space/interpolation behaviour.
- Preserve typography, spacing, component proportions, borders/radii/shadows, question geometry, page hierarchy and responsive/reference arrangements closely. Override framework defaults and resets where they would change the design. No intentional visual redesign is included in the migration.
- Before replacing UI, capture reproducible screenshots and computed style/token references for every theme, representative adjustment settings, all activity types, About and important interaction states. Use fixed fixtures, viewport, fonts and browser settings; store verification artefacts outside teaching-output backup stacks.
- At each migration stage compare the same states at desktop, tablet and mobile widths. Check computed colours and gradient definitions for exact agreement, and inspect screenshot differences for layout/design drift. Rendering/antialiasing differences between browsers do not justify changed token values; compare baseline and replacement in the same browser first.
- Include hover, focus, selected, promoted, correct, incorrect, disabled, modal/popover and paper/reference states. Exact palette/gradient parity and reviewed layout similarity are cutover requirements, not optional polish.
- If accessibility checks reveal a conflict with exact visual preservation, record the concrete issue and proposed adjustment for the user to decide before changing the affected colours/gradients or design. Neither requirement may be silently relaxed.

## 5. Accessibility throughout the migration

Whole-site accessibility is required. Use WCAG 2.2 AA as the engineering acceptance target; this is a planned target, not a present conformance claim. Bits UI supplies useful interaction primitives, but the assembled page, custom teaching widgets and themes still require verification. See [Bits UI](https://www.bits-ui.com/docs/introduction) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

| Area | Planned implementation and verification |
| --- | --- |
| Profiles/mobile reference | Bits Dialog, accessible title/description, keyboard close, focus containment and return to trigger; retain typo confirmation |
| Theme chooser | Bits Popover and appropriate selection semantics; labelled native ranges or a justified Bits slider; visible selected state and keyboard operation |
| Question list | Ordered list of native buttons with current-question state; do not turn it into tabs unless the complete tab interaction model is warranted |
| Answer/error forms | Persistent labels, fieldset/legend grouping, associated errors, retained invalid input and keyboard submission |
| Auto-advance | After fully correct submission only; announce correctness and new question, focus the new control, retain previous feedback; no advance on invalid/incorrect input |
| Equation working | Preserve meaningful reading order and row headers; exclude decorative separators from speech; manually verify spoken operations/brackets with a screen reader |
| Demo | Play/Pause/Replay, secondary Previous/Next/End, full static solution, cancellable playback and reduced-motion support; no per-frame announcement flood |
| Working tools | Typed working fully usable without drawing; paper alternative retained; canvas never the sole way to complete an activity |
| Layout | Keyboard-visible focus, unobscured controls, 200% text resizing and 400% zoom/reflow checks; target sizing reviewed alongside compact Not you control |
| Themes and status | Text/control contrast, selected/correct/incorrect distinctions beyond colour, forced-colour checks, concise live announcements |

Check all eight themes and adjustment extremes/intermediate samples. Existing arbitrary slider ranges may expose contrast failures. If so, document the conflict and propose a contrast-preserving mapping or constrained safe range for explicit user review before altering the exact-match visual baseline; do not silently remove controls or claim exhaustive coverage from preset-only tests.

Automated checks cover all activity pages and meaningful states, including empty/loading/failure, feedback, open dialogs and completed pages. Manual checks cover keyboard-only use, VoiceOver/Safari and NVDA with a supported Windows browser where available, real touch use, zoom/reflow and reduced motion. Record unavailable environments as outstanding checks; they prevent claiming completed whole-site verification. Do not equate an automated accessibility score with conformance.

## 6. Static build, live development and routes

Planned commands, run from `website/` after implementation:

| Command | Contract |
| --- | --- |
| `npm ci` | Reproduce locked dependencies |
| `npm run dev` | Vite development server; source/CSS saves update the page through HMR or a full reload when needed |
| `npm run check` | Svelte/compiler, lint and formatting checks; fail on unresolved accessibility warnings |
| `npm test` | Existing domain/content tests plus necessary migration/adapter tests |
| `npm run test:browser` | Migrated interaction, startup, theme and automated accessibility scenarios against a configured URL |
| `npm run build` | Validate committed bank and generate static output; fail clearly for missing/invalid inputs |
| `npm run preview` | Serve production output locally for build-level verification |

Normal editing uses `dev`; no save-time production build or Git operation is needed. HMR is not a guarantee of retaining every temporary draft through structural code edits.

Use static prerendered shell/About routes and browser initialisation for personal data. Do not access localStorage/window/canvas during module evaluation on the prerendering path. Render a consistent loading state until browser storage and bank readiness are known; hydrate without mismatched markup. Optional theme setup must remain isolated from core practice startup.

Initially retain the equations learning sections within the root page, preserving navigation behaviour. Use a prerendered About route and preserve the current `about.html` link through a compatible static alias/redirect if its canonical URL changes. Configure base path and route output for the selected host, and test direct navigation/refresh. Avoid making a catch-all server rewrite a requirement for these known routes.

Use SvelteKit's adapter output directory (normally `build/`) rather than assuming bare Vite's `dist/`. Ignore generated output and tool caches in Git. Let the bundler version imported JS/CSS assets; remove manual version query strings when the compiled build replaces them. Keep HTML refreshable and serve a matched release of HTML/assets. Configure data URLs for the deployment base.

Preserve the deterministic content import and audit. The routine front-end build consumes and validates the committed generated bank; it should not require LibreOffice or reconstruct old slides. Move/update the generator output path once, without maintaining duplicate banks, and verify IDs, answers, teaching data and revision remain unchanged. Regeneration/audit stays an explicit documented operation using the existing Python tooling.

### Local hooks and production reproducibility

Hooks are optional convenience wrappers around the same commands. Default: no mandatory auto-build on commit and no automatic staging of generated files. A later optional pre-push check may run checks/tests/build; it must never publish, alter source or update the lockfile implicitly. Keep any hook source versioned with installation instructions, and acknowledge that local hooks can be absent/bypassed. A clean checkout build or future CI build is the deployment authority. No hook is installed by this planning phase. See [Git hooks](https://git-scm.com/docs/githooks).

## 7. Saved data and compatibility

Preserve `maths-starters-prototype-v1`, schema 1 and the existing Maths theme keys during this architecture-only migration. Keep profiles, names, submitted responses, assistance, histories, trial/reassessment state and active page revision intact. Do not rewrite saved data just because a component mounts. Maintain malformed-store protection and storage-blocked in-memory practice behaviour.

Browser storage is origin-specific. `localhost`, `127.0.0.1`, different ports, and a later hosted domain are different origins. Keep the existing review origin `http://127.0.0.1:8766` for handover where practicable; configure a strict port so a busy port cannot silently move the app and appear to lose progress. Run old/new comparisons in isolated test browser contexts. Never clear the user's storage. If origin must change, explicitly plan transfer before claiming progress continuity; changing the storage key alone cannot transfer it.

Do not bump the bank revision for a framework-only change, which would discard active attempts under the current rules. Test migration with saved fixtures representing completed pages, partially submitted pages, assistance, pending promotion and reassessment. Multi-topic schema changes remain separate work before importing another topic.

## 8. Phased implementation and exit evidence

All phases below are pending and start only after the user authorises implementation.

| Phase | Work | Exit evidence |
| --- | --- | --- |
| 0 — baseline | Recheck changes, capture current regression behaviour and synthetic stored-state fixtures; inspect host stack if available; select compatible locked dependencies | Baseline report, preserved content/revisions, documented package/Node choices and no unexplained test failures |
| 1 — build foundation | Add SvelteKit/static adapter, Vite/Tailwind/daisyUI/Bits; establish scripts, formatting, thin shell and explicit browser startup | Source-save updates work; static build/preview and direct routes work without a backend; no prerender browser-API errors |
| 2 — shared UI and one activity | Build semantic style layer, theme mapping, Bits wrappers and assessment using domain/storage adapters | Assessment parity, same-origin progress continuity, all theme choices visibly apply, keyboard/dialog checks pass |
| 3 — remaining learning UI | Move demo/recap, guided/error/independent activities, working tools, references, feedback/progress and About | All standing rules and authored content retained; auto-advance, lifecycle cleanup and scoring regressions pass |
| 4 — integration and accessibility | Verify all page states/devices/themes; test representative components inside a minimal alternate host shell with injected state/storage | No hidden app-global dependencies, duplicate controllers or global-style conflicts; recorded accessibility matrix and resolved release-blocking defects |
| 5 — cutover | Verify clean install/build and production output, consolidate files, retire replaced entry code, update run/handoff docs | One maintained application path, no backup stacks, baseline comparison complete, remaining limitations explicitly documented |

During staged migration keep the existing prototype usable until replacement parity is demonstrated. Temporary comparison scaffolding is acceptable; permanent duplicate implementations are not. Git provides rollback. No automatic reset of user changes, destructive clean, new backup stacks or deployment accompanies cutover. Before any later commit, inspect scope so unrelated content edits are not bundled silently.

## 9. Acceptance checklist and test ownership

- Domain tests preserve exact numeric marking, score weights, assistance, trial/reversion, short-page behaviour and profile isolation.
- Content checks retain all 95 items, stable IDs, three recaps and full authored methods/errors/checks; no unrequested mathematical changes.
- Existing browser smoke scenarios are adapted to user-facing roles/labels where possible, not coupled permanently to legacy DOM IDs. Include both dev and built-static behaviour where relevant.
- Startup tests retain missing/failed optional theme handling, delayed bank, name readiness, corrupt/blocked storage and cache-refresh coverage. Replace obsolete failure injection with equivalent behavioural faults when internals change.
- Visual regression compares captured baseline states throughout migration: exact theme colours/gradients and adjustment behaviour; closely preserved layout, typography and component design.
- Theme tests inspect painted/computed colours, pointer/keyboard selection, adjustments, refresh and About continuity; attribute changes alone are insufficient.
- Layout tests retain the 210px two-column minimum, single-column fallback and stable question/answer positioning. Preserve no ordinary challenge tags except promoted questions.
- Assessment has no practice/repeat card; guidance is level-specific; demo annotations and primary Play remain; paper mode resets by session and restores drafts after collapse.
- Error spotting marks every row/reason/correction and final answer; one/two-error forms have separate row gutters. Incorrect and invalid submissions stay in place.
- Correct answers advance once to the next unanswered question, including wrap/skip and final-page cases; drafts clear and previous feedback remains available.
- Accessibility evidence covers the matrix above. No unreviewed compiler warnings, known serious automated issues or known keyboard-blocking defects remain at cutover.
- Build report records emitted JS/CSS sizes and dependency duplication. Investigate large unexplained growth; do not invent a bundle budget before measuring the baseline and new framework cost.
- Component review confirms readable formatted source, meaningful comments, semantic composed CSS, explicit dependencies and no activity-level direct storage/route coupling.

Use the existing Node tests as the starting point. A consistent browser runner (proposed Playwright with an automated accessibility integration) can replace duplicated CDP harnesses as scenarios migrate; preserve their actual coverage. Version selection and installation belong to implementation, not this phase.

## 10. Open details with resolution points

These are bounded implementation checks, not unanswered architecture choices or approval gates for this documentation phase.

| Detail | Default / resolution point |
| --- | --- |
| Future host repository and dependency versions | Inspect when available in phase 0; otherwise choose a compatible stable set, record the assumption and keep portable component contracts |
| Hosting base path and exact output URLs | Keep static-host portability; confirm before final route/build configuration and cutover; publishing remains separate |
| Theme adjustment contrast | Measure in phases 2/4; propose a concrete safe mapping/range if needed while retaining current preferences and appearance where possible |
| Manual assistive-tech/device availability | Record tested environments in phase 4; leave unavailable coverage outstanding rather than claiming it passed |
| Hook/CI preference | Standalone npm commands are the default; optional hooks or publishing workflows can be added later explicitly |
| Existing teaching/product questions | Keep current behaviour during migration; earlier handoff decisions on scoring, assessment placement and multi-error pedagogy remain separate |

No further user answer is required to regard this planning phase as complete. The next action is implementation phase 0 only after a new instruction to proceed. This document supersedes earlier tentative “Svelte + optional styling libraries” recommendations for this migration, but not the broader product roadmap.
