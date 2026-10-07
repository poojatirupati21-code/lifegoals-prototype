# UI/UX calculator spec: automated check (prototype and workbook at commit df87e94, journey-spec §14 to §26, 7 Oct 2026)

Document: deliverables/LifeGoals-Calculators-UIUX-Spec.docx (file name unchanged; the product is LifeMap). A4, **331 pages, 17.5 MB**, 28 calculators (C01 to C28), rebuilt from:
- the prototype and the workbook, both as committed in df87e94 on branch claude/simplify-customer-journey-zqxep3: journey-spec §14 to §26 (the §19 feedback items, the §20 copy pass, §21 Experts boxes and Focus tiles, §22 skippable Step 7, §23 Emergency fund naming, cover photo and Budget 2027 note, §24 Liabilities, What-if and saving files, §25 photos on tiles and two real videos, §26 What-if order and labelled example figures, and the planner, developer and PM review rounds)
- the workbook as committed (new sheets "Settings" and "Your lists", their named cells, the new guidance texts)

The screenshots are palette-quantised PNGs (256 colours, no dithering) to keep the file small; the text was not touched. I converted the docx to PDF with LibreOffice and looked at sample pages: 3.7 (Settings: standards table, partner override, admin view, workbook sheet), 4.8 (the item block, Liabilities, Protection, Pension, per-item upload), 4.9 (complete on save), 4.10 (workbook Your lists and the calculators that use it), 6.1 and 6.2 (months, goal order). Layout, tables and images are fine. LibreOffice's PDF font has no glyphs for a few newer emoji; they are in the .docx text.

## Result

**7603 checks passed, 0 failed. Browser console errors: 0.** The check was run against the final docx and the prototype and workbook named above.

**Planted-error test.** I made a copy of the docx with 26 deliberate edits and ran the same check on it. It found all 27, which showed up as 83 failed checks (7520 passed). The 27 edits:
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
17. A specialist box blurb ("Life cover, income protection, serious illness" changed to "… income cover …", 2.5)
18. A Focus on one area tile blurb ("Budget, surplus and debt" changed to "Budget, spare cash and debt", 2.2)
19. The Step 7 button ("Use the standards for the rest" changed to "Use the standard for the rest", 3.5)
20. The results banner ("3 details missing" changed to "3 details left", 3.5.1)
21. A video title ("Your retirement plan: how it works" changed to "…how it work", every occurrence; caught by the 2.6 video row check)
22. The What-if live line ("With this what-if you" changed to "With this what-if we", every occurrence; caught by the 7.2 check)
23. A Liabilities label ("Do you have a mortgage?" changed to "Do you have a mortgage loan?", every occurrence; caught by the 4.8.2 check)
24. The "Use the standards for the rest" card text ("One tap uses the standard for" changed to "…standards for"; caught by the 7.5 check)
25. The example-figures label ("Example figures. Change them to yours." changed to "…Change them.", every occurrence; caught by the 2.7 check and the Explore tool checks)
26. The investment standard wording ("less about 1% charges" changed to "2%"; caught by the 7.7 and Settings checks)

27. The standards card remainder ("3 choices will still be yours to make" changed to "18 choices…"; caught by the 7.5 checks)

(The results-banner edit, number 20, was re-aimed at the new banner wording "3 details missing.")

## What is checked

A fresh headless Chromium run (390×844, scale 2), separate from the screenshot run, rebuilds every documented state for every calculator and compares the live DOM with the docx XML (gates, blank inputs and guidance, suggested-rate chips, "Assumptions this tool uses", inputs tables, screen values, result templates, limits and hints, choice chips, workbook output names and values). Shared parts: inflation chips, the rules register (82 keys), every Your assumptions input, Set by Government card, step 7, "What your plan assumes", Explore, statement cards and Add to my plan sheets.

**§15 and §16 (516 checks):** all 47 reachable example cards (opened from their links, compared with section 4.4 by title and "shown on", Escape closes, focus returns, field and lists unchanged; the 7 old single-total cards must have no link); status tags; checklist rows; gates and worked-out lines; the cover, D1, Emergency fund tile.

