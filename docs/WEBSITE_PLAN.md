# Website roadmap and scoring interpretations

Product authority: [web_format.md](../web_format.md) and later [standing decisions](UI_UX_RULES.md). Current implementation/status belongs in [HANDOFF](../HANDOFF.md); dated evidence belongs in [DEV_LOG](../DEV_LOG.md). This is a roadmap, not permission to start every item.

## Current implementation programme — 12 October 2026

The user now authorises working through the outstanding list in order, documenting each slice: Draft teaching review; multiplication Confidence correction; 48-hour working cache; topic discovery; fixed non-independent scoring windows; both forms of problem solving; Practice-set expansion; further topics; profile/college features. [HANDOFF](../HANDOFF.md) owns the live sequence and evidence.

Additional instructions: fix iPhone Draft-stamp clipping; provide partial-title search and `priority` / `a-z` sorting in the 40% side of a 60%/40% heading/control row; blend initial topic difficulty with learner revision evidence. Add a sixth application/problem-solving stage and combined problems using 1–4 operations, with reusable collapsible level-matched `How to solve tips`. Ratios and percentages are next, followed by calculator-paper content. Investigate handwriting stroke animation libraries, report payload/adoption issues and keep any integration behind a shared helper.

This authorisation supersedes earlier documentation-only deferrals for these slices. It does not authorise publishing, provisioning external services, inventing college destinations, a Go opponent or adopting an animation dependency without the requested investigation. Highlighting, linked progress saving and countdowns from the previous priority list are implemented.

## Future Go computer opponent

Documentation requested on 12 October; no opponent implementation is authorised. Strength around amateur 1 dan must be defined by board size, rules and a measured reference rating. A JavaScript download size alone cannot establish playing strength: model weights, runtime, search time and device matter.

