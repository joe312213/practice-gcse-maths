"""Purpose: Build M15 from reviewed structured content; compile all saved topics afterwards.

Main contents:
- base
- card
- assessment
- recap
- demo
- practice
- errors
- independent
- answer_card
- method_columns
- answers
- main

Used By: scripts/refresh_answers.py.

Uses: scripts/build_priority_topic.py, scripts/build_ratio.py, scripts/compile_starters.py, scripts/rendering/canvas.py, scripts/rendering/fractions.py, scripts/update_structure.py.

Libs: build_priority_topic, compile_starters.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
from pathlib import Path
import json,html
from fractions import Fraction as F
import update_structure as u
import build_ratio as b
from build_priority_topic import newdeck
from rendering.fractions import draw,strips,answer_html
from rendering.canvas import Canvas
ROOT=Path(__file__).resolve().parents[1];LABELS=['Start','Build','Confidence'];b.LABELS=LABELS

def base(p,d,subtitle,ref):
 """Create a topic slide with its title, subtitle and stable reference.

 Parameters: p — presentation or drawing surface; d — structured topic or working data; subtitle —
 slide subtitle; ref — stable slide reference.
 Calls: b.base.
 Used by: assessment, recap, demo, practice, errors, independent.
 """
 return b.base(p,d['title'],subtitle,ref)
def card(s,x,y,w,h):
 """Render a worked-example card from structured question data.

 Parameters: s — slide or source text as used by this helper; x — horizontal coordinate in inches; y
 — vertical coordinate in inches; w — width in inches; h — height in inches.
 Calls: b.rect.
 Used by: assessment, recap, demo, practice, errors.
 """
 b.rect(s,x,y,w,h,'FFFFFF',b.LINE)
def assessment(p,d):
 """Append the topic initial-assessment slide.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, card, b.text.
 Used by: main.
 """
 s=base(p,d,'Initial assessment • Calculate and simplify. Show your working.','M15-IA')
 for i,e in enumerate(d['assessment']):
  x=.42+i%2*7.65;y=1.65+i//2*3.3;card(s,x,y,7.48,3.08);b.text(s,x+.15,y+.2,.4,.4,str(i+1)+'.',23,True);draw([e['q']],s,x+.65,y+.3,w=6,size=29)
def recap(p,d):
 """Append the topic rules/technique recap slide.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, b.headers, card, b.text.
 Used by: main.

 Example in the caller's context: recap(p, d)
 """
 s=base(p,d,'Technique recap • Equal-sized parts before adding or subtracting.','M15-RECAP');left,cw=b.headers(s)
 for t in range(3):card(s,left+t*cw,1.75,cw-.04,6.65)
 x=left+.14;b.text(s,x,1.95,cw-.3,.5,'Keep the parts the same size',22,True)
 draw(['{1/3} = {2/6}','{1/3} + {1/6} = {2/6} + {1/6}','= {3/6} = {1/2}'],s,x,2.65,w=cw-.3,size=23)
 strips(3,1,s,x,4.95,cw-.35);strips(6,2,s,x,5.58,cw-.35)
 b.text(s,x,6.36,cw-.3,1.70,'The two strips are the same whole.\nMultiply top and bottom by 2: the value stays the same.',19)
 x=left+cw+.14;b.text(s,x,1.95,cw-.3,.5,'Use a common denominator',22,True)
 draw(['{3/4} − {1/6}','= {9/12} − {2/12}','= {7/12}'],s,x,2.65,w=cw-.3,size=24)
 b.text(s,x,5.15,cw-.3,2.9,'Choose a common multiple: 12.\nMultiply each numerator by the same factor as its denominator.\nOnly add or subtract the numerators.\nEqual fractions subtract to zero: 3/5 − 3/5 = 0.',19)
 x=left+2*cw+.14;b.text(s,x,1.95,cw-.3,.5,'Mixed numbers and simplifying',21,True)
 draw(['1 {1/3} = {4/3}','{4/3} − {3/4} = {16/12} − {9/12}','= {7/12}','{8/6} = {4/3} = 1 {1/3}'],s,x,2.65,w=cw-.3,size=23)
 b.text(s,x,5.80,cw-.3,2.30,'Whole × denominator + numerator gives the improper numerator.\nSimplify by dividing top and bottom by the same factor.\nFor a mixed answer, divide: quotient is the whole; remainder is the numerator.',18)
def demo(p,d):
 """Append the three-level worked-demo slide.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, b.headers, card, b.text.
 Used by: main.
 """
 s=base(p,d,'Worked demo • Calculate, simplify and give mixed answers where needed.','M15-S01');left,cw=b.headers(s)
 for t,e in enumerate(d['demo']):
  x=left+t*cw;card(s,x,1.75,cw-.04,6.65);draw(e['lines'],s,x+.12,2.03,w=cw-.3,step=.83,size=26)
  b.text(s,x+.14,6.52,cw-.32,1.60,e['method'],19)
def practice(p,d,idx):
 """Append one scaffolded practice slide from the structured topic data.

 Parameters: p — presentation or drawing surface; d — structured topic or working data; idx —
 zero-based practice-bank index.
 Calls: base, b.headers, b.rect, b.text, card, b.progression.
 Used by: main.

 Example in the caller's context: practice(p, d, idx)
 """
 s=base(p,d,f'Step-by-step practice {idx+1} • Calculate and simplify.','M15-S0'+str(idx+2));left,cw=b.headers(s,True)
 labels=['Question','Prepare the Fractions','Use a Common Denominator','Add or Subtract','Simplify the Answer'];prompts=['','Convert mixed numbers to improper fractions if needed.','Find a common multiple. Change top and bottom together.','Work with the numerators; keep the common denominator.','Divide top and bottom by a common factor. Give a mixed answer if greater than 1.'];y=1.73
 for r,h in enumerate([.90,1.25,1.45,1.35,1.63]):
  b.rect(s,.35,y,1.94,h,'E8EDF1',b.LINE);b.text(s,.44,y+.12,1.72,h-.20,labels[r],18,True)
  for t,e in enumerate(d['practice'][idx]):
   x=left+t*cw;card(s,x,y,cw-.025,h)
   if r==0:draw([e['q']],s,x+.12,y+.10,w=cw-.3,size=23)
   else:b.text(s,x+.12,y+.15,cw-.28,h-.25,prompts[r],19)
  y+=h
 b.progression(s,True)
def errors(p,d):
 """Append authored error-spotting examples with stable question references.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, b.headers, card, b.text.
 Used by: main.
 """
 s=base(p,d,'Spot the errors • Find the first wrong step and correct the full calculation.','M15-SE');left,cw=b.headers(s)
 for t,col in enumerate(d['errors']):
  for i,e in enumerate(col):
   x=left+t*cw;y=1.78+i*2.23;card(s,x,y,cw-.035,2.16);b.text(s,x+.10,y+.14,.50,.4,str(i+1)+'.',20,True)
   draw(e['wrong_lines'],s,x+.50,y+.07,w=cw-.65,step=.64,size=22)
def independent(p,d,idx):
 """Append one three-level independent practice grid.

 Parameters: p — presentation or drawing surface; d — structured topic or working data; idx —
 zero-based practice-bank index.
 Calls: base, b.headers, b.rect, b.text, b.progression.
 Used by: main.
 """
 s=base(p,d,f'Independent practice {idx+1} • Simplify; write mixed answers if greater than 1.','M15-S0'+str(idx+4));left,cw=b.headers(s)
 for t,col in enumerate(d['banks'][idx]):
  for i,e in enumerate(col):
   x=left+t*cw;y=1.73+i*1.10;b.rect(s,x,y,cw-.025,1.10,'FFFFFF' if i%2==0 else b.TINT[t],b.LINE);b.text(s,x+.10,y+.28,.50,.40,str(i+1)+'.',20,True);draw([e['q']],s,x+.57,y+.19,w=cw-.7,size=25)
 b.progression(s)
def answer_card(e,label,wrong=False):
 """Render a fraction answer card including working and optional diagnostic feedback.

 Parameters: e — structured question/example; label — accessible SVG label; wrong — whether to
 include deliberately incorrect working.
 Used by: answers.
 """
 out='<article><h4>'+label+'</h4>'
 if wrong:out+='<p><strong>Incorrect working</strong></p>'+draw(e['wrong_lines'])+'<p><strong>First error:</strong> '+html.escape(e['correction'])+'</p>'
 out+='<p><strong>Answer / Method</strong></p>'+draw(e['lines'])
 if not wrong:out+='<p>'+html.escape(e['method'])+'</p>'
 return out+'<p><strong>Check:</strong> '+html.escape(e['check'])+'</p></article>'
def method_columns(examples):
 """Build method, diagnostic-error and check cells for each example.

 Parameters: examples — structured worked examples.
 Used by: answers.
 """
 return [{'Method':'<strong>Q'+str(q)+'</strong>'+draw(e['lines'])+'<p>'+html.escape(e['method'])+'</p>',
          'If you got…':'If your parts changed size during addition or subtraction, check the common denominator. Change top and bottom together before calculating.',
          'Check':html.escape(e['check'])} for q,e in examples]

def answers(d):
 """Render the topic answer sections as HTML.

 Parameters: d — structured topic or working data.
 Calls: method_columns, answer_card.
 Used by: main.

 Example in the caller's context: answers(d)
 """
 out=[u.answer_layout.opening('M15',d['title']),'<h3>M15-IA — Initial assessment</h3>']
 out.append(u.answer_layout.assessment_cell([f'<strong>Q{i+1}</strong>'+draw(e['lines']) for i,e in enumerate(d['assessment'])]))
 for sn,col in enumerate(d['practice']):out.append('<h3>M15-S0'+str(sn+2)+' — Scaffolded practice '+str(sn+1)+'</h3>'+u.answer_layout.method_table(sn+2,method_columns([(1,e) for e in col])))
 out.append('<h3>M15-SE — Spot the errors: corrections</h3><div class="three-columns">')
 for t,col in enumerate(d['errors']):out.append('<div><h4>'+LABELS[t]+'</h4>'+''.join(answer_card(e,f'Q{i+1}',True) for i,e in enumerate(col))+'</div>')
 out.append('</div>')
 for sn,cols in enumerate(d['banks']):
  out.append(f'<h3>M15-S0{sn+4} — Independent practice {sn+1}</h3><table><tr><th>Q</th>'+''.join('<th>'+v+'</th>' for v in LABELS)+'</tr>')
  for i in range(6):out.append('<tr><td>'+str(i+1)+'</td>'+''.join('<td>'+answer_html(col[i]['answer'])+'</td>' for col in cols)+'</tr>')
  selected=[((sn+t)%6+1,col[(sn+t)%6]) for t,col in enumerate(cols)]
  out.append('</table>'+u.answer_layout.method_table(sn+4,method_columns(selected)))
  out.append('<details><summary>Full working for every question</summary><div class="three-columns">')
  for t,col in enumerate(cols):out.append('<div><h4>'+LABELS[t]+'</h4>'+''.join(answer_card(e,f'Q{i+1}') for i,e in enumerate(col))+'</div>')
  out.append('</div></details>')
 return ''.join(out)+'</div></section>'
def main():
 """Run the build fraction topic command using its configured input and output paths.
 Calls: assessment, recap, demo, practice, errors, independent, u.save, u.save_text, u.page,
 answers.

 Example in the caller's context: main()
 """
 d=json.loads((ROOT/'content/M15_fractions.json').read_text());p=newdeck();assessment(p,d);recap(p,d);demo(p,d)
 for i in range(2):practice(p,d,i)
 errors(p,d)
 for i in range(4):independent(p,d,i)
 for cols in d['banks']:
  assert len({e['value'] for col in cols for e in col})==18
  for col in cols:
   assert len(col)==6
   for e in col:assert F(e['value'])==(F(e['a'])+F(e['b']) if e['sign']=='+' else F(e['a'])-F(e['b']))
 assert len({F(e[k]) for col in d['errors'] for e in col for k in ('value','wrong_value')})==18
 folder=ROOT/'topics'/d['folder'];folder.mkdir(exist_ok=True);u.save(p,folder/(d['stem']+'_questions.pptx'));u.save_text(folder/(d['stem']+'_answers.html'),u.page([]).replace('</html>',answers(d)+'</html>'))
 registry=json.loads((ROOT/'content/topic_registry.json').read_text());registry=[t for t in registry if t['id']!='M15'];registry.insert(4,{k:d[k] for k in ('id','folder','stem','title')});(ROOT/'content/topic_registry.json').write_text(json.dumps(registry,indent=2)+'\n')
 (folder/'README.md').write_text('# M15 — Fraction addition and subtraction\n\n[Questions](Fraction_addition_subtraction_M15_questions.pptx) · [HTML answers](Fraction_addition_subtraction_M15_answers.html)\n\nTen slides: assessment, recap, demo, two scaffolded practices, nine worked errors, four independent grids (72 questions). Exact content: `content/M15_fractions.json`. Build: `python3 scripts/build_fraction_topic.py`. Current filenames are stable; history is retained in Git; do not create backup copies. Built for review.\n')
 source=['# M15 — Fraction addition and subtraction','Built for review. Stacked fractions are rendered from `{numerator/denominator}` tokens. Exact content: `M15_fractions.json`.','Structure: IA → recap with equal-whole strips → demo → two scaffolded practices → nine worked errors → four independent grids.','Rows: Prepare the Fractions → Use a Common Denominator → Add or Subtract → Simplify the Answer.']
 sets=[('IA',d['assessment']),('Demo',d['demo'])]+[(f'Practice {i+1}',c) for i,c in enumerate(d['practice'])]+[(f'SE {LABELS[t]}',c) for t,c in enumerate(d['errors'])]+[(f'Independent {sn+1} {LABELS[t]}',c) for sn,cols in enumerate(d['banks']) for t,c in enumerate(cols)]
 for title,es in sets:
  source.append('\n## '+title)
  for i,e in enumerate(es):source.append(f'\n### Q{i+1}: '+e['q']+'\n\n'+'\n\n'.join(e['lines'])+'\n\nCheck: '+e['check']+ ('\n\nIncorrect working:\n\n'+'\n\n'.join(e['wrong_lines'])+'\n\nCorrection: '+e['correction'] if 'wrong_lines' in e else ''))
 (ROOT/'content/M15_fraction_addition_subtraction.md').write_text('\n'.join(source)+'\n')
 from compile_starters import compile_all
 compile_all()
 print('M15 exact arithmetic and answer variety checked.')
if __name__=='__main__':main()
