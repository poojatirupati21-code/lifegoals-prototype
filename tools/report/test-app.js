// In-app report test (journey-spec §28): opens the real report dialog for the v5 customer and N generated customers.
// Usage: NODE_PATH=/opt/node22/lib/node_modules node tools/report/test-app.js [N=100] [--shots <dir>]
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), cp = require('child_process');
const { runChecks } = require('./page-checks.js');
const root = path.resolve(__dirname, '../..'), pvx = path.join(root, 'tools/plan-vs-xlsx');
const N = +(process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 100), shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const V5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'v5-scenario.json'), 'utf8'));
const SKIP = new Set(['icon', 'kind', 'tone', 'photo', 'state', 'side', 'band', 'id', 'type', 'bigTone', 'fromTone', 'toTone', 'schemaVersion', 'key', 'score']);
function leaves(o, path, out) { if (o == null) return; if (typeof o === 'string') { if (o.trim().length >= 2) out.push([path, o]); } else if (Array.isArray(o)) o.forEach((x, i) => leaves(x, path + '.' + i, out)); else if (typeof o === 'object') Object.keys(o).forEach(k => { if (!SKIP.has(k)) leaves(o[k], path + '.' + k, out); }); }
(async () => {
  const tmp = path.join(require('os').tmpdir(), 'app-scen.json'); cp.execFileSync('node', ['make_scen.js', String(N * 2 + 60), '777', tmp], { cwd: pvx });
  const okSc = s => s.infl != null && s.retireAge != null && s.asm && s.asm.planEnd != null && !(s.about.partner && s.pRet == null && s.fin && s.fin.pIncome > 0);
  const all = JSON.parse(fs.readFileSync(tmp, 'utf8')).filter(s => !s.fill).filter(s => !process.argv.includes('--ready-only') || okSc(s)).slice(0, N);
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  const errs = []; p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) errs.push(m.text()); }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(root, 'LifeGoals-Customer-Journey-Prototype.html')); await p.waitForTimeout(400);
  await p.evaluate(require(path.join(pvx, 'oracle_lib.js')).PAGE_FNS + '; window.__TODAY = "2026-10-08";');
  const fontDir = process.env.LMR_FONT_DIR;
  if (fontDir) await p.addStyleTag({ content: '@font-face{font-family:"Bricolage Grotesque";font-weight:200 800;src:url(file://' + fontDir + '/bric.woff2)}@font-face{font-family:"Figtree";font-weight:300 900;src:url(file://' + fontDir + '/fig.woff2)}' });
  const scs = [V5].concat(all); let ready = 0, notReady = 0, issueCount = 0, textMiss = 0; const tags = {}; const rows = [];
  for (const [i, sc] of scs.entries()) {
    const r = await p.evaluate(async sc => { window.__TODAY = '2026-10-08'; applyScenario(sc); S.acct.name = sc.person || ''; const d = reportData(); if (d.ready === false) return { notReady: true, missing: d.missing }; openReport(); await new Promise(r => setTimeout(r, 60)); return { ok: document.getElementById('report').classList.contains('on'), data: d, gate: !!S.sheet }; }, sc);
    if (r.notReady) { notReady++; const g = await p.evaluate(() => { try { openReport(); } catch (e) { return 'ERR ' + e; } return S.sheet || ''; }, null); if (!/gate/.test(g)) { issueCount++; console.log(sc.name, 'not-ready customer did not open the gate card:', g); } continue; }
    ready++; if (!r.ok) { issueCount++; console.log(sc.name, 'report did not open'); continue; }
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(80);
    const { issues, pages } = await runChecks(p); const d = r.data;
    // every string of the data is on its page text (all pages), apart from goals that page 2 folds into 'and N more'
    const txt = (await p.evaluate(() => document.getElementById('report').innerText)).toLowerCase().replace(/\s+/g, ' ');
    const L = []; leaves(d, 'd', L); const miss = L.filter(([pth, v]) => { if (/^d\.(meta|footer)\./.test(pth)) return false; if (/^d\.goalsDetail\.(big|bigLabel)$/.test(pth) && /Infinity|NaN/.test(d.goalsDetail.big)) return false; if (pth === 'd.plan.close.title' && !d.plan.close.items.length) return false; if (d.plan.goals.length > 5 && /^d\.plan\.goals\.(\d+)/.test(pth) && +pth.match(/^d\.plan\.goals\.(\d+)/)[1] >= 4) return false; return !txt.includes(v.toLowerCase().replace(/\s+/g, ' ')); });
    const apRows = await p.evaluate(() => [...document.querySelectorAll('#report .lmr-ap tbody tr')].length);
    const expPages = 4 + Math.max(1, 0) + 0; // computed below from labels
    const labels = await p.$$eval('#report .lmr-pg', ps => ps.map(x => x.getAttribute('aria-label').replace(/^Page \d+ of \d+: /, '').replace(/ \(\d+ of \d+\)/, '')));
    const order = ['Cover', 'Your plan on a page', 'Your money today', 'Your roadmap', 'Your goals in detail', 'Cashflow', 'What could change the answer', 'Foundations and you', 'Share with an expert', 'What your plan assumes', 'Appendix'];
    const dedup = labels.filter((x, k) => x !== labels[k - 1]); const orderOK = JSON.stringify(dedup) === JSON.stringify(order);
    const bad = []; if (/Infinity|NaN|undefined|null/.test(JSON.stringify(d).replace(/"[^"]*":null/g, ''))) bad.push('data has Infinity/NaN/undefined: ' + (JSON.stringify(d).match(/.{25}(Infinity|NaN|undefined).{10}/) || [''])[0]);
    if (!orderOK) bad.push('page order ' + dedup.join('>')); if (apRows !== d.appendix.rows.length) bad.push('appendix rows ' + apRows + ' vs ' + d.appendix.rows.length);
    if (miss.length) { textMiss += miss.length; bad.push('text not on page: ' + miss.slice(0, 3).map(m => m[0] + '=' + m[1].slice(0, 30)).join(' | ')); }
    issues.forEach(x => bad.push(x.join(' | ')));
    const tag = [d.meta.hasPartner ? 'partner' : 'single', d.meta.hasMortgage ? 'mortgage' : 'nomort', d.meta.alreadyRetired ? 'retired' : 'working', d.plan.band.kind === 'none' ? 'noshortfall' : 'gap', d.plan.goals.length + 'goals']; tag.forEach(t => tags[t] = (tags[t] || 0) + 1);
    rows.push({ name: sc.name, tag, pages });
    if (bad.length) { issueCount += bad.length; console.log(sc.name.padEnd(10), tag.join(','), 'pages', pages, 'ISSUES', bad.length); [...new Set(bad)].slice(0, 6).forEach(x => console.log('     ', x)); }
    if (shots) { const key = sc.name === V5.name ? 'v5' : null; const pick = (t, k) => rows.filter(r => r.tag.includes(t)).length === 1 ? t : null; const lab = key || pick('retired') && 'retired' || null;
      const want = key || (tag.includes('retired') && !tags.__r && (tags.__r = 1) && 'retired') || (tag.includes('partner') && tag.includes('mortgage') && !tags.__pm && (tags.__pm = 1) && 'partner-mortgage') || (tag.includes('single') && tag.includes('nomort') && !tags.__s && (tags.__s = 1) && 'single-no-mortgage') || (tag.includes('noshortfall') && !tags.__n && (tags.__n = 1) && 'no-shortfall');
      if (want) { fs.mkdirSync(path.join(shots, want), { recursive: true }); await p.addStyleTag({ content: '.rep-bar{visibility:hidden}' }).catch(() => {}); const els = await p.$$('#report .lmr-pg'); for (let k = 0; k < els.length; k++) await els[k].screenshot({ path: path.join(shots, want, 'p-' + String(k + 1).padStart(2, '0') + '.png') }); } }
    await p.evaluate(() => closeReport());
  }
  // 15 goals customer
  const g15 = await p.evaluate(async sc => { window.__TODAY = '2026-10-08'; applyScenario(sc); S.acct.name = 'Fifteen'; const ks = ['home', 'edu', 'travel', 'business', 'safety', 'wealth', 'helpfam', 'wedding', 'car', 'health', 'other', 'mfree', 'legacy'];
    ks.forEach((k, i) => { try { const g = mkGoal(k); g.age = S.about.age + 2 + i; g.amount = 4000 + i * 1500; S.goals.push(g); } catch (e) {} }); const d = reportData(); if (d.ready === false) return { notReady: true, n: S.goals.length }; openReport(); await new Promise(r => setTimeout(r, 80)); return { n: S.goals.length, plan: d.plan.goals.length, gd: d.goalsDetail.goals.length }; }, V5);
  console.log('15-goals customer', JSON.stringify(g15));
  if (!g15.notReady) { await p.evaluate(() => document.fonts.ready); const { issues, pages } = await runChecks(p); console.log('  pages', pages, 'issues', issues.length); [...new Set(issues.map(x => x.join(' | ')))].slice(0, 8).forEach(x => console.log('     ', x)); issueCount += issues.length;
    if (shots) { fs.mkdirSync(path.join(shots, 'goals15'), { recursive: true }); await p.addStyleTag({ content: '.rep-bar{visibility:hidden}' }).catch(() => {}); const els = await p.$$('#report .lmr-pg'); for (let k = 0; k < els.length; k++) await els[k].screenshot({ path: path.join(shots, 'goals15', 'p-' + String(k + 1).padStart(2, '0') + '.png') }); } await p.evaluate(() => closeReport()); }
  console.log('customers', scs.length, 'ready', ready, 'not ready', notReady, 'tags', JSON.stringify(tags)); console.log('console errors', errs.length, errs.slice(0, 3)); console.log('TOTAL issues', issueCount);
  await b.close(); process.exit(issueCount || errs.length ? 1 : 0);
})();
