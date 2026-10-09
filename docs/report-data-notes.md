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
