# Maths practice website

SvelteKit generates a static site; Svelte components use Bits UI for dialogs and the theme popover. Tailwind utilities are composed into semantic CSS classes, with selected daisyUI foundations adapted to the existing theme. Application/session logic, marking, storage and theme adapters have separate responsibilities.

From `practice/website/` (Node 22.12 or later):

```sh
npm ci
npm run dev
npm run verify:changed
```

Vite updates the page on source saves. Development uses port 8766 with a strict port; use `npm run dev -- --port 8767` if another preview occupies it. Build with `npm run build`, then `npm run preview`. Deploy only `build/`; no server-side runtime is required. Set `BASE_PATH=/maths` at build time for a subdirectory deployment.

Browser tests build production output and serve it on an ephemeral local port, without disturbing the development server or the user's browser profile. `CHROME_PATH` selects a browser executable; otherwise tests use macOS Chrome if present, or Playwright Chromium (`npx playwright install chromium`). Optional `BASE_URL` targets an existing preview; `BASE_PATH` mounts the static test server at a matching build path. Screenshots, geometry and axe results go to ignored `test-results/browser/`.

Theme assertions use a frozen historical CSS fixture in `../tests/fixtures/`. Layout comparisons reconstruct commit `e4eb519` in a disposable temporary directory, so a Git checkout containing that commit is required. Do not regenerate visual references from the current implementation. Automated checks supplement manual accessibility/visual review, not replace it. User-selected adjustments may reduce contrast by explicit product decision. Routine browser checks compare the eight defaults. `npm run test:browser:extended` opts into historical layout comparisons and the 32-state adjustment/contrast audit; use it only for relevant visual changes or a migration boundary. Adjustment contrast findings are informational, not failures.

Regenerate the single M10 bank from the project root:

```sh
python3 -B scripts/prepare_web_equations.py
```

This requires `python-pptx`; the local interpreter with it installed is `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3`. Authored sources are `content/M10_equations.json`, `content/M10_web_recap.json` and `content/M10_web_teaching.json`; generated data belongs in `website/static/data/equations.json`. Do not hand-edit the generated bank. There are 94 preserved questions, one added two-error Confidence question, and three recap examples. Original teaching PowerPoints/HTML remain unchanged.

Progress uses local names, not authenticated accounts, under `maths-practice-v2`, scoped by subject/topic. Results, assistance, recommendations and active pages persist; unfinished working does not. Old-data migration was explicitly waived. No export/import, sharing, cross-device sync, timed mode, puzzles or aggregate reports are implemented.

See [HANDOFF](../HANDOFF.md) and the [development log](../DEV_LOG.md) for progress and remaining checks. No site has been deployed. The superseded runtime has been removed. Use Vite for development, or serve the generated `build/` directory for a static preview; serving the source directory is not supported.

## Architecture boundaries

- `src/lib/domain/`: pure numeric marking, progression, profiles and stage order.
- `src/lib/application/`: injected session coordinator and disposable playback; owns reset/assistance/submission boundaries.
- `src/lib/adapters/`: browser storage and bank loading; the session does not import browser APIs.
- `src/lib/components/`: explicit inputs/callbacks for practice, teaching and Bits UI controls; route shell wires services together.
- `src/lib/theme/` and `styles/`: shared theme controller, original tokens, one daisyUI mapping and semantic composed CSS. No Tailwind Preflight; selected library foundations preserve existing geometry.
- Browser-only storage/canvas setup occurs after mount; static routes remain prerenderable. Root learning stages and `/about.html` require no catch-all server rewrite.

Use the [framework workflow](../.agents/skills/maths-framework-development/SKILL.md) for changes. npm scripts/lockfile are the build authority; no mandatory Git hook or automatic staging/publication is installed. Legacy deck audit inputs now live in `../legacy/`; routine frontend builds consume the committed bank and do not regenerate slides.

## Shared controls and focused UI checks

`src/lib/styles/controls.css` composes daisyUI components into `action-button` (primary/compact/quiet), `text-field`, `working-field`, `choice-field`, `paper-toggle`, `progress-meter` and shared surfaces. Bits UI continues to own dialogs/popovers; native fields retain labels and keyboard behaviour. Maths presentation stays in `components.css`; theme tokens are unchanged.

Question selectors use intrinsic flex sizing rather than character-count thresholds. Playback speed (0.5×, 1×, 1.5×, 2×) is saved on each named profile and shared with references. Play scrolls to the playable area; subsequent steps remain visible when a long solution exceeds the viewport.

Run `npm run test:presentation` for these UI behaviours, or `node scripts/browser-checks.mjs --presentation-only` against an already current build. It checks equation fit across nine widths, an individually expanded long-card fixture, playback scrolling and saved speed. This avoids unrelated activity checks during presentation iteration.

## Demo rendering and development style comparison

