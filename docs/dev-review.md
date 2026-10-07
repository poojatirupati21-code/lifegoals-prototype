# Developer review: prototype, media, workbook engineering

Reviewer: senior developer. Read-only review of the working tree on 6 Oct 2026 (HTML 950,725 bytes, uncommitted edits present in git status). Nothing in the prototype, workbook or docs was edited. Workbook checked on a copy. Scripts and logs are in the session scratchpad (`dev/`).

## Verdict on my area: SATISFIED WITH CHANGES

No blocker. The journey, calculators and save paths work, and there are no console errors. Two accessibility defects (dialog names, focus return) should be fixed before this goes to the wider panel.

## What was run (read FAILS, not only ERRORS)

- Repo suite (runall.sh copy): e2e at 390, 1280 and 844; precedence, chart, fp4, mono, road, landfit, noret, v5 to v12, rules, asm, choices, emerg, cta2, s19 to s25 incl. s24c. Every script exits 0. FAILS 0 on all counters (precedence 0/57, v12 0/35, rules 0/67, asm 0/35, choices 0/80, s19 0/34, s21 0/30, s22 0/21, s23 0/13, s24 0/22, s24c 0/16, s25 0/27). ERRORS 0 everywhere.
- s17/a11y.js: 218 screens, 6,488 elements, 0 emoji in accessible names, 0 console errors. It checks emoji only, so I added label, duplicate-id, focusable-action, slider and heading scans (all clean).
- New scripts: XSS injection, layout at four viewports, dialog and focus behaviour, video and missing-media, downloads paths, contrast, big lists.

## Findings, ranked

