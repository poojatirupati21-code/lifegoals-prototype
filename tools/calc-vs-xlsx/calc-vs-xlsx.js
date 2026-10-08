// FP round 7: each of the 28 Explore calculators vs the corrected workbook deliverables/LifeGoals-Calculators.xlsx.
// 5 cases per calculator (defaults, 3 seeded random, 1 edge / statement / blank-inflation case). The workbook side: write the inputs
// into a copy, recalc.py, read the named results (tools/calc-vs-xlsx/xlsx_cases.py). Money must match within €0.50, rates within 1e-6,
// months / years / texts exactly. Assumption constants the formulas use are compared separately (CONST lines).
// Run: NODE_PATH=/opt/node22/lib/node_modules node tools/calc-vs-xlsx/calc-vs-xlsx.js   (see README.md in this folder)   → "FAILS n of m", "ERRORS n", workbook timestamp.
const { chromium } = require('playwright'); const fs = require('fs'); const { execFileSync } = require('child_process');
const path = require('path'), DIR = process.env.CALC_VS_XLSX_WORK || path.join(require('os').tmpdir(), 'calc-vs-xlsx'), URL = 'file://' + path.resolve(__dirname, '../../LifeGoals-Customer-Journey-Prototype.html');
fs.mkdirSync(DIR, {recursive:true});
const P = 'pct', N = 'n', YN = 'yn';
// [proto id, sheet, inputs [protoKey, workbookName, kind], outputs, uses inflation, has "show in today's money"]
const MAP = [
 ['borrow', 'C01 Borrowing', [['inc','Income',N],['inc2','Partner_Income',N],['dep','Deposit',N],['ftb','First_Time_Buyer',YN],['rate','Interest_Rate',P],['term','Term_Years',N],['xdep','Extra_Deposit',N]], ['Home_Price','Max_Loan','Monthly_Repayment','Borrow_By_Income','Stamp_Duty','Price_By_Deposit','Price_By_Income','Income_Multiple','Total_Deposit','Limit_Set_By','Plan_Goal_Amount','Plan_Goal_Saved'], false, false, [['buyFees','Buying_Fees']]],
 ['repayment', 'C02 Mortgage repayment', [['loan','Loan_Amount',N],['rate','Interest_Rate',P],['term','Term_Years',N],['dr','Rate_Change',P]], ['Monthly_Repayment','Formula_Repayment','Months_To_Pay','Total_Interest','Total_Repaid','New_Rate','Repayment_If_Changed','Change_Per_Year','Plan_Goal_Amount']],
 ['deposit', 'C03 Deposit', [['price','Home_Price',N],['pc','Deposit_Pct',P],['saved','Saved',N],['mo','Monthly_Saving',N],['xmo','Extra_Saving',N]], ['Months_To_Deposit','Total_Needed','Deposit_Needed','Stamp_Duty','Still_To_Save','Plan_Goal_Amount','Plan_Goal_Saved','Plan_Goal_Years'], false, false, [['buyFees','Buying_Fees']]],
 ['overpay', 'C04 Mortgage overpayment', [['bal','Mortgage_Balance',N],['rate','Interest_Rate',P],['yrs','Years_Left',N],['x','Extra_Payment',N]], ['Months_Now','Months_With_Extra','Months_Sooner','Interest_Saved','Interest_Now','Interest_With_Extra','Repayment_Now','Plan_Goal_Years']],
 ['ratechange', 'C05 Interest rate impact', [['loan','Mortgage_Balance',N],['rate','Current_Rate',P],['term','Years_Left',N],['d','Rate_Change',P]], ['Monthly_Change','Repayment_Now','Repayment_After','Yearly_Change','New_Rate','Formula_Now']],
 ['term', 'C06 Term comparison', [['loan','Loan_Amount',N],['rate','Interest_Rate',P],['a','Term_A',N],['b','Term_B',N]], ['Interest_Difference','Monthly_A','Monthly_B','Interest_A','Interest_B']],
 ['rentbuy', 'C07 Rent vs buy', [['rent','Monthly_Rent',N],['price','Home_Price',N],['dep','Deposit',N],['rate','Mortgage_Rate',P],['term','RentBuy_Term',N],['y','Years',N],['g','House_Growth',P]], ['Home_Equity','Rent_Paid','Buying_Costs','Home_Value','Loan','Monthly_Repayment','Balance_After','Interest_Paid','Upkeep','Stamp_Duty','Opportunity_Cost','Plan_Goal_Amount'], false, false, [['rentRise','Rent_Growth'],['upkeep','Upkeep_Rate'],['buyFees','Buying_Fees'],['depEarn','Opp_Rate']]],
 ['goalplanner', 'C08 Goal planner', [['t','Goal_Amount',N],['y','Years',N],['s','Saved',N],['r','Growth_Rate',P]], ['Monthly_Saving','Future_Cost','Saved_Grows_To','Still_Needed','Plan_Goal_Amount','Plan_Goal_Saved','Plan_Goal_Years'], true],
 ['compound', 'C09 Compound growth', [['p','Starting_Amount',N],['m','Monthly_Addition',N],['r','Growth_Rate',P],['y','Years',N]], ['Grows_To','Value_Today','Paid_In','Growth_Earned','Plan_Goal_Amount'], true],
 ['lumpsum', 'C10 Lump sum growth', [['p','Amount',N],['r','Growth_Rate',P],['y','Years',N],['f','Yearly_Fees',P],['wait','Wait_Years',N]], ['Headline','Grows_To','Value_Start_Later','Value_Today','Cost_Of_Waiting','Fees_Cost','Growth_After_Fees','Real_Return','Plan_Goal_Amount'], true, true],
 ['emergency', 'C11 Emergency fund', [['e','Essential_Spending',N],['mt','Months_Wanted',N],['s','Savings',N]], ['Months_Covered','Target','Still_To_Build','Plan_Goal_Amount','Plan_Goal_Saved']],
 ['retirement', 'C12 Retirement projection', [['age','Age',N],['ra','Retirement_Age',N],['pot','Pension_Today',N],['m','Monthly_Contribution',N],['d','Desired_Income',N],['o','Other_Income',N],['g','Growth_Rate',P],['later','Retire_Later',N],['more','Save_More',N],['less','Spend_Less',N]], ['Gap_Today','Projected_Fund','Fund_Today','Calculated_Fund','Target_Today','Years_To_Retirement','Bridge_Years','Lump_Sum','Lump_Sum_Tax','Lump_Sum_Net','Early_Warning','SFT_Warning','Use_Statement_Projection','Plan_Goal_Income','Plan_Goal_Age'], true, false, [['wage','Wage'],['retireMult','Retire_Multiple'],['penChg','Typical_Pension_Charges'],['lumpSum','Lump_Sum_Pct'],['accessAge','Access_Age']]],
 ['contrib', 'C13 Contribution impact', [['sal','Salary',N],['inc','Increase_Pct',P],['y','Years',N],['g','Growth_Rate',P],['tr','Tax_Rate',P],['age','Age',N],['ex','Existing_Pension_Year',N]], ['Grows_To','Value_Today','Extra_Per_Month','Net_Cost_Per_Month','Relief_Limit_Year','Relieved_Year','Relief_Per_Month','Plan_Goal_Contribution'], true, false, [['penChg','Typical_Pension_Charges']]],
 ['avc', 'C14 AVC impact', [['m','AVC_Per_Month',N],['sal','Salary',N],['y','Years',N],['g','Growth_Rate',P],['tr','Tax_Rate',P],['age','Age',N],['ex','Existing_Pension_Year',N]], ['Grows_To','Value_Today','Paid_In','Net_Cost','Net_Cost_Per_Month','Relief_Limit_Year','Relieved_Year','Relief_Per_Month','Plan_Goal_Contribution'], true, false, [['penChg','Typical_Pension_Charges']]],
 ['lastmoney', 'C15 Will my money last', [['pot','Retirement_Savings',N],['w','Yearly_Withdrawal',N],['g','Growth_Rate',P],['age','Age_At_Start',N]], ['Years_Lasting','Lasts_To_Age','Withdrawal_Rate'], true, false, [['ddTiming','Withdrawal_Timing','T'],['planEnd','Plan_To_Age']]],
 ['drawdown', 'C16 Drawdown scenarios', [['pot','Retirement_Savings',N],['w','Yearly_Withdrawal',N]], ['Years_Cautious','Years_Balanced','Years_Growth'], true, false, [['riskMu1','DD_Cautious'],['riskMu2','DD_Balanced'],['riskMu3','DD_Growth'],['ddTiming','Withdrawal_Timing','T']]],
 ['realreturn', 'C17 Inflation adjusted return', [['p','Amount',N],['r','Nominal_Return',P],['y','Years',N]], ['Future_Value','Value_Today','Real_Return'], true],
 ['regularinvest', 'C18 Regular investing', [['m','Monthly_Amount',N],['y','Years',N],['g','Growth_Rate',P],['f','Yearly_Fees',P]], ['Headline','Value_After_Fees','Value_Before_Fees','Fees_Cost','Paid_In','Value_Today','Growth_After_Fees','Real_Return','Plan_Goal_Amount'], true, true],
 ['fees', 'C19 Fees impact', [['p','Amount_Invested',N],['y','Years',N],['g','Growth_Rate',P],['a','Fee_A',P],['b','Fee_B',P]], ['Difference','Value_With_Fee_A','Value_With_Fee_B','Fee_Gap']],
 ['riskreturn', 'C20 Risk and return', [['p','Amount',N],['y','Years',N],['s','Style',N]], ['Middle','Weaker','Stronger','Difficult_Year_Fall','Style_Name','Spread'], false, false, [['riskMu1','Mu_Cautious'],['riskMu2','Mu_Balanced'],['riskMu3','Mu_Growth'],['riskVol1','Vol_Cautious'],['riskVol2','Vol_Balanced'],['riskVol3','Vol_Growth']]],
 ['lifecover', 'C21 Life cover', [['inc','Yearly_Income',N],['y','Years_Support',N],['mort','Mortgage_Balance',N],['mp','Mortgage_Protected',YN],['debt','Other_Debts',N],['sav','Savings',N],['ex','Existing_Cover',N],['surv','Survivor_Pension',N]], ['Cover_Gap','Income_Need','Debts_To_Clear','Already_Have','Income_Replacement','Plan_Goal_Need'], false, false, [['lifeShare','Life_Replace']]],
 ['incomegap', 'C22 Income protection gap', [['e','Essential_Spending',N],['sp','Sick_Pay_Months',N],['s','Savings',N],['inc','Gross_Income',N],['ib','Illness_Benefit',N]], ['Months_Coping','Monthly_Gap','IP_Needed','Illness_Benefit_Month','Savings_Months','IP_Max','Plan_Goal_Need']],
 ['mortgageprotect', 'C23 Mortgage protection', [['bal','Mortgage_Balance',N],['rate','Interest_Rate',P],['y','Years_Left',N]], ['Cover_Today','Warning','Balance_Year_1','Balance_Year_2','Balance_Year_3','Repayment']],
 ['networth', 'C24 Net worth', [['sav','Savings',N],['inv','Investments',N],['pen','Pensions',N],['prop','Property',N],['mort','Mortgage',N],['loans','Other_Loans',N]], ['Net_Worth','You_Own','You_Owe']],
 ['surplus', 'C25 Monthly surplus', [['inc','Take_Home',N],['ess','Essentials',N],['life','Lifestyle',N],['debt','Debt_Repayments',N]], ['Surplus','Going_Out','Plan_Goal_Amount']],
 ['budget', 'C26 Budget 50 30 20', [['inc','Take_Home',N]], ['Save','Needs','Wants','Split_Check'], false, false, [['budgetNeeds','Budget_Needs'],['budgetWants','Budget_Wants'],['budgetSave','Budget_Save']]],
 ['debtpay', 'C27 Debt repayment', [['b','Balance',N],['apr','APR',P],['p','Monthly_Payment',N],['x','Extra_Payment',N]], ['Months_To_Clear','Total_Interest','Monthly_Rate']],
 ['loan', 'C28 Loan repayment', [['a','Loan_Amount',N],['apr','APR',P],['y','Years',N]], ['Monthly_Repayment','Total_Repaid','Total_Interest','Monthly_Rate']]
];
// the customer's assumptions the workbook shows as inputs on the sheet (prototype: "Your assumptions"); varied per case on both sides
const ASMR = {accessAge:[50, 60, 10], buyFees:[0, 10000, 250], rentRise:[0, 0.08, 0.005], upkeep:[0, 0.03, 0.001], depEarn:[0, 0.06, 0.0025], wage:[0, 0.06, 0.001], retireMult:[20, 33, 1], penChg:[0, 0.025, 0.0005], lumpSum:[0, 0.25, 0.01], ddTiming:['start', 'end'], planEnd:[85, 100, 1],
  riskMu1:[0, 0.08, 0.005], riskMu2:[0, 0.08, 0.005], riskMu3:[0, 0.08, 0.005], riskVol1:[0, 0.25, 0.01], riskVol2:[0, 0.25, 0.01], riskVol3:[0, 0.25, 0.01], lifeShare:[0.3, 1, 0.05], budgetNeeds:[0, 1, 0.05], budgetWants:[0, 1, 0.05], budgetSave:[0, 1, 0.05]};
