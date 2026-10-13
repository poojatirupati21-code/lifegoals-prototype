import numpy as np
from PIL import Image, ImageDraw, ImageFilter
W, H = 1080, 1920
Y0 = 1480
def make_body(S):
    K = S * 2; w = int(W * K); h = int((H - Y0) * K)
    rng = np.random.default_rng(5)
    def P(pts): return [(x * K, (y - Y0) * K) for x, y in pts]
    def mask(pts, blur=0):
        m = Image.new("L", (w, h), 0); ImageDraw.Draw(m).polygon(P(pts), fill=255)
        return m.filter(ImageFilter.GaussianBlur(blur * K)) if blur else m
    def paste_arr(layer, arr, m):
        im = Image.fromarray(np.clip(arr, 0, 255).astype("uint8"), "RGB").convert("RGBA"); layer.paste(im, (0, 0), m)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    def shadow(layer, pts, blur, alpha):
        m = mask(pts, blur).point(lambda v: int(v * alpha)); layer.paste(Image.new("RGBA", (w, h), (0, 0, 0, 255)), (0, 0), m)
    small = rng.normal(0, 1, (h // 3 + 1, w // 3 + 1)).astype(np.float32)
    noise = np.array(Image.fromarray(small).resize((w, h), Image.BILINEAR))
    back = Image.new("RGBA", (w, h), (0, 0, 0, 0)); front = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    # ---- jacket (charcoal navy wool: lighting + weave) ----
    jacket = [(20, 1930), (60, 1830), (130, 1762), (240, 1714), (370, 1680), (450, 1652), (540, 1690), (630, 1652), (710, 1680), (840, 1714), (950, 1762), (1020, 1830), (1060, 1930)]
    lx = xx / w; ly = yy / h
    light = 1.0 + 0.55 * np.clip(0.75 - np.abs(lx - 0.38) * 1.5, 0, 1) - 0.3 * ly
    twill = np.sin((xx + yy) * 0.55) * 3.0
    base = np.array([26, 33, 54], np.float32)
    arr = base[None, None, :] * light[..., None] + (noise * 4.0 + twill)[..., None]
    paste_arr(back, arr, mask(jacket, 1.2))
    # shirt V with soft shading
    shirt = [(446, 1650), (634, 1650), (540, 1945)]
    shadow(back, [(430, 1640), (650, 1640), (540, 1960)], 6, 0.55)
    sh_arr = np.zeros((h, w, 3), np.float32) + np.array([240, 243, 247]) - (np.abs(lx - 0.5) * 120)[..., None]
    paste_arr(back, sh_arr, mask(shirt, 0.6))
    # lapels (slightly lighter wool, crease + edge highlight)
    L = [(448, 1650), (545, 1870), (470, 1955), (330, 1770), (396, 1690)]
    Rr = [(632, 1650), (535, 1870), (610, 1955), (750, 1770), (684, 1690)]
    for pts, sg in ((L, -1), (Rr, 1)):
        shadow(back, [(x + sg * 8, y + 10) for x, y in pts], 5, 0.5)
        paste_arr(back, arr * 1.18 + 6, mask(pts, 0.8))
        e = [pts[0], pts[1]]
        ImageDraw.Draw(back).line(P(e), fill=(90, 104, 140, 200), width=int(3.5 * K))
        ImageDraw.Draw(back).line(P([pts[0], pts[4], pts[3]]), fill=(14, 18, 32, 220), width=int(3 * K))
    # pocket square + stitching
    shadow(back, [(700, 1800), (790, 1796), (792, 1826), (702, 1830)], 4, 0.5)
    ImageDraw.Draw(back).polygon(P([(700, 1800), (730, 1792), (762, 1798), (792, 1794), (790, 1824), (702, 1828)]), fill=(244, 244, 246, 255))
    # tie blade (silk: diagonal sheen + repp stripes)
    blade = [(516, 1764), (564, 1764), (594, 1935), (540, 1975), (486, 1935)]
    tm = mask(blade, 0.5)
    tcol = np.array([140, 24, 48], np.float32)
    sheen = 0.78 + 0.45 * np.clip(np.sin((xx - 540 * K) / (26 * K) * 1.2 + 0.6), -1, 1) * 0.5 + 0.1
    stripes = 1 + 0.12 * np.sin((xx * 0.7 + yy * 0.7) / K * 0.55)
    paste_arr(back, tcol[None, None, :] * (sheen * stripes)[..., None], tm)
    shadow(back, [(520, 1764), (566, 1764), (574, 1800), (512, 1800)], 3, 0.6)
    # ---- front layer: collar wings, knot, contact shadow on neck ----
    cl = [(444, 1654), (536, 1722), (462, 1796), (400, 1704)]
    cr = [(636, 1654), (544, 1722), (618, 1796), (680, 1704)]
    shadow(front, [(470, 1630), (610, 1630), (580, 1700), (500, 1700)], 14, 0.42)   # neck shadow under chin
    for pts, tone in ((cl, 250), (cr, 232)):
        shadow(front, [(x, y + 8) for x, y in pts], 4, 0.45)
        ca = np.zeros((h, w, 3), np.float32) + tone - (np.abs(lx - 0.5) * 40)[..., None] - 10 * ly[..., None]
        paste_arr(front, ca, mask(pts, 0.5))
        ImageDraw.Draw(front).line(P([pts[0], pts[1], pts[2]]), fill=(205, 210, 218, 255), width=int(2 * K))
    knot = [(508, 1708), (572, 1708), (566, 1764), (514, 1764)]
    shadow(front, [(504, 1712), (576, 1712), (572, 1776), (508, 1776)], 4, 0.55)
    km = mask(knot, 0.8); ka = np.array([160, 30, 56], np.float32)[None, None, :] * (0.8 + 0.35 * np.clip(1 - np.abs(lx - 0.5) * 7, 0, 1))[..., None]
    paste_arr(front, ka, km)
    ImageDraw.Draw(front).line(P([(540, 1722), (540, 1760)]), fill=(90, 14, 30, 200), width=int(3 * K))
    return back.resize((int(W * S), int((H - Y0) * S)), Image.LANCZOS), front.resize((int(W * S), int((H - Y0) * S)), Image.LANCZOS)
