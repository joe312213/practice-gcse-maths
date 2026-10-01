"""Exact stacked fractions and equal-whole strips, as editable shapes or SVG."""
import html,re
from fractions import Fraction
from .canvas import Canvas

def token(n,d=1):
 f=Fraction(n,d)
 return str(f.numerator) if f.denominator==1 else '{'+str(f.numerator)+'/'+str(f.denominator)+'}'
def mixed(f):
 f=Fraction(f)
 if f>1 and f.denominator!=1:
  w,r=divmod(f.numerator,f.denominator);return str(w)+' '+token(r,f.denominator)
 return token(f)
def draw(lines,slide=None,x=0,y=0,w=4.6,step=.68,size=24):
 c=Canvas(w,len(lines)*step+.08,slide,x,y)
 for i,line in enumerate(lines):c.math(.08,i*step,line,size)
 return c.finish('Fraction working with numerators above denominators')
def strips(parts,shaded,slide=None,x=0,y=0,w=4.4):
 c=Canvas(w,.55,slide,x,y)
 for i in range(parts):c.rect(i*w/parts,.05,w/parts,.40,'BBDDDD' if i<shaded else 'FFFFFF','3559A2')
 return c.finish(f'{shaded} of {parts} equal parts of one whole shaded')


def answer_html(value):
 """CSS-sized answer text: no empty SVG canvas that shrinks its contents."""
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
