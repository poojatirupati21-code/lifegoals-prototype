# LifeGoals calculators: verification report

Workbook: `deliverables/LifeGoals-Calculators-Engineering.xlsx` · Source: `LifeGoals-Customer-Journey-Prototype.html` (CALCS array) · 1 Oct 2026

## Totals

| Measure | Result |
|---|---|
| Calculators (C01–C28, CALCS order) | 28 |
| Test cases (calculator × case) | 263 (min 8 per calculator) |
| Cases fully passing | 263 / 263 |
| Individual output checks | 1978 |
| PASS | 1978 |
| FAIL | 0 |
| LibreOffice recalculation | 11 rounds, every one "success" with 0 formula errors (38,211 formulas) |

## Method

1. **Expected values (the prototype itself).** The prototype HTML was loaded in headless Chromium (Playwright). For each case the prototype state was set (inflation chosen or not and its rate via `S.infl`, growth set via `S.assume`, the "Adjust for inflation" switch via `S.adjInfl`, a stated mortgage repayment via `S.fin.mortPayM`/`S.src`, slider-moved flags via `S.calcT`, a pension statement via `S.pdocs`), `applyAssume()` was called as `calcVals()` does, and `C(id).run(v)` was called with the case inputs. The only change to the page was instrumenting `eur()` to record the unrounded number behind every euro figure shown.
2. **Workbook values.** For each round the inputs were written into a copy of the workbook (percentages as fractions), recalculated with LibreOffice (`recalc.py`, status success, 0 errors) and read back with openpyxl `data_only=True`.
3. **Comparison, per output.** (a) The workbook's "As shown in the prototype" text must equal the prototype's displayed text exactly (headline label, headline value, each row value, the figures inside the sentence, the "Add to my plan" goal); a hidden row must be blank in both. (b) The full-precision value must match: money within €0.50 of the unrounded JS number, rates within 0.0001, counts (months, years) and goal values exactly.
4. **Checker test.** Mutating four constants in a copy of the workbook (60-year cap → 59, fall factor 1.6 → 1.5, 3.5× → 3.6×, upkeep 1% → 1.01%) produced 44 FAILs across C01, C07, C15, C16 and C20, so the checker detects small deviations.
5. **Delivered file.** Rebuilt with the Test cases sheet, recalculated in place (success, 0 errors), and its cached default results re-checked against the prototype defaults (207 checks, 0 FAIL).

Rounds (one recalculation each; a calculator without a case in a round is not counted for it):

| Round | Case | Inflation | Growth set |
|---|---|---|---|
| R1 | Defaults | chosen, 2.00% | Standard |
| R2 | Low / edge | not chosen | Standard |
| R3 | High | chosen, 3.50% | Cautious |
| R4 | Random realistic (seed 1) | chosen, 2.75% | Standard |
| R5 | Branch case A | chosen, 2.00% | Cautious |
| R6 | Branch case B | chosen, 3.50% | Standard |
| R7 | Branch case C | not chosen | Cautious |
| R8 | Random realistic (seed 2) | chosen, 2.00% | Cautious |
| R9 | Random realistic (seed 3) | not chosen | Standard |
| R10 | Random realistic (seed 4) | chosen, 3.50% | Standard |
| R11 | Branch case D | chosen, 2.00% | Standard |

## Behaviours to confirm

These are replicated exactly in the workbook (not fixed). Please confirm whether they are intended.

- **C04 Mortgage overpayment.** If the repayment never clears the mortgage (stated repayment ≤ monthly interest) and the extra does not fix it, "With the extra" shows **"Infinity yrs"** and the "Add to my plan" goal years is **Infinity** (C04-R7). If only the extra makes it pay off, "Interest saved" is a large **negative** figure (**−€453,064**, C04-R6), because the "now" interest stops after the first month.
- **C04, C27 (payoff cap).** payoff() stops at 1,200 months and reports that as the answer. C04-R11: €840 a month on €250,000 at 4% shows "Mortgage free now in 100 yrs" (it would take about 121 years). C27-R3: €10 a month on €100,000 at 0% shows "Debt free in 100 yrs", €0 interest, with about €88,000 still owed.
- **C16 Drawdown scenarios.** The headline shows "60+ years", but the Cautious and Balanced rows show "60 yrs" (only the Growth row uses "60+ yrs") (C16-R2).
- **yrs() wording.** Shows "1 months" (C03-R11) and "0 months" (C04-R2, sooner by nothing).
- **C10 Lump-sum vs C18 Regular investing.** Lump-sum: the "Add to my plan" goal is in today's money whenever inflation is chosen, **even with "Adjust for inflation" off** (C10-R1: headline €18,009, goal €13,381). Regular investing always uses the nominal after-fee value.
- **C06 Term comparison.** With Term A = Term B, both rows have the same label ("5-year monthly" twice) and the sentence still says the 5-year term "costs more each month but less interest overall" (C06-R2).
- **C07 Rent vs buy.** A deposit above the price is allowed: negative loan, "Interest + upkeep (buying)" −€62,148, and equity above the home value (C07-R5).
- **C02, C05 rates below 0%.** Rate 1% with a −2% change is calculated at −1% ("If your rate changed to -1.00%", C02-R2; C05-R2). Note the rate uses a hyphen-minus while money uses "−".
- **C23 Mortgage protection.** A stated repayment below the interest makes the balance grow (€272,100, €299,083, €332,030 against €250,000 today, C23-R6), shown without a warning.
- **C20, C01 typed decimals.** The number boxes accept decimals in whole-number fields. Risk style 1.5 gives "undefined · middle outcome" and "€NaN" in the prototype; first-time buyer 0.5 counts as a first-time buyer. Excel cannot produce NaN, so the workbook restricts these inputs to whole numbers (data validation). The real tool should validate them.
- **Calculator count.** CALCS has **28** calculators (C01–C28). The Explore screen note says "29 calculators" and journey-spec.md mentions 35. The designer's Word spec should use C01–C28.

## Results by calculator

Expected = the prototype's value (for money, the unrounded number behind the figure shown). Excel = the workbook's full-precision value. "Shown" is the text the customer sees; both must match exactly. Blank shown = not displayed in that case.

### C01 Borrowing (borrow): 100/100 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C01-R1 Defaults | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R1 Defaults | Homes up to about | €250,000 | €250,000 | 250000 | 250000 | 0 | PASS |
| C01-R1 Defaults | Income multiple used (in the sentence) | 4 | 4 | 4 | 4 | 0 | PASS |
| C01-R1 Defaults | Limit that sets the amount (in the sentence) | deposit | deposit |  |  |  | PASS |
| C01-R1 Defaults | Borrowing by income (lti×) | €240,000 | €240,000 | 240000 | 240000 | 0 | PASS |
| C01-R1 Defaults | Borrowing by deposit (90% LTV) | €225,000 | €225,000 | 225000 | 225000 | 0 | PASS |
| C01-R1 Defaults | Your deposit | €25,000 | €25,000 | 25000 | 25000 | 0 | PASS |
| C01-R1 Defaults | Monthly repayment (illustrative) | €1,074 | €1,074 | 1,074.1844 | 1,074.1844 | -1.14e-12 | PASS |
| C01-R1 Defaults | "Add to my plan" goal amount (Buy a home) | 25000 | 25000 | 25,000 | 25000 | 0 | PASS |
| C01-R1 Defaults | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R2 Low / edge | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R2 Low / edge | Homes up to about | €0 | €0 | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Income multiple used (in the sentence) | 3.5 | 3.5 | 3.5 | 3.5 | 0 | PASS |
| C01-R2 Low / edge | Limit that sets the amount (in the sentence) | deposit | deposit |  |  |  | PASS |
| C01-R2 Low / edge | Borrowing by income (lti×) | €52,500 | €52,500 | 52500 | 52500 | 0 | PASS |
| C01-R2 Low / edge | Borrowing by deposit (90% LTV) | €0 | €0 | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Your deposit | €0 | €0 | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Monthly repayment (illustrative) | €0 | €0 | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | "Add to my plan" goal amount (Buy a home) | 0 | 0 | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R3 High | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R3 High | Homes up to about | €2,250,000 | €2,250,000 | 2250000 | 2250000 | 0 | PASS |
| C01-R3 High | Income multiple used (in the sentence) | 4 | 4 | 4 | 4 | 0 | PASS |
| C01-R3 High | Limit that sets the amount (in the sentence) | income limit | income limit |  |  |  | PASS |
| C01-R3 High | Borrowing by income (lti×) | €2,000,000 | €2,000,000 | 2000000 | 2000000 | 0 | PASS |
| C01-R3 High | Borrowing by deposit (90% LTV) | €2,250,000 | €2,250,000 | 2250000 | 2250000 | 0 | PASS |
| C01-R3 High | Your deposit | €250,000 | €250,000 | 250000 | 250000 | 0 | PASS |
| C01-R3 High | Monthly repayment (illustrative) | €14,205 | €14,205 | 14,205.2176 | 14,205.2176 | -3.46e-11 | PASS |
| C01-R3 High | "Add to my plan" goal amount (Buy a home) | 225000 | 225000 | 225,000 | 225000 | 0 | PASS |
| C01-R3 High | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R4 Random realistic (seed 1) | Homes up to about | €434,000 | €434,000 | 434000 | 434000 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | Income multiple used (in the sentence) | 3.5 | 3.5 | 3.5 | 3.5 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | Limit that sets the amount (in the sentence) | income limit | income limit |  |  |  | PASS |
| C01-R4 Random realistic (seed 1) | Borrowing by income (lti×) | €245,000 | €245,000 | 245000 | 245000 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | Borrowing by deposit (90% LTV) | €1,701,000 | €1,701,000 | 1701000 | 1701000 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | Your deposit | €189,000 | €189,000 | 189000 | 189000 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | Monthly repayment (illustrative) | €1,016 | €1,016 | 1,016.3004 | 1,016.3004 | 4.55e-13 | PASS |
| C01-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Buy a home) | 43400 | 43400 | 43,400 | 43400 | 0 | PASS |
| C01-R4 Random realistic (seed 1) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R5 Branch case A | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R5 Branch case A | Homes up to about | €350,000 | €350,000 | 350000 | 350000 | 0 | PASS |
| C01-R5 Branch case A | Income multiple used (in the sentence) | 3.5 | 3.5 | 3.5 | 3.5 | 0 | PASS |
| C01-R5 Branch case A | Limit that sets the amount (in the sentence) | deposit | deposit |  |  |  | PASS |
| C01-R5 Branch case A | Borrowing by income (lti×) | €420,000 | €420,000 | 420000 | 420000 | 0 | PASS |
| C01-R5 Branch case A | Borrowing by deposit (90% LTV) | €315,000 | €315,000 | 315000 | 315000 | 0 | PASS |
| C01-R5 Branch case A | Your deposit | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C01-R5 Branch case A | Monthly repayment (illustrative) | €1,504 | €1,504 | 1,503.8582 | 1,503.8582 | 6.82e-13 | PASS |
| C01-R5 Branch case A | "Add to my plan" goal amount (Buy a home) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C01-R5 Branch case A | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R6 Branch case B | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R6 Branch case B | Homes up to about | €200,000 | €200,000 | 200000 | 200000 | 0 | PASS |
| C01-R6 Branch case B | Income multiple used (in the sentence) | 4 | 4 | 4 | 4 | 0 | PASS |
| C01-R6 Branch case B | Limit that sets the amount (in the sentence) | income limit | income limit |  |  |  | PASS |
| C01-R6 Branch case B | Borrowing by income (lti×) | €180,000 | €180,000 | 180000 | 180000 | 0 | PASS |
| C01-R6 Branch case B | Borrowing by deposit (90% LTV) | €180,000 | €180,000 | 180000 | 180000 | 0 | PASS |
| C01-R6 Branch case B | Your deposit | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C01-R6 Branch case B | Monthly repayment (illustrative) | €859 | €859 | 859.3475 | 859.3475 | 2.27e-13 | PASS |
| C01-R6 Branch case B | "Add to my plan" goal amount (Buy a home) | 20000 | 20000 | 20,000 | 20000 | 0 | PASS |
| C01-R6 Branch case B | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R7 Branch case C | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R7 Branch case C | Homes up to about | €9,500,000 | €9,500,000 | 9500000 | 9500000 | 0 | PASS |
| C01-R7 Branch case C | Income multiple used (in the sentence) | 4 | 4 | 4 | 4 | 0 | PASS |
| C01-R7 Branch case C | Limit that sets the amount (in the sentence) | income limit | income limit |  |  |  | PASS |
| C01-R7 Branch case C | Borrowing by income (lti×) | €8,000,000 | €8,000,000 | 8000000 | 8000000 | 0 | PASS |
| C01-R7 Branch case C | Borrowing by deposit (90% LTV) | €13,500,000 | €13,500,000 | 13500000 | 13500000 | 0 | PASS |
| C01-R7 Branch case C | Your deposit | €1,500,000 | €1,500,000 | 1500000 | 1500000 | 0 | PASS |
| C01-R7 Branch case C | Monthly repayment (illustrative) | €38,193 | €38,193 | 38,193.2236 | 38,193.2236 | -7.28e-12 | PASS |
| C01-R7 Branch case C | "Add to my plan" goal amount (Buy a home) | 950000 | 950000 | 950,000 | 950000 | 0 | PASS |
| C01-R7 Branch case C | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R8 Random realistic (seed 2) | Homes up to about | €60,000 | €60,000 | 60000 | 60000 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | Income multiple used (in the sentence) | 3.5 | 3.5 | 3.5 | 3.5 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | Limit that sets the amount (in the sentence) | deposit | deposit |  |  |  | PASS |
| C01-R8 Random realistic (seed 2) | Borrowing by income (lti×) | €140,000 | €140,000 | 140000 | 140000 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | Borrowing by deposit (90% LTV) | €54,000 | €54,000 | 54000 | 54000 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | Your deposit | €6,000 | €6,000 | 6000 | 6000 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | Monthly repayment (illustrative) | €472 | €472 | 472.2728 | 472.2728 | 2.27e-13 | PASS |
| C01-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Buy a home) | 6000 | 6000 | 6,000 | 6000 | 0 | PASS |
| C01-R8 Random realistic (seed 2) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R9 Random realistic (seed 3) | Homes up to about | €1,372,000 | €1,372,000 | 1372000 | 1372000 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | Income multiple used (in the sentence) | 4 | 4 | 4 | 4 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | Limit that sets the amount (in the sentence) | income limit | income limit |  |  |  | PASS |
| C01-R9 Random realistic (seed 3) | Borrowing by income (lti×) | €1,228,000 | €1,228,000 | 1228000 | 1228000 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | Borrowing by deposit (90% LTV) | €1,296,000 | €1,296,000 | 1296000 | 1296000 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | Your deposit | €144,000 | €144,000 | 144000 | 144000 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | Monthly repayment (illustrative) | €10,053 | €10,053 | 10,052.6203 | 10,052.6203 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Buy a home) | 137200 | 137200 | 137,200 | 137200 | 0 | PASS |
| C01-R9 Random realistic (seed 3) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | Headline label | Homes up to about | Homes up to about |  |  |  | PASS |
| C01-R10 Random realistic (seed 4) | Homes up to about | €696,000 | €696,000 | 696000 | 696000 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | Income multiple used (in the sentence) | 3.5 | 3.5 | 3.5 | 3.5 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | Limit that sets the amount (in the sentence) | income limit | income limit |  |  |  | PASS |
| C01-R10 Random realistic (seed 4) | Borrowing by income (lti×) | €588,000 | €588,000 | 588000 | 588000 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | Borrowing by deposit (90% LTV) | €972,000 | €972,000 | 972000 | 972000 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | Your deposit | €108,000 | €108,000 | 108000 | 108000 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | Monthly repayment (illustrative) | €2,222 | €2,222 | 2,222.0345 | 2,222.0345 | 3.18e-12 | PASS |
| C01-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Buy a home) | 69600 | 69600 | 69,600 | 69600 | 0 | PASS |
| C01-R10 Random realistic (seed 4) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |

### C02 Mortgage repayment (repayment): 121/121 PASS, 11 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C02-R1 Defaults | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C02-R1 Defaults | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €1,432 | €1,432 | 1,432.2459 | 1,432.2459 | -1.59e-12 | PASS |
| C02-R1 Defaults | What-if: change vs now (in the sentence) |  |  |  |  |  | PASS |
| C02-R1 Defaults | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R1 Defaults | Repayment now |  |  |  |  |  | PASS |
| C02-R1 Defaults | Change over a year |  |  |  |  |  | PASS |
| C02-R1 Defaults | Mortgage free in (months) | 30 yrs | 30 yrs | 360 | 360 | 0 | PASS |
| C02-R1 Defaults | Total interest | €215,609 | €215,609 | 215,608.5191 | 215,608.5191 | -2.91e-10 | PASS |
| C02-R1 Defaults | Total repaid | €515,609 | €515,609 | 515,608.5191 | 515,608.5191 | -2.91e-10 | PASS |
| C02-R1 Defaults | "Add to my plan" goal amount | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C02-R1 Defaults | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R2 Low / edge | Headline label | If your rate changed to -1.00% | If your rate changed to -1.00% |  |  |  | PASS |
| C02-R2 Low / edge | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €812 | €812 | 812.3264 | 812.3264 | 1.14e-13 | PASS |
| C02-R2 Low / edge | What-if: change vs now (in the sentence) | €42 less | €42 less | 42.361 | 42.361 | -7.11e-15 | PASS |
| C02-R2 Low / edge | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R2 Low / edge | Repayment now | €855 | €855 | 854.6874 | 854.6874 | -1.14e-13 | PASS |
| C02-R2 Low / edge | Change over a year | −€508 | −€508 | -508.3316 | -508.3316 | -5.12e-13 | PASS |
| C02-R2 Low / edge | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R2 Low / edge | Total interest |  |  |  |  |  | PASS |
| C02-R2 Low / edge | Total repaid |  |  |  |  |  | PASS |
| C02-R2 Low / edge | "Add to my plan" goal amount | 50000 | 50000 | 50,000 | 50000 | 0 | PASS |
| C02-R2 Low / edge | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R3 High | Headline label | If your rate changed to 11.00% | If your rate changed to 11.00% |  |  |  | PASS |
| C02-R3 High | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €9,370 | €9,370 | 9,369.5765 | 9,369.5765 | 5.46e-12 | PASS |
| C02-R3 High | What-if: change vs now (in the sentence) | €2,267 more | €2,267 more | 2,266.9678 | 2,266.9678 | 1.82e-12 | PASS |
| C02-R3 High | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R3 High | Repayment now | €7,103 | €7,103 | 7,102.6088 | 7,102.6088 | 2.73e-12 | PASS |
| C02-R3 High | Change over a year | €27,204 | €27,204 | 27,203.613 | 27,203.613 | -1.82e-11 | PASS |
| C02-R3 High | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R3 High | Total interest |  |  |  |  |  | PASS |
| C02-R3 High | Total repaid |  |  |  |  |  | PASS |
| C02-R3 High | "Add to my plan" goal amount | 1000000 | 1000000 | 1,000,000 | 1000000 | 0 | PASS |
| C02-R3 High | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R4 Random realistic (seed 1) | Headline label | If your rate changed to 2.05% | If your rate changed to 2.05% |  |  |  | PASS |
| C02-R4 Random realistic (seed 1) | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €7,885 | €7,885 | 7,884.6549 | 7,884.6549 | 3.64e-12 | PASS |
| C02-R4 Random realistic (seed 1) | What-if: change vs now (in the sentence) | €175 less | €175 less | 174.5101 | 174.5101 | 3.13e-13 | PASS |
| C02-R4 Random realistic (seed 1) | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R4 Random realistic (seed 1) | Repayment now | €8,059 | €8,059 | 8,059.165 | 8,059.165 | 1.82e-12 | PASS |
| C02-R4 Random realistic (seed 1) | Change over a year | −€2,094 | −€2,094 | -2,094.1213 | -2,094.1213 | 4.55e-13 | PASS |
| C02-R4 Random realistic (seed 1) | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R4 Random realistic (seed 1) | Total interest |  |  |  |  |  | PASS |
| C02-R4 Random realistic (seed 1) | Total repaid |  |  |  |  |  | PASS |
| C02-R4 Random realistic (seed 1) | "Add to my plan" goal amount | 777000 | 777000 | 777,000 | 777000 | 0 | PASS |
| C02-R4 Random realistic (seed 1) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R5 Branch case A | Headline label | Your monthly repayment | Your monthly repayment |  |  |  | PASS |
| C02-R5 Branch case A | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €1,500 | €1,500 | 1500 | 1500 | 0 | PASS |
| C02-R5 Branch case A | What-if: change vs now (in the sentence) |  |  |  |  |  | PASS |
| C02-R5 Branch case A | Formula repayment (when the stated figure differs by ≥ €5) | €1,432 | €1,432 | 1,432.2459 | 1,432.2459 | -1.59e-12 | PASS |
| C02-R5 Branch case A | Repayment now |  |  |  |  |  | PASS |
| C02-R5 Branch case A | Change over a year |  |  |  |  |  | PASS |
| C02-R5 Branch case A | Mortgage free in (months) | 27 yrs 7 mo | 27 yrs 7 mo | 331 | 331 | 0 | PASS |
| C02-R5 Branch case A | Total interest | €195,199 | €195,199 | 195,199.3195 | 195,199.3195 | -3.78e-10 | PASS |
| C02-R5 Branch case A | Total repaid | €495,199 | €495,199 | 495,199.3195 | 495,199.3195 | -3.49e-10 | PASS |
| C02-R5 Branch case A | "Add to my plan" goal amount | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C02-R5 Branch case A | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R6 Branch case B | Headline label | Your monthly repayment | Your monthly repayment |  |  |  | PASS |
| C02-R6 Branch case B | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €800 | €800 | 800 | 800 | 0 | PASS |
| C02-R6 Branch case B | What-if: change vs now (in the sentence) |  |  |  |  |  | PASS |
| C02-R6 Branch case B | Formula repayment (when the stated figure differs by ≥ €5) | €1,432 | €1,432 | 1,432.2459 | 1,432.2459 | -1.59e-12 | PASS |
| C02-R6 Branch case B | Repayment now |  |  |  |  |  | PASS |
| C02-R6 Branch case B | Change over a year |  |  |  |  |  | PASS |
| C02-R6 Branch case B | Mortgage free in (months) | Not at this repayment | Not at this repayment |  | Never |  | PASS |
| C02-R6 Branch case B | Total interest | — | — |  |  |  | PASS |
| C02-R6 Branch case B | Total repaid | — | — |  |  |  | PASS |
| C02-R6 Branch case B | "Add to my plan" goal amount | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C02-R6 Branch case B | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R7 Branch case C | Headline label | If your rate changed to 4.25% | If your rate changed to 4.25% |  |  |  | PASS |
| C02-R7 Branch case C | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €1,476 | €1,476 | 1,475.8197 | 1,475.8197 | 1.82e-12 | PASS |
| C02-R7 Branch case C | What-if: change vs now (in the sentence) | €44 more | €44 more | 43.5738 | 43.5738 | -1.42e-14 | PASS |
| C02-R7 Branch case C | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R7 Branch case C | Repayment now | €1,432 | €1,432 | 1,432.2459 | 1,432.2459 | -1.59e-12 | PASS |
| C02-R7 Branch case C | Change over a year | €523 | €523 | 522.8854 | 522.8854 | -1.14e-13 | PASS |
| C02-R7 Branch case C | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R7 Branch case C | Total interest |  |  |  |  |  | PASS |
| C02-R7 Branch case C | Total repaid |  |  |  |  |  | PASS |
| C02-R7 Branch case C | "Add to my plan" goal amount | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C02-R7 Branch case C | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R8 Random realistic (seed 2) | Headline label | If your rate changed to 6.45% | If your rate changed to 6.45% |  |  |  | PASS |
| C02-R8 Random realistic (seed 2) | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €5,275 | €5,275 | 5,274.7375 | 5,274.7375 | 0 | PASS |
| C02-R8 Random realistic (seed 2) | What-if: change vs now (in the sentence) | €330 more | €330 more | 330.3595 | 330.3595 | 2.27e-13 | PASS |
| C02-R8 Random realistic (seed 2) | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R8 Random realistic (seed 2) | Repayment now | €4,944 | €4,944 | 4,944.3781 | 4,944.3781 | 0 | PASS |
| C02-R8 Random realistic (seed 2) | Change over a year | €3,964 | €3,964 | 3,964.3136 | 3,964.3136 | 9.09e-13 | PASS |
| C02-R8 Random realistic (seed 2) | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R8 Random realistic (seed 2) | Total interest |  |  |  |  |  | PASS |
| C02-R8 Random realistic (seed 2) | Total repaid |  |  |  |  |  | PASS |
| C02-R8 Random realistic (seed 2) | "Add to my plan" goal amount | 743000 | 743000 | 743,000 | 743000 | 0 | PASS |
| C02-R8 Random realistic (seed 2) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R9 Random realistic (seed 3) | Headline label | If your rate changed to 6.75% | If your rate changed to 6.75% |  |  |  | PASS |
| C02-R9 Random realistic (seed 3) | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €3,368 | €3,368 | 3,368.4218 | 3,368.4218 | -1.82e-12 | PASS |
| C02-R9 Random realistic (seed 3) | What-if: change vs now (in the sentence) | €138 less | €138 less | 138.4764 | 138.4764 | -2.27e-13 | PASS |
| C02-R9 Random realistic (seed 3) | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R9 Random realistic (seed 3) | Repayment now | €3,507 | €3,507 | 3,506.8982 | 3,506.8982 | -3.18e-12 | PASS |
| C02-R9 Random realistic (seed 3) | Change over a year | −€1,662 | −€1,662 | -1,661.7172 | -1,661.7172 | 4.55e-12 | PASS |
| C02-R9 Random realistic (seed 3) | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R9 Random realistic (seed 3) | Total interest |  |  |  |  |  | PASS |
| C02-R9 Random realistic (seed 3) | Total repaid |  |  |  |  |  | PASS |
| C02-R9 Random realistic (seed 3) | "Add to my plan" goal amount | 225000 | 225000 | 225,000 | 225000 | 0 | PASS |
| C02-R9 Random realistic (seed 3) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R10 Random realistic (seed 4) | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C02-R10 Random realistic (seed 4) | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €3,286 | €3,286 | 3,285.7726 | 3,285.7726 | 3.18e-12 | PASS |
| C02-R10 Random realistic (seed 4) | What-if: change vs now (in the sentence) |  |  |  |  |  | PASS |
| C02-R10 Random realistic (seed 4) | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R10 Random realistic (seed 4) | Repayment now |  |  |  |  |  | PASS |
| C02-R10 Random realistic (seed 4) | Change over a year |  |  |  |  |  | PASS |
| C02-R10 Random realistic (seed 4) | Mortgage free in (months) | 15 yrs | 15 yrs | 180 | 180 | 0 | PASS |
| C02-R10 Random realistic (seed 4) | Total interest | €125,439 | €125,439 | 125,439.061 | 125,439.061 | 3.20e-10 | PASS |
| C02-R10 Random realistic (seed 4) | Total repaid | €591,439 | €591,439 | 591,439.061 | 591,439.061 | 3.49e-10 | PASS |
| C02-R10 Random realistic (seed 4) | "Add to my plan" goal amount | 466000 | 466000 | 466,000 | 466000 | 0 | PASS |
| C02-R10 Random realistic (seed 4) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C02-R11 Branch case D | Headline label | If your rate changed to 4.50% | If your rate changed to 4.50% |  |  |  | PASS |
| C02-R11 Branch case D | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €1,588 | €1,588 | 1,587.81 | 1,587.81 | 3.87e-12 | PASS |
| C02-R11 Branch case D | What-if: change vs now (in the sentence) | €88 more | €88 more | 87.81 | 87.81 | -4.26e-14 | PASS |
| C02-R11 Branch case D | Formula repayment (when the stated figure differs by ≥ €5) |  |  |  |  |  | PASS |
| C02-R11 Branch case D | Repayment now | €1,500 | €1,500 | 1500 | 1500 | 0 | PASS |
| C02-R11 Branch case D | Change over a year | €1,054 | €1,054 | 1,053.7205 | 1,053.7205 | -2.50e-12 | PASS |
| C02-R11 Branch case D | Mortgage free in (months) |  |  |  |  |  | PASS |
| C02-R11 Branch case D | Total interest |  |  |  |  |  | PASS |
| C02-R11 Branch case D | Total repaid |  |  |  |  |  | PASS |
| C02-R11 Branch case D | "Add to my plan" goal amount | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C02-R11 Branch case D | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |

