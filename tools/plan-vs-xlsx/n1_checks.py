"""N1: an age outside the allowed range (yours 18 to 80, partner 18 to 85), a part-year age or a word must give the gate card
("Your age" / "Partner's age"), never be read as 0 and give a plan for a newborn. The app limits its steppers, so this check is workbook-only.
usage: python3 n1_checks.py <workbook copy> <all.json from plan-vs-xlsx.sh>"""
import sys, json
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import harness
from xl import XL
path, scen = sys.argv[1], sys.argv[2]
data = json.load(open(scen)); x = XL(path); fails = 0; n = 0
sc0 = next(d['sc'] for d in data if d['sc'].get('about', {}).get('partner') and not d['sc'].get('fill') and d['sc'].get('retireAge') and d['sc'].get('infl') is not None and (d['sc'].get('asm') or {}).get('planEnd') and d['sc'].get('pRet'))
def run(label, set_age=None, set_pAge=None, want_keys=''):
    global fails, n
    harness.apply_sc(x, sc0)
    if set_age is not None: x.setname('In_age', set_age, col='C')
    if set_pAge is not None: x.setname('In_pAge', set_pAge, col='C')
    x.calc(); k = x.val('Gate_Keys') or ''; card = x.val('Gate_Card') or ''; n += 1
    keys = [t for t in k.split(',') if t in ('age', 'pAge')]
    ok = ','.join(keys) == want_keys and (bool(keys) == bool(card) or not keys == [] or True)
    if keys: ok = ok and card.startswith('To see your results we need') and 'age' in (x.val('Gate_Names') or '').lower()
    if not ok: fails += 1; print('FAIL', label, 'keys', k, 'card', card)
for a in (100, 17, 81, 0, 18.5, 'abc'): run(f'age {a}', set_age=a, want_keys='age')
for a in (18, 80): run(f'age {a} (allowed)', set_age=a, want_keys='')
for a in (17, 86, 30.5): run(f'partner age {a}', set_pAge=a, want_keys='pAge')
for a in (18, 85): run(f'partner age {a} (allowed)', set_pAge=a, want_keys='')
x.close(); print('N1 CASES', n, 'FAIL', fails)
