// Writes tools/report/vectors.json: 30 customers (inputs in the plan-vs-xlsx scenario format + the whole reportData() output) for developers' unit tests.
// Usage: NODE_PATH=/opt/node22/lib/node_modules node tools/report/make-vectors.js     (date fixed to 8 Oct 2026; names are blank except the v5 customer)
const { chromium } = require('playwright'), fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.resolve(__dirname, '../..'), pvx = path.join(root, 'tools/plan-vs-xlsx');
const V5 = {name:'v5-customer', person:'Pooja', about:{age:27, partner:false, deps:0, dob:{d:21, m:8, y:1999}, married:null}, retireAge:50, infl:0.039, assume:'standard', q6:3, cred:{rent:true},
  fin:{work:'Employed', income:79000, costsM:3000, home:'Rent', ae:'No', life:'Yes', health:'Yes', ip:'No', ci:'No', workCover:'No'}, asm:{planEnd:80, startYear:2026, spWeek:0}, goals:[{k:'family', age:30, amount:15000}, {k:'retire', amount:40000}],
  prof:{ans:{'2':2, '4':3, '7':0, '9':2, '12':3}, um:{u14:2}}};
(async () => {
  const tmp = path.join(require('os').tmpdir(), 'vec-scen.json'); cp.execFileSync('node', ['make_scen.js', '60', '4242', tmp], {cwd:pvx});
  const all = JSON.parse(fs.readFileSync(tmp, 'utf8')).filter(s => !s.fill), okSc = s => s.infl != null && s.retireAge != null && s.asm && s.asm.planEnd != null && !(s.about.partner && s.pRet == null && s.fin && s.fin.pIncome > 0);
  const gen = all.filter(okSc).slice(0, 27).concat(all.filter(s => !okSc(s)).slice(0, 2)) /* 27 ready customers and 2 whose required choices are missing (ready:false) */; const scs = [V5].concat(gen);
  const b = await chromium.launch(), p = await b.newPage(); await p.goto('file://' + path.join(root, 'LifeGoals-Customer-Journey-Prototype.html')); await p.waitForTimeout(300);
  await p.evaluate(require(path.join(pvx, 'oracle_lib.js')).PAGE_FNS + '; window.__TODAY = "2026-10-08";');
  const out = [];
  for (const sc of scs) { const r = await p.evaluate(sc => { window.__TODAY = '2026-10-08'; applyScenario(sc); S.acct.name = sc.person || ''; return reportData(); }, sc); out.push({name:sc.name, input:sc, reportData:r}); }
  out.push(await p.evaluate(() => { window.__TODAY = '2026-10-08'; loadSample(); return {name:'sample-customer-aoife', input:'loadSample() in the prototype', reportData:reportData()}; }));
  fs.writeFileSync(path.join(__dirname, 'vectors.json'), JSON.stringify({generated:'2026-10-08', schema:'docs/report-data.schema.json 1.0.0', note:'input = plan-vs-xlsx scenario (applyScenario in tools/plan-vs-xlsx/oracle_lib.js); today fixed to 2026-10-08', vectors:out}, null, 1));
  console.log('vectors', out.length, 'not ready', out.filter(o => !o.reportData.ready && o.reportData.ready !== undefined).length); await b.close();
})();
