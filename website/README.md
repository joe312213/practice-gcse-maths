# Maths practice website

SvelteKit generates a static site; Svelte components use Bits UI for dialogs and the theme popover. Tailwind utilities are composed into semantic CSS classes, with selected daisyUI foundations adapted to the existing theme. Application/session logic, marking, storage and theme adapters have separate responsibilities.

From `website/` inside the project root, `/Users/joehudson/Dev/Maths/practice` (Node 22.12 or later):

```sh
npm ci
npm run dev
npm run verify:changed
```

Vite updates the page on source saves. Development uses port 8766 with a strict port; use `npm run dev -- --port 8767` if another preview occupies it. Build with `npm run build`, then `npm run preview`. Deploy only `build/`; no server-side runtime is required. Set `BASE_PATH=/maths` at build time for a subdirectory deployment.

Browser tests build production output and serve it on an ephemeral local port, without disturbing the development server or the user's browser profile. `CHROME_PATH` selects a browser executable; otherwise tests use macOS Chrome if present, or Playwright Chromium (`npx playwright install chromium`). Optional `BASE_URL` targets an existing preview; `BASE_PATH` mounts the static test server at a matching build path. Screenshots, geometry and axe results go to ignored `test-results/browser/`.

Theme assertions use a frozen historical CSS fixture in `../tests/fixtures/`. Layout comparisons reconstruct commit `e4eb519` in a disposable temporary directory, so a Git checkout containing that commit is required. Do not regenerate visual references from the current implementation. Automated checks supplement manual accessibility/visual review, not replace it. User-selected adjustments may reduce contrast by explicit product decision. Routine browser checks compare the eight defaults. `npm run test:browser:extended` opts into historical layout comparisons and the 32-state adjustment/contrast audit; use it only for relevant visual changes or a migration boundary. Adjustment contrast findings are informational, not failures.

Regenerate the M10 bank from the project root:

```sh
python3 -B scripts/prepare_web_equations.py
```

This requires `python-pptx`; the local interpreter with it installed is `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3`. Authored sources are `content/M10_equations.json`, `content/M10_web_recap.json` and `content/M10_web_teaching.json`; generated data belongs in `website/static/data/equations.json`. Do not hand-edit the generated bank. There are 94 preserved questions, one added two-error Confidence question, two web assessment additions, and three recap examples. Original teaching PowerPoints/HTML remain unchanged.

Progress uses local names, not authenticated accounts, under `maths-practice-v2`, scoped by subject/topic. Results, assistance, recommendations and active pages persist; unfinished working does not. Old-data migration was explicitly waived. Practice set codes share activity configuration, and timed sets use a persisted deadline. The Progress page provides learner JSON export/import, answer-history CSV and topic summaries. Cross-device sync and teacher reports are not implemented. Puzzles have a separate activity page; their working and marks are transient, outside topic scoring.

See [HANDOFF](../HANDOFF.md) and the [development log](../DEV_LOG.md) for progress and remaining checks. No site has been deployed. The superseded runtime has been removed. Use Vite for development, or serve the generated `build/` directory for a static preview; serving the source directory is not supported.

## Architecture boundaries

Follow the [code style requirements](../docs/CODE_STYLE.md) for implementation and testing decisions, and the [code comments policy](../docs/CODE_COMMENTS.md) for original source files.

- `src/lib/domain/`: pure numeric marking, progression, profiles and stage order.
- `src/lib/application/`: injected session coordinator and disposable playback; owns reset/assistance/submission boundaries.
- `src/lib/adapters/`: browser storage and bank loading; the session does not import browser APIs.
- `src/lib/components/`: explicit inputs/callbacks for practice, teaching and Bits UI controls; route shell wires services together.
- `src/lib/theme/` and `styles/`: shared theme controller, original tokens, one daisyUI mapping and semantic composed CSS. No Tailwind Preflight; selected library foundations preserve existing geometry.
- Browser-only storage/canvas setup occurs after mount; static routes remain prerenderable. The root topic homepage, `/fm/[topic]/` learning stages and `/about.html` require no catch-all server rewrite.

Use the [framework workflow](../.agents/skills/maths-framework-development/SKILL.md) for changes. npm scripts/lockfile are the build authority; no mandatory Git hook or automatic staging/publication is installed. Legacy deck audit inputs now live in `../legacy/`; routine frontend builds consume the committed bank and do not regenerate slides.

