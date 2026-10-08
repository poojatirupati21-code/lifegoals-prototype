# plan-vs-xlsx

Checks the Plan sheets of `deliverables/LifeGoals-Calculators.xlsx` against the live prototype, one customer at a time. Each customer's inputs go to the prototype (Playwright) and, cell by cell, into a recalculated copy of the workbook (LibreOffice). Then the results are compared.

```
export NODE_PATH=/opt/node22/lib/node_modules
tools/plan-vs-xlsx/plan-vs-xlsx.sh 120 23        # 120 random customers, seed 23; about 20 minutes
```

The deliverable is never touched (it works on a copy). The last line is `SCENARIOS n FAIL m`; every FAIL line above it lists the first differences. Read them all.

## The customers

- random customers (partner, mortgage and other-property mortgage, several pensions, cards and loans, rankings, what-if, every assumption) and 7 edge cases (no income, high debt, retired already, goal in year 0, only an emergency fund, no goals, retirement goal only);
- plans with 9, 12, 15 and 20 goals saved for from savings;
- `scenarios/recheck-41.json`: the 41 hand-built customers of the independent recheck (blank gate, zero and 4.5% inflation, ages 18 and 74, retired already, income at tax-band edges, Standard Fund Threshold breach, relief cap, what-if up and down, goal ages before today, long debts, nine goals ...);
- journey-spec section 27: about a third of the random customers retire early (any age from their own age + 1), some with the pension access age set to 50, and about 8% leave out retirement age, inflation or plan-until age so the gate card ("we need N things", in the app's order) is compared too; the unchosen market rates (CBI suggestion for the mortgage and loans, 20% planning rate for cards) are compared through the plan figures;
- the prototype's own sample customer, once with "Fill example values" on and nothing typed, and once typed in.

## What is compared

Every year of the plan (18 fields, within 1 euro), goal %, band, goal line and "in N years", the saving numbers, the gate keys and text, findings, the five foundations (status and text), the next best step, my-money sections and counts, the what-if text, chart / road / chapter numbers and per-year labels, goal years, retirement years, pot and income, the specialist type, the risk profile and money terms, the Understand Me counts and the details-missing count.

Two figures the app finds by searching are typed into the workbook from the app's own answer (see "Plan how it works" in the workbook): the extra a month that reaches 100% and the extra that closes the main gap; with the what-if on, the % before it is typed too. The findings, foundations, home counts, next best step and video lines are for the base plan, so they are only compared when the what-if is zero.

A known limit: when a goal is covered to exactly a whole percent (for example 94.000000%), floating-point rounding can differ between JavaScript and LibreOffice and the % can read 1 lower or higher (1 customer in about 190).

## Files

`make_scen.js` (random and edge customers; `NFUND=n` makes many-goal plans), `gen_scen.js` (runs them in the prototype and records every output), `oracle_lib.js` (what is read from the prototype), `harness.py` (what is written to the workbook and compared), `xl.py` (LibreOffice link), `plan-meta.json` (where the year-table columns are on the Plan sheets).