// edge / statement case (case 5) per calculator: proto inputs (+ optional statement for the workbook and the prototype)
const EDGE = {
  borrow:{inc:40000, inc2:30000, dep:80000, ftb:0, rate:3.5, term:25, xdep:5000},
  repayment:{loan:203700, rate:3.85, term:21, dr:-0.5, _stmt:{wb:{Stmt_Balance:203700, Stmt_Rate:0.0385, Stmt_Term:21, Stmt_Repayment:1180}, fin:{mortPayM:1180}}},
  deposit:{price:300000, pc:10, saved:40000, mo:500, xmo:0},
  overpay:{bal:250000, rate:4, yrs:25, x:200, _stmt:{wb:{Stmt_Balance:250000, Stmt_Rate:0.04, Stmt_Term:25, Stmt_Repayment:800}, fin:{mortPayM:800}}},   // stated repayment below the interest: never clears; the extra does
  ratechange:{loan:203700, rate:3.85, term:21, d:-3.85, _stmt:{wb:{Stmt_Balance:203700, Stmt_Rate:0.0385, Stmt_Term:21, Stmt_Repayment:1180}, fin:{mortPayM:1180}}},
  term:{loan:250000, rate:4.5, a:30, b:30},
  rentbuy:{rent:2200, price:450000, dep:45000, rate:3.75, term:15, y:20, g:0},
  goalplanner:{t:20000, y:5, s:30000, r:3, _infl:null},
  compound:{p:0, m:150, r:0, y:10, _infl:null},
  lumpsum:{p:6200, r:4, y:4, f:0.6, wait:5, _adj:'Yes', _stmt:{wb:{Stmt_Total_Value:6200, Stmt_Charges:0.006}}},
  emergency:{e:3500, mt:6, s:30000},
  retirement:{age:38, ra:66, pot:72000, m:520, d:46000, o:15563.6, g:4.5, later:0, more:0, less:0, _stmt:{wb:{Stmt_Fund_Value:72000, Stmt_You_Monthly:260, Stmt_Employer_Monthly:260, Stmt_NRA:66, Stmt_Projected_Fund:722000, Stmt_Projection_Today:'No', Stmt_Charges:0.01}, proj:{proj:722000, nra:66, projToday:'No'}}},
  contrib:{sal:30000, inc:5, y:1, g:3, tr:20, age:28, ex:4000, _infl:null},
  avc:{m:400, sal:150000, y:40, g:7, tr:40, age:62, ex:40000},
  lastmoney:{pot:10000, w:20000, g:3, age:70, _infl:0.025},
  drawdown:{pot:3000000, w:20000, _infl:0},
  realreturn:{p:500, r:0, y:40, _infl:null},
  regularinvest:{m:150, y:15, g:5, f:0.6, _adj:'Yes', _infl:null},
  fees:{p:1000, y:40, g:0, a:3, b:0},
  riskreturn:{p:6200, y:1, s:3},
  lifecover:{inc:30000, y:30, mort:150000, mp:0, debt:0, sav:500000, ex:0, surv:0},
  incomegap:{e:900, sp:0, s:5000, inc:20000, ib:100},
  mortgageprotect:{bal:250000, rate:4, y:25, _stmt:{wb:{Stmt_Balance:250000, Stmt_Rate:0.04, Stmt_Term:25, Stmt_Repayment:800}, fin:{mortPayM:800}}},
  networth:{sav:0, inv:0, pen:0, prop:0, mort:300000, loans:20000},
  surplus:{inc:2500, ess:1500, life:800, debt:200},
  budget:{inc:500},
  debtpay:{b:100000, apr:0, p:10, x:0},
  loan:{a:500, apr:0, y:1}
};
const INFL = [0.02, 0.039, 0, 0.04];
// one Tax engine case per round: the workbook's tax engine vs the prototype's hhTax (same 2026 rules)
const TEC = [{TE_Status:'Single', TE_Gross_1:60000, TE_Gross_2:0, TE_Rent_Credit:'No', TE_Home_Carer:'No', TE_PRSI_Basis:'From 1 Oct 2026'},
  {TE_Status:'Single parent', TE_Gross_1:50000, TE_Gross_2:0, TE_Rent_Credit:'Yes', TE_Home_Carer:'No', TE_PRSI_Basis:'Calendar 2026 blend'},
  {TE_Status:'Married one earner', TE_Gross_1:80000, TE_Gross_2:0, TE_Rent_Credit:'Yes', TE_Home_Carer:'Yes', TE_PRSI_Basis:'From 1 Oct 2026'},
  {TE_Status:'Married two earners', TE_Gross_1:60000, TE_Gross_2:30000, TE_Rent_Credit:'No', TE_Home_Carer:'No', TE_PRSI_Basis:'From 1 Oct 2026'},
  {TE_Status:'Single', TE_Gross_1:20000, TE_Gross_2:0, TE_Rent_Credit:'Yes', TE_Home_Carer:'No', TE_PRSI_Basis:'Calendar 2026 blend'}];
