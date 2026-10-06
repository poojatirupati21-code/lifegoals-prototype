# Financial Planner final review (6 Oct 2026)

Reviewer: the qualified financial planner (QFA / CFP, Ireland), on the LifeMap prototype. Read-only review: nothing in the prototype or the workbook was edited. This file is the only thing written to the repo.
Branch `claude/simplify-customer-journey-zqxep3`. Scope: (a) cashflow and goal engine, (b) the 28 calculators against `deliverables/LifeGoals-Calculators.xlsx`, (c) rules, rates and the pre-release list. Binding rules: `docs/journey-spec.md` §10 to §25.

## 0. Verdict in one line

**Satisfied with changes.** The engine and the calculators are numerically sound and every assertion test passes. Three things must change before an adviser or customer relies on the output: the Skip path ends at a wall (H1), the other-property mortgage carries a silent 25-year default (H2), and the investment-growth standard does not reconcile with its own wording (H3, my own earlier suggestion). The Irish law values are plausible but the register is 81 of 82 items "verify" with mostly secondary sources, so it cannot be called verified.

## 1. Test results (re-run today, FAILS counts read, not only ERRORS)

Run from `scratchpad/runall.sh` plus `calc-vs-xlsx.js` plus my new scripts in `scratchpad/fpfinal/`.

| Suite | Result | Asserting? |
|---|---|---|
| precedence.js | FAILS 0 of 57 | yes |
| rules.js | FAILS 0 of 67 | yes |
| asm.js | FAILS 0 of 35 | yes |
| choices.js | FAILS 0 of 80 | yes |
| v12.js | FAILS 0 of 35 | yes |
| s19 / s21 / s22 / s23 / s24 / s24c / s25 | 0 of 34 / 30 / 21 / 13 / 22 / 16 / 27 | yes |
| fp/mono.js (random, with goal ranking) | 4,200 checks, all five fail counters 0 | yes |
| calc-vs-xlsx.js (28 calculators, 5 cases each) | FAILS 0 of 145, CONST DIFF 0, workbook recalculated 6 Oct 2026 | yes |
| chart.js | nFails 0 | yes |
| e2e 390 / 1280 / 844, fp4, road, landfit, noret, v5 to v11, emerg, cta2 | ERRORS 0 (page errors only) | **no**: they print values and count page errors; they do not assert. Do not quote them as "passed". |

Total asserting checks run and passed: 57+67+35+80+35+34+30+21+13+22+16+27 = 437 named assertions, plus 4,200 random monotonicity checks and 145 workbook comparisons. Zero failures in all of them.

One stale line: `fp4.js` prints `I9_mortgageGoneAfter: false`. It is not counted as a failure because the script does not assert it. It reflects honest funding (the "mortgage-free" goal is 2% funded for a customer with no spare cash, so the mortgage is not cleared). The test label should be retired.

Note: while I was reviewing, another agent changed one line of copy in the prototype (Q7 tag explanation, "safety money" to "emergency fund", 22:21). It touches wording only, not the engine. The runs above are valid for the engine. Anyone re-running the tests after that edit should re-run the wording tests.

## 2. New adversarial scenarios (scripts `scratchpad/fpfinal/adv1.js` to `adv5b.js`, `mono2.js`, `mono3.js`, `pens.js`, `skip.js`, `emerg2.js`, `partner.js`, `deficit.js`)

