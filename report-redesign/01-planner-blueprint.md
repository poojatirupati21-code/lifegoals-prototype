# LifeMap report redesign - 01 Planner blueprint (Agent 1)

Author role: CFP/paraplanner view. Sample client = Pooja (27, IE, EUR 79k gross), per brief. Everything labelled **ILLUSTRATIVE** was computed by me with a replica model (see section 3 and `calc/`), not by the LifeMap engine. Guidance, not regulated advice, throughout.

Conventions for writer/designer
- Every euro figure carries one of three tags: **nominal** (future euros), **today's money** (deflated), **PV** (lump sum needed today). Never show a bare euro total for a multi-year gap.
- Three reading layers: **L1** = page 1 (2 minutes, layman). **L2** = pages 2-7 (guided detail, layman + planner). **L3** = appendix (rigour: CFP/CFA/paraplanner, agent).
- Tone: plain-English headline, then a "For professionals" collapsible line or margin note carrying the method/number. No emoji for status in the professional layer; use text status (On track / Needs attention / At risk) plus colour and icon shape (not colour alone).

---

## 1. Ideal structure (benchmarks: FPSB/CFP 6-step process; CFA IPS flavour; UK COBS 9.4-style suitability report norms; CBI Consumer Protection Code "clear, fair, not misleading", key-information-first)

Mapping of CFP process: 1 Understand client = S2-S4; 2 Analyse/evaluate position = S5-S8; 3 Develop recommendations = S9-S12; 4 Present = whole doc; 5 Implement = S12; 6 Monitor = S13. UK suitability norms add: objectives, why-suitable, risks, charges, what-if-not. CBI norms add: plain language, no misleading prominence, risk warnings adjacent to returns, status of service stated (guidance not advice).