## Shared controls and focused UI checks

`src/lib/styles/controls.css` composes daisyUI components into `action-button` (primary/compact/quiet), `text-field`, `working-field`, `choice-field`, `paper-toggle`, `progress-meter` and shared surfaces. Bits UI continues to own dialogs/popovers; native fields retain labels and keyboard behaviour. Maths presentation stays in `components.css`; theme tokens are unchanged.

Question selectors use intrinsic flex sizing rather than character-count thresholds. Playback speed (0.5×, 1×, 1.5×, 2×) is saved on each named profile and shared with references. Play scrolls to the playable area; subsequent steps remain visible when a long solution exceeds the viewport.

Run `npm run test:presentation` for these UI behaviours, or `node scripts/browser-checks.mjs --presentation-only` against an already current build. It checks equation fit across nine widths, an individually expanded long-card fixture, playback scrolling and saved speed. This avoids unrelated activity checks during presentation iteration.

## Demo rendering and development style comparison

`ShowDemo.svelte` owns the timer, controls, saved-speed callback and scrolling. A method adapter passes ordered `frames` (each has a logical `step`, plus method-owned drawing data), the logical step count and Svelte snippets for the heading, drawing and completion. The drawing snippet receives the current frame and marks its current drawing target with `data-demo-current`. Key the component by example so switching examples disposes the previous timer. Previous/Next navigate whole logical steps; Play reveals individual frames.

`DemoPlayer.svelte` is the equation adapter: `equation-demo.mjs` supplies reveal frames and `EquationWorking.svelte` renders them. Guide-construction frames precede left/equals/right reveals; operations skip equals. Reserved table cells keep the complete divider and column geometry stable, while only unrevealed ink is hidden. Shared native stroke/text animation follows the frame sequence. Arithmetic adapters supply their own lattice and bus stop geometry/frames through the same controller; lattice operands and cell tens/units reveal individually.

Writing surfaces use the shared full-width, square-corner treatment in development and production. There is no field-style selector or paper-collapse control. Current visual requirements are consolidated in [UI taste](../docs/UI_TASTE.md).

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
| Layout/control CSS | Presentation, semantic colours and Practice set builder/flow |
| Theme CSS | Semantic colours and Practice set builder/flow |
| Theme controller | Semantic colours and startup |
| Bank/importer inputs | Generated-bank validation, logic and affected browser scenarios |
| Build/package configuration | Broader mapped checks |

Formatting checks only changed supported website files (all on initial run or formatter-config changes). A production build runs once when selected browser checks need one; its source fingerprint and generated-file hashes prevent stale build reuse. Logic-only and documentation-only runs do not build. Pure domain JavaScript also gets Svelte/project diagnostics; Practice set codec, progression and profile changes additionally select the focused set scenario.

Successful jobs are cached independently using the contents of their relevant files, including untracked files, deletions, tests, configuration and runner policy. Runtime/Chrome identity is included. This avoids using the entire uncommitted diff against HEAD as a perpetual reason to repeat everything. Failed checks are never newly cached; later failures retain earlier successes. Caches and logs live in ignored test-results/, and are local evidence, not a committed or cross-machine guarantee. Dependency updates must still be installed normally before verification.

Browser entry points now include `--presentation-only`, `--colours-only`, `--startup-only`, `--activities-only`, `--practice-sets-only`, and `--progress-only`. Tests use isolated profiles and seeded randomness. Presentation installs its controlled clock before application startup, then advances demo timing without wall-clock sleeps. The reusable colour check tests five semantic states across eight palettes against each element’s normal surface/border; it uses rendered channels with a one-step 8-bit tolerance for CSS colour serialisation. Historical palette comparison no longer asserts the selection fill that the user explicitly changed; other historical colours/gradients remain covered by the opt-in/manual historical suite.

Limits: this is a maintained dependency map, not full automatic import-graph analysis. Add mappings for new feature families. Documentation checks resolve local file paths, not heading anchors or external URLs. Generated-bank validation does not regenerate/audit source decks. Extended historical visual checks and manual device/assistive-tech review remain separate. Watch mode does not replace review or authorize commits/deployment.

