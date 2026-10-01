"""Finished lattice multiplication: exact cells, diagonal digits and separate carries."""
from .canvas import Canvas

def draw(a,b,slide=None,x=0,y=0,cell=.64):
 aa,bb=str(a),str(b);n,m=len(aa),len(bb);w=max(3,n*cell+1.1);h=m*cell+1.38;c=Canvas(w,h,slide,x,y);gx=.46;gy=.46
 for j,d in enumerate(aa):c.text(gx+j*cell,gy-.35,cell,.3,d,22,'center',bold=True)
 for i,d in enumerate(bb):c.text(gx+n*cell+.08,gy+i*cell+.18,.36,.3,d,22,'center',bold=True)
 sums=[0]*(n+m)
 for i,db in enumerate(bb):
  for j,da in enumerate(aa):
   xx=gx+j*cell;yy=gy+i*cell;t,u=divmod(int(da)*int(db),10);k=n+m-2-i-j;sums[k]+=u;sums[k+1]+=t
   c.line(xx,yy+cell,xx+cell,yy,'8193A0');c.text(xx+.03,yy+.02,cell*.45,.30,t,20,'center');c.text(xx+cell*.50,yy+cell*.49,cell*.45,.30,u,20,'center')
 for j in range(n+1):c.line(gx+j*cell,gy,gx+j*cell,gy+m*cell)
 for i in range(m+1):c.line(gx,gy+i*cell,gx+n*cell,gy+i*cell)
 carry=0;digits=[]
 for k,v in enumerate(sums):
  incoming=carry;total=v+carry;digit=total%10;carry=total//10;digits.append(str(digit))
  if k==n+m-1 and digit==0:continue
  if k<n:xx=gx+(n-1-k)*cell;yy=gy+m*cell+.22
  else:xx=.06;yy=gy+(m-1-(k-n))*cell+.17
  c.text(xx,yy,.36,.31,digit,23,'center','176B73',True)
  if incoming:
   cx=gx+(n-1-k)*cell+.02 if k<n else gx-.18
   cy=gy+m*cell+.02 if k<n else gy+(m-1-(k-n))*cell+.01
   c.text(cx,cy,.16,.17,incoming,11,'center','B14F00')
 assert int(''.join(reversed(digits)))==a*b
 c.text(.1,h-.37,w-.2,.32,f'{a:,} × {b:,} = {a*b:,}',20,'center',bold=True)
 return c.finish(f'Completed lattice for {a} times {b}')
