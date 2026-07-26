"""
Generate the social share / link-preview image (1200x630) for Soul Pathways.
Run:  python scripts/make-og-image.py
Output: public/static/images/og-preview.jpg
"""
from PIL import Image, ImageDraw, ImageFont

import brand as b
import hand_art as art

W, H = 1200, 630
OUT = b.ROOT / "public" / "static" / "images" / "og-preview.jpg"

# Brand palette
C_BG = (250, 248, 244)      # --c-bg
C_SAGE = (125, 155, 120)    # --c-sage
C_SAGE_DARK = (95, 126, 91) # --c-sage-dark
C_INK = (47, 58, 51)        # --c-ink
C_INK_SOFT = (93, 107, 97)  # --c-ink-soft
C_SAND = (216, 195, 165)    # --c-sand


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


# Vertical gradient background (sage -> sage-dark)
img = Image.new("RGB", (W, H), C_BG)
grad = Image.new("RGB", (1, H))
for y in range(H):
    grad.putpixel((0, y), lerp(C_SAGE, C_SAGE_DARK, y / H))
img.paste(grad.resize((W, H)), (0, 0))

draw = ImageDraw.Draw(img)

# Soft concentric "ripple" circles (zen / energy motif), top-right
cx, cy = W - 150, 150
ripple_radii = list(range(420, 0, -60))
for r in ripple_radii:
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 255, 255), width=2)


def white_hand(target_h, supersample=4):
    """Render the traced hand+spiral art as a white silhouette (RGBA)."""
    polys = art.polygons()
    xs = [p[0] for sp in polys for p in sp]
    ys = [p[1] for sp in polys for p in sp]
    minx, miny, maxx, maxy = min(xs), min(ys), max(xs), max(ys)
    scale = target_h * supersample / (maxy - miny)
    mw = round((maxx - minx) * scale) + 1
    mh = round((maxy - miny) * scale) + 1

    mask = Image.new("L", (mw, mh), 0)
    md = ImageDraw.Draw(mask)
    for sp in polys:
        md.polygon([((px - minx) * scale, (py - miny) * scale) for px, py in sp],
                   fill=255)

    mask = mask.resize((mw // supersample, mh // supersample), Image.LANCZOS)
    hand = Image.new("RGBA", mask.size, (255, 255, 255, 0))
    hand.putalpha(mask)
    return hand


# White hand mark centred inside the innermost ("first") ripple circle
inner_r = min(ripple_radii)
hand = white_hand(target_h=2 * inner_r - 8)
img.paste(hand, (cx - hand.width // 2, cy - hand.height // 2), hand)

# Rounded sand accent bar on the left
draw.rounded_rectangle([90, 250, 130, 470], radius=20, fill=C_SAND)


def load_font(names, size):
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


serif = ["georgiab.ttf", "georgia.ttf", "times.ttf"]
sans = ["segoeui.ttf", "arial.ttf"]
sans_bold = ["segoeuib.ttf", "arialbd.ttf"]

f_eyebrow = load_font(sans_bold, 30)
f_title = load_font(serif, 92)
f_sub = load_font(sans, 38)
f_brand = load_font(sans_bold, 34)

WHITE = (255, 255, 255)
SOFT = (235, 240, 233)

# Eyebrow
draw.text((170, 250), "REIKI · SOUL HEALING · AMSTERDAM", font=f_eyebrow,
          fill=SOFT)

# Title (two lines)
draw.text((168, 295), "Reconnect with", font=f_title, fill=WHITE)
draw.text((168, 390), "your inner calm", font=f_title, fill=WHITE)

# Subtitle
draw.text((170, 505), "Gentle energy healing to restore balance & find peace",
          font=f_sub, fill=SOFT)

# Brand mark bottom-left
draw.ellipse([170, 70, 210, 110], outline=WHITE, width=3)
draw.text((228, 73), "Soul Pathways", font=f_brand, fill=WHITE)

img.save(OUT, "JPEG", quality=82, optimize=True, progressive=False)
print(f"Wrote {OUT} ({img.size[0]}x{img.size[1]})")

