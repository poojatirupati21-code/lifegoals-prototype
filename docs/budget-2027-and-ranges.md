# Budget 2027 and guidance ranges: findings (FP research round, 6 Oct 2026)

For Pooja to confirm before anything is implemented (journey-spec §17). The prototype and the workbook are unchanged.

## How this was checked

- **Official sites could not be opened from this environment.** The network proxy blocks gov.ie, assets.gov.ie, budget.gov.ie, revenue.ie, citizensinformation.ie, cso.ie, centralbank.ie, ccpc.ie, pensionsauthority.ie, welfare.ie and the press sites (WebFetch: "EGRESS_BLOCKED").
- **Only web-search summaries were available.** For Budget 2027 I limited the search to the official domains (gov.ie, assets.gov.ie, revenue.ie, citizensinformation.ie). The search engine summarises those pages, but I could not read the documents themselves.
- **The summaries are not reliable on their own.** The same searches returned figures from earlier budgets as if they were 2027 figures. Examples:
  - "SPCCC from €1,650 to €1,750" (that was Budget 2024; the 2026 value is already €1,900);
  - "Minister confirms €1.3 billion income tax package…" (an earlier year's press release);
  - a garbled "Child Support Payment… €6".
- **So nothing in Part A is marked "Confirmed".** Every Budget 2027 figure below is **"not confirmed: reported, official document not opened"** and must not go into the rules register until someone reads the Department of Finance / Revenue / DSP documents. The most efficient check is three documents:
  - the Department of Finance *Budget 2027 – Summary of Tax Measures / Policy Changes*;
  - Revenue's *Budget 2027 Summary* (revenue.ie/budget);
  - the DSP *Budget 2027 rates booklet / press release*.

## A. Budget 2027: changes that touch our rules register

Status key:
- **R** = reported consistently in official-domain search summaries *and* in press (Irish Times, RTÉ, TheJournal), but the document was not opened.
- **P** = press or secondary sources only.
- **–** = nothing found.

Every row is **not confirmed**.

| Area | Register key | 2026 value | Reported 2027 value | Reported effective date | Status | Where reported |
|---|---|---|---|---|---|---|
| Standard rate band, single | `it.band` | €44,000 | €46,500 (+€2,500) | 1 Jan 2027 | R | gov.ie *Statement by Minister Harris on Budget 2027*; citizensinformation.ie *Budget 2027*; Irish Times |
| Band, married one earner | `it.bandMarried` | €53,000 | €55,500 | 1 Jan 2027 | P (gov.ie says "proportionate increases" without the figure) | Irish Times / tax-calculator sites |
| Second-earner increase (max) | `it.bandUplift` | €35,000 | €37,500 (two-earner max €93,000) | 1 Jan 2027 | P | as above |
| Band, single parent (SPCCC) | `it.bandSPCCC` | €48,000 | not found (likely €50,500 if "proportionate") | — | – | — |
| Personal credit | `it.personal` / `personalMarried` | €2,000 / €4,000 | €2,125 / €4,250 (+€125 each) | 1 Jan 2027 | R (single); married figure inferred | gov.ie Harris statement; citizensinformation.ie |
| Employee (PAYE) credit | `it.paye` | €2,000 | €2,125 | 1 Jan 2027 | R | as above |
| Earned income credit | `it.eic` | €2,000 | €2,125 | 1 Jan 2027 | R | as above |
| Home Carer credit | `it.homeCarer` | €1,950 | €2,050 (+€100) | 1 Jan 2027 | R | as above |
| Rent Tax Credit | `it.rent` / `rentJoint` | €1,000 / €2,000 | €1,150 / €2,300 | Reported for the 2027 tax year. Whether it also applies to 2026 rent is not known. | R | gov.ie / citizensinformation.ie summaries; Irish Times |
| SPCCC credit | `it.spccc` | €1,900 | not found (the summary's "€1,650→€1,750" is Budget 2024: discard) | — | – | — |
| Age credit, age exemption | `it.ageCredit`, `ageExempt` | €245; €18,000 / €36,000 | not found | — | – | — |
| USC 2% band ceiling | `usc.bands[1]` | €28,700 | €30,300 (+€1,600, in line with the minimum wage) | 1 Jan 2027 | R | gov.ie / citizensinformation.ie summaries; Irish Times |
| USC other bands, rates, €13,000 exemption, 70+ reduced rates | `usc.*` | as register | no change found | — | – | — |
| Employee/self-employed PRSI | `prsi.path` | 4.2% → 4.35% (1 Oct 2026) → 4.5% (1 Oct 2027) → 4.7% (1 Oct 2028) | No new change reported. The 1 Oct 2027 step to 4.5% was already legislated (Budget 2025 roadmap). | 1 Oct 2027 (already in the register) | P | Irish Times |
| PRSI credit, employer threshold | `prsi.credit*` | as register | Employer PRSI threshold €552 → €600 reported. That doesn't affect employee take-home, and the employee PRSI credit is not mentioned. | — | P (single summary) | — |
| Pension tax relief %, €115k earnings cap, lump sum €200k / €500k, SFT path, ARF minimums | `pen.*` | as register | no change found | — | – | — |
| Auto-enrolment (My Future Fund) rates | `ae.*` | 1.5% / 1.5% / 0.5% | no change found. The 2029 step (3%) is from the 2024 Act, not this Budget. | — | – | — |
| State Pension (Contributory), under 80 | `sp.week` | €299.30 | €309.30 (+€10) | "January 2027". The exact week (usually the first full week of January) was not confirmed. | R | gov.ie DSP press release *Budget 2027: Minister Calleary secures Social Protection Package of €1.15 billion*; citizensinformation.ie; TheJournal |
| Over-80 supplement | `sp.over80` | +€10 | not found (the €10 core increase applies to the base rate) | — | – | — |
| Qualified Adult (66+ / under 66) | `sp.qa66` / `qaUnder66` | €268.40 / €199.40 | "proportionate increases for qualified adults". No figures found. | Jan 2027 | R (wording only) | gov.ie DSP press release summary |
| Illness Benefit (max personal) | `sp.illness` | €254 | probably €264 (core +€10). Only inferred from the Jobseeker's rise €254 → €264. | Jan 2027 | P (inferred) | press tracker sites |
| Widow's / Surviving Civil Partner's / Bereaved Partner's (Contributory), under 66 / 66+ | `sp.survivor` / `survivor66` | €259.50 / €299.30 | probably €269.50 / €309.30. Inferred from the "€10 on core rates" wording only. | Jan 2027 | P (inferred) | press tracker sites |
| DIRT | `sav.dirt` | 33% | no change found | — | – | — |
| Exit tax (funds / life policies) | `sav.exit` | 38% (from 1 Jan 2026) | 35% reported in one official-domain summary. No date. | not known | P (single summary) | — |
| CGT standard rate | not in register | 33% | 31% | not confirmed | R | gov.ie / citizensinformation.ie summaries |
| CAT thresholds A / B / C | not in register | €400k / €40k / €20k | €420k / €44k / €22k | not confirmed (normally the day after Budget day) | R | as above |
| Stamp duty (residential) | `home.stamp` | 1% / 2% / 6% at €1m / €1.5m | no change found | — | – | — |
| Help to Buy maximum | `home.htbMax` | €30,000 | €35,000 (+€5,000) | "with immediate effect" (6 Oct 2026) | R | gov.ie / citizensinformation.ie summaries; Irish Times |
| Mortgage Interest Tax Credit | not in register | max €1,250 for 2026 | A reduced credit (max €625) for 2027 was reported. That looks like a carry-over of an earlier decision, not a Budget 2027 measure. | 2027 tax year | P | — |
| Central Bank LTI/LTV limits | `home.lti*`, `ltv` | 4× / 3.5× / 90% | not a Budget matter, and no change found | — | – | — |
| Child Benefit (€140) | not in register | — | no change found. "Child Support Payment" increases were mentioned without reliable figures. | — | – | — |
| Fuel Allowance; Living Alone Increase | not in register | €38; €22 | €43 (+€5); €25 (+€3) | Jan 2027 (fuel season) | R | gov.ie DSP summary; press |
| Christmas Bonus | not in register | — | 100% bonus, paid in Dec 2026 | Dec 2026 | R | press |
| National minimum wage | not in register | — | +79c an hour | 1 Jan 2027 | R | gov.ie summary (the reason for the USC band change) |

**What I recommend (§17: each value applies from its own date):**
1. Add 2027 entries to `RULES_IE_2026` only after the documents are read. Each entry carries its own `eff` date and the plan picks the value by year. This mirrors the existing PRSI `path`, with a value and a "from" date per change.
2. Expected entries if confirmed:
   - **From 1 Jan 2027:** standard rate band, married band and second-earner increase; personal, PAYE, earned income and Home Carer credits; Rent credit; the USC 2% band.
   - **From the first week of January 2027:** State Pension and the other DSP rates we use.
   - **From 6 Oct 2026:** Help to Buy (only noted; the engine doesn't use it).
   - **Engine first:** if the exit tax change is confirmed, change the investment growth note first, because the "after tax" standard of 3.5% assumes 38%.
3. Re-run `rules.js` with a 2027 take-home table once the figures are confirmed.

## B. "Usually between X and Y" ranges: sources

**Rule (§17):** each range must name an official or published source. Where there is none, the range is removed and the input becomes optional, with no figure.

### Ranges found

- **Prototype:** in `RULES_IE_2026.guide` and the ASM / calculator range specs.
- **Workbook:** in the column-E guidance on each sheet.

| Range (where) | What we say now | Official / published source found | Verdict |
|---|---|---|---|
| **Deposit rate 2%–2.3%** (`guide.depLo/Hi`; prototype cash help text; workbook C07 E16, inside the "after DIRT" range text) | "Usually between 2% and 2.3% before DIRT" | **None.** The only figure we have is the Central Bank average for new household term deposits: 1.86% in June 2026, from the round-7 audit. The CBI page could not be opened today. | **Remove the range**, as §17 requires; the deposit rate becomes optional. If Pooja wants a figure, quote the CBI average with its month instead (after re-checking it). |
| **Deposit could earn after DIRT 1.3%–1.5%** (`depEarn`; workbook C07 E16) | derived from 2%–2.3% × (1 − 33% DIRT) | none, because it is derived from the range above | **Remove**; the input becomes optional (rent vs buy). |
| **"Credit unions often charge less"** (workbook C28 E7; the prototype no longer says it) | — | **Contradicted.** The ILCU (creditunion.ie) gives an average credit-union personal loan rate of 10.42% APR. The legal maximum is 1% a month (12.68% APR). The CBI average for new consumer lending is 7.48% (Jun 2026). | **Remove the line.** If a credit-union fact is wanted: "Credit unions can charge at most 1% a month (12.68% APR)" (legal limit; ILCU / CCPC). |
| **Personal loan 6%–10%** (`guide.loanLo/Hi`; workbook C28) | "Usually between 6% and 10% (CBI: new lending averaged 7.48%)" | Only the CBI **average** (7.48%, Jun 2026) is published. The CBI publishes no 6%–10% range. | **Remove the range.** Show only the sourced average: "New personal loans averaged 7.48% in June 2026 (Central Bank)". The input stays required where a loan exists, as type 2. |
| **Credit card 13%–23%** (`guide.cardLo/Hi`; workbook C27) | "Usually between 13% and 23% APR (Central Bank review)" | **23% only.** The Central Bank says new credit cards may not exceed 23% APR since 2022; about 400,000 older accounts are above it. No published source for 13%. | **Change** to "New credit cards can't charge more than 23% APR (Central Bank); some older cards are higher. Your statement shows yours." No lower bound. |
| **Mortgage 3.5%–4.5%** (`guide.mortLo/Hi`; workbook C01, C02, C04–C07, C23) | "Usually between 3.5% and 4.5% (Central Bank, new mortgages, 2026)" | Only the CBI **averages** are published: new mortgages 3.49% (fixed 3.46%, variable 3.96%), Jun 2026. No published range. Page not re-opened today. | **Remove the range.** Quote the averages with their month: "New mortgages averaged 3.49% in June 2026 (Central Bank)". Decision for Pooja: the rate stays a required type-2 entry when there's a mortgage and no statement, since the plan cannot amortise without it. |
| **Fund / pension charges 0.5%–1.5%** (`guide.chgLo/Hi`; fees tools; workbook C10, C12, C13, C14, C18, C19) | "Usually between 0.5% and 1.5%" | **CCPC** *Pension fees and charges*: annual management charges are "usually between 0.5% and 2%". The **Pensions Authority** pension calculator assumes 1% a year. | **Keep, corrected to 0.5%–2% (CCPC).** The 1% "typical charges" standard can cite the Pensions Authority calculator assumption. |
| **Buying fees €2,500–€3,500** (`guide.buyLo/Hi`; workbook C01, C03, C07) | "Usually between €2,500 and €3,500 for legal and survey fees" | **None found.** The CCPC home-buying guide lists the costs but I could not confirm a range. | **Remove the range**; the input becomes optional (stamp duty is still added by law). Re-add only if the CCPC (or the Law Society) publishes a figure. |
| **State Pension €0–€299.30 a week / €0–€15,564 a year** (`spWeek`, `pSpWeek`, C12 "other income") | — | **DSP** rate tables: full rate €299.30 (2026). Partial rates depend on contributions. | **Keep** (official). From Jan 2027: €309.30 and €16,084 a year, if confirmed (Part A). |
| **Survivor's pension €0–€299.30** (C21) | €259.50 under 66, €299.30 at 66+ | **DSP** rates (2026) | **Keep.** 2027: +€10 if confirmed. |
| **Illness Benefit €0–€254** (C22) | maximum €254; lower if earnings under €300 a week | **DSP** rates (2026) | **Keep.** 2027: probably €264, not confirmed. |
| **PRSI years 10–40** (`spYears`) | 40 for the full rate, at least 10 | **DSP** / law | **Keep.** |
| **Tax rate "20% or 40%"** (workbook C13/C14) | your top rate | **Revenue** (law) | **Keep.** The note also says "€44k single…": update it with the Budget 2027 band when confirmed. Workbook C27 E7 still says "else 20% card / 8% loan", an old default the prototype no longer uses; remove that note. |

### Other quoted guidance figures (not ranges; same rule)

- **"Irish pay has grown about 3%–4% a year recently (CSO)"** (pay-rise standard): CSO earnings data is the right source, but no current CSO figure was confirmed today. **Replace it with the latest CSO annual change in average weekly earnings, with its quarter, or remove it.**
- **"A typical mixed fund has grown 5%–6% a year before charges and tax"** (investment growth): **no official source.** Remove the range; keep "Generally the standard is 5% before charges and tax (LifeGoals standard)". That is labelled as our own standard, not a fact.
- **"At 65, life expectancy is about 83 (men) and 86 (women) (CSO)"**: the CSO Irish Life Tables are the right source, but it could not be opened today. **Verify the figures and the table edition.**
- **"Many people plan to 90–95"** (plan-until age): this is from §14, with no source. **Remove the range or attribute it**, for example to Pensions Authority guidance, if one is found.
- **"Ireland now 3.9% (CSO HICP flash, Sep 2026)"**: sourced, and already verified on 2 Oct.

## Summary for Pooja

**Budget 2027.** Nothing is confirmed, because the official documents could not be opened here. These headline changes are reported consistently and will be added once confirmed, each from its own date:
- **From 1 Jan 2027:** standard rate band €46,500; personal, employee and earned income credits €2,125; Home Carer €2,050; Rent credit €1,150 / €2,300; USC 2% band to €30,300.
- **From January 2027:** €10 on the State Pension (€309.30) and core DSP rates, with proportionate Qualified Adult increases.
- **From 6 Oct 2026:** Help to Buy €35,000.
- **Unclear:** the exit tax cut to 35%, the married/second-earner figures and the Illness Benefit / survivor rates need the documents.

**Ranges:**
- Keep the DSP and Revenue ranges.
- Correct fund charges to 0.5%–2% (CCPC).
- Card: keep only the 23% legal cap.
- Remove deposit 2%–2.3%, deposit-after-DIRT, loan 6%–10%, mortgage 3.5%–4.5% and buying fees, and quote sourced averages where they exist.
- Delete "credit unions often charge less" (their average is 10.42%).
