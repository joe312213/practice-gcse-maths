/**
 * Purpose: Render theme-independent pen, eraser and guide strokes without changing their saved coordinates or colours.
 *
 * Main contents:
 * - Pen/eraser widths; INK_COLOURS; inkColour; drawStroke.
 *
 * Used By: WorkingArea.svelte.
 *
 * Uses: No local modules.
 *
 * Libs: None; uses the supplied canvas context.
 */
export const PEN_WIDTH = 3;
// A circular eraser has five times the pen's area, not five times its diameter.
export const ERASER_WIDTH = PEN_WIDTH * Math.sqrt(5);
export const INK_COLOURS = [
  { id: 'black', label: 'Black', h: 0, s: 0, l: 0 },
  { id: 'green', label: 'Pastel green', h: 140, s: 35, l: 38 },
  { id: 'blue', label: 'Blue', h: 215, s: 55, l: 43 },
  { id: 'red', label: 'Red', h: 355, s: 50, l: 43 },
];
/**
 * Resolve a logical colour id for the requested dark mode. Called by drawStroke.
 */
export function inkColour(id, dark = false) {
  const colour = INK_COLOURS.find((item) => item.id === id) ?? INK_COLOURS[0];
  return `hsl(${colour.h} ${colour.s}% ${dark ? 100 - colour.l : colour.l}%)`;
}
/**
 * Paint stroke points/tool/colour on ctx for the requested dark mode, restoring canvas state afterwards.
 * Calls inkColour; used by WorkingArea for live ink and replay.
 * @example drawStroke(ctx, { tool: "pen", colour: "red", points: [[10, 20]] }, false);
 */
export function drawStroke(ctx, stroke, dark = false) {
  const { points, tool, colour } = stroke;
  if (!points.length) return;
  ctx.save();
  ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = ctx.fillStyle = inkColour(colour, dark);
  ctx.lineWidth = tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH;
  ctx.lineCap = ctx.lineJoin = 'round';
  ctx.beginPath();
  if (points.length === 1) {
    ctx.arc(...points[0], ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(...points[0]);
    for (const point of points.slice(1)) ctx.lineTo(...point);
    ctx.stroke();
  }
  ctx.restore();
}
