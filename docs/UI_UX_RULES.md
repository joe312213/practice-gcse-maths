# Website UI and UX rules

These are ongoing requirements, not one-off draft changes. Consolidated from user feedback through 10 October 2026. Apply to all future topic/activity pages unless an explicit exception is stated. Latest user decisions take precedence.

For layout and visual changes, read [UI taste](UI_TASTE.md) first. It records the user’s recurring spacing and alignment preferences.

## Startup and saved progress

- Optional theme features must not block equations, profiles or practice. A failed theme setup must leave practice usable and give a short recovery message.
- Keep name selection unavailable until the question bank and saved profile data are ready. Never submit a name against an uninitialised profile store.
- Ordinary refreshes, including cached resources, must work. Check startup with incomplete theme markup, a theme exception and a delayed bank request.
- Preserve saved names, history and progress during fixes. Never require clearing browser storage to recover from a UI failure.
- Progress explanation must read: “recent success”. Keep scoring implementation details out of this student-facing text; the scoring rules themselves are unchanged.

## Questions and answer flow

- Question selectors use wrapping flex layout: use up to three columns, then two and one as available width requires, with intrinsic equation width allowing individual longer buttons to occupy their own row at only the required width, centred within that row. Centre each equation in its button while keeping its number at the left. Reserve no empty result column; place result markers at the lower-right. Keep spacing parameters together in the .question-list CSS block. Preserve the restored equation sizes (question cards 1.2rem desktop/1.08rem mobile; selected equation 1.8rem/1.55rem); use spacing and wider cards rather than shrinking text. Keep expressions on one line, and avoid clipping or ellipses. Keep borders, card height and answer-field position stable when switching comparable questions.
- Use native buttons for selecting a question in the current page, within an ordered list. Identify the current question accessibly and connect selectors to the question panel.
- Hide routine per-question challenge labels on every activity. Show a subtle label only when a question has been promoted above the current page's starting level. Keep page-level challenge selection where relevant.
- After a fully correct submission, automatically advance to the next unanswered question when one exists. Search forwards, then wrap to earlier unanswered questions. Skip submitted questions; never create another page automatically.
- Give a brief accessible correctness announcement and focus the new answer control. Restore each selected question’s session working independently. Previously submitted feedback remains accessible via its question selector.
- Completed stages offer a nearby next-stage button, in the learning-path order, with focus moved to the destination heading. Method review also offers continuation; the final independent stage has no artificial next stage. Preserve feedback and optional repeat practice.
- Incorrect or invalid submissions stay on the current question. In error spotting, final answer alone is insufficient: every error entry must also be correct before advancing. Stay on the final submitted question when no unanswered questions remain.

## Activity-specific requirements

- Initial assessment has no Learning practice card, hints/reference, routine challenge labels or “practise another page” card after completion.
- Method review retains challenge selection. Guidance is tailored to challenge: fewer, simpler steps for Start. Explain choosing operations to gather the variable on one side and find the value of one variable.
- Use shared method-independent demo playback with caller-supplied ordered frames and rendering. Equation playback reveals the continuous line first, then each left term, equals sign and right term; operation rows omit the equals reveal. Other methods own their sequence: a lattice demo draws grid/diagonals, numbers, cell products, diagonal sums, then answer/carry digits. Do not bake equation-specific phases into the shared player.
- Annotate demo operations with why they were chosen, including bracket expansion and useful common-factor division. Play is primary; Previous, Next and End are secondary. Retain a static accessible solution and respect reduced motion.
- Selecting demo Play scrolls the playable equation/controls/working into view. If the solution grows taller than the viewport, follow the current step without moving keyboard focus. Provide a compact labelled speed selector, default 1×, remembered per named profile and shared with method references. Explanations stay to the left, with slightly smaller text, a narrow gap and compact row spacing.
- Guided practice uses the same level-specific guidance. Working stays visible; there is no paper toggle.
- Only the scratch pad and typed-working input extend through the working card’s horizontal padding to fill its inner border-to-border width. Keep the standard inset, scaling smoothly from 18px to 24px for headings, labels, buttons and helper text. The default full-width writing surfaces have square corners. Use this full-width style in development and production; there is no field-style selector. Clear drawing is a compact X icon button with a native title tooltip and accessible name.
- Error spotting collects row, reason and corrected step separately for each error, then one final answer. Confidence questions may have two errors. Put row numbers in a distinct gutter separated by a faint vertical line, not beside the algebra as though part of it.
- Identify authored mathematical errors explicitly; do not mistake a valid alternative solution method for an error by comparing it with the model's row sequence.

