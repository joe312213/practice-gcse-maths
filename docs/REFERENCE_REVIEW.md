# T-Level reference review — 2 October 2026

Source: https://github.com/jhudshcg/starters, commit `8906225f458372b7238544341e5f293cc67e685a`, separately cloned to `/private/tmp/maths-starters-reference`. The clone is disposable; the commit and this review make the research reproducible. No reference-site files were modified. This is a source review, not a claim to have rerun its full test suite or inspected every subject bank.

## Findings and reuse decisions

| Area | Reviewed implementation | Maths decision |
| --- | --- | --- |
| Delivery | `package.json`, `scripts/build-site.mjs`, `js/bank-loader.js`; static ES modules, esbuild production bundle, lazy packed banks | Keep static delivery and separated content/modules. The initial no-build prototype has been superseded by SvelteKit static output; see the website README. Avoid importing Python/ESP/Go dependencies into a Maths shell. |
| Identity/codes | `js/codes.js`, `bank-release.js`, durable-code decision document | Current code is 54 bits: 6 version + 3 bank + three 15-bit slot/variation pairs; optional timer adds a character. Preserve permanent identities and do not recycle them. Maths code entries will describe collections, so this codec cannot be copied unchanged. Subject-qualified bank IDs and separate question IDs precede code implementation. |
| Scoring/history | `js/progress.js`, repeat-progress tests | Reuse first-attempt/assistance separation, versioned storage, duplicate-attempt protection, and recording actual marked revision. Replace whole-set and four-hour eligibility with explicit Maths per-question adaptive rules. Profiles need a new namespace and per-user state. |
| Revision priorities | `priorities()` in progress.js | Reference uses five recent eligible sets per focus with coverage attribution; puzzles excluded. Do not claim this implements the requested last-ten weighted Maths score. Defer mixed priorities until per-type history is stable. |
| Marking | `js/marking.js`, `maths-answer.js` | Reuse the approach of a restricted grammar and explicit question-kind marking; never execute student input. Implement exact rational comparison for M10 final x values rather than floating tolerance or general algebra dependencies. General fractions/units/ratios need their own explicit schemas. |
| Themes | `js/theme.js`, `docs/theming.md`, token CSS | Reuse CSS token/semantic-colour separation and persistent light/dark choices. All eight palettes and user adjustments are now implemented. |
| Reports | `js/issue-report.js`, student-experience decisions | Reuse preview/copy-before-send approach with question IDs; do not copy a hardcoded recipient or send reports automatically. Destination/configuration deferred. |
| Timing | app.js timer handlers and progress.js deadlineState | Reuse persisted absolute deadlines if timers are added. Reference auto-submits entire sets; Maths must resolve unanswered questions individually before adapting this. Deferred. |
| Leaving work | `js/unsent-answers.js` | Reference protects unsubmitted work; Maths explicitly discards it on changing selected question. Retain assistance flags independently of discarded sketch/text. |
| Puzzles | challenge-rules.js, puzzle families and data inventory | Reference has independently rendered numerical/spatial/logic families. Select and audit suitable maths content in a later phase; do not import the whole bank or imply exam progress from puzzle scores. |
| Verification | tests and CDP browser-smoke script | Node logic tests and isolated Playwright browser checks now replace the prototype CDP harness. Maths tests focus on promotion boundaries, short pages, assistance, repeated submission and profile isolation. |

## Prototype boundary

M10 is the only interactive topic initially. No live publication, multi-subject deployment change, set-code compatibility promise, complete puzzle/timer/report feature or aggregate topic bar is implied. Other current topic assets remain available as teaching references. Full source preservation and teaching-quality review precede expansion.

## Theme reuse — 3 October 2026

Restored the temporary reference clone at the same pinned commit. Copied its token CSS and theme controller/control CSS into the website for the requested matching themes. Adaptations: Maths local-storage namespace, dynamically accurate toggle accessible name, and a small supporting-page preference loader. Eight palettes, adjustments, paired mode toggle and reset remain as in the reference. About credits the source project. That theme-only change added no dependencies; the subsequent framework migration did.

## Durable identity review — 4 October 2026

Fetched a fresh temporary clone at /private/tmp/maths-starters-reference-20261004; HEAD remains `8906225f458372b7238544341e5f293cc67e685a`. Reviewed the durable-code decision, docs/code-rollover.md, js/codes.js, js/bank.js, scripts/question-identities.mjs and tests/code-compatibility.test.js. This was a source/test-definition review, not a test-suite run.

- Actual contract: corrections/refinements retain permanent question/variation identities; old codes resolve current content and flag updates. Substantive changes to task/concept/required solution require new identities. Retirement excludes random selection but preserves explicit code access; removal reports unavailability with explicit replacement. Historical scores remain evidence of the attempt actually made; changed active content requires a fresh attempt.
- The identity tooling enforces non-reuse of removed addresses within a generation. The nine-character format uses compact numeric slots rather than UUIDs.
- Important limit: the documented version rollover reuses the finite version space, with generation stored outside the shared code. Pre-rollover codes may therefore collide with newer content. This is an explicit T-Level compromise, not an indefinitely persistent-ID model.
- Recommendation for Maths/parent-app integration: adopt stable meaning/current content and no silent substitution, but keep canonical definition UUIDs, content/behaviour revisions, compact share-code addresses and student-work UUIDs separate. Do not copy rollover-based address reuse for persistent host references. A static permanent slot-to-UUID registry can support short codes without a backend; nine characters cannot directly contain arbitrary UUIDs for several definitions.
- Current Maths already allocates UUIDs to page attempts and records question IDs, bank revision, actual level and results. It lacks definition/element UUIDs, per-question work UUIDs and fine-grained behaviour revisions. Preserve existing authored IDs as aliases if adding canonical UUIDs; allocate once and persist, never regenerate on build. Treat this as proposed design pending agreement, not an implemented migration.

**Superseded proposal (4 October 2026):** the Maths/parent-app UUID and non-reuse recommendation above was not adopted. The user chose compact topic/type addresses with reusable authored page slots; authors own reasonable similarity after replacement. See the final Practice set contract in [DEV_LOG](../DEV_LOG.md) and the implemented [authoring guide](../website/README.md#practice-sets-codes-and-authored-pages). T-Level observations above remain reference findings, not Maths requirements.

## 10 October 2026 — reporting and practice timing

Reviewed T-Level starters commit `69560b227aaedefe72457241a53205ee93b7e024` in `/private/tmp/maths-starters-review-20261010`. `js/issue-report.js` prepares a preview, copied report or mailto draft with page/question context and no automatic sending; the Svelte implementation follows this pattern. `js/practice-time.js` accumulates engaged milliseconds with a two-minute idle expiry, five-second polling, pause on hidden activity and no charge for absence on resume. The user selected that timing system; storage/backend and backup format remain under discussion. No upstream files were edited.
