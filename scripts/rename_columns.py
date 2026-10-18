"""Purpose: Historical migration to Start / Build / Confidence labels across saved slides and
textual sources. This is a broad in-place migration, not an ordinary website build step.

Main contents:
- rename_text: Replace old challenge labels with Start, Build and Confidence.
- visit: Recursively rename text in slide shapes while retaining the first run formatting.
- main: Run the rename columns command using its configured input and output paths.

Used By: manual legacy command invocation.

Uses: scripts/update_structure.py.

Libs: Python standard library only.

Usage and output: Reads and rewrites the explicitly listed Markdown sources, AGENTS.md and
registered question decks. Review its historical path list before any separately authorised use.

Status: legacy tooling; retained paths describe historical behaviour. Comment updates do not
authorise running publishers or restoring old paths.
"""
from pathlib import Path
import json,re
import update_structure as u
ROOT=Path(__file__).resolve().parents[1]
LABELS=['Start','Build','Confidence']
MAPPING={'Thread 1: Guided':'Start','Thread 2: Core':'Build','Thread 3: Depth':'Confidence','Guided:':'Start:','Core:':'Build:','Depth:':'Confidence:'}
def rename_text(s):
 """Replace old challenge labels with Start, Build and Confidence.

 Parameters: s — input text.
 Used by: visit, main.
 """
 for a,b in MAPPING.items():s=s.replace(a,b)
 return s

def visit(shapes):
 """Recursively rename text in slide shapes while retaining the first run formatting.

 Parameters: shapes — shape collection to visit.
 Calls: rename_text.
 Used by: main.

 Example: visit(shapes)
 """
 for sh in shapes:
  if hasattr(sh,'shapes'):visit(sh.shapes)
  if sh.has_text_frame:
   for p in sh.text_frame.paragraphs:
    new=rename_text(p.text)
    if new!=p.text:
     if p.runs:
      p.runs[0].text=new
      for run in p.runs[1:]:run.text=''
     else:p.text=new

def main():
 """Run the rename columns command using its configured input and output paths.
 Calls: rename_text, u.Presentation, visit, u.save.

 Example: main()
 """
 for f in [*ROOT.glob('scripts/*.py'),*ROOT.glob('content/*.md'),*ROOT.glob('content/answers/*.md'),ROOT/'AGENTS.md']:
  s=f.read_text();new=rename_text(s)
  if f.name=='rename_columns.py':continue
  if new!=s:f.write_text(new)
 for t in json.loads((ROOT/'content/topic_registry.json').read_text()):
  path=ROOT/'topics'/t['folder']/(t['stem']+'_questions.pptx');p=u.Presentation(path);visit(p.slides[0].shapes)
  for s in list(p.slides)[1:]:visit(s.shapes)
  u.save(p,path)
if __name__=='__main__':main()