### C03 Deposit (deposit): 88/88 PASS, 11 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C03-R1 Defaults | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R1 Defaults | Time to your deposit (months) | 2 yrs 5 mo | 2 yrs 5 mo | 29 | 29 | 0 | PASS |
| C03-R1 Defaults | You need (sentence) | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R1 Defaults | Saving a month (sentence) | €800 | €800 | 800 | 800 | 0 | PASS |
| C03-R1 Defaults | Deposit needed | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R1 Defaults | Still to save | €23,000 | €23,000 | 23000 | 23000 | 0 | PASS |
| C03-R1 Defaults | "Add to my plan" goal amount (Home deposit) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C03-R1 Defaults | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C03-R2 Low / edge | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R2 Low / edge | Time to your deposit (months) | You have it | You have it |  | 0 |  | PASS |
| C03-R2 Low / edge | You need (sentence) | €5,000 | €5,000 | 5000 | 5000 | 0 | PASS |
| C03-R2 Low / edge | Saving a month (sentence) | €50 | €50 | 50 | 50 | 0 | PASS |
| C03-R2 Low / edge | Deposit needed | €5,000 | €5,000 | 5000 | 5000 | 0 | PASS |
| C03-R2 Low / edge | Still to save | €0 | €0 | 0 | 0 | 0 | PASS |
| C03-R2 Low / edge | "Add to my plan" goal amount (Home deposit) | 5000 | 5000 | 5,000 | 5000 | 0 | PASS |
| C03-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C03-R3 High | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R3 High | Time to your deposit (months) | 500 yrs | 500 yrs | 6000 | 6000 | 0 | PASS |
| C03-R3 High | You need (sentence) | €300,000 | €300,000 | 300000 | 300000 | 0 | PASS |
| C03-R3 High | Saving a month (sentence) | €50 | €50 | 50 | 50 | 0 | PASS |
| C03-R3 High | Deposit needed | €300,000 | €300,000 | 300000 | 300000 | 0 | PASS |
| C03-R3 High | Still to save | €300,000 | €300,000 | 300000 | 300000 | 0 | PASS |
| C03-R3 High | "Add to my plan" goal amount (Home deposit) | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C03-R3 High | "Add to my plan" goal years | 500 | 500 | 500 | 500 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R4 Random realistic (seed 1) | Time to your deposit (months) | 6 months | 6 months | 6 | 6 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | You need (sentence) | €38,400 | €38,400 | 38400 | 38400 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | Saving a month (sentence) | €4,550 | €4,550 | 4550 | 4550 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | Deposit needed | €38,400 | €38,400 | 38400 | 38400 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | Still to save | €23,400 | €23,400 | 23400 | 23400 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Home deposit) | 38400 | 38400 | 38,400 | 38400 | 0 | PASS |
| C03-R4 Random realistic (seed 1) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C03-R5 Branch case A | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R5 Branch case A | Time to your deposit (months) | 10 months | 10 months | 10 | 10 | 0 | PASS |
| C03-R5 Branch case A | You need (sentence) | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R5 Branch case A | Saving a month (sentence) | €2,300 | €2,300 | 2300 | 2300 | 0 | PASS |
| C03-R5 Branch case A | Deposit needed | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R5 Branch case A | Still to save | €23,000 | €23,000 | 23000 | 23000 | 0 | PASS |
| C03-R5 Branch case A | "Add to my plan" goal amount (Home deposit) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C03-R5 Branch case A | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C03-R6 Branch case B | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R6 Branch case B | Time to your deposit (months) | 2 yrs 6 mo | 2 yrs 6 mo | 30 | 30 | 0 | PASS |
| C03-R6 Branch case B | You need (sentence) | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R6 Branch case B | Saving a month (sentence) | €800 | €800 | 800 | 800 | 0 | PASS |
| C03-R6 Branch case B | Deposit needed | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R6 Branch case B | Still to save | €24,000 | €24,000 | 24000 | 24000 | 0 | PASS |
| C03-R6 Branch case B | "Add to my plan" goal amount (Home deposit) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C03-R6 Branch case B | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C03-R7 Branch case C | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R7 Branch case C | Time to your deposit (months) | You have it | You have it |  | 0 |  | PASS |
| C03-R7 Branch case C | You need (sentence) | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R7 Branch case C | Saving a month (sentence) | €800 | €800 | 800 | 800 | 0 | PASS |
| C03-R7 Branch case C | Deposit needed | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R7 Branch case C | Still to save | €0 | €0 | 0 | 0 | 0 | PASS |
| C03-R7 Branch case C | "Add to my plan" goal amount (Home deposit) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C03-R7 Branch case C | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R8 Random realistic (seed 2) | Time to your deposit (months) | 5 yrs 6 mo | 5 yrs 6 mo | 66 | 66 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | You need (sentence) | €205,800 | €205,800 | 205800 | 205800 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | Saving a month (sentence) | €2,850 | €2,850 | 2850 | 2850 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | Deposit needed | €205,800 | €205,800 | 205800 | 205800 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | Still to save | €187,300 | €187,300 | 187300 | 187300 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Home deposit) | 205800 | 205800 | 205,800 | 205800 | 0 | PASS |
| C03-R8 Random realistic (seed 2) | "Add to my plan" goal years | 6 | 6 | 6 | 6 | 0 | PASS |
| C03-R9 Random realistic (seed 3) | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R9 Random realistic (seed 3) | Time to your deposit (months) | You have it | You have it |  | 0 |  | PASS |
| C03-R9 Random realistic (seed 3) | You need (sentence) | €71,500 | €71,500 | 71500 | 71500 | 0 | PASS |
| C03-R9 Random realistic (seed 3) | Saving a month (sentence) | €1,750 | €1,750 | 1750 | 1750 | 0 | PASS |
| C03-R9 Random realistic (seed 3) | Deposit needed | €71,500 | €71,500 | 71500 | 71500 | 0 | PASS |
| C03-R9 Random realistic (seed 3) | Still to save | €0 | €0 | 0 | 0 | 0 | PASS |
| C03-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Home deposit) | 71500 | 71500 | 71,500 | 71500 | 0 | PASS |
| C03-R9 Random realistic (seed 3) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C03-R10 Random realistic (seed 4) | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R10 Random realistic (seed 4) | Time to your deposit (months) | You have it | You have it |  | 0 |  | PASS |
| C03-R10 Random realistic (seed 4) | You need (sentence) | €110,500 | €110,500 | 110500 | 110500 | 0 | PASS |
| C03-R10 Random realistic (seed 4) | Saving a month (sentence) | €3,800 | €3,800 | 3800 | 3800 | 0 | PASS |
| C03-R10 Random realistic (seed 4) | Deposit needed | €110,500 | €110,500 | 110500 | 110500 | 0 | PASS |
| C03-R10 Random realistic (seed 4) | Still to save | €0 | €0 | 0 | 0 | 0 | PASS |
| C03-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Home deposit) | 110500 | 110500 | 110,500 | 110500 | 0 | PASS |
| C03-R10 Random realistic (seed 4) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C03-R11 Branch case D | Headline label | Time to your deposit | Time to your deposit |  |  |  | PASS |
| C03-R11 Branch case D | Time to your deposit (months) | 1 months | 1 months | 1 | 1 | 0 | PASS |
| C03-R11 Branch case D | You need (sentence) | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R11 Branch case D | Saving a month (sentence) | €50 | €50 | 50 | 50 | 0 | PASS |
| C03-R11 Branch case D | Deposit needed | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C03-R11 Branch case D | Still to save | €50 | €50 | 50 | 50 | 0 | PASS |
| C03-R11 Branch case D | "Add to my plan" goal amount (Home deposit) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C03-R11 Branch case D | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |

### C04 Mortgage overpayment (overpay): 99/99 PASS, 11 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C04-R1 Defaults | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R1 Defaults | Mortgage free sooner by (months) | 5 yrs 1 mo | 5 yrs 1 mo | 61 | 61 | 0 | PASS |
| C04-R1 Defaults | Extra a month (sentence) | €200 | €200 | 200 | 200 | 0 | PASS |
| C04-R1 Defaults | On top of (repayment now, sentence) | €1,320 | €1,320 | 1,319.5921 | 1,319.5921 | 4.55e-12 | PASS |
| C04-R1 Defaults | Mortgage free now in (months) | 25 yrs | 25 yrs | 300 | 300 | 0 | PASS |
| C04-R1 Defaults | With the extra (months) | 19 yrs 11 mo | 19 yrs 11 mo | 239 | 239 | 0 | PASS |
| C04-R1 Defaults | Interest saved | €32,877 | €32,877 | 32,877.2219 | 32,877.2219 | 4.37e-11 | PASS |
| C04-R1 Defaults | "Add to my plan" goal amount (Mortgage free) | 250000 | 250000 | 250,000 | 250000 | 0 | PASS |
| C04-R1 Defaults | "Add to my plan" goal years | 20 | 20 | 20 | 20 | 0 | PASS |
| C04-R2 Low / edge | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R2 Low / edge | Mortgage free sooner by (months) | 0 months | 0 months | 0 | 0 | 0 | PASS |
| C04-R2 Low / edge | Extra a month (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C04-R2 Low / edge | On top of (repayment now, sentence) | €564 | €564 | 564.162 | 564.162 | -3.41e-13 | PASS |
| C04-R2 Low / edge | Mortgage free now in (months) | 3 yrs | 3 yrs | 36 | 36 | 0 | PASS |
| C04-R2 Low / edge | With the extra (months) | 3 yrs | 3 yrs | 36 | 36 | 0 | PASS |
| C04-R2 Low / edge | Interest saved | €0 | €0 | 0 | 0 | 0 | PASS |
| C04-R2 Low / edge | "Add to my plan" goal amount (Mortgage free) | 20000 | 20000 | 20,000 | 20000 | 0 | PASS |
| C04-R2 Low / edge | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C04-R3 High | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R3 High | Mortgage free sooner by (months) | 18 yrs 5 mo | 18 yrs 5 mo | 221 | 221 | 0 | PASS |
| C04-R3 High | Extra a month (sentence) | €2,000 | €2,000 | 2000 | 2000 | 0 | PASS |
| C04-R3 High | On top of (repayment now, sentence) | €7,103 | €7,103 | 7,102.6088 | 7,102.6088 | 2.73e-12 | PASS |
| C04-R3 High | Mortgage free now in (months) | 35 yrs | 35 yrs | 420 | 420 | 0 | PASS |
| C04-R3 High | With the extra (months) | 16 yrs 7 mo | 16 yrs 7 mo | 199 | 199 | 0 | PASS |
| C04-R3 High | Interest saved | €1,177,199 | €1,177,199 | 1,177,199.1362 | 1,177,199.1362 | -3.96e-09 | PASS |
| C04-R3 High | "Add to my plan" goal amount (Mortgage free) | 1000000 | 1000000 | 1,000,000 | 1000000 | 0 | PASS |
| C04-R3 High | "Add to my plan" goal years | 17 | 17 | 17 | 17 | 0 | PASS |
| C04-R4 Random realistic (seed 1) | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R4 Random realistic (seed 1) | Mortgage free sooner by (months) | 26 yrs 3 mo | 26 yrs 3 mo | 315 | 315 | 0 | PASS |
| C04-R4 Random realistic (seed 1) | Extra a month (sentence) | €1,900 | €1,900 | 1900 | 1900 | 0 | PASS |
| C04-R4 Random realistic (seed 1) | On top of (repayment now, sentence) | €1,409 | €1,409 | 1,409.1658 | 1,409.1658 | 6.82e-13 | PASS |
| C04-R4 Random realistic (seed 1) | Mortgage free now in (months) | 34 yrs | 34 yrs | 408 | 408 | 0 | PASS |
| C04-R4 Random realistic (seed 1) | With the extra (months) | 7 yrs 9 mo | 7 yrs 9 mo | 93 | 93 | 0 | PASS |
| C04-R4 Random realistic (seed 1) | Interest saved | €268,190 | €268,190 | 268,189.921 | 268,189.921 | -4.66e-10 | PASS |
| C04-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Mortgage free) | 245000 | 245000 | 245,000 | 245000 | 0 | PASS |
| C04-R4 Random realistic (seed 1) | "Add to my plan" goal years | 8 | 8 | 8 | 8 | 0 | PASS |
| C04-R5 Branch case A | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R5 Branch case A | Mortgage free sooner by (months) | 3 yrs 5 mo | 3 yrs 5 mo | 41 | 41 | 0 | PASS |
| C04-R5 Branch case A | Extra a month (sentence) | €200 | €200 | 200 | 200 | 0 | PASS |
| C04-R5 Branch case A | On top of (repayment now, sentence) | €1,500 | €1,500 | 1500 | 1500 | 0 | PASS |
| C04-R5 Branch case A | Mortgage free now in (months) | 20 yrs 4 mo | 20 yrs 4 mo | 244 | 244 | 0 | PASS |
| C04-R5 Branch case A | With the extra (months) | 16 yrs 11 mo | 16 yrs 11 mo | 203 | 203 | 0 | PASS |
| C04-R5 Branch case A | Interest saved | €21,352 | €21,352 | 21,352.1047 | 21,352.1047 | -1.46e-11 | PASS |
| C04-R5 Branch case A | "Add to my plan" goal amount (Mortgage free) | 250000 | 250000 | 250,000 | 250000 | 0 | PASS |
| C04-R5 Branch case A | "Add to my plan" goal years | 17 | 17 | 17 | 17 | 0 | PASS |
| C04-R6 Branch case B | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R6 Branch case B | Mortgage free sooner by (months) | — | — |  |  |  | PASS |
| C04-R6 Branch case B | Extra a month (sentence) | €200 | €200 | 200 | 200 | 0 | PASS |
| C04-R6 Branch case B | On top of (repayment now, sentence) | €700 | €700 | 700 | 700 | 0 | PASS |
| C04-R6 Branch case B | Mortgage free now in (months) | — | — |  |  |  | PASS |
| C04-R6 Branch case B | With the extra (months) | 65 yrs 3 mo | 65 yrs 3 mo | 783 | 783 | 0 | PASS |
| C04-R6 Branch case B | Interest saved | −€453,064 | −€453,064 | -453,063.5863 | -453,063.5863 | -4.66e-10 | PASS |
| C04-R6 Branch case B | "Add to my plan" goal amount (Mortgage free) | 250000 | 250000 | 250,000 | 250000 | 0 | PASS |
| C04-R6 Branch case B | "Add to my plan" goal years | 66 | 66 | 66 | 66 | 0 | PASS |
| C04-R7 Branch case C | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R7 Branch case C | Mortgage free sooner by (months) | — | — |  |  |  | PASS |
| C04-R7 Branch case C | Extra a month (sentence) | €100 | €100 | 100 | 100 | 0 | PASS |
| C04-R7 Branch case C | On top of (repayment now, sentence) | €700 | €700 | 700 | 700 | 0 | PASS |
| C04-R7 Branch case C | Mortgage free now in (months) | — | — |  |  |  | PASS |
| C04-R7 Branch case C | With the extra (months) | Infinity yrs | Infinity yrs |  | Infinity |  | PASS |
| C04-R7 Branch case C | Interest saved | €0 | €0 | 0 | 0 | 0 | PASS |
| C04-R7 Branch case C | "Add to my plan" goal amount (Mortgage free) | 250000 | 250000 | 250,000 | 250000 | 0 | PASS |
| C04-R7 Branch case C | "Add to my plan" goal years | Infinity | Infinity | Infinity | Infinity |  | PASS |
| C04-R8 Random realistic (seed 2) | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R8 Random realistic (seed 2) | Mortgage free sooner by (months) | 8 months | 8 months | 8 | 8 | 0 | PASS |
| C04-R8 Random realistic (seed 2) | Extra a month (sentence) | €475 | €475 | 475 | 475 | 0 | PASS |
| C04-R8 Random realistic (seed 2) | On top of (repayment now, sentence) | €7,295 | €7,295 | 7,295.1261 | 7,295.1261 | 1.82e-12 | PASS |
| C04-R8 Random realistic (seed 2) | Mortgage free now in (months) | 10 yrs | 10 yrs | 120 | 120 | 0 | PASS |
| C04-R8 Random realistic (seed 2) | With the extra (months) | 9 yrs 4 mo | 9 yrs 4 mo | 112 | 112 | 0 | PASS |
| C04-R8 Random realistic (seed 2) | Interest saved | €9,881 | €9,881 | 9,881.0506 | 9,881.0506 | -3.64e-12 | PASS |
| C04-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Mortgage free) | 743000 | 743000 | 743,000 | 743000 | 0 | PASS |
| C04-R8 Random realistic (seed 2) | "Add to my plan" goal years | 10 | 10 | 10 | 10 | 0 | PASS |
| C04-R9 Random realistic (seed 3) | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R9 Random realistic (seed 3) | Mortgage free sooner by (months) | 5 yrs 8 mo | 5 yrs 8 mo | 68 | 68 | 0 | PASS |
| C04-R9 Random realistic (seed 3) | Extra a month (sentence) | €800 | €800 | 800 | 800 | 0 | PASS |
| C04-R9 Random realistic (seed 3) | On top of (repayment now, sentence) | €2,203 | €2,203 | 2,203.1051 | 2,203.1051 | -2.27e-12 | PASS |
| C04-R9 Random realistic (seed 3) | Mortgage free now in (months) | 19 yrs | 19 yrs | 228 | 228 | 0 | PASS |
| C04-R9 Random realistic (seed 3) | With the extra (months) | 13 yrs 4 mo | 13 yrs 4 mo | 160 | 160 | 0 | PASS |
| C04-R9 Random realistic (seed 3) | Interest saved | €22,640 | €22,640 | 22,640.0952 | 22,640.0952 | 2.18e-11 | PASS |
| C04-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Mortgage free) | 429000 | 429000 | 429,000 | 429000 | 0 | PASS |
| C04-R9 Random realistic (seed 3) | "Add to my plan" goal years | 14 | 14 | 14 | 14 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R10 Random realistic (seed 4) | Mortgage free sooner by (months) | 17 yrs 8 mo | 17 yrs 8 mo | 212 | 212 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | Extra a month (sentence) | €1,350 | €1,350 | 1350 | 1350 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | On top of (repayment now, sentence) | €422 | €422 | 422.3563 | 422.3563 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | Mortgage free now in (months) | 22 yrs | 22 yrs | 264 | 264 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | With the extra (months) | 4 yrs 4 mo | 4 yrs 4 mo | 52 | 52 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | Interest saved | €19,942 | €19,942 | 19,941.5971 | 19,941.5971 | -3.64e-12 | PASS |
| C04-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Mortgage free) | 87000 | 87000 | 87,000 | 87000 | 0 | PASS |
| C04-R10 Random realistic (seed 4) | "Add to my plan" goal years | 5 | 5 | 5 | 5 | 0 | PASS |
| C04-R11 Branch case D | Headline label | Mortgage free sooner by | Mortgage free sooner by |  |  |  | PASS |
| C04-R11 Branch case D | Mortgage free sooner by (months) | 0 months | 0 months | 0 | 0 | 0 | PASS |
| C04-R11 Branch case D | Extra a month (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C04-R11 Branch case D | On top of (repayment now, sentence) | €840 | €840 | 840 | 840 | 0 | PASS |
| C04-R11 Branch case D | Mortgage free now in (months) | 100 yrs | 100 yrs | 1200 | 1200 | 0 | PASS |
| C04-R11 Branch case D | With the extra (months) | 100 yrs | 100 yrs | 1200 | 1200 | 0 | PASS |
| C04-R11 Branch case D | Interest saved | €0 | €0 | 0 | 0 | 0 | PASS |
| C04-R11 Branch case D | "Add to my plan" goal amount (Mortgage free) | 250000 | 250000 | 250,000 | 250000 | 0 | PASS |
| C04-R11 Branch case D | "Add to my plan" goal years | 100 | 100 | 100 | 100 | 0 | PASS |

### C05 Interest rate impact (ratechange): 60/60 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C05-R1 Defaults | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R1 Defaults | Monthly change | +€170 | +€170 | 170.2596 | 170.2596 | 5.12e-13 | PASS |
| C05-R1 Defaults | New rate (sentence) | 5.00% | 5.00% |  | 0.05 |  | PASS |
| C05-R1 Defaults | Now | €1,584 | €1,584 | 1,583.5105 | 1,583.5105 | -4.55e-13 | PASS |
| C05-R1 Defaults | After change | €1,754 | €1,754 | 1,753.7701 | 1,753.7701 | 0 | PASS |
| C05-R1 Defaults | Change over a year | €2,043 | €2,043 | 2,043.1152 | 2,043.1152 | -4.09e-12 | PASS |
| C05-R2 Low / edge | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R2 Low / edge | Monthly change | −€42 | −€42 | -42.361 | -42.361 | 7.11e-15 | PASS |
| C05-R2 Low / edge | New rate (sentence) | -1.00% | -1.00% |  | -0.01 |  | PASS |
| C05-R2 Low / edge | Now | €855 | €855 | 854.6874 | 854.6874 | -1.14e-13 | PASS |
| C05-R2 Low / edge | After change | €812 | €812 | 812.3264 | 812.3264 | 1.14e-13 | PASS |
| C05-R2 Low / edge | Change over a year | −€508 | −€508 | -508.3316 | -508.3316 | -5.12e-13 | PASS |
| C05-R3 High | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R3 High | Monthly change | +€2,267 | +€2,267 | 2,266.9678 | 2,266.9678 | 1.82e-12 | PASS |
| C05-R3 High | New rate (sentence) | 11.00% | 11.00% |  | 0.11 |  | PASS |
| C05-R3 High | Now | €7,103 | €7,103 | 7,102.6088 | 7,102.6088 | 2.73e-12 | PASS |
| C05-R3 High | After change | €9,370 | €9,370 | 9,369.5765 | 9,369.5765 | 5.46e-12 | PASS |
| C05-R3 High | Change over a year | €27,204 | €27,204 | 27,203.613 | 27,203.613 | -1.82e-11 | PASS |
| C05-R4 Random realistic (seed 1) | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R4 Random realistic (seed 1) | Monthly change | +€248 | +€248 | 247.6207 | 247.6207 | -3.41e-13 | PASS |
| C05-R4 Random realistic (seed 1) | New rate (sentence) | 6.25% | 6.25% |  | 0.0625 |  | PASS |
| C05-R4 Random realistic (seed 1) | Now | €1,646 | €1,646 | 1,646.407 | 1,646.407 | -3.41e-12 | PASS |
| C05-R4 Random realistic (seed 1) | After change | €1,894 | €1,894 | 1,894.0277 | 1,894.0277 | 2.27e-12 | PASS |
| C05-R4 Random realistic (seed 1) | Change over a year | €2,971 | €2,971 | 2,971.4479 | 2,971.4479 | -2.27e-12 | PASS |
| C05-R5 Branch case A | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R5 Branch case A | Monthly change | +€84 | +€84 | 83.9869 | 83.9869 | -2.84e-14 | PASS |
| C05-R5 Branch case A | New rate (sentence) | 4.50% | 4.50% |  | 0.045 |  | PASS |
| C05-R5 Branch case A | Now | €1,500 | €1,500 | 1500 | 1500 | 0 | PASS |
| C05-R5 Branch case A | After change | €1,584 | €1,584 | 1,583.9869 | 1,583.9869 | 3.87e-12 | PASS |
| C05-R5 Branch case A | Change over a year | €1,008 | €1,008 | 1,007.843 | 1,007.843 | -2.27e-12 | PASS |
| C05-R6 Branch case B | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R6 Branch case B | Monthly change | +€0 | +€0 | 0 | 0 | 0 | PASS |
| C05-R6 Branch case B | New rate (sentence) | 4.00% | 4.00% |  | 0.04 |  | PASS |
| C05-R6 Branch case B | Now | €1,584 | €1,584 | 1,583.5105 | 1,583.5105 | -4.55e-13 | PASS |
| C05-R6 Branch case B | After change | €1,584 | €1,584 | 1,583.5105 | 1,583.5105 | -4.55e-13 | PASS |
| C05-R6 Branch case B | Change over a year | €0 | €0 | 0 | 0 | 0 | PASS |
| C05-R7 Branch case C | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R7 Branch case C | Monthly change | −€208 | −€208 | -207.5532 | -207.5532 | 5.68e-14 | PASS |
| C05-R7 Branch case C | New rate (sentence) | 0.50% | 0.50% |  | 0.005 |  | PASS |
| C05-R7 Branch case C | Now | €1,272 | €1,272 | 1,271.563 | 1,271.563 | 2.05e-12 | PASS |
| C05-R7 Branch case C | After change | €1,064 | €1,064 | 1,064.0098 | 1,064.0098 | 1.14e-12 | PASS |
| C05-R7 Branch case C | Change over a year | −€2,491 | −€2,491 | -2,490.6387 | -2,490.6387 | -1.36e-12 | PASS |
| C05-R8 Random realistic (seed 2) | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R8 Random realistic (seed 2) | Monthly change | +€1,208 | +€1,208 | 1,207.9077 | 1,207.9077 | -9.09e-13 | PASS |
| C05-R8 Random realistic (seed 2) | New rate (sentence) | 6.55% | 6.55% |  | 0.0655 |  | PASS |
| C05-R8 Random realistic (seed 2) | Now | €5,933 | €5,933 | 5,932.9702 | 5,932.9702 | -2.73e-12 | PASS |
| C05-R8 Random realistic (seed 2) | After change | €7,141 | €7,141 | 7,140.8779 | 7,140.8779 | -3.64e-12 | PASS |
| C05-R8 Random realistic (seed 2) | Change over a year | €14,495 | €14,495 | 14,494.8922 | 14,494.8922 | 4.91e-11 | PASS |
| C05-R9 Random realistic (seed 3) | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R9 Random realistic (seed 3) | Monthly change | +€1,392 | +€1,392 | 1,392.1031 | 1,392.1031 | -1.36e-12 | PASS |
| C05-R9 Random realistic (seed 3) | New rate (sentence) | 8.20% | 8.20% |  | 0.082 |  | PASS |
| C05-R9 Random realistic (seed 3) | Now | €5,265 | €5,265 | 5,265.481 | 5,265.481 | -5.46e-12 | PASS |
| C05-R9 Random realistic (seed 3) | After change | €6,658 | €6,658 | 6,657.584 | 6,657.584 | 3.64e-12 | PASS |
| C05-R9 Random realistic (seed 3) | Change over a year | €16,705 | €16,705 | 16,705.2366 | 16,705.2366 | -1.82e-11 | PASS |
| C05-R10 Random realistic (seed 4) | Headline label | Monthly change | Monthly change |  |  |  | PASS |
| C05-R10 Random realistic (seed 4) | Monthly change | +€818 | +€818 | 818.4103 | 818.4103 | -1.14e-13 | PASS |
| C05-R10 Random realistic (seed 4) | New rate (sentence) | 7.70% | 7.70% |  | 0.077 |  | PASS |
| C05-R10 Random realistic (seed 4) | Now | €12,006 | €12,006 | 12,006.3894 | 12,006.3894 | -2.55e-11 | PASS |
| C05-R10 Random realistic (seed 4) | After change | €12,825 | €12,825 | 12,824.7998 | 12,824.7998 | 2.18e-11 | PASS |
| C05-R10 Random realistic (seed 4) | Change over a year | €9,821 | €9,821 | 9,820.9242 | 9,820.9242 | 0 | PASS |

### C06 Term comparison (term): 63/63 PASS, 9 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C06-R1 Defaults | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R1 Defaults | Interest difference | €82,843 | €82,843 | 82,843.0174 | 82,843.0174 | -2.91e-11 | PASS |
| C06-R1 Defaults | Shorter term named in the sentence (years) | 25 | 25 | 25 | 25 | 0 | PASS |
| C06-R1 Defaults | Term A monthly | €1,584 | €1,584 | 1,583.5105 | 1,583.5105 | -4.55e-13 | PASS |
| C06-R1 Defaults | Term B monthly | €1,328 | €1,328 | 1,328.3242 | 1,328.3242 | -1.59e-12 | PASS |
| C06-R1 Defaults | Term A total interest | €175,053 | €175,053 | 175,053.1563 | 175,053.1563 | -1.46e-10 | PASS |
| C06-R1 Defaults | Term B total interest | €257,896 | €257,896 | 257,896.1737 | 257,896.1737 | -1.75e-10 | PASS |
| C06-R2 Low / edge | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R2 Low / edge | Interest difference | €0 | €0 | 0 | 0 | 0 | PASS |
| C06-R2 Low / edge | Shorter term named in the sentence (years) | 5 | 5 | 5 | 5 | 0 | PASS |
| C06-R2 Low / edge | Term A monthly | €855 | €855 | 854.6874 | 854.6874 | -1.14e-13 | PASS |
| C06-R2 Low / edge | Term B monthly | €855 | €855 | 854.6874 | 854.6874 | -1.14e-13 | PASS |
| C06-R2 Low / edge | Term A total interest | €1,281 | €1,281 | 1,281.2423 | 1,281.2423 | -4.55e-12 | PASS |
| C06-R2 Low / edge | Term B total interest | €1,281 | €1,281 | 1,281.2423 | 1,281.2423 | -4.55e-12 | PASS |
| C06-R3 High | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R3 High | Interest difference | €1,766,512 | €1,766,512 | 1,766,512.0343 | 1,766,512.0343 | 2.10e-09 | PASS |
| C06-R3 High | Shorter term named in the sentence (years) | 5 | 5 | 5 | 5 | 0 | PASS |
| C06-R3 High | Term A monthly | €7,103 | €7,103 | 7,102.6088 | 7,102.6088 | 2.73e-12 | PASS |
| C06-R3 High | Term B monthly | €20,276 | €20,276 | 20,276.3943 | 20,276.3943 | 4.37e-11 | PASS |
| C06-R3 High | Term A total interest | €1,983,096 | €1,983,096 | 1,983,095.6916 | 1,983,095.6916 | 9.31e-10 | PASS |
| C06-R3 High | Term B total interest | €216,584 | €216,584 | 216,583.6573 | 216,583.6573 | -3.20e-10 | PASS |
| C06-R4 Random realistic (seed 1) | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R4 Random realistic (seed 1) | Interest difference | €78,619 | €78,619 | 78,618.6741 | 78,618.6741 | -2.91e-11 | PASS |
| C06-R4 Random realistic (seed 1) | Shorter term named in the sentence (years) | 8 | 8 | 8 | 8 | 0 | PASS |
| C06-R4 Random realistic (seed 1) | Term A monthly | €4,473 | €4,473 | 4,473.0033 | 4,473.0033 | -1.82e-12 | PASS |
| C06-R4 Random realistic (seed 1) | Term B monthly | €3,024 | €3,024 | 3,023.9702 | 3,023.9702 | 2.27e-12 | PASS |
| C06-R4 Random realistic (seed 1) | Term A total interest | €93,408 | €93,408 | 93,408.3128 | 93,408.3128 | 2.91e-11 | PASS |
| C06-R4 Random realistic (seed 1) | Term B total interest | €172,027 | €172,027 | 172,026.9868 | 172,026.9868 | 0 | PASS |
| C06-R5 Branch case A | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R5 Branch case A | Interest difference | €6,796 | €6,796 | 6,796.0598 | 6,796.0598 | 9.09e-13 | PASS |
| C06-R5 Branch case A | Shorter term named in the sentence (years) | 10 | 10 | 10 | 10 | 0 | PASS |
| C06-R5 Branch case A | Term A monthly | €1,080 | €1,080 | 1,080.202 | 1,080.202 | 3.18e-12 | PASS |
| C06-R5 Branch case A | Term B monthly | €568 | €568 | 568.4179 | 568.4179 | -4.55e-13 | PASS |
| C06-R5 Branch case A | Term A total interest | €6,624 | €6,624 | 6,624.2408 | 6,624.2408 | -1.82e-12 | PASS |
| C06-R5 Branch case A | Term B total interest | €13,420 | €13,420 | 13,420.3006 | 13,420.3006 | -4.18e-11 | PASS |
| C06-R6 Branch case B | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R6 Branch case B | Interest difference | €67,397 | €67,397 | 67,397.2659 | 67,397.2659 | 1.46e-11 | PASS |
| C06-R6 Branch case B | Shorter term named in the sentence (years) | 20 | 20 | 20 | 20 | 0 | PASS |
| C06-R6 Branch case B | Term A monthly | €1,740 | €1,740 | 1,739.8792 | 1,739.8792 | 4.77e-12 | PASS |
| C06-R6 Branch case B | Term B monthly | €1,347 | €1,347 | 1,347.1341 | 1,347.1341 | -4.55e-13 | PASS |
| C06-R6 Branch case B | Term A total interest | €117,571 | €117,571 | 117,570.9969 | 117,570.9969 | 0 | PASS |
| C06-R6 Branch case B | Term B total interest | €184,968 | €184,968 | 184,968.2628 | 184,968.2628 | -3.78e-10 | PASS |
| C06-R8 Random realistic (seed 2) | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R8 Random realistic (seed 2) | Interest difference | €131,826 | €131,826 | 131,825.6748 | 131,825.6748 | 1.75e-10 | PASS |
| C06-R8 Random realistic (seed 2) | Shorter term named in the sentence (years) | 28 | 28 | 28 | 28 | 0 | PASS |
| C06-R8 Random realistic (seed 2) | Term A monthly | €2,996 | €2,996 | 2,995.9649 | 2,995.9649 | 9.09e-13 | PASS |
| C06-R8 Random realistic (seed 2) | Term B monthly | €3,246 | €3,246 | 3,245.6191 | 3,245.6191 | 9.09e-13 | PASS |
| C06-R8 Random realistic (seed 2) | Term A total interest | €642,354 | €642,354 | 642,353.6936 | 642,353.6936 | 0 | PASS |
| C06-R8 Random realistic (seed 2) | Term B total interest | €510,528 | €510,528 | 510,528.0188 | 510,528.0188 | -1.75e-10 | PASS |
| C06-R9 Random realistic (seed 3) | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R9 Random realistic (seed 3) | Interest difference | €47,996 | €47,996 | 47,995.7327 | 47,995.7327 | 2.18e-11 | PASS |
| C06-R9 Random realistic (seed 3) | Shorter term named in the sentence (years) | 10 | 10 | 10 | 10 | 0 | PASS |
| C06-R9 Random realistic (seed 3) | Term A monthly | €2,573 | €2,573 | 2,573.4276 | 2,573.4276 | 2.27e-12 | PASS |
| C06-R9 Random realistic (seed 3) | Term B monthly | €1,189 | €1,189 | 1,189.3568 | 1,189.3568 | 1.82e-12 | PASS |
| C06-R9 Random realistic (seed 3) | Term A total interest | €29,811 | €29,811 | 29,811.3104 | 29,811.3104 | 8.00e-11 | PASS |
| C06-R9 Random realistic (seed 3) | Term B total interest | €77,807 | €77,807 | 77,807.043 | 77,807.043 | 1.02e-10 | PASS |
| C06-R10 Random realistic (seed 4) | Headline label | Interest difference | Interest difference |  |  |  | PASS |
| C06-R10 Random realistic (seed 4) | Interest difference | €344,691 | €344,691 | 344,691.4162 | 344,691.4162 | -4.66e-10 | PASS |
| C06-R10 Random realistic (seed 4) | Shorter term named in the sentence (years) | 11 | 11 | 11 | 11 | 0 | PASS |
| C06-R10 Random realistic (seed 4) | Term A monthly | €7,748 | €7,748 | 7,748.1014 | 7,748.1014 | 1.82e-12 | PASS |
| C06-R10 Random realistic (seed 4) | Term B monthly | €3,256 | €3,256 | 3,255.8114 | 3,255.8114 | -5.46e-12 | PASS |
| C06-R10 Random realistic (seed 4) | Term A total interest | €138,749 | €138,749 | 138,749.39 | 138,749.39 | -8.73e-11 | PASS |
| C06-R10 Random realistic (seed 4) | Term B total interest | €483,441 | €483,441 | 483,440.8062 | 483,440.8062 | -5.82e-10 | PASS |

### C07 Rent vs buy (rentbuy): 63/63 PASS, 9 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C07-R1 Defaults | Headline label | Home equity after 10 yrs | Home equity after 10 yrs |  |  |  | PASS |
| C07-R1 Defaults | Home equity after the years | €178,479 | €178,479 | 178,478.5755 | 178,478.5755 | 4.37e-10 | PASS |
| C07-R1 Defaults | Rent paid | €216,000 | €216,000 | 216000 | 216000 | 0 | PASS |
| C07-R1 Defaults | Interest + upkeep (buying) | €148,632 | €148,632 | 148,632.4532 | 148,632.4532 | 2.91e-11 | PASS |
| C07-R1 Defaults | Home value | €426,648 | €426,648 | 426,648.047 | 426,648.047 | -5.82e-11 | PASS |
| C07-R1 Defaults | "Add to my plan" goal amount (Buy a home) | 35000 | 35000 | 35,000 | 35000 | 0 | PASS |
| C07-R1 Defaults | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R2 Low / edge | Headline label | Home equity after 1 yrs | Home equity after 1 yrs |  |  |  | PASS |
| C07-R2 Low / edge | Home equity after the years | €2,873 | €2,873 | 2,872.8176 | 2,872.8176 | 4.55e-12 | PASS |
| C07-R2 Low / edge | Rent paid | €6,000 | €6,000 | 6000 | 6000 | 0 | PASS |
| C07-R2 Low / edge | Interest + upkeep (buying) | €1,987 | €1,987 | 1,986.8567 | 1,986.8567 | 3.41e-12 | PASS |
| C07-R2 Low / edge | Home value | €100,000 | €100,000 | 100000 | 100000 | 0 | PASS |
| C07-R2 Low / edge | "Add to my plan" goal amount (Buy a home) | 0 | 0 | 0 | 0 | 0 | PASS |
| C07-R2 Low / edge | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R3 High | Headline label | Home equity after 30 yrs | Home equity after 30 yrs |  |  |  | PASS |
| C07-R3 High | Home equity after the years | €5,743,491 | €5,743,491 | 5,743,491.1729 | 5,743,491.1729 | 2.79e-09 | PASS |
| C07-R3 High | Rent paid | €1,800,000 | €1,800,000 | 1800000 | 1800000 | 0 | PASS |
| C07-R3 High | Interest + upkeep (buying) | €1,449,087 | €1,449,087 | 1,449,086.7262 | 1,449,086.7262 | -4.19e-09 | PASS |
| C07-R3 High | Home value | €5,743,491 | €5,743,491 | 5,743,491.1729 | 5,743,491.1729 | 9.31e-10 | PASS |
| C07-R3 High | "Add to my plan" goal amount (Buy a home) | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C07-R3 High | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R4 Random realistic (seed 1) | Headline label | Home equity after 5 yrs | Home equity after 5 yrs |  |  |  | PASS |
| C07-R4 Random realistic (seed 1) | Home equity after the years | €291,993 | €291,993 | 291,993.3615 | 291,993.3615 | 1.16e-10 | PASS |
| C07-R4 Random realistic (seed 1) | Rent paid | €225,000 | €225,000 | 225000 | 225000 | 0 | PASS |
| C07-R4 Random realistic (seed 1) | Interest + upkeep (buying) | €25,241 | €25,241 | 25,241.1344 | 25,241.1344 | 3.27e-11 | PASS |
| C07-R4 Random realistic (seed 1) | Home value | €344,731 | €344,731 | 344,730.8812 | 344,730.8812 | 1.16e-10 | PASS |
| C07-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Buy a home) | 261000 | 261000 | 261,000 | 261000 | 0 | PASS |
| C07-R4 Random realistic (seed 1) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R5 Branch case A | Headline label | Home equity after 10 yrs | Home equity after 10 yrs |  |  |  | PASS |
| C07-R5 Branch case A | Home equity after the years | €279,467 | €279,467 | 279,467.3604 | 279,467.3604 | 1.16e-10 | PASS |
| C07-R5 Branch case A | Rent paid | €216,000 | €216,000 | 216000 | 216000 | 0 | PASS |
| C07-R5 Branch case A | Interest + upkeep (buying) | −€62,148 | −€62,148 | -62,147.5893 | -62,147.5893 | 4.37e-11 | PASS |
| C07-R5 Branch case A | Home value | €121,899 | €121,899 | 121,899.442 | 121,899.442 | 2.62e-10 | PASS |
| C07-R5 Branch case A | "Add to my plan" goal amount (Buy a home) | 300000 | 300000 | 300,000 | 300000 | 0 | PASS |
| C07-R5 Branch case A | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R6 Branch case B | Headline label | Home equity after 10 yrs | Home equity after 10 yrs |  |  |  | PASS |
| C07-R6 Branch case B | Home equity after the years | €426,648 | €426,648 | 426,648.047 | 426,648.047 | -5.82e-11 | PASS |
| C07-R6 Branch case B | Rent paid | €216,000 | €216,000 | 216000 | 216000 | 0 | PASS |
| C07-R6 Branch case B | Interest + upkeep (buying) | €35,000 | €35,000 | 35000 | 35000 | 0 | PASS |
| C07-R6 Branch case B | Home value | €426,648 | €426,648 | 426,648.047 | 426,648.047 | -5.82e-11 | PASS |
| C07-R6 Branch case B | "Add to my plan" goal amount (Buy a home) | 350000 | 350000 | 350,000 | 350000 | 0 | PASS |
| C07-R6 Branch case B | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R8 Random realistic (seed 2) | Headline label | Home equity after 17 yrs | Home equity after 17 yrs |  |  |  | PASS |
| C07-R8 Random realistic (seed 2) | Home equity after the years | €631,279 | €631,279 | 631,279.0604 | 631,279.0604 | 0 | PASS |
| C07-R8 Random realistic (seed 2) | Rent paid | €989,400 | €989,400 | 989400 | 989400 | 0 | PASS |
| C07-R8 Random realistic (seed 2) | Interest + upkeep (buying) | €110,382 | €110,382 | 110,381.9853 | 110,381.9853 | 2.47e-10 | PASS |
| C07-R8 Random realistic (seed 2) | Home value | €771,383 | €771,383 | 771,382.5356 | 771,382.5356 | 3.49e-10 | PASS |
| C07-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Buy a home) | 74000 | 74000 | 74,000 | 74000 | 0 | PASS |
| C07-R8 Random realistic (seed 2) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R9 Random realistic (seed 3) | Headline label | Home equity after 16 yrs | Home equity after 16 yrs |  |  |  | PASS |
| C07-R9 Random realistic (seed 3) | Home equity after the years | €997,927 | €997,927 | 997,927.0786 | 997,927.0786 | -1.16e-10 | PASS |
| C07-R9 Random realistic (seed 3) | Rent paid | €931,200 | €931,200 | 931200 | 931200 | 0 | PASS |
| C07-R9 Random realistic (seed 3) | Interest + upkeep (buying) | €1,174,278 | €1,174,278 | 1,174,277.6653 | 1,174,277.6653 | -3.49e-09 | PASS |
| C07-R9 Random realistic (seed 3) | Home value | €1,655,957 | €1,655,957 | 1,655,956.668 | 1,655,956.668 | -2.79e-09 | PASS |
| C07-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Buy a home) | 66000 | 66000 | 66,000 | 66000 | 0 | PASS |
| C07-R9 Random realistic (seed 3) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C07-R10 Random realistic (seed 4) | Headline label | Home equity after 27 yrs | Home equity after 27 yrs |  |  |  | PASS |
| C07-R10 Random realistic (seed 4) | Home equity after the years | €1,765,635 | €1,765,635 | 1,765,635.1631 | 1,765,635.1631 | 6.98e-10 | PASS |
| C07-R10 Random realistic (seed 4) | Rent paid | €1,490,400 | €1,490,400 | 1490400 | 1490400 | 0 | PASS |
| C07-R10 Random realistic (seed 4) | Interest + upkeep (buying) | €461,844 | €461,844 | 461,843.9874 | 461,843.9874 | 4.66e-10 | PASS |
| C07-R10 Random realistic (seed 4) | Home value | €1,843,670 | €1,843,670 | 1,843,669.8746 | 1,843,669.8746 | -1.40e-09 | PASS |
| C07-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Buy a home) | 260000 | 260000 | 260,000 | 260000 | 0 | PASS |
| C07-R10 Random realistic (seed 4) | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |

