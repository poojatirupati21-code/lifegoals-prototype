# LifeGoals calculators v2: verification report

Workbook: `deliverables/LifeGoals-Calculators.xlsx` (v2.0, 2 Oct 2026). It was redesigned as a tool and corrected per `deliverables/independent-accuracy-audit.md`.

## Summary

| Check | Result |
|---|---|
| Calculators | 28 (C01–C28, CALCS order) |
| 1. Independent reference: cases | 196 (7 per calculator: defaults, low/edge, high/edge, branch/edge, 2 random, 0% inflation) |
| 1. Independent reference: output checks | 1414: **1414 PASS, 0 FAIL** |
| 2. Live recalculation: inputs changed one at a time | 132 tests (all 127 inputs + Inflation and Growth set): **132 PASS, 0 FAIL** |
| 3. recalc.py | every round "success", 0 formula errors (926 formulas); delivered file recalculated, cached values present |
| Calculation settings | calcMode auto, fullCalcOnLoad = 1 (Excel recalculates on open) |
| Checker test | Changing Illness Benefit to €255, upkeep to 1.01% and C27 to APR/12 in a copy gave 26 FAILs (C07, C22, C27), so the checker detects small deviations |
| Editable cells | 127 yellow input cells; each has data validation (min/max, whole numbers or a list), an input message (unit and range) and a cell note with the default |

## Method

- **Reference:** `scratchpad/xlsx2/ref2.py`. It uses the audit's `ref.py` primitives (`annuity_pmt`, the lender-style `schedule`, `fv_ann`, `eff_monthly`, start-of-year `years_last`) and adds the audit fixes. Where the workbook uses a closed form (NPER, FV, the growing annuity, the outstanding balance), the reference uses month-by-month or year-by-year loops, so the two methods check each other. It does not read the workbook formulas or the prototype. The C21 gap is also checked against the audit's own reference formula.
- **Excel:** each round writes the inputs into a copy of the workbook (and Inflation / Growth set into Assumptions), recalculates it with `recalc.py` and reads the results with openpyxl `data_only=True`. Tolerance: money €0.50, rates 0.0001, counts (months, years) exact, texts (e.g. "Never at this repayment", "60+ years", hand-off kinds) exact.
- **Live test:** for each calculator, each input is changed in turn in a copy, and a named result must change in the expected direction. The baseline is recalculated in the same way. C21 "Mortgage balance" is tested with mortgage protection = No, because with Yes the balance correctly has no effect.

## Design choices to note

- **Total interest** = full payments + the last part payment − the amount, with the last payment = −FV(r, months − 1, −payment, amount) × (1 + r). This equals a lender's schedule exactly. The brief's shortcut "payment × NPER − balance" is not exact: on a test grid it was out by up to €7 on mortgages (1–8%) and €115 on debts (18–35%), because a fractional NPER does not equal the real last part payment, so it would fail the €0.50 tolerance.
- **Months** = ROUNDUP(ROUND(NPER(...), 6), 0). The ROUND stops floating-point noise from turning an exact 360-month repayment into 361.
- **No "inflation not chosen" state.** Every tool uses Assumptions › Inflation (default 2%). This follows the audit's like-for-like rule; the prototype's "pick a rate first" state needs a product decision.
- **Euro inputs** accept up to 10× the slider top, as the prototype's typed boxes do.
- Only C15 and C16 use a Working table (60 rows: withdrawals rising with inflation have no simple closed form for full years paid). Every other result is one named formula.

## Fixes applied

