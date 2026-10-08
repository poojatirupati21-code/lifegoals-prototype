# Independent calculator audit: C01–C28 (Explore) and Make-my-plan engine

Auditor: independent qualified financial planner (QFA/CFP, Ireland), 8 Oct 2026. Nothing in the prototype, workbook or other docs was changed. Earlier audit reports were not used as evidence.
Scope: `LifeGoals-Customer-Journey-Prototype.html` (array `CALCS`, helpers, `project()`, `finNums()`, `goalLine`/`extraTo100`), reference `deliverables/LifeGoals-Calculators.xlsx` (opened only after my own expectation was built), `docs/journey-spec.md` §10–§26, `docs/pre-release-verify.md`.

## 1. Verdict

**The numbers are right. Seven wording and edge-case defects remain, and they are why I cannot sign it off as "all right".**

- 2,505 runs of the real calculators (28 tools, 74 to 113 input combinations each), driven in Chromium. They cover defaults, minimum, maximum, ten times the top of every € box (the UI allows that), zero rate, zero fees, inflation blank / 0 / 0.5% / 2% / 3.9% / 10%, and 3 assumption sets.
- **13,085 numeric checks against my own Python implementation, written from textbook formulas before I read the workbook. 0 mismatches.** I mutated one formula by 0.1% in the Python and it failed 329 checks, so the harness does detect errors.
- Workbook (a recalculated copy, 60 rounds, all 28 sheets per round): **27 of 28 sheets agree with the prototype on every output in every round.** C07 differs only where the deposit is below 10% or above the price (§4). The existing `calc-vs-xlsx.js` also gave 145 of 145 PASS and 0 constant differences.
- Cross-calculator consistency holds. C09 = C13 = C14 = C18 (€54,572.48 for €100 a month, 4.5%, 25 years). C04 interest now = C02 total interest (€145,877.63). C05 after = C02 at the new rate. C06, C23 and C02 give the same repayment. C08 reaches its target when fed into C09. C10 = C09 with a €0 monthly addition. C10 in today's money = C17. C19 fee B = C10 with the fee. C27 and C28 give the same interest (€3,128.75).
- Engine checks: what-if monthly extra and lump sum never lower a goal's % (9 and 5 steps, 5 goals). `extraTo100` really reaches 100%. C12's projected fund equals the engine's pension at retirement (€595,640.40 both).

Ranked required fixes are in §6.

## 2. Result per calculator

Severity key: **N** = wrong number, **W** = misleading wording, **E** = edge case, **C** = cosmetic.

