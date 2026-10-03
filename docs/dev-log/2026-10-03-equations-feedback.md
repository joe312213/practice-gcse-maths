# Equations draft feedback — 3 October 2026

Status: implemented and checked locally. Awaiting review of the revised draft. User has reviewed the first draft and authorised these changes. This entry supersedes the earlier “review deferred” checkpoint for the affected features.

## Requested changes

1. Initial assessment: remove Learning practice and repeat-page cards. Across all pages, question selectors must not shrink below 210px in a two-column layout; omit routine question challenge labels. Review selector semantics.
2. Method review: retain challenge selection; explain the aim of gathering the variable on one side and finding one x. Tailor guidance to challenge level, with fewer/simpler steps at Start. Annotate each chosen operation, including expansion/common-factor simplification. Make Play the primary control for a complete animation; previous/next/end secondary.
3. Guided practice: level-specific guidance; hide routine question-level labels. Paper-working checkbox collapses the working tools and restores them when unchecked. Each new session starts with the tools visible.
4. Error spotting: for each independent error, select its row, reason and corrected step; separately enter the final answer. Support two errors on Confidence questions. Put row numbers in a separate gutter behind a faint vertical separator. Only label a question's level when promoted above the page's starting level.
5. Independent practice: eliminate the 2–4px layout/answer-field movement when selecting questions.
6. General UI: smaller Not you control; use the T-Level starter site's theming. Add footer About link with author, credits and agent-augmented development information.

## Work plan

- Preserve previous work and the user's existing handoff/plan edits. Record new educational metadata in source, with deterministic bank generation.
- Restore the pinned T-Level reference clone if the temporary checkout has disappeared; reuse its theme controller/tokens/palette controls with a Maths storage namespace.
- Keep native buttons for question selection: they perform an in-page action, not navigation or form submission. Group them as a labelled list, explicitly set type=button, expose the current item with aria-current and announce its question number. Use consistent border widths to avoid layout movement; fall back to one column before cards become narrower than 210px.
- Add authored level-specific guidance, row explanations and structured error corrections. Do not identify errors by comparing two possible solution routes: a valid alternative route is not a mistake.
- Implement cancellable play/pause/replay with secondary stepping, reduced-motion support, and cancellation on changing demo/section/dialog.
- Implement per-session paper mode without hiding its own checkbox or discarding drafts just because the tools collapse.
- Check mathematical marking, multiple errors, animation cancellation, selector dimensions/position stability, assessment behaviour, paper mode, theme persistence and About access. Update the handoff with results and limitations.

## Decisions used during implementation

- Native selector buttons remain appropriate for choosing the active question; this is not a navigation link or a quiz answer choice.
- Error corrections use authored selectable corrected steps. This avoids pretending to accept arbitrary algebraic text without an algebra-equivalence parser. Final numeric answers continue to use exact rational comparison.
- A downstream consequence of an earlier mistake is not counted as a second independent error. Any new two-error examples receive new permanent IDs, leaving existing questions unchanged.
- About credit: Joe Hudson (project author); T-Level starters theme/code reference; development assisted by OpenAI Codex, with teacher review and automated/browser checks. Do not claim institutional endorsement or completed verification of the full site.

## Implemented result

