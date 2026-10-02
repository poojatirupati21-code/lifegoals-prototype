# UI/UX calculator spec: automated check (rebuild, 2 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx. A4, **226 pages**, 28 calculators (C01 to C28), rebuilt from the current prototype (commit 1d81b6f, Irish rules 2026 · checked 2 Oct 2026). Maths reference: deliverables/LifeGoals-Calculators.xlsx (sheets "C01 Borrowing" … "C28 Loan repayment").
I converted it to PDF with LibreOffice and looked at sample pages: cover, contents, design system, inflation chips, rules register, Your assumptions, C01, C12 and the appendices. Layout, tables and images are fine.

## Result

**6310 checks passed, 0 failed. Browser console errors: 0.**

**Planted-error test.** I made a copy of the docx with 6 deliberate one-string edits and ran the same check on it. It found all 6, which showed up as 38 failed checks. The 6 edits:
1. C01 result label
2. C11 result line
3. C01 unit
4. C04 result label
5. Your assumptions guidance text (upkeep)
6. The "3.9% · Ireland now" inflation chip

## Method

Headless Chromium (Playwright, 390×844, deviceScaleFactor 2) opens the prototype in a fresh run, separate from the screenshot run. It rebuilds every documented state:
- default (before a plan, inflation blank)
- inflation 2%
- Adjust for inflation on, with and without a rate
- the sample customer
- pension, mortgage and investment statements (including one with a corrected repayment)
- all 28 edge cases

For every calculator it compares the live DOM with the docx XML:
- **Static text:** title, question, tip, eyebrow, back button, switch and inflation strings, buttons, disclaimer.
- **Inputs tables:** unit, CALCS default, on-screen default, min, max, step, keyboard and labelling for every input. Choice chips are checked for their labels and that each one selects.
- **Screen-value tables and verbatim result lines:** every input value, tag, result label, headline, row and inflation line, for every screenshot.
- **Result templates:** every live label, headline, line and row must match a template in the doc. The templates are compiled with the doc's own placeholder table.
- **Limits:** every numeric input is typed above its maximum and below its minimum. The hint, clamp and result must match the doc. € inputs typed at 1.5× the slider top must widen the slider.
- **Workbook pointer:** every output name the screen computes must be a defined name in the matching sheet. The doc's workbook value tables must equal the live values (default and 2% states).

The check also covers the shared parts:
- **Inflation chips in their 3 states:** CSO label 3.9%, chips not pressed, card collapses to "Prices rising 2% a year (your choice) · Change", chosen chip pressed after Change, Other with "My own rate (0–10%)".
- **Rules version:** "Irish rules 2026 · checked 2 Oct 2026" plus the Budget 2027 (6 Oct 2026) note. All 81 register keys and their effective dates.
- **Your assumptions:** all 45 inputs in 4 groups: label, control, range/options, suggested value as shown, status line, guidance; plus the footer.
- **Explore:** groups and topics, statement cards, confirm screens, and all 11 Add to my plan sheet variants.

Note: the screen-value tables were filled from the screenshot run. This check rebuilds the states in a fresh run and compares. The templates, limits, hint rules, workbook pointers and Your assumptions tables are checked against the live screen.

## Per calculator

| Cnn | Calculator | Checks passed | Failed | Screenshots |
|---|---|---|---|---|
| C01 | How much could I borrow? | 298 | 0 | 4 |
| C02 | Monthly mortgage repayment | 215 | 0 | 7 |
| C03 | Deposit calculator | 187 | 0 | 3 |
| C04 | Mortgage overpayment | 201 | 0 | 5 |
| C05 | Interest-rate impact | 192 | 0 | 5 |
| C06 | Mortgage term comparison | 203 | 0 | 5 |
| C07 | Rent vs buy | 245 | 0 | 3 |
| C08 | Goal planner | 195 | 0 | 4 |
| C09 | Compound growth | 167 | 0 | 3 |
| C10 | Lump-sum growth | 274 | 0 | 7 |
| C11 | Emergency fund | 133 | 0 | 5 |
| C12 | Retirement projection | 529 | 0 | 8 |
| C13 | Contribution impact | 333 | 0 | 5 |
| C14 | AVC impact | 340 | 0 | 5 |
| C15 | Will my money last? | 191 | 0 | 6 |
| C16 | Retirement drawdown scenarios | 154 | 0 | 6 |
| C17 | Inflation-adjusted return | 173 | 0 | 5 |
| C18 | Regular investing | 230 | 0 | 5 |
| C19 | Fees impact | 186 | 0 | 4 |
| C20 | Risk & return simulator | 170 | 0 | 5 |
| C21 | Life cover estimator | 297 | 0 | 5 |
| C22 | Income protection gap | 211 | 0 | 4 |
| C23 | Mortgage protection | 133 | 0 | 3 |
| C24 | Net worth | 194 | 0 | 4 |
| C25 | Monthly surplus | 152 | 0 | 5 |
| C26 | Budget (50/30/20) | 77 | 0 | 3 |
| C27 | Debt repayment | 138 | 0 | 5 |
| C28 | Loan repayment | 105 | 0 | 3 |
| Components | Inflation chips, rules register, Your assumptions | 316 | 0 |  |
| Explore | Explore structure, statement cards, Add to my plan sheets | 71 | 0 |  |

## Mismatches found and fixed during this rebuild

- Your assumptions, "How many years of PRSI…": the doc said "Not set", but the box shows "0" when blank. The doc now records what the screen shows, and the issue is listed in Appendix B as a prototype issue.
- Your assumptions, State survivor's pension: the suggested value is written as €260 in the text, but the box shows €259.5. The doc now gives both.
- Two templates had a space in the wrong place around an optional sentence (C02 what-if, C03 deposit saved). Both fixed.

## Still open (Appendix B of the spec)

- Budget 2027 update
- C22 sheet says "a income protection need"
- C22 headline says "1.0 months"
- C15 at the 60-year cap shows "age 126"
- C13 relief-limit wording
- Inflation "Other" closes the chips straight away
- Enter then leaving a value box clears the hint
- Year and month boxes accept decimals
- PRSI years box shows 0 when blank
- Explore note still says "29 calculators"
- Sliders have no aria-valuetext, and the emoji in screen titles is read aloud
- journey-spec K6 says Explore is removed

## Failures

None.
