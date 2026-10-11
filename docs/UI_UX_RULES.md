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
- Selecting demo Play may reposition the reading area once. Do not scroll automatically during playback or move keyboard focus; preserve the learner’s reading position as working grows. Keep method descriptions visible and highlight the current description. Place the animated working directly below the question, above the playback controls. Show no blank drawing area before Play or step navigation; grow the working and move controls down as needed. Do not repeat visible general guide instructions below the animation, but retain the calculation-specific working notes, descriptions and numerical explanations. Provide a compact labelled speed selector, default 1×, remembered per named profile and shared with method references. Explanations stay to the left, with slightly smaller text, a narrow gap and compact row spacing.
- Scaffolded practice uses the same level-specific guidance. Working stays visible; there is no paper toggle.
- Only the scratch pad and typed-working input extend through the working card’s horizontal padding to fill its inner border-to-border width. Keep the standard inset, scaling smoothly from 18px to 24px for headings, labels, buttons and helper text. The default full-width writing surfaces have square corners. Use this full-width style in development and production; there is no field-style selector. Clear drawing is a compact X icon button with a native title tooltip and accessible name.
- Equation error spotting collects row, reason and corrected step separately for each error, then one final answer. Confidence equation questions may have two errors. Arithmetic error spotting uses the preserved wrong diagram, a question-specific correction choice and the final answer. Put row numbers in a distinct gutter separated by a faint vertical line, not beside the algebra as though part of it.
- Identify authored mathematical errors explicitly; do not mistake a valid alternative solution method for an error by comparing it with the model's row sequence.

## Shared presentation

- Below the shared 768px breakpoint, every learning stage uses the same full-viewport-width main activity card, with square corners and horizontal top/bottom borders only. This includes Learn the method. Larger viewports restore inset cards; see [UI taste](UI_TASTE.md) for the visual details.

- Hover on an ordinary surface button must retain an opaque surface, lightly tinted with the theme's selected colour: 75% normal surface + 25% `--selection-base`. Never substitute the page background, transparency or `--surface-soft` for this hover state. Shared `.action-button` styling applies this to enabled ordinary buttons; other surface controls opt in with `.hover-tint` and may set `--hover-surface` to their normal background. Keep text/borders stable. Primary, current-step and quiet actions retain their distinct treatments; do not attach `.hover-tint` to selected, marked or disabled controls. Use the same semantic rule across all palettes and light/dark modes, including user-adjusted colours.

- During framework migration, retain the current layout and design closely and match theme colours and gradients exactly, including opacity, gradient stops/directions and adjustment behaviour, except where subsequent explicit refinements in UI taste supersede them. Adapt framework defaults to the existing design. Capture baseline screenshots/computed styles and compare at each stage. Default themes must satisfy accessibility contrast requirements. The user explicitly accepts unrestricted saturation/lightness adjustments to personal preference, even when an adjusted combination reduces contrast. Such adjustment results are informational, not defects or approval gates; do not constrain them or reopen this settled decision.

- Status highlights blend with each element’s normal surface and border rather than uniformly with the dominant theme colour. Question buttons use surface/control-border; feedback uses soft/brand. Keep semantic text colours unchanged. The latest user-edited mix percentages are authoritative.
- Reuse the T-Level starter theme tokens and controls, with separate Maths storage keys.
- Keep “Not you?” compact and secondary.
- Every page has an About link in the footer. About provides author information, source credits and the agent-augmented development approach.
- Keep mathematical meaning independent of colour, pointer input or animation; retain keyboard and typed-working support.

Updated demo direction (3 October): show one continuous coloured vertical line, with equals signs drawn over it on transparent backgrounds, like handwritten working. Keep each explanation to the left of its corresponding step. This supersedes the earlier requested gaps; do not use opaque background patches. Mathematical expressions normally written on one line must stay intact; the agreed approach uses spacing adjustments and individual content-width longer buttons centred on their own rows, retaining the restored readable equation sizes.

## Implementation and verification guidance

