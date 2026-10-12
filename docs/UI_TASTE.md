# UI taste

Read this before changing layout, spacing, styling or teaching animation. This is the current visual reference distilled from the user's refinements, not a history of alternatives or permission for a redesign. Latest user feedback wins. [UI/UX rules](UI_UX_RULES.md) owns behaviour, scoring and persistence; [code style](CODE_STYLE.md) owns implementation standards. Keep current visual choices here and dated changes in [DEV_LOG](../DEV_LOG.md).

## Overall character

A calm, compact teaching interface with readable mathematics, clear sequence and room to work. Compact does **not** mean cramped. Related controls should read as a group; descriptions, navigation and question panels need visible breathing room. Reduce excessive gaps proportionately rather than removing them. Judge the actual visible content, not a CSS margin in isolation.

Use a **16px root font size**, selected after comparing 16px and 18px at phone/tablet/desktop widths. Reuse the established theme colours, rounded corners and shared controls. Rose is the unsaved-preference default; preserve saved preferences. Keep colour restrained and purposeful. User-adjusted theme contrast is a settled preference, not a reason to redesign or constrain their choices. Do not introduce extra headings, labels or explanations when the question, example or control already communicates its purpose.

## Topic selection

- Show prerequisite-ordered cards grouped by subject. Each card contains the topic name, a Build-level question and its worked solution, using the shared method renderers.
- No “example / Build level”, “practice this topic” or copy-link button. The whole card is a normal link to the topic URL.
- Use a native CSS multi-column masonry layout: natural card heights, a shared 1rem gap and no equal-height rows. Preferred column widths remain 9.375rem below 440px and 11.25rem from 440px; columns share available width with a 140px card minimum. Reading and keyboard order follow prerequisites down each column, then across. Preserve complete card contents and keep each card unbroken between columns. No new breakpoint or JavaScript packing algorithm is needed.
- Scale worked-example mathematics with the available preview width consistently across topics: equation text, operation rows, cell spacing and divider thickness must grow/shrink proportionally like the lattice and bus-stop SVG diagrams. Do not leave equation working at a fixed rem size while the other diagrams scale. Keep the normal equation renderer for accessible mathematical structure.
- Let each card keep its natural content height; do not stretch cards to equal heights within a row. Masonry is now implemented, preserving a clear column-first reading and keyboard order. Use a low-contrast **2px neutral, theme-tinted border** from shared theme tokens; blend it mostly toward the surface rather than using the full control-border strength.
- Use a **subtle theme-coloured gradient**. Strong gradients were too much; completely flat pale surfaces looked white. The current mix adds 4–10% of the theme's main colour to its surface. This supersedes the temporary flat-card treatment. Preserve legible diagrams and text.

Draft topics use an outlined, slightly rotated Draft stamp over their card and topic heading. It stays outside normal flow, uses theme colours and must not obscure text or controls. Existing topic geometry remains unchanged.

## Header and topic entry

Align to common page gutters. Keep the theme selector, light/dark toggle and hamburger together at the top right, in that order. The hamburger is always present on every application page, including topic selection and pages without a signed-in learner. The shared menu links to Topics, Progress, Puzzles and About; eligible practice pages add Create Practice set. Keep tools at the top right. Brand and account/navigation actions share a line whenever their content fits, wrapping naturally without a new breakpoint. Tools stay on the first row. Leave 2rem between the logo and account actions. The actions fill the available row, with flex groups for left-aligned welcome/profile controls and right-aligned navigation: Progress aligns at its right edge, immediately before the theme controls when everything fits on one line. Only move actions to a full-width second row when their natural contents cannot fit. Keep the profile switch secondary. On topic pages, make the existing Foundation maths subject eyebrow a link back to topics, preserving its muted uppercase appearance and font size. Do not add a separate breadcrumb or repeat the topic title. Keep Puzzles in the hamburger and on the homepage, not as a duplicate topic-header action; retain the Progress shortcut.

