# Design notes: audit and component extraction (UI/UX designer, round 1)

Sources I checked: `Lifecast User Jouney Prototype.html` (LC), `LifeGoal User Journey Mobile Prototype.html` (OLD), `reference/LifeGoals-2.0-Plan-Prototype-decoded.html` (P2), and screenshots 1 to 5.
I captured both prototypes in headless Chromium at 1280x900 and 390x844 (screens in `scratchpad/ux/`, `lc-*.png` and `p2-{d,m}-*.png`). Neither logged a JS error. The only console error is Google Fonts failing through the sandbox proxy, and that failure exposed a font-fallback bug (see 3.3).

> **OLD vs LC:** they are the same file except for copy on 6 lines ("Biggest lever" became "Biggest what-if", with small AI-answer wording changes). I treat them as one codebase. Line numbers below are for **LC**.
>
> **Default theme gotcha:** LC declares `let THEME='navy'` but its last line calls **`applyTheme('aubergine')`** (line 1435). The side panel also says "Theme · Aubergine & Rose Gold". So LC actually opens in *aubergine*, not navy. The tokens below are the values that resolve after `applyTheme('navy')`, read with `getComputedStyle`. The new build must hard-code them in `:root` and drop the theme switcher.

---

## 1. Design tokens (Lifecast "Teal & Navy", resolved)

### 1.1 Tokens (paste into `:root`)
```css
:root{
  /* core (navy theme, resolved) */
  --ink:#0B2545; --ink2:#13315C; --muted:#51627A; --line:#DCE4EC; --mist:#F3F7F9; --card:#FFFFFF;
  --sea:#0F9D8F; --sea-d:#0B7A70; --sea-l:#D9F2EE;          /* teal = primary accent */
  --sun:#F2B134; --sun-l:#FDF0D2; --acc-d:#7A5200;          /* gold = highlight; acc-d = text on gold tints */
  --sand:#F8F5EE;
  --sky:#4E9BD8; --sky-l:#E1EFFA; --storm:#5E548E; --storm-l:#E7E3F4; --coral:#E8674A;  /* not themed */
  --wx-sun:#F5B324; --wx-sun-l:#FFF1D1;
  /* gradients / hero */
  --plain1:#CDEBE7; --plain2:#EAF5F4;                         /* .sky.plain header band + light quiz bg */
  --q1:#0B2545; --q2:#10375E; --q3:#0F5A6B; --qsub:#C3D3E6;   /* dark quiz (unused in light mode) */
  --mark1:#6BE3D3; --mark2:#0F9D8F; --mark3:#0B2545;          /* logo orb, medal */
  --r:22px;
  /* NEW for results (LC has none). Text-safe on white, see section 5 */
  --ok:#2E9E6A;   --ok-t:#1A7F4B;   --ok-l:#E3F4EA;           /* green road / bars */
  --dip:#F2B134;  --dip-t:#8A5A00;  --dip-l:#FDF0D2;          /* amber = using savings (reuse --sun) */
  --gap:#D9534F;  --gap-t:#B42318;  --gap-l:#FBE7E6;          /* red = shortfall */
}
```
Fonts (same as LC line 2):
```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@500;700;800&family=Figtree:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```
`body{font-family:'Figtree',system-ui,'Segoe UI',sans-serif}` and `h1,h2,h3,.disp{font-family:'Bricolage Grotesque','Figtree',system-ui,sans-serif;letter-spacing:-.01em}`. **Always put a fallback in the stack** (bug 3.3).

### 1.2 Scale, radii, shadows, spacing
- **Type:** eyebrow 11.5px/800/.12em uppercase `--sea-d` · screen title `h2.t` 27px/1.1 · question h2 27px/1.12 · sub 15px/1.5 `--muted` · body 14 to 15px · small print `.disc` 12px · big number 36 to 44px Bricolage 800.
- **Radii:** card `--r` 22px · goal row 20px · option card 20px · emoji tile 14 to 15px · pill 13px/999px · button 27px (fully round) · sheet 28px top · phone 48px.
- **Shadows:** card `0 1px 0 rgba(14,47,51,.04),0 6px 18px rgba(14,47,51,.06)` · light-mode option `0 6px 18px rgba(20,30,50,.08)` + `1px solid var(--line)` · chip `0 4px 10px rgba(14,47,51,.12)` · FAB `0 8px 20px rgba(14,47,51,.35)`.
- **Spacing:** 18px screen gutter (`.scroll` padding `4px 18px 22px`), 10px grid gap, 14 to 16px card padding, 22px above section heads. Tap targets: 54px buttons, 46px chips, 74px option cards (138px in 2-column grid).

