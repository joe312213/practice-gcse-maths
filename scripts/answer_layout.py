"""Shared student HTML layout and deterministic worked-example rendering."""
import html,re
from rendering import lattice,bus_stop,estimates,applications,signed_numbers,ratio
from pathlib import Path

def stylesheet():
 return (Path(__file__).resolve().parents[1]/'styles/answers.css').read_text()

def opening(mid,title):
 return f'<section id="{mid}" class="topic"><aside class="topic-rail"><span>{html.escape(title)}</span></aside><div class="topic-content"><h2>{mid} — {html.escape(title)}</h2>'
def worked(mid,body,markdown,sn):
 body=clean_method_source(body,sn)
 if mid=='M03' and '### Worked method continuation' in body:
  first='630 pens' in body
  examples=([('Start','42 packs each contain 15 pens. How many pens?', [('multiply',42,15)],'630 pens.'),('Build','215 apples are packed in bags of six. How many full bags?', [('divide',215,6)],'35 full bags; five apples remain.'),('Confidence','A painter charges £32 per hour for 18 hours, plus £120 for paint. Total cost?', [('multiply',18,32)],'£576 + £120 = £696.')]
   if first else [('Start','168 students are shared equally among seven groups. How many per group?', [('divide',168,7)],'24 students per group.'),('Build','16 hours of work at £27 per hour. Total pay?', [('multiply',16,27)],'£432.'),('Confidence','Vans each take eight passengers and cost £45 to hire. Cost of enough vans for 157 passengers?', [('divide',157,8),('multiply',20,45)],'19 vans leave five passengers behind. Hire 20 vans: £900.')])
  cards=[]
  for label,q,steps,final in examples:
   diagrams=applications.draw(steps[:1])
   if len(steps)>1:diagrams+='<p>Round 19 r 5 up to 20 vans before finding the cost.</p>'+applications.draw(steps[1:])
   cards.append('<article><h4>'+label+' · Q1</h4><p>'+html.escape(q)+'</p>'+diagrams+'<p>'+html.escape(final)+'</p></article>')
  return markdown(body.split('### Worked method continuation')[0])+'<h4>Worked diagrams and steps</h4><div class="three-columns">'+''.join(cards)+'</div>'
 if mid not in ('M01','M02'):return markdown(body)
 examples=re.findall(r'\*\*(Start|Build|Confidence) — Q(\d+): ([\d,]+) [×÷] ([\d,]+)\*\*',body)
 if not examples:return markdown(body)
 head=body.split('### Worked diagrams and steps')[0];checks=[];cards=[]
 for label,q,a,b in examples:
  a=int(a.replace(',',''));b=int(b.replace(',',''))
  if mid=='M01':
   checks.append(estimates.multiplication(a,b));visual=lattice.draw(a,b);note='Add each diagonal from bottom right. Small orange digits are carries, not answer digits.'
  else:
   checks.append(estimates.division(a,b));visual=bus_stop.draw(a,b,decimal=label=='Confidence');note='Read quotient digits in their place-value columns. Carry each small remainder into the next digit.'
  cards.append(f'<article><h4>{label} · Q{q}</h4>{visual}<p>{note}</p></article>')
 head=re.sub(r'^\| Check \|.*$',lambda m:'| Check | '+' | '.join(checks)+' |',head,flags=re.M)
 return markdown(head)+'<h4>Worked diagrams and steps</h4><div class="three-columns">'+''.join(cards)+'</div>'


def corrected(mid,e):
 if mid=='M01':visual=lattice.draw(e['a'],e['b'])
 elif mid=='M02':
  a,b=re.findall(r'[\d,]+',e['question'])[:2];visual=bus_stop.draw(int(a.replace(',','')),int(b.replace(',','')),decimal='.' in e['correct_result'])
 elif mid=='M13':visual=signed_numbers.draw(e['correct_lines'])
 elif mid=='M04':visual=ratio.draw(e['correct_left'],e['correct_right'],e['correct_final'])
 elif mid=='M03':visual=applications.draw(e['correct_steps'])
 else:return ''
 return '<p><strong>Correct working</strong></p>'+visual


def method_title(sn):
 return 'Method and error check — '+('scaffolded practice '+str(sn-1) if sn<4 else 'practice '+str(sn-3))

def clean_method_source(body,sn):
 body=re.sub(r'^(?:Full-answer page:|Show this on a second answer page|Each column identifies the question).*\n?', '', body,flags=re.M)
 pattern=r'^### (?:Method, errors and checks|Method and error page|Diagnostic page[^\n]*)$'
 title='### '+method_title(sn)
 if re.search(pattern,body,re.M):body=re.sub(pattern,title,body,flags=re.M)
 elif '| Method |' in body:body=title+'\n\n'+body
 return body

def assessment_cell(items):
 return '<table class="assessment"><tbody><tr><td><div class="assessment-items">'+''.join('<div class="assessment-item">'+item+'</div>' for item in items)+'</div></td></tr></tbody></table>'

def method_table(sn,columns):
 out='<h4>'+method_title(sn)+'</h4><div class="table"><table class="method-table"><thead><tr><th>Label</th>'+''.join('<th>'+label+'</th>' for label in ('Start','Build','Confidence'))+'</tr></thead><tbody>'
 for key in ('Method','If you got…','Check'):
  out+='<tr><th scope="row">'+key+'</th>'+''.join('<td>'+col[key]+'</td>' for col in columns)+'</tr>'
 return out+'</tbody></table></div>'