| Where | Audit class | Fix |
|---|---|---|
| C12 | Must | Gap is like-for-like: target (today's money) − fund ÷ (1 + inflation)^years. |
| C12 | Must | Hand-off updates the existing retirement goal (income, age) instead of a 25× lump-sum spend. |
| C02 | Must | Hand-off is the deposit (loan × 10% ÷ 90%), not the mortgage amount. |
| C04 | Must | Hand-off is a mortgage-free (mfree) goal, not today's balance as a spend; none if it never clears. |
| C04 | Must | No "Infinity yrs" and no negative interest saved: "Not at this repayment" / "—". |
| C04, C27 | Must | Exact months by NPER (no 1,200-month loop cap); over 1,200 months shows "Over 100 years" / "Payment too low…". |
| C09, C10 | Must | Hand-off always in today's money (value ÷ (1 + inflation)^years), kind pot. |
| C13, C14 | Must | No spend goal: raise the plan's pension contribution instead. |
| C18 | Must | Hand-off in today's money, kind pot (was nominal, inflated twice). |
| C20 | Must | Style is a 1/2/3 list (no decimals, no €NaN). |
| C21 | Must | No spend goal: a protection need for the adviser. |
| C27 | Must | No goal (the plan already repays the debt); no goal when it never clears. |
| C02, C05 | Should | What-if rate floored at 0%. |
| C07 | Should | Deposit validated between 10% of the price and the price; mortgage never negative. |
| C11, C22, C25 | Should | Hand-off kinds corrected (safety pot; protection need; savings pot). |
| C15, C16 | Should | Withdrawals taken at the start of each year. |
| C21 | Should | Mortgage protection Yes/No (default Yes) and State survivor's pension (default €259.50 a week). |
| C22 | Should | Illness Benefit (€254 a week) netted off; income protection capped at 75% of income less Illness Benefit. |
| C23 | Should | Warning when the repayment does not cover the interest; no rising balances shown. |
| C27, C28 | Should | APR treated as an effective annual rate: monthly = (1 + APR)^(1/12) − 1. |
| C08–C10, C17, C18 | Should | "Before tax: DIRT 33% / exit tax 38%" note. |
| C01 | Nice | First-time buyer is Yes/No. |
| C03, C15, C16 etc. | Nice | Singular forms ("1 month", "1 year"); "You have your deposit". |
| C04 | Nice | "No change" when the time saved is 0. |
| C06 | Nice | "Both terms are the same" for equal terms. |
| C08, C03 | Nice | Hand-off passes "already saved". |
| C13, C14 | Nice | Tax rate restricted to 20% or 40%. |
| C16 | Nice | "60+ years" in every row at the end of the table. |
| C25 | Nice | €0 surplus reads "Nothing left over this month". |
| Assumptions | Nice | Constants added for the fixes (DIRT, exit tax, Illness Benefit, survivor's pension); inflation reference refreshed (3.4% Aug 2026). |

## Not applied (for Pooja to decide)

| Where | Audit class | Item |
|---|---|---|
| C01 | Should | Stamp duty (1%) and fees paid from the deposit: price = MIN((income limit + deposit)/1.01, deposit/0.11). |
| C01 | Should | Remove the placeholder "[confirm current Central Bank rules]" from the customer line (prototype copy). |
| C01 | Nice | Mention Help to Buy and the CBI allowances / fresh-start rule. |
| C02 | Nice | Use "−" (not "-") in the rate text; note the what-if is an approximation with a stated repayment (prototype copy). |
| C03 | Should | Minimum deposit 10% (slider still allows 5%). |
| C03 | Should | Add 1% stamp duty and house prices rising while saving (37 months, not 29, at defaults). |
| C03 | Nice | Mention Help to Buy. |
| C07 | Should | Rent rising with inflation, purchase costs (stamp duty, fees) and the opportunity cost of the deposit and equity. |
| C07 | Nice | Allow a 35-year mortgage term (fixed at 30). |
| C08–C10, C18 | Should | An after-tax result row (DIRT 33% / exit tax 38% with deemed disposal). Only the "before tax" note is applied. |
| C10 | Nice | Hide "start in 5 years" when the term is 5 years or less. |
| C11 | Nice | Tip copy: "Often 3 to 6 months" instead of "Ideal: 6 months" (prototype copy). |
| C12 | Should | Fund the bridge years before State Pension age 66 in the target. |
| C12 | Should | Say whether desired income is before or after tax (or gross it up). |
| C12 | Should | Pension statement projection: record its basis (today's money) and do not deflate it again. The statement path is not modelled in this workbook. |
| C12 | Nice | Default "Other yearly income" €15,564 (State Pension 2026) instead of €15,000; Standard Fund Threshold warning; note the yearly convention. |
| C13 | Should | Contributions rising with pay (as C12): €70,503, not €54,572, at defaults. |
| C13, C14 | Nice | Note on age-related relief limits, €115,000 cap and the married band. |
| C15 | Nice | ARF imputed distribution hint (4% from 61, 5% from 71, 6% over €2m). |
| C20 | Should | Treat the growth rates as median (geometric) returns and explain the weaker outcome as about a 1-in-6 chance (a short note is in "How it works"). |
| C20 | Nice | Difficult-year wording: "about 1 year in 20 could be this bad or worse". |
| C21 | Nice | Discount the income need; mention funeral costs and CAT. |
| C22 | Nice | Explain statutory sick pay (5 days) vs the employer's scheme (a short note is in "How it works"). |
| C23 | Nice | Note joint-life / dual-life cover and the insurer's assumed reduction rate. |
| C24 | Nice | Note pensions before tax and property before selling costs (a short note is in "How it works"). |
| C25, C26 | Nice | Round the take-home pre-fill to whole euros (prototype). |
| Assumptions | Should | Cautious pay rises (3.0%) are higher than Standard (2.5%): set Cautious ≤ Standard. |
| Assumptions | Should | Standard investment growth "after charges and tax" 4.5% looks optimistic (plan only; not on this sheet). |
| Assumptions | Nice | Retirement lump-sum tax bands; Standard Fund Threshold; ARF imputed rates; stamp duty; State Pension age (not used by these calculators). |
| Copy | Nice | Fix the "29 calculators" note (there are 28). |

## Prototype must be updated to match

The workbook now differs from the prototype in these places, on purpose. Align the prototype next.

- **C01 How much could I borrow?:** First-time buyer as a Yes/No switch (no 0.5). Hand-off also passes "already saved" = the deposit. Remove "[confirm current Central Bank rules]" from the line.
- **C02 Monthly mortgage repayment:** Hand-off: the deposit for the loan (loan × 10% ÷ 90%), not the mortgage amount. What-if rate floored at 0%. Over 1,200 months: show "Over 100 years" (exact months, no loop cap).
- **C03 Deposit calculator:** Copy: "You have your deposit"; singular "1 month". Hand-off passes "already saved".
- **C04 Mortgage overpayment:** Never clears: "Not at this repayment" and "—" (no "Infinity yrs", no negative interest saved). No 1,200-month cap; "Over 100 years". "No change" for 0 months. Hand-off: mfree goal (or none when it never clears), not the balance as a spend.
- **C05 Interest-rate impact:** New rate floored at 0%; use "−" for negative changes.
- **C06 Mortgage term comparison:** Equal terms: "Both terms are the same."
- **C07 Rent vs buy:** Validate deposit between 10% of the price and the price; never a negative loan.
- **C08 Goal planner:** Inflation is always applied (the workbook has no "not chosen" state; it uses the Assumptions rate, 2% by default). Hand-off passes "already saved". "Before tax" note.
- **C09 Compound growth:** Hand-off always in today's money (value ÷ (1 + inflation)^years), kind pot. Today's-money figure always shown. "Before tax" note.
- **C10 Lump-sum growth:** Hand-off always in today's money, kind pot. "Before tax" note.
- **C11 Emergency fund:** Hand-off kind safety (a reserve), passing "already saved".
- **C12 Retirement projection:** Gap like-for-like: target − fund ÷ (1 + inflation)^years. Headline is the gap in today's money (defaults: €304,525, prototype €99,227). Hand-off updates the retirement goal (income, age) instead of a 25× spend. Pension-statement projection path is not modelled in the workbook (see Not applied).
- **C13 Contribution impact:** No spend goal; raise the plan's pension contribution by the extra a month. Tax rate 20% or 40% only.
- **C14 AVC impact:** No spend goal; raise the plan's pension contribution by the AVC. Tax rate 20% or 40% only.
- **C15 Will my money last?:** Withdrawals at the start of the year (defaults 18 years either way; no-inflation defaults 22, not 23). Withdrawals always rise with inflation (no flat "not chosen" case). Singular "1 year".
- **C16 Retirement drawdown scenarios:** Withdrawals at the start of the year (defaults Balanced 25 not 26, Growth 36 not 41). "60+ years" in every row.
- **C17 Inflation-adjusted return:** Today's money and real return always shown (no "not chosen" case). "Before tax" note.
- **C18 Regular investing:** Hand-off in today's money, kind pot (defaults €54,321, prototype €73,109 nominal). "Before tax" note.
- **C19 Fees impact:** None.
- **C20 Risk & return simulator:** Style limited to 1, 2 or 3 (chips); no €NaN.
- **C21 Life cover estimator:** New input: mortgage cleared by mortgage protection? (default Yes). New input: State survivor's pension a week (default €259.50). Defaults: gap €227,590 (prototype €680,000). No spend goal; record a protection need.
- **C22 Income protection gap:** Nets off Illness Benefit (€254 a week): defaults 8.7 months (prototype 6.2). New input: gross yearly income, for the 75% cap on income protection. New result: income protection to aim for a month. No spend goal; record an income protection need.
- **C23 Mortgage protection:** Warning and no future balances when the repayment does not cover the interest.
- **C24 Net worth:** None.
- **C25 Monthly surplus:** €0 reads "Nothing left over this month". Hand-off kind pot.
- **C26 Budget (50/30/20):** None.
- **C27 Debt repayment:** APR as an effective annual rate: monthly = (1 + APR)^(1/12) − 1 (defaults interest €899, prototype €989). Never clears: "Never at this repayment"; over 1,200 months: "Payment too low to clear this debt in a reasonable time"; no 100-year cap. No goal.
- **C28 Loan repayment:** APR as an effective annual rate (defaults €302.15 a month, prototype €304.15).

## Live recalculation test

| Calculator | Input changed | New value | Result watched | Expected | Before | After | Results that changed | Result |
|---|---|---|---|---|---|---|---|---|
| C01 | Income | 80000 | Borrow_By_Income | up | 240000 | 320000 | 1 | PASS |
| C02 | Loan_Amount | 350000 | Monthly_Repayment | up | 1,432.2459 | 1,670.9535 | 6 | PASS |
| C03 | Home_Price | 400000 | Months_To_Deposit | up | 29 | 35 | 3 | PASS |
| C04 | Mortgage_Balance | 300000 | Interest_Now | up | 145,877.6302 | 175,053.1563 | 9 | PASS |
| C05 | Mortgage_Balance | 350000 | Monthly_Change | up | 170.2596 | 198.6362 | 5 | PASS |
| C06 | Loan_Amount | 350000 | Interest_Difference | up | 82,843.0174 | 96,650.187 | 5 | PASS |
| C07 | Monthly_Rent | 2000 | Rent_Paid | up | 216000 | 240000 | 1 | PASS |
| C08 | Goal_Amount | 20000 | Monthly_Saving | up | 372.2508 | 515.4242 | 3 | PASS |
| C09 | Starting_Amount | 10000 | Grows_To | up | 83,723.9615 | 94,679.5773 | 4 | PASS |
| C10 | Amount | 20000 | Headline | up | 18,009.4351 | 36,018.8701 | 5 | PASS |
| C11 | Essential_Spending | 3000 | Months_Covered | down | 2.5 | 2.0833 | 3 | PASS |
| C12 | Age | 45 | Projected_Fund | down | 525,773.1749 | 376,632.1169 | 5 | PASS |
| C13 | Salary | 80000 | Grows_To | up | 54,572.4754 | 72,763.3006 | 4 | PASS |
| C14 | AVC_Per_Month | 300 | Grows_To | up | 50,902.3648 | 76,353.5472 | 5 | PASS |
| C15 | Retirement_Savings | 500000 | Years_Lasting | up | 18 | 23 | 2 | PASS |
| C16 | Retirement_Savings | 500000 | Years_Balanced | up | 25 | 33 | 3 | PASS |
| C17 | Amount | 30000 | Value_Today | up | 30,893.4852 | 46,340.2278 | 2 | PASS |
| C18 | Monthly_Amount | 400 | Headline | up | 73,108.7854 | 97,478.3806 | 6 | PASS |
| C19 | Amount_Invested | 60000 | Difference | up | 21,952.5954 | 26,343.1145 | 3 | PASS |
| C20 | Amount | 30000 | Middle | up | 29,604.8857 | 44,407.3285 | 3 | PASS |
| C21 | Yearly_Income | 80000 | Cover_Gap | up | 227590 | 407590 | 3 | PASS |
| C22 | Essential_Spending | 3000 | Months_Coping | down | 8.717 | 7.212 | 4 | PASS |
| C23 | Mortgage_Balance | 300000 | Cover_Today | up | 250000 | 300000 | 5 | PASS |
| C24 | Savings | 20000 | Net_Worth | up | 177000 | 182000 | 2 | PASS |
| C25 | Take_Home | 4000 | Surplus | up | 500 | 1000 | 1 | PASS |
| C26 | Take_Home | 4000 | Save | up | 700 | 800 | 3 | PASS |
| C27 | Balance | 6000 | Months_To_Clear | up | 24 | 30 | 3 | PASS |
| C28 | Loan_Amount | 20000 | Monthly_Repayment | up | 302.1458 | 402.8611 | 3 | PASS |
| C01 | Partner_Income | 20000 | Borrow_By_Income | up | 240000 | 320000 | 1 | PASS |
| C02 | Interest_Rate | 0.05 | Monthly_Repayment | up | 1,432.2459 | 1,610.4649 | 8 | PASS |
| C03 | Deposit_Pct | 0.2 | Months_To_Deposit | up | 29 | 73 | 3 | PASS |
| C04 | Interest_Rate | 0.05 | Interest_Now | up | 145,877.6302 | 188,442.5311 | 10 | PASS |
| C05 | Current_Rate | 0.05 | Repayment_Now | up | 1,583.5105 | 1,753.7701 | 6 | PASS |
| C06 | Interest_Rate | 0.05 | Interest_Difference | up | 82,843.0174 | 109,775.4322 | 5 | PASS |
| C07 | Home_Price | 400000 | Buying_Costs | up | 148,632.4532 | 171,669.3505 | 8 | PASS |
| C08 | Years | 5 | Monthly_Saving | down | 372.2508 | 227.7579 | 4 | PASS |
| C09 | Monthly_Addition | 300 | Grows_To | up | 83,723.9615 | 120,108.1345 | 4 | PASS |
| C10 | Growth_Rate | 0.06 | Headline | up | 18,009.4351 | 23,965.5819 | 7 | PASS |
| C11 | Months_Wanted | 9 | Target | up | 15000 | 22500 | 2 | PASS |
| C12 | Retirement_Age | 67 | Projected_Fund | up | 525,773.1749 | 597,183.437 | 5 | PASS |
| C13 | Increase_Pct | 0.03 | Grows_To | up | 54,572.4754 | 81,858.7131 | 4 | PASS |
| C14 | Years | 20 | Grows_To | up | 50,902.3648 | 76,831.9589 | 4 | PASS |
| C15 | Yearly_Withdrawal | 30000 | Years_Lasting | down | 18 | 14 | 2 | PASS |
| C16 | Yearly_Withdrawal | 25000 | Years_Balanced | down | 25 | 18 | 3 | PASS |
| C17 | Nominal_Return | 0.07 | Value_Today | up | 30,893.4852 | 41,000.0215 | 3 | PASS |
| C18 | Years | 20 | Headline | up | 73,108.7854 | 108,563.8809 | 6 | PASS |
| C19 | Years | 25 | Difference | up | 21,952.5954 | 33,335.4041 | 3 | PASS |
| C20 | Years | 15 | Middle | up | 29,604.8857 | 36,018.8701 | 4 | PASS |
| C21 | Years_Support | 20 | Cover_Gap | up | 227590 | 340120 | 3 | PASS |
| C22 | Sick_Pay_Months | 6 | Months_Coping | up | 8.717 | 11.717 | 1 | PASS |
| C23 | Interest_Rate | 0.05 | Balance_Year_1 | up | 217,761.5406 | 221,450.4726 | 5 | PASS |
| C24 | Investments | 20000 | Net_Worth | up | 177000 | 187000 | 2 | PASS |
| C25 | Essentials | 2200 | Surplus | down | 500 | 300 | 2 | PASS |
| C27 | APR | 0.22 | Total_Interest | up | 898.5668 | 1,136.7932 | 4 | PASS |
| C28 | APR | 0.1 | Monthly_Repayment | up | 302.1458 | 315.5337 | 4 | PASS |
| C01 | Deposit | 30000 | Home_Price | up | 250000 | 270000 | 6 | PASS |
| C02 | Term_Years | 25 | Monthly_Repayment | up | 1,432.2459 | 1,583.5105 | 7 | PASS |
| C03 | Saved | 20000 | Months_To_Deposit | down | 29 | 19 | 2 | PASS |
| C04 | Years_Left | 30 | Interest_Now | up | 145,877.6302 | 179,673.7659 | 10 | PASS |
| C05 | Years_Left | 20 | Repayment_Now | up | 1,583.5105 | 1,817.941 | 5 | PASS |
| C06 | Term_A | 20 | Monthly_A | up | 1,583.5105 | 1,817.941 | 3 | PASS |
| C07 | Deposit | 50000 | Buying_Costs | down | 148,632.4532 | 143,221.384 | 6 | PASS |
| C08 | Saved | 5000 | Monthly_Saving | down | 372.2508 | 286.3468 | 3 | PASS |
| C09 | Growth_Rate | 0.06 | Grows_To | up | 83,723.9615 | 106,723.4039 | 4 | PASS |
| C10 | Years | 20 | Headline | up | 18,009.4351 | 21,911.2314 | 5 | PASS |
| C11 | Savings | 8000 | Months_Covered | up | 2.5 | 3.2 | 2 | PASS |
| C12 | Pension_Today | 100000 | Projected_Fund | up | 525,773.1749 | 645,990.5531 | 3 | PASS |
| C13 | Years | 30 | Grows_To | up | 54,572.4754 | 74,706.4088 | 2 | PASS |
| C14 | Growth_Rate | 0.05 | Grows_To | up | 50,902.3648 | 52,964.9189 | 2 | PASS |
| C15 | Growth_Rate | 0.05 | Years_Lasting | up | 18 | 22 | 1 | PASS |
| C17 | Years | 20 | Value_Today | up | 30,893.4852 | 35,711.8659 | 2 | PASS |
| C18 | Growth_Rate | 0.06 | Headline | up | 73,108.7854 | 79,068.6514 | 7 | PASS |
| C19 | Growth_Rate | 0.06 | Difference | up | 21,952.5954 | 26,534.8843 | 3 | PASS |
| C20 | Style | 3 | Middle | up | 29,604.8857 | 35,816.9539 | 8 | PASS |
| C21 | Mortgage_Balance | 300000 | Cover_Gap | up | 477590 | 527590 | 2 | PASS |
| C22 | Savings | 12000 | Months_Coping | up | 8.717 | 11.5755 | 2 | PASS |
| C23 | Years_Left | 30 | Balance_Year_1 | up | 217,761.5406 | 226,118.7828 | 4 | PASS |
| C24 | Pensions | 70000 | Net_Worth | up | 177000 | 187000 | 2 | PASS |
| C25 | Lifestyle | 900 | Surplus | down | 500 | 400 | 2 | PASS |
| C27 | Monthly_Payment | 300 | Months_To_Clear | down | 24 | 20 | 4 | PASS |
| C28 | Years | 7 | Monthly_Repayment | down | 302.1458 | 231.7124 | 3 | PASS |
| C01 | First_Time_Buyer | No | Borrow_By_Income | down | 240000 | 210000 | 6 | PASS |
| C02 | Actual_Repayment | 1600 | Months_To_Pay | down | 360 | 295 | 6 | PASS |
| C03 | Monthly_Saving | 1000 | Months_To_Deposit | down | 29 | 23 | 1 | PASS |
| C04 | Extra_Payment | 400 | Interest_Saved | up | 32,877.2219 | 53,366.6858 | 6 | PASS |
| C05 | Rate_Change | 0.02 | Monthly_Change | up | 170.2596 | 349.3937 | 4 | PASS |
| C06 | Term_B | 30 | Monthly_B | up | 1,328.3242 | 1,432.2459 | 3 | PASS |
| C07 | Mortgage_Rate | 0.05 | Buying_Costs | up | 148,632.4532 | 179,146.0766 | 5 | PASS |
| C08 | Growth_Rate | 0.04 | Monthly_Saving | down | 372.2508 | 358.364 | 4 | PASS |
| C09 | Years | 25 | Grows_To | up | 83,723.9615 | 115,098.8055 | 4 | PASS |
| C10 | Yearly_Fees | 0.01 | Headline | down | 18,009.4351 | 15,489.1651 | 8 | PASS |
| C12 | Monthly_Contribution | 800 | Projected_Fund | up | 525,773.1749 | 733,041.4393 | 5 | PASS |
| C13 | Growth_Rate | 0.05 | Grows_To | up | 54,572.4754 | 58,573.4521 | 2 | PASS |
| C14 | Tax_Rate | 0.2 | Net_Cost | up | 21600 | 28800 | 2 | PASS |
| C18 | Yearly_Fees | 0.02 | Headline | down | 73,108.7854 | 67,346.3385 | 6 | PASS |
| C19 | Fee_A | 0.01 | Difference | down | 21,952.5954 | 10,450.0799 | 3 | PASS |
| C21 | Mortgage_Protected | No | Cover_Gap | up | 227590 | 477590 | 2 | PASS |
| C22 | Gross_Income | 20000 | IP_Needed | down | 1,399.3333 | 149.3333 | 2 | PASS |
| C23 | Actual_Repayment | 2000 | Balance_Year_1 | down | 217,761.5406 | 172,651.1921 | 4 | PASS |
| C24 | Property | 400000 | Net_Worth | up | 177000 | 227000 | 2 | PASS |
| C25 | Debt_Repayments | 300 | Surplus | down | 500 | 400 | 2 | PASS |
| C27 | Extra_Payment | 50 | Months_To_Clear | down | 24 | 20 | 4 | PASS |
| C01 | Interest_Rate | 0.05 | Monthly_Repayment | up | 1,074.1844 | 1,207.8487 | 1 | PASS |
| C02 | Rate_Change | 0.01 | Repayment_If_Changed | up | 1,432.2459 | 1,610.4649 | 3 | PASS |
| C03 | Extra_Saving | 200 | Months_To_Deposit | down | 29 | 23 | 1 | PASS |
| C04 | Actual_Repayment | 1500 | Months_Now | down | 300 | 244 | 10 | PASS |
| C05 | Actual_Repayment | 1700 | Repayment_After | up | 1,753.7701 | 1,870.2596 | 2 | PASS |
| C07 | Years | 15 | Rent_Paid | up | 216000 | 324000 | 7 | PASS |
| C10 | Adjust_For_Inflation | Yes | Headline | down | 18,009.4351 | 13,381.2755 | 2 | PASS |
| C12 | Desired_Income | 50000 | Gap_Today | up | 304,525.019 | 554,525.019 | 2 | PASS |
| C13 | Tax_Rate | 0.2 | Net_Cost_Per_Month | up | 60 | 80 | 1 | PASS |
| C18 | Adjust_For_Inflation | Yes | Headline | down | 73,108.7854 | 54,320.9045 | 1 | PASS |
| C19 | Fee_B | 0.02 | Difference | up | 21,952.5954 | 31,441.9106 | 3 | PASS |
| C21 | Other_Debts | 20000 | Cover_Gap | up | 227590 | 237590 | 2 | PASS |
| C24 | Mortgage | 260000 | Net_Worth | down | 177000 | 167000 | 2 | PASS |
| C01 | Term_Years | 25 | Monthly_Repayment | up | 1,074.1844 | 1,187.6329 | 1 | PASS |
| C07 | House_Growth | 0.04 | Home_Equity | up | 178,478.5755 | 269,916.0282 | 2 | PASS |
| C12 | Other_Income | 20000 | Gap_Today | down | 304,525.019 | 179,525.019 | 2 | PASS |
| C21 | Savings | 30000 | Cover_Gap | down | 227590 | 217590 | 2 | PASS |
| C24 | Other_Loans | 10000 | Net_Worth | down | 177000 | 175000 | 2 | PASS |
| C01 | Extra_Deposit | 5000 | Home_Price | up | 250000 | 270000 | 6 | PASS |
| C12 | Growth_Rate | 0.05 | Projected_Fund | up | 525,773.1749 | 570,959.8987 | 4 | PASS |
| C21 | Existing_Cover | 150000 | Cover_Gap | down | 227590 | 177590 | 2 | PASS |
| C12 | Retire_Later | 2 | Projected_Fund | up | 525,773.1749 | 597,183.437 | 5 | PASS |
| C21 | Survivor_Pension | 0 | Cover_Gap | up | 227590 | 430000 | 2 | PASS |
| C12 | Save_More | 200 | Projected_Fund | up | 525,773.1749 | 663,952.0178 | 5 | PASS |
| C12 | Spend_Less | 5000 | Gap_Today | down | 304,525.019 | 179,525.019 | 2 | PASS |
| Assumptions | Inflation | 0.035 | C08 Monthly_Saving | up | 372.2508 | 391.4802 |  | PASS |
| Assumptions | Inflation | 0.035 | C09 Value_Today | down | 56,343.826 | 42,076.8068 |  | PASS |
| Assumptions | Inflation | 0.035 | C12 Gap_Today | up | 304,525.019 | 402,520.664 |  | PASS |
| Assumptions | Inflation | 0.035 | C15 Years_Lasting | down | 18 | 16 |  | PASS |
| Assumptions | Growth_Set | Cautious | C12 Projected_Fund | up | 525,773.1749 | 544,988.6781 |  | PASS |

## Reference comparison by calculator

### C01 Borrowing: 77/77 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C01-R1 Defaults | Income_Multiple | 4 | 4 | 0 | PASS |
| C01-R1 Defaults | Total_Deposit | 25000 | 25000 | 0 | PASS |
| C01-R1 Defaults | Borrow_By_Income | 240000 | 240000 | 0 | PASS |
| C01-R1 Defaults | Borrow_By_Deposit | 225,000 | 225000 | -5.82e-11 | PASS |
| C01-R1 Defaults | Max_Loan | 225,000 | 225000 | -5.82e-11 | PASS |
| C01-R1 Defaults | Home_Price | 250,000 | 250000 | -5.82e-11 | PASS |
| C01-R1 Defaults | Monthly_Repayment | 1,074.1844 | 1,074.1844 | 8.64e-12 | PASS |
| C01-R1 Defaults | Limit_Set_By | Your deposit | Your deposit |  | PASS |
| C01-R1 Defaults | Plan_Goal_Amount | 25,000 | 25000 | 0 | PASS |
| C01-R1 Defaults | Plan_Goal_Saved | 25000 | 25000 | 0 | PASS |
| C01-R1 Defaults | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C01-R2 Low / edge | Income_Multiple | 3.5 | 3.5 | 0 | PASS |
| C01-R2 Low / edge | Total_Deposit | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Borrow_By_Income | 52,500 | 52500 | 0 | PASS |
| C01-R2 Low / edge | Borrow_By_Deposit | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Max_Loan | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Home_Price | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Monthly_Repayment | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Limit_Set_By | Your deposit | Your deposit |  | PASS |
| C01-R2 Low / edge | Plan_Goal_Amount | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Plan_Goal_Saved | 0 | 0 | 0 | PASS |
| C01-R2 Low / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C01-R3 High / edge | Income_Multiple | 4 | 4 | 0 | PASS |
| C01-R3 High / edge | Total_Deposit | 250000 | 250000 | 0 | PASS |
| C01-R3 High / edge | Borrow_By_Income | 2000000 | 2000000 | 0 | PASS |
| C01-R3 High / edge | Borrow_By_Deposit | 2,250,000 | 2250000 | -4.66e-10 | PASS |
| C01-R3 High / edge | Max_Loan | 2000000 | 2000000 | 0 | PASS |
| C01-R3 High / edge | Home_Price | 2250000 | 2250000 | 0 | PASS |
| C01-R3 High / edge | Monthly_Repayment | 14,205.2176 | 14,205.2176 | -3.46e-11 | PASS |
| C01-R3 High / edge | Limit_Set_By | Your income | Your income |  | PASS |
| C01-R3 High / edge | Plan_Goal_Amount | 225,000 | 225000 | 0 | PASS |
| C01-R3 High / edge | Plan_Goal_Saved | 250000 | 250000 | 0 | PASS |
| C01-R3 High / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C01-R4 Branch / edge | Income_Multiple | 4 | 4 | 0 | PASS |
| C01-R4 Branch / edge | Total_Deposit | 20000 | 20000 | 0 | PASS |
| C01-R4 Branch / edge | Borrow_By_Income | 180000 | 180000 | 0 | PASS |
| C01-R4 Branch / edge | Borrow_By_Deposit | 180,000 | 180000 | -2.91e-11 | PASS |
| C01-R4 Branch / edge | Max_Loan | 180000 | 180000 | 0 | PASS |
| C01-R4 Branch / edge | Home_Price | 200000 | 200000 | 0 | PASS |
| C01-R4 Branch / edge | Monthly_Repayment | 859.3475 | 859.3475 | 1.02e-11 | PASS |
| C01-R4 Branch / edge | Limit_Set_By | Your income | Your income |  | PASS |
| C01-R4 Branch / edge | Plan_Goal_Amount | 20,000 | 20000 | 0 | PASS |
| C01-R4 Branch / edge | Plan_Goal_Saved | 20000 | 20000 | 0 | PASS |
| C01-R4 Branch / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C01-R5 Random (seed 1) | Income_Multiple | 4 | 4 | 0 | PASS |
| C01-R5 Random (seed 1) | Total_Deposit | 203000 | 203000 | 0 | PASS |
| C01-R5 Random (seed 1) | Borrow_By_Income | 280000 | 280000 | 0 | PASS |
| C01-R5 Random (seed 1) | Borrow_By_Deposit | 1,827,000 | 1827000 | -4.66e-10 | PASS |
| C01-R5 Random (seed 1) | Max_Loan | 280000 | 280000 | 0 | PASS |
| C01-R5 Random (seed 1) | Home_Price | 483000 | 483000 | 0 | PASS |
| C01-R5 Random (seed 1) | Monthly_Repayment | 1,161.4862 | 1,161.4862 | 6.37e-12 | PASS |
| C01-R5 Random (seed 1) | Limit_Set_By | Your income | Your income |  | PASS |
| C01-R5 Random (seed 1) | Plan_Goal_Amount | 48,300 | 48300 | 0 | PASS |
| C01-R5 Random (seed 1) | Plan_Goal_Saved | 203000 | 203000 | 0 | PASS |
| C01-R5 Random (seed 1) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C01-R6 Random (seed 2) | Income_Multiple | 4 | 4 | 0 | PASS |
| C01-R6 Random (seed 2) | Total_Deposit | 28000 | 28000 | 0 | PASS |
| C01-R6 Random (seed 2) | Borrow_By_Income | 160000 | 160000 | 0 | PASS |
| C01-R6 Random (seed 2) | Borrow_By_Deposit | 252,000 | 252000 | -5.82e-11 | PASS |
| C01-R6 Random (seed 2) | Max_Loan | 160000 | 160000 | 0 | PASS |
| C01-R6 Random (seed 2) | Home_Price | 188000 | 188000 | 0 | PASS |
| C01-R6 Random (seed 2) | Monthly_Repayment | 1,399.3269 | 1,399.3269 | -9.09e-13 | PASS |
| C01-R6 Random (seed 2) | Limit_Set_By | Your income | Your income |  | PASS |
| C01-R6 Random (seed 2) | Plan_Goal_Amount | 18,800 | 18800 | 0 | PASS |
| C01-R6 Random (seed 2) | Plan_Goal_Saved | 28000 | 28000 | 0 | PASS |
| C01-R6 Random (seed 2) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Income_Multiple | 4 | 4 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Total_Deposit | 1500000 | 1500000 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Borrow_By_Income | 8000000 | 8000000 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Borrow_By_Deposit | 13,500,000 | 13500000 | -3.73e-09 | PASS |
| C01-R7 Edge, 0% inflation | Max_Loan | 8000000 | 8000000 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Home_Price | 9500000 | 9500000 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Monthly_Repayment | 38,193.2236 | 38,193.2236 | 4.95e-10 | PASS |
| C01-R7 Edge, 0% inflation | Limit_Set_By | Your income | Your income |  | PASS |
| C01-R7 Edge, 0% inflation | Plan_Goal_Amount | 950,000 | 950000 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Plan_Goal_Saved | 1500000 | 1500000 | 0 | PASS |
| C01-R7 Edge, 0% inflation | Plan_Goal_Years | 3 | 3 | 0 | PASS |

### C02 Mortgage repayment: 91/91 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C02-R1 Defaults | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C02-R1 Defaults | Formula_Repayment | 1,432.2459 | 1,432.2459 | 1.84e-11 | PASS |
| C02-R1 Defaults | Monthly_Repayment | 1,432.2459 | 1,432.2459 | 1.84e-11 | PASS |
| C02-R1 Defaults | Months_To_Pay | 360 | 360 | 0 | PASS |
| C02-R1 Defaults | Total_Interest | 215,608.5191 | 215,608.5191 | -1.53e-08 | PASS |
| C02-R1 Defaults | Final_Payment | 1,432.2459 | 1,432.2459 | -2.19e-08 | PASS |
| C02-R1 Defaults | Total_Repaid | 515,608.5191 | 515,608.5191 | -1.53e-08 | PASS |
| C02-R1 Defaults | New_Rate | 0.04 | 0.04 | 0 | PASS |
| C02-R1 Defaults | Repayment_If_Changed | 1,432.2459 | 1,432.2459 | 1.84e-11 | PASS |
| C02-R1 Defaults | Change_Per_Year | 0 | 0 | 0 | PASS |
| C02-R1 Defaults | Plan_Goal_Amount | 33,333 | 33333 | 0 | PASS |
| C02-R1 Defaults | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R1 Defaults | [shown] Months_To_Pay | 30 years | 30 years |  | PASS |
| C02-R2 Low / edge | Monthly_Rate | 0.0008 | 0.0008 | -4.34e-19 | PASS |
| C02-R2 Low / edge | Formula_Repayment | 854.6874 | 854.6874 | -9.11e-11 | PASS |
| C02-R2 Low / edge | Monthly_Repayment | 854.6874 | 854.6874 | -9.11e-11 | PASS |
| C02-R2 Low / edge | Months_To_Pay | 60 | 60 | 0 | PASS |
| C02-R2 Low / edge | Total_Interest | 1,281.2423 | 1,281.2423 | 5.68e-09 | PASS |
| C02-R2 Low / edge | Final_Payment | 854.6874 | 854.6874 | 1.10e-08 | PASS |
| C02-R2 Low / edge | Total_Repaid | 51,281.2423 | 51,281.2423 | 5.66e-09 | PASS |
| C02-R2 Low / edge | New_Rate | 0 | 0 | 0 | PASS |
| C02-R2 Low / edge | Repayment_If_Changed | 833.3333 | 833.3333 | -2.27e-13 | PASS |
| C02-R2 Low / edge | Change_Per_Year | -256.2485 | -256.2485 | 1.09e-09 | PASS |
| C02-R2 Low / edge | Plan_Goal_Amount | 5,556 | 5556 | 0 | PASS |
| C02-R2 Low / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R2 Low / edge | [shown] Months_To_Pay | 5 years | 5 years |  | PASS |
| C02-R3 High / edge | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C02-R3 High / edge | Formula_Repayment | 1,432.2459 | 1,432.2459 | 1.84e-11 | PASS |
| C02-R3 High / edge | Monthly_Repayment | 800 | 800 | 0 | PASS |
| C02-R3 High / edge | Months_To_Pay | Never | Never |  | PASS |
| C02-R3 High / edge | Total_Interest | — | — |  | PASS |
| C02-R3 High / edge | Final_Payment | — | — |  | PASS |
| C02-R3 High / edge | Total_Repaid | — | — |  | PASS |
| C02-R3 High / edge | New_Rate | 0.04 | 0.04 | 0 | PASS |
| C02-R3 High / edge | Repayment_If_Changed | 800 | 800 | 0 | PASS |
| C02-R3 High / edge | Change_Per_Year | 0 | 0 | 0 | PASS |
| C02-R3 High / edge | Plan_Goal_Amount | 33,333 | 33333 | 0 | PASS |
| C02-R3 High / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R3 High / edge | [shown] Months_To_Pay | Never at this repayment | Never at this repayment |  | PASS |
| C02-R4 Branch / edge | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C02-R4 Branch / edge | Formula_Repayment | 1,319.5921 | 1,319.5921 | 1.46e-11 | PASS |
| C02-R4 Branch / edge | Monthly_Repayment | 840 | 840 | 0 | PASS |
| C02-R4 Branch / edge | Months_To_Pay | 1454 | 1454 | 0 | PASS |
| C02-R4 Branch / edge | Total_Interest | 970,773.4467 | 970,773.4467 | -2.61e-08 | PASS |
| C02-R4 Branch / edge | Final_Payment | 253.4467 | 253.4467 | -2.58e-08 | PASS |
| C02-R4 Branch / edge | Total_Repaid | 1,220,773.4467 | 1,220,773.4467 | -2.91e-08 | PASS |
| C02-R4 Branch / edge | New_Rate | 0.04 | 0.04 | 0 | PASS |
| C02-R4 Branch / edge | Repayment_If_Changed | 840 | 840 | 0 | PASS |
| C02-R4 Branch / edge | Change_Per_Year | 0 | 0 | 0 | PASS |
| C02-R4 Branch / edge | Plan_Goal_Amount | 27,778 | 27778 | 0 | PASS |
| C02-R4 Branch / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R4 Branch / edge | [shown] Months_To_Pay | Over 100 years | Over 100 years |  | PASS |
| C02-R5 Random (seed 1) | Monthly_Rate | 0.0021 | 0.0021 | 4.34e-19 | PASS |
| C02-R5 Random (seed 1) | Formula_Repayment | 8,059.165 | 8,059.165 | -2.28e-10 | PASS |
| C02-R5 Random (seed 1) | Monthly_Repayment | 3382 | 3382 | 0 | PASS |
| C02-R5 Random (seed 1) | Months_To_Pay | 316 | 316 | 0 | PASS |
| C02-R5 Random (seed 1) | Total_Interest | 290,203.5488 | 290,203.5488 | 3.44e-08 | PASS |
| C02-R5 Random (seed 1) | Final_Payment | 1,873.5488 | 1,873.5488 | 3.43e-08 | PASS |
| C02-R5 Random (seed 1) | Total_Repaid | 1,067,203.5488 | 1,067,203.5488 | 3.45e-08 | PASS |
| C02-R5 Random (seed 1) | New_Rate | 0.0305 | 0.0305 | 0 | PASS |
| C02-R5 Random (seed 1) | Repayment_If_Changed | 3,558.9176 | 3,558.9176 | 2.17e-10 | PASS |
| C02-R5 Random (seed 1) | Change_Per_Year | 2,123.0106 | 2,123.0106 | 2.63e-09 | PASS |
| C02-R5 Random (seed 1) | Plan_Goal_Amount | 86,333 | 86333 | 0 | PASS |
| C02-R5 Random (seed 1) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R5 Random (seed 1) | [shown] Months_To_Pay | 26 years 4 months | 26 years 4 months |  | PASS |
| C02-R6 Random (seed 2) | Monthly_Rate | 0.0047 | 0.0047 | 0 | PASS |
| C02-R6 Random (seed 2) | Formula_Repayment | 4,944.3781 | 4,944.3781 | 2.00e-11 | PASS |
| C02-R6 Random (seed 2) | Monthly_Repayment | 5796 | 5796 | 0 | PASS |
| C02-R6 Random (seed 2) | Months_To_Pay | 199 | 199 | 0 | PASS |
| C02-R6 Random (seed 2) | Total_Interest | 405,279.1482 | 405,279.1482 | -8.15e-09 | PASS |
| C02-R6 Random (seed 2) | Final_Payment | 671.1482 | 671.1482 | -8.11e-09 | PASS |
| C02-R6 Random (seed 2) | Total_Repaid | 1,148,279.1482 | 1,148,279.1482 | -1.12e-08 | PASS |
| C02-R6 Random (seed 2) | New_Rate | 0.082 | 0.082 | 0 | PASS |
| C02-R6 Random (seed 2) | Repayment_If_Changed | 6,936.8148 | 6,936.8148 | -4.46e-11 | PASS |
| C02-R6 Random (seed 2) | Change_Per_Year | 13,689.7773 | 13,689.7773 | -5.78e-10 | PASS |
| C02-R6 Random (seed 2) | Plan_Goal_Amount | 82,556 | 82556 | 0 | PASS |
| C02-R6 Random (seed 2) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R6 Random (seed 2) | [shown] Months_To_Pay | 16 years 7 months | 16 years 7 months |  | PASS |
| C02-R7 Edge, 0% inflation | Monthly_Rate | 0.0067 | 0.0067 | 2.60e-18 | PASS |
| C02-R7 Edge, 0% inflation | Formula_Repayment | 2,201.2937 | 2,201.2937 | -4.09e-12 | PASS |
| C02-R7 Edge, 0% inflation | Monthly_Repayment | 2,201.2937 | 2,201.2937 | -4.09e-12 | PASS |
| C02-R7 Edge, 0% inflation | Months_To_Pay | 360 | 360 | 0 | PASS |
| C02-R7 Edge, 0% inflation | Total_Interest | 492,465.7398 | 492,465.7398 | 2.53e-08 | PASS |
| C02-R7 Edge, 0% inflation | Final_Payment | 2,201.2937 | 2,201.2937 | 2.74e-08 | PASS |
| C02-R7 Edge, 0% inflation | Total_Repaid | 792,465.7398 | 792,465.7398 | 2.53e-08 | PASS |
| C02-R7 Edge, 0% inflation | New_Rate | 0.11 | 0.11 | 0 | PASS |
| C02-R7 Edge, 0% inflation | Repayment_If_Changed | 2,856.9702 | 2,856.9702 | 5.00e-12 | PASS |
| C02-R7 Edge, 0% inflation | Change_Per_Year | 7,868.1176 | 7,868.1176 | 1.19e-10 | PASS |
| C02-R7 Edge, 0% inflation | Plan_Goal_Amount | 33,333 | 33333 | 0 | PASS |
| C02-R7 Edge, 0% inflation | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C02-R7 Edge, 0% inflation | [shown] Months_To_Pay | 30 years | 30 years |  | PASS |

### C03 Deposit: 49/49 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C03-R1 Defaults | Deposit_Needed | 35,000 | 35000 | 0 | PASS |
| C03-R1 Defaults | Still_To_Save | 23,000 | 23000 | 0 | PASS |
| C03-R1 Defaults | Months_To_Deposit | 29 | 29 | 0 | PASS |
| C03-R1 Defaults | Plan_Goal_Amount | 35,000 | 35000 | 0 | PASS |
| C03-R1 Defaults | Plan_Goal_Saved | 12000 | 12000 | 0 | PASS |
| C03-R1 Defaults | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C03-R1 Defaults | [shown] Months_To_Deposit | 2 years 5 months | 2 years 5 months |  | PASS |
| C03-R2 Low / edge | Deposit_Needed | 35,000 | 35000 | 0 | PASS |
| C03-R2 Low / edge | Still_To_Save | 0 | 0 | 0 | PASS |
| C03-R2 Low / edge | Months_To_Deposit | 0 | 0 | 0 | PASS |
| C03-R2 Low / edge | Plan_Goal_Amount | 35,000 | 35000 | 0 | PASS |
| C03-R2 Low / edge | Plan_Goal_Saved | 35000 | 35000 | 0 | PASS |
| C03-R2 Low / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C03-R2 Low / edge | [shown] Months_To_Deposit | You have your deposit | You have your deposit |  | PASS |
| C03-R3 High / edge | Deposit_Needed | 300,000 | 300000 | 0 | PASS |
| C03-R3 High / edge | Still_To_Save | 300,000 | 300000 | 0 | PASS |
| C03-R3 High / edge | Months_To_Deposit | 6000 | 6000 | 0 | PASS |
| C03-R3 High / edge | Plan_Goal_Amount | 300,000 | 300000 | 0 | PASS |
| C03-R3 High / edge | Plan_Goal_Saved | 0 | 0 | 0 | PASS |
| C03-R3 High / edge | Plan_Goal_Years | 500 | 500 | 0 | PASS |
| C03-R3 High / edge | [shown] Months_To_Deposit | 500 years | 500 years |  | PASS |
| C03-R4 Branch / edge | Deposit_Needed | 35,000 | 35000 | 0 | PASS |
| C03-R4 Branch / edge | Still_To_Save | 23,000 | 23000 | 0 | PASS |
| C03-R4 Branch / edge | Months_To_Deposit | 10 | 10 | 0 | PASS |
| C03-R4 Branch / edge | Plan_Goal_Amount | 35,000 | 35000 | 0 | PASS |
| C03-R4 Branch / edge | Plan_Goal_Saved | 12000 | 12000 | 0 | PASS |
| C03-R4 Branch / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C03-R4 Branch / edge | [shown] Months_To_Deposit | 10 months | 10 months |  | PASS |
| C03-R5 Random (seed 1) | Deposit_Needed | 38,400 | 38400 | 0 | PASS |
| C03-R5 Random (seed 1) | Still_To_Save | 23,400 | 23400 | 0 | PASS |
| C03-R5 Random (seed 1) | Months_To_Deposit | 5 | 5 | 0 | PASS |
| C03-R5 Random (seed 1) | Plan_Goal_Amount | 38,400 | 38400 | 0 | PASS |
| C03-R5 Random (seed 1) | Plan_Goal_Saved | 15000 | 15000 | 0 | PASS |
| C03-R5 Random (seed 1) | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C03-R5 Random (seed 1) | [shown] Months_To_Deposit | 5 months | 5 months |  | PASS |
| C03-R6 Random (seed 2) | Deposit_Needed | 205,800 | 205800 | 0 | PASS |
| C03-R6 Random (seed 2) | Still_To_Save | 187,300 | 187300 | 0 | PASS |
| C03-R6 Random (seed 2) | Months_To_Deposit | 66 | 66 | 0 | PASS |
| C03-R6 Random (seed 2) | Plan_Goal_Amount | 205,800 | 205800 | 0 | PASS |
| C03-R6 Random (seed 2) | Plan_Goal_Saved | 18500 | 18500 | 0 | PASS |
| C03-R6 Random (seed 2) | Plan_Goal_Years | 6 | 6 | 0 | PASS |
| C03-R6 Random (seed 2) | [shown] Months_To_Deposit | 5 years 6 months | 5 years 6 months |  | PASS |
| C03-R7 Edge, 0% inflation | Deposit_Needed | 35,000 | 35000 | 0 | PASS |
| C03-R7 Edge, 0% inflation | Still_To_Save | 50 | 50 | 0 | PASS |
| C03-R7 Edge, 0% inflation | Months_To_Deposit | 1 | 1 | 0 | PASS |
| C03-R7 Edge, 0% inflation | Plan_Goal_Amount | 35,000 | 35000 | 0 | PASS |
| C03-R7 Edge, 0% inflation | Plan_Goal_Saved | 34950 | 34950 | 0 | PASS |
| C03-R7 Edge, 0% inflation | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C03-R7 Edge, 0% inflation | [shown] Months_To_Deposit | 1 month | 1 month |  | PASS |

### C04 Mortgage overpayment: 112/112 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C04-R1 Defaults | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C04-R1 Defaults | Repayment_Now | 1,319.5921 | 1,319.5921 | 1.46e-11 | PASS |
| C04-R1 Defaults | Repayment_With_Extra | 1,519.5921 | 1,519.5921 | 1.46e-11 | PASS |
| C04-R1 Defaults | Months_Now | 300 | 300 | 0 | PASS |
| C04-R1 Defaults | Months_With_Extra | 239 | 239 | 0 | PASS |
| C04-R1 Defaults | Interest_Now | 145,877.6302 | 145,877.6302 | -1.22e-08 | PASS |
| C04-R1 Defaults | Interest_With_Extra | 113,000.4084 | 113,000.4084 | -1.06e-08 | PASS |
| C04-R1 Defaults | Last_Payment_Now | 1,319.5921 | 1,319.5921 | -1.78e-08 | PASS |
| C04-R1 Defaults | Last_Payment_With_Extra | 1,337.4884 | 1,337.4884 | -1.47e-08 | PASS |
| C04-R1 Defaults | Months_Sooner | 61 | 61 | 0 | PASS |
| C04-R1 Defaults | Interest_Saved | 32,877.2219 | 32,877.2219 | -2.06e-09 | PASS |
| C04-R1 Defaults | Plan_Goal_Kind | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) |  | PASS |
| C04-R1 Defaults | Plan_Goal_Years | 20 | 20 | 0 | PASS |
| C04-R1 Defaults | [shown] Months_Sooner | 5 years 1 month | 5 years 1 month |  | PASS |
| C04-R1 Defaults | [shown] Months_Now | 25 years | 25 years |  | PASS |
| C04-R1 Defaults | [shown] Months_With_Extra | 19 years 11 months | 19 years 11 months |  | PASS |
| C04-R2 Low / edge | Monthly_Rate | 0.0008 | 0.0008 | -4.34e-19 | PASS |
| C04-R2 Low / edge | Repayment_Now | 564.162 | 564.162 | -6.13e-11 | PASS |
| C04-R2 Low / edge | Repayment_With_Extra | 564.162 | 564.162 | -6.13e-11 | PASS |
| C04-R2 Low / edge | Months_Now | 36 | 36 | 0 | PASS |
| C04-R2 Low / edge | Months_With_Extra | 36 | 36 | 0 | PASS |
| C04-R2 Low / edge | Interest_Now | 309.8315 | 309.8315 | 2.21e-09 | PASS |
| C04-R2 Low / edge | Interest_With_Extra | 309.8315 | 309.8315 | 2.21e-09 | PASS |
| C04-R2 Low / edge | Last_Payment_Now | 564.162 | 564.162 | 4.35e-09 | PASS |
| C04-R2 Low / edge | Last_Payment_With_Extra | 564.162 | 564.162 | 4.35e-09 | PASS |
| C04-R2 Low / edge | Months_Sooner | 0 | 0 | 0 | PASS |
| C04-R2 Low / edge | Interest_Saved | 0 | 0 | 0 | PASS |
| C04-R2 Low / edge | Plan_Goal_Kind | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) |  | PASS |
| C04-R2 Low / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C04-R2 Low / edge | [shown] Months_Sooner | No change | No change |  | PASS |
| C04-R2 Low / edge | [shown] Months_Now | 3 years | 3 years |  | PASS |
| C04-R2 Low / edge | [shown] Months_With_Extra | 3 years | 3 years |  | PASS |
| C04-R3 High / edge | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C04-R3 High / edge | Repayment_Now | 700 | 700 | 0 | PASS |
| C04-R3 High / edge | Repayment_With_Extra | 900 | 900 | 0 | PASS |
| C04-R3 High / edge | Months_Now | Never | Never |  | PASS |
| C04-R3 High / edge | Months_With_Extra | 783 | 783 | 0 | PASS |
| C04-R3 High / edge | Interest_Now | — | — |  | PASS |
| C04-R3 High / edge | Interest_With_Extra | 453,896.9196 | 453,896.9196 | -1.68e-08 | PASS |
| C04-R3 High / edge | Last_Payment_Now | — | — |  | PASS |
| C04-R3 High / edge | Last_Payment_With_Extra | 96.9196 | 96.9196 | -1.66e-08 | PASS |
| C04-R3 High / edge | Months_Sooner | — | — |  | PASS |
| C04-R3 High / edge | Interest_Saved | — | — |  | PASS |
| C04-R3 High / edge | Plan_Goal_Kind | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) |  | PASS |
| C04-R3 High / edge | Plan_Goal_Years | 66 | 66 | 0 | PASS |
| C04-R3 High / edge | [shown] Months_Sooner | — | — |  | PASS |
| C04-R3 High / edge | [shown] Months_Now | Not at this repayment | Not at this repayment |  | PASS |
| C04-R3 High / edge | [shown] Months_With_Extra | 65 years 3 months | 65 years 3 months |  | PASS |
| C04-R4 Branch / edge | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C04-R4 Branch / edge | Repayment_Now | 700 | 700 | 0 | PASS |
| C04-R4 Branch / edge | Repayment_With_Extra | 800 | 800 | 0 | PASS |
| C04-R4 Branch / edge | Months_Now | Never | Never |  | PASS |
| C04-R4 Branch / edge | Months_With_Extra | Never | Never |  | PASS |
| C04-R4 Branch / edge | Interest_Now | — | — |  | PASS |
| C04-R4 Branch / edge | Interest_With_Extra | — | — |  | PASS |
| C04-R4 Branch / edge | Last_Payment_Now | — | — |  | PASS |
| C04-R4 Branch / edge | Last_Payment_With_Extra | — | — |  | PASS |
| C04-R4 Branch / edge | Months_Sooner | — | — |  | PASS |
| C04-R4 Branch / edge | Interest_Saved | — | — |  | PASS |
| C04-R4 Branch / edge | Plan_Goal_Kind | No goal | No goal |  | PASS |
| C04-R4 Branch / edge | Plan_Goal_Years | — | — |  | PASS |
| C04-R4 Branch / edge | [shown] Months_Sooner | — | — |  | PASS |
| C04-R4 Branch / edge | [shown] Months_Now | Not at this repayment | Not at this repayment |  | PASS |
| C04-R4 Branch / edge | [shown] Months_With_Extra | — | — |  | PASS |
| C04-R5 Random (seed 1) | Monthly_Rate | 0.005 | 0.005 | 0 | PASS |
| C04-R5 Random (seed 1) | Repayment_Now | 6439 | 6439 | 0 | PASS |
| C04-R5 Random (seed 1) | Repayment_With_Extra | 8339 | 8339 | 0 | PASS |
| C04-R5 Random (seed 1) | Months_Now | 43 | 43 | 0 | PASS |
| C04-R5 Random (seed 1) | Months_With_Extra | 32 | 32 | 0 | PASS |
| C04-R5 Random (seed 1) | Interest_Now | 27,441.4693 | 27,441.4693 | 5.73e-09 | PASS |
| C04-R5 Random (seed 1) | Interest_With_Extra | 20,642.2507 | 20,642.2507 | 5.36e-09 | PASS |
| C04-R5 Random (seed 1) | Last_Payment_Now | 2,003.4693 | 2,003.4693 | 5.72e-09 | PASS |
| C04-R5 Random (seed 1) | Last_Payment_With_Extra | 7,133.2507 | 7,133.2507 | 5.42e-09 | PASS |
| C04-R5 Random (seed 1) | Months_Sooner | 11 | 11 | 0 | PASS |
| C04-R5 Random (seed 1) | Interest_Saved | 6,799.2186 | 6,799.2186 | 3.23e-10 | PASS |
| C04-R5 Random (seed 1) | Plan_Goal_Kind | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) |  | PASS |
| C04-R5 Random (seed 1) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C04-R5 Random (seed 1) | [shown] Months_Sooner | 11 months | 11 months |  | PASS |
| C04-R5 Random (seed 1) | [shown] Months_Now | 3 years 7 months | 3 years 7 months |  | PASS |
| C04-R5 Random (seed 1) | [shown] Months_With_Extra | 2 years 8 months | 2 years 8 months |  | PASS |
| C04-R6 Random (seed 2) | Monthly_Rate | 0.0028 | 0.0028 | 3.47e-18 | PASS |
| C04-R6 Random (seed 2) | Repayment_Now | 1777 | 1777 | 0 | PASS |
| C04-R6 Random (seed 2) | Repayment_With_Extra | 2252 | 2252 | 0 | PASS |
| C04-R6 Random (seed 2) | Months_Now | Never | Never |  | PASS |
| C04-R6 Random (seed 2) | Months_With_Extra | 911 | 911 | 0 | PASS |
| C04-R6 Random (seed 2) | Interest_Now | — | — |  | PASS |
| C04-R6 Random (seed 2) | Interest_With_Extra | 1,308,004.3005 | 1,308,004.3005 | -5.75e-08 | PASS |
| C04-R6 Random (seed 2) | Last_Payment_Now | — | — |  | PASS |
| C04-R6 Random (seed 2) | Last_Payment_With_Extra | 1,684.3005 | 1,684.3005 | -5.52e-08 | PASS |
| C04-R6 Random (seed 2) | Months_Sooner | — | — |  | PASS |
| C04-R6 Random (seed 2) | Interest_Saved | — | — |  | PASS |
| C04-R6 Random (seed 2) | Plan_Goal_Kind | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) |  | PASS |
| C04-R6 Random (seed 2) | Plan_Goal_Years | 76 | 76 | 0 | PASS |
| C04-R6 Random (seed 2) | [shown] Months_Sooner | — | — |  | PASS |
| C04-R6 Random (seed 2) | [shown] Months_Now | Not at this repayment | Not at this repayment |  | PASS |
| C04-R6 Random (seed 2) | [shown] Months_With_Extra | 75 years 11 months | 75 years 11 months |  | PASS |
| C04-R7 Edge, 0% inflation | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C04-R7 Edge, 0% inflation | Repayment_Now | 840 | 840 | 0 | PASS |
| C04-R7 Edge, 0% inflation | Repayment_With_Extra | 840 | 840 | 0 | PASS |
| C04-R7 Edge, 0% inflation | Months_Now | 1454 | 1454 | 0 | PASS |
| C04-R7 Edge, 0% inflation | Months_With_Extra | 1454 | 1454 | 0 | PASS |
| C04-R7 Edge, 0% inflation | Interest_Now | 970,773.4467 | 970,773.4467 | -2.61e-08 | PASS |
| C04-R7 Edge, 0% inflation | Interest_With_Extra | 970,773.4467 | 970,773.4467 | -2.61e-08 | PASS |
| C04-R7 Edge, 0% inflation | Last_Payment_Now | 253.4467 | 253.4467 | -2.58e-08 | PASS |
| C04-R7 Edge, 0% inflation | Last_Payment_With_Extra | 253.4467 | 253.4467 | -2.58e-08 | PASS |
| C04-R7 Edge, 0% inflation | Months_Sooner | 0 | 0 | 0 | PASS |
| C04-R7 Edge, 0% inflation | Interest_Saved | 0 | 0 | 0 | PASS |
| C04-R7 Edge, 0% inflation | Plan_Goal_Kind | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) | Mortgage free (plan kind mfree, priced from your mortgage; no cash amount) |  | PASS |
| C04-R7 Edge, 0% inflation | Plan_Goal_Years | 122 | 122 | 0 | PASS |
| C04-R7 Edge, 0% inflation | [shown] Months_Sooner | No change | No change |  | PASS |
| C04-R7 Edge, 0% inflation | [shown] Months_Now | Over 100 years | Over 100 years |  | PASS |
| C04-R7 Edge, 0% inflation | [shown] Months_With_Extra | Over 100 years | Over 100 years |  | PASS |