### C08 Goal planner (goalplanner): 90/90 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C08-R1 Defaults | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R1 Defaults | Monthly amount (illustrative) | €372 | €372 | 372.2508 | 372.2508 | 3.41e-13 | PASS |
| C08-R1 Defaults | Goal in today's prices | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C08-R1 Defaults | Will cost about (in y yrs) | €15,918 | €15,918 | 15,918.12 | 15,918.12 | -1.82e-12 | PASS |
| C08-R1 Defaults | Will cost about (sentence) | €15,918 | €15,918 | 15,918.12 | 15,918.12 | -1.82e-12 | PASS |
| C08-R1 Defaults | Already saved | €2,000 | €2,000 | 2000 | 2000 | 0 | PASS |
| C08-R1 Defaults | Inflation rate quoted (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C08-R1 Defaults | "Add to my plan" goal amount (My goal) | 15000 | 15000 | 15,000 | 15000 | 0 | PASS |
| C08-R1 Defaults | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C08-R2 Low / edge | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R2 Low / edge | Monthly amount (illustrative) | €0 | €0 | 0 | 0 | 0 | PASS |
| C08-R2 Low / edge | Goal in today's prices | €500 | €500 | 500 | 500 | 0 | PASS |
| C08-R2 Low / edge | Will cost about (in y yrs) |  |  |  |  |  | PASS |
| C08-R2 Low / edge | Will cost about (sentence) |  |  |  |  |  | PASS |
| C08-R2 Low / edge | Already saved | €200,000 | €200,000 | 200000 | 200000 | 0 | PASS |
| C08-R2 Low / edge | Inflation rate quoted (sentence) |  |  |  |  |  | PASS |
| C08-R2 Low / edge | "Add to my plan" goal amount (My goal) | 500 | 500 | 500 | 500 | 0 | PASS |
| C08-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C08-R3 High | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R3 High | Monthly amount (illustrative) | €1,200 | €1,200 | 1,200.0459 | 1,200.0459 | -1.36e-12 | PASS |
| C08-R3 High | Goal in today's prices | €500,000 | €500,000 | 500000 | 500000 | 0 | PASS |
| C08-R3 High | Will cost about (in y yrs) | €1,403,397 | €1,403,397 | 1,403,396.8524 | 1,403,396.8524 | -3.73e-09 | PASS |
| C08-R3 High | Will cost about (sentence) | €1,403,397 | €1,403,397 | 1,403,396.8524 | 1,403,396.8524 | -3.73e-09 | PASS |
| C08-R3 High | Already saved | €0 | €0 | 0 | 0 | 0 | PASS |
| C08-R3 High | Inflation rate quoted (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C08-R3 High | "Add to my plan" goal amount (My goal) | 500000 | 500000 | 500,000 | 500000 | 0 | PASS |
| C08-R3 High | "Add to my plan" goal years | 30 | 30 | 30 | 30 | 0 | PASS |
| C08-R4 Random realistic (seed 1) | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R4 Random realistic (seed 1) | Monthly amount (illustrative) | €896 | €896 | 896.0268 | 896.0268 | 4.55e-13 | PASS |
| C08-R4 Random realistic (seed 1) | Goal in today's prices | €83,500 | €83,500 | 83500 | 83500 | 0 | PASS |
| C08-R4 Random realistic (seed 1) | Will cost about (in y yrs) | €95,630 | €95,630 | 95,630.3242 | 95,630.3242 | 0 | PASS |
| C08-R4 Random realistic (seed 1) | Will cost about (sentence) | €95,630 | €95,630 | 95,630.3242 | 95,630.3242 | 0 | PASS |
| C08-R4 Random realistic (seed 1) | Already saved | €34,000 | €34,000 | 34000 | 34000 | 0 | PASS |
| C08-R4 Random realistic (seed 1) | Inflation rate quoted (sentence) | 2.75% | 2.75% |  | 0.0275 |  | PASS |
| C08-R4 Random realistic (seed 1) | "Add to my plan" goal amount (My goal) | 83500 | 83500 | 83,500 | 83500 | 0 | PASS |
| C08-R4 Random realistic (seed 1) | "Add to my plan" goal years | 5 | 5 | 5 | 5 | 0 | PASS |
| C08-R5 Branch case A | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R5 Branch case A | Monthly amount (illustrative) | €387 | €387 | 386.6144 | 386.6144 | 4.55e-13 | PASS |
| C08-R5 Branch case A | Goal in today's prices | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C08-R5 Branch case A | Will cost about (in y yrs) | €15,918 | €15,918 | 15,918.12 | 15,918.12 | -1.82e-12 | PASS |
| C08-R5 Branch case A | Will cost about (sentence) | €15,918 | €15,918 | 15,918.12 | 15,918.12 | -1.82e-12 | PASS |
| C08-R5 Branch case A | Already saved | €2,000 | €2,000 | 2000 | 2000 | 0 | PASS |
| C08-R5 Branch case A | Inflation rate quoted (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C08-R5 Branch case A | "Add to my plan" goal amount (My goal) | 15000 | 15000 | 15,000 | 15000 | 0 | PASS |
| C08-R5 Branch case A | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C08-R6 Branch case B | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R6 Branch case B | Monthly amount (illustrative) | €48 | €48 | 47.8641 | 47.8641 | -4.26e-14 | PASS |
| C08-R6 Branch case B | Goal in today's prices | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C08-R6 Branch case B | Will cost about (in y yrs) | €16,631 | €16,631 | 16,630.7681 | 16,630.7681 | 3.64e-12 | PASS |
| C08-R6 Branch case B | Will cost about (sentence) | €16,631 | €16,631 | 16,630.7681 | 16,630.7681 | 3.64e-12 | PASS |
| C08-R6 Branch case B | Already saved | €14,000 | €14,000 | 14000 | 14000 | 0 | PASS |
| C08-R6 Branch case B | Inflation rate quoted (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C08-R6 Branch case B | "Add to my plan" goal amount (My goal) | 15000 | 15000 | 15,000 | 15000 | 0 | PASS |
| C08-R6 Branch case B | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |
| C08-R7 Branch case C | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R7 Branch case C | Monthly amount (illustrative) | €85 | €85 | 85.154 | 85.154 | -1.42e-14 | PASS |
| C08-R7 Branch case C | Goal in today's prices | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C08-R7 Branch case C | Will cost about (in y yrs) |  |  |  |  |  | PASS |
| C08-R7 Branch case C | Will cost about (sentence) |  |  |  |  |  | PASS |
| C08-R7 Branch case C | Already saved | €2,000 | €2,000 | 2000 | 2000 | 0 | PASS |
| C08-R7 Branch case C | Inflation rate quoted (sentence) |  |  |  |  |  | PASS |
| C08-R7 Branch case C | "Add to my plan" goal amount (My goal) | 15000 | 15000 | 15,000 | 15000 | 0 | PASS |
| C08-R7 Branch case C | "Add to my plan" goal years | 10 | 10 | 10 | 10 | 0 | PASS |
| C08-R8 Random realistic (seed 2) | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R8 Random realistic (seed 2) | Monthly amount (illustrative) | €192 | €192 | 192.4712 | 192.4712 | -3.69e-13 | PASS |
| C08-R8 Random realistic (seed 2) | Goal in today's prices | €144,000 | €144,000 | 144000 | 144000 | 0 | PASS |
| C08-R8 Random realistic (seed 2) | Will cost about (in y yrs) | €193,805 | €193,805 | 193,805.0407 | 193,805.0407 | 2.91e-10 | PASS |
| C08-R8 Random realistic (seed 2) | Will cost about (sentence) | €193,805 | €193,805 | 193,805.0407 | 193,805.0407 | 2.91e-10 | PASS |
| C08-R8 Random realistic (seed 2) | Already saved | €53,000 | €53,000 | 53000 | 53000 | 0 | PASS |
| C08-R8 Random realistic (seed 2) | Inflation rate quoted (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C08-R8 Random realistic (seed 2) | "Add to my plan" goal amount (My goal) | 144000 | 144000 | 144,000 | 144000 | 0 | PASS |
| C08-R8 Random realistic (seed 2) | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C08-R9 Random realistic (seed 3) | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R9 Random realistic (seed 3) | Monthly amount (illustrative) | €143 | €143 | 142.7038 | 142.7038 | -3.98e-13 | PASS |
| C08-R9 Random realistic (seed 3) | Goal in today's prices | €283,500 | €283,500 | 283500 | 283500 | 0 | PASS |
| C08-R9 Random realistic (seed 3) | Will cost about (in y yrs) |  |  |  |  |  | PASS |
| C08-R9 Random realistic (seed 3) | Will cost about (sentence) |  |  |  |  |  | PASS |
| C08-R9 Random realistic (seed 3) | Already saved | €72,500 | €72,500 | 72500 | 72500 | 0 | PASS |
| C08-R9 Random realistic (seed 3) | Inflation rate quoted (sentence) |  |  |  |  |  | PASS |
| C08-R9 Random realistic (seed 3) | "Add to my plan" goal amount (My goal) | 283500 | 283500 | 283,500 | 283500 | 0 | PASS |
| C08-R9 Random realistic (seed 3) | "Add to my plan" goal years | 17 | 17 | 17 | 17 | 0 | PASS |
| C08-R10 Random realistic (seed 4) | Headline label | Monthly amount (illustrative) | Monthly amount (illustrative) |  |  |  | PASS |
| C08-R10 Random realistic (seed 4) | Monthly amount (illustrative) | €0 | €0 | 0 | 0 | 0 | PASS |
| C08-R10 Random realistic (seed 4) | Goal in today's prices | €365,500 | €365,500 | 365500 | 365500 | 0 | PASS |
| C08-R10 Random realistic (seed 4) | Will cost about (in y yrs) | €991,191 | €991,191 | 991,191.4001 | 991,191.4001 | -4.66e-10 | PASS |
| C08-R10 Random realistic (seed 4) | Will cost about (sentence) | €991,191 | €991,191 | 991,191.4001 | 991,191.4001 | -4.66e-10 | PASS |
| C08-R10 Random realistic (seed 4) | Already saved | €143,000 | €143,000 | 143000 | 143000 | 0 | PASS |
| C08-R10 Random realistic (seed 4) | Inflation rate quoted (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C08-R10 Random realistic (seed 4) | "Add to my plan" goal amount (My goal) | 365500 | 365500 | 365,500 | 365500 | 0 | PASS |
| C08-R10 Random realistic (seed 4) | "Add to my plan" goal years | 29 | 29 | 29 | 29 | 0 | PASS |

### C09 Compound growth (compound): 72/72 PASS, 9 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C09-R1 Defaults | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R1 Defaults | Could grow to | €83,724 | €83,724 | 83,723.9615 | 83,723.9615 | 0 | PASS |
| C09-R1 Defaults | Paid in | €53,000 | €53,000 | 53000 | 53000 | 0 | PASS |
| C09-R1 Defaults | Illustrative growth | €30,724 | €30,724 | 30,723.9615 | 30,723.9615 | 7.28e-12 | PASS |
| C09-R1 Defaults | Worth in today's money (prices rising [inflation] a year) | €56,344 | €56,344 | 56,343.826 | 56,343.826 | 2.91e-11 | PASS |
| C09-R1 Defaults | Worth about … in today's money (sentence) | €56,344 | €56,344 | 56,343.826 | 56,343.826 | 2.91e-11 | PASS |
| C09-R1 Defaults | "Add to my plan" goal amount (Build wealth) | 56344 | 56344 | 56,344 | 56344 | 0 | PASS |
| C09-R1 Defaults | "Add to my plan" goal years | 20 | 20 | 20 | 20 | 0 | PASS |
| C09-R2 Low / edge | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R2 Low / edge | Could grow to | €0 | €0 | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Paid in | €0 | €0 | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Illustrative growth | €0 | €0 | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C09-R2 Low / edge | Worth about … in today's money (sentence) |  |  |  |  |  | PASS |
| C09-R2 Low / edge | "Add to my plan" goal amount (Build wealth) | 0 | 0 | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C09-R3 High | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R3 High | Could grow to | €14,008,142 | €14,008,142 | 14,008,142.3364 | 14,008,142.3364 | 2.98e-08 | PASS |
| C09-R3 High | Paid in | €1,640,000 | €1,640,000 | 1640000 | 1640000 | 0 | PASS |
| C09-R3 High | Illustrative growth | €12,368,142 | €12,368,142 | 12,368,142.3364 | 12,368,142.3364 | 2.98e-08 | PASS |
| C09-R3 High | Worth in today's money (prices rising [inflation] a year) | €3,538,071 | €3,538,071 | 3,538,071.0847 | 3,538,071.0847 | 4.66e-10 | PASS |
| C09-R3 High | Worth about … in today's money (sentence) | €3,538,071 | €3,538,071 | 3,538,071.0847 | 3,538,071.0847 | 4.66e-10 | PASS |
| C09-R3 High | "Add to my plan" goal amount (Build wealth) | 3538071 | 3538071 | 3,538,071 | 3538071 | 0 | PASS |
| C09-R3 High | "Add to my plan" goal years | 40 | 40 | 40 | 40 | 0 | PASS |
| C09-R4 Random realistic (seed 1) | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R4 Random realistic (seed 1) | Could grow to | €5,206,992 | €5,206,992 | 5,206,992.1255 | 5,206,992.1255 | 0 | PASS |
| C09-R4 Random realistic (seed 1) | Paid in | €1,318,900 | €1,318,900 | 1318900 | 1318900 | 0 | PASS |
| C09-R4 Random realistic (seed 1) | Illustrative growth | €3,888,092 | €3,888,092 | 3,888,092.1255 | 3,888,092.1255 | 0 | PASS |
| C09-R4 Random realistic (seed 1) | Worth in today's money (prices rising [inflation] a year) | €1,960,835 | €1,960,835 | 1,960,834.8686 | 1,960,834.8686 | 6.98e-10 | PASS |
| C09-R4 Random realistic (seed 1) | Worth about … in today's money (sentence) | €1,960,835 | €1,960,835 | 1,960,834.8686 | 1,960,834.8686 | 6.98e-10 | PASS |
| C09-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Build wealth) | 1960835 | 1960835 | 1,960,835 | 1960835 | 0 | PASS |
| C09-R4 Random realistic (seed 1) | "Add to my plan" goal years | 36 | 36 | 36 | 36 | 0 | PASS |
| C09-R5 Branch case A | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R5 Branch case A | Could grow to | €53,000 | €53,000 | 53000 | 53000 | 0 | PASS |
| C09-R5 Branch case A | Paid in | €53,000 | €53,000 | 53000 | 53000 | 0 | PASS |
| C09-R5 Branch case A | Illustrative growth | €0 | €0 | 0 | 0 | 0 | PASS |
| C09-R5 Branch case A | Worth in today's money (prices rising [inflation] a year) | €35,667 | €35,667 | 35,667.4807 | 35,667.4807 | -4.37e-11 | PASS |
| C09-R5 Branch case A | Worth about … in today's money (sentence) | €35,667 | €35,667 | 35,667.4807 | 35,667.4807 | -4.37e-11 | PASS |
| C09-R5 Branch case A | "Add to my plan" goal amount (Build wealth) | 35667 | 35667 | 35,667 | 35667 | 0 | PASS |
| C09-R5 Branch case A | "Add to my plan" goal years | 20 | 20 | 20 | 20 | 0 | PASS |
| C09-R7 Branch case C | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R7 Branch case C | Could grow to | €10,956 | €10,956 | 10,955.6157 | 10,955.6157 | -3.64e-12 | PASS |
| C09-R7 Branch case C | Paid in | €5,000 | €5,000 | 5000 | 5000 | 0 | PASS |
| C09-R7 Branch case C | Illustrative growth | €5,956 | €5,956 | 5,955.6157 | 5,955.6157 | -3.64e-12 | PASS |
| C09-R7 Branch case C | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C09-R7 Branch case C | Worth about … in today's money (sentence) |  |  |  |  |  | PASS |
| C09-R7 Branch case C | "Add to my plan" goal amount (Build wealth) | 10956 | 10956 | 10,956 | 10956 | 0 | PASS |
| C09-R7 Branch case C | "Add to my plan" goal years | 20 | 20 | 20 | 20 | 0 | PASS |
| C09-R8 Random realistic (seed 2) | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R8 Random realistic (seed 2) | Could grow to | €462,218 | €462,218 | 462,218.033 | 462,218.033 | 1.75e-10 | PASS |
| C09-R8 Random realistic (seed 2) | Paid in | €370,600 | €370,600 | 370600 | 370600 | 0 | PASS |
| C09-R8 Random realistic (seed 2) | Illustrative growth | €91,618 | €91,618 | 91,618.033 | 91,618.033 | -4.37e-11 | PASS |
| C09-R8 Random realistic (seed 2) | Worth in today's money (prices rising [inflation] a year) | €364,456 | €364,456 | 364,455.7647 | 364,455.7647 | -5.82e-11 | PASS |
| C09-R8 Random realistic (seed 2) | Worth about … in today's money (sentence) | €364,456 | €364,456 | 364,455.7647 | 364,455.7647 | -5.82e-11 | PASS |
| C09-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Build wealth) | 364456 | 364456 | 364,456 | 364456 | 0 | PASS |
| C09-R8 Random realistic (seed 2) | "Add to my plan" goal years | 12 | 12 | 12 | 12 | 0 | PASS |
| C09-R9 Random realistic (seed 3) | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R9 Random realistic (seed 3) | Could grow to | €254,135 | €254,135 | 254,134.7652 | 254,134.7652 | -8.73e-11 | PASS |
| C09-R9 Random realistic (seed 3) | Paid in | €157,800 | €157,800 | 157800 | 157800 | 0 | PASS |
| C09-R9 Random realistic (seed 3) | Illustrative growth | €96,335 | €96,335 | 96,334.7652 | 96,334.7652 | 1.46e-11 | PASS |
| C09-R9 Random realistic (seed 3) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C09-R9 Random realistic (seed 3) | Worth about … in today's money (sentence) |  |  |  |  |  | PASS |
| C09-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Build wealth) | 254135 | 254135 | 254,135 | 254135 | 0 | PASS |
| C09-R9 Random realistic (seed 3) | "Add to my plan" goal years | 18 | 18 | 18 | 18 | 0 | PASS |
| C09-R10 Random realistic (seed 4) | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C09-R10 Random realistic (seed 4) | Could grow to | €1,285,434 | €1,285,434 | 1,285,434.179 | 1,285,434.179 | -3.96e-09 | PASS |
| C09-R10 Random realistic (seed 4) | Paid in | €763,200 | €763,200 | 763200 | 763200 | 0 | PASS |
| C09-R10 Random realistic (seed 4) | Illustrative growth | €522,234 | €522,234 | 522,234.179 | 522,234.179 | 5.82e-11 | PASS |
| C09-R10 Random realistic (seed 4) | Worth in today's money (prices rising [inflation] a year) | €692,028 | €692,028 | 692,027.8094 | 692,027.8094 | 3.49e-10 | PASS |
| C09-R10 Random realistic (seed 4) | Worth about … in today's money (sentence) | €692,028 | €692,028 | 692,027.8094 | 692,027.8094 | 3.49e-10 | PASS |
| C09-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Build wealth) | 692028 | 692028 | 692,028 | 692028 | 0 | PASS |
| C09-R10 Random realistic (seed 4) | "Add to my plan" goal years | 18 | 18 | 18 | 18 | 0 | PASS |

### C10 Lump sum growth (lumpsum): 121/121 PASS, 11 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C10-R1 Defaults | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C10-R1 Defaults | Headline figure | €18,009 | €18,009 | 18,009.4351 | 18,009.4351 | 3.64e-11 | PASS |
| C10-R1 Defaults | Real return a year (sentence) |  |  |  |  |  | PASS |
| C10-R1 Defaults | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C10-R1 Defaults | Cost of waiting (sentence) | €3,207 | €3,207 | 3,206.9922 | 3,206.9922 | 9.09e-13 | PASS |
| C10-R1 Defaults | If you start today | €18,009 | €18,009 | 18,009.4351 | 18,009.4351 | 3.64e-11 | PASS |
| C10-R1 Defaults | If you start in 5 years | €14,802 | €14,802 | 14,802.4428 | 14,802.4428 | -4.37e-11 | PASS |
| C10-R1 Defaults | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C10-R1 Defaults | Fees cost |  |  |  |  |  | PASS |
| C10-R1 Defaults | "Add to my plan" goal amount (Build wealth) | 13381 | 13381 | 13,381 | 13381 | 0 | PASS |
| C10-R1 Defaults | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C10-R2 Low / edge | Headline label | Could grow to | Could grow to |  |  |  | PASS |
| C10-R2 Low / edge | Headline figure | €500 | €500 | 500 | 500 | 0 | PASS |
| C10-R2 Low / edge | Real return a year (sentence) |  |  |  |  |  | PASS |
| C10-R2 Low / edge | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C10-R2 Low / edge | Cost of waiting (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C10-R2 Low / edge | If you start today | €500 | €500 | 500 | 500 | 0 | PASS |
| C10-R2 Low / edge | If you start in 5 years | €500 | €500 | 500 | 500 | 0 | PASS |
| C10-R2 Low / edge | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C10-R2 Low / edge | Fees cost |  |  |  |  |  | PASS |
| C10-R2 Low / edge | "Add to my plan" goal amount (Build wealth) | 500 | 500 | 500 | 500 | 0 | PASS |
| C10-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C10-R3 High | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C10-R3 High | Headline figure | €811,289 | €811,289 | 811,289.0284 | 811,289.0284 | -3.49e-10 | PASS |
| C10-R3 High | Real return a year (sentence) | 1.2% | 1.2% | 0.012174 | 0.012174 | 3.12e-17 | PASS |
| C10-R3 High | Growth after fees quoted (sentence) | 4.76% | 4.76% |  | 0.0476 |  | PASS |
| C10-R3 High | Cost of waiting (sentence) | €168,308 | €168,308 | 168,308.0073 | 168,308.0073 | 1.46e-10 | PASS |
| C10-R3 High | If you start today | €3,212,104 | €3,212,104 | 3,212,103.9722 | 3,212,103.9722 | 2.79e-09 | PASS |
| C10-R3 High | If you start in 5 years | €2,545,729 | €2,545,729 | 2,545,728.8581 | 2,545,728.8581 | -3.26e-09 | PASS |
| C10-R3 High | Worth in today's money (prices rising [inflation] a year) | €811,289 | €811,289 | 811,289.0284 | 811,289.0284 | -3.49e-10 | PASS |
| C10-R3 High | Fees cost | €7,650,157 | €7,650,157 | 7,650,156.7762 | 7,650,156.7762 | -2.79e-09 | PASS |
| C10-R3 High | "Add to my plan" goal amount (Build wealth) | 811289 | 811289 | 811,289 | 811289 | 0 | PASS |
| C10-R3 High | "Add to my plan" goal years | 40 | 40 | 40 | 40 | 0 | PASS |
| C10-R4 Random realistic (seed 1) | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C10-R4 Random realistic (seed 1) | Headline figure | €496,841 | €496,841 | 496,840.9979 | 496,840.9979 | 3.49e-10 | PASS |
| C10-R4 Random realistic (seed 1) | Real return a year (sentence) | 0.3% | 0.3% | 0.003148 | 0.003148 | -1.73e-18 | PASS |
| C10-R4 Random realistic (seed 1) | Growth after fees quoted (sentence) | 3.07% | 3.07% |  | 0.0307 |  | PASS |
| C10-R4 Random realistic (seed 1) | Cost of waiting (sentence) | €69,787 | €69,787 | 69,787.4752 | 69,787.4752 | -2.91e-11 | PASS |
| C10-R4 Random realistic (seed 1) | If you start today | €1,392,923 | €1,392,923 | 1,392,922.6045 | 1,392,922.6045 | 2.56e-09 | PASS |
| C10-R4 Random realistic (seed 1) | If you start in 5 years | €1,197,269 | €1,197,269 | 1,197,269.363 | 1,197,269.363 | -2.10e-09 | PASS |
| C10-R4 Random realistic (seed 1) | Worth in today's money (prices rising [inflation] a year) | €496,841 | €496,841 | 496,840.9979 | 496,840.9979 | 3.49e-10 | PASS |
| C10-R4 Random realistic (seed 1) | Fees cost | €1,979,435 | €1,979,435 | 1,979,434.5649 | 1,979,434.5649 | -2.33e-09 | PASS |
| C10-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Build wealth) | 496841 | 496841 | 496,841 | 496841 | 0 | PASS |
| C10-R4 Random realistic (seed 1) | "Add to my plan" goal years | 38 | 38 | 38 | 38 | 0 | PASS |
| C10-R5 Branch case A | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C10-R5 Branch case A | Headline figure | €11,509 | €11,509 | 11,508.6778 | 11,508.6778 | 1.82e-12 | PASS |
| C10-R5 Branch case A | Real return a year (sentence) | 0.9% | 0.9% | 0.009412 | 0.009412 | -3.47e-18 | PASS |
| C10-R5 Branch case A | Growth after fees quoted (sentence) | 2.96% | 2.96% |  | 0.0296 |  | PASS |
| C10-R5 Branch case A | Cost of waiting (sentence) | €1,562 | €1,562 | 1,561.8921 | 1,561.8921 | -3.87e-12 | PASS |
| C10-R5 Branch case A | If you start today | €15,489 | €15,489 | 15,489.1651 | 15,489.1651 | -3.82e-11 | PASS |
| C10-R5 Branch case A | If you start in 5 years | €13,387 | €13,387 | 13,387.064 | 13,387.064 | 3.27e-11 | PASS |
| C10-R5 Branch case A | Worth in today's money (prices rising [inflation] a year) | €11,509 | €11,509 | 11,508.6778 | 11,508.6778 | 1.82e-12 | PASS |
| C10-R5 Branch case A | Fees cost | €2,520 | €2,520 | 2,520.27 | 2,520.27 | -4.55e-12 | PASS |
| C10-R5 Branch case A | "Add to my plan" goal amount (Build wealth) | 11509 | 11509 | 11,509 | 11509 | 0 | PASS |
| C10-R5 Branch case A | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C10-R6 Branch case B | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C10-R6 Branch case B | Headline figure | €16,705 | €16,705 | 16,704.9931 | 16,704.9931 | -2.91e-11 | PASS |
| C10-R6 Branch case B | Real return a year (sentence) |  |  |  |  |  | PASS |
| C10-R6 Branch case B | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C10-R6 Branch case B | Cost of waiting (sentence) | €2,626 | €2,626 | 2,626.2398 | 2,626.2398 | 3.18e-12 | PASS |
| C10-R6 Branch case B | If you start today | €16,705 | €16,705 | 16,704.9931 | 16,704.9931 | -2.91e-11 | PASS |
| C10-R6 Branch case B | If you start in 5 years | €14,079 | €14,079 | 14,078.7533 | 14,078.7533 | 1.64e-11 | PASS |
| C10-R6 Branch case B | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C10-R6 Branch case B | Fees cost | €1,304 | €1,304 | 1,304.442 | 1,304.442 | -2.50e-12 | PASS |
| C10-R6 Branch case B | "Add to my plan" goal amount (Build wealth) | 9971 | 9971 | 9,971 | 9971 | 0 | PASS |
| C10-R6 Branch case B | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C10-R7 Branch case C | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C10-R7 Branch case C | Headline figure | €17,346 | €17,346 | 17,345.7729 | 17,345.7729 | 7.28e-12 | PASS |
| C10-R7 Branch case C | Real return a year (sentence) |  |  |  |  |  | PASS |
| C10-R7 Branch case C | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C10-R7 Branch case C | Cost of waiting (sentence) | €2,909 | €2,909 | 2,909.2555 | 2,909.2555 | 2.73e-12 | PASS |
| C10-R7 Branch case C | If you start today | €17,346 | €17,346 | 17,345.7729 | 17,345.7729 | 7.28e-12 | PASS |
| C10-R7 Branch case C | If you start in 5 years | €14,437 | €14,437 | 14,436.5173 | 14,436.5173 | -2.73e-11 | PASS |
| C10-R7 Branch case C | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C10-R7 Branch case C | Fees cost | €664 | €664 | 663.6622 | 663.6622 | 2.27e-13 | PASS |
| C10-R7 Branch case C | "Add to my plan" goal amount (Build wealth) | 17346 | 17346 | 17,346 | 17346 | 0 | PASS |
| C10-R7 Branch case C | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C10-R8 Random realistic (seed 2) | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C10-R8 Random realistic (seed 2) | Headline figure | €59,815 | €59,815 | 59,815.3009 | 59,815.3009 | -1.46e-11 | PASS |
| C10-R8 Random realistic (seed 2) | Real return a year (sentence) | -3.7% | -3.7% | -0.037255 | -0.037255 | -6.94e-18 | PASS |
| C10-R8 Random realistic (seed 2) | Growth after fees quoted (sentence) | -1.8% | -1.8% |  | -0.018 |  | PASS |
| C10-R8 Random realistic (seed 2) | Cost of waiting (sentence) | −€5,687 | −€5,687 | -5,686.7432 | -5,686.7432 | -5.46e-12 | PASS |
| C10-R8 Random realistic (seed 2) | If you start today | €119,624 | €119,624 | 119,623.9954 | 119,623.9954 | 2.62e-10 | PASS |
| C10-R8 Random realistic (seed 2) | If you start in 5 years | €130,997 | €130,997 | 130,996.8536 | 130,996.8536 | 7.28e-11 | PASS |
| C10-R8 Random realistic (seed 2) | Worth in today's money (prices rising [inflation] a year) | €59,815 | €59,815 | 59,815.3009 | 59,815.3009 | -1.46e-11 | PASS |
| C10-R8 Random realistic (seed 2) | Fees cost | €106,276 | €106,276 | 106,276.0046 | 106,276.0046 | -2.62e-10 | PASS |
| C10-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Build wealth) | 59815 | 59815 | 59,815 | 59815 | 0 | PASS |
| C10-R8 Random realistic (seed 2) | "Add to my plan" goal years | 35 | 35 | 35 | 35 | 0 | PASS |
| C10-R9 Random realistic (seed 3) | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C10-R9 Random realistic (seed 3) | Headline figure | €302,287 | €302,287 | 302,286.8466 | 302,286.8466 | -1.16e-10 | PASS |
| C10-R9 Random realistic (seed 3) | Real return a year (sentence) |  |  |  |  |  | PASS |
| C10-R9 Random realistic (seed 3) | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C10-R9 Random realistic (seed 3) | Cost of waiting (sentence) | €54,294 | €54,294 | 54,294.428 | 54,294.428 | -4.37e-11 | PASS |
| C10-R9 Random realistic (seed 3) | If you start today | €302,287 | €302,287 | 302,286.8466 | 302,286.8466 | -1.16e-10 | PASS |
| C10-R9 Random realistic (seed 3) | If you start in 5 years | €247,992 | €247,992 | 247,992.4186 | 247,992.4186 | -8.73e-11 | PASS |
| C10-R9 Random realistic (seed 3) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C10-R9 Random realistic (seed 3) | Fees cost | €112,939 | €112,939 | 112,938.717 | 112,938.717 | 4.95e-10 | PASS |
| C10-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Build wealth) | 302287 | 302287 | 302,287 | 302287 | 0 | PASS |
| C10-R9 Random realistic (seed 3) | "Add to my plan" goal years | 17 | 17 | 17 | 17 | 0 | PASS |
| C10-R10 Random realistic (seed 4) | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C10-R10 Random realistic (seed 4) | Headline figure | €1,162,023 | €1,162,023 | 1,162,023.3346 | 1,162,023.3346 | 2.79e-09 | PASS |
| C10-R10 Random realistic (seed 4) | Real return a year (sentence) |  |  |  |  |  | PASS |
| C10-R10 Random realistic (seed 4) | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C10-R10 Random realistic (seed 4) | Cost of waiting (sentence) | €266,572 | €266,572 | 266,571.6672 | 266,571.6672 | -1.16e-10 | PASS |
| C10-R10 Random realistic (seed 4) | If you start today | €1,162,023 | €1,162,023 | 1,162,023.3346 | 1,162,023.3346 | 2.79e-09 | PASS |
| C10-R10 Random realistic (seed 4) | If you start in 5 years | €895,452 | €895,452 | 895,451.6674 | 895,451.6674 | 0 | PASS |
| C10-R10 Random realistic (seed 4) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C10-R10 Random realistic (seed 4) | Fees cost | €842,960 | €842,960 | 842,960.1773 | 842,960.1773 | 3.49e-10 | PASS |
| C10-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Build wealth) | 459013 | 459013 | 459,013 | 459013 | 0 | PASS |
| C10-R10 Random realistic (seed 4) | "Add to my plan" goal years | 27 | 27 | 27 | 27 | 0 | PASS |
| C10-R11 Branch case D | Headline label | In today's money | In today's money |  |  |  | PASS |
| C10-R11 Branch case D | Headline figure | €10,600 | €10,600 | 10,599.8447 | 10,599.8447 | 3.27e-11 | PASS |
| C10-R11 Branch case D | Real return a year (sentence) | 2.0% | 2.0% | 0.019608 | 0.019608 | -3.12e-17 | PASS |
| C10-R11 Branch case D | Growth after fees quoted (sentence) | 4% | 4% |  | 0.04 |  | PASS |
| C10-R11 Branch case D | Cost of waiting (sentence) | €1,177 | €1,177 | 1,176.6214 | 1,176.6214 | -2.73e-12 | PASS |
| C10-R11 Branch case D | If you start today | €11,249 | €11,249 | 11,248.64 | 11,248.64 | -1.82e-12 | PASS |
| C10-R11 Branch case D | If you start in 5 years | €10,000 | €10,000 | 10000 | 10000 | 0 | PASS |
| C10-R11 Branch case D | Worth in today's money (prices rising [inflation] a year) | €10,600 | €10,600 | 10,599.8447 | 10,599.8447 | 3.27e-11 | PASS |
| C10-R11 Branch case D | Fees cost |  |  |  |  |  | PASS |
| C10-R11 Branch case D | "Add to my plan" goal amount (Build wealth) | 10600 | 10600 | 10,600 | 10600 | 0 | PASS |
| C10-R11 Branch case D | "Add to my plan" goal years | 3 | 3 | 3 | 3 | 0 | PASS |

