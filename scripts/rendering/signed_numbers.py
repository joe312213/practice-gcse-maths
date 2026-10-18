"""Purpose: Readable one-transformation-per-line signed arithmetic.

Main contents:
- draw: Render one signed-number transformation per line.

Used By: scripts/answer_layout.py.

Uses: scripts/rendering/canvas.py.

Libs: Python standard library only.

Usage and output: Import from legacy answer/deck publishers; pass the operands or working
records to the listed functions. Returns SVG/HTML, or draws into a caller-supplied slide; does
not save files.
"""
from .canvas import Canvas

def draw(lines):
 """Render one signed-number transformation per line.

 Parameters: lines — ordered working text lines.
 Calls: c.text, c.finish.
 """
 c=Canvas(4.7,max(1,len(lines)*.43))
 for i,line in enumerate(lines):c.text(.12,i*.43,4.4,.36,line,23)
 return c.finish('Signed-number working')
