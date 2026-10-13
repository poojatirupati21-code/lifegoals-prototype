import json, math, sys, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import render as R
R.W, R.H, R.S = 1080, 1920, 1.25
W, H, S = R.W, R.H, R.S
FPS = 20
from render import (INK, INK2, TEAL, SEA, SEAD, SUN, SUNL, CORAL, SKY, STORM, MIST, WHITE, MUTED, SAND, ease, pop, lerp, mix, chip, mini_ui, coin, font)
import avatar

SKIN = (178, 135, 110); NAVY = (24, 32, 58); NAVY2 = (38, 50, 84); TIE = (150, 30, 52)
CAP_BOTTOM = 1330
HEAD_S = 1.15
JAW_Y = 240      # split line (head-crop coords) through the lips
EYES = [(78, 152), (175, 152)]

class C(R.Canvas):
    def __init__(self):
        self.im = Image.new("RGB", (int(W * S), int(H * S)), WHITE); self.d = ImageDraw.Draw(self.im)

# ---------------- host (photo face, suit & tie) ----------------
_head = {}
_base = None
def head_img(opn, blink):
    global _base
    if _base is None: _base = avatar.make_head()
    k = (opn, blink)
    if k in _head: return _head[k]
    h = _base.copy(); w, ht = h.size
    if blink:
        d = ImageDraw.Draw(h)
        for ex, ey in EYES:
            lid = int(7 + 9 * blink)
            d.ellipse((ex - 24, ey - 15, ex + 24, ey - 15 + lid * 2), fill=SKIN + (255,))
            d.arc((ex - 22, ey - 12 + lid, ex + 22, ey + 4 + lid), 15, 165, fill=(50, 32, 28, 255), width=2)
    if opn:
        up = h.crop((0, 0, w, JAW_Y)); lo = h.crop((0, JAW_Y, w, ht))
        mid = h.crop((0, JAW_Y - 1, w, JAW_Y)).resize((w, opn + 1), Image.BILINEAR)
        n = Image.new("RGBA", (w, ht + opn), (0, 0, 0, 0))
        n.paste(up, (0, 0)); n.paste(mid, (0, JAW_Y)); n.paste(lo, (0, JAW_Y + opn))
        d = ImageDraw.Draw(n)
        if opn >= 3:
            d.ellipse((92, JAW_Y - 4, 172, JAW_Y + opn - 1), fill=(64, 22, 26, 255))
            if opn >= 7: d.rounded_rectangle((104, JAW_Y - 3, 160, JAW_Y + 2), radius=2, fill=(226, 220, 214, 255))
        h = n
    f = HEAD_S * S
    h = h.resize((int(h.width * f), int(h.height * f)), Image.LANCZOS)
    _head[k] = h
    return h

_body = None
def host(c, t, mouth, g, g2=0.0):
    global _body
    import body
    if _body is None: _body = body.make_body(S)
    back, front = _body
    x = 540; top = 1325 + math.sin(t * 1.7) * 3
    sh = math.sin(t * 1.1) * 5 + (mouth - 0.3) * 4
    by = int(body.Y0 * S + math.sin(t * 1.7) * 3 * S)
    c.im.paste(back, (int(sh * S * 0.5), by), back)
    open_px = int(round(mouth * 9))
    blink = 0
    ph = (t * 0.55) % 3.2
    if ph < 0.18: blink = 1 if ph < 0.06 or ph > 0.12 else 2
    hd = head_img(open_px, blink)
    rot = math.sin(t * 0.9) * 1.8 + (mouth - 0.3) * 1.6
    hr = hd.rotate(rot, resample=Image.BICUBIC, expand=True)
    cx, cy = x * S, (top + 175 * HEAD_S) * S + 8 * S + (mouth * 5) * S * 0.3
    c.im.paste(hr, (int(cx - hr.width / 2 + sh * S * 0.6), int(cy - hr.height / 2 - 6 * S)), hr)
    c.im.paste(front, (int(sh * S * 0.5), by), front)
    c.d = ImageDraw.Draw(c.im)

