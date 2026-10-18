"""Purpose: Combine already saved topic decks and answer HTML in the prerequisite order from the
topic registry. It copies saved slide content; it does not regenerate questions or diagrams.

Main contents:
- compile_all: Combine saved topic decks and HTML answers in registry order without rebuilding
  questions.

Used By: scripts/build_fraction_topic.py, scripts/build_priority_topic.py,
scripts/fix_lattice_carries.py, scripts/fix_saved_layout.py, scripts/update_structure.py.

Uses: scripts/update_structure.py.

Libs: Python standard library only.

Usage and output: Reads content/topic_registry.json and the referenced topic files; writes the
consolidated starter deck and GCSE_Maths_Revision_Starters_answers.html.

Status: legacy tooling; retained paths describe historical behaviour. Comment updates do not
authorise running publishers or restoring old paths.
"""
from pathlib import Path
import json,html
import update_structure as u
ROOT=Path(__file__).resolve().parents[1]
def compile_all():
 """Combine saved topic decks and HTML answers in registry order without rebuilding questions.
 Calls: u.Presentation, u.remove, u.clone, u.save, u.page, u.save_text.

 Example: compile_all()
 """
 topics=json.loads((ROOT/'content/topic_registry.json').read_text())
 main=ROOT/'GCSE_Maths_Revision_Starters.pptx'
 p=u.Presentation(main)
 for s in list(p.slides):u.remove(p,s)
 sections=[]
 for t in topics:
  folder=ROOT/'topics'/t['folder'];source=u.Presentation(folder/(t['stem']+'_questions.pptx'))
  for slide in source.slides:u.clone(p,slide)
  raw=(folder/(t['stem']+'_answers.html')).read_text();start=raw.index('<section id="'+t['id']+'"');end=raw.rindex('</section>')+len('</section>')
  sections.append(raw[start:end])
 u.save(p,main)
 nav=' · '.join('<a href="#'+t['id']+'">'+html.escape(t['title'])+'</a>' for t in topics)
 page=u.page([]).replace('<nav></nav>','<nav>'+nav+'</nav>').replace('</html>',''.join(sections)+'</html>')
 u.save_text(ROOT/'GCSE_Maths_Revision_Starters_answers.html',page)
 print('Compiled topic order:',', '.join(t['id'] for t in topics))
if __name__=='__main__':compile_all()