| # | Sev | Where | Repro | Fix | Owner |
|---|-----|-------|-------|-----|-------|
| 1 | Medium | `sheetHTML()`, aria-label of every sheet except `ex` | Open any sheet and read the dialog name: "ask", "whyask", "invite", "saveprompt", "delete", "calcadd", "explain" (the internal key) | Give each sheet a human title (or aria-labelledby to its h2) | Dev |
| 2 | Medium | `closeSheet()` and `closesheet` action | Home, Tab to Ask, Enter, Esc: focus lands on BODY. Same for every sheet except Example (`ex\|`) | Remember the opener (`document.activeElement` on open) and restore it on close | Dev |
| 3 | Medium | `#report` dialog | Open the report, press Tab 6 times: focus leaves the dialog into the page behind. Esc closes it but does not return focus to the Report button (only the Close button does) | Add the same Tab trap as the sheets, mark `#screen` inert while open, return focus on Esc | Dev |
| 4 | Medium | Global `:focus-visible` is `--sun` (#F2B134) | Contrast of the ring on white is 1.89:1, on sand 1.74:1 (WCAG 2.2 wants 3:1) | Use a two-tone ring (ink 2px + sun 2px) or `--ink` outline on light surfaces | UI/UX and Dev |
| 5 | Medium | `profile` sheet | Open Profile and privacy: focus stays on BODY (no input or `.btn` for the open-focus rule) | Focus the sheet h2 (`tabindex=-1`), as `ask` does | Dev |
| 6 | Low-Med | Tap targets | At 360 and 390 wide there are about 135 interactive items under 44 px: link buttons (32 px high), Ask fab (69x32), `<summary>` rows (32 to 38), Back (72x38), Yes/No and 0/1/2/3+ chips (40), Profile icon (38x38), the DS checkbox (22x22) and the inline number boxes. The rule exists for primary buttons only | Raise `.link`, `summary`, `.chip.sm`, `.backb`, `.askfab` to `min-height:44px` (extend hit area with padding if the look must stay) | UI/UX and Dev |
| 7 | Low-Med | Print fallback in `saveReport()` | Downloads absent, `window.print` silently blocked (sandboxed iframe): message says "Opening the print window" and nothing happens. Only a thrown error shows the "blocked" text | After `print()`, if no `beforeprint` fired within about 1 s, show the "open in your browser" message | Dev |
| 8 | Low-Med | `saveMeeting()` local path | The `.ics` anchor click is not verifiable, yet the toast says "Calendar file downloaded". Object URL is never revoked | Wording "Calendar file prepared"; `URL.revokeObjectURL` after a timeout | Dev |
| 9 | Low | `loadScript()` | jsPDF 2.5.1 and html2canvas 1.4.1 load from cdnjs with no `integrity`/`crossorigin` | Add SRI hashes and `crossOrigin='anonymous'` | Dev |
| 10 | Low | `reportDocHTML()` | The saved `LifeMap-plan.html` is 494 KB because it copies every `<style>` including the 450 KB of photo data-URI CSS variables | Strip the `--art-*` custom properties from the copied CSS | Dev |
| 11 | Low | Contrast, flat backgrounds | 6 combos at 4.40 to 4.44:1 (needs 4.5): mint pill/tag text `#0B7A70` on `#D9F2EE`; green tag `#1A7F4B` on `#E3F4EA` (12 px) | Darken `--sea-d` text to `#0A7068` and the green tag text slightly | UI/UX |
| 12 | Low | Video error | When the video fails, `el.hidden=true` drops focus to BODY; Try again is not focused. Captions: none, only an honest note | Move focus to the alert or the Try again button; caption track is a content task | Dev, Content |
| 13 | Low | Toast | Failure messages (e.g. "We couldn't save the file") vanish after 2.8 s | Keep errors until dismissed or 8 s | Dev |
| 14 | Low | Dev side panel `#curid` has `aria-live="polite"` | Announces the screen id on every render on desktop | Remove aria-live (it is a prototype aid) | Dev |
| 15 | Info | No `color-scheme` or `prefers-color-scheme` | Light only, so dark-mode browsers still show light form controls. Sane, not a defect | Declare `color-scheme: light` | Dev |
| 16 | Info | File size | 950 KB, not about 600 KB (six embedded JPEGs of about 520 KB plus CSS art). Loads in about 0.4 s, fine for a prototype | None | n/a |

## Details by area

### 1 Code quality and safety
- localStorage and sessionStorage are not used anywhere, so nothing to wrap.
- XSS: I injected `"><img src=x onerror=window.__x=1>` into account name, email, mobile, goal names, partner name and email, why-note, save email and note, the partner label (Settings), the Ask question (typed in the real input), list items and an uploaded file name; then rendered all 39 jump screens, 11 sheets and the report. No payload executed or injected an element. `esc()` is used at every insertion point I could reach. One path (calculator statement upload card, `data-pfile`) was not reachable in the sample state, but the code at that path escapes (`esc(u.files.join)`).
- `S.ask.a` is inserted unescaped, but it comes from `askMatch()` (built-in answers); the user's question is escaped. Safe today. Keep it that way.
- Events: one delegated click handler on `#screen [data-a]`, one keydown handler, `bind()` re-attaches per-render listeners to replaced DOM only (no leaks). Document-level listeners are added once. Timers are guarded (`S.scr`/`S.upl` checks); `clearTimeout(toastT)` is used.
- Full `innerHTML` re-render per action: about 105 to 122 ms at worst (8 cards, 8 loans, 8 pensions, 7 goals), 90 to 110 ms for the report. Acceptable. It would restart a playing video on an orientation change (low).
- Downloads capability, tested with stubs: absent -> `window.print()` (OK); `use()` rejects -> print (OK); save of Blob rejects, ArrayBuffer accepted -> falls back to ArrayBuffer (OK); CDN blocked and downloads present -> saves `LifeMap-plan.html` with clear message (OK); save always rejects -> clear error, button re-enabled (OK); print throws -> "blocked here" message (OK). The real jsPDF/html2canvas PDF could not be tested because cdnjs is blocked in this sandbox. The PDF layout code is unverified here and should be tried once in a normal browser.
- Dead code: the fake player branch of `V.VID` (non-`src` videos) is still live for the other videos, so not dead. No unused-global problems found at runtime.

### 2 Accessibility
- Inputs: every input, select and textarea has an accessible name on every screen, sheet and calculator tested. No duplicate ids, no positive tabindex, no non-focusable `data-a` controls, sliders have name, value and tabindex.
- Focus: after same-screen actions (chips, steppers, discovery answers) focus stays on the control or moves to the next h2. Sheets open with focus inside; Tab and Shift+Tab loop inside the sheet. Defects 1, 2, 3, 5 above.
- Live regions: toast is `role=status`; results and rank messages use `role=status` or `aria-live`.
- Emoji: scanner clean; aria-hidden pattern works through a MutationObserver as well.
- Reduced motion: global `prefers-reduced-motion` rule plus `RM()` shortens timers.
- Contrast: cover photo (white headline and strap over the navy scrim, "I have an invite" pill, gold "Let's start" button) read well at 360x640 and 390x844. Photo tiles pass at the 5th percentile of the pixels under the text. Decorative play glyphs on photos are about 2.1:1 and are aria-hidden. Gold buttons (ink on #F2B134) are about 8:1. Defects 4 and 11.

### 3 Performance and robustness
- Layout at 360x640, 390x844, 844x390, 1280x800 over all 39 jump screens plus the report: no page-level horizontal scroll and no console errors or warnings (the only message is the sandbox's Google Fonts certificate error). The carousel rows (Focus tiles, video row) scroll sideways inside their own container by design.
- Load: DOMContentLoaded about 380 ms. Fonts fall back to system-ui if Google Fonts is blocked.
- Media folder missing (copy of the HTML alone): no broken-image icons (photos are data URIs); the two videos show the failure message with Try again; console shows only ERR_FILE_NOT_FOUND for the posters and videos. Try again re-fails gracefully.
- Media files: both MP4s are H.264 High level 3.1 plus AAC, with `moov` before `mdat` (fast start), 74.0 s and 82.4 s (match the 1:14 and 1:22 labels), 5.3 MB and 11.3 MB. Real playback could not be tested: the Playwright Chromium has no H.264 decoder, so s25 only proves the failure path. Please play both once in Chrome or Safari. The two MP4s have file mode 600 (`-rw-------`) locally; make sure they are readable when published. Five JPEGs match the embedded data URIs byte for byte.
- Iframe viewer that blocks downloads and print: handled through the downloads capability and the messages above. Defect 7 is the one gap.

### 4 Workbook engineering (copy of `deliverables/LifeGoals-Calculators.xlsx`)
- 34 sheets (README, C01 to C28, Tax engine, Document reader spec, Your lists, Settings, Assumptions), 1,584 formulas, 226 global defined names plus sheet-scoped names. Saved by LibreOffice Calc.
- Errors: 0 error values in cached results (strict match on #REF!, #NAME?, #DIV/0!, #VALUE!, #N/A, #NUM!, #NULL!; the "#1" style cells in Assumptions column H are source-note labels). No defined name points to a missing sheet or contains #REF!. No external links. Re-saving through LibreOffice headless produced identical values (0 diffs).
- Functions are all Excel-native (IF, ISBLANK, FV, PMT, NPER, TEXT, LOOKUP, SUMPRODUCT, HYPERLINK, TODAY and similar). TODAY() is used in 16 statement-age checks, so those cells change daily (intended).
- Data validation: 241 rules, almost all `stop` style with a message (175 decimal, 41 whole, 16 date, 15 list, 1 custom). Two small issues: README!C3 (Yes/No "Fill example values") has allow-blank off and the error alert off, so any text is accepted (low); C13/C14 use the literal list "0.2,0.4" for the relief rate (works, but shows as 0.2 not 20%; low).
- calcPr: no `calcMode` and no `fullCalcOnLoad` (Excel default is automatic, and README says it recalculates on open). Low: set `calcMode="auto" fullCalcOnLoad="1"` so Excel always recalculates a LibreOffice-written file.
- Protection: no sheet or workbook protection, and every cell is still flagged Locked (inputs included). So protection can't simply be switched on later. Medium for a handed-over model: unlock the input cells, then protect each sheet without a password so formulas are not overwritten by mistake (owner: workbook author).
- 113 defined names are not used by any formula (mostly Set_* names that document Settings); harmless.
- README version line says "Version 2.3 · 2 Oct 2026" while the file was saved on 6 Oct 2026 after the §23 to §25 changes; check it is meant to be current.
- Excel itself was not available; open it once in Excel to confirm sheet-scoped names and the custom validation on C07 behave.

## Ranking for the top agent
Fix 1, 2, 3, 5 together (one pass on dialogs, small), then 4 and 6 with the designer, then the workbook protection point. The rest can wait for the next round.

## Fix round (7 Oct 2026): status
Fixed in the prototype: invented age (fresh() age is null; blank on Step 1 with Next off until the customer gives one; Me "Not given yet"; calculators use their own labelled example age; Add to my plan without an age asks for it first); What-if order (§26) with growth and inflation in a collapsed block below the result; "Example figures. Change them to yours." label in Explore tools (top and result) until the figures are the customer's; dialog names are their headings; focus returns to the opener on every close; Profile and report dialogs fixed (Tab trap, inert background, Esc returns focus); two-tone focus ring (ink + white halo); 44 px targets for links, small chips, segmented buttons, steppers, summary rows, close buttons (Ask, Back and Profile get a 44 px hit area, look unchanged); print fallback says when nothing opened; tag and pill colours at 4.5:1 or better; tags wrap under their label at 360; one merged banner for missing details and rough picture; saved report .html about 100 KB smaller; Explorer watch-out says "emergency fund"; error toasts last 8 s; media files are mode 644.
Not done: SRI hashes for the two CDN scripts (cdnjs is blocked from this machine, so the hashes could not be fetched); real PDF and real video playback still need a normal browser; timeline chips (36 to 39 px) keep their size because they are positioned by script; the inline number boxes are text, not buttons.