### C05 Interest rate impact: 49/49 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C05-R1 Defaults | Formula_Now | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C05-R1 Defaults | Repayment_Now | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C05-R1 Defaults | New_Rate | 0.05 | 0.05 | 0 | PASS |
| C05-R1 Defaults | Repayment_After | 1,753.7701 | 1,753.7701 | 0 | PASS |
| C05-R1 Defaults | Monthly_Change | 170.2596 | 170.2596 | -2.45e-11 | PASS |
| C05-R1 Defaults | Yearly_Change | 2,043.1152 | 2,043.1152 | -2.94e-10 | PASS |
| C05-R1 Defaults | [shown] Monthly_Change | +€170 | +€170 |  | PASS |
| C05-R2 Low / edge | Formula_Now | 1,130.6174 | 1,130.6174 | -1.13e-10 | PASS |
| C05-R2 Low / edge | Repayment_Now | 1,130.6174 | 1,130.6174 | -1.13e-10 | PASS |
| C05-R2 Low / edge | New_Rate | 0 | 0 | 0 | PASS |
| C05-R2 Low / edge | Repayment_After | 1,000 | 1000 | -2.27e-13 | PASS |
| C05-R2 Low / edge | Monthly_Change | -130.6174 | -130.6174 | 1.09e-10 | PASS |
| C05-R2 Low / edge | Yearly_Change | -1,567.4084 | -1,567.4084 | 1.31e-09 | PASS |
| C05-R2 Low / edge | [shown] Monthly_Change | −€131 | −€131 |  | PASS |
| C05-R3 High / edge | Formula_Now | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C05-R3 High / edge | Repayment_Now | 1500 | 1500 | 0 | PASS |
| C05-R3 High / edge | New_Rate | 0.045 | 0.045 | 0 | PASS |
| C05-R3 High / edge | Repayment_After | 1,583.9869 | 1,583.9869 | -4.59e-11 | PASS |
| C05-R3 High / edge | Monthly_Change | 83.9869 | 83.9869 | -4.11e-11 | PASS |
| C05-R3 High / edge | Yearly_Change | 1,007.843 | 1,007.843 | -4.92e-10 | PASS |
| C05-R3 High / edge | [shown] Monthly_Change | +€84 | +€84 |  | PASS |
| C05-R4 Branch / edge | Formula_Now | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C05-R4 Branch / edge | Repayment_Now | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C05-R4 Branch / edge | New_Rate | 0.04 | 0.04 | 0 | PASS |
| C05-R4 Branch / edge | Repayment_After | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C05-R4 Branch / edge | Monthly_Change | 0 | 0 | 0 | PASS |
| C05-R4 Branch / edge | Yearly_Change | 0 | 0 | 0 | PASS |
| C05-R4 Branch / edge | [shown] Monthly_Change | +€0 | +€0 |  | PASS |
| C05-R5 Random (seed 1) | Formula_Now | 1,646.407 | 1,646.407 | -3.41e-12 | PASS |
| C05-R5 Random (seed 1) | Repayment_Now | 1986 | 1986 | 0 | PASS |
| C05-R5 Random (seed 1) | New_Rate | 0.0625 | 0.0625 | 0 | PASS |
| C05-R5 Random (seed 1) | Repayment_After | 2,233.6207 | 2,233.6207 | -4.55e-12 | PASS |
| C05-R5 Random (seed 1) | Monthly_Change | 247.6207 | 247.6207 | -6.34e-12 | PASS |
| C05-R5 Random (seed 1) | Yearly_Change | 2,971.4479 | 2,971.4479 | -7.19e-11 | PASS |
| C05-R5 Random (seed 1) | [shown] Monthly_Change | +€248 | +€248 |  | PASS |
| C05-R6 Random (seed 2) | Formula_Now | 5,932.9702 | 5,932.9702 | -6.28e-11 | PASS |
| C05-R6 Random (seed 2) | Repayment_Now | 369 | 369 | 0 | PASS |
| C05-R6 Random (seed 2) | New_Rate | 0.0655 | 0.0655 | 0 | PASS |
| C05-R6 Random (seed 2) | Repayment_After | 1,576.9077 | 1,576.9077 | 6.82e-11 | PASS |
| C05-R6 Random (seed 2) | Monthly_Change | 1,207.9077 | 1,207.9077 | 6.82e-11 | PASS |
| C05-R6 Random (seed 2) | Yearly_Change | 14,494.8922 | 14,494.8922 | 8.39e-10 | PASS |
| C05-R6 Random (seed 2) | [shown] Monthly_Change | +€1,208 | +€1,208 |  | PASS |
| C05-R7 Edge, 0% inflation | Formula_Now | 1,271.563 | 1,271.563 | 2.21e-11 | PASS |
| C05-R7 Edge, 0% inflation | Repayment_Now | 1,271.563 | 1,271.563 | 2.21e-11 | PASS |
| C05-R7 Edge, 0% inflation | New_Rate | 0.005 | 0.005 | -8.67e-19 | PASS |
| C05-R7 Edge, 0% inflation | Repayment_After | 1,064.0098 | 1,064.0098 | 1.51e-10 | PASS |
| C05-R7 Edge, 0% inflation | Monthly_Change | -207.5532 | -207.5532 | 1.34e-10 | PASS |
| C05-R7 Edge, 0% inflation | Yearly_Change | -2,490.6387 | -2,490.6387 | 1.61e-09 | PASS |
| C05-R7 Edge, 0% inflation | [shown] Monthly_Change | −€208 | −€208 |  | PASS |