### 1.3 Components (verbatim from LC, lines 3 to 203; trimmed to what we need)
```css
*{box-sizing:border-box} html,body{margin:0;height:100%}
body{font-family:'Figtree',system-ui,'Segoe UI',sans-serif;color:var(--ink);background:#E4ECE8;display:flex;min-height:100vh}
button{font-family:inherit;color:inherit}
/* desktop side panel */
.side{width:300px;flex-shrink:0;background:#fff;border-right:1px solid var(--line);padding:22px 18px;overflow-y:auto}
.side h1{margin:0;font-size:24px;display:flex;align-items:center;gap:10px}
.side p{font-size:13px;color:var(--muted);line-height:1.5;margin:6px 0 12px}
.side h4{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin:16px 0 6px}
.side button{display:block;width:100%;text-align:left;border:0;background:none;padding:7px 10px;border-radius:10px;font-size:13px;cursor:pointer;min-height:34px}
.side button:hover{background:var(--mist)} .side button.on{background:var(--ink);color:#fff}
.side .big{background:var(--ink);color:#fff;text-align:center;font-weight:700;margin-bottom:6px}
/* phone frame */
.stage{flex-grow:1;display:flex;align-items:center;justify-content:center;padding:14px;overflow:hidden}
#wrap{width:390px;height:844px;flex-shrink:0;transform-origin:center}
.phone{width:390px;height:844px;border-radius:48px;overflow:hidden;position:relative;background:var(--mist);box-shadow:0 0 0 10px #0B1F22,0 30px 70px rgba(11,31,34,.35)}
@media (max-width:800px){body{display:block}.side{display:none}.stage{padding:0;height:100vh}.phone{border-radius:0;box-shadow:none}}
/* app shell */
.app{position:absolute;inset:0;display:flex;flex-direction:column}
.sky{flex-shrink:0;padding:46px 18px 14px;position:relative;overflow:hidden}
.sky.plain{background:linear-gradient(180deg,var(--plain1) 0%,var(--plain2) 70%,var(--mist) 100%)}
.scroll{flex-grow:1;overflow-y:auto;overflow-x:hidden;padding:4px 18px 22px}
.tabs{flex-shrink:0;height:84px;background:#fff;border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(5,1fr);align-items:start;padding-top:8px}
.tabs button{border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:11px;font-weight:700;color:#5C7477;cursor:pointer;min-height:50px}
.tabs button.on{color:var(--ink)}
.tabs .center{margin-top:-30px}
.tabs .center .fab{width:62px;height:62px;border-radius:31px;background:var(--ink);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(14,47,51,.35);border:4px solid #fff}
.brand{display:flex;align-items:center;gap:8px;font-family:'Bricolage Grotesque',system-ui,sans-serif;font-weight:800;font-size:20px}
.mark{width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 35%,var(--mark1),var(--mark2) 55%,var(--mark3));box-shadow:0 0 0 3px rgba(255,255,255,.7)}
/* type & blocks */
.eyebrow{font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--sea-d)}
h2.t{font-size:27px;line-height:1.1;margin:6px 0 6px}
.sub{font-size:15px;color:var(--muted);line-height:1.5;margin:0 0 16px}
.card{background:var(--card);border-radius:var(--r);padding:16px;box-shadow:0 1px 0 rgba(14,47,51,.04),0 6px 18px rgba(14,47,51,.06)}
.btn{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:54px;border-radius:27px;border:0;background:var(--ink);color:#fff;font-weight:800;font-size:16px;cursor:pointer}
.btn:hover{background:var(--ink2)}
.btn.sun{background:var(--sun);color:var(--ink)}
.btn.ghost{background:#fff;color:var(--ink);border:1.5px solid var(--line)}
.btn.sm{min-height:42px;font-size:14px;width:auto;padding:0 18px}
.pill{display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 10px;border-radius:13px;font-size:12px;font-weight:800}
.pill.mint{background:var(--sea-l);color:var(--sea-d)} .pill.grey{background:#EEF2F0;color:var(--muted)}
.seg{display:flex;gap:4px;background:#E6EEEA;border-radius:14px;padding:4px;margin-bottom:14px}
.seg button{flex:1;border:0;background:none;border-radius:11px;min-height:38px;font-weight:800;font-size:13px;cursor:pointer}
.seg button.on{background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.goal{display:flex;gap:12px;align-items:center;padding:14px;border-radius:20px;background:#fff;box-shadow:0 6px 18px rgba(14,47,51,.06);cursor:pointer;border:0;width:100%;text-align:left}
.goal .ic{width:48px;height:48px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.goal .bar{height:8px;border-radius:4px;background:#EAF0ED;overflow:hidden;margin-top:6px}.goal .bar i{display:block;height:100%;border-radius:4px}
/* question screens: LIGHT mode is the default look (.quiz.light) */
.quiz{position:absolute;inset:0;display:flex;flex-direction:column;background:linear-gradient(180deg,var(--plain1) 0%,var(--mist) 55%,var(--sand) 100%);color:var(--ink)}
.qtop{padding:50px 18px 6px;display:flex;align-items:center;gap:10px}
.chaps{flex:1;display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.chaps i{height:6px;border-radius:3px;background:rgba(0,0,0,.08);overflow:hidden;position:relative}
.chaps i b{position:absolute;inset:0;width:0;background:var(--sea);transition:width .3s}   /* LC uses --sun here */
.qx{width:40px;height:40px;border-radius:20px;border:0;background:rgba(0,0,0,.06);color:var(--ink);font-size:17px;cursor:pointer}
.qbody{flex-grow:1;overflow-y:auto;padding:12px 18px 18px}
.qeye{font-size:11.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--acc-d)}
.qbody h2{font-size:27px;line-height:1.12;margin:8px 0 6px}
.qsub{color:var(--muted);font-size:14.5px;margin:0 0 16px;line-height:1.45}
.opts{display:grid;gap:10px}.opts.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.opt{position:relative;border:1px solid var(--line);border-radius:20px;padding:14px;min-height:74px;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:10px;align-items:flex-start;background:#fff;color:var(--ink);box-shadow:0 6px 18px rgba(20,30,50,.08);transition:transform .15s}
.opt:hover{transform:translateY(-2px)} .opts.two .opt{min-height:138px}
.opt .em{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:25px}
.opt .tx{font-size:16px;font-weight:800;line-height:1.25}
.opt.sel{box-shadow:0 0 0 3px var(--sea),0 8px 20px rgba(20,30,50,.12)}
.opt.row1{flex-direction:row;align-items:center;min-height:64px}
.chip{border:1.5px solid var(--line);background:#fff;color:var(--ink);border-radius:22px;min-height:46px;padding:0 14px;font-weight:700;font-size:14.5px;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.chip.sel{background:var(--sea);color:#fff;border-color:var(--sea)} .chips{display:flex;flex-wrap:wrap;gap:8px}
.qfoot{padding:8px 18px 28px;display:flex;justify-content:space-between;align-items:center;gap:10px}
.qback{border:0;background:none;color:var(--muted);font-weight:700;font-size:14.5px;cursor:pointer;min-height:44px}
.wbtn{min-height:54px;border-radius:27px;border:0;background:var(--ink);color:#fff;font-weight:800;font-size:16px;padding:0 26px;cursor:pointer}
.wbtn[disabled]{opacity:.4;cursor:default}
.medal{width:112px;height:112px;border-radius:34px;display:flex;align-items:center;justify-content:center;font-size:58px;background:linear-gradient(135deg,var(--mark1),var(--mark2) 60%,var(--sea));box-shadow:0 14px 30px rgba(20,30,50,.15);margin:18px 0}
/* forms */
.field{display:grid;gap:6px;margin-bottom:14px}
.field label{display:flex;justify-content:space-between;font-weight:800;font-size:14px}
.field label output{color:var(--sea-d)}
input[type=range]{width:100%;accent-color:var(--sea);height:30px}
/* sheet + toast */
.sheet-bg{position:absolute;inset:0;background:rgba(11,31,34,.45);display:flex;align-items:flex-end;z-index:20}
.sheet{position:relative;background:#fff;color:var(--ink);width:100%;max-height:88%;overflow-y:auto;border-radius:28px 28px 0 0;padding:10px 18px 28px}
.grab{width:44px;height:5px;border-radius:3px;background:#D3DDD8;margin:4px auto 14px}
.sx{position:absolute;right:14px;top:14px;width:36px;height:36px;border-radius:18px;border:0;background:var(--mist);font-size:15px;cursor:pointer;color:var(--ink)}
.toast{position:absolute;left:16px;right:16px;bottom:98px;background:var(--ink);color:#fff;border-radius:16px;padding:12px 14px;font-size:14px;display:flex;gap:10px;align-items:center;z-index:30;animation:up .35s ease}
@keyframes up{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}
.disc{font-size:12px;color:var(--muted);line-height:1.5;margin-top:14px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
```
I rewrote `.quiz.light` so the light values sit directly in `.quiz` and `.chip`. That removes LC's attribute-selector hacks (`.quiz.light [style*="color:#fff"]{…!important}`, LC lines 186 to 192). Build light mode natively, with no dark base to override.

