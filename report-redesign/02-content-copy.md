# LifeMap report redesign: final copy (Agent 3)

Client: Pooja, 27, Ireland. Plan v5, created 29 Sep 2026. Irish rules 2026, checked 2 Oct 2026.

## Conventions used in this copy

- **Voice:** warm, direct, plain. Body text aims at reading age ~12. Short sentences. Technical depth lives in **For your adviser** call-outs (marked `[ADVISER]`).
- **Two kinds of euros, always labelled:**
  - **today's money** = what it would cost if you bought it today (also called "real").
  - **future money** = the actual number on the price tag in that year (also called "nominal"). Prices rise 3.9% a year in this plan.
- **Fixed terms:** "savings pot" (not "net worth" or "assets" in body text), "shortfall" (spending that savings and income cannot cover), "plan years" (2027 to 2080), "covered" (% of a goal that is funded), "lever" (a change you can make).
- **Euro format:** €1,234 and €1.1 million in prose; `€1,234,567` in tables. Always "per month" and "per year" in full, never "p.m." / "p.a.".
- **Figure tags:** `[from report]` = taken from Plan v5. `[derived]` = simple arithmetic on report figures (working shown). `[illustrative – to confirm]` = not in the report; the planner or engine must confirm before print. Tags are for the build team and are NOT printed.
- **No emoji in the report.** Use icons/colour from the design system instead.
- **No guarantees.** Words banned: "will", "guaranteed", "safe", "ensure" (about outcomes). Use "could", "is estimated to", "in this plan".

---

## 0. Microcopy and status system

### 0.1 Goal funding scale (5 levels, used everywhere a goal or % appears)

| Level | Label | Range (covered) | Colour role | One-line meaning |
|---|---|---|---|---|
| 1 | **Fully funded** | 100% | Teal | The plan pays for this in full. |
| 2 | **Nearly there** | 75% to 99% | Light teal | A small top-up closes the gap. |
| 3 | **Making progress** | 40% to 74% | Gold | A solid start. More is needed. |
| 4 | **Needs work** | 10% to 39% | Amber-coral | A real gap. Several levers could help. |
| 5 | **Needs a plan** | Under 10% | Coral | Today's setup does not fund this. Let's choose the levers. |

Pooja: Grow my family = **Fully funded** (100%). Retire comfortably = **Needs a plan** (9%).
Replace "On track / Needs attention" everywhere. Never use sun/storm emoji.

### 0.2 Foundation step status (3 levels)

**Done** · **In progress** · **Not started**

### 0.3 Data confidence scale (4 levels, shown per snapshot row)

| Tag | Meaning |
|---|---|
| **Confirmed** | You gave us this and it is a figure, not a guess. |
| **From your answers** | We worked this out from what you told us (for example, a range you picked). |
| **Assumed by LifeMap** | We filled the gap with a standard assumption. |
| **Missing** | We do not have it yet. The plan may be less accurate until we do. |

Overall meter label: **Plan confidence: Medium-low** [illustrative – to confirm; rule suggestion: 9 areas missing = Medium-low]. Helper line: "Nine areas are still empty, so treat the numbers as a first draft."

### 0.3b Chart titles

| ID | Title (H3) | Where |
|---|---|---|
| C1 | Your goals at a glance | Plan at a glance |
| C2 | Your life, decade by decade | Roadmap |
| C3 | Where each year's money comes from | Cashflow bars |
| C4 | Your savings pot through life | Savings-pot line chart (new) |
| C5 | Four ways to close the gap | Lever comparison |
| C6 | Your five money foundations | Foundation ladder |
| C7 | How complete is your picture? | Data confidence meter |

### 0.4 Empty-state wording

| Situation | Copy |
|---|---|
| A figure is missing | "Not added yet. Add it in LifeMap and this page updates." |
| A section needs a missing figure | "We cannot work this out yet. It needs your [monthly living costs]." |
| No adviser questions chosen | "No questions of your own yet. We have started you off with eight below. Add or delete any." |
| Risk profile not done | "Your risk profile is not finished. It takes about 5 minutes. Finish **Understand me** to unlock it." |
| Value is zero by choice | "€0 (you chose to leave this out for now)." |
| Not sure | "You said 'not sure'. We have used €0 to be cautious. Checking takes about 10 minutes (see Action 4)." |
| Chart with no gap | "No shortfall in these years. Income and savings cover your spending." |

### 0.5 Button/label library

"Explore this lever" · "See year by year" · "Show the working" · "For your adviser" · "Learn" · "Add this figure" · "Take this to your adviser"

---

## 1. Cover

**Title:** Pooja's LifeMap plan
**Tagline:** *A clear picture of the life you want, and the money it needs.*
**Sub-line:** Prepared for Pooja · Age 27 · Ireland · Plan version 5 · Created 29 September 2026
**Badge (cover and every footer):** Preliminary guidance, not regulated financial advice.
**Reading time line:** 2 minutes to read page 2. 15 minutes for the full report.

---

## 2. Plan at a glance (page 2; the page most people will read)

**Eyebrow:** Your plan at a glance

**Headline (H1):**
> Your family goal is funded. Retiring at 50 needs a bigger plan.

**Intro (2 sentences):**
Pooja, you are 27 with a good income and time on your side. Here is where you stand today, and what could change it.