**§17 to §19 (248 checks):**
- **Explore, emoji, Ask** (as last round): section order and the six Calculators rows; emoji in aria-hidden spans for all 28 titles; Ask hidden in onboarding and shown in the app.
- **Settings:** the live SETTINGS block has 37 standards and every one equals its row in 3.7.1 (name, standard as formatted, wording or chip label, source, as-at, guidance, verify flag); each equals the workbook Settings sheet (Set_{key}, Set_{key}_1 to _3 for the three-value rows, Set_{key}_Label, Set_{key}_Cautious); the 2 guidance figures, the fixed values (Ireland now 3.9%, the 23% card cap) and Partner_Name are in the workbook and 3.7.
- **Admin view:** its note, partner-name label and group summaries equal 3.7.3; it is marked "🔒 Admin view · not for customers" and sits in the jump list.
- **Partner override:** with a partner name and changed figures set live, the inflation help and chip, Emergency fund months guidance and chip, mortgage chip and the unchanged pay-rise guidance and loan chip equal the strings in 3.7.2; "Suggested by {partner}" appears only beside the changed figures; the "Changed by" tag and "Back to the LifeMap standards" link are in the doc; the block is reset afterwards.
- **Lists:** every add button, upload text and item field label (cards, loans, pensions, 5 policy types) is in 4.8; the Liabilities, Protection (lead-in, no generic upload, five add buttons, work-cover hint) and Pension screens match; the per-item upload (confirm screen, toast, "From …" row) equals 4.8.4; a saved section is Done even with blank fields and Missing reads "Missing · optional, counts as €0".
- **Workbook Your lists:** every named total (13 of them) is in 4.10 and the intro text matches; exactly C12, C13, C14, C21, C24 and C25 fall back to the totals (each cell, label and name equals the workbook formulas); C27 and C28 are not fed.
- **Emergency fund months:** calculator 3, goal 4, step 7 shows 4 (tag "Your choice"); one fresh run proves the goal value reaches the calculator; every string in 6.1 equals the live screen; the edge (typed in C11, later changed in the goal) is in the doc.
- **Goal order:** the Emergency fund is first by default, movable, reset restores it; heading, help, aria-labels, messages, version notes and the results order in 6.2 equal the live card.

**§21 and §22 (29 checks):** the six Focus on one area tiles (emoji, name, blurb and --art slot equal the live tiles in 2.2; the grid, honesty and contrast lines); the five specialist boxes on the Experts tab, C0 and C1 equal 2.5 and the old chip row is gone; Step 7 (3.5): the "Choose 3 things" card, counter, "Everything else" card, the standards button and its note, both buttons disabled before the 3 choices, no tick, the standards button leaves the 3 unchosen; Skip opens results with a banner; the 1 and 3 missing banner texts equal 3.5.1.

**§23 to §25 (new in this rebuild).** Re-driven live and compared with the docx text: Emergency fund naming (gate, label, group, assumptions row, calculator question; the Lifecast wording that stays is listed in 7.1 and each item is still in the prototype; no stray "safety net" anywhere else in the document); the cover (JPEG slot, position, the four-viewport contrast table with every line at 4.5:1 or better, the honesty note about the 912 × 502 photo); the Budget 2027 note (same words in the sheet, the footnote and 7.4, no Budget figures named); the Focus tiles (five photos and their object-positions in 2.2, Protection drawn); both real videos (a row each in the 2.6 table: title, topic, length, file, poster, tool; Home strip; failure message; captions line; "NOT embedded" note); Liabilities (question, add button, four other-property fields, order); What-if (section titles, labels, live line, warning); saving files (every message, file name, library URL, the honest limits). The four other-property mortgage example cards (mort2.*) are now reached and compared like the other 49, so 53 cards are checked (60 keys less the 7 old single-total cards).