**Phone frame and desktop panel:** on desktop, a 300px white side panel sits on the left and the 390x844 phone is centred on `#E4ECE8`, scaled to fit with `fit()` (LC line 1400). At ≤800px the panel hides and the phone fills the viewport with no radius. Reuse `fit()` as is. In the panel, keep only the brand, a "Start again" button, a "Jump to screen" list and the disclaimer. Drop the theme and name switchers and the design-notes toggle.

---

## 2. What works for a layperson, and what's cluttered

### Lifecast / OLD (same UI)
**Works**
- **Discover tap cards** (DSC-Qxx): one question per screen, a 2x2 grid of large white cards with a pastel emoji tile, and one tap auto-advances after 280ms. Friendly and fast. This is the core pattern to keep.
- **Q8 "Pick a forecast"**: weather emoji plus a mini squiggle line is the clearest way I've seen to show risk without jargon.
- **Q9 scenario panel** (€10,000 → €8,500 with a bar) makes a loss concrete.
- **Light onboarding gradient**, teal selection ring and navy primary button: calm and trustworthy.
- **LifeMap chips** (PLN-01): goals from Discover are placed for the user, and a tap opens the edit sheet. The customer never starts from a blank page.
- **"Type it" sections** (PLN-02T*): one short section per screen, with sliders and a live "Left over each month" bar.
- **Bottom sheets** for edit and try-a-lever keep the user on the page.