// the workbook's Irish rules register vs RULES_IE_2026 (name → prototype expression)
const RULEMAP = {Band_Single:'RI.it.band', Band_Single_Parent:'RI.it.bandSPCCC', Band_Married:'RI.it.bandMarried', Band_Second_Earner_Max:'RI.it.bandUplift', Rate_Standard:'RI.it.r1', Rate_Higher:'RI.it.r2', Credit_Personal_Single:'RI.it.personal', Credit_Personal_Married:'RI.it.personalMarried', Credit_PAYE:'RI.it.paye', Credit_PAYE_Cap_Pct:'RI.it.payeCapPct', Credit_SPCCC:'RI.it.spccc', Credit_Rent_Single:'RI.it.rent', Credit_Rent_Joint:'RI.it.rentJoint', Credit_Home_Carer:'RI.it.homeCarer',
  USC_Exempt:'RI.usc.exempt', USC_Band_1:'RI.usc.bands[0][0]', USC_Band_2:'RI.usc.bands[1][0]', USC_Band_3:'RI.usc.bands[2][0]', USC_Rate_1:'RI.usc.bands[0][1]', USC_Rate_2:'RI.usc.bands[1][1]', USC_Rate_3:'RI.usc.bands[2][1]', USC_Rate_4:'RI.usc.bands[3][1]', PRSI_Rate:'RI.prsi.path[1].r', PRSI_Rate_2026_Blend:'prsiRate(2026)', PRSI_Free_Week:'RI.prsi.wkFree', PRSI_Credit_Max:'RI.prsi.creditMax', PRSI_Credit_Top:'RI.prsi.creditTo', PRSI_Credit_Taper:'RI.prsi.creditTaper',
  Relief_Age_Pct:'RI.pen.relief.map(x => x[1])', Relief_Earnings_Cap:'RI.pen.earnCap', Lump_Sum_Max_Pct:'RI.pen.lsMaxPct', Lump_Sum_Tax_Free:'RI.pen.lsTaxFree', Lump_Sum_Cap:'RI.pen.lsCap', Lump_Sum_Rate:'RI.pen.lsBandRate', SFT_2026:'RI.pen.sft[2026]', SFT_Tax:'RI.pen.sftRate', Pension_Earliest_Age:'RI.pen.earliestAge',
  State_Pension_Week:'RI.sp.week', State_Pension_Year:'RI.sp.week * 52', State_Pension_Age:'RI.sp.age', Survivor_Pension_Week:'RI.sp.survivor', Survivor_Pension_Week_66:'RI.sp.survivor66', Illness_Benefit_Week:'RI.sp.illness', IP_Max_Pct:'IP_MAX_PCT', Weeks_Per_Year:'RI.sp.weeks',
  DIRT:'RI.sav.dirt', Exit_Tax:'RI.sav.exit', Deemed_Disposal_Years:'RI.sav.deemed', LTI_FTB:'RI.home.ltiFTB', LTI_SSB:'RI.home.ltiSSB', LTV_Max:'RI.home.ltv', SD_Rate_1:'RI.home.stamp[0][1]', SD_Band_1:'RI.home.stamp[0][0]', SD_Rate_2:'RI.home.stamp[1][1]', SD_Band_2:'RI.home.stamp[1][0]', SD_Rate_3:'RI.home.stamp[2][1]',
  Cap_Months:'CAP_MONTHS', Cap_Years:'CAP_YEARS', MP_Year_1:'MP_YEARS[0]', MP_Year_2:'MP_YEARS[1]', MP_Year_3:'MP_YEARS[2]', One_In_20_Z:'ONE_IN_20_Z', Suggest_Mortgage_Rate:'SV("mortRate")', Suggest_Loan_APR:'SV("loanRate")', Suggest_Deposit_Rate:'SV("depRate")', Suggest_Fund_Charges:'SV("fundChg")', Card_APR_Cap:'RI.guide.cardCap'};
