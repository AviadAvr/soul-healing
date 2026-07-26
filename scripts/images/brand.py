"""
Shared brand palette + tiny SVG helper for the Soul Pathways asset generators.

The core tones mirror the CSS custom properties in public/css/styles.css so the
generated illustrations always match the site. The "extended" tones are the
lighter/darker shades used only inside the illustrations.
"""
from pathlib import Path

# This module lives in scripts/images/, so the repo root is three levels up.
ROOT = Path(__file__).resolve().parent.parent.parent

# --- Core palette (matches --c-* in public/css/styles.css) -----------------
BG = "#faf8f4"          # --c-bg
BG_ALT = "#f1ece3"      # --c-bg-alt
INK = "#2f3a33"         # --c-ink
INK_SOFT = "#5d6b61"    # --c-ink-soft
SAGE = "#7d9b78"        # --c-sage
SAGE_DARK = "#5f7e5b"   # --c-sage-dark
VIOLET = "#8a7aa8"      # --c-violet
SAND = "#d8c3a5"        # --c-sand
LINE = "#e4ddd0"        # --c-line
WHITE = "#ffffff"       # --c-white

# --- Extended illustration tones -------------------------------------------
SAGE_LIGHT = "#a9c0a0"  # airy sage (sky top)
SAGE_MID = "#9bb295"    # soft sage
SAGE_SOFT = "#6f8d6a"   # muted sage
FOREST = "#52704f"      # near hill
FOREST_DARK = "#41573e" # far hill / shadow
CREAM = "#f3ead7"       # warm glow
CREAM_LT = "#f2ead9"    # stone highlight
CREAM_LTR = "#fbf6ec"   # brightest stone
STONE = "#e9e0cf"       # zen stone base
ORB = "#f7efe0"         # sun / moon orb
GOLD = "#d8a766"        # path accent
GOLD_SOFT = "#f0d9b5"   # soft gold / sand ripple


def write_svg(rel_path: str, svg: str) -> None:
    """Write `svg` to `rel_path` (relative to the repo root) and log it."""
    out = ROOT / rel_path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(svg.strip() + "\n", encoding="utf-8")
    print(f"Wrote {out}")

