"""A gated figure must never land inside a sentence: with Fill example on, Adjust for inflation on and no inflation chosen, every calculator result cell
that is not itself a gate message must not contain "to see this" / "to see it". usage: python3 embedded_gate_check.py <workbook copy>  (works on a copy)"""
import sys, re, os, shutil, subprocess, tempfile, openpyxl
src = sys.argv[1]; tmp = os.path.join(tempfile.mkdtemp(), 'copy.xlsx'); shutil.copy(src, tmp)
RECALC = os.environ.get('RECALC', '/root/.claude/skills/synced/849805a0-1896-4a49-87bc-2f01ccbb7dae_a4e27067-8324-46de-8d01-0f71917b608e/xlsx/scripts/recalc.py')
wb = openpyxl.load_workbook(tmp); wb['README']['C3'] = 'Yes'
for ws in wb:
    for n, d in ws.defined_names.items():
        if n == 'Adjust_For_Inflation_Entry': ws[d.attr_text.split('!')[1].replace('$', '')] = 'Yes'
wb.save(tmp); subprocess.run([sys.executable, RECALC, tmp, '180'], check=True, stdout=subprocess.DEVNULL)
v = openpyxl.load_workbook(tmp, data_only=True); bad = []
for ws in v:
    if not (ws.title[:1] == 'C' and ws.title[1:3].isdigit()): continue
    for row in ws.iter_rows(min_col=3, max_col=3):
        for c in row:
            if isinstance(c.value, str) and re.search(r'to see (this|it)', c.value) and not re.match(r'^(Choose|Add) ', c.value): bad.append((ws.title, c.coordinate, c.value[:120]))
print('EMBEDDED GATE', len(bad)); [print(b) for b in bad]
