# UI/UX calculator spec: automated check (prototype 2c50dea, 2 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx. A4, **256 pages**, 28 calculators (C01 to C28), rebuilt from:
- prototype commit 2c50dea (journey-spec §14; leaving a box now commits like Enter; the sample customer has every choice made)
- workbook commit 812bbf3

I converted it to PDF with LibreOffice and looked at sample pages: design system (inflation chips, tags), section 3 (value types, register, Your assumptions, step 7, What your plan assumes), C01, C15, C22 and Appendix B. Layout, tables and images are fine.

## Result

**6979 checks passed, 0 failed. Browser console errors: 0.**

**Planted-error test.** I made a copy of the docx with 7 deliberate one-string edits and ran the same check on it. It found all 7, which showed up as 39 failed checks. The 7 edits:
1. C01 result label
2. C11 result line
3. C01 unit
4. C04 result label
5. A usual-range guidance line in Your assumptions (card APR)
6. The "3.9% · Ireland now (CSO HICP flash, Sep 2026)" chip
7. The C01 "Choose your … to see this" gate text

## What is checked

A fresh headless Chromium run (390×844, scale 2), separate from the screenshot run, rebuilds every documented state for every calculator:
- **Default:** nothing chosen.
- **Choices made:** the standards, plus the example values typed into the remaining blanks.
- **No inflation yet.**
- **Adjust for inflation** on, with and without a rate.
- **Sample customer.**
- **Statements:** pension, mortgage and investment.
- **Edge cases:** all 28.

It compares the live DOM with the docx XML:
- **Gate:** the "Choose your … to see this" text, and that no numbers show before a choice.
- **Blank inputs:** each "Not chosen yet" input, with its guidance line verbatim ("Usually between X and Y (source)." / "Generally the standard is X (source). Choose what you want to use." / the retirement-age text) and its "Use the standard (X)" chip.
- **Assumptions this tool uses:** the card on each calculator that has one.
- **Inputs tables:** units, CALCS defaults, on-screen defaults (blank or value), min/max/step, keyboard, labelling and slider aria-valuetext.
- **Screen-value tables and verbatim result lines:** for every screenshot.
- **Result templates:** every label, headline, line and row, matched using the doc's placeholder tables.
- **Limits:** above-max and below-min hints and clamps for every numeric input, € widening, and "Whole numbers only" for year, month and age inputs. Every choice chip is checked too.
- **Workbook:** every output name is a defined name in the matching "Cnn …" sheet, and the values in the doc equal the live values.

It also checks the shared parts:
- **Inflation chips in their 3 states:** "Use the standard (2%)" and "3.9% · Ireland now (CSO HICP flash, Sep 2026)" (one "Ireland today" figure everywhere); tags "Not chosen yet" and "Your choice"; Other keeps the card open.
- **Rules version:** "Irish rules 2026 · checked 2 Oct 2026" plus the Budget 2027 note. All 123 register keys.
- **Your assumptions:** all 46 inputs and the retirement age: label, value type, control, chips, blank by default, and guidance verbatim with the standard chip.
- **Set by Government · 2026 card:** 13 rows.
- **"Use the standard for all of these":** it sets 2% inflation but never the retirement age or the plan-until age.
- **Step 7 "Your assumptions" card.**
- **"What your plan assumes":** every row with its tag (Set by Government · 2026 / Usually X–Y / Your choice / How the plan works).
- **Explore:** groups, topics, statement cards, confirm screens, and the Add to my plan sheets.

Note: the screen-value tables were filled from the screenshot run. This check rebuilds the states in a fresh run and compares.

## Per calculator

| Cnn | Calculator | Checks passed | Failed | Screenshots |
|---|---|---|---|---|
| C01 | How much could I borrow? | 321 | 0 | 5 |
| C02 | Monthly mortgage repayment | 231 | 0 | 8 |
| C03 | Deposit calculator | 205 | 0 | 4 |
| C04 | Mortgage overpayment | 217 | 0 | 6 |
| C05 | Interest-rate impact | 208 | 0 | 6 |
| C06 | Mortgage term comparison | 220 | 0 | 6 |
| C07 | Rent vs buy | 274 | 0 | 4 |
| C08 | Goal planner | 211 | 0 | 5 |
| C09 | Compound growth | 183 | 0 | 4 |
| C10 | Lump-sum growth | 295 | 0 | 8 |
| C11 | Emergency fund | 147 | 0 | 6 |
| C12 | Retirement projection | 565 | 0 | 9 |
| C13 | Contribution impact | 355 | 0 | 6 |
| C14 | AVC impact | 362 | 0 | 6 |
| C15 | Will my money last? | 210 | 0 | 7 |
| C16 | Retirement drawdown scenarios | 169 | 0 | 7 |
| C17 | Inflation-adjusted return | 187 | 0 | 6 |
| C18 | Regular investing | 247 | 0 | 6 |
| C19 | Fees impact | 206 | 0 | 5 |
| C20 | Risk & return simulator | 190 | 0 | 6 |
| C21 | Life cover estimator | 323 | 0 | 6 |
| C22 | Income protection gap | 244 | 0 | 5 |
| C23 | Mortgage protection | 147 | 0 | 4 |
| C24 | Net worth | 222 | 0 | 5 |
| C25 | Monthly surplus | 176 | 0 | 6 |
| C26 | Budget (50/30/20) | 89 | 0 | 4 |
| C27 | Debt repayment | 153 | 0 | 6 |
| C28 | Loan repayment | 119 | 0 | 4 |
| Components | Inflation chips, rules register, Your assumptions | 432 | 0 |  |
| Explore | Explore structure, statement cards, Add to my plan sheets | 71 | 0 |  |

## Fixed during this rebuild

- Workbook inputs are now "…_Entry" (customer entry) and "Used_…" (value used). The doc maps each screen input to both.
- The check had read the wrong inputs table once the new "Choices on this screen" table was added. Fixed.
- One planted error was first applied after the file had been written, so it wasn't tested. I re-ran it and it was caught.

## Refreshed for prototype 2c50dea

- Both prototype problems from the previous round are fixed and have been removed from Appendix B:
  - **Leaving a box:** it now commits and redraws exactly like Enter.
  - **Sample customer:** every choice is made, so all 28 calculators show results for the sample.
- I recaptured all screenshots and screen values. 22 calculators now have a "Plan pre-fill" screenshot with results. C01 "Add to my plan" for the sample now opens the sheet; before, it gave the toast "Choose your mortgage rate first".

## Open points (Appendix B of the spec)

- Budget 2027 (6 Oct 2026) update.
- The emoji in screen titles is read aloud by screen readers.

## Failures

None.
