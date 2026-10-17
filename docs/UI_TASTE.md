# UI taste

Read this before changing layout, spacing, styling or teaching animation. This is the current visual reference distilled from the user's refinements, not a history of alternatives or permission for a redesign. Latest user feedback wins. [UI/UX rules](UI_UX_RULES.md) owns behaviour, scoring and persistence; [code style](CODE_STYLE.md) owns implementation standards. Keep current visual choices here and dated changes in [DEV_LOG](../DEV_LOG.md).

## Overall character

A calm, compact teaching interface with readable mathematics, clear sequence and room to work. Compact does **not** mean cramped. Related controls should read as a group; descriptions, navigation and question panels need visible breathing room. Reduce excessive gaps proportionately rather than removing them. Judge the actual visible content, not a CSS margin in isolation.

Use a **16px root font size**, selected after comparing 16px and 18px at phone/tablet/desktop widths. Reuse the established theme colours, rounded corners and shared controls. Rose is the unsaved-preference default; preserve saved preferences. Keep colour restrained and purposeful. User-adjusted theme contrast is a settled preference, not a reason to redesign or constrain their choices. Do not introduce extra headings, labels or explanations when the question, example or control already communicates its purpose.

## Topic selection

- Show prerequisite-ordered cards grouped by subject. Each card contains the topic name, a Build-level question and its worked solution, using the shared method renderers.
- Topic cards scale subtly to 1.015 on fine-pointer hover and 0.985 while pressed, over 140ms. Apply scaling to the link inside its masonry slot so neighbours do not move. Disable the scale effect for reduced-motion preferences.
- No “example / Build level”, “practice this topic” or copy-link button. The whole card is a normal link to the topic URL.
- Pack cards in the selected priority/a–z sequence into the highest available position (shortest column), choosing the leftmost column when heights tie. Retain natural card heights, a shared 1rem gap and no equal-height rows. Preferred column widths remain 9.375rem below 440px and 11.25rem from 440px; columns share available width with a 140px card minimum. DOM and keyboard order retain the selected sequence. Repack after filtering, sorting, resizing or text-size changes; reserve the full packed height before the footer.
- Scale worked-example mathematics with the available preview width consistently across topics: equation text, operation rows, cell spacing and divider thickness must grow/shrink proportionally like the lattice and bus-stop SVG diagrams. Do not leave equation working at a fixed rem size while the other diagrams scale. Keep the normal equation renderer for accessible mathematical structure.
- Let each card keep its natural content height; do not stretch cards to equal heights within a row. Packing preserves the selected sequence with left-to-right ties. Use a low-contrast **2px neutral, theme-tinted border** from shared theme tokens; blend it mostly toward the surface rather than using the full control-border strength.
- Use a **subtle theme-coloured gradient**. Strong gradients were too much; completely flat pale surfaces looked white. The current mix adds 4–10% of the theme's main colour to its surface. This supersedes the temporary flat-card treatment. Preserve legible diagrams and text.

Draft topics use an outlined, slightly rotated Draft stamp over their card and topic heading. It stays outside normal flow, uses theme colours and must not obscure text or controls. Existing topic geometry remains unchanged.

## Header and topic entry

Align to common page gutters. Keep the theme selector, light/dark toggle and hamburger together at the top right, in that order. The hamburger is always present on every application page, including topic selection and pages without a signed-in learner. The shared menu links to Topics, Progress, Puzzles and About; eligible practice pages add Create Practice set. Keep tools at the top right. Brand and account/navigation actions share a line whenever their content fits, wrapping naturally without a new breakpoint. Tools stay on the first row. Leave 2rem between the logo and account actions. The actions fill the available row, with flex groups for left-aligned welcome/profile controls and right-aligned navigation: Progress aligns at its right edge, immediately before the theme controls when everything fits on one line. Only move actions to a full-width second row when their natural contents cannot fit. Keep the profile switch secondary. On topic pages, make the existing Foundation maths subject eyebrow a link back to topics, preserving its muted uppercase appearance and font size. Do not add a separate breadcrumb or repeat the topic title. Keep Puzzles in the hamburger and on the homepage, not as a duplicate topic-header action; retain the Progress shortcut.

