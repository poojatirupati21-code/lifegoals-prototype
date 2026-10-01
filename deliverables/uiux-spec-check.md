# UI/UX calculator spec: automated check

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx (A4, 189 pages, rendered to PDF with LibreOffice and inspected page by page in samples).
Source: LifeGoals-Customer-Journey-Prototype.html (not edited). Run date: 1 Oct 2026.

## Result

**3242 checks passed, 0 failed. Browser console errors: 0** (capture run and check run).

## Method

1. Headless Chromium (Playwright, 390x844, deviceScaleFactor 2) opens the prototype again, independently of the screenshot run, and recreates every documented state: default (before a plan), inflation chosen (2%), Adjust-for-inflation on (no rate / 2%), sample customer plan pre-fill (loadSample), sample statement upload (pension, mortgage, investment), and each edge case typed into the value boxes.
2. For each state it reads the live DOM of the calculator: title, question, tip, eyebrow, back, switch, inflation chips, every label, tag, unit prefix/suffix, box value, slider min/max/step, keyboard mode, result label, headline, line, rows, the inflation line, buttons and disclaimer.
3. It reads the .docx XML and compares with what the document says:
   - inputs tables: unit, CALCS default, on-screen default, min, max, step, keyboard, per label;
   - screen-value tables: every box value (and tag), result label, headline, every row and the inflation line, per screenshot column;
   - verbatim result lines per screenshot and in the edge-case tables;
   - result card templates: every live label, headline, line and row must match a template in the doc, compiled using the doc's own placeholder table (formats € amount, duration, decimals...);
   - every input, all 28 calculators: typed above max and below min; the hint text and clamped box value must match the inputs table; € fields typed at 1.5x the slider top must widen the slider with no hint;
   - Explore: group names, blurbs and tool counts, topics, topic links and calculator order, statement-card copy, confirm-screen labels, values and confidence tags, footer buttons, gate copy, Add-to-plan sheets.
4. Sensitivity test: four deliberate one-word edits in a copy of the docx (a result label, a line, a unit, a label) produced 10 failures, so the check does catch mismatches.

Note: the screen-value tables were filled from the screenshot capture run; this check recreates the states in a fresh browser run and compares. The templates, inputs tables, hint rules and Explore copy were written from the source and are checked against the live screen.

## Per calculator

| Cnn | Calculator | Checks passed | Failed | Screenshots |
|---|---|---|---|---|
| C01 | How much could I borrow? | 145 | 0 | 4 |
| C02 | Monthly mortgage repayment | 118 | 0 | 5 |
| C03 | Deposit calculator | 93 | 0 | 3 |
| C04 | Mortgage overpayment | 119 | 0 | 5 |
| C05 | Interest-rate impact | 118 | 0 | 5 |
| C06 | Mortgage term comparison | 125 | 0 | 5 |
| C07 | Rent vs buy | 99 | 0 | 2 |
| C08 | Goal planner | 101 | 0 | 4 |
| C09 | Compound growth | 95 | 0 | 3 |
| C10 | Lump-sum growth | 150 | 0 | 7 |
| C11 | Emergency fund | 80 | 0 | 4 |
| C12 | Retirement projection | 251 | 0 | 6 |
| C13 | Contribution impact | 148 | 0 | 5 |
| C14 | AVC impact | 133 | 0 | 5 |
| C15 | Will my money last? | 109 | 0 | 6 |
| C16 | Retirement drawdown scenarios | 112 | 0 | 6 |
| C17 | Inflation-adjusted return | 115 | 0 | 5 |
| C18 | Regular investing | 134 | 0 | 5 |
| C19 | Fees impact | 118 | 0 | 4 |
| C20 | Risk & return simulator | 105 | 0 | 6 |
| C21 | Life cover estimator | 127 | 0 | 4 |
| C22 | Income protection gap | 74 | 0 | 3 |
| C23 | Mortgage protection | 77 | 0 | 3 |
| C24 | Net worth | 123 | 0 | 4 |
| C25 | Monthly surplus | 95 | 0 | 4 |
| C26 | Budget (50/30/20) | 51 | 0 | 3 |
| C27 | Debt repayment | 90 | 0 | 4 |
| C28 | Loan repayment | 62 | 0 | 3 |
| Explore | Explore structure, statement cards, sheets | 75 | 0 |  |

## Mismatches found and fixed during the work

- Hint behaviour: the first capture pressed Enter then left the box, which clears the max hint in the prototype. The capture now commits by leaving the box (hint stays), and the quirk is documented (section 1.5, Appendix B).
- Edge-case lookup in the check matched the result-card template table first; fixed to search all tables (C27).

## Expected (documented) defects

- C20 edge "Style typed as a decimal (2.5): defect": "undefined · middle outcome" / €NaN (documented defect, Appendix B)

These are prototype bugs, recorded in Appendix B and the C20 section, not spec mismatches.

## Failures

None.