**§26 and the fix rounds (new, about 75 checks).** Re-driven live and compared with sections 2.7 and 7.5 to 7.14: the "Use the standards for the rest" card on the gate and Home (15 standards, gone after the tap, and the card now lists only the real remainder of 3 choices); the other-property mortgage gate (clears with years or a repayment); the derived investment standard (2.6%, cautious 1.9%, 3.3% at 6% growth) and the workbook Set_inv, Set_inv_Cautious values and formula, the workbook Set_inv_Label equal to the app wording, and the charges override (1.5% gives 2.3% and 1.6% in the app and in the workbook formula); the three "main strength" outcomes; 4 required choices with a partner income and 3 without, the partner retirement age field and the Known limits row; the unknown-rate buttons, planning-rate note and "What your plan assumes" rows; the Emergency fund goal equal to months times essential spending and the typed-amount note; the repayment flag (on, off, off with no rate); all 32 partner-override ranges; no invented age (blank box, Next off, "Not given yet", the add-age sheet); What-if order; the example label on all 28 tools (top) and hidden with a plan; the report dialog (focus, inert background, Esc returns focus); the single banner; the Explorer watch-out; the workbook README 2.4, Budget note block and calcPr.

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
| §21 / §22 | Focus on one area tiles, Experts specialist boxes, Step 7 skippable, results banner | 29 | 0 |  |
| §15 / §16 | Example cards, statuses, checklist, gaps in calculators; LifeMap cover, Q8, tile | 516 | 0 |  |

## Changed in this rebuild

- **7 October rounds (§26, planner, developer):** new 2.7 (example figures), new 7.5 to 7.14, and updated 3.5 (Step 7 with 3 or 4 choices), 7.1 (the Explorer watch-out no longer says safety net; the C11 text had come from a stale workbook export and is now from the final workbook), 7.2 (What-if order) and 7.3 (print fallback "Nothing opened"). The doc check re-reads the Explore tool result lines without the new example label (the label is documented in 2.7). "Also still to choose:" is the live gate wording again, so it is no longer on the old-wording list.

- **§23 to §25:** new 2.6 (the two videos and the media folder), cover photo and contrast table in 5, Emergency fund naming (7.1), What-if card (7.2), saving the plan and meeting details (7.3), Budget 2027 note (7.4), Liabilities mortgage first (4.8.2), photos on the Focus tiles (2.2); first-page list of files to keep together. Design tokens that hold pictures now read "url(embedded photo, N KB)" instead of the raw data.
- **Check fixes:** the card check now opens the other-property mortgage item so its four example cards are compared; the saving-files check reads apostrophes the way the browser does. **A bug in the previous committed doc is fixed:** the design-token table split the picture slots (data URIs with a semicolon) into about 40 pages of random text (section 1 ran from page 5 to page 48). Section 1 is now 9 pages, so the previous document was 336 pages and this one is 331 although it has much more content. The calculator sections are unchanged in length.

- **§21 and §22:** new 2.2 (illustrated square tiles, art slots, scrim, reduced motion), new 2.5 (Talk to a specialist), rewritten 3.5 (Step 7: Choose 3 things, standards for the rest, Skip) and new 3.5.1 (results banner). Screenshots were recaptured and palette-quantised. All tile and box text is checked against the live prototype.

- **Copy pass (§20):** the doc follows the reworded prototype text: the step 7 and Your assumptions intros, the What your plan assumes intro and its "How the plan works" and "Known limits" rows, the Emergency fund months note (6.1 and Appendix A), the "For the rest we show a suggestion or the standard" line in Appendix A. The change list is in docs/copy-audit.md.
- The workbook README lines that were reworded are not quoted in this document, so nothing else moved. Page count and size are in the first paragraph.

## Open points (Appendix B of the spec)

- Budget 2027: not applied yet; only once final and official, from its own effective date (§17).
- Settings: 14 of 37 standards and the Central Bank July 2026 rates are marked "verify before release".
- The admin view is a prototype screen; access and approval of partner figures belong to the production build.
- The cover-through-work hint (death-in-service "usually a multiple of your salary") should be checked with a protection expert.
- Emergency fund months in C11 keep a value typed there after the goal changes it (typing in a calculator wins; the plan uses the latest). Consider showing the plan-wide value again.
- **Defects found earlier in this round, now fixed by the planner in df87e94:** the standards card repeated every missing item under "will still be yours to make", and the workbook investment label and charges input differed from the app. The doc and the checks follow the fixed behaviour. No defects are open from this check.
- Captions: the two real videos have none; the doc says "Captions not available yet" and no transcript is invented.
- Real video playback could not be tested (the test browser has no H.264); the doc says so in 2.6.
- Saving files: PDF generation was tested with the real jsPDF and html2canvas files served by a stub for cdnjs; the real Claude viewer and the real cdnjs were not reachable, so that is untested (7.3).
- The cover photo is 912 × 502; a larger portrait original is advisable (5).

## Failures

None.