- Assessment has neither Learning practice nor repeat-page card. Completion is a short result with a link into method review.
- Question selectors are native `type=button` controls in an ordered list, with `aria-current` and an associated answer panel. A container query switches to one column before two 210px cards would no longer fit. Borders have a constant 2px width; active styling uses colour/outline. Ordinary challenge labels are removed; automatic promotion can add “Now Build/Confidence”.
- Start/Build/Confidence each have authored aims and 2/3/4 guidance steps. Main demos and the saved recap examples have explanations on every working row. The recap example selector exposes the common-factor shortcut as a playable example too.
- Play runs the full solution in timed reveals; Pause/resume, Replay and secondary Previous/Next/End controls are available. Playback is cancelled when changing example, level, section or closing the reference modal. Reduced-motion preferences are respected by CSS; no autoplay on page entry.
- Paper mode collapses just the drawing/text tools, retaining its own checkbox. Unchecking restores the current draft; reload, profile switch or a new page attempt defaults to visible tools. Old persisted `profile.paper` preferences are ignored.
- Each error has row/reason/corrected-step selections, plus one final numeric answer. All nine original error questions now have explicit metadata. Crucially, `5x + 10 = 45` identifies the error at row 3 (`x + 10 = 9`), not the valid “divide both sides by 5” operation at row 2. Alternative valid methods are no longer labelled wrong merely because they differ from the model solution.
- Added one new Confidence question with two independent errors and a new permanent ID, `maths:M10-SE2-C3-Q1`. Original 94 items remain; total is now 95, including 72 independent questions and ten error examples.
- Row numbers use a separate table header gutter with a faint divider, outside the mathematical working. Per-error feedback distinguishes incorrect row, reason, corrected step and final answer. Duplicate row selections do not score as two errors.
- The T-Level site's exact token CSS, eight paired palettes, light/dark toggle, previews, saturation/background controls and reset are reused from commit `8906225f458372b7238544341e5f293cc67e685a`. Storage keys are Maths-specific; accessible toggle labels are updated dynamically. New supporting About page restores the same theme.
- Compact Not you control and footer About link added. About credits Joe Hudson, the T-Level project and OpenAI Codex assistance, explaining teacher direction, agent-augmented development and the limits of automated/browser checks.

## Content and implementation locations

- `content/M10_web_teaching.json`: authored level guidance, demo/recap row annotations, explicit error metadata/reasons/correction choices and the new two-error item.
- `scripts/prepare_web_equations.py`: validates/imports original content and new metadata into `website/data/equations.json`; the bank revision includes the teaching metadata. Historical results survive; incompatible active pages are reset using the existing revision check.
- `website/teaching.mjs`: table/guidance rendering, deterministic per-error marking and independently cancellable playback controller.
- `website/app.mjs`, `website/styles.css`: page behaviour, selector layout, session paper mode and feedback.
- `website/theme.mjs`, `theme-tokens.css`, `theme-controls.css`, `theme-page.mjs`: adapted reference theme and supporting-page preferences.
- `website/about.html`: credits and development information.

## Verification completed

- **19 Node tests pass**, including exact numeric marking, existing progression rules, actual error attribution, one/two-error scoring, playback lifecycle and annotation coverage.
- Updated CDP browser smoke passes: assessment completion without repeat cards; level-specific guidance; timed Play to completion; reference behaviour; paper collapse/reset and draft restoration; normal promotion/persistence/assistance; per-error marking and two-error form; draft error selections surviving reference use; profile isolation and invalid numeric input.
- Browser measurements across ten unsubmitted independent questions show question-card height and answer-field position varying by less than 0.5px. Width checks at 1380, 1000, 768, 600, 390 and 320px confirm no horizontal overflow and at least 210px per selector whenever there are two columns. Mobile error form checked too.
- All eight palettes, saved adjustments, paired light/dark switching and About navigation/theme persistence checked. Pointer drawing, restore-after-paper-mode and reduced-motion styling checked.
- Desktop method/error pages and mobile theme/reference layouts visually inspected using screenshots under `/private/tmp/maths-*.png`.
- Source/deck audit still reports no basic text/geometry differences across the 67 saved slides. Original PPTX and standalone HTML files were not changed.

## Review notes / next work

- Review the teaching wording and pacing (2.6 seconds per reveal). Timed Play is implemented, but classroom pacing and real touch/screen-reader usability remain to be reviewed.
- For multi-error activities, each corrected step refers to the immediately preceding **displayed** working, without silently rewriting other rows. Students then solve the original equation for the final answer. The UI states this convention; confirm it is the intended pedagogy before expanding the error bank.
- Correction choices are authored selections, not a claim to support arbitrary algebraic text. Other topics will need their own correction formats.
- Theme behaviour matches the reference, including its wide adjustment ranges; exhaustive contrast validation of every slider combination is not claimed.
- Existing open decisions on short-page scoring, aggregate topic progress, Practice-set codes, initial placement and multi-topic storage remain in HANDOFF.md. This feedback work does not implement those unrelated features.
- No deployment or commit was made. Existing handoff/plan edits were preserved and updated; the new revision is ready for local review at http://127.0.0.1:8766 while the preview server runs.

## Follow-up: startup failure, persistent rules and automatic advancement

User reported a refresh stuck at “Loading equations…”, name submission failing while reading `profiles`, and requested the progress explanation become exactly “recent success at this level”. They also required feedback to be persisted as standing UI/UX rules and automatic advancement after a correct answer.