| # | Calculator | Verdict | Evidence / findings |
|---|---|---|---|
| C01 | How much could I borrow? | PASS with notes | Expected = bisection on price (10% deposit + stamp duty + fees = cash; LTI 4× / 3.5×; LTV 90%): 882 checks, 0 mismatches. Notes: (C) €181,818 "about" shows false precision. (E) Stamp duty is on the price, but for a **new home it is charged on the price excluding VAT** (13.5%), so it is overstated for new builds. Help to Buy (€30k in the register, `htbMax`) is not used. Not stated on screen. |
| C02 | Monthly mortgage repayment | PASS | €300k, 4%, 30 yrs = €1,432.25; interest €215,609; rate 0 = loan ÷ months. Note: nominal ÷ 12 here, but C28 treats "APR" as effective (§5). |
| C03 | Deposit calculator | PASS with notes | ceil(still to save ÷ monthly saving) correct. (C) Double space in the line when saved ≥ need ("and have €200,000.  The Central Bank…"). Stamp duty and new-build VAT as C01. |
| C04 | Mortgage overpayment | PASS | My month-by-month simulation = prototype (months, interest, saved). Extra €0 gives "No change" and "could save about €0" (C). |
| C05 | Interest-rate impact | PASS | (C) A change of 0 shows "+€0" and "rate changed to 4.00%". Rate floor 0% matches the workbook. |
| C06 | Mortgage term comparison | PASS | Same term gives "Both terms are the same" but the rows repeat the same line twice (C). |
| C07 | Rent vs buy | PASS with notes | Independent month-by-month balance, geometric rent and upkeep sums: 1,111 checks, 0 mismatches. Workbook mismatch outside the deposit rule (§4). (W) "Home equity" is before selling costs and this is not said (C24 Net worth does say so). Opportunity cost is on the deposit only, not on stamp duty and fees (small understatement). |
| C08 | Goal planner | PASS with notes | Inflation (1+i)^y, savings at effective annual rate, end-of-month annuity: 292 checks, 0 mismatches. Inflation 0 counts as 0 (€347 vs €372). Blank inflation gates the result. (C) "Setting aside about €0 a month could reach it" when already funded. |
| C09 | Compound growth | PASS | 327 checks. (C) Double space before "Prices rising…". |
| C10 | Lump-sum growth | PASS with notes | (1+g)(1−f) applied as defined: 520 checks. (W) "Cost of waiting" assumes the money earns **0%** while waiting. This is not stated. (E) When fees exceed growth the "cost of waiting" is negative and reads "about −€139 less" (seen at 1% growth, 1% fee, wait 6). |
| C11 | Emergency fund | PASS | 246 checks. Month count is floored to 0.1 (conservative). Singular "1.0 month" correct. |
| C12 | Retirement projection | **FAIL (edge cases and one rule)** | Main path correct (882 checks, equals the engine). Three wrong-number defects and one false-alarm warning, see §3 (F1 to F4). |
| C13 | Contribution impact | PASS with notes | Relief bands tested at 18, 29, 30, 39, 40, 49, 50, 54, 55, 59, 60, 75: correct. Cap €115,000 correct. (W) The contribution is flat for the whole period, but C12 lets contributions rise with pay. The screen does not say "level, not rising with pay". |
| C14 | AVC impact | PASS | 774 checks. |
| C15 | Will my money last? | PASS with notes | Start / end-of-year timing and inflation-linked withdrawal right. (E) Pot €10,000, withdrawal €24,000: "Could last about **0 years**" and the row "Money lasts to about age 66". Should read "less than a year". Withdrawal rate 500% accepted. (E) Start age slider goes to 50, with no "most pensions can't be drawn before 60" warning (C12 has one). |
| C16 | Drawdown scenarios | PASS with notes | Same "0 years" wording as C15. |
| C17 | Inflation-adjusted return | PASS | Real return (1+r)/(1+i)−1, 2.94% shown as "about 2.9%". |
| C18 | Regular investing | PASS | 574 checks. |
| C19 | Fees impact | PASS | 352 checks. |
| C20 | Risk & return | **PASS on numbers, FAIL on wording** | Numbers = formula (1.645 for 1-in-20; ±1σ ÷ √years for 1-in-6). (W) "Longer timeframes narrow the range" is true of the **yearly** return only. The € gap between Weaker and Stronger **widens**: 1 yr €18,600 to €23,400 (gap €4,800); 10 yrs €22,546 to €46,463 (gap €23,917). (W/E) With low volatility the sentence reads "a fall of around **−6%**" (mu 8%, vol 1%). |
| C21 | Life cover estimator | PASS with notes | 525 checks. (W) The income need is a straight sum (no discounting or indexation). This is fine for a rough estimate but the screen only says "rough". "Cohabiting partners can now qualify for the Bereaved Partner's Pension" is correct (deaths from 21 Jul 2025, per gov.ie via web search). |
| C22 | Income protection gap | **FAIL (wording)** | Numbers correct (546 checks). (W) Essential spending ≤ Illness Benefit gives **"You could cope for about Indefinitely"** and "Savings would cover Indefinitely". Illness Benefit is paid for at most 2 years (624 days; 312 days with fewer contributions). The coping time is not capped at that limit either (e.g. 3 months sick pay + 30 months of savings assumes benefit all the way). (W) "Income protection is designed for this" edges towards product steering, so soften it. "5 days a year" statutory sick pay is correct for 2026 (the planned rise to 10 days was put on hold). |
| C23 | Mortgage protection | PASS | Balance after 5/10/15 years = amortisation. A term under 15 years correctly shows €0. |
| C24 | Net worth | PASS | |
| C25 | Monthly surplus | PASS | (C) "About 0% of your take-home pay is free" for tiny surpluses. |
| C26 | Budget 50/30/20 | PASS | Warns when shares do not add to 100%. |
| C27 | Debt repayment | PASS | Effective monthly rate; payment ≤ interest gives "Never at this repayment"; more than 1,200 months gives "Over 100 years" (tested at €100,000, 0.5%, €50). |
| C28 | Loan repayment | PASS | Zero APR = amount ÷ months. |

## 3. C12 Retirement projection: defects in detail

