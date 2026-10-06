"""Purpose: Build the standalone M04 ratio question and answer decks from Markdown.
Does not read or overwrite the consolidated deck. Requires python-pptx and Pillow.

Main contents:
- splitcells
- section
- source_questions
- answer_section
- rect
- text
- line
- base
- headers
- progression
- bars
- worked_grid
- make

Used By: scripts/add_ratio_assessment.py, scripts/build_fraction_topic.py, scripts/build_priority_topic.py, scripts/build_signed.py.

Uses: no local module imports.

Libs: Pillow (font measurement/image rendering), python-pptx (editable slides and deck inspection).

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
"""
from pathlib import Path
import re, hashlib, zipfile, math, json
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from PIL import ImageFont
from pptx.oxml import parse_xml
from pptx.oxml.ns import qn, nsdecls
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'content/M04_ratio.md'
ANS=ROOT/'content/answers/M04_answers.md'
OUT=ROOT/'topics/ratio';OUT.mkdir(parents=True,exist_ok=True)
INK='182B3A';MUTED='526472';LINE='D8E0E6';COL=['176B73','3559A2','754B87'];TINT=['EDF6F5','EFF3FA','F5F0F7'];BG='F7F8FA'
LABELS=['Start','Build','Confidence']
ROWS=['Keywords & Calculation','Written Method','Ballpark Check & Math','Final Answer']
PROMPTS=['Identify the keywords. Write down the calculation(s) you need to do.','Set up and use the written method for your calculation(s).','Check your answer using rough ballpark calculations. Does it make sense?','Write your final answer to the question. Include the correct units.']
# Source text and answer tables are read rather than re-created during layout.
src=SRC.read_text();answer_src=ANS.read_text()
def splitcells(line):
 """Split a Markdown table row into trimmed cell strings.

 Parameters: line — optional outline colour.
 Used by: source_questions, answer_section, worked_grid.
 """
 return [x.strip() for x in line.strip().strip('|').split('|')]
def section(text,sn):
 """Extract the requested numbered section from authored Markdown.

 Parameters: text — source Markdown/text; sn — one-based source slide number.
 Used by: source_questions, worked_grid.
 """
 start=re.search(r'^#{2,3} Slide '+str(sn)+r' — ',text,re.M).start()
 rest=text[start:];end=re.search(r'\n#{2,3} (?:Slide |Checks)',rest)
 return rest[:end.start()] if end else rest

def source_questions(sn):
 """Read the questions for the numbered ratio slide.

 Parameters: sn — one-based source slide number.
 Calls: section, splitcells.
 Used by: worked_grid, make.
 """
 s=section(src,sn)
 if sn==1:return splitcells(re.search(r'^\| The Full Question.*$',s,re.M).group())[1:]
 if sn<4:
  return [splitcells(x) for x in s.splitlines() if x.startswith('| ') and not x.startswith('| Thread') and not x.startswith('| ---')][0]
 return [splitcells(x)[1:] for x in s.split('Teacher answers')[0].splitlines() if re.match(r'^\| [1-6] \|',x)]

def answer_section(sn):
 """Read the numbered ratio answer block and its diagnostic notes.

 Parameters: sn — one-based source slide number.
 Calls: splitcells.
 Used by: worked_grid, make.
 """
 s=re.search(r'^## M04-S'+f'{sn:02}'+r'-A[^\n]*\n(.*?)(?=^## M04-|\Z)',answer_src,re.M|re.S).group(1)
 answers=[splitcells(x)[1:] for x in s.splitlines() if re.match(r'^\| [1-6] \|',x)]
 notes={splitcells(x)[0]:splitcells(x)[1:] for x in s.splitlines() if any(x.startswith('| '+k+' |') for k in ['Method','If you got…','Check'])}
 return answers,notes