**Cluttered or disliked**
- **12 Discover questions plus a chapter-intro screen before each of the 5 chapters**, so 17 screens before any value. Cut the per-chapter intro screens completely.
- **Behavioural "tags" on answer cards**: labels like "FOMO · Herd behaviour", "Panic selling", "Anchoring" and "The Money Monk" are shown to the customer on Q1 to Q9. They feel judgmental and are jargon. Hide them; they are adviser-side data.
- **Double meta row on each question**: "Chapter 1 · Your money mindset" plus a "Question 1 of 12" pill plus a "🔎 Money mindset" pill. That is three labels saying the same thing. Keep one small "3 of 7" and the progress bar.
- **Money-story result (DSC-R)**: four archetype bars, a "decision patterns" chip cloud, and "Risk appetite: High" after 12 taps. That's too much and too early. It also labels someone "High" risk from one question.
- **Reality check (RC-01)**: three sliders plus weather plus % per goal. It's fine as a teaser but repeats the plan reveal. Per the brief, keep uploads out of the start. PM decides.
- **Understand Me (ME-01)**: a money-story card, a "2 of 10 discoveries" ring, and a list of 10 assessments at 2 to 4 minutes each. This is the main complaint.
- **Weather metaphor stacked on %** everywhere (sky band colour, emoji, % and a coloured bar on the same goal card). The purple "storm" bar for a 59% goal (HOME-01) reads as "decorative", not "needs attention".
- **5-tab shell** (Home, Explore, My Plan, Me, Experts) plus calculators, videos, live sessions and AI Ask. This is out of scope for this journey and distracts from it.
- **My Plan segments** (LifeMap, Chapters, Goals, Money, History): five segments in a 390px segmented control is cramped.
- **LifeMap canvas is 900px wide** in a 390px phone, so it needs horizontal scrolling. On load all chips crowd the left edge (ages 34 to 36) and the rest of the line is empty (see `lc-PLN-01.png`).

### P2 (2.0 plan prototype)
**Works**
- **6-step stepper** (Welcome, Mindset, Goals, Timeline, Finances, Results) with ticks: clear sense of progress.
- **Timeline plus editor rows** underneath (screenshot 4): drag for "roughly when", type only if you want.
- **Results "Your goals" list** (screenshot 5): emoji, name, "· in 4 years", a bar and "100% On track". Instantly readable.
- **Journey road** (screenshot 1): the most emotional and memorable visual. Green, amber and red need no legend.
- **Life chapters** (screenshot 2): decades as weather cards with the goals listed. Tap to open year-by-year.
- **What-if banner**: "goals on track: 3 of 5 → 4 of 5". The before→after framing is excellent.
- **Plain-English captions** under each chart.

**Cluttered or broken**
- **Desktop-only layout.** At 390px the Journey SVG labels shrink to about 4px (unreadable), the Detail chart is unreadable, the stepper loses its labels, and the fixed footer covers content (`p2-m-*.png`).
- **Timeline chips overlap** (screenshot 4 and `p2-m-timeline.png`), and chips at year 0 hang off the left edge (see bug list).
- **Results page has too much**: a verdict banner, then "Your goals" and "What you can do" side by side, then Future at a glance, then What-if, then "Financial foundations" (6 rows), then the CTA. Brief order: Goals → summary → What if → Future → 3 actions. Drop Foundations and fold "What you can do" into one line of the summary.
- **Detail view** is labelled "the advisor-level view". Keep it as the third tab only.
- **What-if tile 2** ("€160bn on deposit…" + 4% vs 0.5%) is long, and it nudges towards investing, which sits close to advice. Brief asks only for ± monthly contribution.
- **DigiPro purple and magenta** (retirement flag `--dp-magenta`, immersive mindset stage) clash with the navy/teal theme. Replace them.

---

## 3. Reusable code inventory

