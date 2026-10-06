"""Purpose: Render labelled ratio calculations as a compact written-work block.

Main contents:
- draw

Used By: scripts/answer_layout.py.

Uses: scripts/rendering/canvas.py.

Libs: Python standard library only.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
from .canvas import Canvas

def draw(left,right,final):
 """Render left/right labelled ratio working and the final answer.

 Parameters: left — left-hand working lines; right — right-hand working lines; final — final answer
 text.
 Calls: c.text, c.finish.
 """
 c=Canvas(5,1.65)
 for x,lines in [(.05,left),(2.55,right)]:
  for i,line in enumerate(lines):c.text(x,i*.35,2.4,.31,line,19)
 c.text(.05,1.20,4.85,.35,final,20)
 return c.finish('Ratio working')