## Practice sets: codes and authored pages

After choosing a name, enter a code or topic search at the top right of the topic header, above the topic selector, and select the standard-size **Go** button. The field placeholder is `practice code or search`; its label is available to screen readers. **Menu → Create Practice set** opens the creator for 1–4 ordered pages, a starting challenge and whole-set duration. The header **Progress** link opens the dedicated topic grid, revision recommendations and data-transfer controls; the current activity panel retains recent-success and reassessment details. **Create code** fills the code field; **Start Practice set** begins a new attempt. Leaving retains the attempt for **Resume saved set**, including across refreshes. A new start replaces that learner's previous set attempt; recorded results and ordinary learning-stage attempts remain separate. The saved learner level for each topic/page type overrides the code's starting challenge, and adaptation remains active.

The case-sensitive nine-character alphabet is `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`. From most to least significant bits: challenge (2), page count minus one (2), duration (2), then four entries of topic (5), page type (3), authored slot (4). Unused entries are zero. Durations are untimed/5/10/15 minutes. Challenge values are Start/Build/Confidence/future Super challenge. Subject is supplied by the application, not encoded. There is no checksum, revision or format-version field: syntactically valid mistyped codes can describe different activities.

`src/lib/domain/practice-code.mjs` owns encoding and page resolution; `src/lib/content/practice-pages.json` is the author-editable catalogue. Topic M10 has address 9 (M01 starts at 0). Page types are 0 plain, 1 spot-error, 2 mixed priority, 3 problem solving; 4–7 are reserved. Keep topic/type meanings stable. Lattice multiplication (M01), bus stop division (M02) and equations (M10) offer plain and spot-error pages at all three levels. Other encoded combinations report unavailable. Mixed-topic sets use the three loaded banks; ordinary topic selection preserves each topic’s own attempts and history.

Each catalogue topic lists `{type, level, slots}`, where each slot is an ordered list of 1–10 existing matching question IDs. The current plain catalogue has four six-question pages per level; spot-error has one page per level. Slot 0 chooses randomly when first entering a page, saving the resolved slot for resume. Slots 1–15 select directly when available, otherwise `(slot - 1) % availableCount` selects a close match. Out-of-range mappings may change when pages are added. Adaptive level changes prioritise the corresponding authored slot at the new level, then draw eligible questions as needed to avoid repeating already submitted questions.

**Slots may be replaced and reused.** Edit a slot's question list in place when replacing a page; the author decides how much similarity matters. Do not create tombstones or consume new slots solely to preserve obsolete content. Codes preserve activity configuration/position, not frozen questions, and variants are not encoded. Catalogue IDs are validated by the bank check. Future parent-app UUID/sync/versioning concerns are deliberately outside this format.

Timed sets store an absolute deadline, so leaving or closing the app does not pause the clock. Expiry disables further submissions; unanswered questions do not count as failures. Completed and expired sets can be reviewed. The timer is a local practice aid, not an enforced examination clock.

## Progress page, recommendations and data transfer

`/progress.html` is a prerendered static route. `domain/progress.mjs` computes topic/level/type summaries and UK calendar weeks; `domain/revision.mjs` maintains recommendation records; `domain/progress-transfer.mjs` validates portable data and exports CSV. Svelte progress components render these results and Bits UI provides tap/hover/keyboard breakdowns. The obsolete summary dialog and its session snapshot are removed.

All submitted correct/incorrect outcomes remain in topic history. Five scored answers is the initial minimum evidence threshold, not a storage cap. The shared success function uses the latest ten eligible answers for independent practice; other activities retain their shorter page-dependent windows. New history events include pageSize; older events fall back to the saved activity page size or the original defaults (10 plain, 3 errors). Assisted correct answers remain recorded/counted but excluded from success scoring; assisted incorrect answers count as failures, matching existing adaptation. First submissions count; duplicate submissions do not create extra events.

The topic row averages available type scores at each type's recommended level, plain ×2 and other types ×1. Missing type scores are excluded from the numeric average but force grey priority until every available type has minimum evidence at its recommended level. Individual stages average available types at that specific challenge level; manual promotion is not proof of mastery. A stale texture/message coexists with any colour where a current type/level has not been practised for 28 days. Topic date and total include all recorded learning/assessment submissions. Unattempted types/levels have no fabricated score. The fourth stage appears only when catalogue content exists.