# ---------------- backgrounds (cached, blurred depth) ----------------
_bg = {}
def bg(sc_id, c1, c2):
    if sc_id in _bg: return _bg[sc_id]
    w, h = int((W + 120) * S), int((H + 120) * S)
    g = Image.new("RGB", (64, 64)); px = g.load()
    for y in range(64):
        for x in range(64): px[x, y] = mix(c1, c2, (0.35 * x + y) / 85)
    im = g.resize((w, h), Image.BILINEAR)
    ov = Image.new("RGB", (w, h), (0, 0, 0)); d = ImageDraw.Draw(ov); rnd = random.Random(sc_id)
    for i in range(16):
        r = rnd.uniform(50, 160) * S; x = rnd.uniform(0, w); y = rnd.uniform(0, h)
        col = mix(c1, (255, 255, 255), rnd.uniform(0.2, 0.55))
        d.ellipse((x - r, y - r, x + r, y + r), fill=tuple(int(v * 0.35) for v in col))
    ov = ov.filter(ImageFilter.GaussianBlur(40 * S))
    im = Image.fromarray(np.clip(np.array(im).astype(int) + np.array(ov).astype(int), 0, 255).astype("uint8"))
    _bg[sc_id] = im
    return im

# ---------------- small drawing helpers ----------------
def pill(c, s, cx, cy, sz=40, fill=WHITE, ink=INK, w="Bold", pad=34):
    wd = c.tw(s, sz, w) + pad * 2; hh = sz + 36
    c.rr((cx - wd / 2, cy - hh / 2 + 6, cx + wd / 2, cy + hh / 2 + 6), hh / 2, fill=mix(fill, (0, 0, 0), 0.25))
    c.rr((cx - wd / 2, cy - hh / 2, cx + wd / 2, cy + hh / 2), hh / 2, fill=fill)
    c.text((cx, cy - sz * 0.62), s, sz, ink, w, "ma")

def bigcard(c, box, fill=WHITE):
    x0, y0, x1, y1 = box
    c.rr((x0, y0 + 10, x1, y1 + 10), 36, fill=(0, 0, 0)) if False else c.rr((x0 + 4, y0 + 14, x1 + 4, y1 + 14), 36, fill=mix(fill, (0, 0, 0), 0.35))
    c.rr(box, 36, fill=fill)

def heart(c, x, y, r, col=CORAL):
    c.ell((x - r, y - r, x, y + r * .2), fill=col); c.ell((x, y - r, x + r, y + r * .2), fill=col)
    c.poly([(x - r * .98, y - r * .1), (x + r * .98, y - r * .1), (x, y + r * 1.15)], col)

def tick(c, x, y, s=1.0, col=WHITE, w=7):
    c.line([(x - 12 * s, y), (x - 3 * s, y + 10 * s), (x + 14 * s, y - 10 * s)], w * s, col)

def slide(p, d=70): return (1 - ease(p)) * d

