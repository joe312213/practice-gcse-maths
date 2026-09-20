# Shared slide layout requirements

Read this file when building or adjusting slides. Topic Markdown supplies the exact content; this file supplies shared visual requirements.

## Readability and diagrams

Use editable PowerPoint text and shapes for worked diagrams. Preserve whole questions above their worked steps; do not spread one calculation over several slides. Keep labels consistent, diagrams mathematically accurate, and digits and carries distinct. Use readable projected text rather than shrinking it to fit. Add a separate recap or answer page when needed.

For number-line tick labels, centre the digit portion (the absolute value), excluding the minus sign. The sign extends left. Apply this to positive, zero, negative and multi-digit values. A centred full label can be shifted left by half the measured minus-sign width in the actual font. Do not centre the sign and digits together or align by character count. The M13 generator implements this correction.

## Progression arrows

Place one bold, rounded, editable curved arrow below Guided towards Core and one below Core towards Depth on practice question slides. No adjacent prompt text. Do not add them to assessments, recaps, worked demos or answer slides.

The user's edited ratio v5 slide 2 is the approved shape, colour and placement reference:

- Curve down then up towards the next column, matching the supplied reference rotated a further 30° anticlockwise.
- Light peach: theme accent6 with lumMod 60000 and lumOff 40000 (40% lighter; approximately #FABF90 in the current theme).
- Width 0.68 inches; retain the shape's proportions and thick rounded stroke.
- Straddle the grid's bottom edge at each next-column boundary. Keep clear of question text and footers.
- Use the exact per-arrow offsets in [progression_arrow.json](progression_arrow.json), relative to the column boundary and grid bottom. Adapt these references to the actual layout; do not copy absolute positions between different grids.

Preserve user edits when modifying saved decks. When developing a new arrow shape, use an isolated preview before rebuilding decks. Routine application of the approved design does not require another approval.

## Focused visual checks

For a small layout correction, inspect the affected slide or diagram and confirm unrelated content was preserved. A full question audit or deck rebuild is unnecessary unless the change affects it. For new decks, check text fit, diagram accuracy and completeness, then render and inspect representative layouts and any dense or unusual slides.