| Scenario | Result |
|---|---|
| Main mortgage €200k plus two other-property mortgages | Main stays €200,000; other-property debt €250,000 goes into "other loans" at a balance-weighted rate; main-home "mortgage-free" goal ignores it. Pass. |
| Other-property mortgage, no rate typed | Mortgage-rate gate appears ("Choose your mortgage rate to see this"). Pass. |
| Other-property mortgage with no repayment and no years | **Fails the rules**: silently amortised over 25 years (€925 a month on €180,000), not gated, not labelled (H2). |
| Four pensions, mixed own-share blanks | Own share = typed amounts plus (blank monthly x chosen share). Totals correct (€56,000, €550 a month, own €300). With the share not chosen, the "Share of your pension you pay" gate appears. Pass. |
| Typed own share above the monthly amount | Silently capped to the monthly amount; no message (L1). |
| 25 cards and 25 loans | Sums and weighted APRs correct, no NaN. Pass. |
| Zero income, Not working, empty finances | No NaN or Infinity; goals show short; no crash. Pass. |
| €5.9m of debt on tiny repayments | Falls back to the 5-year worked-out repayment (€123,752 a month), flagged as estimate, no NaN, 24 short years shown. Pass. |
| Partner cases (manual, invite, unmarried) | Manual partner age is gated. In "invite" mode a typed partner income is still used and partner age silently falls back to your own age (M2). |
| Saving more never lowers any goal (with goal ranking, pensions lists, cards, loans, other mortgages, 250 random customers) | 0 failures in saving, lump sum, what-if, income. |
| Moving a goal up the ranking never lowers that goal | 0 failures. |
| Less debt never lowers a goal | 57 of 2,982 checks fail, **all** on a basis switch: a stated repayment barely above the interest is used as stated, so the debt lingers for decades, while the worked-out 5-year repayment clears it. Engine is following the customer's own figure. Not a bug, but the customer gets no warning on cards and loans (only the mortgage has the "repayment looks low" flag) (M8). |
| Emergency fund months across goal, calculator and Step 7 | One setting (`safetyMonths`): goal box, calculator slider, "What your plan assumes" and the plan buffer all moved together 3 to 4 to 5. Pass. Euro amount differs (M7). |
| "Skip, show my results" with only the 3 required choices made | **Results fully blocked**: "Choose your investment growth to see this. Also still to choose: ..." (H1). The banner count equals the My money checklist count (same function); missing items count as €0; singular "1 detail missing / Add it" correct. |
| Overspending customer (net pay €2,148, spends €2,600) | Foundations level 1 says "Spending about €452 a month more than comes in: Needs attention", and "Next best step" says spend less. But the headline "Your main strength: Retire comfortably is 77% covered" sits above it (M1). |
| Settings and partner override | Setting a partner name and figures changes every chip to "Suggested by [partner]" and moves the engine fallback; retirement age and plan-until age have no standard and cannot be given one. No bounds on partner figures (M6). |
| Workbook Settings sheet | 37 standards match the prototype (CONST SAME on all compared). |

## 3. Findings, ranked, each with an owner

### HIGH

