"""Vertical-line balance working; compact mode keeps operations beside each step."""
from .canvas import Canvas

def draw(rows,slide=None,x=0,y=0,w=4.6,step=.43,size=21,compact=False):
 equations=[r for r in rows if r.get('kind')!='op'];h=(len(equations) if compact else len(rows))*step+.10;c=Canvas(w,h,slide,x,y);mid=w/2
 c.line(mid,.02,mid,h-.06,'8193A0',1.2);index=0
 for row in rows:
  operation=row.get('kind')=='op'
  if compact and operation:
   yy=(index-.45)*step
   c.text(.01,yy,.65,.24,row['l'],16,'left','3559A2');c.text(w-.66,yy,.65,.24,row['r'],16,'right','3559A2')
   continue
  yy=index*step;index+=1;color='3559A2' if operation else '182B3A';edge=.68 if compact else .04
  c.text(edge,yy,mid-.17-edge,.35,row['l'],size-3 if operation else size,'right',color)
  c.text(mid+.19,yy,mid-.19-edge,.35,row['r'],size-3 if operation else size,'left',color)
  if not operation:
   c.rect(mid-.12,yy,.24,.30);c.text(mid-.12,yy,.24,.30,'=',size,'center')
 return c.finish('Equation working: same operation on each side of the centre line')