def rect(s,x,y,w,h,fill,line=None):
 """Draw a rectangle with the requested fill and optional outline.

 Parameters: s — slide or source text as used by this helper; x — horizontal coordinate in inches; y
 — vertical coordinate in inches; w — width in inches; h — height in inches; fill — fill colour hex
 string; line — optional outline colour.
 Used by: base, headers, bars, worked_grid, make.
 """
 sh=s.shapes.add_shape(MSO_SHAPE.RECTANGLE,Inches(x),Inches(y),Inches(w),Inches(h));sh.fill.solid();sh.fill.fore_color.rgb=RGBColor.from_string(fill)
 if line:sh.line.color.rgb=RGBColor.from_string(line);sh.line.width=Pt(.6)
 else:sh.line.fill.background()
 return sh
checks=[]
def text(s,x,y,w,h,val,size=18,bold=False,color=INK):
 """Draw text with the supplied geometry and typography.

 Parameters: s — slide or source text as used by this helper; x — horizontal coordinate in inches; y
 — vertical coordinate in inches; w — width in inches; h — height in inches; val — text value to
 render; size — font size in points; bold — whether to use bold text; color — text/stroke colour hex
 string.
 Used by: base, headers, bars, worked_grid, make.
 """
 sh=s.shapes.add_textbox(Inches(x),Inches(y),Inches(w),Inches(h));tf=sh.text_frame;tf.word_wrap=True
 tf.margin_left=tf.margin_right=Inches(.06);tf.margin_top=tf.margin_bottom=Inches(.025)
 for i,line in enumerate(val.split('\n')):
  p=tf.paragraphs[0] if not i else tf.add_paragraph();p.text=line;p.font.name='Arial';p.font.size=Pt(size);p.font.bold=bold;p.font.color.rgb=RGBColor.from_string(color);p.space_before=p.space_after=Pt(0);p.line_spacing=Pt(size*1.05)
 checks.append((val,w,h,size,bold))
 return sh

def line(s,x,y,xx,yy,color=INK):
 """Draw a line between the supplied endpoints.

 Parameters: s — slide or source text as used by this helper; x — horizontal coordinate in inches; y
 — vertical coordinate in inches; xx — line end x coordinate in inches; yy — line end y coordinate
 in inches; color — text/stroke colour hex string.
 Used by: bars.
 """
 sh=s.shapes.add_connector(MSO_CONNECTOR.STRAIGHT,Inches(x),Inches(y),Inches(xx),Inches(yy));sh.line.color.rgb=RGBColor.from_string(color);sh.line.width=Pt(1.2)

def base(prs,title,sub,ref):
 """Create a topic slide with its title, subtitle and stable reference.

 Parameters: prs — destination presentation; title — learner-facing title; sub — slide subtitle; ref
 — stable slide reference.
 Calls: rect, text.
 Used by: worked_grid, make.
 """
 s=prs.slides.add_slide(prs.slide_layouts[6]);s.background.fill.solid();s.background.fill.fore_color.rgb=RGBColor.from_string(BG)
 rect(s,0,0,16,.08,COL[0]);text(s,.35,.18,15.3,.5,title,28,True);text(s,.35,.77,15.3,.38,sub,15,color=MUTED)
 text(s,.35,8.72,11.8,.23,'GCSE Maths revision • No calculator • Show your working.',11,color=MUTED);text(s,12.2,8.72,3.4,.23,ref,11,color=MUTED)
 return s

def headers(s,grid=False):
 """Draw the three challenge-column headers and return their layout origin and width.

 Parameters: s — slide or source text as used by this helper; grid — whether to use the working-grid
 geometry.
 Calls: rect, text.
 Used by: worked_grid, make.
 """
 left=2.32 if grid else .35;cw=(15.65-left)/3
 for t in range(3):
  x=left+t*cw;rect(s,x,1.22,cw-.025,.46,COL[t]);text(s,x+.03,1.255,cw-.09,.36,LABELS[t],19,True,'FFFFFF')
 return left,cw


