"""Finished short division: aligned digits, carried remainders and decimal extension."""
from fractions import Fraction
from .canvas import Canvas

def state(a,b,decimal=False):
 ds=list(str(a));qs=[];rs=[];r=0
 for d in ds:
  rs.append(r);q,r=divmod(r*10+int(d),b);qs.append(str(q))
 if decimal and r:
  ds.append('.');qs.append('.');rs.append(0);count=0
  while r and count<10:
   ds.append('0');rs.append(r);q,r=divmod(r*10,b);qs.append(str(q));count+=1
  if r:raise ValueError('Recurring decimal: use a remainder or fraction for this worked example.')
 for i,q in enumerate(qs):
  if q=='0' and i<len(str(a))-1:qs[i]=''
  else:break
 return ds,qs,rs,r

def draw(a,b,decimal=False,slide=None,x=0,y=0):
 ds,qs,rs,r=state(a,b,decimal);step=.46;w=max(3.5,len(ds)*step+1.15);c=Canvas(w,1.80,slide,x,y);gx=.63;gy=.64
 c.line(gx-.08,gy,gx+len(ds)*step+.08,gy,width=1.5);c.line(gx-.08,gy,gx-.08,gy+.43,width=1.5);c.text(.03,gy+.06,.43,.35,b,24,'right')
 for i,d in enumerate(ds):
  xx=gx+i*step;c.text(xx,gy+.07,step,.36,d,25,'center');c.text(xx,gy-.41,step,.37,qs[i],25,'center','176B73',True)
  if rs[i]:c.text(xx-.075,gy+.012,.22,.18,rs[i],11,'center','B14F00')
 qv=a//b;answer=(str(float(Fraction(a,b))).rstrip('0').rstrip('.') if decimal else str(qv)+(' r '+str(a%b) if a%b else ''))
 if r:c.text(gx+len(ds)*step+.07,gy-.36,.70,.35,'r '+str(r),18)
 c.text(.08,1.33,w-.16,.35,f'{a:,} ÷ {b} = {answer}',21,'center',bold=True)
 return c.finish(f'Completed bus-stop division for {a} divided by {b}')
