"""
Generate the browser favicon (64x64) for Soul Pathways.
It shows the same sage-toned hand+spiral mark as the logo -- no tile behind it
and no colour inversion.
Run:  python scripts/images/make-favicon.py
Output: public/static/icons/favicon.svg
"""
import brand as b
import hand_art as art

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="{art.tight_viewbox()}">
  <!-- Same mark as the logo: traced healing hand cradling a spiral (sage tones) -->
  {art.recolored_paths()}
</svg>
"""

b.write_svg("public/static/icons/favicon.svg", svg)

