// Shared by extract_ui.js and check_ui_extract.js: the in-page helpers and the exact way every screen state is opened.
const INSTALL_SRC = null; // (the function is exported below)
// ---------- helpers that run inside the page ----------
const INSTALL = () => {
  const N = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  const vt = n => { if (n.nodeType === 3) return n.textContent; if (n.nodeType !== 1) return ''; const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return ''; if (n.classList.contains('tick') && n.closest('[aria-pressed="false"]')) return ''; if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') return ''; return [...n.childNodes].map(vt).join(''); };
  const T = e => e ? N(vt(e)) : null;
  const vis = e => { if (!e || e.hidden || e.closest('[hidden]')) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return cs.display !== 'none' && cs.visibility !== 'hidden' && (r.width > 0 || r.height > 0 || e.tagName === 'INPUT'); };
  const own = e => { const c = e.cloneNode(true); c.querySelectorAll('.tag,.nbox,.chips,.nbhint,input,select,textarea,button.chip,.small').forEach(x => x.remove()); return N(c.textContent); };
  const keyOf = f => { const nb = f.querySelector('input[data-nb]'); if (nb) return nb.dataset.nb.split('|').slice(-1)[0]; const r = f.querySelector('input[data-ck],input[data-in]'); if (r) return r.dataset.ck || r.dataset.in; if (f.dataset.k) return f.dataset.k; const ch = f.querySelector('button[data-p]'); if (ch) return ch.dataset.p.split('|')[0]; return null; };
  const GRP = '.seg,.chips,.tiles,[role=group],.stepper';
  const groupsOf = f => [...f.querySelectorAll('.seg,.chips,.tiles')].filter(g => !g.parentElement.closest('.seg,.chips,.tiles') && g.querySelector('button'));
  const btnInfo = b => ({ t: T(b), on: b.getAttribute('aria-pressed') === 'true' || b.classList.contains('sel') || b.classList.contains('on') });
  const labelOf = f => { const l = f.querySelector(':scope > .flabel, :scope > label') || f.querySelector('.flabel, label'); if (!l) return { text: null, tags: [] }; const c = l.cloneNode(true); const tags = [...c.querySelectorAll('.tag')].map(T); const opt = [...c.querySelectorAll('.small')].map(T); c.querySelectorAll('.tag,.nbox,.chips,.seg,.nbhint,input,select,textarea,button,.small,.inw').forEach(x => x.remove()); return { text: N(c.textContent), tags: tags.concat(opt) }; };
  // one .field can hold several controls (a name box and a Yes/No pair); every control becomes its own row, sharing the field's label unless it has its own
  const fieldRows = f => {
    const lab = labelOf(f), rg = f.querySelector('input[type=range]'), nbs = [...f.querySelectorAll('input.nb')], txt = [...f.querySelectorAll('input.in, input[type=text], input[type=email], input[type=tel], input[type=number], textarea')].filter(x => !x.classList.contains('nb') && !x.classList.contains('sr')), cks = [...f.querySelectorAll('input[type=checkbox],input[type=radio]')], sels = [...f.querySelectorAll('select')], groups = groupsOf(f);
    const inGroup = b => groups.some(g => g.contains(b)), stepper = f.querySelector('.stepper');
    const extraChips = [...f.querySelectorAll('button.chip, button.link[data-a="ckstd"], button[data-a="asmstd"], button[data-a="asmsug"], button[data-a="asmcap"], button[data-a="asmadv"], button[data-a="asmback"]')].filter(b => !inGroup(b) && vis(b)).map(btnInfo);
    const help = [...f.querySelectorAll('.small, .fhelp, .hint')].filter(x => !x.closest('label,.flabel') && !x.closest('.seg,.chips') && !x.matches('.fhelp') && vis(x)).map(T).filter(Boolean), hint = [...f.querySelectorAll('.nbhint')].map(T).filter(Boolean);
    const nbBox = f.querySelector('.nbox'), cur = f.querySelector('.cur,.nbu'); const uPre = nbBox && nbBox.firstElementChild && nbBox.firstElementChild.classList.contains('nbu') ? N(nbBox.firstElementChild.textContent) : '', uSuf = nbBox && nbBox.lastElementChild && nbBox.lastElementChild.classList.contains('nbu') && nbBox.lastElementChild !== nbBox.firstElementChild ? N(nbBox.lastElementChild.textContent) : '';
    const common = { key: keyOf(f), tags: lab.tags, help, hint, ex: !!f.querySelector('[data-a="fex"]'), example: [...f.querySelectorAll('[data-a="fex"]')].map(b => b.dataset.p) };
    const rows = [];
    if (rg) rows.push(Object.assign({ el: rg, kind: 'Input slider', label: lab.text, unit: uPre || uSuf || '', unitPos: uPre ? 'before' : uSuf ? 'after' : '', value: nbs[0] ? nbs[0].value : rg.value, min: rg.min, max: rg.max, step: rg.step, valuetext: rg.getAttribute('aria-valuetext'), typedBox: nbs.length > 0, stepper: !!stepper }, common));
    else nbs.concat(txt).forEach((x, i) => { const c = x.closest('.inw'); const cu = c && c.querySelector('.cur') ? N(c.querySelector('.cur').textContent) : ''; rows.push(Object.assign({ el: x, kind: 'Input text', label: labelFor(x) || lab.text, unit: uPre || uSuf || cu, unitPos: uPre || cu ? 'before' : uSuf ? 'after' : '', value: x.value, placeholder: x.placeholder || '', inputmode: x.getAttribute('inputmode') || '', maxlength: x.maxLength > 0 ? x.maxLength : null, min: null, max: null, step: null }, i === 0 ? common : { key: common.key, tags: [], help: [], hint: [], ex: false, example: [] })); });
    groups.forEach((g, i) => { const own2 = g.parentElement && g.parentElement !== f ? g.parentElement.querySelector(':scope > .flabel') : null; const gl = own2 ? (() => { const c = own2.cloneNode(true); c.querySelectorAll('.small,.tag,button').forEach(x => x.remove()); return N(c.textContent); })() : N(g.getAttribute('aria-label') || '') || lab.text; const o = [...g.querySelectorAll('button')].filter(vis).map(btnInfo); if (!o.length) return;
      rows.push(Object.assign({ el: g, kind: 'Input choice', label: gl || lab.text, options: o, selected: o.filter(x => x.on).map(x => x.t), unit: '', value: o.filter(x => x.on).map(x => x.t).join(', ') }, rows.length === 0 ? common : { key: common.key, tags: [], help: [], hint: [], ex: false, example: [] })); });
    cks.forEach(c => rows.push(Object.assign({ el: c, kind: 'Input choice', label: labelFor(c) || lab.text, options: [{ t: c.type === 'radio' ? 'select' : 'tick', on: c.checked }], selected: c.checked ? ['ticked'] : [], value: c.checked ? 'ticked' : 'not ticked', unit: '' }, rows.length ? { key: common.key, tags: [], help: [], hint: [], ex: false, example: [] } : common)));
    sels.forEach(s => rows.push(Object.assign({ el: s, kind: 'Input choice', label: labelFor(s) || lab.text, options: [...s.options].map(o => ({ t: N(o.text), on: o.selected })), selected: [s.options[s.selectedIndex] ? N(s.options[s.selectedIndex].text) : ''], value: s.options[s.selectedIndex] ? N(s.options[s.selectedIndex].text) : '', unit: '' }, rows.length ? { key: common.key, tags: [], help: [], hint: [], ex: false, example: [] } : common)));
    if (!rows.length) rows.push(Object.assign({ kind: 'Field', label: lab.text, unit: '', value: null }, common));
    rows.sort((a, b) => !a.el || !b.el ? 0 : (a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1));
    rows.forEach((r, i) => { if (i === 0) { r.key = common.key; r.tags = common.tags; r.help = common.help; r.hint = common.hint; r.ex = common.ex; r.example = common.example; } else { r.tags = r.tags || []; r.help = r.help || []; r.hint = r.hint || []; r.ex = false; r.example = []; } delete r.el; });
    if (extraChips.length) rows[0].chips = extraChips; rows.forEach(r => { r.chips = r.chips || []; r.options = r.options || []; r.selected = r.selected || []; });
    return rows; };
  const kindOfBtn = b => b.classList.contains('chip') || b.hasAttribute('aria-pressed') ? 'Input choice (chip)' : b.classList.contains('link') ? 'Link' : b.matches('[role=switch]') ? 'Input choice (switch)' : 'Button';
  const labelFor = e => { const l = e.getAttribute('aria-labelledby'); if (l) { const t = l.split(/\s+/).map(i => document.getElementById(i)).filter(Boolean).map(x => own(x) || T(x)).join(' '); if (t) return N(t); } if (e.getAttribute('aria-label')) return N(e.getAttribute('aria-label')); if (e.id) { const lb = document.querySelector('label[for="' + e.id + '"]'); if (lb) return own(lb); } const lb = e.closest('label'); if (lb) return own(lb) || T(lb); return e.placeholder || ''; };
  // generic walk: one row per element (a .field is ONE row), in document order
  const walk = (root, opt) => {
    const rows = [], done = new Set(), add = r => rows.push(r);
    const SEL = '.field, h1, h2, h3, h4, [role=heading], summary, p, .sub, .eyebrow, .note, .nudge, .disc, .small, .tag, button, a[href], input, select, textarea, label, .mini, li, .row, .gs, b';
    const isGroup = e => { const k = [...e.children]; return k.length >= 2 && k.every(c => c.tagName === 'BUTTON' && (c.hasAttribute('aria-pressed') || c.classList.contains('chip') || c.classList.contains('opt'))); };
    const GSEL = SEL + ', .seg, .chips, .tiles, div, section';
    (opt && opt.self ? [root] : []).concat([...root.querySelectorAll(GSEL)]).forEach(e => {
      if (done.has(e) || !vis(e)) return;
      if (e.matches('div,section,.seg,.chips,.tiles') && !e.matches('.field,.eyebrow,.note,.nudge,.disc,.sub,.small,.tag,.mini,.gs,.row,.fhelp')) { if (isGroup(e) && !e.closest('.field')) { const o = [...e.children].map(btnInfo); let lb = N(e.getAttribute('aria-label') || ''); if (!lb) { let p = e.previousElementSibling; while (p && !lb) { if (/^(H\d|P|LABEL|SPAN|DIV|B)$/.test(p.tagName) && T(p)) lb = T(p).slice(0, 160); p = p.previousElementSibling; } } add({ type: 'Input choice', text: lb, options: o, selected: o.filter(x => x.on).map(x => x.t), chips: [], tags: [], help: [], hint: [] }); done.add(e); e.querySelectorAll('*').forEach(x => done.add(x)); } return; } if (e.closest('.sheet-bg') && !(opt && opt.sheet)) return;
      const consume = () => { done.add(e); e.querySelectorAll('*').forEach(x => done.add(x)); };
      if (e.matches('.field') && !e.parentElement.closest('.field')) { const frs = fieldRows(e); consume(); frs.forEach(fi => add(Object.assign({ type: fi.kind, text: fi.label }, fi))); return; }
      if (e.tagName === 'INPUT' || e.tagName === 'SELECT' || e.tagName === 'TEXTAREA') {
        if (e.closest('.field')) return; const ty = (e.type || 'select').toLowerCase(), lb = labelFor(e);
        if (ty === 'range') add({ type: 'Input slider', text: lb, min: e.min, max: e.max, step: e.step, value: e.value, valuetext: e.getAttribute('aria-valuetext') });
        else if (ty === 'checkbox' || ty === 'radio') add({ type: 'Input choice', text: lb, value: e.checked ? 'ticked' : 'not ticked', inputType: ty });
        else if (e.tagName === 'SELECT') add({ type: 'Input choice', text: lb, value: e.options[e.selectedIndex] ? N(e.options[e.selectedIndex].text) : '', options: [...e.options].map(o => N(o.text)) });
        else add({ type: 'Input text', text: lb, value: e.value, placeholder: e.placeholder || '', inputType: ty, inputmode: e.getAttribute('inputmode') || '', maxlength: e.maxLength > 0 ? e.maxLength : null });
        done.add(e); return; }
      if (e.tagName === 'LABEL') { if (e.querySelector('input,select,textarea') || e.htmlFor) { done.add(e); return; } add({ type: 'Text', text: T(e) }); consume(); return; }
      if (e.tagName === 'BUTTON' || e.tagName === 'A') { const t = T(e) || N(e.getAttribute('aria-label')); if (!t) { consume(); return; } add({ type: kindOfBtn(e), text: t, pressed: e.hasAttribute('aria-pressed') ? e.getAttribute('aria-pressed') : null, action: e.dataset.a || null, param: e.dataset.p || null, disabled: !!e.disabled }); consume(); return; }
      if (/^(H1|H2|H3|H4)$/.test(e.tagName) || e.getAttribute('role') === 'heading') { add({ type: 'Heading', text: own(e) || T(e) }); consume(); return; }
      if (e.tagName === 'SUMMARY') { add({ type: 'Section header (opens)', text: T(e) }); consume(); return; }
      if (e.matches('.tag')) { add({ type: 'Tag', text: T(e) }); done.add(e); return; }
      // a row that holds buttons (the gate card's "Retirement age ... Choose", a goal with "Change the date"): the row text, then each button as its own row
      if (e.matches('.mini,.gs') && [...e.querySelectorAll('button')].some(vis)) { const btns = [...e.querySelectorAll('button')].filter(vis), strip = t => N(btns.reduce((a, b) => { const bt = T(b); return a.endsWith(bt) ? a.slice(0, a.length - bt.length) : a; }, t || ''));   // only a trailing button label is dropped (the gate rows); one in the middle stays so the row text is still exactly the screen's
        add({ type: 'Row', text: strip(T(e)), parts: [...e.children].map(c => strip(T(c))).filter(Boolean) });
        btns.forEach(b => { const t = T(b) || N(b.getAttribute('aria-label')); if (t) add({ type: kindOfBtn(b), text: t, pressed: b.hasAttribute('aria-pressed') ? b.getAttribute('aria-pressed') : null, action: b.dataset.a || null, param: b.dataset.p || null, disabled: !!b.disabled }); }); consume(); return; }
      if (e.matches('.mini,.gs')) { add({ type: 'Row', text: T(e), parts: [...e.children].map(T).filter(Boolean) }); consume(); return; }
      if (e.matches('.row') && e.children.length >= 2 && !e.querySelector('button,input')) { add({ type: 'Row', text: T(e), parts: [...e.children].map(T).filter(Boolean) }); consume(); return; }
      if (e.matches('.eyebrow')) { add({ type: 'Eyebrow', text: T(e) }); consume(); return; }
      if (e.matches('.note,.nudge')) { add({ type: e.matches('.nudge') ? 'Banner' : 'Note', text: T(e) }); consume(); return; }
      if (e.matches('.disc')) { add({ type: 'Disclaimer', text: T(e) }); consume(); return; }
      if (e.tagName === 'LI') { add({ type: 'List item', text: T(e) }); consume(); return; }
      if (e.matches('p,.sub,.small')) { const t = T(e); if (t) add({ type: e.matches('.small') ? 'Help text' : 'Text', text: t }); consume(); return; }
      if (e.tagName === 'B') { const t = T(e); const cl = e.closest('p,li,button,summary,.mini,.gs,.row,.note,.nudge,.small,h1,h2,h3,h4'); if (t && !(cl && cl !== root)) add({ type: 'Text (bold)', text: t }); done.add(e); }
    });
    return rows;
  };
  // scene(o): one place that builds a journey-spec 27 state from the sample customer (Aoife, 38, partner works).
  //  o.partner:false drops the partner; o.missing: required choices to clear (retireAge, planEnd, infl, pRetireAge); o.retire / o.pRet: set the ages;
  //  o.age: the customer's age; o.asm: customer's own assumption values; o.noAsm: assumption keys to clear; o.unsrc: figures to mark "not given"; o.tab / o.seg / o.view / o.sheet: where to land; o.step7: open Step 7.
  const scene = o => { o = o || {}; loadSample(); S.app = true; S.shell = true; S.sheet = null; S.xs = []; S.pb = false;
    if (o.partner === false) S.about.partner = false;
    if (o.age) S.about.age = o.age;
    if (o.asm || (o.noAsm && o.noAsm.length)) { S.asm = Object.assign({}, S.asm, o.asm || {}); (o.noAsm || []).forEach(k => { delete S.asm[k]; }); }
    (o.unsrc || []).forEach(k => { delete S.src[k]; });
    if (o.retire != null) setRetireAge(o.retire);
    if (o.pRet != null) { S.pRet = o.pRet; S.pRetSet = true; }
    (o.missing || []).forEach(k => { if (k === 'retireAge') S.retireSet = false; if (k === 'planEnd') { S.asm = Object.assign({}, S.asm); delete S.asm.planEnd; } if (k === 'infl') { S.infl = null; S.inflOther = false; } if (k === 'pRetireAge') S.pRetSet = false; });
    S.tab = o.tab || 'plan'; if (o.seg) S.planSeg = o.seg; if (o.view) S.view = o.view; if (o.sheet) S.sheet = o.sheet;
    if (o.step7) { S.app = false; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.checked = false; S.asmOpen = o.open || 'none'; }
    applyAssume(); lastId = null; render();
    if (o.csel != null) { const P = project(S.wi), i = P.rows.findIndex(r => r.a === o.csel); if (i >= 0) { S.csel = i; render(); } }
    if (o.openDetails) document.querySelectorAll('#screen details').forEach(d => { d.open = true; }); };
  window.__ui = { N, T, vis, own, fieldRows, walk, keyOf, scene };
};


// ---------- how each state is reached (one place, so the checker re-opens exactly what the extractor read) ----------
const prime = async (page, state) => { await page.evaluate(s => { if (s === 'none' || s === 'chosen') { S = fresh(); S.shell = true; S.app = false; } else { loadSample(); S.app = true; S.shell = true; } }, state); };
const openCalc = async (page, state, id) => {
  await prime(page, state); if (state === 'early') await page.evaluate(() => { setRetireAge(50); });
  await page.evaluate(id => { S.tab = 'explore'; S.xs = [{ v: 'CALC', p: id }]; S.sheet = null; lastId = null; render(); }, id);
  if (state === 'chosen') { await page.evaluate(() => { useAllStd(); S.infl = 0.02; S.retireSet = true; S.retireAge = 66; S.asm = Object.assign({}, S.asm, { planEnd: 90 }); applyAssume(); lastId = null; render(); });
    for (let k = 0; k < 8; k++) { const b = await page.$('#main [data-a="ckstd"]'); if (!b) break; await b.click(); await page.waitForTimeout(60); }
    const infl = await page.$('#main [data-a="infl"][data-p="0.02"]'); if (infl) { await infl.click(); await page.waitForTimeout(60); } }
  await page.waitForTimeout(80); };
const PLAN_SCREENS = [['ME-ASM', 'Your assumptions (the Settings standards)'], ['B1', '1 · About you & family'], ['F1', '2 · Your goals'], ['F2', '3 · Your timeline (drag)'], ['F4', '3 · Confirm my LifeMap'], ['B4', '4 · Your money profile'], ['P1', '5 · Secure your account'], ['P1E', '5 · Email code'], ['P2', '6 · Your finances hub'], ['P3', '6 · Your finances: section'], ['P4', '7 · Check your details'], ['P4-start', '7 · Check your details'], ['HOME', 'Home dashboard'], ['PLAN', 'My Plan (timeline + results)'], ['PLAN-WI', 'My Plan: What if…? card'], ['PLAN-RANK', 'My Plan: goal ranking'], ['HOME-FND', 'Home: Your financial foundations'], ['ME-MONEY', 'My money'], ['ME-CHK', 'Your first answers (re-check)'], ['XPL', 'Explore (with a plan)']];

// ---------- journey-spec 27 states (gate card, Step 7, free retirement age, date passed, early retirement, missing details) ----------
// Each state: id, group, name, note (what to look at), roots (CSS selectors whose elements are read; 'main' = the whole screen), setup (runs in the page).
const GATE_NOTE = 'journey-spec 27.7: one calm card, never more than the 3 to 4 required rows. Each row names the choice and its Choose button jumps to that box in Your assumptions and highlights it.';
const MISS = { r4: ['retireAge', 'planEnd', 'infl', 'pRetireAge'], r3p: ['planEnd', 'infl', 'pRetireAge'], r2p: ['infl', 'pRetireAge'], r1p: ['pRetireAge'], r3: ['retireAge', 'planEnd', 'infl'], r2: ['planEnd', 'infl'], r1: ['infl'] };
const gateState = (id, where, key, n, partner) => ({ id, group: 'Gate card', name: (where === 'res' ? 'Results gate' : where === 'home' ? 'Home gate' : 'Report / PDF gate') + ': ' + n + (n === 1 ? ' thing' : ' things') + (partner ? ' (partner works)' : ' (no working partner)'),
  note: GATE_NOTE + (where === 'res' ? ' On My Plan the strip above the timeline carries the same count.' : where === 'report' ? ' This is the sheet that opens from "Download my plan" before the choices are made.' : ''),
  roots: where === 'res' ? ['#tl-strip', '#gate-res'] : where === 'home' ? ['#gate-home'] : ['.sheet'], sheet: where === 'report', missing: MISS[key], partner, where });
const STATES = [].concat(
  [['G-R4', 'res', 'r4', 4, true], ['G-R3P', 'res', 'r3p', 3, true], ['G-R2P', 'res', 'r2p', 2, true], ['G-R1P', 'res', 'r1p', 1, true], ['G-R3', 'res', 'r3', 3, false], ['G-R2', 'res', 'r2', 2, false], ['G-R1', 'res', 'r1', 1, false],
   ['G-H4', 'home', 'r4', 4, true], ['G-H3', 'home', 'r3', 3, false], ['G-H1', 'home', 'r1', 1, false], ['G-P4', 'report', 'r4', 4, true], ['G-P3', 'report', 'r3', 3, false], ['G-P1', 'report', 'r1', 1, false]].map(a => gateState.apply(null, a)),
  [{ id: 'G-JUMP', group: 'Gate card', name: 'Gate: after tapping Choose (Inflation) the box is highlighted in Your assumptions', note: 'The Choose button on the gate card jumps to Your assumptions, opens the group and highlights the box (the flash).', roots: ['#main > .card', '.flash'], setupKey: 'jump' }],
  // Step 7
  [{ id: 'S7-3', group: 'Step 7', name: '7 · Choose 3 things (no working partner), none chosen', note: 'Step 7 with no working partner: three required choices. The two buttons below stay off until all three are chosen.', roots: ['main'], opts: { step7: true, partner: false, missing: ['retireAge', 'planEnd', 'infl'] } },
   { id: 'S7-3C', group: 'Step 7', name: '7 · Choose 3 things (no working partner), all chosen', note: 'All three chosen: "3 of 3 chosen" and the buttons are on.', roots: ['main'], opts: { step7: true, partner: false } },
   { id: 'S7-4P', group: 'Step 7', name: '7 · Choose 4 things (partner works), 2 of 4 chosen', note: 'Partner works: four required choices; two chosen, the footer line names the next one.', roots: ['main'], opts: { step7: true, missing: ['infl', 'pRetireAge'] } },
   { id: 'S7-LIST', group: 'Step 7', name: '7 · What we\'ve set for you (change any): opened, with Your choice and Back to LifeMap\'s figure', note: 'The collapsed list opened. Tags: Set by LifeMap (a standard everyone shares), Your choice (the customer changed it, with a Back to LifeMap\'s figure button), Assumed: add yours (a market rate or figure we assume), Not chosen yet (a required choice).', roots: ['#p4-3', '#p4-rest'], opts: { step7: true, open: 'p4', missing: ['retireAge', 'planEnd', 'infl', 'pRetireAge'], asm: { wage: 0.03, cash: 0.01 }, noAsm: ['cardRate', 'loanRate', 'mortRate'] } },
   { id: 'S7-ASSUMED', group: 'Step 7', name: '7 · Details we assumed: "Assumed: add yours" rows and the N details missing count', note: 'Figures the customer did not give never block: the list says what we use instead (25 years, your age, Employed, the Central Bank average rate, a planning rate).', roots: ['main'], opts: { step7: true, unsrc: ['pAge', 'work', 'mortYears'], noAsm: ['cardRate', 'loanRate', 'mortRate'] } }],
  // free retirement age
  [[45, 'c'], [55, 'c']].map(([a]) => ({ id: 'RA-C-' + a, group: 'Retirement age', name: '7 · Retirement age ' + a + ': free choice with a calm note (' + (a < 50 ? 'below 50' : 'below 60') + ')', note: 'Help text "Choose the age you want to plan for, any age from X to Y" (X = your age + 1, Y = plan-until age - 1) and, below ' + (a < 50 ? '50' : '60') + ', one calm line (never a block). Same box in Your assumptions.', roots: ['#p4-3'], opts: { step7: true, retire: a } })),
  [[45], [55]].map(([a]) => ({ id: 'RA-P-' + a, group: 'Retirement age', name: '7 · Partner\'s retirement age ' + a + ': free choice with a calm note (' + (a < 50 ? 'below 50' : 'below 60') + ')', note: 'The partner\'s box with its own calm note: their pay stops at this age; their own pension is not modelled below 60.', roots: ['#p4-3'], opts: { step7: true, pRet: a } })),
  [{ id: 'RA-C-63', group: 'Retirement age', name: '7 · Retirement age 63: no note', note: 'From 60 up there is no note; the help text still shows the allowed range.', roots: ['#p4-3'], opts: { step7: true, retire: 63 } }],
  // date has passed
  [{ id: 'DP-PLAN', group: 'Date has passed', name: 'Results: goals whose age is in the past ("Date has passed")', note: 'The customer later raised their age (here 45). Goals set for 40 and 41 read "Date has passed" with a Change the date button, never "in -4 years".', roots: ['#r-goals'], opts: { age: 45, seg: 'main' } },
   { id: 'DP-HOME', group: 'Date has passed', name: 'Home: goals at a glance with "Date has passed"', note: 'Same wording on Home.', roots: ['main'], opts: { age: 45, tab: 'home' } },
   { id: 'DP-F4', group: 'Date has passed', name: '3 · Confirm my LifeMap with "Date has passed"', note: 'Same wording where the goals are confirmed.', roots: ['main'], opts: { age: 45 }, scr: 'F4' }],
  // early retirement results
  [[50, 'detail', 50, 'Income stops: the year retirement starts (age 50)'], [50, 'detail', 55, 'Bridge year: age 55, before the pension can be drawn (60) and the State Pension (66)'], [50, 'detail', 60, 'Pension drawn from 60'], [45, 'journey', null, 'Retiring at 45: the road turns coral where money runs short']].map(([a, v, c, t]) => ({ id: 'ER-' + a + (c ? '-' + c : '-J'), group: 'Early retirement', name: 'Results: retiring at ' + a + ' · ' + t, note: 'Journey-spec 27.3: income stops at the chosen age; the pension is drawn only from the access age (60, or 50 if an occupational scheme allows it); the bridge years are paid from savings; any shortfall is shown, not hidden.', roots: ['#r-goals', '#r-glancec'], opts: { retire: a, seg: 'main', view: v, csel: c } })),
  [{ id: 'ER-55-ACC50', group: 'Early retirement', name: 'Results: retiring at 55 with the pension access age set to 50 (occupational scheme)', note: 'The Settings standard "Pension access age" set to From 50 (some occupational schemes): the pension can be drawn from retirement, so there is no bridge before it.', roots: ['#r-goals', '#r-glancec'], opts: { retire: 55, asm: { accessAge: 50 }, seg: 'main', view: 'detail', csel: 55 } },
   { id: 'ER-HOME', group: 'Early retirement', name: 'Home: retiring at 50', note: 'The Home goals list shows the retirement goal at the chosen age and its coverage.', roots: ['main'], opts: { retire: 50, tab: 'home' } },
   { id: 'ER-NOP', group: 'Early retirement', name: 'Results: retiring at 45, no working partner, detail year 50', note: 'Without a partner the household income stops completely at the retirement age.', roots: ['#r-goals', '#r-glancec'], opts: { retire: 45, partner: false, seg: 'main', view: 'detail', csel: 50 } }],
  // N details missing
  [{ id: 'BN-1', group: 'Details missing', name: 'Results: "1 detail missing" banner', note: 'Never blocks: the banner on Results says how many details are missing and that missing figures count as 0 (journey-spec 22 and 27.6). The sample customer has one detail to look at.', roots: ['#miss-banner'], opts: { seg: 'main' } },
   { id: 'BN-N', group: 'Details missing', name: 'Results: "N details missing" banner (assumed figures)', note: 'With several details assumed the same banner counts them and offers Add them.', roots: ['#miss-banner'], opts: { seg: 'main', unsrc: ['pAge', 'work', 'mortYears'], noAsm: ['cardRate', 'loanRate', 'mortRate'] } }]
);
const stateById = id => STATES.find(x => x.id === id);
// run inside the page
const SETUP = {
  jump: () => { const o = { missing: ['planEnd', 'infl', 'retireAge'], partner: false, seg: 'main' }; window.__ui.scene(o); const b = document.querySelector('#gate-res [data-a="gofix"][data-p="infl"]'); if (b) b.click(); }
};
// Your assumptions with every standard changed by the customer: each field then reads "Your choice" and offers "Back to LifeMap's figure"
const openAsmChanged = async page => { await page.evaluate(() => { loadSample(); applyAssume(); S.asm = Object.assign({}, S.asm);
  Object.keys(ASM).forEach(k => { const d = ASM[k], base = asmV(k); S.asm[k] = d.t === 'choice' ? (d.o.find(x => String(x[0]) !== String(base)) || d.o[0])[0] : (base == null ? 0 : +base) + (d.t === 'pct' ? 0.01 : 1); });
  S.app = true; S.shell = true; S.tab = 'me'; S.me = 'asm'; S.sheet = null; lastId = null; render(); }); await page.waitForTimeout(150); };
const openState = async (page, id) => {
  const st = stateById(id); if (!st) throw new Error('unknown state ' + id);
  if (st.setupKey) await page.evaluate(SETUP[st.setupKey]);
  else if (st.scr) await page.evaluate(([o, scr]) => { window.__ui.scene(o); const s = JUMPS.flatMap(g => g[1]).find(x => x[0] === scr); loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = scr; if (o.age) S.about.age = o.age; lastId = null; render(); }, [st.opts || {}, st.scr]);
  else await page.evaluate(o => { window.__ui.scene(o); }, st.where ? { missing: st.missing, partner: st.partner ? undefined : false, tab: st.where === 'home' ? 'home' : 'plan', seg: 'main', sheet: st.where === 'report' ? 'gate|report' : undefined } : st.opts);
  await page.waitForTimeout(150); return st; };
// open a plan-builder / results state; returns the DOM element to read (null = the whole #main)
const openHow = async (page, how) => {
  const jump = async id => { await page.evaluate(id => { const s = JUMPS.flatMap(g => g[1]).find(x => x[0] === id); S = fresh(); s[2](); lastId = null; S.sheet = S.sheet || null; render(); }, id); await page.waitForTimeout(150); };
  const [id, arg] = how.split(':');
  if (id === 'S27') { await openState(page, arg); return 'STATE'; }
  if (id === 'ME-ASM-CHANGED') { await openAsmChanged(page); return 'main'; }
  if (id === 'P3') { await jump('P3-2'); await page.evaluate(i => { openSec(+i); }, arg); await page.waitForTimeout(120); return 'main'; }
  if (id === 'P4-start') { await page.evaluate(() => { loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.retireSet = false; S.infl = null; S.asm = {}; S.pRetSet = false; S.checked = false; lastId = null; render(); }); await page.waitForTimeout(150); return 'main'; }
  if (id === 'PLAN-WI') { await page.evaluate(() => { loadSample(); S.tab = 'plan'; S.planSeg = 'main'; S.planGo = 'wi'; S.wi.g = S.goals[1].id; S.wi.m = 325; lastId = null; render(); }); return '#r-wi'; }
  if (id === 'PLAN-RANK') { await page.evaluate(() => { loadSample(); S.tab = 'plan'; S.planSeg = 'main'; S.asmOpen = 'rank'; lastId = null; render(); const e = document.querySelector('details[data-g="rank"]'); if (e) e.open = true; }); return 'details[data-g="rank"]'; }
  if (id === 'HOME-FND') { await page.evaluate(() => { loadSample(); S.tab = 'home'; lastId = null; render(); }); return '#h-fnd'; }
  if (id === 'ME-ASM') { await page.evaluate(() => { loadSample(); S.app = true; S.shell = true; S.tab = 'me'; S.me = 'asm'; S.sheet = null; lastId = null; render(); }); return 'main'; }
  if (id === 'XPL') { await page.evaluate(() => { loadSample(); S.tab = 'explore'; S.xs = []; lastId = null; render(); }); return 'main'; }
  await jump(id); return 'main'; };
module.exports = { INSTALL, prime, openCalc, openHow, openState, openAsmChanged, STATES, PLAN_SCREENS };
