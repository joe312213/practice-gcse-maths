# Expressive authoring, cohesive teaching and derived content

Discussion consolidated on 23 October 2026 and updated with agreed direction on 24 October 2026. The filename preserves the user's requested name; a shorter suggested filename is `expressive_authoring_and_cohesive_teaching.md`.

## Purpose and status

Make mathematics content convenient to author, expressive to present and coherent to teach. Authors should define facts and shared explanations once, then reuse them across questions, methods, concepts, demonstrations, hints, feedback and error investigations. Reduced download size is a benefit, but cannot substitute for reduced author effort.

This document records the user's concerns, agreed principles and subsequent proposals. It is a design brief, not an implemented schema or authoring manual. **Paused at the user's request after documenting the plan on 24 October: do not begin detailed planning or implementation until the user resumes.** Sections 9–14 record the latest agreement and supersede earlier format/pilot suggestions where explicitly noted.

| Status | Scope |
| --- | --- |
| Implemented | Readable phrase references, topic/stage defaults, dictionaries shipped with topic content, references to demo questions, and expansion of selected questions with bounded caching. See the [current authoring guide](../website/static/data/README.md). |
| Agreed direction | Define question facts once; reuse reviewed teaching methods; link working, concepts, hints and error explanations; prioritise author convenience over token counts; review teaching before converting banks. |
| Agreed prototype direction, not implemented | Solving-equations and ratios prototypes; shared `given`/`find` question forms and constrained parameter variation; Tiptap rich authoring; reviewed methods and mistakes; SQLite authoring storage with structured JSON fields; compare prepared SQLite banks with JSON delivery. |
| Candidate dependency | mathjs behind a narrow computational interface; suitability for the required expression and equation families remains to be tested. |
| Superseded suggestions | Markdown as the primary authoring interface, choosing only one of the ratio/equations pilots, and assuming JSON must be the learner delivery format. |
| Undecided | Exact grammar, schema, supported operations, editor extensions, generation/selection algorithms, revision preservation, final delivery format and detailed prototype acceptance cases. |

