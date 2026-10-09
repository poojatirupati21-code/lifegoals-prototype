# LifeMap plan report: page-by-page spec (journey-spec §28)

Version 1.0.0 (schema `docs/report-data.schema.json`, canonical example `tools/report/mock-v5.json`).
Reference: `reference/report/LifeMap-Plan-Report-v5.pdf` (11 A4 pages, 794 x 1123 px at 96 dpi).

## 0. Ownership and contract

| Who | Owns |
|---|---|
| Financial planner | `reportData()` in the prototype engine. Returns one object that validates against the schema. All money, percentages, ages, years, scenario results, ordering and wording that depends on numbers. |
| UI/UX (this doc) | `tools/report/report-renderer.js`: `reportPages(data)` returns `{css, pages[]}`; pure, no engine access, no calculation. Layout, colours, icons, charts (SVG), pagination, photos, fonts. |

Rules the renderer follows:
1. The renderer never computes money, percentages, ages or sentences. It may compute geometry (x/y, widths) from raw numbers in the data, and format the raw numbers `appendix.rows[*]`, chart series and `amount` fields as `€12,345`.
2. Every text field is final display text. Empty string or missing optional key = element hidden (never the word "undefined" or an empty chip).
3. Page order is fixed: 1 Cover, 2 Your plan on a page, 3 Your money today, 4 Your roadmap, 5 Your goals in detail, 6 Cashflow, 7 What could change the answer, 8 Foundations and you, 9 Share with an expert, 10 What your plan assumes, 11 Appendix. Pages 5 and 11 can repeat (see 12). "Page n / N" in the footer counts the real total.
4. Every page: header `LifeMap` logo left, `meta.headerRight` right; footer `footer.line` left, `n / N` right ("Guidance, not advice" on every page). The cover shows `footer.coverLine` instead.
5. Fonts: Bricolage Grotesque ExtraBold for headings and big numbers, Figtree for everything else (the app fonts; v5 was printed with the same pair).
6. Tones: `good` = teal (#0B7A70 text, #0F9D8F fills), `gold` = #F2B134 (dark text #8A5A00), `coral`/`alert` = #E8674A (text #B4412B), `blue` = #4A90D9, `navy` = #0B2545, `grey` = #8A97A6. Band names from the engine: `good` (>=95%), `gold` (70-94%), `alert` (<70%) -> coral. All text on tint backgrounds must reach 4.5:1 (tested).
7. Photos come from `media/*.jpg` by basename in the data (`photo` enum). The renderer inlines them as `<img src>` with a relative path in the dialog and as data URIs when building the standalone HTML file. Every photo has `alt` text and rounded corners (14 px).

## 1. Page-by-page

Source column: **existing** = function already in the prototype engine (`project()`, `finNums()`, `findings()`, `foundations()`, `personality()`, `riskRead()`, `checkItems()`, `band()`, `toolsForYou()`, `nextStep()`); **NEW** = calculation the planner adds inside `reportData()`.

### Page 1. Cover
Dark navy full page. Top three-colour bar (teal 3 : gold 1 : coral 1). Magnifier photo is part of the cover artwork (rounded cut, top-right), not a data image. Cover road graphic near the bottom is the shared `road` chart (see 2.1).

| Element | Field | Source | Rules |
|---|---|---|---|
| Eyebrow `PREPARED FOR POOJA · 8 OCT 2026` | `cover.eyebrow` | existing (name, date) | name omitted if blank: `PREPARED FOR YOU` |
| Title `Pooja’s road ahead` | `cover.title` | existing | no name: `Your road ahead` |
| Lead sentence | `cover.lead` | static copy | |
| Badge `YOUR PERSONAL PLAN` | `cover.badge` | static | |
| 3 tiles (icon, big, small) | `cover.tiles[3]` | existing: goals on track = count of goals with band good; run-out age = `findings()` | tile 1 `n of N goals on track today`; tile 2 `Age 52 / when savings run out`. **No shortfall**: tile 2 becomes `Covered / to age 80` with icon `sun`, tone good. **Already retired**: tile 2 still run-out age or `Covered`. Tile 3 always `Next step / share your plan with an expert`. |
| Road | `road.*` | NEW (segments, milestones) | see 2.1 |
| Cover line | `footer.coverLine` | static + version | |

### Page 2. Your plan on a page
| Element | Field | Source | Rules |
|---|---|---|---|
| Headline number and label | `plan.big`, `plan.bigLabel`, `plan.bigTone` | existing | `1 of 2` / `goals on track`. All covered: `2 of 2`, tone good, wording `goals on track`. |
| Eyebrow, title, lead | `plan.eyebrow/title/lead` | existing/static | positive wording when no shortfall: title `Your plan is on track`, lead `Your income and savings cover everything you told us about.` |
| Goal cards (name, icon, meta, big %, band chip, sentence, progress bar) | `plan.goals[]` (name, icon, kind, pct, band, bandText, meta, sentence) | existing `pct` per goal, `band()` | bandText `On track` / `Nearly there` / `Needs attention`. 1 goal: one wide card. 2 to 4 goals: stacked cards. 5 or more: compact rows (one line each, 9 per page, overflow goes to page 5 only and p2 shows "and 3 more, see page 5"). |
| Navy band (gap summary) | `plan.band.cells[]` | NEW: run-out age, years with gap, gap today's money and future euros | `kind: "gap"`. **No shortfall**: `kind: "none"`; the renderer shows a teal band with the cells given (planner gives e.g. `Age 80 / savings last`, `0 years / with a gap`, `€0 / short`). **Already retired**: same, years counted from today. |
| What could close the gap (3 columns, each coloured rule, `+24 points`, title, text) | `plan.close.items[3]` | NEW: top three single-change rows of the scenario table by points (§28) | **No shortfall**: block title becomes `What keeps you on track` (planner sets `close.title`) and items are protections or `[]` (block hidden). |
| Next banner and button | `plan.next` | static + `nextStep()` | button text `Meet an expert`, links to page 9 |

### Page 3. Your money today
| Element | Field | Source | Rules |
|---|---|---|---|
| Big `€812` and `left each month` | `money.big/bigLabel/bigTone` | existing `finNums()` (take-home minus living minus goal saving) | negative: `€120 short each month`, tone coral |
| Tiles Living costs (navy, wide), Goals (teal), Left over (white) | `money.tiles[3]` (label, value, amount, tone) | existing | amounts also drive tile widths proportionally (min 22%) |
| Per-100 sentence + `example` chip | `money.sentence`, `money.exampleChip`, `money.takeHome` | existing | |
| YOU OWN rows | `money.own.rows[]` (`value` or `status:"missing"`) | existing | missing = dashed grey `Missing` chip. Home row `Rent` or `Own, €x` |
| YOU OWE rows | `money.owe.rows[]` | existing | **No mortgage**: mortgage row omitted by planner (row not present); if no debts at all the block shows one row `No debts told to us`. **Partner**: rows are household totals, label says `(together)`. |
| Net worth | `money.netWorth` (`value` or `status`) | existing | unknown shows `not yet known` in grey |
| Money-plant card | `money.complete` (have, total, sub, items[], photo `money-plant`) | existing `checkItems()` | progress bar = have/total; items sorted High, Medium, Low, max 4 |

### Page 4. Your roadmap
| Element | Field | Source | Rules |
|---|---|---|---|
| Header big | `roadmap.big/bigLabel/bigTone` | existing | |
| One row per decade from current age to plan end | `roadmap.decades[]` (label, range, icon, tone, title, chip, text, goalChips[], spark) | NEW: per-decade summary from `project()` rows | 1 to 9 rows. Plan to 105 at age 27 = 8 rows (fits at 74 px each). Label `20s`, `30s`, ... ; first and last decade are partial (range says so). |
| Weather icon | `icon` | `sun` all years covered, `partly` income covers but savings falling/goal due, `storm` years with gap | |
| Rail and chip | `tone`, `chip` | `Comfortable` / `Watch this` / `Gap` | rail is continuous vertical line coloured per row |
| Goal chips | `goalChips[]` (age, text, tone) | existing goals in the decade | max 3, rest `+n more` |
| Sparkline | `spark.values[]`, `spark.gapYears[]` | NEW: liquid savings at each age in decade | **normalised against the global maximum of all decades** so rows are comparable; gap years drawn in coral; no values (all zero) = flat grey line |

### Page 5. Your goals in detail (repeats)
One card per goal, 2 cards per page (v5 shows 2). 1 goal = 1 card on 1 page. 15 goals = 8 pages (pages are numbered in sequence; later pages keep the same header). The last goals page carries the "How to read this page" box (`goalsDetail.howToRead`).

| Element | Field | Source | Rules |
|---|---|---|---|
| Left rail, name, icon, meta, big %, band chip, sentence | `goalsDetail.goals[]` | existing | rail colour = band |
| Photo | `goals[].photo` | static map | retirement goal: `retired-reading`; buying a home: `house-for-sale`; other goals: no photo (card stays compact) |
| Bars `retire` | `bars.type="retire"`: costLabel/Value/Pct, coverLabel/Value/Pct, note | NEW (today's-money and future-euro costs and cover) | bar widths from `*Pct`, min 4% so a 5% bar is visible |
| Bars `saving` | `bars.type="saving"`: needLabel/Value/Pct, putLabel/Value/Pct | existing | |
| Retirement-years strip | `years.cells[]` (age, state: pension, savings, gap, none), title, summary, left/rightLabel | existing `project()` rows from retirement to plan end | one cell per year; 56 cells at plan 105 shrink (cells flex). Colours: pension teal, savings gold, gap coral, none grey. Retirement goal only. |
| How to read box | `goalsDetail.howToRead` | static + engine numbers | |

### Page 6. Cashflow
| Element | Field | Source | Rules |
|---|---|---|---|
| Header | `cashflow.big/bigLabel/bigTone/title` | existing | |
| Savings over time (line + area, y axis, zones, peak and run-out markers) | `savingsChart` (series[], yMax, yTicks[], peak, runOut, zones[], caption) | NEW: liquid savings by age from `project()` | `peak` null = no peak marker. `runOut` null = no run-out line and no WORKING/GAP split (**no shortfall** wording in caption: `Your savings last to age 80.`). |
| Who pays each year (stacked bars) | `paidChart` (bars[]: fromIncome, fromSavings, shortfall; legend; zones; stopMarker; lastLabel; caption) | NEW | shortfall hatched coral; one bar per year, bar width flexes (54 bars = 11 px, 78 bars = 7.6 px); x labels every 5th year |

### Page 7. What could change the answer
| Element | Field | Source | Rules |
|---|---|---|---|
| From to to percentages | `scenarios.fromPct/toPct/fromTone/toTone` | NEW | `5% -> 94%` style badge |
| Table: group, rows (title, sub, pct, gapStartsAge, emphasis) | `scenarios.groups[]` | NEW: each row re-runs the plan with one change (retire at 60 / 65; save N more, about 18% of take-home; start pension at max tax relief for age band; count full State Pension; pay N more into pension; combined paths) | Rows with pct equal to baseline are removed by the planner. Bars: width = pct; colour by band; right column shows `gapStartsAge` as `Gap from 56` or `No gap` (positive). `emphasis` true = bold row (combined best). **Already retired**: retire-age rows omitted. **No pension scheme**: pension rows omitted. At least one row must remain; otherwise the page shows the explore box only. |
| `A path to explore` box | `scenarios.explore` | NEW | |
| Footnote | `scenarios.footnote` | static | |

### Page 8. Foundations and you
| Element | Field | Source | Rules |
|---|---|---|---|
| Pyramid (5 levels) | `foundations.levels[]` (level, icon, title, status, tone) | existing `foundations()` | bottom level 1 widest; tone shows status |
| Protection table, photo `car-and-calculator`, next best step | `foundations.protection` | existing | `good` true = teal tick, false = coral cross, null = grey dash |
| Personality card: name, icon, strap, 4 quadrants | `foundations.personality` | existing `personality()` | |
| Risk scale (5 segments, marker) | `riskScale.labels`, `activeIndex` | existing `riskRead()` | `activeIndex` null = no marker, note says `Not yet answered` |

### Page 9. Share with an expert
Dark top half with photo `team-with-charts`; 3 steps; topic chips (`next.topics.chips`, existing `toolsForYou()`), checklist (`checkItems()` missing items), 4 question cards (`next.questions.items`, each a string or `{q}`; goal-aware), `Ready when you are` card with button.

### Page 10. What your plan assumes
Two columns of label/value rows (`assumptions.left/right`: inflation, return, tax year, State Pension counted or not, retire age, plan end age ...), `knownLimits`, `pleaseNote`, `sources`, glossary 3 x 3 (`glossary.items`, 9 entries; fewer entries leave blanks hidden). **Partner**: rows add partner age and retirement. **No mortgage**: no mortgage row.

### Page 11. Appendix: every year in numbers (repeats)
Two-column table, 27 rows per column, 54 per page, columns Age, Year, Income, Needs, Shortfall, Savings left. Numbers raw in data, formatted by renderer (`€55,502`; zero shortfall `-`; shortfall > 0 in coral). Plan to 105 from age 27 = 79 rows = 2 pages; page 11 and 12 titled `Appendix (1 of 2)`. Note text on last page only.

## 2. Chart specs (inline SVG, no libraries)

### 2.1 Road with milestones (cover, shown at 690 x 150)
Smooth curve (cubic through sampled points rising slowly, dips in the coral segment), x = age scaled between `startAge` and `endAge`. The curve is split into `segments[]`, each stroked 10 px with tone colour, round caps. Milestones: circle badge (22 px, white text = `badge`) on the curve at its age, label (bold) and `sub` placed `above` or `below` with 14 px gap; labels never overlap: renderer sorts by age and flips side when two are closer than 12% of width (the data side is a hint). Start and end labels sit at the line ends. Max 8 milestones; extra are dropped from the cover but not from page 4.

### 2.2 Savings line
Plot 700 x 190. x = age, y = value / yMax. Line 2.5 px teal; area under line teal at 12%. Horizontal grid at `yTicks` (labels `€0`, `€100k` ...). Zone shading behind: `zones[]` as vertical bands (tint of tone), label top-left of band. Peak marker: dot + label (`label`, `sub`) offset left if beyond 70% width. Run-out: dashed coral vertical line to the axis with label `Savings run out at 52`.

### 2.3 Who pays each year
Stacked bars: income (teal), savings (gold), shortfall (coral with 45 degree hatch). Gaps between bars 1 px. `stopMarker` = dashed vertical line where work income stops; `lastLabel` annotates the last bar.

### 2.4 Sparklines
120 x 34 px polyline, 1.8 px stroke teal; points in gap years coral; end dot. Global-max normalisation (page 4).

### 2.5 Retirement-years strip
Flex row of cells 100% width, 18 px high, 2 px radius, 1 px gap, colours by `state`; left and right labels under the strip; summary sentence above.

### 2.6 Pyramid and risk scale
Pyramid: five stacked trapezoids built in SVG, level 1 at the bottom; each holds icon and title, status chip on the right. Risk scale: 5 equal segments, gradient teal to coral, marker triangle on `activeIndex`, labels under.

## 3. Variants the renderer must handle

| Case | How the data differs | Visible result |
|---|---|---|
| No partner | `meta.hasPartner=false` | single-person wording; no partner rows |
| Partner | `hasPartner=true` | planner adds `(together)` and partner rows; road shows partner milestone if given |
| No mortgage | no mortgage row, `hasMortgage=false` | no mortgage line on p3 and p10 |
| Mortgage | row present | p3 owe row; milestone `Mortgage-free` allowed on road |
| Already retired | `alreadyRetired=true`, no `You retire` milestone | p5 retirement card starts from today; p7 no retire-age rows; cover road starts at retirement |
| No shortfall | `band.kind="none"`, `runOut=null`, `peak` may exist | positive wording everywhere; no coral zones; scenarios may show 0 rows |
| 1 goal / 15 goals | `plan.goals` length | p2 layout switches (see p2); p5 repeats |
| Plan to 105 | longer series and rows | p4 up to 9 rows; p6 bars narrower; p11 paginated |
| Long names | up to 40 characters | CSS clamps to 2 lines, never overflows |

## 4. Data checks the planner can run
Schema validity (`docs/report-data.schema.json`), no NaN/undefined strings, `plan.goals.length == goalsDetail.goals.length`, `appendix.rows.length == planEndAge - currentAge + 1`, `cashflow.paidChart.bars.length == appendix.rows.length`, regression: the v5 customer must reproduce `tools/report/mock-v5.json` numbers (5% retirement covered, 100% family, run out 52, peak 49 at 289,942, gap about 1.1m today's / 5.3m future, 29 years, 812 left a month, scenario percentages 11/11/16/24/29/33/70/87/94 with +24/+19/+11).

## 5. Open points for the planner
1. Scenario rows: confirm the exact set and the rule for hiding rows with no effect.
2. Per-decade `chip` wording thresholds (Comfortable / Watch this / Gap).
3. Goal photo map (retire -> retired-reading, home -> house-for-sale); other goals have none.
4. Age vs year of birth (pending decision) changes only `meta`.
