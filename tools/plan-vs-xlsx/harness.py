import sys, json, math
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from xl import XL

ROWFIELDS = {  # prototype row field -> (alias, workbook column key)
 'inflow': ('C', 'inflow'), 'needs': ('C', 'needs'), 'goalPaid': ('C', 'goalPaid'), 'living': ('C', 'living'), 'fixed': ('C', 'fixed'), 'goalCost': ('C', 'goalCost'),
 'short': ('C', 'shortTotal'), 'shortLiving': ('C', 'short'), 'goalGap': ('C', 'goalGap'), 'used': ('C', 'used'), 'saved': ('C', 'saved'), 'spent': ('C', 'spent'),
 'liquid': ('C', 'liquid'), 'pen': ('C', 'pen'), 'tax': ('P', 'tax'), 'gross': ('P', 'gross'), 'isShort': ('C', 'isShort')}
MORT2_FIRST = 86

def apply_sc(x, sc):
    x.clear()
    x.setname('Fill_Example', 'Yes' if sc.get('fill') else 'No')
    if sc.get('fill'): return
    S = lambda n, v: v is not None and x.setname(n, v, col='C')
    ab = sc.get('about', {})
    S('In_age', ab.get('age')); x.setname('In_partner', 'Yes' if ab.get('partner') else 'No', col='C')
    if ab.get('married') is not None: x.setname('In_married', 'Yes' if ab['married'] else 'No', col='C')
    S('In_deps', ab.get('deps'))
    S('In_retireAge', sc.get('retireAge')); S('In_pRet', sc.get('pRet')); S('In_infl', sc.get('infl'))
    x.setname('In_assumeSet', 'Cautious' if sc.get('assume') == 'cautious' else 'Standard', col='C')
    S('In_q6', sc.get('q6')); S('In_saveM', sc.get('saveM'))
    if sc.get('saveUp') is not None: x.setname('In_saveUp', 'Yes' if sc['saveUp'] else 'No', col='C')
    S('In_penExtra', sc.get('penExtra'))
    for k, n in [('rent', 'In_credRent'), ('lone', 'In_credLone'), ('carer', 'In_credCarer')]:
        if sc.get('cred', {}).get(k): x.setname(n, 'Yes', col='C')
    for k, v in sc.get('fin', {}).items(): S('In_' + k, v)
    for k, v in sc.get('asm', {}).items(): S('In_a_' + k, v)
    pr = sc.get('prof', {})
    for k, v in pr.get('ans', {}).items(): x.setname('PA_' + k + '_Typed', v + 1)
    for k, v in pr.get('um', {}).items(): x.setname('PA_' + k + '_Typed', v + 1)
    ch = pr.get('chips', [])
    if ch:
        x.setname('PA_chipsN_Typed', len(ch)); x.setname('PA_chipShares_Typed', 'Yes' if 'Shares or funds' in ch else 'No'); x.setname('PA_chipsSafe_Typed', 'Yes' if all(c in ('None', 'Savings account') for c in ch) else 'No')
    wi = sc.get('wi', {})
    if wi.get('g') is not None: S('In_wiGoal', wi['g'] + 1)
    S('In_wiM', wi.get('m')); S('In_wiL', wi.get('l'))
    rank = sc.get('rank')
    for i, g in enumerate(sc.get('goals', [])):
        row = int(x.locate(f'Goal{i + 1}_key')[1][1:]); sh = x.locate(f'Goal{i + 1}_key')[0]
        x.set(sh, f'C{row}', g['k'])
        if g.get('name'): x.set(sh, f'D{row}', g['name'])
        if g.get('age') is not None: x.set(sh, f'E{row}', g['age'])
        x.set(sh, f'F{row}', g['amount']); x.set(sh, f'G{row}', g.get('saved', 0)); x.set(sh, f'H{row}', g.get('prio', 'Must have'))
        if rank is not None: x.set(sh, f'I{row}', rank.index(i) + 1)
        if g['k'] == 'safety': x.set(sh, f'J{row}', 'Yes' if g.get('auto') else 'No')
    L = sc.get('lists', {})
    for lk, r0, cols in [('cards', 6, ('owed', 'pay', 'rate')), ('loans', 21, ('owed', 'pay', 'rate'))]:
        for j, it in enumerate(L.get(lk, [])):
            for c, f in zip('DEF', cols):
                if it.get(f) is not None: x.set('Your lists', f'{c}{r0 + j}', it[f] / 100 if f == 'rate' else it[f])
    for j, it in enumerate(L.get('pens', [])):
        for c, f in zip('DEF', ('value', 'monthly', 'own')):
            if it.get(f) is not None: x.set('Your lists', f'{c}{37 + j}', it[f])
    for j, it in enumerate(L.get('mort2', [])):
        for c, f in zip('DEFG', ('owed', 'pay', 'years', 'rate')):
            if it.get(f) is not None: x.set('Your lists', f'{c}{MORT2_FIRST + j}', it[f] / 100 if f == 'rate' else it[f])

