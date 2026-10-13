import json, math, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, S, FPS = 1280, 720, 2, 15
FD = "/usr/share/fonts/opentype/inter/Inter-"
_f = {}
def font(sz, w="Regular"):
    k = (sz, w)
    if k not in _f: _f[k] = ImageFont.truetype(FD + w + ".otf", int(sz * S))
    return _f[k]

INK = (14, 47, 51); INK2 = (27, 74, 80); TEAL = (24, 82, 90); SEA = (46, 158, 140); SEAD = (31, 122, 107)
SUN = (255, 176, 32); SUNL = (255, 241, 209); CORAL = (232, 103, 74); SKY = (78, 155, 216); STORM = (94, 84, 142)
MIST = (242, 246, 243); WHITE = (255, 255, 255); MUTED = (74, 101, 104); SAND = (255, 247, 236)

def ease(x): x = max(0, min(1, x)); return 1 - (1 - x) ** 3
def pop(x): x = max(0, min(1, x)); return 1 + 1.70158 * (x - 1) ** 3 + 0.70158 * (x - 1) ** 2 if x < 1 else 1
def lerp(a, b, t): return a + (b - a) * t
def mix(c1, c2, t): return tuple(int(lerp(a, b, t)) for a, b in zip(c1, c2))

class Canvas:
    def __init__(self):
        self.im = Image.new("RGB", (W * S, H * S), WHITE); self.d = ImageDraw.Draw(self.im)
    def sc(self, v): return [x * S for x in v]
    def rr(self, box, r, fill=None, outline=None, w=0): self.d.rounded_rectangle(self.sc(box), r * S, fill=fill, outline=outline, width=int(w * S))
    def ell(self, box, fill=None, outline=None, w=0): self.d.ellipse(self.sc(box), fill=fill, outline=outline, width=int(w * S))
    def poly(self, pts, fill): self.d.polygon([(x * S, y * S) for x, y in pts], fill=fill)
    def line(self, pts, w, fill): self.d.line([(x * S, y * S) for x, y in pts], fill=fill, width=int(w * S), joint="curve")
    def arc(self, box, a0, a1, fill, w): self.d.arc(self.sc(box), a0, a1, fill=fill, width=int(w * S))
    def text(self, xy, s, sz, fill=INK, w="Regular", anchor="la"): self.d.text((xy[0] * S, xy[1] * S), s, font=font(sz, w), fill=fill, anchor=anchor)
    def tw(self, s, sz, w="Regular"): return font(sz, w).getlength(s) / S
    def wrap(self, xy, s, sz, maxw, fill=INK, w="Regular", lh=1.3, anchor="l"):
        words, lines, cur = s.split(), [], ""
        for wd in words:
            t = (cur + " " + wd).strip()
            if self.tw(t, sz, w) > maxw and cur: lines.append(cur); cur = wd
            else: cur = t
        lines.append(cur)
        for i, ln in enumerate(lines):
            x = xy[0] if anchor == "l" else xy[0] - self.tw(ln, sz, w) / 2
            self.text((x, xy[1] + i * sz * lh), ln, sz, fill, w)
        return len(lines) * sz * lh
    def gradient(self, c1, c2, diag=True):
        g = Image.new("RGB", (64, 64))
        px = g.load()
        for y in range(64):
            for x in range(64):
                t = ((x + y) / 126) if diag else y / 63
                px[x, y] = mix(c1, c2, t)
        self.im.paste(g.resize((W * S, H * S), Image.BILINEAR))
        self.d = ImageDraw.Draw(self.im)
    def overlay_alpha(self, fn, a):
        # draw fn() on a copy then blend with alpha a
        if a >= 0.999: fn(); return
        if a <= 0.01: return
        base = self.im.copy(); fn(); self.im = Image.blend(base, self.im, a); self.d = ImageDraw.Draw(self.im)

def card(c, box, r=22, fill=WHITE, shadow=True):
    x0, y0, x1, y1 = box
    if shadow: c.rr((x0, y0 + 6, x1, y1 + 6), r, fill=mix(fill, (0, 0, 0), 0.10))
    c.rr(box, r, fill=fill)

def chip(c, x, y, s, fill=SUNL, ink=(138, 90, 0), sz=18, w="SemiBold", anchor="l"):
    wd = c.tw(s, sz, w) + 28
    x0 = x if anchor == "l" else x - wd / 2
    c.rr((x0, y, x0 + wd, y + sz + 18), (sz + 18) / 2, fill=fill)
    c.text((x0 + 14, y + 8), s, sz, ink, w)
    return wd