On Progress load, fill empty places up to three pending four-page recommendations. Existing records remain stable. Candidates rank missing evidence, then success below 75%, then stale data; ties use weaker success, older practice, topic/type address. Cycle ranked candidates when there are fewer than four choices. Slots are random on first opening; recommendations can select across all three topics and both page types. Recommendations keep separate local page attempts so switching between them does not discard work. Returning to Progress flags opened unfinished sets with the teacher follow-up prompt. Only completion of all four pages earns weekly credit, regardless of correctness; a single recommendation is credited once.

Weeks run Monday–Sunday in Europe/London. At 15 recommended completions in the week, automatic generation pauses. Existing pending sets remain available; an extra congratulation and **Generate more recommended sets** button allow opting in to fill available places. A new week restores automatic generation. The dashboard shows weekly totals and personal best, without a leaderboard.

Export JSON is a version-1 `maths-practice-progress` envelope with username, export timestamp, topic history/tracks and revision records. Import validates before mutation and requires explicit confirmation to replace a matching learner; other learners remain untouched. It restores progress, not partial page attempts, drawings or device settings. Imported unfinished recommendations can restart, retaining their opened status. CSV is UTF-8, quoted/escaped submitted-answer rows with username, topic, question type, level (0-based), question, correctness, assistance, timestamp and attempt ID; formula-like values are neutralised for spreadsheets. Neither file type is encrypted. Import size limit is 10 MB.

Policy values are centralised in PROGRESS_POLICY / REVISION_POLICY for review; the 28-day recency threshold and aggregation/legacy-window interpretation are implementation defaults, not additional user decisions. Focused `--progress-only` coverage includes mobile/accessibility, downloads, invalid/confirmed imports, recommendation persistence and the weekly cap/opt-in controls. Domain/session tests cover scoring, priority ordering, separate attempts, completion idempotency and UK daylight-saving week boundaries.


The learner's last JSON download-trigger date is stored locally and shown with export controls. After ten days without a JSON export, both practice and Progress prompt saving progress to cloud storage, recommending restorable JSON. New profiles establish the clock on first Progress visit or first recorded activity; imports preserve export metadata. Only JSON downloads update the date after the trigger succeeds. CSV is offered as an Excel-readable follow-up after JSON during the current page visit, and does not reset the reminder; the browser cannot verify whether a file was saved to cloud storage.


## Arithmetic topics and drawing assistance

M01 and M02 each contain 94 imported questions: four assessment, three demonstrations, six guided, 72 independent and nine spot-the-error questions. `scripts/prepare_web_arithmetic.py` imports the authored topic Markdown, verifies expressions against saved decks, reads assessment questions from those decks and preserves the original error SVGs and correction text from saved answer HTML. `content/M01_M02_web_support.json` supplies the authorised website replacements, hints, method notes and question-specific correction choices after that audit. Edit this authored file, then rerun the importer; do not edit generated banks. The audit lists each source/website replacement explicitly. It never writes legacy resources. Run it with the same Python interpreter described above. [Import evidence](../docs/ARITHMETIC_IMPORT_AUDIT.json) records source hashes and coverage. Generated files are `static/data/multiplication.json`, `division.json` and `working/*.svg`; catalogue slots retain the existing topic addresses and question IDs.

`MethodDemo` selects the equation or arithmetic adapter. `arithmetic-demo.mjs` computes individual lattice cells, diagonal sums/carries and bus stop digit divisions; `ArithmeticWorking` renders them through `ShowDemo`. Build division asks for quotient and remainder (`24 r 1`); Confidence continues to decimal answers, preserving internal zeros. Error activities retain the saved wrong diagram and require both a correction choice and the final answer. Choices describe repairs without revealing the final answer. Every question has an authored hint; the session keeps transient hint visibility separate from persisted assistance. Method and diagnostic notes appear with the worked answer.

`drawing-assist.mjs` owns method-specific tool labels, inputs and blank guide strokes. Grid accepts 1–4 columns/rows; Frame accepts 1–8 digit spaces. Guide replacement retains freehand strokes. Neither a blank guide nor its replacement counts as learner working or a scoring hint. Clear drawing removes both guide and ink; changing question restores that question’s cached working. Canvas coordinates reserve space above, beside and below the grid for operands, carries and answers.