### 3.1 Lifecast (LC; OLD has identical line numbers ±0)
| Component | Lines | Port? | Notes |
|---|---|---|---|
| Tokens + CSS | 3–203, 1405–1407 (navy) | **Yes** | See section 1. |
| Question data shape `DISC.Q` | 215 (one long line) | **Yes (shape)** | `{id, act, q, sub, type:'cards'|'ride'|'scenario'|'multi', grid, o:[{e,t,tag,s,w}]}`. Keep wording verbatim for the questions the PM picks. |
| Tap-card question renderer `ONB.discover` | 855–867 | **Yes, simplified** | Remove the chapter-intro branch, the tags and the meta row. Bug: `'Question ' + q.id + ' of 12'` uses the id, not the index, and "12" and "Chapter N of 5" are hard-coded, so they must be computed. The `'ride'` type uses a string-replace hack (`body.replace('class="opts"'…)`): set the class directly. |
| Auto-advance `ACT.dpick` + `dAdvance` | 1203, 1193–1194 | **Yes** | 280ms delay after a tap with a guard against double-advance. Good. |
| Multi-select chips `ACT.dtog` (max 3, toast) | 1204 | **Yes** | Goal picker (Q11 grid). |
| Progress bar `dBar()` | 854 | **Yes** | Chapter-segmented bar. For 6–7 questions, use one segment per question (`aQuizHTML` top bar, line 1059, already does this). |
| Understand Me quiz renderer `aQuizHTML` | 1058–1067 | **Partial** | `opt row1` single-column cards suit short options. The `ASSESS` data (390–741) is the 10-assessment list; mine it for wording but don't port the structure. |
| Result card patterns `V.aresult` | 1051–1057 | Maybe | Strengths / Watch out / Try this. Good copy pattern for section summaries. |
| Forecast model `forecast()` | 777–799 | **Only for rough %** | Simple monthly-surplus split. Not year-by-year, so it can't drive the road or chart. Use P2 `project()` for results. |
| `levers()` (what-if list) | 803–815 | No | Bug: "Put €100 more a month towards it" lowers `fin.fun`, which raises surplus for *all* goals, not the chosen one. |
| `chapters()` | 816–826 | No | P2's version is richer. |
| Helpers `eur`, `fvL`, `fvA`, `pmt` | 217–221 | **Yes** | |
| `goalCard`, `ring` | 835–837, 834 | Yes | `ring()` makes a nice % donut for section completion. |
| LifeMap HTML `lifemapHTML`, `ageX`, lanes | 909–919 | **Pattern only** | Lanes: greedy by age, min gap 9 years, **capped at 3** (`Math.min(l,3)`), so chips 5+ overlap. The gap is in *years*, not chip *pixels*, so long names still collide. Fixed 900px canvas, no fit-to-width. |
| LifeMap drag binding | 1282 (`ageFromClientX`), 1309–1318 inside `bind()` | **Yes, best drag code** | Pointer Events plus `setPointerCapture`, `touch-action:none`, 5px tap-vs-drag threshold (tap opens the edit sheet), handles `pointercancel`, snaps to whole years, and works under the CSS `scale()` because it uses `getBoundingClientRect`. Missing: keyboard support (`role=button` but no `tabindex` or arrow keys), lane re-layout during drag, and auto-scroll at the edges. |
| "Type it" 7 sections `TYPE_STEPS` + `ONB.accurate` type branch | 920–928, 950–953 | **Yes** | Re-map to the brief's 6 sections. `liveLeft()` (955) is a good live "left over" bar. |
| Snap/scan screens (IDP) | 931–944, CSS `.scan` 168–170 | **Yes** | Upload flow: choose doc tile → scan animation → "Here's what we found" with `% sure` badges, where "⚠ Check this" appears under 80%. |
| Sheet renderer `sheet()` | 1102–1117 | **Yes (shell)** | Wrapper at the end of `sheet()` (line 1116): `.sheet-bg` > `.sheet` > `.grab` + `.sx`. Uses `data-a` on divs, so the backdrop isn't keyboard accessible. |
| Toast `toast()` | 833; CSS 158–159 | **Yes** | Add `role="status" aria-live="polite"`. `bottom:98px` assumes the tab bar, so use 24px when there's no tab bar. |
| Render loop + event delegation | 1125–1146, 1319–1324 | **Yes** | Single `render()` rewrites `#phone`, keeps scroll position, then `bind()`. The `data-a` → `ACT[a]` pattern is simple and fast to extend. |
| Booking `V.book` | 1088–1089 | Style ref | Slot tiles plus Video/In person segment. It's nicer than P2's but has less logic. |
| `fit()` scaler | 1400–1401 | **Yes** | |

### 3.2 P2 (`reference/LifeGoals-2.0-Plan-Prototype-decoded.html`)
| Component | Lines | Port? | Notes |
|---|---|---|---|
| Stepper `renderSteps` + CSS `.steps/.step` | 645–654; CSS 32–44 | Optional | Nice, but the phone has no room for 6 labelled steps. Use a thin bar plus "Step 3 of 6". |
| Goal catalogue `GOAL_TYPES` | 592–607 | **Yes (data)** | Default amount, year, recurring, duration. Merge with LC `GOALCAT` (749–756). |
| Timeline `renderTimeline` / drag `startDrag/onDrag/endDrag` | 844–909; CSS 175–185 | **No, use LC drag** | Bugs: (a) lane collision test is `pct-lanes[lane]<12` (12% of track ≈ 3.6 yrs, far narrower than a ~160px chip), so chips overlap; (b) `if(lane>2)lane=lane%3` wraps lane 3 back onto lane 0, which means guaranteed overlap; (c) `translateX(-50%)` at 0% or 100% pushes chips off the board; (d) no `pointercancel`/`lostpointercapture`, so a chip stays `.dragging` on iOS cancel; (e) axis is "years from now", while LC uses age. Pick **age plus calendar year**. |
| Editor rows `renderEditors/editGoal` | 910–931 | **Yes (pattern)** | Year and amount inputs under the timeline. On mobile the grid collapses badly (the year input shrinks to about 30px, `p2-m-timeline.png`). |
| Finances form `FIN_FIELDS`, `showFinForm`, `readFin` | 609–640, 970–1010 | **Yes (fields)** | Already grouped as About you / Income & spending / What you own / What you owe / Protection. Add Pension as its own section. Confidence badges (`conf`) from IDP. |
| IDP scan `startScan`, `SCAN_LOG` | 947–969 | Yes | Log lines are good copy. |
| **Cashflow engine `project(fin, goals)`** | 1012–1095 | **Yes, the results model** | Year-by-year rows `{age, inflow, needs, shortfall, usedSavings, savings, retired, retireMarkers}` + `goalFund` → %. Assumptions `ASSUME` (642). Bugs and quirks: tax is 28% of *all* income while anyone works (`anyWorking?income*0.28*(…?1:0)`, and the inner test is always 1); the retirement goal's `year` (default fixed 25) is independent of `fin.retireAge`, so the flag and the milestone can disagree (visible in `p2-d-journey.png`, where both collide at 65); `retireNeed` only counts the target *above* basic spending; the mortgage payment isn't inflated. Fine for a prototype, but link the retire goal year to `retireAge - age`. |
| `extraMonthlyNeeded` | 1097–1108 | Yes | Powers the "about €X a month clears your gaps" tip. |
| **Goals % list** (`#goalStatus` in `renderResults`) | 1147–1156; CSS 235–243 | **Yes** | Thresholds ≥90 green "On track", ≥55 amber "Partly funded", else red "Needs a plan". |
| Verdict banner | 1129–1146 | Yes (as summary) | Good 4-way copy. Tone the full-colour gradient down to a tinted card. |
| **Journey road `renderJourney`** | 1220–1251 | **Yes, fix labels** | Sine-wave `Y(i)=178+36*sin(i/5.2)-i*.35`; the road is `<line>` segments coloured by `rowCol()` (1199). Bugs: milestones alternate above and below only by index (`k%2`), so neighbouring goals and the retirement flag labels collide, and below-labels overlap the age ticks; labels are truncated at 16 chars; fixed 940x300 viewBox is unreadable at 390px. |
| **Life chapters `renderChapters` + `toggleChap`** | 1252–1298; CSS 249–266 | **Yes** | Last chapter shows "age 90–90"; merge 90 into the 80s. |
| **Detail chart `renderChart`** | 1337–1366 (plus legend in `setFutureView` 1200–1219; CSS 277–279) | **Yes, mobile variant** | Bars = needs, dashed line = income, ▼ retire marker. At 390px, 51 bars at about 6px each are still OK, but the text is 10px inside a scaled SVG. Render at viewBox 360 wide on mobile. |
| **Future tabs `setFutureView`** + `.view-tabs/.vt` | 1200–1219; CSS 245–248 | **Yes** | |
| **What-if `wiLabels/applyWhatIf/resetWhatIf/wiBanner`** | 1301–1336; CSS 267–276 | **Yes (tile 1 only)** | Models extra saving as `expenses - extra`. For "subtract", allow negative (`expenses + x`). |
| **Booking modal `openBooking/pickSlot/confirmBooking`** | 1395–1418; HTML 535–553; CSS 302–316 | **Yes, restyle as sheet** | Uses `alert()` if no slot, has no Esc or focus handling, and the dates are hard-coded for July. |
| Help drawer | 1420–1421; CSS 318–328 | Optional | FAQ copy is good ("Is this financial advice?"). |

