"""
Generate the Soul Pathways logo mark (64x64): a healing hand with a spiral
carved through the palm (traced from the source pendant art).
Run:  python scripts/images/make-logo.py
Output: public/static/logo/soul-pathways-logo.svg
"""
import brand as b
from hand_path import HAND, VIEWBOX

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="{VIEWBOX}">
  <!-- Soul Pathways mark: a healing hand with a spiral carved through the palm -->
  <path d="{HAND}" fill="{b.SAGE_DARK}" fill-rule="evenodd"/>
</svg>
"""

b.write_svg("public/static/logo/soul-pathways-logo.svg", svg)

