#!/usr/bin/env python3
"""Check the UI sheets appended by build_ui_sheets.py.

    python3 tools/check_ui_sheets.py <workbook.xlsx> [--extract ui-extract.json] [--report report.md]

1. Opens the live prototype again (tools/check_ui_extract.js) and confirms that every label, choice text and slider range written in
   "UI Calculators" and "UI Make my plan" is really on screen.
2. Compares every calculator input on the screen (names, start values, slider ranges) with the developer sheet's input cell in the same
   workbook, through the name map tools/ui_calc_map.json: the named cell exists, the example default equals the screen's start value,
   the slider range sits inside the cell's validation range, the step matches "steps of N". Mismatches are LISTED, never fixed.
Exit code 1 if any label is missing on screen; mismatches against the developer sheets are reported but do not fail the run.
"""
import argparse, json, os, re, subprocess, sys, tempfile
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))


def num(s):
    if s is None or s == '': return None
    if isinstance(s, (int, float)): return float(s)
    m = re.search(r'-?\d[\d,]*\.?\d*|-?\.\d+', str(s))
    return float(m.group(0).replace(',', '')) if m else None


def sheet_rows(ws, header_row=4):
    heads = [c.value for c in ws[header_row]]
    for row in ws.iter_rows(min_row=header_row + 1, values_only=True):
        if row[0] in (None, ''): continue
        yield dict(zip(heads, row))


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('workbook'); ap.add_argument('--extract'); ap.add_argument('--report')
    a = ap.parse_args()
    wb = openpyxl.load_workbook(a.workbook, data_only=True); wbf = openpyxl.load_workbook(a.workbook)
    for need in ('UI Calculators', 'UI Make my plan'):
        if need not in wb.sheetnames: sys.exit('missing sheet ' + need)
    work = tempfile.mkdtemp(prefix='ui_check_')
    ex_path = a.extract
    if not ex_path:
        out = os.path.join(work, 'extract'); env = dict(os.environ); env.setdefault('NODE_PATH', '/opt/node22/lib/node_modules')
        subprocess.run(['node', os.path.join(HERE, 'extract_ui.js'), out], check=True, env=env, stdout=subprocess.DEVNULL); ex_path = os.path.join(out, 'ui-extract.json')
    X = json.load(open(ex_path)); calcmap = {m['id']: m for m in json.load(open(os.path.join(HERE, 'ui_calc_map.json')))}
    # ---- dump the two sheets
    calc = []
    for r in sheet_rows(wb['UI Calculators']):
        calc.append({'n': r['Calculator'], 'type': r['Element type'], 'label': r['Label exactly as shown'], 'min': r['Min'], 'max': r['Max'], 'step': r['Step'], 'chip': r['Choice / chip text'],
                     'rangeOnScreen': 'tool design' not in str(r['Where the with-plan figure comes from'] or ''), 'noplan': r['Starts at WITHOUT a plan (as the screen shows it)'], 'plan': r['Starts at WITH a plan (Aoife sample)'],
                     'dname': r['Developer name (sheet!name)'], 'unit': r['Unit'], 'sheet': r['Developer sheet'], 'sec': r['Where on the screen']})
    plan = []
    standards = []; nstates = 0
    mws = wb['UI Make my plan']; heads = [c.value for c in mws[4]]; stop = False
    for row in mws.iter_rows(min_row=5, values_only=True):
        if row[0] == 'Group': stop = True
        if stop:
            if row[0] in (None, '', 'Group'): continue
            standards.append({'label': row[1], 'tag': row[3], 'chip': row[6]}); continue
        r = dict(zip(heads, row))
        if r['Screen'] in (None, '') or r['Element type'] in (None, ''): continue
        if r['Element type'] == 'Screen state': nstates += 1; continue   # the first row of a journey-spec 27 state: a title, not a screen element
        plan.append({'screen': r['Screen'], 'name': r['Screen name'], 'type': r['Element type'], 'label': r['Label / text exactly as shown'], 'chip': r['Choice / option texts']})
    sheet_text = ' '.join(str(c) for t in ('UI Calculators', 'UI Make my plan') for row in wb[t].iter_rows(values_only=True) for c in row if isinstance(c, str))
    dump = os.path.join(work, 'dump.json'); json.dump({'calc': calc, 'plan': plan, 'standards': standards, 'sheetText': sheet_text}, open(dump, 'w'))
    env = dict(os.environ); env.setdefault('NODE_PATH', '/opt/node22/lib/node_modules')
    live = json.loads(subprocess.run(['node', os.path.join(HERE, 'check_ui_extract.js'), dump, ex_path], check=True, env=env, capture_output=True, text=True).stdout.strip().splitlines()[-1])
    lines = []
    def out(s=''): print(s); lines.append(s)
    out('# UI sheets check')
    out('')
    out('## 1. Everything the sheets say is on screen (live prototype, fresh browser)')
    out('- UI Calculators: %d rows, labels missing on screen: **%d**' % (live['calcRows'], len(live['calcLabelsMissing'])))
    out('- UI Calculators: %d slider rows, min/max/step differing from the live input: **%d**' % (live['sliderRows'], len(live['sliderMismatch'])))
    out('- Choice and chip texts checked: %d, missing on screen: **%d**' % (live['chipTexts'], len(live['chipMissing'])))
    out('- UI Make my plan: %d screens, %d rows, labels missing on screen: **%d**' % (live['screens'], live['planRows'], len(live['planLabelsMissing'])))
    out('- Your assumptions: %d Settings standards in the sheet (the app has %d, the extract %d), labels missing on screen: **%d**; standards count differs from the app: **%d**' % (live['standards'], live['standardsLive'], live['standardsExtract'], len(live['standardsMissing']), 0 if live['standards'] == live['standardsLive'] == live['standardsExtract'] else 1))
    out('- Journey-spec 27: %d state screens in UI Make my plan (%d with a "Screen state" row); %d required wordings: missing in the sheets **%d**, missing on the live prototype in that state **%d**' % (len(set(p['screen'] for p in plan if str(p['screen']).startswith('S27-'))), nstates, live['required'], len(live['requiredMissingSheet']), len(live['requiredMissingLive'])))
    for k in ('calcLabelsMissing', 'sliderMismatch', 'chipMissing', 'planLabelsMissing', 'standardsMissing', 'requiredMissingSheet', 'requiredMissingLive'):
        for m in live[k][:40]: out('  - %s: %s' % (k, m))
    # ---- developer comparison
    out('')
    out('## 2. Screen inputs vs the developer sheets (names, defaults, ranges)')
    cnt = dict(inputs=0, mapped=0, name_missing=0, default_same=0, default_diff=0, ui_blank=0, dev_blank=0, range_inside=0, range_outside=0, range_na=0, step_ok=0, step_diff=0, step_na=0, unmapped=0)
    diffs, outside, steps, names_missing, unmapped, blanks = [], [], [], [], [], []
    ids = {c['n']: c['id'] for c in X['calcs']}
    for n, cid in sorted(ids.items()):
        m = calcmap[cid]; sheet = m['sheet']
        if sheet not in wb.sheetnames: out('- %s: developer sheet "%s" not found' % (n, sheet)); continue
        wsv, wsf = wb[sheet], wbf[sheet]
        names = {}
        for nm, dn in wsf.defined_names.items():
            for sh, ref in dn.destinations:
                if sh == sheet: names[nm] = ref.replace('$', '')
        inmap = {i['key']: i for i in m['inputs']}
        rec = next(c for c in X['calcs'] if c['id'] == cid)
        # screen inputs, taken from the rows of the sheet itself
        for r in [r for r in calc if r['n'] == n and str(r['type']).startswith('Input') and r['sec'] in ('Inputs', 'What if…')]:
            cnt['inputs'] += 1
            key = next((i['k'] for i in rec['def']['inputs'] + rec['def']['wi'] if i['l'] == r['label']), None)
            mp = inmap.get(key)
            if not mp: cnt['unmapped'] += 1; unmapped.append('%s "%s" (screen key %s) has no developer cell in the name map' % (n, r['label'], key)); continue
            cnt['mapped'] += 1
            co = names.get(mp['name'])
            if not co: cnt['name_missing'] += 1; names_missing.append('%s %s: name %s not found on "%s"' % (n, r['label'], mp['name'], sheet)); continue
            row = int(re.sub(r'\D', '', co)); entry = names.get(mp['name'] + '_Entry') or 'C%d' % row
            dflt = wsv['F%d' % row].value; at = wsv['E%d' % row].value or ''
            kind = mp['kind']; sc = 100.0 if kind == 'pct' else 1.0
            ui = r['noplan']; uin = None
            if r['type'] == 'Input choice': uin = 1.0 if str(ui).strip() == 'Yes' else 0.0 if str(ui).strip() == 'No' else num(ui)
            elif ui and not str(ui).startswith('('): uin = num(ui)
            # default
            if uin is None: cnt['ui_blank'] += 1; blanks.append('%s "%s": screen starts blank (customer chooses); developer default %s' % (n, r['label'], dflt))
            elif dflt in (None, ''): cnt['dev_blank'] += 1; diffs.append('%s "%s": developer default blank, screen starts at %s' % (n, r['label'], ui))
            else:
                try:
                    if abs(float(dflt) * sc - uin) <= 1e-6 * max(1, abs(uin)): cnt['default_same'] += 1
                    else: cnt['default_diff'] += 1; diffs.append('%s "%s" (%s!%s): screen starts at %s, developer example default %s' % (n, r['label'], sheet, co, ui, ('%g' % (float(dflt) * sc))))
                except (TypeError, ValueError): cnt['default_diff'] += 1; diffs.append('%s "%s": developer default is text %r' % (n, r['label'], dflt))
            # range from the validation on the entry cell
            dvlo = dvhi = None
            for v in wsf.data_validations.dataValidation if wsf.data_validations else []:
                if entry in v.sqref and v.type in ('decimal', 'whole'):
                    try: dvlo, dvhi = float(v.formula1) * sc, float(v.formula2) * sc
                    except (TypeError, ValueError): pass
            mn, mx, stp = num(r['min']), num(r['max']), num(r['step'])
            if r['type'] == 'Input slider' and mn is not None and dvlo is not None:
                if dvlo - 1e-9 <= mn and mx <= dvhi + 1e-9: cnt['range_inside'] += 1
                else: cnt['range_outside'] += 1; outside.append('%s "%s": slider %g to %g, developer validation %g to %g' % (n, r['label'], mn, mx, dvlo, dvhi))
            else: cnt['range_na'] += 1
            ms = re.search(r'steps? of ([\d.,]+)', str(at))
            if r['type'] == 'Input slider' and stp is not None and ms:
                if abs(float(ms.group(1).replace(',', '')) - stp) < 1e-9: cnt['step_ok'] += 1
                else: cnt['step_diff'] += 1; steps.append('%s "%s": slider step %g, developer says steps of %s' % (n, r['label'], stp, ms.group(1)))
            else: cnt['step_na'] += 1
    out('- Screen inputs read (Inputs and What if sections): %d; mapped to a developer cell: %d; no mapping: %d; mapped name missing in the sheet: %d' % (cnt['inputs'], cnt['mapped'], cnt['unmapped'], cnt['name_missing']))
    out('- Start value vs the developer example default: same %d, **differs %d**, screen blank by design (customer must choose) %d, developer blank %d' % (cnt['default_same'], cnt['default_diff'], cnt['ui_blank'], cnt['dev_blank']))
    out('- Slider range vs the developer validation: inside %d, **outside %d**, not comparable %d' % (cnt['range_inside'], cnt['range_outside'], cnt['range_na']))
    out('- Slider step vs the developer "steps of N" text: same %d, **differs %d**, no step text %d' % (cnt['step_ok'], cnt['step_diff'], cnt['step_na']))
    for title, lst in (('Mapped names missing in the developer sheet', names_missing), ('Screen inputs without a developer cell', unmapped), ('Start values that differ', diffs), ('Slider ranges outside the developer validation', outside), ('Slider steps that differ', steps), ('Screen starts blank by design', blanks)):
        out(''); out('### %s (%d)' % (title, len(lst)))
        for x in lst: out('- ' + x)
    if a.report: open(a.report, 'w').write('\n'.join(lines) + '\n')
    bad = len(live['calcLabelsMissing']) + len(live['planLabelsMissing']) + len(live['chipMissing']) + len(live['sliderMismatch']) + len(live['standardsMissing']) + len(live['requiredMissingSheet']) + len(live['requiredMissingLive']) + (0 if live['standards'] == live['standardsLive'] == live['standardsExtract'] else 1)
    print('\nLABEL/RANGE FAILURES vs live prototype: %d' % bad)
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
