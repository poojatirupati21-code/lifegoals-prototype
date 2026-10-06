# UI/UX calculator spec: automated check (prototype fc0d2ae, 6 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx (file name unchanged; the product is LifeMap). A4, **320 pages, 13.5 MB**, 28 calculators (C01 to C28), rebuilt from:
- prototype commit fc0d2ae: journey-spec §14 to §20 (the §19 feedback items and the §20 copy pass, 26 reworded blocks)
- the workbook as committed (new sheets "Settings" and "Your lists", their named cells, the new guidance texts)

The screenshots are palette-quantised PNGs (256 colours, no dithering) to keep the file small; the text was not touched. I converted the docx to PDF with LibreOffice and looked at sample pages: 3.7 (Settings: standards table, partner override, admin view, workbook sheet), 4.8 (the item block, Liabilities, Protection, Pension, per-item upload), 4.9 (complete on save), 4.10 (workbook Your lists and the calculators that use it), 6.1 and 6.2 (months, goal order). Layout, tables and images are fine. LibreOffice's PDF font has no glyphs for a few newer emoji; they are in the .docx text.

## Result

**7444 checks passed, 0 failed. Browser console errors: 0.**

**Planted-error test.** I made a copy of the docx with 16 deliberate edits and ran the same check on it. It found all 16, which showed up as 61 failed checks. The 14 edits:
1. C01 result label
2. C11 result line
3. C01 unit
4. C04 result label
5. The credit-card guidance in Your assumptions ("23%" changed to "25%", every occurrence)
6. The "3.9% · Ireland now (CSO HICP flash, Sep 2026)" chip
7. The C07 result gate
8. An example-card sentence (Cash savings, "€9,000" changed to "€9,500")
9. The cover headline
10. The suggested-rate chip text (3.48% changed to 3.84%, every occurrence)
11. The Q8 answer "Straight up the motorway" (changed to "…motorways", every occurrence)
12. A Settings wording in 3.7.1 ("Irish pay has grown about 3%–4% a year recently (CSO)" changed to "2%–4%", every occurrence)
13. A protection field label ("Death-in-service: lump sum" changed to "Death in service: lump sum", every occurrence)
14. The ranking heading ("Which goal first?" changed to "Which goal comes first?", every occurrence)
15. A copy-pass wording: the Emergency fund months note ("use the same number." changed to "use the same value.", every occurrence)
16. A copy-pass wording: the Known limits row ("stay at the 2026 rates." changed to "stay at the 2027 rates.", every occurrence)

## What is checked

A fresh headless Chromium run (390×844, scale 2), separate from the screenshot run, rebuilds every documented state for every calculator and compares the live DOM with the docx XML (gates, blank inputs and guidance, suggested-rate chips, "Assumptions this tool uses", inputs tables, screen values, result templates, limits and hints, choice chips, workbook output names and values). Shared parts: inflation chips, the rules register (82 keys), every Your assumptions input, Set by Government card, step 7, "What your plan assumes", Explore, statement cards and Add to my plan sheets.

**§15 and §16 (487 checks):** all 47 reachable example cards (opened from their links, compared with section 4.4 by title and "shown on", Escape closes, focus returns, field and lists unchanged; the 7 old single-total cards must have no link); status tags; checklist rows; gates and worked-out lines; the cover, D1, Emergency fund tile.

**§17 to §19 (248 checks):**
- **Explore, emoji, Ask** (as last round): section order and the six Calculators rows; emoji in aria-hidden spans for all 28 titles; Ask hidden in onboarding and shown in the app.
- **Settings:** the live SETTINGS block has 37 standards and every one equals its row in 3.7.1 (name, standard as formatted, wording or chip label, source, as-at, guidance, verify flag); each equals the workbook Settings sheet (Set_{key}, Set_{key}_1 to _3 for the three-value rows, Set_{key}_Label, Set_{key}_Cautious); the 2 guidance figures, the fixed values (Ireland now 3.9%, the 23% card cap) and Partner_Name are in the workbook and 3.7.
- **Admin view:** its note, partner-name label and group summaries equal 3.7.3; it is marked "🔒 Admin view · not for customers" and sits in the jump list.
- **Partner override:** with a partner name and changed figures set live, the inflation help and chip, Emergency fund months guidance and chip, mortgage chip and the unchanged pay-rise guidance and loan chip equal the strings in 3.7.2; "Suggested by {partner}" appears only beside the changed figures; the "Changed by" tag and "Back to the LifeMap standards" link are in the doc; the block is reset afterwards.
- **Lists:** every add button, upload text and item field label (cards, loans, pensions, 5 policy types) is in 4.8; the Liabilities, Protection (lead-in, no generic upload, five add buttons, work-cover hint) and Pension screens match; the per-item upload (confirm screen, toast, "From …" row) equals 4.8.4; a saved section is Done even with blank fields and Missing reads "Missing · optional, counts as €0".
- **Workbook Your lists:** every named total (13 of them) is in 4.10 and the intro text matches; exactly C12, C13, C14, C21, C24 and C25 fall back to the totals (each cell, label and name equals the workbook formulas); C27 and C28 are not fed.
- **Emergency fund months:** calculator 3, goal 4, step 7 shows 4 (tag "Your choice"); one fresh run proves the goal value reaches the calculator; every string in 6.1 equals the live screen; the edge (typed in C11, later changed in the goal) is in the doc.
- **Goal order:** the Emergency fund is first by default, movable, reset restores it; heading, help, aria-labels, messages, version notes and the results order in 6.2 equal the live card.

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
| Components | Inflation chips, rules register, Your assumptions | 391 | 0 |  |
| Explore | Explore structure, statement cards, Add to my plan sheets | 71 | 0 |  |
| §17 / §19 | Explore order and rows, emoji accessible names, Ask visibility, Settings block, admin view, partner override, workbook Settings | 248 | 0 |  |
| §15 / §16 | Example cards, statuses, checklist, gaps in calculators; LifeMap cover, Q8, tile | 487 | 0 |  |

## Changed in this rebuild

- **Copy pass (§20):** the doc follows the reworded prototype text: the step 7 and Your assumptions intros, the What your plan assumes intro and its "How the plan works" and "Known limits" rows, the Emergency fund months note (6.1 and Appendix A), the "For the rest we show a suggestion or the standard" line in Appendix A. The change list is in docs/copy-audit.md.
- The workbook README lines that were reworded are not quoted in this document, so nothing else moved. Page count and file size are unchanged (320 pages, 13.5 MB).

## Open points (Appendix B of the spec)

- Budget 2027: not applied yet; only once final and official, from its own effective date (§17).
- Settings: 14 of 37 standards and the Central Bank July 2026 rates are marked "verify before release".
- The admin view is a prototype screen; access and approval of partner figures belong to the production build.
- The cover-through-work hint (death-in-service "usually a multiple of your salary") should be checked with a protection expert.
- Emergency fund months in C11 keep a value typed there after the goal changes it (typing in a calculator wins; the plan uses the latest). Consider showing the plan-wide value again.
- The cover photo is a placeholder; re-check contrast when the licensed photo goes in.

## Failures

None.
