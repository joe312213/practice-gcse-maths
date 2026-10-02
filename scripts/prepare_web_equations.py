"""Import accepted M10 structured content, checking against saved decks; no deck writes."""
from pathlib import Path
from fractions import Fraction
from hashlib import sha256
import json,re
from pptx import Presentation
ROOT=Path(__file__).resolve().parents[1]
def normal(s):return re.sub(r'\s+','',s).replace('−','-').replace('×','*')
def slide_text(s):return '\n'.join(sh.text for sh in s.shapes if sh.has_text_frame)
def main():
 registry=json.loads((ROOT/'content/topic_registry.json').read_text());combined=Presentation(ROOT/'GCSE_Maths_Revision_Starters.pptx');offset=0;audit=[]
 for t in registry:
  path=ROOT/'topics'/t['folder']/(t['stem']+'_questions.pptx');p=Presentation(path)
  differences=[]
  def shape_data(s):return [(int(sh.shape_type),sh.left,sh.top,sh.width,sh.height,sh.rotation,sh.text if sh.has_text_frame else '') for sh in s.shapes]
  for i,s in enumerate(p.slides):
   if shape_data(s)!=shape_data(combined.slides[offset+i]):differences.append(i+1)
  audit.append({'topic':t['id'],'slides':len(p.slides),'text_geometry_differences':differences,'sha256':sha256(path.read_bytes()).hexdigest()});offset+=len(p.slides)
 assert offset==len(combined.slides)
 d=json.loads((ROOT/'content/M10_equations.json').read_text());deck=Presentation(ROOT/'topics/equations/Solving_equations_M10_questions.pptx');text=normal('\n'.join(slide_text(s) for s in deck.slides));items=[]
 def add(q,id,kind,level):
  assert normal(q['q']) in text,(id,q['q'])
  if 'coefficients' in q:
   a,b,c,e=map(Fraction,q['coefficients']);x=Fraction(q['answer']);assert a*x+b==c*x+e,id
  items.append({**q,'id':'maths:'+id,'subject':'maths','topic':'M10','type':kind,'level':level})
 for i,q in enumerate(d['assessment']):add(q,f'M10-IA-Q{i+1}','assessment',[0,0,1,2][i])
 for l,q in enumerate(d['demo']):add(q,f'M10-S01-C{l+1}-Q1','demo',l)
 for s,row in enumerate(d['practice'],2):
  for l,q in enumerate(row):add(q,f'M10-S{s:02}-C{l+1}-Q1','scaffolded',l)
 for s,cols in enumerate(d['banks'],4):
  for l,col in enumerate(cols):
   for i,q in enumerate(col):add(q,f'M10-S{s:02}-C{l+1}-Q{i+1}','plain',l)
 for l,col in enumerate(d['errors']):
  for i,q in enumerate(col):add(q,f'M10-SE-C{l+1}-Q{i+1}','errors',l)
 assert len(items)==94 and len({q['id'] for q in items})==94
 recap=json.loads((ROOT/'content/M10_web_recap.json').read_text())
 for block in recap:
  for note in [block['title'],*block['notes']]:assert normal(note) in text,note
  for row in block['balance']:
   for side in ('l','r'):assert normal(row[side]) in text,row

 out={'schema':1,'revision':sha256((ROOT/'content/M10_equations.json').read_bytes()+(ROOT/'content/M10_web_recap.json').read_bytes()).hexdigest()[:16],'subject':'maths','topic':'M10','title':d['title'],'rows':d['rows'],'prompts':d['prompts'],'questions':items,'recap':recap}
 target=ROOT/'website/data';target.mkdir(parents=True,exist_ok=True);(target/'equations.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 (ROOT/'docs/CONTENT_AUDIT.json').write_text(json.dumps({'combined_sha256':sha256((ROOT/'GCSE_Maths_Revision_Starters.pptx').read_bytes()).hexdigest(),'topics':audit,'M10':{'imported':94,'plain':72,'source_questions_found_in_saved_deck':94,'coefficient_answers_verified':sum('coefficients' in q for q in items)},'limits':'Shape geometry/text compared; detailed styles/media and non-M10 source parity not yet audited.'},indent=2)+'\n')
 print('Imported 94 M10 items; 72 independent questions. All source question texts found in saved deck. Deck geometry differences:',[(r['topic'],r['text_geometry_differences']) for r in audit if r['text_geometry_differences']])
if __name__=='__main__':main()