### C11 Emergency fund (emergency): 80/80 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C11-R1 Defaults | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R1 Defaults | You currently have (months) | 2.5 months | 2.5 months | 2.500000 | 2.500000 | 0 | PASS |
| C11-R1 Defaults | Your target is (sentence) | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C11-R1 Defaults | You are … away (sentence) | €8,750 | €8,750 | 8750 | 8750 | 0 | PASS |
| C11-R1 Defaults | Target cushion | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C11-R1 Defaults | Still to build | €8,750 | €8,750 | 8750 | 8750 | 0 | PASS |
| C11-R1 Defaults | "Add to my plan" goal amount (Emergency fund) | 15000 | 15000 | 15,000 | 15000 | 0 | PASS |
| C11-R1 Defaults | "Add to my plan" goal years | 2 | 2 | 2 | 2 | 0 | PASS |
| C11-R2 Low / edge | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R2 Low / edge | You currently have (months) | 0.0 months | 0.0 months | 0 | 0 | 0 | PASS |
| C11-R2 Low / edge | Your target is (sentence) | €500 | €500 | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | You are … away (sentence) | €500 | €500 | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | Target cushion | €500 | €500 | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | Still to build | €500 | €500 | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | "Add to my plan" goal amount (Emergency fund) | 500 | 500 | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | "Add to my plan" goal years | 2 | 2 | 2 | 2 | 0 | PASS |
| C11-R3 High | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R3 High | You currently have (months) | 10.0 months | 10.0 months | 10 | 10 | 0 | PASS |
| C11-R3 High | Your target is (sentence) | €120,000 | €120,000 | 120000 | 120000 | 0 | PASS |
| C11-R3 High | You are … away (sentence) | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C11-R3 High | Target cushion | €120,000 | €120,000 | 120000 | 120000 | 0 | PASS |
| C11-R3 High | Still to build | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C11-R3 High | "Add to my plan" goal amount (Emergency fund) | 120000 | 120000 | 120,000 | 120000 | 0 | PASS |
| C11-R3 High | "Add to my plan" goal years | 2 | 2 | 2 | 2 | 0 | PASS |
| C11-R4 Random realistic (seed 1) | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R4 Random realistic (seed 1) | You currently have (months) | 11.9 months | 11.9 months | 11.893939 | 11.893939 | 5.33e-15 | PASS |
| C11-R4 Random realistic (seed 1) | Your target is (sentence) |  |  |  |  |  | PASS |
| C11-R4 Random realistic (seed 1) | You are … away (sentence) |  |  |  |  |  | PASS |
| C11-R4 Random realistic (seed 1) | Target cushion | €39,600 | €39,600 | 39600 | 39600 | 0 | PASS |
| C11-R4 Random realistic (seed 1) | Still to build | €0 | €0 | 0 | 0 | 0 | PASS |
| C11-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Emergency fund) |  |  |  |  |  | PASS |
| C11-R4 Random realistic (seed 1) | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C11-R5 Branch case A | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R5 Branch case A | You currently have (months) | 8.0 months | 8.0 months | 8 | 8 | 0 | PASS |
| C11-R5 Branch case A | Your target is (sentence) |  |  |  |  |  | PASS |
| C11-R5 Branch case A | You are … away (sentence) |  |  |  |  |  | PASS |
| C11-R5 Branch case A | Target cushion | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C11-R5 Branch case A | Still to build | €0 | €0 | 0 | 0 | 0 | PASS |
| C11-R5 Branch case A | "Add to my plan" goal amount (Emergency fund) |  |  |  |  |  | PASS |
| C11-R5 Branch case A | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C11-R6 Branch case B | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R6 Branch case B | You currently have (months) | 6.0 months | 6.0 months | 6 | 6 | 0 | PASS |
| C11-R6 Branch case B | Your target is (sentence) |  |  |  |  |  | PASS |
| C11-R6 Branch case B | You are … away (sentence) |  |  |  |  |  | PASS |
| C11-R6 Branch case B | Target cushion | €15,000 | €15,000 | 15000 | 15000 | 0 | PASS |
| C11-R6 Branch case B | Still to build | €0 | €0 | 0 | 0 | 0 | PASS |
| C11-R6 Branch case B | "Add to my plan" goal amount (Emergency fund) |  |  |  |  |  | PASS |
| C11-R6 Branch case B | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C11-R7 Branch case C | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R7 Branch case C | You currently have (months) | 1.3 months | 1.3 months | 1.250000 | 1.250000 | 0 | PASS |
| C11-R7 Branch case C | Your target is (sentence) | €9,600 | €9,600 | 9600 | 9600 | 0 | PASS |
| C11-R7 Branch case C | You are … away (sentence) | €5,600 | €5,600 | 5600 | 5600 | 0 | PASS |
| C11-R7 Branch case C | Target cushion | €9,600 | €9,600 | 9600 | 9600 | 0 | PASS |
| C11-R7 Branch case C | Still to build | €5,600 | €5,600 | 5600 | 5600 | 0 | PASS |
| C11-R7 Branch case C | "Add to my plan" goal amount (Emergency fund) | 9600 | 9600 | 9,600 | 9600 | 0 | PASS |
| C11-R7 Branch case C | "Add to my plan" goal years | 2 | 2 | 2 | 2 | 0 | PASS |
| C11-R8 Random realistic (seed 2) | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R8 Random realistic (seed 2) | You currently have (months) | 1.3 months | 1.3 months | 1.250000 | 1.250000 | 0 | PASS |
| C11-R8 Random realistic (seed 2) | Your target is (sentence) |  |  |  |  |  | PASS |
| C11-R8 Random realistic (seed 2) | You are … away (sentence) |  |  |  |  |  | PASS |
| C11-R8 Random realistic (seed 2) | Target cushion | €5,000 | €5,000 | 5000 | 5000 | 0 | PASS |
| C11-R8 Random realistic (seed 2) | Still to build | €0 | €0 | 0 | 0 | 0 | PASS |
| C11-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Emergency fund) |  |  |  |  |  | PASS |
| C11-R8 Random realistic (seed 2) | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C11-R9 Random realistic (seed 3) | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R9 Random realistic (seed 3) | You currently have (months) | 12.1 months | 12.1 months | 12.083333 | 12.083333 | -3.38e-14 | PASS |
| C11-R9 Random realistic (seed 3) | Your target is (sentence) |  |  |  |  |  | PASS |
| C11-R9 Random realistic (seed 3) | You are … away (sentence) |  |  |  |  |  | PASS |
| C11-R9 Random realistic (seed 3) | Target cushion | €12,000 | €12,000 | 12000 | 12000 | 0 | PASS |
| C11-R9 Random realistic (seed 3) | Still to build | €0 | €0 | 0 | 0 | 0 | PASS |
| C11-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Emergency fund) |  |  |  |  |  | PASS |
| C11-R9 Random realistic (seed 3) | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C11-R10 Random realistic (seed 4) | Headline label | You currently have | You currently have |  |  |  | PASS |
| C11-R10 Random realistic (seed 4) | You currently have (months) | 35.2 months | 35.2 months | 35.238095 | 35.238095 | -4.26e-14 | PASS |
| C11-R10 Random realistic (seed 4) | Your target is (sentence) |  |  |  |  |  | PASS |
| C11-R10 Random realistic (seed 4) | You are … away (sentence) |  |  |  |  |  | PASS |
| C11-R10 Random realistic (seed 4) | Target cushion | €25,200 | €25,200 | 25200 | 25200 | 0 | PASS |
| C11-R10 Random realistic (seed 4) | Still to build | €0 | €0 | 0 | 0 | 0 | PASS |
| C11-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Emergency fund) |  |  |  |  |  | PASS |
| C11-R10 Random realistic (seed 4) | "Add to my plan" goal years |  |  |  |  |  | PASS |