## Shared puzzles integration

The header links to `/puzzles.html`, with nine puzzle types, upstream challenge bands, next variation, explicit checking, hints, solutions and source attribution. The catalogue loads only on that page. The wrapper mounts the package into an empty browser-only container and disposes it on replacement/unmount. It does not implement its own puzzle checkers. Theme mapping lives in `styles/puzzles.css`. Puzzle working is transient and puzzle marks do not affect the three topic progress records or JSON/CSV exports.

`vendor/puzzles` is an unchanged package copy from [T-Level starters](https://github.com/jhudshcg/starters/tree/69560b227aaedefe72457241a53205ee93b7e024/packages/puzzles), commit `69560b227aaedefe72457241a53205ee93b7e024`, installed through a local npm dependency. Its declared mathjs 15.2.0 dependency is locked. To update, replace that directory from a reviewed upstream commit, retain attribution, update this pin and run change-selected verification. Do not reformat or modify the imported library as application code.

See its [README](vendor/puzzles/README.md), [API](vendor/puzzles/API.md), [architecture](vendor/puzzles/ARCHITECTURE.md) and [style contract](vendor/puzzles/styles/README.md). The portable package tests and a focused `--new-topics-only` browser scenario are mapped into the cached verifier. Package changes invalidate the build as well as those checks. Upstream challenge labels are retained; classroom suitability/timing and manual touch/assistive-technology review are not established by automated checks.


## Practice search and canvas resizing

Topic titles, IDs and catalogue `tags` are searched case-insensitively, with word-prefix matching. Every word within one search must match the same topic; commas combine searches (for example `multiplication, division`). Matching topics each contribute one random authored independent-practice page to an untimed set. Start is the fallback challenge; existing saved learner levels take precedence. Known topics are matched before code syntax so `equations` works despite having nine letters. Unmatched nine-character inputs still use the existing case-sensitive code validation; other unmatched text reports suggestions without replacing the current activity. Add aliases to `practice-pages.json`; the arithmetic importer retains them.

The canvas grip supports dragging down/up and keyboard Down/Up in 20-pixel steps; Home restores the 230-pixel default. Height is bounded to 120–800 CSS pixels. Resizing repaints stored guides and strokes at their original scale, keeping ink outside the temporarily shortened surface. Height is included in the temporary per-question working cache and restored when returning to that question. Clear drawing also clears any hidden ink.

The Vite development server explicitly allows `vendor/puzzles` alongside SvelteKit’s default paths, because the local package resolves there through its npm symlink. Without this entry, dynamic catalogue loading receives a serving-path rejection in development even though production bundling succeeds. To verify the running development site, use `BASE_URL=http://127.0.0.1:8766 node scripts/browser-checks.mjs --new-topics-only`.

`GoPuzzle.svelte` composes the package’s public render/board-binding APIs to position parent hints and attribution like the T-Level app. The shared library still owns Go rules, move handling, delayed replies, checking and replay. Other families use `mountPuzzle`. Classic maths remains in the unchanged package but is excluded from the student selector.

## Measured practice time and temporary working

Progress remains schema-2 JSON in localStorage. Topic `history` retains timestamped submitted answers, including initial assessment; the first complete initial assessment is displayed separately as the baseline (or the first partial one until completion). Practice-success bars retain their existing scoring rules.

`domain/practice-time.mjs` adapts the T-Level starters active-clock functions from commit `69560b2`. `adapters/practice-time.mjs` binds interaction/visibility/lifecycle events and polls every five seconds. Active time stops after two minutes without interaction, when the page is hidden, on completed pages and at a timed set's deadline. Display/resume starts a new inactivity window. Clocks are never restored from storage, so reload/absence cannot accrue time. Time includes assessment, demos, scaffolded and independent/error practice, including unfinished questions; puzzles remain separate. An abrupt process termination can lose the unsaved polling tail.

Each topic's optional `practice` array stores `{id, at, type, attempt, milliseconds}`: `id` identifies an active page visit, `at` is the UTC-hour bucket, and `milliseconds` is credited active time within that bucket. Consecutive polls update the visit/hour row. Hour boundaries allow exact Monday–Sunday UK weekly aggregation across clock changes without a row per interaction. `practiceMeasuredFrom` records when this profile began measuring; older time is unknown. Weekly success is derived from all scored answers for the selected type at each level, separately from the existing rolling weighted bars. JSON export version 2 retains time and imports version 1 too; CSV remains submitted-answer history. This additive change preserves schema-2 records and does not migrate waived schema-1 stores. JSON remains the chosen storage; reconsider SQLite only for demonstrated volume/query needs or a server-backed product requirement.

`adapters/working-cache.mjs` uses sessionStorage for theme-independent stroke data, typed working, guide lines and canvas height, keyed by learner/topic/attempt/question. Entries expire three hours after the last working edit and are pruned on subsequent access/save; closing a normal tab ends its session cache. Browser session restore behaviour can vary. Drawings and draft answers are excluded from progress exports. Canvas recolouring is rendering-only; erasing is transparent and reveals the themed background.

## Topic homepage and public URLs

The root page lists Foundation Maths topics in prerequisite order. Its server-only build loader extracts one Build-level demo with its solution from each existing question bank, so previews do not introduce a second copy of authored question text or send entire banks to the homepage client. `src/lib/content/topic-routes.mjs` owns stable slugs and bank/file mappings; display titles remain bank-owned. Public subject code `fm` does not rename the internal `maths:Mxx` progress keys.

`src/routes/[subject]/[topic]/+page.js` enumerates supported routes for prerendering and uses `trailingSlash = 'always'` to produce directory `index.html` files. The thin route component mounts shared `TopicPractice` and resets it when the topic changes. Cards and dropdown selection use base-aware URLs; existing `.html` utility routes remain intact. Unknown subjects/topics return 404, and old root `?topic=Mxx` links forward on the client. Build output works on an ordinary static server without an SPA fallback.

Normal topic URLs open the named topic. Active Practice sets append `?set=CODE`: reload resumes a matching local set; a shared set link starts that code for the selected learner. Leaving a set removes the parameter. This distinguishes a mixed-topic set from a normal topic link. Recommendation links retain their recommendation ID and open through the topic practice route. The topic-copy button/component is removed; native card links and the address bar provide shareable links.

The existing new-topic browser scenario checks card content against the bank, mobile overflow/accessibility, direct static HTTP responses, reload, browser Back, query-link forwarding and topic-selector URLs. Practice-set checks cover completed-set reload and the return through the topic homepage.

## Revised topic workspace and assessments

Ordinary independent pages contain twelve questions. `scoringWindow` in `domain/engine.mjs` keeps their success/adaptation window at ten eligible answers, including for nine- or ten-question pages; complete timestamped history is still retained. JSON transfer accepts page sizes through twelve without changing schema-2 storage. Authored Practice-set slots retain their configured lengths.

Initial assessments now contain six questions, two per level. Both content importers apply the separately authored `content/web_assessments.json` after auditing the original saved sources: arithmetic banks contain 96 questions each and equations 97. Original IDs remain intact. Baseline completion uses the assessment's recorded size, preserving prior four-question baselines.

Homepage cards render compact Build demo solutions through the existing arithmetic/equation components. The topic workspace places compact progress above a wide question panel, up to three question columns, and selected-question/answer alongside embedded working. Small screens stack the question and working. Footer links share a spaced flex group. Presentation checks cover responsive geometry; new-topic checks cover the worked previews.

## Demo guide construction and ink animation

`application/demo-guide.mjs` supplies shared guide-construction frames before calculation ink. Arithmetic geometry is owned by `arithmetic-demo.mjs`; equation divider height is driven by the same guide progress. `ShowDemo` starts at the first frame and uses `demo-motion.mjs` to interpolate SVG strokes, divider height and text clipping with native Web Animations. Pause/resume, speed changes, replay and disposal coordinate with the existing player; reduced-motion preference skips interpolation, retaining the teaching sequence. Manual step/end controls render their destination directly. Static feedback and homepage solutions remain fully drawn. No dependency was added.

Presentation checks inspect native paused animations for all three methods and exercise all five stage headers at phone/tablet/desktop sizes, including scaffolded text that previously squeezed the stage navigation.
