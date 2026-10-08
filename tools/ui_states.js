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
    const extraChips = [...f.querySelectorAll('button.chip, button.link[data-a="ckstd"], button[data-a="asmstd"], button[data-a="asmsug"], button[data-a="asmcap"], button[data-a="asmadv"]')].filter(b => !inGroup(b) && vis(b)).map(btnInfo);
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
    const SEL = '.field, h1, h2, h3, h4, [role=heading], summary, p, .sub, .eyebrow, .note, .nudge, .disc, .small, .tag, button, a[href], input, select, textarea, label, .mini, li, .row, b';
    const isGroup = e => { const k = [...e.children]; return k.length >= 2 && k.every(c => c.tagName === 'BUTTON' && (c.hasAttribute('aria-pressed') || c.classList.contains('chip') || c.classList.contains('opt'))); };
    const GSEL = SEL + ', .seg, .chips, .tiles, div, section';
    root.querySelectorAll(GSEL).forEach(e => {
      if (done.has(e) || !vis(e)) return;
      if (e.matches('div,section,.seg,.chips,.tiles') && !e.matches('.field,.eyebrow,.note,.nudge,.disc,.sub,.small,.tag,.mini,.row,.fhelp')) { if (isGroup(e) && !e.closest('.field')) { const o = [...e.children].map(btnInfo); let lb = N(e.getAttribute('aria-label') || ''); if (!lb) { let p = e.previousElementSibling; while (p && !lb) { if (/^(H\d|P|LABEL|SPAN|DIV|B)$/.test(p.tagName) && T(p)) lb = T(p).slice(0, 160); p = p.previousElementSibling; } } add({ type: 'Input choice', text: lb, options: o, selected: o.filter(x => x.on).map(x => x.t), chips: [], tags: [], help: [], hint: [] }); done.add(e); e.querySelectorAll('*').forEach(x => done.add(x)); } return; } if (e.closest('.sheet-bg') && !(opt && opt.sheet)) return;
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
      if (e.matches('.mini')) { add({ type: 'Row', text: T(e), parts: [...e.children].map(T).filter(Boolean) }); consume(); return; }
      if (e.matches('.row') && e.children.length >= 2 && !e.querySelector('button,input')) { add({ type: 'Row', text: T(e), parts: [...e.children].map(T).filter(Boolean) }); consume(); return; }
      if (e.matches('.eyebrow')) { add({ type: 'Eyebrow', text: T(e) }); consume(); return; }
      if (e.matches('.note,.nudge')) { add({ type: e.matches('.nudge') ? 'Banner' : 'Note', text: T(e) }); consume(); return; }
      if (e.matches('.disc')) { add({ type: 'Disclaimer', text: T(e) }); consume(); return; }
      if (e.tagName === 'LI') { add({ type: 'List item', text: T(e) }); consume(); return; }
      if (e.matches('p,.sub,.small')) { const t = T(e); if (t) add({ type: e.matches('.small') ? 'Help text' : 'Text', text: t }); consume(); return; }
      if (e.tagName === 'B') { const t = T(e); if (t && !e.closest('p,li,button,summary,.mini,.row,.note,.nudge,.small,h1,h2,h3,h4')) add({ type: 'Text (bold)', text: t }); done.add(e); }
    });
    return rows;
  };
  window.__ui = { N, T, vis, own, fieldRows, walk, keyOf };
};


