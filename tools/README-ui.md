# UI layer for LifeGoals-Calculators.xlsx

Appends four sheets (UI Guide, UI Calculators, UI Screens, UI Make my plan) to any copy of the workbook. The developer sheets are not edited.

```
export NODE_PATH=/opt/node22/lib/node_modules          # where Playwright lives
cp deliverables/LifeGoals-Calculators.xlsx /tmp/copy.xlsx
python3 tools/build_ui_sheets.py /tmp/copy.xlsx         # reads the live prototype, appends the sheets, recalculates (recalc.py)
python3 tools/check_ui_sheets.py /tmp/copy.xlsx --report /tmp/ui-check.md
```

- `extract_ui.js` reads the running prototype (no hand typing) and writes `ui-extract.json` plus 390 px screenshots; running it twice gives identical files.
- `build_ui_sheets.py` re-runs safely on a workbook that already has "UI ..." sheets (they are replaced).
- `check_ui_sheets.py` opens the prototype again and confirms every label, option text and slider range in the sheets is on screen, and compares each calculator input with its developer cell (names, default, validation range, step). Mismatches are listed, never fixed.
- `ui_calc_map.json` maps each calculator's screen inputs to the developer sheet's named cells (the same map the calc-vs-xlsx comparison uses).
- openpyxl drops cached values when it saves, so the builder calls recalc.py afterwards (`--recalc PATH`, or `--no-recalc`).