| # | Section | Purpose | Must state | Data / metrics | Visual | Reader | Pages |
|---|---|---|---|---|---|---|---|
| 0 | **Cover + Plan-at-a-glance** | Answer "am I OK?" in 2 min | Who, when, version, status ("Preliminary guidance, not advice"), data-confidence level, 1-sentence verdict per goal, top 3 actions, biggest lever | Goal cover %, first-shortfall age, funded years / retired years, gap in 3 currencies (nominal, today's money, PV), data-confidence score, assumptions version | Hero verdict + 2 goal gauges + 4-6 KPI tiles + mini "lever bar" (see sec 5); 3 next actions | Layman first; planner scans KPIs | 1 |
| 1 | **How to read this report** (strip, not page) | Set expectations: what it is/isn't, how numbers are labelled | Guidance vs advice; today's money vs nominal; "illustrative"; what Pooja can change | Legend of chips: Your figure / Assumed / Missing / Estimated | Legend strip + status key | Layman | 0.3 |
| 2 | **Client profile snapshot** | Who this plan is for; confirm facts | Age, location/tax residency, employment, gross + net income, housing, dependants (none/ planned), partner (none), health & protection summary, risk personality | Gross EUR 79,000; net ~EUR 54.4k (EUR 4,532/mo); savings rate EUR 1,000/mo = 22% of net; replacement of lifestyle | Profile card (6 facts) + "what we don't know" list tied to confidence | Both | 0.5 |
| 3 | **Goals** | State objectives measurably (SMART) with priority | Name, year/age, amount in today's money AND inflated, priority (Must/Nice), funding source, status | G1 EUR 15k @30 -> EUR ~16.8-17.5k nominal; G2 EUR 40k/yr @50 for 31 yrs -> EUR 96k first year nominal; cover %, EUR/month needed | Goal cards with timeline strip; "what it costs" line in 3 currencies | Layman | 1 |
| 4 | **Financial position** (a) Net worth | Starting point | Assets, liabilities, net worth, liquid vs locked, gaps | Today: cash/investments/pension all Missing -> show "not provided", not EUR 0; net worth unknown | Net-worth stack bar (assets vs liabilities) with hatched "unknown" blocks | Both | 0.5 |
| 4b | (b) Cash-flow | Is she living within means? | Net income, living costs, savings, spare | Net EUR 54,383; savings EUR 12k; implied living ~EUR 42k net (living costs not entered); savings rate 22% of net / 15% of gross | Monthly waterfall: gross -> tax/USC/PRSI -> net -> living -> saving -> spare | Both | 0.5 |
| 4c | (c) Protection | Foundation for plan survival | Cover in force vs need, gaps | Life yes; income protection NO; serious illness NO; work cover NO; health ins YES; Illness Benefit EUR 254/wk State floor | Protection matrix (cover type x have/need/gap) | Both | 0.5 |
| 5 | **Assumptions** | Make projections auditable | Each assumption, value, source (Revenue/DSP/CSO/user choice/engine), review date | Infl 3.9% (CSO flash Sep 2026; ECB target 2%), pay 3%, cash 1%, invest 4.5% working, pension 3.15% retired, 6-mth EF, 25% lump sum, tax tables | Table in 5 groups (Economy, Returns, Tax, Behaviour, Limits) + "sensitivity to this" column | Planner/CFA; layman sees 5-row summary | 1 + appendix |
| 6 | **Projections (base case)** | Show the path | Net-worth / pot path to 80, retirement from 50, drawdown, depletion age | Savings left by age; pot at 49 EUR 492,908 nominal (~EUR 212k today's money); depletion 54; needs vs income vs savings | **Net-worth line chart** (accessible pot, locked pot, State Pension) with phases shaded + 54-row table moved to appendix | Both | 1.5 |
| 7 | **Gap analysis** | Explain WHY, not just how much | Gap = needs - (savings drawdown + State Pension + pension); decompose by cause | Gap in nominal / today's money / PV; years funded of retired; capital needed at 50 vs projected (14.8% funding ratio, PV at 3.15%) | **Gap decomposition waterfall** (need -> savings -> SP -> pension -> remaining gap); "why" panel: 30 yrs retirement vs 23 saving yrs, no pension, SP EUR 0, cash drag | Both | 1 |
| 8 | **Scenario / lever comparison** | Show what moves the needle | 6-8 levers side by side, base case marked, affordability, trade-off | Cover %, first-shortfall age, years funded, extra EUR/mo, % of take-home (section 3 table) | **Lever bars** (horizontal, ranked) + small multiples of pot path; tornado for assumptions | Both | 1.5 |
| 9 | **Risk profile & capacity for loss** | Fit investments to person; satisfy suitability norms | 3 dimensions kept separate: attitude (willingness), capacity (ability), need (required return); mismatch commentary; status "indicative - not completed" | Explorer; loss aversion vs long-term; capacity High; required return vs actual 2.7% blended; ESMA-style 1-7 scale once done | Three-gauge row + "match / mismatch" banner; show 60% cash/40% invest | Both (CFA IPS flavour) | 1 |
| 10 | **Action plan** | Convert analysis to next steps | Prioritised, owner, deadline, effort, impact, dependencies | 6-8 actions with "impact on cover %" per action; 30/90/365-day buckets | Checklist/Kanban-style table with impact bars | Layman | 1 |
| 11 | **Questions for an adviser** | Bridge to regulated advice | Auto-generated from gaps (e.g. "Can I access my pension at 50?") | 5-8 questions, prioritised | List with checkboxes | Layman -> adviser | 0.3 |
| 12 | **Education boxes** (inline, 40-60 words each, max 1 per page) | Just-in-time learning | Nominal vs real; pension tax relief; why 25 yrs earlier retirement is expensive; sequence risk; State Pension contributions | 5 boxes | Callout card, icon, "Why this matters to you" | Layman | inline |
| 13 | **Glossary** | Define every term used | 20-30 terms: ARF, PRSA, SFT, DIRT, exit tax, USC, PRSI, My Future Fund, capacity for loss, nominal/real, PV, sequence risk, replacement ratio | -- | Two-column glossary | Layman | 0.5 |
| 14 | **Disclosures & status** | Regulatory hygiene | Not advice; not a suitability or risk assessment; rules as at 2 Oct 2026 and Budget 2027 not included; projections not guaranteed; past/assumed returns; data limits; how data is used (GDPR); contact for adviser; complaints route | -- | Structured 6-block layout (Status / Basis / Limits / Risks / Data / Contact), not a wall of text | Professional + compliance | 0.7 |
| A | **Appendix** | Auditability | A1 year-by-year table (54 rows, with real column); A2 tax & rules table with source + date; A3 full assumptions; A4 method notes (calc definitions: cover % = funded / needs, nominal); A5 data inventory + confidence by item; A6 version history | -- | Dense tables, zebra, sticky header | Planner/paraplanner/CFA | 3-4 |

Total target: 11-12 pages main + 3-4 appendix (vs 9 pages of mostly padding now).

Design must-haves for planner credibility
- A cover-of-plan "Basis of preparation" line: fact-find date, rules date (2 Oct 2026), engine version, model type (deterministic, single scenario).
- Every chart gets a one-sentence takeaway title (the "so what"), plus a data-table alternative in the appendix.
- Do not show "EUR 0" for unknown; show "Not provided" (hatch) so a zero balance is not implied (current PDF starts the savings pot at EUR 0 with cash savings "Missing").

---

## 2. Sanity check of the current PDF numbers

### 2a. What reconciles (good)
| Check | Result |
|---|---|
| Net pay 2027 EUR 54,383 from EUR 79,000 gross | Recomputed: IT 18,800 (20%/40% at 44k, credits 4,000) + USC 2,351 + PRSI ~3,397 (4.3%) -> net ~EUR 54,452. Within EUR 70 (0.1%). OK. |
| Income growth | 3.03%, 3.06%, 3.28% then ~3.3%/yr: net grows slightly faster than 3% gross because bands/credits rise with prices (3.9%). Consistent with "tax bands rise with prices". OK. |
| Need at 50 = EUR 96,431 | 40,000 x 1.039^23 = 96,431. Matches exactly; 2080: 40,000 x 1.039^53 = 303,867. Matches. |
| Total shortfall | Sum of the 27 shortfall rows = EUR 5,109,453 (PDF: 5,109,455; rounding). OK. |
| 9% cover logic | Reproduced: sum of retirement needs (age 50-80, nominal) = EUR 5,622,740; unfunded 5,109,455; funded 513,285 = **9.1%**. So "cover %" = nominal funded / nominal needs over the retirement window. |
| Savings left | Pot 492,908 at 49; 402,979 -> 307,753 -> 206,993 -> 100,455 -> 0 (age 54). Implied retirement-phase growth only ~0.8-1.3%/yr (cash-heavy). |
| Pre-retirement pot | My replica (EUR 12,200/yr saving, +3%/yr, 2.7% blended return, EUR ~17k goal outlay in 2030) reproduces 9.1% cover, first gap 54, 27 gap-years, EUR 5.11m, pot 492.6k. Good enough to run levers. |

### 2b. Oddities and risks of misreading (flag to engine team; writer must not hide them)
| # | Finding | Why it matters | What I'd compute / show |
|---|---|---|---|
| 1 | **"Today's money" is really 2027 money.** Needs inflate 23 years to 2050 (from 2027), but report was created Sep 2026 (24 years). Age 27 in 2027 (not 2026) also makes "in 3 years" = 2030 inconsistent with a Sep-2026 date. | Understates needs by 3.9% (EUR 100,192 vs 96,431 at 50); date labels look off. | State base year explicitly ("2026 prices") or fix engine; show base-year in assumptions. |
| 2 | **EUR 5.1m total is nominal and a sum of euros of different years.** It equals 91% of total nominal needs. EUR 299,917 in 2080 is ~EUR 39k in 2027 money. | Alarming, non-comparable, anchors reader on a number that is mostly inflation. | Show three figures (below). |
| 3 | **Pay rises 3% < inflation 3.9%** -> real pay falls 0.9%/yr; net pay at 49 EUR 109,951 nominal = ~EUR 47.4k in today's money (below today's 54.4k); and 3% escalation of saving means real saving shrinks. | Internally inconsistent unless deliberate; makes the plan harsher. | Run pay = inflation + 1% variant; show pay growth as a user lever. |
| 4 | **3.9% inflation held for 53 years** (CSO flash, ECB target 2%). | Single biggest assumption: need at 50 EUR 96.4k (3.9%) vs EUR 63.1k (2%). | Sensitivity (below): cover 9% (3.9%) / 13% (3.0%) / 16% (2.5%) / 19% (2.0%). Show a range band. |
| 5 | **Cash-heavy pot**: 60% cash @1%, 40% invested; blended ~2.7% working, ~1.2% retired = real return -2.7%. Conflicts with Explorer / high capacity for loss / 23-yr horizon. | Drives a big part of the gap and is a suitability mismatch to flag, not hide. | Variant: 4.5% working / 3.15% retired on whole pot -> cover 12% retire-50, 33% retire-60 (ILLUSTRATIVE). |
| 6 | **State Pension EUR 0** while chart legend shows "SP" at 66 and Assumptions say "usually EUR 0-299.30". | EUR 299.30/wk = EUR 15,564/yr (today's money) = 39% of the EUR 40k target. Largest free item, left at zero. | Show both: SP not entitled / pro-rata / full (levers). Note: retiring at 50 leaves ~16 yrs with no PRSI; record may fall short of full rate; check contributions statement (DSP/MyWelfare). |
| 7 | **Unexplained income of EUR 3,950 at age 80.** | Table row 80 shows income with plan "zero from 50"; the teal sliver on the chart. | Ask engine (probable State Pension/partner/other). Reconcile before print. |
| 8 | **Starting savings = EUR 0** (cash/investments Missing); EF "in progress" but 6-month EF (~EUR 21k) not shown being built, and living costs missing so EF target cannot be sized. | Plan output quality unknown; roadmap 20s-40s "income covers life" is unverified (Foundations step 1 "not started"). | Show EF target = 6 x essential spend once entered; until then show "estimated EUR 20-25k at ~EUR 3.5k/mo implied". |
| 9 | **Pension access vs retire-at-50.** Plan assumes pension withdrawals from 60 at earliest. Retire at 50 therefore needs ~10 years of non-pension "bridge" capital (age 50-59 needs EUR 96k-136k/yr nominal = ~EUR 1.15m nominal). | Pension saving does NOT help the first 10 years; my PRSA lever scenario shows first gap at 50 for that reason. | Bridge-capital line item in gap analysis; "pension locked" shading on chart. Confirm access rules (employer-scheme early access) with an adviser. |
| 10 | **Plan ends at 80.** Life expectancy for a 27-year-old Irish woman is mid/high-80s; 25% reach ~92+. | Shortfall and cover % are understated/overstated depending on horizon; at 90 cover = 5%, at 95 = 4%. | Show horizon sensitivity (80 / 90 / 95) and "longevity" education box. |
| 11 | **Cover % is not comparable across scenarios** because the denominator (retirement window) changes when retirement age changes, and it is a nominal ratio dominated by late, large euros. | "Retire at 65 = 36%" vs "retire at 50 = 9%" is mixed apples/oranges. | Pair it with: first-shortfall age, funded years of retired years, capital funding ratio (pot / PV of needs). |
| 12 | **+EUR 850/mo -> 23%** is not reproducible from the stated assumptions unless the extra is invested at 4.5% and escalated with inflation (replica: 20-22.5%). Also EUR 850 is a big ask: saving EUR 1,850/mo = 41% of net pay (EUR 4,532/mo) leaves ~EUR 2,680/mo for rent and living. The plan's own cap is "<=50% of spare money". | A what-if that is unaffordable is not guidance. | Show affordability (% of net pay, remaining living budget) next to every lever. Disclose where the extra is invested. |
| 13 | **Goal 1 funding (EUR 441/mo avg)** is not reconcilable: EUR 15k nominal-ised (EUR 16.8k at +3 yrs, EUR 17.5k at +4 yrs) / 36 or 48 months = EUR 467 / EUR 364. | Small, but a reader checking sums will lose trust. | Footnote method (includes interest? which start date?). |
| 14 | "Needs" shows EUR 0 in working years (no pre-retirement spend model). | A reader may think she spends nothing. | Label column "Retirement needs (spending not modelled while working)". |

### 2c. The three figures to show for any gap (baseline, from the PDF's own table)
| Figure | Value | How computed | Label |
|---|---|---|---|
| Nominal (future euros) | **EUR 5,109,455** over 27 yrs (91% of nominal needs EUR 5.62m) | Sum of shortfall rows | "In the euros of each future year - not comparable to today" |
| **Today's money** | **~EUR 1.04m** (EUR 1.00m if base year = 2026) | each year's shortfall / 1.039^(year-2027) | "Same gap, priced at today's prices. This is the one to compare with your salary." |
| **Present value** | **~EUR 1.04m lump sum today** (coincidentally ~equal to today's money figure at 4.5% -> 3.15% discounting) | each shortfall discounted at 4.5% to age 50 then 3.15%, i.e. the plan's own return assumptions | "Size of a one-off pot today that, invested as the plan assumes, would close the gap" |
| Per-month equivalent | **+EUR 5,880/mo** to age 50 to fully fund (savings only, 4.5%, escalating 3.9%) -> **not feasible** (> net pay EUR 4,532/mo) | solved with replica (ILLUSTRATIVE) | "Retire at 50 cannot be closed by saving alone" |
| Capital funding ratio | pot at 50 EUR 493k vs PV of needs EUR 3.34m @3.15% = **14.8%**; in today's money: EUR 212k vs EUR 1.24m (30 x EUR 40k, no growth) = 17% | | professional KPI |

Also compute for the writer (cheap, high value): years-funded ratio 4 of 31; "age money runs out" 54; gap per year in today's money (flat ~EUR 25-40k: gap ~ EUR 40k less SP) - a chart in today's money shows the gap as a roughly constant EUR 40k band, which is far less alarming and more honest than the nominal "wedge" that grows to EUR 300k.

---

## 3. Lever scenarios (ILLUSTRATIVE - replica model, not the LifeMap engine)

Method (script: `/home/user/lifegoals-prototype/report-redesign/calc/m2.py`, `scen.py`, `need.py`)
- Replica calibrated to PDF baseline: saving EUR 12,200/yr +3%/yr, accessible pot 2.7% working / 1.2% retired, EUR 17k goal outlay in 2030, needs EUR 40k today's x 1.039^t (t=0 in 2027), plan to 80, cover % = funded / needs (nominal), as the PDF. Replica error vs PDF baseline: cover 9.08% vs 9%, first gap 54 = 54, pot EUR 492.6k vs 492.9k, shortfall EUR 5.11m vs 5.109m.
- Extra saving: invested at 4.5% working (as the PDF's EUR 850 case implies), escalates with inflation. Replica gives 20% vs engine's 23%: treat ILLUSTRATIVE +-3 pts.
- State Pension: EUR 299.30/wk from 66, indexed with prices; "70%" = reduced contributions record (assumption, not DSP calc); taxed ~5% (credits) or 15% if other pension income.
- PRSA lever: existing savings stream redirected into a PRSA grossed up at 40% relief but capped at the age limit (15% of pay <30, 20% 30-39, 25% 40-49; pay EUR 79k +3%): at 27 max EUR 11,850 gross/yr costing EUR 7,110 net, balance of the EUR 12k stays as savings. PRSA grows 4.5% working / 3.15% retired, **locked until 60**, 25% lump sum at 60 (tax-free <= EUR 200k), rest ARF taxed at 15% effective.
- Auto-enrolment: 1.5% employee + 1.5% employer + 0.5% State (State = 1 per 3 paid in) on pay <= EUR 80k, 2026 rates held; employee cost EUR 1,185/yr funded from the existing saving.
- Not modelled: tax on savings beyond what the PDF embeds, partner, mortgage/rent change, children costs, SFT, Budget 2027.

| Scenario (everything else = baseline) | Cover % (nominal, PDF definition) | First-shortfall age | Gap years / retired years | Nominal shortfall | In today's money | Pot at retirement (nominal) |
|---|---|---|---|---|---|---|
| **Baseline: retire 50, EUR 40k, no pension, SP EUR 0** | **9%** | **54** | 27 / 31 | EUR 5.11m | EUR 1.04m | EUR 493k |
| Retire at 55 | 14% | 60 | 21 / 26 | EUR 4.37m | EUR 0.81m | EUR 697k |
| Retire at 60 | 22% | 66 | 15 / 21 | EUR 3.47m | EUR 0.59m | EUR 953k |
| Retire at 65 | 36% | 71 | 10 / 16 | EUR 2.37m | EUR 0.36m | EUR 1.27m |
| +EUR 425/mo saved (9% of net pay) | 15% | 57 | 24 / 31 | EUR 4.80m | EUR 0.94m | EUR 783k |
| +EUR 850/mo saved (engine says 23%) | 20% (23% engine) | 59 | 22 / 31 | EUR 4.47m | EUR 0.84m | EUR 1.07m |
| State Pension full rate EUR 299.30/wk from 66 (entitled) | 32% | 54 (unchanged) | 27 / 31 | EUR 3.81m | EUR 0.82m | EUR 493k |
| State Pension at 70% of full rate | 25% | 54 | 27 / 31 | EUR 4.20m | EUR 0.89m | EUR 493k |
| Spend EUR 35k (today's money) | 10% | 55 | 26 / 31 | EUR 4.41m | EUR 0.89m | EUR 493k |
| Spend EUR 30k | 12% | 56 | 25 / 31 | EUR 3.70m | EUR 0.74m | EUR 493k |
| Auto-enrolment only (1.5+1.5+0.5%) | 11% | 54 | 26 / 31 | EUR 4.99m | EUR 1.01m | EUR 586k (incl. pension) |
| Redirect saving to PRSA (retire 50; pension locked to 60) | 22% | **50** (bridge gap) | 24 / 31 | EUR 4.41m | EUR 0.92m | EUR 904k (of which locked) |
| Retire 60 + State Pension full | 52% | 66 | 15 / 21 | EUR 2.17m | EUR 0.36m | EUR 953k |
| Retire 50 + SP 70% + PRSA | 36% | 50 | 24 / 31 | EUR 3.59m | EUR 0.78m | EUR 904k |
| Retire 55 + SP 70% + PRSA | 47% | 56 | 16 / 26 | EUR 2.69m | EUR 0.51m | EUR 1.33m |
| **Retire 60 + SP 70% + PRSA** | 65% | 73 | 8 / 21 | EUR 1.57m | EUR 0.23m | EUR 1.88m |
| Retire 60 + SP 70% + PRSA + EUR 425/mo | 85% | 78 | 3 / 21 | EUR 0.66m | EUR 0.09m | EUR 2.51m |
| Retire 60 + SP 70% + PRSA + EUR 850/mo | 100% | none to 80 | 0 / 21 | 0 | 0 | EUR 3.14m |
| Retire 65 + SP 70% + PRSA | 100% | none to 80 | 0 / 16 | 0 | 0 | EUR 2.59m |

Extra monthly saving needed to reach 100% to age 80 (ILLUSTRATIVE; savings stream only vs with SP 70% + PRSA):
| Retire at | Saving alone (+EUR/mo) | With SP 70% + PRSA (+EUR/mo) |
|---|---|---|
| 50 | 5,880 (infeasible: > net pay) | 3,893 (infeasible) |
| 55 | 3,479 | 1,909 |
| 60 | 1,969 | 718 |
| 65 | 980 | 0 (already funded) |

Other sensitivities (ILLUSTRATIVE, baseline): inflation 2.0% / 2.5% / 3.0% / 3.9% -> cover 19% / 16% / 13% / 9%, need at 50 EUR 63k / 71k / 79k / 96k. Plan horizon 80 / 90 / 95 -> cover 9% / 5% / 4%, nominal shortfall EUR 5.1m / 8.9m / 11.4m. Whole pot at 4.5%/3.15% -> cover 12% (retire 50), 33% (retire 60, first gap 68).

Read-across for the writer: (1) retirement age is the dominant lever, each 5 years later ~ +6-14 pts and +5-6 yrs of first-shortfall age; (2) State Pension adds ~16-23 pts at no cost but only after 66, so it does nothing for the first 16 years of a retire-at-50 plan; (3) pensions beat deposits (tax relief) but are locked to 60, so they only work with retirement >= 60 or a bridge; (4) extra saving alone cannot rescue retire-at-50 (needs EUR 5.9k/mo); (5) lowering spend by EUR 5k gives ~1 pt, because the starting pot is tiny - show this honestly, it kills the "just spend less" myth; (6) a retire-at-60-ish plan with pension + State Pension + modest extra saving is realistic, so present "Retire at 50" as the dream and "Retire at 60 with ~EUR 700-1,000/mo extra" as a credible path (still ILLUSTRATIVE; adviser to confirm).

Tone note: all of this stays "things to consider / questions to ask an adviser", not "you should".

---

## 4. Top 8 headline messages for Pooja (priority order) and next actions (guidance only)

| # | Headline (plain English) | Evidence | Next action (guidance, not advice) |
|---|---|---|---|
| 1 | **Your family goal is on track; retiring at 50 on EUR 40k a year is not, on today's path.** Your savings would cover about 4 of the 31 years (to age 54). | G1 100%; G2 9% nominal; gap ~EUR 1.0m in today's money (not EUR 5.1m) | Treat retiring at 50 as a stretch goal and compare it with other dates (see #2). Review in 6 months. |
| 2 | **When you stop work matters more than almost anything else.** Each 5 years later closes a big part of the gap, because you save longer and spend fewer years drawing. | Retire 55: 14%, first gap 60; 60: 22%, 66; 65: 36%, 71 (savings only, illustrative) | Pick 2-3 candidate retirement ages and have the plan re-run; decide which trade-off feels right. |
| 3 | **You have not started a pension, and that is your biggest unused tax advantage.** At your income, tax relief is 40% on contributions (up to 15% of pay at your age, EUR ~11,850/yr). | PRSA redirect: 22% cover vs 9% (illustrative); auto-enrolment adds employer 1.5% + State 0.5% on top of your 1.5% | Check whether your employer offers a pension / My Future Fund and whether you are eligible; ask what employer match exists; ask an adviser about a PRSA. Note pension is generally locked until 60. |
| 4 | **The State Pension is a quiet EUR 15,600 a year (today's money) that the plan counts as zero.** | EUR 299.30/wk x 52; lifts cover to 25-32% | Request your PRSI contributions statement (DSP/MyWelfare); note retiring at 50 may leave a shorter record. |
| 5 | **The result depends heavily on three cautious assumptions, so read it as a range.** 3.9% inflation for 53 years, pay rises of 3%, and 60% of savings in cash. | At 2% inflation cover is 19%; whole pot at 4.5%/3.15% gives 12%/33% | Review the three assumptions with an adviser; confirm your attitude and capacity for loss in "Understand me" so the investment mix fits you. |
| 6 | **Your plan rests on your salary, and your income is not protected.** No income protection, no serious illness cover, no work cover. | Plan needs 23 years of saving; Illness Benefit EUR 254/wk is the only floor; life cover exists | Get quotes for income protection (typically up to ~75% of earnings, State benefit counted) and decide on serious illness cover; check what life cover is for before a family. |
| 7 | **Growing your family costs money and time out of work, and the plan is thin there.** EUR 15k in today's money is modest and partner pay, maternity/childcare and higher living costs are not modelled. | G1 funded EUR 441/mo avg; 2030 dips savings; "living costs flat" known limit | Break down what the EUR 15k covers; add expected leave and childcare; re-run. Consider a short-term (3-5 yr) savings home for this goal. |
| 8 | **This report is only as good as the data in it, and 9 key items are missing.** Starting savings, living costs, pension value and debts are blank, so the plan assumes you start from EUR 0. | Data-confidence ~35/100 "Low" (section 5) | Fill in the 5 highest-weight items (living costs, cash savings, pension value, State Pension record, debts) to raise confidence to ~70+; then speak to a regulated adviser. |

Ordering logic: verdict -> biggest lever -> biggest unused tax/State resource -> assumptions range -> protection (risk to plan) -> goal realism -> data quality. Each headline gets one big number max, tagged nominal / today's money.

---

## 5. Plan-at-a-glance KPIs and data-confidence score

### 5a. KPI panel (page 1)
| KPI | Definition | Display | Layer |
|---|---|---|---|
| Goal cover % (each goal) | funded / needed (nominal) - keep PDF definition, but also show funded years | gauge + status text | L1 |
| Years funded in retirement | funded years / total retired years (e.g. 4 of 31) | "4 of 31 years" bar of 31 ticks | L1 |
| First-shortfall age | first age with unfunded need (54) | big number | L1 |
| Gap in today's money | sum of deflated shortfalls (EUR ~1.04m) with nominal (EUR 5.1m) in small print | number + tooltip | L1 |
| Biggest lever | top-ranked lever by cover gain per EUR of effort | "Retire at 60: +13 pts" | L1 |
| Data confidence | 0-100 + Low/Medium/High (5b) | chip with ring | L1 |
| Savings rate | saving / net income (22%) and / gross (15%) | % + benchmark band (15-20% pension-style norm) | L2 |
| Capital funding ratio at retirement | projected pot / PV of needs (14.8%) | % | L3 |
| Replacement ratio | target income / final-year gross in today's money (EUR 40k / EUR 65k = 61%); vs current net 74% | % | L3 |
| Emergency fund months | liquid / essential monthly spend (target 6) | months bar; "not provided" when unknown | L2 |
| Protection score | covered needs / total (life, IP, SI, work) e.g. 2 of 5 | 5 icons | L2 |
| Pension readiness | pension contributions / (target 15% of gross, age-adjusted) = 0% | % + SFT headroom (EUR 2.2m, irrelevant now - hide for layman) | L2/L3 |
| Retirement-age sensitivity | cover at +/-5 years | mini spark | L2 |
| Assumption stress | cover range at 2.0-3.9% inflation (9-19%) | range bar | L3 |
| Tax efficiency | share of savings in tax-relieved wrappers (0%) | % | L3 |
| Risk fit | attitude vs capacity vs need vs actual mix (match/mismatch) | 3-dot indicator | L3 |

Page-1 shortlist: goal gauges + years funded + first-shortfall age + gap today's money + data confidence + top lever (6 tiles max).

### 5b. Data-confidence score design
Purpose: stop the reader over-trusting a model fed with blanks; also shows how to improve it. Computed per input, rolled up per section and overall.

Formula: `Score = 100 x SUM(w_i x q_i) / SUM(w_i)`; `q` = quality of source.

| Source quality | q | Chip |
|---|---|---|
| Verified (statement, document, open-banking, DSP/Revenue record) | 1.0 | Verified |
| Client-stated exact figure | 0.8 | Your figure |
| Range / "not sure" / rounded | 0.5 | Estimate |
| Engine default or assumption (not client data) | 0.3 | Assumed |
| Missing | 0 | Missing |
Staleness: multiply q by 0.9 if > 12 months old, 0.75 if > 24 months.

Weights (by influence on outcome): living costs 12; gross income 10; pension value 10; cash 8; pension contributions 8; State Pension record 8; goals 8; risk profile (completed) 8; investments 6; protection 6; retirement age 6; rent amount 5; age 4; employment 4; one-off costs 4; credit cards 4; other loans 4; auto-enrolment 4; other income 3; mortgage 3; other property 2 (sum 127).
Bands: 0-39 Low (do not rely on projections), 40-69 Medium (indicative), 70-89 Good, 90+ High (adviser-ready).
Worked example (Pooja today, ILLUSTRATIVE weights): ~35/100 = **Low**. Filling living costs, cash, pension value, State Pension record and debts at 0.8 -> ~75/100 = **Good**. Display: "Confidence: Low (35). 5 inputs would lift this to Good" + a ranked "improve your confidence" list with weight shown as +points.
Per-section chips: Goals (Medium), Cash-flow (Low), Net worth (Low), Protection (Good), Projections (Low, inherits lowest of cash-flow/net worth), Risk (Low until "Understand me" done). Show the score beside every chart title as a small chip so the layman sees it before the numbers; list "Missing" items as one box (not 9 "Missing" pills in a data dump) with links to complete.
Rules: projections cannot be labelled "on track" unless confidence >= 40; if confidence < 40 label "Provisional". Show confidence trend across versions (v5 -> v6).

---

## 6. Notes for writer and designer (cross-cutting)
- Page 1 must contain: verdict sentence, 2 goal gauges, 6 KPI tiles, top-3 actions, data-confidence chip, status line. Remove emoji weather; if the consumer layer keeps icons, use a consistent icon set (sun/cloud allowed only on L1, with text status).
- Chart set (priority): (1) net-worth/pot line to 80 with phases and the pension lock, (2) gap in today's money area chart, (3) lever bars, (4) gap decomposition waterfall, (5) protection matrix, (6) monthly cash-flow waterfall, (7) assumptions tornado. Roadmap-by-decade cards can stay as a compact strip.
- Replace the 54-row table with the chart in the main flow; keep the table in the appendix with extra "today's money" column and sticky header.
- Compliance wording: "This is guidance to help you explore options; it is not a personal recommendation, a suitability or risk assessment, or financial advice. Only an authorised adviser can give advice." Place on cover (short) and S14 (full). Put the "illustrative / not guaranteed" tag adjacent to every projected figure (CBI "clear and prominent" norm), not only in the footer. Rules checked 2 Oct 2026; Budget 2027 (6 Oct 2026) excluded - say so on cover strip.
- Brand: repo prototypes use teal #5EEAD4, lavender #C4B5FD / #D9D3F0, rose #FDA4AF, plum #5B2E6B, greys #8e9cab / #E8EBF3 (colour-theme PNG in repo root); existing PDF uses teal=income, gold=savings, coral=shortfall. Keep that three-colour semantic and add a 4th muted hatch for "unknown".
- Open questions for the engine team: base-year, EUR 3,950 at 80, goal-1 EUR 441 method, how EUR 850 lever is invested, whether SP is included when "Not sure", pension access age at 50 (employer scheme).
