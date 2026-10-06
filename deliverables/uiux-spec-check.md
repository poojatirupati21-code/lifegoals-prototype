# UI/UX calculator spec: automated check (prototype 283b70e, 6 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx (file name unchanged; the product is LifeMap). A4, **300 pages**, 28 calculators (C01 to C28), rebuilt from:
- prototype commit 283b70e: journey-spec §14 to §18 (the prototype file in the working tree had uncommitted §19 edits by someone else while I worked; I pinned every capture and check to the committed file, so none of that is in this document)
- the workbook as committed (new PARTNER RATES block on Assumptions, rows 123 to 133; guidance texts built from it)

I converted it to PDF with LibreOffice and looked at sample pages: section 2.1 (Calculators rows), 3.7 (partner rates: table, override example, field screenshots, workbook block), 1.11 (emoji rule), 5.2 and 5.3 (Q8 stacked cards, Ask button), and the earlier cover and section 4 pages. Layout, tables and images are fine. LibreOffice's PDF font has no glyphs for a few newer emoji; they are in the .docx text and show in Word.

## Result

**7249 checks passed, 0 failed. Browser console errors: 0.**

**Planted-error test.** I made a copy of the docx with 11 deliberate edits and ran the same check on it. It found all 11, which showed up as 53 failed checks. The 11 edits:
1. C01 result label
2. C11 result line
3. C01 unit
4. C04 result label
5. The credit-card guidance in Your assumptions ("23%" changed to "25%", every occurrence)
6. The "3.9% · Ireland now (CSO HICP flash, Sep 2026)" chip
7. The C07 result gate ("Choose your mortgage rate to see this · Also still to add or choose: …")
8. An example-card sentence (Cash savings, "€9,000" changed to "€9,500")
9. The cover headline in section 5.1
10. The suggested-rate chip text ("Use the suggested rate (3.48%) · Central Bank of Ireland: average rate on new mortgages, Jul 2026", every occurrence, changed to 3.84%)
11. The Q8 answer wording ("Straight up the motorway" changed to "…motorways", every occurrence)

## What is checked

A fresh headless Chromium run (390×844, scale 2), separate from the screenshot run, rebuilds every documented state for every calculator: default (nothing chosen), choices made, no inflation yet, "Adjust for inflation" on with and without a rate, sample customer, the pension, mortgage and investment statements, and all 28 edge cases. It compares the live DOM with the docx XML: the result gate, blank inputs and their guidance, the suggested-rate chips, "Assumptions this tool uses", the inputs tables, screen values and verbatim result lines, result templates, limits and hints, choice chips, and the workbook output names and values.

Shared parts: the inflation chips in 3 states, the rules version and all 110 register keys, every Your assumptions input (with its type, chip and guidance), the Set by Government card, "Use the standard for all of these", step 7, "What your plan assumes", Explore, statement cards, Add to my plan sheets.

**§15 and §16 (264 checks):** all 33 example cards opened from their links and compared with section 4.4 (Escape closes, focus returns, field unchanged); status tags; checklist rows; gates and worked-out lines in calculators; the cover (exact copy, nothing else), D1, the Emergency fund tile and goal, no customer-facing "LifeGoals" left.