## Shared presentation

- Hover on an ordinary surface button must retain an opaque surface, lightly tinted with the theme's selected colour: 75% normal surface + 25% `--selection-base`. Never substitute the page background, transparency or `--surface-soft` for this hover state. Shared `.action-button` styling applies this to enabled ordinary buttons; other surface controls opt in with `.hover-tint` and may set `--hover-surface` to their normal background. Keep text/borders stable. Primary, current-step and quiet actions retain their distinct treatments; do not attach `.hover-tint` to selected, marked or disabled controls. Use the same semantic rule across all palettes and light/dark modes, including user-adjusted colours.

- During framework migration, retain the current layout and design closely and match theme colours and gradients exactly, including opacity, gradient stops/directions and adjustment behaviour, except where subsequent explicit refinements in UI taste supersede them. Adapt framework defaults to the existing design. Capture baseline screenshots/computed styles and compare at each stage. Default themes must satisfy accessibility contrast requirements. The user explicitly accepts unrestricted saturation/lightness adjustments to personal preference, even when an adjusted combination reduces contrast. Such adjustment results are informational, not defects or approval gates; do not constrain them or reopen this settled decision.

- Status highlights blend with each element’s normal surface and border rather than uniformly with the dominant theme colour. Question buttons use surface/control-border; feedback uses soft/brand. Keep semantic text colours unchanged. The latest user-edited mix percentages are authoritative.
- Reuse the T-Level starter theme tokens and controls, with separate Maths storage keys.
- Keep “Not you?” compact and secondary.
- Every page has an About link in the footer. About provides author information, source credits and the agent-augmented development approach.
- Keep mathematical meaning independent of colour, pointer input or animation; retain keyboard and typed-working support.

Updated demo direction (3 October): show one continuous coloured vertical line, with equals signs drawn over it on transparent backgrounds, like handwritten working. Keep each explanation to the left of its corresponding step. This supersedes the earlier requested gaps; do not use opaque background patches. Mathematical expressions normally written on one line must stay intact; the agreed approach uses spacing adjustments and individual content-width longer buttons centred on their own rows, retaining the restored readable equation sizes.

## CSS and JavaScript maintainability

- Use shared semantic classes composed from daisyUI button, input, textarea, select, checkbox, card and progress foundations. Keep primary/compact/quiet variants consistent; Bits UI owns dialog/popover behaviour and native form controls retain their semantics. Centralise theme adaptations, not repeated utility strings in markup.
- Compose recurring utility combinations into one or a few semantic CSS classes named for their UI purpose, such as `question-option`, `text-field` or `practice-panel`. Define shared rules and explicit variants once; avoid repeating long utility lists in component HTML or creating a separate class for every incidental variation. Reusable Svelte components and semantic CSS classes complement each other.
- Whole-site accessibility is required. Use Bits UI primitives for applicable interactive components in the Svelte application; retain native HTML controls where appropriate. Components must preserve accessible names, keyboard interaction, focus management and state announcements. Bits UI is a foundation, not a substitute for checking the assembled site, including contrast, zoom/reflow, reduced motion, touch targets and accessible alternatives to drawing.

- Keep styling hooks semantic and markup minimal. Compose shared component styles and variants rather than repeating long lists of presentation classes across activity pages. Preserve semantic native HTML; class names alone do not provide accessibility.
- Design activities for reuse in wider education apps: keep content, marking/progression and persistence contracts separate from framework-specific rendering. Components should receive explicit inputs and emit results/events rather than depending directly on global app state or localStorage.

