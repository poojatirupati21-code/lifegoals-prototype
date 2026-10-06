# UI/UX calculator spec: automated check (prototype 4d065a8, 6 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx (file name unchanged; the product is now LifeMap). A4, **293 pages**, 28 calculators (C01 to C28), rebuilt from:
- prototype commit 4d065a8: journey-spec §15 ("Not sure? See an example" cards, statuses, precedence) and §16 (LifeMap name, new cover, road version of Q8, "Emergency fund" tile and goal)
- the workbook as committed with this document (customer-facing "LifeGoals" text renamed to "LifeMap"; recalc.py: 0 errors, 1,508 formulas)

I converted it to PDF with LibreOffice and looked at sample pages: the cover page, section 4 (link, card layout, all-cards tables, Liabilities statuses), section 5 (cover, other §16 changes) and the C02 "Your finances gaps" block. Layout, tables and images are fine. LibreOffice's PDF font has no glyphs for a few newer emoji (🛣️ 🏞️ ⛰️ 🏔️ in section 5.2); they are in the .docx text and show in Word.

## Result

**7155 checks passed, 0 failed. Browser console errors: 0.**

**Planted-error test.** I made a copy of the docx with 9 deliberate one-string edits and ran the same check on it. It found all 9, which showed up as 41 failed checks. The 9 edits:
1. C01 result label
2. C11 result line
3. C01 unit
4. C04 result label
5. A usual-range guidance line in Your assumptions (card APR)
6. The "3.9% · Ireland now (CSO HICP flash, Sep 2026)" chip
7. The C01 result gate ("Also still to add or choose: …")
8. An example-card text: the Cash savings sentence ("They enter €9,000." changed to "€9,500.")
9. The cover headline in section 5.1 ("The life you'd like, mapped out." changed to "…mapped out!")

## What is checked

A fresh headless Chromium run (390×844, scale 2), separate from the screenshot run, rebuilds every documented state for every calculator: default (nothing chosen), choices made, no inflation yet, "Adjust for inflation" on with and without a rate, sample customer, the pension, mortgage and investment statements, and all 28 edge cases. It compares the live DOM with the docx XML: the result gate, blank inputs and their guidance, "Assumptions this tool uses", the inputs tables, screen values and verbatim result lines, result templates, limits and hints, choice chips, and the workbook output names and values.

Shared parts: the inflation chips in their 3 states, the rules version and all register keys, every Your assumptions input, the Set by Government card, "Use the standard for all of these", step 7, "What your plan assumes", Explore (groups, topics, statement cards, confirm screens, Add to my plan sheets).

**New this round (§15 and §16, 176 checks):**
- **All 33 example cards**: for each field, the link "Not sure? See an example" exists on its Your finances section; tapping it opens the card; title, options with meanings, sentence, "Where to find yours" line and the "Nothing to add? Enter 0." flag equal the row in section 4.4; small print, "Got it" and the dialog semantics (role dialog, aria-labelledby ex-t, aria-describedby ex-s); Escape closes it, focus returns to the link, and the field value and status are unchanged.
- **Statuses**: the six tags from the live tagFor() are in the 4.5 table; no "≈ Estimated" or "Confirmed none" on screen.
- **Checklist**: every "Check your details" row (icon, field, line, incl. the worked-out note) is in the 4.6 table, and only ⚠️ / ❓ rows appear.
- **Calculators**: with years left missing, C02, C04, C05, C06 and C23 show "Add your … to see this", and the text is in 4.7 and in each calculator section; C25 and C27 show the "Worked out from your figures" tag and line, verbatim in both places.
- **Cover**: every cover string is in the 5.1 table and Appendix A; the cover shows nothing else (no trust line, no "Guidance, not advice."); D1 title, the "Emergency fund" tile and all Q8 strings are in section 5.
- **Brand**: no customer-facing "LifeGoals" left in the docx (only the file names), and none of the old wording ("Start · about 1 min", "Your life. Your plan.", "Pick a forecast", "Also still to choose:").

## Per calculator

| Cnn | Calculator | Checks passed | Failed | Screenshots |
|---|---|---|---|---|
| C01 | How much could I borrow? | 321 | 0 | 3 |
| C02 | Monthly mortgage repayment | 231 | 0 | 4 |
| C03 | Deposit calculator | 205 | 0 | 2 |
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
| Components | Inflation chips, rules register, Your assumptions | 432 | 0 |  |
| Explore | Explore structure, statement cards, Add to my plan sheets | 71 | 0 |  |
| §15 / §16 | Example cards, statuses, checklist, gaps in calculators; LifeMap cover, Q8, tile | 176 | 0 |  |

## Changed in this rebuild

- New section 4 (Your finances, §15): the link, the card layout, dialog behaviour, all 33 card texts, statuses, precedence, worked-out figures, checklists, and how missing or worked-out figures show in calculators. Seven calculators (C02, C04, C05, C06, C23, C25, C27) have a "Your finances gaps" block.
- New section 5 (LifeMap, §16): the cover with its photo slot, plus the D1 title, the "Emergency fund" tile and C11 goal, and Q8.
- Updated: 1.6 result gate ("Add your … to see this", "Also still to add or choose:"), 1.9 tags, the pre-fill order (document > typed; nothing filled in), pre-fill sources (no "25 if unknown"), C02 stated-repayment rule, Appendix A shared strings, and the cover page and header (LifeMap).

## Open points (Appendix B of the spec)

- Budget 2027 (6 Oct 2026) update.
- The emoji in screen titles is read aloud by screen readers.
- §15: a missing personal figure shows the tag "Not chosen yet" while the gate says "Add your …".
- §15: C06 gate reads "Add your term a to see this".
- §15: the worked-out note says "because no repayment was given" after a typed €0.
- §15: "Nothing to add? Enter 0." shows on euro fields only; the spec lists it for every card.
- §16: the cover photo is a placeholder; re-check contrast when the licensed photo goes in.
- §16: the workbook C11 plan output formula still names the goal "Safety net"; the prototype says "Emergency fund".

## Failures

None.