### C06 Term comparison: 42/42 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C06-R1 Defaults | Monthly_A | 1,583.5105 | 1,583.5105 | 1.96e-11 | PASS |
| C06-R1 Defaults | Monthly_B | 1,328.3242 | 1,328.3242 | 1.84e-11 | PASS |
| C06-R1 Defaults | Interest_A | 175,053.1563 | 175,053.1563 | -2.79e-09 | PASS |
| C06-R1 Defaults | Interest_B | 257,896.1737 | 257,896.1737 | -6.98e-09 | PASS |
| C06-R1 Defaults | Interest_Difference | 82,843.0174 | 82,843.0174 | -4.50e-09 | PASS |
| C06-R1 Defaults | [shown] Interest_Difference | The 25-year term costs more each month but less interest overall. | The 25-year term costs more each month but less interest overall. |  | PASS |
| C06-R2 Low / edge | Monthly_A | 854.6874 | 854.6874 | -9.11e-11 | PASS |
| C06-R2 Low / edge | Monthly_B | 854.6874 | 854.6874 | -9.11e-11 | PASS |
| C06-R2 Low / edge | Interest_A | 1,281.2423 | 1,281.2423 | 1.37e-10 | PASS |
| C06-R2 Low / edge | Interest_B | 1,281.2423 | 1,281.2423 | 1.37e-10 | PASS |
| C06-R2 Low / edge | Interest_Difference | 0 | 0 | 0 | PASS |
| C06-R2 Low / edge | [shown] Interest_Difference | Both terms are the same. | Both terms are the same. |  | PASS |
| C06-R3 High / edge | Monthly_A | 7,102.6088 | 7,102.6088 | -1.73e-11 | PASS |
| C06-R3 High / edge | Monthly_B | 20,276.3943 | 20,276.3943 | -1.56e-10 | PASS |
| C06-R3 High / edge | Interest_A | 1,983,095.6916 | 1,983,095.6916 | -6.52e-08 | PASS |
| C06-R3 High / edge | Interest_B | 216,583.6573 | 216,583.6573 | 1.86e-09 | PASS |
| C06-R3 High / edge | Interest_Difference | 1,766,512.0343 | 1,766,512.0343 | -6.61e-08 | PASS |
| C06-R3 High / edge | [shown] Interest_Difference | The 5-year term costs more each month but less interest overall. | The 5-year term costs more each month but less interest overall. |  | PASS |
| C06-R4 Branch / edge | Monthly_A | 1,739.8792 | 1,739.8792 | 4.77e-12 | PASS |
| C06-R4 Branch / edge | Monthly_B | 1,347.1341 | 1,347.1341 | -4.55e-13 | PASS |
| C06-R4 Branch / edge | Interest_A | 117,570.9969 | 117,570.9969 | -1.44e-09 | PASS |
| C06-R4 Branch / edge | Interest_B | 184,968.2628 | 184,968.2628 | -1.80e-09 | PASS |
| C06-R4 Branch / edge | Interest_Difference | 67,397.2659 | 67,397.2659 | -1.05e-09 | PASS |
| C06-R4 Branch / edge | [shown] Interest_Difference | The 20-year term costs more each month but less interest overall. | The 20-year term costs more each month but less interest overall. |  | PASS |
| C06-R5 Random (seed 1) | Monthly_A | 4,473.0033 | 4,473.0033 | 1.82e-11 | PASS |
| C06-R5 Random (seed 1) | Monthly_B | 3,023.9702 | 3,023.9702 | 1.23e-11 | PASS |
| C06-R5 Random (seed 1) | Interest_A | 93,408.3128 | 93,408.3128 | -9.02e-10 | PASS |
| C06-R5 Random (seed 1) | Interest_B | 172,026.9868 | 172,026.9868 | -5.82e-10 | PASS |
| C06-R5 Random (seed 1) | Interest_Difference | 78,618.6741 | 78,618.6741 | 1.46e-11 | PASS |
| C06-R5 Random (seed 1) | [shown] Interest_Difference | The 8-year term costs more each month but less interest overall. | The 8-year term costs more each month but less interest overall. |  | PASS |
| C06-R6 Random (seed 2) | Monthly_A | 2,995.9649 | 2,995.9649 | 2.09e-11 | PASS |
| C06-R6 Random (seed 2) | Monthly_B | 3,245.6191 | 3,245.6191 | 3.09e-11 | PASS |
| C06-R6 Random (seed 2) | Interest_A | 642,353.6936 | 642,353.6936 | -9.08e-09 | PASS |
| C06-R6 Random (seed 2) | Interest_B | 510,528.0188 | 510,528.0188 | -8.38e-09 | PASS |
| C06-R6 Random (seed 2) | Interest_Difference | 131,825.6748 | 131,825.6748 | -1.75e-09 | PASS |
| C06-R6 Random (seed 2) | [shown] Interest_Difference | The 28-year term costs more each month but less interest overall. | The 28-year term costs more each month but less interest overall. |  | PASS |
| C06-R7 Edge, 0% inflation | Monthly_A | 1,432.2459 | 1,432.2459 | 1.84e-11 | PASS |
| C06-R7 Edge, 0% inflation | Monthly_B | 1,432.2459 | 1,432.2459 | 1.84e-11 | PASS |
| C06-R7 Edge, 0% inflation | Interest_A | 215,608.5191 | 215,608.5191 | -4.28e-09 | PASS |
| C06-R7 Edge, 0% inflation | Interest_B | 215,608.5191 | 215,608.5191 | -4.28e-09 | PASS |
| C06-R7 Edge, 0% inflation | Interest_Difference | 0 | 0 | 0 | PASS |
| C06-R7 Edge, 0% inflation | [shown] Interest_Difference | Both terms are the same. | Both terms are the same. |  | PASS |

### C07 Rent vs buy: 77/77 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C07-R1 Defaults | Loan | 315000 | 315000 | 0 | PASS |
| C07-R1 Defaults | Monthly_Repayment | 1,503.8582 | 1,503.8582 | 2.07e-11 | PASS |
| C07-R1 Defaults | Balance_After | 248,169.4715 | 248,169.4715 | -6.20e-09 | PASS |
| C07-R1 Defaults | Interest_Paid | 113,632.4532 | 113,632.4532 | -2.36e-09 | PASS |
| C07-R1 Defaults | Upkeep | 35,000 | 35000 | 0 | PASS |
| C07-R1 Defaults | Buying_Costs | 148,632.4532 | 148,632.4532 | -2.36e-09 | PASS |
| C07-R1 Defaults | Rent_Paid | 216000 | 216000 | 0 | PASS |
| C07-R1 Defaults | Home_Value | 426,648.047 | 426,648.047 | -5.82e-11 | PASS |
| C07-R1 Defaults | Home_Equity | 178,478.5755 | 178,478.5755 | 6.14e-09 | PASS |
| C07-R1 Defaults | Plan_Goal_Amount | 35000 | 35000 | 0 | PASS |
| C07-R1 Defaults | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C07-R2 Low / edge | Loan | 90000 | 90000 | 0 | PASS |
| C07-R2 Low / edge | Monthly_Repayment | 289.4756 | 289.4756 | -2.73e-11 | PASS |
| C07-R2 Low / edge | Balance_After | 87,414.4642 | 87,414.4642 | 4.95e-10 | PASS |
| C07-R2 Low / edge | Interest_Paid | 888.171 | 888.171 | 2.61e-10 | PASS |
| C07-R2 Low / edge | Upkeep | 1,000 | 1000 | 0 | PASS |
| C07-R2 Low / edge | Buying_Costs | 1,888.171 | 1,888.171 | 2.61e-10 | PASS |
| C07-R2 Low / edge | Rent_Paid | 6000 | 6000 | 0 | PASS |
| C07-R2 Low / edge | Home_Value | 100000 | 100000 | 0 | PASS |
| C07-R2 Low / edge | Home_Equity | 12,585.5358 | 12,585.5358 | -4.95e-10 | PASS |
| C07-R2 Low / edge | Plan_Goal_Amount | 10000 | 10000 | 0 | PASS |
| C07-R2 Low / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C07-R3 High / edge | Loan | 0 | 0 | 0 | PASS |
| C07-R3 High / edge | Monthly_Repayment | 0 | 0 | 0 | PASS |
| C07-R3 High / edge | Balance_After | 0 | 0 | 0 | PASS |
| C07-R3 High / edge | Interest_Paid | 0 | 0 | 0 | PASS |
| C07-R3 High / edge | Upkeep | 300,000 | 300000 | 0 | PASS |
| C07-R3 High / edge | Buying_Costs | 300,000 | 300000 | 0 | PASS |
| C07-R3 High / edge | Rent_Paid | 1800000 | 1800000 | 0 | PASS |
| C07-R3 High / edge | Home_Value | 5,743,491.1729 | 5,743,491.1729 | 9.31e-10 | PASS |
| C07-R3 High / edge | Home_Equity | 5,743,491.1729 | 5,743,491.1729 | 9.31e-10 | PASS |
| C07-R3 High / edge | Plan_Goal_Amount | 1000000 | 1000000 | 0 | PASS |
| C07-R3 High / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C07-R4 Branch / edge | Loan | 315000 | 315000 | 0 | PASS |
| C07-R4 Branch / edge | Monthly_Repayment | 1,503.8582 | 1,503.8582 | 2.07e-11 | PASS |
| C07-R4 Branch / edge | Balance_After | 0 | 0 | -1.89e-08 | PASS |
| C07-R4 Branch / edge | Interest_Paid | 226,388.9451 | 226,388.9451 | -9.69e-09 | PASS |
| C07-R4 Branch / edge | Upkeep | 105,000 | 105000 | 0 | PASS |
| C07-R4 Branch / edge | Buying_Costs | 331,388.9451 | 331,388.9451 | -9.66e-09 | PASS |
| C07-R4 Branch / edge | Rent_Paid | 648000 | 648000 | 0 | PASS |
| C07-R4 Branch / edge | Home_Value | 633,976.5544 | 633,976.5544 | -2.33e-10 | PASS |
| C07-R4 Branch / edge | Home_Equity | 633,976.5544 | 633,976.5544 | 1.86e-08 | PASS |
| C07-R4 Branch / edge | Plan_Goal_Amount | 35000 | 35000 | 0 | PASS |
| C07-R4 Branch / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C07-R5 Random (seed 1) | Loan | 255000 | 255000 | 0 | PASS |
| C07-R5 Random (seed 1) | Monthly_Repayment | 1,782.997 | 1,782.997 | 1.00e-11 | PASS |
| C07-R5 Random (seed 1) | Balance_After | 237,858.2362 | 237,858.2362 | -1.16e-10 | PASS |
| C07-R5 Random (seed 1) | Interest_Paid | 111,234.02 | 111,234.02 | -1.46e-10 | PASS |
| C07-R5 Random (seed 1) | Upkeep | 19,200 | 19200 | 0 | PASS |
| C07-R5 Random (seed 1) | Buying_Costs | 130,434.02 | 130,434.02 | -1.46e-10 | PASS |
| C07-R5 Random (seed 1) | Rent_Paid | 270000 | 270000 | 0 | PASS |
| C07-R5 Random (seed 1) | Home_Value | 339,686.4482 | 339,686.4482 | -5.82e-11 | PASS |
| C07-R5 Random (seed 1) | Home_Equity | 101,828.212 | 101,828.212 | 1.06e-09 | PASS |
| C07-R5 Random (seed 1) | Plan_Goal_Amount | 65000 | 65000 | 0 | PASS |
| C07-R5 Random (seed 1) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C07-R6 Random (seed 2) | Loan | 232000 | 232000 | 0 | PASS |
| C07-R6 Random (seed 2) | Monthly_Repayment | 953.2751 | 953.2751 | -9.44e-12 | PASS |
| C07-R6 Random (seed 2) | Balance_After | 108,191.6718 | 108,191.6718 | 7.19e-09 | PASS |
| C07-R6 Random (seed 2) | Interest_Paid | 93,538.3965 | 93,538.3965 | 3.83e-09 | PASS |
| C07-R6 Random (seed 2) | Upkeep | 69,350 | 69350 | 0 | PASS |
| C07-R6 Random (seed 2) | Buying_Costs | 162,888.3965 | 162,888.3965 | 4.02e-09 | PASS |
| C07-R6 Random (seed 2) | Rent_Paid | 1105800 | 1105800 | 0 | PASS |
| C07-R6 Random (seed 2) | Home_Value | 365,000 | 365000 | 0 | PASS |
| C07-R6 Random (seed 2) | Home_Equity | 256,808.3282 | 256,808.3282 | -7.19e-09 | PASS |
| C07-R6 Random (seed 2) | Plan_Goal_Amount | 133000 | 133000 | 0 | PASS |
| C07-R6 Random (seed 2) | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C07-R7 Edge, 0% inflation | Loan | 250000 | 250000 | 0 | PASS |
| C07-R7 Edge, 0% inflation | Monthly_Repayment | 1,193.5382 | 1,193.5382 | 1.55e-11 | PASS |
| C07-R7 Edge, 0% inflation | Balance_After | 226,118.7828 | 226,118.7828 | -1.37e-09 | PASS |
| C07-R7 Edge, 0% inflation | Interest_Paid | 47,731.0772 | 47,731.0772 | -7.35e-10 | PASS |
| C07-R7 Edge, 0% inflation | Upkeep | 17,500 | 17500 | 0 | PASS |
| C07-R7 Edge, 0% inflation | Buying_Costs | 65,231.0772 | 65,231.0772 | -7.35e-10 | PASS |
| C07-R7 Edge, 0% inflation | Rent_Paid | 108000 | 108000 | 0 | PASS |
| C07-R7 Edge, 0% inflation | Home_Value | 386,428.2811 | 386,428.2811 | 0 | PASS |
| C07-R7 Edge, 0% inflation | Home_Equity | 160,309.4983 | 160,309.4983 | 1.37e-09 | PASS |
| C07-R7 Edge, 0% inflation | Plan_Goal_Amount | 100000 | 100000 | 0 | PASS |
| C07-R7 Edge, 0% inflation | Plan_Goal_Years | 3 | 3 | 0 | PASS |

### C08 Goal planner: 56/56 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C08-R1 Defaults | Future_Cost | 15,918.12 | 15,918.12 | -1.82e-12 | PASS |
| C08-R1 Defaults | Saved_Grows_To | 2,122.416 | 2,122.416 | 0 | PASS |
| C08-R1 Defaults | Still_Needed | 13,795.704 | 13,795.704 | -1.82e-12 | PASS |
| C08-R1 Defaults | Monthly_Growth | 0.0017 | 0.0017 | -4.12e-18 | PASS |
| C08-R1 Defaults | Monthly_Saving | 372.2508 | 372.2508 | 3.41e-13 | PASS |
| C08-R1 Defaults | Plan_Goal_Amount | 15000 | 15000 | 0 | PASS |
| C08-R1 Defaults | Plan_Goal_Saved | 2000 | 2000 | 0 | PASS |
| C08-R1 Defaults | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C08-R2 Low / edge | Future_Cost | 517.5 | 517.5 | 0 | PASS |
| C08-R2 Low / edge | Saved_Grows_To | 200000 | 200000 | 0 | PASS |
| C08-R2 Low / edge | Still_Needed | 0 | 0 | 0 | PASS |
| C08-R2 Low / edge | Monthly_Growth | 0 | 0 | 0 | PASS |
| C08-R2 Low / edge | Monthly_Saving | 0 | 0 | 0 | PASS |
| C08-R2 Low / edge | Plan_Goal_Amount | 500 | 500 | 0 | PASS |
| C08-R2 Low / edge | Plan_Goal_Saved | 200000 | 200000 | 0 | PASS |
| C08-R2 Low / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C08-R3 High / edge | Future_Cost | 905,680.7921 | 905,680.7921 | -3.49e-10 | PASS |
| C08-R3 High / edge | Saved_Grows_To | 0 | 0 | 0 | PASS |
| C08-R3 High / edge | Still_Needed | 905,680.7921 | 905,680.7921 | -3.49e-10 | PASS |
| C08-R3 High / edge | Monthly_Growth | 0.0057 | 0.0057 | -3.47e-18 | PASS |
| C08-R3 High / edge | Monthly_Saving | 774.4485 | 774.4485 | 2.27e-13 | PASS |
| C08-R3 High / edge | Plan_Goal_Amount | 500000 | 500000 | 0 | PASS |
| C08-R3 High / edge | Plan_Goal_Saved | 0 | 0 | 0 | PASS |
| C08-R3 High / edge | Plan_Goal_Years | 30 | 30 | 0 | PASS |
| C08-R4 Branch / edge | Future_Cost | 16,271.8432 | 16,271.8432 | -3.64e-12 | PASS |
| C08-R4 Branch / edge | Saved_Grows_To | 2000 | 2000 | 0 | PASS |
| C08-R4 Branch / edge | Still_Needed | 14,271.8432 | 14,271.8432 | -3.64e-12 | PASS |
| C08-R4 Branch / edge | Monthly_Growth | 0 | 0 | 0 | PASS |
| C08-R4 Branch / edge | Monthly_Saving | 396.4401 | 396.4401 | 4.55e-13 | PASS |
| C08-R4 Branch / edge | Plan_Goal_Amount | 15000 | 15000 | 0 | PASS |
| C08-R4 Branch / edge | Plan_Goal_Saved | 2000 | 2000 | 0 | PASS |
| C08-R4 Branch / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C08-R5 Random (seed 1) | Future_Cost | 95,630.3242 | 95,630.3242 | 0 | PASS |
| C08-R5 Random (seed 1) | Saved_Grows_To | 38,467.8792 | 38,467.8792 | -2.91e-11 | PASS |
| C08-R5 Random (seed 1) | Still_Needed | 57,162.445 | 57,162.445 | 3.64e-11 | PASS |
| C08-R5 Random (seed 1) | Monthly_Growth | 0.0021 | 0.0021 | -8.67e-19 | PASS |
| C08-R5 Random (seed 1) | Monthly_Saving | 896.0268 | 896.0268 | 4.55e-13 | PASS |
| C08-R5 Random (seed 1) | Plan_Goal_Amount | 83500 | 83500 | 0 | PASS |
| C08-R5 Random (seed 1) | Plan_Goal_Saved | 34000 | 34000 | 0 | PASS |
| C08-R5 Random (seed 1) | Plan_Goal_Years | 5 | 5 | 0 | PASS |
| C08-R6 Random (seed 2) | Future_Cost | 241,250.2316 | 241,250.2316 | 5.82e-11 | PASS |
| C08-R6 Random (seed 2) | Saved_Grows_To | 136,307.5733 | 136,307.5733 | -2.91e-11 | PASS |
| C08-R6 Random (seed 2) | Still_Needed | 104,942.6583 | 104,942.6583 | 8.73e-11 | PASS |
| C08-R6 Random (seed 2) | Monthly_Growth | 0.0053 | 0.0053 | 0 | PASS |
| C08-R6 Random (seed 2) | Monthly_Saving | 351.2926 | 351.2926 | 2.27e-13 | PASS |
| C08-R6 Random (seed 2) | Plan_Goal_Amount | 144000 | 144000 | 0 | PASS |
| C08-R6 Random (seed 2) | Plan_Goal_Saved | 53000 | 53000 | 0 | PASS |
| C08-R6 Random (seed 2) | Plan_Goal_Years | 15 | 15 | 0 | PASS |
| C08-R7 Edge, 0% inflation | Future_Cost | 15,000 | 15000 | 0 | PASS |
| C08-R7 Edge, 0% inflation | Saved_Grows_To | 2,122.416 | 2,122.416 | 0 | PASS |
| C08-R7 Edge, 0% inflation | Still_Needed | 12,877.584 | 12,877.584 | 1.82e-12 | PASS |
| C08-R7 Edge, 0% inflation | Monthly_Growth | 0.0017 | 0.0017 | -4.12e-18 | PASS |
| C08-R7 Edge, 0% inflation | Monthly_Saving | 347.4771 | 347.4771 | 0 | PASS |
| C08-R7 Edge, 0% inflation | Plan_Goal_Amount | 15000 | 15000 | 0 | PASS |
| C08-R7 Edge, 0% inflation | Plan_Goal_Saved | 2000 | 2000 | 0 | PASS |
| C08-R7 Edge, 0% inflation | Plan_Goal_Years | 3 | 3 | 0 | PASS |

### C09 Compound growth: 49/49 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C09-R1 Defaults | Monthly_Growth | 0.0033 | 0.0033 | -4.34e-18 | PASS |
| C09-R1 Defaults | Grows_To | 83,723.9615 | 83,723.9615 | -5.82e-11 | PASS |
| C09-R1 Defaults | Paid_In | 53000 | 53000 | 0 | PASS |
| C09-R1 Defaults | Growth_Earned | 30,723.9615 | 30,723.9615 | -5.46e-11 | PASS |
| C09-R1 Defaults | Value_Today | 56,343.826 | 56,343.826 | 2.18e-11 | PASS |
| C09-R1 Defaults | Plan_Goal_Amount | 56,344 | 56344 | 0 | PASS |
| C09-R1 Defaults | Plan_Goal_Years | 20 | 20 | 0 | PASS |
| C09-R2 Low / edge | Monthly_Growth | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Grows_To | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Paid_In | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Growth_Earned | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Value_Today | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Plan_Goal_Amount | 0 | 0 | 0 | PASS |
| C09-R2 Low / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C09-R3 High / edge | Monthly_Growth | 0.0064 | 0.0064 | 0 | PASS |
| C09-R3 High / edge | Grows_To | 14,008,142.3364 | 14,008,142.3364 | 0 | PASS |
| C09-R3 High / edge | Paid_In | 1640000 | 1640000 | 0 | PASS |
| C09-R3 High / edge | Growth_Earned | 12,368,142.3364 | 12,368,142.3364 | 0 | PASS |
| C09-R3 High / edge | Value_Today | 6,344,153.3987 | 6,344,153.3987 | 2.79e-09 | PASS |
| C09-R3 High / edge | Plan_Goal_Amount | 6,344,153 | 6344153 | 0 | PASS |
| C09-R3 High / edge | Plan_Goal_Years | 40 | 40 | 0 | PASS |
| C09-R4 Branch / edge | Monthly_Growth | 0 | 0 | 0 | PASS |
| C09-R4 Branch / edge | Grows_To | 53,000 | 53000 | 0 | PASS |
| C09-R4 Branch / edge | Paid_In | 53000 | 53000 | 0 | PASS |
| C09-R4 Branch / edge | Growth_Earned | 0 | 0 | 0 | PASS |
| C09-R4 Branch / edge | Value_Today | 30,806.28 | 30,806.28 | -1.82e-11 | PASS |
| C09-R4 Branch / edge | Plan_Goal_Amount | 30,806 | 30806 | 0 | PASS |
| C09-R4 Branch / edge | Plan_Goal_Years | 20 | 20 | 0 | PASS |
| C09-R5 Random (seed 1) | Monthly_Growth | 0.0049 | 0.0049 | 1.73e-18 | PASS |
| C09-R5 Random (seed 1) | Grows_To | 5,206,992.1255 | 5,206,992.1255 | -2.79e-09 | PASS |
| C09-R5 Random (seed 1) | Paid_In | 1318900 | 1318900 | 0 | PASS |
| C09-R5 Random (seed 1) | Growth_Earned | 3,888,092.1255 | 3,888,092.1255 | -2.79e-09 | PASS |
| C09-R5 Random (seed 1) | Value_Today | 1,960,834.8686 | 1,960,834.8686 | -4.66e-10 | PASS |
| C09-R5 Random (seed 1) | Plan_Goal_Amount | 1,960,835 | 1960835 | 0 | PASS |
| C09-R5 Random (seed 1) | Plan_Goal_Years | 36 | 36 | 0 | PASS |
| C09-R6 Random (seed 2) | Monthly_Growth | 0.0025 | 0.0025 | 3.47e-18 | PASS |
| C09-R6 Random (seed 2) | Grows_To | 462,218.033 | 462,218.033 | -3.49e-10 | PASS |
| C09-R6 Random (seed 2) | Paid_In | 370600 | 370600 | 0 | PASS |
| C09-R6 Random (seed 2) | Growth_Earned | 91,618.033 | 91,618.033 | -1.46e-10 | PASS |
| C09-R6 Random (seed 2) | Value_Today | 305,888.1744 | 305,888.1744 | -5.24e-10 | PASS |
| C09-R6 Random (seed 2) | Plan_Goal_Amount | 305,888 | 305888 | 0 | PASS |
| C09-R6 Random (seed 2) | Plan_Goal_Years | 12 | 12 | 0 | PASS |
| C09-R7 Edge, 0% inflation | Monthly_Growth | 0.0033 | 0.0033 | -4.34e-18 | PASS |
| C09-R7 Edge, 0% inflation | Grows_To | 83,723.9615 | 83,723.9615 | -5.82e-11 | PASS |
| C09-R7 Edge, 0% inflation | Paid_In | 53000 | 53000 | 0 | PASS |
| C09-R7 Edge, 0% inflation | Growth_Earned | 30,723.9615 | 30,723.9615 | -5.46e-11 | PASS |
| C09-R7 Edge, 0% inflation | Value_Today | 83,723.9615 | 83,723.9615 | -5.82e-11 | PASS |
| C09-R7 Edge, 0% inflation | Plan_Goal_Amount | 83,724 | 83724 | 0 | PASS |
| C09-R7 Edge, 0% inflation | Plan_Goal_Years | 20 | 20 | 0 | PASS |

