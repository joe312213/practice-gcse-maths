"""Reposition saved lattice carries without rebuilding accepted teaching content."""
import re,json
from pptx.util import Inches
import update_structure as u

def patch_group(group):
 rects=[s for s in group.shapes if s.shape_type==1 and abs(s.width-s.height)<1000 and s.width>Inches(.1)]
 if not rects:return 0
 gx=min(s.left for s in rects);gy=min(s.top for s in rects);bottom=max(s.top+s.height for s in rects);cell=rects[0].width;count=0
 for sh in group.shapes:
  if not sh.has_text_frame or not re.fullmatch(r'\+\d+',sh.text):continue
  # Carries in these saved native grids are the only plus-prefixed digits.
  if sh.top>=bottom-Inches(.08):
   col=round((sh.left-gx)/cell);sh.left=gx+col*cell+Inches(.02);sh.top=bottom-Inches(.025)
  else:
   row=round((sh.top-gy)/cell);sh.left=gx-Inches(.18);sh.top=gy+row*cell+Inches(.01)
  sh.width=Inches(.16)
  for run in sh.text_frame.paragraphs[0].runs:run.text=run.text.lstrip('+')
  count+=1
 return count

def main():
 for topic in json.loads((u.ROOT/'content/topic_registry.json').read_text()):
  path=u.ROOT/'topics'/topic['folder']/(topic['stem']+'_questions.pptx');p=u.Presentation(path);count=0
  for slide in p.slides:
   for sh in slide.shapes:
    if sh.shape_type==6 and sh.name.startswith('Editable lattice '):count+=patch_group(sh)
  if topic['id']=='M01':
   for slide in list(p.slides):
    if any('M01-SE' in text for text in u.texts(slide)):u.remove(p,slide)
   target=next(s for s in p.slides if any('Independent practice 1' in text for text in u.texts(s)))
   u.insert_before(p,u.errors(p,'M01'),target);count+=1
  if count:u.save(p,path);print(topic['id'],count,'carry/group or SE updates')
 from compile_starters import compile_all
 compile_all()
if __name__=='__main__':main()
