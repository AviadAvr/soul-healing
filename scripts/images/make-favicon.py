"""
Generate the browser favicon (64x64) for Soul Pathways: the healing-hand mark
on a rounded sage tile, with the palm spiral cut through to the tile.
Run:  python scripts/images/make-favicon.py
Output: public/static/icons/favicon.svg
"""
import brand as b
from hand_path import HAND, VIEWBOX

# The viewBox crops the artwork; the tile fills that same box.
x, y, w, h = (float(n) for n in VIEWBOX.split())

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="{VIEWBOX}">
  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="150" fill="{b.SAGE}"/>
  <!-- hand in white; evenodd carves the palm spiral back to the sage tile -->
  <path d="{HAND}" fill="{b.WHITE}" fill-rule="evenodd"/>
</svg>
"""

b.write_svg("public/static/icons/favicon.svg", svg)