Below 440px, search/Go and Topic share one wrapping row above the subject/title. Reserve a 10rem search field plus Go and its gap before allowing the group to wrap (normally below 360px); keep the normal subject/title top margin, title-to-description and introduction-to-chevron spacing. From 440px, use two columns: title/description on the left and search/code plus topic selection on the right. Use the refined topic heading scale (1.75rem / 28px minimum, growing to 3.2rem) and preserve the established subject eyebrow styling. Let the title column retain its longest word intact. Transfer 0.75rem (12px) from the former 22rem control maximum to the column gap: 21.25rem controls maximum and 1.75rem gap. Use compact 14px controls; the closed Bits UI topic selector says “Topic”, with full names in its opened choices and the current topic identified by the heading. No duplicate Topic label above it. Keep Go beside the shorter “code or search” prompt; the last control in each row aligns to the right gutter; retain the full accessible input name. Descriptions use 14px below 768px and 16px above.

## Six-stage navigation and progress

Use one semantic navigation with joined, right-facing chevrons: six for method topics, five for dedicated problem-solving topics whose Independent practice is already problem solving. Omit stage numbers. Keep internal joins; the first button has a straight left edge with rounded outside corners, and the last has a straight right edge with rounded outside corners. First-button left padding is smaller because it has no notch. Earlier stages get a subtle tint indicating **sequence position, not completion**. The current stage remains clearly distinct.

Join adjacent chevrons without a transparent seam: only the border colour should show between their fills. Paint the exposed diagonal edges, including the notch on a wrapped row. Retain the existing 2px separators and 1px notch outlines in the theme border colour, above segment contents including completed Progress bars. Keep geometry and responsive row/focus behaviour in the shared ChevronSteps component, with one depth variable and adjacent first/last variations. Callers supply segment content. Progress uses level meters with zero padding on the adjoining sides: first right, middle left/right, last left. Keep equal outside padding on Progress, round only its two outside meter ends, clip all content to the segment outline even when max-width is set, and keep adjoining meter ends square so completed bars join. Do not patch individual stages or duplicate navigation markup. Labels must remain comfortably readable near tablet widths. Keep labels to at most two lines by grouping the phrase before the final word (for example, “Learn the” / “method” and “Spot the” / “error”). Let each segment retain its longest phrase plus horizontal padding (chevron depth + 0.5rem on each notched side); wrap intrinsically when the full navigation width cannot fit all stages. From 768px, retain a single stage row whenever it fits across the page; progress must not force an otherwise fitting row to wrap. The first row fills the available navigation width. Balance wrapped rows as evenly as measured phrase widths allow: six stages prefer 3 + 3, five prefer 3 + 2. Below 768px, equally populated rows all fill the navigation width; a shorter final row retains natural widths. Labels use one line where possible, but if the first row requires two lines, use two-line labels throughout the wrapped navigation. A small ResizeObserver helper groups stages using rendered phrase widths and existing padding; flexbox owns sizing within each row. Inset every row after the first by the shared chevron depth to cancel its leading segment’s negative notch margin; keep all forks within the navigation gutter. Include that inset when grouping rows. Keep keyboard focus on the same stage when regrouping. Mobile navigation fills its column; from 768px cap its width at 48.75rem (780px at the default root). This is a layout maximum, independent of the similarly valued question-column breakpoint.

| Relationship | Current choice |
| --- | --- |
| Stage labels | **0.9375rem** (15px at the 16px root), retaining larger navigation text within the smaller overall scale |
| Chevron dividers | **2px** outgoing diagonal strokes and **1px** notch outlines using the shared stage-border colour (`--line`); matching outer-edge geometry leaves no background gap |
| Intro → actual stage buttons | Fixed **2rem** for every stage; the stage header owns the gap, with no competing intro bottom margin |
| Vertical alignment | Keep stage buttons top-aligned with their fixed gap. At widths ≥768px, raise progress by **2.5em only when it fits alongside the complete stage row** using its own logical top margin; do not shift the navigation or narrow-screen progress |
| Stages beside progress | From **768px**, place progress alongside only when the measured compact single-row stage width, progress width and **2rem** gap all fit; otherwise retain full-width stages with progress below |
| Progress alignment | Compact block at the right gutter, **left-aligned content**; spare space belongs before the block, not after its visible contents |
| Progress rows | First: **Your progress [bar] [percentage]**. Second: **Level: [level]**, with notices beneath |
| Meter length | **4rem below 1024px**, **6rem at/above 1024px** |
| Progress wording | “Your progress”, “Level: [level]”; omit visible “recent success” |

