"""Purpose: Readable one-transformation-per-line signed arithmetic.

Main contents:
- draw

Used By: scripts/answer_layout.py.

Uses: scripts/rendering/canvas.py.

Libs: Python standard library only.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
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
