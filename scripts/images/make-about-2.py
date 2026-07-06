"""
Generate the "about" section illustration (600x600): a calm zen-stones / candle motif.
Run:  python scripts/make-about-2.py
Output: public/static/images/about-2.svg
"""
import brand as b

W = H = 600

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{b.SAGE_MID}"/>
      <stop offset="100%" stop-color="{b.SAGE_SOFT}"/>
    </linearGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#g2)"/>
  <!-- candle / zen stones motif -->
  <ellipse cx="300" cy="430" rx="150" ry="30" fill="{b.FOREST_DARK}" opacity="0.45"/>
  <ellipse cx="300" cy="400" rx="110" ry="34" fill="{b.STONE}"/>
  <ellipse cx="300" cy="360" rx="80" ry="26" fill="{b.CREAM_LT}"/>
  <ellipse cx="300" cy="328" rx="54" ry="18" fill="{b.CREAM_LTR}"/>
  <circle cx="300" cy="250" r="20" fill="{b.ORB}"/>
  <text x="300" y="540" text-anchor="middle" font-family="Georgia, serif"
        font-size="24" fill="{b.WHITE}" fill-opacity="0.7" letter-spacing="3">SPACE · PLACEHOLDER</text>
</svg>
"""

b.write_svg("public/static/images/about-2.svg", svg)

