# PM sign-off review (6 Oct 2026)

Reviewer: Proposition & Product Manager. Read-only review of the prototype at HEAD 7358651 plus one uncommitted one-line wording change in the HTML, the workbook, the Word spec (being rebuilt, judged on structure) and docs/*.md.

Method: Playwright/Chromium walk at 390, 360 and 1280 (844x390 via the existing suite). Test runs this session: e2e 390 and 1280, 0 console errors; s21, s23, s24c, s25 all 0 fails; the earlier full suite (runall.out, 22:23) is green (e2e x3, precedence 57, rules 67, asm 35, choices 80, s19 34, s21 30, s22 21, s23 13, s24 22). Static check: every `data-a` in the HTML has a handler in `ACT` (0 dead buttons). Screenshots: `scratchpad/pm/shots/` and `scratchpad/pm/pm/b360/`.

## 1. Journey walk, as Pooja specified it

| Step | Result | Evidence |
|---|---|---|
| Cover: LifeMap, "The life you'd like, mapped out.", "Let's start", "An easy tool, built for you.", only "Why we ask" and "I have an invite", no disclaimer, no Ask | PASS | `shots/390-cover.png`, `1280-cover.png`; walk text |
| "What brings you to LifeMap today?" chips unchanged | PASS | `390-d1.png` |
| 6 Discover questions, Lifecast wording, money-term tags, Q8 Irish road wording | PASS | walk text Q1 to Q6; `390-q8.png` |
| Reveal: type, risk appetite, cushion, terms with layman lines, CTA "Get a more accurate picture: make my plan" | PASS | `390-reveal.png` |
| Save results (email only) or Skip, no password, no money | PASS | `390-save.png` |
| App shell Home / Explore / My Plan (centre) / Me / Experts; Ask appears only now | PASS | `ask 0` on cover, D1, Q1-Q6, reveal, save, invite sheet; `ask 1` on Home |
| 8-step builder, resumable, Ask kept inside | PASS | `pm/pm/b360/m-13..m-19` |
| Results order goals, found, what if, glance, end actions | PASS | e2e "plan order" line |
| Explore order: What-ifs, Focus on one area, Tools, videos, Calculators (6 rows) | PASS | probe: "What-ifs for your goals > Focus on one area > Tools for you > Watch > Calculators" |
| Focus tiles: 2 per row, photos on 5, drawn shield on Protection, last row full | PASS | `390-explore.png`, `390-explore-bottom.png` |
| Experts "Talk to a specialist" on Experts, C0, C1 and after matching | PASS | probe EXP, EXP2, C0 |
| Videos on Home and Explore, durations 1:14 and 1:22 match the files (74.0 s, 82.4 s) | PASS (playback not proven, see B3) | probe `video el` |

## 2. Decisions §10 to §25

| § | Decision | Status | Evidence / gap |
|---|---|---|---|
| 10 | Tabs, Ask, no bank connect, partner invite or manual, profile hub, not a gate | Met | tabs and Ask in walk; partner choices in `m-25`; Me hub in walk |
| 11 | Amendments (no "saving each month", priority once) | Met | e2e; s-tests |
| 12 | Restructure: 6 Qs, reveal, save or skip, shell, builder, 13 questions total | Met | e2e "UM count 13 ... 13 answered end to end" |
| 12 | Terms with layman line | Met | reveal |
| 13 | Rewritten profile questions with tags; header "3 of 7 left" | Met | `b360/m-19` |
| 14 | No invented defaults; law fixed; retirement age and plan-until never defaulted; "Choose your ... to see this" | **Partly met** | Retirement age and plan-until: met (Me says "retirement age not chosen yet"; calculator gate). **Age is defaulted to 38**: `LifeGoals-Customer-Journey-Prototype.html:956` (`about:{age:38`). Me shows "Age 38" before the customer gave any age; Retirement calculator "age prefilled 38" in e2e before a plan; Step 1 slider opens at 38. See F1. |
| 15 | "Not sure? See an example"; no "Estimate for me", "I don't have this", "Estimated" | Met | grep: 0 of each in HTML and workbook; example links on every field in probe text |
| 16 | LifeMap rebrand, cover, D1, Emergency fund tile, Q8 | Met in UI. Leftovers: "LifeGoals" appears only in code comments and `src:` file paths (HTML lines 276, 575, 576, 1097, 1565, 2119); workbook README B2 and 'Document reader spec' D60 name the file | acceptable (file names stay), see F6 |
| 17 | Irish Q8 tone, Explore order and Calculators rows, emoji aria-hidden, sourced ranges, Ask hidden | Met | walk; s21; docx check |
| 17 | Budget 2027 rule: change nothing until final | Met in prototype (`BUDGET27` line 420, no 2027 figures); **not met in workbook** | `Assumptions` B108-B112 still says "Update each constant on 6-7 Oct 2026" and lists guesses ("about +€2,000?") |
| 18 | Suggested market rates, partner-configurable, never pre-filled, law fixed | Met | s19, `asm.js` 35/35; chips in What-if text ("Use the standard (2%)") |
| 19.2-19.5 | Loans "+", blanks don't block, protection per product, pensions each | Met | probe LIAB, PROT, PEN screens; s19 |
| 19.6 | Settings block + admin view | Met (docx check: 37 standards = workbook = docx) | not re-walked; s19 |
| 19.7, 19.8 | Emergency fund months once; goal ranking | Met | s19; `rankHTML` |
| 20 | Copy pass | Met | ban-list grep 0 hits; copy-audit.md present |
| 21 | Specialist boxes and Focus tiles | Met | s21 30/30 |
| 22 | Step 7 skippable, "Choose 3 things", banner singular/plural | Met | `b360/m-31`, banner "14 details missing" |
| 23 | Emergency fund naming | **Partly met** | Prototype: one non-verbatim "safety net" left in the Explorer watch-out (line 647). "Safety money" in the Thin buffer line was changed to "emergency fund" in the working tree (uncommitted). Docx still says "Build the safety net within (years, for the plan)" (docx text line 7646) while the workbook C11 B8 says "emergency fund". |
| 23 | Cover photo embedded; report on phone quality and larger original | Photo met; **report missing** | no write-up in docs/; the side panel says "replace with a larger original". My view: soft but acceptable at 390; at 1280 the phone frame is the same size so it holds. Ask for a larger original (about 1600 px tall) for retina. |
| 23 | Budget note in "What your plan assumes" and results footnote | Met | probe FOOT line |
| 23 | pre-release-verify list | Met (95 items, owners suggested) | docs/pre-release-verify.md |
| 24.1 | Liabilities mortgage first, Yes/No, other property | Met | probe LIAB text; s24 22/22 |
| 24.2 | What-if grouped, live line | Met, with a clarity note (F8) | probe WI |
| 24.3 | Saving via downloads, fallbacks | Met in code (`dlGet`, lines 2805-2812); s24c 16/16; real shared-page run untestable here | |
| 25 | Five photos on tiles, two real videos on Home and Explore, honest failure message, "Captions not available yet" | Met in code; **playback unverified** | Playwright Chromium has no H.264: `err 4`, the failure card showed correctly with "Try again". Files are H.264 + AAC with moov at the front (good). Media files are mode 0600. Real-browser check outstanding (B3). |

## 3. Pooja's recurring principles

| Principle | Verdict |
|---|---|
| Never invent personal figures or defaults | FIX: age 38 (F1). Everything else clean; sample customer data appears only after "Load sample". |
| Retirement age and life expectancy never defaulted | PASS. `retireSet:false`, gates in calculator and Step 7. |
| Law fixed, market rates suggested not prefilled, with sources | PASS in product. Register sources are mostly secondary sites (raisin, noonecasey, irishtaxhub, payslipiq and so on, 51 mentions); all are on the verify list. Not visible to customers beside law values. |
| Honest results | PASS (rough-picture banner, "Missing counts as €0", gates). |
| No unconfirmed Budget 2027 numbers | PASS in product and docs/budget-2027-and-ranges.md (all "not confirmed"). FAIL in the workbook watch table (F2). |
| Irish tone, plain copy | PASS. Ban-list words: 0. One heavy spot: three stacked banners on the results top (F5). |
| Accessibility | PASS on what was tested: emoji aria-hidden, keyboard video, reduced motion (s21). Two things to fix: tag clipping at 360 (F4), page contains visually hidden `<h3>` that Playwright flags as clipped, harmless. |

## 4. Team grades

### UI/UX designer: B+ (satisfied with changes)
Strengths: the cover, Q8 road cards, reveal, Focus tiles with photos and scrims, calculator group rows and specialist boxes all match the decisions; 390 and 360 screens are clean; the Word spec is complete in structure (design system, Explore, rules, finances, cover, goals, naming, What-if, saving, Budget note, 28 calculators) and ships with an automated check (7473 passed, 20 planted errors found).

| Sev | Defect | Change required |
|---|---|---|
| High | `deliverables/uiux-spec-check.md` was run against b98e767 (336 pages, 14.3 MB). The docx was rebuilt at 22:10 (now 17 MB) and covers §23 to §25, but the check was not re-run on it. | Re-run the check on the final docx and prototype HEAD; update the commit hash, page count and size. |
| Med | Docx C11 workbook-only input still reads "Build the safety net within (years, for the plan)". | Change to "Build the emergency fund within (years, for the plan)" to match workbook C11 B8. |
| Med | Docx 7.1 says the "safety net" watch-out line belongs to the Contented type; in the prototype it is on Explorer (line 647). | Correct the type, or the line. |
| Low | Results top stacks three banners (missing details, preliminary guidance, rough picture) at 360 and 390. | Merge "Rough picture" into the missing-details banner, or collapse to one. |
| Low | Cover-photo write-up (§23) missing. | One short paragraph in design-notes.md, with the larger-original recommendation. |

### Financial planner: B (satisfied with changes)
Strengths: type 1, 2, 3 split applied; suggested rates with source and month; 95-item verify list; Budget 2027 findings clearly marked "not confirmed"; calculators and engine unchanged and verified (precedence 57/57, rules 67/67); workbook has Settings and Your lists, named cells, no "Estimate for me", no "safety net".

| Sev | Defect | Change required |
|---|---|---|
| High | Workbook `Assumptions` B108-B112 "BUDGET 2027 WATCH" says Budget 2027 "is due on Tuesday 6 October 2026" and "Update each constant on 6-7 Oct 2026"; the watch column holds unconfirmed guesses ("about +€2,000?"). This contradicts §17 and §23. | Rewrite: "Budget 2027 announced 6 Oct 2026; nothing used until final and official (Revenue / Finance Act, DSP). The 2026 values stay." Remove guessed amounts. Add the same customer note as the prototype. |
| Med | README B2 reads "Version 2.3 · 2 Oct 2026"; the workbook has had §14 to §24 changes since (file saved 6 Oct 21:20). | Bump the version and date; list the §15 to §24 changes. |
| Med | 896 of 1,584 formulas have no cached value, so a viewer that doesn't recalculate shows blanks. | Open and save in Excel/LibreOffice once so the cached values exist, or state it in the README. |
| Low | Register sources are secondary for most tax values. | Already on docs/pre-release-verify.md. Must be done before launch, not before prototype sign-off. |

### Web developer: B+ (satisfied with changes)
Strengths: 0 console errors across 390, 1280, 844; no dead handlers; every test script green; Ask rule, Explore order, Step 7, lists, downloads fallback and video fallback all work and are honest; §23 to §25 shipped the same day with tests (s23, s24, s24c, s25).

| Sev | Defect | Change required |
|---|---|---|
| High | Invented personal figure: `fresh()` sets `about.age = 38` (line 956). Me shows "Age 38" and Retirement calculator pre-fills 38 before the customer has given an age. | Start with no age. Step 1 slider shows a prompt until touched; "Next" needs an age; Me and calculators show blank or "Not given yet". Leave the sample customer (line 3208) alone. Update e2e expectations. |
| Med | At 360 px the tag "Your figure · from your answers" overflows the card on the Retirement age row of About you (`b360/m-25-sec-about.png`). | Let the tag wrap beneath the label at narrow widths. |
| Med | Real video playback is unproven (headless Chromium has no H.264). Media files are mode 0600. | `chmod 644 media/*`; test the two videos in desktop Chrome and iOS Safari; report the result. |
| Low | Explorer watch-out line says "safety net" (line 647); the "Thin buffer" fix is uncommitted. | Commit it; change line 647 to "emergency fund", or list it for Pooja with the other verbatim exceptions. |
| Low | The "Welcome! Make your plan..." toast has the same wording on every tab right after Save/Skip. | Show it once. |

### PM (me)
journey-spec.md §4 table and age list (lines 185, 194) still say "safety net". They are superseded by §16 and §23 but contradict them in one file. I will add a "Superseded by §23" note; it is not a blocker.

## 5. Verdict: SATISFIED WITH CHANGES

The journey matches Pooja's decisions, tests are green, and nothing breaks the xlsx gates. I do not approve release until the 3 must-fix items below are done.

| # | Change | Owner | Must before release |
|---|---|---|---|
| F1 | Remove the age default 38 (line 956 and its uses) | Web developer | Yes |
| F2 | Rewrite workbook Assumptions "BUDGET 2027 WATCH"; bump README version; re-save with cached values | Financial planner | Yes |
| F3 | Re-run docx check on final docx and HEAD; fix C11 "safety net" and the Contented/Explorer mismatch | UI/UX designer | Yes |
| B3 | Play both videos in real Chrome and Safari; chmod 644 on media | Web developer | Yes (before sharing the link) |
| F4 | Fix 360 px tag overflow on About you | Web developer | No (next round) |
| F5 | Reduce the stacked banners on the results top | UI/UX designer | No |
| F6 | Commit the "emergency fund" wording; change line 647 or list it for Pooja | Web developer | No |
| F7 | Cover-photo write-up and request a larger original | UI/UX designer | No |
| F8 | What-if card: move the Growth assumptions and inflation block below the saving controls, so the first thing seen is "Your monthly saving" | UI/UX designer with Web developer | No (Pooja to decide) |
| F9 | Replace secondary register sources with official pages; record the date checked | Financial planner, tax and pension checkers | Before launch, not prototype |
| F10 | Add "Superseded by §23" to the old safety-net lines in journey-spec.md | PM | No |