### C12 Retirement projection (retirement): 132/132 PASS, 11 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C12-R1 Defaults | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R1 Defaults | Projected fund | €525,773 | €525,773 | 525,773.1749 | 525,773.1749 | 1.16e-10 | PASS |
| C12-R1 Defaults | Illustrative gap of (sentence) | €99,227 | €99,227 | 99,226.8251 | 99,226.8251 | 1.46e-11 | PASS |
| C12-R1 Defaults | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R1 Defaults | Illustrative target (25 × the income you need) | €625,000 | €625,000 | 625000 | 625000 | 0 | PASS |
| C12-R1 Defaults | Illustrative gap | €99,227 | €99,227 | 99,226.8251 | 99,226.8251 | 1.46e-11 | PASS |
| C12-R1 Defaults | Retiring at | 65 | 65 | 65 | 65 | 0 | PASS |
| C12-R1 Defaults | Worth in today's money (prices rising [inflation] a year) | €320,475 | €320,475 | 320,474.981 | 320,474.981 | -1.75e-10 | PASS |
| C12-R1 Defaults | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R1 Defaults | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R1 Defaults | "Add to my plan" goal amount (Comfortable retirement) | 625000 | 625000 | 625,000 | 625000 | 0 | PASS |
| C12-R1 Defaults | "Add to my plan" goal years | 25 | 25 | 25 | 25 | 0 | PASS |
| C12-R2 Low / edge | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R2 Low / edge | Projected fund | €0 | €0 | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Illustrative gap of (sentence) |  |  |  |  |  | PASS |
| C12-R2 Low / edge | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R2 Low / edge | Illustrative target (25 × the income you need) | €0 | €0 | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Illustrative gap | None | None |  | None |  | PASS |
| C12-R2 Low / edge | Retiring at | 50 | 50 | 50 | 50 | 0 | PASS |
| C12-R2 Low / edge | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C12-R2 Low / edge | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R2 Low / edge | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R2 Low / edge | "Add to my plan" goal amount (Comfortable retirement) | 0 | 0 | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C12-R3 High | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R3 High | Projected fund | €188,426,547 | €188,426,547 | 188,426,546.5263 | 188,426,546.5263 | 0 | PASS |
| C12-R3 High | Illustrative gap of (sentence) |  |  |  |  |  | PASS |
| C12-R3 High | Pay rise quoted (sentence) | 3% | 3% |  | 0.03 |  | PASS |
| C12-R3 High | Illustrative target (25 × the income you need) | €3,250,000 | €3,250,000 | 3250000 | 3250000 | 0 | PASS |
| C12-R3 High | Illustrative gap | None | None |  | None |  | PASS |
| C12-R3 High | Retiring at | 80 | 80 | 80 | 80 | 0 | PASS |
| C12-R3 High | Worth in today's money (prices rising [inflation] a year) | €23,917,793 | €23,917,793 | 23,917,792.8892 | 23,917,792.8892 | 3.35e-08 | PASS |
| C12-R3 High | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R3 High | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R3 High | "Add to my plan" goal amount (Comfortable retirement) | 3250000 | 3250000 | 3,250,000 | 3250000 | 0 | PASS |
| C12-R3 High | "Add to my plan" goal years | 60 | 60 | 60 | 60 | 0 | PASS |
| C12-R4 Random realistic (seed 1) | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R4 Random realistic (seed 1) | Projected fund | €1,472,098 | €1,472,098 | 1,472,097.951 | 1,472,097.951 | 1.40e-09 | PASS |
| C12-R4 Random realistic (seed 1) | Illustrative gap of (sentence) | €1,040,402 | €1,040,402 | 1,040,402.049 | 1,040,402.049 | -1.28e-09 | PASS |
| C12-R4 Random realistic (seed 1) | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R4 Random realistic (seed 1) | Illustrative target (25 × the income you need) | €2,512,500 | €2,512,500 | 2512500 | 2512500 | 0 | PASS |
| C12-R4 Random realistic (seed 1) | Illustrative gap | €1,040,402 | €1,040,402 | 1,040,402.049 | 1,040,402.049 | -1.28e-09 | PASS |
| C12-R4 Random realistic (seed 1) | Retiring at | 66 | 66 | 66 | 66 | 0 | PASS |
| C12-R4 Random realistic (seed 1) | Worth in today's money (prices rising [inflation] a year) | €928,209 | €928,209 | 928,208.6021 | 928,208.6021 | -2.33e-10 | PASS |
| C12-R4 Random realistic (seed 1) | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R4 Random realistic (seed 1) | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Comfortable retirement) | 2512500 | 2512500 | 2,512,500 | 2512500 | 0 | PASS |
| C12-R4 Random realistic (seed 1) | "Add to my plan" goal years | 17 | 17 | 17 | 17 | 0 | PASS |
| C12-R5 Branch case A | Headline label | Projected fund (from your statement) | Projected fund (from your statement) |  |  |  | PASS |
| C12-R5 Branch case A | Projected fund | €450,000 | €450,000 | 450000 | 450000 | 0 | PASS |
| C12-R5 Branch case A | Illustrative gap of (sentence) | €175,000 | €175,000 | 175000 | 175000 | 0 | PASS |
| C12-R5 Branch case A | Pay rise quoted (sentence) | 3% | 3% |  | 0.03 |  | PASS |
| C12-R5 Branch case A | Illustrative target (25 × the income you need) | €625,000 | €625,000 | 625000 | 625000 | 0 | PASS |
| C12-R5 Branch case A | Illustrative gap | €175,000 | €175,000 | 175000 | 175000 | 0 | PASS |
| C12-R5 Branch case A | Retiring at | 65 | 65 | 65 | 65 | 0 | PASS |
| C12-R5 Branch case A | Worth in today's money (prices rising [inflation] a year) | €274,289 | €274,289 | 274,288.8917 | 274,288.8917 | 4.66e-10 | PASS |
| C12-R5 Branch case A | Your statement projects (age nra) | €450,000 | €450,000 | 450000 | 450000 | 0 | PASS |
| C12-R5 Branch case A | On our assumptions (age ra) | €544,989 | €544,989 | 544,988.6781 | 544,988.6781 | -1.16e-10 | PASS |
| C12-R5 Branch case A | "Add to my plan" goal amount (Comfortable retirement) | 625000 | 625000 | 625,000 | 625000 | 0 | PASS |
| C12-R5 Branch case A | "Add to my plan" goal years | 25 | 25 | 25 | 25 | 0 | PASS |
| C12-R6 Branch case B | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R6 Branch case B | Projected fund | €560,557 | €560,557 | 560,556.6323 | 560,556.6323 | 3.49e-10 | PASS |
| C12-R6 Branch case B | Illustrative gap of (sentence) | €64,443 | €64,443 | 64,443.3677 | 64,443.3677 | 7.28e-12 | PASS |
| C12-R6 Branch case B | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R6 Branch case B | Illustrative target (25 × the income you need) | €625,000 | €625,000 | 625000 | 625000 | 0 | PASS |
| C12-R6 Branch case B | Illustrative gap | €64,443 | €64,443 | 64,443.3677 | 64,443.3677 | 7.28e-12 | PASS |
| C12-R6 Branch case B | Retiring at | 66 | 66 | 66 | 66 | 0 | PASS |
| C12-R6 Branch case B | Worth in today's money (prices rising [inflation] a year) | €229,177 | €229,177 | 229,176.6679 | 229,176.6679 | -4.66e-10 | PASS |
| C12-R6 Branch case B | Your statement projects (age nra) | €450,000 | €450,000 | 450000 | 450000 | 0 | PASS |
| C12-R6 Branch case B | On our assumptions (age ra) | €560,557 | €560,557 | 560,556.6323 | 560,556.6323 | 3.49e-10 | PASS |
| C12-R6 Branch case B | "Add to my plan" goal amount (Comfortable retirement) | 625000 | 625000 | 625,000 | 625000 | 0 | PASS |
| C12-R6 Branch case B | "Add to my plan" goal years | 26 | 26 | 26 | 26 | 0 | PASS |
| C12-R7 Branch case C | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R7 Branch case C | Projected fund | €544,989 | €544,989 | 544,988.6781 | 544,988.6781 | -1.16e-10 | PASS |
| C12-R7 Branch case C | Illustrative gap of (sentence) | €80,011 | €80,011 | 80,011.3219 | 80,011.3219 | -4.37e-11 | PASS |
| C12-R7 Branch case C | Pay rise quoted (sentence) | 3% | 3% |  | 0.03 |  | PASS |
| C12-R7 Branch case C | Illustrative target (25 × the income you need) | €625,000 | €625,000 | 625000 | 625000 | 0 | PASS |
| C12-R7 Branch case C | Illustrative gap | €80,011 | €80,011 | 80,011.3219 | 80,011.3219 | -4.37e-11 | PASS |
| C12-R7 Branch case C | Retiring at | 65 | 65 | 65 | 65 | 0 | PASS |
| C12-R7 Branch case C | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C12-R7 Branch case C | Your statement projects (age nra) | €450,000 | €450,000 | 450000 | 450000 | 0 | PASS |
| C12-R7 Branch case C | On our assumptions (age ra) | €544,989 | €544,989 | 544,988.6781 | 544,988.6781 | -1.16e-10 | PASS |
| C12-R7 Branch case C | "Add to my plan" goal amount (Comfortable retirement) | 625000 | 625000 | 625,000 | 625000 | 0 | PASS |
| C12-R7 Branch case C | "Add to my plan" goal years | 25 | 25 | 25 | 25 | 0 | PASS |
| C12-R8 Random realistic (seed 2) | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R8 Random realistic (seed 2) | Projected fund | €1,958,061 | €1,958,061 | 1,958,061.3169 | 1,958,061.3169 | 4.42e-09 | PASS |
| C12-R8 Random realistic (seed 2) | Illustrative gap of (sentence) |  |  |  |  |  | PASS |
| C12-R8 Random realistic (seed 2) | Pay rise quoted (sentence) | 3% | 3% |  | 0.03 |  | PASS |
| C12-R8 Random realistic (seed 2) | Illustrative target (25 × the income you need) | €850,000 | €850,000 | 850000 | 850000 | 0 | PASS |
| C12-R8 Random realistic (seed 2) | Illustrative gap | None | None |  | None |  | PASS |
| C12-R8 Random realistic (seed 2) | Retiring at | 71 | 71 | 71 | 71 | 0 | PASS |
| C12-R8 Random realistic (seed 2) | Worth in today's money (prices rising [inflation] a year) | €1,426,342 | €1,426,342 | 1,426,341.5693 | 1,426,341.5693 | -1.86e-09 | PASS |
| C12-R8 Random realistic (seed 2) | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R8 Random realistic (seed 2) | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Comfortable retirement) | 850000 | 850000 | 850,000 | 850000 | 0 | PASS |
| C12-R8 Random realistic (seed 2) | "Add to my plan" goal years | 16 | 16 | 16 | 16 | 0 | PASS |
| C12-R9 Random realistic (seed 3) | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R9 Random realistic (seed 3) | Projected fund | €2,711,824 | €2,711,824 | 2,711,824.0512 | 2,711,824.0512 | 4.66e-10 | PASS |
| C12-R9 Random realistic (seed 3) | Illustrative gap of (sentence) | €425,676 | €425,676 | 425,675.9488 | 425,675.9488 | -2.91e-10 | PASS |
| C12-R9 Random realistic (seed 3) | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R9 Random realistic (seed 3) | Illustrative target (25 × the income you need) | €3,137,500 | €3,137,500 | 3137500 | 3137500 | 0 | PASS |
| C12-R9 Random realistic (seed 3) | Illustrative gap | €425,676 | €425,676 | 425,675.9488 | 425,675.9488 | -2.91e-10 | PASS |
| C12-R9 Random realistic (seed 3) | Retiring at | 56 | 56 | 56 | 56 | 0 | PASS |
| C12-R9 Random realistic (seed 3) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C12-R9 Random realistic (seed 3) | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R9 Random realistic (seed 3) | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Comfortable retirement) | 3137500 | 3137500 | 3,137,500 | 3137500 | 0 | PASS |
| C12-R9 Random realistic (seed 3) | "Add to my plan" goal years | 7 | 7 | 7 | 7 | 0 | PASS |
| C12-R10 Random realistic (seed 4) | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R10 Random realistic (seed 4) | Projected fund | €2,687,844 | €2,687,844 | 2,687,843.9882 | 2,687,843.9882 | 4.66e-10 | PASS |
| C12-R10 Random realistic (seed 4) | Illustrative gap of (sentence) |  |  |  |  |  | PASS |
| C12-R10 Random realistic (seed 4) | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R10 Random realistic (seed 4) | Illustrative target (25 × the income you need) | €1,987,500 | €1,987,500 | 1987500 | 1987500 | 0 | PASS |
| C12-R10 Random realistic (seed 4) | Illustrative gap | None | None |  | None |  | PASS |
| C12-R10 Random realistic (seed 4) | Retiring at | 66 | 66 | 66 | 66 | 0 | PASS |
| C12-R10 Random realistic (seed 4) | Worth in today's money (prices rising [inflation] a year) | €1,497,677 | €1,497,677 | 1,497,676.8288 | 1,497,676.8288 | -2.56e-09 | PASS |
| C12-R10 Random realistic (seed 4) | Your statement projects (age nra) |  |  |  |  |  | PASS |
| C12-R10 Random realistic (seed 4) | On our assumptions (age ra) |  |  |  |  |  | PASS |
| C12-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Comfortable retirement) | 1987500 | 1987500 | 1,987,500 | 1987500 | 0 | PASS |
| C12-R10 Random realistic (seed 4) | "Add to my plan" goal years | 17 | 17 | 17 | 17 | 0 | PASS |
| C12-R11 Branch case D | Headline label | Projected fund | Projected fund |  |  |  | PASS |
| C12-R11 Branch case D | Projected fund | €594,863 | €594,863 | 594,862.5963 | 594,862.5963 | -3.49e-10 | PASS |
| C12-R11 Branch case D | Illustrative gap of (sentence) | €30,137 | €30,137 | 30,137.4037 | 30,137.4037 | 1.09e-11 | PASS |
| C12-R11 Branch case D | Pay rise quoted (sentence) | 2.5% | 2.5% |  | 0.025 |  | PASS |
| C12-R11 Branch case D | Illustrative target (25 × the income you need) | €625,000 | €625,000 | 625000 | 625000 | 0 | PASS |
| C12-R11 Branch case D | Illustrative gap | €30,137 | €30,137 | 30,137.4037 | 30,137.4037 | 1.09e-11 | PASS |
| C12-R11 Branch case D | Retiring at | 65 | 65 | 65 | 65 | 0 | PASS |
| C12-R11 Branch case D | Worth in today's money (prices rising [inflation] a year) | €362,587 | €362,587 | 362,587.1162 | 362,587.1162 | 4.66e-10 | PASS |
| C12-R11 Branch case D | Your statement projects (age nra) | €450,000 | €450,000 | 450000 | 450000 | 0 | PASS |
| C12-R11 Branch case D | On our assumptions (age ra) | €594,863 | €594,863 | 594,862.5963 | 594,862.5963 | -3.49e-10 | PASS |
| C12-R11 Branch case D | "Add to my plan" goal amount (Comfortable retirement) | 625000 | 625000 | 625,000 | 625000 | 0 | PASS |
| C12-R11 Branch case D | "Add to my plan" goal years | 25 | 25 | 25 | 25 | 0 | PASS |

### C13 Contribution impact (contrib): 56/56 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C13-R1 Defaults | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R1 Defaults | Could add to your pension | €54,572 | €54,572 | 54,572.4754 | 54,572.4754 | -7.28e-12 | PASS |
| C13-R1 Defaults | Extra per month | €100 | €100 | 100 | 100 | 0 | PASS |
| C13-R1 Defaults | Cost after tax relief | €60 | €60 | 60 | 60 | 0 | PASS |
| C13-R1 Defaults | Worth in today's money (prices rising [inflation] a year) | €33,264 | €33,264 | 33,263.6084 | 33,263.6084 | 5.09e-11 | PASS |
| C13-R1 Defaults | "Add to my plan" goal amount (Boost my pension) | 54572 | 54572 | 54,572 | 54572 | 0 | PASS |
| C13-R1 Defaults | "Add to my plan" goal years | 25 | 25 | 25 | 25 | 0 | PASS |
| C13-R2 Low / edge | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R2 Low / edge | Could add to your pension | €75 | €75 | 75.3431 | 75.3431 | -2.84e-14 | PASS |
| C13-R2 Low / edge | Extra per month | €6 | €6 | 6.25 | 6.25 | 0 | PASS |
| C13-R2 Low / edge | Cost after tax relief | €5 | €5 | 5 | 5 | 0 | PASS |
| C13-R2 Low / edge | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C13-R2 Low / edge | "Add to my plan" goal amount (Boost my pension) | 75 | 75 | 75 | 75 | 0 | PASS |
| C13-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C13-R3 High | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R3 High | Could add to your pension | €7,370,128 | €7,370,128 | 7,370,127.8694 | 7,370,127.8694 | -2.79e-09 | PASS |
| C13-R3 High | Extra per month | €2,083 | €2,083 | 2,083.3333 | 2,083.3333 | -3.64e-12 | PASS |
| C13-R3 High | Cost after tax relief | €1,250 | €1,250 | 1250 | 1250 | 0 | PASS |
| C13-R3 High | Worth in today's money (prices rising [inflation] a year) | €1,567,326 | €1,567,326 | 1,567,325.7981 | 1,567,325.7981 | 4.42e-09 | PASS |
| C13-R3 High | "Add to my plan" goal amount (Boost my pension) | 7370128 | 7370128 | 7,370,128 | 7370128 | 0 | PASS |
| C13-R3 High | "Add to my plan" goal years | 45 | 45 | 45 | 45 | 0 | PASS |
| C13-R4 Random realistic (seed 1) | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R4 Random realistic (seed 1) | Could add to your pension | €92,154 | €92,154 | 92,153.924 | 92,153.924 | 4.37e-11 | PASS |
| C13-R4 Random realistic (seed 1) | Extra per month | €398 | €398 | 397.5 | 397.5 | 0 | PASS |
| C13-R4 Random realistic (seed 1) | Cost after tax relief | €318 | €318 | 318 | 318 | 0 | PASS |
| C13-R4 Random realistic (seed 1) | Worth in today's money (prices rising [inflation] a year) | €63,033 | €63,033 | 63,033.033 | 63,033.033 | 7.28e-12 | PASS |
| C13-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Boost my pension) | 92154 | 92154 | 92,154 | 92154 | 0 | PASS |
| C13-R4 Random realistic (seed 1) | "Add to my plan" goal years | 14 | 14 | 14 | 14 | 0 | PASS |
| C13-R6 Branch case B | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R6 Branch case B | Could add to your pension | €33,139 | €33,139 | 33,138.9298 | 33,138.9298 | -1.46e-11 | PASS |
| C13-R6 Branch case B | Extra per month | €175 | €175 | 175 | 175 | 0 | PASS |
| C13-R6 Branch case B | Cost after tax relief | €105 | €105 | 105 | 105 | 0 | PASS |
| C13-R6 Branch case B | Worth in today's money (prices rising [inflation] a year) | €21,931 | €21,931 | 21,930.7903 | 21,930.7903 | -1.46e-11 | PASS |
| C13-R6 Branch case B | "Add to my plan" goal amount (Boost my pension) | 33139 | 33139 | 33,139 | 33139 | 0 | PASS |
| C13-R6 Branch case B | "Add to my plan" goal years | 12 | 12 | 12 | 12 | 0 | PASS |
| C13-R8 Random realistic (seed 2) | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R8 Random realistic (seed 2) | Could add to your pension | €27,743 | €27,743 | 27,743.3598 | 27,743.3598 | -2.18e-11 | PASS |
| C13-R8 Random realistic (seed 2) | Extra per month | €66 | €66 | 66.25 | 66.25 | 0 | PASS |
| C13-R8 Random realistic (seed 2) | Cost after tax relief | €40 | €40 | 39.75 | 39.75 | 0 | PASS |
| C13-R8 Random realistic (seed 2) | Worth in today's money (prices rising [inflation] a year) | €17,249 | €17,249 | 17,248.6429 | 17,248.6429 | 2.18e-11 | PASS |
| C13-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Boost my pension) | 27743 | 27743 | 27,743 | 27743 | 0 | PASS |
| C13-R8 Random realistic (seed 2) | "Add to my plan" goal years | 24 | 24 | 24 | 24 | 0 | PASS |
| C13-R9 Random realistic (seed 3) | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R9 Random realistic (seed 3) | Could add to your pension | €59,175 | €59,175 | 59,175.2842 | 59,175.2842 | 2.18e-11 | PASS |
| C13-R9 Random realistic (seed 3) | Extra per month | €88 | €88 | 87.5 | 87.5 | 0 | PASS |
| C13-R9 Random realistic (seed 3) | Cost after tax relief | €70 | €70 | 70 | 70 | 0 | PASS |
| C13-R9 Random realistic (seed 3) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C13-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Boost my pension) | 59175 | 59175 | 59,175 | 59175 | 0 | PASS |
| C13-R9 Random realistic (seed 3) | "Add to my plan" goal years | 25 | 25 | 25 | 25 | 0 | PASS |
| C13-R10 Random realistic (seed 4) | Headline label | Could add to your pension | Could add to your pension |  |  |  | PASS |
| C13-R10 Random realistic (seed 4) | Could add to your pension | €910,186 | €910,186 | 910,185.8935 | 910,185.8935 | 1.16e-10 | PASS |
| C13-R10 Random realistic (seed 4) | Extra per month | €625 | €625 | 625 | 625 | 0 | PASS |
| C13-R10 Random realistic (seed 4) | Cost after tax relief | €375 | €375 | 375 | 375 | 0 | PASS |
| C13-R10 Random realistic (seed 4) | Worth in today's money (prices rising [inflation] a year) | €214,603 | €214,603 | 214,602.8123 | 214,602.8123 | -4.07e-10 | PASS |
| C13-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Boost my pension) | 910186 | 910186 | 910,186 | 910186 | 0 | PASS |
| C13-R10 Random realistic (seed 4) | "Add to my plan" goal years | 42 | 42 | 42 | 42 | 0 | PASS |

### C14 AVC impact (avc): 64/64 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C14-R1 Defaults | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R1 Defaults | Could add | €50,902 | €50,902 | 50,902.3648 | 50,902.3648 | 4.37e-11 | PASS |
| C14-R1 Defaults | Each AVC could cost about (sentence) | €120 | €120 | 120 | 120 | 0 | PASS |
| C14-R1 Defaults | Paid in | €36,000 | €36,000 | 36000 | 36000 | 0 | PASS |
| C14-R1 Defaults | Net cost to you | €21,600 | €21,600 | 21600 | 21600 | 0 | PASS |
| C14-R1 Defaults | Worth in today's money (prices rising [inflation] a year) | €37,821 | €37,821 | 37,821.2068 | 37,821.2068 | -3.64e-11 | PASS |
| C14-R1 Defaults | "Add to my plan" goal amount (Boost my pension) | 50902 | 50902 | 50,902 | 50902 | 0 | PASS |
| C14-R1 Defaults | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C14-R2 Low / edge | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R2 Low / edge | Could add | €301 | €301 | 301.3725 | 301.3725 | 2.84e-13 | PASS |
| C14-R2 Low / edge | Each AVC could cost about (sentence) | €20 | €20 | 20 | 20 | 0 | PASS |
| C14-R2 Low / edge | Paid in | €300 | €300 | 300 | 300 | 0 | PASS |
| C14-R2 Low / edge | Net cost to you | €240 | €240 | 240 | 240 | 0 | PASS |
| C14-R2 Low / edge | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C14-R2 Low / edge | "Add to my plan" goal amount (Boost my pension) | 301 | 301 | 301 | 301 | 0 | PASS |
| C14-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C14-R3 High | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R3 High | Could add | €4,943,084 | €4,943,084 | 4,943,084.0142 | 4,943,084.0142 | -9.31e-10 | PASS |
| C14-R3 High | Each AVC could cost about (sentence) | €1,200 | €1,200 | 1200 | 1200 | 0 | PASS |
| C14-R3 High | Paid in | €960,000 | €960,000 | 960000 | 960000 | 0 | PASS |
| C14-R3 High | Net cost to you | €576,000 | €576,000 | 576000 | 576000 | 0 | PASS |
| C14-R3 High | Worth in today's money (prices rising [inflation] a year) | €1,248,487 | €1,248,487 | 1,248,486.93 | 1,248,486.93 | -6.98e-10 | PASS |
| C14-R3 High | "Add to my plan" goal amount (Boost my pension) | 4943084 | 4943084 | 4,943,084 | 4943084 | 0 | PASS |
| C14-R3 High | "Add to my plan" goal years | 40 | 40 | 40 | 40 | 0 | PASS |
| C14-R4 Random realistic (seed 1) | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R4 Random realistic (seed 1) | Could add | €162,426 | €162,426 | 162,426.1459 | 162,426.1459 | 0 | PASS |
| C14-R4 Random realistic (seed 1) | Each AVC could cost about (sentence) | €240 | €240 | 240 | 240 | 0 | PASS |
| C14-R4 Random realistic (seed 1) | Paid in | €93,600 | €93,600 | 93600 | 93600 | 0 | PASS |
| C14-R4 Random realistic (seed 1) | Net cost to you | €74,880 | €74,880 | 74880 | 74880 | 0 | PASS |
| C14-R4 Random realistic (seed 1) | Worth in today's money (prices rising [inflation] a year) | €80,228 | €80,228 | 80,228.4395 | 80,228.4395 | -1.46e-11 | PASS |
| C14-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Boost my pension) | 162426 | 162426 | 162,426 | 162426 | 0 | PASS |
| C14-R4 Random realistic (seed 1) | "Add to my plan" goal years | 26 | 26 | 26 | 26 | 0 | PASS |
| C14-R6 Branch case B | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R6 Branch case B | Could add | €95,442 | €95,442 | 95,441.934 | 95,441.934 | 0 | PASS |
| C14-R6 Branch case B | Each AVC could cost about (sentence) | €300 | €300 | 300 | 300 | 0 | PASS |
| C14-R6 Branch case B | Paid in | €67,500 | €67,500 | 67500 | 67500 | 0 | PASS |
| C14-R6 Branch case B | Net cost to you | €54,000 | €54,000 | 54000 | 54000 | 0 | PASS |
| C14-R6 Branch case B | Worth in today's money (prices rising [inflation] a year) | €56,968 | €56,968 | 56,968.395 | 56,968.395 | -7.28e-12 | PASS |
| C14-R6 Branch case B | "Add to my plan" goal amount (Boost my pension) | 95442 | 95442 | 95,442 | 95442 | 0 | PASS |
| C14-R6 Branch case B | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C14-R8 Random realistic (seed 2) | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R8 Random realistic (seed 2) | Could add | €1,762,093 | €1,762,093 | 1,762,092.7042 | 1,762,092.7042 | -2.33e-10 | PASS |
| C14-R8 Random realistic (seed 2) | Each AVC could cost about (sentence) | €920 | €920 | 920 | 920 | 0 | PASS |
| C14-R8 Random realistic (seed 2) | Paid in | €483,000 | €483,000 | 483000 | 483000 | 0 | PASS |
| C14-R8 Random realistic (seed 2) | Net cost to you | €386,400 | €386,400 | 386400 | 386400 | 0 | PASS |
| C14-R8 Random realistic (seed 2) | Worth in today's money (prices rising [inflation] a year) | €881,095 | €881,095 | 881,095.0094 | 881,095.0094 | 4.66e-10 | PASS |
| C14-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Boost my pension) | 1762093 | 1762093 | 1,762,093 | 1762093 | 0 | PASS |
| C14-R8 Random realistic (seed 2) | "Add to my plan" goal years | 35 | 35 | 35 | 35 | 0 | PASS |
| C14-R9 Random realistic (seed 3) | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R9 Random realistic (seed 3) | Could add | €270,285 | €270,285 | 270,284.5306 | 270,284.5306 | -1.75e-10 | PASS |
| C14-R9 Random realistic (seed 3) | Each AVC could cost about (sentence) | €1,200 | €1,200 | 1200 | 1200 | 0 | PASS |
| C14-R9 Random realistic (seed 3) | Paid in | €252,000 | €252,000 | 252000 | 252000 | 0 | PASS |
| C14-R9 Random realistic (seed 3) | Net cost to you | €201,600 | €201,600 | 201600 | 201600 | 0 | PASS |
| C14-R9 Random realistic (seed 3) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C14-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Boost my pension) | 270285 | 270285 | 270,285 | 270285 | 0 | PASS |
| C14-R9 Random realistic (seed 3) | "Add to my plan" goal years | 14 | 14 | 14 | 14 | 0 | PASS |
| C14-R10 Random realistic (seed 4) | Headline label | Could add | Could add |  |  |  | PASS |
| C14-R10 Random realistic (seed 4) | Could add | €63,550 | €63,550 | 63,549.5549 | 63,549.5549 | 2.91e-11 | PASS |
| C14-R10 Random realistic (seed 4) | Each AVC could cost about (sentence) | €500 | €500 | 500 | 500 | 0 | PASS |
| C14-R10 Random realistic (seed 4) | Paid in | €52,500 | €52,500 | 52500 | 52500 | 0 | PASS |
| C14-R10 Random realistic (seed 4) | Net cost to you | €42,000 | €42,000 | 42000 | 42000 | 0 | PASS |
| C14-R10 Random realistic (seed 4) | Worth in today's money (prices rising [inflation] a year) | €49,949 | €49,949 | 49,949.3757 | 49,949.3757 | 2.18e-11 | PASS |
| C14-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Boost my pension) | 63550 | 63550 | 63,550 | 63550 | 0 | PASS |
| C14-R10 Random realistic (seed 4) | "Add to my plan" goal years | 7 | 7 | 7 | 7 | 0 | PASS |