Only scored practice has a header progress summary. Scaffolded-practice explanations belong in the activity panel. Assessment/demo must not reserve an empty progress column. Long trial/reassessment text must wrap inside a bounded summary; it must never squeeze the chevrons. A tall progress block must not supply the breathing room that is missing in other stages.

## Questions and working

Label the practice selector “Level”. Use a 60:40 question header: heading and Level on the left, with the “Check method” text link above the timer on the right. It opens the existing reference (dialog on phones, inline on larger screens).

Below 768px, main content panels across the site, including **all six learning stages**, puzzles, Progress, About and FAQ, fill the viewport width, with square corners and only top/bottom borders; gradient borders run horizontally. Keep inner text padding. From 768px restore the inset card and all four borders. Balance question counts across the fewest rows allowed by the current readable column capacity: four at a capacity of three use 2 + 2; five use 3 + 2; seven use 3 + 2 + 2. Full-width longer expressions separate runs that are balanced independently. Centre shorter rows and keep the same card widths rather than stretching them. Prefer two equal-width question buttons per row, including at 360px when their content fits; allow three from the registered wider-container threshold and a full-width row for longer expressions. Initial assessment prefers three equal row slots at any width where its expressions fit, wrapping naturally when they need more room. Keep expressions intact and readable; allow short previews to shrink only as far as 0.875rem (14px by default), then give longer questions a full-width slot. Never clip maths or shrink prose to force a column. Centre expressions within selector cards, put numbers at the top-left with their existing left inset, and keep result markers at the bottom-right. Reserve vertical clearance for these labels; do not include the number slot in horizontal equation padding. Current 4×4-digit multiplication questions should fit two per row at 360px within the same readable font bounds.

Centre the selected-question/working pair within a bounded width and a moderate gap; do not push the columns to opposite edges. Keep working in the same panel, beside the question when space permits and below it on narrow screens. Short answers need compact fields, not full-column inputs. When the working canvas occupies the second column, give it 1rem top margin. Submitted feedback spans both workspace columns; investigation feedback places its diagnosis beside its expandable corrected working at the existing 650px container breakpoint and stacks on smaller panels. Keep feedback before the canvas in the narrow reading order. After submission, retain the coloured diagnosis list and omit the duplicate disabled reason editor.

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

Method descriptions use 0.875rem (14px at the default root) below 768px and 1rem (16px) from 768px. Keep all numbered arithmetic steps visible, highlighting the current step; equation explanations accompany each revealed row and highlight the current row. Keep the general guide visible; do not repeat its instructions beneath the drawing. Keep calculation-specific working notes beneath arithmetic animations: diagonal totals and carries for multiplication, and quotients/remainders/decimal continuation for division. Only repeated general step instructions are omitted. These notes also remain in answer feedback; compact topic previews may omit them. Put the animated working directly below the question and above the playback controls. On entry, show the complete first teaching step as a static preview. Construction is a separate named step: show the empty grid/divider/bus stop before writing the operands in the next step. Play demo resets to its first reveal frame and animates from the beginning. Add later working as it is needed and let the controls move down naturally; do not reserve future equation rows or note blocks. Play may reposition once to the reading area, including arithmetic guidance; subsequent frames reveal newly clipped working with the minimum needed scrolling, without recentering or moving focus. Keep browser scroll anchoring disabled so the shared player controls this movement. Content that already fits and paused playback do not scroll; manual scrolling remains available.

Pause, resume, speed, replay and reduced motion must remain coherent. Static feedback and topic-card solutions stay complete. Written method working uses the extended Pacifico Maths pen paths; explanatory prose retains normal type. Highlighted working has no outline, reserves 2px horizontal padding and uses 85% background alpha to show underlying lines. Guide construction runs three times faster than number/character frames; the speed selector scales both. Equation explanations have no added horizontal gap before their working, and their highlight has no left accent. Final highlights hold for three seconds, then fade over one second; the written maths remains visible. Replay/navigation reset the fade, and reduced motion clears it instantly after the same hold. Playback controls are centred as a group and fit one row at 360px, with a compact speed selector named accessibly but no visible Speed label. Operation highlights follow the [method animation contract](METHOD_ANIMATIONS.md). Current-step descriptions remain visible alongside the operation-level highlighting.