**H1. "Skip, show my results" leads to a blocked results page.** `resultsHTML()` returns the gate whenever `planMissing()` has anything, and `planMissing()` includes every judgement item (investment growth, cash growth, pension growth, pay rises, tax bands, State Pension in future, lump sum, drawdown, emergency fund months, cash years, invest share, save share, start year) plus type-2 items (State Pension, mortgage and card rates). §22 says results "stay blocked only until these 3 are chosen" and that the rest show "Choose your ... to see this" only where "the plan truly needs" it. As built, a customer who chooses the 3 and taps Skip sees no results at all. Tested on the sample customer with all assumptions cleared except the 3. Owner: Pooja (decide) then Developer. Options: (a) gate per result, so goals that do not use the missing item still show; (b) keep the full gate but rename the button and show on the Skip click a single card "One tap: use the standards for the rest", which keeps §14 (the customer's own explicit choice); (c) accept and reword §22. I recommend (b) now, (a) later. Silently applying standards on Skip would break §14 and is not an option.

**H2. Other-property mortgage has a hidden 25-year default.** `mort2Nums()` uses `: 25` years when the item has no repayment and no years, and `planMissing()` has no matching gate (the main mortgage has one, `mortYears`). The result is also not flagged as "worked out" (`loanPayEst` stays false). This breaks §14/§15 ("never default personal figures"; worked-out figures must be labelled). The main mortgage has the same `|| 25` in code but is gated, so it never reaches the customer. Owner: Developer. Fix: add "other mortgage years left (or your monthly repayment)" to `planMissing()`, label it "Worked out from your figures", and remove the literal 25.

**H3. Investment growth standard does not reconcile with its own wording (my earlier suggestion).** The Settings standard `inv` = 3.5% is described as "after about 1% charges and 38% exit tax". With the other standard `invGross` = 5% before fees and tax, the same description gives about 2.6% a year (5% less 1% charges = 4%; 38% exit tax with 8-year deemed disposal leaves about 2.6%). 3.5% corresponds to about 6% gross. So plan goals of 5 years or more are about 0.9 points a year more optimistic than the text says (about 19% on a 20-year pot: 1.035^20 = 1.99 against 1.026^20 = 1.67), and the growth/fees tools use a different gross figure from the plan. Owner: Financial planner (me) with Pooja's decision. Fix: derive `inv` from `invGross`, charges and exit tax in one place (Settings), or choose 3.0% and say "LifeMap standard"; reword so the sentence is true. Same, smaller: `pen` 4.5% "after charges" implies about 5.5% gross, above the 5% used for funds; confirm it is meant to be higher.

### MEDIUM

**M1. Headline can call retirement a "strength" while the customer overspends.** The retirement percentage counts only retired years; working-year shortfalls (24 short years in the test) are not in any goal %. `findings()` then says "Your main strength: Retire comfortably is 77%". Owner: Developer, with me for wording. Fix: if any working year has a living-cost shortfall, cap the retirement band at "Needs a nudge" or add the line "This assumes your spending today comes down to what you earn".

**M2. Partner assumptions are silent.** Partner work income stops at 66 (hard-coded `pa < 66`), partner pension contributions are ignored, and "Known limits" says only "partner's own pension and retirement age aren't modelled", which understates it. Partner age falls back to your own age (`pAge: n('pAge') || S.about.age`) and a typed partner income is still used when the partner is in "invite" mode. Married status left blank is taxed as individuals. Owner: Developer, with FP wording. Fix: state "We assume your partner works until 66 and then receives only their State Pension"; gate partner age in every partner mode that uses their income; ask married or civil partners when a partner exists.

**M3. Calculators open with made-up personal figures for a customer with no profile.** Fresh Explore: Borrow starts at income €60,000, deposit €25,000, Repayment at €300,000, Emergency at spending €2,500 and savings €6,250, Net worth at €15,000 / €10,000 / €60,000 / €350,000 / €250,000, Surplus at €3,500 income. These are the workbook default inputs (they are why calc-vs-xlsx matches). Market rates and judgement values are correctly blank with "Use the suggested rate" chips (good). The personal figures sit against §14/§15 ("never fill in a figure for them"). Owner: Pooja (decide), Developer, and workbook owner. Options: start personal sliders blank, or label the block "Example figures, not yours" and show it on the result.

**M4. Unknown card or loan APR is a dead end.** A customer with a card balance and no APR cannot see results (the card rate has no suggestion by design, there is no published average). Add a customer-chosen option such as "Use 23% (the legal limit for new cards)" labelled as prudent, not typical, and "Leave for my adviser". Owner: Pooja and Developer. The 23% cap itself is statutory (Consumer Protection (Regulation of Retail Credit and Credit Servicing Firms) Act 2022, new cards only); the app cites "Central Bank of Ireland", which should cite the Act.

**M5. Sources for the judgement standards are an internal file.** 23 of the 37 standards (all the type-3 planning ones: emergency fund months 6/3, save share 50%, no-answer €300, life cover 60% and 15 years, retirement multiple 25, retirement spend 80%, own share 50%, cash years 5, invest share 40%, risk illustrations, budget 50/30/20, drawdown) have `verify:false` and a source of `deliverables/irish-rules-and-rates-audit.md`. Customers see only the plain wording, so nothing is wrong on screen, but "source and as-at" is not met in the register for these, and they are not on the pre-release list. Owner: Proposition & Product Manager assigns; FP supplies the rationale. Label them "LifeMap planning standard, reviewed [date] by [name]" and add them to the pre-release list as a separate block.

**M6. Partner override has no guardrails or disclosure rule.** A partner can set `lumpSum` to 30% (law limit 25%; the engine clamps it but the chip would suggest it), can raise investment or pension growth, or lower safety months, with no bounds, approval or audit trail. For a lender or credit union this is a conflict-of-interest and suitability risk (Consumer Protection Code, MiFID II). Owner: FP and Pooja (with compliance). Fix: bounds per setting (law caps, a ceiling on growth standards), the label "Suggested by [partner]" kept visible, a change log, and a sign-off by LifeMap before a partner block goes live.

**M7. Emergency fund goal amount and months can disagree.** Months are consistent everywhere (pass), but (a) an automatic goal is rounded to the nearest €1,000 while the calculator target is exact (4 months x €3,100 = €12,400 vs goal €12,000); (b) when the customer types a goal amount (the sample: €15,000 against 4 x €4,920 = €19,680) the months box says 4 but the goal funds €15,000; (c) the goal amount is built from the standard months before the customer chooses them (the gate "Choose your emergency fund months" still holds the result back, but the goal tile shows a figure); (d) the calculator tip is a fixed "6 months". Owner: Developer. Fix: show "this is X months of your essential spending" under the amount; do not build the amount until months are chosen; make the tip follow the setting.

**M8. No warning when a stated card or loan repayment barely covers the interest.** The mortgage has "repayment looks low"; cards and loans do not. See §2 table. Owner: Developer.

### LOW

- L1. Typed own pension share above the monthly contribution is capped silently; pension contributions typed with income 0 or "Not working" are ignored with no message.
- L2. Other-property mortgage is amortised with an effective-APR conversion although a mortgage rate is nominal, and pooled into one weighted rate with loans. The effect is small (about 2% of interest); say "approximate" in Known limits.
- L3. "Mortgage-free" goal with no main mortgage still shows a percentage (52% in the test) beside "No mortgage in Your finances". Hide the percentage.
- L4. Life expectancy guidance uses CSO Irish Life Tables No. 17 (2015 to 2017). That was still the latest I could find. CSO said the next set would use 2021 to 2023 and follow after Oct 2025. Check whether it is out; if so update both figures.
- L5. `netPay()` has `age == null ? 40`, but it is only used by tests, not by the app. Remove or require age so it cannot leak later.
- L6. Test hygiene: retire the stale `I9_mortgageGoneAfter` label; make e2e and the v5 to v11 scripts assert, or label them smoke tests.

## 4. Hidden defaults: grep and test result

| Fallback | Where | Reaches a customer? |
|---|---|---|
| `|| 25` mortgage years (main) | `finNums()` | No: `planMissing()` gates "mortgage years left (or your monthly repayment)". |
| `: 25` mortgage years (other property) | `mort2Nums()` | **Yes** (H2). |
| `AS` initial values (2% / 3% / 1% / 3.5% / 4.5%, end 90, mortRate 3.75%, card 20%, loan 8%) | `AS` constant, `fb:` and `sug:` in `ASM` | No: `applyAssume()` overwrites them, and `planMissing()` blocks results until each needed item is chosen. They only keep the maths from breaking. |
| Plan-until age 90 or 95, retirement age | `planEnd.fb` | No: `planEnd` is gated and in the required three; retirement age has no fallback (`retireSet`). Partner "95" fallback is internal only. |
| Partner age = own age | `pAge: n('pAge') || S.about.age` | Only in invite mode (M2). |
| Work "Employed" | none found | No. Auto-enrolment needs `work === 'Employed'` typed. |
| 3% | pay rises and State Pension | Only as the suggested chip, with source. |
| Q6 not answered: €300 a month saving | `SAVE.noAnswer` | No: `noAnswer` is a gated, visible assumption. |
| Q6 band "Over €750" read as €1,000 | `SAVE.band` | Visible in "What you save" ("from your answer"). The €1,000 is our reading of an open band; say so. |
| Calculator slider starting values | `CALCS` inputs | **Yes** for personal figures (M3). |
| 5-year repayment when no or too small repayment given | `debtNums()` | Allowed by §15 as "worked out", flagged `debtPayEst`. |

Suggested figures: every market rate shows "Use the suggested rate (X%) · source, month" and is never pre-filled (checked on Repayment, Borrow, Retirement). Every judgement chip shows "Generally the standard is X (source)". All can be typed over. The card rate and buying fees correctly have no suggestion.

## 5. The 14 items flagged "verify before release" (Settings block)

The register also flags 81 of its 82 items (all except `sp.weeks`, a convention). Section 6 covers the register. Official Irish sites are blocked here, so none of the 14 could be checked on the primary page. I used web-search summaries only. My confidence is my professional judgement plus that limited evidence.

| # | Item (value, as-at) | Confidence | What must be checked |
|---|---|---|---|
| 1 | `infl` 2% (ECB target, 2025 strategy) | High | The ECB's 2% symmetric target stands. Replace the Bundesbank page with the ECB page and record the date. |
| 2 | `wage` 3% ("3% to 4% recently", CSO) | Medium | Latest CSO earnings release: confirm the "about 3% to 4% recently" claim still holds; reword if not. It is a planning figure, not a CSO figure. |
| 3 | `cash` 1% after DIRT (CBI, Jun 2026) | Medium | CBI deposit series: 1.92% fixed-term x (1 - 33%) = 1.29%, so 1% is a prudent blend with demand accounts. Say so, or cite the series. DIRT 33% itself is in the register. |
| 4 | `inv` 3.5% after charges and tax | **Low** | H3: the wording does not match 5% gross. Fix before release. |
| 5 | `invGross` 5% | Medium | LifeMap standard, not a forecast. Confirm with Pooja it is the figure for the growth and fees tools, and reconcile with `inv`. |
| 6 | `pen` 4.5% after charges | Medium | Compare with the Pensions Authority / Society of Actuaries projection guidance; state the implied gross figure. |
| 7 | `penRet` 3.15% | Medium | Same, lower-risk fund once retired. |
| 8 | `rentRise` 3% | Medium | Check against the latest RTB and CSO rent figures; it is a long-run planning figure. |
| 9 | `houseGrow` 2% | Medium | Check against the CSO Residential Property Price Index; keep the "prices can fall" wording. |
| 10 | `mortRate` 3.48% (Jul 2026) | Medium-high | A search summary of the Central Bank July release matches 3.48%. Open the primary table, record the date, say it is the average on new agreements, and refresh monthly. |
| 11 | `loanRate` 6.72% (Jul 2026) | Medium | June was 7.48% in the summaries I saw, so July is a large fall. Verify the July figure on the primary table, and check whether the series covers banks only (credit unions are not in it) and say so in the label. |
| 12 | `cardRate` none | High | The decision to show no suggestion is right (no published average). The 23% cap for new cards is statutory (Retail Credit Act 2022); cite the Act. The Central Bank found 400,000+ older cards above it. |
| 13 | `depRate` 1.92% (Jul 2026) | Medium | A summary showed a composite 1.96% for new household deposits with agreed maturity; the definitions may differ. Verify the series name and the July figure on the primary table. |
| 14 | `fundChg` 1% (Pensions Authority; "0.5% to 2%, CCPC") | Medium | Open both pages. The "usually between 0.5% and 2%" range needs a CCPC statement behind it (§17) or must go. |

Not on the list but should be: the life-expectancy guidance (L4), and the 23 non-flagged planning standards (M5).

## 6. Rules register (`RULES_IE_2026`) and Budget 2027

- 82 items, 81 flagged "verify", all with a source and as-at. Many law values rest on secondary pages (raisin.com, noonecasey.ie, irishtaxhub.ie, payslipiq.co.uk, zurich.ie, inou.ie, cantorfitzgerald.ie). The pre-release list says so and asks for the primary page. I agree with that approach; none of these should be called verified.
- My knowledge check of the main 2026 values (not a substitute for the primary pages): standard-rate band €44,000 single, €53,000 married one earner, +€35,000 second earner; credits €2,000 / €4,000 / PAYE €2,000; USC 0.5% / 2% / 3% / 8% at €12,012 / €28,700 / €70,044; PRSI 4.2% then 4.35% from 1 Oct 2026 (Class S €650 minimum over €5,000 income: supported by a search summary); State Pension €299.30; exit tax 38% with 8-year deemed disposal from 1 Jan 2026; SFT €2.2m for 2026, rising €200,000 a year; lump sum 25%, €200,000 tax-free and next €300,000 at 20%; ARF minimum 4% from 61, 5% from 71, 6% over €2m; auto-enrolment 1.5% / 1.5% / 0.5% for 2026 to 2028; stamp duty 1% / 2% / 6%; Help to Buy €30,000; Central Bank lending 4x / 3.5x / 90%. I found nothing that contradicts them. I could not confirm the survivor's pension €259.50, the age credit €245, the Home Carer limit €7,200, the single-parent credit €1,900 and the PRSI Class A credit figures; these are the least certain and the tax specialist should open them first.
- **Budget 2027 rule (§17, §23):** nothing from Budget 2027 is in any calculation or customer text. The prototype constant is the plain note "Budget 2027 changes (announced 6 Oct 2026) aren't included yet. We'll update LifeMap once they're final." Compliant. `docs/budget-2027-and-ranges.md` lists every reported figure as "not confirmed" and says so; I agree with that. Search summaries I saw today were pre-budget commentary and could not confirm any figure. No change needed; keep the register at 2026 values until Revenue, the Finance Act or DSP publish the rate and start date.

## 7. Calculators against the workbook

All 28 calculators, 5 cases each (defaults, 3 seeded random, 1 edge/blank-inflation case): 145 comparisons, 0 fails, constants identical (CONST DIFF 0, including the Settings values for mortgage, loan, deposit and fund charges). Money within €0.50, rates within 1e-6, texts exact. M3 is the only calculator issue (starting personal figures), and it is a policy question rather than a maths one.

## 8. What I could not verify

- No primary Irish page opened (gov.ie, revenue.ie, cso.ie, centralbank.ie, welfare.ie and the Irish press are blocked). Everything in §5 and §6 marked "search summary" is secondary.
- I did not re-run a visual check at 360x640 / 844x390 / 1280; those belong to the designer's round.
- I did not verify the Word spec text against the prototype (another agent has the Word file modified).
- Suitability: the product stays on the "guidance, not advice" side. Nothing I tested recommends a product. Partner-supplied rates (M6) are the one place where that line needs a rule.

## 9. Verdicts

| Work | Verdict | Required changes (by severity, owner) |
|---|---|---|
| Developer: cashflow and goal engine, per-card/loan/pension lists, mortgage-first Liabilities, goal ranking, honest funding, Option B goal lines | **Satisfied with changes** | H2 (Developer), H1 (Pooja then Developer), M1, M2, M7, M8 (Developer), L1 to L3 |
| Developer: Settings block (37 standards) and partner override | **Satisfied with changes** | M6 (FP + Pooja), M5 (Proposition & Product Manager) |
| Designer: financial content and copy in results, calculators, assumptions | **Satisfied with changes** | M3 (Pooja decides, Designer and Developer), M4, M1 wording |
| My own earlier work (FP audits, standards, fact-find and risk wording, rules register) | **Satisfied with changes** | H3 is mine to fix (inv 3.5%); M5 rationale is mine; L4 life-expectancy re-check |
| Pre-release list and Budget 2027 note | **Satisfied** | Add the 23 non-flagged standards and the life-expectancy guidance (Proposition & Product Manager) |
| Calculators vs workbook | **Satisfied** | None (M3 is a policy call) |

Release gate: H1, H2, H3 closed; the 14 items and the 81 register items checked on primary pages with the date recorded by the named checker.
