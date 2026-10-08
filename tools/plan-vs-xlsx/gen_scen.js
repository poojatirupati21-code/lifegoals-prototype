const { chromium } = require('playwright'); const fs = require('fs'); const { PAGE_FNS } = require('./oracle_lib.js');
const HTML = 'file://' + require('path').resolve(__dirname, '../../LifeGoals-Customer-Journey-Prototype.html');
// scenario list builders ---------------------------------------------------
const SAMPLE = {name:'sample', fill:true};   // workbook: Fill example = Yes and nothing typed
function sampleScenario(){ return {name:'sample-typed', about:{age:38, partner:true, deps:2, married:null}, retireAge:63, pRet:66, infl:0.02, assume:'standard', q6:2,
  fin:{work:'Employed', income:58000, pIncome:22000, pAge:37, otherM:0, costsM:3600, oneOffY:1800, home:'Own with mortgage', homeValue:420000, cash:9000, invest:6200, mortBal:203700, mortRate:3.85, mortPayM:1180, mortYears:21, cardBal:400, cardPayM:40, loanBal:3500, loanPayM:100, life:'Yes', ip:'No', ci:'Not sure', workCover:'Yes', health:'Yes', pension:72000, pensionM:520, sp:'Expect full'},
  asm:{}, goals:[{k:'edu', age:48, amount:50000}, {k:'travel', age:41, amount:12000}, {k:'mfree', age:55, amount:150000}, {k:'safety', age:40, amount:15000, saved:5000, auto:false}, {k:'retire', amount:46000}]}; }
exports.sampleScenario = sampleScenario;
(async () => {
  const which = process.argv[2] || 'sample'; const out = process.argv[3] || 'scen.json';
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); await p.goto(HTML); await p.waitForTimeout(300);
  await p.evaluate(PAGE_FNS + '; 1');
  let scs = [];
  if (which === 'sample') {
    // the prototype's own loadSample() as the Fill-example scenario, plus the typed copy
    const smp = await p.evaluate(() => { loadSample(); const o = readOutputs(); return o; });
    scs.push({sc:{name:'sample', fill:true}, out:smp});
    const t = sampleScenario(); const o = await p.evaluate(sc => { applyScenario(sc); return readOutputs(); }, t); scs.push({sc:t, out:o});
  } else {
    const list = JSON.parse(fs.readFileSync(which, 'utf8'));
    for (const sc of list) { const o = await p.evaluate(sc => { applyScenario(sc); return readOutputs(); }, sc); scs.push({sc, out:o}); }
  }
  fs.writeFileSync(out, JSON.stringify(scs)); console.log('wrote', scs.length); await b.close();
})();
