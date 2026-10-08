#!/usr/bin/env node
// Extracts every screen element of the LifeMap prototype's 28 calculators and the Make-my-plan journey from the LIVE page (Playwright).
// Nothing is typed by hand: labels, units, ranges, start values, chips, help text, results and screenshots all come from the running prototype.
// Usage: NODE_PATH=<dir with playwright> node tools/extract_ui.js <outDir> [--shots]
//   writes <outDir>/ui-extract.json (deterministic: no timestamps) and, with --shots, <outDir>/shots/*.png (390 px wide).
const fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const HTML = process.env.UI_HTML || path.resolve(__dirname, '..', 'LifeGoals-Customer-Journey-Prototype.html');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'out')), SHOTS = process.argv.includes('--shots');

const { INSTALL, prime, openCalc, openHow, PLAN_SCREENS } = require('./ui_states');

// ---------- in-page readers ----------
const READ_CALC = () => {
  const U = window.__ui, T = U.T, main = document.getElementById('main'), head = document.querySelector('#screen header');
  const h2 = head.querySelector('h2'); const out = { title: U.own(h2) || T(h2), titleFull: T(h2), sub: T(head.querySelector('p.sub')), tip: T(head.querySelector('.note')) };
  const ex = document.getElementById('exlab'); out.exlab = ex ? { text: T(ex), shown: U.vis(ex) } : null;
  out.eyebrow = T(main.querySelector(':scope > .eyebrow'));
  const adj = main.querySelector('.adjrow'); out.adj = adj ? { label: T(adj.querySelector('button')), help: T(adj.querySelector('.small')), on: adj.querySelector('button').getAttribute('aria-checked') } : null;
  out.fields = [...main.querySelectorAll('.field')].filter(U.vis).flatMap(f => U.fieldRows(f).map(fi => { const card = f.closest('.card'), det = f.closest('details'); fi.section = det ? U.own(det.querySelector('summary')) || T(det.querySelector('summary')) : card && card.querySelector(':scope > b') ? T(card.querySelector(':scope > b')) : card && card.id === 'cout' ? 'Result' : 'Inputs'; return fi; }));
  const cout = document.getElementById('cout'); const g = document.getElementById('cgate');
  if (g) out.gate = { eyebrow: T(g.querySelector('.eyebrow')), msg: T(g.querySelector('b')), also: T(g.querySelector('p')) };
  const rc = cout && !g ? cout.querySelector('.card') : null;
  if (rc) out.result = { lbl: T(rc.querySelector('.eyebrow')), val: T(rc.children[1]), exres: T(rc.querySelector('.exres')), line: T(rc.querySelector('p:not(.exres)')), rows: [...rc.querySelectorAll('.row')].map(r => [T(r.children[0]), T(r.children[1])]) };
  out.inflNote = [...main.querySelectorAll(':scope > p.small')].map(T);
  out.buttons = [...main.querySelectorAll('[data-a="calcadd"],[data-a="expertfor"]')].map(b => ({ text: T(b), action: b.dataset.a, param: b.dataset.p }));
  out.disc = T(main.querySelector('.disc'));
  out.cards = [...main.querySelectorAll(':scope > .card')].map(c => T(c).slice(0, 80));
  return out;
};
const NUM = () => { const id = (S.xs[S.xs.length - 1] || {}).p, c = C(id), r = c.run(calcVals(c)); const o = {}; Object.entries(r.num || {}).forEach(([k, v]) => { o[k] = typeof v === 'number' && isFinite(v) ? v : typeof v === 'string' ? v : null; }); return o; };
const DEF_CALC = () => CALCS.map((c, i) => ({ id: c.id, n: 'C' + String(i + 1).padStart(2, '0'), name: c.name, q: c.q, tip: c.tip || null, em: c.em, cat: c.cat, catName: CATS.find(x => x.id === c.cat).name, inputs: c.inputs.map(x => ({ k: x.k, l: x.l, v: x.v, min: x.min, max: x.max, step: x.step, u: x.u })), wi: (c.wi || []).map(x => ({ k: x.k, l: x.l, v: x.v, min: x.min, max: x.max, step: x.step, u: x.u })) }));

