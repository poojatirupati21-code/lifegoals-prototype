# UI layer: states from journey-spec 27

The workbook's four UI sheets are built from the live prototype by `tools/build_ui_sheets.py` (see `tools/README-ui.md`).
Since journey-spec 27 the sheet `UI Make my plan` also carries 36 state screens, each starting with a "Screen state" row, then one row per element and a 390 px picture:

| Group | States |
|---|---|
| Gate card ("To see your results we need N things" with Choose buttons) | Results 4/3/2/1 with a working partner, 3/2/1 without; Home 4, 3, 1; Report / PDF 4, 3, 1; after tapping Choose (the highlighted box) |
| Step 7 | Choose 3 things (none, all chosen); Choose 4 things (2 of 4); "What we've set for you (change any)" opened with Set by LifeMap, Your choice, Assumed: add yours, Not chosen yet and "Back to LifeMap's figure"; assumed details (25 years, your age, Employed, planning / Central Bank rates) |
| Free retirement age | customer 45 and 55 (calm notes below 50 and below 60), 63 (no note); partner 45 and 55 |
| Date has passed | Results, Home, Confirm my LifeMap |
| Early retirement | at 50: year retirement starts, bridge year 55, pension from 60; at 45 road; access age 50 with retirement at 55; Home; no partner |
| Details missing | "1 detail missing" and "N details missing" banners |

The tools that follow the retirement age (C12 to C16) also get a "Sub-result row (retiring at 50)" block in `UI Calculators` and a third picture in `UI Screens`.
The Settings standards table lists all 47 standards, including the new "Pension access age" (From 60 (most pensions) / From 50 (some occupational schemes)), the tag after a change (Your choice) and the "Back to ..." button text.

Limits: the "mortgage on another property: we use 25 years" assumed row shows the same wording as the main mortgage row, so it has no separate state; the Retire goal's percentage in an early-retirement state is the app's own figure; the highlighted-box state picture is a very tall screen (Your assumptions scrolled to the top).
