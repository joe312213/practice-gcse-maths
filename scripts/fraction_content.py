"""Explicit, reproducible M15 question content, using exact rational arithmetic."""
from pathlib import Path
from fractions import Fraction as F
from math import lcm
import random,json
from rendering.fractions import token,mixed
ROOT=Path(__file__).resolve().parents[1]
def raw(n,d):return '{'+str(n)+'/'+str(d)+'}'
def example(a,b,sign='+',show_mixed=False):
 a,b=F(a),F(b);v=a+b if sign=='+' else a-b;den=lcm(a.denominator,b.denominator);an=a.numerator*(den//a.denominator);bn=b.numerator*(den//b.denominator);num=an+bn if sign=='+' else an-bn
 fmt=mixed if show_mixed else token;q=fmt(a)+' '+sign+' '+fmt(b);lines=[q]
 if show_mixed and (a>1 or b>1):lines.append('= '+token(a)+' '+sign+' '+token(b))
 equal=raw(an,den)+' '+sign+' '+raw(bn,den)
 if a.denominator!=b.denominator:lines.append('= '+equal)
 lines.append('= '+raw(num,den))
 if raw(num,den)!=mixed(v):lines.append('= '+mixed(v))
 return dict(q=q,a=str(a),b=str(b),sign=sign,answer=mixed(v),value=str(v),lines=lines,check=('Addition should make the answer larger than either positive fraction.' if sign=='+' else 'Subtracting a positive fraction should make the answer smaller.'),method='Use equal-sized parts; change numerator and denominator together, then add or subtract only the numerators. Simplify the result.')
def make():
 ia=[example(F(2,7),F(3,7)),example(F(7,9),F(2,9),'−'),example(F(1,3),F(1,6)),example(F(4,3),F(3,4),'−',True)]
 demo=[example(F(3,8),F(1,8)),example(F(5,6),F(1,3),'−'),example(F(4,3),F(3,4),'−',True)]
 practice=[[example(F(2,9),F(5,9)),example(F(3,4),F(1,8),'−'),example(F(7,5),F(2,3),'+',True)], [example(F(7,10),F(3,10),'−'),example(F(2,3),F(5,9)),example(F(9,4),F(5,6),'−',True)]]
 rng=random.Random(1515);pools=[[],[],[]]
 for da in range(3,13):
  for db in range(3,13):
   level=0 if da==db else 1 if max(da,db)%min(da,db)==0 else 2
   if level==2 and lcm(da,db)>36:continue
   for na in range(1,da):
    for nb in range(1,db):
     if F(na,da).denominator!=da or F(nb,db).denominator!=db:continue
     for sign in ('+','−'):
      a,b=F(na,da),F(nb,db)
      if level==2 and rng.random()<.55:a+=rng.choice([1,2])
      if sign=='−' and a<b:a,b=b,a
      e=example(a,b,sign,level==2)
      if 0<=F(e['value'])<=4:pools[level].append(e)
 for pool in pools:rng.shuffle(pool)
 banks=[];usedq=set();frequency={}
 for sn in range(4):
  usedvalues=set();cols=[]
  for level,pool in enumerate(pools):
   col=[];ops={'+':0,'−':0}
   for e in pool:
    if e['q'] in usedq or e['value'] in usedvalues or ops[e['sign']]>=3 or frequency.get(e['value'],0)>=2:continue
    col.append(e);usedq.add(e['q']);usedvalues.add(e['value']);frequency[e['value']]=frequency.get(e['value'],0)+1;ops[e['sign']]+=1
    if len(col)==6:break
   assert len(col)==6
   rng.shuffle(col);cols.append(col)
  banks.append(cols)
 specs=[
 (F(2,7),F(3,7),'+',False,['{2/7} + {3/7}','= {5/14}'],'5/14','Keep denominator 7: both fractions already count sevenths.'),
 (F(9,11),F(2,11),'−',False,['{9/11} − {2/11}','= {11/11}','= 1'],'1','This is subtraction: 9 − 2 = 7, not 9 + 2.'),
 (F(5,12),F(3,12),'+',False,['{5/12} + {3/12}','= {8/12}','= {4/12}'],'1/3','To simplify, divide both numerator and denominator by 4: 8/12 = 2/3.'),
 (F(1,3),F(1,6),'+',False,['{1/3} + {1/6}','= {1/6} + {1/6}','= {2/6}'],'1/3','Changing thirds to sixths also doubles the numerator: 1/3 = 2/6.'),
 (F(7,8),F(1,4),'−',False,['{7/8} − {1/4}','= {7/8} − {1/8}','= {6/8}'],'3/4','A quarter is 2/8, not 1/8. Subtract 2 eighths.'),
 (F(2,5),F(3,10),'+',False,['{2/5} + {3/10}','= {4/10} + {3/10}','= {7/20}'],'7/20','Once parts have the same size, keep denominator 10.'),
 (F(5,3),F(1,4),'−',True,['1 {2/3} − {1/4}','= {3/3} − {1/4}','= {9/12}'],'3/4','Convert 1 2/3 to (1 × 3 + 2)/3 = 5/3 first.'),
 (F(7,4),F(2,3),'+',True,['1 {3/4} + {2/3}','= {9/12} + {8/12}','= 1 {5/12}'],'17/12','The whole 1 was dropped. Use 7/4 + 2/3 = 29/12.'),
 (F(13,6),F(3,4),'−',True,['2 {1/6} − {3/4}','= {26/12} − {9/12}','= {17/12}','= 1 {7/12}'],'19/12','17 ÷ 12 leaves remainder 5, not 7: the mixed answer is 1 5/12.')]
 specs[3]=(F(1,4),F(3,8),'+',False,['{1/4} + {3/8}','= {1/8} + {3/8}','= {4/8}'],'1/2','Changing quarters to eighths doubles the numerator: 1/4 = 2/8.')
 specs[4]=(F(11,12),F(1,3),'−',False,['{11/12} − {1/3}','= {11/12} − {1/12}','= {10/12}'],'5/6','A third is 4/12, not 1/12. Subtract 4 twelfths.')
 specs[6]=(F(7,3),F(1,4),'−',True,['2 {1/3} − {1/4}','= {3/3} − {1/4}','= {9/12}'],'3/4','Convert 2 1/3 to (2 × 3 + 1)/3 = 7/3 first.')
 specs[8]=(F(13,6),F(1,2),'−',True,['2 {1/6} − {1/2}','= {13/6} − {3/6}','= {10/6} = 1 {3/6}'],'3/2','10 ÷ 6 leaves remainder 4, not 3. Write 1 4/6, then simplify to 1 2/3.')
 errors=[]
 for a,b,sign,show,wrong,value,fix in specs:
  e=example(a,b,sign,show);e.update(wrong_lines=wrong,wrong_value=value,correction=fix);assert F(e['value'])!=F(value);errors.append(e)
 assert len({F(e[k]) for e in errors for k in ('value','wrong_value')})==18
 data=dict(id='M15',title='Adding and subtracting fractions',folder='fractions_add_subtract',stem='Fraction_addition_subtraction_M15',assessment=ia,demo=demo,practice=practice,banks=banks,errors=[errors[:3],errors[3:6],errors[6:]])
 (ROOT/'content/M15_fractions.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
 return data
if __name__=='__main__':make()