- **F1 (N, edge, also in the workbook).** Target = multiple × max(0, desired − spend-less − other) + bridge years × **other**. If other income is larger than the income needed, the first term is 0 but the bridge term still grows with "other". Desired €20,000, retire 60, other €10,000 / €20,000 / €30,000 / €45,000 gives targets of **€310,000 / €120,000 / €180,000 / €270,000**. Raising your State Pension raises the target, which is wrong (the true bridge need is at most the income needed, €120,000). Fix: `bridge × min(other, max(0, desired − less))` in the prototype and the workbook C12 formula.
- **F2 (N, edge).** `y = max(1, retirement age − age)`. Age 70 with retirement age 50 (both allowed by the sliders) is treated as 1 year: "Retiring at 50", fund €68,700, gap €797,647. Retirement age ≤ age needs a gate ("Choose a retirement age after your age"), not a silent 1 year.
- **F3 (N for pots above €2m, rule).** `lumpSum()` caps the lump sum at €500,000. In Irish law €200,000 is tax-free, the next €300,000 (to €500,000) is taxed at 20%, and **the excess over €500,000 is still payable and is taxed at the marginal rate** (it is not forbidden). The 25% maximum is not capped. With a €4.87m fund the tool shows a net lump sum of €440,000 (it should show about €1.2m gross, taxed). Same code feeds `project()` at retirement. `LAW.ls` text omits the excess rule.
- **F4 (W).** The Standard Fund Threshold warning compares the **nominal** fund at retirement with the **2026** threshold (€2.2m). A 30-year-old with a €1.81m fund in today's money (€3.62m nominal) is told they are above the threshold, though the threshold is €2.8m by 2029 and unknown after. `project()` uses `sftFor(year)` but the same nominal-to-flat comparison. Compare today's-money fund with the 2026 figure, or state the indexation assumed.
- **F5 (C).** Text says "About 25% of the fund can be taken as a lump sum" while the row uses the customer's own percentage (e.g. 15%).
- **Consistency note (not an error).** Pension contributions are end-of-year (C12 and `project()`), which is about 2% lower than the monthly end-of-month method in C13/C14/C09 for the same flat contributions (€53,478 vs €54,572 for €100 a month, 25 years, 4.5%, no pay rises). The plan's goal contributions are start-of-year. Three timing conventions are in use across the product. Document them in "What your plan assumes".

## 4. Workbook comparison

- 60 rounds × 28 sheets recalculated on a copy (original untouched): no formula error on any sheet. C07: 14 of 60 rounds differ, **all** with deposit < 10% of price or > price. The workbook leaves the clamp to input validation ("Allowed: at least 10% of the price and no more than the price") and the formula uses the raw deposit (loan €350,000 vs €315,000 at deposit €0, price €350,000). The prototype clamps and says "The deposit must be at least 10% of the price, so €X is used" (shown only for under 10%, not when above the price). Align them (put `MIN(MAX(…))` in the workbook).
- Where prototype and workbook agree, they agree on F1 (the bridge formula), so a fix must be made in both.
- I did not run the workbook's statement paths separately; the existing script's edge case 5 covered repayment, overpayment, rate change, mortgage protection with a stated repayment. I re-checked those in the prototype by hand: stated €800 on a €250,000 / 4% / 25-year loan gives "Never at this repayment" and the what-if says it is an approximation. Correct and honest.

## 5. Irish rules and conventions per calculator

Official sites (revenue.ie, gov.ie, centralbank.ie) are blocked here. I used web search for secondary confirmation and my own knowledge. **I could not verify any value against a primary page.**

| Rule used | Where | Finding |
|---|---|---|
| LTI 4× FTB / 3.5× SSB, LTV 90%, "small share above limits" | C01 | Matches the CBI framework as I know it (1 Jan 2023). Register source is centralbank.ie. |
| Stamp duty residential 1% to €1m, 2% to €1.5m, 6% above, each band only on its own slice | C01, C03, C07 | Confirmed by search (instruments from 2 Oct 2024). New builds: on the price **excluding VAT**. Not modelled or mentioned. |
| Pension relief 15/20/25/30/35/40% by age band, earnings cap €115,000, personal contributions only | C13, C14 | Correct, band edges tested. |
| Lump sum 25%, €200,000 tax-free (lifetime), €200,001 to €500,000 at 20%, excess at marginal rate | C12, engine | Prototype misses the excess rule (F3). |
| SFT €2.2m (2026), €2.4m, €2.6m, €2.8m (2029), 40% excess | C12 | Matches my recollection of Budget 2025; unverified. Use of it: F4. |
| ARF 4% from 61, 5% from 71, 6% above €2m | C15 text | Correct. The text omits the €2m 6% case (fine). |
| DIRT 33%, exit tax 38% from 1 Jan 2026, 8-year deemed disposal | "Before tax" notes | Confirmed by search (Budget 2026, Cantor Fitzgerald, Deloitte). |
| State Pension €299.30, Illness Benefit €254, survivor €259.50 / €299.30 (2026) | C12, C21, C22 | Consistent with Budget 2026 +€10, but **unverified**; register sources are secondary (inou.ie, raisin.com) and flagged "verify before release". |
| Illness Benefit duration | C22 | Not modelled (F in C22). Max 2 years (624 days). |
| Statutory sick pay 5 days | C22 | Correct for 2026 (confirmed by search). |
| Bereaved Partner's Pension for cohabitants | C21 | Correct (deaths from 21 Jul 2025). |
| Budget 2027 | all | No Budget 2027 value found in any calculator or register entry. The §23 note is present. |

