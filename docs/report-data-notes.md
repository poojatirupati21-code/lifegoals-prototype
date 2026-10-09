# Report data: phase 1 notes (planner, 9 Oct 2026)

`reportData()` lives in the prototype between `/* REPORT DATA */` and `/* END REPORT DATA */`. It only reads the engine (`repRun(over, fn)` runs `project()` once on a private copy with one change; `S` is unchanged afterwards and a second call gives the same result). Phase 1 covers pages 1–7 as a data model (cover, onePage, money, roadmap, cashflow, scenarios). It is **not yet in the shape of `docs/report-data.schema.json` v1.0.0**: the mapping to the renderer's display fields (`plan.big`, `money.tiles`, `scenarios.groups`, …) is phase 2.

## v5 customer set-up (tools/report/v5-customer.js)
Born 1999, start year 2026, State Pension chosen as 0 a week, rent credit on, auto-enrolment answered No (take-home €55,502), saving cap "up to €1,000 a month", life cover and health insurance Yes, the other three protection answers No, gross pay €79,000, living costs €3,000 a month, rents, retire at 50, plan to 80, inflation 3.9%, goals: Grow my family age 30 €15,000; Retire comfortably €40,000 a year in today's money.

## Comparison with v5 (our value / v5)
Identical: 5% retirement and 100% family; run-out at 52; peak €289,942 at 49; 29 years with a gap; ≈€1.1m today / €5.3m future; €812 left, €813 goals, €18 per €100; 2 funded years of 31; family €441 needed / €441 put in; the two "close the gap" card bodies (State Pension, pension); the roadmap sentences for the 20s–70s to the euro; 53 of the 54 appendix rows (income, needs, shortfall, savings left) to the euro.

| Scenario | v5 covered / gap starts | ours |
|---|---|---|
| Retire 60 | 11 / 63 | 11 / 63 |
| Pension at the limit €987 (€592 after relief) | 24 / 51 | 24 / 51 |
| Count State Pension | 29 / 52 | 29 / 52 |
| Save €850 more | 11 / 55 | 11 / 55 |
| Retire 60 + pension + State Pension | 70 / 65 | 70 / 65 |
| Retire 65 + pension + State Pension | 94 / 79 | 94 / 79 |
| Retire 65 | 16 / 68 | 17 / 68 |
| Pay €850 more into a pension | 33 / 52 | 32 / 50 |
| …and €425 more | 87 / 70 | 87 / 68 |

"Close the gap" points: ours +24 / +19 / +12 (v5 +24 / +19 / +11).

## Differences to resolve (decisions)
1. Age-80 row: our shortfall €299,917 vs v5 €303,867: our engine adds the over-80 State Pension increase (€10 a week) even when no State Pension is counted. **Fix in engine and workbook (no State Pension counted = no increase).**
2. Retire at 65: 17% vs 16%: cause unknown: **investigate**.
3. Pay more into a pension: v5 reads "€850 after tax relief, about 18% of take-home pay" (so €850 is the net cost; the gross contribution is larger); ours takes €850 gross from savings. **Test whether treating €850 as net-of-relief reproduces 33/52 and 87/70.**
4. "How complete is your picture": ours 12 of 21 vs v5 15 of 27: different item count; priority list matches. **Define the items explicitly (document the list) and match v5's 27 if it can be reconstructed; otherwise keep ours and document.**
5. The page-2 headline and sub-line wording is rule-generated and tested for v5 only; the missing-items priority table is the planner's: Pooja/PM to confirm.
6. Net worth reads "not yet known" whenever cash, investments, pension, cards or loans is missing.

## Phase 2 decisions and results (schema 1.0.0)

