# LifeGoals: Irish rules and rates audit (independent QFA/CFP review)

**Date:** 2 October 2026 · **Reviewer:** independent QFA / CFP auditor (Ireland) · **For:** Pooja Tirupati, proposition owner
**Scope (read-only):** `LifeGoals-Customer-Journey-Prototype.html` (plan engine lines 646–836, CALCS lines 1383–1537, foundations lines 1732–1782, all copy) · `deliverables/LifeGoals-Calculators.xlsx` (Assumptions sheet and every constant in C01–C28) · the earlier reviews `docs/fp-review-round1.md` and `deliverables/independent-accuracy-audit.md`, re-checked rather than trusted.

**How sources were checked.** From this environment revenue.ie, gov.ie, cso.ie, citizensinformation.ie, centralbank.ie and Wikipedia are **blocked for direct fetching**. Every value below was confirmed through web-search results that quote the primary page (Revenue, DSP, CSO, CBI) or a reputable secondary source (Big-4 / broker Budget summaries, Law Society, Irish Times, RTÉ). The "Src" column says which:
- **P** means the primary page was quoted in the search result.
- **S** means a secondary source only.

**Before release, someone must open the primary page for every row tagged P or S and record the date checked.** This is the "verify" step. None of the values conflict across sources.

**Tests run** (scratch: `/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/rules/`):
- `test.js` takes the engine's own `TX`, `incomeTax`, `usc`, `prsi`, `netPay`, `netRet`, `relLim`, `pensionCost` and `jointGain` functions straight from the HTML. It runs them against an independent Revenue-style calculation.
- `test2.js` sizes each error.

---

## 1. Summary