### C15 Will my money last (lastmoney): 50/50 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C15-R1 Defaults | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R1 Defaults | Could last about (years) | 18 years | 18 years | 18 | 18 | 0 | PASS |
| C15-R1 Defaults | Withdrawing a year (sentence) | €24,000 | €24,000 | 24000 | 24000 | 0 | PASS |
| C15-R1 Defaults | Withdrawals rise with prices at (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C15-R1 Defaults | Withdrawal rate | 6.0% | 6.0% | 0.060000 | 0.060000 | 0 | PASS |
| C15-R2 Low / edge | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R2 Low / edge | Could last about (years) | 60+ years | 60+ years | 60 | 60 | 0 | PASS |
| C15-R2 Low / edge | Withdrawing a year (sentence) | €1,000 | €1,000 | 1000 | 1000 | 0 | PASS |
| C15-R2 Low / edge | Withdrawals rise with prices at (sentence) |  |  |  |  |  | PASS |
| C15-R2 Low / edge | Withdrawal rate | 0.0% | 0.0% | 0.000333 | 0.000333 | -3.25e-19 | PASS |
| C15-R3 High | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R3 High | Could last about (years) | 0 years | 0 years | 0 | 0 | 0 | PASS |
| C15-R3 High | Withdrawing a year (sentence) | €200,000 | €200,000 | 200000 | 200000 | 0 | PASS |
| C15-R3 High | Withdrawals rise with prices at (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C15-R3 High | Withdrawal rate | 2000.0% | 2000.0% | 20 | 20 | 0 | PASS |
| C15-R4 Random realistic (seed 1) | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R4 Random realistic (seed 1) | Could last about (years) | 59 years | 59 years | 59 | 59 | 0 | PASS |
| C15-R4 Random realistic (seed 1) | Withdrawing a year (sentence) | €52,000 | €52,000 | 52000 | 52000 | 0 | PASS |
| C15-R4 Random realistic (seed 1) | Withdrawals rise with prices at (sentence) | 2.75% | 2.75% |  | 0.0275 |  | PASS |
| C15-R4 Random realistic (seed 1) | Withdrawal rate | 2.1% | 2.1% | 0.021399 | 0.021399 | -1.04e-17 | PASS |
| C15-R5 Branch case A | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R5 Branch case A | Could last about (years) | 14 years | 14 years | 14 | 14 | 0 | PASS |
| C15-R5 Branch case A | Withdrawing a year (sentence) | €40,000 | €40,000 | 40000 | 40000 | 0 | PASS |
| C15-R5 Branch case A | Withdrawals rise with prices at (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C15-R5 Branch case A | Withdrawal rate | 8.0% | 8.0% | 0.080000 | 0.080000 | 0 | PASS |
| C15-R6 Branch case B | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R6 Branch case B | Could last about (years) | 9 years | 9 years | 9 | 9 | 0 | PASS |
| C15-R6 Branch case B | Withdrawing a year (sentence) | €30,000 | €30,000 | 30000 | 30000 | 0 | PASS |
| C15-R6 Branch case B | Withdrawals rise with prices at (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C15-R6 Branch case B | Withdrawal rate | 12.0% | 12.0% | 0.120000 | 0.120000 | 0 | PASS |
| C15-R7 Branch case C | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R7 Branch case C | Could last about (years) | 2 years | 2 years | 2 | 2 | 0 | PASS |
| C15-R7 Branch case C | Withdrawing a year (sentence) | €50,000 | €50,000 | 50000 | 50000 | 0 | PASS |
| C15-R7 Branch case C | Withdrawals rise with prices at (sentence) |  |  |  |  |  | PASS |
| C15-R7 Branch case C | Withdrawal rate | 50.0% | 50.0% | 0.500000 | 0.500000 | 0 | PASS |
| C15-R8 Random realistic (seed 2) | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R8 Random realistic (seed 2) | Could last about (years) | 10 years | 10 years | 10 | 10 | 0 | PASS |
| C15-R8 Random realistic (seed 2) | Withdrawing a year (sentence) | €45,000 | €45,000 | 45000 | 45000 | 0 | PASS |
| C15-R8 Random realistic (seed 2) | Withdrawals rise with prices at (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C15-R8 Random realistic (seed 2) | Withdrawal rate | 11.3% | 11.3% | 0.112500 | 0.112500 | 0 | PASS |
| C15-R9 Random realistic (seed 3) | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R9 Random realistic (seed 3) | Could last about (years) | 25 years | 25 years | 25 | 25 | 0 | PASS |
| C15-R9 Random realistic (seed 3) | Withdrawing a year (sentence) | €104,000 | €104,000 | 104000 | 104000 | 0 | PASS |
| C15-R9 Random realistic (seed 3) | Withdrawals rise with prices at (sentence) |  |  |  |  |  | PASS |
| C15-R9 Random realistic (seed 3) | Withdrawal rate | 6.0% | 6.0% | 0.060116 | 0.060116 | 1.39e-17 | PASS |
| C15-R10 Random realistic (seed 4) | Headline label | Could last about | Could last about |  |  |  | PASS |
| C15-R10 Random realistic (seed 4) | Could last about (years) | 8 years | 8 years | 8 | 8 | 0 | PASS |
| C15-R10 Random realistic (seed 4) | Withdrawing a year (sentence) | €116,000 | €116,000 | 116000 | 116000 | 0 | PASS |
| C15-R10 Random realistic (seed 4) | Withdrawals rise with prices at (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C15-R10 Random realistic (seed 4) | Withdrawal rate | 11.3% | 11.3% | 0.112621 | 0.112621 | 4.16e-17 | PASS |

### C16 Drawdown scenarios (drawdown): 60/60 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C16-R1 Defaults | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R1 Defaults | Balanced scenario lasts (years) | 26 years | 26 years | 26 | 26 | 0 | PASS |
| C16-R1 Defaults | Cautious (2%) | 20 yrs | 20 yrs | 20 | 20 | 0 | PASS |
| C16-R1 Defaults | Balanced (4%) | 26 yrs | 26 yrs | 26 | 26 | 0 | PASS |
| C16-R1 Defaults | Growth (6%) | 41 yrs | 41 yrs | 41 | 41 | 0 | PASS |
| C16-R1 Defaults | Withdrawals rise with prices at (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C16-R2 Low / edge | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R2 Low / edge | Balanced scenario lasts (years) | 60+ years | 60+ years | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | Cautious (2%) | 60 yrs | 60 yrs | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | Balanced (4%) | 60 yrs | 60 yrs | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | Growth (6%) | 60+ yrs | 60+ yrs | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | Withdrawals rise with prices at (sentence) |  |  |  |  |  | PASS |
| C16-R3 High | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R3 High | Balanced scenario lasts (years) | 0 years | 0 years | 0 | 0 | 0 | PASS |
| C16-R3 High | Cautious (2%) | 0 yrs | 0 yrs | 0 | 0 | 0 | PASS |
| C16-R3 High | Balanced (4%) | 0 yrs | 0 yrs | 0 | 0 | 0 | PASS |
| C16-R3 High | Growth (6%) | 0 yrs | 0 yrs | 0 | 0 | 0 | PASS |
| C16-R3 High | Withdrawals rise with prices at (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C16-R4 Random realistic (seed 1) | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R4 Random realistic (seed 1) | Balanced scenario lasts (years) | 10 years | 10 years | 10 | 10 | 0 | PASS |
| C16-R4 Random realistic (seed 1) | Cautious (2%) | 9 yrs | 9 yrs | 9 | 9 | 0 | PASS |
| C16-R4 Random realistic (seed 1) | Balanced (4%) | 10 yrs | 10 yrs | 10 | 10 | 0 | PASS |
| C16-R4 Random realistic (seed 1) | Growth (6%) | 12 yrs | 12 yrs | 12 | 12 | 0 | PASS |
| C16-R4 Random realistic (seed 1) | Withdrawals rise with prices at (sentence) | 2.75% | 2.75% |  | 0.0275 |  | PASS |
| C16-R5 Branch case A | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R5 Branch case A | Balanced scenario lasts (years) | 56 years | 56 years | 56 | 56 | 0 | PASS |
| C16-R5 Branch case A | Cautious (2%) | 34 yrs | 34 yrs | 34 | 34 | 0 | PASS |
| C16-R5 Branch case A | Balanced (4%) | 56 yrs | 56 yrs | 56 | 56 | 0 | PASS |
| C16-R5 Branch case A | Growth (6%) | 60+ yrs | 60+ yrs | 60 | 60 | 0 | PASS |
| C16-R5 Branch case A | Withdrawals rise with prices at (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C16-R6 Branch case B | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R6 Branch case B | Balanced scenario lasts (years) | 26 years | 26 years | 26 | 26 | 0 | PASS |
| C16-R6 Branch case B | Cautious (2%) | 21 yrs | 21 yrs | 21 | 21 | 0 | PASS |
| C16-R6 Branch case B | Balanced (4%) | 26 yrs | 26 yrs | 26 | 26 | 0 | PASS |
| C16-R6 Branch case B | Growth (6%) | 38 yrs | 38 yrs | 38 | 38 | 0 | PASS |
| C16-R6 Branch case B | Withdrawals rise with prices at (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |
| C16-R7 Branch case C | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R7 Branch case C | Balanced scenario lasts (years) | 60+ years | 60+ years | 60 | 60 | 0 | PASS |
| C16-R7 Branch case C | Cautious (2%) | 35 yrs | 35 yrs | 35 | 35 | 0 | PASS |
| C16-R7 Branch case C | Balanced (4%) | 60 yrs | 60 yrs | 60 | 60 | 0 | PASS |
| C16-R7 Branch case C | Growth (6%) | 60+ yrs | 60+ yrs | 60 | 60 | 0 | PASS |
| C16-R7 Branch case C | Withdrawals rise with prices at (sentence) |  |  |  |  |  | PASS |
| C16-R8 Random realistic (seed 2) | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R8 Random realistic (seed 2) | Balanced scenario lasts (years) | 60+ years | 60+ years | 60 | 60 | 0 | PASS |
| C16-R8 Random realistic (seed 2) | Cautious (2%) | 36 yrs | 36 yrs | 36 | 36 | 0 | PASS |
| C16-R8 Random realistic (seed 2) | Balanced (4%) | 60 yrs | 60 yrs | 60 | 60 | 0 | PASS |
| C16-R8 Random realistic (seed 2) | Growth (6%) | 60+ yrs | 60+ yrs | 60 | 60 | 0 | PASS |
| C16-R8 Random realistic (seed 2) | Withdrawals rise with prices at (sentence) | 2% | 2% |  | 0.02 |  | PASS |
| C16-R9 Random realistic (seed 3) | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R9 Random realistic (seed 3) | Balanced scenario lasts (years) | 27 years | 27 years | 27 | 27 | 0 | PASS |
| C16-R9 Random realistic (seed 3) | Cautious (2%) | 20 yrs | 20 yrs | 20 | 20 | 0 | PASS |
| C16-R9 Random realistic (seed 3) | Balanced (4%) | 27 yrs | 27 yrs | 27 | 27 | 0 | PASS |
| C16-R9 Random realistic (seed 3) | Growth (6%) | 60+ yrs | 60+ yrs | 60 | 60 | 0 | PASS |
| C16-R9 Random realistic (seed 3) | Withdrawals rise with prices at (sentence) |  |  |  |  |  | PASS |
| C16-R10 Random realistic (seed 4) | Headline label | Balanced scenario lasts | Balanced scenario lasts |  |  |  | PASS |
| C16-R10 Random realistic (seed 4) | Balanced scenario lasts (years) | 16 years | 16 years | 16 | 16 | 0 | PASS |
| C16-R10 Random realistic (seed 4) | Cautious (2%) | 13 yrs | 13 yrs | 13 | 13 | 0 | PASS |
| C16-R10 Random realistic (seed 4) | Balanced (4%) | 16 yrs | 16 yrs | 16 | 16 | 0 | PASS |
| C16-R10 Random realistic (seed 4) | Growth (6%) | 19 yrs | 19 yrs | 19 | 19 | 0 | PASS |
| C16-R10 Random realistic (seed 4) | Withdrawals rise with prices at (sentence) | 3.5% | 3.5% |  | 0.035 |  | PASS |

### C17 Inflation adjusted return (realreturn): 60/60 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C17-R1 Defaults | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R1 Defaults | Headline figure | €30,893 | €30,893 | 30,893.4852 | 30,893.4852 | -2.91e-11 | PASS |
| C17-R1 Defaults | Future value | €41,579 | €41,579 | 41,578.5636 | 41,578.5636 | 2.18e-11 | PASS |
| C17-R1 Defaults | Real return a year | 2.94% | 2.94% | 0.029412 | 0.029412 | 3.12e-17 | PASS |
| C17-R1 Defaults | Value in today's money | €30,893 | €30,893 | 30,893.4852 | 30,893.4852 | -2.91e-11 | PASS |
| C17-R1 Defaults | Real return (sentence, 1 dp) | 2.9% | 2.9% | 0.029412 | 0.029412 | 3.12e-17 | PASS |
| C17-R2 Low / edge | Headline label | Future value | Future value |  |  |  | PASS |
| C17-R2 Low / edge | Headline figure | €500 | €500 | 500 | 500 | 0 | PASS |
| C17-R2 Low / edge | Future value | €500 | €500 | 500 | 500 | 0 | PASS |
| C17-R2 Low / edge | Real return a year |  |  |  |  |  | PASS |
| C17-R2 Low / edge | Value in today's money |  |  |  |  |  | PASS |
| C17-R2 Low / edge | Real return (sentence, 1 dp) |  |  |  |  |  | PASS |
| C17-R3 High | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R3 High | Headline figure | €5,715,621 | €5,715,621 | 5,715,620.9438 | 5,715,620.9438 | 2.79e-09 | PASS |
| C17-R3 High | Future value | €22,629,628 | €22,629,628 | 22,629,627.7841 | 22,629,627.7841 | 5.22e-08 | PASS |
| C17-R3 High | Real return a year | 6.28% | 6.28% | 0.062802 | 0.062802 | -4.16e-17 | PASS |
| C17-R3 High | Value in today's money | €5,715,621 | €5,715,621 | 5,715,620.9438 | 5,715,620.9438 | 2.79e-09 | PASS |
| C17-R3 High | Real return (sentence, 1 dp) | 6.3% | 6.3% | 0.062802 | 0.062802 | -4.16e-17 | PASS |
| C17-R4 Random realistic (seed 1) | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R4 Random realistic (seed 1) | Headline figure | €583,978 | €583,978 | 583,977.7914 | 583,977.7914 | 4.66e-10 | PASS |
| C17-R4 Random realistic (seed 1) | Future value | €706,105 | €706,105 | 706,104.7696 | 706,104.7696 | 1.16e-10 | PASS |
| C17-R4 Random realistic (seed 1) | Real return a year | 3.16% | 3.16% | 0.031630 | 0.031630 | 2.78e-17 | PASS |
| C17-R4 Random realistic (seed 1) | Value in today's money | €583,978 | €583,978 | 583,977.7914 | 583,977.7914 | 4.66e-10 | PASS |
| C17-R4 Random realistic (seed 1) | Real return (sentence, 1 dp) | 3.2% | 3.2% | 0.031630 | 0.031630 | 2.78e-17 | PASS |
| C17-R5 Branch case A | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R5 Branch case A | Headline figure | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C17-R5 Branch case A | Future value | €26,917 | €26,917 | 26,917.3668 | 26,917.3668 | 0 | PASS |
| C17-R5 Branch case A | Real return a year | 0% | 0% | 0 | 0 | 0 | PASS |
| C17-R5 Branch case A | Value in today's money | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C17-R5 Branch case A | Real return (sentence, 1 dp) | 0.0% | 0.0% | 0 | 0 | 0 | PASS |
| C17-R6 Branch case B | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R6 Branch case B | Headline figure | €11,938 | €11,938 | 11,937.8124 | 11,937.8124 | 1.82e-12 | PASS |
| C17-R6 Branch case B | Future value | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C17-R6 Branch case B | Real return a year | -3.38% | -3.38% | -0.033816 | -0.033816 | -2.78e-17 | PASS |
| C17-R6 Branch case B | Value in today's money | €11,938 | €11,938 | 11,937.8124 | 11,937.8124 | 1.82e-12 | PASS |
| C17-R6 Branch case B | Real return (sentence, 1 dp) | -3.4% | -3.4% | -0.033816 | -0.033816 | -2.78e-17 | PASS |
| C17-R7 Branch case C | Headline label | Future value | Future value |  |  |  | PASS |
| C17-R7 Branch case C | Headline figure | €201,438 | €201,438 | 201,437.7788 | 201,437.7788 | 4.95e-10 | PASS |
| C17-R7 Branch case C | Future value | €201,438 | €201,438 | 201,437.7788 | 201,437.7788 | 4.95e-10 | PASS |
| C17-R7 Branch case C | Real return a year |  |  |  |  |  | PASS |
| C17-R7 Branch case C | Value in today's money |  |  |  |  |  | PASS |
| C17-R7 Branch case C | Real return (sentence, 1 dp) |  |  |  |  |  | PASS |
| C17-R8 Random realistic (seed 2) | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R8 Random realistic (seed 2) | Headline figure | €238,484 | €238,484 | 238,483.7286 | 238,483.7286 | -2.04e-10 | PASS |
| C17-R8 Random realistic (seed 2) | Future value | €314,674 | €314,674 | 314,674.2152 | 314,674.2152 | -1.16e-10 | PASS |
| C17-R8 Random realistic (seed 2) | Real return a year | 1.47% | 1.47% | 0.014706 | 0.014706 | -2.43e-17 | PASS |
| C17-R8 Random realistic (seed 2) | Value in today's money | €238,484 | €238,484 | 238,483.7286 | 238,483.7286 | -2.04e-10 | PASS |
| C17-R8 Random realistic (seed 2) | Real return (sentence, 1 dp) | 1.5% | 1.5% | 0.014706 | 0.014706 | -2.43e-17 | PASS |
| C17-R9 Random realistic (seed 3) | Headline label | Future value | Future value |  |  |  | PASS |
| C17-R9 Random realistic (seed 3) | Headline figure | €925,052 | €925,052 | 925,052.4269 | 925,052.4269 | 3.49e-10 | PASS |
| C17-R9 Random realistic (seed 3) | Future value | €925,052 | €925,052 | 925,052.4269 | 925,052.4269 | 3.49e-10 | PASS |
| C17-R9 Random realistic (seed 3) | Real return a year |  |  |  |  |  | PASS |
| C17-R9 Random realistic (seed 3) | Value in today's money |  |  |  |  |  | PASS |
| C17-R9 Random realistic (seed 3) | Real return (sentence, 1 dp) |  |  |  |  |  | PASS |
| C17-R10 Random realistic (seed 4) | Headline label | In today's money | In today's money |  |  |  | PASS |
| C17-R10 Random realistic (seed 4) | Headline figure | €895,255 | €895,255 | 895,254.8636 | 895,254.8636 | -2.33e-10 | PASS |
| C17-R10 Random realistic (seed 4) | Future value | €3,308,872 | €3,308,872 | 3,308,872.1059 | 3,308,872.1059 | 4.66e-10 | PASS |
| C17-R10 Random realistic (seed 4) | Real return a year | 1.93% | 1.93% | 0.019324 | 0.019324 | -2.78e-17 | PASS |
| C17-R10 Random realistic (seed 4) | Value in today's money | €895,255 | €895,255 | 895,254.8636 | 895,254.8636 | -2.33e-10 | PASS |
| C17-R10 Random realistic (seed 4) | Real return (sentence, 1 dp) | 1.9% | 1.9% | 0.019324 | 0.019324 | -2.78e-17 | PASS |

### C18 Regular investing (regularinvest): 108/108 PASS, 9 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C18-R1 Defaults | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C18-R1 Defaults | Headline figure | €73,109 | €73,109 | 73,108.7854 | 73,108.7854 | -4.37e-11 | PASS |
| C18-R1 Defaults | Real return a year (sentence) |  |  |  |  |  | PASS |
| C18-R1 Defaults | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C18-R1 Defaults | Fees quoted (sentence) | 1% | 1% |  | 0.01 |  | PASS |
| C18-R1 Defaults | Fees could cost (sentence) | €6,339 | €6,339 | 6,338.5929 | 6,338.5929 | 0 | PASS |
| C18-R1 Defaults | Paid in | €54,000 | €54,000 | 54000 | 54000 | 0 | PASS |
| C18-R1 Defaults | Before fees | €79,447 | €79,447 | 79,447.3784 | 79,447.3784 | 0 | PASS |
| C18-R1 Defaults | Fees cost | €6,339 | €6,339 | 6,338.5929 | 6,338.5929 | 0 | PASS |
| C18-R1 Defaults | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C18-R1 Defaults | "Add to my plan" goal amount (Build wealth) | 73109 | 73109 | 73,109 | 73109 | 0 | PASS |
| C18-R1 Defaults | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C18-R2 Low / edge | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C18-R2 Low / edge | Headline figure | €300 | €300 | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | Real return a year (sentence) |  |  |  |  |  | PASS |
| C18-R2 Low / edge | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C18-R2 Low / edge | Fees quoted (sentence) | 0% | 0% |  | 0 |  | PASS |
| C18-R2 Low / edge | Fees could cost (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C18-R2 Low / edge | Paid in | €300 | €300 | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | Before fees | €300 | €300 | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | Fees cost | €0 | €0 | 0 | 0 | 0 | PASS |
| C18-R2 Low / edge | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C18-R2 Low / edge | "Add to my plan" goal amount (Build wealth) | 300 | 300 | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C18-R3 High | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C18-R3 High | Headline figure | €1,764,257 | €1,764,257 | 1,764,256.6391 | 1,764,256.6391 | 1.40e-09 | PASS |
| C18-R3 High | Real return a year (sentence) | 1.2% | 1.2% | 0.012174 | 0.012174 | 3.12e-17 | PASS |
| C18-R3 High | Growth after fees quoted (sentence) | 4.76% | 4.76% |  | 0.0476 |  | PASS |
| C18-R3 High | Fees quoted (sentence) | 3% | 3% |  | 0.03 |  | PASS |
| C18-R3 High | Fees could cost (sentence) | €9,120,246 | €9,120,246 | 9,120,246.4796 | 9,120,246.4796 | 0 | PASS |
| C18-R3 High | Paid in | €2,400,000 | €2,400,000 | 2400000 | 2400000 | 0 | PASS |
| C18-R3 High | Before fees | €16,105,397 | €16,105,397 | 16,105,396.7284 | 16,105,396.7284 | -1.68e-08 | PASS |
| C18-R3 High | Fees cost | €9,120,246 | €9,120,246 | 9,120,246.4796 | 9,120,246.4796 | 0 | PASS |
| C18-R3 High | Worth in today's money (prices rising [inflation] a year) | €1,764,257 | €1,764,257 | 1,764,256.6391 | 1,764,256.6391 | 1.40e-09 | PASS |
| C18-R3 High | "Add to my plan" goal amount (Build wealth) | 6985150 | 6985150 | 6,985,150 | 6985150 | 0 | PASS |
| C18-R3 High | "Add to my plan" goal years | 40 | 40 | 40 | 40 | 0 | PASS |
| C18-R4 Random realistic (seed 1) | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C18-R4 Random realistic (seed 1) | Headline figure | €79,968 | €79,968 | 79,967.6218 | 79,967.6218 | -2.91e-11 | PASS |
| C18-R4 Random realistic (seed 1) | Real return a year (sentence) |  |  |  |  |  | PASS |
| C18-R4 Random realistic (seed 1) | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C18-R4 Random realistic (seed 1) | Fees quoted (sentence) | 2.15% | 2.15% |  | 0.0215 |  | PASS |
| C18-R4 Random realistic (seed 1) | Fees could cost (sentence) | €3,534 | €3,534 | 3,534.0616 | 3,534.0616 | -2.27e-12 | PASS |
| C18-R4 Random realistic (seed 1) | Paid in | €78,000 | €78,000 | 78000 | 78000 | 0 | PASS |
| C18-R4 Random realistic (seed 1) | Before fees | €83,502 | €83,502 | 83,501.6834 | 83,501.6834 | 2.91e-11 | PASS |
| C18-R4 Random realistic (seed 1) | Fees cost | €3,534 | €3,534 | 3,534.0616 | 3,534.0616 | -2.27e-12 | PASS |
| C18-R4 Random realistic (seed 1) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C18-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Build wealth) | 79968 | 79968 | 79,968 | 79968 | 0 | PASS |
| C18-R4 Random realistic (seed 1) | "Add to my plan" goal years | 4 | 4 | 4 | 4 | 0 | PASS |
| C18-R5 Branch case A | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C18-R5 Branch case A | Headline figure | €54,321 | €54,321 | 54,320.9045 | 54,320.9045 | -2.18e-11 | PASS |
| C18-R5 Branch case A | Real return a year (sentence) | 1.9% | 1.9% | 0.019118 | 0.019118 | 1.73e-17 | PASS |
| C18-R5 Branch case A | Growth after fees quoted (sentence) | 3.95% | 3.95% |  | 0.0395 |  | PASS |
| C18-R5 Branch case A | Fees quoted (sentence) | 1% | 1% |  | 0.01 |  | PASS |
| C18-R5 Branch case A | Fees could cost (sentence) | €6,339 | €6,339 | 6,338.5929 | 6,338.5929 | 0 | PASS |
| C18-R5 Branch case A | Paid in | €54,000 | €54,000 | 54000 | 54000 | 0 | PASS |
| C18-R5 Branch case A | Before fees | €79,447 | €79,447 | 79,447.3784 | 79,447.3784 | 0 | PASS |
| C18-R5 Branch case A | Fees cost | €6,339 | €6,339 | 6,338.5929 | 6,338.5929 | 0 | PASS |
| C18-R5 Branch case A | Worth in today's money (prices rising [inflation] a year) | €54,321 | €54,321 | 54,320.9045 | 54,320.9045 | -2.18e-11 | PASS |
| C18-R5 Branch case A | "Add to my plan" goal amount (Build wealth) | 73109 | 73109 | 73,109 | 73109 | 0 | PASS |
| C18-R5 Branch case A | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C18-R6 Branch case B | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C18-R6 Branch case B | Headline figure | €43,401 | €43,401 | 43,401.3938 | 43,401.3938 | -1.46e-11 | PASS |
| C18-R6 Branch case B | Real return a year (sentence) |  |  |  |  |  | PASS |
| C18-R6 Branch case B | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C18-R6 Branch case B | Fees quoted (sentence) | 3% | 3% |  | 0.03 |  | PASS |
| C18-R6 Branch case B | Fees could cost (sentence) | €10,599 | €10,599 | 10,598.6062 | 10,598.6062 | 1.27e-11 | PASS |
| C18-R6 Branch case B | Paid in | €54,000 | €54,000 | 54000 | 54000 | 0 | PASS |
| C18-R6 Branch case B | Before fees | €54,000 | €54,000 | 54000 | 54000 | 0 | PASS |
| C18-R6 Branch case B | Fees cost | €10,599 | €10,599 | 10,598.6062 | 10,598.6062 | 1.27e-11 | PASS |
| C18-R6 Branch case B | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C18-R6 Branch case B | "Add to my plan" goal amount (Build wealth) | 43401 | 43401 | 43,401 | 43401 | 0 | PASS |
| C18-R6 Branch case B | "Add to my plan" goal years | 15 | 15 | 15 | 15 | 0 | PASS |
| C18-R8 Random realistic (seed 2) | Headline label | In today's money (after fees) | In today's money (after fees) |  |  |  | PASS |
| C18-R8 Random realistic (seed 2) | Headline figure | €1,298,219 | €1,298,219 | 1,298,219.1167 | 1,298,219.1167 | 3.49e-09 | PASS |
| C18-R8 Random realistic (seed 2) | Real return a year (sentence) | 3.8% | 3.8% | 0.037586 | 0.037586 | 0 | PASS |
| C18-R8 Random realistic (seed 2) | Growth after fees quoted (sentence) | 5.83% | 5.83% |  | 0.0583 |  | PASS |
| C18-R8 Random realistic (seed 2) | Fees quoted (sentence) | 1.55% | 1.55% |  | 0.0155 |  | PASS |
| C18-R8 Random realistic (seed 2) | Fees could cost (sentence) | €366,940 | €366,940 | 366,940.2692 | 366,940.2692 | 0 | PASS |
| C18-R8 Random realistic (seed 2) | Paid in | €1,054,500 | €1,054,500 | 1054500 | 1054500 | 0 | PASS |
| C18-R8 Random realistic (seed 2) | Before fees | €2,258,200 | €2,258,200 | 2,258,200.3828 | 2,258,200.3828 | -4.66e-10 | PASS |
| C18-R8 Random realistic (seed 2) | Fees cost | €366,940 | €366,940 | 366,940.2692 | 366,940.2692 | 0 | PASS |
| C18-R8 Random realistic (seed 2) | Worth in today's money (prices rising [inflation] a year) | €1,298,219 | €1,298,219 | 1,298,219.1167 | 1,298,219.1167 | 3.49e-09 | PASS |
| C18-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Build wealth) | 1891260 | 1891260 | 1,891,260 | 1891260 | 0 | PASS |
| C18-R8 Random realistic (seed 2) | "Add to my plan" goal years | 19 | 19 | 19 | 19 | 0 | PASS |
| C18-R9 Random realistic (seed 3) | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C18-R9 Random realistic (seed 3) | Headline figure | €1,602,647 | €1,602,647 | 1,602,646.5241 | 1,602,646.5241 | -4.42e-09 | PASS |
| C18-R9 Random realistic (seed 3) | Real return a year (sentence) |  |  |  |  |  | PASS |
| C18-R9 Random realistic (seed 3) | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C18-R9 Random realistic (seed 3) | Fees quoted (sentence) | 2.7% | 2.7% |  | 0.027 |  | PASS |
| C18-R9 Random realistic (seed 3) | Fees could cost (sentence) | €914,745 | €914,745 | 914,744.5531 | 914,744.5531 | -1.16e-10 | PASS |
| C18-R9 Random realistic (seed 3) | Paid in | €1,440,000 | €1,440,000 | 1440000 | 1440000 | 0 | PASS |
| C18-R9 Random realistic (seed 3) | Before fees | €2,517,391 | €2,517,391 | 2,517,391.0772 | 2,517,391.0772 | -1.86e-09 | PASS |
| C18-R9 Random realistic (seed 3) | Fees cost | €914,745 | €914,745 | 914,744.5531 | 914,744.5531 | -1.16e-10 | PASS |
| C18-R9 Random realistic (seed 3) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C18-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Build wealth) | 1602647 | 1602647 | 1,602,647 | 1602647 | 0 | PASS |
| C18-R9 Random realistic (seed 3) | "Add to my plan" goal years | 30 | 30 | 30 | 30 | 0 | PASS |
| C18-R10 Random realistic (seed 4) | Headline label | Could grow to (after fees) | Could grow to (after fees) |  |  |  | PASS |
| C18-R10 Random realistic (seed 4) | Headline figure | €1,569,517 | €1,569,517 | 1,569,517.238 | 1,569,517.238 | -4.19e-09 | PASS |
| C18-R10 Random realistic (seed 4) | Real return a year (sentence) |  |  |  |  |  | PASS |
| C18-R10 Random realistic (seed 4) | Growth after fees quoted (sentence) |  |  |  |  |  | PASS |
| C18-R10 Random realistic (seed 4) | Fees quoted (sentence) | 0.8% | 0.8% |  | 0.008 |  | PASS |
| C18-R10 Random realistic (seed 4) | Fees could cost (sentence) | €312,337 | €312,337 | 312,336.6831 | 312,336.6831 | -3.49e-10 | PASS |
| C18-R10 Random realistic (seed 4) | Paid in | €691,200 | €691,200 | 691200 | 691200 | 0 | PASS |
| C18-R10 Random realistic (seed 4) | Before fees | €1,881,854 | €1,881,854 | 1,881,853.9212 | 1,881,853.9212 | -4.42e-09 | PASS |
| C18-R10 Random realistic (seed 4) | Fees cost | €312,337 | €312,337 | 312,336.6831 | 312,336.6831 | -3.49e-10 | PASS |
| C18-R10 Random realistic (seed 4) | Worth in today's money (prices rising [inflation] a year) |  |  |  |  |  | PASS |
| C18-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Build wealth) | 1569517 | 1569517 | 1,569,517 | 1569517 | 0 | PASS |
| C18-R10 Random realistic (seed 4) | "Add to my plan" goal years | 36 | 36 | 36 | 36 | 0 | PASS |

### C19 Fees impact (fees): 45/45 PASS, 9 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C19-R1 Defaults | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R1 Defaults | Difference | €21,953 | €21,953 | 21,952.5954 | 21,952.5954 | 4.37e-11 | PASS |
| C19-R1 Defaults | Fee difference quoted (sentence) | 1.0% | 1.0% | 0.010000 | 0.010000 | 0 | PASS |
| C19-R1 Defaults | With fee A | €120,010 | €120,010 | 120,010.0456 | 120,010.0456 | 8.73e-11 | PASS |
| C19-R1 Defaults | With fee B | €98,057 | €98,057 | 98,057.4501 | 98,057.4501 | 5.82e-11 | PASS |
| C19-R2 Low / edge | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R2 Low / edge | Difference | €0 | €0 | 0 | 0 | 0 | PASS |
| C19-R2 Low / edge | Fee difference quoted (sentence) | 0.0% | 0.0% | 0 | 0 | 0 | PASS |
| C19-R2 Low / edge | With fee A | €1,000 | €1,000 | 1000 | 1000 | 0 | PASS |
| C19-R2 Low / edge | With fee B | €1,000 | €1,000 | 1000 | 1000 | 0 | PASS |
| C19-R3 High | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R3 High | Difference | €15,300,314 | €15,300,314 | 15,300,313.5523 | 15,300,313.5523 | 3.35e-08 | PASS |
| C19-R3 High | Fee difference quoted (sentence) | 3.0% | 3.0% | 0.030000 | 0.030000 | 0 | PASS |
| C19-R3 High | With fee A | €6,424,208 | €6,424,208 | 6,424,207.9445 | 6,424,207.9445 | 5.59e-09 | PASS |
| C19-R3 High | With fee B | €21,724,521 | €21,724,521 | 21,724,521.4968 | 21,724,521.4968 | 0 | PASS |
| C19-R4 Random realistic (seed 1) | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R4 Random realistic (seed 1) | Difference | €1,027,480 | €1,027,480 | 1,027,479.7014 | 1,027,479.7014 | -2.21e-09 | PASS |
| C19-R4 Random realistic (seed 1) | Fee difference quoted (sentence) | 1.0% | 1.0% | 0.010000 | 0.010000 | -1.73e-18 | PASS |
| C19-R4 Random realistic (seed 1) | With fee A | €3,117,773 | €3,117,773 | 3,117,773.1412 | 3,117,773.1412 | -4.66e-10 | PASS |
| C19-R4 Random realistic (seed 1) | With fee B | €4,145,253 | €4,145,253 | 4,145,252.8426 | 4,145,252.8426 | -2.33e-09 | PASS |
| C19-R5 Branch case A | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R5 Branch case A | Difference | €11,070 | €11,070 | 11,070.0297 | 11,070.0297 | 9.09e-12 | PASS |
| C19-R5 Branch case A | Fee difference quoted (sentence) | 0.5% | 0.5% | 0.005000 | 0.005000 | 0 | PASS |
| C19-R5 Branch case A | With fee A | €104,207 | €104,207 | 104,206.5163 | 104,206.5163 | -3.06e-10 | PASS |
| C19-R5 Branch case A | With fee B | €115,277 | €115,277 | 115,276.5461 | 115,276.5461 | 3.93e-10 | PASS |
| C19-R6 Branch case B | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R6 Branch case B | Difference | €59,858 | €59,858 | 59,858.2076 | 59,858.2076 | -7.28e-12 | PASS |
| C19-R6 Branch case B | Fee difference quoted (sentence) | 1.9% | 1.9% | 0.019000 | 0.019000 | -3.47e-18 | PASS |
| C19-R6 Branch case B | With fee A | €187,392 | €187,392 | 187,391.7259 | 187,391.7259 | -5.82e-11 | PASS |
| C19-R6 Branch case B | With fee B | €127,534 | €127,534 | 127,533.5182 | 127,533.5182 | 5.82e-11 | PASS |
| C19-R8 Random realistic (seed 2) | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R8 Random realistic (seed 2) | Difference | €0 | €0 | 0 | 0 | 0 | PASS |
| C19-R8 Random realistic (seed 2) | Fee difference quoted (sentence) | 0.0% | 0.0% | 0 | 0 | 0 | PASS |
| C19-R8 Random realistic (seed 2) | With fee A | €498,172 | €498,172 | 498,171.648 | 498,171.648 | -5.82e-11 | PASS |
| C19-R8 Random realistic (seed 2) | With fee B | €498,172 | €498,172 | 498,171.648 | 498,171.648 | -5.82e-11 | PASS |
| C19-R9 Random realistic (seed 3) | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R9 Random realistic (seed 3) | Difference | €1,871 | €1,871 | 1,871.3442 | 1,871.3442 | -1.36e-12 | PASS |
| C19-R9 Random realistic (seed 3) | Fee difference quoted (sentence) | 0.3% | 0.3% | 0.003000 | 0.003000 | 1.73e-18 | PASS |
| C19-R9 Random realistic (seed 3) | With fee A | €203,354 | €203,354 | 203,354.0008 | 203,354.0008 | 0 | PASS |
| C19-R9 Random realistic (seed 3) | With fee B | €205,225 | €205,225 | 205,225.3449 | 205,225.3449 | 0 | PASS |
| C19-R10 Random realistic (seed 4) | Headline label | Difference | Difference |  |  |  | PASS |
| C19-R10 Random realistic (seed 4) | Difference | €21,448 | €21,448 | 21,447.9478 | 21,447.9478 | -2.18e-11 | PASS |
| C19-R10 Random realistic (seed 4) | Fee difference quoted (sentence) | 0.5% | 0.5% | 0.005000 | 0.005000 | 0 | PASS |
| C19-R10 Random realistic (seed 4) | With fee A | €372,124 | €372,124 | 372,123.7273 | 372,123.7273 | 0 | PASS |
| C19-R10 Random realistic (seed 4) | With fee B | €393,572 | €393,572 | 393,571.6751 | 393,571.6751 | 3.49e-10 | PASS |

### C20 Risk and return (riskreturn): 54/54 PASS, 9 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C20-R1 Defaults | Headline label | Balanced · middle outcome | Balanced · middle outcome |  |  |  | PASS |
| C20-R1 Defaults | Middle outcome (headline) | €29,605 | €29,605 | 29,604.8857 | 29,604.8857 | 1.09e-11 | PASS |
| C20-R1 Defaults | A difficult year could see a fall of (sentence, %) | 16% | 16% | 16 | 16 | 0 | PASS |
| C20-R1 Defaults | Weaker outcome | €21,740 | €21,740 | 21,740.0366 | 21,740.0366 | -1.46e-11 | PASS |
| C20-R1 Defaults | Middle outcome | €29,605 | €29,605 | 29,604.8857 | 29,604.8857 | 1.09e-11 | PASS |
| C20-R1 Defaults | Stronger outcome | €39,944 | €39,944 | 39,943.7976 | 39,943.7976 | 2.18e-11 | PASS |
| C20-R2 Low / edge | Headline label | Cautious · middle outcome | Cautious · middle outcome |  |  |  | PASS |
| C20-R2 Low / edge | Middle outcome (headline) | €1,020 | €1,020 | 1020 | 1020 | 0 | PASS |
| C20-R2 Low / edge | A difficult year could see a fall of (sentence, %) | 8% | 8% | 8 | 8 | 0 | PASS |
| C20-R2 Low / edge | Weaker outcome | €970 | €970 | 970 | 970 | 0 | PASS |
| C20-R2 Low / edge | Middle outcome | €1,020 | €1,020 | 1020 | 1020 | 0 | PASS |
| C20-R2 Low / edge | Stronger outcome | €1,070 | €1,070 | 1070 | 1070 | 0 | PASS |
| C20-R3 High | Headline label | Growth · middle outcome | Growth · middle outcome |  |  |  | PASS |
| C20-R3 High | Middle outcome (headline) | €5,743,491 | €5,743,491 | 5,743,491.1729 | 5,743,491.1729 | 9.31e-10 | PASS |
| C20-R3 High | A difficult year could see a fall of (sentence, %) | 26% | 26% | 26 | 26 | 0 | PASS |
| C20-R3 High | Weaker outcome | €2,483,604 | €2,483,604 | 2,483,603.525 | 2,483,603.525 | 5.12e-09 | PASS |
| C20-R3 High | Middle outcome | €5,743,491 | €5,743,491 | 5,743,491.1729 | 5,743,491.1729 | 9.31e-10 | PASS |
| C20-R3 High | Stronger outcome | €12,982,878 | €12,982,878 | 12,982,877.6128 | 12,982,877.6128 | 4.10e-08 | PASS |
| C20-R4 Random realistic (seed 1) | Headline label | Cautious · middle outcome | Cautious · middle outcome |  |  |  | PASS |
| C20-R4 Random realistic (seed 1) | Middle outcome (headline) | €1,284,348 | €1,284,348 | 1,284,348.4028 | 1,284,348.4028 | -4.42e-09 | PASS |
| C20-R4 Random realistic (seed 1) | A difficult year could see a fall of (sentence, %) | 8% | 8% | 8 | 8 | 0 | PASS |
| C20-R4 Random realistic (seed 1) | Weaker outcome | €999,091 | €999,091 | 999,090.7697 | 999,090.7697 | 4.66e-10 | PASS |
| C20-R4 Random realistic (seed 1) | Middle outcome | €1,284,348 | €1,284,348 | 1,284,348.4028 | 1,284,348.4028 | -4.42e-09 | PASS |
| C20-R4 Random realistic (seed 1) | Stronger outcome | €1,647,089 | €1,647,089 | 1,647,089.237 | 1,647,089.237 | -2.79e-09 | PASS |
| C20-R5 Branch case A | Headline label | Growth · middle outcome | Growth · middle outcome |  |  |  | PASS |
| C20-R5 Branch case A | Middle outcome (headline) | €21,200 | €21,200 | 21200 | 21200 | 0 | PASS |
| C20-R5 Branch case A | A difficult year could see a fall of (sentence, %) | 26% | 26% | 26 | 26 | 0 | PASS |
| C20-R5 Branch case A | Weaker outcome | €18,000 | €18,000 | 18000 | 18000 | 0 | PASS |
| C20-R5 Branch case A | Middle outcome | €21,200 | €21,200 | 21200 | 21200 | 0 | PASS |
| C20-R5 Branch case A | Stronger outcome | €24,400 | €24,400 | 24400 | 24400 | 0 | PASS |
| C20-R6 Branch case B | Headline label | Cautious · middle outcome | Cautious · middle outcome |  |  |  | PASS |
| C20-R6 Branch case B | Middle outcome (headline) | €32,812 | €32,812 | 32,812.1199 | 32,812.1199 | -1.46e-11 | PASS |
| C20-R6 Branch case B | A difficult year could see a fall of (sentence, %) | 8% | 8% | 8 | 8 | 0 | PASS |
| C20-R6 Branch case B | Weaker outcome | €25,649 | €25,649 | 25,648.6399 | 25,648.6399 | 2.55e-11 | PASS |
| C20-R6 Branch case B | Middle outcome | €32,812 | €32,812 | 32,812.1199 | 32,812.1199 | -1.46e-11 | PASS |
| C20-R6 Branch case B | Stronger outcome | €41,876 | €41,876 | 41,875.5586 | 41,875.5586 | -2.18e-11 | PASS |
| C20-R8 Random realistic (seed 2) | Headline label | Balanced · middle outcome | Balanced · middle outcome |  |  |  | PASS |
| C20-R8 Random realistic (seed 2) | Middle outcome (headline) | €888,248 | €888,248 | 888,247.6126 | 888,247.6126 | 1.16e-10 | PASS |
| C20-R8 Random realistic (seed 2) | A difficult year could see a fall of (sentence, %) | 16% | 16% | 16 | 16 | 0 | PASS |
| C20-R8 Random realistic (seed 2) | Weaker outcome | €581,397 | €581,397 | 581,396.9484 | 581,396.9484 | 2.33e-10 | PASS |
| C20-R8 Random realistic (seed 2) | Middle outcome | €888,248 | €888,248 | 888,247.6126 | 888,247.6126 | 1.16e-10 | PASS |
| C20-R8 Random realistic (seed 2) | Stronger outcome | €1,344,557 | €1,344,557 | 1,344,556.56 | 1,344,556.56 | -1.63e-09 | PASS |
| C20-R9 Random realistic (seed 3) | Headline label | Cautious · middle outcome | Cautious · middle outcome |  |  |  | PASS |
| C20-R9 Random realistic (seed 3) | Middle outcome (headline) | €1,350,407 | €1,350,407 | 1,350,406.8271 | 1,350,406.8271 | 3.49e-09 | PASS |
| C20-R9 Random realistic (seed 3) | A difficult year could see a fall of (sentence, %) | 8% | 8% | 8 | 8 | 0 | PASS |
| C20-R9 Random realistic (seed 3) | Weaker outcome | €1,095,513 | €1,095,513 | 1,095,512.7531 | 1,095,512.7531 | 3.03e-09 | PASS |
| C20-R9 Random realistic (seed 3) | Middle outcome | €1,350,407 | €1,350,407 | 1,350,406.8271 | 1,350,406.8271 | 3.49e-09 | PASS |
| C20-R9 Random realistic (seed 3) | Stronger outcome | €1,660,612 | €1,660,612 | 1,660,611.9802 | 1,660,611.9802 | 4.19e-09 | PASS |
| C20-R10 Random realistic (seed 4) | Headline label | Growth · middle outcome | Growth · middle outcome |  |  |  | PASS |
| C20-R10 Random realistic (seed 4) | Middle outcome (headline) | €82,892 | €82,892 | 82892 | 82892 | 0 | PASS |
| C20-R10 Random realistic (seed 4) | A difficult year could see a fall of (sentence, %) | 26% | 26% | 26 | 26 | 0 | PASS |
| C20-R10 Random realistic (seed 4) | Weaker outcome | €70,380 | €70,380 | 70380 | 70380 | 0 | PASS |
| C20-R10 Random realistic (seed 4) | Middle outcome | €82,892 | €82,892 | 82892 | 82892 | 0 | PASS |
| C20-R10 Random realistic (seed 4) | Stronger outcome | €95,404 | €95,404 | 95404 | 95404 | 0 | PASS |

### C21 Life cover (lifecover): 56/56 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C21-R1 Defaults | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R1 Defaults | Illustrative cover gap | €680,000 | €680,000 | 680000 | 680000 | 0 | PASS |
| C21-R1 Defaults | Income replacement (60%) | €540,000 | €540,000 | 540000 | 540000 | 0 | PASS |
| C21-R1 Defaults | Debts to clear | €260,000 | €260,000 | 260000 | 260000 | 0 | PASS |
| C21-R1 Defaults | Existing cover + savings | €120,000 | €120,000 | 120000 | 120000 | 0 | PASS |
| C21-R1 Defaults | "Add to my plan" goal amount (Protect my family) | 680000 | 680000 | 680,000 | 680000 | 0 | PASS |
| C21-R1 Defaults | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C21-R2 Low / edge | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R2 Low / edge | Illustrative cover gap | €0 | €0 | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Income replacement (60%) | €0 | €0 | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Debts to clear | €0 | €0 | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Existing cover + savings | €3,000,000 | €3,000,000 | 3000000 | 3000000 | 0 | PASS |
| C21-R2 Low / edge | "Add to my plan" goal amount (Protect my family) |  |  |  |  |  | PASS |
| C21-R2 Low / edge | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C21-R3 High | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R3 High | Illustrative cover gap | €6,600,000 | €6,600,000 | 6600000 | 6600000 | 0 | PASS |
| C21-R3 High | Income replacement (60%) | €5,400,000 | €5,400,000 | 5400000 | 5400000 | 0 | PASS |
| C21-R3 High | Debts to clear | €1,200,000 | €1,200,000 | 1200000 | 1200000 | 0 | PASS |
| C21-R3 High | Existing cover + savings | €0 | €0 | 0 | 0 | 0 | PASS |
| C21-R3 High | "Add to my plan" goal amount (Protect my family) | 6600000 | 6600000 | 6,600,000 | 6600000 | 0 | PASS |
| C21-R3 High | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C21-R4 Random realistic (seed 1) | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R4 Random realistic (seed 1) | Illustrative cover gap | €676,600 | €676,600 | 676600 | 676600 | 0 | PASS |
| C21-R4 Random realistic (seed 1) | Income replacement (60%) | €2,937,600 | €2,937,600 | 2937600 | 2937600 | 0 | PASS |
| C21-R4 Random realistic (seed 1) | Debts to clear | €192,000 | €192,000 | 192000 | 192000 | 0 | PASS |
| C21-R4 Random realistic (seed 1) | Existing cover + savings | €2,453,000 | €2,453,000 | 2453000 | 2453000 | 0 | PASS |
| C21-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Protect my family) | 676600 | 676600 | 676,600 | 676600 | 0 | PASS |
| C21-R4 Random realistic (seed 1) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C21-R5 Branch case A | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R5 Branch case A | Illustrative cover gap | €0 | €0 | 0 | 0 | 0 | PASS |
| C21-R5 Branch case A | Income replacement (60%) | €0 | €0 | 0 | 0 | 0 | PASS |
| C21-R5 Branch case A | Debts to clear | €100,000 | €100,000 | 100000 | 100000 | 0 | PASS |
| C21-R5 Branch case A | Existing cover + savings | €100,000 | €100,000 | 100000 | 100000 | 0 | PASS |
| C21-R5 Branch case A | "Add to my plan" goal amount (Protect my family) |  |  |  |  |  | PASS |
| C21-R5 Branch case A | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C21-R8 Random realistic (seed 2) | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R8 Random realistic (seed 2) | Illustrative cover gap | €979,400 | €979,400 | 979400 | 979400 | 0 | PASS |
| C21-R8 Random realistic (seed 2) | Income replacement (60%) | €2,714,400 | €2,714,400 | 2714400 | 2714400 | 0 | PASS |
| C21-R8 Random realistic (seed 2) | Debts to clear | €657,000 | €657,000 | 657000 | 657000 | 0 | PASS |
| C21-R8 Random realistic (seed 2) | Existing cover + savings | €2,392,000 | €2,392,000 | 2392000 | 2392000 | 0 | PASS |
| C21-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Protect my family) | 979400 | 979400 | 979,400 | 979400 | 0 | PASS |
| C21-R8 Random realistic (seed 2) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C21-R9 Random realistic (seed 3) | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R9 Random realistic (seed 3) | Illustrative cover gap | €446,000 | €446,000 | 446000 | 446000 | 0 | PASS |
| C21-R9 Random realistic (seed 3) | Income replacement (60%) | €204,000 | €204,000 | 204000 | 204000 | 0 | PASS |
| C21-R9 Random realistic (seed 3) | Debts to clear | €950,000 | €950,000 | 950000 | 950000 | 0 | PASS |
| C21-R9 Random realistic (seed 3) | Existing cover + savings | €708,000 | €708,000 | 708000 | 708000 | 0 | PASS |
| C21-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Protect my family) | 446000 | 446000 | 446,000 | 446000 | 0 | PASS |
| C21-R9 Random realistic (seed 3) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C21-R10 Random realistic (seed 4) | Headline label | Illustrative cover gap | Illustrative cover gap |  |  |  | PASS |
| C21-R10 Random realistic (seed 4) | Illustrative cover gap | €211,000 | €211,000 | 211000 | 211000 | 0 | PASS |
| C21-R10 Random realistic (seed 4) | Income replacement (60%) | €513,000 | €513,000 | 513000 | 513000 | 0 | PASS |
| C21-R10 Random realistic (seed 4) | Debts to clear | €632,000 | €632,000 | 632000 | 632000 | 0 | PASS |
| C21-R10 Random realistic (seed 4) | Existing cover + savings | €934,000 | €934,000 | 934000 | 934000 | 0 | PASS |
| C21-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Protect my family) | 211000 | 211000 | 211,000 | 211000 | 0 | PASS |
| C21-R10 Random realistic (seed 4) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |

### C22 Income protection gap (incomegap): 56/56 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C22-R1 Defaults | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R1 Defaults | You could cope for about (months) | 6.2 months | 6.2 months | 6.200000 | 6.200000 | 0 | PASS |
| C22-R1 Defaults | Gap a month afterwards (sentence) | €2,500 | €2,500 | 2500 | 2500 | 0 | PASS |
| C22-R1 Defaults | Sick pay | 3 months | 3 months | 3 | 3 | 0 | PASS |
| C22-R1 Defaults | Savings would cover | 3.2 months | 3.2 months | 3.200000 | 3.200000 | 0 | PASS |
| C22-R1 Defaults | "Add to my plan" goal amount (Protect my income) | 30000 | 30000 | 30,000 | 30000 | 0 | PASS |
| C22-R1 Defaults | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R2 Low / edge | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R2 Low / edge | You could cope for about (months) | 0.0 months | 0.0 months | 0 | 0 | 0 | PASS |
| C22-R2 Low / edge | Gap a month afterwards (sentence) | €500 | €500 | 500 | 500 | 0 | PASS |
| C22-R2 Low / edge | Sick pay | 0 months | 0 months | 0 | 0 | 0 | PASS |
| C22-R2 Low / edge | Savings would cover | 0.0 months | 0.0 months | 0 | 0 | 0 | PASS |
| C22-R2 Low / edge | "Add to my plan" goal amount (Protect my income) | 6000 | 6000 | 6,000 | 6000 | 0 | PASS |
| C22-R2 Low / edge | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R3 High | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R3 High | You could cope for about (months) | 32.0 months | 32.0 months | 32 | 32 | 0 | PASS |
| C22-R3 High | Gap a month afterwards (sentence) | €10,000 | €10,000 | 10000 | 10000 | 0 | PASS |
| C22-R3 High | Sick pay | 12 months | 12 months | 12 | 12 | 0 | PASS |
| C22-R3 High | Savings would cover | 20.0 months | 20.0 months | 20 | 20 | 0 | PASS |
| C22-R3 High | "Add to my plan" goal amount (Protect my income) | 120000 | 120000 | 120,000 | 120000 | 0 | PASS |
| C22-R3 High | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R4 Random realistic (seed 1) | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R4 Random realistic (seed 1) | You could cope for about (months) | 75.7 months | 75.7 months | 75.666667 | 75.666667 | 2.84e-14 | PASS |
| C22-R4 Random realistic (seed 1) | Gap a month afterwards (sentence) | €900 | €900 | 900 | 900 | 0 | PASS |
| C22-R4 Random realistic (seed 1) | Sick pay | 4 months | 4 months | 4 | 4 | 0 | PASS |
| C22-R4 Random realistic (seed 1) | Savings would cover | 71.7 months | 71.7 months | 71.666667 | 71.666667 | 2.84e-14 | PASS |
| C22-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Protect my income) | 10800 | 10800 | 10,800 | 10800 | 0 | PASS |
| C22-R4 Random realistic (seed 1) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R6 Branch case B | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R6 Branch case B | You could cope for about (months) | 1.5 months | 1.5 months | 1.493600 | 1.493600 | 0 | PASS |
| C22-R6 Branch case B | Gap a month afterwards (sentence) | €2,500 | €2,500 | 2500 | 2500 | 0 | PASS |
| C22-R6 Branch case B | Sick pay | 1 months | 1 months | 1 | 1 | 0 | PASS |
| C22-R6 Branch case B | Savings would cover | 0.5 months | 0.5 months | 0.493600 | 0.493600 | 0 | PASS |
| C22-R6 Branch case B | "Add to my plan" goal amount (Protect my income) | 30000 | 30000 | 30,000 | 30000 | 0 | PASS |
| C22-R6 Branch case B | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R8 Random realistic (seed 2) | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R8 Random realistic (seed 2) | You could cope for about (months) | 65.7 months | 65.7 months | 65.705882 | 65.705882 | 2.84e-14 | PASS |
| C22-R8 Random realistic (seed 2) | Gap a month afterwards (sentence) | €1,700 | €1,700 | 1700 | 1700 | 0 | PASS |
| C22-R8 Random realistic (seed 2) | Sick pay | 6 months | 6 months | 6 | 6 | 0 | PASS |
| C22-R8 Random realistic (seed 2) | Savings would cover | 59.7 months | 59.7 months | 59.705882 | 59.705882 | 2.84e-14 | PASS |
| C22-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Protect my income) | 20400 | 20400 | 20,400 | 20400 | 0 | PASS |
| C22-R8 Random realistic (seed 2) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R9 Random realistic (seed 3) | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R9 Random realistic (seed 3) | You could cope for about (months) | 60.2 months | 60.2 months | 60.238095 | 60.238095 | -4.26e-14 | PASS |
| C22-R9 Random realistic (seed 3) | Gap a month afterwards (sentence) | €2,100 | €2,100 | 2100 | 2100 | 0 | PASS |
| C22-R9 Random realistic (seed 3) | Sick pay | 0 months | 0 months | 0 | 0 | 0 | PASS |
| C22-R9 Random realistic (seed 3) | Savings would cover | 60.2 months | 60.2 months | 60.238095 | 60.238095 | -4.26e-14 | PASS |
| C22-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Protect my income) | 25200 | 25200 | 25,200 | 25200 | 0 | PASS |
| C22-R9 Random realistic (seed 3) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C22-R10 Random realistic (seed 4) | Headline label | You could cope for about | You could cope for about |  |  |  | PASS |
| C22-R10 Random realistic (seed 4) | You could cope for about (months) | 35.0 months | 35.0 months | 35.040816 | 35.040816 | -1.42e-14 | PASS |
| C22-R10 Random realistic (seed 4) | Gap a month afterwards (sentence) | €4,900 | €4,900 | 4900 | 4900 | 0 | PASS |
| C22-R10 Random realistic (seed 4) | Sick pay | 8 months | 8 months | 8 | 8 | 0 | PASS |
| C22-R10 Random realistic (seed 4) | Savings would cover | 27.0 months | 27.0 months | 27.040816 | 27.040816 | -1.42e-14 | PASS |
| C22-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Protect my income) | 58800 | 58800 | 58,800 | 58800 | 0 | PASS |
| C22-R10 Random realistic (seed 4) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |

