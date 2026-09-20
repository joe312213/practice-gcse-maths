"""Preview a native vector progression arrow without rebuilding either deck.
The PNG is a raster preview of the same vector paths, not an edit of the user's image.
"""
from pathlib import Path
import math
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'topics/ratio/arrow_preview';OUT.mkdir(parents=True,exist_ok=True)
# Approximate the reference's rounded shaft and open head, then rotate 30 degrees anticlockwise.
SHAFT=[(110,160),(285,800),(770,865),(1275,550)]
HEAD=[(890,545),(1275,550),(1080,865)]
WIDTH=145
ANGLE=-30
COLOR='#ff7417'
def rotate(p):
 x,y=p[0]-700,p[1]-500;r=math.radians(ANGLE)
 return (x*math.cos(r)-y*math.sin(r)+700,x*math.sin(r)+y*math.cos(r)+500)
def bezier(points,t):
 u=1-t
 return tuple(u**3*points[0][i]+3*u*u*t*points[1][i]+3*u*t*t*points[2][i]+t**3*points[3][i] for i in range(2))
shaft=[rotate(bezier(SHAFT,i/400)) for i in range(401)]
head=[rotate(p) for p in HEAD]
pts=shaft+head
pad=WIDTH/2+25
left=min(p[0] for p in pts)-pad;top=min(p[1] for p in pts)-pad
w=max(p[0] for p in pts)-left+pad;h=max(p[1] for p in pts)-top+pad
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{left:.3f} {top:.3f} {w:.3f} {h:.3f}">
<g transform="rotate({ANGLE} 700 500)" fill="none" stroke="{COLOR}" stroke-width="{WIDTH}" stroke-linecap="round" stroke-linejoin="round">
<path d="M110 160 C285 800 770 865 1275 550"/>
<path d="M890 545 L1275 550 L1080 865"/>
</g></svg>'''
(OUT/'progression_arrow.svg').write_text(svg)
# Supersampling provides an accurate, smooth preview of the editable paths.
scale=1800/w
im=Image.new('RGB',(1800,round(h*scale)),'white');draw=ImageDraw.Draw(im)
def pixel(p):return ((p[0]-left)*scale,(p[1]-top)*scale)
width=round(WIDTH*scale)
for path in [shaft,head]:
 pixelpath=[pixel(p) for p in path];draw.line(pixelpath,fill=COLOR,width=width,joint='curve')
 for p in pixelpath:
  r=width/2;draw.ellipse((p[0]-r,p[1]-r,p[0]+r,p[1]+r),fill=COLOR)
im.resize((1000,round(im.height*1000/im.width)),Image.Resampling.LANCZOS).save(OUT/'progression_arrow.png')
print('Created SVG and PNG arrow preview; no PowerPoint rebuild.')
