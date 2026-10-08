# Workbook completeness and accuracy recheck

Independent check, 8 Oct 2026. Branch `claude/simplify-customer-journey-zqxep3`, commit `caae424`.
Workbook checked: `final.xlsx` (47 sheets), the final candidate. Prototype: `LifeGoals-Customer-Journey-Prototype.html`.
Nothing in the prototype or the workbook was changed. All runs were on copies, recalculated with LibreOffice (not Excel). Scratch files are in the session scratchpad under `recheck/`.

## 1. Verdict

**Ready with changes.**

The calculators and the plan engine agree with the live app everywhere I could reach: 0 mismatches in 1,491 calculator outputs except one real defect (C23), and 0 mismatches in 42 of 43 plan scenarios. The one plan failure is a real limit (more than 8 funded goals). The rest is documentation drift, missing validation on the Plan sheets, magic numbers, and a short list of customer-visible numbers that exist in the app but have no workbook cell or register row.

Do not hand it to developers until fixes 1 to 3 in section 6 are done. Fixes 4 to 10 can follow.

## 2. What I did (counts)

| Step | What | Count |
|---|---|---|
| Walk | Live prototype, 4 customers (demo Aoife; blank at cover; blank app with a plan started; partner + mortgage + other-property mortgage, married, cautious set), every Jump screen, Explore (home, 6 topics, 6 categories, 7 videos, video list, all 28 tools), Home, Plan (journey, chapters with all 9 decade openings, detail, what-if, ranking, edit, goal highlight), Me (home, My money, Understand Me, terms, re-check, Your assumptions), Admin Settings, Experts (6 stages), Ask sheet, Report | 524 screen states, 8,849 number-bearing lines, 577 distinct line templates |
| Plan accuracy | Hand-built scenarios (not from `make_scen.js`), compared by the `plan-vs-xlsx` harness against `Plan inputs` through `Plan results`, `Plan profile` | 41 hand-built (25 designed in section 3, 12 hard cases, 2 goal-age-before-now, 1 long debts, 1 nine-funded-goals) plus the 2 built-in sample scenarios = 43 |
| Harness is not vacuous | Negative control: two expected values altered by 1 and 5 | harness reported FAIL on both |
| Calculators | 28 calculators x 10 input sets (defaults, all-min, all-max, 4 random, zeros, zero inflation, customer inflation 3.9%, inflation-adjust on with 3.1%, partial gate, full blank gate) | 280 cases, 1,491 outputs compared, 48 gate cases |
| Tax engine | 12 single-person incomes at band edges, 5 married, both PRSI bases, against the prototype `hhTax` | 32 comparisons |
| Constants | Every numeric leaf of `RI` (121) and the 37 `SETTINGS.s` entries against the workbook | 0 missing, 34 of 37 equal, 3 are multi-value rows that are split in the workbook |
| Quality | Names, links, formulas, validation, errors in blank / Fill / all-ones / min / max states, register links and line references, README, UI screenshots | see section 5 |

## 3. Completeness: customer-visible numbers with no workbook home ("missed")

Everything else on every screen mapped to a named cell, a Plan sheet column, a C-sheet result, or a register row. I confirmed the key demo screen values against the recalculated workbook in Fill mode: 19 of 19 named outputs appear verbatim on the live screen (Home_Avg 73, Home_OnTrack 2 of 5, Save_SaveM 62, Save_SurplusM 125, the five Fnd*_S lines, Find_Strength, Find_Gap, Chart_FirstShortAge 41, Chart_FirstShortAmt 9,091, Chart_ShortYears 21, Chart_TotalShort 528,201, and so on). Every calculator result number shown on the 28 tool screens maps to a `num` output that the workbook reproduces (971 displayed tokens, 0 unmapped apart from "N yrs M mo" splits).

Severity: **W** = wrong or missing calculation, **D** = display-only or wording derived from numbers already in the workbook.

