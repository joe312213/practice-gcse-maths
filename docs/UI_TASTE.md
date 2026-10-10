# UI taste

Read this before changing layout, spacing, styling or teaching animation. This is the current visual reference distilled from the user's refinements, not a history of alternatives or permission for a redesign. Latest user feedback wins. [UI/UX rules](UI_UX_RULES.md) owns behaviour, scoring and persistence; [code style](CODE_STYLE.md) owns implementation standards. Keep current visual choices here and dated changes in [DEV_LOG](../DEV_LOG.md).

## Overall character

A calm, compact teaching interface with readable mathematics, clear sequence and room to work. Compact does **not** mean cramped. Related controls should read as a group; descriptions, navigation and question panels need visible breathing room. Reduce excessive gaps proportionately rather than removing them. Judge the actual visible content, not a CSS margin in isolation.

Reuse the established theme colours, rounded corners and shared controls. Rose is the unsaved-preference default; preserve saved preferences. Keep colour restrained and purposeful. User-adjusted theme contrast is a settled preference, not a reason to redesign or constrain their choices. Do not introduce extra headings, labels or explanations when the question, example or control already communicates its purpose.

## Topic selection

- Show prerequisite-ordered cards grouped by subject. Each card contains the topic name, a Build-level question and its worked solution, using the shared method renderers.
- No “example / Build level”, “practice this topic” or copy-link button. The whole card is a normal link to the topic URL.
- Cards should be compact and wrap, rather than filling a desktop row individually: 13rem when several fit (three must fit at a 768px viewport), 20rem for a single card on a larger screen, full width at 480px and below.
- Let each card keep its natural content height; do not stretch cards to equal heights within a row. As the topic collection grows, masonry is the preferred direction, preserving a clear reading and keyboard order. Use a low-contrast **2px neutral, theme-tinted border** from shared theme tokens; blend it mostly toward the surface rather than using the full control-border strength.
- Use a **subtle theme-coloured gradient**. Strong gradients were too much; completely flat pale surfaces looked white. The current mix adds 4–10% of the theme's main colour to its surface. This supersedes the temporary flat-card treatment. Preserve legible diagrams and text.

## Header and topic entry

Align to common page gutters. The hamburger stays at the top right even when other header actions wrap; reserve its space rather than letting it fall into another row. Keep the profile switch secondary.

Search/code entry sits at the topic header's top right, with the topic selector below and a compact Go button beside the input. The controls share the right gutter. Avoid stretched fields; let the title/description wrap alongside them when possible, stacking naturally on phones.

## Five-stage navigation and progress

Use one semantic navigation with five joined, right-facing chevrons. Omit stage numbers. Keep internal joins; the first button has a straight left edge with rounded outside corners, and the last has a straight right edge with rounded outside corners. First-button left padding is smaller because it has no notch. Earlier stages get a subtle tint indicating **sequence position, not completion**. The current stage remains clearly distinct.

Keep chevron geometry in one shared CSS definition, with one depth variable and adjacent first/last variations. Do not patch individual stages or duplicate navigation markup. Labels must remain comfortably readable near tablet widths.

| Relationship | Current choice |
| --- | --- |
| Intro → actual stage buttons | Fixed **2rem** for every stage; the stage header owns the gap, with no competing intro bottom margin |
| Vertical alignment | Keep stage buttons top-aligned with their fixed gap. At widths ≥768px, raise the adjacent progress summary by **2.5em** using its own logical top margin; do not shift the navigation or narrow-screen progress |
| Stages beside progress | From **768px**, stages take available width beside a bounded progress column, separated by **2rem** |
| Progress alignment | Compact block at the right gutter, **left-aligned content**; spare space belongs before the block, not after its visible contents |
| Small-screen progress | Below **678px**, a horizontal strip, wrapping only when necessary |
| Meter length | **4rem below 1024px**, **6rem at/above 1024px** |
| Progress wording | “Your progress”, “Level: [level]”, “recent success” |

Only scored practice has a header progress summary. Scaffolded-practice explanations belong in the activity panel. Assessment/demo must not reserve an empty progress column. Long trial/reassessment text must wrap inside a bounded summary; it must never squeeze the chevrons. A tall progress block must not supply the breathing room that is missing in other stages.

## Questions and working

Use the main panel's available width for up to three question columns, then two and one as space requires. Keep expressions intact and readable; allow a long question to take more room rather than shrinking or clipping the maths. Centre expressions within selector cards, keep numbers to the left and result markers unobtrusive.

Centre the selected-question/working pair within a bounded width and a moderate gap; do not push the columns to opposite edges. Keep working in the same panel, beside the question when space permits and below it on narrow screens. Short answers need compact fields, not full-column inputs.

| Element | Current choice |
| --- | --- |
| Active-question title | **1em left margin** |
| Rest of the answer column | Separate **2em left margin**; do not merge it with the title's rule |
| Working heading | “Working” inside the empty canvas; disappears on drawing/guide insertion, returns after clear |
| Typed working | No heading; placeholder **“Or type your working here...”**, with a persistent accessible name |
| Paper option | Removed; working surfaces stay available |
| Canvas backgrounds | Off-white **#f2f2f2** in light mode, dark grey **#202020** in dark mode |
| Selected drawing tool | Subtle thin highlight; keyboard focus remains distinct |
| Drawing controls | Separate X clear and eraser controls; black, green, blue and red logical ink colours |
| Assisted note | **70%** text size; visible only with the hint, without clearing recorded assistance when hidden |

Writing surfaces fill their own section. Keep them square-cornered, with compact tools and the small resize grip below the canvas. Theme changes recolour logical ink rather than changing saved strokes. Footer links need visibly generous separation.

## Teaching animation

Demonstrate the preparation students must perform on paper: draw the lattice grid/diagonals, bus-stop bracket or equation centre line **before** writing numbers. Animate strokes and progressive text reveals using the shared playback system and native browser features; do not add a large animation library.

In lattice setup, write top digits left-to-right, then side digits top-to-bottom. Write cell tens and units individually, across each row then down the rows. Preserve the mathematically correct bottom-right starting order for diagonal addition. Equation operations retain a continuous divider, transparent cells and explanations beside their corresponding steps.

Pause, resume, speed, replay and reduced motion must remain coherent. Static feedback and topic-card solutions stay complete. The current text effect reveals the existing font; it does not simulate handwritten glyph strokes. Planned operation highlighting is recorded in the [roadmap](WEBSITE_PLAN.md#next-session-priorities); it is not yet implemented.

## Responsive and implementation judgment

A wider viewport must not unexpectedly reduce usable width or column count. Use available container width for question/workspace layout, smooth padding where practical, and few purposeful breakpoints. Keep layout ownership explicit: one source for each recurring relationship, shared semantic components/classes and deliberate variants. Avoid accumulated overrides, arbitrary offsets or copying markup to repair one state.

Before calling a visual change complete, inspect the user's actual state—not only a different state that happens to look good. Exercise all five stages, especially scaffolded text, assessment without progress and scored practice with progress. Check long/short topic titles, narrow screens and both sides of affected breakpoints. Verify actual button positions, text fit, common gutters and the different 1em/2em insets. Automated overflow checks alone do not prove tasteful spacing. Preserve previously accepted choices while changing the requested relationship.
