# T-Level reference review — 2 October 2026

Source: https://github.com/jhudshcg/starters, commit `8906225f458372b7238544341e5f293cc67e685a`, separately cloned to `/private/tmp/maths-starters-reference`. The clone is disposable; the commit and this review make the research reproducible. No reference-site files were modified. This is a source review, not a claim to have rerun its full test suite or inspected every subject bank.

## Findings and reuse decisions

| Area | Reviewed implementation | Maths decision |
| --- | --- | --- |
| Delivery | `package.json`, `scripts/build-site.mjs`, `js/bank-loader.js`; static ES modules, esbuild production bundle, lazy packed banks | Keep static delivery and separated content/modules. The small M10 prototype needs no package install; bundling/lazy loading can follow when banks grow. Avoid importing Python/ESP/Go dependencies into a Maths shell. |
| Identity/codes | `js/codes.js`, `bank-release.js`, durable-code decision document | Current code is 54 bits: 6 version + 3 bank + three 15-bit slot/variation pairs; optional timer adds a character. Preserve permanent identities and do not recycle them. Maths code entries will describe collections, so this codec cannot be copied unchanged. Subject-qualified bank IDs and separate question IDs precede code implementation. |
| Scoring/history | `js/progress.js`, repeat-progress tests | Reuse first-attempt/assistance separation, versioned storage, duplicate-attempt protection, and recording actual marked revision. Replace whole-set and four-hour eligibility with explicit Maths per-question adaptive rules. Profiles need a new namespace and per-user state. |
| Revision priorities | `priorities()` in progress.js | Reference uses five recent eligible sets per focus with coverage attribution; puzzles excluded. Do not claim this implements the requested last-ten weighted Maths score. Defer mixed priorities until per-type history is stable. |
| Marking | `js/marking.js`, `maths-answer.js` | Reuse the approach of a restricted grammar and explicit question-kind marking; never execute student input. Implement exact rational comparison for M10 final x values rather than floating tolerance or general algebra dependencies. General fractions/units/ratios need their own explicit schemas. |
| Themes | `js/theme.js`, `docs/theming.md`, token CSS | Reuse CSS token/semantic-colour separation and persistent light/dark choices. Prototype offers two restrained accessible themes; eight palettes and adjustment sliders follow later. |
| Reports | `js/issue-report.js`, student-experience decisions | Reuse preview/copy-before-send approach with question IDs; do not copy a hardcoded recipient or send reports automatically. Destination/configuration deferred. |
| Timing | app.js timer handlers and progress.js deadlineState | Reuse persisted absolute deadlines if timers are added. Reference auto-submits entire sets; Maths must resolve unanswered questions individually before adapting this. Deferred. |
| Leaving work | `js/unsent-answers.js` | Reference protects unsubmitted work; Maths explicitly discards it on changing selected question. Retain assistance flags independently of discarded sketch/text. |
| Puzzles | challenge-rules.js, puzzle families and data inventory | Reference has independently rendered numerical/spatial/logic families. Select and audit suitable maths content in a later phase; do not import the whole bank or imply exam progress from puzzle scores. |
| Verification | tests and CDP browser-smoke script | Reuse Node test runner and isolated Chrome DevTools checks without adding a testing framework. Maths tests focus on promotion boundaries, short pages, assistance, repeated submission and profile isolation. |

## Prototype boundary

M10 is the only interactive topic initially. No live publication, multi-subject deployment change, set-code compatibility promise, complete puzzle/timer/report feature or aggregate topic bar is implied. Other current topic assets remain available as teaching references. Full source preservation and teaching-quality review precede expansion.