The teaching-review prerequisite in the [earlier roadmap sequence](WEBSITE_PLAN.md#teaching-methods-and-simpler-authoring--agreed-sequence-18-october-2026) remains applicable; the [24 October roadmap update](WEBSITE_PLAN.md#structured-authoring-prototypes--agreed-direction-24-october-2026) records the revised scope and pause. The user's solving-equations review is not assumed complete. This document does not authorise bank conversion or replace that review. [HANDOFF](../HANDOFF.md) records current work; [DEV_LOG](../DEV_LOG.md) records dated implementation evidence.

## 1. The author's problem

The user expects roughly 200–300 questions per topic, plus spot-error options, demos and explanations. Their comparison is with writing similar material in PowerPoint: using structured content should reduce typing, copying, searching and coordinated edits, not increase them. The user's estimate of less than approximately 500 KB of human-written text is a useful challenge to duplication, not a fixed technical size limit.

Inspection confirmed repeated mathematical information in current records. A ratio question can separately maintain its question wording, answer, general calculation model, ratio-specific model, worked steps, diagram, hint parameters and check. Some investigation records repeat the same repair reference and parameters as feedback. Compression conceals much of that repetition in downloads without removing it from author maintenance.

The key acceptance question is: **can an author change a quantity once, or improve a shared explanation once, without finding and editing several copies?**

## 2. Organise content by responsibility

These are logical responsibilities, not a requirement to create one file per item. Keep related content easy to navigate; avoid replacing duplicated prose with excessive indirection.

| Content | Owns | Reuses or derives |
| --- | --- | --- |
| Question definition | Stable identity, mathematical facts, context, units, requested result and applicable level | Applicable methods, concepts and standard wording |
| Teaching method | Applicability, approach choice, setup, ordered steps with reasons, and final check | Concepts, prerequisite skills and deterministic mathematical operations |
| Method step | Stable identifier, intended action and teaching purpose | Step-specific hints, narration and diagnostic support |
| Concept | Meaning, explanation, examples and useful visuals | References from methods, questions and error explanations |
| Misconception/error type | What is misunderstood, applicable steps/principles and corrective explanation | One or more reviewed rules for constructing representative mistakes |
| Error rule | Preconditions, precise incorrect action and how its consequences develop | Correct method operations, misconception definition and feedback templates |
| Demo | Choice of question, approach and any special emphasis | Question facts and reviewed method; narration overrides where needed |
| Investigation specification | Question or selection constraints, intended concept/error and optional location | Wrong working, targets, correction choices and corrected solution |
| Shared prose/defaults | Repeated complete phrases and predictable settings | Named values from the owning definition |
| Rendered content | Student-facing working, diagrams, tables and support | The definitions above, with explicit authored exceptions |

A mathematical expression's meaning must be distinct from its display notation. Calculation, error injection and target selection should use structured expressions/operations rather than editing substrings of rendered text.

## 3. Reusable methods must be the methods actually taught

Each topic should have a small, sufficient set of methods, introduced in Learn the method and demonstrated in examples. Questions should identify their applicable methods and prerequisites. Working, hints and feedback should refer to stable steps in those methods.

Methods need explicit first actions: what to write, draw or arrange, including dimensions where applicable. They should explain approach choice, each action and its reason, simplification, and a meaningful final check. For equations, this includes setting out the equation and dividing line, maintaining equality, simplifying each side, and checking in the original equation.

There may be several valid paths. A longer route is not automatically wrong. Teaching should explain when another approach may be easier, and marking should not reject a valid alternative because it differs from a demo.

### Example: sharing a total in a ratio

Earlier illustrative source, not an adopted schema. The 24 October direction replaces topic-specific fields such as `ratio` and `total` with a common mathematical vocabulary; this example retains the original demonstration of shared facts:

```yaml
method: share-total-in-ratio
ratio: [2, 3]
labels: [red paint, white paint]
total: 20
unit: litres
find: white paint
```

The reviewed method supplies labelled setup, counting five parts, calculating 20 ÷ 5 = 4 litres per part, finding 4 × 3 = 12 litres of white paint, and checking both shares against the total and ratio. Those facts can also supply bar-diagram values and contextual hints.

“Given one share, find the other” is a distinct method: the known quantity corresponds to that share's parts, rather than all parts. Reuse should preserve such teaching distinctions.

A hint prompts thinking, a demo shows an action and corrective feedback explains a mistake. Their shared meaning does not require identical wording. Authors need readable overrides for distinctive contexts, explanations, steps and valid approaches.

### Coverage and diagnostic links

Map existing questions to the taught methods before changing representation. Unmapped questions may reveal unclear references, missing prerequisites, incomplete methods or genuine teaching gaps.

Link diagnostic options to both a method step or prerequisite principle and a particular misconception/action. Several mistakes can occur at one step. Distinguish arithmetic slips from choosing the wrong method, and distinguish consequences of an earlier error from independent mistakes.

Automatic checks can establish that references and parameters are valid. Human review must establish that the teaching actually prepares the learner, hints are useful and diagnostic alternatives are plausible.

## 4. References and defaults without token soup

- Prefer complete shared phrases, coherent methods and named parameters over fragments, incidental numbers or arbitrary matching words.
- Consider the entire reference syntax, including parameters. A reference longer than its replacement can still be justified by maintaining an important explanation in one place; size alone is insufficient justification.
- Keep defaults shallow and predictable. Topic/stage instructions and standard support belong at an appropriate shared level; specific content overrides them explicitly.
- Feedback may default to the accepted repair explanation when the wording and purpose are genuinely the same. Allow separate feedback where it needs to explain more.
- Reference existing questions and methods for demos rather than copying their working.
- Do not force distinctive questions into generic wording or require authors to reconstruct prose from many tokens.

An important current boundary is that IDs, selection metadata, operands and answers remain literal under the implemented format. Deriving answers from canonical facts is a future design change requiring validation; this discussion does not silently change the current contract.

## 5. Expressive text, mathematics and structure

The user requires clear mathematical notation, including a visible distinction between variable x and multiplication, plus bold, italic, bullet lists and tables with split or merged cells.

The 23 October recommendation was familiar Markdown for prose, explicit maths expressions, readable content references and a small set of structured additions. On 24 October the user agreed Tiptap rich editing as the primary interface instead (section 10). The earlier example illustrates the required expressiveness, not the adopted storage or editing format:

```markdown
**Keep both sides equal.**

To remove the coefficient in \(3x = 12\):

- Divide **both sides** by 3.
- This leaves \(x = 4\).
- Check: \(3 \times 4 = 12\).
```

This syntax is illustrative. Do not infer whether a plain letter x means multiplication. Mathematical identifiers and operators should have distinct semantics and suitable typography. Fractions, powers, brackets and units need consistent treatment across prose, working, diagrams and feedback.

MathML is a possible rendering target, not something authors should have to type. Its identifier/operator distinction supports this direction. Library choice, supported input notation, fonts and accessibility still require evaluation. See [MathML Core](https://www.w3.org/TR/mathml-core/).

Ordinary tables can use a familiar simple syntax. GFM tables do not support merged cells, so a structured table block should support row/column spans, headers, captions and rich cell content. Splitting is represented through the underlying grid and spans. Validate overlaps and missing cells, and preview complex tables on narrow screens. See the [GFM table specification](https://github.github.com/gfm/#tables-extension-).

The earlier source-format comparison is superseded by rich editing and structured storage. Avoid requiring authors to maintain prose inside heavily escaped JSON strings. Provide one consistent rendering approach across content types, and useful authoring errors identifying the record, field or expression location and expected names. The recent `concent`/`concept` typo illustrates why `Invalid method concept: undefined` is insufficient feedback.

Do not expose arbitrary executable code as an authoring requirement. Static prose can be parsed/prepared during the build; dynamic mathematical content can be resolved when selected. A preview should show the resulting learner view and make shared definitions/overrides discoverable.

## 6. Derive spot-error content from reviewed rules

The user's proposal is to specify a question or question level, concept being tested, error type and location, then derive the investigation at client runtime. Authors should be able to specify only some constraints and have sensible compatible choices made for the remainder.

Recommended illustrative specification:

```yaml
question: equation-example-12
method: divide-common-factor-first
concept: equivalent-equations
error: divide-only-some-terms
location: divide-both-sides
```

For the question `3x + 6 = 21`, the correct division step is `x + 2 = 7`. A reviewed error rule can produce `x + 6 = 7`, then continue consistently to `x = 1`. The correct solution is `x = 5`.

From this specification, the system could derive wrong working, neutral selectable targets, an explanation that every term must be divided by three, compatible alternative explanations, corrected working, the accepted answer and a link to the taught step. Subtracting six from the already incorrect equation is a consequence, not a second independent method error.

A misconception is not itself an algorithm. Each executable error rule needs explicit applicability conditions and a reviewed mathematical transformation. One misconception may require several rules for different methods. Generation should use deterministic operations and authored explanations, not invent teaching prose at runtime.

### Selection when details are omitted

Explicit author choices take precedence. Fill omissions from compatible questions, methods, steps and error rules, respecting level, prerequisites and intended concept. Selecting an existing reviewed question is distinct from generating new operands; the latter would need its own constraints and review.

An impossible combination should produce a useful authoring error rather than silently test something different. Define how ambiguity is resolved, how variety is balanced and what runtime fallback is permitted when no eligible candidate exists. These policies are not yet decided.

### Reliability requirements and issues

- Verify that the injected mistake actually changes the mathematics. Some values make faulty rules accidentally correct or hide their effect.
- Avoid impossible operations, unintended difficulty and unrelated extra mistakes. Support deliberate multiple independent errors only through an explicit design.
- Ensure the displayed evidence supports the intended diagnosis; a partial division could otherwise look like a copying error.
- Make distractors plausible, distinct and applicable to the displayed working. Reject duplicate or simultaneously correct explanations unless the task intentionally accepts them.
- Preserve neutral selectable correct regions as well as erroneous ones; target placement must not reveal the answer.
- Save enough identity, resolved choices, rule versions and random state to reproduce an attempt. A seed alone is insufficient if the rules later change. Decide between retained definitions, snapshots or another explicit preservation strategy.
- Validate with independent mathematical checks and human teaching review; agreement between a generator and its own calculations is insufficient evidence.
- Bound generation work and keep restore/navigation responsive. Generate selected questions on demand, not the full space of possible variants.

## 7. Delivery size, memory and historical content

Ship the required dictionaries/references together with the relevant topic content. Load only needed topic banks and cache unchanged content. Expand selected questions rather than eagerly retaining every expanded record; this can reduce retained derived content, but actual heap savings require measurement.

Author readability and delivery encoding have different purposes. A build may pack repeated values and object layouts automatically without exposing opaque codes to authors. Such packing remains secondary to eliminating duplicated author responsibilities. Measure raw bytes, compressed bytes, added generator/rendering code, startup time and memory together; a smaller bank alone does not establish an overall improvement.

Earlier temporary experiments showed substantial raw reductions from generated packing, with smaller compressed gains. Their measurements and limitations are in the [roadmap](WEBSITE_PLAN.md#teaching-methods-and-simpler-authoring--agreed-sequence-18-october-2026). They are not implemented codecs or browser-performance evidence.

Retired definitions are superseded questions, not learner results. They are excluded from new draws. Retirement detection may need only IDs in ordinary topic delivery; complete historical definitions can remain in the repository for their consumers. Check those consumers before changing delivery. This is not permission to delete archives, erase scores or make authors maintain old questions alongside current content.

## 8. Sequence and acceptance criteria

1. Continue the user's review of existing methods and concepts, initially solving equations. Establish clear setup, approach choice, steps/reasons, checks and coverage across levels.
2. Map questions, demos, concepts and error types to the reviewed methods and prerequisites. Resolve teaching gaps before converting banks.
3. After the explicit pause is lifted, plan concrete authoring examples and previews for **both solving equations and ratios**, as agreed on 24 October. Detailed sequencing and example selection remain for that later planning session.
4. Pilot canonical facts, reusable methods, rich explanations and controlled error derivation with explicit overrides. Demonstrate reduced author work before broad migration.
5. Validate structural links and mathematical behaviour, then review teaching and presentation. Preserve stable question IDs, accepted mathematics, provenance and current progress. Representation-only conversions require equivalent output; intentional teaching changes need separate review and records.
6. Compare prepared SQLite banks with JSON delivery during the prototype before selecting the delivery format. Extend only after the author and learner experience is satisfactory; further bespoke transport packing remains secondary.

Success means fewer coordinated edits, readable source and useful diagnostics; consistent taught methods and feedback; expressive, accessible learner content; reproducible and valid investigations; and measured delivery benefits without slower interaction. No framework replacement, deployment, legacy regeneration or protected-specification edits are implied by this document.

## 9. Shared question forms and constrained instances — agreed 24 October

The longer-term destination is a family of educational apps with a custom DSL and Tiptap-based rich authoring. This Maths prototype should field-test useful authoring behaviour and preserve organised, migratable content without making completion of the full GoLearn DSL a release dependency.

The agreed model is **challenge level → question forms → parameter rules → specific instances**. A level can contain several forms; an exemplar is a concrete, optionally pinned instance. The author defines the form and its permissible variations, rather than maintaining many separately authored questions.

Use a common vocabulary across topics: symbols/quantities with labels, units and domains; parameters; given facts and relationships; requested results (`find`); response requirements; methods; and concept/mistake references. Avoid topic-specific authoring schemas such as `ratioModel`. Topic-specific teaching sequences and visual renderers may still interpret the common facts differently.

Illustrative notation only; this is neither a final grammar nor directly executable mathjs syntax:

```text
form:
  given a*x + b = c
  find x
vary:
  a: integers from 2 to 9
  b: integers from 1 to 12
  c: integers from 10 to 80
require:
  c > b
  c - b is divisible by a
  2 <= (c - b)/a <= 12
```

The ratio equivalent can express `given red : white = 2 : 3`, `given red + white = 50 L`, and `find white`, with labels and quantity metadata defined through the same controls. Exact ratio/unit parsing remains undecided.

Keep three responsibilities distinct: parameter domains specify available values; relationship constraints specify acceptable combinations; selection rules balance forms and variety across a set. Valid individual instances alone do not guarantee a useful set. Challenge depends on signs, fractions, brackets, method choice and operation count as well as numerical size.

Support derived parameters as well as rejection of unsuitable combinations. For example, choose a coefficient `a`, constant `b` and intended solution `s`, then derive `c = a*s + b`; `s` is generation information, not learner-visible working. Generation must be bounded and reproducible. Never silently discard restrictions after exhausting retries: report the failure or use an explicitly approved instance satisfying the same restrictions. Final selection/fallback policies remain for detailed planning.

mathjs is the candidate computational library, behind a small interface for the supported parsing, arithmetic, units and symbolic operations. The educational layer owns equations/ratios, `given`/`find`, parameter roles, teaching paths and response contracts. Do not assume the library supplies a complete pedagogical solver. Mathematical equivalence and satisfying the requested answer form are separate checks, for example an equivalent fraction versus a fraction in simplest form.

## 10. Tiptap authoring and review workflow — agreed direction

Use Tiptap as the primary rich authoring surface, including at least method steps and concepts, with the same capabilities available for prompts, hints and error explanations. Store structured rich documents; support a small documented set of mathematical expressions, parameter/quantity references, concept links, step references, answer targets and visual/demo nodes. A computable expression should have one mathematical source from which its display is derived, rather than separately maintained LaTeX and calculation strings.

Adapt GoLearn's three-panel workflow to the existing Maths styling and accessibility requirements:

| Area | Intended role |
| --- | --- |
| Outline | Topics, challenge levels and question forms; shared methods, concepts and mistakes |
| Editor | Selected definition, with question, variation, teaching, and answer/mistake controls where applicable |
| Preview and checks | Generated instances, learner views, resolved values, marking explanations and actionable diagnostics |

Expose advanced expression controls progressively. Provide autocomplete and navigable references, identify inherited content and overrides, and show which forms are affected by a shared edit. Preserve incomplete drafts with repair notices; only validated, approved content enters learner delivery. Local saving/import/export is in scope for later planning; sophisticated sync is excluded.

The author test workflow should generate a varied sample, explain chosen/derived values and rejected combinations, pin exemplars, test correct/equivalent/wrong answers, preview working/hints/visuals/investigations, and inspect boundary cases. These are intended capabilities, not implemented UI or a fixed test count. Sample-based checks must not be represented as exhaustive guarantees.

Methods combine stable steps, applicability/choice, executable actions and rich explanations. Mistakes and reasons have separate stable identities; suggest compatible reasons and distractors but allow author edits and review. Edited wording must still accurately describe the generated evidence and avoid overlapping truthful alternatives. AI-assisted enrichment may propose content for review; accepted edits remain authoritative and normal builds must not overwrite them.

Animated SVG and demos should bind quantities and stages to the instance and method. Start from existing Maths renderers and playback where suitable; a general animation editor is outside the initial scope. Exact Tiptap extensions, mathematical input controls and rendering libraries remain undecided.

## 11. SQLite authoring storage — agreed direction

Use SQLite for identifiable content, shared relationships and coordinated authoring edits, with JSON inside records for rich documents and expression structures. This is an architectural direction, not an agreed table schema or implemented migration.

Likely independently identified content includes topics, challenge levels, forms, methods, referenced steps, concepts, mistakes, reasons and pinned exemplars. Relationships support queries such as which forms use a method, what a concept change affects, and which coverage is missing. Tiptap document trees and form-owned parameter/constraint structures can remain validated JSON; do not normalise every formatting mark or mathematical operator into a row.

Use database constraints and transactions for structural integrity, plus application validation for mathematics, expression syntax, rich-document references and teaching requirements. An index of links embedded in rich documents may be derived on save, avoiding duplicate author maintenance. Incomplete drafts and validated release dependencies need distinct handling.

The working database owns editor changes. Deterministic readable exports should support Git review, recovery and later migration, with explicit import rather than competing editable file/database copies. Stable content identity, schema versions, content revisions and enough resolved instance information to preserve saved meaning are required; exact revision/snapshot strategy remains open. Do not introduce a general history/version stack or copy GoLearn's full persistence model.

A local service accessing a SQLite file was recommended as the simplest initial developer-operated authoring host. That host choice is still to be settled during detailed planning; it is not an agreement to require a server for learner use or to adopt browser SQLite persistence. Existing learner progress stays separate and preserved.

## 12. Learner delivery: evaluate SQLite banks alongside JSON

The user agreed to revise the initial JSON-only recommendation. **Prepared SQLite database files are a first-class delivery candidate.** Compare them with generated JSON using the same approved prototype content and realistic access patterns before selecting a format.

Distinguish exported query results (for example JSON), SQL scripts containing schema/inserts, and prepared `.sqlite` database files. Prefer a prepared database when evaluating SQLite delivery; rebuilding an unchanged bank from SQL statements adds runtime work without an established benefit.

A static bank may be fetched into an in-memory browser SQLite instance. This does not inherently require writable OPFS databases, sync or a server database. It remains separate from learner progress. Selective SQL queries can avoid expanding all records into JavaScript objects, but loading a whole database still uses memory and does not imply selective network downloads.

Compare compressed transfer size including added engine code, cold and cached startup, browser memory including WASM/database allocations, query/materialisation costs, topic loading/cache behaviour, implementation effort and query reuse between authoring and learning. Include supported-browser behaviour in the evaluation. No measurements or performance advantage are established yet.

Both formats require content revisions and schema/version identification. Released packages contain approved content and required dependencies; they need not contain authoring drafts or review state. Keep preview and learner mathematical behaviour consistent regardless of transport. Further bespoke compression remains secondary to author convenience and release readiness.

## 13. GoLearn evidence and adoption boundary

Read-only review on 24 October used the sibling checkout at `/Users/joehudson/Dev/golearn`. Paths below are relative to that checkout and are provenance pointers, not dependencies required to build Maths.

| Source | Relevant finding |
| --- | --- |
| `planning/agent_instructions.md`, `planning/agent_playbook.md` | Small, discussed increments, explicit responsibilities and honest verification |
| `planning/shared_app_family_features.md`, `planning/overview_docs/user_journeys.md` | Shared question/workset concepts; visual authoring, guidance, templates and learner preview |
| `app/src/lib/components/Editor.svelte` | Implemented rich text, images and tables exchanging HTML; inspected component has no mathematical DSL nodes or execution |
| `app/src/routes/teacher/specs/create/+page.svelte`, `app/src/lib/components/ui/PanelsLayout.svelte` | Useful outline/edit/settings layout and selection/reordering; preview/template/structural undo controls are partly placeholders |
| `planning/allium/checkpoint_qm_dsl_allium_spec_v0.allium` | Provisional normative template, token-source, constraint, stable answer-ID, variant and phase model; some operations remain abstract |
| `planning/allium/checkpoint_qm_dsl_resume_2026-04-26.md`, `DEV_LOG.md` | Latest recorded cleanup pause: 189 unused-field diagnostics reviewed in 59 groups; sparse references had risked removal of meaningful metadata/boundaries |
| `planning/quint/qm_dsl_handoff.md`, `planning/rust/qm_dsl_mapping_notes.md`, `packages/golearn-qm-engine/quint/` | Behavioural models and implementation guidance; no implemented parser/evaluator found in the inspected engine package |
| `planning/old_tokens_variants_automarking.md` | Historical source of progressive disclosure and teacher test-mode ideas; later normative decisions take precedence, and unconstrained fallback is rejected for this prototype |

Borrow stable identities, separation of templates/instances/rendering/marking, subject helper boundaries, test mode and repairable drafts. Do not claim the Maths model is already a compatible subset: map its concepts to GoLearn and explicitly record gaps. Do not copy Allium entities mechanically into SQL or code.

Defer the full DSL, shared mutable state, cross-question dependency orchestration, complete mark grids/rubrics, configurable attempt/submission/publication lifecycles, general print-format language, accounts/content network, native/Rust/WASM engine migration and sophisticated sync. Completing GoLearn's Allium cleanup is not a Maths release prerequisite. This review did not run either application, the Allium MCP, or model checks.

Reference documentation consulted during discussion: [Tiptap custom extensions](https://tiptap.dev/docs/editor/core-concepts/extensions), [JSON storage](https://tiptap.dev/docs/guides/output-json-html), [mathematics rendering](https://tiptap.dev/docs/editor/extensions/nodes/mathematics), [mathjs functions](https://mathjs.org/docs/reference/functions.html), [expression syntax](https://mathjs.org/docs/expressions/syntax.html), [SQLite JSON](https://www.sqlite.org/json1.html), [foreign keys](https://www.sqlite.org/foreignkeys.html), and [browser database loading](https://sqlite.org/wasm/doc/trunk/cookbook.md).

## 14. Prototype outcomes, later sequence and explicit pause

The agreed initial topics are **solving equations and ratios**, using the same authoring vocabulary and controls. Detailed example counts, level coverage, question selections and implementation order are deliberately not settled in this record.

After the user resumes, the logical work slices are:

1. **Teaching and scope review.** Confirm the outstanding method/concept review, choose representative forms and valid alternative approaches in both topics, and agree concrete usability/teaching acceptance cases. Outcome: a small reviewed content basis; no broad bank conversion.
2. **Bounded design.** Specify the shared vocabulary, supported mathematics, storage boundaries, editor behaviour, saved-instance identity and GoLearn mapping. Decide authoring host, generation failure/selection policy and dependency choices. Outcome: a concrete implementation plan for review, not the full platform DSL.
3. **End-to-end prototype.** Author/edit forms and shared rich teaching, generate constrained instances, preview/render, answer/mark, save and restore. Reuse existing learner flows and visuals; prove that one fact/explanation edit updates dependent content and survives an editor/storage round trip.
4. **Derived teaching and investigation.** Exercise shared steps, concepts, hints, visuals and at least one reviewed mistake rule with editable identifiable reasons. Check applicability, alternative answers, consequential errors and ambiguous diagnoses through independent mathematical checks and human review.
5. **Delivery comparison and release decision.** Evaluate prepared SQLite banks against JSON from the same content. Select the format from evidence, then decide prototype release scope and any wider migration. Release readiness and author field testing take priority over completing the full DSL. Deployment still requires the normal publishing scope/authorisation.

Acceptance should demonstrate common authoring across both topics, fewer coordinated edits, useful errors, mathematically valid and appropriately varied instances, faithful rich content/visuals, accurate marking, reproducible restoration and preserved existing IDs/progress. Representation-only imports require equivalence checks; intentional teaching changes need separate review. Generated candidates must not overwrite reviewed content silently.

**Current stopping point: plan documented only.** No schema, parser, database, editor, generator, benchmark, content conversion or dependency installation has begun. Wait for the user's explicit resumption before detailed planning or implementation. The earlier teaching-review prerequisite remains open; agreement on architecture is not final pedagogical approval.
