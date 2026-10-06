"""Purpose: Refresh current HTML only, preserving every saved question slide.

Main contents:
- main

Used By: manual legacy command invocation.

Uses: scripts/build_fraction_topic.py, scripts/build_priority_topic.py, scripts/update_structure.py.

Libs: build_fraction_topic, build_priority_topic, python-pptx (editable slides and deck inspection).

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
import json
import update_structure as u
from pathlib import Path
from pptx import Presentation
ROOT=Path(__file__).resolve().parents[1]
def main():
 """Run the refresh answers command using its configured input and output paths.
 Calls: u.errors, u.answers, u.save_text, u.page.

 Example in the caller's context: main()
 """
 registry=json.loads((ROOT/'content/topic_registry.json').read_text());sections=[]
 for t in registry:
  mid=t['id']
  if mid in u.TOPICS:
   # Use the same renderer for incorrect SVG and editable question working.
   u.errors(Presentation(),mid);body=u.answers(mid)
  elif mid=='M10':
   from build_priority_topic import answer_body
   body=answer_body(json.loads((ROOT/'content/M10_equations.json').read_text()))
  elif mid=='M15':
   from build_fraction_topic import answers
   body=answers(json.loads((ROOT/'content/M15_fractions.json').read_text()))
  else:raise ValueError('Add an explicit answer renderer for '+mid)
  u.save_text(ROOT/'topics'/t['folder']/(t['stem']+'_answers.html'),u.page([]).replace('</html>',body+'</html>'));sections.append(body)
 nav=' · '.join('<a href="#'+t['id']+'">'+u.html.escape(t['title'])+'</a>' for t in registry)
 page=u.page([]).replace('<nav></nav>','<nav>'+nav+'</nav>').replace('</html>',''.join(sections)+'</html>')
 u.save_text(ROOT/'GCSE_Maths_Revision_Starters_answers.html',page)
 print('Refreshed HTML for',len(registry),'topics; question decks untouched.')
if __name__=='__main__':main()
