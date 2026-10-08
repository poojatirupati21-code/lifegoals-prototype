#!/bin/bash
# plan-vs-xlsx: feeds the same inputs to the prototype (Playwright) and to the Plan sheets of LifeGoals-Calculators.xlsx (LibreOffice),
# then compares goal %, goal lines, yearly rows, findings, foundations, gate, my-money sections, next best step, what-if text, chart numbers and the profile.
# usage: tools/plan-vs-xlsx/plan-vs-xlsx.sh [number of random scenarios (default 120)] [seed (default 23)]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$HERE/../.."; export NODE_PATH=${NODE_PATH:-/opt/node22/lib/node_modules}
N=${1:-120}; SEED=${2:-23}; W=${TMPDIR:-/tmp}/plan-vs-xlsx; mkdir -p "$W"
cp "$ROOT/deliverables/LifeGoals-Calculators.xlsx" "$W/copy.xlsx"      # a COPY: the deliverable is never touched
cd "$HERE"
node make_scen.js "$N" "$SEED" "$W/in.json"                              # random customers + 7 edge cases
for n in 9 12 15 20; do NFUND=$n node make_scen.js 2 $((SEED + n)) "$W/many$n.json" >/dev/null; done   # plans with 9, 12, 15 and 20 saved-for goals
python3 - "$W" <<'PY'
import json, sys
w = sys.argv[1]; a = json.load(open(w + '/in.json'))
for n in (9, 12, 15, 20): a += [x for x in json.load(open(f'{w}/many{n}.json')) if x['name'].startswith('many')]
a += json.load(open('scenarios/recheck-41.json'))                         # the independent recheck's 41 hand-built customers
json.dump(a, open(w + '/all_in.json', 'w')); print(len(a), 'customers')
PY
node gen_scen.js "$W/all_in.json" "$W/rnd.json"
node gen_scen.js sample "$W/sample.json"
python3 -c "import json; a=json.load(open('$W/rnd.json'))+json.load(open('$W/sample.json')); json.dump(a,open('$W/all.json','w')); print(len(a),'scenarios')"
pgrep -f "port=2002" >/dev/null || { soffice --headless --invisible --norestore "--accept=socket,host=localhost,port=2002;urp;" >/dev/null 2>&1 & sleep 6; }
python3 harness.py "$W/copy.xlsx" "$W/all.json" 5
python3 n1_checks.py "$W/copy.xlsx" "$W/all.json"
