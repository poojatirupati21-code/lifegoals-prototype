# LifeGoals — Customer Journey Spec (round 1)

Owner: Proposition & Product Manager · For: UI/UX designer (Agent 1), then Financial Planner and Web Developer
Binding sources: `LIFE Goal Journey Book.xlsx` → **MASTER JOURNEY FOR ALL** ("MASTER") and **CUSTOMER JOUNERY** ("CJ"); Steps 1–5 sheets; `docs/brief-from-pooja.md`.
Cell references: "MASTER B8" = column B (Step 1), row 8. "CJ D6" = Phase 3, Customer actions. "S1 E9" = Step 1 Discovery sheet, and so on.

Rules for everyone building from this spec:
- Do not add screens, questions or features that are not listed here. If something seems missing, raise it as an open question.
- Every answer is asked **once**. After that it is shown pre-filled and can be edited (see §8).
- Customer copy: plain English, UK/Irish spelling, €, short questions, options of about 6 words or fewer.
- Never recommend a product. Results are "preliminary guidance" (MASTER E21, F21). Advice happens only with an authorised adviser (MASTER H21).
- Consent checkboxes always start **unticked**. The Central Bank's Consumer Protection Regulations 2025 (in force since 24 Mar 2026) ban pre-selected confirmations. The latest prototype pre-ticks "Use my answers…" (ACC-01), which must change.

---

## 0. Key decisions

| # | Decision | Why (xlsx / brief) |
|---|---|---|
| K1 | **Discover stays at the very start as a short "glimpse"**: 7 tap-card questions, about 2 minutes, a light money-story result, no sign-up, no uploads and no money figures. | MASTER B7, B9 and B25 put the questionnaire in Step 1. B6 asks for "relevance and trust before requesting financial data". CJ B10 asks for a "progressive start". CJ B12 measures start-to-Step-2 conversion, so an early result helps. |
| K2 | DISC **Q11 (goal picker) moves out of Discover** and becomes the first Define screen. Its question text and tiles stay word for word. Only the sub-line changes and the 3-goal limit goes. | Goal selection is Step 2 (MASTER C7, CJ C6, Step 2 sheet). |
| K3 | "Tell us what brought you here" (MASTER B5) is **one optional tap screen**. "Basic details about self and dependants" (MASTER B7) is **one small screen at the end of Discover**: age, partner, children. Name is taken at account creation. The finances "About you" section **only shows these pre-filled** and adds retirement age, which is itself pre-filled from the timeline. | Avoids asking anything twice. Age drives the life-stage goal suggestions (Step 3 sheet). |
| K4 | The latest prototype's "Reality check" (take-home pay and savings sliders before any account) is **removed**. | Money figures before account and verification break MASTER B6 and D8. They would also duplicate "Income & expenses". |
| K5 | **Understand Me = 13 questions.** 7 are pre-filled from Discover and 6 are new, in 3 sections. It lives in the **Me** tab. It is also offered, optionally, just before booking an adviser. | Brief §4 sets a 12–15 limit. It covers the ESMA/CBI suitability areas (see §3). |
| K6 | App shell = **3 tabs: My Plan · Me · Experts**. Remove Explore (35 calculators), videos, AI chat, the 10 assessments and the theme/name switchers. | These are not in the xlsx and they add overwhelm (see §7). |
| K7 | Account creation + email **and** mobile verification happen **once**, straight after Define and before "Your finances". | MASTER D8, CJ D5. |

---

## 1. Journey map

Gate key: **T** = private temporary session, no registration (MASTER B8). **E** = temporary session + optional email-only save, no financial documents (MASTER C8). **A** = full account, email + phone verified (MASTER D8 onward).

