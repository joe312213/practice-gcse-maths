# Maths website prototype

From `practice/`:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory website
```

Open http://127.0.0.1:8766. This is a static ES-module site; no npm install or build is required. Direct `file://` opening is unsupported because the bank is loaded with fetch.

Regenerate M10 data with `/Users/joehudson/.pyenv/versions/3.13.3/bin/python3 -B scripts/prepare_web_equations.py`. Sources remain `content/M10_equations.json` and `content/M10_web_recap.json`; do not edit the generated bank manually. Run `node --test tests/*.test.mjs` for focused website checks.

Only equations are interactive in this initial prototype. Its 94 source items comprise 4 assessment, 3 demonstration, 6 scaffolded, 9 error-spotting and 72 independent questions, plus three recap examples from the saved deck. Existing PowerPoints/HTML are preserved. No live site has been published.

Progress lives under `maths-starters-prototype-v1`, separated from the T-Level site. Profiles are local names, not authenticated accounts. Submitted results, assistance flags, recommendations and active-page state are saved; unfinished text/drawings are not. No export/import, share codes, cross-device sync, timed mode, puzzles, reports or aggregate progress bar is implemented yet. See `../docs/WEBSITE_PLAN.md` for subsequent phases and scoring interpretations.

Browser verification uses `scripts/browser-smoke.mjs` from the project root, with isolated headless Chrome debugging on port 9238. It clears only the test browser's Maths profile storage. Desktop and mobile screenshots are written under `/private/tmp/`, not into this repository. See the handoff for completed checks and remaining limitations.
