# Maths website prototype

From `practice/`:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory website
```

Open http://127.0.0.1:8766. This is a static ES-module site; no npm install or build is required. Direct `file://` opening is unsupported because the bank is loaded with fetch.

Regenerate M10 data with `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3 -B scripts/prepare_web_equations.py`. Sources remain `content/M10_equations.json` `content/M10_web_recap.json` and `content/M10_web_teaching.json`; do not edit the generated bank manually. Run `node --test tests/*.test.mjs` for focused website checks.

Only equations are interactive in this initial prototype. Its 94 preserved source items comprise 4 assessment, 3 demonstration, 6 scaffolded, 9 error-spotting and 72 independent questions, plus three recap examples from the saved deck. One new two-error Confidence example brings the total to 95 items. Existing PowerPoints/HTML are preserved. No live site has been published.

Progress lives under `maths-starters-prototype-v1`, separated from the T-Level site. Profiles are local names, not authenticated accounts. Submitted results, assistance flags, recommendations and active-page state are saved; unfinished text/drawings are not. No export/import, share codes, cross-device sync, timed mode, puzzles, reports or aggregate progress bar is implemented yet. See `../docs/WEBSITE_PLAN.md` for subsequent phases and scoring interpretations.

Browser verification uses `scripts/browser-smoke.mjs` from the project root, with isolated headless Chrome debugging on port 9238. It clears only the test browser's Maths profile storage. Desktop and mobile screenshots are written under `/private/tmp/`, not into this repository. See the handoff for completed checks and remaining limitations.

Feedback revision (3 October): 19 logic/content tests plus the updated browser checks pass. Method demos now support Play/Pause/Replay with level-specific explanations. Paper mode is session-only; per-error selections are marked explicitly. The T-Level palette/adjustment system uses independent Maths preference keys. See `../docs/dev-log/2026-10-03-equations-feedback.md` for complete changes and review notes.

Startup regression: `node scripts/browser-startup.mjs` uses the same isolated Chrome on port 9238 and preview on 8766, with browser caching enabled. It checks theme failures, delayed loading and preserved profile data. The full smoke also checks automatic advancement after correct answers. Standing interface requirements are in `../docs/UI_UX_RULES.md`.

Theme rendering check: `node scripts/browser-theme.mjs` uses the same preview/test browser and verifies actual colours, pointer selection and refresh. When changing shipped CSS or entry modules, update their asset revision URLs together in both HTML pages (and the dynamic theme import) so cached versions cannot mask a rebuild.
