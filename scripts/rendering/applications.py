"""Purpose: Compose complete arithmetic diagrams for an application without inventing a method.

Main contents:
- draw

Used By: scripts/answer_layout.py.

Uses: scripts/rendering/bus_stop.py, scripts/rendering/lattice.py.

Libs: Python standard library only.

Legacy tooling: historical resource paths are retained; documentation changes do not authorize running it.
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
