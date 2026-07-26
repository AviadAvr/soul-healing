"""
Shared loader for the traced "healing hand + spiral" artwork (hand-spiral.svg).

The source is an image trace: one opaque near-white background rectangle plus
many greyscale shading paths. This module exposes two views of that art:

* recolored_paths()  -> SVG <path> markup with every shade remapped onto a
                        brand sage ramp (for the logo + favicon). The white
                        background is dropped so the mark is transparent.
* polygons()         -> the same paths flattened to polygons in source
                        coordinates (for rasterising a white silhouette into
                        the PIL-drawn OG image).
"""
import re

import brand as b

SRC = b.ROOT / "scripts" / "images" / "hand-spiral.svg"
_raw = SRC.read_text(encoding="utf-8")

# Canvas size from the <svg> tag (the source has no explicit viewBox).
_m = re.search(r'<svg\b[^>]*\bwidth="([\d.]+)"[^>]*\bheight="([\d.]+)"', _raw)
W, H = float(_m.group(1)), float(_m.group(2))

# A square viewBox that centres the portrait artwork (no distortion at 64x64).
_side = max(W, H)
VIEWBOX = f"{(W - _side) / 2:g} {(H - _side) / 2:g} {_side:g} {_side:g}"


# --- low-level parsing ------------------------------------------------------
def _iter_paths():
    """Yield (d, fill_hex, tx, ty) for every <path> in the source."""
    for tag in re.findall(r"<path\b[^>]*?/>", _raw):
        d = re.search(r'\bd="([^"]*)"', tag).group(1)
        fill = re.search(r'fill="(#[0-9a-fA-F]{6})"', tag)
        fill = fill.group(1) if fill else "#000000"
        tr = re.search(r"translate\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)", tag)
        tx, ty = (float(tr.group(1)), float(tr.group(2))) if tr else (0.0, 0.0)
        yield d, fill, tx, ty


def _rgb(h):
    return int(h[1:3], 16), int(h[3:5], 16), int(h[5:7], 16)


def _lum(h):
    """Relative luminance 0 (black) .. 1 (white)."""
    r, g, bl = _rgb(h)
    return (0.2126 * r + 0.7152 * g + 0.0722 * bl) / 255


def _is_background(h):
    return _lum(h) > 0.96  # the near-white canvas rectangle


def _mix(c1, c2, t):
    return tuple(round(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


# --- vector view (logo / favicon) ------------------------------------------
def recolored_paths(dark=b.FOREST_DARK, light=b.SAGE_LIGHT):
    """SVG <path> markup with each shade mapped onto a sage ramp.

    Dark traced tones become `dark`, light shading becomes `light`, so the
    engraved hand + spiral stays fully inside the brand palette.
    """
    d_rgb, l_rgb = _rgb(dark), _rgb(light)
    out = []
    for d, fill, tx, ty in _iter_paths():
        if _is_background(fill):
            continue
        col = "#%02x%02x%02x" % _mix(d_rgb, l_rgb, _lum(fill))
        out.append(f'<path d="{d}" fill="{col}" transform="translate({tx:g},{ty:g})"/>')
    return "\n  ".join(out)


# --- raster view (OG image) -------------------------------------------------
def _flatten_cubic(p0, p1, p2, p3, n=18):
    pts = []
    for i in range(1, n + 1):
        t = i / n
        mt = 1 - t
        a, bb, c, dd = mt ** 3, 3 * mt * mt * t, 3 * mt * t * t, t ** 3
        pts.append((a * p0[0] + bb * p1[0] + c * p2[0] + dd * p3[0],
                    a * p0[1] + bb * p1[1] + c * p2[1] + dd * p3[1]))
    return pts


_TOKENS = re.compile(r"[MmLlHhVvCcZz]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?")


def _parse_path(d, tx, ty):
    """Flatten one path's `d` into a list of polygons (lists of points)."""
    toks = _TOKENS.findall(d)
    i, n = 0, len(toks)
    x = y = 0.0
    start = (0.0, 0.0)
    cmd = None
    subs, cur = [], []

    def num():
        nonlocal i
        v = float(toks[i])
        i += 1
        return v

    while i < n:
        if toks[i] in "MmLlHhVvCcZz":
            cmd = toks[i]
            i += 1
        if cmd in "Mm":
            nx, ny = num(), num()
            if cmd == "m":
                nx, ny = nx + x, ny + y
            x, y = nx, ny
            if cur:
                subs.append(cur)
            cur, start = [(x, y)], (x, y)
            cmd = "l" if cmd == "m" else "L"
        elif cmd in "Ll":
            nx, ny = num(), num()
            if cmd == "l":
                nx, ny = nx + x, ny + y
            x, y = nx, ny
            cur.append((x, y))
        elif cmd in "Hh":
            nx = num()
            x = nx + x if cmd == "h" else nx
            cur.append((x, y))
        elif cmd in "Vv":
            ny = num()
            y = ny + y if cmd == "v" else ny
            cur.append((x, y))
        elif cmd in "Cc":
            c = [num() for _ in range(6)]
            if cmd == "c":
                c = [c[k] + (x if k % 2 == 0 else y) for k in range(6)]
            cur.extend(_flatten_cubic((x, y), (c[0], c[1]), (c[2], c[3]), (c[4], c[5])))
            x, y = c[4], c[5]
        elif cmd in "Zz":
            if cur:
                cur.append(start)
                subs.append(cur)
                cur = []
            x, y = start
    if cur:
        subs.append(cur)
    return [[(px + tx, py + ty) for px, py in sp] for sp in subs]


def polygons():
    """Every (non-background) subpath flattened into source-space polygons."""
    polys = []
    for d, fill, tx, ty in _iter_paths():
        if _is_background(fill):
            continue
        polys.extend(_parse_path(d, tx, ty))
    return polys


def bbox():
    """Tight (minx, miny, maxx, maxy) bounding box of the actual artwork."""
    ps = polygons()
    xs = [p[0] for sp in ps for p in sp]
    ys = [p[1] for sp in ps for p in sp]
    return min(xs), min(ys), max(xs), max(ys)


def tight_viewbox(pad=0.06):
    """Square viewBox hugging the artwork (with `pad` fraction of margin).

    Used by the favicon so the hand fills the tile, rather than the roomy
    full-canvas square the logo uses.
    """
    x0, y0, x1, y1 = bbox()
    side = max(x1 - x0, y1 - y0) * (1 + pad * 2)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return f"{cx - side / 2:g} {cy - side / 2:g} {side:g} {side:g}"