| # | Screen | Label as shown | Value example | Where it should live | Sev |
|---|---|---|---|---|---|
| M1 | My money / Finances hub (step 6) and Me > My money | Section progress "5 of 6 done", "Your finances · 6 of 6", per-section Done / Needs a look / Not started | `secStatus()` line 1494 | New rows in `Plan results` and a register row. The rule needs where each figure came from (typed, document, pre-filled), which the workbook does not hold, so also add a provenance input (typed / document / blank) per figure | W (rule missing, not even in the register) |
| M2 | Me > Understand Me | "2 of 3 answered", "2 of 5", "3 of 5", "1 of 7 answered", "7 quick questions · your first 6 answers are filled in" | per-section counts | `Plan profile`: only the total `Prof_UmCount` exists. Add `Prof_UmSec1..3` | D |
| M3 | Plan, Timeline, goal tiles, Confirm my LifeMap, Report section 4 | Calendar year beside every goal: "age 41 · 2030", "(2037)", "Age 63 · 2052" | goal age minus age plus `AS_Year0` | `Plan goals`: add `GR#_Year`. Only "in N years" (`GR#_When`) exists | D |
| M4 | Home, Plan | "Next best step" when the weakest item is a goal ("Travel is 28% covered ... moving it later ...") | register row 6 | Known gap (register: "Partly built"). The foundation half is built. Specify the goal half as a formula table | D, but visible on Home |
| M5 | Plan > What if | "Emergency fund goes from 46% to 79%", "Travel goes from 28% to 98%" and the "What changes" sentence | `wiText()` | Known gap. `GR_PctB` (before) and `GR_Pct` (after) exist, so build the sentence from them | D |
| M6 | Results goal lines, findings "biggest decision", Report section 4 | "Needs about €337 a month ..." line and the decision sentence | `extraTo100` / `extraFor` searches | Known and documented (typed helper cells). Consequence: with "Fill example values = Yes" the workbook shows "Type the extra the what-if search finds in column L to see this line" instead of the app's line, so the demo cannot reproduce the main Results text. Add a 13-column trial table or pseudo-code plus test vectors | W for a developer, documented |
| M7 | Explore home | "Try a what-if for travel: 28% covered now" (one tile per goal), "Because travel needs a nudge" | goal % | Add register rows. Value is `GR#_Pct`; only the order rule is described (row 63) | D |
| M8 | Video page | "Why this is for you: Your be mortgage-free goal is 100% covered" | goal % picked by video kind | Add a register row (video kind to goal spec rule) | D |
| M9 | Explore, category list | "7 tools", "3 tools", "5 tools" per category | counts of CALCS by category | Derivable from the README list (Category column). Add `COUNTIF` or note it as a constant | D |
| M10 | Plan, Chapters | Per-year labels "Comfortable", "Using savings", "Gap to plan for: short €29,476" | fields exist (`used`, `short`) | The three-way label rule is not written down. Add one row | D |
| M11 | Ask sheet | "Why is travel 28% covered?", "What happens when I retire at 63?" | askPlan | Known gap (register row 61) | D |
| M12 | Home / Plan | "Based on what you've told us. 20 details missing. ... rough picture" | `roughNote()` | The count (`Missing_Count`) is built; the rule that decides whether the note shows is a known gap (register row 4) | D |
| M13 | My money / Check details | "28 details look good", "N need a look" | `checkItems()` | `Missing_Count` covers the "look or missing" half. The "look good" count (all other items) is not a cell | D |
| M14 | Report header | "Created 29 Sep 2026 · version 2" | `S.versions` | Constant. Note it in the register as not a calculation | D |

Not missed, but worth knowing: the Settings admin screen's numbers all match `Settings` (34 of 37 equal, 3 are the multi-value rows `riskMu`, `riskVol`, `budget` held as `_1.._3`). The document confidence percentages (81%, 98% ...) are demo constants; the rule (below 80% ask to confirm, 12-month freshness) is on `Document reader spec` and `Assumptions`.

## 4. Errors found

Severity: **High** = wrong number or a limit that silently gives wrong plan results; **Med** = misleading or fragile; **Low** = text, tidiness.