| Option | Likely use and payload evidence | Decision needed |
| --- | --- | --- |
| [Moka](https://github.com/millionco/moka) | Tiny 9×9 browser model; its README reports roughly 103 KB compressed weights plus runtime overall. No evidence of 19×19 or amateur 1 dan strength. | Consider only for a lightweight 9×9 experiment; benchmark strength first. |
| [KataGo WebGPU/WASM](https://github.com/saigo-online/katago-webgpu) | Browser search with 9/13/19 boards. Expect an engine/runtime plus separately loaded neural weights, potentially tens of MB or more depending on network. This is an estimate, not a measured app bundle. | Benchmark actual compressed payload, memory, cold startup, phone move latency and calibrated strength before choosing a network. |
| [Pachi](https://github.com/pasky/pachi) | Established C engine; a browser/WASM port needs integration work. Published native ratings depend on hardware/search settings and cannot be carried over to mobile. | Check GPL obligations, browser portability, CPU/worker budgets and observed strength. |
| Hosted engine | Small browser client, while engine/models remain on a server. Can offer controlled strength without a large student download. | Requires hosting, operating cost, network availability, rate limits and a data/privacy design. |

Prefer a separately loaded worker/engine adapter if pursued. The reusable puzzle module retains legal moves and board state; the app owns opponent choice and loading UI. Cancel/discard replies after undo/reset/size changes, enforce time limits, keep human play usable without loading AI, and measure against a fixed opponent/test set on school computers and phones. Choose board-size/rating targets before selecting a model. See the [patch register](puzzles_patches.md) for existing human-game boundaries.

## Implemented programme and later work

The authorised batch implements Confidence operand corrections, a 48-hour working cache, partial-title discovery with blended revision priority, fixed scoring windows, four-question scaffolded pages, the seven-day explicit assessment lock, sixth-stage/combined problems, ratios and calculator practice, and local profile controls. Exact verification and any remaining checks belong in [HANDOFF](../HANDOFF.md), with the dated record in [DEV_LOG](../DEV_LOG.md).

1. M03/M13/M15/M04/M06/M07/M12 are accepted for unmarked display following the user’s 13 October request; continue reviewing application content from teaching feedback. Keep IDs and source provenance; follow prerequisite order for subsequent expansion.
2. Device acceptance remains separate from browser automation, including the reported physical iPhone Safari layout.
3. College integration is later design work: proposed central hosting, college accounts, teacher-configured links and college-code URLs. No college infrastructure is implemented. Issue reporting retains an empty email recipient.
4. Extra/Super challenge and custom-input animations remain V2; slide export is deferred. The handwriting investigation is complete in [METHOD_ANIMATIONS](METHOD_ANIMATIONS.md#handwriting-stroke-investigation--12-october-2026); adoption must use a shared helper and reviewed glyph paths.
5. Publication and hosting remain separate actions. No Go opponent is authorised by this programme.

## Practice set implementation checkpoint — 4 October 2026

The implemented [Practice set contract and authoring guide](../website/README.md#practice-sets-codes-and-authored-pages) owns code fields, slot reuse/resolution, timing and resume behaviour. The 4 October DEV_LOG final-contract entry records why it superseded the three-page limit, per-page challenge, frozen-release/UUID registry and non-reusable slot proposals. Four challenge values are reserved, with no Automatic value; variants remain session choices. Mixed-priority and problem-solving pages are implemented, including Combined topics; Super challenge remains reserved for reviewed V2 content.

## Scoring interpretations currently used

This section records scoring decisions and implementation interpretations. Explicit user decisions take precedence; other interpretations remain reviewable without rewriting teaching content or UI.

- Target storage scope is subject/topic/page-type/level, alongside assisted outcomes. Schema 2 already scopes topics by subject/topic, with page-type tracks and actual-level histories. Old-data migration was waived. Correct assisted attempts leave scoring history unchanged; incorrect attempts enter as failures. A question remains assisted for the whole page attempt once a hint/reference is used. Retries are learning feedback, not additional scored attempts.
- Independent practice uses the last ten eligible outcomes with oldest-to-newest weights 1,1,1,1,1,2,2,3,3,3. Zero-pad missing history; do not reset at page boundaries. For page types that typically have few than ten questions, use a rolling window that matches the typical number of questions on that page type: equal weights for 1–4 questions; the newest three weighted twice for typical 5–9 question pages. Denominator includes missing positions. Ordinary independent pages now contain twelve questions; this does not change their ten-answer scoring window.
- **Implemented 12 October:** fixed scoring windows are four for scaffolded/errors, six for problem solving and ten for independent/mixed revision. Scaffolded pages contain four questions. Initial assessment has six questions and no promotion, with explicit reassessment only after a seven-day lock and complete attempt history.
- Adaptive level reassessment (separate from Initial assessment) requires min(5, page length) eligible answers; for 1–2-question pages require at least three across pages. Persist lockout/trial state. Short-page success cannot bypass reassessment.
- Promotion checks a type's own history. Trial answers are recorded at their actual level. Failure restores the previous recommendation and its history; no same-page retry unless five new consecutive unassisted successes follow the failure. At page end, a one/zero-question trial offers the specified choice; two or more correct trial answers confirm automatically.
- Two consecutive submitted questions at the same manually selected lower level lower the recommendation. A manual upward choice changes the recommendation, records its origin and uses the low-score recommendation rule; it does not masquerade as automatic mastery.
- Start has a recap recommendation instead of a lower-level offer; Confidence has no automatic higher level. Invalid input is not a submitted attempt. Drawing and typed working restore per question from the temporary cache; unsubmitted answer entry resets when changing question and submitted feedback remains.
- Separate learning sequence navigation from independent Practice sets. Assessment/scaffolded answers do not promote. M10 error spotting now marks each independent error’s row, reason and corrected-step selection, plus the final x value; do not claim automatic checking of freehand working.
- Topic aggregation and share codes are implemented; their current contracts are documented in website/README. Distinguish displayed recommendations from demonstrated mastery.

## Teaching questions for a future review

These are recorded engineering interpretations, not urgent approval gates. Preserve current behaviour until reviewed:

- Fixed scoring windows are settled above; any later review of adaptive level reassessment at lengths 5–9 should preserve those windows.
- Assisted correct trial answers currently neither fail the trial nor count toward confirmation. Opening a reference marks assistance even if the learner does not use it.
- Submitted answers are immutable within a page; decide whether future unscored retries or repeat-question eligibility intervals help learning.
- Distinguish manual level choice from demonstrated mastery in any future aggregate display.
- Initial assessment currently gives immediate feedback and no automatic placement or enforced stage order. Placement criteria remain undefined.
- Local profile rename/delete/reset is implemented; real college host integration remains deferred. Recorded history is retained; JSON progress export/import and CSV answer export are implemented.

## Arithmetic problem-solving implementation

The user selected **both** on 12 October: a sixth application stage within topics and combined arithmetic problems, involving **1–4 operations**. Use accessible varied situations requiring students to select operations and interpret results. Mixed problems must not reveal their operation by grouping; prerequisites govern teaching order.

Both problem-solving pages and the sixth chevron stage offer a reveal/hide **How to solve tips** section: short steps, specific tips and a worked example matching the current challenge level, sharing the teaching renderer. Assistance follows the existing scoring contract. Preserve original stage IDs, existing page slots and saved progress; keep problem-solving histories separate from plain method practice. Do not duplicate identical practice across topic and combined paths.

Ratios then percentages are the next content priorities; M06 already exists and should be refined/extended rather than duplicated. Subsequent content should support Foundation papers permitting calculators, without assuming an exam board. See [HANDOFF](../HANDOFF.md) for the ordered work slices.


## Content maintenance review — 15 October 2026 (proposal, not a refactor)

The runtime reads `website/static/data/*.json` and referenced `working/*.svg`. These are the directly edited, authoritative banks for all ten topics. `website/src/lib/content/practice-pages.json` selects existing question IDs for portable Practice-set codes; ordinary pages partition bank questions by stage/level. Topic routing/registry data describes discovery and identity, not question wording. Normal builds validate and copy the live data; they do not regenerate it from Python or Markdown.

The confusing second chain is historical: topic Markdown, `spot_errors.json`, saved decks and web-support JSON feed optional Python reference-candidate tools. Those tools deliberately write temporary comparison candidates, not live banks. Keep their provenance/comparison capability; they are not a second authoring source. Other old slide-building scripts belong to the legacy workflow. `content/PRACTICE_PAGES.md` also retains an outdated two-question scaffolded count in its dated expansion account; the current requirement is four.

On 16 October the user confirmed the ownership requirement: one clear editable source per topic across all learning stages, and no generator replacement of manually authored/refined content without an explicit replacement request. The [standing ownership rule](../website/README.md#current-content-and-historical-references) applies now; the exact relocation paths and build changes below remain a proposal. One topic bank should hold all its stage content, with assets referenced and catalogues containing IDs only. Generators produce separate review candidates; ordinary builds validate/copy canonical data without rewriting it.

Options for discussion before moving or consolidating files:

1. **Documentation only:** put a short source-of-truth table in the website guide and improve historical labels/links. Lowest risk, but live authored content remains under `website/static` and obsolete tooling remains visually mixed with current work.
2. **Recommended single-source relocation:** move directly maintained banks/working diagrams to `content/banks/`, copy them into static output during the build, and update validators/tests together. Keep specs under `content/specs`, code-address selection in one catalogue, and group historical material/tools explicitly. Preserve IDs, JSON shape, URLs, saved work and useful reference-candidate comparisons. Do not regenerate refined content from old sources. This has build-path/testing cost but aligns ownership with AGENTS.
3. **Structured authoring generator:** introduce a typed misconception catalogue and deterministic generators for variants, wrong working and correction options. Potentially useful for large-scale content generation, but adds an authoring language and another transformation to maintain. It is not needed to fix the current UI or clarify the existing source of truth.

At the time of this proposal no relocation, generator or retirement had been implemented; see the adopted layout below for current state. Directly authored documents and legacy resources require preservation. Reduce duplicate standing rules by linking UI rules, method-animation contract and topic specs; retain DEV_LOG as dated evidence and HANDOFF as current state.

### Spot-error content decisions needing agreement

Follow the [user-authored process](SPOT_ERRORS_PROCESS.md). Before bank rewrites, agree common errors in each topic/method spec, then build displayed incorrect working from those errors and derive one correct process option plus distinct misconception-based distractors. Use one dropdown per independent error in working order; later consequences of one mistake are not extra independent errors. Keep the final corrected answer separate.

Misconception lists live in the Common errors sections of the [topic specs](INDEX.md#teaching-content). The lattice prototype has agreed coverage. The user agreed M02 division (D1–D7), M13 signed addition/subtraction (S1–S7) and M10 equations (E1–E8) on 16 October. The user also agreed M15 fractions (F1–F8), M06 percentages (P1–P8) and M03 multiplication/division problems (A1–A8). The user also agreed M04 ratio (R1–R8), M12 speed/distance/time (T1–T8) and M07 reverse percentages (RP1–RP7). All nine non-lattice implemented-topic lists are now agreed. M01 L1–L8 are now all agreed. The user authorised all-topic drafting and then live integration: [360 questions](../content/spot-errors-drafts/README.md), 36 per topic, are incorporated into the existing banks with distinct IDs and retained prior-attempt definitions. Combined practice retains source-topic coverage; planned, unimplemented topics need their own later review. Agreement on misconception lists does not itself replace live bank content.

Confirmed issues before a full per-question review: M04-WEB-ERRORS-C1-Q1 labels “Use the given quantity as the value of one part” as wrong although its given difference equals one part; repeated generic correction/distractor templates in calculation banks are not always specific to the displayed error. Existing equation tasks ask for row, reason and correction, whereas the new process asks for one correction dropdown per error. This earlier control proposal is superseded by the agreed [interactive investigation process](SPOT_ERRORS_PROCESS.md): meaningful location selection and an editable list of explanation/repair choices, with the student deciding when all independent mistakes have been found. The prototype established the UI; live integration now includes equations and all other implemented topics. Independent-error counts vary by question and are not disclosed by preallocated controls. The cited old questions remain historical definitions only. The user subsequently authorised automatic reset of saved retired-question pages so all active work uses the current interface.

All ten live banks already have 12 error questions per level (three pages of four). Eight older M01/M02/M10 Practice-set slots had only three; these have now been extended with existing matching questions. Saved attempts retain their original questions/responses; a current three-question saved attempt is not evidence of a short bank.


### Adopted topic-folder layout — 16 October 2026

The user superseded the earlier content/banks proposal below: editable content now lives in `website/static/data/<topic>/`, split by area, with shared/named-level guidance. The [editing map](../website/README.md#editing-learn-the-method-and-topic-content) is authoritative. Development and static builds assemble the unchanged bank URLs automatically; no source generation or pre-commit preparation is needed. The old empty website/data directory had no consumers. Historical Markdown/Python grouping remains a separate proposal.

### Earlier relocation scope (superseded paths; retained rationale)

| Current location | Proposed ownership | Change needed |
| --- | --- | --- |
| `website/static/data/*.json` (10 banks) | `content/banks/*.json` | Move exact reviewed files; validate source banks; copy to the same `/data/*.json` URLs |
| `website/static/data/working/*.svg` (72 diagrams) | `content/banks/working/*.svg` | Move exact assets with banks; crop/check canonical assets; publish unchanged relative URLs |
| `website/src/lib/content/practice-pages.json` | `content/practice-pages.json` | Keep a separate small ID-selection catalogue; update imports without changing code addresses/slot meanings |
| `content/specs/*.md` | Same | Requirements and agreed misconception lists; never duplicate complete live banks |
| `content/topic_registry.json` and `website/src/lib/content/topic-routes.mjs` | Retain initially | Audit overlapping discovery metadata before deciding whether one can replace the other |
| Historical topic Markdown/JSON and saved decks | Explicit historical grouping, with original provenance | Inventory incoming links/imports first; preserve authored text and manual deck edits |
| `prepare_web_arithmetic.py`, `prepare_web_equations.py`, `bank_candidates.py` | Retained reference-candidate tool group | Preserve temporary-output comparisons and their tests; no live overwrite command |
| Legacy slide generators/renderers | Legacy tool group, in a later slice | Move only after checking their relative imports, paths and callers; never run them as part of website builds |

Implementation would add one small content-copy command shared by build/dev startup, plus dev watching of canonical content changes. Static data becomes generated and ignored, with a clear generated-source notice; build products remain governed by the existing publishing policy. Homepage server imports, the validator, browser fixtures, Node tests, crop tool and verifier dependency map must all target the correct source/output boundary. The dev server needs explicit read access to the canonical content directory. No parallel editable copy or general-purpose content compiler is needed.

Suggested sequence: (1) agree ownership and inventory references; (2) move live banks/assets/catalogue without content changes, compare every published data file byte-for-byte and verify URLs/IDs/progress; (3) clarify and group historical sources/tools, testing comparison commands separately; (4) consolidate overlapping prose only after preserving directly authored wording and checking links. Keep content rewriting separate from relocation so each review can establish what changed. This is a proposal only; user approval is still required before refactoring.

## Teaching methods and simpler authoring — agreed sequence, 18 October 2026

**Status:** the user agrees with the direction below, but will review topic methods and teaching steps in a later session before implementation continues. Save the plan now; do not start converting banks or refining teaching content ahead of that review. Existing readable phrase references, stage defaults, dictionary delivery and selected-question expansion are implemented; the shared mathematical/method definitions and further delivery packing below are not.

### Purpose and authoring contract

Reduce what an author must type, copy, search for and keep consistent across roughly 200–300 questions per topic, including demos, hints, explanations and spot-error options. Download size is a separate measure: packing generated output cannot by itself fix duplicated author responsibilities. The current ratio records repeat mathematical facts across question wording, models, worked steps, diagram data, hints and checks; some investigation feedback repeats its accepted repair reference and parameters.

- Define a question's mathematical facts once, with explicit context, labels, units and requested quantity. Derive routine working, diagram values and checks where unambiguous, while preserving distinctive authored content and intentional errors.
- Maintain a small set of clearly named, reviewed teaching methods per topic, shared with Learn the method and its demos. A method supplies a deterministic teaching sequence and calculations, not runtime-generated prose. A question selects its applicable method or valid alternative methods; authors can override individual hints, explanations or steps.
- Use readable whole phrases, named parameters and shallow defaults. Avoid fragment tokens, opaque authored codes and unnecessary indirection. Consider the full reference length against the replaced value; a longer reference needs a clear maintenance benefit. Standard question wording can be optional; distinctive contexts remain easy to author.
- Reuse complete question/worked-example references for demos. Where appropriate, feedback defaults to the accepted repair explanation, with an explicit override when its pedagogical purpose requires different wording. Hints prompt, demos demonstrate and corrective feedback explains; shared meaning does not require identical wording.
- Link worked actions, hints and feedback to stable teaching-step identifiers. Link spot-error diagnostic options to the relevant step or prerequisite principle **and** the particular misconception/action. Several mistakes may relate to one step; distinguish arithmetic slips from an incorrect method. Consequences of earlier mistakes are not additional independent errors. Do not mark a valid alternative solution wrong merely because it differs from the model sequence.

For example, a question with ratio 2:3, labels red/white paint, total 20 litres and requested white share can reference “Share a total in a given ratio”. That method covers labelled setup, counting five parts, dividing 20 by five, multiplying one part by three and checking the total/ratio. These facts can also drive the bar diagram and contextual hints. “Given one share, find the other” is a distinct method: its known amount corresponds to that share's parts, not the sum. The author should not maintain separate copies of these calculations throughout a record. This is an illustrative design, not an adopted file schema.

### Ordered work and review boundary

1. **User review of existing teaching comes first.** Review `website/static/data/<topic>/method.json`, linked `concepts.json` and representative demos/questions. Map existing questions to taught methods across stages and challenge levels. Identify unclear links, missing prerequisites, incomplete methods and genuine teaching gaps; a question outside coverage needs resolution rather than a nominal reference.
2. **Refine teaching from that review.** Each method needs explicit initial writing/construction, guidance on choosing the approach, actionable steps with reasons and a meaningful final check. Separate genuinely distinct approaches. Check representative demos, including harder variations and decision points, against the revised sequence. Method review may identify links now, but settle teaching before converting banks.
3. **Pilot shared definitions in one topic, preferably ratios.** After the review/refinement, implement canonical question facts, reusable methods/step links, defaults and readable overrides. Demonstrate that changing a quantity once or improving a shared explanation once updates the appropriate working, visual and support without search-and-copy maintenance. Check both author readability and learner presentation before wider rollout; the exact schema remains to be designed.
4. **Extend across topics with coverage checks.** Automatically validate method/step/prerequisite references, parameters, required support and mathematical consistency. Human review must establish that teaching actually equips learners for each question, hints help and diagnostic choices are plausible; structural validity alone cannot certify teaching quality. Preserve stable question IDs, accepted mathematics and current progress. Require exact expansion equivalence for representation-only changes; separately review and record intentional teaching/content corrections.
5. **Reassess delivery packing after authoring improvements.** The user generally supports generated repeated-value/layout packing, bundled dictionaries and on-demand resolution, but authoring simplification takes priority. Keep any delivery codec out of editable author content; maintain cheap selection metadata and bounded resolved-question retention. Measure resulting raw/compressed size and browser behaviour instead of assuming byte savings imply speed or heap improvements. Reuse the existing architecture; a larger session-coordinator split remains a separate discussion.

Retired definitions are superseded questions, not learner results. They are excluded from new draws; saved pages containing their IDs are reset while recorded results remain. Keeping full historical definitions in source while delivering only retired IDs is an agreed direction to investigate with consumer checks, not permission to delete archives or scores. Earlier packing experiments reduced 3,377,510 raw bytes to 1,911,890 with generated repeated values/object layouts, or 1,664,669 with retired IDs only as well. These are temporary prototype measurements, not production code or browser-performance evidence; remeasure after authoring changes.

This plan does not authorise deployment, legacy regeneration, replacement of manually refined content from old generators, or edits to protected user-authored specifications. [HANDOFF](../HANDOFF.md) records the current resume point and verification; [DEV_LOG](../DEV_LOG.md) records the dated decisions.

## Optional topic-page modes — TODO, 16 October 2026

Both proposals below were explicitly deferred by the user. Neither is implemented; current selection/restoration remains unchanged.

- **Random draws without repetition:** for each topic/stage/challenge level, draw from the complete eligible pool, randomise order, and exclude questions selected for earlier pages until the pool is exhausted. Keep assessment's balanced two-per-level sampling. Restoring a page preserves its questions, order, answers and working; a new page or explicit retry is the draw boundary. Agree the optional-mode control, cycle reset, adaptation and authored Practice-set interactions before implementation. Assessments already randomise when started but do not maintain an unused pool across reassessments.
- **Advance after 100%:** if a student completes a page at a stage with 100%, open the next page first on their next visit to that stage. After the final page, **wrap around to the first page**, as explicitly decided by the user. Preserve earlier pages/answers for review. Advance once per qualifying completion/visit transition, not repeatedly on rerenders or reloads. Establish the precise visit boundary and how repeated cycles interact with retained completed attempts when implementing. This is an optional ordinary-topic navigation mode; assessment locks and authored Practice sets retain their own rules unless separately changed.

Test stage/level/learner isolation, saved-state restoration, no random repeats before exhaustion, the 100% threshold, once-only advancement, final-to-first wrap, and unchanged scoring/history. No progress migration or automatic reset is authorised by these TODOs.

### OneDrive cloud sync on iPhone — 17 October 2026, next requested slice

The user wants ongoing OneDrive sync on iPhone, not only export/import. Current file-handle autosave writes to a local synced folder; Safari cannot provide that persistent folder picker. Its export instructions are a fallback, not fulfilment of cloud sync.

The user confirmed keeping GitHub Pages and pursuing browser-based OneDrive sync. A static browser app can use Microsoft's MSAL browser library with authorization-code/PKCE sign-in and Microsoft Graph. A VPS is not required. A custom domain is optional; register the deployed HTTPS return URL and update/add the domain's redirect URI if hosting changes. Prefer delegated `Files.ReadWrite.AppFolder` access to `Apps/<registered app name>`; Microsoft's current documentation supports both school/work and personal OneDrive. This is a different location from the existing local `Maths` folder, so the connection flow must explicitly handle existing progress files.

Before implementation, obtain the app registration's public client ID, supported account scope/tenant and registered redirect URL; no client secret belongs in the website. College policy may require administrator consent. Define when cloud reads/writes run, how existing local profiles link to the signed-in account, and how newer remote progress is reviewed. Preserve the current conflict/ownership protections, offline browser copy and explicit replacement review. Sync can run while the site is open and resume on return; do not promise background work after Safari closes.

References: [Microsoft browser authentication flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow), [OneDrive app folders](https://learn.microsoft.com/en-us/graph/onedrive-sharepoint-appfolder). No cloud integration or hosting migration has been implemented.
