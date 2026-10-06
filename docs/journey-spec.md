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
| K6 | App shell = **5 tabs: Home · Explore · My Plan · Me · Experts** (amended 2 Oct 2026; supersedes the earlier 3-tab decision). **Explore is kept**: the 28 calculators that match the calculator workbook, short videos and topics that lead to an expert. Its calculators follow §14 (no defaults for personal choices). Still removed: AI chat, the 10 assessments and the theme/name switchers. | Explore is where customers try one question before or after a plan; the 28 calculators are specified and checked against the workbook. AI chat, assessments and switchers are still not in the xlsx and add overwhelm (see §7). |
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

Sections are labelled in the xlsx language (MASTER B7 "1) Risk, 2) Capacity and 3) Investor behaviour"; CUSTOMER JOURNEY B6), per §10.6. On each section screen the pre-filled answers are collapsed into one "Your first answers" card, each with **Change**; only unanswered questions show in full. Me also offers a separate re-check of all 7 first answers (§10.5).

Hub copy: "Three things make up your risk profile: how much risk you **want** to take, how much you **can** afford to take, and **how long** you can wait."

### Section 1 · Your risk (3)
Intro: "How much risk you **want** to take, and **how long** you can wait."
| # | Question | Options | Measures | Source |
|---|---|---|---|---|
| 1 | Pick a forecast for your long-term money. | (as §2 Q8) | Attitude to risk / appetite | **Pre-filled** (D6) |
| 2 | Your €10,000 investment drops to €8,500. What do you do? | (as §2 Q9) | Composure / risk tolerance | **Pre-filled** (D7) |
| 3 | When will you need this money? *(helper line: "Think of money you'd set aside to grow, not everyday savings.")* | ⏱️ Within 2 years · 📆 In 2 to 5 years · 🗓️ In 5 to 10 years · 🌳 In 10+ years | Time horizon (S1 E) | **New to the customer.** DISC Q10 word for word. The answer is **suggested** from the timeline: the first goal more than 2 years away that has no "saved so far". |

### Section 2 · Your capacity (4)
Intro: "How much risk you **can** afford to take, without it hurting everyday life."
| # | Question | Options | Measures | Source |
|---|---|---|---|---|
| 4 | How much could you comfortably invest each month? | (as §2 Q6) | Investment capacity | **Pre-filled** (D4) |
| 5 | A €1,000 bill arrives tomorrow. How do you pay it? | (as §2 Q7) | Emergency fund / liquidity | **Pre-filled** (D5) |
| 6 | If your investments fell by a fifth, what would it mean for you? *(helper line: "For example, €10,000 falling to €8,000.")* | I'd have to cut back on essentials · I'd change some plans · I'd be fine — it's long-term money · I'm not sure | Capacity for loss (MiFID "ability to bear losses") | **New** (no xlsx wording exists; plain, short options, §10.6). Dependants come from D9, debts and emergency fund from finances, so they are not asked again. |
| 7 | How stable is your income? | Uncertain right now · It varies month to month · Fairly stable · Very stable | Income stability | **New.** From the ASSESS "capacity" block, word for word. |

### Section 3 · Your investor behaviour (6)
Intro: "How you tend to act and decide with money. There are no right or wrong answers."
| # | Question | Options | Source |
|---|---|---|---|
| 8 | Your friends would say you're always… | (as §2 Q2) | **Pre-filled** (D2) |
| 9 | How do you feel about your financial future? | (as §2 Q12) | **Pre-filled** (D8) |
| 10 | A friend's investment doubled in a month. What do you do? | (as §2 Q4) | **Pre-filled** (D3) |
| 11 | When making an important financial decision, do you prefer to… | Research everything myself · Understand the basics, then speak to an expert · Speak to an expert first · Keep things as simple as possible | **New.** From the ASSESS "planning" block (3 of its options kept, "Compare several options carefully" dropped). Used for adviser matching (MASTER G12 "preferences"). |
| 12 | How much experience do you have with investing? + optional chips "Which have you had?": Savings account · Pension · Shares or funds · Crypto · None | None at all · I know the basics · I am fairly comfortable · I am very experienced | **New.** S1 E19, word for word. The chips are optional and cover MiFID "types of products". |
| 13 | Would you like your plan to include ethical or sustainable options? | Yes, this matters to me · A little · No strong preference · Not sure | **New.** S1 E20, word for word. The xlsx cell reads "Not+A4:I16 sure", a paste error, so show "Not sure". Asked last, as ESMA requires. |

