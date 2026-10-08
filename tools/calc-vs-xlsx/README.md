# calc-vs-xlsx

Checks the 28 calculators of `deliverables/LifeGoals-Calculators.xlsx` against the live prototype. The same inputs go to the prototype (Playwright) and to a recalculated copy of the workbook (LibreOffice, through `recalc.py`), and the results are compared. The deliverable is never changed: every round works on a copy.

```
export NODE_PATH=/opt/node22/lib/node_modules          # where Playwright lives
node tools/calc-vs-xlsx/calc-vs-xlsx.js                  # about 6 minutes
```

Last lines of the output: `FAILS n of m` (calculator and tax-engine cases), `GATE FAILS n of m` (gate wording), `CONST DIFF n` (law figures), `ERRORS n`, and the workbook time stamp. Read every FAIL line above them.

## What it compares

- **Calculator cases.** For each of the 28 calculators: the defaults, three seeded random inputs, an edge or statement case, and extra edge cases for the audited rules (retirement bridge years, Illness Benefit cap, lump sum above 500,000, withdrawals above the pot, rent-vs-buy deposit limits). Money must match within 0.50, rates within 1e-6, months, years and texts exactly. About 160 cases.
- **Gate wording (journey-spec section 27).** A LifeMap standard (growth, pay rises, emergency months, drawdown timing, pension access age ...) starts from the standard, so it never gates: a "std blank" round checks every calculator gives the same result with those inputs blank or typed as the standard. The customer's own figures still gate (market rates, State Pension, Illness Benefit, retirement age, personal figures): for every calculator, with all personal figures given, each own item blank on its own, inflation blank on its own, nothing blank. The expected text comes from the prototype's own `calcMissing()` ("Choose your mortgage rate to see this" ...). The headline result must show exactly that text, and every other result that gates must show the same text. When nothing else is missing and inflation is, every gating result must say "Choose your inflation rate to see this".
- **Tax engine.** Five cases against the prototype's `hhTax`.
- **Constants.** Every law figure the formulas read (Assumptions and Settings) against `RULES_IE_2026` and the prototype's settings (`CONST SAME` / `CONST DIFF`).

## Files

| File | What it is |
|---|---|
| `calc-vs-xlsx.js` | The comparison. It holds the map from each prototype input to the workbook name (`MAP`), the edge cases (`EDGE`, `EXTRA`) and the constants map (`RULEMAP`). |
| `xlsx_cases.py` | Helper: writes one round of inputs into a copy of the workbook (every sheet at once), recalculates it with `recalc.py` and reads the named results. |
| `../ui_calc_map.json` | The UI layer's map of each calculator's inputs and outputs to workbook names. The gate rounds read it. |

Environment: `WORKBOOK` (default the deliverable), `RECALC` (path to `recalc.py`), `CALC_VS_XLSX_WORK` (work folder, default the system temp folder).