Below 440px, stack the topic introduction above its controls. From 440px, use two columns: title/description on the left and search/code plus topic selection on the right. Use the refined topic heading scale (1.75rem / 28px minimum, growing to 3.2rem) and preserve the established subject eyebrow styling. Let the title column retain its longest word intact. Transfer 0.75rem (12px) from the former 22rem control maximum to the column gap: 21.25rem controls maximum and 1.75rem gap. Use compact 14px controls; the closed Bits UI topic selector says “Topic”, with full names in its opened choices and the current topic identified by the heading. No duplicate Topic label above it. Keep Go beside the shorter “code or search” prompt and aligned to the right gutter; retain the full accessible input name. Descriptions use 14px below 768px and 16px above.

## Five-stage navigation and progress

Use one semantic navigation with five joined, right-facing chevrons. Omit stage numbers. Keep internal joins; the first button has a straight left edge with rounded outside corners, and the last has a straight right edge with rounded outside corners. First-button left padding is smaller because it has no notch. Earlier stages get a subtle tint indicating **sequence position, not completion**. The current stage remains clearly distinct.

Join adjacent chevrons without a transparent seam: only the border colour should show between their fills. Paint the exposed diagonal edges, including the notch on a wrapped row. Retain the existing 2px separators and 1px notch outlines in the theme border colour, above segment contents including completed Progress bars. Keep geometry and responsive row/focus behaviour in the shared ChevronSteps component, with one depth variable and adjacent first/last variations. Callers supply segment content. Progress uses level meters with zero padding on the adjoining sides: first right, middle left/right, last left. Keep equal outside padding on Progress, round only its two outside meter ends, clip all content to the segment outline even when max-width is set, and keep adjoining meter ends square so completed bars join. Do not patch individual stages or duplicate navigation markup. Labels must remain comfortably readable near tablet widths. Keep labels to at most two lines by grouping the phrase before the final word (for example, “Learn the” / “method” and “Spot the” / “error”). Let each segment retain its longest phrase plus horizontal padding (chevron depth + 0.5rem on each notched side); wrap intrinsically at any width, including beside progress, instead of forcing a single row at a viewport breakpoint. The first row fills the available navigation width, and labels use one line whenever they fit. Wrapped rows keep natural content widths, shrinking labels to two lines only when needed. A small ResizeObserver helper groups stages using rendered phrase widths and existing padding; flexbox owns sizing within each row. Inset every row after the first by the shared chevron depth to cancel its leading segment’s negative notch margin; keep all forks within the navigation gutter. Include that inset when grouping rows. Keep keyboard focus on the same stage when regrouping. Mobile navigation fills its column; from 768px cap its width at 48.75rem (780px at the default root). This is a layout maximum, independent of the similarly valued question-column breakpoint.

| Relationship | Current choice |
| --- | --- |
| Stage labels | **0.9375rem** (15px at the 16px root), retaining larger navigation text within the smaller overall scale |
| Chevron dividers | **2px** outgoing diagonal strokes and **1px** notch outlines using the shared stage-border colour (`--line`); matching outer-edge geometry leaves no background gap |
| Intro → actual stage buttons | Fixed **2rem** for every stage; the stage header owns the gap, with no competing intro bottom margin |
| Vertical alignment | Keep stage buttons top-aligned with their fixed gap. At widths ≥768px, raise the adjacent progress summary by **2.5em** using its own logical top margin; do not shift the navigation or narrow-screen progress |
| Stages beside progress | From **768px**, stages take available width beside a bounded progress column, separated by **2rem** |
| Progress alignment | Compact block at the right gutter, **left-aligned content**; spare space belongs before the block, not after its visible contents |
| Small-screen progress | Below **678px**, a horizontal strip, wrapping only when necessary |
| Meter length | **4rem below 1024px**, **6rem at/above 1024px** |
| Progress wording | “Your progress”, “Level: [level]”, “recent success” |

Only scored practice has a header progress summary. Scaffolded-practice explanations belong in the activity panel. Assessment/demo must not reserve an empty progress column. Long trial/reassessment text must wrap inside a bounded summary; it must never squeeze the chevrons. A tall progress block must not supply the breathing room that is missing in other stages.

## Questions and working

