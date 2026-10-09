// Shared by gen_scen.js: applies a scenario to the prototype page and reads every output the workbook must match.
exports.PAGE_FNS = `
window.applyScenario = function(sc){
  S = fresh(); S.app = true; S.shell = true; S.gid = 1;
  const ab = sc.about || {};
  S.about = {age:ab.age, partner:ab.partner ? true : null, deps:ab.deps == null ? 0 : ab.deps, married:ab.married == null ? null : ab.married, cred:Object.assign({}, sc.cred || {})};
  if (sc.retireAge != null){ S.retireAge = sc.retireAge; S.retireSet = true; S.fin.retireAge = sc.retireAge; S.src.retireAge = 'typed'; }
  if (sc.pRet != null){ S.pRet = sc.pRet; S.pRetSet = true; }
  if (sc.infl != null) S.infl = sc.infl;
  S.assume = sc.assume || 'standard';
  if (sc.q6 != null) S.ans['6'] = sc.q6;
  if (sc.saveM != null) S.saveM = sc.saveM; if (sc.saveUp != null) S.saveUp = sc.saveUp;
  if (sc.penExtra) S.penExtra = sc.penExtra;
  S.partner = {mode:'manual', email:'', sent:false, name:'P'}; S.fin.name = 'X'; S.src.name = 'pre'; S.fin.age = ab.age; S.src.age = 'pre';
  Object.entries(sc.fin || {}).forEach(([k, v]) => { S.fin[k] = v; S.src[k] = 'typed'; });
  S.asm = Object.assign({}, sc.asm || {});
  { const y0 = +asmV('startYear'), mkd = (age, m, d) => ({d:String(d), m:String(m), y:String(y0 - age)});   // section 29: a date of birth whose year gives the same age as the scenario's age in the first plan year
    S.about.dob = ab.dob ? {d:String(ab.dob.d), m:String(ab.dob.m), y:String(ab.dob.y)} : mkd(ab.age, ab.dobMonth || 8, ab.dobDay || 21);
    if (sc.fin && sc.fin.pAge != null){ S.about.pdob = mkd(sc.fin.pAge, 3, 3); delete S.fin.pAge; delete S.src.pAge; } }
  S.lists = {cards:[], loans:[], pens:[], mort2:[]};
  const L = sc.lists || {};
  const add = (lk, o) => { const it = newItem(lk); Object.entries(o).forEach(([f, v]) => { it.f[f] = v; it.src[f] = 'typed'; }); LI(lk).push(it); };
  (L.cards || []).forEach(o => add('cards', o)); (L.loans || []).forEach(o => add('loans', o)); (L.pens || []).forEach(o => add('pens', o)); (L.mort2 || []).forEach(o => add('mort2', o));
  applyAssume();
  (sc.goals || []).forEach(gs => { const g = mkGoal(gs.k); if (gs.name) g.name = gs.name; if (gs.age != null && g.kind !== 'retire' && g.kind !== 'legacy') g.age = gs.age; if (g.kind === 'retire') g.age = S.retireAge; if (g.kind === 'legacy' && gs.age != null) g.age = gs.age;
    g.amount = gs.amount; g.saved = gs.saved || 0; g.prio = gs.prio || 'Must have'; g.auto = gs.k === 'safety' ? !!gs.auto : g.auto; S.goals.push(g); });
  if (sc.rank) S.rank = sc.rank.map(i => S.goals[i].id);
  S.um = S.um || {}; S.um.a = S.um.a || {}; S.um.chips = [];
  const pr = sc.prof || {}; Object.entries(pr.ans || {}).forEach(([k, v]) => { S.ans[k] = v; }); Object.entries(pr.um || {}).forEach(([k, v]) => { S.um.a[k] = v; }); S.um.chips = (pr.chips || []).slice();
  const w = sc.wi || {}; S.wi = {g:w.g != null ? S.goals[w.g].id : null, m:w.m || 0, l:w.l || 0};
  const se = sc.sess || {}; S.book = S.book || {}; S.book.done = !!se.booked; S.book.slot = se.slot || ''; S.um.rechecked = !!se.rechecked; S.pref = se.pref ? {g:null, m:100, l:0} : null;
  S.saved = {}; (sc.saved || []).forEach(k => S.saved[k] = true); S.look = {}; (sc.look || []).forEach(k => S.look[k] = 'flagged'); S.ack = {}; (sc.ack || []).forEach(k => S.ack[k] = true);
  syncLists(); applyAssume(); syncSafety(); return true;
};
window.readOutputs = function(){
  applyAssume(); const out = {}; out.dob = {you:S.about.dob, partner:S.about.pdob || null}; const P0 = project(), P = project(S.wi);
  const rows = P.rows.map(r => ({t:r.t, a:r.a, inflow:r.inflow, needs:r.needs, goalPaid:r.goalPaid, living:r.living, fixed:r.fixed, goalCost:r.goalCost, short:r.short, shortLiving:r.shortLiving, goalGap:r.goalGap, used:r.used, saved:r.saved, spent:r.spent, liquid:r.liquid, pen:r.pen, tax:r.tax, gross:r.gross, isShort:isShort(r) ? 1 : 0}));
  out.rows = rows; out.N = AS.end - S.about.age;
  out.pct = S.goals.map(g => P.pct[g.id]); out.bands = S.goals.map(g => band(P.pct[g.id]));
  out.goalNums = S.goals.map(g => P.goal[g.id] ? {needM:P.goal[g.id].needM, nowM:P.goal[g.id].nowM, avgM:P.goal[g.id].avgM} : null);
  out.save = P0.save; out.wiOn = !!(S.wi && (S.wi.m || S.wi.l));
  out.amounts = S.goals.map(g => g.amount);
  { const Pb = P0, gs = S.goals.slice(), n = gs.length, avg = n ? Math.round(gs.reduce((t, g) => t + Pb.pct[g.id], 0) / n) : 0, wk = n ? gs.slice().sort((a, b) => Pb.pct[a.id] - Pb.pct[b.id])[0] : null;
    out.home = {n, avg, ok:gs.filter(g => Pb.pct[g.id] >= 95).length, band:band(avg), tools:toolsForYou().join(','), expert:S.goals.length ? EXPERT_FOR[wk.spec] : EXPERT_FOR.planner, when:S.goals.map(g => yearsTxt(g))};
    const cur = S.saveM != null ? S.saveM : Pb.save.saveM, x = Math.floor(SAVE.share * Pb.save.surplusM / 25) * 25; out.nudge = {x, show:(x >= Pb.save.saveM + 50 && x >= cur + 50) ? 1 : 0};
    const wl = wiLive(); out.wi = {tot:wl.tot, over:wl.over ? 1 : 0, base:wl.base, sp:wl.sp};
    const rows = P.rows, sh = rows.filter(chartShort), liv = sh.filter(r => r.shortLiving > 0.5);
    out.chart = {shortYears:sh.length, dip:rows.filter(r => !chartShort(r) && rowParts(r).fromSavings > 0.5).length, firstAge:sh.length ? sh[0].a : '', firstAmt:sh.length ? rowParts(sh[0]).short : '', total:sh.reduce((t, r) => t + rowParts(r).short, 0), livYears:liv.length, livFirst:liv.length ? liv[0].a : '', roadFirst:(rows.find(isShort) || {a:''}).a, roadShort:rows.filter(isShort).length,
      parts:rows.map(r => { const p = rowParts(r); return [p.fromIncome, p.fromSavings, p.short]; })};
    { const L = foundations(), fx = fndNext(L), pm = planMissing(), e = essM(finNums());
      out.misc = {fndNextN:fx ? fx.x.n : 0, fndNextT:fx ? fx.t : '', fndNextD:fx ? fx.d.replace(/&#39;/g, "'") : '', slip:Pb ? S.goals.filter(g => Pb.pct[g.id] < 95).map(g => g.name).join('|') + (S.goals.some(g => Pb.pct[g.id] < 95) ? '|' : '') : '', slipN:S.goals.filter(g => Pb.pct[g.id] < 95).length,
        dobMsg:dobCheck(S.about.dob, 'you').text, ageToday:S.about.ageToday, pdobMsg:(() => { const pn = S.partner.name; S.partner.name = ''; const t = S.about.partner && S.about.pdob ? dobCheck(S.about.pdob, 'partner').text : ''; S.partner.name = pn; return t; })(), reqN:reqKeys().length, reqGot:reqKeys().length - req3Missing().length, retMin:retMin(), retMax:retMax(), retRange:RETIRE_HELP + ' Choose the age you want to plan for, any age from ' + retMin() + ' to ' + retMax() + '.', retNote:S.retireSet ? retNote(S.retireAge) : '', pNote:(pInc() && S.pRetSet) ? pRetNote(S.pRet) : '', planEndSet:asmMine('planEnd'),
          heading:reqKeys().length - req3Missing().length === reqKeys().length ? 'All ' + reqKeys().length + ' chosen' : 'Choose ' + reqKeys().length + ' things',
          use:(() => { const N = {mortRate:'Assumed: add yours · we use the Central Bank average rate', cardRate:'Assumed: add yours · we use a planning rate of ' + pcs(AS.cardRate), loanRate:'Assumed: add yours · we use the Central Bank average rate', mort2:'Assumed: add yours · we use 25 years', mortYears:'Assumed: add yours · we use 25 years', pAge:'Assumed: add yours · we use your age', work:'Assumed: add yours · we use Employed'}; const o = {}; Object.keys(N).forEach(k => { const it = checkItems().find(x => x.k === k); o[k] = it && it.st === 'miss' ? N[k] : ''; }); return o; })(), months:S.goals.map(g => g.k === 'safety' && e > 0 && g.amount > 0 ? Math.round(g.amount / e * 10) / 10 : '')}; }
    out.chapters = chapters(P).map(c => { const s2 = c.rows.filter(isShort), dip = c.rows.filter(r => r.used > 1 && !isShort(r)); return {dec:c.dec, from:c.from, to:c.to, n:c.rows.length, short:s2.length, dip:dip.length, avg:s2.length ? s2.reduce((s, r) => s + r.short, 0) / s2.length : 0, wx:s2.length ? 'storm' : dip.length > c.rows.length / 3 ? 'showers' : dip.length ? 'partly' : 'sun'}; }); }
  { const full = umCount() === 13, r = riskRead(full), per = personality(), mt = myTerms(), sec = k => (mt.find(x => x.k === k) || {tags:[]}).tags.join('|');
    const d = new DOMParser().parseFromString(planProfileBanner(), 'text/html'), bt = d.querySelector('#r-prof > span:nth-of-type(2)');
    out.prof = {disc:discCount(), um:umCount(), full:full ? 1 : 0, personality:per ? per.name : '', label:r.label || '', level:r.level == null ? '' : r.level, want:r.want == null ? '' : r.want, can:r.can == null ? '' : r.can, time:r.time == null ? '' : r.time, limit:r.limit || '', misKey:r.misKey || '', comfort:r.comfort || '', cushion:r.cushion || '', provisional:r.provisional ? 1 : 0, banner:bt ? bt.textContent.split(/[ \\n\\t]+/).join(' ').trim() : '',
      terms:{mindset:sec('mindset'), behaviour:sec('behaviour'), appetite:sec('appetite'), capacity:sec('capacity')}, suggestU9:suggestU9()}; }
  // Option B goal line, and the extra the what-if search finds
  out.extraTo100 = S.goals.map(g => (P.goal[g.id] && P.pct[g.id] < 100) ? extraTo100(g) : undefined);
  out.lines = S.goals.map(g => goalLine(P, g));
  try { const F = findings(P0); out.find = {sT:F.sT, gT:F.gT, dT:F.dT, ex:F.ex == null ? null : F.ex, best:F.best ? S.goals.indexOf(F.best) : -1, worst:S.goals.indexOf(F.worst)}; } catch (e) { out.find = null; }
  try { const fnd = foundations(); out.fnd = fnd.map(l => ({name:l.name, st:l.st, s:l.s})); } catch (e) { out.fnd = null; }
  out.missing = planMissing().map(x => x.k); out.missingT = planMissing().map(x => x.t); out.gateText = planMissing().length ? chooseTxt(planMissing()[0]) : '';
  out.missingFlags = missingFlags().length;
  const f = finNums(); out.fin = {essM:essM(f), mortPayM:f.mortPayM, cardPayM:f.cardPayM, loanPayM:f.loanPayM, penG:f.penG, own:f.pensionOwnM, penM:f.pensionM, sp:f.sp, debt:f.debt, loanBal:f.loanBal, cardBal:f.cardBal, loanRate:f.loanRate, cardRate:f.cardRate};
  out.ASx = 1; out.AS = {infl:AS.infl, wage:AS.wage, cash:AS.cash, inv:AS.inv, pen:AS.pen, penRet:AS.penRet, end:AS.end, year0:YEAR0, buffer:SAVE.buffer};
  // ---- recheck round: my money sections, next best step, what-if text, goal years, video reasons, category counts, year labels, chapter stories, Understand Me counts
  { const strip = h => String(h).replace(/<br>/g, '\\n').replace(/<[^>]+>/g, '').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    const ci = checkItems();
    out.fin6 = {st:FSEC.map(secStatus), done:FSEC.filter(s => secStatus(s) === 'done').length, minOK:minOK() ? 1 : 0, quality:qualityCount(), skipped:skippedSecs().length, rough:roughNote() ? 1 : 0, homeRough:(skippedSecs().length || qualityCount() > 2) ? 1 : 0,
      good:ci.filter(x => !['look', 'miss'].includes(x.st)).length, looks:ci.filter(x => x.st === 'look' && !S.ack[x.k]).length};
    try { const n = nextStep(); out.next = {t:strip(n.t), d:strip(n.d), b:n.b}; } catch (e) { out.next = null; }
    { const f2 = finNums(), ry = f2.R - f2.age; out.ret = {year:ry, pot:(ry >= 1 && ry <= out.N) ? P.rows[ry - 1].pen : '', incM:(ry >= 0 && ry <= out.N) ? P.rows[ry].inflow / Math.pow(1 + AS.infl, ry) / 12 : ''}; }
    try { const sp = specialist(); out.expertIdx = sp.goal ? S.goals.indexOf(sp.goal) + 1 : 0; } catch (e) { out.expertIdx = null; }
    out.pctBase = S.goals.map(g => P0.pct[g.id]); out.wiTxt = strip(wiText(P0, P)); out.wiPairs = S.goals.map(g => P0.pct[g.id] !== P.pct[g.id] ? g.name + ' goes from ' + P0.pct[g.id] + '% to ' + P.pct[g.id] + '%' : '');
    const a0 = S.about.age; out.years = S.goals.map(g => ({y:YEAR0 + g.age - a0, t:passedG(g) ? 'Date has passed' : (g.kind === 'retire' ? 'Age ' : 'age ') + g.age + ' · ' + (YEAR0 + g.age - a0)}));
    out.vidPct = ['mortgage', 'pension', 'protection', 'investment', 'planner'].map(k => { const g = S.goals.find(x => x.spec === k && x.kind !== 'retire') || (k === 'pension' ? retireGoal() : null); return g ? P0.pct[g.id] : ''; });
    out.catN = CATS.map(c => CALCS.filter(x => x.cat === c.id).length);
    out.yrLabel = P.rows.map(r => isShort(r) ? 'Gap to plan for: short ' + eur(r.short) : r.used > 1 ? 'Using savings' : 'Comfortable');
    out.stories = chapters(P).map(c => { const sh = c.rows.filter(isShort), dip = c.rows.filter(r => r.used > 1 && !isShort(r)), allRet = c.rows.every(r => r.retired);
      return sh.length ? 'Short by about ' + eur(sh.reduce((s, r) => s + r.short, 0) / sh.length) + ' a year in ' + sh.length + ' of these years.' : allRet ? 'Living on your pensions and savings, and they hold up.' : dip.length ? "Some years dip into savings. That's what they're for." : 'Income comfortably covers life.'; });
    const sec = UM.map(s => ({got:s.qs.filter(q => q.d ? typeof S.ans[q.d] === 'number' : typeof S.um.a[q.u] === 'number').length, tot:s.qs.length}));
    out.umSec = sec; out.umLeft = UM_NEW.filter(u => u === '6' ? typeof S.ans['6'] !== 'number' : typeof S.um.a[u] !== 'number').length; out.umLeftTxt = umLeftTxt(); }
  return out;
};
`;