def feed_typed(x, sc, out):
    """the two helper figures the workbook cannot search for (the what-if searches): taken from the prototype"""
    sh = x.locate('GR1_Extra')[0]
    if out['find'] and out['find']['worst'] is not None:
        x.setname('Find_ExtraFor', out['find']['ex'] if out['find']['ex'] is not None else 'none')
    for i, e in enumerate(out['extraTo100']):
        if e is None and out['pct'][i] is not None: pass
        row = int(x.locate(f'GR{i + 1}_Extra')[1][1:])
        v = out['extraTo100'][i] if i < len(out['extraTo100']) else None
        if v is None and out['pct'][i] < 100 and out['goalNums'][i] is not None: x.set(sh, f'L{row}', 'none')
        elif v is not None: x.set(sh, f'L{row}', v)

def compare(x, sc, out, tol=1.0, verbose=True):
    bad = []
    N = out['N']; M = x.meta
    for t in range(N + 1):
        pr = out['rows'][t]
        for f, (al, key) in ROWFIELDS.items():
            m = M[al]; v = x.getcell(m['sheet'], f"{m['cols'][key]}{m['r0'] + t}")
            if isinstance(v, str) or v is None: bad.append((t, f, pr[f], v)); continue
            if abs(v - pr[f]) > tol: bad.append((t, f, pr[f], v))
    for i, p in enumerate(out['pct']):
        v = x.val(f'GR{i + 1}_Pct')
        if v != p: bad.append(('pct', i, p, v))
        b = x.val(f'GR{i + 1}_Band')
        if b != out['bands'][i]: bad.append(('band', i, out['bands'][i], b))
    # saving, gate, findings, goal lines, foundations
    sv = out['save']
    for nm, k in [('Save_SurplusM', 'surplusM'), ('Save_SaveM', 'saveM')]:
        v = x.val(nm)
        if v != sv[k] and not (out.get('wiOn') and k == 'saveM'): bad.append(('save', k, sv[k], v))
    if abs(x.val('Save_AutoM') - sv['autoM']) > 0.01: bad.append(('save', 'autoM', sv['autoM'], x.val('Save_AutoM')))
    gk = x.val('Gate_Keys'); gk = '' if gk is None else gk
    if gk != ','.join(out['missing']): bad.append(('gate', 'keys', ','.join(out['missing']), gk))
    if x.val('Gate_Text') != out['gateText']: bad.append(('gate', 'text', out['gateText'], x.val('Gate_Text')))
    if out['find'] and not out.get('wiOn'):
        F = out['find']
        for nm, k in [('Find_Strength', 'sT'), ('Find_Gap', 'gT'), ('Find_Decision', 'dT')]:
            v = x.val(nm)
            if v != F[k]: bad.append(('find', k, F[k], v))
    for i, ln in enumerate(out['lines']):
        v = x.val(f'GR{i + 1}_Line')
        if (v or '') != (ln or ''): bad.append(('line', i, ln, v))
    if out['fnd'] and not out.get('wiOn'):
        held = False
        for i, L in enumerate(out['fnd']):
            st = x.val(f'Fnd{i + 1}_Fin'); s = x.val(f'Fnd{i + 1}_S')
            if st != L['st']: bad.append(('fnd', i + 1, L['st'], st))
            exp = L['s'].replace(' · strengthen your foundations first', '') if L['st'] == 'held' else L['s']
            if s != exp: bad.append(('fndtext', i + 1, exp, s))
    H = out.get('home')
    if H and not out.get('wiOn'):
        for nm, k in [('Home_N', 'n'), ('Home_Avg', 'avg'), ('Home_OnTrack', 'ok'), ('Home_Band', 'band'), ('Tools_List', 'tools'), ('Expert_Type', 'expert')]:
            v = x.val(nm)
            if v != H[k]: bad.append(('home', nm, H[k], v))
        nu = out['nudge']
        if x.val('Nudge_Show') != nu['show'] or (nu['show'] and x.val('Nudge_X') != nu['x']): bad.append(('nudge', nu, x.val('Nudge_Show'), x.val('Nudge_X')))
    if H:
        for i, w in enumerate(H['when']):
            v = x.val(f'GR{i + 1}_When')
            if v != w: bad.append(('when', i, w, v))
        wi = out['wi']
        if abs(x.val('Wi_Total') - wi['tot']) > 0.01 or x.val('Wi_Over') != wi['over']: bad.append(('wilive', wi, x.val('Wi_Total'), x.val('Wi_Over')))
        C = out['chart']
        for nm, k in [('Chart_ShortYears', 'shortYears'), ('Chart_DipYears', 'dip'), ('Chart_LivingShortYears', 'livYears'), ('Road_ShortYears', 'roadShort')]:
            if x.val(nm) != C[k]: bad.append(('chart', nm, C[k], x.val(nm)))
        for nm, k in [('Chart_FirstShortAge', 'firstAge'), ('Chart_FirstLivingAge', 'livFirst'), ('Road_FirstShortAge', 'roadFirst')]:
            v = x.val(nm); v = '' if v is None else v
            if v != C[k]: bad.append(('chart', nm, C[k], v))
        for nm, k in [('Chart_FirstShortAmt', 'firstAmt'), ('Chart_TotalShort', 'total')]:
            v = x.val(nm)
            if (C[k] == '' and v != '') or (C[k] != '' and abs((v if isinstance(v, (int, float)) else 1e9) - C[k]) > 1): bad.append(('chart', nm, C[k], v))
        # year parts
        m = x.meta['C']
        for t in range(N + 1):
            for j, key in enumerate(['partsInc', 'partsSav', 'partsShort']):
                v = x.getcell(m['sheet'], f"{m['cols'][key]}{m['r0'] + t}")
                if abs(v - C['parts'][t][j]) > 1: bad.append(('parts', t, key, C['parts'][t][j], v)); break
        chs = out['chapters']
        for k, c in enumerate(chs):
            sheet = x.locate('Chap_Dec')[0]; col = lambda nm: x.locate(nm)[1].split(':')[0]
            r0 = int(x.locate('Chap_Dec')[1].replace('$', '').split(':')[0][1:])
            vals = [x.getcell(sheet, f'{L}{r0 + k}') for L in 'CDEFGHIJ']
            exp = [c['dec'], c['from'], c['to'], c['n'], c['short'], c['dip'], c['avg'], c['wx']]
            for a, b in zip(vals, exp):
                ok = (abs(a - b) < 1 if isinstance(b, (int, float)) and isinstance(a, (int, float)) else a == b)
                if not ok: bad.append(('chapter', k, exp, vals)); break
    M = out.get('misc')
    if M:
        for nm, k in [('Req_Count', 'reqN'), ('Req_Got', 'reqGot'), ('Std_Left', 'stdLeft'), ('Std_Need', 'stdNeed'), ('Slip_Count', 'slipN')]:
            v = x.val(nm)
            if v != M[k] and not (out.get('wiOn') and nm.startswith('Slip')): bad.append(('misc', nm, M[k], v))
        if not out.get('wiOn'):
            v = x.val('Slip_Names') or ''
            if v != M['slip']: bad.append(('misc', 'Slip_Names', M['slip'], v))
            if out.get('fnd'):
                if x.val('Fnd_NextN') != M['fndNextN']: bad.append(('misc', 'Fnd_NextN', M['fndNextN'], x.val('Fnd_NextN')))
                elif M['fndNextN']:
                    for nm, k in [('Fnd_NextT', 'fndNextT'), ('Fnd_NextD', 'fndNextD')]:
                        if x.val(nm) != M[k]: bad.append(('misc', nm, M[k], x.val(nm)))
        for i, m in enumerate(M['months']):
            v = x.val(f'GR{i + 1}_Months'); v = '' if v is None else v
            if v != m: bad.append(('months', i, m, v))
    A = out['AS']
    for nm, k in [('AS_Infl', 'infl'), ('AS_Wage', 'wage'), ('AS_Cash', 'cash'), ('AS_Inv', 'inv'), ('AS_Pen', 'pen'), ('AS_PenRet', 'penRet'), ('AS_End', 'end'), ('AS_Year0', 'year0'), ('AS_Months', 'buffer')]:
        if abs(x.val(nm) - A[k]) > 1e-9: bad.append(('as', nm, A[k], x.val(nm)))
    Fq = out['fin']
    for nm, k in [('F_EssM', 'essM'), ('F_MortPayM', 'mortPayM'), ('F_CardPayM', 'cardPayM'), ('F_LoanPayM', 'loanPayM'), ('F_PenG', 'penG'), ('F_PenM', 'penM'), ('F_Debt', 'debt')]:
        if abs(x.val(nm) - Fq[k]) > 1e-6: bad.append(('fin', nm, Fq[k], x.val(nm)))
    P = out.get('prof')
    if P and not sc.get('fill'):
        chk = [('Prof_DiscCount', P['disc']), ('Prof_UmCount', P['um']), ('Prof_Full', P['full']), ('Prof_Personality', P['personality']), ('Prof_Label', P['label']), ('Prof_Level', P['level']), ('Prof_Limit', P['limit']), ('Prof_MisKey', P['misKey']),
               ('Prof_Comfort', P['comfort']), ('Prof_Cushion', P['cushion']), ('Prof_Provisional', P['provisional']), ('Prof_Banner', P['banner']), ('Prof_TermsMindset', P['terms']['mindset']), ('Prof_TermsBehaviour', P['terms']['behaviour']),
               ('Prof_TermsAppetite', P['terms']['appetite']), ('Prof_TermsCapacity', P['terms']['capacity']), ('Prof_Want', P['want']), ('Prof_Can', P['can']), ('Prof_Time', P['time'])]
        for nm, exp in chk:
            nm2 = {'Prof_Want': 'Prof_T', 'Prof_Can': 'Prof_C', 'Prof_Time': 'Prof_H'}.get(nm, nm)
            v = x.val(nm2); v = '' if v is None else v
            if isinstance(exp, str) and isinstance(v, str) or isinstance(exp, (int, float)) and isinstance(v, (int, float)):
                if v != exp: bad.append(('prof', nm, exp, v))
            elif not (exp == '' and v == ''): bad.append(('prof', nm, exp, v))
    if not sc.get('fill') and x.val('Missing_Count') != out['missingFlags']: bad.append(('missing', 'count', out['missingFlags'], x.val('Missing_Count')))
    return bad

def run(path, scen_json, only=None, limit=10):
    x = XL(path); data = json.load(open(scen_json)); nfail = 0; res = []
    for k, d in enumerate(data):
        if only is not None and k not in only: continue
        sc, out = d['sc'], d['out']
        apply_sc(x, sc); feed_typed(x, sc, out); x.calc()
        bad = compare(x, sc, out)
        res.append((sc.get('name', k), len(bad)))
        if bad:
            nfail += 1
            print('FAIL', sc.get('name', k), len(bad), bad[:limit])
    x.close(); print('SCENARIOS', len(res), 'FAIL', nfail)

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2], limit=int(sys.argv[3]) if len(sys.argv) > 3 else 10)