Count: **13** = 7 pre-filled (UM1, 2, 4, 5, 8, 9, 10) + 6 new (UM3, 6, 7, 11, 12, 13). UM12's product chips are an optional add-on to the same question.

**Fact-find coverage check** (QFA / CFP / MiFID II / CBI suitability):

| Requirement | Covered by |
|---|---|
| Attitude to risk | UM1, UM2 |
| Capacity for loss | UM6, UM5, UM7, D9 dependants, finances |
| Investment capacity | UM4, finances (monthly surplus) |
| Time horizon | UM3, goal dates |
| Knowledge & experience | UM12 |
| Objectives | Goals (F1/F2), UM1 |
| Liquidity / emergency fund | UM5, Assets (cash) |
| Dependants | D9 |
| Income stability | UM7 |
| Debts | Liabilities |
| Protection | Protection section |
| Sustainability preferences | UM13 |
| Behaviour / biases | UM10, UM2 |
| Advice preferences | UM11 |

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
  - **Not sure? See an example**: opens an example card (§15). Superseded: "Estimate for me" removed.
  - ~~I don't have this~~ removed (§15): the example card says "Nothing to add? Enter 0."
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

## 12. JOURNEY RESTRUCTURE — Pooja, 30 Sep 2026 (binding; overrides §1, §4–§7 and §10 where they conflict)

Pooja's words: "first they get a feeling about how it works… 5–6 questions max and give them a tag like Achiever… then ask them to check a more accurate version and make a plan… then they directly enter the main page… home, explore, my plan etc. Before entering it they will be asked to make an account by entering their email id or just skip it for now. All these questions (goals, timeline, upload docs, more details about you and your family) come when they click Make my plan."

### New order
1. **Welcome**: value promise, "Start · about 1 min".
2. **What brought you here?**: optional, one screen (6 chips incl. "Something else" + short text).
3. **Discover: 6 questions**, verbatim Lifecast wording: Q2, Q4, Q7, Q8, Q9, Q12. **Q6 (monthly investing amount) moves out of Discover** into the plan's money-profile step (it is a capacity question, and the plan is where money is discussed). No age/household screen here.
4. **Money personality reveal**: the type (🎯 Achiever / ⚖️ Balancer / 🧭 Explorer / 🛋️ Contented) plus the customer's own **financial / behavioural terms** from their answers, each with a one-line layman meaning. Examples: "The Money Monk: money isn't the point for you", "Loss aversion: losses feel bigger than gains", "Herd behaviour · FOMO: you're tempted to follow the crowd". It also shows risk appetite and cushion in both words and terms. CTA: **"Get a more accurate picture: make my plan"**.
5. **Save your results**: email only, **or "Skip for now"**. No password, no money yet (xlsx MASTER C8: optional email save).
6. **Main app** (Lifecast shell). Tabs: **Home · Explore · My Plan (centre button) · Me · Experts**. The floating Ask button stays on every screen.
   - **Home** (before a plan exists): personality card, a big "Make my plan" card, Explore teasers. After the plan: the dashboard as built today.
   - **Explore**: bring it back from Lifecast. Its tool categories and calculators (CATS/CALCS) and the short videos/live sessions (VIDEOS/LIVE), ported and restyled in the navy theme. Keep Lifecast's structure.
   - **My Plan (centre)**: with no plan yet, this is an empty state with "Make my plan". Tapping it starts the **plan builder**. Once the plan is built, My Plan = timeline at the top + results (as built today).
   - **Me**: profile hub (as built today) + a link to the full money profile.
   - **Experts**: as built today.
