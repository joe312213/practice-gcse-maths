"""Compose complete arithmetic diagrams for an application without inventing a method."""
from .lattice import draw as lattice
from .bus_stop import draw as division

def draw(steps):
 out=[]
 for kind,a,b in steps:
  out.append(lattice(a,b) if kind=='multiply' else division(a,b,kind=='decimal'))
 return ''.join(out)