### 3.3 Bugs to avoid in the new build (summary)
1. LC opens in **aubergine** because `applyTheme('aubergine')` is the last line. Hard-code navy.
2. **Missing font fallbacks**: `.brand`, `.ring b`, `.hero .big` and inline `font-family:Bricolage Grotesque` have no fallback. When the font fails (this sandbox, or a slow network) the headings render in **Times** (`lc-HOME-01.png`, where "81%" and "Lifecast" appear in serif). Always use `'Bricolage Grotesque',system-ui,sans-serif`.
3. The lane algorithms in both files overlap chips (see 4.4 for a fix).
4. P2 chips at year 0 or 30 are clipped at the edges; LC's 900px canvas needs scrolling.
5. The "Question X of 12" counter is hard-coded to the id.
6. The P2 retirement goal's year is not linked to retirement age.
7. The Journey label collision algorithm is index-based.
8. There are no `:focus-visible` styles anywhere. P2 has no reduced-motion rule.

---

## 4. Proposed visual approach (all in LC navy tokens, phone-first 390px)

### 4.0 Shared shell
- Light `.quiz` layout for question flows (Discover, Understand Me). Use the `.app` layout with a `.sky.plain` header band for everything else.
- **No 5-tab bar during the build journey.** After the plan exists, use 3 tabs: **My Plan** (centre FAB), **Me**, **Experts**. Home and Explore are out of scope (PM to confirm).
- Top of each plan step: eyebrow "Step 2 of 5 · Your goals", then the `h2.t` title, then one-line `.sub`. Progress is a 5px segmented bar (LC `aQuizHTML` style), not the P2 stepper.
- One primary `.btn` pinned at the bottom (`position:sticky; bottom:0` with a white fade above it). Use a `.btn.ghost` secondary only when needed.

### 4.1 Discover (6–7 tap cards, one per screen, auto-advance)
- Screen: close ✕ top-right, **one segment per question** in the progress bar, a small "3 of 7" counter (`.qeye`), the question as h2 27px in **verbatim wording**, an optional `.qsub`, then `.opts.two` 2x2 cards (emoji tile + text). There are **no tags and no chapter intros**. A tap shows a 3px teal ring, then advances after 280ms. Back is bottom-left and Skip bottom-right, both as small text.
- Keep the special renderers: `ride` (squiggle line) and `scenario` (€ before/after panel). Use `.opts` single-column `row1` for answers longer than about 28 characters.
- One intro screen before Q1: medal emoji + "7 quick taps. About 2 minutes." + "No documents, no sign-up." At the end, a single **"Your snapshot"** card: one line about how they think about money (plain words, no archetype bars) plus the goals they picked, then two CTAs: "Build my plan" (primary) and "Go deeper in Understand Me" (ghost). No uploads here.

