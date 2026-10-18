"""Purpose: Compose complete arithmetic diagrams for an application without inventing a method.

Main contents:
- draw: Compose multiplication or division diagrams for the supplied ordered application steps.

Used By: scripts/answer_layout.py.

Uses: scripts/rendering/bus_stop.py, scripts/rendering/lattice.py.

Libs: Python standard library only.

Usage and output: Import from legacy answer/deck publishers; pass the operands or working
records to the listed functions. Returns SVG/HTML, or draws into a caller-supplied slide; does
not save files.
"""
from .lattice import draw as lattice
from .bus_stop import draw as division

def draw(steps):
 """Compose multiplication or division diagrams for the supplied ordered application steps.

 Parameters: steps — ordered arithmetic operations.
 """
 out=[]
 for kind,a,b in steps:
  out.append(lattice(a,b) if kind=='multiply' else division(a,b,kind=='decimal'))
 return ''.join(out)