**§17 and §18 (88 checks), new this round:**
- **Explore:** the live section order (What-ifs, Focus on one area, Tools for you, Watch, Calculators) equals the doc; the six Calculators rows (icon, name, "blurb · N tools") equal the 2.1 table; no coloured group tiles.
- **Emoji not read aloud:** all 28 calculator titles have the emoji in an aria-hidden span and the doc quotes the words-only accessible name; Explore, Home, Me and My Plan have no emoji in any heading or row name; 1.11 specifies the pattern. (Whole-app scan of 216 screen states is in the prototype's own a11y check.)
- **Ask button:** hidden on the cover, D1, the six Discover questions, the reveal, Save your results and its sheet; shown on all five tabs and in the plan builder; section 5.3 states the rule.
- **Partner rates:** the live PARTNER_RATES block equals the 3.7 table (label, value, none where there is no suggestion) and the workbook rows (all 6 market rates, Card_APR_Cap 23%, Partner_Name); the default chip for every market-rate input equals the 3.7 table; with a partner name and figures set ("Example Credit Union"), every chip reads "· Suggested by Example Credit Union" and equals the table, and "What your plan assumes" shows "Suggested X%"; the block is restored afterwards.
- **Guidance:** the mortgage ("Typing it is fine: no upload needed"), card (23% cap only), loan, charges, deposit, buying fees and life-expectancy (CSO Irish Life Tables No. 17, about 83 men and 86 women) texts are in 3.7; none of the old "Usually between" market ranges is left anywhere in the doc.

## Per calculator

| Cnn | Calculator | Checks passed | Failed | Screenshots |
|---|---|---|---|---|
| C01 | How much could I borrow? | 321 | 0 | 3 |
| C02 | Monthly mortgage repayment | 231 | 0 | 4 |
| C03 | Deposit calculator | 224 | 0 | 2 |
| C04 | Mortgage overpayment | 217 | 0 | 4 |
| C05 | Interest-rate impact | 208 | 0 | 4 |
| C06 | Mortgage term comparison | 220 | 0 | 4 |
| C07 | Rent vs buy | 274 | 0 | 2 |
| C08 | Goal planner | 211 | 0 | 3 |
| C09 | Compound growth | 183 | 0 | 3 |
| C10 | Lump-sum growth | 295 | 0 | 6 |
| C11 | Emergency fund | 147 | 0 | 3 |
| C12 | Retirement projection | 565 | 0 | 5 |
| C13 | Contribution impact | 355 | 0 | 5 |
| C14 | AVC impact | 362 | 0 | 5 |
| C15 | Will my money last? | 210 | 0 | 5 |
| C16 | Retirement drawdown scenarios | 169 | 0 | 5 |
| C17 | Inflation-adjusted return | 187 | 0 | 5 |
| C18 | Regular investing | 247 | 0 | 5 |
| C19 | Fees impact | 206 | 0 | 4 |
| C20 | Risk & return simulator | 190 | 0 | 4 |
| C21 | Life cover estimator | 323 | 0 | 3 |
| C22 | Income protection gap | 244 | 0 | 3 |
| C23 | Mortgage protection | 147 | 0 | 3 |
| C24 | Net worth | 222 | 0 | 3 |
| C25 | Monthly surplus | 176 | 0 | 3 |
| C26 | Budget (50/30/20) | 89 | 0 | 3 |
| C27 | Debt repayment | 153 | 0 | 3 |
| C28 | Loan repayment | 119 | 0 | 2 |
| Components | Inflation chips, rules register, Your assumptions | 419 | 0 |  |
| Explore | Explore structure, statement cards, Add to my plan sheets | 71 | 0 |  |
| §17 / §18 | Explore order and rows, emoji accessible names, Ask visibility, partner rates block, chips and override | 88 | 0 |  |
| §15 / §16 | Example cards, statuses, checklist, gaps in calculators; LifeMap cover, Q8, tile | 264 | 0 |  |

## Changed in this rebuild

- **§17**: Q8 in Irish tone with the stacked answer cards (5.2); Explore order and the six Calculators rows, with new screenshots (section 2); the emoji aria-hidden pattern (1.11 and each calculator's accessibility list); Ask hidden during onboarding (5.3).
- **§18**: new 3.7 Partner rates (the block, how a partner replaces it, chip behaviour, removed ranges, workbook block); market rates are "2 · Market rate (suggested)" and official ranges "2b · Official range" in 1.6, 3.2, 3.4 and the calculator choices tables; chips "Use the suggested rate (X) · source" on C01, C02, C04 to C07, C23, C27 and C28; "Optional" tag on buying fees and the deposit rate (C03 now shows its result at once); "What your plan assumes" tags "Suggested X%" / "Your figure"; the workbook's guidance texts (evaluated values) in each calculator's workbook table.
- Appendix A (shared strings, Explore and Q8) and Appendix B (the screen-title emoji item and the old ranges are moved to "fixed"; Budget 2027 now says it is not applied, per §17).

## Open points (Appendix B of the spec)

- Budget 2027: not applied yet; each change only once final and official, from its own effective date (§17).
- The suggested market rates are Central Bank figures for July 2026; re-check when the next release is published.
- The cover photo is a placeholder; re-check text contrast when the licensed photo goes in.

## Failures

None.