- Create and update CSS and JavaScript to be reusable, modular, clean, minimal and commented wherever practical. Apply this to fixes as well as new features.
- Reuse shared CSS tokens, components and JavaScript helpers across pages. Keep topic content and configuration separate from shared behaviour; avoid copying page-specific implementations of the same feature.
- Give modules and functions clear responsibilities and explicit dependencies. Keep scoring, storage, rendering and optional features separate where that improves clarity. Avoid unnecessary abstractions, dependencies and fragmentation into tiny files.
- Keep source readable: descriptive names, consistent formatting and ordinary multiline code. Minimal means little duplication and complexity, not compressed one-line code. Remove obsolete code and conflicting CSS overrides when changing an implementation.
- Comment module responsibilities, non-obvious logic, state/lifecycle assumptions and deliberate CSS constraints or workarounds. Explain why a choice exists, especially when it protects a user requirement; keep comments current without narrating obvious syntax. Preserve attribution for reused code.
- Review changed code for reuse, module boundaries, unnecessary complexity and useful comments before considering it complete. Improve affected existing code as it is touched, with regression checks appropriate to behaviour changes.

## Verification

Run logic tests and browser checks appropriate to each change. Run logic tests with `node --test tests/*.test.mjs` from the project root, or `npm test` from `website/`. Run `npm run test:browser` from `website/`; browser scenarios are separated into activity, theme, startup and historical layout modules. Browser checks use an isolated test profile, never the user's browser storage. Record new user decisions here and implementation/check results in the [DEV_LOG](../DEV_LOG.md) and [HANDOFF](../HANDOFF.md).

## Efficient implementation and verification

- Default to `npm run verify:changed` from website/; its maintained dependency map and successful-input cache select checks automatically. Reuse its concise passing evidence; inspect named logs only on failure. `verify:watch` is opt-in for source-save verification, with no automatic hook installation.
- Select checks according to the changed behaviour. Use focused logic tests for logic changes and focused browser scenarios for UI changes; documentation-only changes need no application test run.
- Run the broader regression suite once at a meaningful integration/cutover boundary. After a failure, rerun the affected scenario first; do not repeat unrelated passing checks while repairing a test harness.
- Historical screenshot/geometry comparison and exhaustive theme-adjustment audits are opt-in checks for relevant design changes, not routine browser-test prerequisites. Accepted low contrast in user-adjusted themes is informational only.
- Prefer concise pass/fail summaries. Read detailed logs/screenshots only for failures or a specific visual question. Avoid printing generated bundles, full files or repeated passing test output into the conversation.
- Keep production code straightforward: validate real external boundaries and address observed failures, but avoid speculative fallbacks, compatibility layers, abstractions or tests without a concrete requirement. Maintainability means less unnecessary code as well as clear responsibilities.
- Do not expand a narrow continuation/status request into a new acceptance programme. Record unavailable manual coverage once; do not repeatedly investigate it or turn it into a new approval gate.

## Practice set codes

- A Practice set contains 1–4 ordered pages, each referencing a topic, question-page type and authored page slot; it is separate from the five learning stages. Subject scopes the nine-character code externally. Whole-set challenge uses four possible values; a saved learner level for the topic/type overrides it. Timing values are untimed, 5, 10 or 15 minutes.
- Slot 0 selects randomly; slot 1–15 selects directly or wraps with (slot - 1) % availableCount when out of range. An unavailable topic/type/level is reported, never silently replaced with a different activity. Page slots may be replaced/reused: authors own reasonable similarity. Do not add permanent-slot tombstones or parent-app UUID/version machinery. Questions may evolve; session variants are unindexed.

- Practice code/search entry sits at the top right of the topic header beneath the main navigation, with the topic selector directly underneath (allow title/description wrapping alongside the controls at medium widths; stack controls below on phone widths). Use the placeholder “practice code or search”, no visible label above it, and a standard-size “Go” button immediately to its right. Keep the search field compact (15rem preferred width), right-aligned and non-stretching on narrow screens; shrink only when needed to fit. Keep the Go button and topic selector aligned with the main content’s right gutter regardless of topic length. Retain a screen-reader label. Topic names/tags open related practice questions; codes remain case-sensitive. Creation is hidden behind Menu → Create Practice set by default. Keep Progress clearly available in the header. Its target is now a dedicated topic-grid page, superseding the current summary dialog; follow the progress-page requirements and unresolved decisions in [web_format.md](../web_format.md). Distinguish saved recommendations from demonstrated success.