7. **Plan builder** (stepper inside My Plan). Each step saves and can be left and resumed:
   1. **About you & your family**: first name, age, partner (invite or add myself), children/dependants.
   2. **Your goals**: tiles.
   3. **Your timeline**: drag.
   4. **Your money profile**: the Understand Me questions. The 6 Discover answers are shown pre-filled (confirm/change) + 7 to answer (Q6 moved here + the 6 existing new ones: u9, u10, u12, u4, u11, u13). **Total questions in the whole journey = 13.** The step can be skipped.
   5. **Secure your account**: *only if not already verified*. Email + mobile code before any upload or money figures (xlsx MASTER D8, CJ D5). If they skipped the email earlier, it is asked here.
   6. **Your finances**: the 6 sections, upload or type it. About you is pre-filled from step 1 plus retirement age from the timeline.
   7. **Check your details**
   8. **Your results**: order as built today: goals % → what we found → what if → your future at a glance → download / book / adjust.

### Terms (Pooja: "use financial terms with the layman term")
- Show the **Lifecast option tags verbatim** on the Discover answer cards and in results/profile. Examples: The Budgeter, Money Vigilant, The Early Adopter, The Money Monk, FOMO · Herd behaviour, Due diligence, Advice-seeker, Loss aversion, Emergency fund, Thin buffer, Relies on credit, No safety net, Low risk / Cautious / Balanced / High risk, Panic selling, Anchoring, Long-term investor, Buy the dip, Financial anxiety, Cautious optimism, Financially confident, Money avoidance.
- Exception: Q2 option 3 shows **"The Opportunist"**, the term Pooja asked for (Lifecast calls it "The Early Adopter").
- Every term carries a plain-English line. Section names pair the term with a plain label: "Risk appetite: how much risk you want", "Risk capacity / capacity for loss: how much you can afford to lose", "Time horizon: how long you can wait", "Investor behaviour: how you tend to act".
- Scoring stays the Financial Planner's (docs/fp-review-round1.md). With Q6 moved out of Discover, the first read uses Q7 for capacity; Q6 joins at the money-profile step.

## 13. Money profile questions rewritten (Pooja, 1 Oct 2026; binding, replaces the u-questions in §3/§12)
Goal: catchy for a layperson, hooks an expert. **Every option carries a financial / behavioural term as a tag** (same style as Discover), and every question carries a section term + plain-English line. Total questions stay at 13.

| # | Section term · plain line | Question | Options → tag |
|---|---|---|---|
| Q6 (kept as is) | Investment capacity · what you can put to work | How much could you comfortably invest each month? | unchanged (Starter / Moderate / Good / High capacity, Variable income) |
| u9 | Time horizon · how long your money can stay invested | If you put money away to grow, when might you need it back? | ⏱️ Within 2 years → Short horizon · 📆 In 2 to 5 years → Medium horizon · 🗓️ In 5 to 10 years → Long horizon · 🌳 Not for 10+ years → Very long horizon · time in the market |
| u10 | Capacity for loss · what a fall would really cost you | Markets dip and your investments are down 20% for a whole year. What would that actually mean for your life? (sub: "Not how you'd feel. What would really change.") Visual panel €10,000 → €8,000, like Discover Q9. | 😟 I'd struggle to pay the bills → Low capacity for loss · ⏸️ I'd have to put a goal on hold → Limited capacity for loss · 🙂 Annoying, but life goes on → Moderate capacity for loss · 😎 Nothing changes, I won't need it for years → High capacity for loss |
| u12 | Income stability · how steady your pay is | How steady is your income? | 🌪️ Uncertain right now → Income risk · 🌦️ It changes month to month → Variable income · ⛅ Fairly steady → Stable income · ☀️ Rock solid (permanent job or pension) → Secure income |
| u14 (NEW, replaces u13 sustainability) | Emergency fund · your safety net | If your income stopped tomorrow, how long could your savings keep you going? | 😬 Less than a month → No emergency fund · 🐷 1 to 3 months → Thin buffer · 🛟 3 to 6 months → Emergency fund in place · 🏰 6 months or more → Strong safety net |
| u4 | Decision style · how you make big money calls | A big money decision lands on your desk, like switching your pension. What's your move? | 🔬 Dig into every detail myself → Self-directed · Due diligence · 🧭 Get the gist, then check with an expert → Validator · 🤝 Hand it to an expert I trust → Delegator · Advice-seeker · ⏳ Leave it for another day → Procrastination · Status quo bias |
| u11 | Knowledge & experience · what you've done before | How would you describe your investing know-how? | 🌱 Total beginner → Novice investor · 📘 I know the basics: savings and pension → Basic knowledge · 📈 I've invested in funds or shares → Experienced investor · 🏆 I'm confident I can beat the market → Very experienced · watch for overconfidence bias |