| # | Sheet / cell | What is wrong | Expected | Got | Sev | Suggested fix |
|---|---|---|---|---|---|---|
| E1 | `C23 Mortgage protection` G17 (`Actual_Repayment`, typed cell C17) | The optional "Your actual monthly repayment (optional, 0 = work it out)" gates the result when left blank. Every other optional cell uses `=IF(ISBLANK(C),F,C)`; C23 uses the "blank stays blank" form. Only C23 has this pattern (scan of all 28 sheets) | Blank repayment falls back to the PMT repayment, as in the app (e.g. balance 250,000, rate 4%, 25 years gives repayment 1,319.59 and Balance in 5 years 217,762) | Balance in 5 / 10 / 15 years and Monthly repayment used all show "Choose your actual monthly repayment to see this". 32 of 32 comparisons wrong in 8 of 10 cases | High | G17: `=IF(ISBLANK(C17),F17,C17)`, and drop the repayment from the Need_2 helper |
| E2 | `Plan goals` rows 24 to 33, Slot1..8, `Slots_TooMany` (D57) | The engine holds 10 goal rows and only 8 funded goals. The app has no cap (15 goal kinds, I built a 15-goal plan, project() handles it). `Slots_TooMany` exists but nothing reads it and README / `Plan how it works` do not mention the limit | Same as app for any number of goals, or a visible "too many goals" gate | With 9 funded goals plus retirement: 53 mismatches (e.g. the 9th goal at age 46 costs 0 in the workbook, 59,986 in the app; savings left off by 50 to 150 a year from year 16) | High | Extend to 15 slots, or make `Slots_TooMany` show a gate message on `Plan results` and write the limit into README and `Plan how it works` |
| E3 | `Plan inputs` (161 yellow cells), `Settings` (94), `Plan profile` (15) | No data validation at all (0 rules in the sheet XML). README says "Each input cell ... refuses values outside it" | Same refusal as the C sheets | `In_age` 100 or `In_a_planEnd` 20 gives about 16,800 error cells (Plan cashflow 14,281, Plan debt months 2,376, Plan goals 80, Plan results 22). `In_partner` "Y", `In_work` "zzz", `In_home` "Own" are silently accepted | Med | Add list and range validation to every typed cell (ranges are in the prototype sliders), and one guard that shows "Choose a plan-until age above your age" |
| E4 | All 28 calculators, gate wording | When a required choice is blank, the workbook names it differently from the app, and in several sheets names a different item first. 40 of the 48 gate cases differ (8 are identical) | App: "Choose your mortgage rate to see this" (C01, C02, C04, C05, C06, C23), "cash growth" (C08), "growth before fees" (C09, C10, C18, C19, C17), "pension growth" (C13, C14), "pension growth once retired" (C15), "emergency fund months" (C11), "Illness Benefit" (C22), "credit-card rate" (C27), "loan rate" (C28), "withdrawal timing" (C16), "budget split" (C26) | "interest rate", "growth rate", "return", "emergency months", "Illness Benefit amount", "interest rate (APR)", "share for savings". C08, C09, C12 to C17 show the inflation gate first, the app shows the growth gate first | Med | Make one label table (Settings) used by both; copy the app's wording and order. The UI/UX person will read these strings |
| E5 | `Plan inputs` units | Three conventions for percentages. Typed statement rates use whole percent (`In_mortRate` 3.85, `In_cardRate` 22, `In_penChg` 1, unit column "%"); assumption rates use fractions (`In_a_mortRate` 0.0375, `In_infl` 0.02, unit column "rate"); `Your lists` rates and all C-sheet rates are fractions (0.0385) | One convention, or a visible unit on every cell | A developer typing 3.85 into a "rate" cell gets 385%; no validation to stop it (see E3) | Med | Pick fractions everywhere in the workbook and convert at the harness; or show "% (3.85 means 3.85%)" in the cell note |
| E6 | `Plan pay & tax`, `Plan inputs`, `Plan goals` formulas: magic numbers | Typed copies of constants that have names or belong on Settings: `66` (State Pension age and default partner retirement age) in 270 formulas although `PR_SPage` exists; `80` (State Pension over-80 step); `61` and `71` (ARF ages; the rates are named); SFT years `2026..2029` typed in the branch (T210) although `PR_SFT2026..2029` exist; `DATE(2026,9,30)` start-year switch (F84); default plan-end `90` / `95` (C117); internal fallbacks `0.0375`, `0.2`, `0.08`, `20000`, `0.01`, `0.6`, `0.8` (C114 to C116, C127, C132, C134); thresholds `99`, `50`, `1000000` | Each on `Assumptions` or `Settings` with a name | Ages and years change only if every formula is edited | Med | Name them: `PR_SPage` use, `PR_ARFAge1/2`, `PR_Over80Age`, `Default_PlanEnd_Single/Partner`, `Fallback_*` |
| E7 | C sheets, inflation note (B7 on each inflation sheet) | "Ireland's prices are rising 3.9% now (CSO HICP flash, Sep 2026)" is typed in 20 text cells across 10 sheets although `Set_inflNow` exists; `€115,000` (4 cells), `€200,000` (6), `4.35%` (4), `90%` (5), `€299.30` (2), `€254` (2), `€259.50` (2) are also typed in text | Built from the named cell with `TEXT()` | Update the figure and 20 notes stay old | Low | Build the sentence from `Set_inflNow` and the Assumptions names |
| E8 | `Calculation register` row 10 | "Tool list picked from the types of your goals (max 4)" | max 6 | The app's `toolsForYou()` ends `.slice(0, 6)`; `Tools_List` in Fill mode lists 6 | Low | Say 6 |
| E9 | `Calculation register` row 33 | "Results > Retirement at a glance" | Results screen does not show it | The pot, net lump sum and income a month appear on the C12 Retirement projection screen when it is pre-filled from the plan (€595,640 and €148,910 equal `Ret_PotNominal` and `Ret_LumpNet`: checked) | Low | Change the screen to "Explore > C12 pre-filled" |
| E10 | `Calculation register` rows 66 to 93 | Status "Matched in test (calc-vs-xlsx, 161 cases)": the `calc-vs-xlsx` script is not in the repo (`tools/` has only `plan-vs-xlsx`), docs elsewhere say 145 cases, and row 88 (C23) is wrong (E1). The `plan-vs-xlsx` harness does not read `Ret_*`, `Prof_KE` or `Expert_Idx` although rows 26, 33, 52, 58 say matched. (I checked `Prof_SuggestU9`, 39 of 39 equal, and `Ret_*` through C12.) | Re-runnable evidence | Not re-runnable | Low | Commit `calc-vs-xlsx` or reword; add the missing reads to the harness |
| E11 | `README` | (a) B2 "nine new sheets starting 'Plan ...' and the Calculation register": there are 8 Plan sheets plus the register. (b) The sheet list (rows 60 to 62) has links for Assumptions, Tax engine, Document reader spec only: no link for `Settings`, `Your lists`, or any of the four UI sheets (`UI Guide`, `UI Calculators`, `UI Screens`, `UI Make my plan`); the colour legend has no entry for the teal UI tabs. (c) Row 132 "Plan engine ... Now done" sits under "Not applied (for Pooja to decide)". (d) Version line 2.5 does not mention the UI layer | Complete sheet list and legend | As described | Low | Edit README only |
| E12 | C-sheets, typed 0 outside the validated range (paste, or the API) | 15 inputs give `#DIV/0!` or `#NUM!` when 0 is pasted below their allowed minimum (C01 Term, C02 Term, C03 Monthly saving, C04 Years left, C05 Years left, C06 Terms A and B, C07 Term, C08 Years, C11 Essential spending, C15 Retirement savings, C20 Style and Years, C23 Years left, C28 Years) | A "Choose ..." message | Error values. At the allowed minimum, maximum, blank, Fill and all-ones there are 0 errors (168 validated inputs tested) | Low | Wrap the first division in `IF(Used_x<min,"Choose your x to see this",...)` |
| E13 | Prototype observation (not a workbook fault) | After the customer raises their age, goals set earlier show "in -4 years" and "age 40 (2022)" on Plan, Ask and Report (I forced age 45 on a plan with goals at 40 and 41). The workbook copies the wording (`GR#_When` matched) | A "date has passed" wording | "in -4 years", "Emergency fund in -5 yrs" | Low | UX decision for Pooja; fix in app, then the workbook |