## Responsive and implementation judgment

A wider viewport must not unexpectedly reduce usable width or column count. Use available container width for question/workspace layout, smooth padding where practical, and few purposeful breakpoints. Prefer phone layouts as base rules, with named larger-breakpoint overrides; retain max-width variants where they express a genuinely narrow-only adjustment more clearly. Keep layout ownership explicit: one source for each recurring relationship, shared semantic components/classes and deliberate variants. Avoid accumulated overrides, arbitrary offsets or copying markup to repair one state.

Before calling a visual change complete, inspect the user's actual state—not only a different state that happens to look good. Exercise all six stages, especially scaffolded text, assessment without progress and scored practice with progress. Check long/short topic titles, narrow screens and both sides of affected breakpoints. Verify actual button positions, text fit, common gutters and the different 1em/2em insets. Automated overflow checks alone do not prove tasteful spacing. Preserve previously accepted choices while changing the requested relationship.


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
| viewport-medium | Viewport, 768px | Full-width activity cards in all six stages with horizontal top/bottom borders, compact account text/equation styling and Progress page stacking below; inset cards at/above; stages/progress can sit alongside only when their measured contents fit. Also controls the method-reference dialog versus inline presentation. Consolidates 767/768 into one boundary, including fractional widths. |
| viewport-large | Viewport, 1024px | Changes progress meters from 4rem to 6rem, preserving the user's explicit visual decision. |
| viewport-progress-grid | Viewport, 678px | Below: the two-line progress grid fills its available row; at/above: it sizes to its contents. This inherited alignment threshold is not a device category or a control breakpoint. |
| viewport-reference-columns | Viewport, 1150px | At/above: reference and question panel sit alongside; below: inline reference and questions stack (until the medium boundary changes the reference to a dialog). Retained layout exception; evaluate both reading and working space before adjusting it. |
| question-three-columns | Question-panel container, 780px | At/above: three preferred practice question columns. Assessment already prefers three, with intrinsic expression widths deciding wrapping. Measures usable panel space after gutters/reference allocation, not viewport width. |
| question-working-columns | Question-panel container, 650px | Below: answers and working stack; at/above: they sit alongside. Retains the existing allocation for readable questions and useful writing space. |

Viewport tokens have the `--breakpoint-` prefix; container tokens have `--container-`. Registered viewport and container thresholds use px; topic-card widths use rem to follow text size. Keep viewport and container scales separate. `@theme static` exposes the register's values for browser consumers: PracticeActivity reads `--breakpoint-viewport-medium` and builds its `<` matchMedia query after mount. No separately maintained JavaScript number or fallback is allowed.

Thresholds within **20px in the same measurement scope** are strong consolidation candidates. Prefer an existing threshold unless content-fit evidence justifies another. A viewport threshold and a container threshold are not interchangeable simply because their values are close. Purpose-specific exceptions require a recorded rationale and boundary checks; do not invent historical rationale where none is recorded.

When changing a threshold, check below, at and above it, fractional container widths where relevant, all six stages, long/short expressions and open references. Existing presentation checks cover the viewport transitions, progress layout/meters, reference dialog/sidebar transitions and question/working container boundaries. Keep current visual choices elsewhere in this document aligned with the register.


## Content-sized controls and footer

Native single-choice selectors and file inputs size to their displayed option or filename, capped by their container. Use CSS `field-sizing: content`; older browsers retain normal intrinsic sizing. Keep the Bits UI Topic navigation control unchanged. Retain native keyboard/file-picker behaviour and sufficient arrow padding. Footer text and links are centred and include “Developed by Joe Hudson 2026”; omit the former practice/browser-storage slogan.

### Human Go board boundary exception

The human board uses half its previous combined panel-padding + board-margin gutter at **width <= 440px** (inclusive, explicitly requested on 12 October). The named `viewport-go-mobile` variant shares the 440px value but includes that endpoint; other `viewport-small` consumers retain their existing convention. Coordinates sit on all four sides. Preserve their font sizes and distance from the outer board edges when enlarging the inner grid towards them; do not push labels outward or enlarge them with the grid. Along each edge, align label centres exactly with the transformed grid lines. Ownership squares distinguish provisional score estimates from stones.

### Practice countdown

