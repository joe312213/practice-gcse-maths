"""Easy non-calculator reasonableness checks; bounds are not exact-answer proofs."""
import math

def bounds(v):
 if v<10:return max(0,math.floor(v)-1),math.ceil(v)+1
 unit=10**(len(str(int(v)))-1);lo=int(v//unit)*unit;hi=lo+unit
 return lo,hi

def multiplication(a,b):
 la,ha=bounds(a) if a>=10 else (a,a);lb,hb=bounds(b) if b>=10 else (b,b)
 return f'Ballpark: {la:,} × {lb:,} = {la*lb:,}; {ha:,} × {hb:,} = {ha*hb:,}. The answer should be between {la*lb:,} and {ha*hb:,}. This checks the size, not every digit.'

def division(a,b):
 q=a/b;lo,hi=bounds(q)
 return f'Ballpark: {lo:,} × {b} = {lo*b:,}; {hi:,} × {b} = {hi*b:,}. Since {a:,} lies between these totals, expect a quotient between {lo:,} and {hi:,}. This does not prove the exact remainder or decimal.'