# ---------------- top-zone scenes (y 190..1080) ----------------
def v_hook(c, t, k, lt, ts):
    if k == 0:
        s = 1 + 0.05 * math.sin(lt * 8); cx, cy, r = 540, 640, 250 * s
        pts = [(cx + r * math.cos(math.pi / 8 + i * math.pi / 4), cy + r * math.sin(math.pi / 8 + i * math.pi / 4)) for i in range(8)]
        c.poly([(x, y + 12) for x, y in pts], (90, 10, 10)); c.poly(pts, (220, 38, 38))
        c.text((cx, cy - 78), "STOP", 150, WHITE, "Bold", "ma")
        pill(c, "before you sign anything", 540, 900, 40, SUN, INK)
    elif k == 1:
        c.rr((0, 900, W, 1100), 0, fill=(70, 120, 90))
        R.house(c, 540, 640, 2.4, lit=True)
        for i in range(6):
            yy = 560 - ((lt * 90 + i * 130) % 560); xx = 300 + i * 90 + math.sin(lt * 3 + i) * 20
            if yy > 160: heart(c, xx, yy + 100, 28, CORAL)
        pill(c, "I fell in love with a house", 540, 230, 42, WHITE, INK)
    elif k == 2:
        for i, (s, y, col) in enumerate([("Can I afford it?", 330, SKY), ("What's the catch?", 560, CORAL), ("What am I missing?", 790, STORM)]):
            if lt >= i * 1.1:
                p = pop((lt - i * 1.1) / 0.4); sc = max(p, 0.01)
                wd = (c.tw(s, 52, "Bold") + 90) * sc; hh = 130 * sc
                c.rr((540 - wd / 2, y - hh / 2, 540 + wd / 2, y + hh / 2), 65 * sc, fill=WHITE)
                c.rr((540 - wd / 2 - 0, y - hh / 2, 540 - wd / 2 + 24 * sc, y + hh / 2), 12, fill=col) if False else None
                if sc > .6: c.text((540, y - 34), s, 52 * min(sc, 1), INK, "Bold", "ma")
                c.text((540 + (wd / 2) - 30, y - hh / 2 - 38), "?", 64 * sc, SUN, "Bold", "ma")
    else:
        c.text((540, 270), "7", 520, SUN, "Bold", "ma")
        pill(c, "THINGS EVERY FIRST-TIME", 540, 900, 44, WHITE, INK); pill(c, "BUYER MUST KNOW", 540, 1000, 44, WHITE, INK)

def v_t1(c, t, k, lt, ts):
    if k == 0:
        for i in range(5): coin(c, 540 + (i - 2) * 70, 600 - i % 2 * 24 + math.sin(lt * 3 + i) * 8, 70)
        pill(c, "your real number", 540, 900, 46, SUN, INK)
    elif k == 1:
        bigcard(c, (110, 260, 970, 880))
        c.text((540, 290), "4×", 330, SEAD, "Bold", "ma")
        c.text((540, 620), "YOUR GROSS INCOME", 46, INK, "Bold", "ma")
        c.rr((200, 700, 880, 704), 2, fill=(215, 225, 222))
        coin(c, 300, 790, 44); c.text((372, 760), "10% deposit", 56, INK, "Bold")
        pill(c, "Central Bank rule · first-time buyers", 540, 960, 30, SUNL, (138, 90, 0))
    else:
        bigcard(c, (90, 330, 990, 830))
        for i in range(60):
            c.rr((150 + i * 13, 560, 150 + i * 13 + 14, 600), 0, fill=mix(SEA, CORAL, i / 59))
        c.text((540, 380), "How much will you borrow?", 44, INK, "Bold", "ma")
        mx = 150 + 59 * 13 - 10
        c.ell((mx - 16, 530, mx + 16, 562), fill=CORAL); c.text((mx, 450), "MAX", 36, CORAL, "Bold", "ma")
        pxm = 150 + 24 * 13 + 40 * ease(lt / .8)
        c.ell((pxm - 16, 530, pxm + 16, 562), fill=SEAD); c.text((pxm, 450), "COMFORT", 36, SEAD, "Bold", "ma")
        c.text((470, 690), "the repayment you can sleep on", 40, MUTED, "SemiBold", "ma")
        c.text((830, 740 + math.sin(lt * 3) * 8), "z z z", 40, SKY, "Bold", "ma")