### C10 Lump sum growth: 70/70 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C10-R1 Defaults | Growth_After_Fees | 0.04 | 0.04 | -3.47e-17 | PASS |
| C10-R1 Defaults | Grows_To | 18,009.4351 | 18,009.4351 | 3.27e-11 | PASS |
| C10-R1 Defaults | Value_Today | 13,381.2755 | 13,381.2755 | 1.64e-11 | PASS |
| C10-R1 Defaults | Value_Start_Later | 14,802.4428 | 14,802.4428 | -4.55e-11 | PASS |
| C10-R1 Defaults | Headline | 18,009.4351 | 18,009.4351 | 3.27e-11 | PASS |
| C10-R1 Defaults | Cost_Of_Waiting | 3,206.9922 | 3,206.9922 | -9.09e-13 | PASS |
| C10-R1 Defaults | Fees_Cost | -0 | 0 | 3.64e-12 | PASS |
| C10-R1 Defaults | Real_Return | 0.0196 | 0.0196 | -3.12e-17 | PASS |
| C10-R1 Defaults | Plan_Goal_Amount | 13,381 | 13381 | 0 | PASS |
| C10-R1 Defaults | Plan_Goal_Years | 15 | 15 | 0 | PASS |
| C10-R2 Low / edge | Growth_After_Fees | 0 | 0 | 0 | PASS |
| C10-R2 Low / edge | Grows_To | 500 | 500 | 0 | PASS |
| C10-R2 Low / edge | Value_Today | 483.0918 | 483.0918 | 4.55e-13 | PASS |
| C10-R2 Low / edge | Value_Start_Later | 500 | 500 | 0 | PASS |
| C10-R2 Low / edge | Headline | 483.0918 | 483.0918 | 4.55e-13 | PASS |
| C10-R2 Low / edge | Cost_Of_Waiting | 0 | 0 | 0 | PASS |
| C10-R2 Low / edge | Fees_Cost | 0 | 0 | 0 | PASS |
| C10-R2 Low / edge | Real_Return | -0.0338 | -0.0338 | -2.78e-17 | PASS |
| C10-R2 Low / edge | Plan_Goal_Amount | 483 | 483 | 0 | PASS |
| C10-R2 Low / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C10-R3 High / edge | Growth_After_Fees | 0.0476 | 0.0476 | 1.39e-17 | PASS |
| C10-R3 High / edge | Grows_To | 3,212,103.9722 | 3,212,103.9722 | 3.73e-09 | PASS |
| C10-R3 High / edge | Value_Today | 1,454,731.1016 | 1,454,731.1016 | -4.66e-10 | PASS |
| C10-R3 High / edge | Value_Start_Later | 2,545,728.8581 | 2,545,728.8581 | -2.79e-09 | PASS |
| C10-R3 High / edge | Headline | 1,454,731.1016 | 1,454,731.1016 | -4.66e-10 | PASS |
| C10-R3 High / edge | Cost_Of_Waiting | 301,794.9021 | 301,794.9021 | 5.24e-10 | PASS |
| C10-R3 High / edge | Fees_Cost | 7,650,156.7762 | 7,650,156.7762 | -3.73e-09 | PASS |
| C10-R3 High / edge | Real_Return | 0.0271 | 0.0271 | -3.47e-18 | PASS |
| C10-R3 High / edge | Plan_Goal_Amount | 1,454,731 | 1454731 | 0 | PASS |
| C10-R3 High / edge | Plan_Goal_Years | 40 | 40 | 0 | PASS |
| C10-R4 Branch / edge | Growth_After_Fees | 0.0348 | 0.0348 | -4.16e-17 | PASS |
| C10-R4 Branch / edge | Grows_To | 11,080.7526 | 11,080.7526 | 1.82e-12 | PASS |
| C10-R4 Branch / edge | Value_Today | 10,214.6565 | 10,214.6565 | 1.82e-12 | PASS |
| C10-R4 Branch / edge | Value_Start_Later | 10000 | 10000 | 0 | PASS |
| C10-R4 Branch / edge | Headline | 11,080.7526 | 11,080.7526 | 1.82e-12 | PASS |
| C10-R4 Branch / edge | Cost_Of_Waiting | 1,080.7526 | 1,080.7526 | 1.59e-12 | PASS |
| C10-R4 Branch / edge | Fees_Cost | 167.8874 | 167.8874 | 2.25e-12 | PASS |
| C10-R4 Branch / edge | Real_Return | 0.0071 | 0.0071 | -3.47e-18 | PASS |
| C10-R4 Branch / edge | Plan_Goal_Amount | 10,215 | 10215 | 0 | PASS |
| C10-R4 Branch / edge | Plan_Goal_Years | 3 | 3 | 0 | PASS |
| C10-R5 Random (seed 1) | Growth_After_Fees | 0.0307 | 0.0307 | 4.16e-17 | PASS |
| C10-R5 Random (seed 1) | Grows_To | 1,392,922.6045 | 1,392,922.6045 | 2.33e-09 | PASS |
| C10-R5 Random (seed 1) | Value_Today | 496,840.9979 | 496,840.9979 | 2.91e-10 | PASS |
| C10-R5 Random (seed 1) | Value_Start_Later | 1,197,269.363 | 1,197,269.363 | -2.10e-09 | PASS |
| C10-R5 Random (seed 1) | Headline | 1,392,922.6045 | 1,392,922.6045 | 2.33e-09 | PASS |
| C10-R5 Random (seed 1) | Cost_Of_Waiting | 195,653.2415 | 195,653.2415 | -6.69e-10 | PASS |
| C10-R5 Random (seed 1) | Fees_Cost | 1,979,434.5649 | 1,979,434.5649 | -2.10e-09 | PASS |
| C10-R5 Random (seed 1) | Real_Return | 0.0031 | 0.0031 | -1.73e-18 | PASS |
| C10-R5 Random (seed 1) | Plan_Goal_Amount | 496,841 | 496841 | 0 | PASS |
| C10-R5 Random (seed 1) | Plan_Goal_Years | 38 | 38 | 0 | PASS |
| C10-R6 Random (seed 2) | Growth_After_Fees | -0.018 | -0.018 | 1.73e-17 | PASS |
| C10-R6 Random (seed 2) | Grows_To | 119,623.9954 | 119,623.9954 | 2.76e-10 | PASS |
| C10-R6 Random (seed 2) | Value_Today | 35,884.4307 | 35,884.4307 | -3.64e-11 | PASS |
| C10-R6 Random (seed 2) | Value_Start_Later | 130,996.8536 | 130,996.8536 | 8.73e-11 | PASS |
| C10-R6 Random (seed 2) | Headline | 119,623.9954 | 119,623.9954 | 2.76e-10 | PASS |
| C10-R6 Random (seed 2) | Cost_Of_Waiting | -11,372.8582 | -11,372.8582 | -1.27e-11 | PASS |
| C10-R6 Random (seed 2) | Fees_Cost | 106,276.0046 | 106,276.0046 | -2.76e-10 | PASS |
| C10-R6 Random (seed 2) | Real_Return | -0.0512 | -0.0512 | -2.78e-17 | PASS |
| C10-R6 Random (seed 2) | Plan_Goal_Amount | 35,884 | 35884 | 0 | PASS |
| C10-R6 Random (seed 2) | Plan_Goal_Years | 35 | 35 | 0 | PASS |
| C10-R7 Edge, 0% inflation | Growth_After_Fees | 0.04 | 0.04 | -3.47e-17 | PASS |
| C10-R7 Edge, 0% inflation | Grows_To | 18,009.4351 | 18,009.4351 | 3.27e-11 | PASS |
| C10-R7 Edge, 0% inflation | Value_Today | 18,009.4351 | 18,009.4351 | 3.27e-11 | PASS |
| C10-R7 Edge, 0% inflation | Value_Start_Later | 14,802.4428 | 14,802.4428 | -4.55e-11 | PASS |
| C10-R7 Edge, 0% inflation | Headline | 18,009.4351 | 18,009.4351 | 3.27e-11 | PASS |
| C10-R7 Edge, 0% inflation | Cost_Of_Waiting | 3,206.9922 | 3,206.9922 | -9.09e-13 | PASS |
| C10-R7 Edge, 0% inflation | Fees_Cost | -0 | 0 | 3.64e-12 | PASS |
| C10-R7 Edge, 0% inflation | Real_Return | 0.04 | 0.04 | -3.47e-17 | PASS |
| C10-R7 Edge, 0% inflation | Plan_Goal_Amount | 18,009 | 18009 | 0 | PASS |
| C10-R7 Edge, 0% inflation | Plan_Goal_Years | 15 | 15 | 0 | PASS |

### C11 Emergency fund: 49/49 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C11-R1 Defaults | Months_Covered | 2.5 | 2.5 | 0 | PASS |
| C11-R1 Defaults | Target | 15000 | 15000 | 0 | PASS |
| C11-R1 Defaults | Still_To_Build | 8750 | 8750 | 0 | PASS |
| C11-R1 Defaults | Plan_Goal_Kind | Safety net (plan kind safety: a reserve, not a spend) | Safety net (plan kind safety: a reserve, not a spend) |  | PASS |
| C11-R1 Defaults | Plan_Goal_Amount | 15,000 | 15000 | 0 | PASS |
| C11-R1 Defaults | Plan_Goal_Saved | 6250 | 6250 | 0 | PASS |
| C11-R1 Defaults | Plan_Goal_Years | 2 | 2 | 0 | PASS |
| C11-R2 Low / edge | Months_Covered | 0 | 0 | 0 | PASS |
| C11-R2 Low / edge | Target | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | Still_To_Build | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | Plan_Goal_Kind | Safety net (plan kind safety: a reserve, not a spend) | Safety net (plan kind safety: a reserve, not a spend) |  | PASS |
| C11-R2 Low / edge | Plan_Goal_Amount | 500 | 500 | 0 | PASS |
| C11-R2 Low / edge | Plan_Goal_Saved | 0 | 0 | 0 | PASS |
| C11-R2 Low / edge | Plan_Goal_Years | 2 | 2 | 0 | PASS |
| C11-R3 High / edge | Months_Covered | 10 | 10 | 0 | PASS |
| C11-R3 High / edge | Target | 120000 | 120000 | 0 | PASS |
| C11-R3 High / edge | Still_To_Build | 20000 | 20000 | 0 | PASS |
| C11-R3 High / edge | Plan_Goal_Kind | Safety net (plan kind safety: a reserve, not a spend) | Safety net (plan kind safety: a reserve, not a spend) |  | PASS |
| C11-R3 High / edge | Plan_Goal_Amount | 120,000 | 120000 | 0 | PASS |
| C11-R3 High / edge | Plan_Goal_Saved | 100000 | 100000 | 0 | PASS |
| C11-R3 High / edge | Plan_Goal_Years | 2 | 2 | 0 | PASS |
| C11-R4 Branch / edge | Months_Covered | 8 | 8 | 0 | PASS |
| C11-R4 Branch / edge | Target | 15000 | 15000 | 0 | PASS |
| C11-R4 Branch / edge | Still_To_Build | 0 | 0 | 0 | PASS |
| C11-R4 Branch / edge | Plan_Goal_Kind | No goal (cushion already in place) | No goal (cushion already in place) |  | PASS |
| C11-R4 Branch / edge | Plan_Goal_Amount | — | — |  | PASS |
| C11-R4 Branch / edge | Plan_Goal_Saved | 20000 | 20000 | 0 | PASS |
| C11-R4 Branch / edge | Plan_Goal_Years | 2 | 2 | 0 | PASS |
| C11-R5 Random (seed 1) | Months_Covered | 11.8939 | 11.8939 | 5.33e-15 | PASS |
| C11-R5 Random (seed 1) | Target | 39600 | 39600 | 0 | PASS |
| C11-R5 Random (seed 1) | Still_To_Build | 0 | 0 | 0 | PASS |
| C11-R5 Random (seed 1) | Plan_Goal_Kind | No goal (cushion already in place) | No goal (cushion already in place) |  | PASS |
| C11-R5 Random (seed 1) | Plan_Goal_Amount | — | — |  | PASS |
| C11-R5 Random (seed 1) | Plan_Goal_Saved | 78500 | 78500 | 0 | PASS |
| C11-R5 Random (seed 1) | Plan_Goal_Years | 2 | 2 | 0 | PASS |
| C11-R6 Random (seed 2) | Months_Covered | 1.25 | 1.25 | 0 | PASS |
| C11-R6 Random (seed 2) | Target | 5000 | 5000 | 0 | PASS |
| C11-R6 Random (seed 2) | Still_To_Build | 0 | 0 | 0 | PASS |
| C11-R6 Random (seed 2) | Plan_Goal_Kind | No goal (cushion already in place) | No goal (cushion already in place) |  | PASS |
| C11-R6 Random (seed 2) | Plan_Goal_Amount | — | — |  | PASS |
| C11-R6 Random (seed 2) | Plan_Goal_Saved | 6250 | 6250 | 0 | PASS |
| C11-R6 Random (seed 2) | Plan_Goal_Years | 2 | 2 | 0 | PASS |
| C11-R7 Edge, 0% inflation | Months_Covered | 6 | 6 | 0 | PASS |
| C11-R7 Edge, 0% inflation | Target | 15000 | 15000 | 0 | PASS |
| C11-R7 Edge, 0% inflation | Still_To_Build | 0 | 0 | 0 | PASS |
| C11-R7 Edge, 0% inflation | Plan_Goal_Kind | No goal (cushion already in place) | No goal (cushion already in place) |  | PASS |
| C11-R7 Edge, 0% inflation | Plan_Goal_Amount | — | — |  | PASS |
| C11-R7 Edge, 0% inflation | Plan_Goal_Saved | 15000 | 15000 | 0 | PASS |
| C11-R7 Edge, 0% inflation | Plan_Goal_Years | 2 | 2 | 0 | PASS |

### C12 Retirement projection: 77/77 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C12-R1 Defaults | Years_To_Retirement | 25 | 25 | 0 | PASS |
| C12-R1 Defaults | Contribution | 500 | 500 | 0 | PASS |
| C12-R1 Defaults | Contributions_Grow_To | 345,447.1075 | 345,447.1075 | 5.82e-10 | PASS |
| C12-R1 Defaults | Projected_Fund | 525,773.1749 | 525,773.1749 | 1.16e-10 | PASS |
| C12-R1 Defaults | Fund_Today | 320,474.981 | 320,474.981 | -1.75e-10 | PASS |
| C12-R1 Defaults | Target_Today | 625000 | 625000 | 0 | PASS |
| C12-R1 Defaults | Gap_Today | 304,525.019 | 304,525.019 | 1.75e-10 | PASS |
| C12-R1 Defaults | Pay_Rise | 0.025 | 0.025 | 0 | PASS |
| C12-R1 Defaults | Plan_Goal_Income | 40000 | 40000 | 0 | PASS |
| C12-R1 Defaults | Plan_Goal_Age | 65 | 65 | 0 | PASS |
| C12-R1 Defaults | [shown] Gap_Today | Gap of €304,525 in today's money | Gap of €304,525 in today's money |  | PASS |
| C12-R2 Low / edge | Years_To_Retirement | 1 | 1 | 0 | PASS |
| C12-R2 Low / edge | Contribution | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Contributions_Grow_To | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Projected_Fund | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Fund_Today | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Target_Today | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Gap_Today | 0 | 0 | 0 | PASS |
| C12-R2 Low / edge | Pay_Rise | 0.03 | 0.03 | 0 | PASS |
| C12-R2 Low / edge | Plan_Goal_Income | 10000 | 10000 | 0 | PASS |
| C12-R2 Low / edge | Plan_Goal_Age | 50 | 50 | 0 | PASS |
| C12-R2 Low / edge | [shown] Gap_Today | On track: no gap | On track: no gap |  | PASS |
| C12-R3 High / edge | Years_To_Retirement | 60 | 60 | 0 | PASS |
| C12-R3 High / edge | Contribution | 6500 | 6500 | 0 | PASS |
| C12-R3 High / edge | Contributions_Grow_To | 92,814,170.9486 | 92,814,170.9486 | 2.83e-07 | PASS |
| C12-R3 High / edge | Projected_Fund | 179,733,811.2004 | 179,733,811.2004 | 6.56e-07 | PASS |
| C12-R3 High / edge | Fund_Today | 54,779,678.337 | 54,779,678.337 | 1.49e-08 | PASS |
| C12-R3 High / edge | Target_Today | 3250000 | 3250000 | 0 | PASS |
| C12-R3 High / edge | Gap_Today | -51,529,678.337 | -51,529,678.337 | -1.49e-08 | PASS |
| C12-R3 High / edge | Pay_Rise | 0.025 | 0.025 | 0 | PASS |
| C12-R3 High / edge | Plan_Goal_Income | 130000 | 130000 | 0 | PASS |
| C12-R3 High / edge | Plan_Goal_Age | 80 | 80 | 0 | PASS |
| C12-R3 High / edge | [shown] Gap_Today | On track: no gap | On track: no gap |  | PASS |
| C12-R4 Branch / edge | Years_To_Retirement | 25 | 25 | 0 | PASS |
| C12-R4 Branch / edge | Contribution | 500 | 500 | 0 | PASS |
| C12-R4 Branch / edge | Contributions_Grow_To | 304,919.116 | 304,919.116 | 4.07e-10 | PASS |
| C12-R4 Branch / edge | Projected_Fund | 430,545.7917 | 430,545.7917 | 6.40e-10 | PASS |
| C12-R4 Branch / edge | Fund_Today | 218,511.1411 | 218,511.1411 | 2.33e-10 | PASS |
| C12-R4 Branch / edge | Target_Today | 625000 | 625000 | 0 | PASS |
| C12-R4 Branch / edge | Gap_Today | 406,488.8589 | 406,488.8589 | -2.33e-10 | PASS |
| C12-R4 Branch / edge | Pay_Rise | 0.03 | 0.03 | 0 | PASS |
| C12-R4 Branch / edge | Plan_Goal_Income | 40000 | 40000 | 0 | PASS |
| C12-R4 Branch / edge | Plan_Goal_Age | 65 | 65 | 0 | PASS |
| C12-R4 Branch / edge | [shown] Gap_Today | Gap of €406,489 in today's money | Gap of €406,489 in today's money |  | PASS |
| C12-R5 Random (seed 1) | Years_To_Retirement | 10 | 10 | 0 | PASS |
| C12-R5 Random (seed 1) | Contribution | 1240 | 1240 | 0 | PASS |
| C12-R5 Random (seed 1) | Contributions_Grow_To | 174,058.7194 | 174,058.7194 | -1.05e-09 | PASS |
| C12-R5 Random (seed 1) | Projected_Fund | 1,348,272.0387 | 1,348,272.0387 | -2.56e-09 | PASS |
| C12-R5 Random (seed 1) | Fund_Today | 1,027,919.7784 | 1,027,919.7784 | -5.59e-09 | PASS |
| C12-R5 Random (seed 1) | Target_Today | 2487500 | 2487500 | 0 | PASS |
| C12-R5 Random (seed 1) | Gap_Today | 1,459,580.2216 | 1,459,580.2216 | 5.59e-09 | PASS |
| C12-R5 Random (seed 1) | Pay_Rise | 0.025 | 0.025 | 0 | PASS |
| C12-R5 Random (seed 1) | Plan_Goal_Income | 110000 | 110000 | 0 | PASS |
| C12-R5 Random (seed 1) | Plan_Goal_Age | 59 | 59 | 0 | PASS |
| C12-R5 Random (seed 1) | [shown] Gap_Today | Gap of €1,459,580 in today's money | Gap of €1,459,580 in today's money |  | PASS |
| C12-R6 Random (seed 2) | Years_To_Retirement | 21 | 21 | 0 | PASS |
| C12-R6 Random (seed 2) | Contribution | 2650 | 2650 | 0 | PASS |
| C12-R6 Random (seed 2) | Contributions_Grow_To | 1,330,745.7206 | 1,330,745.7206 | 2.56e-09 | PASS |
| C12-R6 Random (seed 2) | Projected_Fund | 2,479,244.8273 | 2,479,244.8273 | 5.12e-09 | PASS |
| C12-R6 Random (seed 2) | Fund_Today | 1,203,849.1491 | 1,203,849.1491 | 1.63e-09 | PASS |
| C12-R6 Random (seed 2) | Target_Today | 575000 | 575000 | 0 | PASS |
| C12-R6 Random (seed 2) | Gap_Today | -628,849.1491 | -628,849.1491 | -5.82e-10 | PASS |
| C12-R6 Random (seed 2) | Pay_Rise | 0.03 | 0.03 | 0 | PASS |
| C12-R6 Random (seed 2) | Plan_Goal_Income | 41000 | 41000 | 0 | PASS |
| C12-R6 Random (seed 2) | Plan_Goal_Age | 76 | 76 | 0 | PASS |
| C12-R6 Random (seed 2) | [shown] Gap_Today | On track: no gap | On track: no gap |  | PASS |
| C12-R7 Edge, 0% inflation | Years_To_Retirement | 36 | 36 | 0 | PASS |
| C12-R7 Edge, 0% inflation | Contribution | 400 | 400 | 0 | PASS |
| C12-R7 Edge, 0% inflation | Contributions_Grow_To | 534,847.1162 | 534,847.1162 | 4.89e-09 | PASS |
| C12-R7 Edge, 0% inflation | Projected_Fund | 616,925.7673 | 616,925.7673 | 4.54e-09 | PASS |
| C12-R7 Edge, 0% inflation | Fund_Today | 616,925.7673 | 616,925.7673 | 4.54e-09 | PASS |
| C12-R7 Edge, 0% inflation | Target_Today | 485900 | 485900 | 0 | PASS |
| C12-R7 Edge, 0% inflation | Gap_Today | -131,025.7673 | -131,025.7673 | -4.53e-09 | PASS |
| C12-R7 Edge, 0% inflation | Pay_Rise | 0.025 | 0.025 | 0 | PASS |
| C12-R7 Edge, 0% inflation | Plan_Goal_Income | 35000 | 35000 | 0 | PASS |
| C12-R7 Edge, 0% inflation | Plan_Goal_Age | 66 | 66 | 0 | PASS |
| C12-R7 Edge, 0% inflation | [shown] Gap_Today | On track: no gap | On track: no gap |  | PASS |