Notes
- Sustainability preferences (MiFID II) are no longer a profile question. Instead they become an optional chip in the adviser pre-meeting questions ("I'd like sustainable / ethical options") and in Me › Privacy & preferences, so the adviser can still capture them.
- Scoring: keep the Financial Planner's logic; option order = score 1→4 for u9, u10, u12, u11, u14. u14 joins capacity (with Q6, Q7, u10, u12). u4: option 4 adds the trait "Procrastination · Status quo bias". u11 option 4 adds the trait "Overconfidence bias" but keeps the experience score 4.
- Screen copy bug: the step header said "2 quick questions" while 7 were shown. The header must say "7 quick questions · your first 6 answers are filled in" or "N of 7 left".
- What the full 13 now covers: money mindset (Q2, Q12) · behavioural biases (Q4 herd/FOMO, Q9 loss aversion/panic selling/anchoring, u4 procrastination/status quo, u11 overconfidence) · risk appetite (Q8) · capacity and resilience (Q6, Q7, u10, u12, u14) · time horizon (u9) · knowledge & experience (u11).

## 14. Defaults vs customer choice (Pooja, 2 Oct 2026; binding for prototype, workbook and spec)
Every number the plan or a calculator uses falls into exactly one of three types:

1. **Fixed by law, the same for everyone** → set automatically, shown as "Set by Government · 2026" and not editable. Examples: income tax bands and credits, USC, PRSI, pension relief %, the earnings cap, lump-sum tax bands, DIRT 33%, exit tax, CGT, Central Bank lending limits, the full State Pension rate, Illness Benefit and survivor's pension rates.
2. **Set by Government or the market but varies within a known range** → the customer chooses, with the range stated. The wording is: "Usually between X and Y (source)". Examples:
   - State Pension: the full rate is €299.30 a week, but it depends on contributions (partial rates are lower), so the customer enters theirs;
   - mortgage rate, typically 3.5%–4.5%;
   - deposit rates, about 2%–2.3%;
   - credit card APR, typically 13%–23%;
   - fund charges, about 0.5%–1.5%.
3. **Personal judgement** → **no default. Blank until the customer chooses.** The wording is: "Generally the standard is X (source). Choose what you want to use."
   - A one-tap "Use the standard (X)" chip fills it. Choosing that chip counts as the customer's decision.
   - Examples: inflation, pay rises, cash growth, investment growth, pension growth, retirement-phase growth, share of the pension contribution paid by you, saving towards goals, emergency fund months, drawdown timing, retirement multiple.
   - An optional "Use the standard for all of these" button applies the standard to every type-3 item at once (an explicit choice), **except retirement age and life expectancy**.
   - **Retirement age and life expectancy (plan-until age)** must each be chosen individually; they are never defaulted and not part of "use all".
     - Retirement age guidance: "You can usually draw a pension from 60 (some schemes from 50); State Pension is paid from 66."
     - Life expectancy guidance: "At 65, average life expectancy in Ireland is about 83 for men and 86 for women (CSO); many people plan to 90–95."

