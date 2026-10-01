# Financial Planner review, round 1: scoring, risk profile, cashflow, wording

Reviewer: Financial Planner (QFA / CFP, Ireland), Agent 2 · For: designer (Agent 1), developer (Agent 3), PM · Date: 29 Sep 2026
Reviewed: a snapshot of `LifeGoals-Customer-Journey-Prototype.html`, copied on 29 Sep 2026 (the live file is being edited in parallel and was **not** changed). Compared against `Lifecast User Jouney Prototype.html` (`DISC`, `discoverResult()`), `LifeGoals-Discover-Questions-Preview.html` (`resultHTML()`), xlsx sheet "Step 1. Discovery" (K12–M17), `docs/journey-spec.md` §2, §3, §10, §11.
All proposed code was run in Node against a mocked `S`, using 12 personas and every combination of the 4,096 answer patterns. The Discover question wording is unchanged throughout.

Verdict key: **OK** = keep · **CHANGE** = replace as shown. Priority: **M** = must change before a customer test · **S** = should · **N** = nice to have.

---

## A. Must change before a customer test

1. **Risk profile ignores composure and averages away capacity for loss** (R2, R3). Today "Stormy + *Sell before it drops more*" with strong finances comes out as **Growth**, and "Stormy + hold, but *I'd have to cut back on essentials*" comes out as **Balanced–growth**. Replace `riskRead()` with the §2 code.
2. **Horizon cap bug** (R5). The 2–5-year cap (2.4) falls inside the "Balanced" band (2.1–2.7), so it doesn't cap anything. The §2 code fixes this.
3. **The "first read" risk label from 7 answers** is shown on My Plan, in Ask and in the toast without any capacity-for-loss or knowledge answers. It can read "Growth". Hold it at **Balanced or below** and label it "First read" (R7).
4. **Skipped answers are silently set to 2** (`dsc('8') || 2` and so on). This makes up a profile. Show nothing for a dimension that wasn't answered (R1).
5. **Personality is really a one-question result.** Q2 weights (2) always beat Q4 (1), so today's type is just the Q2 answer. Use the 6-question weights in §1 (P1).
6. **State Pension is €15,044** (the 2025 rate). The 2026 rate is **€299.30 a week = €15,564 a year**. Change `AS.sp` and the 3 hard-coded strings (lines ~1007, ~1035, ~1061). Better, build those strings from `AS.sp` (C4).
7. **Fiscal drag.** `netPay(f.income * wgw)` uses fixed 2026 bands on nominal pay for 60 years. At €45k today, take-home in year 30 is understated by about **€6,600 a year in today's money**. Tax the income in today's money and multiply back (C6).
8. **The pension contribution cost `0.3 × pensionM`** is only right for a 40% taxpayer with a 50/50 employer split. A self-employed person on €45k is understated by about **€2,000 a year**. Use `pensionCost()` (C7).
9. **Drawdown is taxed at a flat 10% and there is no tax-free lump sum.** €40k drawdown + State Pension at 67 is overstated by about **€5,900 a year**. Use `netRet()` and the 25% lump sum (C8, C9).
10. **Advice-leaning copy**: "closes it", "into your pension", "could suit you better", "Safety first … come before investing", "ready for a growth conversation" at D10, and "This never changes what you pay". Replace as in §4 (W1–W7).

---

## B. Findings table