# ---------------- characters ----------------
def person(c, x, y, s=1.0, skin=(240, 200, 170), hair=(60, 40, 30), shirt=SEA, long_hair=False, t=0, look=0, sit=False, mouth="smile"):
    b = math.sin(t * 2.2) * 2 * s
    y += b
    if not sit:
        c.rr((x - 22 * s, y + 70 * s, x - 4 * s, y + 140 * s), 8 * s, fill=INK2)
        c.rr((x + 4 * s, y + 70 * s, x + 22 * s, y + 140 * s), 8 * s, fill=INK2)
    else:
        c.rr((x - 24 * s, y + 70 * s, x + 24 * s, y + 92 * s), 8 * s, fill=INK2)
        c.rr((x - 24 * s, y + 80 * s, x - 6 * s, y + 130 * s), 8 * s, fill=INK2)
        c.rr((x + 6 * s, y + 80 * s, x + 24 * s, y + 130 * s), 8 * s, fill=INK2)
    if long_hair: c.rr((x - 32 * s, y - 38 * s, x + 32 * s, y + 52 * s), 26 * s, fill=hair)
    c.rr((x - 34 * s, y + 18 * s, x + 34 * s, y + 90 * s), 20 * s, fill=shirt)
    c.rr((x - 46 * s, y + 24 * s, x - 30 * s, y + 80 * s), 8 * s, fill=shirt)
    c.rr((x + 30 * s, y + 24 * s, x + 46 * s, y + 80 * s), 8 * s, fill=shirt)
    c.rr((x - 8 * s, y + 8 * s, x + 8 * s, y + 24 * s), 4 * s, fill=skin)
    c.ell((x - 28 * s, y - 36 * s, x + 28 * s, y + 20 * s), fill=skin)
    if long_hair:
        c.d.pieslice(c.sc((x - 30 * s, y - 42 * s, x + 30 * s, y + 14 * s)), 180, 360, fill=hair)
    else:
        c.d.pieslice(c.sc((x - 30 * s, y - 42 * s, x + 30 * s, y + 8 * s)), 180, 360, fill=hair)
    ex = look * 3 * s
    for dx in (-10, 10):
        c.ell((x + dx * s - 3 * s + ex, y - 8 * s, x + dx * s + 3 * s + ex, y - 2 * s), fill=INK)
    if mouth == "smile": c.arc((x - 9 * s, y - 4 * s, x + 9 * s, y + 10 * s), 20, 160, INK, max(1, 2 * s))
    elif mouth == "open": c.ell((x - 5 * s, y + 3 * s, x + 5 * s, y + 11 * s), fill=INK)
    else: c.line([(x - 7 * s, y + 8 * s), (x + 7 * s, y + 8 * s)], 2 * s, INK)

def house(c, x, y, s=1.0, wall=SAND, roof=CORAL, door=SEAD, lit=False):
    c.rr((x - 110 * s, y - 20 * s, x + 110 * s, y + 110 * s), 6 * s, fill=wall)
    c.poly([(x - 135 * s, y - 14 * s), (x, y - 100 * s), (x + 135 * s, y - 14 * s)], roof)
    c.rr((x - 22 * s, y + 20 * s, x + 22 * s, y + 110 * s), 6 * s, fill=door)
    c.ell((x + 10 * s, y + 62 * s, x + 16 * s, y + 68 * s), fill=SUN)
    for dx in (-78, 52):
        c.rr((x + dx * s, y + 8 * s, x + (dx + 36) * s, y + 52 * s), 4 * s, fill=SUN if lit else (190, 220, 235))
        c.line([(x + (dx + 18) * s, y + 8 * s), (x + (dx + 18) * s, y + 52 * s)], 2 * s, WHITE)

def laptop(c, x, y, glow=True, tt=0):
    if glow:
        for i in range(4):
            c.ell((x - 150 - i * 22, y - 110 - i * 14, x + 150 + i * 22, y + 20 + i * 14), fill=None)
    c.rr((x - 90, y - 70, x + 90, y + 10), 8, fill=(30, 40, 60))
    c.rr((x - 82, y - 62, x + 82, y + 2), 4, fill=(225, 239, 250))
    for i in range(3):
        c.rr((x - 74 + i * 52, y - 54, x - 30 + i * 52, y - 14), 4, fill=[SKY, SUN, SEA][i])
        c.rr((x - 74 + i * 52, y - 10, x - 40 + i * 52, y - 4), 2, fill=MUTED)
    c.rr((x - 104, y + 10, x + 104, y + 20), 5, fill=(70, 80, 100))

def phone(c, x, y, w=300, h=600):
    c.rr((x - w / 2 - 12, y - 12, x + w / 2 + 12, y + h + 12), 44, fill=(10, 20, 24))
    c.rr((x - w / 2, y, x + w / 2, y + h), 34, fill=MIST)
    return (x - w / 2, y, x + w / 2, y + h)

def bubble(c, x, y, s, sz=26, tail=(0, 40), fill=WHITE, ink=INK):
    wd = c.tw(s, sz, "SemiBold") + 48; hh = sz + 38
    c.rr((x - wd / 2, y - hh / 2 + 5, x + wd / 2, y + hh / 2 + 5), hh / 2, fill=(0, 0, 0, ) if False else mix(fill, (0, 0, 0), 0.12))
    c.rr((x - wd / 2, y - hh / 2, x + wd / 2, y + hh / 2), hh / 2, fill=fill)
    c.poly([(x - 10 + tail[0], y + hh / 2 - 2), (x + 10 + tail[0], y + hh / 2 - 2), (x + tail[0] * 1.6, y + hh / 2 + tail[1])], fill)
    c.text((x, y - sz * 0.62), s, sz, ink, "SemiBold", "ma")