Convention differences that are by design but visible to customers:
- Mortgage tools (C01, C02, C04 to C07, C23) use nominal annual rate ÷ 12. Loan and debt tools (C27, C28, C08 to C10, C17, C18) treat the percentage as **effective** annual. The same "8%" over 5 years on €15,000 gives €304.15 a month in C02 and €302.15 in C28 (interest €3,249 vs €3,129). It is defensible (mortgage lenders quote the nominal rate; Directive 2008/48/EC APR is effective) but the C28 label is "Interest (APR)" while C02 says "Interest rate", and nothing on screen explains it.
- Inflation gating works everywhere: blank inflation gives "Choose your inflation rate to see this" in C08, C12, C15, C16 and the "worth in today's money" rows of C09, C13, C14, C17, C18, C10. Inflation 0 counts as 0.
- Guidance, not advice: no calculator recommends a product or action. The only borderline sentence is C22 "Income protection is designed for this".

## 6. Ranked list of required fixes

1. **C12 F1: bridge term** `bridge × min(other, max(0, desired − less))`. Prototype and workbook. Wrong number, non-monotone.
2. **C12 F3 / engine: lump sum above €500,000** is taxed at the marginal rate, not capped. Fix `lumpSum()`, the C12 row and `LAW.ls`. Also affects `project()` for large pots.
3. **C22: "Indefinitely" and unlimited Illness Benefit.** Say "Illness Benefit is paid for up to 2 years" and cap or flag any coping time over 24 months. Soften "Income protection is designed for this".
4. **C20: replace "Longer timeframes narrow the range"** with a statement that is true in euro terms ("the yearly return range narrows but the euro range widens"). Show no negative "fall"; when 1.645 × volatility is below the growth rate say "no fall expected in a 1-in-20 year".
5. **C12 F2: retirement age ≤ age** must gate, not become 1 year.
6. **C12 F4: SFT warning** compare like with like (today's money fund vs 2026 threshold, or indexed threshold) or drop the warning when the fund in today's money is below the threshold.
7. **C15 / C16: withdrawal larger than the pot** says "less than a year" (not "0 years" and "lasts to about age 66"). Add the "can't draw before 60" note to C15 when start age is under 60.
8. **C10: say the money earns nothing while it waits**, and show "no cost of waiting" when net growth is zero or negative.
9. **C07 workbook** clamp the deposit like the prototype; prototype to show its message also when the deposit is above the price. Add "before selling costs" to the equity line.
10. **C01 / C03 / C07: stamp duty on new builds** is on the price excluding VAT; say so, or add a "new home" choice. Help to Buy is not included: say so.
11. **Document the rate and timing conventions** in "What your plan assumes" (nominal ÷ 12 for mortgages, effective for APR loans; end-of-month in calculators, end-of-year in pensions, start-of-year in goals). C13: say the extra contribution is level, not rising with pay.
12. **Cosmetic**: double spaces (C03 when saved ≥ need, C09); "+€0" (C05); "About 0%" (C25); duplicated rows when terms are equal (C06); "€0 a month could reach it" (C08); "Paying €0 extra" (C04); "about €181,818" false precision (C01); C12 "About 25%" vs the customer's lump sum percentage.

## 7. What I did not or could not verify

- No primary official page could be opened. Every Irish rule above rests on the register's own sources, my knowledge and web-search secondary sources (listed in my chat summary).
- Illness Benefit €254, survivor's pension €259.50, State Pension €299.30, credit-card cap 23%, the "lower Illness Benefit if you earned under €300 a week" statement and the SFT schedule remain unverified. They are already on `docs/pre-release-verify.md`.
- I did not test the layout, accessibility or the document-reader paths, only the calculation and wording of `run()` and `calcOut()`.
- Scripts and raw results: `/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/aud/` (gen.py, run.js, expect.py, xl_spec.py, xcmp.py, mono.js, cross.js, edge.js). These are scratch files, not part of the repo.