### C13 Contribution impact: 35/35 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C13-R1 Defaults | Grows_To | 54,572.4754 | 54,572.4754 | -2.91e-11 | PASS |
| C13-R1 Defaults | Value_Today | 33,263.6084 | 33,263.6084 | 3.64e-11 | PASS |
| C13-R1 Defaults | Net_Cost_Per_Month | 60 | 60 | 0 | PASS |
| C13-R1 Defaults | Plan_Goal_Contribution | 100 | 100 | 0 | PASS |
| C13-R1 Defaults | Extra_Per_Month | 100 | 100 | 0 | PASS |
| C13-R2 Low / edge | Grows_To | 75.3431 | 75.3431 | 9.95e-14 | PASS |
| C13-R2 Low / edge | Value_Today | 72.7953 | 72.7953 | 1.56e-13 | PASS |
| C13-R2 Low / edge | Net_Cost_Per_Month | 5 | 5 | 0 | PASS |
| C13-R2 Low / edge | Plan_Goal_Contribution | 6.25 | 6.25 | 0 | PASS |
| C13-R2 Low / edge | Extra_Per_Month | 6.25 | 6.25 | 0 | PASS |
| C13-R3 High / edge | Grows_To | 7,370,127.8694 | 7,370,127.8694 | 1.02e-08 | PASS |
| C13-R3 High / edge | Value_Today | 3,023,202.8861 | 3,023,202.8861 | 9.78e-09 | PASS |
| C13-R3 High / edge | Net_Cost_Per_Month | 1,250 | 1250 | 0 | PASS |
| C13-R3 High / edge | Plan_Goal_Contribution | 2,083.3333 | 2,083.3333 | -3.64e-12 | PASS |
| C13-R3 High / edge | Extra_Per_Month | 2,083.3333 | 2,083.3333 | -3.64e-12 | PASS |
| C13-R4 Branch / edge | Grows_To | 33,138.9298 | 33,138.9298 | -2.18e-11 | PASS |
| C13-R4 Branch / edge | Value_Today | 23,930.7612 | 23,930.7612 | -4.00e-11 | PASS |
| C13-R4 Branch / edge | Net_Cost_Per_Month | 105 | 105 | 0 | PASS |
| C13-R4 Branch / edge | Plan_Goal_Contribution | 175 | 175 | 0 | PASS |
| C13-R4 Branch / edge | Extra_Per_Month | 175 | 175 | 0 | PASS |
| C13-R5 Random (seed 1) | Grows_To | 92,153.924 | 92,153.924 | 2.91e-11 | PASS |
| C13-R5 Random (seed 1) | Value_Today | 63,033.033 | 63,033.033 | 0 | PASS |
| C13-R5 Random (seed 1) | Net_Cost_Per_Month | 318 | 318 | 0 | PASS |
| C13-R5 Random (seed 1) | Plan_Goal_Contribution | 397.5 | 397.5 | 0 | PASS |
| C13-R5 Random (seed 1) | Extra_Per_Month | 397.5 | 397.5 | 0 | PASS |
| C13-R6 Random (seed 2) | Grows_To | 27,743.3598 | 27,743.3598 | -1.46e-11 | PASS |
| C13-R6 Random (seed 2) | Value_Today | 12,150.4023 | 12,150.4023 | 4.73e-11 | PASS |
| C13-R6 Random (seed 2) | Net_Cost_Per_Month | 39.75 | 39.75 | 0 | PASS |
| C13-R6 Random (seed 2) | Plan_Goal_Contribution | 66.25 | 66.25 | 0 | PASS |
| C13-R6 Random (seed 2) | Extra_Per_Month | 66.25 | 66.25 | 0 | PASS |
| C13-R7 Edge, 0% inflation | Grows_To | 54,572.4754 | 54,572.4754 | -2.91e-11 | PASS |
| C13-R7 Edge, 0% inflation | Value_Today | 54,572.4754 | 54,572.4754 | -2.91e-11 | PASS |
| C13-R7 Edge, 0% inflation | Net_Cost_Per_Month | 60 | 60 | 0 | PASS |
| C13-R7 Edge, 0% inflation | Plan_Goal_Contribution | 100 | 100 | 0 | PASS |
| C13-R7 Edge, 0% inflation | Extra_Per_Month | 100 | 100 | 0 | PASS |

### C14 AVC impact: 42/42 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C14-R1 Defaults | Grows_To | 50,902.3648 | 50,902.3648 | 2.18e-11 | PASS |
| C14-R1 Defaults | Value_Today | 37,821.2068 | 37,821.2068 | -5.82e-11 | PASS |
| C14-R1 Defaults | Net_Cost_Per_Month | 120 | 120 | 0 | PASS |
| C14-R1 Defaults | Plan_Goal_Contribution | 200 | 200 | 0 | PASS |
| C14-R1 Defaults | Paid_In | 36000 | 36000 | 0 | PASS |
| C14-R1 Defaults | Net_Cost | 21,600 | 21600 | 0 | PASS |
| C14-R2 Low / edge | Grows_To | 301.3725 | 301.3725 | 7.96e-13 | PASS |
| C14-R2 Low / edge | Value_Today | 291.1812 | 291.1812 | 6.25e-13 | PASS |
| C14-R2 Low / edge | Net_Cost_Per_Month | 20 | 20 | 0 | PASS |
| C14-R2 Low / edge | Plan_Goal_Contribution | 25 | 25 | 0 | PASS |
| C14-R2 Low / edge | Paid_In | 300 | 300 | 0 | PASS |
| C14-R2 Low / edge | Net_Cost | 240 | 240 | 0 | PASS |
| C14-R3 High / edge | Grows_To | 4,943,084.0142 | 4,943,084.0142 | -2.79e-09 | PASS |
| C14-R3 High / edge | Value_Today | 2,238,675.3715 | 2,238,675.3715 | -2.79e-09 | PASS |
| C14-R3 High / edge | Net_Cost_Per_Month | 1,200 | 1200 | 0 | PASS |
| C14-R3 High / edge | Plan_Goal_Contribution | 2000 | 2000 | 0 | PASS |
| C14-R3 High / edge | Paid_In | 960000 | 960000 | 0 | PASS |
| C14-R3 High / edge | Net_Cost | 576,000 | 576000 | 0 | PASS |
| C14-R4 Branch / edge | Grows_To | 95,441.934 | 95,441.934 | -2.91e-11 | PASS |
| C14-R4 Branch / edge | Value_Today | 63,534.8155 | 63,534.8155 | 2.18e-11 | PASS |
| C14-R4 Branch / edge | Net_Cost_Per_Month | 300 | 300 | 0 | PASS |
| C14-R4 Branch / edge | Plan_Goal_Contribution | 375 | 375 | 0 | PASS |
| C14-R4 Branch / edge | Paid_In | 67500 | 67500 | 0 | PASS |
| C14-R4 Branch / edge | Net_Cost | 54,000 | 54000 | 0 | PASS |
| C14-R5 Random (seed 1) | Grows_To | 162,426.1459 | 162,426.1459 | 2.91e-11 | PASS |
| C14-R5 Random (seed 1) | Value_Today | 80,228.4395 | 80,228.4395 | 0 | PASS |
| C14-R5 Random (seed 1) | Net_Cost_Per_Month | 240 | 240 | 0 | PASS |
| C14-R5 Random (seed 1) | Plan_Goal_Contribution | 300 | 300 | 0 | PASS |
| C14-R5 Random (seed 1) | Paid_In | 93600 | 93600 | 0 | PASS |
| C14-R5 Random (seed 1) | Net_Cost | 74,880 | 74880 | 0 | PASS |
| C14-R6 Random (seed 2) | Grows_To | 1,762,092.7042 | 1,762,092.7042 | 1.86e-09 | PASS |
| C14-R6 Random (seed 2) | Value_Today | 528,587.0394 | 528,587.0394 | 5.82e-10 | PASS |
| C14-R6 Random (seed 2) | Net_Cost_Per_Month | 920 | 920 | 0 | PASS |
| C14-R6 Random (seed 2) | Plan_Goal_Contribution | 1150 | 1150 | 0 | PASS |
| C14-R6 Random (seed 2) | Paid_In | 483000 | 483000 | 0 | PASS |
| C14-R6 Random (seed 2) | Net_Cost | 386,400 | 386400 | 0 | PASS |
| C14-R7 Edge, 0% inflation | Grows_To | 50,902.3648 | 50,902.3648 | 2.18e-11 | PASS |
| C14-R7 Edge, 0% inflation | Value_Today | 50,902.3648 | 50,902.3648 | 2.18e-11 | PASS |
| C14-R7 Edge, 0% inflation | Net_Cost_Per_Month | 120 | 120 | 0 | PASS |
| C14-R7 Edge, 0% inflation | Plan_Goal_Contribution | 200 | 200 | 0 | PASS |
| C14-R7 Edge, 0% inflation | Paid_In | 36000 | 36000 | 0 | PASS |
| C14-R7 Edge, 0% inflation | Net_Cost | 21,600 | 21600 | 0 | PASS |

### C15 Will my money last: 21/21 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C15-R1 Defaults | Years_Lasting | 18 | 18 | 0 | PASS |
| C15-R1 Defaults | Withdrawal_Rate | 0.06 | 0.06 | 0 | PASS |
| C15-R1 Defaults | [shown] Years_Lasting | 18 years | 18 years |  | PASS |
| C15-R2 Low / edge | Years_Lasting | 60 | 60 | 0 | PASS |
| C15-R2 Low / edge | Withdrawal_Rate | 0.0003 | 0.0003 | -3.25e-19 | PASS |
| C15-R2 Low / edge | [shown] Years_Lasting | 60+ years | 60+ years |  | PASS |
| C15-R3 High / edge | Years_Lasting | 0 | 0 | 0 | PASS |
| C15-R3 High / edge | Withdrawal_Rate | 20 | 20 | 0 | PASS |
| C15-R3 High / edge | [shown] Years_Lasting | 0 years | 0 years |  | PASS |
| C15-R4 Branch / edge | Years_Lasting | 29 | 29 | 0 | PASS |
| C15-R4 Branch / edge | Withdrawal_Rate | 0.04 | 0.04 | 0 | PASS |
| C15-R4 Branch / edge | [shown] Years_Lasting | 29 years | 29 years |  | PASS |
| C15-R5 Random (seed 1) | Years_Lasting | 56 | 56 | 0 | PASS |
| C15-R5 Random (seed 1) | Withdrawal_Rate | 0.0214 | 0.0214 | -1.04e-17 | PASS |
| C15-R5 Random (seed 1) | [shown] Years_Lasting | 56 years | 56 years |  | PASS |
| C15-R6 Random (seed 2) | Years_Lasting | 9 | 9 | 0 | PASS |
| C15-R6 Random (seed 2) | Withdrawal_Rate | 0.1125 | 0.1125 | 0 | PASS |
| C15-R6 Random (seed 2) | [shown] Years_Lasting | 9 years | 9 years |  | PASS |
| C15-R7 Edge, 0% inflation | Years_Lasting | 2 | 2 | 0 | PASS |
| C15-R7 Edge, 0% inflation | Withdrawal_Rate | 0.5 | 0.5 | 0 | PASS |
| C15-R7 Edge, 0% inflation | [shown] Years_Lasting | 2 years | 2 years |  | PASS |

### C16 Drawdown scenarios: 42/42 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C16-R1 Defaults | Years_Cautious | 20 | 20 | 0 | PASS |
| C16-R1 Defaults | [shown] Years_Cautious | 20 years | 20 years |  | PASS |
| C16-R1 Defaults | Years_Balanced | 25 | 25 | 0 | PASS |
| C16-R1 Defaults | [shown] Years_Balanced | 25 years | 25 years |  | PASS |
| C16-R1 Defaults | Years_Growth | 36 | 36 | 0 | PASS |
| C16-R1 Defaults | [shown] Years_Growth | 36 years | 36 years |  | PASS |
| C16-R2 Low / edge | Years_Cautious | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | [shown] Years_Cautious | 60+ years | 60+ years |  | PASS |
| C16-R2 Low / edge | Years_Balanced | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | [shown] Years_Balanced | 60+ years | 60+ years |  | PASS |
| C16-R2 Low / edge | Years_Growth | 60 | 60 | 0 | PASS |
| C16-R2 Low / edge | [shown] Years_Growth | 60+ years | 60+ years |  | PASS |
| C16-R3 High / edge | Years_Cautious | 0 | 0 | 0 | PASS |
| C16-R3 High / edge | [shown] Years_Cautious | 0 years | 0 years |  | PASS |
| C16-R3 High / edge | Years_Balanced | 0 | 0 | 0 | PASS |
| C16-R3 High / edge | [shown] Years_Balanced | 0 years | 0 years |  | PASS |
| C16-R3 High / edge | Years_Growth | 0 | 0 | 0 | PASS |
| C16-R3 High / edge | [shown] Years_Growth | 0 years | 0 years |  | PASS |
| C16-R4 Branch / edge | Years_Cautious | 24 | 24 | 0 | PASS |
| C16-R4 Branch / edge | [shown] Years_Cautious | 24 years | 24 years |  | PASS |
| C16-R4 Branch / edge | Years_Balanced | 31 | 31 | 0 | PASS |
| C16-R4 Branch / edge | [shown] Years_Balanced | 31 years | 31 years |  | PASS |
| C16-R4 Branch / edge | Years_Growth | 54 | 54 | 0 | PASS |
| C16-R4 Branch / edge | [shown] Years_Growth | 54 years | 54 years |  | PASS |
| C16-R5 Random (seed 1) | Years_Cautious | 9 | 9 | 0 | PASS |
| C16-R5 Random (seed 1) | [shown] Years_Cautious | 9 years | 9 years |  | PASS |
| C16-R5 Random (seed 1) | Years_Balanced | 10 | 10 | 0 | PASS |
| C16-R5 Random (seed 1) | [shown] Years_Balanced | 10 years | 10 years |  | PASS |
| C16-R5 Random (seed 1) | Years_Growth | 11 | 11 | 0 | PASS |
| C16-R5 Random (seed 1) | [shown] Years_Growth | 11 years | 11 years |  | PASS |
| C16-R6 Random (seed 2) | Years_Cautious | 28 | 28 | 0 | PASS |
| C16-R6 Random (seed 2) | [shown] Years_Cautious | 28 years | 28 years |  | PASS |
| C16-R6 Random (seed 2) | Years_Balanced | 38 | 38 | 0 | PASS |
| C16-R6 Random (seed 2) | [shown] Years_Balanced | 38 years | 38 years |  | PASS |
| C16-R6 Random (seed 2) | Years_Growth | 60 | 60 | 0 | PASS |
| C16-R6 Random (seed 2) | [shown] Years_Growth | 60+ years | 60+ years |  | PASS |
| C16-R7 Edge, 0% inflation | Years_Cautious | 25 | 25 | 0 | PASS |
| C16-R7 Edge, 0% inflation | [shown] Years_Cautious | 25 years | 25 years |  | PASS |
| C16-R7 Edge, 0% inflation | Years_Balanced | 37 | 37 | 0 | PASS |
| C16-R7 Edge, 0% inflation | [shown] Years_Balanced | 37 years | 37 years |  | PASS |
| C16-R7 Edge, 0% inflation | Years_Growth | 60 | 60 | 0 | PASS |
| C16-R7 Edge, 0% inflation | [shown] Years_Growth | 60+ years | 60+ years |  | PASS |

### C17 Inflation adjusted return: 21/21 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C17-R1 Defaults | Future_Value | 41,578.5636 | 41,578.5636 | 2.18e-11 | PASS |
| C17-R1 Defaults | Value_Today | 30,893.4852 | 30,893.4852 | -2.91e-11 | PASS |
| C17-R1 Defaults | Real_Return | 0.0294 | 0.0294 | 3.12e-17 | PASS |
| C17-R2 Low / edge | Future_Value | 500 | 500 | 0 | PASS |
| C17-R2 Low / edge | Value_Today | 483.0918 | 483.0918 | 4.55e-13 | PASS |
| C17-R2 Low / edge | Real_Return | -0.0338 | -0.0338 | -2.78e-17 | PASS |
| C17-R3 High / edge | Future_Value | 22,629,627.7841 | 22,629,627.7841 | 5.22e-08 | PASS |
| C17-R3 High / edge | Value_Today | 10,248,741.5226 | 10,248,741.5226 | 1.12e-08 | PASS |
| C17-R3 High / edge | Real_Return | 0.0784 | 0.0784 | 2.78e-17 | PASS |
| C17-R4 Branch / edge | Future_Value | 31,159.3483 | 31,159.3483 | -3.64e-12 | PASS |
| C17-R4 Branch / edge | Value_Today | 20,742.4909 | 20,742.4909 | 7.28e-12 | PASS |
| C17-R4 Branch / edge | Real_Return | 0.0024 | 0.0024 | 3.90e-18 | PASS |
| C17-R5 Random (seed 1) | Future_Value | 706,104.7696 | 706,104.7696 | 1.16e-10 | PASS |
| C17-R5 Random (seed 1) | Value_Today | 583,977.7914 | 583,977.7914 | 4.66e-10 | PASS |
| C17-R5 Random (seed 1) | Real_Return | 0.0316 | 0.0316 | 2.78e-17 | PASS |
| C17-R6 Random (seed 2) | Future_Value | 314,674.2152 | 314,674.2152 | -1.16e-10 | PASS |
| C17-R6 Random (seed 2) | Value_Today | 194,400 | 194400 | -2.91e-11 | PASS |
| C17-R6 Random (seed 2) | Real_Return | 0 | 0 | 0 | PASS |
| C17-R7 Edge, 0% inflation | Future_Value | 41,578.5636 | 41,578.5636 | 2.18e-11 | PASS |
| C17-R7 Edge, 0% inflation | Value_Today | 41,578.5636 | 41,578.5636 | 2.18e-11 | PASS |
| C17-R7 Edge, 0% inflation | Real_Return | 0.05 | 0.05 | -4.16e-17 | PASS |

### C18 Regular investing: 70/70 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C18-R1 Defaults | Value_After_Fees | 73,108.7854 | 73,108.7854 | 3.93e-10 | PASS |
| C18-R1 Defaults | Value_Before_Fees | 79,447.3784 | 79,447.3784 | 0 | PASS |
| C18-R1 Defaults | Fees_Cost | 6,338.5929 | 6,338.5929 | -4.37e-10 | PASS |
| C18-R1 Defaults | Paid_In | 54000 | 54000 | 0 | PASS |
| C18-R1 Defaults | Value_Today | 54,320.9045 | 54,320.9045 | 2.98e-10 | PASS |
| C18-R1 Defaults | Growth_After_Fees | 0.0395 | 0.0395 | 6.94e-18 | PASS |
| C18-R1 Defaults | Real_Return | 0.0191 | 0.0191 | 1.73e-17 | PASS |
| C18-R1 Defaults | Headline | 73,108.7854 | 73,108.7854 | 3.93e-10 | PASS |
| C18-R1 Defaults | Plan_Goal_Amount | 54,321 | 54321 | 0 | PASS |
| C18-R1 Defaults | Plan_Goal_Years | 15 | 15 | 0 | PASS |
| C18-R2 Low / edge | Value_After_Fees | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | Value_Before_Fees | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | Fees_Cost | 0 | 0 | 0 | PASS |
| C18-R2 Low / edge | Paid_In | 300 | 300 | 0 | PASS |
| C18-R2 Low / edge | Value_Today | 289.8551 | 289.8551 | -1.14e-13 | PASS |
| C18-R2 Low / edge | Growth_After_Fees | 0 | 0 | 0 | PASS |
| C18-R2 Low / edge | Real_Return | -0.0338 | -0.0338 | -2.78e-17 | PASS |
| C18-R2 Low / edge | Headline | 289.8551 | 289.8551 | -1.14e-13 | PASS |
| C18-R2 Low / edge | Plan_Goal_Amount | 290 | 290 | 0 | PASS |
| C18-R2 Low / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C18-R3 High / edge | Value_After_Fees | 6,985,150.2488 | 6,985,150.2488 | -5.96e-08 | PASS |
| C18-R3 High / edge | Value_Before_Fees | 16,105,396.7284 | 16,105,396.7284 | -1.68e-08 | PASS |
| C18-R3 High / edge | Fees_Cost | 9,120,246.4796 | 9,120,246.4796 | 6.33e-08 | PASS |
| C18-R3 High / edge | Paid_In | 2400000 | 2400000 | 0 | PASS |
| C18-R3 High / edge | Value_Today | 3,163,507.5963 | 3,163,507.5963 | -2.42e-08 | PASS |
| C18-R3 High / edge | Growth_After_Fees | 0.0476 | 0.0476 | 1.39e-17 | PASS |
| C18-R3 High / edge | Real_Return | 0.0271 | 0.0271 | -3.47e-18 | PASS |
| C18-R3 High / edge | Headline | 3,163,507.5963 | 3,163,507.5963 | -2.42e-08 | PASS |
| C18-R3 High / edge | Plan_Goal_Amount | 3,163,508 | 3163508 | 0 | PASS |
| C18-R3 High / edge | Plan_Goal_Years | 40 | 40 | 0 | PASS |
| C18-R4 Branch / edge | Value_After_Fees | 43,401.3938 | 43,401.3938 | -7.28e-12 | PASS |
| C18-R4 Branch / edge | Value_Before_Fees | 54000 | 54000 | 0 | PASS |
| C18-R4 Branch / edge | Fees_Cost | 10,598.6062 | 10,598.6062 | 5.46e-12 | PASS |
| C18-R4 Branch / edge | Paid_In | 54000 | 54000 | 0 | PASS |
| C18-R4 Branch / edge | Value_Today | 28,891.9077 | 28,891.9077 | 0 | PASS |
| C18-R4 Branch / edge | Growth_After_Fees | -0.03 | -0.03 | 2.78e-17 | PASS |
| C18-R4 Branch / edge | Real_Return | -0.056 | -0.056 | -4.16e-17 | PASS |
| C18-R4 Branch / edge | Headline | 43,401.3938 | 43,401.3938 | -7.28e-12 | PASS |
| C18-R4 Branch / edge | Plan_Goal_Amount | 28,892 | 28892 | 0 | PASS |
| C18-R4 Branch / edge | Plan_Goal_Years | 15 | 15 | 0 | PASS |
| C18-R5 Random (seed 1) | Value_After_Fees | 79,967.6218 | 79,967.6218 | -5.82e-11 | PASS |
| C18-R5 Random (seed 1) | Value_Before_Fees | 83,501.6834 | 83,501.6834 | 2.91e-11 | PASS |
| C18-R5 Random (seed 1) | Fees_Cost | 3,534.0616 | 3,534.0616 | 2.68e-11 | PASS |
| C18-R5 Random (seed 1) | Paid_In | 78000 | 78000 | 0 | PASS |
| C18-R5 Random (seed 1) | Value_Today | 71,744.2101 | 71,744.2101 | 2.91e-11 | PASS |
| C18-R5 Random (seed 1) | Growth_After_Fees | 0.0127 | 0.0127 | -1.21e-17 | PASS |
| C18-R5 Random (seed 1) | Real_Return | -0.0144 | -0.0144 | -3.82e-17 | PASS |
| C18-R5 Random (seed 1) | Headline | 71,744.2101 | 71,744.2101 | 2.91e-11 | PASS |
| C18-R5 Random (seed 1) | Plan_Goal_Amount | 71,744 | 71744 | 0 | PASS |
| C18-R5 Random (seed 1) | Plan_Goal_Years | 4 | 4 | 0 | PASS |
| C18-R6 Random (seed 2) | Value_After_Fees | 1,891,260.1136 | 1,891,260.1136 | -1.68e-08 | PASS |
| C18-R6 Random (seed 2) | Value_Before_Fees | 2,258,200.3828 | 2,258,200.3828 | -4.66e-10 | PASS |
| C18-R6 Random (seed 2) | Fees_Cost | 366,940.2692 | 366,940.2692 | 1.44e-08 | PASS |
| C18-R6 Random (seed 2) | Paid_In | 1054500 | 1054500 | 0 | PASS |
| C18-R6 Random (seed 2) | Value_Today | 983,749.7101 | 983,749.7101 | -7.92e-09 | PASS |
| C18-R6 Random (seed 2) | Growth_After_Fees | 0.0583 | 0.0583 | -2.78e-17 | PASS |
| C18-R6 Random (seed 2) | Real_Return | 0.0225 | 0.0225 | 4.86e-17 | PASS |
| C18-R6 Random (seed 2) | Headline | 1,891,260.1136 | 1,891,260.1136 | -1.68e-08 | PASS |
| C18-R6 Random (seed 2) | Plan_Goal_Amount | 983,750 | 983750 | 0 | PASS |
| C18-R6 Random (seed 2) | Plan_Goal_Years | 19 | 19 | 0 | PASS |
| C18-R7 Edge, 0% inflation | Value_After_Fees | 73,108.7854 | 73,108.7854 | 3.93e-10 | PASS |
| C18-R7 Edge, 0% inflation | Value_Before_Fees | 79,447.3784 | 79,447.3784 | 0 | PASS |
| C18-R7 Edge, 0% inflation | Fees_Cost | 6,338.5929 | 6,338.5929 | -4.37e-10 | PASS |
| C18-R7 Edge, 0% inflation | Paid_In | 54000 | 54000 | 0 | PASS |
| C18-R7 Edge, 0% inflation | Value_Today | 73,108.7854 | 73,108.7854 | 3.93e-10 | PASS |
| C18-R7 Edge, 0% inflation | Growth_After_Fees | 0.0395 | 0.0395 | 6.94e-18 | PASS |
| C18-R7 Edge, 0% inflation | Real_Return | 0.0395 | 0.0395 | 6.94e-18 | PASS |
| C18-R7 Edge, 0% inflation | Headline | 73,108.7854 | 73,108.7854 | 3.93e-10 | PASS |
| C18-R7 Edge, 0% inflation | Plan_Goal_Amount | 73,109 | 73109 | 0 | PASS |
| C18-R7 Edge, 0% inflation | Plan_Goal_Years | 15 | 15 | 0 | PASS |