## 5. Verified OK (with counts)

- **Plan engine, 42 of 43 scenarios equal** the app (tolerance 1 euro per row field; goal %, band, line, when, months, year rows with 17 fields each, saving, gate keys and text, findings, 5 foundations with text, Home block, tools, expert, nudge, what-if live total, chart, road, chapters, profile). The failing one is E2. Cases include: blank gate (inflation missing), zero inflation, 4.5% inflation, age 18 and age 74, already retired, zero income, partner with no income, partner retiring at 80, married and unmarried joint assessment, income at 12,012 / 13,000 / 13,001 / 20,000 / 44,000 / 70,044 / 200,000, self-employed 6,000 and 140,000, SFT breach (900,000 pot, 3,500 a month), relief cap 115,000, ranked goals, what-if +350 / -300 and a one-off, saving above spare money, two other-property mortgages with a missing rate, cards and loans that never clear, credits (rent, lone parent, carer), AE off, extra pension, planEnd 80 / 100 / 105, goal ages before today and equal to today, 40-year mortgage, cautious set, all 13 goal kinds across batches.
- **Calculators**: 280 cases, 1,491 compared outputs, 32 mismatches (all E1). Zero inflation, customer inflation 3.9% and 3.1% with "Adjust for inflation", all-min, all-max, random and gate states are in that count. No case where the app shows a result and the workbook gates (0), none where the app gates and the workbook shows a number (0 NOGATE). Every one of the prototype's `num` names exists as a name on its sheet (0 NONAME, 0 NOENTRY).
- **Tax engine**: 29 of 32 equal; the other 3 were my call (married one earner passed without a second person); the workbook equals the audit table (3,000 / 15,400 / 43,400).
- **Settings and Assumptions**: 121 of 121 `RI` leaves and all 37 settings found with the same values.
- **Errors**: 42,830 formulas, 0 error values blank and in Fill mode (recalc.py both). Setting every typed input to 1: 0 error sheets. Min and max of the 168 validated numeric inputs, with the example fill: 0 errors.
- **Names and links**: 2,016 names, 0 broken; 668 links, 0 broken; 0 `#REF!`; 0 external links; no `_xlfn` problems (only `MINIFS`, Excel 2019+).
- **Calculation register**: 93 rows, 114 name tokens in "workbook place", 114 exist; 92 line references, 91 within 2 lines (one off by 7: `personality`). Summary cells: 93 / 78 / 6 / 9, consistent with the rows.
- **README list**: all 28 names, questions and categories equal the app's `CALCS`; C-sheet title, question and category cells equal the app (28 of 28).
- **UI screenshots**: 78 pictures, all same size as the live screens; 74 differ by under 300 changed pixels from a fresh render at this commit, 4 by 313 to 1,050 (clock and animation noise); none structural. Two pictures are 6,000 px tall with a large empty area ("Your assumptions" shows collapsed groups, so its 46 listed standards are not visible in the picture).
- **UI layer text**: the `ui-check.md` figures (0 labels missing on screen of 500 + 736 rows) were not re-derived; I re-ran `extract_ui.js` for the pictures only.