Label the practice selector “Level” and place the “Check method” text link immediately to its right, sharing the row. It opens the existing reference (dialog on phones, inline on larger screens).

Below 768px, main content panels across the site, including **all five learning stages**, puzzles, Progress, About and FAQ, fill the viewport width, with square corners and only top/bottom borders; gradient borders run horizontally. Keep inner text padding. From 768px restore the inset card and all four borders. Centre partial question rows and keep their preferred slot widths rather than expanding them across the row. Prefer two equal-width question buttons per row, including at 360px when their content fits; allow three from the registered wider-container threshold and a full-width row for longer expressions. Initial assessment prefers three equal row slots at any width where its expressions fit, wrapping naturally when they need more room. Keep expressions intact and readable; allow a long question to take more room rather than shrinking or clipping the maths. Centre expressions within selector cards, put numbers at the top-left with their existing left inset, and keep result markers at the bottom-right. Reserve vertical clearance for these labels; do not include the number slot in horizontal equation padding. Current 4×4-digit multiplication questions must fit two per row at 360px without shrinking the maths.

Centre the selected-question/working pair within a bounded width and a moderate gap; do not push the columns to opposite edges. Keep working in the same panel, beside the question when space permits and below it on narrow screens. Short answers need compact fields, not full-column inputs.

| Element | Current choice |
| --- | --- |
| Active-question title | **1em left margin** |
| Rest of the answer column | Separate **2em left margin**; do not merge it with the title's rule |
| Working heading | “Working” inside the empty canvas; disappears on drawing/guide insertion, returns after clear |
| Typed working | No heading; placeholder **“Or type your working here...”**, with a persistent accessible name |
| Paper option | Removed; working surfaces stay available |
| Canvas backgrounds | Mix **85%** off-white **#f2f2f2** (light) or dark grey **#202020** (dark) with **15%** theme surface, so paper subtly follows warm/cool palettes |
| Selected drawing tool | Subtle thin highlight; keyboard focus remains distinct |
| Drawing controls | Separate X clear and eraser controls; black, green, blue and red logical ink colours |
| Assisted note | **70%** text size; visible only with the hint, without clearing recorded assistance when hidden |

New working canvases default to **262 CSS pixels** high. Newly inserted assistance guides use the current visible canvas dimensions, centred horizontally and vertically with at least **48 CSS pixels** on every side for handwriting. Lattice cells are square at insertion, capped at 72px and reduced to fit larger row/column counts. Division frames use the same clearance and centring rules. Convert into the existing bitmap coordinates only after layout; preserve cached guides and learner strokes when resizing or restoring, rather than moving working underneath existing writing. This supersedes the earlier fixed grid origin and 90% scale. Writing surfaces fill their own section. Keep them square-cornered, with compact tools and the small resize grip below the canvas. Theme changes recolour logical ink rather than changing saved strokes. Footer links need visibly generous separation.

## Teaching animation

Demonstrate the preparation students must perform on paper: draw the lattice grid/diagonals, bus-stop bracket or equation centre line **before** writing numbers. Animate strokes and progressive text reveals using the shared playback system and native browser features; do not add a large animation library.

In lattice setup, write top digits left-to-right, then side digits top-to-bottom. Write cell tens and units individually, across each row then down the rows. Preserve the mathematically correct bottom-right starting order for diagonal addition. Equation operations retain a continuous divider, transparent cells and explanations beside their corresponding steps.

Method descriptions use 0.875rem (14px at the default root) below 768px and 1rem (16px) from 768px. Keep all numbered arithmetic steps visible, highlighting the current step; equation explanations accompany each revealed row and highlight the current row. Keep the general guide visible; do not repeat its instructions beneath the drawing. Keep calculation-specific working notes beneath arithmetic animations: diagonal totals and carries for multiplication, and quotients/remainders/decimal continuation for division. Only repeated general step instructions are omitted. These notes also remain in answer feedback; compact topic previews may omit them. Put the animated working directly below the question and above the playback controls. Before Play or a step control is used, render no drawing area or reserved blank space. Add working as it is needed and let the controls move down naturally; do not reserve future equation rows or note blocks. Play may reposition once to the reading area, including arithmetic guidance; subsequent frames reveal newly clipped working with the minimum needed scrolling, without recentering or moving focus. Keep browser scroll anchoring disabled so the shared player controls this movement. Content that already fits and paused playback do not scroll; manual scrolling remains available.

