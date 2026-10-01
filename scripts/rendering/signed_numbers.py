"""Readable one-transformation-per-line signed arithmetic."""
from .canvas import Canvas

def draw(lines):
 c=Canvas(4.7,max(1,len(lines)*.43))
 for i,line in enumerate(lines):c.text(.12,i*.43,4.4,.36,line,23)
 return c.finish('Signed-number working')