### C19 Fees impact: 28/28 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C19-R1 Defaults | Value_With_Fee_A | 120,010.0456 | 120,010.0456 | 1.31e-10 | PASS |
| C19-R1 Defaults | Value_With_Fee_B | 98,057.4501 | 98,057.4501 | 7.28e-11 | PASS |
| C19-R1 Defaults | Difference | 21,952.5954 | 21,952.5954 | 7.28e-11 | PASS |
| C19-R1 Defaults | Fee_Gap | 0.01 | 0.01 | 1.73e-18 | PASS |
| C19-R2 Low / edge | Value_With_Fee_A | 1000 | 1000 | 0 | PASS |
| C19-R2 Low / edge | Value_With_Fee_B | 1000 | 1000 | 0 | PASS |
| C19-R2 Low / edge | Difference | 0 | 0 | 0 | PASS |
| C19-R2 Low / edge | Fee_Gap | 0 | 0 | 0 | PASS |
| C19-R3 High / edge | Value_With_Fee_A | 6,424,207.9445 | 6,424,207.9445 | 7.45e-09 | PASS |
| C19-R3 High / edge | Value_With_Fee_B | 21,724,521.4968 | 21,724,521.4968 | -3.73e-09 | PASS |
| C19-R3 High / edge | Difference | 15,300,313.5523 | 15,300,313.5523 | 2.79e-08 | PASS |
| C19-R3 High / edge | Fee_Gap | 0.03 | 0.03 | 0 | PASS |
| C19-R4 Branch / edge | Value_With_Fee_A | 104,206.5163 | 104,206.5163 | -3.06e-10 | PASS |
| C19-R4 Branch / edge | Value_With_Fee_B | 115,276.5461 | 115,276.5461 | 3.78e-10 | PASS |
| C19-R4 Branch / edge | Difference | 11,070.0297 | 11,070.0297 | -5.46e-12 | PASS |
| C19-R4 Branch / edge | Fee_Gap | 0.005 | 0.005 | 0 | PASS |
| C19-R5 Random (seed 1) | Value_With_Fee_A | 3,117,773.1412 | 3,117,773.1412 | -9.31e-10 | PASS |
| C19-R5 Random (seed 1) | Value_With_Fee_B | 4,145,252.8426 | 4,145,252.8426 | -1.40e-09 | PASS |
| C19-R5 Random (seed 1) | Difference | 1,027,479.7014 | 1,027,479.7014 | -8.15e-10 | PASS |
| C19-R5 Random (seed 1) | Fee_Gap | 0.01 | 0.01 | 1.73e-18 | PASS |
| C19-R6 Random (seed 2) | Value_With_Fee_A | 498,171.648 | 498,171.648 | -5.82e-11 | PASS |
| C19-R6 Random (seed 2) | Value_With_Fee_B | 498,171.648 | 498,171.648 | -5.82e-11 | PASS |
| C19-R6 Random (seed 2) | Difference | 0 | 0 | 0 | PASS |
| C19-R6 Random (seed 2) | Fee_Gap | 0 | 0 | 0 | PASS |
| C19-R7 Edge, 0% inflation | Value_With_Fee_A | 120,010.0456 | 120,010.0456 | 1.31e-10 | PASS |
| C19-R7 Edge, 0% inflation | Value_With_Fee_B | 98,057.4501 | 98,057.4501 | 7.28e-11 | PASS |
| C19-R7 Edge, 0% inflation | Difference | 21,952.5954 | 21,952.5954 | 7.28e-11 | PASS |
| C19-R7 Edge, 0% inflation | Fee_Gap | 0.01 | 0.01 | 1.73e-18 | PASS |

### C20 Risk and return: 63/63 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C20-R1 Defaults | Style_Name | Balanced | Balanced |  | PASS |
| C20-R1 Defaults | Middle_Growth | 0.04 | 0.04 | 0 | PASS |
| C20-R1 Defaults | Volatility | 0.1 | 0.1 | 0 | PASS |
| C20-R1 Defaults | Spread | 0.0316 | 0.0316 | 6.94e-18 | PASS |
| C20-R1 Defaults | Middle | 29,604.8857 | 29,604.8857 | 1.09e-11 | PASS |
| C20-R1 Defaults | Weaker | 21,740.0366 | 21,740.0366 | -1.46e-11 | PASS |
| C20-R1 Defaults | Stronger | 39,943.7976 | 39,943.7976 | 4.37e-11 | PASS |
| C20-R1 Defaults | Difficult_Year_Fall | 0.16 | 0.16 | 0 | PASS |
| C20-R1 Defaults | [shown] Middle | Balanced · middle outcome | Balanced · middle outcome |  | PASS |
| C20-R2 Low / edge | Style_Name | Cautious | Cautious |  | PASS |
| C20-R2 Low / edge | Middle_Growth | 0.02 | 0.02 | 0 | PASS |
| C20-R2 Low / edge | Volatility | 0.05 | 0.05 | 0 | PASS |
| C20-R2 Low / edge | Spread | 0.05 | 0.05 | 0 | PASS |
| C20-R2 Low / edge | Middle | 1,020 | 1020 | 0 | PASS |
| C20-R2 Low / edge | Weaker | 970 | 970 | 0 | PASS |
| C20-R2 Low / edge | Stronger | 1,070 | 1070 | 0 | PASS |
| C20-R2 Low / edge | Difficult_Year_Fall | 0.08 | 0.08 | 0 | PASS |
| C20-R2 Low / edge | [shown] Middle | Cautious · middle outcome | Cautious · middle outcome |  | PASS |
| C20-R3 High / edge | Style_Name | Growth | Growth |  | PASS |
| C20-R3 High / edge | Middle_Growth | 0.06 | 0.06 | 0 | PASS |
| C20-R3 High / edge | Volatility | 0.16 | 0.16 | 0 | PASS |
| C20-R3 High / edge | Spread | 0.0292 | 0.0292 | 4.16e-17 | PASS |
| C20-R3 High / edge | Middle | 5,743,491.1729 | 5,743,491.1729 | 9.31e-10 | PASS |
| C20-R3 High / edge | Weaker | 2,483,603.525 | 2,483,603.525 | -1.40e-09 | PASS |
| C20-R3 High / edge | Stronger | 12,982,877.6128 | 12,982,877.6128 | 4.10e-08 | PASS |
| C20-R3 High / edge | Difficult_Year_Fall | 0.26 | 0.26 | 0 | PASS |
| C20-R3 High / edge | [shown] Middle | Growth · middle outcome | Growth · middle outcome |  | PASS |
| C20-R4 Branch / edge | Style_Name | Growth | Growth |  | PASS |
| C20-R4 Branch / edge | Middle_Growth | 0.06 | 0.06 | 0 | PASS |
| C20-R4 Branch / edge | Volatility | 0.16 | 0.16 | 0 | PASS |
| C20-R4 Branch / edge | Spread | 0.16 | 0.16 | 0 | PASS |
| C20-R4 Branch / edge | Middle | 21,200 | 21200 | 0 | PASS |
| C20-R4 Branch / edge | Weaker | 18,000 | 18000 | 0 | PASS |
| C20-R4 Branch / edge | Stronger | 24,400 | 24400 | 0 | PASS |
| C20-R4 Branch / edge | Difficult_Year_Fall | 0.26 | 0.26 | 0 | PASS |
| C20-R4 Branch / edge | [shown] Middle | Growth · middle outcome | Growth · middle outcome |  | PASS |
| C20-R5 Random (seed 1) | Style_Name | Cautious | Cautious |  | PASS |
| C20-R5 Random (seed 1) | Middle_Growth | 0.02 | 0.02 | 0 | PASS |
| C20-R5 Random (seed 1) | Volatility | 0.05 | 0.05 | 0 | PASS |
| C20-R5 Random (seed 1) | Spread | 0.0098 | 0.0098 | -1.73e-18 | PASS |
| C20-R5 Random (seed 1) | Middle | 1,284,348.4028 | 1,284,348.4028 | -4.42e-09 | PASS |
| C20-R5 Random (seed 1) | Weaker | 999,090.7697 | 999,090.7697 | 4.66e-10 | PASS |
| C20-R5 Random (seed 1) | Stronger | 1,647,089.237 | 1,647,089.237 | -2.79e-09 | PASS |
| C20-R5 Random (seed 1) | Difficult_Year_Fall | 0.08 | 0.08 | 0 | PASS |
| C20-R5 Random (seed 1) | [shown] Middle | Cautious · middle outcome | Cautious · middle outcome |  | PASS |
| C20-R6 Random (seed 2) | Style_Name | Balanced | Balanced |  | PASS |
| C20-R6 Random (seed 2) | Middle_Growth | 0.04 | 0.04 | 0 | PASS |
| C20-R6 Random (seed 2) | Volatility | 0.1 | 0.1 | 0 | PASS |
| C20-R6 Random (seed 2) | Spread | 0.0229 | 0.0229 | 2.43e-17 | PASS |
| C20-R6 Random (seed 2) | Middle | 888,247.6126 | 888,247.6126 | 1.16e-10 | PASS |
| C20-R6 Random (seed 2) | Weaker | 581,396.9484 | 581,396.9484 | 2.33e-10 | PASS |
| C20-R6 Random (seed 2) | Stronger | 1,344,556.56 | 1,344,556.56 | -1.63e-09 | PASS |
| C20-R6 Random (seed 2) | Difficult_Year_Fall | 0.16 | 0.16 | 0 | PASS |
| C20-R6 Random (seed 2) | [shown] Middle | Balanced · middle outcome | Balanced · middle outcome |  | PASS |
| C20-R7 Edge, 0% inflation | Style_Name | Cautious | Cautious |  | PASS |
| C20-R7 Edge, 0% inflation | Middle_Growth | 0.02 | 0.02 | 0 | PASS |
| C20-R7 Edge, 0% inflation | Volatility | 0.05 | 0.05 | 0 | PASS |
| C20-R7 Edge, 0% inflation | Spread | 0.01 | 0.01 | 0 | PASS |
| C20-R7 Edge, 0% inflation | Middle | 32,812.1199 | 32,812.1199 | -1.46e-11 | PASS |
| C20-R7 Edge, 0% inflation | Weaker | 25,648.6399 | 25,648.6399 | 2.55e-11 | PASS |
| C20-R7 Edge, 0% inflation | Stronger | 41,875.5586 | 41,875.5586 | -2.18e-11 | PASS |
| C20-R7 Edge, 0% inflation | Difficult_Year_Fall | 0.08 | 0.08 | 0 | PASS |
| C20-R7 Edge, 0% inflation | [shown] Middle | Cautious · middle outcome | Cautious · middle outcome |  | PASS |

### C21 Life cover: 42/42 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C21-R1 Defaults | Income_Need | 337,590 | 337590 | 0 | PASS |
| C21-R1 Defaults | Debts_To_Clear | 10000 | 10000 | 0 | PASS |
| C21-R1 Defaults | Already_Have | 120000 | 120000 | 0 | PASS |
| C21-R1 Defaults | Cover_Gap | 227,590 | 227590 | 0 | PASS |
| C21-R1 Defaults | Income_Replacement | 540,000 | 540000 | 0 | PASS |
| C21-R1 Defaults | Plan_Goal_Need | 227,590 | 227590 | 0 | PASS |
| C21-R2 Low / edge | Income_Need | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Debts_To_Clear | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Already_Have | 3000000 | 3000000 | 0 | PASS |
| C21-R2 Low / edge | Cover_Gap | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Income_Replacement | 0 | 0 | 0 | PASS |
| C21-R2 Low / edge | Plan_Goal_Need | 0 | 0 | 0 | PASS |
| C21-R3 High / edge | Income_Need | 4,995,180 | 4995180 | 0 | PASS |
| C21-R3 High / edge | Debts_To_Clear | 1200000 | 1200000 | 0 | PASS |
| C21-R3 High / edge | Already_Have | 0 | 0 | 0 | PASS |
| C21-R3 High / edge | Cover_Gap | 6,195,180 | 6195180 | 0 | PASS |
| C21-R3 High / edge | Income_Replacement | 5,400,000 | 5400000 | 0 | PASS |
| C21-R3 High / edge | Plan_Goal_Need | 6,195,180 | 6195180 | 0 | PASS |
| C21-R4 Branch / edge | Income_Need | 337,590 | 337590 | 0 | PASS |
| C21-R4 Branch / edge | Debts_To_Clear | 260000 | 260000 | 0 | PASS |
| C21-R4 Branch / edge | Already_Have | 120000 | 120000 | 0 | PASS |
| C21-R4 Branch / edge | Cover_Gap | 477,590 | 477590 | 0 | PASS |
| C21-R4 Branch / edge | Income_Replacement | 540,000 | 540000 | 0 | PASS |
| C21-R4 Branch / edge | Plan_Goal_Need | 477,590 | 477590 | 0 | PASS |
| C21-R5 Random (seed 1) | Income_Need | 2,783,628 | 2783628 | 0 | PASS |
| C21-R5 Random (seed 1) | Debts_To_Clear | 108000 | 108000 | 0 | PASS |
| C21-R5 Random (seed 1) | Already_Have | 1960000 | 1960000 | 0 | PASS |
| C21-R5 Random (seed 1) | Cover_Gap | 931,628 | 931628 | 0 | PASS |
| C21-R5 Random (seed 1) | Income_Replacement | 2,937,600 | 2937600 | 0 | PASS |
| C21-R5 Random (seed 1) | Plan_Goal_Need | 931,628 | 931628 | 0 | PASS |
| C21-R6 Random (seed 2) | Income_Need | 2,654,080 | 2654080 | 0 | PASS |
| C21-R6 Random (seed 2) | Debts_To_Clear | 615000 | 615000 | 0 | PASS |
| C21-R6 Random (seed 2) | Already_Have | 1180000 | 1180000 | 0 | PASS |
| C21-R6 Random (seed 2) | Cover_Gap | 2,089,080 | 2089080 | 0 | PASS |
| C21-R6 Random (seed 2) | Income_Replacement | 2,714,400 | 2714400 | 0 | PASS |
| C21-R6 Random (seed 2) | Plan_Goal_Need | 2,089,080 | 2089080 | 0 | PASS |
| C21-R7 Edge, 0% inflation | Income_Need | 540,000 | 540000 | 0 | PASS |
| C21-R7 Edge, 0% inflation | Debts_To_Clear | 10000 | 10000 | 0 | PASS |
| C21-R7 Edge, 0% inflation | Already_Have | 120000 | 120000 | 0 | PASS |
| C21-R7 Edge, 0% inflation | Cover_Gap | 430,000 | 430000 | 0 | PASS |
| C21-R7 Edge, 0% inflation | Income_Replacement | 540,000 | 540000 | 0 | PASS |
| C21-R7 Edge, 0% inflation | Plan_Goal_Need | 430,000 | 430000 | 0 | PASS |

### C22 Income protection gap: 49/49 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C22-R1 Defaults | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R1 Defaults | Monthly_Gap | 1,399.3333 | 1,399.3333 | -3.18e-12 | PASS |
| C22-R1 Defaults | Savings_Months | 5.717 | 5.717 | 1.78e-15 | PASS |
| C22-R1 Defaults | Months_Coping | 8.717 | 8.717 | 1.78e-15 | PASS |
| C22-R1 Defaults | IP_Max | 2,649.3333 | 2,649.3333 | -3.18e-12 | PASS |
| C22-R1 Defaults | IP_Needed | 1,399.3333 | 1,399.3333 | -3.18e-12 | PASS |
| C22-R1 Defaults | Plan_Goal_Need | 1,399.3333 | 1,399.3333 | -3.18e-12 | PASS |
| C22-R2 Low / edge | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R2 Low / edge | Monthly_Gap | 0 | 0 | 0 | PASS |
| C22-R2 Low / edge | Savings_Months | Indefinitely | Indefinitely |  | PASS |
| C22-R2 Low / edge | Months_Coping | Indefinitely | Indefinitely |  | PASS |
| C22-R2 Low / edge | IP_Max | 2,649.3333 | 2,649.3333 | -3.18e-12 | PASS |
| C22-R2 Low / edge | IP_Needed | 0 | 0 | 0 | PASS |
| C22-R2 Low / edge | Plan_Goal_Need | 0 | 0 | 0 | PASS |
| C22-R3 High / edge | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R3 High / edge | Monthly_Gap | 8,899.3333 | 8,899.3333 | -3.64e-12 | PASS |
| C22-R3 High / edge | Savings_Months | 22.4736 | 22.4736 | 3.91e-14 | PASS |
| C22-R3 High / edge | Months_Coping | 34.4736 | 34.4736 | 3.55e-14 | PASS |
| C22-R3 High / edge | IP_Max | 17,649.3333 | 17,649.3333 | -3.27e-11 | PASS |
| C22-R3 High / edge | IP_Needed | 8,899.3333 | 8,899.3333 | -3.64e-12 | PASS |
| C22-R3 High / edge | Plan_Goal_Need | 8,899.3333 | 8,899.3333 | -3.64e-12 | PASS |
| C22-R4 Branch / edge | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R4 Branch / edge | Monthly_Gap | 1,399.3333 | 1,399.3333 | -3.18e-12 | PASS |
| C22-R4 Branch / edge | Savings_Months | 5.717 | 5.717 | 1.78e-15 | PASS |
| C22-R4 Branch / edge | Months_Coping | 8.717 | 8.717 | 1.78e-15 | PASS |
| C22-R4 Branch / edge | IP_Max | 149.3333 | 149.3333 | -2.56e-13 | PASS |
| C22-R4 Branch / edge | IP_Needed | 149.3333 | 149.3333 | -2.56e-13 | PASS |
| C22-R4 Branch / edge | Plan_Goal_Need | 149.3333 | 149.3333 | -2.56e-13 | PASS |
| C22-R5 Random (seed 1) | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R5 Random (seed 1) | Monthly_Gap | 0 | 0 | 0 | PASS |
| C22-R5 Random (seed 1) | Savings_Months | Indefinitely | Indefinitely |  | PASS |
| C22-R5 Random (seed 1) | Months_Coping | Indefinitely | Indefinitely |  | PASS |
| C22-R5 Random (seed 1) | IP_Max | 15,649.3333 | 15,649.3333 | -3.46e-11 | PASS |
| C22-R5 Random (seed 1) | IP_Needed | 0 | 0 | 0 | PASS |
| C22-R5 Random (seed 1) | Plan_Goal_Need | 0 | 0 | 0 | PASS |
| C22-R6 Random (seed 2) | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R6 Random (seed 2) | Monthly_Gap | 599.3333 | 599.3333 | -2.27e-13 | PASS |
| C22-R6 Random (seed 2) | Savings_Months | 169.3548 | 169.3548 | -4.26e-13 | PASS |
| C22-R6 Random (seed 2) | Months_Coping | 175.3548 | 175.3548 | -4.26e-13 | PASS |
| C22-R6 Random (seed 2) | IP_Max | 15,711.8333 | 15,711.8333 | -3.46e-11 | PASS |
| C22-R6 Random (seed 2) | IP_Needed | 599.3333 | 599.3333 | -2.27e-13 | PASS |
| C22-R6 Random (seed 2) | Plan_Goal_Need | 599.3333 | 599.3333 | -2.27e-13 | PASS |
| C22-R7 Edge, 0% inflation | Illness_Benefit_Month | 1,100.6667 | 1,100.6667 | 3.18e-12 | PASS |
| C22-R7 Edge, 0% inflation | Monthly_Gap | 1,899.3333 | 1,899.3333 | -3.18e-12 | PASS |
| C22-R7 Edge, 0% inflation | Savings_Months | 7.8975 | 7.8975 | 2.66e-15 | PASS |
| C22-R7 Edge, 0% inflation | Months_Coping | 13.8975 | 13.8975 | 3.55e-15 | PASS |
| C22-R7 Edge, 0% inflation | IP_Max | 2,649.3333 | 2,649.3333 | -3.18e-12 | PASS |
| C22-R7 Edge, 0% inflation | IP_Needed | 1,899.3333 | 1,899.3333 | -3.18e-12 | PASS |
| C22-R7 Edge, 0% inflation | Plan_Goal_Need | 1,899.3333 | 1,899.3333 | -3.18e-12 | PASS |

