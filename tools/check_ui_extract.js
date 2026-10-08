#!/usr/bin/env node
// Part of tools/check_ui_sheets.py. Opens the live prototype again (fresh browser) and confirms that what the UI sheets say is on screen IS on screen:
//  - every label (and every choice / chip text) of every calculator row appears in the page text of one of the three states it was read from;
//  - every slider row's min / max / step equals the live input's attributes;
//  - every label of every Make-my-plan row appears in the page text of the screen it was read from (collapsed sections are opened first).
// Input: a JSON dump of the two UI sheets (written by check_ui_sheets.py) and the extract (for how each screen is opened). Output: one JSON line.
const fs = require('fs'), path = require('path');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const { INSTALL, openCalc, openHow } = require('./ui_states');
const HTML = process.env.UI_HTML || path.resolve(__dirname, '..', 'LifeGoals-Customer-Journey-Prototype.html');
const dump = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), ext = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const flat = s => String(s == null ? '' : s).replace(/\s+/g, '').replace(/[\u200b\ufe0f]/g, '').toLowerCase();
(async () => {
  const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 390, height: 2600 } });
  await page.route('https://fonts.googleapis.com/**', r => r.abort()); await page.route('https://fonts.gstatic.com/**', r => r.abort());
  await page.goto('file://' + HTML); await page.waitForTimeout(400); await page.evaluate(INSTALL);
  const text = () => page.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = true); return document.body.innerText + ' ' + [...document.querySelectorAll('[aria-label],[placeholder]')].map(e => (e.getAttribute('aria-label') || '') + ' ' + (e.getAttribute('placeholder') || '')).join(' '); });
  const res = { calcRows: 0, calcLabelsMissing: [], sliderRows: 0, sliderMismatch: [], planRows: 0, planLabelsMissing: [], chipTexts: 0, chipMissing: [], screens: 0 };
  const SYN = new Set(['Line under the result']);
  const idOf = {}; ext.calcs.forEach(c => idOf[c.n] = c.id);
  const byCalc = {}; dump.calc.forEach(r => (byCalc[r.n] = byCalc[r.n] || []).push(r));
  for (const n of Object.keys(byCalc).sort()) {
    const id = idOf[n], rows = byCalc[n]; let all = '', sliders = {};
    for (const st of ['none', 'chosen', 'plan']) { await openCalc(page, st, id); all += ' ' + await text();
      sliders[st] = await page.evaluate(() => [...document.querySelectorAll('#main input[type=range]')].map(r => { const l = (document.getElementById((r.getAttribute('aria-labelledby') || '').split(' ')[0]) || {}).textContent || ''; return { label: window.__ui.N(l.replace(/\s*Not chosen yet|\s*Set by LifeMap|\s*Your choice|\s*Assumed: add yours|\s*From your statement|\s*Worked out.*$/g, '')), min: r.min, max: r.max, step: r.step }; })); }
    const A = flat(all);
    for (const r of rows) { res.calcRows++;
      if (r.label && !SYN.has(r.label) && !A.includes(flat(r.label))) res.calcLabelsMissing.push([n, r.type, r.label]);
      if (r.type === 'Input slider') { res.sliderRows++; const hit = ['plan', 'chosen', 'none'].map(st => sliders[st].find(x => flat(x.label) === flat(r.label))).filter(Boolean);
        if (!hit.length) res.sliderMismatch.push([n, r.label, 'no live slider with this label']);
        else if (!hit.some(h => +h.min === +r.min && +h.max === +r.max && +h.step === +r.step) && r.rangeOnScreen) res.sliderMismatch.push([n, r.label, 'sheet ' + [r.min, r.max, r.step].join('/') + ' live ' + hit.map(h => [h.min, h.max, h.step].join('/')).join(' | ')]); }
      for (const t of String(r.chip || '').split('; ').filter(Boolean)) { res.chipTexts++; if (!A.includes(flat(t))) res.chipMissing.push([n, r.label, t]); } }
  }
  const how = {}; ext.plan.forEach(p => how[p.name] = p.how);
  const byScr = {}; dump.plan.forEach(r => (byScr[r.name] = byScr[r.name] || []).push(r));
  for (const name of Object.keys(byScr)) { const h = how[name]; if (!h) { res.planLabelsMissing.push([name, '(screen)', 'no way to open this screen']); continue; }
    await openHow(page, h); const A = flat(await text()); res.screens++;
    for (const r of byScr[name]) { res.planRows++; if (r.label && !A.includes(flat(r.label))) res.planLabelsMissing.push([name, r.type, r.label]);
      for (const t of String(r.chip || '').split('; ').filter(Boolean)) { res.chipTexts++; if (!A.includes(flat(t))) res.chipMissing.push([name, r.label, t]); } } }
  // the Settings standards, as the customer sees them on Your assumptions
  await openHow(page, 'ME-ASM'); const AS = flat(await text()); res.standards = 0; res.standardsMissing = [];
  for (const sd of dump.standards || []) { res.standards++; if (!AS.includes(flat(sd.label))) res.standardsMissing.push(sd.label); for (const t of String(sd.chip || '').split('; ').filter(Boolean)) { res.chipTexts++; if (!AS.includes(flat(t))) res.chipMissing.push(['Your assumptions', sd.label, t]); } }
  console.log(JSON.stringify(res)); await browser.close();
})();
