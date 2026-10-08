# Workbook completeness and accuracy recheck, round 2 (after the fixes and spec section 27)

Independent check, 8 Oct 2026. Prototype commit `94c659b`. Workbook: `final2.xlsx` (47 sheets, README v2.7).
Read-only on the prototype and the workbook; all runs were on copies, recalculated with LibreOffice (not Excel). Round 1 is `docs/workbook-completeness-recheck.md`. Spec read: `docs/journey-spec.md` section 27.

## 1. Verdict

**Ready with small changes.** Round 1's E1 to E13 are fixed (10 fixed, 3 partly). Section 27 is implemented correctly in the workbook: 135 plan scenarios and 280 calculator cases give 0 differences. The few new issues are: out-of-range age gives a silent plan for age 0 instead of a gate (workbook), the deposit-earn rate counts 0 although the screen says an assumed rate is used (app and workbook agree with each other, but not with the screen or with spec 27.6), and the UI layer and README do not yet show the new section 27 states.

## 2. What was run (counts)

| Check | Count | Result |
|---|---|---|
| Live walk, 6 customers (demo; blank at cover; blank app; partner + two mortgages, cautious, goals dated in the past; **early retirer** age 45 with partner retiring at 50; **gate** customer with retirement age, plan-until age and inflation all missing) over every Jump screen, Explore, Plan views, chapters, what-if, Me, Settings, Experts, Ask, Report | 788 screen states, 0 page errors | every number maps (section 3) |
| Round 1 hand-built scenarios, regenerated from the new prototype | 41 | FAIL 0 (incl. the 9-funded-goals case that failed in round 1) |
| Built-in sample (Fill example, and typed copy) | 2 | FAIL 0 |
| **New section 27 scenarios** (single retiring at 40, 45, 50, 55, 60, 66, 75; partner versions with partner retiring at 45, 50, 55, 60, 62, 66, 70; access age 50 and 60; each required choice missing, all four missing; partner income with no partner retirement age; unchosen mortgage, card and loan rate; 9, 12, 15 and 20 goals; hidden defaults) | 30 | FAIL 0 |
| Extra boundaries (retire at age + 1, plan-until - 1, equal to age, equal to or above plan-until, partner age + 1, access 50 with retirement at 49 and 50, early retirement with mortgage, self-employed, cautious, what-if, ranked) | 15 | FAIL 0 |
| The harness's own random generator, my seed 9091 (about a third retire early, 8% miss a required choice) | 47 | FAIL 0 |
| **Plan total** | **135** | **FAIL 0 of 135** |
| Without the two typed search figures fed in (control) | 30 | 22 fail, only on the goal line, "biggest decision" and the "before" %. Everything else equal. Confirms the typed helpers are still typed |
| Calculators 28 x 10 (defaults, min, max, random, zeros, zero inflation, 3.9% and 3.1% inflation with adjust, partial and full blank gates) | 280 cases, 1,584 outputs | 0 differences |
| Gate wording, workbook against app | 32 gate cases | **32 of 32 identical** (round 1: 8 of 48) |
| Formula errors | 70,365 formulas | 0 error values blank, 0 with Fill example |
| Min and max of every validated C-sheet input | 168 inputs | 0 errors |
| Names, register links | 2,000+ names; 103 register rows, 161 name tokens | 0 broken |
| UI pictures against a fresh render at this commit | 78 | 74 under 300 px different, 4 at 313 to 1,050 px (noise); none structural |

## 3. Mapping every number again (task 1)

Everything on all 788 states maps to a name, a Plan column, a C-sheet output, or a register row, including the new section 27 screens: the gate card ("To see your results we need 3 things" and its three rows) is `Gate_Card` and `Gate_Names`, "N of 4 chosen" is `Req_Got` and `Req_Count`, "Date has passed" is `GR#_AgeYear`, "Set by LifeMap", "Assumed: add yours" and the early-retirement result lines come from the plan engine rows (compared in the scenarios). The items round 1 listed as missed (M1 to M5, M7 to M10, M12 to M14) now have cells that the harness compares: `Fin#_St`, `Fin_Done`, `Prof_UmSec#`, `GR#_Year`, `Next_T/D/B`, `Wi_Text`, `Vid_*_Pct`, `Cat_N#`, `Home_Rough`, `Good_Count`, `Look_Count` (all equal in the 135 runs).

