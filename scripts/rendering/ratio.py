"""Render labelled ratio calculations as a compact written-work block."""
from .canvas import Canvas

def draw(left,right,final):
 c=Canvas(5,1.65)
 for x,lines in [(.05,left),(2.55,right)]:
  for i,line in enumerate(lines):c.text(x,i*.35,2.4,.31,line,19)
 c.text(.05,1.20,4.85,.35,final,20)
 return c.finish('Ratio working')
