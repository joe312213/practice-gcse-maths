"""Purpose: Exact stacked fractions and equal-whole strips, as editable shapes or SVG.

Main contents:
- token
- mixed
- draw
- strips
- answer_html

Used By: scripts/build_fraction_topic.py, scripts/fraction_content.py.

Uses: scripts/rendering/canvas.py.

Libs: Python standard library only.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
import html,re
from fractions import Fraction
from .canvas import Canvas

def token(n,d=1):
 """Encode a reduced rational as an integer or stacked-fraction token.

 Parameters: n — number or numerator; d — structured topic or working data.
 Used by: mixed.
 """
 f=Fraction(n,d)
 return str(f.numerator) if f.denominator==1 else '{'+str(f.numerator)+'/'+str(f.denominator)+'}'
def mixed(f):
 """Format a positive improper fraction as a mixed number when appropriate.

 Parameters: f — rational value.
 Calls: token.
 """
 f=Fraction(f)
 if f>1 and f.denominator!=1:
  w,r=divmod(f.numerator,f.denominator);return str(w)+' '+token(r,f.denominator)
 return token(f)
def draw(lines,slide=None,x=0,y=0,w=4.6,step=.68,size=24):
 """Render stacked-fraction working lines as SVG and optional editable slide shapes.

 Parameters: lines — ordered working text lines; slide — editable PowerPoint slide; x — horizontal
 coordinate in inches; y — vertical coordinate in inches; w — width in inches; step — vertical line
 spacing in inches; size — font size in points.
 Calls: c.math, c.finish.
 """
 c=Canvas(w,len(lines)*step+.08,slide,x,y)
 for i,line in enumerate(lines):c.math(.08,i*step,line,size)
 return c.finish('Fraction working with numerators above denominators')
def strips(parts,shaded,slide=None,x=0,y=0,w=4.4):
 """Draw equal-whole fraction strips with the requested shaded parts.

 Parameters: parts — number of equal fraction parts; shaded — number of shaded parts; slide —
 editable PowerPoint slide; x — horizontal coordinate in inches; y — vertical coordinate in inches;
 w — width in inches.
 Calls: c.rect, c.finish.
 """
 c=Canvas(w,.55,slide,x,y)
 for i in range(parts):c.rect(i*w/parts,.05,w/parts,.40,'BBDDDD' if i<shaded else 'FFFFFF','3559A2')
 return c.finish(f'{shaded} of {parts} equal parts of one whole shaded')


def answer_html(value):
 """CSS-sized answer text: no empty SVG canvas that shrinks its contents.

 Parameters: value — text or numeric value to render.

 Example in the caller's context: answer_html(value)
 """
 parts=[];spoken=[]
 for part in re.split(r'(\{[^{}]+/[^{}]+\})',value):
  if not part:continue
  if part.startswith('{'):
   num,den=part[1:-1].split('/')
   parts.append('<span class="fraction"><span class="fraction-numerator">'+html.escape(num)+'</span><span class="fraction-denominator">'+html.escape(den)+'</span></span>')
   spoken.append(num+' over '+den)
  else:
   parts.append('<span>'+html.escape(part.strip())+'</span>');spoken.append(part.strip())
 return '<span class="math-answer" role="math" aria-label="'+html.escape(' '.join(spoken),quote=True)+'">'+''.join(parts)+'</span>'
