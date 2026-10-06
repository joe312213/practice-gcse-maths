"""Purpose: Create the explicit M10 source bank using exact linear arithmetic.

Main contents:
- n
- signed
- ax
- affine
- eq
- op
- make
- build

Used By: manual legacy command invocation.

Uses: no local module imports.

Libs: Python standard library only.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
from pathlib import Path
from fractions import Fraction as F
from collections import Counter
import random,json
ROOT=Path(__file__).resolve().parents[1]
def n(x):
 """Format an exact rational as an integer, terminating decimal or fraction.

 Parameters: x — horizontal coordinate in inches.
 Used by: signed, ax, make.
 """
 x=F(x)
 return str(x.numerator) if x.denominator==1 else str(float(x)) if x.denominator in (2,4,5,8,10) else f'{x.numerator}/{x.denominator}'
def signed(v):
 """Format a signed additive term, omitting zero.

 Parameters: v — numeric value.
 Calls: n.
 Used by: affine, make.
 """
 return (' + '+n(v)) if v>0 else (' − '+n(-v)) if v<0 else ''
def ax(a):
 """Format an x coefficient, suppressing unit magnitude.

 Parameters: a — first operand or coefficient.
 Calls: n.
 Used by: affine, make.
 """
 return 'x' if a==1 else '−x' if a==-1 else n(a)+'x'
def affine(a,b):
 """Format ax + b with normalized signs.

 Parameters: a — first operand or coefficient; b — second operand or constant.
 Calls: ax, signed.
 Used by: make.
 """
 return ax(a)+signed(b)
def eq(l,r):
 """Create a balanced equation row from left and right text.

 Parameters: l — left-hand equation text; r — right-hand equation text.
 Used by: make, build.
 """
 return dict(l=str(l),r=str(r))
def op(v):
 """Create an operation row applying the same operation to both sides.

 Parameters: v — numeric value.
 Used by: make, build.
 """
 return dict(l=v,r=v,kind='op')
def make(kind,s,a=3,b=4,c=1,flip=False):
 """Construct a linear equation with known solution and explicit balanced working for the selected
 operation kind.

 Parameters: kind — question or operation variant; s — slide or source text as used by this helper;
 a — first operand or coefficient; b — second operand or constant; c — coefficient or drawing colour
 as used here; flip — whether to swap equation sides.
 Calls: signed, eq, n, op, ax, affine.
 Used by: build.

 Example in the caller's context: make(kind, s, a, b, c, flip)
 """
 s=F(s);balance=[]
 if kind in ('add','sub'):
  b=abs(b)*(1 if kind=='add' else -1);rhs=s+b;lhs='x'+signed(b)
  balance=[eq(lhs,n(rhs)),op(('− ' if b>0 else '+ ')+n(abs(b))),eq('x',n(s))]
  wrong=rhs+b;bad=f'x = {n(rhs)}'+signed(b)+f' = {n(wrong)}';reason='The added/subtracted amount must be undone using its inverse.'
  lc,lb,rc,rb=1,b,0,rhs
 elif kind=='mul':
  rhs=a*s;lhs=ax(a);balance=[eq(lhs,n(rhs)),op('÷ '+n(a)),eq('x',n(s))]
  wrong=rhs-a;bad=f'x = {n(rhs)} − {a} = {n(wrong)}';reason='A coefficient multiplies x; undo it by dividing, not subtracting.';lc,lb,rc,rb=a,0,0,rhs
 elif kind=='div':
  rhs=s/a;lhs=f'x ÷ {a}';balance=[eq(lhs,n(rhs)),op('× '+n(a)),eq('x',n(s))]
  wrong=rhs/a;bad=f'x = {n(rhs)} ÷ {a} = {n(wrong)}';reason='Undo division by multiplying both sides.';lc,lb,rc,rb=F(1,a),0,0,rhs
 elif kind in ('two','collect','reverse'):
  rhs=a*s+b;lhs=affine(a,b);lc,lb,rc,rb=a,b,0,rhs
  if kind=='collect':
   lhs=affine(a-1,0)+' + x'+signed(b);balance=[eq(lhs,n(rhs)),eq(affine(a,b),n(rhs))]
  elif kind=='reverse':
   lhs=n(b)+' + '+ax(a);balance=[eq(lhs,n(rhs))]
  else:balance=[eq(lhs,n(rhs))]
  balance += [op(('− ' if b>0 else '+ ')+n(abs(b))),eq(ax(a),n(a*s)),op('÷ '+n(a)),eq('x',n(s))]
  wrong=(rhs+b)/a;bad=f'{ax(a)} = {n(rhs)}'+signed(b)+f' = {n(rhs+b)}; x = {n(wrong)}';reason='Undo the constant with its inverse on both sides before dividing.'
 else:
  if kind=='bracket':
   lhs=f'{a}(x'+signed(b)+')';rhs=n(a*(s+b));lc,lb,rc,rb=a,a*b,0,a*(s+b)
   balance=[eq(lhs,rhs),op('÷ '+n(a)),eq('x'+signed(b),n(s+b)),op(('− ' if b>0 else '+ ')+n(abs(b))),eq('x',n(s))]
   wrong=(rb-b)/a;bad=f'{affine(a,b)} = {rhs}; {ax(a)} = {n(rb-b)}; x = {n(wrong)}';reason='The multiplier applies to every term in the bracket. Dividing both whole sides first is shorter here.'
  elif kind=='factor':
   lhs=affine(a,a*b);rhs=n(a*(s+b));lc,lb,rc,rb=a,a*b,0,a*(s+b)
   balance=[eq(lhs,rhs),eq(f'{a}(x'+signed(b)+')',rhs),op('÷ '+n(a)),eq('x'+signed(b),n(s+b)),op(('− ' if b>0 else '+ ')+n(abs(b))),eq('x',n(s))]
   wrong=rb/a-a*b;bad=f'x'+signed(a*b)+f' = {n(rb/a)}; x = {n(wrong)}';reason='When dividing a whole side, divide every term. Factoring out the common factor makes this visible.'
  else:
   lc,lb,rc=a,(a*b if kind=='both_bracket' else b),c
   rb=(lc-rc)*s+lb
   lhs=f'{a}(x'+signed(b)+')' if kind=='both_bracket' else affine(a,b)
   rhs=affine(c,rb)
   balance=[eq(lhs,rhs)]
   if kind=='both_bracket':balance.append(eq(affine(lc,lb),rhs))
   balance += [op('− '+ax(c)),eq(affine(lc-rc,lb),n(rb)),op(('− ' if lb>0 else '+ ')+n(abs(lb))),eq(ax(lc-rc),n(rb-lb)),op('÷ '+n(lc-rc)),eq('x',n(s))]
   wrong=(rb-lb)/(lc+rc);bad=f'{affine(lc+rc,lb)} = {n(rb)}; x = {n(wrong)}';reason='Remove an x-term by subtracting it from both sides; do not change just one side or add unlike terms.'
  if kind in ('bracket','factor'):pass
 lhs0,rhs0=balance[0]['l'],balance[0]['r']
 if flip and kind in ('add','sub','mul','two'):
  balance[0]=eq(rhs0,lhs0);balance.insert(1,eq(lhs0,rhs0));lhs0,rhs0=rhs0,lhs0
 left=lc*s+lb;right=rc*s+rb;assert left==right
 return dict(q=lhs0+' = '+rhs0,answer=n(s),balance=balance,check=f'At x = {n(s)}, left side = {n(left)} and right side = {n(right)}.',wrong=n(wrong),error_work=bad,error_note=reason,kind=kind,coefficients=[n(lc),n(lb),n(rc),n(rb)])

def build():
 """Create reproducible equation examples and write the structured source bank.
 Calls: make, eq, op.

 Example in the caller's context: build()
 """
 rng=random.Random(10012026)
 # Mix solutions rather than keeping the consecutive answer sequences in the old draft.
 pool=list(range(-8,28));rng.shuffle(pool);pool2=pool[:];rng.shuffle(pool2);solutions=[pool[:18],pool[18:],pool2[:18],pool2[18:]]
 guided=['add','sub','mul','div']*6;core=['two','collect','reverse']*8;depth=['bracket','both','both_bracket','factor']*6
 for kinds in (guided,core,depth):rng.shuffle(kinds)
 banks=[];seen=set()
 for sn in range(4):
  cols=[[],[],[]]
  for t,kinds in enumerate((guided,core,depth)):
   for i in range(6):
    kind=kinds[sn*6+i];s=solutions[sn][t*6+i];a=rng.randint(2,7);b=rng.choice([-9,-7,-5,-3,2,4,6,8]);c=rng.randint(1,a-1)
    # One-step division starts from whole-number data, not an unmodelled decimal RHS.
    if kind=='div':a=rng.choice([2,3,4,5]);item=make('div',s*a,a,b,c)
    else:item=make(kind,s,a,b,c,flip=(i%3==1))
    while item['q'] in seen:item=make(kind,s,a,b+2,c)
    seen.add(item['q']);cols[t].append(item)
  # Division adjustments can collide: choose a different accessible integer solution.
  used=set()
  for col in cols:
   for i,e in enumerate(col):
    if e['answer'] in used:
     replacement=next(v for v in [31,29,-12,34,-15,37] if str(v) not in used)
     col[i]=make(e['kind'] if e['kind']!='div' else 'sub',replacement,3,5,1);e=col[i]
    used.add(e['answer'])
  banks.append(cols)
 ia=[make('add',17,b=6),make('mul',7,a=5),make('two',9,a=3,b=-4),make('both_bracket',8,a=2,b=3,c=1)]
 demo=[make('sub',12,b=7),make('two',7,a=4,b=3),make('both_bracket',9,a=3,b=2,c=1)]
 practice=[[make('sub',23,b=8),make('two',6,a=5,b=7),make('both_bracket',4,a=3,b=4,c=1)], [make('mul',-3,a=6),make('two',8,a=4,b=-9),make('both_bracket',11,a=5,b=-2,c=2)]]
 errors=[]
 raw=[
('x + 8 = 19','11','27',[eq('x + 8','19'),dict(l='+ 8',r='+ 8',kind='op'),eq('x','27')],'Adding 8 does not undo +8. Subtract 8 from both sides: x = 11.','11 + 8 = 19.'),
('x − 5 = 8','13','3',[eq('x − 5','8'),op('− 5'),eq('x','3')],'Undo −5 by adding 5 to both sides: x = 13.','13 − 5 = 8.'),
('6x = 24','4','18',[eq('6x','24'),op('− 6'),eq('x','18')],'6x means 6 times x. Divide both sides by 6: x = 4.','6 × 4 = 24.'),
('3x + 6 = 30','8','12',[eq('3x + 6','30'),dict(l='− 6',r='+ 6',kind='op'),eq('3x','36'),op('÷ 3'),eq('x','12')],'The operations differ across the line. Subtract 6 from both sides: 3x = 24, so x = 8.','3 × 8 + 6 = 30.'),
('4x − 8 = 16','6','2',[eq('4x − 8','16'),dict(l='+ 8',r='− 8',kind='op'),eq('4x','8'),op('÷ 4'),eq('x','2')],'Add 8 to both sides: 4x = 24, then x = 6.','4 × 6 − 8 = 16.'),
('5x + 10 = 45','7','-1',[eq('5x + 10','45'),op('÷ 5'),eq('x + 10','9'),op('− 10'),eq('x','−1')],'The entire left side must be divided: x + 2 = 9, so x = 7. Alternatively subtract 10 first.','5 × 7 + 10 = 45.'),
('2(x + 5) = 30','10','12.5',[eq('2(x + 5)','30'),eq('2x + 5','30'),op('− 5'),eq('2x','25'),op('÷ 2'),eq('x','12.5')],'Multiply both bracket terms by 2: 2x + 10 = 30. A shorter route is divide both sides by 2 first: x + 5 = 15, then x = 10.','2 × (10 + 5) = 30.'),
('4x + 3 = 2x + 33','15','5',[eq('4x + 3','2x + 33'),dict(l='+ 2x',r='− 2x',kind='op'),eq('6x + 3','33'),op('− 3'),eq('6x','30'),op('÷ 6'),eq('x','5')],'Subtract 2x from both sides: 2x + 3 = 33; 2x = 30; x = 15.','4 × 15 + 3 = 2 × 15 + 33 = 63.'),
('3(x − 4) = x − 16','-2','-6',[eq('3(x − 4)','x − 16'),eq('3x − 4','x − 16'),op('− x'),eq('2x − 4','−16'),op('+ 4'),eq('2x','−12'),op('÷ 2'),eq('x','−6')],'Expand the whole bracket: 3x − 12 = x − 16. Subtract x, then add 12: 2x = −4, so x = −2.','3 × (−2 − 4) = −2 − 16 = −18.')]
 for q,ans,wrong,rows,fix,check in raw:errors.append(dict(q=q,answer=ans,wrong=wrong,balance=rows,correction=fix,check=check))
 correct=[[{'l': 'x + 8', 'r': '19'}, {'l': '− 8', 'r': '− 8', 'kind': 'op'}, {'l': 'x', 'r': '11'}], [{'l': 'x − 5', 'r': '8'}, {'l': '+ 5', 'r': '+ 5', 'kind': 'op'}, {'l': 'x', 'r': '13'}], [{'l': '6x', 'r': '24'}, {'l': '÷ 6', 'r': '÷ 6', 'kind': 'op'}, {'l': 'x', 'r': '4'}], [{'l': '3x + 6', 'r': '30'}, {'l': '− 6', 'r': '− 6', 'kind': 'op'}, {'l': '3x', 'r': '24'}, {'l': '÷ 3', 'r': '÷ 3', 'kind': 'op'}, {'l': 'x', 'r': '8'}], [{'l': '4x − 8', 'r': '16'}, {'l': '+ 8', 'r': '+ 8', 'kind': 'op'}, {'l': '4x', 'r': '24'}, {'l': '÷ 4', 'r': '÷ 4', 'kind': 'op'}, {'l': 'x', 'r': '6'}], [{'l': '5x + 10', 'r': '45'}, {'l': '− 10', 'r': '− 10', 'kind': 'op'}, {'l': '5x', 'r': '35'}, {'l': '÷ 5', 'r': '÷ 5', 'kind': 'op'}, {'l': 'x', 'r': '7'}], [{'l': '2(x + 5)', 'r': '30'}, {'l': '÷ 2', 'r': '÷ 2', 'kind': 'op'}, {'l': 'x + 5', 'r': '15'}, {'l': '− 5', 'r': '− 5', 'kind': 'op'}, {'l': 'x', 'r': '10'}], [{'l': '4x + 3', 'r': '2x + 33'}, {'l': '− 2x', 'r': '− 2x', 'kind': 'op'}, {'l': '2x + 3', 'r': '33'}, {'l': '− 3', 'r': '− 3', 'kind': 'op'}, {'l': '2x', 'r': '30'}, {'l': '÷ 2', 'r': '÷ 2', 'kind': 'op'}, {'l': 'x', 'r': '15'}], [{'l': '3(x − 4)', 'r': 'x − 16'}, {'l': '3x − 12', 'r': 'x − 16'}, {'l': '− x', 'r': '− x', 'kind': 'op'}, {'l': '2x − 12', 'r': '-16'}, {'l': '+ 12', 'r': '+ 12', 'kind': 'op'}, {'l': '2x', 'r': '-4'}, {'l': '÷ 2', 'r': '÷ 2', 'kind': 'op'}, {'l': 'x', 'r': '-2'}]]
 for e,rows in zip(errors,correct):e['correct_balance']=rows
 data=dict(id='M10',title='Solving equations',folder='equations',stem='Solving_equations_M10',assessment=ia,demo=demo,practice=practice,banks=banks,errors=[errors[:3],errors[3:6],errors[6:]],rows=['Simplify the Equation','Use Inverse Operations','Find the Unknown','Check by Substitution'],prompts=['Collect like terms or factorise if useful. Copy the equation with a line through the equals sign.','Write the same operation on both sides. Choose an operation that makes the equation simpler.','Continue until x is alone. Keep the left and right sides balanced.','Put your value into the original equation. Work out both sides and compare.'])
 (ROOT/'content/M10_equations.json').write_text(json.dumps(data,indent=2,ensure_ascii=False)+'\n')
 print('M10 explicit source: 4 assessment, 3 demo, 6 scaffolded, 72 independent, 9 error questions.')
if __name__=='__main__':build()