- Reproduced both startup symptoms in the isolated browser by removing theme markup to simulate an older cached page. Theme initialisation previously threw before the profile store was loaded, leaving the name handler active against undefined state. The user's exact cached resource combination was not inspected; this reproduction establishes the failure path.
- Profile storage and equation startup now precede optional theme setup. Theme loading/initialisation errors are isolated, missing controls are checked, and practice remains available with a short warning. Name controls stay disabled until ready, and form submission also checks readiness. Versioned app/theme entry URLs avoid reusing the previous entry modules. Saved browser progress is preserved.
- Progress explanation now reads “recent success at this level”; scoring is unchanged.
- Correct answers advance to the next unanswered question, wrapping when necessary and skipping submitted questions. The new control receives focus and a status announcement confirms correctness. Draft working clears on the change; reference-assisted status carries to the newly visible question. Incorrect/invalid answers and fully completed pages remain in place. Error questions advance only when all required entries and the final answer are correct. Submitted feedback remains accessible by selecting that question.
- Added `docs/UI_UX_RULES.md`, linked as standing requirements from AGENTS.md and web_format.md. It retains all six original feedback groups and these follow-up rules, with verification expectations.
- Validation: 19 Node tests passed; full browser smoke passed with added advancement/wrap/skip/focus/draft checks; focused startup browser regression passed with incomplete markup, a forced theme exception, delayed bank loading, normal cached refresh and unchanged saved profile data. `git diff --check` passed.

Remaining review: teacher review of content/pacing and classroom accessibility remains as above. No commit or deployment.

## Follow-up: CSS and JavaScript quality

User requires CSS and JavaScript to be reusable, modular, clean, minimal and commented wherever possible. Persisted this as an explicit requirement in AGENTS.md and web_format.md, with practical rules in `docs/UI_UX_RULES.md` for shared components, clear responsibilities, readable formatting, avoiding duplication/unnecessary abstractions, and useful maintained comments. Updated the handoff so future work applies these standards to fixes and new features.

Documentation-only change; no runtime code or behaviour changed, and no codebase-wide refactor is claimed. Checked the documentation diff for whitespace errors.

## Maintainability review and theme follow-up

The current code only partially meets the maintainability requirement. Useful boundaries already exist (`engine.mjs`, `profiles.mjs`, teaching and theme modules; separate theme tokens/control CSS), but a focused refactor is needed before further expansion:

1. Format dense JS and CSS into readable multiline source; add responsibility/decision comments. `styles.css` currently packs most rules into a few extremely long lines.
2. Extract drawing/working controls and activity rendering/event binding from `app.mjs`, leaving application orchestration there. Avoid splitting solely to reduce file size.
3. Separate error marking from teaching/demo rendering where reusable; share the duplicated escaping helper and theme preference restoration between interactive and static pages.
4. Organise CSS by shared layout/components and consolidate overlapping responsive rules; preserve theme token provenance and intentional accessibility overrides.
5. Keep scoring, profile persistence and browser behaviour covered during each small extraction. This review does not claim the refactor is complete.

Theme investigation: current code changes all eight rendered page/card palettes in isolated Chrome, including actual pointer selection and normal refresh. The reported failure was not reproduced in that environment. CSS URLs were still unversioned after the theme replacement; versioned CSS and entry scripts consistently on both pages to prevent older cached styling masking new theme choices. Added `scripts/browser-theme.mjs`, checking actual computed page/card colours (earlier tests checked mainly state attributes), pointer selection and refresh persistence; it passes. This is a cache-mismatch remedy, not proof of the user's exact failure cause. No progress storage cleared.

## Framework/build discussion

User confirmed themes now work. Added their requirements for semantic, minimal styling markup, composed component styles and transferable activity boundaries to the standing rules. Tailwind, daisyUI, Bits UI, Vite and a local Git-hook build are under discussion; no framework migration or hook installation has been authorised or performed. Proposed direction: Vite build tooling; evaluate Svelte with Bits UI and scoped semantic CSS; treat Tailwind/daisyUI as optional styling choices. Keep framework-independent learning logic and storage adapters. A local hook can run checks, but the production build should be reproducible from committed source rather than rely exclusively on a local hook.