def v_t2(c, t, k, lt, ts):
    if k == 0:
        bigcard(c, (110, 400, 970, 760))
        c.text((160, 430), "PAY TO THE ORDER OF  ·  THE SELLER", 28, MUTED, "SemiBold")
        c.text((160, 520), "DEPOSIT  10%", 90, SEAD, "Bold")
        c.line([(560, 700), (900, 690)], 4, INK2); c.text((600, 650), "Signed", 30, MUTED, "SemiBold")
    else:
        c.rr((190, 800, 890, 920), 22, fill=SEA); c.text((540, 832), "THE DEPOSIT", 56, WHITE, "Bold", "ma")
        items = [("Stamp duty  1%", SKY), ("Legal fees", STORM), ("Survey", SUN), ("Insurance", CORAL)]
        for i, (s, col) in enumerate(items):
            st = 0.45 + i * 0.6
            if lt < st: continue
            p = min(1, (lt - st) / 0.45); y = lerp(220, 690 - i * 118, ease(p)) + (abs(math.sin(p * math.pi * 2)) * -14 * (1 - p))
            c.rr((240, y, 840, y + 100), 18, fill=col); c.text((540, y + 22), s, 50, WHITE if col != SUN else INK, "Bold", "ma")
        if lt > 3.2: pill(c, "+ several thousand euro", 540, 250, 44, SUN, INK)

def v_t3(c, t, k, lt, ts):
    if k == 0:
        c.rr((300, 540, 780, 900), 20, fill=CORAL); c.rr((300, 420, 780, 540), 20, fill=(240, 120, 95)); c.rr((510, 420, 570, 900), 0, fill=SUN)
        c.ell((420, 300, 540, 440), outline=SUN, w=16); c.ell((540, 300, 660, 440), outline=SUN, w=16)
        for i in range(5): coin(c, 300 + i * 120, 240 + 30 * math.sin(lt * 4 + i), 30)
    else:
        cards = [("Help to Buy", "refund of tax & DIRT · up to €30,000", SEA), ("First Home Scheme", "shared equity · up to 30% new homes", SKY),
                 ("Local Authority Home Loan", "when a bank says no", STORM), ("Vacant property grants", "bring empty homes back to life", (217, 144, 26))]
        for i, (a, b, col) in enumerate(cards):
            if k < i + 1: continue
            p = (lt / 0.45) if k == i + 1 else 1.0
            y = 215 + i * 215 + slide(p, 120)
            c.rr((70, y + 8, 1010, y + 192 + 8), 36, fill=mix(col, (0, 0, 0), .45)); c.rr((70, y, 1010, y + 192), 36, fill=col)
            c.text((110, y + 34), a, 52, WHITE, "Bold"); c.text((110, y + 104), b, 34, WHITE, "SemiBold")
            c.ell((900, y + 56, 970, y + 126), fill=WHITE); tick(c, 935, y + 92, 1.4, col, 6)