### Key message 1: The good news
**Your family goal is fully funded.**
Paying for "Grow my family" in 2030 (€15,000 in today's money, about €16,800 in future money) fits comfortably in your plan. [derived: €15,000 × 1.039³ ≈ €16,824]

### Key message 2: The challenge
**Retiring at 50 is 9% covered, because your savings would last about four years.**
Your savings pot could grow to roughly €493,000 by age 49. Spending then starts at about €96,000 a year in future money, so savings run out at 54. After that there is a gap in each of the 27 years to age 80. That sounds scary. It is a starting point, not a verdict, because the plan has no pension and no State Pension in it yet.

### Key message 3: What you can do
**You have strong levers, and time is the biggest one.**
Saving €850 more a month lifts the retirement goal from 9% to 23%. Starting a pension (with tax relief), retiring a few years later, and checking your State Pension could each add a lot more. Combined, the plan could look very different. Page 8 shows how.

### Stat strip (4 tiles)

| Tile | Value | Label |
|---|---|---|
| 1 | **100%** | Grow my family covered (Fully funded) |
| 2 | **9%** | Retire comfortably covered (Needs a plan) |
| 3 | **Age 54** | When your savings run out in this plan |
| 4 | **9 areas** | Still missing. Filling them makes the plan more accurate |

### Next-step box ("Start here")
**Your first move this month:** check if your employer offers a workplace pension, and ask about a match. It is often the quickest win. (Action 1, page 9.)

### Footer line on this page
Figures are estimates in euros. "Future money" includes rising prices at 3.9% a year. Not a promise. See page 14.

[ADVISER] Headline stats. Retirement goal coverage 9% on a €40,000 pa (real) target from 50 to 80; no pension assets or contributions; State Pension modelled at €0 (user answer "not sure"); inflation 3.9% (CSO HICP flash Sep 2026, vs ECB 2% target); post-retirement return 3.15% net; savings exhaust at 54. Treat as a base case that is sensitive to the three omitted inputs.

---

## 3. Profile snapshot ("About you")

**Section title:** About you, and what we know so far

**Intro:** This page shows what your plan is built on. Where we have a figure from you, we use it. Where we do not, the plan may be less accurate. The more you add, the better your plan.

### 3.1 Who you are (card)

| | |
|---|---|
| Name | Pooja |
| Age | 27 (born 1999) [derived: plan starts 2027; confirm DOB not shown] |
| Country and tax rules | Ireland, 2026 rules (checked 2 October 2026) |
| Work | Employed |
| Gross pay | €79,000 a year (your figure) |
| Estimated take-home pay, 2027 | €54,383 (net, after tax) [from report] |
| Home | Renting, no mortgage |
| Retirement age you chose | 50 |
| Plan runs | Age 27 to 80 (2027 to 2080) |
| Money personality | Explorer |

Caption: "Take-home pay is estimated using 2026 Irish income tax, USC and PRSI."

### 3.2 What we know and what we are missing (the nine gaps)

**Heading:** Nine things would sharpen your plan.
Each one below says why it matters. Ordered by impact on the result.

| # | Missing item | Why it matters (plain English) | Impact |
|---|---|---|---|
| 1 | **Pension value and what you pay in each month** | Your pension is the biggest tool for retiring early. Right now the plan assumes zero. If you already have one, the 9% will be higher. | High |
| 2 | **Monthly living costs** | We cannot see how much of your pay you really keep. The plan assumes you can save about €1,000 a month. If your costs are higher or lower, that changes. | High |
| 3 | **Cash savings** | Savings you already have give your pot a head start. They also show whether your emergency fund is real. | High |
| 4 | **Investments** | Money already invested grows over time. It could shorten the gap. | Medium |
| 5 | **Credit cards and other loans** (owed and monthly repayment) | Debt with high interest can cancel out your saving. It also uses up monthly cash. | Medium |
| 6 | **Yearly one-off costs** (holidays, car, insurance, gifts) | These are often the reason savings plans slip. We want your plan to match real life. | Medium |
| 7 | **Other income a month** | Side income or rent can speed up saving. | Low |
| 8 | **Other property** (value and rent) | Property can be a big part of your wealth, or a cost. | Low (Pooja: probably none; confirm) |
| 9 | **State Pension entitlement** (currently "Not sure") | The State Pension could pay up to €299.30 a week (about €15,560 a year in today's money) from 66. The plan uses €0 for now. | High |

[derived: €299.30 × 52 = €15,563.60]

Note: The report counts "9 areas". Rows 5 and 8 group two or more fields each.

### 3.3 What we know (compact checklist)

Confirmed or from your answers: first name, age, retirement age, work, gross pay, renting, no mortgage, life cover, health insurance, no income protection, no serious illness cover, no cover through work, not in My Future Fund.

### 3.4 Confidence meter

**Plan confidence: Medium-low.** [illustrative – to confirm]
"You gave us the big three (age, pay, retirement age). Nine details are missing. Fill the high-impact ones first (1, 2, 3, 9)."

[ADVISER] Fact-find gaps: no assets/liabilities/expenditure data; plan built on income, retirement age and an assumed savings rate (≤50% of spare money, "over €750" band, planned at ~€1,000 pm). Net worth and affordability cannot be verified. Pension auto-enrolment status "No" (My Future Fund) needs reconciling with employer scheme status, employment contract, and age/earnings eligibility (earnings cap €80,000 for contributions).

---

## 4. Goals

**Section title:** Your goals

**Intro:** You told us about two goals. Both are "must haves". Costs are shown two ways, so you see the real price and the one on the day.

### Goal 1: Grow my family

| | |
|---|---|
| **What** | Costs to start or grow your family |
| **When** | Age 30 (2030), in 3 years |
| **Priority** | Must have |
| **Cost in today's money** | €15,000 |
| **Cost in future money** | About €16,800 (after 3 years of 3.9% price rises) [derived] |
| **Status** | **Fully funded** (100%) |
| **What you put aside** | About €441 a month on average |
| **Our take** | Your income and savings cover it. It uses part of your savings in 2030. |

Caption: "Fully funded: your plan pays for this in full."

[ADVISER] Goal funded from cash/short-term pot (money needed within 5 years kept as cash at 1%). Savings pot dips from €38,434 (2029) to €35,645 (2030) in the cashflow table. Excludes ongoing child costs, childcare, parental-leave income change, and any change to housing needs; these are not modelled.

### Goal 2: Retire comfortably

| | |
|---|---|
| **What** | A yearly spending budget in retirement |
| **When** | From age 50 (2050), to age 80 |
| **Priority** | Must have |
| **Cost in today's money** | €40,000 a year |
| **Cost in future money** | €96,431 in the first year (2050), rising to €303,867 by age 80 (2080) |
| **Status** | **Needs a plan** (9%) |
| **How much you would need in total** | About 30 years of spending, which is about €1.2 million in today's money [derived: 30 × €40,000] |
| **Our take** | Your savings would pay for about four years (to age 54). A pension, a later start, or a State Pension would change this. |

Caption: "Needs a plan: today's setup funds 9% of this goal."

Plain note: "€40,000 a year feels like a lot in future money (€96,431) because prices rise. It is still the same lifestyle."

[ADVISER] The €40,000 pa target is expressed in real terms and inflated at 3.9% pa for 23 years to 2050. Real return after retirement is negative (3.15% nominal vs 3.9% CPI), so drawdown is inflation-eroding. Thirty-year retirement horizon (50 to 80) with no guaranteed income layer. Longevity beyond 80 is not covered.

### Goals summary table (print-friendly)

| Goal | When | Today's money | Future money | Funding | Status |
|---|---|---|---|---|---|
| Grow my family | 2030 (age 30) | €15,000 | ≈ €16,800 | 100% | Fully funded |
| Retire comfortably | From 2050 (age 50) | €40,000 a year | €96,431 (2050) to €303,867 (2080) a year | 9% | Needs a plan |

---

## 5. Roadmap by decade

**Section title:** Your life, decade by decade (C2)

**How to read this:** Teal decades: your pay covers life. Gold years: you live off savings. Coral years: a shortfall, meaning spending your income and savings do not cover.

**Decade summaries (each ≤ 20 words):**

| Decade | Ages | Headline | Detail |
|---|---|---|---|
| 20s | 27 to 29 | Pay covers life | Your pay covers your costs and you build savings. |
| 30s | 30 to 39 | Pay covers life | Includes your family goal, fully funded. |
| 40s | 40 to 49 | Pay covers life | Savings pot peaks at about €493,000 at 49. |
| 50s | 50 to 59 | Savings, then a gap | Savings pay the bills to 53. Short by about €107,179 a year in 6 of 10 years. |
| 60s | 60 to 69 | Gap every year | Short by about €168,951 a year in 10 of 10 years. |
| 70s | 70 to 79 | Gap every year | Short by about €247,695 a year in 10 of 10 years. |
| 80 | 80 | Gap in the final year | Short by about €299,917. |

Note: These gaps are in future money, and they grow because prices rise.

Caption (under C2): "The road is smooth until you retire at 50, then turns around 54 when savings run out."

---

## 6. Cashflow

### 6.1 How to read this chart (explainer box, above C3)

**Title:** How to read this chart

1. **Each bar is one year of your life**, from age 27 on the left to age 80 on the right.
2. **Teal means your pay covers that year.** (Before 50, this is your income.)
3. **Gold means your savings cover it.** You are spending your pot.
4. **Coral means a shortfall.** Spending that income and savings cannot cover.
5. **The dashed line is your pay.** It stops when you retire at 50.
6. **Amounts are in future money** (prices rise 3.9% a year), so bars climb even though your lifestyle stays the same.

Tip: "Look for where gold turns coral. That is the year savings run out."

Reading order for charts C3 and C4: C4 (savings pot) first for the story, C3 (bars) for the detail.

### 6.2 The story: why savings run out at 54

**Heading:** Why your savings run out at 54

**Body (reading age 12):**

You have a good income, and until 50 it covers your life. You save a little each month, and your pot grows to roughly **€493,000** by age 49.

Then you retire at 50. Three things happen together.

**1. You need money for a very long time.** From 50 to 80 is 30 years. For comparison, you work and save for only about 23 years before that.

**2. Prices climb.** Your target is €40,000 a year in today's money. With prices rising 3.9% a year, that costs **€96,431** in 2050 and **€303,867** by 2080. Your spending grows each year.

**3. Nothing else is paying in yet.** The plan has no pension savings and counts the State Pension as €0 because you were not sure about it. So savings must pay for everything.

Add it up. Your €493,000 pays out about €96,000, €100,000, €104,000, €108,000, then the last €100,000 in 2054. From 54, there is nothing left for 27 years.

Over those 27 years, the shortfall adds up to about **€5.1 million in future money**. That is about **€1.1 million in today's money**, which is 27 years × €40,000. [derived] Big, yes, but this is mostly the effect of retiring 30 years early, with no pension to back it up.

**The kind part:** none of this is fixed. You are 27, so changes made now work for you for decades. See "Four ways to close the gap" next.

[ADVISER] Shortfall €5,109,455 nominal (sum of 2054 €11,923 through 2080 €299,917). Pre-retirement savings capacity appears to be c. €12,163 in year 1 growing to €492,908 by 2049 on a ~€1,000 pm contribution assumption at 4.5% nominal while working. Nominal 2080 spending €303,867 = 7.6× the real €40,000 base. Real return on drawdown pot approx. -0.7% (3.15% vs 3.9%). No pension wrapper, no ARF/PRSA modelled; tax on drawdown not shown. Years 50-53 are funded entirely from taxable savings (DIRT 33% / exit tax 38% as applicable; net-of-tax return 2.6% cash, 4.5% investments per assumptions). Pre-50 "needs" show €0 because monthly living costs not provided; savings capacity is set by the 50% rule rather than actual expenditure.

### 6.3 Chart captions (one line each)

| Chart | Caption |
|---|---|
| **C3** Where each year's money comes from | "Your pay covers you until 50. Savings carry you to 53. From 54, the coral bars are the shortfall." |
| **C4** Your savings pot through life | "Your pot builds to about €493,000 at 49, then falls to zero in 2054." |
| Cashflow table (appendix) | "Year-by-year numbers behind the charts. All amounts are in future money." |
| C3 marker "Family" | "Family goal, 2030." |
| C3 marker "Retire" | "You retire, age 50." |
| C3 marker "SP" | "State Pension starts at 66 (currently €0 in this plan)." |

### 6.4 Savings-pot milestones (small table for C4)

| Age | Year | Savings pot (future money) |
|---|---|---|
| 27 | 2027 | €12,163 |
| 30 | 2030 | €35,645 (after family goal) |
| 40 | 2040 | €223,968 |
| 49 | 2049 | €492,908 (peak) |
| 50 | 2050 | €402,979 (after year's spending) |
| 53 | 2053 | €100,455 |
| 54 | 2054 | €0 |

### 6.5 Year-by-year table (appendix wording)

Column headers: **Age (year) · Pay · Spending needed · From savings · Shortfall · Savings left.** Intro: "All amounts are in future money. A dash means no shortfall."

---

## 7. Gap analysis and levers

**Section title:** Four ways to close the gap (C5)

**Intro:** The 9% result comes from three things: retiring at 50, having no pension yet, and counting the State Pension as €0. Each can be changed. Here are the levers, one at a time. They also work together.

> **Important:** every lever is a trade-off. We show the benefit and the cost. Numbers marked * are estimates for illustration and need confirming before we rely on them.

### How it works (explainer line)
Move one lever at a time and see "Retire comfortably" coverage change. Today it is **9%**.

### Lever 1: Save more

- **What:** Put more away each month.
- **Result we have:** Saving **€850 more a month** moves coverage from **9% to 23%**. [from report]
- **What it costs you:** €10,200 a year less to spend today. [derived: €850 × 12]
- **Plain take:** It helps, but on its own it is not enough at age 50. The money has too little time to grow.
- **Caption:** "Saving €850 more a month takes you from 9% to 23%."

### Lever 2: Retire later

- **What:** Choose a later retirement age.
- **How it helps:** Every year you wait adds a year of saving and removes a year of spending. Retiring at 60 means funding 20 years (60 to 80), not 30. [derived]
- **Result:** Coverage at age 55: [illustrative – to confirm]. At 60: [illustrative – to confirm]. At 65: [illustrative – to confirm].
- **What it costs you:** Fewer years of free time, and your health may not stay the same.
- **Plain take:** This is usually the strongest single lever. Each extra working year helps twice.
- **Caption:** "Each year you work longer adds saving and shortens the gap."

### Lever 3: Spend less in retirement

- **What:** Aim for a lower yearly budget than €40,000 in today's money.
- **How it helps:** A smaller budget needs a smaller pot. €30,000 instead of €40,000 is 25% less to fund. [derived]
- **Result:** Coverage at €30,000 a year: [illustrative – to confirm]. At €35,000: [illustrative – to confirm].
- **What it costs you:** A tighter lifestyle. Check what you would actually spend. Your real living costs are missing from the plan.
- **Caption:** "A lower budget means a smaller pot to build."

### Lever 4: Pension and tax relief

- **What:** Save into a pension. The Government adds tax relief on contributions.
- **How it helps (plain):** Money you pay into a pension comes off your taxable pay. At your income, a lot of your pay is taxed at 40% (income above €44,000), so part of each euro you pay in would otherwise go to tax. A €100 pension payment can cost you roughly €60 in take-home pay. [derived: relief at 40% on slice above €44,000; excludes USC/PRSI, which have no relief; confirm with engine]
- **How much can I pay in with tax relief?** The limit depends on age: 15% of pay up to 29, 20% from 30, 25% from 40, 30% from 50, 35% from 55, 40% from 60 (pay counted up to €115,000). At 27 and €79,000, that is up to about **€11,850 a year (€988 a month)**. [derived: 15% × €79,000]
- **Workplace match:** If you join a workplace scheme, your employer may add money too. Under My Future Fund the rates are 1.5% from you, 1.5% from your employer and 0.5% from the State, on pay up to €80,000. [from report]
- **Result:** Coverage with €500 a month into a pension: [illustrative – to confirm].
- **Things to know:** Pension money is locked until 60 at the earliest (see Action 3 and the Learn box). Pension income is taxed when you take it.
- **Caption:** "Pension tax relief means the Government helps pay for your savings."

[ADVISER] Relief at marginal rate (20/40%); age-related percentage limits on net relevant earnings, earnings cap €115,000. Employee-only illustration; employer contributions on top and outside the age limit via employer's scheme. Retirement before 60 would require an occupational scheme with early-retirement provisions; PRSA/personal pension access generally from 60 (50 for certain PRSAs/occupational schemes where the scheme allows). Lump sum: first €200,000 tax-free, next €300,000 at 20%; SFT €2.2m (2026) rising to €2.8m by 2029. Retiring at 50 therefore likely needs a bridge from non-pension savings for ~10 years, which the current model does not distinguish. Verify before recommending.

### Lever 5: Check your State Pension

- **What:** The State Pension is a weekly payment from 66, paid by the State if you have enough PRSI contributions.
- **How much:** Full rate is **€299.30 a week**, about **€15,560 a year** in today's money. [derived] That alone is about **39%** of your €40,000 target. [derived: €15,564 ÷ €40,000]
- **Right now:** The plan uses **€0** because you answered "Not sure".
- **How to check:** Ask the Department of Social Protection for a PRSI contribution statement. It is free and takes about 10 minutes (see Action 4).
- **Result:** Coverage with a full State Pension: [illustrative – to confirm].
- **Plain take:** This is the lowest-effort lever. It also does not help until 66, so you still need money for 50 to 65.
- **Caption:** "A full State Pension could cover about two-fifths of your target, from age 66."

### Levers comparison table (C5 data)

| Lever | What you change | Coverage after (from 9%) | Main trade-off |
|---|---|---|---|
| Save more | +€850 per month | **23%** | Less to spend today |
| Retire later | Age 50 to [X] | [illustrative – to confirm] | Fewer free years |
| Spend less | €40,000 to [X] a year | [illustrative – to confirm] | Tighter lifestyle |
| Pension and tax relief | €[X] a month into a pension | [illustrative – to confirm] | Locked until 60 |
| State Pension | Confirm entitlement (full rate €299.30 a week) | [illustrative – to confirm] | None, but starts at 66 |
| **Combined** | e.g. retire at 60 + pension + State Pension | [illustrative – to confirm] | A bigger change, a bigger result |

Caption (C5): "No single change does it alone. Two or three together could."

**Honest summary line (under table):** "No single lever gets Retire comfortably to 100% by itself at age 50. The usual route is a pension, a few more working years and a confirmed State Pension, together."
(Planner to confirm against modelled figures before print.)

---

## 8. Action plan

**Section title:** Your action plan: where to start

**Intro:** Seven steps, in order. The first three are the highest-value. Each has a why, how much and by when.

| # | Action | Why | How much | By when |
|---|---|---|---|---|
| 1 | **Ask your employer about a workplace pension and a match** | Employer money is a pay rise you cannot get any other way. | Costs about 15 minutes. Value: employer contribution on top of yours (My Future Fund: 1.5% each, plus 0.5% from the State). | Within **2 weeks** |
| 2 | **Fill in your monthly living costs and the other missing items** | Right now we assume how much you can save. Real numbers make the plan trustworthy. | About **20 minutes** with your bank statements. | Within **1 month** |
| 3 | **Start a pension with tax relief** | It is the strongest tool for retiring early, and at your pay a lot of each euro would go to tax. | Start with an amount you can keep up, for example [illustrative – to confirm] a month. Maximum with relief at your age: about €988 a month. | Within **3 months** |
| 4 | **Check your State Pension** (PRSI contribution record) | It could pay about €15,560 a year from 66. The plan uses €0. | Free. About **10 minutes** online. | Within **1 month** |
| 5 | **Add income protection** | At 27, your pay is your biggest asset, and you currently have none of this cover. If you could not work, your plan would stop. | Ask for quotes. Price depends on job and age. [illustrative – to confirm] | Within **3 months** |
| 6 | **Build your emergency fund to 6 months of essential costs** | Stops a surprise bill from forcing you to dip into long-term savings or borrow. | 6 × your essential monthly costs. You said you hold "3 to 6 months", so top up and confirm the figure. | Within **6 months** |
| 7 | **Decide your retirement age with the levers in mind and book an adviser review** | A 50 target at €40,000 a year is very ambitious. A conversation with a qualified adviser could shape a realistic path. | One meeting. Bring this report and your questions (page 12). | Within **6 months**, then review once a year |

Closing line: "You do not need to do everything at once. Do one this week."

[ADVISER] Action order reflects: (1) marginal value of free employer contribution; (2) data quality; (3) tax-efficient accumulation; (4) removing the largest modelling uncertainty (State Pension €0 vs up to €15,564 real); (5) protection gap for a 27-year-old planning dependants (income protection nil, serious illness nil, no cover via work); (6) liquidity; (7) suitability and retirement-age feasibility. Items 3 and 5 involve regulated product advice and need a suitably authorised adviser.

---

## 9. Protection and foundations

### 9.1 Your five money foundations (C6)

**Intro:** Good planning builds from the bottom up, like a house. This shows where you are on each floor.

| Step | Foundation | Status | In plain words |
|---|---|---|---|
| 1 | **Spend less than you earn** | **Not started** | We cannot check this yet. Add your income and spending. |
| 2 | **Emergency fund** | **In progress** | You hold 3 to 6 months of savings. Aim for 6 months of essentials. |
| 3 | **Clear costly debt and protect your family** | **In progress** | You have life and health cover. Income protection is missing. |
| 4 | **Goals and retirement** | **In progress** | 1 of 2 goals fully funded. No pension saving yet. |
| 5 | **Grow wealth and leave a legacy** | **Not started** | This comes after the steps above. No rush. |

**Next best step:** Give yourself more room each month. Add your income and spending so we can check step 1.

Caption (C6): "Three floors have started. Floor 1 is the key to moving the rest."

### 9.2 Protection check

**Title:** Protection: what covers you if life goes off-plan

| Cover | Do you have it? | What it does (plain) | Our comment |
|---|---|---|---|
| Life cover | **Yes** | Pays your family if you die. | Check the amount fits a growing family. |
| Income protection | **No** | Replaces part of your pay if illness stops you working long-term. | **The biggest gap** for a 27-year-old whose plan relies on pay. |
| Serious illness cover | **No** | Pays a lump sum if you are diagnosed with a listed illness. | Worth pricing, especially with a family planned. |
| Cover through work | **No** | Benefits from your employer, such as sick pay or death in service. | Ask HR what you get, even if you think "none". |
| Health insurance | **Yes** | Helps pay private medical bills. | Good. Check renewal costs. |

**Commentary:** You have taken some good steps. The main gap is income protection. Your pay builds your whole plan, so protecting it protects everything. Cover is not cheap and not always needed, so talk it through with an adviser.

[ADVISER] Income protection typically replaces up to 75% of gross pay less State Illness Benefit (€254 a week); consider deferred period vs employer sick-pay policy. Life cover quantum is not given: needs analysis once dependants exist (goal 1 in 2030). Cover through work "No" and State Illness Benefit rely on PRSI record, which also affects State Pension. Emergency fund assumption in model: 6 months of essential spending; client reports 3 to 6 months.

---

## 10. Money personality and risk

**Section title:** Your money personality

**Your type: Explorer.**
Curious, open to new ideas, comfortable with risk.

| Trait | What it means | What it could mean for your plan |
|---|---|---|
| **Money mindset: The Opportunist** | You spot and try new chances quickly. | Good for growth. Also lures into things that look exciting. Slow down before you buy anything you do not understand. |
| **Money mindset: Money avoidance** | You would rather not look at money. | This may be why nine things are missing. Small steps, one at a time, work best. The action plan is built for this. |
| **Investor behaviour: Loss aversion** | Losses feel bigger than gains. | You might feel a fall in markets more than most. Know in advance what you will do when it happens. |
| **Investor behaviour: Long-term investor** | You ride out the dips. | Helpful. Selling in a fall is one of the costliest mistakes. |
| **Capacity for loss: Emergency fund + High capacity** | You can afford some ups and downs. | You have a buffer and a large amount to invest each month. Capacity is about what you can afford. It is not the same as how you feel (see Learn). |

**Our reading:** You are open to risk, yet dislike losses and avoid looking at money. These pull in different directions. A written plan and an automatic monthly payment can help you stay steady.

**Risk profile not finished.** Finish **Understand me** (about 5 minutes) to get an indicative risk profile. Until then, we cannot say how your money should be invested. The plan assumes investments grow 4.5% a year while you work, which suits a fairly growth-focused mix. Check this suits you.

[ADVISER] Behavioural flags: loss aversion alongside self-reported risk comfort (possible inconsistency, to be explored in a risk-tolerance questionnaire); money avoidance consistent with sparse fact-find. Capacity for loss rated high (young, employed, no dependants yet, no debts reported) but liquidity and protection gaps; capacity should be reassessed when dependants arrive (2030). ATR/CFL not formally assessed; no suitability can be established from this report.

---

## 11. Questions to ask an adviser (pre-filled)

**Intro:** These are drawn from your plan. Add your own or delete any.

1. **Is retiring at 50 realistic for me?** If not, what age gets me closest to €40,000 a year (today's money)?
2. **How much should I pay into a pension each month, and where?** Workplace scheme, PRSA, or both? What do the charges look like?
3. **How do I bridge the years from 50 to 60** when pension money is locked? Do I need savings outside a pension?
4. **How much will my State Pension be, and when?** Can I top up missing contributions?
5. **What income protection and serious illness cover do I need,** and what does it cost compared with my risk?
6. **How should my money be invested for each goal,** given I dislike losses but can take risk? What mix suits a family goal in 2030 versus retirement in 2050?
7. **How much life cover do I need** once I have a child, and for how long?
8. **How should I use my emergency fund and my goal money,** and where should they sit (cash, deposit, bond) for tax reasons (DIRT 33%, exit tax 38%)?

Note under list: "Bring this report, your payslip and your latest pension statement (if any)."

Empty-state if client deletes all: see 0.4.

---

## 12. Learn boxes (each at most 60 words)

**L1. Today's money vs future money (real vs nominal).**
€100 buys less each year because prices rise. "Today's money" shows what things cost now. "Future money" shows the actual price on the day. We show both so you can judge the size of a number. A €40,000 lifestyle today is about €96,000 in 2050. *(54 words)*

**L2. Inflation.**
Inflation is how fast prices rise. Ireland is at 3.9% now. The European Central Bank aims for 2% over time. At 3.9%, prices roughly double in 18 years. Savings that grow slower than prices buy less each year, even as the balance rises. *(46 words)* [derived: 1.039^18 ≈ 2.0]

**L3. Compound growth.**
Growth earns growth. Each year's gain is added to your pot, then that bigger pot grows. Time does most of the work. €100 a month from 27 could be worth much more than the same from 47, even if you pay in less in total. Results are not guaranteed. *(52 words)*

**L4. Pension tax relief.**
When you pay into a pension, tax relief means money that would have gone to tax goes into your pension instead. At 40% tax rate, a €100 payment can cost you about €60 in take-home pay. There is an age-based limit on how much qualifies. Pension income is taxed when you take it. *(54 words)*

**L5. Sequence risk.**
The order of returns matters when you spend from savings. A bad market in your first years of retirement hurts far more than the same fall later, because you are selling when prices are low. That is why people near retirement often move some money into safer places. *(48 words)*

**L6. Emergency fund.**
An emergency fund is cash for surprises: a job loss, a car repair, a broken boiler. A common goal is 3 to 6 months of essential costs. It lets you avoid borrowing or selling investments at a bad time. Keep it in an easy-access account. *(45 words)*

**L7. Capacity vs tolerance for loss.**
Tolerance is how you feel about losing money. Capacity is whether you could afford the loss. They can differ. You could be calm about risk but have little to spare. Or you could be nervous but have plenty. Good advice looks at both and picks the lower. *(48 words)*

**L8. State Pension (Ireland).**
The State Pension (Contributory) is paid from 66 if you have enough PRSI contributions. The full rate in 2026 is €299.30 a week (about €15,560 a year). It rises when the Government decides. It is taxable but has no USC. Check your record at gov.ie. *(47 words)*

**L9. Why retiring early costs so much.**
Retiring early means two things at once: fewer years to save and more years to pay for. Retire at 50 and you fund about 30 years of spending. Retire at 60 and it is 20. Pensions also cannot normally be touched before 60, so early retirement needs money outside a pension. *(51 words)*

**L10. Net vs gross pay.**
Gross pay is before tax. Net pay is what lands in your account after income tax, USC and PRSI. Your gross pay is €79,000. Your estimated net pay in 2027 is €54,383. Plans must use net pay, because only that can be spent or saved. *(43 words)*

**L11 (spare). What does "9% covered" mean?**
It is the share of your goal that your savings and income pay for in this plan. 9% does not mean you will get 9% of what you want. It means about 9% of the spending is funded. It is a measure to improve, not a score. *(43 words)*

---

## 13. Glossary (15 terms)

| Term | Plain-English meaning |
|---|---|
| **ARF (Approved Retirement Fund)** | An account where your pension money stays invested after you retire, and you draw an income from it. |
| **Capacity for loss** | How much money you could lose without your life or goals being seriously harmed. |
| **Compound growth** | Growth on your earlier growth, so money builds faster over time. |
| **DIRT** | Deposit Interest Retention Tax. A 33% tax taken from interest on cash savings. |
| **Drawdown** | Taking money out of savings or a pension to live on. |
| **Exit tax** | A 38% tax on gains from certain investment funds, taken when you sell or every eight years. |
| **Future money (nominal)** | An amount in the euros of that future year, with price rises included. |
| **Inflation** | The rate at which prices rise, so each euro buys less. |
| **My Future Fund** | Ireland's automatic workplace pension. Pay in, employer and State top up. |
| **Pension tax relief** | Tax savings given when you pay into a pension, up to age-based limits. |
| **PRSA** | Personal Retirement Savings Account. A pension you can hold yourself or through work. |
| **PRSI** | Pay Related Social Insurance. Contributions that build your right to the State Pension and some benefits. |
| **Sequence risk** | The risk that poor returns early in retirement damage your savings the most. |
| **Shortfall** | Spending that your income and savings cannot cover in a given year. |
| **Today's money (real)** | An amount shown at today's prices, so you can compare it with what things cost now. |

Optional extras if space: **SFT** (Standard Fund Threshold: €2.2 million in 2026, the pension size above which extra tax applies), **USC** (Universal Social Charge: an income tax on gross pay), **Emergency fund**, **Income protection**.

---

## 14. Assumptions

### 14.1 What your plan assumes (readable table)

**Intro:** Every plan rests on assumptions. These are the ones behind yours. "Your choice" means you set it. "Set by Government" means it comes from Irish rules. "How the plan works" means LifeMap decided it.

| Topic | What we assumed | Source | In plain words |
|---|---|---|---|
| Rules and tax year | Irish rules for 2026, checked 2 October 2026 | Government | Based on today's tax law. Budget 2027 changes (announced 6 October 2026) are not in yet. |
| Income tax | 20% up to €44,000 (single), 40% above. Personal tax credit €2,000, employee credit €2,000 | Government | Your pay above €44,000 is taxed at the higher rate. |
| USC | 0.5% / 2% / 3% / 8% in bands; none if income is €13,000 or less | Government | A tax on gross income. |
| PRSI | 4.2% now, rising to 4.35% (Oct 2026), 4.5% (Oct 2027), 4.7% (Oct 2028). None from 66 | Government | Pays for State Pension and benefits. |
| Pension tax relief | 15% to 40% of pay by age, on pay up to €115,000 | Government | How much you can pay into a pension with tax relief. |
| Pension lump sum | Up to 25%: first €200,000 tax-free, next €300,000 at 20% | Government | Cash you can take at retirement. |
| Pension size cap (SFT) | €2.2 million in 2026, rising to €2.8 million by 2029. 40% tax above | Government | Not relevant at your current level. |
| State Pension | Full rate €299.30 a week from 66. Plan uses **€0** | Your figure | You answered "not sure". We used €0 to be cautious. |
| Inflation | 3.9% a year | Your choice (ECB target 2%; CSO flash Sep 2026: 3.9%) | Prices rise, so costs grow. High versus the long-run target. |
| Pay rises | 3% a year | Your choice | Your income grows. |
| Cash savings growth | 1% a year (after DIRT) | Your choice | Cash grows slowly. |
| Investments outside a pension | 2.6% a year (after charges and exit tax) | Your choice | Used for money held in funds. |
| Pensions while you work | 4.5% a year (after charges) | Your choice | Growth in the working years. |
| Pensions once retired | 3.15% a year (after charges) | Your choice | Lower, because retirees invest more cautiously. |
| Retirement age | 50 | Your choice | |
| Plan runs | 2027 to 2080 (age 27 to 80) | Your choice | We stop at 80. You may live longer. |
| What you save | About €1,000 a month towards goals, at most 50% of your spare money | Your answer (over €750) | We assume you save about €1,000 a month. |
| Spare money not saved | Assumed spent | How the plan works | |
| Emergency fund | 6 months of essential spending kept aside | Your choice | |
| Money needed within 5 years | Kept in cash | Your choice | |
| Savings invested | 40% invested, the rest in cash | Your choice | |
| Pension at retirement | 25% as lump sum | Your choice | |
| Pension drawdown | Spread to the end of plan, at least the legal minimum | Your choice | |
| Pension saved so far | None | Your answer | Missing; may raise results if you have one. |
| My Future Fund | Not auto-enrolled | Your answer | Employer match is not counted. |
| Goal order | Emergency fund first, then must-haves, then nice-to-haves, soonest first | How the plan works | |
| Couples | Taxed as individuals | Government | Not used for you. |
| Tax bands and State Pension in future | Rise with prices | Your choice | |

### 14.2 What this plan does not include (known limits, plain English)

- **Your living costs stay the same** through the plan. In real life, costs change.
- **Your partner's** pay and pension are not modelled.
- **Drawdown** is assumed from an ARF or vested PRSA.
- **The reduced USC rate** for medical-card holders under 70 is not applied.
- **Auto-enrolment rates after 2028** are held at 2026 rates.
- **Budget 2027** changes (announced 6 October 2026) are not included. We will update LifeMap once they are final.
- **Not modelled either:** children's ongoing costs, house purchase, health or care costs, inheritance, long-term care. [illustrative – to confirm against product scope]

### 14.3 What could change this result

| If this happens | Effect on your retirement goal |
|---|---|
| You start a pension and get tax relief or an employer match | Likely better, often by a lot |
| Your State Pension is confirmed as full rate | Better from age 66 |
| Prices rise faster than 3.9% | Worse. Costs grow faster than savings |
| Prices rise slower (nearer 2%) | Better. Costs grow slowly |
| Investments return less than 4.5% while you work | Worse |
| Your pay rises faster than 3% | Better, if you also save more |
| You retire later than 50 | Better, usually the biggest effect |
| Real living costs are higher than expected | Worse |
| You pause saving (family, job change, illness) | Worse |
| Tax rules or pension limits change | Could go either way |
| You live beyond 80 | Worse. The plan stops at 80 |

**Closing line:** "Small changes in assumptions can change the answer a lot over 50 years. That is why we update your plan as things change."

---

## 15. Disclosures (plain English)

**Heading:** Important information

1. **This is preliminary guidance. It is not regulated financial advice.** LifeMap helps you explore your options. It does not tell you what to buy or sell. Only an authorised adviser can give you advice that fits your full situation.
2. **Estimates, not promises.** All figures are projections based on the assumptions on page 14. Real results will differ. Investments can fall as well as rise, and you may get back less than you put in.
3. **Built on what you told us.** If any answer is wrong or missing, results may be wrong. Nine areas are missing now.
4. **Irish tax rules, 2026 (checked 2 October 2026).** Tax rules and limits change. Budget 2027 changes are not included. We will update LifeMap when they are final.
5. **Past performance is not a guide to the future.**
6. **No product recommendation.** Any mention of pensions, protection or investments is for education. It is not a recommendation to buy a particular product.
7. **Not a risk assessment.** Your money personality is a conversation starter. It is not a formal suitability or risk assessment.
8. **Your data.** [Privacy line to be supplied by LifeMap legal. [illustrative – to confirm]]
9. **Version.** Plan version 5, created 29 September 2026. Plans are not updated automatically. Re-check at least once a year or after a big life change.

**Footer (every page):** Preliminary guidance, not regulated financial advice. Illustrative, not guaranteed. · Page X of Y

---

## 16. Build notes for the layout and QA team

1. **Page 2 must stand alone.** Headline, three messages, four stats, one next step. Nothing else.
2. **Consistency checks:** every "9%" must carry "Needs a plan"; every "100%" must carry "Fully funded". Use the 5-level scale only.
3. **Future-money tags:** wherever a figure above €10,000 appears in future money, label it "(future money)". Where it is in today's money, label it "(today's money)".
4. **Figures needing confirmation before print** (all marked [illustrative – to confirm]): lever outcomes (retire later, spend less, pension, State Pension, combined); plan confidence level; suggested pension amount in Action 3; income-protection price; privacy line; the list of unmodelled items. The planner's blueprint (01-planner-blueprint.md) was not present when this copy was written; align numbers to it when available.
5. **Derived figures to double-check with the engine:** €16,824 (family goal future money); €1.1 million (27 × €40,000, real shortfall); €15,564 (full State Pension per year) and 39% of target; €988 a month (15% × €79,000 ÷ 12); "about €60 take-home per €100 pension" (40% relief on slice above €44,000).
6. **Assumptions:** the brief calls 4.5% 'investments while working'; the PDF labels it 'pensions grow while you work (after charges)'. Copy follows the PDF. Confirm with engineering.
7. **Learn boxes** are word-counted at 60 words or fewer (L1 to L11). L11 is a spare.
8. **Reading level check:** body copy targets grade 6 to 7. Adviser call-outs are intentionally technical and collapsible.
