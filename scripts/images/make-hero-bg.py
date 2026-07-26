"""
Generate the hero background illustration (1600x900) for Soul Pathways.
Run:  python scripts/make-hero-bg.py
Output: public/static/images/hero-bg.svg
"""
import brand as b

W, H = 1600, 900

svg = f"""
<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="{b.SAGE_LIGHT}"/>
      <stop offset="55%" stop-color="{b.SAGE}"/>
      <stop offset="100%" stop-color="{b.SAGE_DARK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="72%" cy="28%" r="55%">
      <stop offset="0%" stop-color="{b.CREAM}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="{b.CREAM}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="{W}" height="{H}" fill="url(#sky)"/>
  <rect width="{W}" height="{H}" fill="url(#glow)"/>

  <!-- soft rolling hills -->
  <path d="M0 640 C 320 560 520 700 800 660 C 1080 620 1300 720 1600 650 L1600 900 L0 900 Z"
        fill="{b.FOREST}" opacity="0.55"/>
  <path d="M0 730 C 360 670 560 790 880 740 C 1180 695 1380 800 1600 740 L1600 900 L0 900 Z"
        fill="{b.FOREST_DARK}" opacity="0.6"/>

  <!-- sun / moon orb -->
  <circle cx="1150" cy="250" r="120" fill="{b.ORB}" opacity="0.9"/>
  <circle cx="1150" cy="250" r="120" fill="none" stroke="{b.WHITE}" stroke-opacity="0.25" stroke-width="2"/>

</svg>
"""

b.write_svg("public/static/images/hero-bg.svg", svg)

