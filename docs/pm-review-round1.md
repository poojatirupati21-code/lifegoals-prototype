# PM review, round 1: LifeGoals-Customer-Journey-Prototype.html

Reviewer: Proposition & Product Manager · Date: 29 Sep 2026
Reviewed copy: `scratchpad/pm/snapshot.html` (a snapshot taken at the start of this review; the designer is applying spec §10 in parallel).
Method: code read + headless Chromium at 390×844 with touch (scripts `scratchpad/pm/walk*.js`, screenshots in `scratchpad/pm/`), plus a script that compares Discover wording against Lifecast `DISC` (`scratchpad/pm/verbatim.js`).
Out of scope (spec §10, in progress): Home/My Plan/Me/Experts tabs, floating Ask, partner invite/manual, Me hub, Risk/Capacity/Investor behaviour labels, and the Wedding/Car/Health tiles.

## 1. Item verdicts

| # | Item | Verdict | Evidence / exact change needed | Ref |
|---|---|---|---|---|
| 1 | Discover = 7 questions, word for word | PASS | The script found 0 differences in question text, sub-lines, emoji and options for Q2, Q4, Q6, Q7, Q8, Q9 and Q12. Scores and weights match. Behaviour tags are hidden. Chapter names match `DISC.ACTS`. | Brief §2; spec §2 |
| 2 | No uploads, money figures or registration in Discover | PASS | D0–D10 contain only tap cards, age, partner and dependants. The "Reality check" screen and chapter-intro screens are gone. | MASTER B6, B8; spec K1, K4 |
| 3 | D1 motivation (optional) and D9 (age, partner, dependants) | PASS | D1 can be skipped. D9 has 3 inputs, and its button is disabled until they are answered. | MASTER B5, B7 |
| 4 | D10 money-story glimpse is consistent | **FIX** | The same screen says "Cushion: **Some**" and then "your cushion is **thin**" (Q7 = "From money saved for something else"). It also says "Risk comfort: **Balanced**" next to "You're keen on growth" (Q8 = "Sunshine and showers"). Change `riskRead`: use one set of thresholds for both the label and the mismatch note. Cushion = Thin when Q7 s≤2, Some when s=3 (not reachable today, so use two labels: Strong / Thin). Fire "keen on growth" only when want = 4, or label want = 3 as "Balanced–growth". The Financial Planner confirms. | S1 K13–K17; spec §2 |
| 5 | D10 when questions are skipped | **FIX** | If all 7 are skipped, D10 still shows "Balancer" and "Safety first…". That is a result made from no answers. If fewer than 5 of 7 are answered, show "Answer a few more to see your money story" with a Back link, and no type or risk lines. | CJ E10 (no false result); S1 K22 |
| 6 | Understand Me = 13 questions (7 pre-filled + 6 new) | PASS | The counter shows "x of 13". Pre-filled answers carry the pill "From your first answers". UM9 is suggested from the timeline. This is within the 12–15 limit. | Brief §4; spec §3 |
| 7 | Nothing asked twice | PASS, 1 FIX | Name, email, age, retirement age and partner are pre-filled downstream (About you, P1). The partner flag and dependants from D9 are not shown in About you (see N7). **FIX (N1):** "Saving each month now" (Assets) is not used by the engine (`finNums` ignores `saveM`), and to a customer it reads as Discover Q6 asked again. Remove it, or use it only for the ⚠️ cross-check against Q6. Spec §5 amendment proposed. | Brief §3; spec §8 |
| 8 | Stage gate: temporary session, then optional email save | PASS | The save sheet asks for email only and says "no money details yet". Its comms box starts unticked. The email carries into P1. | MASTER C8, B21 |
| 9 | Stage gate: account + email + SMS verified before finances | PASS | P1, then email code, then SMS code, then an optional passkey, then P2. P2 is not reachable any other way (except the reviewer jump panel). | MASTER D8; CJ D5 |
| 10 | Consents start unticked | PASS | P1 c1 and c2 start unticked, and the button stays disabled until c1 is ticked. P4 accuracy tick starts unticked. C2 has 4 share items plus an agree box, all unticked, and the button stays disabled until they are ticked. | CBI CPR 2025; MASTER D21, G21 |
| 11 | Guidance-not-advice labels | PASS | Shown on D0, D10, the results top label, the results footer, the explain sheets, the report and the profile. | MASTER B21, E21, F21 |
| 12 | Referral / conflicts disclosure | **FIX** | The "How LifeGoals makes money" sheet shows the placeholder "**[confirm the actual model]**" to the customer. Remove it from customer copy and put it in the reviewer side-panel note. | MASTER G21 |
| 13 | Consent wording before adviser access | **FIX** | C0 says "Your adviser sees this, so you won't repeat yourself" before any consent. Change it to "You can choose to share this with your adviser, so you won't repeat yourself." | MASTER G21; CJ G4 |
| 14 | Timeline drag and drop (screenshot 4) | PASS | Touch drag moved a goal from 42 to 58 and the row "When" updated live. `touch-action:none` is set. Keyboard arrows work. Chips sit in lanes and don't overlap. Dragging the retirement flag sets the retirement age everywhere. | Brief §7; MASTER C7, E7 |
| 15 | Edits under the timeline are optional | PASS | Each row has When, Amount and Saved so far, with sensible defaults. "More details" is collapsed and uses chips only. | MASTER C9; spec §4 |
| 16 | Timeline axis readability | FIX (nice) | Chips say "in 2 yrs" but the ticks are ages (50, 60…) with only a tiny "age" label. Label the ticks "age 50" or add a caption "Ages along the line". Screenshot 4 uses years. | Brief §7 |
| 17 | Timeline is the centre of My Plan | **FIX** | My Plan opens on **Results**, and the timeline is a second segment. Make the timeline the top of My Plan: timeline, then the "x of y goals on track" strip, then results below (or make Timeline the default segment once first results have been seen). Arriving from P4 may still land on results the first time. | Brief §7; spec §7 |
| 18 | Your finances: 6 sections, each Upload or Type it | PASS | About you · Income and expenses · Assets · Liabilities · Protection · Pension. Smart upload sits at the top. Every field has "Not sure? Estimate for me" and "I don't have this". Mortgage fields show only for "Own with mortgage". | Brief §8; MASTER D7, D23 |
| 19 | Upload failure fallback | PASS | A file named "fail…" shows "We couldn't read that one", then Type it. The document stays on the "Still to add" checklist. | CJ D10 |
| 20 | Skipped data used silently in results | **FIX (must)** | Skipped sections are filled with typical figures. With Assets skipped, the engine used **cash €8,000**. A skipped Pension would use (age−25)×€3,500. P4 and the report label these "Missing". Either treat missing money fields as €0 in `finNums`, or label them everywhere as "Missing: we used a typical figure of €X" (P4, the results "Rough picture" note, report §6). Preferred: €0, plus the existing "Rough picture" note. | MASTER D12, D22, E21; CJ E10 |
| 21 | P4 data-gap review is not overwhelming | **FIX** | Skipping 3 sections gives **11 separate "Missing" rows**, each with 2 links. Group them by section: "Assets · skipped · Add now / Leave for my adviser". Show item rows only for sections that are partly filled, and for ⚠️ conflicts. | MASTER D9, E7; brief (layperson) |
| 22 | Results order | PASS | Your goals, then What we found (strength / gap / decision + "That makes sense"), then What if, then Your future at a glance, then Download / Book / Adjust (checked in the DOM). | Brief §9; MASTER E22, E24 |
| 23 | Your goals box (screenshot 5) | PASS | Heading and sub-line are exact. Each row has name, "in N years", bar, % and status word. The retirement row is included. | Brief §9.1 |
| 24 | What if: ± monthly and lump sum | PASS | Monthly −€500 to +€1,000 in €25 steps, one-off €0–€50,000. The text updates live ("Retire comfortably goes from 48% to 51%"). Save as preferred plan and Back to my plan both work. | MASTER F7, F8; CJ F6, F10 |
| 25 | Your future at a glance: Journey / Life chapters / Detail | PASS, 2 FIX (nice) | All 3 tabs render and look like screenshots 1–3. **(a)** In Detail, the "– – your income each year" legend runs into the "retire" marker when retirement is early: move the legend below the chart. **(b)** In Life chapters, the ☀️ icon appears with the text "Some years dip into savings": use 🌤️ or align the text with the icon rule. | Brief §9.3–4 |
| 26 | Three end actions | PASS | Download opens the report. Book goes to C0, then C1 to C4. Adjust goes to the My Plan timeline. | Brief §9.5 |
| 27 | Report content | PASS | 9 sections: summary + goals %, roadmap (journey + chapters), cashflow chart + year-by-year table, detailed plan in plain words, what-if, money snapshot with flags, personality/profile, adviser questions, assumptions + not advice. | MASTER F7, E25; spec §6 |
| 28 | Report at 390px | **FIX** | The sticky bar clips the title ("ur feGoals an") and pushes Close off-screen. The cashflow table overflows sideways. Let the bar wrap (or use a short title), and put the table in an `overflow-x:auto` wrapper (or show fewer columns on mobile). | Brief (layperson); spec §6 |
| 29 | Assumptions sheet copy | **FIX** | The customer sees "The Financial Planner will confirm these." Move this to the reviewer note. | MASTER E21 |
| 30 | Adviser match, share and booking | PASS | Specialist type comes from the weakest goal. "See another match" and "Request a call back" work. There are slots and "Request another slot". The booked screen has email/SMS, the .ics file and "What happens next". | MASTER G7, G12; CJ G6, G10 |
| 31 | Privacy: delete my data | PASS | Delete, then confirm, resets to D0. | MASTER B21, J21 |
| 32 | Leftover complexity from old prototypes | PASS | There are no calculators, videos, the 10 assessments, Reality check, chapter intros or theme switchers. | Spec §7 |
| 33 | Dead buttons / errors / overflow | PASS | Every `data-a` on every screen visited maps to a handler. There were 0 page errors and no horizontal overflow in app screens (the report is covered in #28). | — |
| 34 | Focus outline on headings | FIX (nice) | After programmatic focus, a yellow `:focus-visible` box shows on each h2 (D0, "Your results"). Add `h2[tabindex="-1"]:focus{outline:none}`. | Brief (visual polish) |
| 35 | Priority asked in two places | FIX (nice) | Priority is in F2 "More details" and again in F4. Keep it in F4 only (the recap) and remove it from More details. Spec §4 amendment proposed. | Spec §8 (ask once) |
| 36 | Understand Me section 2 length | FIX (nice) | Six questions sit on one long screen (about 300 words), 4 of them already answered. Collapse the pre-filled ones into a "Your first answers" summary with Change. Coordinate with §10.5 (Me hub re-check). | Brief §4 |

## 2. Prioritised FIX list

### Must-fix (blocks approval)
1. **#20 Silent estimates.** Treat missing money fields as €0 (or label every estimate used). Do not let results rest on figures the customer never gave.
2. **#4 D10 contradictions.** Cushion and risk labels must agree with the "You might notice" line.
3. **#17 Timeline is the centre of My Plan.** Put it at the top by default, with results below.
4. **#21 P4 grouping.** One row per skipped section, not one row per field.
5. **#12, #29 Placeholders in customer copy.** Remove "[confirm the actual model]" and "The Financial Planner will confirm these."
6. **#13 C0 consent wording.** Change it to "You can choose to share this with your adviser…".
7. **#28 Report on mobile.** Fix the clipped header bar and the overflowing table.
8. **#5 Skipped Discover.** Show no personality or risk result when fewer than 5 of 7 are answered.

### Nice-to-have (this round if time allows)
- N1 (#7): remove "Saving each month now", or use it only as the Q6 cross-check.
- N2 (#16): label the timeline ticks as ages.
- N3 (#35): ask priority only once (F4).
- N4 (#34): hide the heading focus outline after programmatic focus.
- N5 (#25): move the Detail legend below the chart, and align the Life-chapter icon with its text.
- N6 (#36): collapse pre-filled answers in Understand Me section 2 (with the §10.5 Me hub work).
- N7 (#7): show the partner and dependants from D9 as pre-filled rows in About you (with the §10.5 Me hub work).

### Spec amendments proposed (not yet applied to journey-spec.md)
- §5 Assets: drop "Saving each month now" (N1).
- §4 F2: "More details" keeps only *For whom* and *Flexible on timing?*. Priority moves to F4 only (N3).
- §5 Minimum-data rule: skipped figures count as €0 in the engine and are shown as ❓ Missing (#20).
