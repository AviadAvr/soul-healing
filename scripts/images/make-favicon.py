"""
Generate the browser favicon (64x64) for Soul Pathways.
Run:  python scripts/make-favicon.py
Output: public/static/icons/favicon.svg
"""
import brand as b

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="{b.SAGE}"/>
  <g fill="none" stroke="{b.WHITE}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M32 14 C 27 23 27 31 32 38 C 37 31 37 23 32 14 Z"/>
    <path d="M32 38 C 24 34 19 28 18 20 C 27 22 31 28 32 38 Z"/>
    <path d="M32 38 C 40 34 45 28 46 20 C 37 22 33 28 32 38 Z"/>
  </g>
  <path d="M21 50 C 29 44 35 56 43 48" fill="none" stroke="{b.GOLD_SOFT}" stroke-width="3"
        stroke-linecap="round"/>
</svg>
"""

b.write_svg("public/static/icons/favicon.svg", svg)

