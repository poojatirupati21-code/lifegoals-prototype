# Independent accuracy audit: LifeGoals calculators C01–C28

Auditor: independent QFA / CFP (Ireland), not involved in building the prototype or the workbook · Audit date: 2 October 2026
Scope: `deliverables/LifeGoals-Calculators-Engineering.xlsx` (28 calculator sheets and Assumptions), `LifeGoals-Customer-Journey-Prototype.html` (CALCS, helpers, and the plan engine's goal handling), `deliverables/LifeGoals-Calculators-UIUX-Spec.docx` Appendix B, `deliverables/calculator-verification-report.md` ("Behaviours to confirm"), `deliverables/uiux-spec-check.md`.
Question answered: are the formulas, assumptions and logic financially correct and complete for Ireland in 2026? This audit does not ask whether Excel matches the prototype. That is already proven.

## 1. Overall verdict

**Do not hand the workbook to the engineer as it stands.** The arithmetic is faithful and uses standard formulas. I built my own implementation from first principles (annuity PMT, a month-by-month amortisation schedule, closed-form outstanding balance, FV of a lump sum and of an annuity, growing-annuity drawdown, real return, multiplicative fee drag, lognormal ranges). I ran it for 3 to 4 cases per calculator: 90 calculator-cases and 285 compared outputs. Every Excel figure agreed with my reference to within €0.000000001. The only difference was the deliberate 60-year cap in C16, which the screen shows as "60+". The problems are elsewhere:

1. **One core result is wrong.** C12 compares a projected fund in *future* money with a target in *today's* money. This understates the retirement gap, or wrongly says there is none. **Must fix.**
2. **The "Add to my plan" hand-off is wrong in 9 calculators** (the goal amount or its money basis): C02, C04, C09, C10, C12, C13, C14, C18, C21 and C27. Every calculator goal is created as a one-off *spend* goal (`mkGoal('other')`, kind `spend`), and the plan engine then inflates it with `amount × (1 + AS.infl)^n` (prototype line ~750). As a result:
   - a mortgage balance, a debt balance, a protection sum assured or a retirement target becomes a cash outflow;
   - nominal future values get inflated a second time.

   The engineer will copy these goal rows from the workbook into production. **Must fix.**
3. **Edge defects that print wrong answers:**
   - C04 shows "Infinity yrs" and a negative "interest saved";
   - C04 and C27 report 1,200 months as the answer when the loop cap is hit ("Debt free in 100 yrs" with €88,000 still owed);
   - C20 shows €NaN.

   **Must fix.**
4. **Material omissions a QFA would expect** (Should fix):
   - **Tax is missing from every growth tool:** DIRT 33% and exit tax 38% with 8-year deemed disposal.
   - **Protection needs are not netted:**
     - mortgage protection is a legal requirement under CCA 1995 s.126;
     - the Widow's/Surviving Civil Partner's (Contributory) Pension is €259.50 a week;
     - Illness Benefit is €254 a week.
   - **Home-buying costs are missing:** 1% stamp duty is left out of the deposit tools, and rent vs buy has no rent inflation and no opportunity cost.
   - **APR is treated as a nominal rate** (C27, C28). It is an effective annual rate.
   - **Drawdown withdrawals are taken at the end of each year** (C15, C16), which is the optimistic timing.

When the 15 Must fixes are done, the workbook is safe to build from. The Should fixes ought to be done before any customer testing, because several of them change headline figures by 10% to 60%.

**Totals: 15 Must fix · 31 Should fix · 34 Nice to have.**

## 2. Summary table

Verdict = the calculator's core result on valid, realistic inputs. Must items also include the "Add to my plan" hand-off and edge defects, so a calculator can be "Correct with caveats" and still have a Must fix.

| Calculator | Verdict | Must | Should | Nice |
|---|---|---|---|---|
| C01 How much could I borrow? | Correct with caveats | 0 | 2 | 2 |
| C02 Monthly mortgage repayment | Correct with caveats | 1 | 1 | 1 |
| C03 Deposit calculator | Correct with caveats | 0 | 2 | 2 |
| C04 Mortgage overpayment | Correct with caveats | 3 | 0 | 1 |
| C05 Interest-rate impact | Correct with caveats | 0 | 1 | 1 |
| C06 Mortgage term comparison | Correct | 0 | 0 | 1 |
| C07 Rent vs buy | Correct with caveats | 0 | 2 | 1 |
| C08 Goal planner | Correct | 0 | 0 | 2 |
| C09 Compound growth | Correct with caveats | 1 | 1 | 1 |
| C10 Lump-sum growth | Correct with caveats | 1 | 1 | 1 |
| C11 Emergency fund | Correct with caveats | 0 | 1 | 1 |
| C12 Retirement projection | **Wrong** | 2 | 3 | 2 |
| C13 Contribution impact | Correct with caveats | 1 | 1 | 2 |
| C14 AVC impact | Correct with caveats | 1 | 0 | 2 |
| C15 Will my money last? | Correct with caveats | 0 | 1 | 2 |
| C16 Retirement drawdown scenarios | Correct with caveats | 0 | 1 | 1 |
| C17 Inflation-adjusted return | Correct | 0 | 0 | 1 |
| C18 Regular investing | Correct with caveats | 1 | 1 | 1 |
| C19 Fees impact | Correct | 0 | 0 | 0 |
| C20 Risk & return simulator | Correct with caveats | 1 | 1 | 1 |
| C21 Life cover estimator | Correct with caveats | 1 | 2 | 1 |
| C22 Income protection gap | Correct with caveats | 0 | 2 | 1 |
| C23 Mortgage protection | Correct with caveats | 0 | 1 | 1 |
| C24 Net worth | Correct | 0 | 0 | 1 |
| C25 Monthly surplus | Correct with caveats | 0 | 1 | 1 |
| C26 Budget (50/30/20) | Correct | 0 | 0 | 1 |
| C27 Debt repayment | Correct with caveats | 2 | 1 | 0 |
| C28 Loan repayment | Correct with caveats | 0 | 1 | 0 |
| Assumptions sheet | Correct with caveats | 0 | 2 | 2 |
| **Total** | 1 Wrong · 22 with caveats · 6 Correct | **15** | **31** | **34** |

## 3. Method

- **Excel side.** I set the inputs in copies of the workbook, one copy per case (A = defaults with inflation 2% chosen; B = other inputs with inflation 3.5%; C = other inputs with inflation 2%; D = defaults with no inflation chosen, for the inflation-sensitive tools). I recalculated each copy with LibreOffice (`recalc.py`, 0 formula errors in 38,211 formulas) and read the results with openpyxl `data_only=True`.
- **Reference side.** I wrote my own Python (`scratchpad/audit/ref.py`). It does not use the prototype's helpers.
  - Mortgages and loans: the annuity `PMT = L·i/(1−(1+i)^−n)` with i = r/12, which is the nominal-rate convention used by Irish lenders. It is cross-checked by a month-by-month schedule whose final payment = balance + interest, and by the closed-form balance `B_k = L(1+i)^k − P((1+i)^k−1)/i`.
  - Savings: FV of a lump sum and of an ordinary annuity (end of month) at the monthly rate equivalent to the annual rate, `j = (1+r)^(1/12)−1`, cross-checked month by month.
  - Pension projection: closed-form FV of a growing annuity in arrears.
  - Drawdown: a yearly simulation, plus the closed-form NPER of a growing annuity.
  - Fees: multiplicative, `(1+g)(1−f)`.
  - Real return: exact, `(1+g)/(1+i)−1`.
  - Risk ranges: lognormal percentiles.
- **What I flag.** Any difference above €1 or 0.01%. For each convention (compounding, timing) I say which one the workbook uses, and what a QFA would use and why.
- **Scratch files.** All scratch work (case files, recalculated workbooks, scripts, raw comparison) is in `/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/audit/`.

### Conventions found (all calculators)

| Convention | What the workbook does | Assessment |
|---|---|---|
| Mortgage and loan rate | Nominal annual rate ÷ 12, monthly payments in arrears | Correct for a mortgage "interest rate". **Wrong for an input labelled APR** (C27, C28): an EU APR is an effective annual rate (Directive 2008/48/EC, Annex I), so the monthly rate is (1+APR)^(1/12)−1. |
| Regular saving (C08, C09, C13, C14, C18) | Monthly contributions at the **end** of each month, monthly rate = (1+r)^(1/12)−1 (annual-effective equivalent) | Legitimate and consistent with fvL. Annuity-due would add about 0.3% (C08 A: €371.64 vs €372.25). The r/12 convention would give C09 A €84,468 instead of €83,724 (+0.9%). No change needed. |
| Pension projection (C12) | **Yearly**, contributions 12×m×(1+w)^t added at the **end** of each year (no growth in the year paid) | Conservative. Monthly contributions would give €532,841 vs €525,773 (+1.3%) at defaults. Acceptable because it matches the plan engine. It is inconsistent with C13/C14, which are monthly. Nice to have: note it. |
| Drawdown (C15, C16) | Yearly, withdrawal at the **end** of the year, withdrawals rise with chosen inflation, counts full years paid | Optimistic. Income is normally drawn at the start of the year or monthly. Start-of-year gives C16 A Growth 36 instead of 41 years, C15 C 33 instead of 35. **Should fix.** |
| Fees (C10, C18, C19) | (1+g)(1−f)−1 | Correct (multiplicative). The g−f approximation would understate C19 A's difference by €856. Correct as built. |
| Real return (C10, C17, C18) | (1+g)/(1+i)−1 | Correct (exact Fisher relation, not g−i). |
| Nominal vs real | Fund values nominal; "today's money" = FV/(1+i)^y when inflation is chosen | Correct, **except C12** (nominal fund compared with a real target) and the goal hand-off (Section 5). |
| Tax on growth | None. Every growth tool is before tax. | **Should fix** (label "before tax", or add an after-tax line). See C09, C10, C18. The plan engine's own rates are "after charges and tax", so the tools and the plan disagree. |

## 4. Per-calculator findings

In every table, "Excel" = the recalculated workbook value at full precision, "Independent" = my reference, and Diff = Excel − Independent.

### C01 How much could I borrow?
**Claims:** the home price within reach under Central Bank rules. **Method:**
- loan = MIN((income + partner) × LTI, deposit × LTV/(1−LTV) = deposit × 9), with LTI 4× for first-time buyers and 3.5× otherwise;
- price = loan + deposit;
- illustrative repayment = PMT at r/12.

Rules checked: LTI 4× FTB / 3.5× SSB on combined gross income, and 90% LTV for **both** FTB and SSB (SSB moved from 80% to 90% on 1 Jan 2023). These are current in October 2026. The only 2026 change is the April 2026 exemption of certain principal-home bridging loans from LTI.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | income €60,000, partner 0, deposit €25,000, FTB 1, interest rate 4%, term 30; inflation 2% | Homes up to about | €250,000.00 | €250,000.00 | 0 |
|  |  | Borrowing by income (lti×) | €240,000.00 | €240,000.00 | 0 |
|  |  | Borrowing by deposit (90% LTV) | €225,000.00 | €225,000.00 | 0 |
|  |  | Monthly repayment (illustrative) | €1,074.18 | €1,074.18 | 0 |
| B | income €80,000, partner 40000, deposit €50,000, FTB 0, interest rate 3.5%, term 30; inflation 3.5% | Homes up to about | €470,000.00 | €470,000.00 | 0 |
|  |  | Borrowing by income (lti×) | €420,000.00 | €420,000.00 | 0 |
|  |  | Borrowing by deposit (90% LTV) | €450,000.00 | €450,000.00 | 0 |
|  |  | Monthly repayment (illustrative) | €1,885.99 | €1,885.99 | 0 |
| C | income €45,000, partner 0, deposit €60,000, FTB 1, interest rate 4.5%, term 35; inflation 2% | Homes up to about | €240,000.00 | €240,000.00 | 0 |
|  |  | Borrowing by income (lti×) | €180,000.00 | €180,000.00 | 0 |
|  |  | Borrowing by deposit (90% LTV) | €540,000.00 | €540,000.00 | 0 |
|  |  | Monthly repayment (illustrative) | €851.86 | €851.86 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: LTV check: **90.00%**
- Case A: max price if deposit also pays 1% stamp duty: **€227,272.73**
- Case B: LTV check: **89.36%**
- Case B: max price if deposit also pays 1% stamp duty: **€454,545.45**
- Case C: LTV check: **75.00%**
- Case C: max price if deposit also pays 1% stamp duty: **€237,623.76**

Findings:
- **Should fix.** The deposit must also pay **stamp duty (1% up to €1m)** and legal fees, so the price shown is too high.
  - With 1% stamp duty the deposit-limited price is dep/(10% + 1%). At defaults that is €227,273, not €250,000 (−9%).
  - Correct formula, for prices up to €1m: `=MIN(($B$25+$B$24)/(1+0.01),$B$24/((1-Assumptions!$C$28)+0.01))`, i.e. price = min((byInc + dep)/1.01, dep/0.11). Add an Assumptions cell `stamp_duty = 1%`.
  - Or, if Pooja wants it simpler, say in the line that the deposit must also cover stamp duty (1%) and fees.
- **Should fix.** The customer-facing line still contains the placeholder **"[confirm current Central Bank rules]"**. The rules are confirmed current (see the register), so remove it.
- **Nice to have.** Mention **Help to Buy** (new builds only: the lesser of €30,000 and 10% of the price, extended to 31 Dec 2029). It can count towards the deposit. Also note the CBI allowances: 15% of FTB lending and 10% of SSB lending may exceed the limits.
- **Nice to have.** Make the first-time-buyer input a Yes/No switch, so 0.5 is not counted as a first-time buyer (behaviour 13). Also note the CBI "fresh start" rule: a divorced or insolvent previous owner can be treated as a first-time buyer.

### C02 Monthly mortgage repayment
**Claims:** the monthly repayment, the payoff time and the total interest. **Method:** annuity PMT at r/12. The payoff loop uses the stated repayment if there is one. The what-if adds PMT(new rate) − PMT(current rate) to the repayment.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | mortgage amount €300,000, interest rate 4%, term 30; inflation 2% | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €1,432.25 | €1,432.25 | 0 |
|  |  | Mortgage free in (months) | 360 | 360 | 0 |
|  |  | Total interest | €215,608.52 | €215,608.52 | 0 |
|  |  | Total repaid | €515,608.52 | €515,608.52 | 0 |
| B | mortgage amount €203,700, interest rate 3.85%, term 21; inflation 3.5% | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €1,179.89 | €1,179.89 | 0 |
|  |  | Mortgage free in (months) | 252 | 252 | 0 |
|  |  | Total interest | €93,632.17 | €93,632.17 | 0 |
|  |  | Total repaid | €297,332.17 | €297,332.17 | 0 |
| C | mortgage amount €400,000, interest rate 4%, term 30; what-if if rates changed by 1%; inflation 2% | Headline: monthly repayment (what-if repayment when dr ≠ 0) | €2,147.29 | €2,147.29 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: total interest closed form p*n-L: **€215,608.52**
- Case B: total interest closed form p*n-L: **€93,632.17**

Findings:
- **Must fix.** The "Add to my plan" goal is "Buy a home" with amount = **the mortgage amount** (€300,000) in 3 years (sheet C02 B50 `=$B$10`). The plan treats it as a €318,362 cash spend in year 3. The mortgage is the borrowing, not a savings goal.
  - Correct: either no goal, or the deposit, e.g. `=INT($B$10/9+0.5)` (10% of price = loan ÷ 9 at 90% LTV).
  - Better: map it to the plan's mortgage, not to an `other` spend goal.
- **Should fix.** The what-if rate can go below 0% (1% − 2% = −1%, behaviour 11). Floor it at 0: C02 B30 `=MAX(0,$B$11+$B$16)` (same in C05 B27). Irish trackers have never paid negative rates.
- **Nice to have.** With a stated repayment, the what-if adds the *formula* change (base + PMT_new − PMT_old). This is a sound approximation while the stated figure is close to the formula. Also use the "−" minus sign in the rate text (behaviour 11).

### C03 Deposit calculator
**Claims:** the months until the deposit is saved. **Method:** ceil((price × % − saved) / monthly saving). No interest and no price growth.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | home price €350,000, deposit needed 10%, saved so far €12,000, monthly saving €800; inflation 2% | Deposit needed | €35,000.00 | €35,000.00 | 0 |
|  |  | Still to save | €23,000.00 | €23,000.00 | 0 |
|  |  | Time to your deposit (months) | 29 | 29 | 0 |
| B | home price €400,000, deposit needed 10%, saved so far €5,000, monthly saving €1,000; inflation 3.5% | Deposit needed | €40,000.00 | €40,000.00 | 0 |
|  |  | Still to save | €35,000.00 | €35,000.00 | 0 |
|  |  | Time to your deposit (months) | 35 | 35 | 0 |
| C | home price €300,000, deposit needed 20%, saved so far €20,000, monthly saving €600; what-if save extra each month 200; inflation 2% | Deposit needed | €60,000.00 | €60,000.00 | 0 |
|  |  | Still to save | €40,000.00 | €40,000.00 | 0 |
|  |  | Time to your deposit (months) | 50 | 50 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: months incl. 1% stamp duty and price rising with inflation: **37**
- Case B: months incl. 1% stamp duty and price rising with inflation: **46**
- Case C: months incl. 1% stamp duty and price rising with inflation: **63**

Findings:
- **Should fix.** The "Deposit needed" slider goes down to **5%**, below the CBI 10% minimum (90% LTV for all buyers). Set the minimum to 10% (sheet C03 E11 = 0.10), or warn below 10%.
- **Should fix.** The target is static. It leaves out the 1% stamp duty and fees, and it ignores house prices rising while the customer saves. Both make the time too short: with 1% stamp duty and prices rising at the chosen 2%, defaults take 37 months, not 29.
  - Simple correct formula: need = price × (1+i)^(months/12) × (pc + 1%). Solve month by month in the helper, or as a minimum add the stamp duty: `=$B$10*($B$11+0.01)`.
- **Nice to have.** Mention Help to Buy (new builds).
- **Nice to have.** Fix the copy: when the deposit is already saved, the line still says "Saving €… a month closes the gap" (Appendix B), and "1 months" should be "1 month".

### C04 Mortgage overpayment
**Claims:** the time and interest saved by paying extra. **Method:** two month-by-month payoffs at r/12 (with and without the extra), capped at 1,200 months.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | mortgage balance €250,000, interest rate 4%, years left 25, extra each month 200; inflation 2% | Mortgage free now in (months) | 300 | 300 | 0 |
|  |  | With the extra (months) | 239 | 239 | 0 |
|  |  | Mortgage free sooner by (months) | 61 | 61 | 0 |
|  |  | Interest saved | €32,877.22 | €32,877.22 | 0 |
| B | mortgage balance €300,000, interest rate 3.5%, years left 30, extra each month 500; inflation 3.5% | Mortgage free now in (months) | 360 | 360 | 0 |
|  |  | With the extra (months) | 221 | 221 | 0 |
|  |  | Mortgage free sooner by (months) | 139 | 139 | 0 |
|  |  | Interest saved | €77,859.81 | €77,859.81 | 0 |
| C | mortgage balance €150,000, interest rate 4.5%, years left 15, extra each month 100; inflation 2% | Mortgage free now in (months) | 180 | 180 | 0 |
|  |  | With the extra (months) | 161 | 161 | 0 |
|  |  | Mortgage free sooner by (months) | 19 | 19 | 0 |
|  |  | Interest saved | €6,747.24 | €6,747.24 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: NPER with extra (continuous): **238.88**
- Case B: NPER with extra (continuous): **220.40**
- Case C: NPER with extra (continuous): **160.16**

The monthly loop agrees with my lender-style schedule and with the closed-form NPER (238.88 months, so the 239th payment is the final, partial one).

Findings:
- **Must fix.** The "Add to my plan" goal is "Mortgage free" with amount = **today's balance** (€250,000) at the payoff year (C04 B46 `=$B$10`). The plan adds it as an inflated cash spend in year 20, but by then the repayments have already cleared the mortgage. That is a double count.
  - Correct: create the plan's `mfree` goal (catalogue kind `mfree`, which the engine prices from the mortgage path), with years = ceil(b.m/12).
  - Or add no goal, and instead raise the plan's mortgage repayment by the extra.
- **Must fix (behaviours 1 and 2).**
  - **The problem:** when the repayment is at or below the monthly interest, the result reads "Infinity yrs" / "Infinity yrs NaN mo", and the goal years are Infinity. When only the extra clears the loan, "Interest saved" is −€453,064, because the "now" interest stops after one month.
  - **Correct behaviour:**
    - If A never clears, show "Not at this repayment" for "Mortgage free now in", and "—" for "sooner by" and "Interest saved".
    - If B never clears either, show "—" for "With the extra" and add no goal.
  - **Excel:** B34 is already guarded. Add `=IF($B$28=1,"—",$B$30-$B$33)` for interest saved, and `=IF($B$31=1,"",…)` for the goal years.
- **Must fix (behaviour 3).** The 1,200-month cap is reported as the answer: €840 a month on €250,000 at 4% shows "100 yrs", but the true figure is 1,453 months (121 years).
  - Correct: when the loop ends at the cap with a balance > €0.005, show "Over 100 years". Or use the exact closed form: months = `=ROUNDUP(-LN(1-B*i/P)/LN(1+i),0)` (and `=ROUNDUP(B/P,0)` at 0%), valid when P > B·i.
- **Nice to have.** "Sooner by 0 months" should read "No change" (behaviour 7).

### C05 Interest-rate impact
**Claims:** the monthly change if the rate moves. **Method:** PMT(new) − PMT(current) on the current balance over the remaining term, added to the stated or formula repayment.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | mortgage balance €300,000, current rate 4%, years left 25, rate change 1%; inflation 2% | Now | €1,583.51 | €1,583.51 | 0 |
|  |  | After change | €1,753.77 | €1,753.77 | 0 |
|  |  | Monthly change | €170.26 | €170.26 | 0 |
|  |  | Change over a year | €2,043.12 | €2,043.12 | 0 |
| B | mortgage balance €250,000, current rate 3.5%, years left 20, rate change -0.5%; inflation 3.5% | Now | €1,449.90 | €1,449.90 | 0 |
|  |  | After change | €1,386.49 | €1,386.49 | 0 |
|  |  | Monthly change | −€63.41 | −€63.41 | 0 |
|  |  | Change over a year | −€760.86 | −€760.86 | 0 |
| C | mortgage balance €400,000, current rate 4%, years left 30, rate change 2%; inflation 2% | Now | €1,909.66 | €1,909.66 | 0 |
|  |  | After change | €2,398.20 | €2,398.20 | 0 |
|  |  | Monthly change | €488.54 | €488.54 | 0 |
|  |  | Change over a year | €5,862.49 | €5,862.49 | 0 |

Findings:
- **Should fix.** Floor the new rate at 0%: C05 B27 `=MAX(0,$B$11+$B$13)` (behaviour 11).
- **Nice to have.** The rate in the sentence uses a hyphen-minus ("-1.00%"). Use "−".

### C06 Mortgage term comparison
**Claims:** the extra interest from a longer term. **Method:** PMT for each term; total interest = PMT × n − loan.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | mortgage amount €300,000, interest rate 4%, term a 25, term b 35; inflation 2% | Term A monthly | €1,583.51 | €1,583.51 | 0 |
|  |  | Term A total interest | €175,053.16 | €175,053.16 | 0 |
|  |  | Term B monthly | €1,328.32 | €1,328.32 | 0 |
|  |  | Term B total interest | €257,896.17 | €257,896.17 | 0 |
|  |  | Interest difference | €82,843.02 | €82,843.02 | 0 |
| B | mortgage amount €250,000, interest rate 3.5%, term a 20, term b 30; inflation 3.5% | Term A monthly | €1,449.90 | €1,449.90 | 0 |
|  |  | Term A total interest | €97,975.83 | €97,975.83 | 0 |
|  |  | Term B monthly | €1,122.61 | €1,122.61 | 0 |
|  |  | Term B total interest | €154,140.22 | €154,140.22 | 0 |
|  |  | Interest difference | €56,164.39 | €56,164.39 | 0 |
| C | mortgage amount €400,000, interest rate 5%, term a 35, term b 30; inflation 2% | Term A monthly | €2,018.75 | €2,018.75 | 0 |
|  |  | Term A total interest | €447,875.29 | €447,875.29 | 0 |
|  |  | Term B monthly | €2,147.29 | €2,147.29 | 0 |
|  |  | Term B total interest | €373,023.14 | €373,023.14 | 0 |
|  |  | Interest difference | €74,852.16 | €74,852.16 | 0 |

Findings:
- **Nice to have.** When Term A = Term B, the line still says the shorter term "costs more each month" (behaviour 9). Correct copy: "Both terms are the same." Note also that PMT × n − loan ignores the final-payment rounding (under €1).

### C07 Rent vs buy
**Claims:** how renting and buying compare over time. **Method:**
- loan = price − deposit, 30-year PMT;
- interest paid month by month over the years chosen;
- upkeep = 1% of price × years;
- value = price × (1+g)^y, equity = value − balance;
- the comparison is rent paid vs (interest + upkeep).

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | monthly rent €1,800, home price €350,000, deposit €35,000, mortgage rate 4%, years 10, house price growth 2%; inflation 2% | Rent paid | €216,000.00 | €216,000.00 | 0 |
|  |  | Interest + upkeep (buying) | €148,632.45 | €148,632.45 | 0 |
|  |  | Home value | €426,648.05 | €426,648.05 | 0 |
|  |  | Home equity after the years | €178,478.58 | €178,478.58 | 0 |
| B | monthly rent €2,200, home price €450,000, deposit €45,000, mortgage rate 3.8%, years 15, house price growth 3%; inflation 3.5% | Rent paid | €396,000.00 | €396,000.00 | 0 |
|  |  | Interest + upkeep (buying) | €260,797.82 | €260,797.82 | 0 |
|  |  | Home value | €701,085.34 | €701,085.34 | 0 |
|  |  | Home equity after the years | €442,470.42 | €442,470.42 | 0 |
| C | monthly rent €1,500, home price €300,000, deposit €60,000, mortgage rate 4.5%, years 5, house price growth €0; inflation 2% | Rent paid | €90,000.00 | €90,000.00 | 0 |
|  |  | Interest + upkeep (buying) | €66,741.69 | €66,741.69 | 0 |
|  |  | Home value | €300,000.00 | €300,000.00 | 0 |
|  |  | Home equity after the years | €81,221.00 | €81,221.00 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: rent rising with inflation: **€236,513.97**
- Case A: buy unrecoverable: interest+upkeep(on value)+1% stamp duty+3% opp. cost of equity: **€174,319.84**
- Case B: rent rising with inflation: **€509,405.98**
- Case B: buy unrecoverable: interest+upkeep(on value)+1% stamp duty+3% opp. cost of equity: **€329,390.38**
- Case C: rent rising with inflation: **€93,672.72**
- Case C: buy unrecoverable: interest+upkeep(on value)+1% stamp duty+3% opp. cost of equity: **€79,957.81**

The arithmetic is exact. The model is biased towards buying:
- **Should fix.** Three costs are missing:
  - **Rent is flat** for up to 30 years. It should rise at least with inflation: rent paid = R × 12 × ((1+i)^y − 1)/i, which gives €236,514 at defaults, not €216,000.
  - **Buying has no purchase cost** (1% stamp duty, plus legal fees about €2,500–€3,500) and no LPT or insurance.
  - **There is no opportunity cost** of the deposit and of the equity built up. That money could otherwise earn a return; this is the standard "unrecoverable cost" comparison.

  With 3% opportunity cost, 1% stamp duty and upkeep on the rising value, buying's unrecoverable cost at defaults is €174,320, not €148,632. The headline "equity" also includes the customer's own deposit and repaid capital.
  - Suggested simple formulas: rent `=$B$10*12*IF(Assumptions!$C$14=0,$B$14,(POWER(1+Assumptions!$C$14,$B$14)-1)/Assumptions!$C$14)`; buying = interest + Σ 1% × value_t + 1% × price + opportunity rate × (deposit + capital repaid).
  - Or, at a minimum, state these exclusions in the line (it says only "Illustration only").
- **Should fix (behaviour 10).** Validate 10% × price ≤ deposit ≤ price. A deposit above the price gives a negative loan and negative interest. A deposit under 10% breaches the CBI LTV.
- **Nice to have.** The mortgage term is fixed at 30 years. Allow 35, or match C01.

### C08 Goal planner
**Claims:** the monthly saving to reach a goal. **Method:**
- future cost = goal × (1+i)^y when inflation is chosen;
- need = future cost − saved × (1+r)^y;
- monthly = need / ordinary-annuity factor at j = (1+r)^(1/12)−1.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | goal €15,000, years 3, saved €2,000, growth 2%; inflation 2% | Monthly amount (illustrative) | €372.25 | €372.25 | 0 |
|  |  | Will cost about (in y yrs) | €15,918.12 | €15,918.12 | 0 |
| B | goal €50,000, years 10, saved €5,000, growth 3%; inflation 3.5% | Monthly amount (illustrative) | €457.59 | €457.59 | 0 |
|  |  | Will cost about (in y yrs) | €70,529.94 | €70,529.94 | 0 |
| C | goal €8,000, years 1, saved €0, growth 0; inflation 2% | Monthly amount (illustrative) | €680.00 | €680.00 | 0 |
|  |  | Will cost about (in y yrs) | €8,160.00 | €8,160.00 | 0 |
| D defaults, no inflation chosen | goal €15,000, years 3, saved €2,000, growth 2%; inflation off | Monthly amount (illustrative) | €347.48 | €347.48 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: monthly, nominal r/12 convention: **€372.12**
- Case A: monthly, annuity-due (start of month): **€371.64**
- Case A: monthly if growth is deposit interest taxed at 33% DIRT: **€376.94**
- Case B: monthly, nominal r/12 convention: **€456.44**
- Case B: monthly, annuity-due (start of month): **€456.47**
- Case B: monthly if growth is deposit interest taxed at 33% DIRT: **€485.66**
- Case C: monthly, nominal r/12 convention: **€680.00**
- Case C: monthly, annuity-due (start of month): **€680.00**
- Case C: monthly if growth is deposit interest taxed at 33% DIRT: **€680.00**
- Case D: monthly, nominal r/12 convention: **€347.35**
- Case D: monthly, annuity-due (start of month): **€346.90**
- Case D: monthly if growth is deposit interest taxed at 33% DIRT: **€351.93**

Findings:
- **Nice to have.** Label "Growth / interest" as **after tax**. Deposit interest suffers 33% DIRT: at defaults the monthly need rises from €372 to €377 if 2% is a gross deposit rate.
- **Nice to have.** The goal handed to the plan does not carry "Already saved". Pass `saved = s`.
- The goal amount is in today's prices and the plan inflates it, so that hand-off is **correct**.

### C09 Compound growth
**Claims:** what regular saving grows into. **Method:** p(1+r)^y + ordinary annuity at j. Today's money = FV/(1+i)^y.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | starting amount €5,000, monthly addition €200, growth rate 4%, years 20; inflation 2% | Could grow to | €83,723.96 | €83,723.96 | 0 |
|  |  | Paid in | €53,000.00 | €53,000.00 | 0 |
|  |  | Illustrative growth | €30,723.96 | €30,723.96 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €56,343.83 | €56,343.83 | 0 |
| B | starting amount €0, monthly addition €500, growth rate 6%, years 30; inflation 3.5% | Could grow to | €487,256.49 | €487,256.49 | 0 |
|  |  | Paid in | €180,000.00 | €180,000.00 | 0 |
|  |  | Illustrative growth | €307,256.49 | €307,256.49 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €173,598.97 | €173,598.97 | 0 |
| C | starting amount €20,000, monthly addition €0, growth rate 2%, years 10; inflation 2% | Could grow to | €24,379.89 | €24,379.89 | 0 |
|  |  | Paid in | €20,000.00 | €20,000.00 | 0 |
|  |  | Illustrative growth | €4,379.89 | €4,379.89 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €20,000.00 | €20,000.00 | 0 |
| D defaults, no inflation chosen | starting amount €5,000, monthly addition €200, growth rate 4%, years 20; inflation off | Could grow to | €83,723.96 | €83,723.96 | 0 |
|  |  | Paid in | €53,000.00 | €53,000.00 | 0 |
|  |  | Illustrative growth | €30,723.96 | €30,723.96 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: nominal r/12 convention: **€84,467.84**
- Case A: after 38% exit tax on gain at the end (fund): **€72,048.86**
- Case A: after 33% DIRT each year (deposit): **€71,679.16**
- Case B: nominal r/12 convention: **€502,257.52**
- Case B: after 38% exit tax on gain at the end (fund): **€370,499.02**
- Case B: after 33% DIRT each year (deposit): **€343,812.75**
- Case C: nominal r/12 convention: **€24,423.99**
- Case C: after 38% exit tax on gain at the end (fund): **€22,715.53**
- Case C: after 33% DIRT each year (deposit): **€22,847.52**
- Case D: nominal r/12 convention: **€84,467.84**
- Case D: after 38% exit tax on gain at the end (fund): **€72,048.86**
- Case D: after 33% DIRT each year (deposit): **€71,679.16**

Findings:
- **Must fix.** When no inflation is chosen, the goal amount is the **nominal** FV (B34 `=INT((IF(Assumptions!$C$6=1,$B$24,$B$21))+0.5)`). The plan still inflates goals at the 2% fallback (`AS.infl = INFL_STD`), so the target becomes €124,409, not €83,724.
  - Correct: always deflate with the rate the plan will use, `=INT($B$21/$B$23+0.5)`. B23 already uses `Assumptions!$C$14` (infl_eff), which falls back to 2%.
- **Should fix.** The result is **before tax** and not labelled so.
  - For a deposit: 33% DIRT on interest each year gives €71,679 at defaults.
  - For a fund: 38% exit tax on the gain gives about €72,049, before the 8-year deemed-disposal timing.
  - Correct: label "before tax", and add an optional row "After tax (deposit: DIRT 33%; fund: exit tax 38%)". For a deposit, r_net = r × (1 − 0.33).
- **Nice to have.** Hand the goal to the plan as kind `pot` ("Grow my wealth" in the catalogue), not as a `spend`.

### C10 Lump-sum growth
**Claims:** what a one-off amount becomes, with fees and the cost of waiting. **Method:**
- net rate nr = (1+r)(1−f)−1;
- f = p(1+nr)^y;
- the "start in 5 years" value is p(1+nr)^(y−5) at the same end date;
- fees cost = gross − net.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | amount €10,000, growth rate 4%, years 15, yearly fees 0, adjust 0; inflation 2% | If you start today | €18,009.44 | €18,009.44 | 0 |
|  |  | If you start in 5 years | €14,802.44 | €14,802.44 | 0 |
|  |  | Headline figure | €18,009.44 | €18,009.44 | 0 |
| B | amount €50,000, growth rate 5%, years 20, yearly fees 1%, adjust 1; inflation 3.5% | If you start today | €108,507.53 | €108,507.53 | 0 |
|  |  | If you start in 5 years | €89,399.98 | €89,399.98 | 0 |
|  |  | Fees cost | €24,157.36 | €24,157.36 | 0 |
|  |  | Headline figure | €54,532.18 | €54,532.18 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €54,532.18 | €54,532.18 | 0 |
|  |  | Real return a year (sentence) | 0.43% | 0.43% | 0 |
| C | amount €10,000, growth rate 4%, years 3, yearly fees 0.5%, adjust 0; inflation 2% | If you start today | €11,080.75 | €11,080.75 | 0 |
|  |  | If you start in 5 years | €10,000.00 | €10,000.00 | 0 |
|  |  | Fees cost | €167.89 | €167.89 | 0 |
|  |  | Headline figure | €11,080.75 | €11,080.75 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: g - f approximation: **€18,009.44**
- Case A: after 38% exit tax incl. 8-year deemed disposal: **€14,691.51**
- Case B: g - f approximation: **€109,556.16**
- Case B: after 38% exit tax incl. 8-year deemed disposal: **€82,862.84**
- Case C: g - f approximation: **€11,087.18**
- Case C: after 38% exit tax incl. 8-year deemed disposal: **€10,670.07**

Findings:
- **Must fix.** The goal hand-off (B42) has the same problem as C09 when no inflation is chosen. Correct: `=INT($B$23/$B$26+0.5)`, always.
- **Should fix.** The result is **before exit tax**. Exit tax is 38% from 1 Jan 2026, and deemed disposal every 8 years still applies. At defaults the after-tax value is €14,692, not €18,009; case B gives €82,863 instead of €108,508. Label it "before tax", and optionally add the after-tax row. Simple version: f − 0.38 × (f − p).
- **Nice to have.** When years ≤ 5, "If you start in 5 years" equals the amount itself (case C: €10,000), so the "cost of waiting" is just the growth. Hide that row and sentence when y ≤ 5.
- **Behaviour 8 confirmed:** handing the goal over in today's money whenever inflation is chosen, regardless of the "Adjust for inflation" switch, is the **correct** behaviour, because plan goals are in today's money. C18 is the one that is wrong.

### C11 Emergency fund
**Claims:** the months of essential spending covered. **Method:** savings / essentials; target = essentials × months. Pre-fill: essentials = costs + mortgage + loan repayments (correct: essential outgoings, not income).

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | essential monthly spending €2,500, months you want covered 6, easy-access savings €6,250; inflation 2% | You currently have (months) | 2.50 | 2.50 | 0 |
|  |  | Target cushion | €15,000.00 | €15,000.00 | 0 |
|  |  | Still to build | €8,750.00 | €8,750.00 | 0 |
| B | essential monthly spending €3,000, months you want covered 3, easy-access savings €12,000; inflation 3.5% | You currently have (months) | 4 | 4 | 0 |
|  |  | Target cushion | €9,000.00 | €9,000.00 | 0 |
|  |  | Still to build | €0.00 | €0.00 | 0 |
| C | essential monthly spending €1,800, months you want covered 6, easy-access savings €2,000; inflation 2% | You currently have (months) | 1.11 | 1.11 | 0 |
|  |  | Target cushion | €10,800.00 | €10,800.00 | 0 |
|  |  | Still to build | €8,800.00 | €8,800.00 | 0 |

Findings:
- **Should fix.** The goal is handed over as a *spend* of the full target in 2 years, so the plan treats the emergency fund as money that leaves. It is a reserve. Use the plan's `safety` goal (kind `pot`) with saved = current easy-access savings.
- **Nice to have.** The tip "Ideal emergency fund: 6 months" is better put as guidance: "Often 3 to 6 months of essential spending; nearer 6 if your income is less secure." Also fix "1 months" (Appendix B).

### C12 Retirement projection (Wrong)
**Claims:** whether the current path funds the retirement wanted. **Method:**
- pot grows yearly at g;
- contributions 12m(1+w)^t are added at each year end, with w = pay growth 2.5% (Standard);
- target = (desired − other income − spend less) × 25;
- gap = target − fund.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | your age 40, target retirement age 65, pension value today €60,000, monthly contributions €500, desired yearly income €40,000, other income €15,000, growth after charges 4.5%; inflation 2% | Projected fund | €525,773.17 | €525,773.17 | 0 |
|  |  | Illustrative target (25 × the income you need) | €625,000.00 | €625,000.00 | 0 |
|  |  | Illustrative gap | €99,226.83 | €99,226.83 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €320,474.98 | €320,474.98 | 0 |
| B | your age 30, target retirement age 66, pension value today €20,000, monthly contributions €400, desired yearly income €35,000, other income €15,564, growth after charges 4%; inflation 3.5% | Projected fund | €616,925.77 | €616,925.77 | 0 |
|  |  | Illustrative target (25 × the income you need) | €485,900.00 | €485,900.00 | 0 |
|  |  | Illustrative gap | None | None | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €178,805.27 | €178,805.27 | 0 |
| C | your age 55, target retirement age 65, pension value today €300,000, monthly contributions €1,000, desired yearly income €50,000, other income €15,564, growth after charges 4.5%; inflation 2% | Projected fund | €629,621.75 | €629,621.75 | 0 |
|  |  | Illustrative target (25 × the income you need) | €860,900.00 | €860,900.00 | 0 |
|  |  | Illustrative gap | €231,278.25 | €231,278.25 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €516,509.13 | €516,509.13 | 0 |
| D defaults, no inflation chosen | your age 40, target retirement age 65, pension value today €60,000, monthly contributions €500, desired yearly income €40,000, other income €15,000, growth after charges 4.5%; inflation off | Projected fund | €525,773.17 | €525,773.17 | 0 |
|  |  | Illustrative target (25 × the income you need) | €625,000.00 | €625,000.00 | 0 |
|  |  | Illustrative gap | €99,226.83 | €99,226.83 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: fund with monthly contributions: **€532,841.40**
- Case A: QFA: gap like-for-like, in today's money (target - fund/(1+i)^y): **€304,525.02**
- Case A: QFA: gap like-for-like, in future money (target*(1+i)^y - fund): **€499,605.57**
- Case A: QFA: bridge years before State Pension at 66 (today's money): **€15,000.00**
- Case B: fund with monthly contributions: **€626,661.86**
- Case B: QFA: gap like-for-like, in today's money (target - fund/(1+i)^y): **€307,094.73**
- Case B: QFA: gap like-for-like, in future money (target*(1+i)^y - fund): **€1,059,558.54**
- Case B: QFA: bridge years before State Pension at 66 (today's money): **€0.00**
- Case C: fund with monthly contributions: **€632,971.87**
- Case C: QFA: gap like-for-like, in today's money (target - fund/(1+i)^y): **€344,390.87**
- Case C: QFA: gap like-for-like, in future money (target*(1+i)^y - fund): **€419,810.54**
- Case C: QFA: bridge years before State Pension at 66 (today's money): **€15,564.00**
- Case D: fund with monthly contributions: **€532,841.40**
- Case D: QFA: gap like-for-like, in today's money (target - fund/(1+i)^y): **€304,525.02**
- Case D: QFA: gap like-for-like, in future money (target*(1+i)^y - fund): **€499,605.57**
- Case D: QFA: bridge years before State Pension at 66 (today's money): **€15,000.00**

My closed-form growing annuity, pot(1+g)^y + 12m((1+g)^y − (1+w)^y)/(g − w), reproduces the fund exactly. The inputs are fine; the comparison is wrong.

- **Must fix: nominal fund compared with a real target.**
  - "Desired yearly income" and "Other yearly income" are today's money: they are pre-filled from the retirement goal and from €15,564 × the State Pension factor.
  - The fund is future money: it grows nominally and contributions rise 2.5% a year.
  - **Effect:**
    - At defaults the gap shown is €99,227. Like for like it is **€304,525** in today's money (target €625,000 − fund €320,475).
    - Case B (age 30, retire at 66, 3.5% inflation) says "your projected fund meets the illustrative target", but in today's money the fund is €178,805 against a target of €485,900: a **€307,095 gap**.
  - **Correct formula:** gap (today's money) = target − fund / (1+i)^y.
    - Excel, C12 B41: `=$B$40-$B$39/$B$42`.
    - B42 = (1 + infl_eff)^y uses the 2% fallback when no rate is chosen, which is right: the comparison must always be like for like.
    - The sentence and the "Illustrative gap" row then use B41. The headline can stay nominal, with the today's-money row beside it.
- **Must fix.** The goal "Comfortable retirement" is handed over as a one-off **spend** of the 25× target (€625,000, inflated by the plan to about €1.03m at 65). This comes on top of the plan's own retirement goal, which already models yearly income: a double count.
  - Correct: update the existing retirement goal, with income = desired − spend less, and age = ra.
- **Should fix.** Retiring before **State Pension age 66** leaves bridging years unfunded. The default ra 65 is short by €15,000 in today's money.
  - Correct target: `=MAX(0,$B$14-$B$22-$B$15)*25+MAX(0,66-$B$33)*$B$15`. Add an Assumptions cell `sp_age = 66`.
- **Should fix.** "Desired yearly income" does not say whether it is gross or after tax.
  - The plan treats the retirement amount as spending after tax, but drawdown is taxable (income tax and USC; the State Pension is USC-exempt).
  - Correct: label it "before tax", or gross up the private-income part with the plan's `netRet()`.
- **Should fix.** A pension statement's projection is used "as stated" and then deflated again by "Worth in today's money".
  - Irish Statements of Reasonable Projection are expressed in **today's terms** (ASP PEN-12), so that row double-deflates, and the gap compares the wrong bases.
  - Correct: record the basis of the statement. If it is today's money, compare it directly with the target and do not deflate it.
- **Nice to have.** The default "Other yearly income" is €15,000, but the 2026 State Pension (Contributory) is €15,564 (€299.30 × 52). The pre-fill already uses €15,564; make the default match.
- **Nice to have.** Warn when the projected fund approaches the **Standard Fund Threshold** (€2.2m in 2026, rising €200,000 a year to €2.8m in 2029). Note that the yearly-in-arrears convention is conservative compared with monthly contributions (+1.3%).

### C13 Contribution impact
**Claims:** the effect of raising contributions by x% of salary. **Method:**
- m = salary × x/12;
- FV = ordinary annuity at j (flat contributions);
- net cost = m × (1 − tax rate).

Relief at the marginal income-tax rate only is correct: employee contributions get income-tax relief, but USC and PRSI are still due.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | salary €60,000, increase contributions by 2%, years to retirement 25, growth assumption 4.5%, your tax rate 40%; inflation 2% | Could add to your pension | €54,572.48 | €54,572.48 | 0 |
|  |  | Extra per month | €100.00 | €100.00 | 0 |
|  |  | Cost after tax relief | €60.00 | €60.00 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €33,263.61 | €33,263.61 | 0 |
| B | salary €45,000, increase contributions by 3%, years to retirement 30, growth assumption 4%, your tax rate 20%; inflation 3.5% | Could add to your pension | €77,092.94 | €77,092.94 | 0 |
|  |  | Extra per month | €112.50 | €112.50 | 0 |
|  |  | Cost after tax relief | €90.00 | €90.00 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €27,466.55 | €27,466.55 | 0 |
| C | salary €120,000, increase contributions by 5%, years to retirement 10, growth assumption 5%, your tax rate 40%; inflation 2% | Could add to your pension | €77,181.58 | €77,181.58 | 0 |
|  |  | Extra per month | €500.00 | €500.00 | 0 |
|  |  | Cost after tax relief | €300.00 | €300.00 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €63,315.78 | €63,315.78 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: with contributions rising 2.5% with pay (as C12): **€70,503.07**
- Case B: with contributions rising 2.5% with pay (as C12): **€105,001.93**
- Case C: with contributions rising 2.5% with pay (as C12): **€85,615.98**

Findings:
- **Must fix.** The goal "Boost my pension" is handed over as a **spend** of the *nominal* FV (B33 `=INT(($B$21)+0.5)`). The plan inflates it again (defaults: €89,532 spend at 65), and pension money is not a spend.
  - Correct: add no spend goal. Instead, raise the plan's pension contribution by m.
  - If a goal is kept, use today's money: `=INT($B$21/$B$23+0.5)`.
- **Should fix.** Contributions are flat, but C12 and the plan raise contributions with pay. A % of salary rises with salary, so C13 understates: €54,572 vs **€70,503** at defaults. Use the C12 convention, or label "flat contributions".
- **Nice to have.**
  - Relief limits are not tested: the age-related 15–40% bands, which include existing contributions, and the €115,000 cap.
  - The 40% pre-fill uses the single standard-rate band (€44,000; €53,000 for married one-income couples).
  - Relief is at 40% only on the part of the contribution taxed at 40%.

  A one-line note is enough.
- **Nice to have.** The tax-rate box accepts any value from 20 to 40 (Appendix B). Restrict it to 20 or 40.

### C14 AVC impact
**Claims:** what AVCs could add, and their net cost. **Method:** ordinary annuity at j; net cost = AVC × (1 − tax rate).

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | avc per month €200, years to retirement 15, growth assumption 4.5%, your tax rate 40%; inflation 2% | Could add | €50,902.36 | €50,902.36 | 0 |
|  |  | Paid in | €36,000.00 | €36,000.00 | 0 |
|  |  | Net cost to you | €21,600.00 | €21,600.00 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €37,821.21 | €37,821.21 | 0 |
| B | avc per month €500, years to retirement 10, growth assumption 4%, your tax rate 40%; inflation 3.5% | Could add | €73,347.96 | €73,347.96 | 0 |
|  |  | Paid in | €60,000.00 | €60,000.00 | 0 |
|  |  | Net cost to you | €36,000.00 | €36,000.00 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €51,997.75 | €51,997.75 | 0 |
| C | avc per month €100, years to retirement 25, growth assumption 5%, your tax rate 20%; inflation 2% | Could add | €58,573.45 | €58,573.45 | 0 |
|  |  | Paid in | €30,000.00 | €30,000.00 | 0 |
|  |  | Net cost to you | €24,000.00 | €24,000.00 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €35,702.33 | €35,702.33 | 0 |

Findings:
- **Must fix.** The goal hand-off has the same problem as C13 (B34). Add no spend goal; or, if one is kept, use `=INT($B$19/$B$23+0.5)`.
- **Nice to have.** The age-related limit covers main scheme plus AVC contributions, so the tool cannot check it on its own. The line says "age-related limits apply", which is adequate. Also restrict the tax-rate box to 20/40.

### C15 Will my money last?
**Claims:** how many years savings last. **Method:** yearly loop: pot = pot × (1+g) − w, with w rising with the chosen inflation. It counts full years paid, capped at 60.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | retirement savings €400,000, yearly withdrawal €24,000, growth assumption 3%; inflation 2% | Could last about (years) | 18 | 18 | 0 |
|  |  | Withdrawal rate | 6.00% | 6.00% | 0 |
| B | retirement savings €250,000, yearly withdrawal €15,000, growth assumption 3.15%; inflation 3.5% | Could last about (years) | 16 | 16 | 0 |
|  |  | Withdrawal rate | 6.00% | 6.00% | 0 |
| C | retirement savings €1,000,000, yearly withdrawal €40,000, growth assumption 4%; inflation 2% | Could last about (years) | 35 | 35 | 0 |
|  |  | Withdrawal rate | 4.00% | 4.00% | 0 |
| D defaults, no inflation chosen | retirement savings €400,000, yearly withdrawal €24,000, growth assumption 3%; inflation off | Could last about (years) | 23 | 23 | 0 |
|  |  | Withdrawal rate | 6.00% | 6.00% | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: closed form n (end-of-year withdrawals): **18.69**
- Case A: full years if withdrawn at start of each year: **18**
- Case B: closed form n (end-of-year withdrawals): **16.74**
- Case B: full years if withdrawn at start of each year: **16**
- Case C: closed form n (end-of-year withdrawals): **35.70**
- Case C: full years if withdrawn at start of each year: **33**
- Case D: closed form n (end-of-year withdrawals): **23.45**
- Case D: full years if withdrawn at start of each year: **22**

Findings:
- **Should fix.** Withdrawals are taken at the **end** of each year, after a full year's growth on the whole pot. That is the optimistic timing; retirement income is normally drawn at the start of the year or monthly. Use start of year:
  - Helper N8 `=IF(L8=1,($B$10-M8)*(1+$B$12),$B$10)`, O8 `=IF(AND(L8=1,$B$10>=M8),1,0)`.
  - Then N9 `=IF(L9=1,(N8-M9)*(1+$B$12),N8)`, O9 `=IF(AND(L9=1,N8>=M9),1,0)`, filled down.
  - Effect: case C 33 years not 35; no-inflation defaults 22 not 23.
- **Nice to have.** Label the withdrawal "before tax": ARF and vested PRSA drawdowns pay income tax and USC. Add a hint that from age 61 Revenue taxes an **imputed distribution** of 4% (5% from 71; 6% if ARFs exceed €2m) even if less is drawn.
- **Nice to have.** Fix "1 years" (Appendix B).

### C16 Retirement drawdown scenarios
**Claims:** how long the pot lasts at 2%, 4% and 6% growth. **Method:** the C15 loop three times.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | retirement savings €400,000, yearly withdrawal €20,000; inflation 2% | Cautious (2%) | 20 | 20 | 0 |
|  |  | Balanced (4%) | 26 | 26 | 0 |
|  |  | Growth (6%) | 41 | 41 | 0 |
| B | retirement savings €250,000, yearly withdrawal €15,000; inflation 3.5% | Cautious (2%) | 15 | 15 | 0 |
|  |  | Balanced (4%) | 18 | 18 | 0 |
|  |  | Growth (6%) | 22 | 22 | 0 |
| C | retirement savings €800,000, yearly withdrawal €30,000; inflation 2% | Cautious (2%) | 27 | 27 | 0 |
|  |  | Balanced (4%) | 39 | 39 | 0 |
|  |  | Growth (6%) | 60 | never runs out (≥200 yrs) | loop cap: shown "60+" |
| D defaults, no inflation chosen | retirement savings €400,000, yearly withdrawal €20,000; inflation off | Cautious (2%) | 25 | 25 | 0 |
|  |  | Balanced (4%) | 41 | 41 | 0 |
|  |  | Growth (6%) | 60 | never runs out (≥200 yrs) | loop cap: shown "60+" |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: start-of-year Cautious (2%): **20**
- Case A: start-of-year Balanced (4%): **25**
- Case A: start-of-year Growth (6%): **36**
- Case B: start-of-year Cautious (2%): **15**
- Case B: start-of-year Balanced (4%): **17**
- Case B: start-of-year Growth (6%): **20**
- Case C: start-of-year Cautious (2%): **26**
- Case C: start-of-year Balanced (4%): **37**
- Case C: start-of-year Growth (6%): **never runs out (≥200 yrs)**
- Case D: start-of-year Cautious (2%): **25**
- Case D: start-of-year Balanced (4%): **37**
- Case D: start-of-year Growth (6%): **never runs out (≥200 yrs)**

Findings:
- **Should fix.** Same timing issue as C15. Start of year gives defaults Growth 36, not 41, and Balanced 25, not 26.
- **Nice to have (behaviour 5).** At the cap, Cautious and Balanced show "60 yrs" while the headline and Growth show "60+". Show "60+ yrs" in every row. A pot that never runs out is not "60 years".

### C17 Inflation-adjusted return
**Claims:** the real value of a future amount. **Method:** FV = p(1+r)^y; today's money = FV/(1+i)^y; real return = (1+r)/(1+i) − 1, which is exact, not r − i.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | amount €20,000, nominal return 5%, years 15; inflation 2% | Future value | €41,578.56 | €41,578.56 | 0 |
|  |  | Value in today's money | €30,893.49 | €30,893.49 | 0 |
|  |  | Real return a year | 2.94% | 2.94% | 0 |
| B | amount €10,000, nominal return 7%, years 30; inflation 3.5% | Future value | €76,122.55 | €76,122.55 | 0 |
|  |  | Value in today's money | €27,120.82 | €27,120.82 | 0 |
|  |  | Real return a year | 3.38% | 3.38% | 0 |
| C | amount €50,000, nominal return 3%, years 10; inflation 2% | Future value | €67,195.82 | €67,195.82 | 0 |
|  |  | Value in today's money | €55,123.98 | €55,123.98 | 0 |
|  |  | Real return a year | 0.98% | 0.98% | 0 |
| D defaults, no inflation chosen | amount €20,000, nominal return 5%, years 15; inflation off | Future value | €41,578.56 | €41,578.56 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: naive r - i: **3.00%**
- Case B: naive r - i: **3.50%**
- Case C: naive r - i: **1.00%**

Finding: **Nice to have.** Say "before tax and charges".

### C18 Regular investing
**Claims:** what monthly investing builds after fees. **Method:** ordinary annuity at the monthly equivalent of (1+g)(1−f) − 1; before-fee value at g; fees cost = difference. My month-by-month check (gross growth, then a monthly fee of 1 − (1−f)^(1/12)) agrees to the cent.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | monthly amount €300, years 15, growth assumption 5%, yearly fees 1%, adjust 0; inflation 2% | Before fees | €79,447.38 | €79,447.38 | 0 |
|  |  | Fees cost | €6,338.59 | €6,338.59 | 0 |
|  |  | Paid in | €54,000.00 | €54,000.00 | 0 |
|  |  | Headline figure | €73,108.79 | €73,108.79 | 0 |
| B | monthly amount €500, years 25, growth assumption 6%, yearly fees 1.5%, adjust 1; inflation 3.5% | Before fees | €338,144.48 | €338,144.48 | 0 |
|  |  | Fees cost | €68,712.77 | €68,712.77 | 0 |
|  |  | Paid in | €150,000.00 | €150,000.00 | 0 |
|  |  | Headline figure | €114,009.22 | €114,009.22 | 0 |
|  |  | Worth in today's money (prices rising [inflation] a year) | €114,009.22 | €114,009.22 | 0 |
| C | monthly amount €100, years 5, growth assumption 4%, yearly fees 0, adjust 0; inflation 2% | Before fees | €6,617.90 | €6,617.90 | 0 |
|  |  | Fees cost | €0.00 | −€0.00 | 0 |
|  |  | Paid in | €6,000.00 | €6,000.00 | 0 |
|  |  | Headline figure | €6,617.90 | €6,617.90 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: after 38% exit tax on gain at the end: **€65,847.45**
- Case A: QFA: plan goal amount in today's money: **€54,320.90**
- Case B: after 38% exit tax on gain at the end: **€224,047.66**
- Case B: QFA: plan goal amount in today's money: **€114,009.22**
- Case C: after 38% exit tax on gain at the end: **€6,383.10**
- Case C: QFA: plan goal amount in today's money: **€5,994.04**

Findings:
- **Must fix.** The goal amount is **always the nominal** after-fee value (B43 `=INT(($B$26)+0.5)`). The plan inflates it again: at defaults the plan target becomes €98,395 at 15 years, where the correct today's-money figure is €54,321. This is behaviour 8, and C18 is the side that is wrong.
  - Correct: `=INT($B$26/POWER(1+Assumptions!$C$14,$B$11)+0.5)`, regardless of the "Adjust for inflation" switch.
- **Should fix.** The result is before 38% exit tax, deemed disposal, and the 1% life-assurance levy on premiums for unit-linked funds. At defaults the after-tax value is about €65,847, not €73,109. Label it "before tax", and optionally add the after-tax row.
- **Nice to have.** Hand the goal over as kind `pot`.

### C19 Fees impact
**Claims:** the cost of a higher fee. **Method:** p × ((1+g)(1−f))^y for each fee. This is exact and multiplicative. The g − f approximation would understate the difference by €856 at defaults.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | amount invested €50,000, years 20, growth before fees 5%, fee a 0.5%, fee b 1.5%; inflation 2% | With fee A | €120,010.05 | €120,010.05 | 0 |
|  |  | With fee B | €98,057.45 | €98,057.45 | 0 |
|  |  | Difference | €21,952.60 | €21,952.60 | 0 |
| B | amount invested €100,000, years 30, growth before fees 6%, fee a 0.2%, fee b 1%; inflation 3.5% | With fee A | €540,869.13 | €540,869.13 | 0 |
|  |  | With fee B | €424,846.26 | €424,846.26 | 0 |
|  |  | Difference | €116,022.88 | €116,022.88 | 0 |
| C | amount invested €20,000, years 10, growth before fees 4%, fee a 1%, fee b 2%; inflation 2% | With fee A | €26,774.13 | €26,774.13 | 0 |
|  |  | With fee B | €24,189.35 | €24,189.35 | 0 |
|  |  | Difference | €2,584.78 | €2,584.78 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: g - f approximation difference: **€21,096.26**
- Case B: g - f approximation difference: **€110,518.52**
- Case C: g - f approximation difference: **€2,498.44**

No findings. **Correct.**

### C20 Risk & return simulator
**Claims:** a range of outcomes by risk style. **Method:**
- middle = p(1+μ)^y;
- weaker/stronger = p(1+μ ∓ σ/√y)^y, with μ, σ = 2%/5%, 4%/10%, 6%/16%;
- "difficult year" = 1.6σ.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | amount €20,000, years 10, style 2; inflation 2% | Middle outcome | €29,604.89 | €29,604.89 | 0 |
|  |  | Weaker outcome | €21,740.04 | €21,740.04 | 0 |
|  |  | Stronger outcome | €39,943.80 | €39,943.80 | 0 |
|  |  | A difficult year could see a fall of (sentence, %) | 16 | 16 | 0 |
| B | amount €50,000, years 20, style 3; inflation 3.5% | Middle outcome | €160,356.77 | €160,356.77 | 0 |
|  |  | Weaker outcome | €80,697.44 | €80,697.44 | 0 |
|  |  | Stronger outcome | €311,468.63 | €311,468.63 | 0 |
|  |  | A difficult year could see a fall of (sentence, %) | 26 | 26 | 0 |
| C | amount €10,000, years 5, style 1; inflation 2% | Middle outcome | €11,040.81 | €11,040.81 | 0 |
|  |  | Weaker outcome | €9,882.52 | €9,882.52 | 0 |
|  |  | Stronger outcome | €12,305.24 | €12,305.24 | 0 |
|  |  | A difficult year could see a fall of (sentence, %) | 8 | 8 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: lognormal median (mu arithmetic): **€28,273.47**
- Case A: lognormal 16th pct: **€20,875.12**
- Case A: lognormal 84th pct: **€38,293.87**
- Case A: lognormal 16th pct (mu as median/geometric): **€21,858.14**
- Case A: lognormal 84th pct (mu as median/geometric): **€40,097.15**
- Case A: 1-in-20 single-year return mu-1.645*vol: **-12.45%**
- Case B: lognormal median (mu arithmetic): **€128,011.34**
- Case B: lognormal 16th pct: **€65,423.25**
- Case B: lognormal 84th pct: **€250,475.21**
- Case B: lognormal 16th pct (mu as median/geometric): **€81,954.16**
- Case B: lognormal 84th pct (mu as median/geometric): **€313,764.37**
- Case B: 1-in-20 single-year return mu-1.645*vol: **-20.32%**
- Case C: lognormal median (mu arithmetic): **€10,974.76**
- Case C: lognormal 16th pct: **€9,836.04**
- Case C: lognormal 84th pct: **€12,245.32**
- Case C: lognormal 16th pct (mu as median/geometric): **€9,895.23**
- Case C: lognormal 84th pct (mu as median/geometric): **€12,319.01**
- Case C: 1-in-20 single-year return mu-1.645*vol: **-6.22%**

Findings:
- **Must fix (behaviour 13 / Appendix B defect).** A decimal Style value (2.5) gives "undefined · middle outcome" and €NaN. Restrict Style to 1, 2 or 3, or use three chips. The workbook's data validation already does this.
- **Should fix.**
  - **The range is about ±1 standard deviation of the annualised return.** If μ is taken as the median (geometric) return, it matches lognormal 16th/84th percentiles to within about 2% (defaults: €21,740 / €39,944 vs €21,858 / €40,097). So "weaker" means *about a 1-in-6 chance of doing worse*, not the worst case. Say so.
  - **μ must be a median (geometric) return.** If 2%/4%/6% are arithmetic means, volatility drag makes the "middle" too high: Growth over 20 years is €160,357 vs a lognormal median of €128,011.
- **Nice to have.** "A difficult single year could see a fall of around 1.6σ" (16% Balanced, 26% Growth) ignores the mean, and is milder than history: equities fell about 40% in 2008. Consider "about 1 year in 20 could be this bad or worse".

### C21 Life cover estimator
**Claims:** an illustrative cover gap. **Method:** 60% of gross income × years + mortgage + other debts − savings − existing cover.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | your yearly income €60,000, years 15, mortgage balance €250,000, other debts €10,000, savings & investments €20,000, existing cover €100,000; inflation 2% | Illustrative cover gap | €680,000.00 | €680,000.00 | 0 |
|  |  | Income replacement (60%) | €540,000.00 | €540,000.00 | 0 |
| B | your yearly income €80,000, years 20, mortgage balance €300,000, other debts €0, savings & investments €50,000, existing cover €200,000; inflation 3.5% | Illustrative cover gap | €1,010,000.00 | €1,010,000.00 | 0 |
|  |  | Income replacement (60%) | €960,000.00 | €960,000.00 | 0 |
| C | your yearly income €40,000, years 10, mortgage balance €0, other debts €5,000, savings & investments €10,000, existing cover €0; inflation 2% | Illustrative cover gap | €235,000.00 | €235,000.00 | 0 |
|  |  | Income replacement (60%) | €240,000.00 | €240,000.00 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: PV income need at 3% nominal return (real): **€504,800.92**
- Case A: gap if mortgage cleared by mortgage protection: **€430,000.00**
- Case A: gap if also net of Widow's Contributory Pension (€259.50/wk, under 66): **€227,590.00**
- Case B: PV income need at 3% nominal return (real): **€1,005,588.34**
- Case B: gap if mortgage cleared by mortgage protection: **€710,000.00**
- Case B: gap if also net of Widow's Contributory Pension (€259.50/wk, under 66): **€440,120.00**
- Case C: PV income need at 3% nominal return (real): **€229,781.47**
- Case C: gap if mortgage cleared by mortgage protection: **€235,000.00**
- Case C: gap if also net of Widow's Contributory Pension (€259.50/wk, under 66): **€100,060.00**

Findings:
- **Must fix.** The goal "Protect my family" is handed over as a cash **spend of the cover gap** (€680,000 in 1 year; the plan prices it at €693,600). Life cover is a sum assured bought for a premium, not money to save. Add no spend goal; record it as a protection need for the adviser.
- **Should fix.** **Mortgage protection.** Most Irish mortgages must have mortgage protection life cover assigned to the lender (Consumer Credit Act 1995, s.126; exemptions include buy-to-let, borrowers over 50 and uninsurable borrowers). That cover clears the mortgage on death, so adding the full balance double-counts in most cases.
  - Correct: an input "Is your mortgage covered by mortgage protection? (most are)", defaulting to Yes, and need = … + IF(covered, 0, mortgage).
  - Effect at defaults: €430,000, not €680,000.
- **Should fix.** No allowance for the **Widow's/Widower's/Surviving Civil Partner's (Contributory) Pension**: €259.50 a week under 66 (2026), plus increases for qualified children (€58 / €78 a week).
  - Correct: income need = (60% × income − State survivor's pension) × years, e.g. `=MAX(0,$B$10*Assumptions!$C$50-Assumptions!sv_pension*52)*$B$11+…`.
  - Effect at defaults (with mortgage protection): €227,590.
  - Keep it simple: one optional input "Other family income after death (e.g. State pension)", pre-filled with €13,494.
- **Nice to have.** The income need is undiscounted, which implicitly assumes the payout earns exactly inflation (0% real). That is acceptable and simple; at about 1% real the PV is €504,801, not €540,000. Funeral costs (€5,000–€10,000) and CAT for non-spouse beneficiaries are not mentioned.

### C22 Income protection gap
**Claims:** how long the customer could cope off work. **Method:** months of sick pay + savings / essential spending; the gap afterwards = all of the essential spending.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | essential monthly spending €2,500, sick-pay months 3, easy-access savings €8,000; inflation 2% | You could cope for about (months) | 6.20 | 6.20 | 0 |
|  |  | Savings would cover | €3.20 | €3.20 | 0 |
| B | essential monthly spending €3,000, sick-pay months 6, easy-access savings €15,000; inflation 3.5% | You could cope for about (months) | 11 | 11 | 0 |
|  |  | Savings would cover | €5.00 | €5.00 | 0 |
| C | essential monthly spending €2,000, sick-pay months 0, easy-access savings €0; inflation 2% | You could cope for about (months) | 0 | 0 | 0 |
|  |  | Savings would cover | €0.00 | €0.00 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: monthly gap after Illness Benefit (€254/wk): **€1,399.33**
- Case A: months coping with Illness Benefit: **8.72**
- Case B: monthly gap after Illness Benefit (€254/wk): **€1,899.33**
- Case B: months coping with Illness Benefit: **13.90**
- Case C: monthly gap after Illness Benefit (€254/wk): **€899.33**
- Case C: months coping with Illness Benefit: **0**

Findings:
- **Should fix.** It ignores **State Illness Benefit**: €254 a week maximum personal rate in 2026, or €1,100.67 a month, after waiting days and subject to PRSI conditions.
  - Correct: monthly gap = MAX(0, essentials − IB × 52/12); months = sick pay + savings / gap, i.e. `=$B$11+IF(G>0,$B$12/G,"indefinitely")` with G = `MAX(0,$B$10-Assumptions!ib_week*52/12)`.
  - Effect at defaults: gap €1,399 a month, not €2,500; coping 8.7 months, not 6.2.
  - Note the Irish IP rule: the benefit is capped at about 75% of gross earnings **less** State benefits.
- **Should fix.** The goal "Protect my income" is handed over as a €30,000 cash **spend** (12 × essentials) in 1 year. That is not what income protection is. Hand over a protection need instead, or an emergency-fund top-up as a `pot`.
- **Nice to have.** Statutory sick pay is only 5 days at 70% of pay (capped at €110 a day) in 2026. Explain that "months of sick pay" means the employer's own scheme.

### C23 Mortgage protection
**Claims:** the cover needed now and the balance later. **Method:** month-by-month amortisation at the stated or formula repayment. It agrees with the closed form B_k exactly.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | mortgage balance €250,000, interest rate 4%, years left 25; inflation 2% | Cover needed today | €250,000.00 | €250,000.00 | 0 |
|  |  | In 5 years | €217,761.54 | €217,761.54 | 0 |
|  |  | In 10 years | €178,398.49 | €178,398.49 | 0 |
|  |  | In 15 years | €130,336.34 | €130,336.34 | 0 |
| B | mortgage balance €300,000, interest rate 3.5%, years left 30; inflation 3.5% | Cover needed today | €300,000.00 | €300,000.00 | 0 |
|  |  | In 5 years | €269,091.22 | €269,091.22 | 0 |
|  |  | In 10 years | €232,280.63 | €232,280.63 | 0 |
|  |  | In 15 years | €188,441.32 | €188,441.32 | 0 |
| C | mortgage balance €150,000, interest rate 4.5%, years left 12; inflation 2% | Cover needed today | €150,000.00 | €150,000.00 | 0 |
|  |  | In 5 years | €97,122.06 | €97,122.06 | 0 |
|  |  | In 10 years | €30,929.67 | €30,929.67 | 0 |
|  |  | In 15 years | €0.00 | €0.00 | 0 |

Findings:
- **Should fix (behaviour 12).** If the stated repayment is at or below the interest, the balance grows (€272,100 → €332,030) with no warning. Correct: show "Your repayment doesn't cover the interest: please check the figures", and do not show rising balances as cover needs.
- **Nice to have.** Note that cover should run for the remaining term, on a joint-life or dual-life basis for joint borrowers, and that insurers reduce cover at an assumed rate.

### C24 Net worth
**Claims:** assets minus liabilities. **Method:** a sum.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | savings €15,000, investments €10,000, pensions €60,000, property value €350,000, mortgage €250,000, other loans €8,000; inflation 2% | You own | €435,000.00 | €435,000.00 | 0 |
|  |  | You owe | €258,000.00 | €258,000.00 | 0 |
|  |  | Your net worth | €177,000.00 | €177,000.00 | 0 |
| B | savings €5,000, investments €0, pensions €150,000, property value €500,000, mortgage €320,000, other loans €20,000; inflation 3.5% | You own | €655,000.00 | €655,000.00 | 0 |
|  |  | You owe | €340,000.00 | €340,000.00 | 0 |
|  |  | Your net worth | €315,000.00 | €315,000.00 | 0 |
| C | savings €2,000, investments €0, pensions €0, property value €0, mortgage €0, other loans €15,000; inflation 2% | You own | €2,000.00 | €2,000.00 | 0 |
|  |  | You owe | €15,000.00 | €15,000.00 | 0 |
|  |  | Your net worth | −€13,000.00 | −€13,000.00 | 0 |

**Nice to have.** Note that pensions are before tax and inaccessible before 50 to 60, and that property is before selling costs.

### C25 Monthly surplus
**Claims:** what is left each month. **Method:** take-home − essentials − lifestyle − debt repayments.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | take-home €3,500, essentials €2,000, lifestyle spending €800, debt repayments €200; inflation 2% | Monthly surplus | €500.00 | €500.00 | 0 |
| B | take-home €5,200, essentials €2,900, lifestyle spending €1,200, debt repayments €400; inflation 3.5% | Monthly surplus | €700.00 | €700.00 | 0 |
| C | take-home €2,400, essentials €1,900, lifestyle spending €500, debt repayments €150; inflation 2% | Monthly surplus | −€150.00 | −€150.00 | 0 |

Findings:
- **Should fix.** The goal "Save my surplus" is a *spend* of 12 × surplus. It should be a `pot` (savings) goal.
- **Nice to have.** A surplus of exactly €0 says "Spending is above income" (Appendix B). Use "Nothing left over this month". Round the take-home pre-fill to whole euros (Appendix B: "€5,193.6206").

### C26 Budget (50/30/20)
**Method:** 50/30/20 of take-home pay. A common rule of thumb, correctly applied to *net* pay.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | take-home €3,500; inflation 2% | Needs (50%) | €1,750.00 | €1,750.00 | 0 |
|  |  | Wants (30%) | €1,050.00 | €1,050.00 | 0 |
|  |  | Savings & debt (20%) | €700.00 | €700.00 | 0 |
| B | take-home €5,000; inflation 3.5% | Needs (50%) | €2,500.00 | €2,500.00 | 0 |
|  |  | Wants (30%) | €1,500.00 | €1,500.00 | 0 |
|  |  | Savings & debt (20%) | €1,000.00 | €1,000.00 | 0 |
| C | take-home €2,000; inflation 2% | Needs (50%) | €1,000.00 | €1,000.00 | 0 |
|  |  | Wants (30%) | €600.00 | €600.00 | 0 |
|  |  | Savings & debt (20%) | €400.00 | €400.00 | 0 |

**Nice to have.** Round the pre-fill (Appendix B).

### C27 Debt repayment
**Claims:** the time to clear a debt and the interest paid. **Method:** monthly loop at APR/12, capped at 1,200 months.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | balance €5,000, interest (apr) 18%, monthly payment €250; inflation 2% | Debt free in (months) | 24 | 24 | 0 |
|  |  | Total interest | €989.13 | €989.13 | 0 |
| B | balance €10,000, interest (apr) 22%, monthly payment €300; inflation 3.5% | Debt free in (months) | 52 | 52 | 0 |
|  |  | Total interest | €5,596.10 | €5,596.10 | 0 |
| C | balance €3,000, interest (apr) 0, monthly payment €100; inflation 2% | Debt free in (months) | 30 | 30 | 0 |
|  |  | Total interest | €0.00 | €0.00 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: months with APR as effective annual rate: **24**
- Case A: interest with APR as effective annual rate: **€898.57**
- Case B: months with APR as effective annual rate: **50**
- Case B: interest with APR as effective annual rate: **€4,738.90**
- Case C: months with APR as effective annual rate: **30**
- Case C: interest with APR as effective annual rate: **€0.00**

Findings:
- **Must fix.** The goal "Debt free" is a **spend** of the full balance at the payoff year. The repayments are already in the plan's cashflow (`debtNums`), so this double counts. Add no goal, or a non-cash milestone.
- **Must fix (behaviour 4).** The cap is reported as the answer: €10 a month on €100,000 at 0% shows "Debt free in 100 yrs" and €0 interest, with about €88,000 still owed. The true figure is 833 years.
  - Correct: if the loop ends at the cap with balance > €0.005, show "Payment too low to clear this debt in a reasonable time" and add no goal. Or use the closed-form NPER given under C04.
- **Should fix.** The input is labelled **APR**. In the EU (Consumer Credit Directive, Annex I) the APR is an *effective* annual rate, so the monthly rate is (1+APR)^(1/12) − 1, not APR/12. APR/12 overstates the cost: defaults €989 vs **€899** interest; case B 52 vs 50 months, €5,596 vs €4,739.
  - Correct: C27 B20 `=POWER(1+$B$11,1/12)-1`.
  - Or relabel the input "Interest rate (not APR)". Pooja's 20% card and 8% loan defaults are typical *APRs*, so the first fix is better.

### C28 Loan repayment
**Claims:** the monthly repayment and total cost of a loan. **Method:** PMT at APR/12.

| Case | Inputs | Output | Excel | Independent | Diff |
|---|---|---|---|---|---|
| A defaults | loan amount €15,000, interest (apr) 8%, years 5; inflation 2% | Monthly repayment | €304.15 | €304.15 | 0 |
|  |  | Total repaid | €18,248.75 | €18,248.75 | 0 |
| B | loan amount €30,000, interest (apr) 7%, years 7; inflation 3.5% | Monthly repayment | €452.78 | €452.78 | 0 |
|  |  | Total repaid | €38,033.55 | €38,033.55 | 0 |
| C | loan amount €5,000, interest (apr) 12%, years 2; inflation 2% | Monthly repayment | €235.37 | €235.37 | 0 |
|  |  | Total repaid | €5,648.82 | €5,648.82 | 0 |

Auditor's additional reference figures (what a QFA would also show; not in the workbook):

- Case A: monthly with APR as effective annual rate: **€302.15**
- Case A: total interest (effective APR): **€3,128.75**
- Case B: monthly with APR as effective annual rate: **€449.63**
- Case B: total interest (effective APR): **€7,769.22**
- Case C: monthly with APR as effective annual rate: **€233.94**
- Case C: total interest (effective APR): **€614.50**

Finding: **Should fix.** Same APR issue as C27. C28 B16 `=POWER(1+$B$11,1/12)-1` gives €302.15, not €304.15 a month, and €3,129, not €3,249 interest, at defaults.

### Assumptions sheet
- **Should fix.** In the Cautious set, pay rises (3.0%) are **higher** than in Standard (2.5%).
  - In C12 and the plan, faster pay growth raises contributions and income, so "Cautious" is less cautious on this input.
  - The round-1 reason (keep real pay growth at 0.5% over 2.5% inflation) no longer holds, because inflation is now the client's own choice.
  - Set Cautious wage ≤ Standard, e.g. 2.0%–2.5%.
- **Should fix.** Standard "Investment growth after charges **and tax**" of 4.5% implies about 8.3% gross (4.5/0.62 + 1% charges). That is optimistic for a mixed fund. FP round 1 proposed 3.0%. This is plan-only, but it sits on the sheet the engineer will copy.
- **Nice to have.** The row "25% of your pension taken tax-free (up to €200,000)" is incomplete. €200,001–€500,000 is taxed at 20% and the excess at the marginal rate.
- **Nice to have.** Add to the sheet the constants the fixes above need: DIRT, exit tax, stamp duty, State Pension age 66, the survivor's pension rate, the Illness Benefit rate, the SFT and the ARF imputed rates. Also refresh the "Ireland today" inflation reference: CSO HICP flash was 3.5% in May 2026 and 3.4% in August 2026.

## 5. Cross-cutting: the "Add to my plan" hand-off

Every calculator goal is created with `mkGoal('other', …)`, i.e. kind `spend`. The engine then prices it at `amount × (1 + AS.infl)^n`, where `AS.infl` = the chosen inflation, or 2% before one is chosen. So a goal amount must be (a) a real cash outflow, and (b) in today's money.

| Calculator | Goal amount today | Correct? | Correct hand-off |
|---|---|---|---|
| C01 | 10% of price | Yes (the deposit) | Also pass saved = deposit; optionally add 1% stamp duty |
| C02 | Mortgage amount | **No** | Deposit (loan ÷ 9), or no goal |
| C03 | Deposit needed | Yes | Pass saved |
| C04 | Today's balance at payoff year | **No** | `mfree` goal, or no goal |
| C07 | Deposit | Yes | — |
| C08 | Goal in today's prices | Yes | Pass saved |
| C09, C10 | Today's money only if inflation chosen | **No** when not chosen | Always FV / (1 + infl_eff)^y; kind `pot` |
| C11 | Target cushion | Amount yes, kind no | `safety` (pot) |
| C12 | 25 × income as lump spend | **No** | Update the retirement goal's income and age |
| C13, C14 | Nominal FV | **No** | No spend goal (raise the pension contribution instead) |
| C18 | Nominal FV (always) | **No** | FV / (1 + infl_eff)^y; kind `pot` |
| C21 | Cover gap | **No** | Protection need, not a spend |
| C22 | 12 × essentials | Kind no | Protection need, or emergency pot |
| C25 | 12 × surplus | Kind no | `pot` |
| C27 | Balance | **No** | No goal (the plan already repays the debt) |

## 6. Previously found behaviours: correct behaviour confirmed

| # | Behaviour (verification report, "Behaviours to confirm") | Correct behaviour (auditor) | Class |
|---|---|---|---|
| 1 | C04: "Infinity yrs", goal years Infinity, when the repayment never clears the loan | Show "Not at this repayment" or "—", and add no goal | Must |
| 2 | C04: −€453,064 "interest saved" when only the extra clears the loan | "—" when A never clears | Must |
| 3 | C04: the 1,200-month cap shown as "100 yrs" (true: 121 yrs) | "Over 100 years", or exact NPER | Must |
| 4 | C27: the cap shown as "Debt free in 100 yrs" with €88k owed | "Payment too low…", no goal | Must |
| 5 | C16: "60 yrs" vs "60+" | "60+ yrs" in every row at the cap | Nice |
| 6 | yrs(): "1 months" | "1 month" (singular forms throughout) | Nice |
| 7 | yrs(): "0 months" (sooner by nothing) | "No change" | Nice |
| 8 | C10 vs C18 goal basis | C10 is right when inflation is chosen; C18 is wrong; both must always deflate with infl_eff | Must (C18; C09/C10 when not chosen) |
| 9 | C06: equal terms | "Both terms are the same" | Nice |
| 10 | C07: deposit > price allowed | Validate 10% × price ≤ deposit ≤ price | Should |
| 11 | C02/C05: rate below 0% (and hyphen-minus) | Floor at 0%; use "−" | Should |
| 12 | C23: balance grows without a warning | Warn; do not show as cover | Should |
| 13 | C20/C01: typed decimals | Whole numbers only (Style 1–3 chips; FTB Yes/No) | Must (C20), Nice (C01) |
| — | Calculator count | 28 (C01–C28). Fix the "29 calculators" note; journey-spec's "35" is historic | Nice (copy) |

Appendix B items not covered above:
- **C13/C14 tax-rate box:** restrict to 20 or 40. Confirmed.
- **Singular forms:** confirmed.
- **C03 copy when the deposit is saved:** confirmed. Use "You have your deposit".
- **C25 €0 surplus:** confirmed.
- **C25/C26 pre-fill rounding:** confirmed. Round to €1.
- **Inflation "Other" and value-box hint quirks:** UI only, no financial effect.
- **Excel sheet names:** match on "Cnn". Fine.
- **aria-valuetext and emoji read aloud:** accessibility, outside this audit.

## 7. Guidance, not advice

The copy stays on the guidance side ("illustrative", "a protection expert can refine this", "check your lender's overpayment terms"). Three points:
1. Remove the placeholder "[confirm current Central Bank rules]" from C01's customer line.
2. The C11 tip "Ideal emergency fund: 6 months" reads as a recommendation. Use "often 3 to 6 months".
3. Every growth tool should say "before tax". Otherwise a customer comparing them with the plan's after-tax figures could be misled. That is a Consumer Protection Code "clear and not misleading" point.

## 8. Assumptions register (Ireland, 2026)

Several official sites (revenue.ie, centralbank.ie, actuaries.ie) are blocked from this environment. For those, the source URL is the official page, and the figure was confirmed through search results that quote it, or through a secondary source listed beside it. Items marked "verify" should be re-checked on the official page before release.

| Item | 2026 value | Used by | Workbook | Source |
|---|---|---|---|---|
| CBI loan-to-income | 4× gross for FTB; 3.5× for second and subsequent buyers (since 1 Jan 2023); allowances: 15% of FTB and 10% of SSB lending may exceed; April 2026: some principal-home bridging loans exempt from LTI | C01 | Correct | [CBI explainer](https://www.centralbank.ie/consumer-hub/explainers/what-are-the-mortgage-measures) · [CBI bridging-loan amendment, 8 Apr 2026](https://www.centralbank.ie/news/article/press-release-targeted-amendment-to-mortgage-measures-home-bridging-loans-8-april-2026) · [Arthur Cox](https://www.arthurcox.com/insights/central-bank-adjusts-its-mortgage-measures-framework) |
| CBI loan-to-value | 90% for FTB **and** SSB (SSB rose from 80% in Jan 2023); BTL 70% | C01, C03, C07 | C01 correct; C03/C07 allow less than 10% deposit | as above · [MyHome](https://news.myhome.ie/uncategorized/central-bank-keeps-core-elements-mortgage-rules-unchanged-following-review-23893) |
| Mortgage protection | Required by lenders for a principal home (CCA 1995 s.126; exemptions: not a principal home, over 50, uninsurable, other cover assigned) | C21, C23 | Not reflected in C21 | [CCA 1995 s.126 (revised)](https://revisedacts.lawreform.ie/eli/1995/act/24/section/126/revised/en/html) |
| Stamp duty (residential) | 1% to €1m; 2% €1m–€1.5m; 6% above €1.5m | C01, C03, C07 | Missing | [Revenue rates](https://www.revenue.ie/en/property/stamp-duty/property/stamp-duty-property/rates.aspx) · [Revenue eBrief 261/24](https://www.revenue.ie/en/tax-professionals/ebrief/2024/no-2612024.aspx) |
| Help to Buy | Lesser of €30,000 and 10% of price; new builds; extended to 31 Dec 2029 | C01, C03 (flag) | Not mentioned | [Chartered Accountants Ireland](https://charteredaccountants.ie/News/help-to-buy-guidance-updated-for-scheme-extension) |
| Mortgage interest relief | Extended to end-2027 (Budget 2026), only for mortgages outstanding at 31 Dec 2022 with higher interest | — | Not applied (correct for new buyers) | [RSM Budget 2026](https://www.rsm.global/ireland/node/662) (verify on revenue.ie) |
| Pension relief, age bands | <30 15%; 30–39 20%; 40–49 25%; 50–54 30%; 55–59 35%; 60+ 40% | Plan (relLim), C13/C14 note | Correct in prototype | [Revenue: tax relief limits](https://www.revenue.ie/en/jobs-and-pensions/pension/relief/tax-relief-limits.aspx) |
| Earnings cap for relief | €115,000 | Plan, C13 | Correct | as above |
| AVCs | Same age-related limits, combined with main scheme contributions; relief at marginal income-tax rate only (USC/PRSI still due) | C14 | Correct in principle | as above |
| Retirement lump sum | 25% (or salary/service basis); €200,000 tax-free lifetime; €200,001–€500,000 at 20%; above at marginal rate | Plan row | Row incomplete | [Revenue: retirement lump sums](https://www.revenue.ie/en/jobs-and-pensions/pension/private/retirement-lump-sums.aspx) (verify: one search snippet quoted €575,000 as the upper limit; the official page states €500,000) |
| Standard Fund Threshold | €2.2m (2026), then +€200k a year to €2.8m (2029) | C12 (warning) | Not used | [Zurich: pension changes 2026](https://www.zurich.ie/blog/pension-changes-2026) · [Mercer](https://www.mercer.com/en-ie/insights/pensions/new-standard-fund-threshold-limits-in-ireland/) |
| ARF imputed distribution | 4% age 61–70; 5% 71+; 6% if ARF/vested PRSA assets > €2m (61+; whole value) | C15 (hint) | Not used | [Revenue Pensions Manual ch. 28](https://www.revenue.ie/en/tax-professionals/tdm/pensions/chapter-28.pdf) · [Cantor ARF brochure 6/26](https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf) |
| State Pension (Contributory) | €299.30 a week (<80), €309.30 (80+), from Jan 2026 = €15,563.60 a year; age 66 | C12, plan | €15,564 correct; C12 default €15,000 | [DSP Budget 2026 factsheet](https://www.svp.ie/wp-content/uploads/2025/10/Department-of-Social-Protection-Budget-2026-Factsheet.pdf) · [Citizens Information benefits booklet 2026](https://www.citizensinformationboard.ie/downloads/benefits_and_taxes/benefits_and_taxes_booklet_2026.pdf) |
| Widow's/Surviving Civil Partner's (Contributory) Pension | €259.50 a week under 66; €299.30 at 66+; child increase €58 (<12) / €78 (12+) | C21 | Missing | [Raisin summary of 2026 rates](https://www.raisin.com/en-ie/pensions/widow-pensions) (verify on gov.ie) |
| Illness Benefit | €254 a week maximum personal rate (avg weekly earnings ≥ €300), from Jan 2026 | C22 | Missing | [BrightPay Budget 2026](https://www.brightpay.ie/docs/2026/2026-budget-employer-summary/) · [gov.ie Budget 2026](https://www.gov.ie/en/department-of-social-protection/publications/budget-2026) |
| Statutory sick pay | 5 days a year at 70% of pay, capped at €110 a day | C22 note | — | [Learnsignal 2026 guide](https://www.learnsignal.com/blog/ireland-statutory-sick-leave-2026-five-days-guide/) |
| Income protection maximum | About 75% of gross earnings less State benefits | C22 note | — | [Irish Life](https://www.irishlife.ie/life-insurance/income-protection/) · [Smart Financial](https://www.smartfinancial.ie/income-protection-insurance-ireland/) |
| Income tax | 20% to €44,000 (single); €53,000 married one income (+ up to €35,000 for the second earner, max €88,000); 40% above; personal credit €2,000; employee credit €2,000 (unchanged in Budget 2026) | Plan; C13/C14 pre-fill | Correct | [KPMG Budget 2026 personal tax](https://kpmg.com/ie/en/insights/tax/budget-2026/personal-tax.html) · [BDO](https://www.bdo.ie/en-gb/insights/2025/budget-2026/budget-2026-personal-tax) |
| USC | 0.5% to €12,012; 2% to €28,700; 3% to €70,044; 8% above; exempt if income ≤ €13,000 | Plan | Correct | [KPMG](https://kpmg.com/ie/en/insights/tax/budget-2026/personal-tax.html) · [Revenue USC reduced rates](https://www.revenue.ie/en/jobs-and-pensions/usc/reduced-rates.aspx) |
| PRSI (Class A employee) | 4.2% from 1 Oct 2025; **4.35% from 1 Oct 2026**; nil ≤ €352 a week; PRSI credit up to €12 a week tapering to €424 | Plan | Correct (4.35% now current) | [Cantor Budget 2026](https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers) |
| DIRT | 33% on deposit interest | C08, C09 (should label) | Not applied | [Cantor Budget 2026](https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers) |
| Exit tax (funds, life policies) | **38% from 1 Jan 2026** (was 41%); 8-year deemed disposal retained | C09, C10, C18 | Not applied | [etf.ie Budget 2026](https://etf.ie/blog/budget-2026-etf/) · [etf.ie deemed disposal](https://etf.ie/blog/8-year-deemed-disposal/) |
| Life assurance levy | 1% of premiums (unit-linked policies) | C18 note | — | [etf.ie glossary](https://etf.ie/glossary/) |
| CGT | 33% | (shares, not used) | — | [Cantor Budget 2026](https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers) |
| Inflation reference | CSO HICP flash 3.5% (May 2026), 3.4% (Aug 2026); planners' long-term 2% | All | 2% / 3.5% options fine | [CSO flash HICP May 2026](https://www-cloud.cso.ie/en/csolatestnews/pressreleases/2026pressreleases/pressstatementflashestimatefortheharmonisedindexofconsumerpricesmay2026/) · [Chartered Accountants: Aug 2026 3.4%](https://www.charteredaccountants.ie/our-impact/News/news-item/cso-estimates-3.4-percent-inflation-increase) |
| APR definition | Effective annual rate (EU Consumer Credit Directive, Annex I formula with yearly compounding) | C27, C28 | Treated as nominal | [Directive 2008/48/EC (EUR-Lex)](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32008L0048) · [Raisin APR explainer](https://www.raisin.com/en-ie/banking/apr) |
| Statement of Reasonable Projection basis | Projections shown in today's terms | C12 | Deflated again | [ASP PEN-12, Society of Actuaries in Ireland](https://web.actuaries.ie/standards/asp/asp-pen-12) (verify current version) |

## 9. What to hand the engineer

1. **Fix the 15 Must items:**
   - C12 gap: B41 `=$B$40-$B$39/$B$42`.
   - Goal hand-offs (Section 5).
   - C04/C27 Infinity and cap handling.
   - C20 Style validation.
2. **Re-run the Test cases sheet** with the fixes. The 1,978 prototype-generated expected values will change for C04, C09, C10, C12, C13, C14, C18, C20, C21 and C27 (goal rows and edge cases), so regenerate them from the corrected prototype, not from the old one.
3. **Agree with Pooja which Should fixes to adopt.** My recommended minimum set, all one-line changes or labels:
   - "before tax" labels on C08–C10, C17, C18;
   - APR monthly rate (C27, C28);
   - start-of-year drawdown (C15, C16);
   - 0% rate floor (C02, C05);
   - 10% minimum deposit (C03, C07);
   - the mortgage-protection switch and survivor's pension input (C21);
   - Illness Benefit (C22);
   - stamp duty (C01, C03);
   - the C12 State Pension bridge.