## 6. Ranked fix list

| Rank | Fix | Owner | Effort |
|---|---|---|---|
| 1 | E1: C23 optional repayment | Workbook builder | 5 minutes |
| 2 | E2: more than 8 funded goals (extend to 15 slots or gate and document) | Workbook builder, with the financial planner for the funding order | Medium |
| 3 | E3: data validation on `Plan inputs`, `Settings`, `Plan profile`; guard for age at or above plan end | Workbook builder | Medium |
| 4 | E4: gate wording and order table | Workbook builder with UI/UX designer | Small |
| 5 | M1, M2, M3 (+ M4, M5): add the missing cells and register rows; write the typed-search algorithm with test vectors (M6) | Workbook builder, dev lead for M6 | Medium |
| 6 | E6, E7: name the magic numbers, build notes from names | Workbook builder | Small to medium |
| 7 | E5: one unit convention or visible unit notes | Workbook builder | Small |
| 8 | E8, E9, E10, M7 to M14: register corrections and additions; commit or reword `calc-vs-xlsx` | Workbook builder, PM | Small |
| 9 | E11: README (sheet list, legend, "nine", row 132) | PM | 15 minutes |
| 10 | E12: friendly guard on zero; E13: past-date goal wording decision | Builder; Pooja | Small |

## 7. Not checked

- Excel itself (all recalculation was LibreOffice). `TODAY()` drives the start-year standard (2027 after 30 Sep 2026) and the statement-age check, in both app and workbook, so results change with the run date.
- The PDF print layout, the audio/video content, the Budget 2027 changes (not applied, stated in README).
- The `ui-check.md` text coverage claims beyond the picture comparison.
- Document reader extraction itself (a spec, not a calculation).