Object.assign(RULEMAP, {"Set_infl": "SV(\"infl\")", "Set_wage": "SV(\"wage\")", "Set_wage_Cautious": "SET.wage.vc", "Set_cash": "SV(\"cash\")", "Set_cash_Cautious": "SET.cash.vc", "Set_inv": "SV(\"inv\")", "Set_inv_Cautious": "SET.inv.vc", "Set_invGross": "SV(\"invGross\")", "Set_pen": "SV(\"pen\")", "Set_pen_Cautious": "SET.pen.vc", "Set_penRet": "SV(\"penRet\")", "Set_penRet_Cautious": "SET.penRet.vc", "Set_rentRise": "SV(\"rentRise\")", "Set_houseGrow": "SV(\"houseGrow\")", "Set_upkeep": "SV(\"upkeep\")", "Set_ownShare": "SV(\"ownShare\")", "Set_retireMult": "SV(\"retireMult\")", "Set_retireSpend": "SV(\"retireSpend\")", "Set_lumpSum": "SV(\"lumpSum\")", "Set_safetyMonths": "SV(\"safetyMonths\")", "Set_safetyMonthsTwo": "SV(\"safetyMonthsTwo\")", "Set_cashYears": "SV(\"cashYears\")", "Set_investShare": "SV(\"investShare\")", "Set_saveShare": "SV(\"saveShare\")", "Set_noAnswer": "SV(\"noAnswer\")", "Set_lifeShare": "SV(\"lifeShare\")", "Set_lifeYears": "SV(\"lifeYears\")", "Set_riskMu_1": "SV(\"riskMu\")[0]", "Set_riskMu_2": "SV(\"riskMu\")[1]", "Set_riskMu_3": "SV(\"riskMu\")[2]", "Set_riskVol_1": "SV(\"riskVol\")[0]", "Set_riskVol_2": "SV(\"riskVol\")[1]", "Set_riskVol_3": "SV(\"riskVol\")[2]", "Set_budget_1": "SV(\"budget\")[0]", "Set_budget_2": "SV(\"budget\")[1]", "Set_budget_3": "SV(\"budget\")[2]", "Set_waitYears": "SV(\"waitYears\")", "Set_style": "SV(\"style\")", "Set_mortRate": "SV(\"mortRate\")", "Set_loanRate": "SV(\"loanRate\")", "Set_depRate": "SV(\"depRate\")", "Set_fundChg": "SV(\"fundChg\")"});   // §19.6: every Settings value in the workbook Settings sheet = the prototype SETTINGS block   // §18 partner rates: workbook block = prototype block   // cases 1–4; case 5 uses EDGE._infl (default blank → "Enter your inflation rate")
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(300);
  // 1. cases from the prototype's own input definitions (seeded)
  const defs = await p.evaluate(MAP => MAP.map(([id]) => { const c = C(id); return {id, ins:c.inputs.concat(c.wi || []).map(i => ({k:i.k, v:i.v, min:i.min, max:i.max, step:i.step, u:i.u}))}; }), MAP);
  let seed = 20261002; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const cases = {}; defs.forEach(d => { const L = [];
    L.push(Object.fromEntries(d.ins.map(i => [i.k, i.v])));
    for (let r = 0; r < 3; r++) L.push(Object.fromEntries(d.ins.map(i => { const n = Math.round((i.max - i.min) / i.step); return [i.k, +(i.min + Math.floor(rnd() * (n + 1)) * i.step).toFixed(4)]; })));
    L.push(EDGE[d.id]); cases[d.id] = L; });
  // validity: Rent vs buy deposit 10%–100% of price; Term B ≥ 5; Deposit monthly ≥ 50 (already); Retirement age above age
  // audit fix round (8 Oct 2026): the random cases keep valid values, and the extra cases below test the audited edges (deposit outside 10%–100%, retirement age at or before the age, bridge years, lump sum above €500k, Illness Benefit cap, withdrawal above the pot)
  cases.rentbuy.slice(0, 4).forEach(c => { c.dep = Math.max(c.dep, Math.ceil(c.price * 0.1)); c.dep = Math.min(c.dep, c.price); });
  cases.retirement.slice(0, 4).forEach(c => { if (c.ra <= c.age) c.ra = Math.min(75, c.age + 5); });
  const base = id => Object.fromEntries(defs.find(d => d.id === id).ins.map(i => [i.k, i.v]));
  const EXTRA = {
    retirement:[{age:40, ra:60, d:20000, o:10000}, {age:40, ra:60, d:20000, o:20000}, {age:40, ra:60, d:20000, o:30000}, {age:40, ra:60, d:20000, o:45000}, {age:70, ra:50}, {age:40, ra:40}, {age:30, ra:65, pot:1500000, m:5000, d:150000, g:7}, {age:55, ra:65, pot:1500000, m:5000, d:60000, g:7, less:5000}].map(o => Object.assign(base('retirement'), o, {_infl:0.02})),
    incomegap:[{e:200, sp:3, s:8000, inc:60000, ib:254}, {e:2500, sp:3, s:200000, inc:60000, ib:254}, {e:2500, sp:12, s:1000, inc:60000, ib:254}].map(o => Object.assign(base('incomegap'), o)),
    lastmoney:[{pot:10000, w:24000, g:3, age:66}, {pot:10000, w:24000, g:3, age:55}].map(o => Object.assign(base('lastmoney'), o, {_infl:0.02})),
    rentbuy:[{dep:0, price:350000}, {dep:350000, price:350000}, {dep:5000, price:200000}].map(o => Object.assign(base('rentbuy'), o))};
  Object.entries(EXTRA).forEach(([id, L]) => { cases[id] = cases[id].concat(L); });
  const NR = Math.max(...Object.values(cases).map(a => a.length)), cs = (id, k) => cases[id][Math.min(k, cases[id].length - 1)];
  // per-case assumption values (case 1 = suggested, 2–4 random, 5 = the other end)
  const asmSug = await p.evaluate(keys => { S = fresh(); applyAssume(); return Object.fromEntries(keys.map(k => [k, asmV(k)])); }, Object.keys(ASMR));   // FP round 8: the standard (type 3) or the mid-range figure (type 2)
  const FIXED = await p.evaluate(() => ({'C01 Borrowing':{Home_Goal_Years:HOME_GOAL_YEARS}, 'C02 Mortgage repayment':{Home_Goal_Years:HOME_GOAL_YEARS}, 'C07 Rent vs buy':{Home_Goal_Years:HOME_GOAL_YEARS}, 'C11 Emergency fund':{Safety_Goal_Years:SAFETY_GOAL_YEARS}}));
  const ASMC = [0, 1, 2, 3, 4].map(k => Object.fromEntries(Object.entries(ASMR).map(([a, r]) => { if (k === 0) return [a, asmSug[a]]; if (typeof r[0] === 'string') return [a, r[k % 2]]; if (k === 4) return [a, r[1]]; const n = Math.round((r[1] - r[0]) / r[2]); return [a, +(r[0] + Math.floor(rnd() * (n + 1)) * r[2]).toFixed(6)]; })));
  // 2. workbook rounds
  const spec = {rounds:Array.from({length:NR}, (_, k) => { const R = {}; MAP.forEach(([id, sheet, ins, outs, infl, adj]) => { const c = cs(id, k), o = {};
      ins.forEach(([pk, wn, kind]) => { const v = c[pk] == null ? 0 : c[pk]; o[wn] = kind === P ? +(v / 100).toFixed(8) : kind === YN ? (v ? 'Yes' : 'No') : v; });
      if (infl) o.Inflation_Choice = k < 4 ? INFL[k] : (c._infl === undefined ? (k < 5 ? null : 0.02) : c._infl);
      if (adj) o.Adjust_For_Inflation = k < 4 ? (k % 2 ? 'Yes' : 'No') : (c._adj || 'No');
      (MAP.find(x => x[0] === id)[6] || []).forEach(([ak, wn, kind]) => { const v = ASMC[Math.min(k, 4)][ak]; o[wn] = kind === 'T' ? (v === 'end' ? 'End of year' : 'Start of year') : v; });
      if (c._stmt) Object.assign(o, c._stmt.wb); Object.assign(o, FIXED[sheet] || {});
      R[sheet] = o; }); R['Tax engine'] = TEC[Math.min(k, TEC.length - 1)]; R.README = {Fill_Example:'No'}; return R; }),
    read:Object.assign(Object.fromEntries(MAP.map(([id, sheet, ins, outs]) => [sheet, outs])), {'Tax engine':['TE_Income_Tax','TE_USC','TE_PRSI','TE_Take_Home','TE_Marginal_Rate']}),
    assumptions:Object.keys(RULEMAP)};
  // 2b. gate rounds (round E4, 8 Oct 2026): what the result area says when a choice is missing. For every calculator, with all personal figures given:
  //     (1) every choice blank and no inflation, (2) each choice blank alone (inflation chosen), (3) inflation blank alone, (4) nothing blank.
  //     The prototype's own calcMissing() gives the expected text and order ("Choose your mortgage rate to see this"); the workbook must show the same words.
  const UIMAP = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'ui_calc_map.json'), 'utf8'));
  const GS = await p.evaluate(() => { const NOI = 'Choose your inflation rate to see this', out = [];
    CALCS.forEach(c => { const items = [], stds = []; c.inputs.forEach(i => { const s = calcA(c.id, i.k); if (!s) return; (calcStdItem(s) ? stds : items).push({key:i.k}); }); (CALC_X[c.id] || []).forEach(k => { if (ASM[k].opt) return; (asmStd(k) ? stds : items).push({key:k}); });
      const rounds = []; rounds.push({omit:items.map(x => x.key), infl:null}); items.forEach(x => rounds.push({omit:[x.key], infl:0.02})); rounds.push({omit:[], infl:null}); rounds.push({omit:[], infl:0.02});
      if (stds.length) rounds.push({omit:[], stdBlank:true, infl:0.02});   // every LifeMap standard left blank: the tool starts from the standard
      const exp = rounds.map(r => { S = fresh(); S.shell = true; S.app = false; S.tab = 'explore'; S.xs = [{v:'CALC', p:c.id}]; S.infl = r.infl; S.inflOther = false; S.asm = {}; S.calcT = {}; S.calcT[c.id] = {};
        const vals = {}, given = {}; c.inputs.concat(c.wi || []).forEach(i => { const s = calcA(c.id, i.k); if (s && (r.omit.includes(i.k) || (r.stdBlank && calcStdItem(s)))) return; vals[i.k] = i.v; S.calcT[c.id][i.k] = true; given[i.k] = i.v; });
        S.calcV[c.id] = vals; const asmg = {}; (CALC_X[c.id] || []).forEach(k => { const d = ASM[k]; if (r.omit.includes(k) || (r.stdBlank && asmStd(k))) return; let v = d.sug ? d.sug() : null; if (v == null) v = d.t === 'pct' ? 0.03 : (d.min != null ? d.min : 1); S.asm[k] = v; asmg[k] = v; });
        applyAssume(); const miss = calcMissing(c); let gate = miss.length ? missTxt(miss[0]) + ' to see this' : '', infl = false, num = null;
        if (!miss.length) { try { const rr = c.run(calcVals(c)); infl = JSON.stringify([rr.val, rr.rows, rr.line, rr.num]).includes(NOI); num = rr.num; } catch (e) {} }
        return {gate, infl, given, asmg, num}; });
      out.push({id:c.id, rounds, exp}); });
    return out; });
  const NG = Math.max(...GS.map(g => g.rounds.length));
  for (let g = 0; g < NG; g++) { const R = {}; GS.forEach(s => { if (g >= s.rounds.length) return; const e = UIMAP.find(x => x.id === s.id), ex = s.exp[g], o = {};
      e.inputs.forEach(i => { if (i.key in ex.given) { const v = ex.given[i.key]; o[i.name] = i.kind === 'pct' ? +(v / 100).toFixed(8) : i.kind === 'yn' ? (v ? 'Yes' : 'No') : v; } });
      const xt = {}; (e.extra[2] || []).forEach(a => xt[a[0]] = a);
      Object.entries(ex.asmg).forEach(([k, v]) => { if (xt[k]) o[xt[k][1]] = xt[k][2] === 'T' ? (v === 'end' ? 'End of year' : 'Start of year') : v; });
      if (e.extra[0] && s.rounds[g].infl != null) o.Inflation_Choice = s.rounds[g].infl;
      R[e.sheet] = o; }); spec.rounds.push(R); }
  fs.writeFileSync(DIR + '/xlsx_spec.json', JSON.stringify(spec));
  const t0 = Date.now(); execFileSync('python3', [path.join(__dirname, 'xlsx_cases.py'), DIR + '/xlsx_spec.json', DIR + '/xlsx_out.json'], {stdio:'inherit', timeout:1800000});
  const X = JSON.parse(fs.readFileSync(DIR + '/xlsx_out.json'));
  const A = X.assumptions;
  // 3. prototype: same inputs, with the workbook's assumption values for the judgement settings the formulas read
  const PR = await p.evaluate(({MAP, cases, INFL, ASMC}) => { const out = {};
    MAP.forEach(([id, sheet, ins, outs, infl, adj]) => { out[id] = cases[id].map((c, k) => { S = fresh(); const asm = ASMC[Math.min(k, 4)]; S.asm = Object.assign({}, asm); S.infl = !infl ? 0.02 : k < 4 ? INFL[k] : (c._infl === undefined ? (k < 5 ? null : 0.02) : c._infl); S.adjInfl = {}; if (adj) S.adjInfl[id] = (k < 4 ? (k % 2 ? 'Yes' : 'No') : (c._adj || 'No')) === 'Yes';
        if (c._stmt && c._stmt.fin) Object.entries(c._stmt.fin).forEach(([kk, vv]) => { S.fin[kk] = vv; S.src[kk] = 'doc'; });
        if (c._stmt && c._stmt.proj) S.pdocs = {retire:{v:c._stmt.proj}};
        const v = Object.fromEntries(ins.map(([pk]) => [pk, c[pk] == null ? 0 : c[pk]]));
        if (id === 'retirement' && c._stmt) v.g = +(v.g + asm.penChg * 100 - c._stmt.wb.Stmt_Charges * 100).toFixed(4);   // prefill rule: growth + typical charges − the statement's charges
        if (id === 'lumpsum' && c._stmt) v.f = c._stmt.wb.Stmt_Charges * 100;
        try { const r = C(id).run(v); return r.num; } catch (e) { return {ERR:String(e)}; } }); });
    return out; }, {MAP, cases, INFL, ASMC});
  const TP = await p.evaluate(TEC => TEC.map(t => { S = fresh(); applyAssume(); const rate = t.TE_PRSI_Basis === 'Calendar 2026 blend' ? prsiRate(2026) : RI.prsi.path[1].r, st = t.TE_Status, married = /^Married/.test(st);
    const p1 = P0_({emp:t.TE_Gross_1}), p2 = married ? P0_({emp:st === 'Married two earners' ? t.TE_Gross_2 : 0}) : null, h = hhTax(p1, p2, {married, spccc:st === 'Single parent', rent:t.TE_Rent_Credit === 'Yes', carer:t.TE_Home_Carer === 'Yes', rate});
    const T = t.TE_Gross_1 + (p2 ? p2.emp : 0), band = st === 'Single' ? RI.it.band : st === 'Single parent' ? RI.it.bandSPCCC : st === 'Married one earner' ? RI.it.bandMarried : RI.it.bandMarried + Math.min(t.TE_Gross_1, t.TE_Gross_2, RI.it.bandUplift);
    return {TE_Income_Tax:h.it, TE_USC:h.usc, TE_PRSI:h.prsi, TE_Take_Home:T - h.total, TE_Marginal_Rate:T > band ? RI.it.r2 : RI.it.r1}; }), TEC);
  // 4. compare
  const res = [], gres = []; const money = n => /Rate|Return|Fees$|Growth_After|Real_Return|Fall|Spread|Multiple|Gap$/.test(n) && !/Fees_Cost|Gap_Today|Monthly_Gap/.test(n);
  MAP.forEach(([id, sheet, ins, outs]) => cases[id].forEach((c, k) => { const xo = X.rounds[k][sheet], po = PR[id][k]; let bad = [];
    outs.forEach(n => { const xv = xo[n], pv = po[n];
      if (typeof xv === 'number' && typeof pv === 'number'){ const tol = money(n) ? 1e-6 : /Months|Years|Age|Multiple|Plan_Goal_Years/.test(n) && Number.isInteger(xv) ? 0 : 0.5; if (Math.abs(xv - pv) > tol + 1e-9) bad.push(n + ' xlsx ' + (+xv.toFixed(6)) + ' proto ' + (+pv.toFixed(6))); }
      else if (String(xv == null ? '' : xv).replace(/^None$/, '') !== String(pv == null ? '' : pv)) bad.push(n + ' xlsx "' + xv + '" proto "' + pv + '"'); });
    res.push([bad.length ? 'FAIL' : 'PASS', sheet + ' · case ' + (k + 1), bad.join(' | ')]); }));
  { const NOI = 'Choose your inflation rate to see this', GATE = /^(Choose|Add) .* to see this$/;
    GS.forEach(s => { const e = UIMAP.find(x => x.id === s.id), outs = MAP.find(m => m[0] === s.id)[3];
      s.rounds.forEach((rd, g) => { const xo = X.rounds[NR + g][e.sheet], ex = s.exp[g], gates = Object.entries(xo).filter(([n, v]) => typeof v === 'string' && GATE.test(v)), head = xo[outs[0]]; let bad = [];
        if (rd.stdBlank){ outs.forEach(n2 => { const xv = xo[n2], pv = (ex.num || {})[n2]; if (pv === undefined) return; if (typeof xv === 'number' && typeof pv === 'number'){ if (Math.abs(xv - pv) > Math.max(0.5, 1e-6 * Math.abs(pv)) && !(Math.abs(xv - pv) < 1e-6)) bad.push(n2 + ' xlsx ' + xv + ' proto ' + pv); } else if (String(xv == null ? '' : xv).replace(/^None$/, '') !== String(pv == null ? '' : pv)) bad.push(n2 + ' xlsx "' + xv + '" proto "' + pv + '"'); }); if (gates.length) bad.push('gate shown: ' + JSON.stringify(gates.slice(0, 1))); }
        else if (ex.gate) { if (head !== ex.gate) bad.push('headline "' + head + '" app "' + ex.gate + '"'); gates.forEach(([n, v]) => { if (v !== ex.gate) bad.push(n + ' "' + v + '"'); }); }
        else if (ex.infl) { if (!gates.length || gates.some(([n, v]) => v !== NOI)) bad.push('inflation gate: ' + JSON.stringify(gates.slice(0, 2))); }
        else if (gates.length) bad.push('unexpected gate ' + JSON.stringify(gates.slice(0, 2)));
        gres.push([bad.length ? 'FAIL' : 'PASS', e.sheet + ' · gate round ' + (g + 1) + ' (' + (rd.stdBlank ? 'every LifeMap standard blank' : rd.omit.length ? 'blank: ' + rd.omit.join(',') : 'nothing blank') + (rd.infl == null ? ' · no inflation' : '') + ')', bad.join(' | ')]); }); }); }
  gres.forEach(r => console.log('GATE ' + r.join(' | ')));
  TEC.forEach((t, k) => { const xo = X.rounds[k]['Tax engine'], po = TP[k], bad = Object.keys(po).filter(n => Math.abs(xo[n] - po[n]) > (n === 'TE_Marginal_Rate' ? 1e-9 : 0.5)).map(n => n + ' xlsx ' + xo[n] + ' proto ' + (+po[n].toFixed(2)));
    res.push([bad.length ? 'FAIL' : 'PASS', 'Tax engine · ' + t.TE_Status + ' €' + t.TE_Gross_1 + (t.TE_Gross_2 ? ' + €' + t.TE_Gross_2 : '') + (t.TE_Rent_Credit === 'Yes' ? ' · rent' : '') + (t.TE_Home_Carer === 'Yes' ? ' · home carer' : '') + ' · ' + t.TE_PRSI_Basis, bad.join(' | ')]); });
  // constants used by the formulas: workbook vs prototype
  const PC = await p.evaluate(M => { S = fresh(); applyAssume(); return Object.fromEntries(Object.entries(M).map(([k, ex]) => { try { return [k, eval(ex)]; } catch (e) { return [k, 'ERR ' + e]; } })); }, RULEMAP);
  const cst = Object.keys(PC).map(k => { const a = A[k], b2 = PC[k]; const same = Array.isArray(a) ? Array.isArray(b2) && a.every((x, i) => Math.abs(x - b2[i]) < 1e-9) : typeof a === 'number' && Math.abs(a - +b2) < 1e-6; return [same ? 'SAME' : 'DIFF', k, 'xlsx ' + JSON.stringify(a) + ' · proto ' + JSON.stringify(b2)]; });
  res.forEach(r => console.log(r.join(' | ')));
  cst.forEach(r => console.log('CONST ' + r.join(' | ')));
  console.log('Workbook', new Date(X.mtime * 1000).toISOString(), '· recalc ' + Math.round((Date.now() - t0) / 1000) + ' s');
  console.log('FAILS', res.filter(r => r[0] === 'FAIL').length, 'of', res.length, '· GATE FAILS', gres.filter(r => r[0] === 'FAIL').length, 'of', gres.length, '· CONST DIFF', cst.filter(r => r[0] === 'DIFF').length); console.log('ERRORS', errs.length, JSON.stringify(errs)); await b.close();
})();