def progression(s,grid=False):
 # Approved reference geometry, rotated 30 degrees anticlockwise; preserve aspect ratio.
 """Draw the editable curved progression arrow beneath the practice columns.

 Parameters: s — slide or source text as used by this helper; grid — whether to use the working-grid
 geometry.
 Calls: rotate, bezier, pt.
 Used by: worked_grid, make.

 Example in the caller's context: progression(s, grid)
 """
 shaft=[(110,160),(285,800),(770,865),(1275,550)]
 head=[(890,545),(1275,550),(1080,865)]
 def rotate(p):
  """Rotate an arrow control point around its reference centre.

  Parameters: p — coordinate pair.
  Used by: progression, pt.
  """
  x,y=p[0]-700,p[1]-500;r=math.radians(-30)
  return (x*math.cos(r)-y*math.sin(r)+700,x*math.sin(r)+y*math.cos(r)+500)
 def bezier(t):
  """Evaluate the arrow shaft cubic Bezier curve at parameter t.

  Parameters: t — curve parameter from zero to one.
  Used by: progression.
  """
  u=1-t
  return tuple(u**3*shaft[0][i]+3*u*u*t*shaft[1][i]+3*u*t*t*shaft[2][i]+t**3*shaft[3][i] for i in range(2))
 points=[rotate(bezier(i/400)) for i in range(401)]+[rotate(p) for p in head]
 pad=145/2+25
 xmin=min(p[0] for p in points)-pad;ymin=min(p[1] for p in points)-pad
 width=max(p[0] for p in points)-xmin+pad;height=max(p[1] for p in points)-ymin+pad
 def pt(p):
  """Convert a rotated arrow point into DrawingML path coordinates.

  Parameters: p — coordinate pair.
  Calls: rotate.
  Used by: progression.
  """
  x,y=rotate(p)
  return f'<a:pt x="{round((x-xmin)/width*100000)}" y="{round((y-ymin)/height*100000)}"/>'
 path1='<a:moveTo>'+pt(shaft[0])+'</a:moveTo><a:cubicBezTo>'+''.join(pt(p) for p in shaft[1:])+'</a:cubicBezTo>'
 path2='<a:moveTo>'+pt(head[0])+'</a:moveTo>'+''.join('<a:lnTo>'+pt(p)+'</a:lnTo>' for p in head[1:])
 left=2.32 if grid else .35;cw=(15.65-left)/3
 display_width=.68;display_height=display_width*height/width
 for t in range(2):
  boundary=left+(t+1)*cw
  approved=json.loads((ROOT/'content/progression_arrow.json').read_text())['arrows'][t]
  arrow_x=boundary+approved['boundary_offset_inches']
  arrow_y=(8.11 if grid else 8.33)+approved['bottom_offset_inches']
  sh=s.shapes.add_shape(MSO_SHAPE.RECTANGLE,Inches(arrow_x),Inches(arrow_y),Inches(display_width),Inches(display_height))
  sh.fill.background();sh.name=f'Progression curved arrow: Thread {t+1} to Thread {t+2}'
  geom=parse_xml('<a:custGeom '+nsdecls('a')+'><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/><a:rect l="0" t="0" r="100000" b="100000"/><a:pathLst>'+''.join('<a:path w="100000" h="100000" fill="none">'+path+'</a:path>' for path in [path1,path2])+'</a:pathLst></a:custGeom>')
  old=sh._element.spPr.find(qn('a:prstGeom'));sh._element.spPr.replace(old,geom)
  sh.line.color.rgb=RGBColor.from_string('FABF90');sh.line.width=Pt(display_width*72*145/width)
  ln=sh._element.spPr.find(qn('a:ln'))
  fill=ln.find(qn('a:solidFill'));fill.clear();fill.append(parse_xml('<a:schemeClr '+nsdecls('a')+' val="accent6"><a:lumMod val="60000"/><a:lumOff val="40000"/></a:schemeClr>'))
  ln.set('cap','rnd');ln.append(parse_xml('<a:round '+nsdecls('a')+'/>'))
  sh._element.spPr.append(parse_xml('<a:effectLst '+nsdecls('a')+'/>'))
  effect=sh._element.find('.//'+qn('a:effectRef'))
  if effect is not None:effect.set('idx','0')