`reportData()` now returns the schema 1.0.0 object (all 11 pages); the phase 1 data model is `reportModel()` (kept for the reconciliation tests). s28.js validates the v5 customer and 100 generated customers with jsonschema (0 errors) and runs the schema invariants (goal counts, one bar and one appendix row per year, no NaN or undefined text, four questions, five levels). `tools/report/vectors.json` holds 30 customers plus the sample customer (inputs in the plan-vs-xlsx scenario format and the whole output; today fixed to 8 Oct 2026; two vectors have required choices missing and return `{ready:false, missing}`). Rebuild it with `node tools/report/make-vectors.js`.

1. **Over-80 increase (fixed, engine and workbook):** the €10 a week over-80 increase is added only when a State Pension is counted. The v5 customer's age-80 row is now €303,867, the future-euro gap €5,328,044 and the covered amount €294,698 (about €295k), exactly v5.
2. **Retire at 65 (explained and fixed by 1):** the 17% came from the same over-80 increase (17.02% before, 16.98% after). Now 16% / 68, as v5.
3. **Pay N more into a pension (kept ours):** treating N as the net cost after tax relief (gross = N / (1 - tax rate) = €1,417) gives 32% / 50 here (v5 33% / 52); the extra money comes out of spare money, so savings run out two years earlier. Paying it without touching savings (the what-if path) gives 28% / 52 at €1,417 and only reaches 33% at about €1,700 gross, so no reading of "€850 after relief" reproduces both v5 numbers. We keep the engine-consistent result and word it "After tax relief". The combined "+ €425 more" row is 87% / 68 (v5 87% / 70), same reason; that row also says when it takes money from another goal.
4. **How complete is your picture (kept ours):** the items are the Check your details items for this customer: first name, date of birth, work, income, monthly costs, home, cash savings, investments, credit cards (owed, monthly payment), other loans (owed, monthly payment), life cover, income protection, serious illness cover, cover through work, health insurance, pension value, monthly pension payment, auto-enrolment answer, State Pension: 21 items (more appear with a mortgage, a partner, goals-specific items). v5's 27 cannot be rebuilt from its page 3 list and the Your finances fields, so we keep 12 of 21 and say so. The priority table (High: pension value, cash savings, State Pension record, income, costs, mortgage; Medium: loans and cards, investments, monthly pension, protection) is the planner's, for Pooja/PM to confirm.

### Remaining differences from `tools/report/mock-v5.json` (v5 customer, every one explained)

| Path | Ours | Mock | Why |
|---|---|---|---|
| `cashflow.paidChart.bars[3].fromSavings` | 16,824 | 0 | v5's bars leave out goal payments (the family goal in 2029); ours includes them so each bar is living costs plus goal payments. Honest, and the appendix still shows needs only |
| `cashflow.paidChart.bars[25].fromSavings` | 98,075 | 98,076 | a one-euro rounding |
| `foundations.levels[4].status` | about €1,625 a month spare | about €812 | the app's foundations function reports spare money before saving; v5 shows what is left after goals |
| `foundations.protection.nextBest.text` | "…You're 4.5 of 6 months there." | "…Add your savings so we can check it." | the app estimates months of cover from the customer's answer |
| `foundations.personality.note` | adds "Something to watch: …" | "You like risk but dislike losses: …" | v5's second sentence is not in the app; the app's own "watch" line is used |
| `riskScale.labels[3,4]` | Balanced–growth, Growth | Balanced–adventurous, Adventurous | the app's approved risk labels |
| `goalsDetail.goals[0].bars.coverPct` | 9.5 | 9.8 | exact 118,205 / 1,240,000; v5 divided the rounded figures |
| `money.complete.have/total` | 12 / 21 | 15 / 27 | see 4 |
| `money.exampleChip` | "" | "example" | the chip is only for demonstration customers |
| `scenarios.groups[0].rows[6]` (pay more into a pension) | 32% / 50 | 33% / 52 | see 3 |
| `scenarios.groups[1].rows[1]` (+ €425 more) | gap from 68 | 70 | see 3 |
| `scenarios.toTone` | gold | coral | 94% is in the gold band (70 to 94); the mock colours it coral |

Everything else (all other 400+ values, including every appendix row and the page 7 table except the two rows above) is identical to the mock.