| Verdict | Count | Meaning |
|---|---|---|
| **Wrong** | **33** | A wrong value, a wrong formula, a rule that is missing but changes results, or customer copy that is wrong. |
| **Outdated** | **5** | It was right when written, but a newer official figure or a legislated future change now applies. |
| **Correct** | **43** | Matches Irish law or official rates at 2 Oct 2026 (subject to the source verification above). |
| **Make it a customer choice** | **27** | A judgement or assumption. It must be a visible, editable input with a suggested value and guidance. 5 of these are register rows (#30, #44, #55, #85, #86); all 27 are listed as inputs B1–B27 in Section 3. |
| **Total** | **86 register rows + 22 further (B) inputs** | Register: 33 W · 5 O · 43 C · 5 CC. |

**Headline.** The 2026 statutory core is right for a single PAYE employee. Take-home pay matches a Revenue-style calculation to the cent at €25k, €45k, €80k and €150k, single and married one-earner (Section 4). The tested core covers:
- income-tax bands and credits;
- USC bands and the exemption limit;
- PRSI at 4.35% with the PRSI credit;
- pension-relief age bands and the €115k cap;
- the State Pension rate and age;
- the ARF 4% and 5% minimums;
- DIRT, exit tax and CGT;
- the CBI LTI and LTV limits;
- stamp duty.

The errors are in how the rules are combined, and in rules that are missing:
- **married pension relief**;
- **State Pension and PRSI at 66+ while still working**;
- **the €200k–€500k lump-sum band**;
- **PRSI on ARF income before 66**;
- **untaxed other and rental income**;
- **no joint assessment in retirement**;
- **missing credits**: Rent Tax Credit, Single Person Child Carer Credit and Home Carer Credit;
- **no auto-enrolment**.

The HTML calculators are also behind the corrected workbook (C12 nominal vs real, APR ÷ 12, no Illness Benefit, no survivor's pension). Several judgement values are hidden or inconsistent: emergency months are 6, 4 and 3 in three places; the employee share of pension contributions is a hidden 50%; and the "Cautious" set has *faster* pay growth than "Standard".

**Budget 2027 has not been announced.** It is due on **Tuesday 6 October 2026** (Summer Economic Statement, 22 July 2026). See Section 5.

---

## 2. Rules & rates register

Verdicts: **W** = Wrong · **O** = Outdated · **C** = Correct · **CC** = Make it a customer choice. "HTML" means `LifeGoals-Customer-Journey-Prototype.html` and "XLSX" means `deliverables/LifeGoals-Calculators.xlsx`.

### 2.1 Income tax (2026)

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 1 | Standard-rate band, single | HTML `TX.band`; XLSX `Pension_Tax_Band` | €44,000 | €44,000 | P · https://www.raisin.com/en-ie/taxes/income-tax-rates/ · https://universityofgalway.ie/media/pensionsandinvestments/Budget-Summary-2026.pdf | 1 Jan 2026 (unchanged in Budget 2026) | C | Update after Budget 2027 (see §5). |
| 2 | Band, married one earner | HTML `jointGain` | €53,000 | €53,000 | P · as #1 | 1 Jan 2026 | C | — |
| 3 | Band, married two earners | HTML `jointGain` | €53,000 + lower income up to €35,000 (max €88,000) | Same | P · as #1 | 1 Jan 2026 | C | — |
| 4 | Band for a single parent (€48,000) and Single Person Child Carer Credit €1,900 | Not modelled (HTML `incomeTax`) | single band €44,000, no SPCCC | €48,000 band + €1,900 credit for a qualifying single parent | S · https://www.noonecasey.ie/irish-budget-2026/ · https://www.irishtaxhub.ie/blog/tax-credits-in-ireland-full-list | 1 Jan 2026 | W | A lone parent on €50k is under-stated by €2,700 a year (€1,900 + 20% × €4,000). Add an About-you question "Are you the main carer of a child, with no partner?" (shown when `deps > 0 && !partner`). Then `band = 48000; credits = 4000 + 1900`. |
| 5 | Rates 20% / 40% | HTML `incomeTax`, `jointGain` | 20% / 40% | 20% / 40% | P · as #1 | 2026 | C | — |
| 6 | Personal credit | HTML `TX.credits`, `jointGain` | €2,000 single, €4,000 married | €2,000 single, €4,000 married or civil partners | P · as #1 | 2026 | C | — |
| 7 | Employee (PAYE) credit / Earned Income Credit | HTML `TX.credits` | €2,000 each | €2,000 each (EIC €2,000 for the self-employed) | P · https://revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/income-and-employment/employee-tax-credit/index.aspx | 2026 | C | The credit is capped at 20% of PAYE income. The effect is immaterial above €10k. |
| 8 | Rent Tax Credit | Not modelled | none | €1,000 single, €2,000 jointly assessed; extended to end-2028 | S · https://www.noonecasey.ie/irish-budget-2026/ | 2025–2028 | W | Renters' take-home is under-stated by up to €1,000 (€2,000 for couples) a year to 2028. When `home === 'Rent'`, ask "Do you pay rent on your home, not to a relative?" If yes, `credits += married ? 2000 : 1000` for plan years up to 2028. |
| 9 | Home Carer Tax Credit | Not modelled | none | €1,950 (verify the 2026 rate and the €7,200 carer-income limit with its taper) | S · as #8 | 2026 | W | Make it an optional question for a one-earner married couple caring for a dependant. Add `+1950` to the credits when it applies. |
| 10 | Age tax credit | HTML `TX.ageCredit`, `netRet` | €245 from 65 | €245 single, €490 married | S · https://www.irishtaxhub.ie/blog/retirees-pensioners-what-budget-2026-might-mean-for-you | 2026 | C | The single rate is right. For couples see #61. |
| 11 | Age exemption limit | HTML `TX.ageExempt` | €18,000 (65+), no marginal relief | €18,000 single, €36,000 married; marginal relief at 40% of the excess | S · as #10 | 2026 | C | Immaterial for a single person with the €2,000 PAYE credit, because credits of €4,245 cover tax up to €21,225. It only matters for couples (#61). |
| 12 | Married couple in retirement: joint band, €4,000 + age credits €490 + PAYE credits | HTML `project()` retired branch: `jointGain` is only applied `if (working)` | Retired couple taxed as single people | Joint assessment continues in retirement | P · as #1 | 2026 | W | Apply joint assessment in retirement as well. See #61 for the code. |
| 13 | Tax-rate pre-fill for pension relief (20% or 40%) | HTML `calcPre` contrib/avc (`F.income > TX.band ? 40 : 20`); XLSX C13 and C14 "40% if income > €44,000" | €44,000 for everyone | Depends on status: €44k single, €48k single parent, €53k married one earner, €53k + min(lower, €35k) for two earners on combined income | P · as #1 | 2026 | W | JS: `const band = F.married ? 53000 + Math.min(F.pIncome, 35000) : spccc ? 48000 : 44000; p.tr = (F.married ? F.income + F.pIncome : F.income) > band ? 40 : 20;` Excel: `=IF(Status="Married",IF(Income+Partner_Income>53000+MIN(Partner_Income,35000),0.4,0.2),IF(Income>IF(Single_Parent="Yes",48000,44000),0.4,0.2))` |

### 2.2 USC

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 14 | USC bands and rates | HTML `TX.usc` | 0.5% to €12,012 · 2% to €28,700 · 3% to €70,044 · 8% above | Same (Budget 2026 raised the 2% band ceiling by €1,318 to €28,700) | P · as #1 | 1 Jan 2026 | C | Budget 2027 is expected to raise €28,700 again, in line with the minimum wage. |
| 15 | USC exemption limit | HTML `TX.uscExempt` | €13,000 (total income) | €13,000 | P · as #1 | 2026 | C | — |
| 16 | Reduced USC at 70+ with income ≤ €60,000 | HTML `netRet` | 0.5% / 2% | 0.5% to €12,012, 2% above | S · as #10 | 2026 | C | The same reduced rate applies to full medical-card holders under 70 with income ≤ €60k. Not modelled. Note it in Assumptions. |
| 17 | USC surcharge on self-employed income over €100k | HTML `project()` `0.03*(gR-100000)` | +3% (11% in total) | 11% on non-PAYE income over €100,000 | P · as #1 | 2026 | C | — |
| 18 | State Pension and other DSP payments exempt from USC | HTML `netRet` (USC on `draw` only) | Exempt | Exempt | P · as #1 | 2026 | C | — |

### 2.3 PRSI

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 19 | Class A employee rate | HTML `TX.prsi` | 4.35% flat, every year | 4.2% (1 Oct 2025 to 30 Sep 2026) · **4.35% from 1 Oct 2026** · 4.5% from 1 Oct 2027 · 4.7% from 1 Oct 2028 (PRSI roadmap, Budget 2025) | P · https://www.gov.ie/en/publication/ffa563-prsi-class-a-rates · https://www.bdo.ie/en-gb/insights/2025/upcoming-prsi-rate-changes-effective-1st-october-2025 | 1 Oct 2026 | O | 4.35% is right today. Model the legislated path by plan year: `const prsiRate = y => y <= 2026 ? 0.042*0.75+0.0435*0.25 : y === 2027 ? 0.0435*0.75+0.045*0.25 : y === 2028 ? 0.045*0.75+0.047*0.25 : 0.047;` Pass `YEAR0 + t` into `prsi()`. |
| 20 | PRSI in calendar 2026 (row t = 0) | HTML `project()` year 0 | 4.35% for the whole of 2026 | Blended 4.2375% (9 months at 4.2%, 3 at 4.35%) | P · as #19 | 2026 | W | Small: about €90 a year at €80k (Section 4). Fixed by #19. |
| 21 | PRSI-free threshold and PRSI credit | HTML `TX.prsiWk`, `prsi()` | Nil ≤ €352/wk; credit €12 − (wk − 352.01)/6 up to €424 | Same | P · https://payslipiq.co.uk/ie/methodology/prsi · as #19 | 2026 | C | — |
| 22 | No PRSI from 66, while still working | HTML `project()` working branch calls `netPay(gR)` at every age | PRSI charged on pay at 66+ | No PRSI at 66+ | P · https://www.oireachtas.ie/en/debates/question/2018-11-21/241/ | Law | W | See #23. Together these over-state take-home by €3,370 a year at €60k plus the State Pension at age 67 (Section 4). |
| 23 | State Pension is taxable income when it is paid alongside a salary | HTML `project()` `if (a >= AS.spAge) inflow += AS.sp * f.sp * infl` (gross, untaxed) | Added untaxed | Taxable under income tax (PAYE credit applies), USC-exempt | P · as #7 | Law | W | Replace the working branch with: `function netWork(g, sp, a){ const it = incomeTax(g + sp, TX.credits + (a >= 65 ? TX.ageCredit : 0)); return g + sp - it - usc(g, a >= 70 && g + sp <= 60000) - (a >= 66 ? 0 : prsi(g)); }` Then `inflow += (netWork(gR, a >= AS.spAge ? AS.sp * f.sp : 0, a) - pensionCost(...)) * infl` and remove the separate SP line. |
| 24 | PRSI on ARF / vested-PRSA distributions before 66 | HTML `netRet` (no PRSI at any age) | none | Class S (or K) at the PRSI rate on distributions before 66 | S · https://www.oireachtas.ie/en/debates/question/2018-11-21/241/ · Revenue employee-credit page (search extract) | Law | W | Early retirees' income is over-stated by 4.35% of the draw (€1,305 a year on a €30k draw at 62). JS: `return g - it - usc(draw, ...) - (age < 66 ? prsiRate(yr) * draw : 0);` Occupational pensions paid as annuities carry no PRSI. Say "ARF/PRSA drawdown assumed" in Assumptions. |
| 25 | Self-employed PRSI (Class S) | HTML `prsi()` used for every work type | Class A threshold and credit | 4.35% on all income if over €5,000; minimum €650; no PRSI credit | P · https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-s-rates/ · https://beancount.io/blog/2026/07/28/ireland-self-employed-tax-2026-form-11-preliminary-tax-prsi-guide | 2026 | W | At €20k self-employed the engine charges €528 instead of €870. JS: `const prsiS = g => g > 5000 ? Math.max(650, g * rate) : 0;` Use it when `f.work === 'Self-employed'`. |

### 2.4 Pensions: relief, lump sum, SFT, ARF

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 26 | Age-related relief limits | HTML `relLim` | <30 15% · 30–39 20% · 40–49 25% · 50–54 30% · 55–59 35% · 60+ 40% | Same | S · https://www.irishtaxhub.ie/blog/pension-contributions-income-tax-maximize-your-relief · https://yourincomecalculator.com/ie/blog/pension-tax-relief-ireland-2026-higher-earners-guide | Unchanged | C | — |
| 27 | Earnings cap for relief | HTML `pensionCost` | €115,000 | €115,000 | S · as #26 | Unchanged | C | — |
| 28 | Relief on income tax only (USC and PRSI still due) | HTML `pensionCost`, `netPay` on gross | Yes | Yes | P · Revenue | Law | C | — |
| 29 | Relief for **married** contributors | HTML `pensionCost` uses the single `incomeTax` (€44k band); `jointGain` uses gross pay before contributions | Single marginal rate | Marginal rate under joint assessment, on pay after contributions | P · as #1 | Law | W | Married one earner on €50k paying €5,000: take-home over-stated by **€1,000 a year** (relief given at 40% when it should be 20%). JS: `const itJ = (x, p) => Math.max(0, 0.2*Math.min(x+p, 53000+Math.min(Math.min(x,p),35000)) + 0.4*Math.max(0, x+p-(53000+Math.min(Math.min(x,p),35000))) - (4000 + 2000*((x>0)+(p>0))));` For married households, use household tax = `itJ(gR - Er, pR)` in place of `incomeTax(gR) - relief - jointGain + incomeTax(pR)`. |
| 30 | Employee's own share of "Paid in each month (incl. employer)" | HTML `project()` `E = pensionM*12*(SE ? 1 : 0.5)` | Hidden 50% | Customer's own figure. The Journey Book (Step 4 E9) asks for "contribution rate, employer contributions" separately. | Journey Book E9 | — | CC | Split the field (see §3, row B1). |
| 31 | Retirement lump sum, tax-free part | HTML `project()` `ls = Math.min(pen*0.25, 200000)`; copy "25% … (up to €200,000)" | 25% of the pot, capped at €200k | 25% of the pot. First €200k tax-free (lifetime); **€200,001–€500,000 taxed at 20%**; above €500k at the marginal rate | S · https://wtwco.com/en-ie/insights/2024/10/significant-revisions-announced-to-the-standard-fund-threshold · https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html | Finance Act 2024 | W | On a €1m pot the engine pays €200k; the law allows €250k gross, €240k net. JS: `if (a === R && takeLS){ const ls = Math.min(pen * lsPct, 500000), lsTax = 0.2 * Math.max(0, ls - 200000); pen -= ls; free += ls - lsTax; }` Excel: `=MIN(Fund*0.25,500000)-0.2*MAX(0,MIN(Fund*0.25,500000)-200000)`. Copy: "25% of your pension, up to €200,000 tax-free and the next €300,000 taxed at 20%". The caps are not indexed, so compare them with nominal values, as the engine already does. |
| 32 | Standard Fund Threshold | Not modelled | none | €2.2m (2026) → €2.4m (2027) → €2.6m (2028) → €2.8m (2029); chargeable excess tax 40% | S · as #31 | 1 Jan 2026 | W | Low priority, but it must be correct for high earners. At vesting: `const sft = {2026:2.2e6, 2027:2.4e6, 2028:2.6e6}[yr] || 2.8e6; const cet = 0.4 * Math.max(0, potNominal - sft);` Deduct it from `pen`. |
| 33 | ARF / vested-PRSA minimum, 61–70 | HTML `project()` `a >= 61 ? 0.04` | 4% | 4% if aged 60+ for the whole tax year (so from the year you turn 61) | S · https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf | Law | C | — |
| 34 | ARF minimum, 71+ | HTML `project()` `a >= 71 ? 0.05` | 5% | 5% if aged 70+ for the whole year | S · as #33 | Law | C | — |
| 35 | ARF minimum when ARFs plus vested PRSAs exceed €2m | Not modelled | none | 6% on the whole value (aged 60+ for the whole year) | S · as #33 | Law | W | JS: `const minPct = a >= 61 ? (pen > 2e6 ? 0.06 : a >= 71 ? 0.05 : 0.04) : 0;` |
| 36 | Earliest age to take pension benefits | HTML `FF.retireAge` min 50; lump sum and draw at any `R` | From 50 | PRSA / personal pension / AE: from 60 (earlier only on ill health). Occupational: normally 60–70, from 50 if you have left that employment. | P · Revenue Pensions Manual (verify) | Law | W | If `R < 60` and the pot type is PRSA or personal, hold the lump sum and drawdown until 60 (or `R` if later), and fund the years in between from savings. Warn: "Most pensions can't be taken before 60." |
| 37 | Employer PRSA contributions above 100% of salary are BIK | Not modelled | — | BIK above 100% of salary (Finance Act 2024) | S · https://pwc.ie/services/workforce/insights/finance-act-2024-pensions-pulse.html | 1 Jan 2025 | C | Not needed for this product. Note it for the adviser only. |
| 38 | Auto-enrolment (My Future Fund) | Not modelled | none | Employees aged 23–60 earning over €20,000 with no pension: 1.5% employee + 1.5% employer + 0.5% State on pay up to €80,000 (2026–2028), rising in later phases | P · https://www.gov.ie/en/publication/12d1c-auto-enrolment-retirement-savings-system-for-employers | 1 Jan 2026 | W | A qualifying employee with no pension now under-states retirement. If `work === 'Employed' && age 23–60 && income > 20000 && pensionM == 0`, ask "Have you been auto-enrolled in My Future Fund?" If yes (default yes, editable), `contrib = 0.035 * Math.min(gR, 80000)`, with an employee cost of 1.5% (no tax relief: the State top-up replaces it). |

### 2.5 State Pension and other DSP payments (2026 rates)

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 39 | State Pension (Contributory), maximum personal rate | HTML `AS.sp`; XLSX `State_Pension_Year` | €15,564 a year (€299.30 × 52) | €299.30 a week = €15,563.60 | P · https://www.gov.ie/en/publication/927721-state-pension-contributory-rates/ · https://www.zurich.ie/blog/pension-changes-2026 · https://www.irishtimes.com/your-money/2025/10/07/budget-ireland-2026-social-welfare/ | 1 Jan 2026 | C | Expect +€10 a week from Jan 2027 (§5). Keep it in one constant. |
| 40 | State Pension age | HTML `AS.spAge`; copy "from 66" | 66 | 66 (deferral to 70 possible under the Flexible Pension option since 2024) | P · https://www.gov.ie/en/publication/d8fd8-flexible-pension-options | Law | C | Optional: a "Start my State Pension at 66–70" input with DSP's actuarially increased rates. |
| 41 | Age-80 supplement | Not modelled | none | +€10 a week at 80+ (€309.30) | S · as #39 | 2026 | W | Minor: `+ (a >= 80 ? 520 : 0)`. |
| 42 | Partner's State Pension | HTML `project()` partner `AS.sp * f.sp * infl` (uses the *customer's* entitlement factor, untaxed) | Full personal rate × customer's factor | Partner's own SPC, **or** the Increase for a Qualified Adult (66+ €268.40; under 66 €199.40; means-tested on the partner's income), **or** nothing | S · https://www.zurich.ie/blog/pension-changes-2026 · https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf | 1 Jan 2026 | W | Add "Your partner's State Pension: Own full / Own partial / Qualified adult increase / None / Not sure". Include it in household tax (#61). |
| 43 | Full-rate and minimum contribution rules (TCA) | HTML `spFromYears` (`≥40 full, ≥10 partly, else "Not sure"`); copy "about 40 years … [confirm with MyWelfare]" | 40 years; placeholder in the copy | Full rate needs 2,080 contributions and credits (40 years). Minimum is 520 paid contributions (10 years). Below 10 years there is no SPC (the means-tested non-contributory pension may apply). Partial rate is pro rata. | P · https://www.gov.ie/en/publication/b6193-how-to-calculate-your-state-pension-contributory-rate | Law | W | Remove the "[confirm with MyWelfare]" placeholder. Copy: "A full State Pension needs 40 years (2,080 weeks) of PRSI contributions and credits. You need at least 10 years of paid contributions to qualify. Check your record on MyWelfare." JS: `const spFrac = y => y < 10 ? 0 : Math.min(1, y / 40);` Use it as `f.sp` when the years are known. |
| 44 | SP entitlement factors when years are unknown | HTML `finNums().sp` (full 1, partly 0.6, not sure 0.8) | 1 / 0.6 / 0.8 | Judgement | — | — | CC | §3 row B9. |
| 45 | Illness Benefit, maximum personal rate | XLSX `Illness_Benefit_Week` (C22); HTML `incomegap` does not use it | €254 a week (XLSX); nothing (HTML) | €254 a week (graduated by average weekly earnings; qualified adult +€168.60; 3 waiting days) | S · https://www.inou.ie/assets/files/pdf/2026_-_inou_budget_factsheet.pdf | 1 Jan 2026 | W | XLSX is right. **HTML `incomegap` ignores Illness Benefit**: port the XLSX C22 logic. JS: `const ib = 254 * 52 / 12, gap = Math.max(0, v.e - ib), m = gap ? v.sp + v.s / gap : Infinity;` Add an input "Illness Benefit a week" (default 254, range 0–500), with the guidance "Paid if you have enough PRSI. Lower rates apply if you earned under €300 a week." |
| 46 | Widow's / Surviving Civil Partner's (Contributory) Pension, under 66 | XLSX `Survivor_Pension_Week` (C21); HTML `lifecover` does not use it | €259.50 a week (XLSX); nothing (HTML) | €259.50 under 66; €299.30 at 66+. Since the 2025 Act, qualified cohabitants (2 years with a child, or 5 years) can get the Bereaved Partner's (Contributory) Pension, backdated to 22 Jan 2024. | S · https://www.raisin.com/en-ie/pensions/widow-pensions · https://www.mhc.ie/latest/insights/social-welfare-bereaved-partners-pension-and-miscellaneous-provisions-act-2025 | 1 Jan 2026 | W | XLSX value is right. HTML `lifecover` must deduct it, as XLSX C21 does: `need = Math.max(0, v.inc*0.6 - v.surv*52) * v.y + debts - v.sav - v.ex`. XLSX C21 guidance must add: "Cohabiting partners can now qualify (Bereaved Partner's Pension)." |
| 47 | Invalidity Pension | Not used | — | €259.50 a week (QA €185.40) | S · as #45 | 2026 | C | Reference only. A future version of C22 could show it for illness lasting more than a year. |
| 48 | Statutory sick pay | XLSX C22 note | 5 days | 5 days a year at 70% of pay, capped at €110 a day (the planned rise to 7 or 10 days was paused) | S · https://www.learnsignal.com/blog/ireland-statutory-sick-leave-2026-five-days-guide/ · https://hayes-solicitors.ie/news/statutory-sick-leave-to-remain-at-five-days/ | 2026 | C | — |
| 49 | Income protection maximum | XLSX `IP_Max_Pct` | 75% of gross less Illness Benefit | Typical insurer limit (varies by insurer) | S · insurer literature | Market practice | C | Keep "verify with insurer partner". Show it as an insurer rule, not a law. |

### 2.6 Savings and investment tax

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 50 | DIRT | XLSX `DIRT` (notes); fp-review basis for the 0.7% cash rate | 33% | 33% (unchanged in Budget 2026) | S · https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers | 2026 | C | — |
| 51 | Exit tax, funds and life policies | XLSX `Exit_Tax` (notes); basis of the "after tax" investment rates | 38% | 38% from 1 Jan 2026 (was 41%); Finance Act 2025; Revenue eBrief 016/26 | P · https://www.revenue.ie/en/tax-professionals/ebrief/2026/no-0162026.aspx · https://etf.ie/blog/budget-2026-etf/ | 1 Jan 2026 | C | — |
| 52 | Deemed disposal every 8 years | XLSX notes | 8 years | 8 years (retained; under review in the Funds Sector 2030 follow-up) | S · as #51 | 2026 | C | Watch Budget 2027. |
| 53 | Life assurance levy | XLSX C18 note | 1% of premiums | 1% (pension policies exempt) | P · Revenue | 2026 | C | — |
| 54 | CGT rate and annual exemption | Not used in any calculation | 33%; €1,270 | 33%; €1,270, not transferable; not available against exit-tax funds | P · https://lawsociety.ie/globalassets/documents/tax-guide/tax-guide-2026.pdf | 2026 | C | Mention it only if a share tool is added. |
| 55 | "Investments grow X% after charges and tax" | HTML `AS_SETS.standard.inv` 4.5%, `cautious.inv` 3% | 4.5% net of charges *and* 38% exit tax (Standard) | Judgement. 4.5% after 38% tax and about 1% charges implies about 8.3% gross, which is aggressive for a default. | — | — | CC | §3 row B3. Suggest 3.5% for Standard. |

### 2.7 Property and mortgages

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 56 | LTI limits | HTML `borrow`; XLSX `LTI_FTB`, `LTI_SSB` | 4× FTB, 3.5× SSB | 4× FTB, 3.5× SSB (lender allowances: 15% FTB / 10% SSB of lending by value, verify). Principal-home bridging loans exempt from LTI since 8 Apr 2026. | P · https://www.centralbank.ie/news/article/central-bank-announces-targeted-changes-to-mortgage-measures-framework · https://www.centralbank.ie/news/article/press-release-targeted-amendment-to-mortgage-measures-home-bridging-loans-8-april-2026 | 1 Jan 2023; 8 Apr 2026 | C | — |
| 57 | LTV limits | HTML `borrow` (`dep*9`); XLSX `LTV_Max` | 90% for all buyers | 90% FTB and SSB; 70% buy-to-let | P · as #56 | 1 Jan 2023 | C | Add "Buy-to-let: 70%" if BTL is ever offered. |
| 58 | Copy placeholder in the Borrowing tool | HTML line 1410 "Lenders can make some exceptions [confirm current Central Bank rules]." | Draft placeholder shown to customers | — | — | — | W | Replace with: "Lenders can lend above these limits for a small share of loans each year, so some buyers get an exception. Your lender decides." |
| 59 | Deposit % input range | HTML `deposit` min 5%; XLSX C03 E7 min 5% | 5%–30% | The CBI minimum for a home loan is 10% (90% LTV), except within lender allowances | P · as #56 | 2023 | W | Set the minimum to 10%, or keep 5% with a warning: "Below 10% needs a Central Bank exception from your lender." |
| 60 | Stamp duty on homes | Not applied in `borrow`, `deposit`, `rentbuy` | none | 1% to €1m · 2% on €1m–€1.5m · 6% above €1.5m | S · https://www.raisin.com/en-ie/taxes/stamp-duty-ireland/ | 2025 (Budget 2025) | W | Deposit-limited price = `dep / (0.10 + 0.01)` for prices up to €1m. JS: `const sd = p => 0.01*Math.min(p,1e6) + 0.02*Math.max(0,Math.min(p,1.5e6)-1e6) + 0.06*Math.max(0,p-1.5e6);` Excel: `=0.01*MIN(Price,1000000)+0.02*MAX(0,MIN(Price,1500000)-1000000)+0.06*MAX(0,Price-1500000)`. Add "plus about €2,500–€3,500 legal fees" (a customer input). |
| 61 | (Combined fix for #12, #23, #42) Household tax for couples at every age | HTML `project()` | Several partial rules | One joint-assessment function for working and retired years | — | — | W | `function hhNet(g1, sp1, g2, sp2, a1, a2, married){ const c = 4000 + 2000*((g1+sp1>0)+(g2+sp2>0)) + (a1>=65?245:0) + (a2>=65?245:0); const T = g1+sp1+g2+sp2, band = 53000 + Math.min(Math.min(g1+sp1, g2+sp2), 35000); const it = married ? Math.max(0, 0.2*Math.min(T,band) + 0.4*Math.max(0,T-band) - c) : incomeTax(g1+sp1, ...) + incomeTax(g2+sp2, ...); return T - it - usc(g1, ...) - usc(g2, ...) - (a1<66?prsi(g1):0) - (a2<66?prsi(g2):0); }` Apply the €36,000 married age exemption when both are 65+ (or one is). |
| 62 | Help to Buy | Not modelled | — | Up to €30,000 or 10% of price (lower of the two), new builds and self-builds ≤ €500,000, first-time buyers; extended to 31 Dec 2029 | S · https://charteredaccountants.ie/News/help-to-buy-guidance-updated-for-scheme-extension · https://www.raisin.com/en-ie/savings/help-to-buy-scheme | to 2029 | C | Optional input in C01 and C03: "Help to Buy you expect (new build only)" (0–30,000). It adds to the deposit. |
| 63 | Local Property Tax | Not used (only "LPT record" as a document) | — | 2026–2030 on 1 Nov 2025 values: band 1 (to €240k) €95; band 2 (€240k–€315k) €235; base rate 0.0906% | P · https://www.revenue.ie/en/tax-professionals/ebrief/2025/no-2052025.aspx · https://www.mccannfitzgerald.com/knowledge/real-estate/local-property-tax-key-changes-for-homeowners-investors | 1 Jan 2026 | C | Rent vs buy should add LPT to the cost of owning (`lpt` input, default from band). |
| 64 | Mortgage rate convention | HTML `pmt`, `mPmt`; XLSX PMT(rate/12) | nominal ÷ 12 | Irish lenders quote a nominal borrowing rate, monthly in arrears | — | — | C | — |
| 65 | APR convention for cards and loans | HTML `payoff`/`pmt` in `debtpay` and `loan`, and `amortYear` for cards and loans (r/12) | APR ÷ 12 | An APR is an effective annual rate (Directive 2008/48/EC Annex I), so monthly = (1+APR)^(1/12) − 1 | P · https://eur-lex.europa.eu/eli/dir/2008/48/oj | Law | W | XLSX C27 and C28 are right; HTML is not. JS: `const iAPR = apr => Math.pow(1 + apr/100, 1/12) - 1;` Use it in `debtpay`, `loan`, and `amortYear`/`mPmt` for `cardRate`/`loanRate` (not the mortgage). The effect is small: €5,000 at 18% and €250 a month gives interest of €989 now vs €899 when correct. |
| 66 | Mortgage interest relief or credit | Not used | — | The mortgage interest tax credit applied to 2023–2024 only; check Budget 2027 | S | — | C | Nothing to model. |

### 2.8 Inflation, rates and market data (facts the copy quotes)

| # | Item | Where used | Value used | Correct value | Src / source URL | Effective | Verdict | Fix |
|---|---|---|---|---|---|---|---|---|
| 67 | "Ireland today" inflation | HTML `INFL_IE = 0.035`, `INFL_SRC = 'CSO, May 2026'`, chip "3.5% · Ireland today"; XLSX Assumptions E6 "3.5% (May 2026; 3.4% in Aug 2026)" | 3.5% (HICP flash, May 2026) | **HICP flash Sep 2026: 3.9%** (CSO, published 1 Oct 2026). HICP Aug 2026: 3.4%. **CPI Aug 2026: 3.7%** (CSO, 10 Sep 2026). Core HICP: 2.8%. | P · https://www.cso.ie/en/csolatestnews/pressreleases/2026pressreleases/pressstatementflashestimatefortheharmonisedindexofconsumerpricesseptember2026/ · https://www.rte.ie/news/business/2026/1001/1593629-cso-flash-inflation-reading/ · https://www.cso.ie/en/releasesandpublications/ep/p-cpi/consumerpriceindexaugust2026/ | 1 Oct 2026 | O | Set `INFL_IE = 0.039, INFL_SRC = 'CSO HICP flash, Sep 2026'`. Better: load it from a dated config refreshed monthly. Copy: "Prices in Ireland are rising 3.9% a year right now (CSO, September 2026), mostly because of energy. Over a long plan, planners usually use 2% to 2.5%." |
| 68 | ECB target | HTML copy "Planners usually use 2% … long-term standard"; `INFL_STD 0.02` | 2% | 2% symmetric, medium term (strategy reaffirmed 30 Jun 2025). ECB staff, Sep 2026: euro-area HICP 3.0% (2026), 2.5% (2027), 2.1% (2028). | S · https://www.bundesbank.de/en/tasks/topics/european-central-bank-updates-monetary-policy-strategy-970824 · https://www.newsquawk.com/headlines/ecb-staff-projections-2026-headline-hicp-maintained-at-30-but-raises-2027-and-2028-hicp-forecasts | 2025 | C | Label the chip "2% · ECB target (long-term)". |
| 69 | ECB deposit rate and market context | Not in the tool | — | DFR 2.50% from 16 Sep 2026 (second hike of 2026) | S · https://cyprus-mail.com/2026/09/10/ecb-raises-rates-as-middle-east-conflict-fuels-inflation-pressures | 16 Sep 2026 | C | Context for rows B4, B13 and B14 in §3. |
| 70 | Default mortgage rate | HTML `AS.mortRate` 3.8% (plan); calculators default 4% | 3.8% / 4% | CBI: new mortgages averaged 3.49% (fixed 3.46%, variable 3.96%), June 2026; likely to rise after the ECB hikes | S · https://www.irishtimes.com/your-money/2026/08/12/mortgage-interest-rates-up-slightly-but-dip-below-euro-zone-average/ · https://centralbank.ie/statistics/data-and-analysis/credit-and-banking-statistics/retail-interest-rates | Jun 2026 | O | Use one constant for both. Suggest 3.75% (§3 row B13). |
| 71 | Typical personal-loan and credit-card rates | HTML `AS.loanRate` 8%, `AS.cardRate` 20%; `debtpay` default 18%; `loan` default 8% | 8% / 20% / 18% | CBI new consumer lending averaged 7.48% (June 2026). Card APRs are typically about 13.5%–23% (about 400k older accounts are above 23%). | S · as #70 · https://www.centralbank.ie/news/article/central-bank-review-finds-over-400-000-credit-cards-are-on-historic-high-interest-rates | Jun 2026 | O | The values are reasonable, but `debtpay` (18%) and the plan (20%) differ. Use one constant (§3 rows B14–B15). |
| 72 | Cash deposit rates | HTML `AS_SETS` cash 1% / 0.7% after DIRT | 1% / 0.7% net | New household term deposits averaged 1.86% (June 2026), which is about 1.25% after 33% DIRT | S · as #70 | Jun 2026 | O | §3 row B4. Suggest 1.0% after tax. |

### 2.9 Plan-engine and calculator formulas (conventions and rules)

| # | Item | Where used | Value / formula used | Correct | Verdict | Fix |
|---|---|---|---|---|---|---|
| 73 | Other income and rental income | HTML `project()` `inflow += (f.otherM + f.rentM)*12*infl` (untaxed); field "Other income a month" | Gross, untaxed | Rental profit is taxed at the marginal rate + USC + PRSI (Class S, 4.35% from Oct 2026) | W | Either label both "after tax", or tax them: `inflow += netOther(otherY + rentY, gR)` = marginal IT + USC (`usc(gR + x) - usc(gR)`) + PRSI 4.35% if under 66. Ask "Is this before or after tax?" |
| 74 | C12 Retirement projection: fund vs target (HTML) | HTML `retirement.run` `gap = target - f` (nominal fund vs today's-money target) | Mixed bases | Compare in today's money (XLSX C12 already does) | W | At defaults the HTML shows a gap of €99,227. The correct gap is **€304,525**. JS: `const fReal = f / Math.pow(1 + AS.infl, y), gap = target - fReal;` Label: "in today's money". |
| 75 | C12 "Other yearly income" default and timing | HTML/XLSX default €15,000; State Pension only from 66 | €15,000 from the retirement age | €15,564 × entitlement, **from 66 only**. Retiring at 60 leaves 6 years with no State Pension. | W | Default `= AS.sp * F.sp`. Target = `need×multiple` + `(66 − ra)×SP` when `ra < 66`. Excel: `=MAX(0,Desired-Spend_Less-Other)*Retire_Multiple+MAX(0,66-Retirement_Age)*Other_Income`. |
| 76 | C12 ignores tax on drawdown and the tax-free lump sum | HTML/XLSX C12 | Gross target, no lump sum | Drawdown is taxable; 25% can be tax-free | W | Add a line: "Desired income is before tax. About 25% of the fund can be taken tax-free." Or gross up the need: `need_gross = need_net / (1 − avgRate)`, using `netRet`. |
| 77 | Drawdown timing (C15 / C16) | HTML `lasts()` grow-then-withdraw (end of year); XLSX start of year | Inconsistent | One rule: start of year (prudent) | W | JS: `function lasts(pot, w, g, inf){ let y = 0; while (y < 60 && pot >= w){ pot = (pot - w) * (1 + g/100); w *= 1 + inf/100; y++; } return y; }` |
| 78 | C15/C16 withdrawals before tax | HTML/XLSX | Pot gross | ARF draws pay income tax, USC (and PRSI before 66) | C | XLSX already has the note. The HTML must add "before tax" to the line. |
| 79 | C13/C14 relief limits not checked | HTML `contrib`, `avc`; XLSX notes | No age or cap check | Relief only within `relLim(age) × min(salary, 115000)`, less existing contributions | W | Excel: `=MIN(Extra_Per_Month*12, MAX(0, LOOKUP(Age,{0,30,40,50,55,60},{0.15,0.2,0.25,0.3,0.35,0.4})*MIN(Salary,115000) - Existing_Contrib_Year))*Tax_Rate/12` as the relief per month. Add inputs "Your age" and "What you pay in now a year". JS likewise with `relLim`. |
| 80 | C21 Life cover: survivor's pension netted (XLSX) | XLSX C21 | (60% × income − €259.50 × 52) × years | Right in principle. The survivor's pension is €299.30 if the survivor is 66+. | C | Add "Survivor's age: under 66 / 66+". |
| 81 | C20 "difficult single year" | HTML `riskreturn` `Math.round(vol*1.6)`; XLSX `Risk_Fall` | Fall = 1.6 × vol (Balanced 16%) | Within its own model, a 1-in-20 bad year = μ − 1.645σ: −6% / −12% / −20% | W | JS: `Math.round(1.645*vol - mu)`. Excel: `=ROUND((Volatility*1.645-Middle_Growth)*100,0)/100`. Copy: "about a 1-in-20 year". |
| 82 | Real return, fees, monthly equivalent rate, PMT, NPER and FV conventions | HTML `fvL`, `fvA`, `pmt`; XLSX | (1+g)(1−f); (1+r)/(1+i)−1; (1+r)^(1/12)−1 | Correct | C | — |
| 83 | Pension contributions timing and growth | HTML `pensionAt`; XLSX C12 growing annuity | End of year, rising with pay | An acceptable convention (slightly prudent) | C | — |
| 84 | Statement charges replace the typical 1% | HTML `penGrowth` | `AS.pen + 1% − stated charges` | Correct | C | — |
| 85 | Tax computed in today's money (bands indexed with prices) | HTML `netPay(gR)` with `gR = income*wgw/infl` | Bands rise with prices | Judgement: there is no statutory indexation in Ireland | CC | §3 row B10. |
| 86 | First plan year | HTML `YEAR0 = 2026`, row t = 0 is a full 2026 year on 2 Oct 2026 | Full 2026 | Convention | CC | §3 row B23 (offer "Start the plan in: 2026 / 2027"). The PRSI blend in #19 follows the year. |

---

## 3. Customer-choice inputs (all (B) items)

Every row must be a visible input on the Assumptions screen, or in the tool itself, with the suggestion pre-selected and the guidance text below it. None may be hidden. The backend must read the value from `S` (plan) or the tool's inputs, with the suggestion only as a fallback. Store the choice and show "(your choice)" in the report.

| Row | Input label (customer copy) | Where it plugs in | Allowed range | Suggested value | Guidance copy |
|---|---|---|---|---|---|
| B1 | **"Of the €X paid in each month, how much do you pay yourself?"** (the rest is your employer) | `project()` `E`; Contribution tools | €0 to the total | 50% of total if employed (common 5% + 5%); 100% if self-employed | "Your payslip shows what comes out of your pay. Your employer's share is on your pension statement. Only your own share gets tax relief." |
| B2 | Growth assumptions set | `AS_SETS` | Standard / Cautious / My own | Standard | "Growth is never guaranteed. Cautious shows what happens if markets do less well." **Fix the set:** Standard pay rise 3% and Cautious 2.5% (today Cautious is higher, which is not cautious for a plan where contributions rise with pay). |
| B3 | Investments grow (a year, after charges and tax) | `AS.inv` | 0%–7% | Standard 3.5%, Cautious 2.5% | "After fund charges (about 1%) and exit tax (38%). A typical mixed fund has grown 5%–6% a year before these over long periods, but not every year." |
| B4 | Cash savings earn (a year, after DIRT) | `AS.cash` | 0%–4% | 1.0% (Cautious 0.7%) | "Irish savings accounts paid about 1.9% on fixed terms in mid-2026, about 1.25% after 33% DIRT. Demand accounts pay less." |
| B5 | Pension grows (a year, after charges), while working and once retired | `AS.pen`, `AS.penRet` | 0%–7% each | 4.5% / 3.15% Standard; 4.0% / 2.8% Cautious | "Pension growth is tax-free inside the fund. The retired rate is lower because most people take less risk then." |
| B6 | Typical pension charges (if your statement doesn't say) | `PEN_TYP_CHG` | 0%–2.5% | 1.0% | "Your pension statement shows your actual charges. We use them when you add it." |
| B7 | Prices rise (inflation) | `S.infl` (exists) | 0%–10% | 2% (ECB target) or 2.5% (prudent); also show 3.9% "Ireland now" | "Ireland's prices are rising 3.9% now (CSO, Sep 2026), mostly because of energy. Over decades, 2%–2.5% is the usual planning range." |
| B8 | Pay rises (a year) | `AS.wage` | 0%–6% | 3.0% | "Irish pay has grown about 3%–4% a year recently. Pick lower if your pay is fixed or you expect to work part-time." |
| B9 | **"How many years of PRSI will you have at 66?"** (or Full / Partly / Not sure) | `f.sp` | 0–45 years | Use `min(1, years/40)` (0 if under 10). If unknown: Full 1, Partly 0.6, Not sure 0.8. | "A full State Pension needs 40 years of contributions and credits. Get your record on MyWelfare." |
| B10 | Tax bands in future | `netPay`/`netRet` real-terms basis | Rise with prices / Stay as today | Rise with prices | "Irish tax bands are set each Budget and don't rise automatically. 'Stay as today' is the cautious view (more tax later)." |
| B11 | State Pension in future | `AS.sp * infl` | Rises with prices / with pay / stays flat | Rises with prices | "The State Pension is set each Budget. It has broadly kept pace with prices over time." |
| B12 | Plan to age | `AS.end` | 85–100 | 90 (95 for couples) | "Many people now live into their 90s. Planning further ahead is safer." |
| B13 | Mortgage rate (if your statement doesn't say) | `AS.mortRate`; calculators default | 1%–8% | 3.75% | "New Irish mortgages averaged about 3.5% in mid-2026. The ECB raised rates in September 2026, so new rates may rise." |
| B14 | Credit-card rate (if your statement doesn't say) | `AS.cardRate`; `debtpay` default | 0%–35% | 20% | "Most Irish cards charge 13%–23% APR. Your statement shows yours." Use the same default in the Debt repayment tool (it shows 18% today). |
| B15 | Other loans rate (if your statement doesn't say) | `AS.loanRate`; `loan` default | 0%–25% | 8% | "New Irish personal loans averaged about 7.5% in mid-2026. Credit unions often charge less." |
| B16 | **Safety net: months of essential spending** (one setting for the plan, the pyramid and the calculator) | `FND_TARGET` (6), `SAVE.buffer` (3), safety goal `costsM*4` (4), C11 default (6) | 3–12 months | 6 (3 if two secure incomes) | "Easy-access cash for surprises or a gap in pay. Single-income households and the self-employed usually aim higher." Essential spending = living costs + mortgage + loan repayments, everywhere. |
| B17 | Retirement savings target: years it should last, or withdrawal rate | C12 `Retire_Multiple` (25×) | 3%–5% (20×–33×) | 4% (25×) | "25 times the yearly income you need is a common rule of thumb (about 4% a year). Retiring early or planning to 95 needs more." Better: target = present value of the need from retirement to the plan-end age at the retired growth rate and inflation. |
| B18 | Retirement spending if you haven't set a goal | `f.costsM*12*0.8` | 50%–120% of today | 80% | "Most people spend a bit less once work costs and the mortgage stop." |
| B19 | Take the tax-free lump sum? | `project()` lump sum | Yes (25%) / No / My own % (0–25%) | Yes, 25% | "Up to €200,000 is tax-free and the next €300,000 is taxed at 20%. Your adviser can compare it with leaving it invested." |
| B20 | How you draw your pension | Drawdown rule | Spread to plan end (min ARF %) / Minimum only (4%/5%) / Fixed amount | Spread to plan end | "From 61 you must take at least 4% a year from an ARF (5% from 71). We spread the rest over your plan." |
| B21 | Money for goals under N years kept as cash; spare savings mix | `SAVE.longYrs` (5); `gr` 60% cash / 40% invested | 1–10 years; 0–100% invested | 5 years; 40% invested | "Money needed soon is safer in cash. Longer-term money has more time to ride out ups and downs." |
| B22 | Share of spare money saved; amount if Q6 unanswered | `SAVE.share`, `SAVE.noAnswer` | 0%–100%; €0–€5,000 | 50%; €300 | Exists in the copy. Make it editable. |
| B23 | Start the plan in | `YEAR0` | 2026 / 2027 | 2026 until 30 Sep, then 2027 | "From October most of this year has passed, so you can start from next year." |
| B24 | Life cover: share of income your family would need; years; survivor's pension | C21 `Life_Replace`, years, survivor input | 30%–100%; 1–30 years | 60%; until the youngest is 23 | "Families usually need less than full pay. A State survivor's pension may help: €259.50 a week under 66." |
| B25 | Rent vs buy: rent rises; house prices rise; upkeep; buying fees; what the deposit could earn | C07 `Upkeep_Rate`, `House_Growth`, `RentBuy_Term`, add `Rent_Growth`, `Fees`, `Opp_Rate` | 0%–8%; 0%–6%; 0%–3%; €0–€10k; 0%–6% | Rent +3%, house +2%, upkeep 1% of value, fees €3,000 + stamp duty, deposit earns 1% (cash) | "Buying has costs that don't build equity: interest, stamp duty, fees, LPT and repairs. Renting has rent rises." |
| B26 | Risk & return styles | C20 `Risk_Mu`, `Risk_Vol`; C16 `DD_*` | 0%–8%; 0%–25% | 2/4/6% growth; 5/10/16% volatility | "Illustrations, not forecasts. Your adviser uses the fund's own risk rating (SRI 1–7)." |
| B27 | Budget split | C26 50/30/20 | Each 0%–100%, totalling 100% | 50/30/20 | "A starting point. Adjust it to fit your life." |

---

## 4. Tax test table (take-home pay, 2026 rules)

The engine's own functions were taken from the HTML and run against my independent Revenue-style calculation:
- **Income tax:** single band €44,000 with credits €4,000; married one earner band €53,000 with credits €6,000.
- **USC:** 0.5% / 2% / 3% / 8% at €12,012 / €28,700 / €70,044, with the €13,000 exemption.
- **PRSI:** Class A with the PRSI credit.

Two "correct" columns are shown:
- **2026 actual** uses the blended PRSI of 4.2375% (4.2% for Jan–Sep, 4.35% for Oct–Dec).
- **At 4.35%** is the rate from 1 Oct 2026.

| Gross | Status | Income tax (engine = mine) | USC (engine = mine) | PRSI engine (4.35%) | PRSI 2026 actual | **Engine take-home** | **Correct, 2026 actual** | **Correct at 4.35%** | Result |
|---|---|---|---|---|---|---|---|---|---|
| €25,000 | Single | €1,000.00 | €319.82 | €1,087.50 | €1,059.38 | €22,592.68 | €22,620.81 | €22,592.68 | Matches at 4.35%. −€28 vs 2026 blend. |
| €25,000 | Married, one earner | €0.00 | €319.82 | €1,087.50 | €1,059.38 | €23,592.68 | €23,620.81 | €23,592.68 | Matches. |
| €45,000 | Single | €5,200.00 | €882.82 | €1,957.50 | €1,906.88 | €36,959.68 | €37,010.31 | €36,959.68 | Matches. −€51 vs blend. |
| €45,000 | Married, one earner | €3,000.00 | €882.82 | €1,957.50 | €1,906.88 | €39,159.68 | €39,210.31 | €39,159.68 | Matches. |
| €80,000 | Single | €19,200.00 | €2,430.62 | €3,480.00 | €3,390.00 | €54,889.38 | €54,979.38 | €54,889.38 | Matches. −€90 vs blend. |
| €80,000 | Married, one earner | €15,400.00 | €2,430.62 | €3,480.00 | €3,390.00 | €58,689.38 | €58,779.38 | €58,689.38 | Matches. |
| €150,000 | Single | €47,200.00 | €8,030.62 | €6,525.00 | €6,356.25 | €88,244.38 | €88,413.13 | €88,244.38 | Matches. −€169 vs blend. |
| €150,000 | Married, one earner | €43,400.00 | €8,030.62 | €6,525.00 | €6,356.25 | €92,044.38 | €92,213.13 | €92,044.38 | Matches. |

**Married two earners** (income tax only, engine = mine): €60k + €30k gives €11,400; €80k + €50k gives €26,400; €45k + €45k gives €10,400. All match.

**Combination checks where the engine is wrong** (`test2.js`):

| Case | Engine | Correct | Error | Register |
|---|---|---|---|---|
| Married, one earner, €50k, own pension €5,000, age 45 | €39,792.18 | €38,792.18 | +€1,000 a year (relief at 40% instead of 20%) | #29 |
| Age 67, still working, €60k salary + full State Pension | €60,421.18 | €57,050.58 | +€3,371 a year (PRSI charged at 66+, State Pension untaxed) | #22, #23 |
| ARF draw €30k at age 62 | €27,567.18 | €26,262.18 | +€1,305 a year (no PRSI before 66) | #24 |
| Retirement lump sum, €1m pot | €200,000 | €240,000 net (€250,000 gross − €10,000 tax) | −€40,000 | #31 |
| Self-employed €20k, PRSI | €528 | €870 | −€342 | #25 |
| Retired couple, joint assessment | taxed as two single people | joint band and credits | varies | #12 |
| Retiree, draw €20k + SP €15,564, age 67 | €32,476.38 | €32,476.38 | none (single) | Correct |
| Pension relief, single, €46k, €5,000, age 45 | cost €3,600 | €3,600 (€2,000 at 40% + €3,000 at 20%) | none | Correct |
| Pension relief, €200k earner, €40,000, age 50 | cost €26,200 | €26,200 (cap 30% × €115k = €34,500 relieved at 40%) | none | Correct |

---

## 5. Budget 2027 watch

**Status on 2 Oct 2026: not yet announced.**
- Budget 2027 will be presented on **Tuesday 6 October 2026** by the Tánaiste and Minister for Finance Simon Harris and Minister Jack Chambers. The date was confirmed in the Summer Economic Statement of 22 July 2026.
- The package is **€8.5bn**: €7bn spending and €1.5bn tax measures.
- Sources: https://kpmg.com/ie/en/insights/tax/budget-2027.html · https://www.irishtimes.com/your-money/2026/09/30/budget-2027-i-dont-know-what-a-tax-band-is/ · https://www.irishpolitics.ie/budget/ (S, verify on gov.ie on the day).

**Expected or flagged, not yet law:**
- Standard-rate band widened by about €2,000 (from €44,000, €48,000, €53,000 and €88,000).
- The USC 2% band ceiling (€28,700) raised in line with the minimum wage.
- About +€10 a week on core welfare rates (State Pension to about €309.30).
- Christmas bonus.

**Already legislated or scheduled from 2027:**
- PRSI Class A/S to 4.5% from 1 Oct 2027, then 4.7% from 1 Oct 2028.
- SFT €2.4m on 1 Jan 2027.
- Auto-enrolment stays at 1.5% / 1.5% / 0.5% until end-2028.
- Rent Tax Credit to end-2028.
- Help to Buy to end-2029.
- LPT rates fixed for 2026–2030.

**To update on 6–7 Oct 2026 (one config change each, with the effective date):**

| Constant | Current (2026) | Watch for |
|---|---|---|
| `TX.band` / €48k / €53k / €35k uplift | €44,000 / €48,000 / €53,000 / €35,000 | +€2,000? |
| `TX.credits` (personal, PAYE / EIC) | €2,000 + €2,000 | change? |
| Age credit, age exemption | €245 / €18,000 (€36,000 married) | change? |
| Rent, Home Carer, SPCCC credits | €1,000 / €1,950 / €1,900 | change? |
| `TX.usc` bands, exemption €13,000 | €12,012 / €28,700 / €70,044 | 2% ceiling rise |
| PRSI path | 4.35% now; 4.5% Oct 2027 | confirm; any change to the PRSI credit |
| `AS.sp` | €299.30/wk (€15,564) | +€10? (€309.30 = €16,084) |
| QA increase | €268.40 (66+) / €199.40 (<66) | change |
| Illness Benefit | €254 | +€10? |
| Survivor's / Bereaved Partner's pension | €259.50 (<66) / €299.30 (66+) | +€10? |
| Exit tax, deemed disposal, DIRT, CGT | 38% / 8 years / 33% / 33% & €1,270 | Funds review: any further exit-tax cut or deemed-disposal change |
| Pension relief, €115k cap, lump-sum bands, SFT | unchanged / €2.4m in 2027 | change? |
| Stamp duty, HTB, CBI measures | 1/2/6%; €30k; 4× / 3.5× / 90% | change? |
| Inflation "Ireland now" | 3.9% (HICP flash Sep 2026) | next CSO flash: end of Oct 2026 |

Production needs a **dated rates config** (`rates-2026.json`, `rates-2027.json`) chosen by plan year, not constants in code.

---

## 6. Prioritised fix list

**P1: must fix before any customer sees numbers**
1. **Married pension relief and joint assessment.** Compute household tax once, on pay after contributions, under joint assessment, in both working and retired years (#29, #12, #61). The error is up to €1,000+ a year for married savers, and retired couples lose the joint band.
2. **66+ still working.** No PRSI from 66, and the State Pension taxed with salary (#22, #23). The error is +€3,371 a year at €60k.
3. **Lump sum €200k–€500k at 20%** and the €500k cap. Make taking it a customer choice (#31, B19).
4. **C12 in the HTML.** Compare in today's money (#74). At defaults the gap is under-stated by €205k. Also add the pre-66 State Pension gap and the default €15,564 (#75).
5. **Untaxed other and rental income** (#73).
6. **Customer copy placeholders.** "[confirm current Central Bank rules]" (#58) and "[confirm with MyWelfare]" (#43).
7. **Hidden 50% employee share** of pension contributions. Make it an input (#30, B1).
8. **Emergency months.** One customer setting, used in the plan buffer (3), safety goal (4), pyramid (6) and calculator (6) (B16).

**P2: fix before testing with customers**
9. PRSI on ARF draws before 66 (#24). Self-employed Class S rules (#25). Legislated PRSI path by year (#19, #20).
10. Missing credits as household questions: Rent Tax Credit (#8), single parent band and SPCCC (#4), Home Carer (#9). Tax-rate pre-fill by status (#13).
11. Auto-enrolment for employees with no pension (#38).
12. HTML protection tools: Illness Benefit in `incomegap` (#45); survivor's pension in `lifecover` (#46). Mention Bereaved Partner's Pension for cohabitants.
13. APR as an effective rate in the HTML debt and loan tools and in the plan's card and loan amortisation (#65).
14. Stamp duty and fees in Borrowing, Deposit and Rent vs buy; deposit minimum 10% or a warning (#59, #60).
15. Relief limits (age band, €115k) in the Contribution and AVC tools (#79).
16. Inflation "Ireland now": 3.9%, CSO HICP flash Sep 2026, from a dated config (#67).
17. Partner's State Pension options, including the QA increase, and the TCA years-based entitlement (#42, #43, B9).

**P3: correct, but lower impact**
18. ARF 6% over €2m (#35). SFT (#32). Age-80 supplement (#41). Earliest benefit age 60 (#36).
19. One drawdown timing rule, start of year (#77). The C20 "difficult year" formula (#81). Drawdown and tax notes in the HTML (#78).
20. Make every (B) item in Section 3 visible and editable, with the suggestion and guidance. Fix the Cautious/Standard pay-rise inversion and the Standard "after tax" investment rate (B2, B3).
21. Move every statutory value into a dated `rates-YYYY` config. Re-run Section 4 on 7 Oct 2026, after Budget 2027.

**Note on earlier reviews.** `docs/fp-review-round1.md` and `deliverables/independent-accuracy-audit.md` are right on the 2026 values they quote: SP €299.30, USC €28,700, PRSI 4.35%, exit tax 38%, DIRT 33%, LTI/LTV, Illness Benefit €254 and survivor's pension €259.50. They missed several rules:
- married relief (#29);
- the State Pension and PRSI for people still working at 66+ (#22, #23);
- the 20% lump-sum band (#31);
- PRSI on ARF draws (#24);
- the missing credits (#4, #8, #9);
- auto-enrolment (#38);
- untaxed other income (#73).

They also used "Ireland today 3.5% (May)", which is now superseded by 3.9% (#67).
