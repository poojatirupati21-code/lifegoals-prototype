#!/usr/bin/env python3
"""Recalculate a workbook with LibreOffice (so every formula has a saved value) and put
calcMode="auto" fullCalcOnLoad="1" back (LibreOffice drops them). Usage: finalize_workbook.py <xlsx>"""
import re, subprocess, sys, os, zipfile
src = sys.argv[1]
RECALC = os.environ.get('RECALC', '/root/.claude/skills/synced/849805a0-1896-4a49-87bc-2f01ccbb7dae_a4e27067-8324-46de-8d01-0f71917b608e/xlsx/scripts/recalc.py')
subprocess.run([sys.executable, RECALC, src, '180'], check=True)
tmp = src + '.tmp'
zi = zipfile.ZipFile(src); zo = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
for it in zi.infolist():
    b = zi.read(it.filename)
    if it.filename == 'xl/workbook.xml':
        x = b.decode()
        x = re.sub(r'<calcPr[^>]*/>', '<calcPr calcMode="auto" fullCalcOnLoad="1" iterateCount="100" refMode="A1" iterate="false" iterateDelta="0.0001"/>', x)
        b = x.encode()
    zo.writestr(it, b)
zo.close(); zi.close(); os.replace(tmp, src)
print(re.findall(r'<calcPr[^>]*>', zipfile.ZipFile(src).read('xl/workbook.xml').decode()))