| # | Item | Verdict | Exact proposed change | Source |
|---|---|---|---|---|
| **P1** | `personality()` uses only Q2 + Q4, and Q2 always wins | **CHANGE (M)** | Replace with `PW` weights + `personality()` in §1. It uses Q2, Q4, Q7, Q8, Q9, Q12 and (when answered) u4. Q2 stays the anchor (weight 2). Other answers override it only when they agree strongly: 8.7% of all answer patterns. | Lifecast `DISC` weights; xlsx S1 A9–A10 (section A = personality from several answers) |
| P2 | Minimum answers | **OK, with one guard (M)** | Keep D10's "5 of 7". Also, `personality()` returns `null` if fewer than 4 of the 6 weighted questions are answered. 5 of 7 answered always means at least 4 weighted ones, because only Q6 carries no weight. Callers must handle `null` (D10, Me hub, report §7 are already guarded by `discEnough()`). | CJ E10 (no result from no answers); PM review #5 |
| P3 | Tie-break | **CHANGE (M)** | Ties go to Q2's type → else Q4's single type → else the fixed order **Balancer > Achiever > Contented > Explorer**. The last is the most neutral; Explorer comes last so a tie never labels someone as risk-comfortable. | Prudence; ESMA consistency |
| P4 | Q6 and u9–u13 in personality | **OK: excluded on purpose** | How much you can afford, time horizon, knowledge and sustainability aren't personality. Using them would label higher earners "Achiever". | xlsx D4 ("dimensions stay separate") |
| **R1** | `riskRead()` defaults skipped answers to 2 | **CHANGE (M)** | No defaults. If Q8 or Q9 is missing, return `label:null` and show "Not answered yet". The Cushion tile shows "—" if Q7 is missing. | CJ E10; PM #5 |
| **R2** | Composure (Q9) isn't in the label | **CHANGE (M)** | Willingness `T = Q8 (+1 if Q9 = Buy more and Q8 ≥ 3)`, then capped by composure: Sell → max 2, Wait-then-sell → max 3. | xlsx K13/M13 "route to a calmer plan than they picked"; ESMA GL 2022: risk tolerance covers attitudes **and** behaviour, not self-assessment alone |
| **R3** | Capacity = **average** of Q6, Q7, u10, u12 | **CHANGE (M)** | Use the weakest link, `C = min(caps)`: Q7 other savings → 3, credit/not sure → 2; u10 essentials → 2, change plans or not sure → 3; u12 uncertain → 2, varies → 4; cash under 3 months of costs (only once cash + costs are entered) → 3. Q6 is **investment capacity** (how much), not ability to bear loss, so it's shown but doesn't set the level. | Delegated Reg 2017/565 Art. 54(2)(b), 54(5) ("able financially to bear any related investment risks"); CPC 2025 suitability "financially able to bear any risks"; ESMA 2020 CSA: firms wrongly let risk tolerance stand in for capacity for loss |
| R4 | Profile = min(want, can) | **OK in principle, extend (M)** | Profile level `L = min(T, C, H, KE)`, and record which one set it (`limit`) so the card can say "Set by: how long you can wait". | Spec §3 rule; ESMA GL: if information conflicts, take the more prudent view |
| **R5** | Horizon caps (1.5 / 2.4; 5–10 years uncapped) | **CHANGE (M)** | `H = [1, 2, 4, 5][u9]`: under 2 years → Cautious; 2–5 → Cautious–balanced; 5–10 → Balanced–growth; 10+ → no cap. (Today 2.4 → "Balanced" = no cap.) | ESMA GL: investment horizon is part of objectives; industry norm that money needed within 5 years shouldn't carry equity-level falls |
| **R6** | Knowledge & experience (u11) ignored | **CHANGE (M)** | Cap: None → 3 (Balanced), Basics → 4, Fairly/Very → no cap. Self-assessment check: if "Fairly/Very" but the only product chips are "None"/"Savings account" → cap at 4 and flag for the adviser. Show a short line when K&E set the level (§2). This is a **prudent design choice** for an unadvised tool, not a CPC rule. The adviser does the full K&E / appropriateness check. | MiFID II Art. 25(2), Art. 55 Delegated Reg; ESMA GL "do not unduly rely on self-assessment" |
| **R7** | First read (7 answers) shows a full 5-level label | **CHANGE (M)** | Provisional read: C uses Q7 only, H is the timeline suggestion, **KE fixed at 3**, so it is never above Balanced. Label it "First read · finish your profile to confirm" on the My Plan banner, in Ask (`prisk`) and in the report. D10 shows **no** 5-level label, only Risk comfort + Cushion. | Spec §2 D10; ESMA GL on robo tools: be clear about limits |
| R8 | Scale 1–5 or 1–7 | **Keep 5 named levels, no number shown to the customer** | 1–7 is the PRIIPs **product** SRI. Showing 1–7 invites "pick an SRI-4 fund", which is a step towards product selection. The adviser handoff carries "Indicative level 3 of 5 (LifeGoals discovery, not a suitability assessment)". The adviser firm maps it to its own tool. | PRIIPs Reg 1286/2014 (SRI 1–7); spec §3 labels |
| R9 | "Risk comfort" tile uses profile words ("Cautious", "Balanced–growth") | **CHANGE (M)** | `COMFORT = ['Steady','Mostly steady','Balanced','Adventurous']` from Q8 only, so it can't be confused with the profile. Cushion: `Strong` (emergency savings) / `Thin` (anything else), as the PM asked. | PM review #4 |
| **R10** | Mismatch rules and priority | **CHANGE (M)** | One line, safety first: K16 → K14 → K13 → K15 → K17 → "broadly in line". At D10, K17 never fires (no horizon or K&E yet). K17 also needs u11 ≥ Basics. Mapping table in §2. | xlsx K13–M17 |
| R11 | Sustainability (u13) | **OK as a screener; add handoff (S)** | Keep it out of every score (correct today). Keep it last (it is). Send it to the adviser as "Sustainability interest: *answer*, detailed preferences to be collected". The adviser must collect the Art. 2(7) categories (taxonomy %, SFDR sustainable %, PAIs). Treat "No strong preference" and "Not sure" as neutral, with no nudge. | Delegated Reg 2021/1253; ESMA GL 2022 (ask after the other suitability information; no pre-selection); CPC 2025 |
| R12 | Decision style (u4) | **OK: not in the risk score** | Use it for personality (small weight, §1), adviser matching and tone ("Keep it simple" → plain-language adviser note). | MASTER G12 |
| R13 | Horizon suggestion `suggestU9()` | **CHANGE (S)** | Prefer a "Grow my wealth" (`kind:'pot'`) goal more than 2 years away if there is one. Otherwise use the first goal more than 2 years away with nothing saved. Otherwise use retirement **+10 years**, because pension money is drawn over decades, not on the retirement date. Keep the "Suggested from your timeline — confirm or change" pill. | ESMA GL (horizon per objective) |
| R14 | Me profile bars | **CHANGE (M, follows R2)** | Bars now run 1–5: `Math.round(v / 5 * 100)`, not `/ 4`. Add a 4th small line "Experience" only when it set the level. | — |
| R15 | Adviser-only consistency flags | **ADD (S)** | Put `r.adv` (xlsx column M) plus these flags in the shared profile, never in customer copy: Q7 "emergency savings" but cash < 1 month of costs · Q6 "Over €750" but income − costs < €750 a month · u11 "Very experienced" + chips None/Savings only · u9 answer ≠ timeline suggestion · Q4 "Buy in quickly" with T ≥ 4. | ESMA GL (reliability and consistency of client information) |
| **C1** | Inflation 2% | **CHANGE (S)** | `infl: 0.025`. CBI June 2026 forecast: 3.5% (2026), 2.9% (2027). 2% is the ECB target, but a long-run 2.5% is more prudent after the energy shock. | CBI QB June 2026 |
| C2 | Wage growth 2.5% | **CHANGE (S)** | `wage: 0.03` (keeps real pay growth at 0.5%). CBI expects about 4% nominal in 2026. | CBI QB June 2026 |
| **C3** | Returns 4.5% for pensions **and** investments, cash 1% | **CHANGE (S)** | `pen: 0.04` (gross roll-up is tax-free inside a pension; after about 1% charges), `penRet: 0.028` (retired, lower risk), `inv: 0.03` (after charges **and 38% exit tax** / 33% CGT), `cash: 0.007` (1% less 33% DIRT). Assumptions copy: "after typical charges and tax". Add "Investments can fall as well as rise." | Budget 2026 (exit tax 41% → 38% from 1 Jan 2026; DIRT 33%) |
| **C4** | State Pension €15,044 from 66 | **CHANGE (M)** | `sp: 15564` (€299.30 × 52, maximum personal rate, 2026). Age 66 is correct. Replace the 3 hard-coded "€15,044" strings with `eur(AS.sp)`. `f.sp` factors (Full 1 / Partly 0.6 / Not sure 0.8) are OK. | gov.ie SPC; Budget 2026 (+€10 a week) |
| C5 | Income tax / USC / PRSI in `netPay()` | **CHANGE (M, with C6)** | Income tax: bands €44,000 at 20%, credits €4,000 (**correct**, unchanged for 2026). **USC is wrong**: a flat 4% on all pay. Use 0.5% to €12,012 · 2% to €28,700 · 3% to €70,044 · 8% above, exempt ≤ €13,000. **PRSI**: 4.2% until 30 Sep 2026, **4.35% from 1 Oct 2026** (use 4.35%), nil ≤ €352 a week, plus the PRSI credit. Error today: +€480 to +€980 a year too much tax at €15k–€60k. Code in §3. | Revenue USC 2026; Budget 2026; payroll summaries |
| **C6** | Fixed tax bands on nominal future pay | **CHANGE (M)** | Tax in today's money: `netPay(g / infl) * infl`. This assumes bands and credits keep pace with prices. Same for partner pay and `pensionCost`. | Standard planning practice (bands assumed indexed) |
| **C7** | `- 0.3 * pensionM * 12` (field includes employer money) | **CHANGE (M)** | Own share E = 50% of "Paid in each month" if Employed, 100% if Self-employed. Net cost = `E − (incomeTax(g) − incomeTax(g − E_relieved))`, with the age limits (15%–40%) and the €115,000 earnings cap. Relief is income tax only (not USC/PRSI). €45k employed: €1,350 → €1,600; €45k self-employed: €1,350 → €3,400. Optional (N): split the field into "You pay" / "Your employer pays". Hint: "Include My Future Fund (auto-enrolment) if you're in it". | Revenue pension relief limits; auto-enrolment live since 1 Jan 2026 |
| **C8** | Drawdown `draw * 0.9`, State Pension untaxed | **CHANGE (M)** | `netRet(draw, sp, age)`: income tax with age credit €245 and age exemption €18,000 (65+); **no PRSI at 66+**; State Pension exempt from USC; reduced USC from 70 if income ≤ €60,000. The even spread `pen / (90 − a + 1)` is **OK**: it is at or above the ARF imputed 4% (61–70) and 5% (71+). | Revenue USC reduced rates; ARF imputed distribution rules |
| **C9** | No retirement lump sum | **CHANGE (S)** | At the retirement year: `ls = min(25% of pot, €200,000)` moves to cash tax-free (the limit is not indexed). Notes (N): benefits normally can't be drawn before 60 (PRSA/RAC/AE) or 50 (occupational, after leaving). Warn if the retirement flag is under 60. | Revenue lump-sum limits |
| C10 | Surplus split 60% cash / 40% invested; what-if money earmarked at a hard-coded 2% | **CHANGE (S)** | Say it in Assumptions: "Spare money each year is assumed saved: 60% cash, 40% invested." Use `AS.cash` instead of `1.02`. The split must **not** depend on the risk profile (it doesn't today, which keeps us product-neutral). | Transparency, MASTER E9 |
| C11 | Mortgage 3.8%, other debt 9%, plan end 90 | **OK** | In line with 2026 Irish new-lending and personal-loan rates. 90 is a reasonable planning age (N: offer 95 for couples). | — |
| C12 | `band()` 95 / 70 and `extraFor()` target 95% | **OK** | These are deterministic central estimates. N: later, add a "low-growth" check (returns −2%) to the Assumptions sheet. | Spec §6 |
| **W1–W8** | Customer wording | **CHANGE** | See §4. | CPC 2025; MiFID personal recommendation (Art. 9 Delegated Reg 2017/565) |

---
## 1. Money personality: scoring from 7 answers (+ u4)

### Why change
With Q1 and Q3 gone, `personality()` adds Q2 (2 points) and Q4 (1 point), so **Q2 always wins** and the type is a one-question result. Q12 "I avoid thinking about it", Q9 "Buy more while it's cheaper" and Q8 "Stormy" are strong personality signals that are thrown away today.

### Weights (points per option, in option order; 0.5 steps)

| Question | Opt 1 | Opt 2 | Opt 3 | Opt 4 |
|---|---|---|---|---|
| Q2 Your friends would say you're always… | Budget → **A 2** | Checking balance → **B 2** | Something new → **E 2** | Relaxed → **C 2** |
| Q4 A friend's investment doubled… | Buy in quickly → E 1 | Research → A 1 | Ask an expert → B 1 | Stay away → B 0.5, C 0.5 |
| Q7 A €1,000 bill arrives… | Emergency savings → A 0.5 | Other savings → — | Credit/loan → — | Not sure → C 0.5 |
| Q8 Pick a forecast… | Calm → B 0.5, C 0.5 | Mostly sunny → A 0.5, B 0.5 | Sun and showers → A 0.5, E 0.5 | Stormy → E 1 |
| Q9 €10,000 drops to €8,500… | Sell → B 1 | Wait until €10,000, then sell → B 0.5 | Stay calm → A 0.5, C 0.5 | Buy more → E 1 |
| Q12 How do you feel about your financial future? | Worried → B 1 | Hopeful → E 0.5 | Confident → A 1 | Avoid thinking → C 1 |
| u4 (Understand Me, when answered) | Research myself → A 0.5, E 0.5 | Basics, then expert → A 0.5, B 0.5 | Expert first → B 1 | Keep it simple → C 1 |
| Q6, u9–u13 | no weight (affordability, horizon, knowledge and values aren't personality) ||||

Maximum possible: A 6.0 · B 6.5 · E 6.0 · C 6.0. Across all 4,096 patterns of the 6 Discover questions: Achiever 25% · Balancer 28% · Explorer 25% · Contented 23%. Q2 is overridden in 8.7% of patterns, only when 3 or more other answers agree against it.

### Rules
1. Sum the points. **Top score wins.**
2. **Tie:** Q2's type if it's in the tie → else Q4's type if Q4 gave a single type in the tie → else **Balancer > Achiever > Contented > Explorer**.
3. **Minimum:** at least **4 of the 6 weighted Discover questions** (Q2, Q4, Q7, Q8, Q9, Q12). Otherwise return `null` and show no type. D10 keeps its "5 of 7" gate, which always meets this.
4. Understand Me: only u4 adds points. The type can move after u4, which is fine: the Me card says "Updated with your latest answers".
5. Optional (N): "With a streak of *second type*" when the runner-up is within 1 point. This is the old Lifecast/Preview behaviour.

### Paste-ready code (replaces `personality()`; the `w:{}` on Q2/Q4 options become unused)
```js
// Personality weights per option, in option order. 0.5 steps. Q6 (amount) and u9-u13 carry no personality weight.
const PW = {
  '2':  [{A:2}, {B:2}, {E:2}, {C:2}],                       // Sticking to a budget · Checking your balance · Trying something new · Relaxed about money
  '4':  [{E:1}, {A:1}, {B:1}, {B:.5, C:.5}],                // Buy in quickly · Research it · Ask an expert · Stay away
  '7':  [{A:.5}, {}, {}, {C:.5}],                           // Emergency savings · Other savings · Credit/loan · Not sure
  '8':  [{B:.5, C:.5}, {A:.5, B:.5}, {A:.5, E:.5}, {E:1}],  // Calm · Mostly sunny · Sunshine and showers · Stormy
  '9':  [{B:1}, {B:.5}, {A:.5, C:.5}, {E:1}],               // Sell · Wait until back, then sell · Stay calm · Buy more
  '12': [{B:1}, {E:.5}, {A:1}, {C:1}],                      // Worried · Hopeful · Confident · Avoid thinking about it
  u4:   [{A:.5, E:.5}, {A:.5, B:.5}, {B:1}, {C:1}]          // Research myself · Basics then expert · Expert first · Keep it simple
};
const P_ORDER = ['B', 'A', 'C', 'E'];
function personalityScores(){
  const t = {A:0, B:0, E:0, C:0}; let n = 0;
  const add = w => Object.entries(w).forEach(([x, v]) => { t[x] += v; });
  ['2', '4', '7', '8', '9', '12'].forEach(id => { const k = S.ans[id]; if (typeof k === 'number'){ n++; add(PW[id][k]); } });
  if (typeof S.um.a.u4 === 'number') add(PW.u4[S.um.a.u4]);
  return {t, n};
}
function personality(){
  const {t, n} = personalityScores();
  if (n < 4) return null;                                   // never guess a type (CJ E10)
  const top = Math.max(...Object.values(t)), tied = Object.keys(t).filter(x => t[x] === top);
  const from = id => typeof S.ans[id] === 'number' ? Object.keys(PW[id][S.ans[id]]).filter(x => tied.includes(x)) : [];
  const q4 = from('4');
  const k = tied.length === 1 ? tied[0] : (from('2')[0] || (q4.length === 1 ? q4[0] : null) || P_ORDER.find(x => tied.includes(x)));
  return TYPES[k];
}
```

### Persona check (proposed personality + risk rules; generated by running the code above)
"First read" = 7 Discover answers + horizon (10+ years assumed here; in the product it's suggested from the timeline). "Full" = all 13 answered. W/C/H/KE = willingness / capacity / horizon cap / knowledge cap (1–5). Hint keys are the xlsx rows (§2).

| # | Persona | Key answers | **Today**: type · first read · full | **Proposed** type | D10: comfort · cushion · hint | Proposed first read | Proposed full: W/C/H/KE → label (set by) · hint | Sensible? |
|---|---|---|---|---|---|---|---|---|
| 1 | Anxious starter, 26, renting | Q2 Balance · Q4 Stay away · Q6 <€100 · Q7 Not sure · Q8 Calm · Q9 Sell · Q12 Worried; u9 <2y · u10 Cut essentials · u11 None · u12 Varies | Balancer · Cautious · Cautious | **Balancer** | Steady · Thin · K16 | Cautious | 1/2/1/3 → **Cautious** (want) · K16 | Yes: safety net first |
| 2 | Disciplined saver, 42 | Q2 Budget · Q4 Research · Q6 €300–750 · Q7 Emergency · Q8 Mostly sunny · Q9 Hold · Q12 Confident; u10 Change plans · u11 Basics · u12 Very | Achiever · C–bal · C–bal | **Achiever** | Mostly steady · Strong · K15 | Cautious–balanced | 2/3/5/4 → **Cautious–balanced** (want) · in line | Yes. K15 drops once u10 shows a fall would change plans |
| 3 | FOMO enthusiast, 29 | Q2 New · Q4 Buy fast · Q7 Credit · Q8 Stormy · Q9 Sell · Q12 Hopeful; u9 5–10y · u10 Change plans · u12 Varies | Explorer · Cautious · C–bal | **Explorer** | Adventurous · Thin · K14 cushion | Cautious–balanced | 2/2/4/4 → **Cautious–balanced** (want) · K14 cushion | Yes. Adviser also sees K13 (sells in a fall) |
| 4 | Seasoned investor, 51 | Q2 Balance · Q4 Research · Q6 >€750 · Q7 Emergency · Q8 Stormy · Q9 Buy more · Q12 Confident; u10 Fine · u11 Very · u12 Very | Balancer · **Growth** · Growth | **Achiever** (A 2.5 v B 2) | Adventurous · Strong · in line | **Balanced** (held until profile done) | 5/5/5/5 → **Growth** · K17 | Yes. The type moves off Q2 because 3 answers point to "in control"; defensible |
| 5 | Relaxed, avoids money, 45 | Q2 Relaxed · Q4 Stay away · Q7 Other savings · Q8 Mostly sunny · Q9 Wait-then-sell · Q12 Avoid; u10 Not sure · u11 None | Contented · C–bal · C–bal | **Contented** | Mostly steady · Thin · K16 | Cautious–balanced | 2/3/5/3 → **Cautious–balanced** (want) · in line | Yes |
| 6 | Vigilant checker, 58 | Q2 Balance · Q4 Expert · Q7 Emergency · Q8 Calm · Q9 Wait-then-sell · Q12 Worried; u9 5–10y · u10 Fine | Balancer · Cautious · Cautious | **Balancer** | Steady · Strong · K15 | Cautious | 1/5/4/4 → **Cautious** (want) · K15 | Yes: respect the preference, show the cost of over-caution |
| 7 | Keen, thin cushion, 33 | Q2 New · Q4 Research · Q7 Credit · Q8 Stormy · Q9 Buy more; u10 Change plans · u11 Fairly | Explorer · Cautious · C–bal | **Explorer** | Adventurous · Thin · K14 cushion | Cautious–balanced | 5/2/5/5 → **Cautious–balanced** (can) · K14 cushion | Yes: the classic xlsx K14 case |
| 8 | Budgeter, home in 3 yrs, 31 | Q2 Budget · Q4 Research · Q7 Emergency · Q8 Showers · Q9 Hold; u9 2–5y · u11 Basics | Achiever · Bal–growth · **Balanced** (cap bug) | **Achiever** | Balanced · Strong · in line | Balanced | 3/3/2/4 → **Cautious–balanced** (time) · K14 time | Yes: the horizon now actually caps |
| 9 | Wealthy but cautious, 60 | Q2 Balance · Q4 Stay away · Q6 >€750 · Q7 Emergency · Q8 Calm · Q9 Hold; u10 Fine · u11 Fairly | Balancer · Cautious · Cautious | **Balancer** | Steady · Strong · K15 | Cautious | 1/5/5/5 → **Cautious** (want) · K15 | Yes |
| 10 | Novice, calm, 30 yrs to go, 35 | Q2 Budget · Q4 Expert · Q7 Emergency · Q8 Showers · Q9 Buy more; u10 Fine · u11 **None** | Achiever · Bal–growth · Bal–growth | **Achiever** | Balanced · Strong · in line | Balanced | 4/5/5/3 → **Balanced** (experience) · in line + K&E line | Yes: held at Balanced until an adviser explains |
| 11 | Self-employed, skips Q2, 40 | Q4 Buy fast · Q6 Varies · Q7 Other savings · Q8 Stormy · Q9 Buy more · Q12 Hopeful; u10 Change plans · u12 Varies | Explorer (from Q4 alone) · C–bal · C–bal | **Explorer** (E 3.5) | Adventurous · Thin · K14 cushion | Balanced | 5/3/5/5 → **Balanced** (can) · K14 cushion | Yes |
| 12 | Answers only Q6–Q9 | 4 of 7 | Balancer from 0 points (blocked at D10, but shows in the report and Me if reached another way) | **none** (`null`) | D10 blocked (4 of 7) | — (needs 5 of 7) | — | Yes: no made-up type |

Stress cases (today → proposed): Stormy + **Sell**, strong finances: **Growth → Cautious–balanced**. Stormy + hold, but "cut back on essentials": **Balanced–growth → Cautious–balanced**.

---

## 2. Risk profile rules

### Regulatory frame (short)
- **MiFID II suitability** (Art. 25(2); Delegated Reg 2017/565 Art. 54–55; ESMA Guidelines 2022, ESMA35-43-3172, applied from Oct 2023) requires firms to assess knowledge & experience, financial situation **including ability to bear losses**, and objectives **including risk tolerance** and horizon, then sustainability preferences, asked **after** the other elements. Firms must check the information is reliable and consistent, and must not **unduly rely on self-assessment**. ESMA's 2020 supervisory review found firms letting risk tolerance stand in for capacity for loss.
- **CBI Consumer Protection Code 2025** (in force 24 Mar 2026) sets "knowing the consumer" (needs, objectives, circumstances, financial situation, attitude to risk) and suitability ("financially able to bear any risks", "consistent with attitude to risk"). It also brings in the digitalisation rules (no pre-selected choices).
- LifeGoals **does not make a personal recommendation**. The profile is a discovery aid that feeds the adviser's own suitability process. That is why every output below is "indicative", product-free and adviser-confirmed (S1 K22).

### The rules

```
T  (willingness)   = Q8 score (1–4), +1 if Q9 = "Buy more" and Q8 ≥ 3            → 1–5
                     then cap: Q9 "Sell" → ≤ 2 ; Q9 "Wait until €10,000, then sell" → ≤ 3
C  (capacity for loss, weakest link) = 5, then cap:
                     Q7 "Other savings" → 3 ; "Credit card or a loan" / "Not sure" → 2
                     u10 "Cut back on essentials" → 2 ; "Change some plans" / "Not sure" → 3
                     u12 "Uncertain right now" → 2 ; "Varies month to month" → 4
                     Finances entered and cash < 3 × monthly costs → 3
H  (horizon cap)   = u9 (or the timeline suggestion): <2y → 1 · 2–5y → 2 · 5–10y → 4 · 10+ → 5
KE (knowledge cap) = u11: None → 3 · Basics → 4 · Fairly / Very → 5
                     (Fairly/Very but chips only "None"/"Savings account" → 4 + adviser flag)
                     First read (Understand Me not done): KE = 3
Level L = min(T, C, H, KE) → Cautious · Cautious–balanced · Balanced · Balanced–growth · Growth
"Set by" = the dimension equal to L (order: want, can, time, experience)
Q6 (monthly amount) = investment capacity: shown and passed to the adviser, never sets the level.
u4, u13 = never in the score.
```

**Scale:** 5 named levels, no number for the customer (R8). The adviser handoff says "level L of 5".

### Mismatch messages (one line, first match wins) mapped to xlsx K13–M17

| Order | Key | Condition (Q8/Q9/Q7 are scores 1–4) | xlsx row | Customer line (guidance wording) | Adviser note (xlsx col M, never shown to the customer) |
|---|---|---|---|---|---|
| 1 | K16 | Q8 ≤ 2 **and** Q9 ≤ 2 **and** capLo | K16 "Low across the board" | A safety net often comes first: an emergency fund and the right cover. It is a good place to start with an adviser. | Protection and emergency fund first; investing conversation comes later. |
| 2 | K14 | Q8 ≥ 3 **and** capLo (cushion thin **or** C ≤ 2 **or** H ≤ 2) | K14 "Wants risk, low capacity" | *Cushion:* You're open to ups and downs, but your cushion is thin. Many people build a safety net before taking more risk. · *Loss:* …but a fall would hit everyday life right now. Many people build a safety net before taking more risk. · *Time:* …but you'll need this money within 5 years. Money needed soon has less time to recover from a fall. | Build the safety net first; explain why risk waits, not that they are wrong. |
| 3 | K13 | Q8 ≥ 3 **and** Q9 ≤ 2 | K13 "Wants risk, low composure" | You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser. | Route to a calmer plan than they picked; flag for a call if markets fall. |
| 4 | K15 | Q8 ≤ 2 **and** capHi | K15 "Low appetite, high capacity" | Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise. | Respect the preference; gently show what over-caution costs over time. |
| 5 | K17 | **Full profile only**: Q8 ≥ 3, Q9 ≥ 3, capHi, u11 ≥ Basics | K17 "High across the board" | You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser. | Ready for a growth conversation; route to the investment expert. |
| 6 | OK | none of the above | K10 | How you feel about risk and what you can afford are broadly in line. A good starting point. | — |

`capLo` = Q7 ≤ 2 (thin cushion), or in the full profile C ≤ 2 or H ≤ 2. `capHi` = full profile: C ≥ 4 **and** H ≥ 4; D10 (Discover only): Q7 = emergency savings **and** Q6 ≥ €300. When K&E set the level, add: "Investing is new to you, so this stays at Balanced for now. An adviser can explain how investments rise and fall."

### Paste-ready code (replaces `riskRead()`; returns the same field names the screens use, plus `level`, `limit`, `misKey`, `adv`, `keNote`, `provisional`)
Screen changes that go with it: D10 tiles use `r.comfort` / `r.cushion` (show "—" when `null`); the Me bars use `/ 5`; the My Plan banner, Ask `prisk` and the toast say "First read" when `r.provisional`; show nothing when `r.label === null`.

```js
const RISK_LBL = ['Cautious', 'Cautious–balanced', 'Balanced', 'Balanced–growth', 'Growth'];
const COMFORT = ['Steady', 'Mostly steady', 'Balanced', 'Adventurous'];   // D10 tile: Q8 appetite only, deliberately not the 5 profile labels
const MIS = {
  K16:  'A safety net often comes first: an emergency fund and the right cover. It is a good place to start with an adviser.',
  K14c: "You're open to ups and downs, but your cushion is thin. Many people build a safety net before taking more risk.",
  K14l: "You're open to ups and downs, but a fall would hit everyday life right now. Many people build a safety net before taking more risk.",
  K14t: "You're open to ups and downs, but you'll need this money within 5 years. Money needed soon has less time to recover from a fall.",
  K13:  'You like the idea of growth, but falls may unsettle you. A calmer approach might feel more comfortable. Worth talking through with an adviser.',
  K15:  "Your finances could handle more ups and downs than you'd choose. That's fine. It's worth seeing what playing very safe can cost as prices rise.",
  K17:  "You're comfortable with ups and downs, you can afford them and you have time. A good basis for a growth conversation with an adviser.",
  OK:   'How you feel about risk and what you can afford are broadly in line. A good starting point.'
};
const MIS_ADV = {   // adviser-only (xlsx column M). Never shown to the customer.
  K13: 'Route to a calmer plan than they picked; flag for a call if markets fall.',
  K14c: 'Build the safety net first; explain why risk waits, not that they are wrong.', K14l: 'Build the safety net first; explain why risk waits, not that they are wrong.', K14t: 'Short horizon: explain why risk waits.',
  K15: 'Respect the preference; gently show what over-caution costs over time.',
  K16: 'Protection and emergency fund first; investing conversation comes later.',
  K17: 'Ready for a growth conversation; route to the investment expert.'
};
function riskRead(full){
  const q6 = dsc('6'), q7 = dsc('7'), q8 = dsc('8'), q9 = dsc('9');
  const ix = u => typeof S.um.a[u] === 'number' ? S.um.a[u] : null;           // option index, not score
  const u9 = ix('u9') != null ? ix('u9') : suggestU9(), u10 = ix('u10'), u11 = ix('u11'), u12 = ix('u12');
  const r = {comfort: q8 ? COMFORT[q8 - 1] : null, cushion: q7 == null ? null : q7 === 4 ? 'Strong' : 'Thin',
             want:null, can:null, time:null, level:null, label:null, limit:null, provisional:!full, mis:null, misKey:null, adv:null, keNote:false};
  if (q8 == null || q9 == null) return r;                                   // no made-up profile
  // 1. Willingness (attitude to risk): appetite (Q8), composure (Q9) pulls it down one or more steps (xlsx K13)
  let T = q8 + (q9 === 4 && q8 >= 3 ? 1 : 0);
  T = Math.min(T, q9 === 1 ? 2 : q9 === 2 ? 3 : 5);
  // 2. Capacity for loss: weakest link wins
  let C = 5; const cap = v => { C = Math.min(C, v); };
  if (q7 === 2) cap(3); if (q7 === 1) cap(2);                               // other savings / credit or not sure
  if (full){ if (u10 === 0) cap(2); if (u10 === 1 || u10 === 3) cap(3); if (u12 === 0) cap(2); if (u12 === 1) cap(4); }
  if (S.src.cash && S.src.costsM){ const f = finNums(); if (f.costsM > 0 && f.cash < 3 * f.costsM) cap(3); }   // < 3 months' costs in cash
  // 3. Time horizon cap
  const H = [1, 2, 4, 5][u9];
  // 4. Knowledge & experience cap (provisional read is held at Balanced until u10 + u11 are answered)
  let KE = !full || u11 == null ? 3 : [3, 4, 5, 5][u11];
  const ch = S.um.chips || [];                                              // ESMA: don't rely on self-assessment alone
  if (full && u11 >= 2 && ch.length && ch.every(c => c === 'None' || c === 'Savings account')) KE = Math.min(KE, 4);
  const L = Math.min(T, C, H, KE);
  r.want = T; r.can = C; r.time = H; r.level = L; r.label = RISK_LBL[L - 1];
  r.limit = L === T ? 'want' : L === C ? 'can' : L === H ? 'time' : 'experience';
  r.keNote = full && L === KE && KE < Math.min(T, C, H);
  // Mismatch (xlsx K13–K17), one line, safety first
  const wantHi = q8 >= 3, wantLo = q8 <= 2, compHi = q9 >= 3, compLo = q9 <= 2, thin = q7 != null && q7 <= 2;
  const shortT = full && H <= 2, lossLo = full && C <= 2;
  const capLo = thin || lossLo || shortT, capHi = full ? (C >= 4 && H >= 4) : (q7 === 4 && q6 != null && q6 >= 3);
  const k = wantLo && compLo && capLo ? 'K16'
    : wantHi && capLo ? (thin ? 'K14c' : lossLo ? 'K14l' : 'K14t')
    : wantHi && compLo ? 'K13'
    : wantLo && capHi ? 'K15'
    : full && wantHi && compHi && capHi && u11 != null && u11 >= 1 ? 'K17' : 'OK';
  r.misKey = k; r.mis = MIS[k]; r.adv = MIS_ADV[k] || null;
  return r;
}
```

Optional `suggestU9()` (R13, S):
```js
function suggestU9(){
  const a0 = S.about.age, yrs = g => g.age - a0;
  const pot = S.goals.filter(g => g.kind === 'pot' && yrs(g) > 2).sort((a, b) => a.age - b.age)[0];
  const g = pot || S.goals.filter(x => x.kind !== 'retire' && yrs(x) > 2 && !(x.saved > 0)).sort((a, b) => a.age - b.age)[0];
  const y = g ? yrs(g) : (S.retireAge - a0 + 10);           // pension money is used over decades after retiring
  return y <= 2 ? 0 : y <= 5 ? 1 : y <= 10 ? 2 : 3;
}
```

---

## 3. Cashflow assumptions (Ireland 2026)

### Checked values

| Assumption | Today | Proposed | Why |
|---|---|---|---|
| Inflation | 2.0% | **2.5%** (S) | CBI June 2026: 3.5% (2026), 2.9% (2027) |
| Pay rises | 2.5% | **3.0%** (S) | Keeps real growth at 0.5%; CBI expects about 4% in 2026 |
| Cash | 1.0% | **0.7%** (S) | After 33% DIRT |
| Investments | 4.5% | **3.0%** (S) | After about 1% charges and 38% exit tax (Budget 2026) |
| Pensions (working / retired) | 4.5% / 3.15% | **4.0% / 2.8%** (S) | Tax-free roll-up, after about 1% charges |
| State Pension | €15,044 from 66 | **€15,564 from 66** (M) | €299.30 × 52 (2026 maximum personal rate). Age 66 is correct |
| Income tax | 20% to €44,000, 40% above, credits €4,000 | **OK** | Unchanged for 2026 |
| USC | flat 4% | **0.5% / 2% / 3% / 8%, bands €12,012 / €28,700 / €70,044, exempt ≤ €13,000** (M) | Revenue 2026 |
| PRSI | 4.2% above €18,304, no credit | **4.35%** (from 1 Oct 2026), nil ≤ €352 a week, PRSI credit (M) | Budget 2026 / PRSI roadmap |
| Tax bands over time | fixed nominal | **indexed to prices** (M) | Removes 60 years of fiscal drag |
| Pension contribution cost | 30% of total incl. employer | **own share × (1 − marginal relief)**, age limits, €115k cap (M) | Revenue relief rules |
| Drawdown | 1/(years to 90), taxed 10%, State Pension untaxed | spread **OK**. Tax: **`netRet()`** (M). **25% lump sum, max €200k tax-free** (S) | ARF imputed 4%/5% is met; Revenue |
| Mortgage 3.8% / debt 9% / to age 90 | — | **OK** | — |

Size of the errors today (per year): take-home is understated by €480–€980 at €15k–€60k gross and overstated by about €2,250 at €150k (flat USC, no PRSI credit) · understated by about €6,600 in today's money in year 30 at €45k (fiscal drag) · pension contribution cost understated by €250 (€45k employed), €450 (€30k) and €2,050 (€45k self-employed) · retirement income overstated by €1,100 (€20k drawdown) and €5,900 (€40k drawdown).

### Paste-ready code
```js
const AS = {infl:0.025, wage:0.03, cash:0.007, inv:0.03, pen:0.04, penRet:0.028, sp:15564, spAge:66, end:90, mortRate:0.038, debtRate:0.09};
// 2026 Irish rules, today's money. Bands/credits are assumed to rise with prices (call with income / infl, then multiply back).
const TX = {band:44000, credits:4000, ageCredit:245, ageExempt:18000,
  usc:[[12012, .005], [28700, .02], [70044, .03], [Infinity, .08]], uscExempt:13000, prsi:0.0435, prsiWk:352};
function incomeTax(g, cr){ return Math.max(0, 0.2 * Math.min(g, TX.band) + 0.4 * Math.max(0, g - TX.band) - (cr == null ? TX.credits : cr)); }
function usc(g, reduced){ if (g <= TX.uscExempt) return 0; const b = reduced ? [[12012, .005], [Infinity, .02]] : TX.usc; let t = 0, lo = 0;
  for (const [hi, r] of b){ t += Math.max(0, Math.min(g, hi) - lo) * r; lo = hi; if (g <= hi) break; } return t; }
function prsi(g){ const wk = g / 52; if (wk <= TX.prsiWk) return 0; const cr = wk <= 424 ? Math.max(0, 12 - (wk - 352.01) / 6) : 0; return Math.max(0, (wk * TX.prsi - cr) * 52); }
function netPay(g){ return g <= 0 ? 0 : g - incomeTax(g) - usc(g) - prsi(g); }
// Retirement: no PRSI at 66+, State Pension is USC-exempt, age credit and age exemption from 65, reduced USC from 70 (income <= €60,000)
function netRet(draw, sp, age){ const g = draw + sp; if (g <= 0) return 0;
  const it = age >= 65 && g <= TX.ageExempt ? 0 : incomeTax(g, TX.credits + (age >= 65 ? TX.ageCredit : 0));
  return g - it - usc(draw, age >= 70 && g <= 60000); }
// Net cost to take-home of the employee's own pension contributions (relief at marginal income-tax rate, within age limits and the €115,000 cap)
const relLim = a => a < 30 ? .15 : a < 40 ? .2 : a < 50 ? .25 : a < 55 ? .3 : a < 60 ? .35 : .4;
function pensionCost(g, E, age){ const Er = Math.min(E, relLim(age) * Math.min(g, 115000)); return E - (incomeTax(g) - incomeTax(Math.max(0, g - Er))); }
/* In project(), replace the working / retired branch with:
    if (working){
      const gR = f.income * wgw / infl;                                   // gross in today's money
      const E  = f.pensionM * 12 * (f.work === 'Self-employed' ? 1 : 0.5) * wgw / infl;   // own share of "paid in each month"
      inflow += (netPay(gR) - pensionCost(gR, E, a)) * infl;
      let contrib = f.pensionM * 12 * wgw; if (wg && wg.kind === 'retire') contrib = Math.max(0, contrib + wm * 12);
      pen = pen * (1 + AS.pen) + contrib;
      if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;                   // working past 66 (rare): keep as today
    } else {
      if (a === R){ const ls = Math.min(pen * 0.25, 200000); pen -= ls; cash += ls; }   // tax-free lump sum (limit is not indexed)
      const draw = pen / Math.max(1, AS.end - a + 1);                      // >= ARF imputed 4% (61-70) / 5% (71+)
      pen = (pen - draw) * (1 + AS.penRet);
      const sp = a >= AS.spAge ? AS.sp * f.sp : 0;                         // today's money
      inflow += netRet(draw / infl, sp, a) * infl;
    }
   and delete the separate line  `if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;`
   Partner: `inflow += netPay(f.pIncome * wgw / infl) * infl`. Their State Pension alone stays below the €18,000 age exemption, so keep it gross.
*/
```
Also update the Assumptions sheet, report §9 and Ask `pret` from `AS` (no hard-coded numbers). Suggested Assumptions rows: "Prices rise 2.5% a year · Pay rises 3% · Cash grows 0.7% after tax · Investments 3% after charges and tax · Pensions 4% after charges (2.8% once retired) · State Pension €15,564 a year from 66 · Tax: 2026 Irish income tax, USC and PRSI, bands assumed to rise with prices · At retirement, 25% of your pension is taken tax-free (up to €200,000) · Spare money each year is assumed saved: 60% cash, 40% invested · Plan ends at 90. Investments can fall as well as rise. Illustrative only, not a guarantee."

---

## 4. Customer wording: guidance or advice?

The test used: a line crosses the line when it tells **this customer** what to **do** with money or with a **product type** based on their circumstances (MiFID "personal recommendation", Delegated Reg Art. 9; CPC 2025 suitability). A line is fine when it explains, illustrates with "could / would, using our assumptions", or points to an adviser.

| # | Where (snapshot line) | Today | Verdict | Replace with |
|---|---|---|---|---|
| W1 | `findings()` dT (~774), "Your biggest decision" card, report §1 | "Saving €X more a month towards *goal* closes it" | **CHANGE (M)**: sounds like an instruction and a certainty | "Saving about €X more a month could close this gap, on our assumptions." Fallback: "Moving *goal* later, or changing the amount, would make the biggest difference." |
| W2 | Report §4 detail (~1050) | "…saving about €X a month towards it **into your pension**, or moving it later." | **CHANGE (M)**: directs to a product type | "…saving about €X a month more towards it, or moving it later. An adviser can tell you the best way to do this for you." |
| W3 | `riskRead` K13 (~461) | "A calmer plan could **suit you** better." | **CHANGE (M)**: "suit" is suitability language | §2 K13 line |
| W4 | `riskRead` K16 (~459) | "Safety first: an emergency fund and protection come before investing." | **CHANGE (M)**: an instruction | §2 K16 line |
| W5 | `riskRead` K14 (~460) | "…build the safety net first." | **CHANGE (M)**: an imperative | §2 K14 lines ("Many people build…") |
| W6 | `riskRead` K17 at D10 (~458) | "…ready for a growth conversation." | **CHANGE (M)**: fires after 7 taps, with no horizon or K&E | K17 only in the full profile (§2); wording "A good basis for a growth conversation with an adviser." |
| W7 | Sheet `money`, Ask `free` (~990, ~1033) | "This never changes what you pay." | **CHANGE (M)**: can't be promised if adviser pay comes from product charges. CPC 2025 requires clear remuneration disclosure | "LifeGoals is free for you. If you work with an adviser, their firm may pay us a fee. Your adviser will tell you how they are paid before you agree to anything." |
| W8 | `findings()` protection dT (~773) | "Check your protection, so illness or death can't derail the plan" | **CHANGE (S)** | "Worth a look: would your plan cope with illness or death? An adviser can check your cover with you." |
| W9 | My Plan banner (~957), Ask `prisk` (~1008), toast (~1153) | "Risk profile: *label*" from 7 answers | **CHANGE (M)**: see R7 | "Risk profile (first read): *label* · Finish in Me to confirm". Never above Balanced until u10 + u11 are answered. |
| W10 | TYPES `watch` for Contented / Balancer | "Putting off decisions, such as pension top-ups." / "…cash quietly loses value to rising prices." | **OK** | Generic education, no instruction |
| W11 | `chartNote`, `journeyNote`, `RISK_EXPLAIN`, Ask guard, D10/Me/report footers, DISC_FORMAL | — | **OK** | Explanatory; "not advice" labels in place (MASTER E21, S1 K22) |
| W12 | Assumptions sheet | no "can fall" warning; no surplus-split line | **CHANGE (S)** | Add "Investments can fall as well as rise" and the 60/40 line (§3) |

---

## Sources
- ESMA Guidelines on certain aspects of the MiFID II suitability requirements, ESMA35-43-3172 (23 Sep 2022): [ESMA final report (via Finanssivalvonta)](https://prod.finanssivalvonta.fi/globalassets/en/publications/supervision-releases/2023/esma35-43-3172_guidelines_on_certain_aspects_of_the_mifid_ii_suitability_requirements.pdf) · [Regulation Tomorrow summary](https://www.regulationtomorrow.com/2022/09/esma-final-report-on-guidelines-on-certain-aspects-of-the-mifid-ii-suitability-requirements/) · [CMS: sustainability preferences asked after the other criteria](https://cms.law/en/int/legal-updates/esma-guidelines-on-suitability-updated-to-take-into-account-sustainability-factors-risks-and-preferences-of-the-clients)
- ESMA public statement on the 2020 CSA on suitability (self-assessment; capacity for loss vs risk tolerance): [ESMA35-43-2748](https://www.esma.europa.eu/sites/default/files/library/esma35-43-2748%5Fpublic%5Fstatement%5Fon%5F2020%5Fcsa%5Fon%5Fsuitability.pdf)
- CBI Consumer Protection Code 2025 (knowing the consumer, suitability, from 24 Mar 2026): [CBI Part 2](https://www.centralbank.ie/regulation/consumer-protection/consumer-protection-code/section-48-regulations/part-2-general-consumer-protection-requirements) · [KPMG](https://kpmg.com/ie/en/insights/consulting/consumer-protection-code-2025.html) · [Maples](https://maples.com/knowledge/new-consumer-protection-code-recommended-steps-for-firms-to-comply)
- State Pension 2026 (€289.30 → €299.30 a week): [Zurich: pension changes 2026](https://www.zurich.ie/blog/pension-changes-2026) · [gov.ie SPC](https://www.gov.ie/SPC)
- Budget 2026 tax (bands and credits unchanged, USC 2% band to €28,700, PRSI 4.2% → 4.35% on 1 Oct 2026): [KPMG personal tax](https://kpmg.com/ie/en/insights/tax/budget-2026/personal-tax.html) · [Payroll.org](https://payroll.org/news-resources/news/news-detail/2026/01/05/ireland-s-budget-2026-brings-significant-changes-for-payroll) · [Revenue USC reduced rates](https://www.revenue.ie/en/jobs-and-pensions/usc/reduced-rates.aspx)
- Exit tax 41% → 38%, DIRT 33%: [Cantor Fitzgerald Budget 2026](https://cantorfitzgerald.ie/budget-2026-key-updates-for-investors-and-savers) · [Davy](https://www.davy.ie/market-and-insights/insights/financial-planning-insights/2025/budget-2026-summary.html)
- CBI Quarterly Bulletin June 2026 (inflation 3.5% / 2.9%): [Chartered Accountants Ireland summary](https://www.charteredaccountants.ie/News/central-bank-s-bulletin-notes--domestic-resilience--despite-rising-inflation)
- ARF imputed distribution 4% / 5%; auto-enrolment (My Future Fund) from 1 Jan 2026: [Cantor ARF brochure](https://cantorfitzgerald.ie/wp-content/uploads/2026/06/ARF-6pp-A4-Brochure-6-26.pdf) · [ifac auto-enrolment](https://downloads.ifac.ie/x/b31d5fcd3d/auto-enrolment-information.pdf)
- From the reviewer's knowledge (not re-fetched in this round; the CBI, ESMA and actuaries.ie sites are blocked from this environment): pension relief age limits 15–40% with the €115,000 cap; lump sum €200,000 tax-free; age credit €245; age exemption €18,000; PRSI credit €12 a week tapering to €424. Before release, check these against Revenue.

---

## Round 2: money-profile rewrite (§13)

Reviewer: Financial Planner · 1 Oct 2026 · Spec and prototype not edited.

**1. Coverage: OK.** Risk tolerance (Q8, Q9), capacity for loss (u10, Q7, u14), time horizon (u9), K&E (u11), liquidity (Q7, u14), income stability (u12). Nothing critical is missing. **S:** keep the optional u11 product chips (Savings · Pension · Shares or funds · Crypto · None), which §13 drops. ESMA says firms must not rely on self-assessment alone.

**2. Sustainability: acceptable**, because LifeGoals makes no recommendation and the adviser asks before any recommendation (Delegated Reg 2021/1253). Fixes: never pre-select the chip (CPC 2025). Add the line "Your adviser will ask about this before recommending anything." Remove the UM13 row from the §3 coverage table.

**3. Scoring: CHANGE (M).** The new u10 order reverses old index 3 ("Not sure" → cap 3 becomes "Nothing changes").
```
u10: 0→cap 2 · 1→cap 3 · 2→cap 4 · 3→none
u14: 0→cap 2 + thin · 1→cap 3 + thin · 2,3→none
     (thin feeds capLo, so K16/K14c fires: yes, safety first, as a message, not an override)
u11 option 4: KE 4 (not 5) unless chips include "Shares or funds"; never K17; adviser flag "Overconfidence"
Q7 = emergency savings but u14 = 0 → adviser flag "inconsistent answers"
```

**4. Wording.** Validator and Delegator are standard industry segments (self-directed / validator / delegator), so **OK**. Changes:
- u12 option 4: "Very steady (e.g. permanent job or pension)" → "Very stable income". In pensions, "Secure income" means a guaranteed income.
- u11 option 3 tag: "Some investing experience" (one fund isn't "Experienced").
- u11 option 4 tag: "Self-rated expert · watch for overconfidence bias".

---

## Round 3: honest goal funding

Reviewer: Financial Planner · 1 Oct 2026 · Design only. The prototype is not edited (retirement is being made optional in parallel). The code below was run in Node against the live `AS`/`TX`/`finNums()`/tax functions, which were copied out of `LifeGoals-Customer-Journey-Prototype.html`, using a mocked `S`.

### Why today's results read 100%
`project()` (~line 649) has three problems. (1) It saves **all** of each year's spare money (`cash += net*0.6; inv += net*0.4`). (2) A `pot` goal counts as covered when **total** liquid money ≥ target, so the same euro covers several goals. (3) There is no per-goal check of required vs available saving. A €1,000/month surplus therefore funds everything.

### Rules (customer-explainable)
| # | Rule | Customer wording (Assumptions sheet) |
|---|---|---|
| G1 | **What you save each month** = the lower of (a) your Q6 answer and (b) **50%** of the measured spare money (take-home + other income − living costs − mortgage/loan payments). Q6 amounts: Under €100 → €50 · €100–300 → €200 · €300–750 → €500 · Over €750 → €1,000 · "It changes month to month" → a third of the spare money, with no band amount. Q6 not answered → €300 cap (labelled assumption). It rises with pay and stops at retirement. | "What you save: the lower of what you said you could comfortably put away and half of your spare money. The rest is assumed spent." |
| G2 | **Spare money that isn't saved is spent.** It never builds up in the background. | (same line) |
| G3 | **What-if ± a month** changes G1. "−€X" lowers saving for the whole plan. "+€X towards *goal*" is extra, comes out of the spent part, and goes to that goal first. Any amount above what that goal needs goes to unallocated savings. A lump goes to that goal's pot (or the pension). | unchanged |
| G4 | **Earmarking order:** Build a safety net first (it is the emergency fund), then **Must have** before **Nice to have**, then the earliest date. Each euro funds one goal only. | "Your savings go to your goals in order: safety net first, then must-haves, then nice-to-haves, soonest first." |
| G5 | **Lump sums** at the start: each goal's own "saved so far" (taken from cash), then, if there is no safety-net goal, **3 months of living costs held back as a buffer**. The rest of cash + investments then goes to goals in G4 order, each taking only today's value of what it needs. | "Three months of costs are kept aside for emergencies and not used for goals." |
| G6 | **Each year**, each goal not yet reached in G4 order takes the monthly amount it still needs. That is the level saving, rising with pay, that would reach the inflated cost by the goal date from its current pot. If the budget runs out, later goals wait. When a goal is reached, its share passes to the next goal. | — |
| G7 | **Growth by horizon:** goals under 5 years grow at the active set's **cash** rate, goals 5+ years at the **investment** rate. Unallocated money grows at the old 60/40 mix. | "Money for goals under 5 years is assumed kept as cash." |
| G8 | **At the goal date:** spend / mortgage-free goals are paid from their own pot, then from unallocated money (never another goal's pot or the buffer). Pot goals count **only their own pot**. Afterwards the safety-net pot becomes the buffer and a wealth pot becomes unallocated. | — |
| G9 | **Coverage %** = paid ÷ inflated cost, **rounded down** (99.6% shows 99%). The goal also reports `needM` (monthly saving needed now to reach 100%, today's money), `nowM` (the amount going to it this year) and `avgM` (the average to its date). | UI line: "Needs €X a month · you're putting €Y a month" (+ "more later, once *earlier goal* is done" when avgM > nowM) |
| G10 | **Retirement** stays on the pension + cashflow logic and is **optional**. With no retirement goal, retired living costs = 80% of today's costs and no retirement % is reported. The lump sum at retirement goes to unallocated savings. Legacy = unallocated + buffer at 90. | — |
| G11 | **Shortfall years:** draw from unallocated money, then the buffer, then goal pots in reverse G4 order (nice-to-have/latest first). Purple only after that. | — |
| G12 | **The road can't contradict the %:** `row.short` = living shortfall + **any goal gap that year** (spend, mortgage-free and pot). `row.due` names the goal. | journeyNote: "Around age X, money for *goal* falls short" when `goalGap` > 0 and `shortLiving` = 0 |

Guidance check: the outputs are illustrations on stated assumptions ("could", "on our assumptions"). No product is named, so this does not cross into advice (§4 test).

### Paste-ready code (replaces `project()`; keeps `{rows, pct}`, adds `P.goal[id]` and `P.save`; `extraFor()`, `findings()` and `wiText()` work unchanged)
```js
/* ===== Honest goal funding (FP review round 3). Replaces project(); same return shape {rows, pct} plus P.goal and P.save ===== */
const SAVE = {
  band:[50, 200, 500, 1000, null],   // Q6 option index -> monthly amount, today's money (band midpoint; "Over €750" -> €1,000; "varies" -> share only)
  share:0.5,                         // at most half of the measured monthly spare money is saved
  shareVaries:0.33,                  // "It changes month to month": a third
  noAnswer:300,                      // Q6 not answered: €300 a month cap (shown as an assumption)
  buffer:3,                          // months of living costs kept back as an emergency buffer when there is no safety-net goal
  longYrs:5                          // goals 5+ years away grow at the investment rate, sooner ones at the cash rate
};
const GOAL_ORDER = (a, b) => (a.k === 'safety' ? 0 : 1) - (b.k === 'safety' ? 0 : 1)       // safety net first, always
  || (a.prio === 'Nice to have' ? 1 : 0) - (b.prio === 'Nice to have' ? 1 : 0)            // then Must have before Nice to have
  || a.age - b.age || a.id - b.id;                                                          // then by date
// Saving that grows with pay (w) into a pot growing at r: value after n years of 1 a year (paid at the start of each year)
const annF = (n, r, w) => { let s = 0; for (let t = 0; t < n; t++) s += Math.pow(1 + w, t) * Math.pow(1 + r, n - t); return s; };
function saveCap(surplusM){                                  // monthly saving, today's money, before what-if
  const k = typeof S.ans['6'] === 'number' ? S.ans['6'] : null, sp = Math.max(0, surplusM);
  if (k === 4) return SAVE.shareVaries * sp;
  const cap = k == null ? SAVE.noAnswer : SAVE.band[k];
  return Math.min(cap, SAVE.share * sp);
}
function project(wi){
  applyAssume();
  const f = finNums(), a0 = f.age, R = f.R, N = AS.end - a0, rg = S.goals.find(g => g.kind === 'retire');
  wi = wi || {}; const wg = wi.g != null ? S.goals.find(g => g.id === wi.g) : null, wm = +wi.m || 0, wl = +wi.l || 0;
  const wgR = wg && wg.kind === 'retire';
  // Goals funded from savings: spend, mfree, pot. Retirement uses the pension + cashflow; legacy is what is left at the end.
  const fg = S.goals.filter(g => ['spend','mfree','pot'].includes(g.kind)).slice().sort(GOAL_ORDER);
  // Mortgage balance path, so "Be mortgage-free" has a known cost at its date
  const mPath = []; { let m = f.mortBal; for (let t = 0; t <= N; t++){ mPath.push(Math.max(0, m)); if (m > 1){ const pay = Math.min(f.mortPayM * 12, m * (1 + AS.mortRate)); m = m * (1 + AS.mortRate) - pay; } } }
  const G = {}; fg.forEach(g => { const n = Math.max(0, g.age - a0), r = n >= SAVE.longYrs ? AS.inv : AS.cash;
    const cost = g.kind === 'mfree' ? (f.mortBal > 0 ? mPath[Math.min(n, N)] : g.amount * Math.pow(1 + AS.infl, n)) : g.amount * Math.pow(1 + AS.infl, n);
    G[g.id] = {g, n, r, cost, pot:0, paid:0, done:false, c0:0, cSum:0, cYrs:0, need0:0}; });
  // 1. Lump sums. Each goal's own "saved so far" first (taken from cash), then a buffer is held back, then free cash + investments in goal order.
  let cash = f.cash, inv = f.invest, pen = f.pension, mBal = f.mortBal, dBal = f.debt, mfreeDone = false;
  fg.forEach(g => { const s = Math.min(g.saved || 0, cash); G[g.id].pot += s; cash -= s; });
  if (wg && !wgR && G[wg.id]) G[wg.id].pot += wl; if (wgR) pen += wl;
  const hasSafety = fg.some(g => g.k === 'safety');
  let buffer = hasSafety ? 0 : Math.min(cash, SAVE.buffer * f.costsM); cash -= buffer;
  let free = cash + inv;                                       // unallocated money (spent first in a shortfall, funds retirement and legacy)
  fg.forEach(g => { const x = G[g.id], want = Math.max(0, x.cost / Math.pow(1 + x.r, x.n) - x.pot), take = Math.min(want, free); x.pot += take; free -= take; });
  const gr = 0.6 * AS.cash + 0.4 * AS.inv;                     // unallocated money: same 60/40 cash/invest mix as before
  const gf = {}; S.goals.forEach(g => gf[g.id] = {cost:0, cov:0});
  const rows = [];
  for (let t = 0; t <= N; t++){
    const a = a0 + t, infl = Math.pow(1 + AS.infl, t), wgw = Math.pow(1 + AS.wage, t), working = a < R;
    let inflow = 0;
    if (working){
      const gR = f.income * wgw / infl, E = f.pensionM * 12 * (f.work === 'Self-employed' ? 1 : 0.5) * wgw / infl;
      inflow += (netPay(gR) - pensionCost(gR, E, a)) * infl;
      let contrib = f.pensionM * 12 * wgw; if (wgR) contrib = Math.max(0, contrib + wm * 12);
      pen = pen * (1 + AS.pen) + contrib;
      if (a >= AS.spAge) inflow += AS.sp * f.sp * infl;
    } else {
      if (a === R){ const ls = Math.min(pen * 0.25, 200000); pen -= ls; free += ls; }
      const draw = pen / Math.max(1, AS.end - a + 1); pen = (pen - draw) * (1 + AS.penRet);
      inflow += netRet(draw / infl, a >= AS.spAge ? AS.sp * f.sp : 0, a) * infl;
    }
    if (f.partner){ const pa = f.pAge + t; inflow += pa < 66 ? netPay(f.pIncome * wgw / infl) * infl : AS.sp * f.sp * infl; }
    inflow += (f.otherM + f.rentM) * 12 * infl;
    let living = (working ? f.costsM * 12 : (rg ? rg.amount : f.costsM * 12 * 0.8)) * infl + f.oneOffY * infl;
    let fixed = 0;
    if (mBal > 1 && !mfreeDone){ const pay = Math.min(f.mortPayM * 12, mBal * (1 + AS.mortRate)); fixed += pay; mBal = mBal * (1 + AS.mortRate) - pay; }
    if (dBal > 1){ const pay = Math.min(Math.max(f.debtPayM * 12, dBal * 0.1), dBal * (1 + AS.debtRate)); fixed += pay; dBal = dBal * (1 + AS.debtRate) - pay; }
    // 2. Goals due this year are paid from their own pot, then from unallocated money. What can't be paid is a goal gap (shown on the road).
    let goalGap = 0; const due = [];
    fg.forEach(g => { const x = G[g.id]; if (x.done || g.age > a) return; x.done = true; due.push(g.name);
      if (g.kind === 'pot'){ x.paid = Math.min(x.cost, x.pot); goalGap += x.cost - x.paid;
        if (g.k === 'safety') buffer += x.pot; else free += x.pot; x.pot = 0; }          // the safety net stays as the buffer; a wealth pot becomes free money
      else { let pay = Math.min(x.cost, x.pot); x.pot -= pay; const top = Math.min(x.cost - pay, free); free -= top; pay += top; free += x.pot; x.pot = 0;
        x.paid = pay; goalGap += x.cost - pay; if (g.kind === 'mfree' && pay >= x.cost - 1){ mfreeDone = true; mBal = 0; } }
      gf[g.id].cost = x.cost; gf[g.id].cov = x.paid; });
    // 3. Spare money this year. Only the saving amount is saved; the rest is assumed spent.
    const net = inflow - living - fixed; let used = 0, short = 0, saved = 0, spent = 0;
    if (net >= 0){
      const base = working ? saveCap(net / 12 / infl) * 12 * infl : 0;
      let budget = Math.max(0, base + (!wgR && wm < 0 && working ? wm * 12 * infl : 0));         // "saving less" lowers the saving amount
      const extra = !wgR && wm > 0 && working && wg && G[wg.id] && !G[wg.id].done ? wm * 12 * infl : 0;  // "extra towards X" (today's money, kept level in real terms)
      budget = Math.min(budget, net); const ex = Math.min(extra, net - budget); saved = budget + ex; spent = net - saved;
      if (ex > 0){ const x = G[wg.id], n = x.g.age - a, need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(ex, need);
        x.pot += give; x.cSum += give / infl; free += ex - give; if (t === 0) x.c0 += give; }
      fg.forEach(g => { const x = G[g.id]; if (x.done) return; const n = g.age - a;
        const need = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, n)) / annF(n, x.r, AS.wage)), give = Math.min(budget, need);
        if (t === 0) x.need0 = need; x.pot += give; budget -= give; x.cSum += give / infl; x.cYrs++; if (t === 0) x.c0 += give; });
      free += budget;                                            // saved but not needed by any goal: unallocated
    } else {
      fg.forEach(g => { const x = G[g.id]; if (!x.done){ x.cYrs++; if (t === 0) x.need0 = Math.max(0, (x.cost - x.pot * Math.pow(1 + x.r, g.age - a)) / annF(g.age - a, x.r, AS.wage)); } });
      let gap = -net; const take = v => { const d = Math.min(gap, v); gap -= d; used += d; return d; };
      free -= take(free); buffer -= take(buffer);
      fg.slice().reverse().forEach(g => { const x = G[g.id]; if (!x.done && gap > 0) x.pot -= take(x.pot); });   // Nice-to-have and latest goals give way first
      short = gap;
    }
    // 4. Growth
    free *= 1 + gr; buffer *= 1 + AS.cash; fg.forEach(g => { const x = G[g.id]; if (!x.done) x.pot *= 1 + x.r; });
    if (rg && !working){ gf[rg.id].cost += living; gf[rg.id].cov += living - Math.min(short, living); }
    const pots = fg.reduce((s, g) => s + G[g.id].pot, 0), liquid = free + buffer + pots;
    S.goals.forEach(g => { if (g.kind === 'legacy' && t === N){ const tgt = g.amount * infl; gf[g.id].cost = tgt; gf[g.id].cov = Math.min(tgt, free + buffer); } });
    rows.push({t, a, yr:YEAR0 + t, inflow, needs:living + fixed, short:short + goalGap, shortLiving:short, goalGap, due, used, saved, spent, liquid, pen, retired:!working, rmark:a === R});
  }
  // 5. Results. Floor, so 99.6% never reads as 100%.
  const pct = {}, goal = {};
  S.goals.forEach(g => { const x = gf[g.id]; pct[g.id] = x.cost > 0 ? (x.cov >= x.cost - 1 ? 100 : clamp(Math.floor(x.cov / x.cost * 100), 0, 99)) : 100; });
  fg.forEach(g => { const x = G[g.id];
    goal[g.id] = {cost:x.cost, have:x.paid, rate:x.r, years:x.n,
      needM:Math.round(x.need0 / 12), nowM:Math.round(x.c0 / 12), avgM:x.cYrs ? Math.round(x.cSum / x.cYrs / 12) : 0}; });
  const s0 = rows[0], sur0 = f.age < R ? (s0.saved + s0.spent) / 12 : 0;
  return {rows, pct, goal, save:{surplusM:Math.round(sur0), saveM:Math.round(s0.saved / 12)}};
}
```
Wiring (for the developer):
- `goalsBox()` / report §4: under each non-retirement goal add `'Needs ' + eur(x.needM) + ' a month · you\'re putting ' + eur(x.nowM)` with `x = P.goal[g.id]`.
- `assumeRows()`: replace the 'Spare money each year' row with G1/G2 wording, and add the G5 and G7 lines.
- `journeyNote()` / `chartNote()`: use `r.goalGap` and `r.due` for the goal-gap wording in G12. `isShort()` is unchanged.
- Q6 is read by option index (`S.ans['6']`), not by `dsc('6')`, because "varies" and "€100–300" share score 2.

### Sanity table (Standard set; Cautious in brackets; old = today's engine)
| Customer (inputs) | Saves / spare | Goal: old → **new** (Cautious) · needs / putting now |
|---|---|---|
| **A** (Pooja's case) 30, single, €55k, costs €2,400/m, cash €6k, pension €12k, Q6 €100–300, no retirement goal | €200 / €1,029 | Safety net 2y: 100 → **100** (100) · €174/€174 · Home 18y: 100 → **100** (99) · €140/€26 · Business 26y (Nice): 100 → **100** (81) · €54/€0 · Wealth 27y (Nice): 100 → **18** (4) · €102/€0. Road: purple at 57 (wealth gap) |
| **B** couple 40, €75k + €45k, costs €4,000/m, mortgage €220k, cash €30k, inv €20k, Q6 Over €750 | €943 / €1,886 | Car 3y (Nice): 100 → **100** (93) · €846/€846 · Education 10y: 100 → **100** (100) · Mortgage-free 15y (Nice): 100 → **100** (100) · Retire 65: 100 → **100** (100) |
| **C** 26, single, €32k, costs €2,000/m, cash €1.5k, no pension, Q6 Under €100 | €50 / €310 | Travel 2y (Nice): 100 → **0** (0) · €337/€0 · Wedding 3y: 36 → **7** (6) · €705/€50 · Home 5y: 21 → **3** (3) · €614/€0 · Retire 66: 89 → **54** (53). Road: purple from 28 |
| **D** 50, €120k, costs €4,500/m, cash €80k, inv €250k, pension €400k, Q6 Over €750 | €606 / €1,212 | Help family 8y, Wealth 10y, Retire 63: 100 → **100** (100, 100, 98) · funded from lump sums, needs €0 · Legacy 85: 100 → **100** (0: money runs out at 90 on Cautious) |

Checks on A: "−€100 a month" → 82 / 59 / 42 / 2%. "+€10k lump to wealth" → wealth 57%. Q6 Over €750 → all 100%. So the % now moves with what the customer actually puts away. Only B and D (real surplus or real assets) stay at or near 100%, which is correct.