### C23 Mortgage protection: 49/49 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C23-R1 Defaults | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C23-R1 Defaults | Repayment | 1,319.5921 | 1,319.5921 | 1.46e-11 | PASS |
| C23-R1 Defaults | Cover_Today | 250000 | 250000 | 0 | PASS |
| C23-R1 Defaults | Warning |  |  |  | PASS |
| C23-R1 Defaults | Balance_Year_1 | 217,761.5406 | 217,761.5406 | -3.26e-09 | PASS |
| C23-R1 Defaults | Balance_Year_2 | 178,398.4915 | 178,398.4915 | -7.16e-09 | PASS |
| C23-R1 Defaults | Balance_Year_3 | 130,336.3425 | 130,336.3425 | -1.18e-08 | PASS |
| C23-R2 Low / edge | Monthly_Rate | 0.0008 | 0.0008 | -4.34e-19 | PASS |
| C23-R2 Low / edge | Repayment | 341.8749 | 341.8749 | -3.58e-11 | PASS |
| C23-R2 Low / edge | Cover_Today | 20000 | 20000 | 0 | PASS |
| C23-R2 Low / edge | Warning |  |  |  | PASS |
| C23-R2 Low / edge | Balance_Year_1 | 0 | 0 | 2.30e-09 | PASS |
| C23-R2 Low / edge | Balance_Year_2 | 0 | 0 | 0 | PASS |
| C23-R2 Low / edge | Balance_Year_3 | 0 | 0 | 0 | PASS |
| C23-R3 High / edge | Monthly_Rate | 0.0067 | 0.0067 | 2.60e-18 | PASS |
| C23-R3 High / edge | Repayment | 7,102.6088 | 7,102.6088 | -1.73e-11 | PASS |
| C23-R3 High / edge | Cover_Today | 1000000 | 1000000 | 0 | PASS |
| C23-R3 High / edge | Warning |  |  |  | PASS |
| C23-R3 High / edge | Balance_Year_1 | 967,968.3433 | 967,968.3433 | 2.10e-09 | PASS |
| C23-R3 High / edge | Balance_Year_2 | 920,246.1171 | 920,246.1171 | 5.70e-09 | PASS |
| C23-R3 High / edge | Balance_Year_3 | 849,147.3631 | 849,147.3631 | 1.18e-08 | PASS |
| C23-R4 Branch / edge | Monthly_Rate | 0.0033 | 0.0033 | -3.47e-18 | PASS |
| C23-R4 Branch / edge | Repayment | 500 | 500 | 0 | PASS |
| C23-R4 Branch / edge | Cover_Today | 250000 | 250000 | 0 | PASS |
| C23-R4 Branch / edge | Warning | Your repayment doesn't cover the interest: please check the figures. | Your repayment doesn't cover the interest: please check the figures. |  | PASS |
| C23-R4 Branch / edge | Balance_Year_1 | — | — |  | PASS |
| C23-R4 Branch / edge | Balance_Year_2 | — | — |  | PASS |
| C23-R4 Branch / edge | Balance_Year_3 | — | — |  | PASS |
| C23-R5 Random (seed 1) | Monthly_Rate | 0.005 | 0.005 | 3.47e-18 | PASS |
| C23-R5 Random (seed 1) | Repayment | 1841 | 1841 | 0 | PASS |
| C23-R5 Random (seed 1) | Cover_Today | 960000 | 960000 | 0 | PASS |
| C23-R5 Random (seed 1) | Warning | Your repayment doesn't cover the interest: please check the figures. | Your repayment doesn't cover the interest: please check the figures. |  | PASS |
| C23-R5 Random (seed 1) | Balance_Year_1 | — | — |  | PASS |
| C23-R5 Random (seed 1) | Balance_Year_2 | — | — |  | PASS |
| C23-R5 Random (seed 1) | Balance_Year_3 | — | — |  | PASS |
| C23-R6 Random (seed 2) | Monthly_Rate | 0.0051 | 0.0051 | 0 | PASS |
| C23-R6 Random (seed 2) | Repayment | 8410 | 8410 | 0 | PASS |
| C23-R6 Random (seed 2) | Cover_Today | 25000 | 25000 | 0 | PASS |
| C23-R6 Random (seed 2) | Warning |  |  |  | PASS |
| C23-R6 Random (seed 2) | Balance_Year_1 | 0 | 0 | 0 | PASS |
| C23-R6 Random (seed 2) | Balance_Year_2 | 0 | 0 | 0 | PASS |
| C23-R6 Random (seed 2) | Balance_Year_3 | 0 | 0 | 0 | PASS |
| C23-R7 Edge, 0% inflation | Monthly_Rate | 0.0037 | 0.0037 | 0 | PASS |
| C23-R7 Edge, 0% inflation | Repayment | 1,350.0122 | 1,350.0122 | -2.61e-11 | PASS |
| C23-R7 Edge, 0% inflation | Cover_Today | 150000 | 150000 | 0 | PASS |
| C23-R7 Edge, 0% inflation | Warning |  |  |  | PASS |
| C23-R7 Edge, 0% inflation | Balance_Year_1 | 97,122.0558 | 97,122.0558 | 2.90e-09 | PASS |
| C23-R7 Edge, 0% inflation | Balance_Year_2 | 30,929.6662 | 30,929.6662 | 7.13e-09 | PASS |
| C23-R7 Edge, 0% inflation | Balance_Year_3 | 0 | 0 | 0 | PASS |

### C24 Net worth: 21/21 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C24-R1 Defaults | You_Own | 435000 | 435000 | 0 | PASS |
| C24-R1 Defaults | You_Owe | 258000 | 258000 | 0 | PASS |
| C24-R1 Defaults | Net_Worth | 177000 | 177000 | 0 | PASS |
| C24-R2 Low / edge | You_Own | 0 | 0 | 0 | PASS |
| C24-R2 Low / edge | You_Owe | 0 | 0 | 0 | PASS |
| C24-R2 Low / edge | Net_Worth | 0 | 0 | 0 | PASS |
| C24-R3 High / edge | You_Own | 11000000 | 11000000 | 0 | PASS |
| C24-R3 High / edge | You_Owe | 3500000 | 3500000 | 0 | PASS |
| C24-R3 High / edge | Net_Worth | 7500000 | 7500000 | 0 | PASS |
| C24-R4 Branch / edge | You_Own | 85000 | 85000 | 0 | PASS |
| C24-R4 Branch / edge | You_Owe | 308000 | 308000 | 0 | PASS |
| C24-R4 Branch / edge | Net_Worth | -223000 | -223000 | 0 | PASS |
| C24-R5 Random (seed 1) | You_Own | 5680500 | 5680500 | 0 | PASS |
| C24-R5 Random (seed 1) | You_Owe | 464500 | 464500 | 0 | PASS |
| C24-R5 Random (seed 1) | Net_Worth | 5216000 | 5216000 | 0 | PASS |
| C24-R6 Random (seed 2) | You_Own | 5117500 | 5117500 | 0 | PASS |
| C24-R6 Random (seed 2) | You_Owe | 933000 | 933000 | 0 | PASS |
| C24-R6 Random (seed 2) | Net_Worth | 4184500 | 4184500 | 0 | PASS |
| C24-R7 Edge, 0% inflation | You_Own | 435000 | 435000 | 0 | PASS |
| C24-R7 Edge, 0% inflation | You_Owe | 258000 | 258000 | 0 | PASS |
| C24-R7 Edge, 0% inflation | Net_Worth | 177000 | 177000 | 0 | PASS |

### C25 Monthly surplus: 42/42 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C25-R1 Defaults | Surplus | 500 | 500 | 0 | PASS |
| C25-R1 Defaults | Going_Out | 3000 | 3000 | 0 | PASS |
| C25-R1 Defaults | Plan_Goal_Kind | Save my surplus (plan kind pot) | Save my surplus (plan kind pot) |  | PASS |
| C25-R1 Defaults | Plan_Goal_Amount | 6,000 | 6000 | 0 | PASS |
| C25-R1 Defaults | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C25-R1 Defaults | [shown] Surplus | About 14% of take-home is free for goals | About 14% of take-home is free for goals |  | PASS |
| C25-R2 Low / edge | Surplus | -2500 | -2500 | 0 | PASS |
| C25-R2 Low / edge | Going_Out | 3000 | 3000 | 0 | PASS |
| C25-R2 Low / edge | Plan_Goal_Kind | No goal | No goal |  | PASS |
| C25-R2 Low / edge | Plan_Goal_Amount | — | — |  | PASS |
| C25-R2 Low / edge | Plan_Goal_Years | — | — |  | PASS |
| C25-R2 Low / edge | [shown] Surplus | Spending is above income | Spending is above income |  | PASS |
| C25-R3 High / edge | Surplus | 20000 | 20000 | 0 | PASS |
| C25-R3 High / edge | Going_Out | 0 | 0 | 0 | PASS |
| C25-R3 High / edge | Plan_Goal_Kind | Save my surplus (plan kind pot) | Save my surplus (plan kind pot) |  | PASS |
| C25-R3 High / edge | Plan_Goal_Amount | 240,000 | 240000 | 0 | PASS |
| C25-R3 High / edge | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C25-R3 High / edge | [shown] Surplus | About 100% of take-home is free for goals | About 100% of take-home is free for goals |  | PASS |
| C25-R4 Branch / edge | Surplus | 0 | 0 | 0 | PASS |
| C25-R4 Branch / edge | Going_Out | 3000 | 3000 | 0 | PASS |
| C25-R4 Branch / edge | Plan_Goal_Kind | No goal | No goal |  | PASS |
| C25-R4 Branch / edge | Plan_Goal_Amount | — | — |  | PASS |
| C25-R4 Branch / edge | Plan_Goal_Years | — | — |  | PASS |
| C25-R4 Branch / edge | [shown] Surplus | Nothing left over this month | Nothing left over this month |  | PASS |
| C25-R5 Random (seed 1) | Surplus | -10950 | -10950 | 0 | PASS |
| C25-R5 Random (seed 1) | Going_Out | 19950 | 19950 | 0 | PASS |
| C25-R5 Random (seed 1) | Plan_Goal_Kind | No goal | No goal |  | PASS |
| C25-R5 Random (seed 1) | Plan_Goal_Amount | — | — |  | PASS |
| C25-R5 Random (seed 1) | Plan_Goal_Years | — | — |  | PASS |
| C25-R5 Random (seed 1) | [shown] Surplus | Spending is above income | Spending is above income |  | PASS |
| C25-R6 Random (seed 2) | Surplus | -2875 | -2875 | 0 | PASS |
| C25-R6 Random (seed 2) | Going_Out | 21425 | 21425 | 0 | PASS |
| C25-R6 Random (seed 2) | Plan_Goal_Kind | No goal | No goal |  | PASS |
| C25-R6 Random (seed 2) | Plan_Goal_Amount | — | — |  | PASS |
| C25-R6 Random (seed 2) | Plan_Goal_Years | — | — |  | PASS |
| C25-R6 Random (seed 2) | [shown] Surplus | Spending is above income | Spending is above income |  | PASS |
| C25-R7 Edge, 0% inflation | Surplus | 500 | 500 | 0 | PASS |
| C25-R7 Edge, 0% inflation | Going_Out | 3000 | 3000 | 0 | PASS |
| C25-R7 Edge, 0% inflation | Plan_Goal_Kind | Save my surplus (plan kind pot) | Save my surplus (plan kind pot) |  | PASS |
| C25-R7 Edge, 0% inflation | Plan_Goal_Amount | 6,000 | 6000 | 0 | PASS |
| C25-R7 Edge, 0% inflation | Plan_Goal_Years | 1 | 1 | 0 | PASS |
| C25-R7 Edge, 0% inflation | [shown] Surplus | About 14% of take-home is free for goals | About 14% of take-home is free for goals |  | PASS |

### C26 Budget 50 30 20: 21/21 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C26-R1 Defaults | Needs | 1,750 | 1750 | 0 | PASS |
| C26-R1 Defaults | Wants | 1,050 | 1050 | 0 | PASS |
| C26-R1 Defaults | Save | 700 | 700 | 0 | PASS |
| C26-R2 Low / edge | Needs | 250 | 250 | 0 | PASS |
| C26-R2 Low / edge | Wants | 150 | 150 | 0 | PASS |
| C26-R2 Low / edge | Save | 100 | 100 | 0 | PASS |
| C26-R3 High / edge | Needs | 10,000 | 10000 | 0 | PASS |
| C26-R3 High / edge | Wants | 6,000 | 6000 | 0 | PASS |
| C26-R3 High / edge | Save | 4,000 | 4000 | 0 | PASS |
| C26-R4 Branch / edge | Needs | 1,666.5 | 1,666.5 | 0 | PASS |
| C26-R4 Branch / edge | Wants | 999.9 | 999.9 | 0 | PASS |
| C26-R4 Branch / edge | Save | 666.6 | 666.6 | 0 | PASS |
| C26-R5 Random (seed 1) | Needs | 450 | 450 | 0 | PASS |
| C26-R5 Random (seed 1) | Wants | 270 | 270 | 0 | PASS |
| C26-R5 Random (seed 1) | Save | 180 | 180 | 0 | PASS |
| C26-R6 Random (seed 2) | Needs | 3,475 | 3475 | 0 | PASS |
| C26-R6 Random (seed 2) | Wants | 2,085 | 2085 | 0 | PASS |
| C26-R6 Random (seed 2) | Save | 1,390 | 1390 | 0 | PASS |
| C26-R7 Edge, 0% inflation | Needs | 2,500 | 2500 | 0 | PASS |
| C26-R7 Edge, 0% inflation | Wants | 1,500 | 1500 | 0 | PASS |
| C26-R7 Edge, 0% inflation | Save | 1,000 | 1000 | 0 | PASS |

### C27 Debt repayment: 42/42 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C27-R1 Defaults | Monthly_Rate | 0.0139 | 0.0139 | -1.91e-17 | PASS |
| C27-R1 Defaults | Payment | 250 | 250 | 0 | PASS |
| C27-R1 Defaults | Months_To_Clear | 24 | 24 | 0 | PASS |
| C27-R1 Defaults | Total_Interest | 898.5668 | 898.5668 | -5.68e-13 | PASS |
| C27-R1 Defaults | Final_Payment | 148.5668 | 148.5668 | -3.69e-13 | PASS |
| C27-R1 Defaults | [shown] Months_To_Clear | 2 years | 2 years |  | PASS |
| C27-R2 Low / edge | Monthly_Rate | 0.0253 | 0.0253 | 1.39e-17 | PASS |
| C27-R2 Low / edge | Payment | 10 | 10 | 0 | PASS |
| C27-R2 Low / edge | Months_To_Clear | Never | Never |  | PASS |
| C27-R2 Low / edge | Total_Interest | — | — |  | PASS |
| C27-R2 Low / edge | Final_Payment | — | — |  | PASS |
| C27-R2 Low / edge | [shown] Months_To_Clear | Never at this repayment | Never at this repayment |  | PASS |
| C27-R3 High / edge | Monthly_Rate | 0 | 0 | 0 | PASS |
| C27-R3 High / edge | Payment | 10 | 10 | 0 | PASS |
| C27-R3 High / edge | Months_To_Clear | 10000 | 10000 | 0 | PASS |
| C27-R3 High / edge | Total_Interest | 0 | 0 | 0 | PASS |
| C27-R3 High / edge | Final_Payment | 10 | 10 | 0 | PASS |
| C27-R3 High / edge | [shown] Months_To_Clear | Payment too low to clear this debt in a reasonable time (over 100 years) | Payment too low to clear this debt in a reasonable time (over 100 years) |  | PASS |
| C27-R4 Branch / edge | Monthly_Rate | 0.0167 | 0.0167 | -4.51e-17 | PASS |
| C27-R4 Branch / edge | Payment | 300 | 300 | 0 | PASS |
| C27-R4 Branch / edge | Months_To_Clear | 50 | 50 | 0 | PASS |
| C27-R4 Branch / edge | Total_Interest | 4,738.899 | 4,738.899 | 2.73e-12 | PASS |
| C27-R4 Branch / edge | Final_Payment | 38.899 | 38.899 | -1.48e-12 | PASS |
| C27-R4 Branch / edge | [shown] Months_To_Clear | 4 years 2 months | 4 years 2 months |  | PASS |
| C27-R5 Random (seed 1) | Monthly_Rate | 0.0124 | 0.0124 | 3.30e-17 | PASS |
| C27-R5 Random (seed 1) | Payment | 2670 | 2670 | 0 | PASS |
| C27-R5 Random (seed 1) | Months_To_Clear | 13 | 13 | 0 | PASS |
| C27-R5 Random (seed 1) | Total_Interest | 2,536.6759 | 2,536.6759 | 1.82e-12 | PASS |
| C27-R5 Random (seed 1) | Final_Payment | 596.6759 | 596.6759 | 7.28e-12 | PASS |
| C27-R5 Random (seed 1) | [shown] Months_To_Clear | 1 year 1 month | 1 year 1 month |  | PASS |
| C27-R6 Random (seed 2) | Monthly_Rate | 0.0045 | 0.0045 | -8.67e-19 | PASS |
| C27-R6 Random (seed 2) | Payment | 2700 | 2700 | 0 | PASS |
| C27-R6 Random (seed 2) | Months_To_Clear | 25 | 25 | 0 | PASS |
| C27-R6 Random (seed 2) | Total_Interest | 3,720.1696 | 3,720.1696 | 5.05e-11 | PASS |
| C27-R6 Random (seed 2) | Final_Payment | 2,220.1696 | 2,220.1696 | 5.55e-11 | PASS |
| C27-R6 Random (seed 2) | [shown] Months_To_Clear | 2 years 1 month | 2 years 1 month |  | PASS |
| C27-R7 Edge, 0% inflation | Monthly_Rate | 0 | 0 | 0 | PASS |
| C27-R7 Edge, 0% inflation | Payment | 10 | 10 | 0 | PASS |
| C27-R7 Edge, 0% inflation | Months_To_Clear | 10 | 10 | 0 | PASS |
| C27-R7 Edge, 0% inflation | Total_Interest | 0 | 0 | 0 | PASS |
| C27-R7 Edge, 0% inflation | Final_Payment | 10 | 10 | 0 | PASS |
| C27-R7 Edge, 0% inflation | [shown] Months_To_Clear | 10 months | 10 months |  | PASS |

### C28 Loan repayment: 28/28 PASS

| Case | Output | Reference | Excel | Difference | Result |
|---|---|---|---|---|---|
| C28-R1 Defaults | Monthly_Rate | 0.0064 | 0.0064 | 0 | PASS |
| C28-R1 Defaults | Monthly_Repayment | 302.1458 | 302.1458 | 1.71e-13 | PASS |
| C28-R1 Defaults | Total_Repaid | 18,128.7492 | 18,128.7492 | 5.09e-11 | PASS |
| C28-R1 Defaults | Total_Interest | 3,128.7492 | 3,128.7492 | 1.00e-11 | PASS |
| C28-R2 Low / edge | Monthly_Rate | 0 | 0 | 0 | PASS |
| C28-R2 Low / edge | Monthly_Repayment | 41.6667 | 41.6667 | 3.55e-14 | PASS |
| C28-R2 Low / edge | Total_Repaid | 500 | 500 | 0 | PASS |
| C28-R2 Low / edge | Total_Interest | 0 | 0 | 0 | PASS |
| C28-R3 High / edge | Monthly_Rate | 0.0188 | 0.0188 | -1.73e-17 | PASS |
| C28-R3 High / edge | Monthly_Repayment | 2,102.7025 | 2,102.7025 | -4.55e-13 | PASS |
| C28-R3 High / edge | Total_Repaid | 252,324.2965 | 252,324.2965 | -5.82e-11 | PASS |
| C28-R3 High / edge | Total_Interest | 152,324.2965 | 152,324.2965 | -5.82e-11 | PASS |
| C28-R4 Branch / edge | Monthly_Rate | 0.0057 | 0.0057 | -3.47e-18 | PASS |
| C28-R4 Branch / edge | Monthly_Repayment | 449.6335 | 449.6335 | 5.68e-14 | PASS |
| C28-R4 Branch / edge | Total_Repaid | 37,769.2157 | 37,769.2157 | -2.91e-11 | PASS |
| C28-R4 Branch / edge | Total_Interest | 7,769.2157 | 7,769.2157 | 0 | PASS |
| C28-R5 Random (seed 1) | Monthly_Rate | 0.0029 | 0.0029 | -2.17e-18 | PASS |
| C28-R5 Random (seed 1) | Monthly_Repayment | 2,298.3048 | 2,298.3048 | 4.55e-13 | PASS |
| C28-R5 Random (seed 1) | Total_Repaid | 82,738.9725 | 82,738.9725 | 2.91e-11 | PASS |
| C28-R5 Random (seed 1) | Total_Interest | 4,238.9725 | 4,238.9725 | 4.55e-12 | PASS |
| C28-R6 Random (seed 2) | Monthly_Rate | 0.0025 | 0.0025 | 3.47e-18 | PASS |
| C28-R6 Random (seed 2) | Monthly_Repayment | 120.4675 | 120.4675 | 3.13e-13 | PASS |
| C28-R6 Random (seed 2) | Total_Repaid | 14,456.1027 | 14,456.1027 | -1.82e-12 | PASS |
| C28-R6 Random (seed 2) | Total_Interest | 1,956.1027 | 1,956.1027 | -1.14e-12 | PASS |
| C28-R7 Edge, 0% inflation | Monthly_Rate | 0.0095 | 0.0095 | 3.47e-18 | PASS |
| C28-R7 Edge, 0% inflation | Monthly_Repayment | 233.9375 | 233.9375 | 4.26e-13 | PASS |
| C28-R7 Edge, 0% inflation | Total_Repaid | 5,614.5009 | 5,614.5009 | -3.64e-12 | PASS |
| C28-R7 Edge, 0% inflation | Total_Interest | 614.5009 | 614.5009 | 4.55e-13 | PASS |