### C23 Mortgage protection (mortgageprotect): 60/60 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C23-R1 Defaults | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R1 Defaults | Cover needed today | €250,000 | €250,000 | 250000 | 250000 | 0 | PASS |
| C23-R1 Defaults | Repaying a month (sentence) | €1,320 | €1,320 | 1,319.5921 | 1,319.5921 | 4.55e-12 | PASS |
| C23-R1 Defaults | In 5 years | €217,762 | €217,762 | 217,761.5406 | 217,761.5406 | -1.16e-10 | PASS |
| C23-R1 Defaults | In 10 years | €178,398 | €178,398 | 178,398.4915 | 178,398.4915 | 3.20e-10 | PASS |
| C23-R1 Defaults | In 15 years | €130,336 | €130,336 | 130,336.3425 | 130,336.3425 | 2.76e-10 | PASS |
| C23-R2 Low / edge | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R2 Low / edge | Cover needed today | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C23-R2 Low / edge | Repaying a month (sentence) | €342 | €342 | 341.8749 | 341.8749 | 2.27e-13 | PASS |
| C23-R2 Low / edge | In 5 years | €0 | €0 | 0 | 0 | 0 | PASS |
| C23-R2 Low / edge | In 10 years | €0 | €0 | 0 | 0 | 0 | PASS |
| C23-R2 Low / edge | In 15 years | €0 | €0 | 0 | 0 | 0 | PASS |
| C23-R3 High | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R3 High | Cover needed today | €1,000,000 | €1,000,000 | 1000000 | 1000000 | 0 | PASS |
| C23-R3 High | Repaying a month (sentence) | €7,103 | €7,103 | 7,102.6088 | 7,102.6088 | 2.73e-12 | PASS |
| C23-R3 High | In 5 years | €967,968 | €967,968 | 967,968.3433 | 967,968.3433 | -2.33e-10 | PASS |
| C23-R3 High | In 10 years | €920,246 | €920,246 | 920,246.1171 | 920,246.1171 | -3.49e-10 | PASS |
| C23-R3 High | In 15 years | €849,147 | €849,147 | 849,147.3631 | 849,147.3631 | 0 | PASS |
| C23-R4 Random realistic (seed 1) | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R4 Random realistic (seed 1) | Cover needed today | €960,000 | €960,000 | 960000 | 960000 | 0 | PASS |
| C23-R4 Random realistic (seed 1) | Repaying a month (sentence) | €6,905 | €6,905 | 6,905.4583 | 6,905.4583 | 9.09e-13 | PASS |
| C23-R4 Random realistic (seed 1) | In 5 years | €815,708 | €815,708 | 815,707.5824 | 815,707.5824 | -1.16e-10 | PASS |
| C23-R4 Random realistic (seed 1) | In 10 years | €620,594 | €620,594 | 620,593.9889 | 620,593.9889 | 5.82e-10 | PASS |
| C23-R4 Random realistic (seed 1) | In 15 years | €356,760 | €356,760 | 356,759.5131 | 356,759.5131 | 0 | PASS |
| C23-R5 Branch case A | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R5 Branch case A | Cover needed today | €250,000 | €250,000 | 250000 | 250000 | 0 | PASS |
| C23-R5 Branch case A | Repaying a month (sentence) | €1,500 | €1,500 | 1500 | 1500 | 0 | PASS |
| C23-R5 Branch case A | In 5 years | €205,801 | €205,801 | 205,800.6812 | 205,800.6812 | 8.73e-11 | PASS |
| C23-R5 Branch case A | In 10 years | €151,833 | €151,833 | 151,833.4635 | 151,833.4635 | -4.66e-10 | PASS |
| C23-R5 Branch case A | In 15 years | €85,940 | €85,940 | 85,939.6745 | 85,939.6745 | 2.91e-11 | PASS |
| C23-R6 Branch case B | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R6 Branch case B | Cover needed today | €250,000 | €250,000 | 250000 | 250000 | 0 | PASS |
| C23-R6 Branch case B | Repaying a month (sentence) | €500 | €500 | 500 | 500 | 0 | PASS |
| C23-R6 Branch case B | In 5 years | €272,100 | €272,100 | 272,099.6594 | 272,099.6594 | 2.33e-10 | PASS |
| C23-R6 Branch case B | In 10 years | €299,083 | €299,083 | 299,083.2682 | 299,083.2682 | -1.16e-10 | PASS |
| C23-R6 Branch case B | In 15 years | €332,030 | €332,030 | 332,030.1627 | 332,030.1627 | -4.07e-10 | PASS |
| C23-R7 Branch case C | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R7 Branch case C | Cover needed today | €250,000 | €250,000 | 250000 | 250000 | 0 | PASS |
| C23-R7 Branch case C | Repaying a month (sentence) | €2,531 | €2,531 | 2,531.1285 | 2,531.1285 | 9.09e-13 | PASS |
| C23-R7 Branch case C | In 5 years | €137,438 | €137,438 | 137,437.9183 | 137,437.9183 | -1.75e-10 | PASS |
| C23-R7 Branch case C | In 10 years | €0 | €0 | 0 | 0 | 1.65e-24 | PASS |
| C23-R7 Branch case C | In 15 years | €0 | €0 | 0 | 0 | 0 | PASS |
| C23-R8 Random realistic (seed 2) | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R8 Random realistic (seed 2) | Cover needed today | €25,000 | €25,000 | 25000 | 25000 | 0 | PASS |
| C23-R8 Random realistic (seed 2) | Repaying a month (sentence) | €198 | €198 | 197.8629 | 197.8629 | 2.84e-13 | PASS |
| C23-R8 Random realistic (seed 2) | In 5 years | €20,116 | €20,116 | 20,115.5786 | 20,115.5786 | 4.73e-11 | PASS |
| C23-R8 Random realistic (seed 2) | In 10 years | €13,478 | €13,478 | 13,477.8783 | 13,477.8783 | -4.18e-11 | PASS |
| C23-R8 Random realistic (seed 2) | In 15 years | €4,458 | €4,458 | 4,457.5542 | 4,457.5542 | 3.64e-12 | PASS |
| C23-R9 Random realistic (seed 3) | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R9 Random realistic (seed 3) | Cover needed today | €450,000 | €450,000 | 450000 | 450000 | 0 | PASS |
| C23-R9 Random realistic (seed 3) | Repaying a month (sentence) | €4,938 | €4,938 | 4,938.0106 | 4,938.0106 | 3.64e-12 | PASS |
| C23-R9 Random realistic (seed 3) | In 5 years | €174,254 | €174,254 | 174,253.9827 | 174,253.9827 | -4.37e-10 | PASS |
| C23-R9 Random realistic (seed 3) | In 10 years | €0 | €0 | 0 | 0 | 0 | PASS |
| C23-R9 Random realistic (seed 3) | In 15 years | €0 | €0 | 0 | 0 | 0 | PASS |
| C23-R10 Random realistic (seed 4) | Headline label | Cover needed today | Cover needed today |  |  |  | PASS |
| C23-R10 Random realistic (seed 4) | Cover needed today | €375,000 | €375,000 | 375000 | 375000 | 0 | PASS |
| C23-R10 Random realistic (seed 4) | Repaying a month (sentence) | €2,345 | €2,345 | 2,345.1583 | 2,345.1583 | -2.73e-12 | PASS |
| C23-R10 Random realistic (seed 4) | In 5 years | €272,552 | €272,552 | 272,552.1976 | 272,552.1976 | -5.82e-11 | PASS |
| C23-R10 Random realistic (seed 4) | In 10 years | €157,344 | €157,344 | 157,344.2745 | 157,344.2745 | 1.46e-10 | PASS |
| C23-R10 Random realistic (seed 4) | In 15 years | €27,787 | €27,787 | 27,786.9271 | 27,786.9271 | 5.09e-11 | PASS |