// ---------- how each state is reached (one place, so the checker re-opens exactly what the extractor read) ----------
const prime = async (page, state) => { await page.evaluate(s => { if (s === 'none' || s === 'chosen') { S = fresh(); S.shell = true; S.app = false; } else { loadSample(); S.app = true; S.shell = true; } }, state); };
const openCalc = async (page, state, id) => {
  await prime(page, state); await page.evaluate(id => { S.tab = 'explore'; S.xs = [{ v: 'CALC', p: id }]; S.sheet = null; lastId = null; render(); }, id);
  if (state === 'chosen') { await page.evaluate(() => { useAllStd(); S.infl = 0.02; S.retireSet = true; S.retireAge = 66; S.asm = Object.assign({}, S.asm, { planEnd: 90 }); applyAssume(); lastId = null; render(); });
    for (let k = 0; k < 8; k++) { const b = await page.$('#main [data-a="ckstd"]'); if (!b) break; await b.click(); await page.waitForTimeout(60); }
    const infl = await page.$('#main [data-a="infl"][data-p="0.02"]'); if (infl) { await infl.click(); await page.waitForTimeout(60); } }
  await page.waitForTimeout(80); };
const PLAN_SCREENS = [['ME-ASM', 'Your assumptions (the Settings standards)'], ['B1', '1 · About you & family'], ['F1', '2 · Your goals'], ['F2', '3 · Your timeline (drag)'], ['F4', '3 · Confirm my LifeMap'], ['B4', '4 · Your money profile'], ['P1', '5 · Secure your account'], ['P1E', '5 · Email code'], ['P2', '6 · Your finances hub'], ['P3', '6 · Your finances: section'], ['P4', '7 · Check your details'], ['P4-start', '7 · Check your details'], ['HOME', 'Home dashboard'], ['PLAN', 'My Plan (timeline + results)'], ['PLAN-WI', 'My Plan: What if…? card'], ['PLAN-RANK', 'My Plan: goal ranking'], ['HOME-FND', 'Home: Your financial foundations'], ['ME-MONEY', 'My money'], ['ME-CHK', 'Your first answers (re-check)'], ['XPL', 'Explore (with a plan)']];
// open a plan-builder / results state; returns the DOM element to read (null = the whole #main)
const openHow = async (page, how) => {
  const jump = async id => { await page.evaluate(id => { const s = JUMPS.flatMap(g => g[1]).find(x => x[0] === id); S = fresh(); s[2](); lastId = null; S.sheet = S.sheet || null; render(); }, id); await page.waitForTimeout(150); };
  const [id, arg] = how.split(':');
  if (id === 'P3') { await jump('P3-2'); await page.evaluate(i => { openSec(+i); }, arg); await page.waitForTimeout(120); return 'main'; }
  if (id === 'P4-start') { await page.evaluate(() => { loadSample(); S.app = false; S.shell = true; S.pb = true; S.tab = 'plan'; S.scr = 'P4'; S.retireSet = false; S.infl = null; S.asm = {}; S.pRetSet = false; S.checked = false; lastId = null; render(); }); await page.waitForTimeout(150); return 'main'; }
  if (id === 'PLAN-WI') { await page.evaluate(() => { loadSample(); S.tab = 'plan'; S.planSeg = 'main'; S.planGo = 'wi'; S.wi.g = S.goals[1].id; S.wi.m = 325; lastId = null; render(); }); return '#r-wi'; }
  if (id === 'PLAN-RANK') { await page.evaluate(() => { loadSample(); S.tab = 'plan'; S.planSeg = 'main'; S.asmOpen = 'rank'; lastId = null; render(); const e = document.querySelector('details[data-g="rank"]'); if (e) e.open = true; }); return 'details[data-g="rank"]'; }
  if (id === 'HOME-FND') { await page.evaluate(() => { loadSample(); S.tab = 'home'; lastId = null; render(); }); return '#h-fnd'; }
  if (id === 'ME-ASM') { await page.evaluate(() => { loadSample(); S.app = true; S.shell = true; S.tab = 'me'; S.me = 'asm'; S.sheet = null; lastId = null; render(); }); return 'main'; }
  if (id === 'XPL') { await page.evaluate(() => { loadSample(); S.tab = 'explore'; S.xs = []; lastId = null; render(); }); return 'main'; }
  await jump(id); return 'main'; };
module.exports = { INSTALL, prime, openCalc, openHow, PLAN_SCREENS };
