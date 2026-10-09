"""N1: an age outside the allowed range (yours 18 to 80, partner 18 to 85), a part-year age or a word must give the gate card
("Your age" / "Partner's age"), never be read as 0 and give a plan for a newborn. The app limits its steppers, so this check is workbook-only.
usage: python3 n1_checks.py <workbook copy> <all.json from plan-vs-xlsx.sh>"""
import sys, json
sys.path.insert(0, __import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import harness
from xl import XL
path, scen = sys.argv[1], sys.argv[2]
data = json.load(open(scen)); x = XL(path); fails = 0; n = 0
d0 = next(d for d in data if d['sc'].get('about', {}).get('partner') and not d['sc'].get('fill') and d['sc'].get('retireAge') and d['sc'].get('infl') is not None and (d['sc'].get('asm') or {}).get('planEnd') and d['sc'].get('pRet'))
sc0, out0 = d0['sc'], d0['out']
import datetime as dt
T = dt.date.today(); ser = lambda d: (d - dt.date(1899, 12, 30)).days
def back(years, days=0):   # a date of birth that makes the person exactly `years` today, shifted by days (positive = birthday later)
    try: b = T.replace(year=T.year - years)
    except ValueError: b = T.replace(year=T.year - years, day=28)
    return b + dt.timedelta(days=days)
def run(label, set_age=None, set_pAge=None, want_keys=''):
    global fails, n
    harness.apply_sc(x, sc0, out0)
    if set_age is not None: x.setname('In_age', set_age, col='C')
    if set_pAge is not None: x.setname('In_pAge', set_pAge, col='C')
    x.calc(); k = x.val('Gate_Keys') or ''; card = x.val('Gate_Card') or ''; n += 1
    keys = [t for t in k.split(',') if t in ('age', 'pAge')]
    ok = ','.join(keys) == want_keys
    if keys: ok = ok and card.startswith('To see your results we need') and 'date of birth' in (x.val('Gate_Names') or '').lower()
    if not ok: fails += 1; print('FAIL', label, 'keys', k, 'card', card)
# section 29: dates of birth; 17 and 81 today and a part-year or future date are gated, 18 and 80 today (even on the birthday) are not
for lab, v in [('100 years', ser(back(100))), ('17 today', ser(back(17))), ('turns 18 tomorrow', ser(back(18, 1))), ('81 today', ser(back(81))), ('future date', ser(T + dt.timedelta(days=30))), ('number 0', 0), ('1.5', 1.5), ('text', 'abc')]: run('your date of birth: ' + lab, set_age=v, want_keys='age')
for lab, v in [('18 today (birthday today)', ser(back(18))), ('18 yesterday', ser(back(18, -1))), ('80 today', ser(back(80))), ('turns 81 tomorrow', ser(back(81, 1)))]: run('your date of birth: ' + lab, set_age=v, want_keys='')
for lab, v in [('17 today', ser(back(17))), ('86 today', ser(back(86))), ('future', ser(T + dt.timedelta(days=5))), ('text', 'x')]: run('partner date of birth: ' + lab, set_pAge=v, want_keys='pAge')
for lab, v in [('18 today', ser(back(18))), ('85 today', ser(back(85)))]: run('partner date of birth: ' + lab, set_pAge=v, want_keys='')
x.close(); print('N1 CASES', n, 'FAIL', fails)