Until a required choice is made, results that depend on it show "Choose your [item] to see this", never a hidden number. The sample customer has all choices made, so demos still work.

Every guidance figure is quoted once, from the single rules register, so the prototype, workbook and spec always say the same thing. For example, "Ireland today" inflation must be ONE figure everywhere: the latest CSO release, named with its month and index.

## 15. "Not sure? See an example" replaces "Estimate for me" and "I don't have this" (Pooja, 6 Oct 2026; binding, replaces those parts of §5 and §11)
Every customer's money is different, so we never fill in a figure for them.

- **Link wording** on every Your finances field: **Not sure? See an example**. Remove "Not sure? Estimate for me" and "I don't have this" everywhere.
- Tapping the link opens a small **example card**. The card never fills anything in. It has:
  1. Title: "Example: [field name]".
  2. One short sentence from the sample customers Aoife and Cian, using their real sample figures, ending with what they enter. E.g. "Aoife and Cian have €6,000 in their bank accounts and €3,000 in the credit union. They enter **€9,000**."
  3. **📍 Where to find yours:** one line naming the document or app (payslip, banking app, annual pension statement, mortgage statement, MyWelfare…).
  4. **Nothing to add? Enter 0.**
  5. Small print: "Example only. Not a typical or recommended amount."
  6. Button: **Got it**.
  Choice fields (e.g. Your home, Your work, State Pension) get the same card: what each option means, and which one Aoife picked as the example.
- Statuses: **Your figure** (typed, including 0) · **From document** · **❓ Missing** (left blank; counts as €0 and stays on the "To sharpen your plan" checklist). The "≈ Estimated" and "Confirmed none" tags are removed.
- Data precedence becomes: document > customer-typed > (nothing: Missing).
- Figures the engine **works out from the customer's own figures** stay, labelled "Worked out from your figures" with the reason: the mortgage repayment from balance, rate and years left; a 5-year repayment for a loan or card with no (or too small) stated repayment. These are calculations, not guesses about the person.
- All the old made-up estimate figures (€45,000 income, €8,000 cash, €380,000 home, etc.) are deleted.

## 16. LifeMap rebrand + cover (Pooja, 6 Oct 2026; binding)
- **Name:** the product and platform is **LifeMap** (by DigiPro.AI). Replace "LifeGoals" in every customer-facing string (prototype, workbook, Word spec). File names stay for now.
- **Cover (D0)**, short and human, no AI-sounding copy:
  - Full-bleed real photo (a winding road through Irish countryside), dark gradient at the bottom for legible text. Photo to be supplied/licensed; until then a clearly marked photo slot.
  - Logo: **LifeMap**
  - Headline: **The life you'd like, mapped out.**
  - Line: **A life map that guides you, step by step.**
  - Button: **Let's start**, with the line under it: **An easy tool, built for you.**
  - Small: **Free · About a minute · Nothing saved unless you say so** · "Why we ask" link · **Guidance, not advice.** · "I have an invite" stays.
- **D1:** "What brings you to LifeMap today?" Only the name changes; the chips stay exactly as they are (🛟 "Building a safety net for emergencies" unchanged). No "rainy day" wording (Pooja, 6 Oct 2026).
- **Goal tile:** "Build a safety net" becomes **"Emergency fund"** (no helper line, no "rainy day").
- **Discover Q8 (map version; scoring, tags and line shapes unchanged):**
  "Pick a road for your long-term money." / "A flat road is steady but slower. A hilly road has bigger ups and downs, with more growth potential."
  🛣️ Flat and steady (Low risk) · 🏞️ Gentle hills (Cautious) · ⛰️ Hills and dips (Balanced) · 🏔️ Mountain road, but exciting (High risk).
  Any reference to "forecast", "sunny", "stormy" for this question changes to the road wording (e.g. personality reveal, Me, report, notes).
- Goal status icons: keep the weather icons (☀️ 🌦️ ⛈️) as they are (Pooja, 6 Oct 2026).