def coin(c, x, y, r, label="€"):
    c.ell((x - r, y - r, x + r, y + r), fill=SUN); c.ell((x - r + 5, y - r + 5, x + r - 5, y + r - 5), outline=(200, 130, 0), w=2)
    c.text((x, y - r * 0.55), label, r * 1.1, (138, 90, 0), "Bold", "ma")

def stepbadge(c, n, s):
    c.rr((48, 44, 48 + 54, 44 + 54), 18, fill=SUN); c.text((75, 54), str(n), 30, INK, "Bold", "ma")
    c.text((120, 56), s, 30, WHITE, "Bold")

# ---------------- backgrounds ----------------
def bg_night(c, t):
    c.gradient((14, 24, 54), (30, 54, 92), diag=False)
    # window with city skyline and stars
    c.rr((760, 90, 1190, 400), 14, fill=(20, 40, 80));
    import random; rnd = random.Random(3)
    for i in range(14):
        sx, sy = 780 + rnd.random() * 390, 110 + rnd.random() * 120
        c.ell((sx, sy, sx + 4, sy + 4), fill=(255, 255, 220))
    for i in range(9):
        bx = 770 + i * 46; bh = 60 + rnd.random() * 120
        c.rr((bx, 400 - bh, bx + 40, 400), 2, fill=(14, 24, 54))
        for j in range(int(bh // 28)):
            if rnd.random() > 0.45: c.rr((bx + 8, 400 - bh + 10 + j * 28, bx + 16, 400 - bh + 20 + j * 28), 1, fill=SUN)
    c.line([(975, 90), (975, 400)], 6, (14, 24, 54)); c.line([(760, 245), (1190, 245)], 6, (14, 24, 54))
    c.rr((0, 560, W, H), 0, fill=(36, 30, 52))

def bg_day(c):
    c.gradient((226, 242, 248), (246, 250, 246), diag=False)

def bg_teal(c):
    c.gradient((14, 47, 51), (24, 100, 108))

# ---------------- scenes ----------------
def sc_hook(c, t, ts):
    bg_night(c, t)
    # sofa
    c.rr((130, 410, 700, 560), 40, fill=(92, 84, 142)); c.rr((100, 450, 160, 590), 24, fill=(76, 68, 124)); c.rr((670, 450, 730, 590), 24, fill=(76, 68, 124))
    c.rr((130, 520, 700, 590), 20, fill=(110, 100, 160))
    person(c, 330, 340, 1.5, hair=(120, 60, 40), shirt=CORAL, long_hair=True, t=t, look=1, sit=True)
    person(c, 520, 345, 1.5, hair=(40, 30, 28), shirt=SKY, t=t + 1, look=1, sit=True)
    laptop(c, 430, 530, tt=t)
    # lower third
    a = ease((t - ts[0]) / 0.6)
    c.overlay_alpha(lambda: (c.rr((60, 80, 470, 170), 18, fill=(255, 255, 255)), c.text((86, 96), "Aoife & Conor", 34, INK, "Bold"), c.text((86, 138), "First-time buyers · Dublin", 20, MUTED)), a)
    if t >= ts[1]:
        k = ease((t - ts[1]) / 0.6)
        c.overlay_alpha(lambda: (chip(c, 60, 190, "Rent €1,800 / month", fill=(255, 214, 200), ink=(150, 40, 20), sz=22),
                                 c.rr((70, 255, 250, 335), 10, fill=SUNL), c.text((88, 268), "Baby due", 20, INK, "Bold"), c.text((88, 296), "in April", 20, MUTED)), k)
    if t >= ts[2]:
        for i, (bx, by) in enumerate([(330, 215), (470, 180), (610, 215)]):
            tt = ease((t - ts[2] - i * 0.35) / 0.4)
            if tt > 0: c.text((bx, by - 14 * (1 - tt)), "?", 54 * tt, SUN, "Bold", "ma")

def sc_worries(c, t, ts):
    bg_night(c, t); c.rr((0, 0, W, H), 0, fill=None)
    c.im.paste(Image.blend(c.im, Image.new("RGB", c.im.size, (14, 24, 54)), 0.35)); c.d = ImageDraw.Draw(c.im)
    person(c, 520, 420, 1.6, hair=(120, 60, 40), shirt=CORAL, long_hair=True, t=t, mouth="flat")
    person(c, 760, 425, 1.6, hair=(40, 30, 28), shirt=SKY, t=t + 1, mouth="flat")
    spots = [(330, 130, -30), (700, 90, 0), (1000, 170, 30), (360, 290, -10), (920, 330, 20)]
    qs = ["How much can we borrow?", "Is our deposit big enough?", "Are there schemes to help?", "Any hidden costs?", "What if rates go up?"]
    for i, (x, y, tx) in enumerate(spots):
        if t >= ts[i]:
            p = pop((t - ts[i]) / 0.45)
            if p > 0.05:
                bubble(c, x, y + math.sin(t * 1.5 + i) * 4, qs[i], sz=int(26 * min(p, 1.05)) if p < 1 else 26, tail=(tx * 0.4, 36))

def sc_borrow(c, t, ts):
    bg_day(c)
    stepbadge(c, 1, "Know your number"); c.text((48, 44), "", 1, INK)
    c.rr((40, 36, 560, 108), 20, fill=INK); stepbadge(c, 1, "Know your number")
    person(c, 190, 300, 1.3, hair=(120, 60, 40), shirt=CORAL, long_hair=True, t=t)
    person(c, 380, 305, 1.3, hair=(40, 30, 28), shirt=SKY, t=t + 1)
    if t >= ts[2]:
        a = ease((t - ts[2]) / 0.5)
        c.overlay_alpha(lambda: (chip(c, 110, 480, "Aoife €62,000", fill=SKY, ink=WHITE, sz=22), chip(c, 340, 480, "Conor €48,000", fill=SEA, ink=WHITE, sz=22)), a)
    # formula card
    cx0 = 640
    card(c, (cx0, 130, 1220, 590))
    c.text((cx0 + 36, 150), "How much could we borrow?", 28, INK, "Bold")
    a2 = ease((t - ts[1]) / 0.6)
    c.overlay_alpha(lambda: (c.text((cx0 + 36, 206), "Gross household income", 20, MUTED), c.text((cx0 + 36, 236), "€110,000", 44, INK, "Bold"),
                             c.text((cx0 + 300, 244), "×  4", 40, SEAD, "Bold"), c.rr((cx0 + 36, 306, cx0 + 544, 309), 2, fill=(220, 230, 226))), a2)
    if t >= ts[2]:
        v = int(440000 * ease((t - ts[2]) / 1.4))
        c.text((cx0 + 36, 322), "Up to about", 20, MUTED); c.text((cx0 + 36, 352), "€{:,}".format(v), 62, SEAD, "Bold")
    if t >= ts[3]:
        a3 = ease((t - ts[3]) / 0.5)
        def dep():
            c.rr((cx0 + 36, 446, cx0 + 544, 540), 18, fill=SUNL)
            c.text((cx0 + 60, 458), "Minimum deposit", 20, (138, 90, 0)); c.text((cx0 + 60, 488), "10% of the price", 34, INK, "Bold")
            coin(c, cx0 + 496, 493, 28)
        c.overlay_alpha(dep, a3)
    c.text((cx0 + 36, 556), "Limited lender exceptions apply. Confirm current rules.", 15, MUTED)

def sc_deposit(c, t, ts):
    bg_day(c)
    c.rr((40, 36, 480, 108), 20, fill=INK); stepbadge(c, 2, "The deposit")
    card(c, (160, 130, 1120, 590), r=26)
    c.text((200, 150), "Deposit calculator", 30, INK, "Bold"); chip(c, 1080, 152, "LifeGoals tool", fill=SEAD and (221, 242, 236), ink=SEAD, sz=16, anchor="r")
    items = [("Home price", "€400,000"), ("Deposit needed (10%)", "€40,000"), ("Saved so far", "€22,000"), ("Monthly saving", "€800")]
    for i, (a, b) in enumerate(items):
        if t >= ts[min(i + 1, 3)] - (0 if i else 99):
            al = ease((t - ts[min(i + 1, 3)] + (99 if not i else 0)) / 0.5) if i else 1
            def row(i=i, a=a, b=b):
                y = 205 + i * 86
                c.text((200, y), a, 20, MUTED); c.text((200, y + 26), b, 32, INK, "Bold")
                c.rr((200, y + 66, 520, y + 68), 1, fill=(225, 233, 230))
            c.overlay_alpha(row, al if i != 0 else 1)
    # progress ring / bar
    bx0, bx1, by = 620, 1080, 245
    c.text((bx0, 205), "Progress to your deposit", 20, MUTED)
    c.rr((bx0, by + 6, bx1, by + 46), 20, fill=(228, 236, 233))
    prog = 0.55 * ease((t - ts[2]) / 1.5) if t >= ts[2] else 0.0
    if t >= ts[1]: prog = max(prog, 0.0)
    if prog > 0.01: c.rr((bx0, by + 6, bx0 + (bx1 - bx0) * prog, by + 46), 20, fill=SEA)
    c.text((bx0, by + 60), "€{:,}".format(int(40000 * prog)), 28, SEAD, "Bold"); c.text((bx1, by + 60), "€40,000", 28, MUTED, "Bold", "ra")
    if t >= ts[3]:
        a = ease((t - ts[3]) / 0.6)
        def res():
            c.rr((bx0, 370, bx1, 560), 24, fill=INK)
            c.text((bx0 + 30, 384), "Time to your deposit", 20, (198, 222, 218)); c.text((bx0 + 30, 412), "1 yr 11 months", 52, SUN, "Bold")
            c.text((bx0 + 30, 484), "Add €200 a month", 20, (198, 222, 218)); c.text((bx0 + 30, 512), "and it drops to 1 yr 6 months", 26, WHITE, "SemiBold")
        c.overlay_alpha(res, a)
        # calendar
        cc = ease((t - ts[3] - 0.5) / 0.5)
    for i in range(3):
        if t >= ts[1]: coin(c, 1180, 250 + i * 12, 22) if False else None

def sc_schemes(c, t, ts):
    bg_day(c)
    c.rr((40, 36, 640, 108), 20, fill=INK); stepbadge(c, 3, "Use the help that exists")
    cards = [
        ("Help to Buy", "Up to €30,000", "Refund of income tax & DIRT paid over 4 years. New builds.", SEA, 1),
        ("First Home Scheme", "30% / 20% equity", "State + banks fund up to 30% (new) or 20% (second-hand). Regional price limits.", SKY, 2),
        ("Local Authority Home Loan", "If banks say no", "Government-backed loan for those refused by lenders. Income & price caps apply.", STORM, 3),
    ]
    for i, (n, big, desc, col, k) in enumerate(cards):
        x0 = 50 + i * 405
        p = ease((t - ts[k]) / 0.6)
        if p <= 0: continue
        oy = (1 - p) * 60
        def draw(x0=x0, n=n, big=big, desc=desc, col=col, oy=oy):
            card(c, (x0, 150 + oy, x0 + 380, 515 + oy), r=26)
            c.rr((x0, 150 + oy, x0 + 380, 230 + oy), 26, fill=col); c.rr((x0, 200 + oy, x0 + 380, 230 + oy), 0, fill=col)
            c.text((x0 + 28, 172 + oy), n, 26, WHITE, "Bold")
            c.text((x0 + 28, 258 + oy), big, 38, col, "Bold")
            c.wrap((x0 + 28, 322 + oy), desc, 21, 330, MUTED)
            chip(c, x0 + 28, 450 + oy, "Check eligibility early", fill=SUNL, ink=(138, 90, 0), sz=16)
        c.overlay_alpha(draw, p)
    if t >= ts[3] + 2.2:
        a = ease((t - ts[3] - 2.2) / 0.5)
        c.overlay_alpha(lambda: c.text((640, 532), "Some can be combined on a new build, but the State's share may be capped. Confirm with the scheme provider.", 16, MUTED, "Regular", "ma"), a)

def sc_costs(c, t, ts):
    bg_day(c)
    c.rr((40, 36, 640, 108), 20, fill=INK); stepbadge(c, 4, "The costs nobody advertises")
    rows = [("Stamp duty (1% up to €1m)", "≈ €4,000", 1), ("Legal fees (solicitor)", "≈ €3,000–4,000", 1), ("Valuation & survey", "≈ €600–900", 1),
            ("Mortgage protection + home insurance", "required by lenders", 2), ("Land Registry & other fees", "≈ €500–1,000", 2)]
    card(c, (110, 130, 1170, 500), r=26)
    for i, (a, b, k) in enumerate(rows):
        al = ease((t - ts[k] - (i % 3) * 0.5) / 0.5)
        if al <= 0: continue
        y = 144 + i * 70
        def row(i=i, a=a, b=b, y=y):
            c.ell((150, y + 8, 186, y + 44), fill=[SEA, SKY, STORM, CORAL, SUN][i]); c.text((168, y + 12), str(i + 1), 22, WHITE, "Bold", "ma")
            c.text((210, y + 10), a, 28, INK, "SemiBold"); c.text((1130, y + 10), b, 28, SEAD if i != 3 else CORAL, "Bold", "ra")
            c.rr((150, y + 62, 1130, y + 63), 1, fill=(230, 236, 233))
        c.overlay_alpha(row, al)
    if t >= ts[3]:
        a = ease((t - ts[3]) / 0.6)
        def tot():
            c.rr((250, 520, 1030, 584), 26, fill=SUN)
            c.text((640, 536), "Budget roughly €9,000–€12,000 on top of your deposit", 26, INK, "Bold", "ma")
        c.overlay_alpha(tot, a)
    c.text((1170, 504), "illustrative, on a €400,000 home", 14, MUTED, "Regular", "ra")

def sc_approval(c, t, ts):
    bg_day(c)
    c.rr((40, 36, 760, 108), 20, fill=INK); stepbadge(c, 5, "Approval in principle, then test the numbers")
    p1 = ease((t - ts[1]) / 0.6)
    def ticket():
        card(c, (60, 140, 560, 590), r=26)
        c.text((100, 166), "Mortgage approval in principle", 24, INK, "Bold")
        c.rr((100, 214, 520, 216), 1, fill=(225, 233, 230))
        for i, s in enumerate(["Sets your budget before you view", "Shows sellers you're serious", "Usually valid for 6 months", "Compare several lenders"]):
            c.ell((104, 252 + i * 56, 124, 272 + i * 56), fill=SEA); c.line([(109, 263 + i * 56), (113, 267 + i * 56), (120, 257 + i * 56)], 2.5, WHITE)
            c.text((140, 250 + i * 56), s, 22, INK)
        if t >= ts[1] + 1.0:
            s = ease((t - ts[1] - 1.0) / 0.3)
            c.rr((330, 500, 520, 556), 12, fill=None, outline=SEAD, w=4); c.text((425, 510), "APPROVED", 28, SEAD, "Bold", "ma")
    c.overlay_alpha(ticket, p1)
    p2 = ease((t - ts[2]) / 0.6)
    def calc():
        card(c, (610, 140, 1220, 590), r=26)
        c.text((650, 166), "Monthly repayment", 24, INK, "Bold")
        c.text((650, 214), "€360,000 · 30 years · 4%", 21, MUTED)
        c.text((650, 252), "€1,719", 72, SEAD, "Bold"); c.text((900, 286), "/ month", 24, MUTED)
        if t >= ts[3]:
            a = ease((t - ts[3]) / 0.5)
            def hi():
                c.rr((650, 390, 1180, 560), 20, fill=(255, 232, 224))
                c.text((680, 408), "If rates rise by 1%  (5%)", 21, (150, 40, 20), "SemiBold")
                c.text((680, 444), "€1,933", 54, CORAL, "Bold"); c.text((900, 466), "+ €214 / month", 26, (150, 40, 20), "Bold")
            c.overlay_alpha(hi, a)
    c.overlay_alpha(calc, p2)

def sc_protect(c, t, ts):
    bg_day(c)
    c.rr((40, 36, 560, 108), 20, fill=INK); stepbadge(c, 6, "Protect the plan")
    # shield
    p = ease((t - ts[1]) / 0.6)
    def shield():
        cx, cy = 330, 285
        c.poly([(cx - 130, cy - 150), (cx, cy - 190), (cx + 130, cy - 150), (cx + 130, cy + 20), (cx, cy + 190), (cx - 130, cy + 20)], SEA)
        c.poly([(cx - 105, cy - 135), (cx, cy - 168), (cx + 105, cy - 135), (cx + 105, cy + 14), (cx, cy + 160), (cx - 105, cy + 14)], SEAD)
        house(c, cx, cy - 20, 0.5, wall=SAND)
        c.text((cx, cy + 200), "Mortgage protection", 28, INK, "Bold", "ma")
        c.text((cx, cy + 234), "clears the loan if the worst happens", 20, MUTED, "Regular", "ma")
    c.overlay_alpha(shield, p)
    p2 = ease((t - ts[2]) / 0.6)
    def efund():
        card(c, (640, 150, 1210, 540), r=26)
        c.text((680, 176), "Emergency fund", 28, INK, "Bold")
        c.text((680, 216), "3–6 months of essentials", 22, MUTED)
        fill = ease((t - ts[2] - 0.4) / 2.0)
        for i in range(6):
            x = 680 + i * 84
            c.rr((x, 290, x + 70, 430), 14, fill=(228, 236, 233))
            lvl = max(0, min(1, fill * 6 - i))
            if lvl > 0: c.rr((x, 430 - 140 * lvl, x + 70, 430), 14, fill=SUN if i >= 3 else SEA)
            c.text((x + 35, 442), f"M{i + 1}", 17, MUTED, "SemiBold", "ma")
        c.text((680, 480), "One bad month stays a bad month.", 22, SEAD, "Bold")
    c.overlay_alpha(efund, p2)

def mini_ui(c, box, which, t):
    x0, y0, x1, y1 = box; w = x1 - x0
    c.rr((x0, y0, x1, y0 + 62), 0, fill=INK)
    c.text((x0 + 20, y0 + 20), "LifeGoals", 22, WHITE, "Bold")
    px, py = x0 + 18, y0 + 80
    if which == "discover":
        c.text((px, py), "Chapter 1 of 5", 14, MUTED, "SemiBold"); c.wrap((px, py + 22), "What matters most to you?", 26, w - 36, INK, "Bold")
        for i, (s, col) in enumerate([("Buy a home", SEA), ("Retire comfortably", SKY), ("Build a safety net", STORM), ("Travel more", CORAL)]):
            sel = (i == 0 and (t % 3) > 1.0)
            c.rr((px, py + 110 + i * 68, x1 - 18, py + 164 + i * 68), 16, fill=col if sel else WHITE, outline=col, w=2)
            c.text((px + 18, py + 124 + i * 68), s, 20, WHITE if sel else INK, "SemiBold")
    elif which == "map":
        c.text((px, py), "Your LifeMap", 26, INK, "Bold")
        c.line([(px + 20, py + 80), (px + 20, py + 440)], 4, (200, 215, 210))
        for i, (s, sub, col) in enumerate([("Now", "Renting", MUTED), ("Buy a home", "2028 · on track", SEA), ("Baby", "April", SKY), ("Mortgage free", "2056", STORM)]):
            yy = py + 80 + i * 110
            pr = ease((t - 0.3 * i) / 0.5)
            if pr > 0:
                c.ell((px + 8, yy, px + 32, yy + 24), fill=col)
                c.rr((px + 52, yy - 12, x1 - 18, yy + 52), 14, fill=WHITE); c.text((px + 68, yy - 4), s, 20, INK, "Bold"); c.text((px + 68, yy + 22), sub, 16, col, "SemiBold")
    elif which == "snap":
        c.text((px, py), "Snap a document", 26, INK, "Bold")
        c.rr((px + 30, py + 60, x1 - 48, py + 380), 14, fill=WHITE, outline=(200, 215, 210), w=2)
        for i in range(8): c.rr((px + 50, py + 85 + i * 34, x1 - 70 - (i % 3) * 30, py + 95 + i * 34), 3, fill=(215, 225, 222))
        ly = py + 70 + ((t * 0.9) % 1) * 300
        c.rr((px + 24, ly, x1 - 42, ly + 4), 2, fill=SEA)
        c.rr((px, py + 410, x1 - 18, py + 462), 16, fill=SEA); c.text(((px + x1 - 18) / 2, py + 424), "We read it. You check it.", 18, WHITE, "Bold", "ma")
    elif which == "tools":
        c.text((px, py), "Tools for you", 26, INK, "Bold")
        for i, (s, col) in enumerate([("Borrowing", SEA), ("Deposit", SKY), ("Repayment", STORM), ("Rate change", CORAL)]):
            xx = px + (i % 2) * ((w - 36) / 2 + 6); yy = py + 56 + (i // 2) * 130
            c.rr((xx, yy, xx + (w - 36) / 2 - 6, yy + 118), 18, fill=col); c.text((xx + 14, yy + 76), s, 18, WHITE, "Bold")
            c.ell((xx + 14, yy + 14, xx + 50, yy + 50), fill=(255, 255, 255, ) if False else mix(col, WHITE, 0.35))
        c.rr((px, py + 330, x1 - 18, py + 400), 16, fill=SUNL); c.text((px + 16, py + 340), "What if rates rise 1%?", 20, INK, "Bold"); c.text((px + 16, py + 368), "+ €214 a month", 17, (138, 90, 0), "SemiBold")
    elif which == "expert":
        c.text((px, py), "Your expert", 26, INK, "Bold")
        card(c, (px, py + 50, x1 - 18, py + 230), r=18)
        c.ell((px + 16, py + 70, px + 80, py + 134), fill=(240, 200, 170)); c.d.pieslice(c.sc((px + 14, py + 66, px + 82, py + 120)), 180, 360, fill=(120, 60, 40))
        c.text((px + 94, py + 74), "Niamh Byrne", 22, INK, "Bold"); c.text((px + 94, py + 104), "Mortgage expert", 16, MUTED)
        chip(c, px + 16, py + 156, "Verified", fill=(221, 242, 236), ink=SEAD, sz=15)
        c.rr((px, py + 250, x1 - 18, py + 340), 16, fill=INK)
        c.text((px + 16, py + 262), "LIVE · Thu 7pm", 15, SUN, "Bold"); c.wrap((px + 16, py + 288), "First-time buyers: your questions answered", 18, w - 70, WHITE, "SemiBold", 1.2)

def sc_solution(c, t, ts):
    bg_teal(c)
    c.rr((40, 36, 520, 108), 20, fill=SUN); c.text((70, 54), "LifeGoals · one place", 30, INK, "Bold")
    labels = [("Discover", "What matters to you"), ("LifeMap", "Buy a home on a timeline"), ("Snap it", "Payslip or statement"), ("Calculators", "Borrow · deposit · rate"), ("Expert + Live", "Verified mortgage help")]
    which = ["discover", "map", "snap", "tools", "expert"]
    cur = 0
    for k in range(5):
        if t >= ts[k + 1]: cur = k
    started = t >= ts[1]
    for i, (a, b) in enumerate(labels):
        on = started and i == cur and True
        y = 130 + i * 90
        al = ease((t - ts[0] - i * 0.25) / 0.5)
        def row(i=i, a=a, b=b, on=on, y=y):
            c.rr((60, y, 560, y + 78), 20, fill=WHITE if on else (22, 78, 86))
            c.ell((82, y + 17, 126, y + 61), fill=[SEA, SKY, SUN, CORAL, STORM][i]); c.text((104, y + 23), str(i + 1), 24, WHITE if i != 2 else INK, "Bold", "ma")
            c.text((146, y + 10), a, 26, INK if on else WHITE, "Bold"); c.text((146, y + 44), b, 18, MUTED if on else (198, 222, 218))
        c.overlay_alpha(row, al)
    box = phone(c, 930, 40, 330, 530)
    mini_ui(c, box, which[cur], t - ts[cur + 1] if started else 0)
    if not started:
        c.text((930, 330), "LifeGoals", 38, INK, "Bold", "ma")

def sc_end(c, t, ts):
    c.gradient((226, 242, 248), (255, 241, 209), diag=False)
    c.rr((0, 540, W, H), 0, fill=(120, 190, 140))
    house(c, 640, 330, 1.6, lit=True)
    person(c, 400, 400, 1.45, hair=(120, 60, 40), shirt=CORAL, long_hair=True, t=t)
    person(c, 880, 405, 1.45, hair=(40, 30, 28), shirt=SKY, t=t + 1)
    p = ease((t - ts[0] - 0.8) / 0.8)
    if p > 0:
        # key
        kx, ky = 640, 250 - 30 * (1 - p)
        c.ell((kx - 40, ky - 40, kx + 40, ky + 40), fill=SUN); c.ell((kx - 18, ky - 18, kx + 18, ky + 18), fill=(255, 241, 209))
    import random; rnd = random.Random(7)
    if t >= ts[0] + 1.2:
        for i in range(40):
            x = rnd.random() * W; sp = 60 + rnd.random() * 120; y = ((t - ts[0] - 1.2) * sp + rnd.random() * H) % H
            c.rr((x, y, x + 10, y + 16), 2, fill=[SUN, CORAL, SEA, SKY, STORM][i % 5])
    if t >= ts[2]:
        a = ease((t - ts[2]) / 0.6)
        def endcard():
            c.rr((200, 40, 1080, 170), 28, fill=INK)
            c.text((640, 62), "Your first home: deposit to keys", 44, WHITE, "Bold", "ma")
            c.text((640, 120), "Start your LifeMap on LifeGoals", 26, SUN, "SemiBold", "ma")
        c.overlay_alpha(endcard, a)

SCENE_FN = dict(hook=sc_hook, worries=sc_worries, borrow=sc_borrow, deposit=sc_deposit, schemes=sc_schemes, costs=sc_costs,
                approval=sc_approval, protect=sc_protect, solution=sc_solution, end=sc_end)

def fmt(s): return "%d:%02d" % (s // 60, s % 60)

def overlay_ui(c, t, total, cap, scene_id):
    # caption bar
    if cap:
        sz = 30
        lines = []; cur = ""
        for wd in cap.split():
            tt = (cur + " " + wd).strip()
            if c.tw(tt, sz, "SemiBold") > 1000 and cur: lines.append(cur); cur = wd
            else: cur = tt
        lines.append(cur)
        bh = len(lines) * 42 + 20; y0 = 662 - bh
        wmax = max(c.tw(l, sz, "SemiBold") for l in lines) + 56
        base = c.im.copy(); c.rr((640 - wmax / 2, y0, 640 + wmax / 2, y0 + bh), 16, fill=(8, 22, 26))
        c.im = Image.blend(base, c.im, 0.82); c.d = ImageDraw.Draw(c.im)
        for i, l in enumerate(lines): c.text((640, y0 + 12 + i * 42), l, sz, WHITE, "SemiBold", "ma")
    # player bar
    base = c.im.copy(); c.rr((0, 672, W, H), 0, fill=(8, 22, 26)); c.im = Image.blend(base, c.im, 0.75); c.d = ImageDraw.Draw(c.im)
    c.text((22, 689), fmt(t), 17, WHITE, "SemiBold")
    c.rr((88, 695, 1130, 701), 3, fill=(90, 110, 112)); c.rr((88, 695, 88 + 1042 * (t / total), 701), 3, fill=SUN)
    c.text((1150, 689), fmt(total), 17, WHITE, "SemiBold"); c.text((1210, 689), "CC", 17, WHITE, "Bold")

def build(timing):
    total = timing["total"]
    starts = [s["start"] for s in timing["scenes"]]
    def frame(n):
        t = n / FPS
        si = max(i for i, s in enumerate(starts) if s <= t)
        sc = timing["scenes"][si]
        c = Canvas()
        lt = t - sc["start"]; ts = [s[0] - sc["start"] for s in sc["sent"]]
        SCENE_FN[sc["id"]](c, lt, ts)
        cap = ""
        for a, b, cp in sc["sent"]:
            if a - 0.05 <= t <= b + 0.35: cap = cp
        overlay_ui(c, t, total, cap, sc["id"])
        # scene fade-in
        f = ease(lt / 0.4)
        out = c.im.resize((W, H), Image.LANCZOS)
        if f < 1: out = Image.blend(Image.new("RGB", (W, H), (8, 22, 26)), out, f)
        return out
    return frame, total

if __name__ == "__main__":
    timing = json.load(open("timing.json"))
    frame, total = build(timing)
    mode = sys.argv[1]
    if mode == "test":
        os.makedirs("test", exist_ok=True)
        for sc in timing["scenes"]:
            tt = sc["start"] + (sc["end"] - sc["start"]) * 0.9
            frame(int(tt * FPS)).save(f"test/{sc['id']}.png")
    else:
        part, nparts = int(sys.argv[2]), int(sys.argv[3])
        os.makedirs("frames", exist_ok=True)
        N = int(total * FPS) + 1
        for n in range(part, N, nparts):
            frame(n).save(f"frames/f{n:05d}.jpg", quality=92)