Pause, resume, speed, replay and reduced motion must remain coherent. Static feedback and topic-card solutions stay complete. The current text effect reveals the existing font; it does not simulate handwritten glyph strokes. Operation highlights follow the [method animation contract](METHOD_ANIMATIONS.md). Current-step descriptions remain visible alongside the operation-level highlighting.

## Responsive and implementation judgment

A wider viewport must not unexpectedly reduce usable width or column count. Use available container width for question/workspace layout, smooth padding where practical, and few purposeful breakpoints. Prefer phone layouts as base rules, with named larger-breakpoint overrides; retain max-width variants where they express a genuinely narrow-only adjustment more clearly. Keep layout ownership explicit: one source for each recurring relationship, shared semantic components/classes and deliberate variants. Avoid accumulated overrides, arbitrary offsets or copying markup to repair one state.

Before calling a visual change complete, inspect the user's actual state—not only a different state that happens to look good. Exercise all five stages, especially scaffolded text, assessment without progress and scored practice with progress. Check long/short topic titles, narrow screens and both sides of affected breakpoints. Verify actual button positions, text fit, common gutters and the different 1em/2em insets. Automated overflow checks alone do not prove tasteful spacing. Preserve previously accepted choices while changing the requested relationship.


### Dimensions and spacing

Follow the [CSS review checklist](CODE_STYLE.md#css-review-checklist) for value derivation, consolidation, units and exception checks. Current dimension ownership and visual decisions:

- [controls.css](../website/src/lib/styles/controls.css) owns normal/compact control sizes and the standard control-group gap. Controls use the existing selector/field radii from [theme-mapping.css](../website/src/lib/styles/theme-mapping.css).
- [components.css](../website/src/lib/styles/components.css) owns page gutters, page vertical padding, paragraph reading width and fixed overlay edge clearance. The shared header uses grid tracks; the small header-layout adapter measures natural content widths on resize or account changes to choose one row or a full-width account row. CSS owns gaps and geometry; there is no header viewport breakpoint. Browser checks at 684px and 744px are regression samples only, not production thresholds. The existing below-768px welcome font rule remains unchanged. [ChevronSteps](../website/src/lib/components/ui/ChevronSteps.svelte) owns chevron geometry, padding hooks, clipping and responsive rows; overlap derives from its depth.
- Intro paragraphs use a **38rem** maximum so their reading width follows root text size (608px at the current 16px default). It is independent of the working-layout breakpoint.

Retain purposeful differences: the native select's arrow inset is not a compact control height; theme-popover edge clearance follows text size while dialog/progress edge clearance is fixed. The question-number slot uses 16px, selected alongside the 16px root after the visual comparison; it remains a fixed slot, independent of root text size. Check number/expression separation when adjusting either. Paragraph measure and reference-column minimum width constrain different content and must not be coupled to numerically similar thresholds. Question buttons use intrinsic maths width rather than a fixed pixel minimum.

### Breakpoint register

[breakpoints.css](../website/src/lib/styles/breakpoints.css) is the single executable register for authored viewport and container thresholds. It is imported once by app.css. Use its named Tailwind `@variant` rules; do not repeat numeric width conditions in component CSS or JavaScript. Imported package styles remain upstream-owned. Native print, reduced-motion and forced-colour queries remain native media queries.

**Boundary convention:** `viewport-medium` means width **>=** its threshold; `max-viewport-medium` means width **<** that same threshold (the `max-` prefix is exclusive). Container variants use `@question-working-columns` and `@max-question-working-columns` with the same >= / < convention. Do not introduce `<=`, `>` or one-pixel offsets to create adjacent ranges. Write the smaller-layout base rules first where that is clearer; add only the needed variants. Use one-line comments at each query explaining the layout purpose, not merely repeating its width.

| Token suffix | Scope / value | Consumers and rationale |
| --- | --- | --- |
| viewport-small | Viewport, 440px | Below: 150px topic cards and stacked topic introduction/controls; at/above: 180px topic cards (still capped to fit a pair) and a two-column topic introduction. Stage buttons wrap intrinsically, independently of this boundary. Consolidates the old 479/480 split (now replaced by the agreed 440px boundary) into one narrow-layout boundary. |
| viewport-medium | Viewport, 768px | Full-width activity cards in all five stages with horizontal top/bottom borders, compact account text/equation styling and Progress page stacking below; inset cards and stages/progress alongside at/above. Also controls the method-reference dialog versus inline presentation. Consolidates 767/768 into one boundary, including fractional widths. |
| viewport-large | Viewport, 1024px | Changes progress meters from 4rem to 6rem, preserving the user's explicit visual decision. |
| viewport-progress-grid | Viewport, 678px | Below: a wrapping progress strip; at/above: a compact grid. This exception preserves the accepted layout. The exact number has no recorded derivation; do not treat it as a device category or reuse it for unrelated controls. |
| viewport-reference-columns | Viewport, 1150px | At/above: reference and question panel sit alongside; below: inline reference and questions stack (until the medium boundary changes the reference to a dialog). Retained layout exception; evaluate both reading and working space before adjusting it. |
| question-three-columns | Question-panel container, 780px | At/above: three preferred practice question columns. Assessment already prefers three, with intrinsic expression widths deciding wrapping. Measures usable panel space after gutters/reference allocation, not viewport width. |
| question-working-columns | Question-panel container, 650px | Below: answers and working stack; at/above: they sit alongside. Retains the existing allocation for readable questions and useful writing space. |

Viewport tokens have the `--breakpoint-` prefix; container tokens have `--container-`. Registered viewport and container thresholds use px; topic-card widths use rem to follow text size. Keep viewport and container scales separate. `@theme static` exposes the register's values for browser consumers: PracticeActivity reads `--breakpoint-viewport-medium` and builds its `<` matchMedia query after mount. No separately maintained JavaScript number or fallback is allowed.

Thresholds within **20px in the same measurement scope** are strong consolidation candidates. Prefer an existing threshold unless content-fit evidence justifies another. A viewport threshold and a container threshold are not interchangeable simply because their values are close. Purpose-specific exceptions require a recorded rationale and boundary checks; do not invent historical rationale where none is recorded.

When changing a threshold, check below, at and above it, fractional container widths where relevant, all five stages, long/short expressions and open references. Existing presentation checks cover the viewport transitions, progress layout/meters, reference dialog/sidebar transitions and question/working container boundaries. Keep current visual choices elsewhere in this document aligned with the register.


## Content-sized controls and footer

Native single-choice selectors and file inputs size to their displayed option or filename, capped by their container. Use CSS `field-sizing: content`; older browsers retain normal intrinsic sizing. Keep the Bits UI Topic navigation control unchanged. Retain native keyboard/file-picker behaviour and sufficient arrow padding. Footer text and links are centred and include “Developed by Joe Hudson 2026”; omit the former practice/browser-storage slogan.

### Human Go board boundary exception

The human board uses half its previous combined panel-padding + board-margin gutter at **width <= 440px** (inclusive, explicitly requested on 12 October). The named `viewport-go-mobile` variant shares the 440px value but includes that endpoint; other `viewport-small` consumers retain their existing convention. Coordinates sit on all four sides. Preserve their font sizes and distance from the outer board edges when enlarging the inner grid towards them; do not push labels outward or enlarge them with the grid. Along each edge, align label centres exactly with the transformed grid lines. Ownership squares distinguish provisional score estimates from stones.

### Practice countdown

Place the transient timer at the top-right of the question header, with Timer/time above adjacent +/− controls and Start. Controls/label use muted text, while the time switches to normal ink after starting. Use no gap between the adjustment buttons; keep separation before Start/Pause/Resume/Reset. Wrap with the header when space is insufficient. No Chime checkbox.

The human Go playing area centres the board, setup/actions, timing controls and status text. Keep the title/rules row in its existing layout and preserve the mobile board gutters.
