# Website UI and UX rules

These are ongoing requirements, not one-off draft changes. Recorded from user feedback on 3 October 2026. Apply to all future topic/activity pages unless an explicit exception is stated. Latest user decisions take precedence.

## Startup and saved progress

- Optional theme features must not block equations, profiles or practice. A failed theme setup must leave practice usable and give a short recovery message.
- Keep name selection unavailable until the question bank and saved profile data are ready. Never submit a name against an uninitialised profile store.
- Ordinary refreshes, including cached resources, must work. Check startup with incomplete theme markup, a theme exception and a delayed bank request.
- Preserve saved names, history and progress during fixes. Never require clearing browser storage to recover from a UI failure.
- Progress explanation must read: “recent success at this level”. Keep scoring implementation details out of this student-facing text; the scoring rules themselves are unchanged.

## Questions and answer flow

- Question selectors must be at least 210px wide in a two-column layout; use one column when space is insufficient. Keep borders, card height and answer-field position stable when switching comparable questions.
- Use native buttons for selecting a question in the current page, within an ordered list. Identify the current question accessibly and connect selectors to the question panel.
- Hide routine per-question challenge labels on every activity. Show a subtle label only when a question has been promoted above the current page's starting level. Keep page-level challenge selection where relevant.
- After a fully correct submission, automatically advance to the next unanswered question when one exists. Search forwards, then wrap to earlier unanswered questions. Skip submitted questions; never create another page automatically.
- Give a brief accessible correctness announcement and focus the new answer control. Clear unsubmitted working as for manual question selection. Previously submitted feedback remains accessible via its question selector.
- Incorrect or invalid submissions stay on the current question. In error spotting, final answer alone is insufficient: every error entry must also be correct before advancing. Stay on the final submitted question when no unanswered questions remain.

## Activity-specific requirements

- Initial assessment has no Learning practice card, hints/reference, routine challenge labels or “practise another page” card after completion.
- Method review retains challenge selection. Guidance is tailored to challenge: fewer, simpler steps for Start. Explain choosing operations to gather the variable on one side and find the value of one variable.
- Annotate demo operations with why they were chosen, including bracket expansion and useful common-factor division. Play is primary; Previous, Next and End are secondary. Retain a static accessible solution and respect reduced motion.
- Guided practice uses the same level-specific guidance. “I'm working on paper” collapses the working tools; unticking restores them and any current draft. Start each session with tools visible; do not persist the paper preference.
- Error spotting collects row, reason and corrected step separately for each error, then one final answer. Confidence questions may have two errors. Put row numbers in a distinct gutter separated by a faint vertical line, not beside the algebra as though part of it.
- Identify authored mathematical errors explicitly; do not mistake a valid alternative solution method for an error by comparing it with the model's row sequence.

## Shared presentation

- During framework migration, retain the current layout and design closely and match theme colours and gradients exactly, including opacity, gradient stops/directions and adjustment behaviour. Adapt framework defaults to the existing design. Capture baseline screenshots/computed styles and compare at each stage. Any accessibility conflict requiring visual changes must be documented and resolved with the user before changing the exact-match baseline.

- Reuse the T-Level starter theme tokens and controls, with separate Maths storage keys.
- Keep “Not you?” compact and secondary.
- Every page has an About link in the footer. About provides author information, source credits and the agent-augmented development approach.
- Keep mathematical meaning independent of colour, pointer input or animation; retain keyboard and typed-working support.

Visual continuity does not require preserving implementation hacks. Replace brittle masking/overlay tricks with structural solutions: equation dividers have separate line segments around equals signs, with no opaque patch obscuring the line. Check transparent and gradient backgrounds.

## CSS and JavaScript maintainability

- Compose recurring utility combinations into one or a few semantic CSS classes named for their UI purpose, such as `question-option`, `answer-input` or `practice-panel`. Define shared rules and explicit variants once; avoid repeating long utility lists in component HTML or creating a separate class for every incidental variation. Reusable Svelte components and semantic CSS classes complement each other.
- Whole-site accessibility is required. Use Bits UI primitives for applicable interactive components in the planned Svelte migration; retain native HTML controls where appropriate. Components must preserve accessible names, keyboard interaction, focus management and state announcements. Bits UI is a foundation, not a substitute for checking the assembled site, including contrast, zoom/reflow, reduced motion, touch targets and accessible alternatives to drawing.

- Keep styling hooks semantic and markup minimal. Compose shared component styles and variants rather than repeating long lists of presentation classes across activity pages. Preserve semantic native HTML; class names alone do not provide accessibility.
- Design activities for reuse in wider education apps: keep content, marking/progression and persistence contracts separate from framework-specific rendering. Components should receive explicit inputs and emit results/events rather than depending directly on global app state or localStorage.

- Create and update CSS and JavaScript to be reusable, modular, clean, minimal and commented wherever practical. Apply this to fixes as well as new features.
- Reuse shared CSS tokens, components and JavaScript helpers across pages. Keep topic content and configuration separate from shared behaviour; avoid copying page-specific implementations of the same feature.
- Give modules and functions clear responsibilities and explicit dependencies. Keep scoring, storage, rendering and optional features separate where that improves clarity. Avoid unnecessary abstractions, dependencies and fragmentation into tiny files.
- Keep source readable: descriptive names, consistent formatting and ordinary multiline code. Minimal means little duplication and complexity, not compressed one-line code. Remove obsolete code and conflicting CSS overrides when changing an implementation.
- Comment module responsibilities, non-obvious logic, state/lifecycle assumptions and deliberate CSS constraints or workarounds. Explain why a choice exists, especially when it protects a user requirement; keep comments current without narrating obvious syntax. Preserve attribution for reused code.
- Review changed code for reuse, module boundaries, unnecessary complexity and useful comments before considering it complete. Improve affected existing code as it is touched, with regression checks appropriate to behaviour changes.

## Verification

Run logic tests and browser checks appropriate to each change. Current checks are `tests/website.test.mjs`, `scripts/browser-smoke.mjs` and `scripts/browser-startup.mjs`. Browser checks use an isolated test profile, never the user's browser storage. Record new user decisions here and implementation/check results in the dated dev log and HANDOFF.md.