Still not in the workbook (display text or typed on purpose), none changes a number:

| # | Screen | Label | Where it should live | Sev |
|---|---|---|---|---|
| U1 | Step 7 and Me > Your assumptions | "any age from 39 to 94" (own age + 1 to plan-until - 1) | two cells `Retire_Min` and `Retire_Max` | Low |
| U2 | Same | The two calm notes: "Retiring before 50 is possible. Pensions can usually be drawn from 60 ..." and the before-60 note | one text cell each, shown when the retirement age is below 50 or 60 | Low |
| U3 | Step 6 / Check your details | "Assumed: add yours · we use your age / Employed / 25 years" for the three hidden defaults | One status cell per default; today they are only counted (in `Missing_Count`) | Low |
| U4 | Results, Report | Goal line, "biggest decision" and the "% before" with the what-if on | still typed helper cells (documented in `Plan how it works`). The Fill example hides this because it is typed in | Known |
| U5 | Ask sheet | Question text quoting plan figures | register row 66 says display-only | Known |

## 4. Round 1 errors: fixed or not

| # | Round 1 finding | Status | Evidence |
|---|---|---|---|
| E1 | C23 optional repayment gated the result | **Fixed** | C23 outputs equal the app in all 10 cases (round 1: 32 differences) |
| E2 | More than 8 funded goals diverged | **Fixed** | `Plan inputs` now has `Goal1` to `Goal22`; 9, 12, 15 and 20 goal plans and the round 1 nine-funded case all FAIL 0 |
| E3 | No validation on Plan inputs, Settings, Plan profile; age 100 gave 16,800 error cells | **Partly** | Validation now 162 rules on `Plan inputs`, 39 on `Settings`, 4 on `Plan profile`. Plan-until 20 and 200 give the gate "Choose your plan-until age to see this"; retirement age 0 or 200 and inflation 5 or -0.5 give gates; 0 error cells. **But age 100 (or 17) gives no gate: the cell is read as 0, the plan runs for an age-0 customer and shows Home_Avg 100%** (new defect N1) |
| E4 | Gate wording differed from the app | **Fixed** | 32 of 32 gate texts identical |
| E5 | Mixed units | **Fixed** | Every `Plan inputs` rate is now a fraction; labels read "rate: 0.0375 = 3.75%" and "the app shows it as a %, here a rate" |
| E6 | Magic numbers | **Mostly fixed** | 66, 80, 61, 71, 0.0375, 0.2, 20000 and the plan-end defaults are gone from formulas (names such as `PR_SPage`, `PR_SFTfrom`, `PR_StartSwitch`). Left: literals 2026 and 2027 in 93 formulas (`IF(TODAY()>PR_StartSwitch,2027,2026)`), range limits repeated in each input formula and in its validation rule, 94 and 95 band thresholds |
| E7 | Typed copies in text | **Mostly fixed** | 3.9% typed in 0 cells (was 20); 4 left for `4.35%`, 5 for `90%`, 4 for `€200,000`, 1 each for `38%`, `€254`, `€13,000` |
| E8 | Register "max 4" tools | **Fixed** | Row 10 now "the first 6 of the list" |
| E9 | Register "Retirement at a glance" screen | **Fixed** | Row 33 is "Explore > C12 pre-filled from your plan" |
| E10 | `calc-vs-xlsx` not in repo | **Fixed** | `tools/calc-vs-xlsx/` exists; my own 280-case run agrees with it |
| E11 | README | **Partly** | "eight sheets starting Plan" corrected; Settings and Your lists linked; row 132 moved. The four UI sheets are listed in row 150 without links, and the sentence still says "not in the file until the script is run" (stale: they are in the file) |
| E12 | Zero pasted outside the allowed range gave errors | **Mostly fixed** | 14 of 15 inputs now give a "Choose ..." message or a gate; C20 `Style` = 0 still gives 9 error cells |
| E13 | "in -4 years" | **Fixed** | "Date has passed" and "Change the date" appear in the app; `GR#_AgeYear` equals it in the harness (past-dated goals included) |