(async () => {
  fs.mkdirSync(OUT, { recursive: true }); if (SHOTS) fs.mkdirSync(path.join(OUT, 'shots'), { recursive: true });
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 390, height: 2600 }, deviceScaleFactor: 1 });
  const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && !/Failed to load resource|ERR_/.test(m.text()) && errors.push(m.text()));
  await page.route('https://fonts.googleapis.com/**', r => r.abort()); await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto('file://' + HTML); await page.waitForTimeout(400); await page.evaluate(INSTALL);
  const ev = (f, a) => page.evaluate(f, a);
  const shot = async (name, trim) => { if (!SHOTS) return null; await ev(() => { document.getElementById('toast').innerHTML = ''; document.activeElement && document.activeElement.blur && document.activeElement.blur(); const sc = document.getElementById('screen') || document.body; sc.scrollTop = 0; });
    await page.setViewportSize({ width: 390, height: 6000 }); await page.waitForTimeout(200);
    const need = await ev(() => { const ph = document.getElementById('phone').getBoundingClientRect(); let b = 0; const foot = document.querySelector('#screen .foot'), fh = foot ? foot.getBoundingClientRect().height : 0;
      document.querySelectorAll('#screen *').forEach(e => { if (e.children.length || e.closest('.foot,.askfab,#toast,.tabbar,nav,.fab,.sheet-bg')) return; const r = e.getBoundingClientRect(); if (r.width > 0 && r.height > 0) b = Math.max(b, r.bottom - ph.top); });
      return Math.ceil(b + fh + 130); });
    await page.setViewportSize({ width: 390, height: Math.min(6000, Math.max(700, need)) }); await page.waitForTimeout(200);
    const f = path.join(OUT, 'shots', name + '.png'); await page.locator('#phone').screenshot({ path: f }); await page.setViewportSize({ width: 390, height: 2600 }); await page.waitForTimeout(100); return 'shots/' + name + '.png'; };
  const open = (state, id) => openCalc(page, state, id);
  const defs = await ev(DEF_CALC), calcs = [];
  // preference sources: which of the customer's own data changes this tool's pre-filled value (found by changing each stored figure and re-reading the tool)
  const sources = async id => ev(id => { loadSample(); S.app = true; S.shell = true; applyAssume(); const c = C(id), base = JSON.parse(JSON.stringify(calcPre(c))), out = {}; const keys = Object.keys(S.fin);
    const poke = (label, fn, undo) => { try { fn(); const p = calcPre(c); Object.keys(Object.assign({}, p, base)).forEach(k => { if (JSON.stringify(p[k]) !== JSON.stringify(base[k])) { (out[k] = out[k] || []).push(label); } }); } finally { undo(); } };
    keys.forEach(k => { const o = S.fin[k], os = S.src[k]; if (o === '' || o == null || isNaN(+o)) return; poke((FF[k] && FF[k].l) || k, () => { S.fin[k] = +o + 1237; S.src[k] = S.src[k] || 'typed'; }, () => { S.fin[k] = o; S.src[k] = os; }); });
    { const o = S.about.age; poke('Your age', () => { S.about.age = o + 7; }, () => { S.about.age = o; }); }
    { const o = S.retireAge; poke('Your retirement age', () => { S.retireAge = o + 3; }, () => { S.retireAge = o; }); }
    S.goals.filter(g => g.saved != null).forEach(g => { const o = g.saved; poke('Goal "' + g.name + '": saved so far', () => { g.saved = (o || 0) + 1237; }, () => { g.saved = o; }); });
    const ass = {}; (c.inputs.concat(c.wi || [])).forEach(i => { const a = calcA(id, i.k); if (a) ass[i.k] = (ASM[a.a] || {}).n || a.n || a.a; });
    return { pre: base, via: out, assume: ass }; }, id);
  for (const d of defs) {
    const rec = { n: d.n, id: d.id, name: d.name, q: d.q, em: d.em, group: d.catName, cat: d.cat, tipDef: d.tip, def: { inputs: d.inputs, wi: d.wi } };
    await open('none', d.id); rec.none = await ev(READ_CALC); rec.shotNone = await shot(d.n + '-none');
    await ev(() => { const b = document.querySelector('#main [data-a="calcadd"]'); b && b.click(); }); await page.waitForTimeout(120);
    rec.addGated = await ev(() => { const t = document.querySelector('#toast .t'); const s = document.querySelector('.sheet'); return { toast: t ? window.__ui.T(t) : null, sheet: s ? window.__ui.T(s).slice(0, 300) : null }; });
    await open('chosen', d.id); rec.chosen = await ev(READ_CALC); rec.numChosen = await ev(NUM);
    await ev(() => { const b = document.querySelector('#main [data-a="calcadd"]'); b && b.click(); }); await page.waitForTimeout(120);
    rec.addNone = await ev(() => { const t = document.querySelector('#toast .t'); const s = document.querySelector('.sheet'); return { toast: t && !s ? window.__ui.T(t) : null, h2: s ? window.__ui.T(s.querySelector('h2')) : null, sub: s ? window.__ui.T(s.querySelector('p.sub')) : null, buttons: s ? [...s.querySelectorAll('button:not(.sx)')].map(window.__ui.T) : [] }; });
    await open('chosen', d.id);
    await open('plan', d.id); rec.plan = await ev(READ_CALC); rec.numPlan = await ev(NUM); rec.shotPlan = await shot(d.n + '-plan'); rec.src = await sources(d.id);
    await open('plan', d.id);
    await ev(() => { const b = document.querySelector('#main [data-a="calcadd"]'); b && b.click(); }); await page.waitForTimeout(150);
    rec.addPlan = await ev(() => { const s = document.querySelector('.sheet'); return s ? { h2: window.__ui.T(s.querySelector('h2')), sub: window.__ui.T(s.querySelector('p.sub')), eyebrow: window.__ui.T(s.querySelector('.eyebrow')), buttons: [...s.querySelectorAll('button:not(.sx)')].map(window.__ui.T), text: window.__ui.T(s).slice(0, 400) } : null; });
    await open('plan', d.id);
    await ev(() => { const b = document.querySelector('#main [data-a="expertfor"]'); b && b.click(); }); await page.waitForTimeout(150);
    rec.expert = await ev(() => { const h = document.querySelector('#screen header h2'); return { tab: S.tab, exp: S.exp || null, id: lastId || null, heading: h ? window.__ui.T(h) : null, sheet: S.sheet || null, what: window.__ui.T(document.getElementById('main') || document.body).slice(0, 160) }; });
    calcs.push(rec);
  }
  // explore groups (order as in the app)
  const groups = await ev(() => CATS.map(c => ({ id: c.id, name: c.name, tools: CALCS.filter(x => x.cat === c.id).map(x => x.id) })));
  const exploreCalcList = await (async () => { await prime(page, 'none'); await ev(() => { S.tab = 'explore'; S.xs = []; lastId = null; render(); }); return ev(() => window.__ui.walk(document.getElementById('main')).filter(r => r.text).map(r => ({ type: r.type, text: r.text, action: r.action || null, param: r.param || null }))); })();
  // ---------- Make my plan ----------
  const plan = [];
  const readScreen = async (how, name, extra) => { const sel = await openHow(page, how);
    const r = await ev(sel => { const main = sel === 'main' ? (document.getElementById('main') || document.getElementById('screen')) : document.querySelector(sel); const h = sel === 'main' ? document.querySelector('#screen header') : null;
      if (sel !== 'main') return { head: [], body: window.__ui.walk(main).filter(x => x.text || x.type.startsWith('Input')), foot: [] };
      return { head: h ? window.__ui.walk(h).filter(x => x.text) : [], body: window.__ui.walk(main).filter(x => x.text || x.type.startsWith('Input')), foot: [...document.querySelectorAll('#screen .foot')].flatMap(f => window.__ui.walk(f)).filter(x => x.text) }; }, sel);
    const seen = new Set(r.body.map(x => x.type + '|' + x.text)); const foot = r.foot.filter(x => !seen.has(x.type + '|' + x.text));
    const shotF = sel === 'main' ? await shot('MP-' + how.replace(/[^A-Za-z0-9-]/g, '_')) : null;
    plan.push({ screen: how.split(':')[0] + (extra ? ' ' + extra : ''), how, name: name + (extra ? ' · ' + extra : ''), rows: r.head.concat(r.body, foot), shot: shotF }); };
  for (const [id, name] of PLAN_SCREENS) {
    if (id === 'P3') { for (let i = 0; i < 6; i++) { await openHow(page, 'P3:' + i); const secName = await ev(() => { const h = document.querySelector('#screen header h2'); return h ? window.__ui.T(h) : ''; }); await readScreen('P3:' + i, name, 'section ' + (i + 1) + ' ' + secName.replace(/[^A-Za-z0-9 ]/g, '').trim()); } continue; }
    await readScreen(id, name, id === 'P4-start' ? 'start: nothing chosen yet' : '');
  }
  // Settings standards as the customer sees them (Your assumptions fields and their chips)
  const standards = await ev(() => { loadSample(); applyAssume(); const o = []; Object.keys(ASM).forEach(k => { const d = ASM[k]; try { const box = document.createElement('div'); box.innerHTML = asmInput(k); const f = box.querySelector('.field'); if (!f) return; const fr = window.__ui.fieldRows(f), fi = fr[0]; const st = typeof d.sug === 'function' ? d.sug() : null; o.push({ key: k, group: (ASM_GRP.find(g => g[0] === d.g) || [])[1] || d.g, label: d.l, tags: fi.tags, kind: d.t, unit: d.u || null, standard: st == null ? null : asmFmt(d, st), chips: fi.chips.map(c => c.t).concat(fi.options.map(c => c.t)), help: fi.help, guide: asmGuide(d), type: d.ty || null, gate: d.n || null }); } catch (e) { o.push({ key: k, error: String(e) }); } }); return o; });
  const settings = await ev(() => Object.entries(SETTINGS.s).map(([k, s]) => ({ key: k, name: s.n, group: s.grp, value: s.pv != null ? s.pv : s.v, unit: s.u, wording: typeof s.by === 'string' ? s.by : null, source: s.src || null, asat: s.asat || null, guide: s.guide || null, verify: !!s.verify })));
  const examples = await ev(() => { const o = {}; Object.keys(EXAMPLES).sort().forEach(k => { try { const d = document.createElement('div'); d.innerHTML = exHTML(k); o[k] = window.__ui.N(d.textContent); } catch (e) { o[k] = null; } }); return o; });
  const meta = { prototype: path.basename(HTML), calcCount: calcs.length, screens: plan.length, errors };
  fs.writeFileSync(path.join(OUT, 'ui-extract.json'), JSON.stringify({ meta, groups, exploreCalcList, calcs, plan, standards, settings, examples }, null, 1));
  console.log('extracted', calcs.length, 'calculators,', plan.length, 'plan screens,', standards.length, 'assumption fields; page errors:', errors.length, errors.slice(0, 3)); await browser.close();
})();