def bars(s,x,y,w,h,a,b,names,known,kind,part,t):
 # Native shapes with matching labelled bar lengths and an explicit known-quantity bracket.
 """Draw labelled ratio-part bars for the given known quantity and unknown.

 Parameters: s — slide or source text as used by this helper; x — horizontal coordinate in inches; y
 — vertical coordinate in inches; w — width in inches; h — height in inches; a — first operand or
 coefficient; b — second operand or constant; names — ratio-part labels; known — known ratio
 quantity; kind — question or operation variant; part — value of one ratio part; t — challenge index
 or Bezier parameter as used here.
 Calls: text, rect, line.
 Used by: worked_grid.

 Example in the caller's context: bars(s, x, y, w, h, a, b, names, known, kind, part, t)
 """
 group=s.shapes.add_group_shape();group.name=f'Ratio bars {names[0]}:{names[1]} = {a}:{b}, {kind}'
 labelw=1.0;bx=x+labelw;cell=min(.43,(w-labelw-.2)/max(a,b));bh=.23;rowgap=.41
 for j,(name,n) in enumerate(zip(names,[a,b])):
  yy=y+j*rowgap;text(group,x,yy-.025,labelw,.3,name,12,True)
  for k in range(n):rect(group,bx+k*cell,yy,cell,bh,TINT[t],COL[t])
 if kind=='difference':
  lo=min(a,b);hi=max(a,b);yy=y+rowgap+bh+.09
  line(group,bx+lo*cell,yy,bx+hi*cell,yy,COL[t]);line(group,bx+lo*cell,yy-.05,bx+lo*cell,yy+.05,COL[t]);line(group,bx+hi*cell,yy-.05,bx+hi*cell,yy+.05,COL[t]);text(group,bx,yy+.04,w-labelw,.28,known,12,True,COL[t])
 elif kind=='total':
  xx=bx+max(a,b)*cell+.1;line(group,xx,y,xx,y+rowgap+bh,COL[t]);line(group,xx-.05,y,xx,y,COL[t]);line(group,xx-.05,y+rowgap+bh,xx,y+rowgap+bh,COL[t]);text(group,bx,y+rowgap+bh+.1,w-labelw,.29,known,12,True,COL[t])
 else:
  idx=0 if kind=='first' else 1;yy=y+idx*rowgap-.09
  line(group,bx,yy,bx+[a,b][idx]*cell,yy,COL[t]);text(group,bx,y+rowgap+bh+.1,w-labelw,.29,known,12,True,COL[t])
 text(group,bx,y+1.08,w-labelw,.29,part,13,True,COL[t])

DIAGRAMS={1:[(2,3,['A','B'],'£120 altogether','total','1 part = £24'),(3,5,['Red','Blue'],'Red: 18 litres','first','1 part = 6 litres'),(3,7,['Red','Blue'],'4 extra parts = 28 counters','difference','1 part = 7 counters')],2:[(3,4,['Red','White'],'84 ml altogether','total','1 part = 12 ml'),(4,7,['Notebooks','Folders'],'Folders: 35','second','1 part = 5 items'),(2,5,['Adults','Children'],'3 extra parts = 24 people','difference','1 part = 8 people')],3:[(5,7,['A','B'],'96 cm altogether','total','1 part = 8 cm'),(2,7,['Juice','Water'],'Juice: 18 litres','first','1 part = 9 litres'),(5,8,['A','B'],'3 extra parts = 21 cm','difference','1 part = 7 cm')]}
# Layout text for worked demo is read directly from the source table.
demo={splitcells(x)[0]:splitcells(x)[1:] for x in section(src,1).splitlines() if x.startswith('| ') and not x.startswith('| ---')}