### C24 Net worth (networth): 32/32 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C24-R1 Defaults | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R1 Defaults | Your net worth | €177,000 | €177,000 | 177000 | 177000 | 0 | PASS |
| C24-R1 Defaults | You own | €435,000 | €435,000 | 435000 | 435000 | 0 | PASS |
| C24-R1 Defaults | You owe | €258,000 | €258,000 | 258000 | 258000 | 0 | PASS |
| C24-R2 Low / edge | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R2 Low / edge | Your net worth | €0 | €0 | 0 | 0 | 0 | PASS |
| C24-R2 Low / edge | You own | €0 | €0 | 0 | 0 | 0 | PASS |
| C24-R2 Low / edge | You owe | €0 | €0 | 0 | 0 | 0 | PASS |
| C24-R3 High | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R3 High | Your net worth | €7,500,000 | €7,500,000 | 7500000 | 7500000 | 0 | PASS |
| C24-R3 High | You own | €11,000,000 | €11,000,000 | 11000000 | 11000000 | 0 | PASS |
| C24-R3 High | You owe | €3,500,000 | €3,500,000 | 3500000 | 3500000 | 0 | PASS |
| C24-R4 Random realistic (seed 1) | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R4 Random realistic (seed 1) | Your net worth | €5,216,000 | €5,216,000 | 5216000 | 5216000 | 0 | PASS |
| C24-R4 Random realistic (seed 1) | You own | €5,680,500 | €5,680,500 | 5680500 | 5680500 | 0 | PASS |
| C24-R4 Random realistic (seed 1) | You owe | €464,500 | €464,500 | 464500 | 464500 | 0 | PASS |
| C24-R5 Branch case A | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R5 Branch case A | Your net worth | −€223,000 | −€223,000 | -223000 | -223000 | 0 | PASS |
| C24-R5 Branch case A | You own | €85,000 | €85,000 | 85000 | 85000 | 0 | PASS |
| C24-R5 Branch case A | You owe | €308,000 | €308,000 | 308000 | 308000 | 0 | PASS |
| C24-R8 Random realistic (seed 2) | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R8 Random realistic (seed 2) | Your net worth | €4,184,500 | €4,184,500 | 4184500 | 4184500 | 0 | PASS |
| C24-R8 Random realistic (seed 2) | You own | €5,117,500 | €5,117,500 | 5117500 | 5117500 | 0 | PASS |
| C24-R8 Random realistic (seed 2) | You owe | €933,000 | €933,000 | 933000 | 933000 | 0 | PASS |
| C24-R9 Random realistic (seed 3) | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R9 Random realistic (seed 3) | Your net worth | €3,437,000 | €3,437,000 | 3437000 | 3437000 | 0 | PASS |
| C24-R9 Random realistic (seed 3) | You own | €6,109,500 | €6,109,500 | 6109500 | 6109500 | 0 | PASS |
| C24-R9 Random realistic (seed 3) | You owe | €2,672,500 | €2,672,500 | 2672500 | 2672500 | 0 | PASS |
| C24-R10 Random realistic (seed 4) | Headline label | Your net worth | Your net worth |  |  |  | PASS |
| C24-R10 Random realistic (seed 4) | Your net worth | €1,059,000 | €1,059,000 | 1059000 | 1059000 | 0 | PASS |
| C24-R10 Random realistic (seed 4) | You own | €3,001,000 | €3,001,000 | 3001000 | 3001000 | 0 | PASS |
| C24-R10 Random realistic (seed 4) | You owe | €1,942,000 | €1,942,000 | 1942000 | 1942000 | 0 | PASS |

### C25 Monthly surplus (surplus): 56/56 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C25-R1 Defaults | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R1 Defaults | Monthly surplus | €500 | €500 | 500 | 500 | 0 | PASS |
| C25-R1 Defaults | % of take-home free for goals (sentence) | 14% | 14% | 14 | 14 | 0 | PASS |
| C25-R1 Defaults | Take-home | €3,500 | €3,500 | 3500 | 3500 | 0 | PASS |
| C25-R1 Defaults | Going out | €3,000 | €3,000 | 3000 | 3000 | 0 | PASS |
| C25-R1 Defaults | "Add to my plan" goal amount (Save my surplus) | 6000 | 6000 | 6,000 | 6000 | 0 | PASS |
| C25-R1 Defaults | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C25-R2 Low / edge | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R2 Low / edge | Monthly surplus | −€2,500 | −€2,500 | -2500 | -2500 | 0 | PASS |
| C25-R2 Low / edge | % of take-home free for goals (sentence) |  |  |  |  |  | PASS |
| C25-R2 Low / edge | Take-home | €500 | €500 | 500 | 500 | 0 | PASS |
| C25-R2 Low / edge | Going out | €3,000 | €3,000 | 3000 | 3000 | 0 | PASS |
| C25-R2 Low / edge | "Add to my plan" goal amount (Save my surplus) |  |  |  |  |  | PASS |
| C25-R2 Low / edge | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C25-R3 High | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R3 High | Monthly surplus | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C25-R3 High | % of take-home free for goals (sentence) | 100% | 100% | 100 | 100 | 0 | PASS |
| C25-R3 High | Take-home | €20,000 | €20,000 | 20000 | 20000 | 0 | PASS |
| C25-R3 High | Going out | €0 | €0 | 0 | 0 | 0 | PASS |
| C25-R3 High | "Add to my plan" goal amount (Save my surplus) | 240000 | 240000 | 240,000 | 240000 | 0 | PASS |
| C25-R3 High | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C25-R4 Random realistic (seed 1) | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R4 Random realistic (seed 1) | Monthly surplus | −€10,950 | −€10,950 | -10950 | -10950 | 0 | PASS |
| C25-R4 Random realistic (seed 1) | % of take-home free for goals (sentence) |  |  |  |  |  | PASS |
| C25-R4 Random realistic (seed 1) | Take-home | €9,000 | €9,000 | 9000 | 9000 | 0 | PASS |
| C25-R4 Random realistic (seed 1) | Going out | €19,950 | €19,950 | 19950 | 19950 | 0 | PASS |
| C25-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Save my surplus) |  |  |  |  |  | PASS |
| C25-R4 Random realistic (seed 1) | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C25-R5 Branch case A | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R5 Branch case A | Monthly surplus | €0 | €0 | 0 | 0 | 0 | PASS |
| C25-R5 Branch case A | % of take-home free for goals (sentence) |  |  |  |  |  | PASS |
| C25-R5 Branch case A | Take-home | €3,000 | €3,000 | 3000 | 3000 | 0 | PASS |
| C25-R5 Branch case A | Going out | €3,000 | €3,000 | 3000 | 3000 | 0 | PASS |
| C25-R5 Branch case A | "Add to my plan" goal amount (Save my surplus) |  |  |  |  |  | PASS |
| C25-R5 Branch case A | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C25-R8 Random realistic (seed 2) | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R8 Random realistic (seed 2) | Monthly surplus | −€2,875 | −€2,875 | -2875 | -2875 | 0 | PASS |
| C25-R8 Random realistic (seed 2) | % of take-home free for goals (sentence) |  |  |  |  |  | PASS |
| C25-R8 Random realistic (seed 2) | Take-home | €18,550 | €18,550 | 18550 | 18550 | 0 | PASS |
| C25-R8 Random realistic (seed 2) | Going out | €21,425 | €21,425 | 21425 | 21425 | 0 | PASS |
| C25-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Save my surplus) |  |  |  |  |  | PASS |
| C25-R8 Random realistic (seed 2) | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C25-R9 Random realistic (seed 3) | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R9 Random realistic (seed 3) | Monthly surplus | €4,375 | €4,375 | 4375 | 4375 | 0 | PASS |
| C25-R9 Random realistic (seed 3) | % of take-home free for goals (sentence) | 36% | 36% | 36 | 36 | 0 | PASS |
| C25-R9 Random realistic (seed 3) | Take-home | €12,050 | €12,050 | 12050 | 12050 | 0 | PASS |
| C25-R9 Random realistic (seed 3) | Going out | €7,675 | €7,675 | 7675 | 7675 | 0 | PASS |
| C25-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Save my surplus) | 52500 | 52500 | 52,500 | 52500 | 0 | PASS |
| C25-R9 Random realistic (seed 3) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C25-R10 Random realistic (seed 4) | Headline label | Monthly surplus | Monthly surplus |  |  |  | PASS |
| C25-R10 Random realistic (seed 4) | Monthly surplus | €850 | €850 | 850 | 850 | 0 | PASS |
| C25-R10 Random realistic (seed 4) | % of take-home free for goals (sentence) | 7% | 7% | 7 | 7 | 0 | PASS |
| C25-R10 Random realistic (seed 4) | Take-home | €12,600 | €12,600 | 12600 | 12600 | 0 | PASS |
| C25-R10 Random realistic (seed 4) | Going out | €11,750 | €11,750 | 11750 | 11750 | 0 | PASS |
| C25-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Save my surplus) | 10200 | 10200 | 10,200 | 10200 | 0 | PASS |
| C25-R10 Random realistic (seed 4) | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |

### C26 Budget 50 30 20 (budget): 40/40 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C26-R1 Defaults | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R1 Defaults | Save each month | €700 | €700 | 700 | 700 | 0 | PASS |
| C26-R1 Defaults | Needs (50%) | €1,750 | €1,750 | 1750 | 1750 | 0 | PASS |
| C26-R1 Defaults | Wants (30%) | €1,050 | €1,050 | 1050 | 1050 | 0 | PASS |
| C26-R1 Defaults | Savings & debt (20%) | €700 | €700 | 700 | 700 | 0 | PASS |
| C26-R2 Low / edge | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R2 Low / edge | Save each month | €100 | €100 | 100 | 100 | 0 | PASS |
| C26-R2 Low / edge | Needs (50%) | €250 | €250 | 250 | 250 | 0 | PASS |
| C26-R2 Low / edge | Wants (30%) | €150 | €150 | 150 | 150 | 0 | PASS |
| C26-R2 Low / edge | Savings & debt (20%) | €100 | €100 | 100 | 100 | 0 | PASS |
| C26-R3 High | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R3 High | Save each month | €4,000 | €4,000 | 4000 | 4000 | 0 | PASS |
| C26-R3 High | Needs (50%) | €10,000 | €10,000 | 10000 | 10000 | 0 | PASS |
| C26-R3 High | Wants (30%) | €6,000 | €6,000 | 6000 | 6000 | 0 | PASS |
| C26-R3 High | Savings & debt (20%) | €4,000 | €4,000 | 4000 | 4000 | 0 | PASS |
| C26-R4 Random realistic (seed 1) | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R4 Random realistic (seed 1) | Save each month | €180 | €180 | 180 | 180 | 0 | PASS |
| C26-R4 Random realistic (seed 1) | Needs (50%) | €450 | €450 | 450 | 450 | 0 | PASS |
| C26-R4 Random realistic (seed 1) | Wants (30%) | €270 | €270 | 270 | 270 | 0 | PASS |
| C26-R4 Random realistic (seed 1) | Savings & debt (20%) | €180 | €180 | 180 | 180 | 0 | PASS |
| C26-R5 Branch case A | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R5 Branch case A | Save each month | €667 | €667 | 666.6 | 666.6 | 0 | PASS |
| C26-R5 Branch case A | Needs (50%) | €1,667 | €1,667 | 1,666.5 | 1,666.5 | 0 | PASS |
| C26-R5 Branch case A | Wants (30%) | €1,000 | €1,000 | 999.9 | 999.9 | 0 | PASS |
| C26-R5 Branch case A | Savings & debt (20%) | €667 | €667 | 666.6 | 666.6 | 0 | PASS |
| C26-R8 Random realistic (seed 2) | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R8 Random realistic (seed 2) | Save each month | €1,390 | €1,390 | 1390 | 1390 | 0 | PASS |
| C26-R8 Random realistic (seed 2) | Needs (50%) | €3,475 | €3,475 | 3475 | 3475 | 0 | PASS |
| C26-R8 Random realistic (seed 2) | Wants (30%) | €2,085 | €2,085 | 2085 | 2085 | 0 | PASS |
| C26-R8 Random realistic (seed 2) | Savings & debt (20%) | €1,390 | €1,390 | 1390 | 1390 | 0 | PASS |
| C26-R9 Random realistic (seed 3) | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R9 Random realistic (seed 3) | Save each month | €2,620 | €2,620 | 2620 | 2620 | 0 | PASS |
| C26-R9 Random realistic (seed 3) | Needs (50%) | €6,550 | €6,550 | 6550 | 6550 | 0 | PASS |
| C26-R9 Random realistic (seed 3) | Wants (30%) | €3,930 | €3,930 | 3930 | 3930 | 0 | PASS |
| C26-R9 Random realistic (seed 3) | Savings & debt (20%) | €2,620 | €2,620 | 2620 | 2620 | 0 | PASS |
| C26-R10 Random realistic (seed 4) | Headline label | Save each month | Save each month |  |  |  | PASS |
| C26-R10 Random realistic (seed 4) | Save each month | €3,090 | €3,090 | 3090 | 3090 | 0 | PASS |
| C26-R10 Random realistic (seed 4) | Needs (50%) | €7,725 | €7,725 | 7725 | 7725 | 0 | PASS |
| C26-R10 Random realistic (seed 4) | Wants (30%) | €4,635 | €4,635 | 4635 | 4635 | 0 | PASS |
| C26-R10 Random realistic (seed 4) | Savings & debt (20%) | €3,090 | €3,090 | 3090 | 3090 | 0 | PASS |

### C27 Debt repayment (debtpay): 60/60 PASS, 10 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C27-R1 Defaults | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R1 Defaults | Debt free in (months) | 2 yrs | 2 yrs | 24 | 24 | 0 | PASS |
| C27-R1 Defaults | You would pay about … in interest (sentence) | €989 | €989 | 989.1339 | 989.1339 | -2.27e-13 | PASS |
| C27-R1 Defaults | Total interest | €989 | €989 | 989.1339 | 989.1339 | -2.27e-13 | PASS |
| C27-R1 Defaults | "Add to my plan" goal amount (Debt free) | 5000 | 5000 | 5,000 | 5000 | 0 | PASS |
| C27-R1 Defaults | "Add to my plan" goal years | 2 | 2 | 2 | 2 | 0 | PASS |
| C27-R2 Low / edge | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R2 Low / edge | Debt free in (months) | Payment too low | Payment too low |  | Never |  | PASS |
| C27-R2 Low / edge | You would pay about … in interest (sentence) |  |  |  |  |  | PASS |
| C27-R2 Low / edge | Total interest | — | — |  |  |  | PASS |
| C27-R2 Low / edge | "Add to my plan" goal amount (Debt free) |  |  |  |  |  | PASS |
| C27-R2 Low / edge | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C27-R3 High | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R3 High | Debt free in (months) | 100 yrs | 100 yrs | 1200 | 1200 | 0 | PASS |
| C27-R3 High | You would pay about … in interest (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C27-R3 High | Total interest | €0 | €0 | 0 | 0 | 0 | PASS |
| C27-R3 High | "Add to my plan" goal amount (Debt free) | 100000 | 100000 | 100,000 | 100000 | 0 | PASS |
| C27-R3 High | "Add to my plan" goal years | 100 | 100 | 100 | 100 | 0 | PASS |
| C27-R4 Random realistic (seed 1) | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R4 Random realistic (seed 1) | Debt free in (months) | 1 yr 1 mo | 1 yr 1 mo | 13 | 13 | 0 | PASS |
| C27-R4 Random realistic (seed 1) | You would pay about … in interest (sentence) | €2,739 | €2,739 | 2,738.632 | 2,738.632 | -4.55e-13 | PASS |
| C27-R4 Random realistic (seed 1) | Total interest | €2,739 | €2,739 | 2,738.632 | 2,738.632 | -4.55e-13 | PASS |
| C27-R4 Random realistic (seed 1) | "Add to my plan" goal amount (Debt free) | 30100 | 30100 | 30,100 | 30100 | 0 | PASS |
| C27-R4 Random realistic (seed 1) | "Add to my plan" goal years | 2 | 2 | 2 | 2 | 0 | PASS |
| C27-R5 Branch case A | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R5 Branch case A | Debt free in (months) | 5 months | 5 months | 5 | 5 | 0 | PASS |
| C27-R5 Branch case A | You would pay about … in interest (sentence) | €196 | €196 | 196.0864 | 196.0864 | 0 | PASS |
| C27-R5 Branch case A | Total interest | €196 | €196 | 196.0864 | 196.0864 | 0 | PASS |
| C27-R5 Branch case A | "Add to my plan" goal amount (Debt free) | 5000 | 5000 | 5,000 | 5000 | 0 | PASS |
| C27-R5 Branch case A | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C27-R6 Branch case B | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R6 Branch case B | Debt free in (months) | 10 months | 10 months | 10 | 10 | 0 | PASS |
| C27-R6 Branch case B | You would pay about … in interest (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C27-R6 Branch case B | Total interest | €0 | €0 | 0 | 0 | 0 | PASS |
| C27-R6 Branch case B | "Add to my plan" goal amount (Debt free) | 100 | 100 | 100 | 100 | 0 | PASS |
| C27-R6 Branch case B | "Add to my plan" goal years | 1 | 1 | 1 | 1 | 0 | PASS |
| C27-R7 Branch case C | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R7 Branch case C | Debt free in (months) | Payment too low | Payment too low |  | Never |  | PASS |
| C27-R7 Branch case C | You would pay about … in interest (sentence) |  |  |  |  |  | PASS |
| C27-R7 Branch case C | Total interest | — | — |  |  |  | PASS |
| C27-R7 Branch case C | "Add to my plan" goal amount (Debt free) |  |  |  |  |  | PASS |
| C27-R7 Branch case C | "Add to my plan" goal years |  |  |  |  |  | PASS |
| C27-R8 Random realistic (seed 2) | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R8 Random realistic (seed 2) | Debt free in (months) | 3 yrs 4 mo | 3 yrs 4 mo | 40 | 40 | 0 | PASS |
| C27-R8 Random realistic (seed 2) | You would pay about … in interest (sentence) | €6,108 | €6,108 | 6,107.5871 | 6,107.5871 | -1.82e-12 | PASS |
| C27-R8 Random realistic (seed 2) | Total interest | €6,108 | €6,108 | 6,107.5871 | 6,107.5871 | -1.82e-12 | PASS |
| C27-R8 Random realistic (seed 2) | "Add to my plan" goal amount (Debt free) | 63300 | 63300 | 63,300 | 63300 | 0 | PASS |
| C27-R8 Random realistic (seed 2) | "Add to my plan" goal years | 4 | 4 | 4 | 4 | 0 | PASS |
| C27-R9 Random realistic (seed 3) | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R9 Random realistic (seed 3) | Debt free in (months) | 21 yrs 11 mo | 21 yrs 11 mo | 263 | 263 | 0 | PASS |
| C27-R9 Random realistic (seed 3) | You would pay about … in interest (sentence) | €23,711 | €23,711 | 23,711.0838 | 23,711.0838 | -3.64e-11 | PASS |
| C27-R9 Random realistic (seed 3) | Total interest | €23,711 | €23,711 | 23,711.0838 | 23,711.0838 | -3.64e-11 | PASS |
| C27-R9 Random realistic (seed 3) | "Add to my plan" goal amount (Debt free) | 47200 | 47200 | 47,200 | 47200 | 0 | PASS |
| C27-R9 Random realistic (seed 3) | "Add to my plan" goal years | 22 | 22 | 22 | 22 | 0 | PASS |
| C27-R10 Random realistic (seed 4) | Headline label | Debt free in | Debt free in |  |  |  | PASS |
| C27-R10 Random realistic (seed 4) | Debt free in (months) | Payment too low | Payment too low |  | Never |  | PASS |
| C27-R10 Random realistic (seed 4) | You would pay about … in interest (sentence) |  |  |  |  |  | PASS |
| C27-R10 Random realistic (seed 4) | Total interest | — | — |  |  |  | PASS |
| C27-R10 Random realistic (seed 4) | "Add to my plan" goal amount (Debt free) |  |  |  |  |  | PASS |
| C27-R10 Random realistic (seed 4) | "Add to my plan" goal years |  |  |  |  |  | PASS |

### C28 Loan repayment (loan): 32/32 PASS, 8 cases

| Case | Output | Expected shown | Excel shown | Expected value | Excel value | Difference | Result |
|---|---|---|---|---|---|---|---|
| C28-R1 Defaults | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R1 Defaults | Monthly repayment | €304 | €304 | 304.1459 | 304.1459 | 2.27e-13 | PASS |
| C28-R1 Defaults | Total interest (sentence) | €3,249 | €3,249 | 3,248.7549 | 3,248.7549 | 4.55e-12 | PASS |
| C28-R1 Defaults | Total repaid | €18,249 | €18,249 | 18,248.7549 | 18,248.7549 | 3.27e-11 | PASS |
| C28-R2 Low / edge | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R2 Low / edge | Monthly repayment | €42 | €42 | 41.6667 | 41.6667 | 3.55e-14 | PASS |
| C28-R2 Low / edge | Total interest (sentence) | €0 | €0 | 0 | 0 | 0 | PASS |
| C28-R2 Low / edge | Total repaid | €500 | €500 | 500 | 500 | 0 | PASS |
| C28-R3 High | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R3 High | Monthly repayment | €2,275 | €2,275 | 2,274.9295 | 2,274.9295 | -4.55e-12 | PASS |
| C28-R3 High | Total interest (sentence) | €172,992 | €172,992 | 172,991.5405 | 172,991.5405 | -1.75e-10 | PASS |
| C28-R3 High | Total repaid | €272,992 | €272,992 | 272,991.5405 | 272,991.5405 | -1.75e-10 | PASS |
| C28-R4 Random realistic (seed 1) | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R4 Random realistic (seed 1) | Monthly repayment | €2,300 | €2,300 | 2,300.2133 | 2,300.2133 | 9.09e-13 | PASS |
| C28-R4 Random realistic (seed 1) | Total interest (sentence) | €4,308 | €4,308 | 4,307.6773 | 4,307.6773 | 2.73e-12 | PASS |
| C28-R4 Random realistic (seed 1) | Total repaid | €82,808 | €82,808 | 82,807.6773 | 82,807.6773 | -1.46e-11 | PASS |
| C28-R6 Branch case B | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R6 Branch case B | Monthly repayment | €230 | €230 | 229.8675 | 229.8675 | 2.84e-14 | PASS |
| C28-R6 Branch case B | Total interest (sentence) | €775 | €775 | 775.2308 | 775.2308 | 3.41e-13 | PASS |
| C28-R6 Branch case B | Total repaid | €8,275 | €8,275 | 8,275.2308 | 8,275.2308 | 0 | PASS |
| C28-R8 Random realistic (seed 2) | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R8 Random realistic (seed 2) | Monthly repayment | €121 | €121 | 120.7009 | 120.7009 | -1.28e-13 | PASS |
| C28-R8 Random realistic (seed 2) | Total interest (sentence) | €1,984 | €1,984 | 1,984.1117 | 1,984.1117 | 4.09e-12 | PASS |
| C28-R8 Random realistic (seed 2) | Total repaid | €14,484 | €14,484 | 14,484.1117 | 14,484.1117 | 3.64e-12 | PASS |
| C28-R9 Random realistic (seed 3) | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R9 Random realistic (seed 3) | Monthly repayment | €1,944 | €1,944 | 1,944.2713 | 1,944.2713 | -1.36e-12 | PASS |
| C28-R9 Random realistic (seed 3) | Total interest (sentence) | €66,819 | €66,819 | 66,818.7886 | 66,818.7886 | 4.37e-11 | PASS |
| C28-R9 Random realistic (seed 3) | Total repaid | €163,319 | €163,319 | 163,318.7886 | 163,318.7886 | 4.37e-10 | PASS |
| C28-R10 Random realistic (seed 4) | Headline label | Monthly repayment | Monthly repayment |  |  |  | PASS |
| C28-R10 Random realistic (seed 4) | Monthly repayment | €1,425 | €1,425 | 1,425.4663 | 1,425.4663 | 0 | PASS |
| C28-R10 Random realistic (seed 4) | Total interest (sentence) | €6,817 | €6,817 | 6,816.7855 | 6,816.7855 | 1.82e-12 | PASS |
| C28-R10 Random realistic (seed 4) | Total repaid | €51,317 | €51,317 | 51,316.7855 | 51,316.7855 | 0 | PASS |