- Progress has its own static page. Keep the established percentage scheme and all answer history; five scored answers is an initial evidence minimum only. On page load, fill to three persisted four-page recommendations in missing-data → weak-success → stale order. At 15 recommended completions in a week, stop automatic generation; congratulate and offer explicit extra generation while retaining pending work. Opening earns no completion credit; completion and unfinished-set messages follow web_format.md.


## Topic journey, content and presentation

- The main journey is topic-led: initial assessment → method/demo → scaffolded practice → spot errors → independent practice. Practice sets are secondary and may combine topics/types. Use the shared stage navigation; [UI taste](UI_TASTE.md#five-stage-navigation-and-progress) owns its consolidated visual specification, spacing, progress placement and breakpoints.
- Homepage cards show prerequisite-ordered topics grouped by subject, with a Build demo question and its worked solution rendered by shared components. Foundation Maths uses `/fm/topic-name/` directory URLs. Cards are normal links; topic selection updates the URL and survives profile selection. Existing query links forward. No separate copy-link button. Card widths, restrained gradients and redundant-label exclusions are in [UI taste](UI_TASTE.md#topic-selection).
- Ordinary independent pages contain twelve questions; scoring/adaptation retain the latest ten eligible answers at the relevant level, independent of page length. Preserve full timestamped history. Short non-independent activities retain their existing scoring windows; authored Practice-set slots retain their lengths.
- Initial assessments contain six questions, two per level. Earlier four-question baselines remain complete according to their recorded size. Present assessment separately from practice success.
- Keep the question and working areas within the shared main panel. The exact separate title/content insets, writing prompts, tools and responsive composition are in [UI taste](UI_TASTE.md#questions-and-working). Preserve accessible labels when removing visible redundant headings.
- The header Menu trigger has a hamburger icon, accessible name/tooltip “Menu” and a 44px target. Preserve popover/focus handling; placement is specified in UI taste.
- Hints give a small question-specific prompt rather than a solution. Bracket prompts should be exploratory: “What would the left side look like after expanding the brackets? Does it help?” Toggle beside the button; reset visibility on question changes without clearing assistance. Correction choices address plausible mistakes without exposing final answers. Notes identify the actual numbers and operations.
- Demos visibly construct their method guide before calculations. Use shared native stroke/text animation with pause/resume/speed/replay and reduced-motion support. Lattice operands and cell tens/units appear individually in reading order; diagonal addition retains its bottom-right starting order. Keep static solutions complete. [UI taste](UI_TASTE.md#teaching-animation) records the visual teaching sequence.

## Working, progress and persistence

- Drawing tools include X clear, a separate eraser with approximately five times the pen area, and black/green/blue/red logical ink. Dark mode inverts lightness while preserving hue; stored strokes remain theme-independent. Retain keyboard/typed alternatives.
- The canvas grip changes height without stretching or discarding ink; cropped ink returns when enlarged. Support pointer/touch/pen and keyboard resizing with a default-height reset. Guides do not count as working/hints; clear removes guides and ink.
- Cache drawing/typed working per learner/topic/attempt/question in the current tab for three hours after its last edit. Restore on selection/reload. Exclude transient working from durable progress and backups.
- Progress remains schema-2 JSON. Use the T-Level active timer: two-minute inactivity limit, five-second polling, hidden-page pause and no absence credit. Retain measured time for unfinished work as well as submitted answers; never estimate historical time. Cloud sync is a future planning item, not current behaviour.
- Progress breakdowns share one open panel. Allow moving from hover trigger to panel; retain click/touch/keyboard access and Escape.
- Common header/footer/report controls belong to shared components. Issue reporting follows the T-Level review/copy/email-draft workflow; reports are not sent automatically.

## Puzzles

- Show wrapping illustrated buttons using shared T-Level artwork. Challenge selection appears after a family is chosen; hide the Classic maths tile. Replace the grid with the selected family and “Choose another puzzle”, restoring focus on return.
- Go uses the T-Level layout: range/hints above, coordinates/source/rules below, then plain turn text, moves and Undo/Reset. Challenge labels include kyu bands. Puzzle results remain separate from topic scoring unless a later policy is agreed.