def worked_grid(prs,sn,answer=False):
 """Append a ratio worked-method or answer grid.

 Parameters: prs — destination presentation; sn — one-based source slide number; answer — whether to
 render the answer variant.
 Calls: base, headers, rect, text, source_questions, splitcells, bars, progression, section,
 answer_section.
 Used by: make.

 Example in the caller's context: worked_grid(prs, sn, answer)
 """
 title='Ratio: sharing and missing amounts' if not answer else 'Ratio: answers and worked method'
 sub='Worked demo • Follow each step down your column.' if sn==1 else ('Answers to step-by-step practice '+str(sn-1) if answer else 'Step-by-step practice '+str(sn-1)+' • Complete each step in your booklet or webapp.')
 s=base(prs,title,sub,f'M04-S{sn:02}'+('-A' if answer else ''));left,cw=headers(s,True);y=1.71;qh=1.52
 rect(s,.35,y,left-.35,qh,'E8EDF1',LINE);text(s,.41,y+.12,left-.47,qh-.2,'The Full Question',17,True)
 for t,q in enumerate(source_questions(sn)):
  x=left+t*cw;rect(s,x,y,cw,qh,TINT[t],LINE);text(s,x+.05,y+.07,cw-.1,qh-.14,q,18,True)
 y+=qh
 heights=[1.05,2.26,1.43,.61] if sn==1 else ([1.05,2.26,1.43,.61] if answer else [1.22,1.22,1.22,1.22])
 if answer:
  # Exact full rows for step answers stored in answer Markdown.
  block=re.search(r'^### Worked rows S'+f'{sn:02}'+r'\n(.*?)(?=^### |^## |\Z)',answer_src,re.M|re.S).group(1)
  cells={splitcells(z)[0]:splitcells(z)[1:] for z in block.splitlines() if any(z.startswith('| '+k+' |') for k in ROWS)}
 else:cells=demo
 for r,(label,h) in enumerate(zip(ROWS,heights)):
  rect(s,.35,y,left-.35,h,'E8EDF1',LINE);text(s,.41,y+.08,left-.47,h-.16,label,17,True)
  for t in range(3):
   x=left+t*cw;rect(s,x,y,cw,h,'FFFFFF',LINE)
   value=cells[label][t] if sn==1 or answer else PROMPTS[r]
   if r==1 and (sn==1 or answer):
    text(s,x+.05,y+.06,cw-.1,.75,value,17);bars(s,x+.08,y+.87,cw-.16,1.37,*DIAGRAMS[sn][t],t)
   else:text(s,x+.05,y+.08,cw-.1,h-.16,value,17 if sn==1 or answer else 19)
  y+=h
 assert y<=8.6,y
 if sn>1 and not answer:progression(s,True)
 s.notes_slide.notes_text_frame.text=section(src,sn) if not answer else answer_section(sn).__str__()
 return s

