# Spot-error content and review

The 360 authorised questions are integrated into the live topic banks: 36 per topic, three four-question pages at each of Start, Build and Confidence. All 76 agreed misconception families appear; lattice reversed digits are included within wrong products. The former candidate JSON copies have been retired so there is one editable source per topic across all stages.

## Edit and review

Use the topic bank links and field guide in [the website README](../../website/README.md#editing-learn-the-method-and-topic-content). Edit `website/static/data/<topic>/spot-errors.json`, whose questions have `type: "errors"` and `investigation: true`. Do not edit `retired-questions.json`: those published definitions remain historical references; saved pages containing them automatically restart with current content. New questions have distinct namespaced R2 IDs. Ordinary builds never generate or overwrite the banks.

From the repository root:

```sh
python3 scripts/review_spot_error_drafts.py --html website/test-results/spot-errors-review.html
```

The historically named tool now reads the live banks directly. It validates exact answers, coverage, question/page counts, references, available arithmetic traces and topic-specific level/variety guards in `scripts/spot_error_quality.py`, and optionally writes a disposable teacher review HTML. It cannot generate or replace questions. Filter the review by topic/level and expand diagnoses/corrections. Edit the JSON source, never the HTML. New generation scripts must write separate candidates and may replace reviewed/manual content only after an explicit replacement request.

## Data contract

- `locations`: ordered meaningful regions, including correct and incorrect working. IDs express mathematical roles, not screen coordinates. Whole working lines are the default outside spatial methods; finer regions distinguish independent mistakes.
- `options`: ordered stable choice IDs referencing named reason templates in the topic’s `error-types.json`. See the [reference syntax](../../website/static/data/README.md#editing-error-types-and-reasons). Labels/order must not disclose correctness.
- `errors`: independent faults with misconception IDs, accepted choice ID and named feedback reference. `error-types.json` specifies each misconception and its accepted repair names. `consequences` identifies later wrong values that are not additional faults to select.
- `diagram`: authored lattice cells/diagonal contributions or bus-stop columns/transfers where supplied. Bus-stop columns link to `locations` by `workingLocation` and `transferLocation` IDs, so editing a displayed label cannot break selection. The generated diagram and readable working details show the same authored values. Other questions use named selectable working lines.
- `answer`, `answerUnit`, `correctWorking`, `hint`: final answer and review content. `answerCheck` independently verifies exact rational arithmetic or final two-decimal-place rounding.
- `level`: 0 = Start, 1 = Build, 2 = Confidence. `page` groups four questions, with three pages at each level. Single/multiple independent mistakes are mixed; the UI never preallocates a known error count.

The [authoring process](../../docs/SPOT_ERRORS_PROCESS.md) remains authoritative for misconception review, realistic wrong working, distractors and causality. Automated checks do not certify every pedagogical choice or physical-device/assistive-technology experience.

## Interaction

Click/tap or keyboard-activate a region, choose a reason, then select another region as needed. Recorded diagnoses remain editable/removable. Activating a highlighted region removes it. **Choose by location** reveals the optional dropdown, hidden by default. Check submits the selected set and corrected answer together using the existing practice scoring and submission rules. Submitted responses remain locked; subsequent practice uses a new attempt.

The working canvas remains beside the question at the existing 650px question-container breakpoint, and stacks on narrower panels. Large lattice diagrams scroll within their own paper when necessary to preserve selectable target size. Prototype fixtures remain separate development examples at `/spot-errors.html`, not duplicate live questions.