### 4.2 Understand Me hub (3 sections)
- Header: "Understand Me" + a `ring()` showing, for example, **"9 of 14 answered"**. Discover answers count straight away, so the first-time user starts at about 50% rather than 0.
- 3 section cards (`.goal` rows, 48px emoji tile), each with a mini progress label and a chevron. Suggested names (PM to confirm):
  1. 🧭 **About you and your goals**: what matters, time horizon.
  2. 🌦️ **Your risk comfort**: attitude to risk, capacity for loss, knowledge and experience.
  3. 🛟 **Your safety net and capacity**: emergency fund and resilience, monthly investment capacity, sustainability preference.
- Inside a section, the questions are listed **on one scrollable page**, each as a compact card:
  - **Pre-filled:** a small `.pill.mint` "✓ From your Discover answers · tap to change", with the chosen answer shown as a selected `.opt.row1`. Tapping opens the full options inline (accordion). There's no re-asking and no separate screen.
  - **New:** the question in bold 16px with `row1` options, which are short (≤4 words). Merged questions use a two-part card, for example "How long, and how much could you lose?", with two small chip rows.
- The section ends with a "Done ✓" tick on the hub card and a toast "Saved. Your plan now uses this."
- Footer `.disc`: "This helps us personalise your plan. It is not a formal suitability assessment."

### 4.3 Goal picker
- `.chips` multi-select grid (LC Q11 style) of about 12 goals, with emoji + short label at 46px height. Discover picks are **pre-selected**. There's no maximum here (Discover capped at 3). A sticky footer reads "4 goals · Next: place them on your timeline".
- Retirement is always included and pre-selected as "🌅 Retire comfortably", with the note "Everyone gets this one".

### 4.4 Timeline (centre of My Plan)
- **Fit the whole life on screen, with no horizontal scroll.** Track width = container width (≈354px). The axis runs from today's age to 90, with ticks every 10 years labelled `age 40` and `2036` below in 11px. A navy dot marks "You, today" and a flag marks retirement.
- **Chips:** `.gchip` (36px tall, white, 2px `--ink` border, emoji + short name + year in `--sea-d`). On mobile, show **emoji + year** only on the track and the name in the editor list below. That keeps chips about 64px wide so lanes stay shallow. Tapping a chip shows a tooltip or highlights its editor row.
- **Lanes without overlap:** measure real widths after render, then place chips greedily into the lowest lane where `left > laneRightEdge + 6px`. Keep adding lanes as needed (board height grows at 42px per lane), with no wrap or cap. Clamp chip centres so chips stay inside the board: `x = clamp(w/2, x, trackW - w/2)`. Re-run lane layout **live during the drag** (on rAF) so neighbours move aside smoothly.
- **Drag:** port LC's pointer code (Pointer Events + `setPointerCapture` + `touch-action:none` on chips only, 5px tap threshold, `pointercancel` + `lostpointercapture` cleanup). Snap to the nearest whole year. While dragging, show a floating label above the chip ("age 38 · 2032") and a haptic-style scale(1.06) with a gold border (`.gchip.drag{border-color:var(--sun)}`). Map positions with `getBoundingClientRect()` so the desktop `scale()` still works. **Keyboard:** chips get `tabindex=0`, ←/→ = ±1 year, Shift+←/→ = ±5, Enter opens the editor.
- **Under the board:** "↔ Drag a goal to change when it happens." Then the editor list (P2 pattern, mobile-safe). Each row is a `.card` with emoji, name and a one-line cost type, then **two full-width fields stacked**: "When" as a stepper `– 2032 (age 38) +` and "Amount (€)" as a numeric input with `inputmode="numeric"`. The rows are collapsed by default, and a tap on "Edit amount" expands them. Changing a year re-lays the chips, and dragging updates the row live.
- The retirement chip is locked to `fin.retireAge`, so dragging it updates the retirement age.

### 4.5 Your finances (6 section cards)
- A list of 6 `.goal`-style cards: 🙋 About you · 💶 Income and expenses · 🏠 Assets · 💳 Liabilities · 🛡️ Protection · 🌅 Pension. Each shows its status on the right: an empty circle, then "✓" in a `--sea` filled circle once complete, plus a one-line summary like LC `finSummary` ("€3,400 in · €2,600 out").
- Opening a card shows a **`.seg` toggle at the top: "📄 Upload" | "⌨️ Type it in"**, remembered per section.
  - **Upload:** 2 to 4 document tiles relevant to that section (for example Pension → "Pension statement"). Then the LC scan animation, then "Here's what we found" with `% sure` badges ("⚠ Check this" under 80%), then "Looks right".
  - **Type it in:** 2 to 5 fields with **number inputs, plus sliders only for quick estimates**. Show live "Left over each month" for Income and expenses (`liveLeft`).
- **About you** is pre-filled from Discover or Reality check (age), with name and retirement age added. Values carried over show the "From your answers" pill.
- Header ring "4 of 6 done". The primary CTA "See my results" is enabled once About you and Income are done; the others show "Estimates are fine" defaults.

