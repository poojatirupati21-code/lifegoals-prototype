// Report dialog test (journey-spec §28/§24.3): buttons, focus trap, Esc, mobile fit, PDF page by page, HTML and print fallbacks.
// Usage: NODE_PATH=/opt/node22/lib/node_modules node tools/report/test-dialog.js
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '../..'), pvx = path.join(root, 'tools/plan-vs-xlsx');
const V5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'v5-scenario.json'), 'utf8'));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
async function fresh(b, w) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } }); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto('file://' + path.join(root, 'LifeGoals-Customer-Journey-Prototype.html')); await p.waitForTimeout(400);
  await p.evaluate(require(path.join(pvx, 'oracle_lib.js')).PAGE_FNS + '; window.__TODAY = "2026-10-08";');
  await p.evaluate(sc => { applyScenario(sc); S.acct.name = 'Pooja'; S.app = true; S.shell = true; S.tab = 'home'; render(); }, V5); await p.waitForTimeout(200); p.errs = errs; return p;
}
(async () => {
  const b = await chromium.launch();
  // 1. buttons on Home / Plan / Me open the new dialog
  let p = await fresh(b, 1000);
  for (const [tab, label] of [['home', 'Home shortcut'], ['plan', 'Results screen (Download my plan)']]) {
    await p.evaluate(t => { S.tab = t; S.me = null; if (t === 'plan') { S.planSeg = 'results'; S.scr = 'P3'; } render(); }, tab); await p.waitForTimeout(150);
    const btn = await p.$('#screen [data-a="report"]'); ok(!!btn, label + ' has a report button'); if (!btn) continue;
    await btn.focus(); await btn.click(); await p.waitForTimeout(400);
    const info = await p.evaluate(() => { const R = document.getElementById('report'); return { on: R.classList.contains('on'), role: R.getAttribute('role'), modal: R.getAttribute('aria-modal'), label: R.getAttribute('aria-label'), pages: R.querySelectorAll('.lmr-pg').length, old: !!R.querySelector('.rep'), focus: document.activeElement.textContent, inert: document.querySelector('.stage').inert }; });
    ok(info.on && info.pages === 11 && !info.old, label + ' opens 11 new pages, old report gone (' + JSON.stringify(info) + ')'); ok(info.role === 'dialog' && info.modal === 'true' && !!info.label, 'dialog role, aria-modal, aria-label'); ok(/Download my plan/.test(info.focus), 'focus on Download my plan'); ok(info.inert, 'page behind is inert');
    // focus trap: Tab many times
    const seen = new Set(); for (let i = 0; i < 8; i++) { await p.keyboard.press('Tab'); seen.add(await p.evaluate(() => document.getElementById('report').contains(document.activeElement))); }
    ok(seen.size === 1 && seen.has(true), 'Tab stays inside the dialog'); for (let i = 0; i < 4; i++) { await p.keyboard.press('Shift+Tab'); seen.add(await p.evaluate(() => document.getElementById('report').contains(document.activeElement))); } ok(seen.size === 1, 'Shift+Tab stays inside');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    const back = await p.evaluate(() => ({ on: document.getElementById('report').classList.contains('on'), focus: document.activeElement.getAttribute('data-p') || document.activeElement.getAttribute('data-a') })); ok(!back.on && back.focus === 'report', 'Esc closes and focus returns to the report button (' + JSON.stringify(back) + ')');
  }
  // results screen button (the plan results "ends" row)
  const hasEnds = await p.evaluate(() => { try { S.tab = 'plan'; S.planSeg = 'results'; S.scr = 'P3'; render(); return !!document.querySelector('#screen .ends [data-a="report"]'); } catch (e) { return 'err ' + e; } }); console.log('     results screen button present:', hasEnds);
  // 2. mobile fit
  await p.close(); p = await fresh(b, 390); await p.evaluate(() => openReport()); await p.waitForTimeout(400);
  const mob = await p.evaluate(() => { const R = document.getElementById('report'), s = R.querySelector('.lmr-slot').getBoundingClientRect(); return { sw: R.scrollWidth, cw: R.clientWidth, slot: Math.round(s.width), page: Math.round(R.querySelector('.lmr-pg').getBoundingClientRect().width), scale: R.style.getPropertyValue('--lmr-s') }; });
  ok(mob.sw <= mob.cw + 1 && mob.slot <= 390 && Math.abs(mob.page - mob.slot) <= 1, 'mobile 390: pages scaled to fit, no sideways scroll ' + JSON.stringify(mob));
  await p.screenshot({ path: path.join(require('os').tmpdir(), 'rep-mobile.png') });
  // 3. PDF page by page (downloads capability stubbed; cdnjs is served from the same library versions in node_modules when offline)
  await p.close(); p = await fresh(b, 1000);
  const LIB = process.env.LMR_LIBS || '/tmp/claude-0/-home-user-lifegoals-prototype/bb23c080-deb2-506f-b951-1207e03dac85/scratchpad/libs';
  if (fs.existsSync(LIB + '/jspdf-2.5.1/package/dist/jspdf.umd.min.js')) { await p.route(/cdnjs.*jspdf/, r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(LIB + '/jspdf-2.5.1/package/dist/jspdf.umd.min.js') })); await p.route(/cdnjs.*html2canvas/, r => r.fulfill({ contentType: 'text/javascript', body: fs.readFileSync(LIB + '/html2canvas-1.4.1/package/dist/html2canvas.min.js') })); } else console.log('     (no local PDF libraries: this run cannot test the PDF)');
  await p.evaluate(() => { window.__saved = []; window.claude = { use: async () => ({ save: async ({ filename, data }) => { const buf = data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : new Uint8Array(data); window.__saved.push({ filename, size: buf.length, head: new TextDecoder('latin1').decode(buf.slice(0, 5)), pages: (new TextDecoder('latin1').decode(buf).match(/\/Type\s*\/Page[^s]/g) || []).length }); } }) }; openReport(); });
  await p.waitForTimeout(300); await p.click('#report [data-r="print"]');
  let saved = null; for (let i = 0; i < 90 && !saved; i++) { await p.waitForTimeout(1000); saved = await p.evaluate(() => window.__saved[0] || null); }
  console.log('     saved:', JSON.stringify(saved), 'msg:', await p.evaluate(() => document.getElementById('rep-msg') && document.getElementById('rep-msg').textContent));
  ok(saved && saved.filename === 'LifeMap-plan.pdf' && saved.head === '%PDF-' && saved.pages === 11, 'PDF saved with 11 A4 pages (one canvas per page)');
  // 4. HTML fallback when the PDF libraries cannot load
  await p.close(); p = await fresh(b, 1000); await p.route(/cdnjs\.cloudflare\.com/, r => r.abort());
  await p.evaluate(() => { window.__saved = []; window.claude = { use: async () => ({ save: async ({ filename, data }) => { const t = data instanceof Blob ? await data.text() : ''; window.__saved.push({ filename, pgs: (t.match(/class="lmr-pg[ "]/g) || []).length, size: t.length }); } }) }; openReport(); });
  await p.click('#report [data-r="print"]'); saved = null; for (let i = 0; i < 40 && !saved; i++) { await p.waitForTimeout(1000); saved = await p.evaluate(() => window.__saved[0] || null); }
  console.log('     saved:', JSON.stringify(saved)); ok(saved && saved.filename === 'LifeMap-plan.html' && saved.pgs === 11, 'HTML fallback saved with 11 pages');
  // 5. print fallback (no downloads capability)
  await p.close(); p = await fresh(b, 1000); await p.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; dispatchEvent(new Event('beforeprint')); }; openReport(); }); await p.click('#report [data-r="print"]'); await p.waitForTimeout(800);
  ok(await p.evaluate(() => window.__printed === 1), 'window.print called when downloads are not available');
  await p.emulateMedia({ media: 'print' }); const pr = await p.evaluate(() => { const s = document.querySelector('#report .lmr-slot').getBoundingClientRect(), g = document.querySelector('#report .lmr-pg').getBoundingClientRect(); return { slot: [Math.round(s.width), Math.round(s.height)], page: [Math.round(g.width), Math.round(g.height)], bar: getComputedStyle(document.querySelector('.rep-bar')).display, stage: getComputedStyle(document.querySelector('.stage')).display }; });
  ok(pr.slot[0] === 794 && pr.slot[1] === 1123 && pr.page[0] === 794 && pr.bar === 'none' && pr.stage === 'none', 'print CSS: A4 page size, no toolbar, app hidden ' + JSON.stringify(pr));
  await p.emulateMedia({ media: 'screen' });
  // 6. gate for an unready customer
  await p.evaluate(() => { closeReport(); S = fresh(); render(); openReport(); }); await p.waitForTimeout(300); ok(await p.evaluate(() => !document.getElementById('report').classList.contains('on') && /gate/.test(S.sheet || '')), 'unready customer sees the "we need N things" card, no report');
  const allErrs = p.errs; console.log('console errors', allErrs.length, allErrs.slice(0, 3)); fails += allErrs.length ? 1 : 0; console.log('FAILS', fails); await b.close(); process.exit(fails ? 1 : 0);
})();