## 5. New defects and observations from section 27

| # | Where | What | Expected | Got | Sev | Owner |
|---|---|---|---|---|---|---|
| N1 | Workbook `Plan inputs` In_age (G5, Has_age) | An age outside 18 to 80 or a non-whole number is read as 0 silently. Same for other typed cells (they fall back to 0 or blank) | A gate row, like the other missing choices, or at least a message | Age 100: no gate, `F_N` 95, `Home_Avg` 100%, every goal "covered" | Medium | Workbook builder |
| N2 | App and workbook, deposit-earn rate (Rent vs buy) | Spec 27.6 says an unchosen deposit rate uses the suggested published rate. The Step 7 row says "Back to the assumed rate (1.29% after DIRT)" and is tagged "Assumed: add yours", but the engine counts 0 (`ASM.depEarn` has `fb:() => 0`, `opt:true`) | 1.29% (about €4,772 opportunity cost in my test: rent 1,500, price 350,000, 10 years) | 0% (opportunity cost €0). The workbook equals the app, so both are wrong against the spec | Medium | Planner (app), then workbook builder |
| N3 | UI Guide, UI Screens, UI Make my plan | No row or picture for the new states: the gate card ("To see your results we need N things" is found 0 times in the UI sheets), "Date has passed", the early-retirement notes. The 25 plan screens show the sample customer only | Pictures and rows for those states | Missing | Low | UI/UX person |
| N4 | Step 7 heading | "Choose 4 things" with "4 of 4 chosen" for a customer who already chose all four | "All 4 chosen" or similar when none is left | Heading unchanged | Low | Planner |
| N5 | README row 150 | See E11 | | | Low | Workbook builder |
| N6 | Hidden defaults | Labelled well in the app (Partner's age "Assumed: add yours · we use your age", Your work "... we use Employed", Years left "... we use 25 years", unchosen rates "we use the Central Bank average rate") and counted in "N details missing" (harness compares `Missing_Count`, 0 differences). Unchosen rates actually used: mortgage 3.48%, card 20%, other loans 6.72% (the suggested rate, not the 8% planning rate), buying fees 0 | | OK | Observation | |

## 6. Quality items again

- Units: fixed (E5). Magic numbers: mostly fixed (E6). Typed constants in text: mostly fixed (E7).
- README: list and counts correct except the four UI sheets (E11); "Version 2.7".
- Register: 103 rows, 161 name tokens, all exist; summary 103 / 90 / 5 / 8; 5 known gaps are display text.
- Validation: see E3 and N1.
- Excel: only `_xlfn.MINIFS` needs Excel 2019 or later. No Excel run.

## 7. Ranked fixes

| Rank | Fix | Owner |
|---|---|---|
| 1 | N2: use the suggested deposit rate when unchosen (spec 27.6), or change the label and spec to "counts 0"; then update the workbook | Planner, then workbook builder |
| 2 | N1: gate row (or message) for age outside 18 to 80 and for other unreadable typed cells | Workbook builder |
| 3 | E11 / N5: README row 150: add the four hyperlinks, delete the stale sentence | Workbook builder |
| 4 | N3: add the gate card, "Date has passed" and early-retirement notes to the UI sheets | UI/UX person |
| 5 | U1 to U3: `Retire_Min`, `Retire_Max`, the two retirement notes, the three "we use" status cells | Workbook builder |
| 6 | E12: guard C20 Style = 0; E6/E7: replace the remaining typed 2026 / 2027, `4.35%`, `90%`, `€200,000` | Workbook builder |
| 7 | N4: heading wording when all four are chosen | Planner |
| 8 | U4: keep, or add the 13-trial table so goal lines work without typed figures | Dev lead |

## 8. Not checked

Excel itself; PDF layout; `ui-check2.md` text coverage beyond the pictures; the Word spec. `TODAY()` still drives the start-year standard and statement age, in app and workbook.
