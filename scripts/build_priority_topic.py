"""Purpose: Build one explicitly requested priority topic, then compile saved topics.

Main contents:
- headers
- base
- newdeck
- equation_recap
- assessment
- demo
- practice
- errors
- independent
- card
- compact_assessment_steps
- method_columns
- answer_body
- content_md
- validate
- main

Used By: scripts/build_fraction_topic.py, scripts/refresh_answers.py.

Uses: scripts/build_ratio.py, scripts/compile_starters.py, scripts/rendering/equations.py, scripts/update_structure.py.

Libs: Pillow (font measurement/image rendering), compile_starters, python-pptx (editable slides and deck inspection).

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
from pathlib import Path
import json,sys,html,re
from fractions import Fraction
from collections import Counter
from pptx import Presentation
from pptx.util import Inches
import update_structure as u
import build_ratio as b
from rendering.equations import draw as balance
ROOT=Path(__file__).resolve().parents[1]
LABELS=['Start','Build','Confidence']
b.LABELS=LABELS

def headers(s,grid=False):
 """Draw the three challenge-column headers and return their layout origin and width.

 Parameters: s — slide or source text as used by this helper; grid — whether to use the working-grid
 geometry.
 Calls: b.headers.
 Used by: equation_recap, demo, practice, errors, independent.
 """
 return b.headers(s,grid)
def base(p,d,sub,ref):
 """Create a topic slide with its title, subtitle and stable reference.

 Parameters: p — presentation or drawing surface; d — structured topic or working data; sub — slide
 subtitle; ref — stable slide reference.
 Calls: b.base.
 Used by: equation_recap, assessment, demo, practice, errors, independent.
 """
 return b.base(p,d['title'],sub,ref)
def newdeck():
 """Create a blank widescreen PowerPoint presentation.
 Used by: main.
 """
 p=Presentation();p.slide_width=Inches(16);p.slide_height=Inches(9);return p

def equation_recap(p,d):
 """Append the equation technique recap with balanced worked examples.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, headers, b.rect, b.text.
 Used by: main.

 Example in the caller's context: equation_recap(p, d)
 """
 s=base(p,d,'Technique recap • Simplify first, then keep both sides equal.','M10-RECAP');left,cw=headers(s)
 blocks=[('Keep the balance',[dict(l='x + 7',r='19'),dict(l='− 7',r='− 7',kind='op'),dict(l='x',r='12')],
 'Do the same operation to both whole sides.\n\nUndo addition/subtraction before a remaining multiplication or division.\n\nA negative divided by a positive is negative: −12 ÷ 3 = −4.'),
 ('Simplify or factorise',[dict(l='6x + 12',r='30'),dict(l='6(x + 2)',r='30'),dict(l='÷ 6',r='÷ 6',kind='op'),dict(l='x + 2',r='5'),dict(l='− 2',r='− 2',kind='op'),dict(l='x',r='3')],
 'Collect like terms: 2x + 3x = 5x.\n\nA common factor belongs to every term: 6x + 12 = 6(x + 2).'),
 ('Choose a short first step',[dict(l='3(x + 4)',r='27'),dict(l='÷ 3',r='÷ 3',kind='op'),dict(l='x + 4',r='9'),dict(l='− 4',r='− 4',kind='op'),dict(l='x',r='5')],
 'Here, divide by 3 before expanding.\n\nWith x on both sides, subtract the smaller x-term first when convenient.\n\nIf expanding is needed, multiply every bracket term. Check in the original equation.')]
 for t,(title,rows,tip) in enumerate(blocks):
  x=left+t*cw;b.rect(s,x,1.78,cw-.04,6.65,'FFFFFF',b.LINE);b.text(s,x+.12,1.94,cw-.30,.5,title,22,True)
  balance(rows,s,x+.15,2.58,cw-.34,.40,21)
  b.text(s,x+.15,5.12,cw-.34,3.03,tip,19)

def assessment(p,d):
 """Append the topic initial-assessment slide.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, b.rect, b.text.
 Used by: main.
 """
 s=base(p,d,'Initial assessment • Solve all four. Show your working.','M10-IA')
 for i,e in enumerate(d['assessment']):
  x=.42+(i%2)*7.64;y=1.64+(i//2)*3.30;b.rect(s,x,y,7.48,3.08,'FFFFFF',b.LINE);b.text(s,x+.2,y+.3,7.05,1.1,f'{i+1}.  '+e['q'],29,True)

def demo(p,d):
 """Append the three-level worked-demo slide.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, headers, b.rect, b.text.
 Used by: main.
 """
 s=base(p,d,'Worked demo • Follow the working down each side of the line.','M10-S01');left,cw=headers(s)
 for t,e in enumerate(d['demo']):
  x=left+t*cw;b.rect(s,x,1.76,cw-.035,6.6,'FFFFFF',b.LINE);b.text(s,x+.12,1.94,cw-.30,.5,e['q'],25,True)
  balance(e['balance'],s,x+.12,2.7,cw-.30,.44,22)
  b.text(s,x+.12,7.28,cw-.30,.95,e['check'],18)

def practice(p,d,idx):
 """Append one scaffolded practice slide from the structured topic data.

 Parameters: p — presentation or drawing surface; d — structured topic or working data; idx —
 zero-based practice-bank index.
 Calls: base, headers, b.rect, b.text, b.line, b.progression.
 Used by: main.

 Example in the caller's context: practice(p, d, idx)
 """
 s=base(p,d,f'Step-by-step practice {idx+1} • Copy the centre line and show each operation.','M10-S0'+str(idx+2));left,cw=headers(s,True)
 y=1.73;heights=[.65,1.05,2.05,1.15,1.68]
 for r,h in enumerate(heights):
  b.rect(s,.35,y,1.94,h,'E8EDF1',b.LINE);b.text(s,.44,y+.12,1.73,h-.2,'Equation' if r==0 else d['rows'][r-1],18,True)
  for t,e in enumerate(d['practice'][idx]):
   x=left+t*cw;b.rect(s,x,y,cw-.025,h,'FFFFFF',b.LINE)
   b.text(s,x+.10,y+.10,cw-.25,h-.17,e['q'] if r==0 else d['prompts'][r-1],21 if r==0 else 18,r==0)
   if r==2:b.line(s,x+cw/2,y+1.18,x+cw/2,y+h-.12,'8193A0')
  y+=h
 b.progression(s,True)

def errors(p,d):
 """Append authored error-spotting examples with stable question references.

 Parameters: p — presentation or drawing surface; d — structured topic or working data.
 Calls: base, headers, b.rect, b.text.
 Used by: main.
 """
 s=base(p,d,'Spot the errors • Find the first wrong step, correct it and finish.','M10-SE');left,cw=headers(s)
 for t,col in enumerate(d['errors']):
  x=left+t*cw
  for i,e in enumerate(col):
   y=1.78+i*2.23;b.rect(s,x,y,cw-.035,2.16,'FFFFFF',b.LINE);b.text(s,x+.1,y+.06,cw-.25,.38,f'{i+1}.  '+e['q'],21,True)
   balance(e['balance'],s,x+.12,y+.55,cw-.30,.30,20,compact=True)

def independent(p,d,idx):
 """Append one three-level independent practice grid.

 Parameters: p — presentation or drawing surface; d — structured topic or working data; idx —
 zero-based practice-bank index.
 Calls: base, headers, b.rect, b.text, b.progression.
 Used by: main.
 """
 s=base(p,d,f'Independent practice {idx+1} • Solve each equation and check by substitution.','M10-S0'+str(idx+4));left,cw=headers(s)
 for t,col in enumerate(d['banks'][idx]):
  for i,e in enumerate(col):
   x=left+t*cw;y=1.73+i*1.10;b.rect(s,x,y,cw-.025,1.10,'FFFFFF' if i%2==0 else b.TINT[t],b.LINE)
   b.text(s,x+.10,y+.22,.4,.6,str(i+1)+'.',20,True);b.text(s,x+.53,y+.22,cw-.66,.65,e['q'],24)
 b.progression(s)

def card(e,heading,wrong=False):
 """Render a worked-example card from structured question data.

 Parameters: e — structured question/example; heading — answer-section heading; wrong — whether to
 include deliberately incorrect working.
 Used by: answer_body.

 Example in the caller's context: card(e, heading, wrong)
 """
 rows=e['balance'];out='<article><h4>'+html.escape(heading+' — '+e['q'])+'</h4>'
 if wrong:
  out+='<p><strong>Shown incorrect working</strong></p>'+balance(rows)
  out+='<p><strong>Answer:</strong> x = '+e['answer']+'</p><p><strong>Method / first error:</strong> '+html.escape(e['correction'])+'</p>'
  out+='<p><strong>Correct working</strong></p>'+balance(e['correct_balance'])
 else:
  out+='<p><strong>Answer:</strong> x = '+e['answer']+'</p>'+balance(rows)
  out+='<p><strong>If you got x = '+e['wrong']+':</strong> '+html.escape(e['error_work']+' '+e['error_note'])+'</p>'
 return out+'<p><strong>Check:</strong> '+html.escape(e['check'])+'</p></article>'

def compact_assessment_steps(rows):
 """Remove division-by-one operations and adjacent duplicate balance rows for assessment answers.

 Parameters: rows — ordered equation or working rows.
 Used by: answer_body.
 """
 result=[]
 for row in rows:
  if row.get('kind')=='op' and row['l']==row['r']=='÷ 1':continue
  if result and row==result[-1]:continue
  result.append(row)
 return result

def method_columns(examples):
 """Build method, diagnostic-error and check cells for each example.

 Parameters: examples — structured worked examples.
 Used by: answer_body.
 """
 return [{'Method':'<strong>Q'+str(q)+': '+html.escape(e['q'])+'</strong>'+balance(e['balance']),
          'If you got…':'x = '+e['wrong']+': '+html.escape(e['error_work']+' '+e['error_note']),
          'Check':html.escape(e['check'])} for q,e in examples]

def answer_body(d):
 """Render all equation answer sections as HTML.

 Parameters: d — structured topic or working data.
 Calls: compact_assessment_steps, method_columns, card.
 Used by: main.

 Example in the caller's context: answer_body(d)
 """
 out=[u.answer_layout.opening('M10','Solving equations')+'<h3>M10-IA — Initial assessment</h3>']
 out.append(u.answer_layout.assessment_cell([f'<strong>Q{i+1}. x = {e["answer"]}</strong>'+balance(compact_assessment_steps(e['balance'])) for i,e in enumerate(d['assessment'])]))
 for j,col in enumerate(d['practice']):
  out.append(f'<h3>M10-S0{j+2} — Scaffolded practice {j+1}</h3>'+u.answer_layout.method_table(j+2,method_columns([(1,e) for e in col])))
 out.append('<h3>M10-SE — Spot the errors</h3><div class="three-columns">')
 for t,col in enumerate(d['errors']):
  out.append('<div><h4>'+LABELS[t]+'</h4>')
  for i,e in enumerate(col):out.append(card(e,'Q'+str(i+1),True))
  out.append('</div>')
 out.append('</div>')
 for sn,cols in enumerate(d['banks']):
  out.append(f'<h3>M10-S0{sn+4} — Independent practice {sn+1}</h3><table><tr><th>Q</th>'+''.join('<th>'+v+'</th>' for v in LABELS)+'</tr>')
  for i in range(6):out.append('<tr><td>'+str(i+1)+'</td>'+''.join('<td>x = '+c[i]['answer']+'</td>' for c in cols)+'</tr>')
  selected=[((sn*2+t+1)%6+1,col[(sn*2+t+1)%6]) for t,col in enumerate(cols)]
  out.append('</table>'+u.answer_layout.method_table(sn+4,method_columns(selected)))
  out.append('<details><summary>Full working for every question</summary><div class="three-columns">')
  for t,col in enumerate(cols):out.append('<div><h4>'+LABELS[t]+'</h4>'+''.join(card(e,f'Q{i+1}') for i,e in enumerate(col))+'</div>')
  out.append('</div></details>')
 return ''.join(out)+'</div></section>'

def content_md(d):
 """Render the structured equation bank into its human-readable Markdown specification.

 Parameters: d — structured topic or working data.
 Used by: main.

 Example in the caller's context: content_md(d)
 """
 out=['# M10 — Solving equations','', '**Status: Built for review under the user’s instruction.** Replaces the earlier patterned draft. Exact structured source: `M10_equations.json`.','', 'Method: vertical line through the equals sign; apply operations to both whole sides. Simplify like terms, factorise a common factor where helpful, divide out an outer multiplier before expanding when shorter, and remove the smaller x-term first when convenient. Check by substituting into the original equation.','']
 sets=[('IA',d['assessment']),('S01',d['demo']),('S02',d['practice'][0]),('S03',d['practice'][1])]
 sets += [(f'SE-{LABELS[t]}',col) for t,col in enumerate(d['errors'])]
 sets += [(f'S{sn+4:02}-{LABELS[t]}',col) for sn,cols in enumerate(d['banks']) for t,col in enumerate(cols)]
 for ref,items in sets:
  out+=['## '+ref,'']
  for i,e in enumerate(items):
   out += [f'### Q{i+1}: {e["q"]}','', 'Answer: x = '+e['answer'],'', '\n'.join(r['l']+(' | ' if r.get('kind')=='op' else ' = ')+r['r'] for r in e['balance']),'',('Correction: '+e['correction']) if 'correction' in e else ('Possible error: '+e['error_work']+' '+e['error_note']),'', 'Check: '+e['check'],'']
 return '\n'.join(out)

def validate(d):
 # Exact arithmetic checks for new content, not a regression suite for existing decks.
 """Assert authored mathematical answers and content invariants before publishing outputs.

 Parameters: d — structured topic or working data.
 Used by: main.

 Example in the caller's context: validate(d)
 """
 for e in d['assessment']+d['demo']+sum(d['practice'],[])+[e for cols in d['banks'] for col in cols for e in col]:
  a,b0,c,d0=map(Fraction,e['coefficients']);x=Fraction(e['answer']);assert a*x+b0==c*x+d0,e['q']
 for cols in d['banks']:
  vals=[e['answer'] for col in cols for e in col];assert len(vals)==len(set(vals)),vals
 vals=[Fraction(e[k]) for col in d['errors'] for e in col for k in ('answer','wrong')];assert len(vals)==len(set(vals))
 from PIL import ImageFont
 issues=[]
 for value,w,h,size,bold in b.checks:
  font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial'+(' Bold' if bold else '')+'.ttf',round(size*4));count=0
  for para in value.split('\n'):
   ln='';n=1
   for word in para.split():
    trial=(ln+' '+word).strip()
    if font.getlength(trial)>(w-.12)*72*4 and ln:n+=1;ln=word
    else:ln=trial
   count+=n
  if count*size*1.05>(h-.05)*72+2:issues.append(value)
 if issues:raise ValueError('New text does not fit: '+repr(issues))
 print('New equations: exact solutions, distinct slide answers and text fit checked.')

def main():
 """Run the build priority topic command using its configured input and output paths.
 Calls: newdeck, assessment, equation_recap, demo, practice, errors, independent, validate, u.save,
 u.page, answer_body, u.save_text, content_md.

 Example in the caller's context: main()
 """
 d=json.loads((ROOT/'content/M10_equations.json').read_text());p=newdeck()
 assessment(p,d);equation_recap(p,d);demo(p,d)
 for i in range(2):practice(p,d,i)
 errors(p,d)
 for i in range(4):independent(p,d,i)
 validate(d)
 folder=ROOT/'topics'/d['folder'];folder.mkdir(exist_ok=True)
 u.save(p,folder/(d['stem']+'_questions.pptx'))
 page=u.page([]).replace('</html>',answer_body(d)+'</html>')
 u.save_text(folder/(d['stem']+'_answers.html'),page)
 (ROOT/'content/M10_solving_equations.md').write_text(content_md(d))
 (folder/'README.md').write_text('# M10 — Solving equations\n\n[Questions](Solving_equations_M10_questions.pptx) · [HTML answers](Solving_equations_M10_answers.html)\n\nTen slides: assessment, technique recap, worked demo, two scaffolded practices, spot the errors and four independent grids. Uses the vertical-line balancing method, simplification, basic factorising and efficient starting-operation tips. 72 independent questions; full answers and nine error corrections.\n\nSource: `content/M10_equations.json`. Build: `python3 scripts/build_priority_topic.py`; the build compiles all registered topics. Current filenames have no version suffix; history is retained in Git; do not create backup copies. Built for user review.\n')
 registry=json.loads((ROOT/'content/topic_registry.json').read_text());registry=[t for t in registry if t['id']!='M10'];registry.insert(3,{k:d[k] for k in ('id','folder','stem','title')});(ROOT/'content/topic_registry.json').write_text(json.dumps(registry,indent=2)+'\n')
 from compile_starters import compile_all
 compile_all()
if __name__=='__main__':main()