`ShowDemo.svelte` owns the timer, controls, saved-speed callback and scrolling. A method adapter passes ordered `frames` (each has a logical `step`, plus method-owned drawing data), the logical step count and Svelte snippets for the heading, drawing and completion. The drawing snippet receives the current frame and marks its current drawing target with `data-demo-current`. Key the component by example so switching examples disposes the previous timer. Previous/Next navigate whole logical steps; Play reveals individual frames.

`DemoPlayer.svelte` is the equation adapter: `equation-demo.mjs` supplies reveal frames and `EquationWorking.svelte` renders them. A line-only frame precedes left/equals/right reveals; operations skip equals. Reserved table cells keep the complete divider and column geometry stable, while only unrevealed ink is hidden. No typing or motion effect is required. Future lattice rendering should supply its own frame data and grid/SVG snippet for grid lines, diagonals, operands, cell products, diagonal sums and answer/carry digits; no lattice implementation is included yet.

In `npm run dev`, the working card’s **Field style (dev)** selector compares **Full width · square** with **Small inset · rounded** (8px inset, 10px radius). Both use the same fields and preserve their contents; the selector is development-only and the full-width style remains the production default. `.working-inset` changes shared CSS variables for both writing fields; normal text padding stays unchanged. Selection is temporary for the mounted working card, not a saved learner setting.

## Question-button spacing

Adjust the custom properties together at the start of `.question-list` in `src/lib/styles/components.css`:

- `--question-gap`: gap between buttons/rows (10px).
- `--question-min-width`: minimum paired button width (210px).
- `--question-padding-left`: number’s left inset (10px).
- `--question-number-width`: space reserved for the number (17px).
- `--question-ink-gap`: minimum separation from number to equation (3px); reducing this reduces the required width on both sides.
- `--question-padding-right`: result marker’s right inset (4px).

`--question-clearance` calculates equal space around the equation, preserving true centring without colliding with the number. The left number gutter sets its practical minimum; reducing just the result marker’s right inset does not remove that constraint. Result markers sit below the equation, so an empty result column no longer pushes longer questions onto separate rows. Flex items reserve row slots; buttons themselves stay intrinsic-width (at least the paired width) and are centred inside those slots. These remain native buttons because selecting one updates the current question in place.

## Automated change-selected verification

Run `npm run verify:changed` after a coherent change. It returns the selected jobs and one PASS/FAIL line per job, retaining full output under `test-results/verification/`. Read a log only when its job fails. A second unchanged run selects nothing. `npm run verify:changed -- --plan` previews selection; `-- --force` deliberately reruns the mapped checks. The first run establishes a baseline and therefore runs every mapped job.

`npm run verify:watch` opts into checks after source saves (500ms debounce, serial runs). Stop it with Ctrl-C. No watcher or Git hook is installed or launched automatically; use one verification process at a time.

The dependency map is `scripts/verification/plan.mjs`:

| Edited inputs | Selected verification |
| --- | --- |
| Active Markdown | Local file-link existence; no application build |
| Domain/session logic and Node tests | Fast complete Node suite; relevant bank/Svelte/integration checks according to the map |
| Teaching/demo components | Svelte and presentation |
| Practice/UI components, routes/session/adapters | Relevant Svelte, presentation/startup and interaction scenarios |
| Layout/control CSS | Presentation and semantic colours |
| Theme CSS | Semantic colours only |
| Theme controller | Semantic colours and startup |
| Bank/importer inputs | Generated-bank validation, logic and affected browser scenarios |
| Build/package configuration | Broader mapped checks |

Formatting checks only changed supported website files (all on initial run or formatter-config changes). A production build runs once when selected browser checks need one; its source fingerprint and generated-file hashes prevent stale build reuse. Logic-only and documentation-only runs do not build. Pure domain JavaScript also gets Svelte/project diagnostics, but no browser run solely because a domain file changed.

Successful jobs are cached independently using the contents of their relevant files, including untracked files, deletions, tests, configuration and runner policy. Runtime/Chrome identity is included. This avoids using the entire uncommitted diff against HEAD as a perpetual reason to repeat everything. Failed checks are never newly cached; later failures retain earlier successes. Caches and logs live in ignored test-results/, and are local evidence, not a committed or cross-machine guarantee. Dependency updates must still be installed normally before verification.

Browser entry points now include `--presentation-only`, `--colours-only`, `--startup-only`, and `--activities-only`. Tests use isolated profiles and seeded randomness. Presentation installs its controlled clock before application startup, then advances demo timing without wall-clock sleeps. The reusable colour check tests five semantic states across eight palettes against each element’s normal surface/border; it uses rendered channels with a one-step 8-bit tolerance for CSS colour serialisation. Historical palette comparison no longer asserts the selection fill that the user explicitly changed; other historical colours/gradients remain covered by the opt-in/manual historical suite.

Limits: this is a maintained dependency map, not full automatic import-graph analysis. Add mappings for new feature families. Documentation checks resolve local file paths, not heading anchors or external URLs. Generated-bank validation does not regenerate/audit source decks. Extended historical visual checks and manual device/assistive-tech review remain separate. Watch mode does not replace review or authorize commits/deployment.
