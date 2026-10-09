// Standalone renderer test: v5 mock + synthetic variants -> overflow/contrast/bad-text/page-count checks (+ screenshots with --shots <dir>).
// Usage: LMR_FONT_DIR=<dir with bric.woff2 fig.woff2> node tools/report/test-renderer.js [--shots <dir>]
const path = require('path'), fs = require('fs');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const R = require('./report-renderer.js'), { runChecks } = require('./page-checks.js');
const root = path.resolve(__dirname, '../..');
const base = JSON.parse(fs.readFileSync(path.join(__dirname, 'mock-v5.json'), 'utf8'));
const clone = o => JSON.parse(JSON.stringify(o));
const KINDS = ['family', 'home', 'car', 'edu', 'travel', 'business', 'safety', 'wealth', 'helpfam', 'legacy', 'mfree', 'wedding'];
function goalOf(i, pct) {
  const band = pct >= 95 ? 'good' : pct >= 70 ? 'gold' : 'alert', k = KINDS[i % KINDS.length];
  return { name: 'Goal number ' + (i + 1) + ' ' + k, icon: k, kind: k, pct, band, bandText: band === 'good' ? 'On track' : band === 'gold' ? 'Nearly there' : 'Needs attention',
    meta: 'Age ' + (30 + i) + ' · ' + (2029 + i) + ' · €' + (10000 + i * 1000).toLocaleString('en-IE'), sentence: pct >= 95 ? 'Fully funded. Your income and savings cover it.' : pct + '% covered. A bigger plan would help.' };
}
const variants = {};
variants.v5 = clone(base);
(() => { // no shortfall
  const d = clone(base); d.meta.alreadyRetired = false;
  d.plan.big = '2 of 2'; d.plan.bigLabel = 'goals on track'; d.plan.bigTone = 'good'; d.plan.title = 'Your plan is on track'; d.plan.lead = 'Your income and savings cover everything you told us about.';
  d.plan.goals.forEach(g => { g.pct = 100; g.band = 'good'; g.bandText = 'On track'; });
  d.plan.band = { kind: 'none', cells: [{ big: 'Age 80', small: 'savings last' }, { big: '0 years', small: 'with a gap' }, { big: '€0', small: 'short' }] };
  d.plan.close = { title: 'What keeps you on track', items: [] };
  d.cover.tiles[0] = { icon: 'sun', tone: 'good', big: '2 of 2', small: 'goals on track today' }; d.cover.tiles[1] = { icon: 'sun', tone: 'good', big: 'Covered', small: 'to age 80' };
  d.road.segments = [{ fromAge: 27, toAge: 80, tone: 'good' }]; d.road.milestones = d.road.milestones.filter(m => m.badge !== '52');
  d.roadmap.decades.forEach(x => { x.icon = 'sun'; x.tone = 'good'; x.chip = 'Comfortable'; x.title = 'Building your savings'; x.text = 'Income comfortably covers life.'; x.spark = { label: 'Savings', values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100], gapYears: Array(10).fill(false) }; });
  d.goalsDetail.goals.forEach(g => { g.pct = 100; g.band = 'good'; g.bandText = 'On track'; if (g.years) g.years.cells.forEach(c => c.state = 'pension'); });
  d.cashflow.savingsChart.runOut = null; d.cashflow.savingsChart.zones = [{ fromAge: 27, toAge: 80, label: 'WORKING', tone: 'good' }];
  d.cashflow.paidChart.stopMarker = null; d.cashflow.paidChart.zones = d.cashflow.savingsChart.zones; d.cashflow.paidChart.bars.forEach(b => { b.shortfall = 0; b.fromSavings = 0; });
  d.scenarios.groups = [{ title: 'ONE CHANGE AT A TIME', rows: [d.scenarios.groups[0].rows[0]] }]; d.scenarios.fromPct = 100; d.scenarios.toPct = 100;
  variants.noShortfall = d;
})();
(() => { // 15 goals
  const d = clone(base), pcs = [100, 100, 98, 60, 100, 5, 80, 100, 33, 100, 70, 100, 95, 12, 100];
  const gs = pcs.map((p, i) => goalOf(i, p));
  d.plan.goals = gs; d.plan.big = '9 of 15';
  d.goalsDetail.goals = gs.map((g, i) => Object.assign(clone(g), { bars: i % 5 === 0 && i > 0 ? { type: 'retire', costLabel: 'Retirement costs', costValue: 'about €1.2m', costPct: 100, coverLabel: 'Your plan covers', coverValue: 'about €118k', coverPct: 9.8, note: 'In today’s money.' } : { type: 'saving', needLabel: 'Needs a month', needValue: '€441', needPct: 100, putLabel: 'You’re putting in', putValue: '€' + (100 + i * 30), putPct: Math.min(100, g.pct) }, photo: i === 2 ? 'house-for-sale' : null }));
  d.goalsDetail.goals[0] = clone(base.goalsDetail.goals[0]);
  variants.goals15 = d;
})();
(() => { // 1 goal
  const d = clone(base); d.plan.goals = [d.plan.goals[0]]; d.goalsDetail.goals = [d.goalsDetail.goals[1]]; variants.goal1 = d;
})();
(() => { // plan to 105
  const d = clone(base), a0 = 27, a1 = 105; d.meta.planEndAge = 105; d.road.endAge = 105; d.road.endLabel = 'Plan to age 105'; d.road.segments[2].toAge = 105;
  const rows = [], bars = [], ser = [];
  for (let a = a0; a <= a1; a++) { const inc = a < 50 ? 55000 + (a - 27) * 1700 : 0, need = Math.round(36000 * Math.pow(1.039, a - 27)); const sav = a < 50 ? 10000 + (a - 27) * 12000 : (a < 52 ? 100000 : 0), sf = a < 52 ? 0 : need;
    rows.push({ age: a, year: 2026 + a - 27, income: inc, needs: need, shortfall: sf, savingsLeft: sav }); ser.push({ age: a, value: sav }); bars.push({ age: a, fromIncome: Math.min(inc, need), fromSavings: a >= 50 && a < 52 ? need : 0, shortfall: sf }); }
  d.appendix.rows = rows; d.appendix.big = String(rows.length); d.cashflow.savingsChart.series = ser; d.cashflow.paidChart.bars = bars; d.cashflow.paidChart.yMax = 2000000; d.cashflow.paidChart.yTicks = [0, 500000, 1000000, 1500000, 2000000];
  d.cashflow.savingsChart.zones[2].toAge = 105; d.cashflow.paidChart.zones[2].toAge = 105; d.cashflow.paidChart.lastLabel = { age: 105, label: '€2m a year at 105' };
  const decs = []; for (let s = 20; s <= 100; s += 10) { const from = Math.max(27, s), to = Math.min(105, s + 9); decs.push({ label: s + 's', range: 'age ' + from + '–' + to, icon: s < 50 ? 'sun' : 'storm', tone: s < 50 ? 'good' : 'coral', title: 'Decade ' + s, chip: s < 50 ? 'Comfortable' : 'A gap to plan for', text: 'Short by about €100,000 a year.', goalChips: [], spark: { label: 'Savings', values: Array(to - from + 1).fill(s < 50 ? 50000 : 0), gapYears: Array(to - from + 1).fill(s >= 50) } }); }
  d.roadmap.decades = decs; d.goalsDetail.goals[0].years.cells = Array.from({ length: 56 }, (_, i) => ({ age: 50 + i, state: i < 2 ? 'savings' : 'gap' }));
  variants.plan105 = d;
})();
(() => { // minimal optional data + long text
  const d = clone(base);
  d.plan.goals[0].name = 'A very long goal name that goes on and on to test how the card behaves with forty plus characters'; d.goalsDetail.goals[0].name = d.plan.goals[0].name;
  d.plan.goals[1].sentence = 'x '.repeat(120).trim();
  d.money.complete.items = d.money.complete.items.slice(0, 1); d.money.own.rows = []; d.money.owe.rows = [{ label: 'No debts told to us', value: 'None' }]; d.money.netWorth = { label: 'Net worth', value: '€120,000' };
  d.roadmap.decades.forEach(x => { x.goalChips = []; delete x.spark; });
  d.goalsDetail.goals.forEach(g => { g.photo = null; delete g.years; delete g.bars.note; });
  d.cashflow.savingsChart.peak = null; d.cashflow.paidChart.stopMarker = null; d.cashflow.paidChart.lastLabel = null;
  d.foundations.personality.riskScale.activeIndex = 2; d.foundations.protection.rows = d.foundations.protection.rows.slice(0, 2);
  d.next.questions.items = d.next.questions.items.slice(0, 2); d.assumptions.glossary.items = d.assumptions.glossary.items.slice(0, 4); d.assumptions.sources = '';
  d.scenarios.groups = []; d.meta.alreadyRetired = true; d.road.milestones = d.road.milestones.filter(m => m.badge !== '50');
  variants.minimal = d;
})();
try { const vj = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors.json'), 'utf8')).vectors; vj.filter(v => v.reportData && v.reportData.ready !== false).forEach(v => { variants['vec:' + v.name] = v.reportData; }); } catch (e) { console.log('no vectors.json'); }
(async () => {
  const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
  const fd = process.env.LMR_FONT_DIR, fontCss = fd ? '<style>@font-face{font-family:"Bricolage Grotesque";font-weight:200 800;src:url(file://' + fd + '/bric.woff2)}@font-face{font-family:"Figtree";font-weight:300 900;src:url(file://' + fd + '/fig.woff2)}</style>' : '';
  const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 900, height: 1200 } });
  const errs = []; pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push(String(e)));
  let total = 0, bad = 0; const tmp = path.join(shots || '/tmp', 'lmr-test.html');
  for (const [name, d] of Object.entries(variants)) {
    const html = R.reportDocument(d, { photoSrc: n => 'file://' + root + '/media/' + n + '.jpg' }).replace(/<link[^>]*fonts[^>]*>/g, fontCss);
    if (shots) fs.mkdirSync(path.join(shots, name), { recursive: true });
    fs.writeFileSync(tmp, html); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
    const { issues, pages } = await runChecks(pg); total += issues.length;
    const exp = 4 + Math.ceil(0) ; const order = await pg.$$eval('.lmr-pg', ps => ps.map(p => p.getAttribute('aria-label').replace(/^Page \d+ of \d+: /, '')));
    console.log(name.padEnd(12), 'pages', pages, 'issues', issues.length); [...new Set(issues.map(i => i.join(' | ')))].slice(0, 14).forEach(i => console.log('    ', i));
    if (name === 'v5') { if (pages !== 11) { console.log('  FAIL v5 page count', pages); bad++; } }
    if (name === 'plan105' && pages !== 12) { console.log('  FAIL plan105 expected 12 pages (2 appendix), got', pages); bad++; }
    if (name === 'goals15' && pages < 15) { console.log('  FAIL goals15 expected >=15 pages incl. goal pages, got', pages); bad++; }
    if (shots) { const els = await pg.$$('.lmr-pg'); for (let i = 0; i < els.length; i++) await els[i].screenshot({ path: path.join(shots, name, 'p-' + String(i + 1).padStart(2, '0') + '.png') }); }
    if (name === 'v5' || name === 'goals15') console.log('    order:', order.join(' > '));
  }
  console.log('console errors', errs.length, errs.slice(0, 3)); console.log('TOTAL issues', total, 'structural fails', bad);
  await b.close(); process.exit(total || bad || errs.length ? 1 : 0);
})();
