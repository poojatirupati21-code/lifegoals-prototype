#!/bin/bash
# plan-vs-xlsx: feeds the same inputs to the prototype (Playwright) and to the Plan sheets of LifeGoals-Calculators.xlsx (LibreOffice),
# then compares goal %, goal lines, yearly rows, findings, foundations, gate, chart numbers and profile.
# usage: tools/plan-vs-xlsx/plan-vs-xlsx.sh [number of random scenarios (default 120)] [seed (default 23)]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."; export NODE_PATH=${NODE_PATH:-/opt/node22/lib/node_modules}
N=${1:-120}; SEED=${2:-23}; W=${TMPDIR:-/tmp}/plan-vs-xlsx; mkdir -p "$W"
cp "$ROOT/deliverables/LifeGoals-Calculators.xlsx" "$W/copy.xlsx"      # a COPY: the deliverable is never touched
cd "$HERE"
node make_scen.js "$N" "$SEED" "$W/in.json"
node gen_scen.js "$W/in.json" "$W/rnd.json"
node gen_scen.js sample "$W/sample.json"
python3 -c "import json,sys; a=json.load(open('$W/rnd.json'))+json.load(open('$W/sample.json')); json.dump(a,open('$W/all.json','w')); print(len(a),'scenarios')"
pgrep -f "port=2002" >/dev/null || { soffice --headless --invisible --norestore "--accept=socket,host=localhost,port=2002;urp;" >/dev/null 2>&1 & sleep 6; }
python3 harness.py "$W/copy.xlsx" "$W/all.json" 5
