// Random and edge-case scenarios for plan-vs-xlsx. Same generator family as fp/mono.js, extended with partners, lists, rankings, what-if and every assumption.
const fs = require('fs');
let seed = +(process.argv[3] || 11); const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648, pick = a => a[Math.floor(rnd() * a.length)], ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const KINDS = ['home','family','edu','travel','business','mfree','safety','wealth','helpfam','legacy','wedding','car','health','other'];
const FUND = ['home','family','edu','travel','business','mfree','safety','wealth','helpfam','wedding','car','health','other'];
function mk(i) {
  const age = ri(22, 62), partner = rnd() < .5, work = rnd() < .12 ? 'Self-employed' : rnd() < .06 ? 'Not working' : 'Employed';
  const inc = pick([0, 18000, 30000, 45000, 60000, 90000, 140000]) || 40000;
  const sc = {name:'rnd-' + i, about:{age, partner, deps:ri(0, 3), married:partner ? pick([null, true, false, true]) : null}, cred:{}};
  const retired = rnd() < .08;
  sc.retireAge = retired ? Math.max(50, age - ri(0, 5)) : Math.max(age + 1, pick([55, 60, 63, 65, 66, 68, 70])); if (sc.retireAge > 75) sc.retireAge = 75;
  if (retired && age < 52) sc.retireAge = 50;
  sc.infl = pick([0.02, 0.025, 0.039, 0.01, 0.03]); sc.assume = pick(['standard', 'standard', 'cautious']); sc.q6 = pick([null, 0, 1, 2, 3, 4]);
  if (rnd() < .2) sc.saveM = pick([0, 100, 400, 900, 2500]); if (sc.saveM != null && rnd() < .5) sc.saveUp = rnd() < .5;
  if (rnd() < .15) sc.penExtra = pick([50, 150, 300]);
  if (rnd() < .1) sc.cred.rent = true; if (rnd() < .1) sc.cred.lone = true; if (rnd() < .08) sc.cred.carer = true;
  const home = pick(['Rent', 'Own with mortgage', 'Own with mortgage', 'Own outright', 'Live with family']);
  const fin = {work, income:work === 'Not working' ? pick([0, 12000]) : inc, costsM:Math.round((inc / 12) * pick([.3, .45, .6, .8]) / 50) * 50 + 300 * ri(0, 2), oneOffY:pick([0, 1500, 3000]), otherM:pick([0, 0, 200, 800]), rentM:pick([0, 0, 0, 600]),
    cash:pick([0, 3000, 15000, 60000, 200000]), invest:pick([0, 0, 20000, 100000]), home, pension:pick([0, 30000, 150000, 500000]), pensionM:pick([0, 0, 200, 600, 1500]), sp:pick(['Expect full', 'Partly', 'Not sure'])};
  if (rnd() < .3) fin.pensionOwnM = Math.round(fin.pensionM * pick([.3, .5, 1]));
  if (rnd() < .15) fin.penChg = pick([0.5, 1, 1.5]); if (rnd() < .15) fin.spYears = pick([5, 12, 25, 40]);
  if (rnd() < .1) fin.ae = 'No';
  if (home === 'Own with mortgage') { fin.mortBal = pick([60000, 150000, 300000]); fin.mortYears = ri(8, 30); fin.mortRate = pick([2.9, 3.5, 4.2, undefined]); if (rnd() < .6) fin.mortPayM = Math.round(fin.mortBal / (fin.mortYears * 12) * 1.25 / 10) * 10; }
  if (rnd() < .35) { fin.cardBal = pick([400, 2500, 9000]); fin.cardPayM = pick([0, 30, 120, 400]); if (rnd() < .5) fin.cardRate = pick([18, 22]); }
  if (rnd() < .35) { fin.loanBal = pick([3500, 12000, 40000]); fin.loanPayM = pick([0, 100, 350, 900]); if (rnd() < .5) fin.loanRate = pick([6.5, 9]); }
  if (rnd() < .1) { fin.debt = pick([5000, 80000]); fin.debtPayM = pick([0, 200]); }
  if (partner) { fin.pAge = Math.max(18, age + ri(-6, 6)); fin.pIncome = pick([0, 0, 25000, 50000, 90000]); if (fin.pIncome > 0) sc.pRet = pick([60, 62, 65, 66, 68]); fin.pSp = pick([undefined, 'Own full', 'Own partial', 'Qualified adult increase', 'None', 'Not sure']); }
  Object.keys(fin).forEach(k => fin[k] === undefined && delete fin[k]);
  // lists: sometimes use lists for cards, loans, pensions and other-property mortgages
  const L = {}; 
  if (rnd() < .25) { delete fin.cardBal; delete fin.cardPayM; delete fin.cardRate; L.cards = Array.from({length:ri(1, 3)}, () => ({owed:pick([300, 1500, 6000]), pay:pick([20, 80, 250]), rate:rnd() < .6 ? pick([15, 20, 23]) : undefined})); }
  if (rnd() < .25) { delete fin.loanBal; delete fin.loanPayM; delete fin.loanRate; L.loans = Array.from({length:ri(1, 3)}, () => ({owed:pick([2000, 9000, 30000]), pay:pick([60, 200, 500]), rate:rnd() < .6 ? pick([6, 8, 11]) : undefined})); }
  if (rnd() < .3) { delete fin.pension; delete fin.pensionM; delete fin.pensionOwnM; const mixed = rnd() < .5; L.pens = Array.from({length:ri(1, 4)}, () => ({value:pick([5000, 40000, 120000]), monthly:pick([0, 100, 300, 800]), own:(mixed ? rnd() < .5 : rnd() < .3) ? pick([50, 100, 200]) : undefined})); }
  if (rnd() < .2) L.mort2 = Array.from({length:ri(1, 2)}, () => { const o = {owed:pick([80000, 190000])}; const r = rnd(); if (r < .4) o.pay = pick([600, 1200]); else o.years = pick([12, 20, 25]); if (rnd() < .6) o.rate = pick([3.2, 4.1, 5]); return o; });
  sc.lists = L; sc.fin = fin;
  // assumptions: most are chosen; some are left to the standard
  const A = {}; const ch = (k, v) => { if (rnd() < .6) A[k] = v; };
  ch('inv', pick([0.02, 0.026, 0.035])); ch('cash', pick([0.005, 0.01])); ch('pen', pick([0.04, 0.045])); ch('penRet', pick([0.028, 0.0315])); ch('wage', pick([0.02, 0.03, 0.035])); ch('bands', pick(['prices', 'flat'])); ch('spGrow', pick(['prices', 'pay', 'flat']));
  ch('retireSpend', pick([0.7, 0.8, 1])); ch('lumpSum', pick([0, 0.15, 0.25])); ch('drawRule', pick(['spread', 'min', 'fixed'])); if (A.drawRule === 'fixed') A.drawFixed = pick([15000, 30000]);
  ch('safetyMonths', pick([3, 4, 6, 9])); ch('cashYears', pick([3, 5, 7])); ch('investShare', pick([0, .4, .8])); ch('saveShare', pick([.3, .5, .8])); ch('noAnswer', pick([100, 300, 600]));
  A.planEnd = pick([85, 90, 95, 100]); if (rnd() < .5) A.startYear = pick([2026, 2027]);
  ch('mortRate', pick([0.03, 0.04])); ch('cardRate', pick([0.18, 0.23])); ch('loanRate', pick([0.06, 0.1])); ch('spWeek', pick([150, 230, 299])); ch('pSpWeek', pick([100, 239.44])); ch('penChg', pick([0.005, 0.01, 0.015]));
  if (L.pens && L.pens.some(p => p.own != null) && L.pens.some(p => p.own == null)) A.ownShare = pick([.4, .5, 1]); else ch('ownShare', pick([.4, .5, 1]));
  sc.asm = A;
  // goals
  const goals = []; const ng = pick([0, 1, 2, 3, 4, 5, 6, 8]);
  const planEnd = A.planEnd;
  for (let k = 0; k < ng; k++) { const key = pick(FUND.concat(['legacy', 'legacy'])); const g = {k:key, amount:pick([4000, 12000, 30000, 80000, 200000]), saved:rnd() < .2 ? pick([500, 5000]) : 0, prio:rnd() < .3 ? 'Nice to have' : 'Must have'};
    if (key === 'legacy') g.age = planEnd; else g.age = Math.min(89, age + (rnd() < .12 ? 0 : ri(1, Math.max(2, 85 - age))));
    if (key === 'safety') g.auto = rnd() < .5; goals.push(g); }
  if (rnd() < .75) goals.push({k:'retire', amount:pick([20000, 35000, 50000, 70000]), prio:'Must have'});
  // keep at most 8 funded goals
  let fcount = 0; sc.goals = goals.filter(g => { if (['legacy', 'retire'].includes(g.k)) return true; return ++fcount <= 8; });
  if (rnd() < .5 && sc.goals.length > 1) { const idx = sc.goals.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; } sc.rank = idx; }
  if (sc.goals.length && rnd() < .4) sc.wi = {g:ri(0, sc.goals.length - 1), m:ri(-300, 1000), l:pick([0, 5000, 40000])};
  // Discover and Understand Me answers (option index from 0), some left blank
  const pa = {}, pu = {}; const opt = n => Math.floor(rnd() * n);
  [['2', 4], ['4', 4], ['7', 4], ['8', 4], ['9', 4], ['12', 4]].forEach(([id, n]) => { if (rnd() < .8) pa[id] = opt(n); });
  ['u4', 'u9', 'u10', 'u11', 'u12', 'u14'].forEach(u => { if (rnd() < .7) pu[u] = opt(4); });
  const chips = rnd() < .5 ? [] : pick([['None'], ['Savings account'], ['Savings account', 'None'], ['Shares or funds'], ['Shares or funds', 'Savings account'], ['Property']]);
  sc.prof = {ans:pa, um:pu, chips};
  return sc;
}
const EDGE = [
  {name:'edge-no-income', about:{age:35, partner:false, deps:0}, retireAge:65, infl:0.02, assume:'standard', fin:{work:'Not working', income:0, costsM:1500, cash:2000, home:'Rent'}, asm:{planEnd:90}, goals:[{k:'safety', age:37, amount:9000, auto:true}], lists:{}},
  {name:'edge-high-debt', about:{age:40, partner:false, deps:1}, retireAge:65, infl:0.02, assume:'standard', fin:{work:'Employed', income:50000, costsM:2200, cash:3000, home:'Rent', cardBal:30000, cardPayM:100, loanBal:90000, loanPayM:300, debt:20000}, asm:{planEnd:90}, goals:[{k:'safety', age:42, amount:12000, auto:true}, {k:'retire', amount:30000}], lists:{}},
  {name:'edge-retired', about:{age:70, partner:false, deps:0}, retireAge:65, infl:0.02, assume:'standard', fin:{work:'Employed', income:0, costsM:1800, cash:80000, invest:30000, pension:400000, home:'Own outright', sp:'Expect full'}, asm:{planEnd:95, lumpSum:0.25}, goals:[{k:'retire', amount:30000}, {k:'legacy', age:95, amount:50000}], lists:{}},
  {name:'edge-goal-year0', about:{age:30, partner:false, deps:0}, retireAge:65, infl:0.02, assume:'standard', fin:{work:'Employed', income:60000, costsM:2000, cash:20000, home:'Rent'}, asm:{planEnd:90}, goals:[{k:'car', age:30, amount:10000}, {k:'travel', age:31, amount:5000}], lists:{}},
  {name:'edge-emergency-only', about:{age:45, partner:true, deps:2, married:true}, retireAge:65, pRet:65, infl:0.02, assume:'standard', fin:{work:'Employed', income:70000, pIncome:40000, pAge:44, costsM:3000, cash:5000, home:'Own with mortgage', mortBal:200000, mortYears:20, mortPayM:1300}, asm:{planEnd:95}, goals:[{k:'safety', age:47, amount:20000, auto:true}], lists:{}},
  {name:'edge-no-goals', about:{age:45, partner:false, deps:0}, retireAge:65, infl:0.02, assume:'standard', fin:{work:'Employed', income:50000, costsM:2000, cash:5000, home:'Rent'}, asm:{planEnd:90}, goals:[], lists:{}},
  {name:'edge-retire-only', about:{age:50, partner:false, deps:0}, retireAge:60, infl:0.02, assume:'cautious', fin:{work:'Self-employed', income:80000, costsM:3000, cash:30000, pension:200000, pensionM:800, home:'Own outright'}, asm:{planEnd:100}, goals:[{k:'retire', amount:45000}], lists:{}},
];
const n = +process.argv[2] || 100; const out = [{name:'sample-typed-copy', fill:false, __sample:true}];
const list = []; for (let i = 0; i < n; i++) list.push(mk(i)); EDGE.forEach(e => list.push(e));
fs.writeFileSync(process.argv[4] || 'scen_in.json', JSON.stringify(list)); console.log('scenarios', list.length);