| # | Screen | What the customer does | xlsx row(s) satisfied | Gate | Data captured |
|---|---|---|---|---|---|
| **Phase 1 · Discover — "Start with why"** |||||
| D0 | Welcome | Reads a one-screen value promise and trust line: "Free · No obligation · Nothing saved or shared without your say". Taps **Start · about 2 min**. Link: "I have an invite". Privacy note: "We only use your answers to show your results. Nothing is saved unless you choose." Link: "Why we ask". | MASTER B4–B6, B8, B21; CJ B4–B5; S1 K22 (GDPR layer, "guidance, not advice") | T | Entry source (direct / referral / employer / adviser invite), captured silently (MASTER B8, B13) |
| D1 | What brought you here? | Taps 1 or more chips, or **Skip**. Chips: *Am I on track?* · *A big life change* · *Thinking about retirement* · *My adviser or employer sent me* · *Just curious* | MASTER B5; CJ B7 ("motivation") | T | Motivation (tags only) |
| D2–D8 | Discover questions (7) | One question per screen. Tap cards, auto-advance, Back allowed. The chapter progress bar stays (5 segments). **No separate chapter-intro screens**: the chapter name sits in the eyebrow instead. | MASTER B7 ("Risk, Capacity, Investor behaviour – Take Questionnaire"), B9; CJ B6 | T | 7 answers (§2) |
| D9 | A bit about you | 3 quick inputs: **Your age** (stepper or slider), **Planning with a partner?** (Yes / No), **Children or others who rely on you** (0, 1, 2, 3+). | MASTER B7 ("basic details about self and dependants"), B9; CJ B6, B7 | T | Age, partner flag, number of dependants |
| D10 | Your money story (glimpse) | Sees: money personality card, 1 line on risk comfort, 1 line on cushion, and a "you might notice…" mismatch hint (S1 K13–K17). Note: "A first read, not advice. You can go deeper later in *Me*." Main button: **Build my LifeMap**. Secondary: "Save my answers" (email only, see F3). | MASTER B22, B24 (completion); CJ B8, B11 ("Chooses Build my LifeMap") | T | Result snapshot |
| **Phase 2 · Define — "Shape your LifeMap"** |||||
| F1 | Pick your goals | Uses DISC Q11 word for word: "What's next in your life story?" Tiles are ordered by age / life stage, with "Suggested for you" on the top 3–4. The customer picks any number. "Something else" opens the Step 2 category list with examples, plus a free-text name. | MASTER C7; CJ C6; Step 2 sheet; Step 3 sheet (suggest first, hide nothing) | T/E | Goal list |
| F2 | Your timeline | Drags goal chips along an age line (screenshot 4). The Retirement flag is always there, draggable, default age 66. Under the line is one row per goal: when + amount (today's money) + saved so far. A "More details" link on each row shows the optional fields (§4). | MASTER C7, C9, C12, E7 ("adjust it on timeline and edit if needed"); CJ C6, C7; Step 3 A13–A14 | T/E | Per goal: name, target age/year, amount, saved so far, and optionally beneficiary, priority, flexibility. Retirement age. |
| F3 | Save my progress (optional) | A small banner on F1/F2 and a prompt when leaving F2: "Save and come back later". **Email only**. The customer gets a magic link and a "Saved ✓" toast. | MASTER B12, C8; CJ B9 ("save confirmation"), C9, B10 ("save/return"), C10 ("finish later") | E | Email (optional); comms choice, unticked (MASTER B21) |
| F4 | Confirm my LifeMap | A short recap of the goals on the line. Button: **This looks right**. It needs at least one goal with a when and an amount. Priority defaults to "Must have" and can be changed. | MASTER C22, C24; CJ C8, C11 ("one meaningful model-ready goal") | E | Confirmation, plan version 1 |
| **Phase 3 · Prepare — "Add your money once"** |||||
| P1 | Create your account | Heading: "To add your money safely, let's set up your account." Fields: first name, email (pre-filled if saved at F3), mobile. Then: 6-digit email code → 6-digit SMS code. Passkey / Face ID offered as an extra after verification. Consent (unticked): **required** "Use my details to build my plan"; **optional** "Send me reminders and updates". Link: "How LifeGoals makes money". | MASTER B7 ("Login – Register and verify"), B12, B25, D8, D21; CJ D5 | → A | Name, email, mobile (verified), consents with timestamp |
| P2 | Your finances (hub) | 6 section cards with a status each (Not started / Done / Needs a look). At the top: **one smart upload** ("Add any documents — we'll sort them"). Each section can also be filled with **Upload** or **Type it**. The customer can skip any section except the minimum (see P4). | MASTER D7, D9, D23 (upload + mandatory manual fallback); CJ D6, D7; Step 5 A14 ("customer never has to know which document maps where") | A | Documents, extracted fields with confidence |
| P3a–f | 6 sections | About you · Income & expenses · Assets · Liabilities · Protection · Pension (§5). Every field has **Not sure? Estimate for me** and **I don't have this**. | MASTER D7, D9; CJ D6; Step 4 sheet | A | See §5 |
| P4 | Check your details | Data-gap review. Shows **only** items that are estimated, missing, conflicting or out of date. Verified items are collapsed. Required tick (unticked): "These details are right, as far as I know". Button: **See my results**. | MASTER D9 ("reviews data gaps"), D12, D21, D22, D24, E7 ("reviews only items marked uncertain, conflicting or missing"); CJ D8, D11 | A | Data-quality flags, accuracy confirmation |
| **Phase 4 · Understand — "See your life roadmap"** |||||
| U1 | Building your plan | Loader: "Running your numbers…". If the engine is slow: "We'll let you know when it's ready" (email/SMS notification). Never show a made-up result. | MASTER E8, E12; CJ E9, E10 | A | — |
| U2 | Your results (one scrolling page, order is fixed, §6) | ① Your goals box → ② What we found (light understanding check) → ③ What if → ④ Your future, at a glance (Journey / Life chapters / Detail) → ⑤ 3 end actions. A "Preliminary guidance" label sits at the top, with an "Assumptions" link. | MASTER E7, E9, E11, E21, E22, E24, E25; CJ E6, E8, E11 | A | Understanding check completed; plan version |
| **Phase 5 · Get ready — "Explore future forks"** (on the results page, not separate screens) |||||
| G1 | What if | ± monthly contribution slider and a one-off lump-sum slider. Changes are live. "Save as my preferred plan" / "Back to my plan". | MASTER F7 ("add or reduce fund… lumpsum or periodic"), F8, F9, F12, F23; CJ F6, F10 | A | Scenario(s), saved direction |
| G2 | Download my plan | A PDF with the contents in §6. Also saved in My Plan. | MASTER F7 ("Download Report"), F12, E25; CJ E6, E9 | A | Report version |
| G3 | Adjust my goals | Returns to the timeline (F2 view inside My Plan) and recalculates. | MASTER E7, F9; CJ F6 | A | New plan version |
| **Phase 6 · Connect — "Match, meet & verify"** |||||
| C0 | (Optional) Help your adviser know you | "6 quick questions, about 2 min. Your adviser sees this, so you won't repeat yourself." Opens Understand Me with the 7 Discover answers already filled. The customer can skip. | CJ G4 ("without repeating everything"); MASTER G12 (match profile) | A | Understand Me answers |
| C1 | Your match | Match preview: specialist type from Step 5 mapping (e.g. mortgage expert for a home goal), with name, photo, qualifications, languages, location, and video or in-person. Buttons: "See another match", "Request a call back". | MASTER G7, G9, G12; CJ G6, G10; Step 5 sheet | A | Chosen adviser |
| C2 | Share your plan | **Explicit consent** (unticked) and a list of exactly what will be shared: plan report, finances, documents (each can be toggled), Understand Me profile. Also shows the referral / conflict disclosure: "LifeGoals may be paid a fee by…". | MASTER G21 ("explicit consent before adviser access; referral/conflicts disclosed"); CJ G6, G7 | A | Consent record per item |
| C3 | Pick a time | Slots, video or in person. "Request another slot". | MASTER G7 ("save the date or request for another slot"); CJ G6, G9 | A | Booking |
| C4 | You're booked | Confirmation by email + SMS + calendar file. "What happens next" note (below). | MASTER G7, G8, G22; CJ G8, G9 | A | — |

**What happens next** (shown on C4; phases 7–9 are out of scope): the adviser reviews your plan → a verification call where you confirm details and add any missing documents through the secure portal (MASTER H7, CJ G6) → your adviser prepares your personal plan and you agree it together (Phase 7) → you take action (Phase 8) → LifeGoals keeps tracking and reminds you about reviews (Phase 9).

**Self-guided exit** (MASTER G7 "chooses self-guided next steps"): the customer can stop at the results and use My Plan. Nothing forces booking.

---

## 2. Discover set — 7 questions (word for word from Lifecast `DISC`, line ~215)

Question text, sub-lines and options are copied exactly. Do not reword them.

| # | DISC id | Chapter | Question (verbatim) | Options (verbatim) | Covers S1 section |
|---|---|---|---|---|---|
| 1 | Q2 | 1 · Your money mindset | Your friends would say you're always… | 📊 Sticking to a budget · 🔍 Checking your balance · 📱 Trying something new · 🧘 Relaxed about money | **A** About you and money (money personality) |
| 2 | Q4 | 2 · How you decide | A friend's investment doubled in a month. What do you do? | 🏃 Buy in quickly, before I miss out · 🔎 Research it before I decide · 🧑‍💼 Ask an expert first · 🙅 Stay away. Sounds too risky | **C** Ups and downs (behaviour: herd / loss aversion) |
| 3 | Q6 | 3 · Your investment capacity | How much could you comfortably invest each month? *(sub: Without cutting back on everyday life.)* | 🪙 Under €100 · 💶 €100 to €300 · 💰 €300 to €750 · 🏦 Over €750 · 🎢 It changes month to month | **D** What works for your budget (investment capacity) |
| 4 | Q7 | 3 · Your investment capacity | A €1,000 bill arrives tomorrow. How do you pay it? | ✅ From my emergency savings · 🐷 From money saved for something else · 💳 Credit card or a loan · 😬 I'm not sure | **D** (emergency buffer / capacity for loss) |
| 5 | Q8 | 4 · Your risk appetite | Pick a forecast for your long-term money. *(sub: Sunny means steady growth. Stormy means bigger ups and downs, with more growth potential.)* | ☀️ Calm and steady · 🌤️ Mostly sunny · 🌦️ Sunshine and showers · ⛈️ Stormy, but exciting | **B** How you see risk (risk appetite) |
| 6 | Q9 | 4 · Your risk appetite | Your €10,000 investment drops to €8,500. What do you do? | 😱 Sell before it drops more · 😬 Wait until it's back to €10,000, then sell · 😌 Stay calm and hold on · 🛒 Buy more while it's cheaper | **C** (risk composure under stress) |
| 7 | Q12 | 5 · Your next chapter | How do you feel about your financial future? *(sub: Every answer is normal.)* | 😟 Worried · 🤞 Hopeful · 😌 Confident · 🙈 I avoid thinking about it | **A** (financial anxiety) |

Coverage: 5 chapters, at most 2 per chapter. S1 sections A, B, C and D are covered here. **E (time horizon)** and **F (knowledge & values)** are left for Understand Me, and the time horizon is also inferred from the goal dates.

Not used in Discover:
- **Q1** and **Q3**: two more money-mindset questions. The chapter limit is 1–2, and Q2 carries the same personality weights.
- **Q5**: inertia, a lower-value second behaviour question.
- **Q10**: time horizon. It would be a third chapter-4 question, so it moves to Understand Me.
- **Q11**: the goal picker, which becomes Define F1 (K2).

Remove the **"tag" labels** ("FOMO · Herd behaviour", "Panic selling", etc.) from the customer view. They are for the adviser only and a customer could find them judgemental. The Financial Planner (Agent 2) must re-check the personality scoring: with Q1 and Q3 gone, the A/B/E/C type comes from Q2 + Q4 weights.

**Money-story glimpse (D10)**: personality (Achiever / Balancer / Explorer / Contented, with its existing strap line) + "Risk comfort: *Balanced*" + "Cushion: *Some*" + at most one mismatch line in S1 wording, e.g. "You're keen on growth, but your cushion is thin — build the safety net first." The footnote is S1 K22 plus `DISC_FORMAL`.

---

## 3. Understand Me — 13 questions (7 pre-filled + 6 new)

Where: **Me → Understand me**. This replaces all 10 `ASSESS` blocks. It is also offered at C0. Layout is one screen per section. Pre-filled answers show as selected with a "From your first answers — change if you like" note. The whole thing takes about 2 minutes, because only 6 questions are new.

### Section 1 · About you & money (4)
| # | Question | Options | Source |
|---|---|---|---|
| 1 | Your friends would say you're always… | (as §2 Q2) | **Pre-filled** (D2) |
| 2 | How do you feel about your financial future? | (as §2 Q12) | **Pre-filled** (D8) |
| 3 | A friend's investment doubled in a month. What do you do? | (as §2 Q4) | **Pre-filled** (D3) |
| 4 | When making an important financial decision, do you prefer to… | Research everything myself · Understand the basics, then speak to an expert · Speak to an expert first · Keep things as simple as possible | **New.** From the ASSESS "planning" block (3 of its options kept, "Compare several options carefully" dropped). Used for adviser matching (MASTER G12 "preferences"). |

### Section 2 · Your risk profile (6)
Heading copy: "Three things make up your risk profile: how much risk you **want** to take, how much you **can** afford to take, and **how long** you can wait."
| # | Question | Options | Measures | Source |
|---|---|---|---|---|
| 5 | Pick a forecast for your long-term money. | (as §2 Q8) | Attitude to risk / appetite | **Pre-filled** |
| 6 | Your €10,000 investment drops to €8,500. What do you do? | (as §2 Q9) | Composure / risk tolerance | **Pre-filled** |
| 7 | How much could you comfortably invest each month? | (as §2 Q6) | Investment capacity | **Pre-filled** |
| 8 | A €1,000 bill arrives tomorrow. How do you pay it? | (as §2 Q7) | Emergency fund / liquidity | **Pre-filled** |
| 9 | When will you need this money? *(helper line: "Think of money you'd set aside to grow, not everyday savings.")* | ⏱️ Within 2 years · 📆 In 2 to 5 years · 🗓️ In 5 to 10 years · 🌳 In 10+ years | Time horizon (S1 E) | **New to the customer.** DISC Q10 word for word. The answer is **suggested** from the timeline: the first goal more than 2 years away that has no "saved so far". |
| 10 | If your investments fell by a fifth, what would it mean for you? *(merges capacity for loss + income stability + dependants)* | I'd have to cut back on essentials · I'd change some plans · I'd be fine — it's long-term money · I'm not sure | Capacity for loss (MiFID "ability to bear losses") | **New** (no xlsx wording exists; short options). Dependants come from D9, debts and emergency fund from finances, so they are not asked again. |

### Section 3 · Experience & values (3)
| # | Question | Options | Source |
|---|---|---|---|
| 11 | How much experience do you have with investing? + optional chips "Which have you had?": Savings account · Pension · Shares or funds · Crypto · None | None at all · I know the basics · I am fairly comfortable · I am very experienced | **New.** S1 E19, word for word. The chips are optional and cover MiFID "types of products". |
| 12 | How stable is your income? | Uncertain right now · It varies month to month · Fairly stable · Very stable | **New.** From the ASSESS "capacity" block, word for word. Feeds capacity. |
| 13 | Would you like your plan to include ethical or sustainable options? | Yes, this matters to me · A little · No strong preference · Not sure | **New.** S1 E20, word for word. The xlsx cell reads "Not+A4:I16 sure", a paste error, so show "Not sure". Asked last, as ESMA requires. |

Count: **13** = 7 pre-filled + 6 new (Q4, Q9, Q10, Q11, Q12, Q13). Q11's product chips are an optional add-on to the same question.

**Fact-find coverage check** (QFA / CFP / MiFID II / CBI suitability):

| Requirement | Covered by |
|---|---|
| Attitude to risk | UM5, UM6 |
| Capacity for loss | UM10, UM8, UM12, D9 dependants, finances |
| Investment capacity | UM7, finances (monthly surplus) |
| Time horizon | UM9, goal dates |
| Knowledge & experience | UM11 |
| Objectives | Goals (F1/F2), UM5 |
| Liquidity / emergency fund | UM8, Assets (cash) |
| Dependants | D9 |
| Income stability | UM12 |
| Debts | Liabilities |
| Protection | Protection section |
| Sustainability preferences | UM13 |
| Behaviour / biases | UM3, UM6 |
| Advice preferences | UM4 |

Not covered here, on purpose: formal KYC (ID, PPS, proof of address). Step 4 C18 says these docs are "not for our portal", so the adviser handles them.

**Result the customer sees** (Me tab card):
- **Your money personality**: type + strap line + 2 strengths + 1 thing to watch.
- **Your indicative risk profile**: one of 5 labels, *Cautious · Cautious–balanced · Balanced · Balanced–growth · Growth*, with 3 mini-bars: "Want (appetite)", "Can afford (capacity)", "Can wait (time)". Rule: the profile is capped by the lower of want and can-afford (the Financial Planner confirms the scoring).
- **Mismatch note**, if any, using S1 K13–K17 "It means / What to do" wording in customer language.
- Footer (always shown): "This is an indicative profile to guide your conversation. It is not advice. Your adviser confirms your risk profile with you." (+ `DISC_FORMAL`).

Research sources:
- ESMA Guidelines on MiFID II suitability (2022/23): knowledge & experience, financial situation incl. ability to bear losses, objectives incl. risk tolerance, sustainability preferences asked after the rest. See [PwC](https://www.pwc.ch/en/insights/regulation/esma-guidelines-on-suitability.html), [Elvinger Hoss](https://elvingerhoss.lu/publications/mifid-esg-suitability-requirements-specified-esma).
- Central Bank of Ireland Consumer Protection Regulations 2025 (from 24 Mar 2026): suitability, sustainability preferences, digitalisation rules incl. no pre-selected confirmations. See [KPMG](https://kpmg.com/ie/en/insights/consulting/consumer-protection-code-2025.html), [Maples](https://maples.com/knowledge/new-consumer-protection-code-recommended-steps-for-firms-to-comply), [CBI Code](https://www.centralbank.ie/Code).
- CFP Board Practice Standards, step 1 "Understanding the client's personal and financial circumstances" (qualitative + quantitative info, confirm accuracy). See [CFP Board](https://www.cfp.net/code-and-standards).

---

## 4. Define — goals and timeline

### F1 Pick your goals
- Question: "What's next in your life story?" (DISC Q11, verbatim). Sub-line: "Pick any. You'll place them on your timeline next."
- Tiles: the 11 DISC Q11 tiles + ⭐ Something else, word for word, mapped to Step 2 categories:

| Tile | Step 2 category | Default amount (today's money, editable, set by the Financial Planner) |
|---|---|---|
| 🏡 Buy a home | Property | Deposit |
| 🏦 Be mortgage-free | Property | Mortgage balance (filled later from Liabilities) |
| 👶 Grow my family | Major life events / Family | One-off |
| 🎓 Kids' education | Family | Per child |
| ✈️ Travel | Travel | One-off or yearly |
| 🪂 Build a safety net | Wealth building (emergency fund) | Months of costs |
| 📈 Grow my wealth | Wealth building | Target pot |
| 💼 Start a business | Business or career | One-off |
| 🤝 Help my family | Family (supporting parents) | Yearly |
| 🌅 Retire comfortably | Retirement | Yearly income. **This tile is the retirement flag.** |
| 🎁 Leave a legacy | Later-life planning | Amount |
| ⭐ Something else | Opens a list: Health (medical reserve), Wedding, Buying a car, Career break, Moving abroad, Long-term care, Fund a course, or "Name it yourself" | Custom |

- **Order by age from D9** (Step 3 sheet), marked "Suggested for you":
  - 20s to early 30s: safety net, home, wealth
  - 30s–40s: family, kids' education, home
  - 45+: retire, mortgage-free
  - 55+: legacy, help family

  Nothing is hidden (Step 3 A2).
- There is no hard limit. If the customer picks more than 6, show a soft tip: "You can add more later."

### F2 Your timeline (centre of My Plan afterwards)
- Horizontal age line from "Now" (age from D9) to 90, with 5-year ticks. Chips can be dragged by touch and mouse, with keyboard arrows as the accessible fallback. Chips stack in lanes so they never overlap (the screenshot 4 overlap is a bug to fix). Each chip shows "in N yrs". Snap to whole years.
- Retirement flag is always on the line. Default age 66 (current State Pension age; the Financial Planner confirms). Dragging it sets the retirement age everywhere.
- **Under the line, one compact row per goal:** emoji + name (editable) · **When** (years from now, mirrors the drag) · **Amount €** (suggested default, labelled "today's money") · **Saved so far €** (default €0).
- **"More details" (collapsed, optional; MASTER C9, CJ C6):**
  - *For whom*: Me · Partner · Child · Family
  - *Priority*: Must have · Nice to have. Default Must have.
  - *Flexible on timing?*: Can move · Fixed date. Default Can move.
  - These are chips only, never text boxes. Defaults mean the customer never has to open this.
- Copy: "Don't worry about being exact. You can change anything later."
- Completion (F4): at least one goal with a when and an amount (MASTER C24).

---

## 5. Your finances (Phase 3, after account + verification)

- Hub = 6 cards. Each card has **📄 Upload** / **⌨️ Type it** and a status.
- One **smart upload** at the top accepts anything and sorts it into sections (Step 5 A14). The customer then confirms the extracted fields. Fields under the confidence threshold show "Check this".
- **If an upload fails**, the customer is sent to "Type it" and the missing document stays on the checklist (CJ D10).
- Every manual field offers:
  - **Not sure? Estimate for me**: a typical Irish figure, tagged *Estimated*.
  - **I don't have this**: sets the value to €0, tagged *Confirmed none*.
- Sliders or ranges are fine. Figures are rounded.

| Section | Upload (Step 4 sheet) | Manual fields (minimum) | Pre-filled from |
|---|---|---|---|
| **1 About you** | None. ID, PPS and proof of address are **not** collected (Step 4 C18). | Name · Age · Retirement age · (if partner) Partner's age | Name ← P1 · Age ← D9 · Retirement age ← timeline flag · Partner / dependants ← D9. Only partner's age is new. |
| **2 Income & expenses** | Payslips (last 3) · Employment Detail Summary (Revenue myAccount) · Current-account statements (3–6 months) · Self-employed: Form 11 / Notice of Assessment | Work: Employed / Self-employed / Not working · Your gross yearly income · Partner's gross yearly income (if partner) · Other income a month (optional) · Monthly living costs, with an optional "help me estimate" split: home, bills & food, extras · Yearly one-off costs (optional) | — |
| **3 Assets** | Savings / deposit / credit-union statements · An Post State Savings record · Investment or brokerage statements · Share-scheme (ESPP/RSU) or crypto statements · Property valuation / rental agreement / LPT record | Your home: Own outright / Own with mortgage / Rent / Live with family · Home value (if owned) · Cash savings (incl. credit union, State Savings) · Investments (shares, funds, share schemes, crypto — one total) · Saving each month now · Other property: value + rent received a month (optional) | Home ownership sets whether the Liabilities mortgage fields show |
| **4 Liabilities** | Mortgage statement · Loan statements · Credit-card statements · Central Credit Register report (optional) | Mortgage left · Monthly repayment · Years left (rate optional) · Other loans & cards: total owed · Their monthly repayments | Mortgage fields only if "Own with mortgage" |
| **5 Protection** | Life / income protection / serious-illness policy documents · Employer benefits statement (death-in-service, sick pay) · Health / home insurance policies | Yes / No / Not sure for: Life cover (amount optional) · Income protection · Serious illness cover · Cover through work · Health insurance | — |
| **6 Pension** | Pension statements · Employer scheme details · State Pension contribution record (MyWelfare) | Pension value today (all pots together) · Paid in each month (incl. employer) · State Pension: Expect full / Partly / Not sure | Retirement age ← timeline |

**Minimum to see results** (MASTER D22, CJ D11): About you + Income & expenses + at least one of Assets or Pension. Anything else can be skipped. It is marked *Missing* and shown on P4 and in the report.

**P4 Check your details** (MASTER D12 states), one list:
- ✅ **Verified** — from a document
- ✏️ **Your figure** — typed
- ≈ **Estimated for you**
- ❓ **Missing** — skipped
- ⚠️ **Needs a look** — conflicting (e.g. typed income ≠ payslip) or out of date (statement older than 12 months)

Only ≈, ❓ and ⚠️ are expanded (MASTER E7). Each has "Fix now" / "Leave for my adviser". A confidence badge carries through to the results (CJ E10).

---

## 6. Results (single page, fixed order)

Top label, always visible: **"Preliminary guidance · based on your figures and our assumptions · not financial advice"** + "Assumptions" link (inflation, growth, State Pension, retirement age). MASTER E21, E9. Confidence: if more than 2 items are estimated or missing, show "Rough picture — add documents to sharpen it".

1. **Your goals** (screenshot 5)
   - Heading: "Your goals". Sub: "How much of each goal your future income and savings can cover."
   - One row per goal: emoji · name · "in N years" · bar · % · status word.
   - Suggested bands (Financial Planner to confirm): ≥95% *On track* (green) · 70–94% *Nearly there* (amber) · <70% *Needs a plan* (red).
   - Retirement row included.

2. **What we found** (light understanding check, MASTER E22/E24, CJ E11)
   - 3 small cards:
     - **Your main strength** (e.g. "Your pension covers retiring at 66")
     - **Your main gap** (e.g. "Kids' education is 62% covered")
     - **Your biggest decision** (e.g. "Saving €150 more a month closes it")
   - One button: **"That makes sense"**, plus an "Explain this" link per card. Tapping the button records completion.
   - Optional chips: "What would you like to ask an adviser?" These go into the report as "Your questions" (MASTER F22). This is **not** a quiz: no right or wrong answers.

3. **What if** (MASTER F7, F9; CJ F6)
   - **Monthly amount**: slider −€500 … +€1,000, default €0. Goal % and the charts below update live.
   - **One-off amount**: slider €0 … €50,000 ("e.g. from savings or a bonus").
   - Plain text on what changed ("Kids' education goes from 62% to 88%").
   - Buttons: **Save as my preferred plan** (saves a version, MASTER F8) · **Back to my plan** (restores the baseline, CJ F10).
   - Timing changes happen through *Adjust my goals*. No product wording such as "move savings into investments".

4. **Your future, at a glance** — one card with 3 tabs:
   - **Journey** (screenshot 1): curvy road from "You, today" to age 90. Green means income covers life, amber means drawing on savings, red means shortfall. Goal milestones are circles; retirement is a pink flag. Plain-English "Reading your road" line.
   - **Life chapters** (screenshot 2): one card per decade with a weather icon, one-line summary, goals with %, and "See it year by year".
   - **Detail** (screenshot 3): yearly bars (green / amber / red), dashed income line, retirement marker, legend, "In plain English" line.

5. **Three end actions** (brief §9.5), equal weight, stacked on mobile:
   - **Download my plan** (PDF, MASTER F7 / CJ E6). Contents:
     1. Summary + goals %
     2. Journey road + life-chapter charts (roadmap)
     3. Year-by-year cashflow table + chart
     4. Detailed plan: per goal, what it needs, what is on track, what would close the gap, in plain words
     5. What-if you saved
     6. Your money snapshot with data-quality flags
     7. Your money personality + indicative risk profile (if Understand Me is done)
     8. Your questions for an adviser
     9. Assumptions + "preliminary guidance, not advice"
   - **Book my adviser meeting** → C0 (optional) → C1 → C2 consent → C3 → C4.
   - **Adjust my goals** → timeline.

---

## 7. App shell after onboarding

**Tabs (3):**

| Tab | Contents |
|---|---|
| **My Plan** (default) | Timeline (drag, edit underneath) at the top → Your goals % → What if → Your future at a glance → Download my plan. Small "Plan history" link (versions, MASTER F8). |
| **Me** | Understand me (13 Qs + result) · My money (the 6 finance sections, checklist of missing / estimated items, "Add a document") · My details (name, household) · Privacy & sharing (consents, what each adviser can see, delete my data). |
| **Experts** | Match / booking status, meeting details, secure document requests from the adviser (MASTER G6 "supply missing documents"). |

**Remove from `Lifecast User Jouney Prototype.html`:**

| Remove | Why |
|---|---|
| **Explore** tab + all 35 `CALCS` calculators + "Tools for you" strips | Not in the xlsx. The what-if on results does the job. A layperson facing 35 tools is overwhelmed. |
| **Videos / Watch / Live with experts** (`VID-00`, `VID-01`, `watchHTML`) | Not in the xlsx. Adds clutter. |
| **10 `ASSESS` assessments** (priorities, mindset, habits, investor, risk, capacity, resilience, knowledge, biases, planning) | Replaced by the 13-question Understand Me (§3). The knowledge test has right/wrong answers and feels like an exam. Priorities are replaced by goals. |
| **Reality check** screen (`RC-01`: pay/savings sliders before account) | Asks for money figures before account (breaks MASTER B6/D8) and duplicates finances (K4). |
| **Discover chapter-intro screens** (`DSC-C1..5`) | 5 extra taps for 7 questions. The eyebrow label replaces them. |
| Customer-visible behaviour **tags** on Discover options | Adviser-only data. Could read as judgemental. |
| **Theme and name switchers** (side panel) | Prototype design tools, not a customer feature. Keep only in the reviewer side panel if useful. |
| **Home** tab | Merged into My Plan to keep 3 tabs (see open question Q1). |
| Pre-ticked consent (`ACC-01` "c1 checked") | Must be unticked (CBI 2025 regulations). |

**Keep (from the xlsx):** passkey as an extra after email/phone verification · smart document upload with confidence check (MASTER D7, D12, D25) · plan versions (F8) · adviser match / share checklist / booking (G7, G21) · "How LifeGoals makes money" link (MASTER G21 conflicts disclosure).

**Unsure, raised as open questions instead of assumed:**
- **AI "Ask" chat**: not in the xlsx and risks crossing the advice line (Q2).
- **Bank connect (open banking)**: MASTER D25 lists "OCR/API connections", but it adds complexity to the MVP (Q3).
- **Partner invite**: MASTER E7, C25 (Q4).

---

## 8. Anti-repetition checklist

| Data point | First asked | Re-used / pre-filled in |
|---|---|---|
| Entry source | D0 (silent) | Ops, adviser match |
| Motivation | D1 | Goal suggestions order (F1), report summary |
| Money personality (Q2), feelings (Q12), behaviour (Q4) | D2, D8, D3 | Understand Me 1–3 (pre-filled), D10, report, adviser profile |
| Investment capacity (Q6), €1,000 bill (Q7) | D4, D5 | Understand Me 7–8; cross-checked against the finances surplus / cash (shown as ⚠️ only if very different) |
| Risk appetite (Q8), composure (Q9) | D6, D7 | Understand Me 5–6, risk profile |
| Age | D9 | F1 suggestions, timeline start, About you, engine |
| Partner / dependants | D9 | About you, Understand Me capacity (not re-asked), "For whom" chips |
| Goals | F1 | Timeline, results, report, adviser specialist (Step 5) |
| Goal when / amount / saved | F2 | Results, what-if, My Plan. "Saved so far" is shown next to Assets (not double-counted: the Financial Planner rule is that saved-so-far is part of cash savings unless flagged). |
| Beneficiary / priority / flexibility | F2 "More details" (optional) | Engine, report |
| Retirement age | F2 flag | About you (pre-filled), Pension, engine |
| Email | F3 (optional) or P1 | P1 pre-filled, booking confirmation |
| Name, mobile | P1 | About you, booking, report cover |
| Home ownership | Assets | Liabilities (mortgage fields shown or hidden) |
| Mortgage balance | Liabilities | "Be mortgage-free" goal amount (pre-filled) |
| Time horizon | Suggested from F2 goal dates | Understand Me 9 (confirm) |
| Income stability, capacity for loss, knowledge, sustainability, decision style | Understand Me 10–13, 4 | Risk profile, report, adviser match |
| Everything above | — | Shared with the adviser only after C2 consent. **The adviser must not re-ask it** (CJ G4). |

**Total question count (customer inputs):**

| Stage | Count |
|---|---|
| Discover | 1 optional (D1) + **7 questions** + 3 quick fields (D9) = **11** (about 2 min) |
| Define | goal picker (1) + per goal 3 fields (when is the drag; amount and saved-so-far are pre-suggested) + 3 optional chips |
| Account | name, email, mobile, 2 codes, 2 consents |
| Finances (manual route, maximum if nothing is uploaded) | About you 1 new (partner's age) · Income 6 · Assets 6 · Liabilities 5 · Protection 5 · Pension 3 = **26 fields maximum**. About 12 are needed for the minimum picture; the rest are optional or conditional. |
| Understand Me | **6 new** (+7 pre-filled = 13 total) |
| Results | understanding check: 1 tap |
| Booking | consent + slot |

There are **no repeated questions** anywhere.

---

## 9. Open questions for Pooja

1. **Home tab**: are 3 tabs (My Plan / Me / Experts) enough, or do you want a separate "Home — am I on track?" tab?
2. **AI "Ask" chat**: remove it (it is not in the xlsx and risks the advice line), or keep it as an FAQ-only help panel?
3. **Bank connect** (open banking, MASTER D25 "API connections"): include it in this prototype or leave it for later?
4. **Partner**: should the customer be able to invite a partner to fill in their own private/shared sections (MASTER E7, C25), or is "include my partner" by one person enough for now?
5. **Understand Me timing**: fine to keep it optional (Me tab + offered before booking)? Or must it be completed before results or before booking?
6. **UM10 capacity-for-loss question** is new wording (nothing in the xlsx covers it). Are you happy with the wording, or would you prefer we use an existing ASSESS question?
7. **D1 "What brought you here?" chips**: are these 5 options right?
8. **Goal tile list**: happy to reuse the Lifecast Q11 tiles (11 + Something else) with Health / Wedding / Car under "Something else"?

## 10. Pooja's answers to the open questions (binding, supersedes defaults above)

1. **Home tab: YES.** Tabs are Home · My Plan · Me · Experts. Home is a light dashboard: overall readiness, next best step, goals at a glance, and shortcuts. Nothing on it duplicates a full screen.
2. **AI "Ask" chat: KEEP.** It is a small floating button in the top-right corner of every screen (help and plain-English explanations only, never advice).
3. **Bank connection: NO** in this version.
4. **Partner: YES.** There are two choices side by side: "Invite my partner" (email, mock) **or** "Add their details myself" (manual).
5. **Understand Me (Me tab)** is the customer's profile hub:
   - Their name, partner details (invite or add manually) and dependants.
   - Their profile: money personality and indicative risk profile.
   - A re-check of the Discover answers they already gave. These are pre-filled; the customer confirms or changes them.
   - The deeper questions, **connected to My Plan**: answers feed the plan, and My Plan links back to Me for any answer it needs.
   - It is not a gate before results or booking. My Plan and booking nudge the customer to complete it, e.g. "Check your profile before your adviser meeting".
6. **Capacity-for-loss wording.** Take the framing from the MASTER JOURNEY (B7: "Discover – 1) Risk, 2) Capacity and 3) Investor behaviour") and CUSTOMER JOURNEY (B6: "risk, capacity and investor-behaviour questions") sheets. Label the Understand Me sections in that language and keep the question plain and short.
7. **"What brought you here?" chips**: the proposed options were shown to Pooja for confirmation; keep them until she replies.
8. **Goal tiles: keep separate Health, Wedding and Car tiles.** Use the LifeGoals 2.0 tile style (`reference/LifeGoals-2.0-Plan-Prototype-decoded.html` lines 165–171 CSS, GOAL_TYPES ~592): white card, 2px border, big emoji on top, name below, teal border + light-teal fill + tick when selected, restyled in the navy tokens. Tiles: 💍 Wedding, 🚗 Change the car, 🩺 Health & care (none in 2.0; added).

## 11. Amendments after PM review round 1 (see docs/pm-review-round1.md)
- §5 Assets: drop "Saving each month now". Monthly saving capacity is already captured by Discover Q6, and income − expenses gives the real surplus.
- §4 F2: "More details" keeps only *For whom* and *Flexible on timing?*. Priority is asked once, in F4.
- §5 Minimum-data rule: skipped figures count as €0 in the engine and are shown as ❓ Missing. Nothing is silently estimated. "Estimate for me" is the only way a typical figure enters, and it is labelled "Estimated".