Place the transient timer at the top-right of the question header, with Timer/time above adjacent +/− controls and Start. Controls/label use muted text, while the time switches to normal ink after starting. Use no gap between the adjustment buttons; keep separation before Start/Pause/Resume/Reset. Wrap with the header when space is insufficient. No Chime checkbox.

The human Go playing area centres the board, setup/actions, timing controls and status text. Keep the title/rules row in its existing layout and preserve the mobile board gutters.

### Topic discovery refinements

Keep the heading/control row at 60:40. “Choose a topic” scales with its own available width and stays on one line. Search uses the placeholder “search”; sorting uses small native radios labelled “priority” and “a-z”. Each masonry card has an indivisible outer slot with enough top clearance for its rotated Draft stamp, including the first and last items in a column. Left-edge lattice carries sit near the trailing/lower end of their grid diagonal; bottom carries keep their accepted position. Lattice checks use one-significant-figure estimates.

Active question text has 0.5rem less bottom spacing before the answer controls than the standard selected-equation margin, bringing the Answer label closer without changing question typography.

Question buttons use `calc(1rem + 2px)` top/bottom content padding (18px at the default root) and 10px left/right. This is 2px more on every side than the initial shortened-button trial. Minimum height follows a 30px text/border floor plus twice the block padding: 66px at the default root, always at least the shared 44px control target. Corner question numbers retain their accepted position; only question-content padding changes. Number/result markers use single-line boxes; numbers use a 5px top inset (original 4px plus the final 1px downward refinement) and result markers use a 2px bottom inset.

Question numbers use 0.72rem (11.52px at the default root) and 90% opacity over their button surface: 10% smaller and visually quieter than the preceding 0.8rem marker. Retain their corner offsets and a fixed 0.8rem line height so reducing glyph size does not shrink the anchored line box; result markers keep their existing size, opacity and unitless line height.


Annotated equation animations allocate remaining table width to explanation text; each maths side uses its longest non-wrapping expression’s intrinsic width. Use 4px inner maths gutters and 2px outer RHS clearance, without positional transforms. At narrow mobile panel widths, maths may scale from 1.1rem to a 1rem floor to preserve RHS containment; explanation text keeps its size. Short working thus leaves more room for explanation while longer examples reserve their required space.

Topic-card calculation working is centred and scales modestly with the preview width (0.8–0.95rem); equation working uses 11.5% of that width rather than 10%. Preserve card boundaries, fractions and working order at narrow widths; headings and question text keep their existing alignment and size.


Topic-sort radios use zero label margins and a 0.25rem row gap (0.5rem column gap), preventing ordinary form-label spacing from spreading the compact priority/a–z choices vertically.

Calculation working uses explicit 0.25em spacing on both sides of the equals/approximation sign, including cards, so component whitespace removal cannot join the sign to a numeric or currency result.


## Error-working SVG bounds

Crop external working diagrams to measured ink bounds with a 12-unit margin on each side, preserving all mathematical paths/text. Set natural CSS dimensions to three quarters of those viewBox dimensions (20–22-unit writing becomes 15–16.5 CSS pixels). The themed wrapper fits its content, caps at available width, and never enlarges a short diagram to fill a wide panel. Retain themed paper/ink and accessible descriptions. The reproducible crop/check command is documented in the [website guide](../website/README.md#error-working-colours).


Error-working paper, ink and structural lines use `--error-paper`, `--error-ink` and `--error-line`. Their independent `--error-{paper,ink,line}-neutral-weight` defaults are 35% neutral / 65% theme: light paper white and ink black, reversed in dark mode. The previous 85% neutral mix was visually too close to plain white/black. CSS padding of 0.75rem belongs to the shared paper wrapper; renderer boundary margins do not replace it. SVG alpha-mask ink uses the foreground token for both text and strokes; HTML structural lines use the line token.

Chevron dividers and outlines use `--chevron-line`, defaulting to 75% preceding-stage fill / 25% theme text. `--chevron-previous-bg` owns that fill separately. Masonry column count stays CSS-owned; JavaScript divides the actual container width minus gaps evenly so rounded/stale track widths cannot move the last column outside its gutters.


Live spot-error working uses the method demonstrations’ Pacifico pen strokes. Marker strokes closely fit the written mathematical target, excluding line labels and spare row width. Keep the larger touch area separate from the visible mark; preserve the chisel shape and theme tokens.