### 4.6 Results (single scroll, in this order)
1. **"Your goals"** card (screenshot 5): `h3` "Your goals" + `.sub` "How much of each goal your future income and savings can cover." Rows show a 28px emoji, **name** · "in 4 years", an 8px bar and a right-aligned **% + word**. Status colours: `--ok` ≥90 "On track", `--dip` ≥55 "Partly covered", `--gap` below 55 "Needs a plan". Use `-t` variants for the % text (see section 5). Sort by year.
2. **Summary**: a tinted card (not a full-colour banner). Emoji + one-sentence verdict (P2 copy) + one "biggest help" line (`extraMonthlyNeeded`): "Saving about €300 more a month would cover every goal." End with `.disc` "Illustrative only. Guidance, not advice."
3. **What if**: one card with a large `–  €200 a month  +` stepper (±€50 steps, range −€500…+€2,000) plus a slider mirror. Show a live before→after strip: "Goals on track 3 → 4 of 5", "Gap years 5 → 1". Include Reset. It re-renders cards 1 and 4 live.
4. **"Your future, at a glance"** card with a `.seg` 3-tab control: 🛤️ Journey | 📖 Life chapters | 📊 Detail.
   - **Journey:** restyle P2 road. Base stroke `--line`, then segments `--ok` / `--dip` / `--gap`. The today dot is `--ink` and the retirement flag uses `--sun` fill on an `--ink` pole (no magenta). The end is 🌅. Milestone rings: white fill, 3px ring in the status colour, emoji inside. **Mobile layout:** viewBox `360x260`, ticks only at 40/60/80 or every 20 years, and labels are **emoji rings only** on the road, with a legend list below ("👶 New baby · age 42 · 100%"). This removes label collisions. On desktop (≥600px), show text labels and avoid collisions by assigning above/below by x-distance to the previous label (flip when within 70px), not by index.
   - **Life chapters:** P2 cards in a 2-column grid on mobile (`minmax(150px,1fr)`), radius 20px, tints `--ok-l` / `--dip-l` / `--gap-l` with a 1.5px border in the base colour at 40% alpha. Titles in Bricolage 16px. Merge "90–90" into the 80s. Tap expands the year list (keep).
   - **Detail:** P2 bar chart with `--ok` / `--dip` / `--gap` bars, `--ink` dashed income line, and a ▼ retire marker in `--ink`. Mobile viewBox is 360 wide with ticks every 10 years. The legend is 2x2 chips. Keep the "In plain English" caption.
5. **Three end actions**, as stacked full-width buttons: **⬇ Download my plan** (`.btn`, opens a sheet with 3 checkboxes: Cashflow, Detailed plan with explanations, Life-chart report), **📅 Book my adviser meeting** (`.btn.sun`, opens the booking sheet: LC `V.book` slot tiles + Video/In person `.seg` + P2 confirm/booked state, with no `alert()`; a disabled Confirm button replaces it), and **✏️ Adjust my goals** (`.btn.ghost`, goes to the timeline).

---

## 5. Accessibility notes
- **Amber on white fails for text.** `--sun #F2B134` on white is **1.89:1**, and P2 amber `#e8a13c` is 2.19:1. Use amber only for fills and road strokes. For amber *text* (the % or "Partly covered"), use `--dip-t #8A5A00` (5.9:1) or `--acc-d #7A5200` (6.9:1). Navy on amber is 8.1:1, so `.btn.sun` is fine.
- **Green and red text:** P2 green `#3aa96c` is 2.97:1, so it fails. Use `--ok-t #1A7F4B` (5.0:1) for text. Red text `--gap-t #B42318` is 6.6:1.
- **Teal:** `--sea #0F9D8F` on white is 3.37:1, which is OK for large text and UI such as rings and borders but **not for small text**. For links and eyebrows use `--sea-d #0B7A70` (5.2:1). White on `--sea` is 3.37:1, so filled `.chip.sel` text must be ≥14px bold (it is 14.5/700, which is borderline). I'd use `--sea-d` as the selected-chip fill (5.2:1).
- **Other text:** `--muted #51627A` is 6.2:1, which is good. P2 tick grey `#93a5b5` is 2.5:1, so replace it with `--muted`.
- **Never use colour alone:** keep the word ("On track" / "Partly covered" / "Needs a plan") next to every %, and keep weather emoji on the chapter cards. The Journey needs an `aria-label` summary plus the milestone list below it (4.6).
- **Focus:** add `:focus-visible{outline:3px solid var(--sun);outline-offset:2px;border-radius:inherit}` globally, plus `.opt:focus-visible{box-shadow:0 0 0 3px var(--ink)}`. All tappables must be `<button>` (LC sheets use `div[data-a]`). Sheets and modals need `role="dialog" aria-modal="true"`, focus moved to the title on open, Esc to close, and focus returned to the trigger. Timeline chips need `tabindex=0`, arrow keys and `aria-valuetext="New baby, age 42, 2036"` (`role="slider"`).
- **Toasts:** `role="status" aria-live="polite"`. Auto-advancing questions should announce "Question 4 of 7" with an `aria-live` region, and should **not** auto-advance when the answer was chosen with the keyboard (Enter), so focus isn't lost. Or keep auto-advance but move focus to the new h2.
- **Reduced motion:** keep LC's `@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}`. With reduced motion on, also skip the 280ms auto-advance animation (advance on the next frame) and the scan-line animation (show a static progress bar instead).
- **Tap targets:** at least 44px everywhere (chips are 46, buttons 54, `.qback` 44). The P2 `.vt` tabs are 32px and the slots about 40px, so enlarge both.
- **Zoom:** the desktop phone frame uses `transform:scale()`. On real mobile (≤800px) it isn't scaled, so text zoom works. Never set `user-scalable=no`.
