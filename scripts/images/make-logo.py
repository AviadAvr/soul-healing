"""
Generate the Soul Pathways logo mark (64x64): a traced healing hand cradling a
spiral, recoloured into the brand sage palette.
Run:  python scripts/images/make-logo.py
Output: public/static/logo/soul-pathways-logo.svg
"""
import brand as b
import hand_art as art

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="{art.VIEWBOX}">
  <!-- Soul Pathways mark: a traced healing hand cradling a spiral (sage tones) -->
  {art.recolored_paths()}
</svg>
"""

b.write_svg("public/static/logo/soul-pathways-logo.svg", svg)