Follow [CODE_STYLE](CODE_STYLE.md) and the [comments policy](CODE_COMMENTS.md) for code, markup and testing decisions; the [framework skill](../.agents/skills/maths-framework-development/SKILL.md) applies them to this application. The [architecture and shared-control guide](../website/README.md#architecture-boundaries) records the implementation boundaries.

Use the [efficient-development skill](../.agents/skills/maths-efficient-development/SKILL.md) and [verification guide](../website/README.md#automated-change-selected-verification), defaulting to cached change-selected checks. Keep standing requirements here, dated decisions/results in DEV_LOG and current state/next steps in HANDOFF.

## Practice set codes

- A Practice set contains 1–4 ordered pages, each referencing a topic, question-page type and authored page slot; it is separate from the five learning stages. Subject scopes the nine-character code externally. Whole-set challenge uses four possible values; a saved learner level for the topic/type overrides it. Timing values are untimed, 5, 10 or 15 minutes.
- Codes refer to current authored pages, not frozen question content. Authors may replace/reuse slots and own reasonable similarity. Report unavailable activities rather than silently substituting another topic/type/level. The [code and slot contract](../website/README.md#practice-sets-codes-and-authored-pages) defines encoding, random selection, fallback and variant handling; do not add permanent-slot tombstones or parent-app UUID/version machinery.

- Practice code/search entry sits at the top right of the topic header beneath the main navigation, with the topic selector directly underneath (allow title/description wrapping alongside the controls at medium widths; stack controls below on phone widths). Use the placeholder “practice code or search”, no visible label above it, and a standard-size “Go” button immediately to its right. Keep the search field compact (15rem preferred width), right-aligned and non-stretching on narrow screens; shrink only when needed to fit. Keep the Go button and topic selector aligned with the main content’s right gutter regardless of topic length. Retain a screen-reader label. Topic names/tags open related practice questions; codes remain case-sensitive. Creation is hidden behind Menu → Create Practice set by default. Keep Progress clearly available in the header. Its target is now a dedicated topic-grid page, replacing the former summary dialog; follow the progress-page requirements in [web_format.md](../web_format.md). Distinguish saved recommendations from demonstrated success.

- Progress has its own static page. Keep the established percentage scheme and all answer history; five scored answers is an initial evidence minimum only. On page load, fill to three persisted four-page recommendations in missing-data → weak-success → stale order. At 15 recommended completions in a week, stop automatic generation; congratulate and offer explicit extra generation while retaining pending work. Opening earns no completion credit; completion and unfinished-set messages follow web_format.md.


## Topic journey, content and presentation

- The main journey is topic-led: initial assessment → method/demo → scaffolded practice → spot errors → independent practice. Practice sets are secondary and may combine topics/types. Use the shared stage navigation; [UI taste](UI_TASTE.md#five-stage-navigation-and-progress) owns its consolidated visual specification, spacing, progress placement and breakpoints.
- Homepage cards show prerequisite-ordered topics grouped by subject, with a Build demo question and its worked solution rendered by shared components. Foundation Maths uses `/fm/topic-name/` directory URLs. Cards are normal links; topic selection updates the URL and survives profile selection. Existing query links forward. No separate copy-link button. Card widths, restrained gradients and redundant-label exclusions are in [UI taste](UI_TASTE.md#topic-selection).
- Ordinary independent pages contain twelve questions; scoring/adaptation retain the latest ten eligible answers at the relevant level, independent of page length. Preserve full timestamped history. Other page types must use a fixed typical scoring-window length per type, even when individual pages differ; current code still uses actual page length (see the [recorded gap](WEBSITE_PLAN.md#scoring-interpretations-currently-used)). Authored Practice-set slots retain their lengths.
- Initial assessments contain six questions, two per level. Earlier four-question baselines remain complete according to their recorded size. Present assessment separately from practice success.
- Keep the question and working areas within the shared main panel. The exact separate title/content insets, writing prompts, tools and responsive composition are in [UI taste](UI_TASTE.md). Preserve accessible labels when removing visible redundant headings.
- Every application page has the shared header Menu trigger, including before profile selection. Common links are Topics, Progress, Puzzles and About; practice pages add Create Practice set when a learner is selected. The trigger has a hamburger icon, accessible name/tooltip “Menu” and a 44px target. Preserve popover/focus handling; placement is specified in UI taste.
- Hints give a small question-specific prompt rather than a solution. Bracket prompts should be exploratory: “What would the left side look like after expanding the brackets? Does it help?” Toggle beside the button; reset visibility on question changes without clearing assistance. Correction choices address plausible mistakes without exposing final answers. Notes identify the actual numbers and operations.
- Demos visibly construct their method guide before calculations. Use shared native stroke/text animation with pause/resume/speed/replay and reduced-motion support. Lattice operands and cell tens/units appear individually in reading order; diagonal addition retains its bottom-right starting order. Keep static solutions complete. [UI taste](UI_TASTE.md#teaching-animation) records the visual teaching sequence.

## Working, progress and persistence

- Drawing tools include X clear, a separate eraser with approximately five times the pen area, and black/green/blue/red logical ink. Dark mode inverts lightness while preserving hue; stored strokes remain theme-independent. Retain keyboard/typed alternatives.
- The canvas grip changes height without stretching or discarding ink; cropped ink returns when enlarged. Support pointer/touch/pen and keyboard resizing with a default-height reset. Guides do not count as working/hints; clear removes guides and ink.
- Cache drawing/typed working per learner/topic/attempt/question in the current tab for **48 hours after its last edit**. This lifetime is agreed but not implemented: code still uses three hours; see the [deferred implementation](WEBSITE_PLAN.md#agreed-working-cache-lifetime--implementation-deferred). Restore on selection/reload. Exclude transient working from durable progress and backups.
- Progress remains schema-2 JSON. Use the T-Level active timer: two-minute inactivity limit, five-second polling, hidden-page pause and no absence credit. Retain measured time for unfinished work as well as submitted answers; never estimate historical time. Cloud sync is a future planning item, not current behaviour.
- Progress breakdowns share one open panel. Allow moving from hover trigger to panel; retain click/touch/keyboard access and Escape.
- Common header/footer/report controls belong to shared components. Issue reporting follows the T-Level review/copy/email-draft workflow; reports are not sent automatically.

## Puzzles

- Show wrapping illustrated buttons using shared T-Level artwork. Challenge selection appears after a family is chosen; hide the Classic maths tile. Replace the grid with the selected family and “Choose another puzzle”, restoring focus on return.
- Go uses the T-Level layout: range/hints above, coordinates/source/rules below, then plain turn text, moves and Undo/Reset. Challenge labels include kyu bands. Puzzle results remain separate from topic scoring unless a later policy is agreed.