def v_t4(c, t, k, lt, ts):
    tiles = [("FIXED", "certainty", SEA, 1), ("VARIABLE", "can move", SKY, 1), ("GREEN", "cheaper if efficient", SEAD, 2), ("TERM", "longer = more interest", STORM, 3)]
    for i, (a, b, col, kk) in enumerate(tiles):
        x0 = 60 + (i % 2) * 480; y0 = 230 + (i // 2) * 430
        if k < kk:
            c.rr((x0, y0, x0 + 450, y0 + 400), 36, fill=mix(col, (0, 0, 0), .55)); c.text((x0 + 225, y0 + 130), "?", 150, mix(col, WHITE, .3), "Bold", "ma"); continue
        p = (lt / 0.45) if k == kk else 1.0
        oy = slide(p, 80)
        c.rr((x0, y0 + oy, x0 + 450, y0 + 400 + oy), 36, fill=col)
        c.text((x0 + 225, y0 + 270 + oy), a, 56, WHITE, "Bold", "ma"); c.text((x0 + 225, y0 + 338 + oy), b, 28, WHITE, "SemiBold", "ma")
        cx, cy = x0 + 225, y0 + 130 + oy
        if i == 0:
            c.rr((cx - 50, cy - 10, cx + 50, cy + 70), 14, fill=WHITE); c.arc((cx - 32, cy - 70, cx + 32, cy + 10), 180, 360, WHITE, 14)
        elif i == 1:
            pts = [(cx - 120 + j * 12, cy + 20 + math.sin(j * .6 + lt * 4) * 40) for j in range(21)]; c.line(pts, 12, WHITE)
        elif i == 2:
            c.poly([(cx, cy - 70), (cx + 70, cy), (cx, cy + 70), (cx - 70, cy)], WHITE); c.line([(cx - 40, cy + 40), (cx + 40, cy - 40)], 6, col)
        else:
            c.rr((cx - 130, cy - 20, cx - 20, cy + 70), 8, fill=WHITE); c.rr((cx + 20, cy - 70, cx + 130, cy + 70), 8, fill=(255, 220, 160))

def v_t5(c, t, k, lt, ts):
    if k == 0:
        s = pop(lt / 0.5)
        c.rr((140, 400, 940, 760), 30, fill=None, outline=SUN, w=14)
        c.text((540, 450 * 1), "APPROVAL", 120 * min(s, 1), SUN, "Bold", "ma"); c.text((540, 580), "IN PRINCIPLE", 96 * min(s, 1), WHITE, "Bold", "ma")
        pill(c, "before you start viewing", 540, 900, 40, WHITE, INK)
    else:
        rows = [("Savings habits", SEA), ("Credit record · CCR", SKY), ("Your debts", CORAL)]
        for i, (s, col) in enumerate(rows):
            y = 240 + i * 190
            c.rr((80, y, 1000, y + 160), 36, fill=WHITE); c.ell((120, y + 36, 208, y + 124), fill=col); c.text((164, y + 44), str(i + 1), 52, WHITE, "Bold", "ma")
            c.text((240, y + 44), s, 54, INK, "Bold")
        if k == 2:
            for i, s in enumerate(["Pay on time", "No new loans"]):
                if lt < i * 1.0: continue
                y = 830 + i * 120
                c.rr((130, y, 950, y + 100), 50, fill=SEAD); tick(c, 200, y + 52, 1.6, WHITE, 6); c.text((260, y + 24), s, 48, WHITE, "Bold")

def v_t6(c, t, k, lt, ts):
    if k == 0:
        R.house(c, 540, 560, 2.2, lit=True)
        r = 120 + 10 * math.sin(lt * 3); mx, my = 640 + 40 * math.sin(lt * 1.5), 620
        c.ell((mx - r, my - r, mx + r, my + r), outline=INK, w=18); c.line([(mx + r * .7, my + r * .7), (mx + r * 1.5, my + r * 1.5)], 24, INK)
    else:
        items = [("SOLICITOR", "contracts checked", SKY), ("SURVEY", "no hidden surprises", STORM)]
        for i, (a, b, col) in enumerate(items):
            if lt < i * 1.2: continue
            y = 230 + i * 190 + slide(min(1, (lt - i * 1.2) / .4), 60)
            c.rr((70, y, 1010, y + 165), 36, fill=col); c.text((110, y + 32), a, 54, WHITE, "Bold"); c.text((110, y + 100), b, 34, WHITE, "SemiBold")
        if lt >= 2.6:
            y = 640
            c.rr((70, y, 1010, y + 330), 36, fill=WHITE); c.text((110, y + 24), "B E R  RATING", 44, INK, "Bold")
            cols = [(0, 150, 70), (80, 180, 60), (170, 200, 40), (240, 220, 40), (250, 170, 40), (240, 110, 40), (220, 50, 50)]
            for i, (cc, L) in enumerate(zip(cols, "ABCDEFG")):
                x0 = 110 + i * 126; c.rr((x0, y + 110, x0 + 112, y + 210), 14, fill=cc); c.text((x0 + 56, y + 130), L, 52, WHITE, "Bold", "ma")
            c.poly([(110 + 126 + 56, y + 222), (110 + 126 + 36, y + 262), (110 + 126 + 76, y + 262)], INK); c.text((540, y + 268), "lower bills = lower real cost", 30, MUTED, "SemiBold", "ma")

def v_t7(c, t, k, lt, ts):
    cx, cy = 540, 560
    if k < 2:
        c.poly([(cx - 220, cy - 230), (cx, cy - 300), (cx + 220, cy - 230), (cx + 220, cy + 10), (cx, cy + 300), (cx - 220, cy + 10)], SEA)
        c.poly([(cx - 180, cy - 200), (cx, cy - 258), (cx + 180, cy - 200), (cx + 180, cy), (cx, cy + 250), (cx - 180, cy)], SEAD)
        R.house(c, cx, cy - 20, 0.85, wall=SAND)
        if k == 1:
            pill(c, "Mortgage protection", 540, 960, 44, WHITE, INK)
            bigcard(c, (200, 130, 880, 230)) ; c.text((540, 152), "Emergency fund  3–6 months", 40, INK, "Bold", "ma")
    else:
        rnd = random.Random(2)
        c.ell((220, 220, 520, 360), fill=(150, 160, 190)); c.ell((380, 180, 700, 340), fill=(170, 180, 205)); c.ell((560, 230, 860, 360), fill=(150, 160, 190))
        for i in range(30):
            x = 240 + rnd.random() * 600; y = 360 + ((lt * 260 + rnd.random() * 500) % 500)
            c.line([(x, y), (x - 8, y + 26)], 5, SKY)
        R.house(c, 540, 760, 1.5, lit=True)
        for i, (s, y) in enumerate([("What if rates rise?", 960), ("What if one income stops?", 1040)]):
            if lt >= 0.2 + i * 1.5: pill(c, s, 540, y, 40, WHITE, INK)

def v_road(c, t, k, lt, ts, dur):
    steps = ["Save", "Approval", "Find home", "Sale agreed", "Loan offer", "Solicitor", "Draw down", "KEYS"]
    if k == 0:
        c.text((540, 400), "?", 600, SUN, "Bold", "ma"); return
    n = min(8, int(lt / max(dur, .1) * 8.6) + 1)
    pts = [(190, 250 + i * 92) for i in range(8)]
    for i in range(7): c.line([pts[i], pts[i + 1]], 14, (90, 84, 140) if i + 1 >= n else SUN)
    for i, (x, y) in enumerate(pts):
        on = i < n
        c.ell((x - 36, y - 36, x + 36, y + 36), fill=SUN if on else (60, 54, 110))
        c.text((x, y - 24), str(i + 1), 40, INK if on else MUTED, "Bold", "ma")
        if on: c.text((x + 70, y - 28), steps[i], 52, WHITE if i < 7 else SUN, "Bold")
    if n >= 8:
        x, y = pts[7]; kx = 700
        c.ell((kx - 50, y - 50, kx + 50, y + 50), fill=SUN); c.ell((kx - 22, y - 22, kx + 22, y + 22), fill=(255, 241, 209)); c.rr((kx + 40, y - 8, kx + 180, y + 8), 6, fill=SUN)

def v_end(c, t, k, lt, ts):
    c.rr((0, 880, W, 1100), 0, fill=(110, 170, 100))
    R.house(c, 540, 590, 2.5, lit=True)
    p = ease((lt - 0.6) / 0.8)
    kx, ky = 540, 300 - 40 * (1 - p) + math.sin(lt * 3) * 8
    c.ell((kx - 80, ky - 80, kx + 80, ky + 80), fill=SUN); c.ell((kx - 36, ky - 36, kx + 36, ky + 36), fill=(255, 241, 209)); c.rr((kx + 60, ky - 14, kx + 280, ky + 14), 10, fill=SUN); c.rr((kx + 200, ky, kx + 230, ky + 56), 8, fill=SUN)
    rnd = random.Random(4)
    for i in range(50):
        x = rnd.random() * W; sp = 120 + rnd.random() * 200; y = ((lt * sp) + rnd.random() * 900) % 900 + 150
        c.rr((x, y, x + 14, y + 22), 3, fill=[SUN, CORAL, SEA, SKY, STORM][i % 5])
    pill(c, "KEYS IN HAND", 540, 960, 56, INK, SUN)

def v_solution(c, t, k, lt, ts, dur):
    c.text((540, 190), "LifeGoals", 100, SUN, "Bold", "ma")
    box = R.phone(c, 540, 320, 400, 600)
    which = ["discover", "map", "expert"]
    i = min(2, int(lt / max(dur, .1) * 3.0))
    mini_ui(c, box, which[i], lt)

def v_cta(c, t, k, lt, ts):
    items = [("SAVE", SEA), ("SHARE", SKY), ("START", CORAL)]
    for i, (s, col) in enumerate(items):
        x = 230 + i * 310; y = 400 + abs(math.sin(lt * 4 + i)) * -30
        c.ell((x - 110, y - 110, x + 110, y + 110), fill=col)
        if i == 0: c.poly([(x - 40, y - 70), (x + 40, y - 70), (x + 40, y + 70), (x, y + 30), (x - 40, y + 70)], WHITE)
        elif i == 1: c.poly([(x - 70, y + 10), (x + 70, y - 60), (x + 30, y + 70), (x + 6, y + 16)], WHITE)
        else: heart(c, x, y - 20, 50, WHITE)
        c.text((x, y + 140), s, 48, WHITE, "Bold", "ma")
    pill(c, "Start your plan on LifeGoals", 540, 760, 50, SUN, INK)
    c.text((540, 850), "Dramatised story · rules & figures change · not financial advice", 26, (230, 230, 240), "Regular", "ma")

# ---------------- captions + UI ----------------
def draw_caption(c, cap, t, a, b):
    words = cap.split(); lens = [len(w) + 2 for w in words]; tot = sum(lens)
    dur = max(b - a, .1); acc = 0; wt = []
    for l in lens: wt.append((a + dur * acc / tot, a + dur * (acc + l) / tot)); acc += l
    sz = 66 if len(cap) < 120 else 56; maxw = 960; lines = []; cur = []
    for i, w in enumerate(words):
        test = " ".join(words[j] for j in cur + [i])
        if c.tw(test, sz, "Bold") > maxw and cur: lines.append(cur); cur = [i]
        else: cur.append(i)
    lines.append(cur)
    lh = int(sz * 1.27); y0 = CAP_BOTTOM - len(lines) * lh
    for li, ln in enumerate(lines):
        total = sum(c.tw(words[i], sz, "Bold") for i in ln) + c.tw(" ", sz, "Bold") * (len(ln) - 1)
        x = 540 - total / 2
        for i in ln:
            wd = c.tw(words[i], sz, "Bold"); act = wt[i][0] <= t < wt[i][1]
            col = SUN if act else WHITE
            yy = y0 + li * lh - (6 if act else 0)
            c.d.text((x * S, yy * S), words[i], font=font(sz, "Bold"), fill=col, stroke_width=int(7 * S), stroke_fill=(10, 14, 30))
            x += wd + c.tw(" ", sz, "Bold")

def build(timing):
    total = timing["total"]; scenes = timing["scenes"]
    vox = np.load("voice2.npy"); sr = 24000
    win = int(sr / FPS)
    env = np.array([np.sqrt(np.mean(vox[i:i + win] ** 2)) if i + win <= len(vox) else 0 for i in range(0, len(vox), win)])
    env = env / (np.percentile(env, 92) + 1e-6); env = np.clip(env, 0, 1)
    ids = [s["id"] for s in scenes]
    from script2 import SCENES
    meta = {s["id"]: s for s in SCENES}
    def frame(n):
        t = n / FPS
        si = max(i for i, s in enumerate(scenes) if s["start"] <= t); sc = scenes[si]; m = meta[sc["id"]]
        c = C()
        # background with slow parallax
        b = bg(si, *m["bg"]); ox = int((60 + math.sin(t * .4) * 40) * S); oy = int((60 + math.cos(t * .3) * 40) * S)
        c.im.paste(b.crop((ox, oy, ox + int(W * S), oy + int(H * S)))); c.d = ImageDraw.Draw(c.im)
        lt = t - sc["start"]; ts = [x[0] - sc["start"] for x in sc["sent"]]
        k = max([i for i, x in enumerate(ts) if x <= lt] or [0]); klt = lt - ts[k]
        dur = sc["sent"][k][1] - sc["sent"][k][0]
        sid = sc["id"]
        if sid == "road": v_road(c, t, k, klt, ts, dur)
        elif sid == "solution": v_solution(c, t, k, klt, ts, dur)
        else: globals()["v_" + sid](c, t, k, klt, ts)
        # label + progress dots
        if m["label"]:
            num = m["label"].split()[0]
            if num.isdigit():
                pill(c, m["label"].split(" ", 1)[1].strip().title() if False else m["label"][3:].strip(), 540, 140, 38, INK, WHITE, pad=30)
                c.ell((54, 104, 126, 176), fill=SUN); c.text((90, 112), num, 48, INK, "Bold", "ma")
            else: pill(c, m["label"], 540, 140, 38, INK, WHITE)
        ti = [i for i, s in enumerate(ids) if s.startswith("t") and s[1:].isdigit()]
        if sid.startswith("t") and sid[1:].isdigit():
            cur = int(sid[1:])
            for j in range(7): c.ell((300 + j * 78 - 12, 40, 300 + j * 78 + 12, 64), fill=SUN if j < cur else (255, 255, 255)) if False else c.ell((300 + j * 78 - 12, 62, 300 + j * 78 + 12, 86), fill=SUN if j < cur else (120, 130, 150))
        # host
        mo = float(env[min(len(env) - 1, n)]) if True else 0
        mo = mo * 0.9
        g = max(0.0, math.sin(t * 1.25 + si)) ** 2 * (0.0 if sid in ("solution", "cta") else 1.0)
        g2 = 0.0
        if sid == "cta": g = ease(min(1, lt / .5)) * (0.7 + 0.3 * math.sin(t * 8))
        host(c, t, mo, g, g2)
        # caption
        for a, bb, cp in sc["sent"]:
            if a - 0.02 <= t <= bb + 0.5: draw_caption(c, cp, t, a, bb)
        # dramatised tag on first scene
        if sid == "hook" and lt < 3.5: c.text((540, 1352), "", 1, WHITE)
        out = c.im.resize((W, H), Image.LANCZOS)
        # punch-in on scene change
        zt = ease(lt / 0.28)
        if zt < 1:
            z = 1 + 0.07 * (1 - zt); w2, h2 = int(W / z), int(H / z)
            out = out.crop(((W - w2) // 2, (H - h2) // 2, (W - w2) // 2 + w2, (H - h2) // 2 + h2)).resize((W, H), Image.BILINEAR)
        return out
    return frame, total

if __name__ == "__main__":
    timing = json.load(open("timing2.json")); frame, total = build(timing)
    mode = sys.argv[1]
    if mode == "test":
        os.makedirs("test2", exist_ok=True)
        for sc in timing["scenes"]:
            for kk, (a, b, _) in enumerate(sc["sent"]):
                if kk == len(sc["sent"]) - 1 or sc["id"] in ("hook",):
                    frame(int((a + (b - a) * 0.8) * FPS)).save(f"test2/{sc['id']}_{kk}.png")
    else:
        part, nparts = int(sys.argv[2]), int(sys.argv[3]); os.makedirs("frames2", exist_ok=True)
        N = int(total * FPS) + 1
        for n in range(part, N, nparts): frame(n).save(f"frames2/f{n:05d}.jpg", quality=92)