def make():
 """Build the topic outputs from the authored inputs and save the legacy resources.
 Calls: worked_grid, base, headers, source_questions, rect, text, progression, answer_section,
 p.save.

 Example in the caller's context: make()
 """
 qprs=Presentation();aprs=Presentation()
 for p in [qprs,aprs]:p.slide_width=Inches(16);p.slide_height=Inches(9);p.core_properties.author='Maths teaching resources'
 qprs.core_properties.title='Ratio — sharing and missing amounts';aprs.core_properties.title='Ratio — answers and method checks'
 for sn in range(1,4):worked_grid(qprs,sn)
 for sn in range(4,8):
  s=base(qprs,'Ratio: sharing and missing amounts','Independent practice '+str(sn-3)+' • Choose a column. Show your working and check your answers.',f'M04-S{sn:02}');left,cw=headers(s)
  for k,row in enumerate(source_questions(sn)):
   for t,val in enumerate(row):
    x=left+t*cw;y=1.73+k*1.10;rect(s,x,y,cw-.025,1.10,'FFFFFF' if k%2==0 else TINT[t],LINE);text(s,x+.03,y+.08,.3,.4,str(k+1),17,True,COL[t]);text(s,x+.36,y+.065,cw-.44,.97,val,18)
  progression(s)
  s.notes_slide.notes_text_frame.text=f'M04-S{sn:02}: answers are in the separate ratio answer deck.'
 for sn in range(2,8):
  aa,nn=answer_section(sn)
  if sn<4:worked_grid(aprs,sn,True)
  else:
   s=base(aprs,'Ratio: answers','Independent practice '+str(sn-3)+' • Match the thread and question number.',f'M04-S{sn:02}-A');left,cw=headers(s)
   for k,row in enumerate(aa):
    for t,val in enumerate(row):
     x=left+t*cw;y=1.76+k*.88;rect(s,x,y,cw-.025,.88,'FFFFFF' if k%2==0 else TINT[t],LINE);text(s,x+.08,y+(.07 if ';' in val else .2),cw-.16,.74 if ';' in val else .52,f'{k+1}.  '+val.replace('; ', '\n    '),20 if ';' in val else 24,True,COL[t])
   text(s,.4,7.28,15.1,.65,'Check what is requested: one amount, both amounts, a total or a difference.',22,True)
   text(s,.4,8.0,15.1,.45,'The next slide checks a method and a possible error in each thread.',18,color=MUTED)
  # Dedicated readable diagnostic page for every question slide.
  s=base(aprs,'Ratio: check your method',('Step-by-step practice '+str(sn-1) if sn<4 else 'Independent practice '+str(sn-3))+' • Compare your working; correct the first wrong step.',f'M04-S{sn:02}-B');left,cw=headers(s)
  for t in range(3):
   x=left+t*cw
   for y,h,label in [(1.8,2.0,'Method'),(3.93,2.47,'If you got…'),(6.53,1.85,'Check')]:
    rect(s,x,y,cw-.035,h,TINT[t] if label!='If you got…' else 'FFFFFF',LINE);text(s,x+.1,y+.1,cw-.23,.4,label,20,True,COL[t]);text(s,x+.1,y+.58,cw-.23,h-.69,nn[label][t],20)
  s.notes_slide.notes_text_frame.text=f'Answers and notes from {ANS.relative_to(ROOT)}; source M04-S{sn:02}.'
 # Font-metric and shape-bounds checks before saving.
 overflow=[]
 for value,w,h,size,bold in checks:
  font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial'+(' Bold' if bold else '')+'.ttf',round(size*4));count=0
  for para in value.split('\n'):
   ln='';n=1
   for word in para.split():
    if font.getlength(word)>(w-.12)*72*4+1:overflow.append(('Word too wide: '+word,w,h))
    nxt=(ln+' '+word).strip()
    if font.getlength(nxt)>(w-.12)*72*4 and ln:n+=1;ln=word
    else:ln=nxt
   count+=n
  if count*size*1.05>(h-.05)*72+1:overflow.append((value[:90],round(count*size*1.05,1),round((h-.05)*72,1)))
 if overflow:raise ValueError(overflow)
 for p,name in [(qprs,'Ratio_M04_questions_prev8.pptx'),(aprs,'Ratio_M04_answers_prev5.pptx')]:
  for s in p.slides:
   for sh in s.shapes:assert sh.left>=0 and sh.top>=0 and sh.left+sh.width<=p.slide_width+100 and sh.top+sh.height<=p.slide_height+100,(name,sh.name)
  temp=Path('/private/tmp')/name;p.save(temp);payload=temp.read_bytes();target=OUT/name;target.write_bytes(payload);assert hashlib.sha256(target.read_bytes()).digest()==hashlib.sha256(payload).digest()
  with zipfile.ZipFile(target) as z:assert z.testzip() is None
  print(name,len(p.slides),'slides',len(payload),'bytes')
 assert len(qprs.slides)==7 and len(aprs.slides)==12
if __name__=='__main__':
 raise SystemExit('Retired generator: use the current build commands in HANDOFF.md; historical outputs are kept in Git.')
if __name__=='__main__':make()
