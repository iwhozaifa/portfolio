# Ali Huzaifa: portfolio build plan

## Context

`/home/whusan/Portfolio` is empty apart from the installed `design-taste-frontend` skill. Ali Huzaifa, a software engineering student working in AWS, DevOps, automation and agentic development, wants a portfolio that reads as "builds and ships real systems", not "student with a template". It must be loud, carry a strong point of view, and fail none of the hard anti-slop constraints. taste-skill sets the direction and runs the QA. The awwwards skill supplies the techniques. Nothing gets built until Ali Huzaifa approves a theme and answers the open questions at the end.

**Scope:** four projects are featured: DevOps Tutor, CloudAttend, Aaj Kya Pakayen and DAA Study Hub.

### Preflight results (checked, read-only)

| Check | Result |
|---|---|
| awwwards skill | Loaded (`~/.claude/skills/awwwards`, 7 references) |
| taste-skill (`design-taste-frontend`) | Installed at `.agents/skills/design-taste-frontend` (skills-lock from leonxlnx/taste-skill). **Not registered with Claude Code's Skill tool**, because that path isn't in `.claude/skills`. I read SKILL.md directly and ran its scripts, so it works. To register it: `mkdir -p .claude/skills && ln -s ../../.agents/skills/design-taste-frontend .claude/skills/design-taste-frontend` |
| Node | v26.5.0 (needs 22+) ✅ |
| Chrome for `inspect.mjs` | **Blocked.** Playwright Chromium is at `~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`, but it is missing `libnspr4`, `libnss3`, `libnssutil3`, `libsmime3` and `libasound2`. Windows Chrome under `/mnt/c` isn't found, because `cdp.mjs` only checks native Linux paths. **Fix (milestone 0, needs sudo):** `sudo apt-get install -y libnss3 libnspr4 libasound2t64` then `export CHROME_PATH=$HOME/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome` |
| Network for `assets.mjs` | Openverse works but returned thin results and then went quiet (probably rate-limited). **Wikimedia Commons fails DNS lookup from this environment** (`ENOTFOUND commons.wikimedia.org`, from both Bash and WebFetch). Retry at build time; the fallback is Ali Huzaifa's own photographs (see imagery). |
| taste-skill draws | Dealt with `TASTE_SKILL_HISTORY` and `--out` pointed at the session scratchpad, so nothing was written to the project or `~`. Re-deal into `.taste-skill/` at M1 with the same seeds. |

---

## 1. Findings per project (read from the repos)

The order is by strength. That is also the order on the site.

| # | Project | Problem | What Ali Huzaifa built | Stack | Hard part | Proof (verified) | Visually showable |
|---|---|---|---|---|---|---|---|
| 1 | **DevOps Tutor** (`iwhozaifa/devops-tutor`) | Learning DevOps means scattered resources, no structure, no accountability | A gamified day-by-day curriculum with an append-only XP ledger, badges, streaks, a timed CKA practice exam, guided projects (CI/CD pipeline, Linux server) and an admin panel with an audit log; new subjects added as JSON only | Next.js 16, Prisma 7, Postgres; **Terraform** for EC2, RDS, ALB, WAF, ECR, IAM, SES, CloudWatch alarms and backups; GitHub Actions → ECR → deploy over **SSM with OIDC (no SSH, no long-lived keys)** | `terraform test` with mocked providers in CI; a **monthly automated backup-restore drill**; deploy.sh health-gates `/api/health?ready=1` and rolls back on failure; a "Tests required" check fails PRs that change code without tests | 33 test files (unit, integration, Playwright E2E including CSP); Terraform suites for alarms, restore, WAF and setup; curriculum 2 modules, 14 days, 1 CKA exam | The strongest **AWS architecture diagram**: Internet → ALB+ACM → EC2 Docker → RDS, SSM, CloudWatch, OIDC deploy. App UI by running it locally with seed data. |
| 2 | **CloudAttend** (`iwhozaifa/cloudattend`) | Taking attendance by roll call is slow and easy to fake | Serverless university attendance. Teachers open sessions showing a **QR code HMAC-signed and rotated every 45 s**; students scan; the backend checks role, enrolment, session state, signature, expiry and duplicates; reports with CSV | React 19 + Vite + shadcn, **AWS CDK v2**: Cognito (+2 Lambda triggers), API Gateway HTTP API with JWT, Lambda, DynamoDB (5 tables, conditional writes), Secrets Manager, S3 + CloudFront with OAC, CloudWatch alarms | Atomic duplicate prevention, token expiry boundaries, least-privilege IAM per function; a local mode that runs the real API router with no AWS | v1.0.0 verification: **92 API + 86 web + 11 CDK tests; 54 E2E (18 × 3 viewports) with axe; 0 production vulnerabilities**. Honest gap: not yet deployed to AWS (the report says so) | The rotating QR (real, animatable), the teacher's live check-in list, the serverless diagram. Screens from `npm run dev:local` demo accounts. |
| 3 | **Aaj Kya Pakayen** (`iwhozaifa/aaj-kya-pakayen`) | "What's for dinner?", every night, for Pakistani home cooks | An **Urdu-first**, offline-first Flutter app: suggestions from the last 7 days, sabzi or gosht day, and the meat stock (oldest meat used first); 78 dishes; daily reminder; undo on every action | Flutter, Riverpod, Drift/SQLite, a pure-Dart suggestion engine, Clean Architecture enforced by a layering test, Noto Nastaliq Urdu | Nastaliq line height and RTL; an engine kept platform-free so it could sync later; **golden tests in both Urdu and English** | 62 test files; CI and release workflows; domain coverage gate at 80% | **Real golden PNGs in Urdu and English** (pantry, history, dishes, settings, onboarding). Its own palette (turmeric, chilli, cardamom, chai) bridges directly to the recommended theme. |
| 4 | **DAA Study Hub** (`iwhozaifa/daa-study-hub`, live at iwhozaifa.github.io/daa-study-hub) | CS332 algorithms students need clear, honest notes | A Fumadocs site: 9 topics, 4 study modes per topic, 2 timed mock midterms, 70 flashcards (also Anki CSV), a private progress tracker with no login, and `llms.txt` routes | Next.js 16 static export, MDX, KaTeX, Mermaid, Vitest, Playwright + axe, GitHub Pages | **Tests recompute every number in the worked examples**; CI fails if a copyrighted slide PDF is ever committed | Live URL; content tests; E2E with axe | Live site screenshots, a flashcard flip, a recurrence-tree diagram |

**What connects them:** each project ships with its own **receipts**: a restore drill that proves backups work, 54 browser tests across three screen sizes, golden images in two scripts, and tests that recompute the maths. Ali Huzaifa doesn't stop at a demo. He writes the infrastructure, the pipeline and the proof.

**The agentic thread, from verified facts only:** the repos carry `AGENTS.md` / `CLAUDE.md` working agreements (DevOps Tutor, DAA Study Hub), and the CI gates ("Tests required", failing-test-first) are what let coding agents contribute safely. The site will present it as how he works, not as an AI product.

**Positioning line:** *Ali Huzaifa builds cloud systems and the pipelines that ship them, with the receipts.*

**Also in his GitHub, for an "Also shipped" line (Q5):** classroom-reminder-bot (zero-cost Google Classroom → Slack DM automation on Apps Script), aws-cloud-resume-challenge (and its book), cloudattend-mobile (private, Expo).

---

## 2. Reference board

**Behance: blocked, said plainly.** `behance.net` returns **HTTP 403** to fetch. Headless Chromium can't start (the missing libs above). Search engines index Behance, so I can list gallery URLs, but **I have not seen these pages**. They are leads, not references. **Please paste screenshots or tell me which to keep** (Q11):
- Truck Art Font, Behram Khan: https://www.behance.net/gallery/23174259/Truck-Art-Font
- PAK 23, an Urdu typeface inspired by brutalist graphic design, by Muzammil Ali: https://www.behance.net/gallery/187564525/PAK-23-Urdu-Typeface-FREE-FONT-INCLUDED
- VASL Urdu Font, Javeria Hassan: https://www.behance.net/gallery/194154249/VASL-Urdu-Font
- Theka, a vector font from Indian truck lettering: https://www.behance.net/gallery/22044197/Theka-(Vector-Font)
- Search hubs: https://www.behance.net/search/projects/pakistani%20truck%20art and https://www.behance.net/search/projects/urdu%20poster

**References I could verify** come from taste-skill's studied set (Awwwards Site of the Day and One Page Love, with recorded analysis), plus readable web sources:

| # | Reference | Strong because | Steal | Avoid |
|---|---|---|---|---|
| 1 | PP Neue Montreal, https://neuemontreal.com/ (Awwwards SOTD 8.6) | A borrowed genre (travel guide) dictates titles, imagery and chapters; flat colour fields per chapter | **Borrow a genre:** ours is the goods truck and its paperwork | Cream + coral palette (too close to the banned cream/terracotta) |
| 2 | Paul Kalkbrenner, https://www.paulkalkbrenner.net/ (SOTD 8.1) | Swiss poster type; each chapter floods one flat colour; the photo is tinted to match | Colour-by-chapter as hard cuts | Visible grid hairlines (banned by the house rules) |
| 3 | Architecture of Socialist-Era Belgrade, https://belgrade.klmln.com (7.6) | Two-colour printed guidebook: one saturated colour plus greyscale photos | Strict two-ink discipline, inverted for long reading | n/a |
| 4 | poetry camera, https://poetry.camera/ (7.7) | The product sells through its own printed output (receipt slips) | **The site's own deploy receipt as an artefact** (the bilty, below) | Bitmap/mono faces (banned) |
| 5 | Mosby's Files, https://www.mosbyfiles.com/ (SOTD 8.0) | An archive as a physical stack of coloured folders; five flat primaries on charcoal | Clashing flat primaries on a dark ground | Its mono metadata |
| 6 | Decathlon Yestalgia, https://decathlonyestalgia.com/ (7.8) | Full commitment to a vernacular (Memphis); hard offset shadows make shapes feel die-cut | **Committing to a vernacular all the way** | Sticker shadows (resting shadows are banned) |
| 7 | Seasats, https://www.seasats.com/ (SOTD 8.4) | Menu built from stacked colour swatches sampled from the imagery | Nav/menu colour taken from the photographs | Low-contrast greys |
| 8 | Gil Huybrecht, https://gilhuybrecht.com/ (SOTD 7.6) | Developer/designer portfolio as a contact sheet of real screenshots | **Real uncropped screenshots as the main evidence** | Index numbering, pure #000 |
| 9 | HAOQI.DESIGN, https://haoqi.design (SOTD 7.6) | A design engineer's page as an instrumented canvas with live readouts | **One live readout** that proves the thing is running | Crosshair grid, mono, cobalt glow (all on the slop list) |
| 10 | The New Industrials, https://thenewindustrials.com/ (8.3) | Tall condensed slab title at 14vw; background changes per chapter | Scale of the title | Drafting-grid hairlines, the gradient |
| 11 | The Sapphic Bar Index, https://sapphicindex.com (7.7) | A guide dressed as a dossier: taped snapshots, a score per row | The genre-dressing of evidence | Typewriter mono |
| 12 | Granta 112 "Pakistan", cover painted by truck artist Islam Gull (https://granta.com/?p=2478) | Truck painting moved into editorial print without losing force | **Truck-art register at poster scale, on a serious publication** | Literal pastiche of the floral border |
| 13 | Lollywood billboard painters, Royal Park, Lahore (https://pakistaniat.com/2008/02/23/pakistan-lollywood-billboard-art/ ; https://homegrown.co.in/homegrown-creators/how-censorship-cemented-the-legacy-of-pakistans-most-iconic-film-posters) | Hand-painted type at 70-ft scale, extra-bright colour, letters as image | Oversized, brutally confident type and saturated flats | Caricature of bodies and film kitsch |
| 14 | Urdu print culture: Noori Nastaleeq (1981), Abeera Kamran's Reading PhD on Lahori Nastaʿlīq on screen (https://research.reading.ac.uk/centre-for-book-cultures-and-publishing/?p=2006); Pakola's Urdu logotype (https://papers.iafor.org/wp-content/uploads/papers/kamc2024/KAMC2024_81980.pdf) | Nastaliq as everyday signage, not ornament | **Urdu set as real text with its proper line height (≈1.9)**, as his own app does | Fake "Arabic-looking" Latin |
| 15 | Phool Patti Atelier, truck-art-inspired brand concept by Muhammad Salman (Contra, from search; page now 404) | Palette from the trucks: crimson, mustard, peacock teal; tilted stickers | The **crimson / mustard / peacock** trio, now verified as the trucks' own | Tilted sticker clutter |
| 16 | Raah, an Urdu calligraphy typeface from truck art, by Usman Kaleem (https://showcase.uwe.ac.uk/?p=34249) | Truck lettering turned into a usable type system | Proof that truck art can be systematic, not decorative | n/a |

**Patterns found:** (a) the best sites borrow a genre and let it decide every title and section; (b) flat colour by chapter, cut hard at edges; (c) one huge face plus one small size; (d) the subject's own artefact (receipt, folder, guidebook) is the content's container; (e) real screenshots beat illustrations for software.

**Clichés I will avoid** (beyond your list): crosshair/hairline blueprint grids; mono "terminal" captions and 01/02/03 indices; scramble/decode text; floating pill nav; marquee of tech logos; skill bars; "Hi, I'm…" heroes; a "currently building" pulse dot; truck-art floral borders as clip art; orientalist "exotic" framing.

---

## 3. Three theme directions

Each uses one composition **dealt by taste-skill** (`draw.mjs --sector personal-portfolio --tone bold --have product-ui`, sections work, how-it-works, about, contact, footer). Each is filled with Ali Huzaifa's material. Where a seed idea broke house rules, the rules win: the blueprint/control-room seed's hairline grid and crop marks are banned, so B keeps the signage and drops the grid.

### A. "Grand Trunk": goods-truck painting × *pinned poster* (dealt: Chivo, hero "Card over a dim room", seed 4127)
- **Idea:** Ali Huzaifa ships things, and in Pakistan the thing that ships is the painted goods truck. **His projects become tailgate panels passing under his pinned name, and every deploy of this site is issued a *bilty* (the consignment slip Pakistani truckers carry) by the site's own pipeline.**
- **Palette (oklch, roles, contrast).** Colours come from the trucks and from his own Aaj Kya Pakayen app; the sheet's proportions are kept (one ground, one ink, one accent, fields).
  - `--night` oklch(0.19 0.025 55) #1d1109: ground
  - `--paper` oklch(0.95 0.02 85) #f5eee0: ink (16.0:1 on night)
  - `--turmeric` oklch(0.80 0.165 80) #f5b005: accent and the action (night text on it 9.7:1)
  - `--chilli` oklch(0.62 0.20 30) #e54533: field (night text on it 4.6:1)
  - `--peacock` oklch(0.46 0.09 205) #006670: field (paper text on it 5.8:1)
  - `--dust` oklch(0.76 0.03 75) #bdaf9d: secondary text (8.6:1 on night)
  - Rule: on a paper-ground section the accent is peacock, never chilli, which avoids the banned cream + terracotta.
- **Type (2 families):** **Chivo** 900 uppercase display (-0.05em tracking, 0.88 leading), with Chivo 400/700 for text; **Gulzar** (Google Fonts, Nastaliq) for Urdu, line-height 1.9, subset to the glyphs used. Steps: `--step-small clamp(.8125rem,.79rem+.1vw,.875rem)`, `--step-body clamp(1.0625rem,1rem+.25vw,1.1875rem)`, `--step-lead clamp(1.25rem,1.1rem+.7vw,1.625rem)`, `--step-head clamp(2.5rem,1.2rem+5vw,5.5rem)`, `--step-display clamp(4rem,12vw,13rem)`.
- **Grid and layout:** 12 columns, one pair of 24px/16px margins. Full-bleed project panels alternate with narrow-measure prose. Two held stages, no more.
- **Hero:** a dim night photograph of a real tailgate, with a turmeric "painted panel" card carrying the h1. On scroll the card shrinks into the bilty stub, bottom-left.
- **Texture and imagery:** real photographs only (his own truck photos first, credited Commons/Openverse second), real screenshots, SVG architecture diagrams in the palette.
- **Motion:** masked line rise for the name ("the paint goes on"); the pinned story (panels pass under the fixed name, like trucks under a toll sign); card → stub ("the slip is issued"); a slow drift on the hero photo (the truck idling).
- **Risks:** kitsch, orientalism, floral overload. **Guard:** no drawn florals; all ornament comes from photographs; Chivo's discipline against the photo's exuberance; Urdu only where it means something; one accent.

### B. "Platform": Pakistan Railways station board × *name as monument* (dealt: Big Shoulders / Public Sans, "Title from the top edge to the bottom edge", seed 1953796102)
- **Idea:** Pakistani station nameboards (yellow enamel, black capitals, English over Urdu) become the hero. **ALI / HUZAIFA set edge to edge like a station board, and each project is a station on his pipeline line, with CI stages as stops.**
- **Palette:** `--enamel` oklch(0.96 0.006 95) #f3f2ed ground; `--ink` oklch(0.18 0.012 260) #0e1217 (16.8:1); `--signal` oklch(0.53 0.21 29) #c9120d accent (5.2:1 both ways); `--slate` oklch(0.46 0.012 260) (6.3:1); a field of `--station` oklch(0.86 0.17 95) #f4ce23 with ink (12.3:1). The sheet's #fff/#000 are replaced, per your rule.
- **Type:** **Big Shoulders** 800 uppercase (civic signage gothic) + **Public Sans**. That is two families, so Urdu would need a third; the Urdu nameboard lines would have to be SVG lettering made from Gulzar outlines, which is a compromise.
- **Layout and hero:** the h1 runs top edge to bottom edge, line 2 indented 28vw, over one full-bleed station photograph. Work: "names passing a held square". The pipeline map is drawn with thick 6px "track" lines (fills, not hairlines).
- **Motion:** masked headline (the board flips into place), the line map draws as you scroll (the train advances), stations light when reached.
- **Risks:** transit maps are a developer-portfolio cliché, and the signage slides toward Swiss-generic. Lower distinctiveness than A.

### C. "Riso Manifest": a two-ink risograph zine × *type-only statement* (dealt: Newsreader, "Stacked name, two inks", seed 1841918758)
- **Idea:** Ali Huzaifa writes unusually honest READMEs and test reports ("CloudAttend is not production-ready"). **His docs become a self-published two-ink riso zine, with each case study printed like a page of the build log.**
- **Palette:** `--burgundy` oklch(0.25 0.095 12) #440315 ground; `--pink` oklch(0.83 0.12 350) #ffa7d2 ink and accent (9.2:1); `--paper` oklch(0.95 0.012 350) (14.2:1); `--plum` surface (pink on it 7.4:1).
- **Type:** **Newsreader** only, with optical sizes: light 300 at 15vw, bookish at 19px. Urdu in Gulzar.
- **Layout and hero:** no image on the first screen; the name stacked in two inks; work as a single paragraph of project names; how-it-works as an "itinerary on a slip".
- **Motion:** masked headline and an ink-fill statement; a riso grain via a static raster texture, not animated.
- **Risks:** quietest of the three, close to "editorial portfolio" sameness; burgundy/pink reads fashion rather than engineering. Weakest fit for LOUD.

---

## 4. Recommended theme: **A, "Grand Trunk"**

**Why.** It is the only one of the three that passes the competitor test on two counts at once. The *bilty issued by this site's own pipeline* belongs to a DevOps engineer, and the *Urdu tailgate lines* belong to the person who built an Urdu-first app. It is the loudest (saturated flat fields, 12vw capitals, night photographs). It comes from South Asian vernacular rather than tech, the antidote you named. No developer portfolio I found uses it; the Behance hits are typefaces and posters, not engineering sites. B is cleaner but is a transit-map cliché. C is beautiful but quiet.

**The live thing: the bilty.** A consignment slip that the GitHub Actions run writes at deploy time as `/bilty.json`. It shows:
- the run number and commit SHA, each linked to the real run;
- shipped date and time in PKT;
- tests passed, Lighthouse scores from CI and bytes shipped;
- the CloudFront invalidation ID.

On load the page also fetches the public GitHub API for the latest workflow status, showing "On the road" (running), "Delivered" (green) or "Held at checkpost" (failed). It falls back to the baked JSON with no script or when rate-limited. It is thumb-sized on a phone (the stub opens into a sheet) and it never blocks reading.

**Hero treatment (desktop 1440):**
```
┌──────────────── night photo of a real tailgate, brightness .7, full-bleed ────────────────┐
│                                                                                           │
│        ┌──────────── turmeric painted panel, cols 4–10, square corners ───────────┐       │
│        │ ALI              HUZAIFA                                   علی حذیفہ     │       │
│        │ (h1 "Ali Huzaifa": Chivo 900 at 12vw on 2 lines in the stub-down state)  │       │
│        │ I build cloud systems and the pipelines                                  │       │
│        │ that ship them, with the receipts.       (lead, 30ch)                    │       │
│        │ <city> · Software engineering, Yr N · open to <goal>  (Q2/Q3)            │       │
│        │ [ See the work ↓ ] ← single action, night on turmeric      GitHub ↗      │       │
│        └──────────────────────────────────────────────────────────────────────────┘       │
│  photo credit 14px                                                                        │
└───────────────────────────────────────────────────────────────────────────────────────────┘
scroll → the panel scales toward bottom-left → becomes the 120px BILTY stub (Run #142 · Delivered)
```
Phone (390): the photo fills 100svh; the card is full width minus 16px and 70svh tall; the name on two lines at 19vw; the action spans the card's bottom edge; the stub then pins bottom-left at 120px.

**Project panel treatment (DevOps Tutor), one of the pinned-poster work panels:**
```
┌──────────── 100vw × 100svh, flat CHILLI field ──────────────────────────────┐
│  pinned above all panels: ALI HUZAIFA / ON THE ROAD (paper, 12vw)           │
│                                                                             │
│   real DevOps Tutor UI crop (day view + XP/streak), data-ui, 130% scale     │
│                                                                             │
│ 2026 ──── DEVOPS TUTOR ─────────────────────── Restore drilled monthly      │ ← midline row, fixed y
│                                                                             │
│                                   "دیکھ مگر پیار سے" (tailgate line, Q7)      │
│  [Read the case study →]                                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```
Fields cycle chilli → peacock → turmeric → paper across the four panels so neighbours never repeat. Each tailgate line is Urdu set in Gulzar and approved by Ali Huzaifa.

---

## 5. Storyboard (theme A; it adapts if you pick B or C)

The argument (claim → proof) decides the sections:

1. **Hero.** Claim: Ali Huzaifa builds and ships real systems. Proof: name, positioning line, the bilty. *Full-bleed photo with the card. Density: low. Scale: max.*
2. **Work, "On the road".** Claim: four shipped systems, strongest first. Proof: four full panels (DevOps Tutor, CloudAttend, Aaj Kya Pakayen, DAA Study Hub). Each has a real screenshot, a midline row (year, title, one proof fact) and a link to its case study. *Pinned stage 1. Full-bleed. High image density.*
3. **How I ship.** Claim: same discipline across AWS, DevOps, automation and agentic development. *Contained two-column layout.*
   - **Left:** four 80vh statements.
     - "Infrastructure is code." (Terraform in DevOps Tutor, CDK in CloudAttend and this site)
     - "Nothing merges without a test." ("Tests required" gate, golden tests, recomputed maths)
     - "Drill the failure first." (restore drill, rollback on a failed health check)
     - "Agents work inside the gates." (`AGENTS.md`/`CLAUDE.md` rules plus CI gates that coding agents must pass; automation like the Classroom → Slack reminder bot)
   - **Right:** a sticky `data-ui` fragment of this site's real pipeline, built in HTML. It changes state per statement: plan → test → deploy → invalidate.
   - This replaces a skill-bar list. *Pinned stage 2, the last one.*
4. **Also shipped.** Claim: range beyond the main four. Proof: an Urdu/English running list with classroom-reminder-bot, aws-cloud-resume-challenge and cloudattend-mobile (Q5). *Narrow measure, typographic, a paper field, dense.*
5. **About, "Driver".** Claim: who Ali Huzaifa is. Proof: portrait, university and year, city, what he's learning next, a 120-word bio. *Dealt "pinned title, portraits pass" with 3–4 photos of him and his world. If no portrait, it reduces to a split layout: Q6.*
6. **Contact, "Book a load".** Claim: here is how to hire or collaborate. *Full-bleed photo of a truck stand at night with an opaque bilty card:* email (`mailto:` with subject prefilled per goal), GitHub, LinkedIn, résumé PDF, a live local-time line ("It's 21:40 in <city>"), availability, one button.
7. **Footer.** *Split: tight tailgate crop left; right side has the menu set large, the name at full width, the credits line for found pictures, and پھر ملیں گے ("see you again", the classic tailgate sign-off, Q7).*

**Case-study pages** (`/work/<slug>`, one template, four pages). Title panel in the project's field colour, then Problem, What I built, then **Architecture**: a hand-authored SVG from the real repo with 4–6px "road" strokes, painted-plate nodes and Chivo labels; no hairlines and no AWS icon soup; a mermaid source is kept for accuracy. Then The hard part, then Proof (only real numbers from section 1), then Stack (a "manifest" list, not badges), then Links (repo, live, docs). Next project is a full-width panel, so the case study ends as a truck passing.

**Navigation.** Desktop: a plain bar with the wordmark "ALI HUZAIFA", Work / How I ship / About and one action "Contact", plus a header ink that follows the chapter colour. Phone: wordmark plus a "Menu" button opening a full-screen turmeric sheet with 5 links at 10vw (thumb zone, Esc and focus-trap). The bilty stub stays bottom-left at 120px, out of the thumb's way. No hover-only content. **Mobile layouts are their own compositions**, following the per-blueprint phone specs above.

**Imagery plan (floor: at least 4 real pictures, target 8–12):**
1. **Ali Huzaifa's own:** 6–10 night/dusk photos of real goods-truck tailgates, and a portrait (Q6). These are the best and most honest.
2. **Real screenshots:** DAA (live), DevOps Tutor and CloudAttend (local demo data), Aaj Kya Pakayen (golden PNGs and an emulator). Crops get `data-ui`.
3. **Open archive via `assets.mjs --get`, credited:** found so far is "Decorated bus in Karachi" (CC BY-SA 2.0, Commons curid 4806655); retry Commons "Truck art in Pakistan" when DNS works.
4. **Drawn in code:** architecture diagrams and the bilty slip only.
5. One moving picture: a muted loop of a truck panel (his phone footage or a Commons clip), with a poster frame.

---

## 6. Tech architecture

| Layer | Choice | Why / tradeoff |
|---|---|---|
| Framework | **Astro** (latest stable, exact-pinned), static output, MDX content collections for case studies | Content site with zero JS by default, so the <3 s budget is easy. Next.js would add a React runtime for no gain. |
| Styling | Plain CSS with custom properties (`tokens.css`), starting from taste-skill `assets/base.css`; no Tailwind | Tokens map 1:1 to the direction sheet; avoids default-Tailwind look |
| Motion | **GSAP 3.15 + ScrollTrigger** via taste-skill's shared stage (`assets/scenes/stage.js`); **Lenis 1.3** only through `Stage.smooth()` (desktop, off for touch and reduced motion); CSS scroll-driven animations for progress-only effects | One animation library (awwwards rule). Never hijacks scroll (taste rule). |
| 3D | **None.** | The idea is paint and paper; WebGL would be a darling to kill. It saves about 150 KB and the fallback work. |
| Images | `astro:assets` (sharp) → AVIF/WebP `srcset`, explicit width/height, lazy except the hero, hero preloaded with `fetchpriority=high` | LCP < 2.0 s |
| Fonts | Self-hosted woff2; Chivo variable subset to Latin; **Gulzar subset to the exact Urdu strings used** (pyftsubset, often > 90% smaller); `font-display: swap`; preload Chivo only | Nastaliq files are heavy; subsetting is mandatory |
| Live thing | `/bilty.json` written by CI, plus one `fetch` to `api.github.com/repos/iwhozaifa/<site-repo>/actions/runs?per_page=1`, cached in sessionStorage | Unauthenticated limit is 60 requests/hour per IP; degrades to the baked JSON |
| Performance budget | LCP < 2.0 s on mobile 4G, total JS < 60 KB gzip (GSAP + ScrollTrigger ≈ 45 KB), CSS < 25 KB, CLS < 0.05, 60 fps (transform/opacity only, `will-change` set only during an animation) | Checked with Lighthouse CI on every PR |
| Accessibility | WCAG 2.2 AA: contrast table above, visible focus (3px turmeric outline + offset), skip link, `lang="ur" dir="rtl"` on every Urdu span, semantic landmarks, one h1, alt text written per image, keyboard-operable menu and bilty sheet, `prefers-reduced-motion` = finished compositions with no travel | axe in Playwright, 0 serious or critical |
| SEO and social | Per-page title and description, canonical, `sitemap-index.xml` (@astrojs/sitemap), robots.txt, JSON-LD `Person` + `CreativeWork` per project, **OG images generated at build** (Satori/resvg: turmeric panel, name, project title) | Shares look designed |
| Hosting (proof of skill) | **S3 (private, OAC) + CloudFront + Route 53 + ACM (us-east-1)**, defined in **AWS CDK (TypeScript)** with assertion tests, the same pattern as CloudAttend, so the site itself is a fifth case study ("this site") | CDK keeps one language across repo, site and infra; Terraform is already shown in DevOps Tutor |

**Infra details:** CloudFront response-headers policy (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy); a CloudFront Function for `/path` → `/path/index.html` and www → apex; HTTP/3; 404 page; a budget alarm at $5; access logs off unless asked. **Preview builds:** a separate preview bucket and distribution with a wildcard cert `*.preview.<domain>`; the CloudFront Function maps `pr-<n>.preview.<domain>` → prefix `pr-<n>/`; cleaned up on PR close.

**Pipeline (GitHub Actions, OIDC role, no stored keys):**
```
PR opened/updated ─► ci.yml: install → astro check → lint (taste lint.mjs + eslint) → build
                     → Playwright (Chromium/Firefox/WebKit) + axe → Lighthouse CI (budgets)
                     → taste inspect.mjs (1440/768/390, 0 FAIL required) → cdk synth + infra tests
                     → deploy-preview: s3 sync → pr-<n>/ → comment preview URL on PR
merge to main ─────► same gates → write bilty.json (run #, sha, tests, LH, bytes)
                     → environment "production" (required reviewer: Ali Huzaifa)
                     → s3 sync: hashed /_astro/* = "public,max-age=31536000,immutable";
                       *.html, bilty.json, sitemap = "public,max-age=0,must-revalidate"
                     → CloudFront invalidation of "/*" (1 path; html cached at 0 so this is cheap)
                     → smoke test (curl 200 + header check) → bilty status "Delivered"
PR closed ─────────► delete pr-<n>/ prefix
infra change ──────► infra.yml: cdk diff posted to PR → cdk deploy on main with approval
```

---

## 7. Milestones with gates

| M | Deliverable | Verification gate |
|---|---|---|
| **0. Prereqs and scaffold** | Chromium libs installed, `CHROME_PATH` exported, taste-skill symlinked into `.claude/skills`, Astro scaffold, git repo, `.taste-skill/` re-dealt with the approved seed | `inspect.mjs` runs on a hello page and writes screenshots; `lint.mjs` passes |
| **1. Inventory, argument, copy deck** | `docs/copy-deck.md`: every headline (≤ 32 characters, two-line arithmetic from copy.md §2), the full case-study text using only verified proof, Urdu lines, alt text | Ali Huzaifa approves the copy and Urdu; no invented metrics, quotes or logos; only the four featured projects appear |
| **2. Design tokens** | `tokens.css` (oklch colours with roles, fluid type steps, space scale, easings `cubic-bezier(.16,1,.3,1)` and `(.76,0,.24,1)`, durations 150/250/400/600), subset fonts, a specimen page | Contrast table recomputed from tokens (all text pairs ≥ 4.5:1 or large-only noted); inspect 0 FAIL on the specimen |
| **3. Hero + bilty (static)** | Hero to the blueprint at 1440/768/390; bilty stub and sheet with baked JSON; nav and phone menu | inspect 0 FAIL; h1 ≤ 2 lines at every width; first-screen 5-second test written down |
| **4. Case-study template** | `/work/[slug]` with the DevOps Tutor case study complete, including its architecture SVG | Diagram checked against the repo by Ali Huzaifa; inspect 0 FAIL; the template renders all four from MDX |
| **5. Remaining sections and imagery** | Work panels, How I ship (static states), Also shipped, About, Contact, Footer; three more case studies; imagery downloaded with `--get` and credits in the footer | ≥ 4 real pictures (target 8+); lint clean; inspect 0 FAIL; no blank stretch > ½ screen; neighbouring sections differ |
| **6. Infra and pipeline** | CDK stack (prod and preview), workflows above, bilty.json generation, OG images, sitemap | `cdk synth` + assertion tests green; a PR shows a working preview URL; the main deploy invalidates and the bilty reads "Delivered" |
| **7. Motion layer** | Masked name rise; pinned story; card → stub; How-I-ship state switch; section entrances (60–90 ms stagger, 16–32 px rise, once); press/hover/focus on every control; hero photo drift | inspect motion count ≥ 16 moving elements (fails < 8); reduced-motion screenshots complete; Chrome performance trace shows no long frames > 16 ms during scroll |
| **8. Polish and QA** | Three look rounds | See the QA plan below; all green |
| **9. Launch** | Domain, Route 53 zone, ACM, prod deploy, Search Console sitemap | Live URL passes the smoke test, Lighthouse and axe on production |

**QA plan.** `inspect.mjs` at 1440/768/390 must show 0 FAIL, and every WARN is defended in one sentence. Then up to **three look rounds**: open every screenshot, write a critique in `critique.md` §4 format with the Awwwards-weighted score, fix the top three, re-inspect. Then:
- Lighthouse mobile: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100.
- axe: 0 serious or critical.
- Keyboard-only pass.
- Screen reader pass (Orca/NVDA): Urdu spans announced as Urdu.
- Playwright on Chromium, Firefox and WebKit; a real iPhone Safari and an Android Chrome check if available.
- `file://` open once (taste-skill asks for it).

**Slop checklist (run against the final site, each item a hard fail):**
- [ ] No purple/indigo/violet, no blue-to-pink or any gradient (only a neutral scrim on photos), no neon cyan on dark, no aurora, blobs or glowing orbs
- [ ] No glassmorphism, `backdrop-filter`, frosted cards, resting shadows or glows; no 9–16px "soft" radius (square corners)
- [ ] No Inter, Poppins or Space Grotesk anywhere; only Chivo + Gulzar loaded (check computed fonts)
- [ ] No centred hero with a gradient headline and two pill buttons; exactly one primary action on the first screen
- [ ] No sparkles, robots, brains or circuits; no "AI-powered"; no chat-bubble motif
- [ ] No stock illustration, emoji as design, lorem ipsum, identical three-column cards, skill bars or logo marquee
- [ ] No `#000`/`#fff` in computed styles (grep plus inspector colour list)
- [ ] No eyebrow labels, tiny tracked uppercase labels, monospace outside `<pre>`, 01/02/03 indices, hairlines, crosshairs or crop marks
- [ ] Headlines ≤ 2 lines at all widths; one h1; every section has a heading; equal margins
- [ ] Only transform and opacity animate (audit `gsap.to` props and CSS transitions); reduced motion = complete static page
- [ ] Every found picture credited; no found picture presented as Ali Huzaifa's own work
- [ ] Every number on the page traceable to a repo file or a CI artefact
- [ ] Only the four featured projects appear anywhere (copy, alt text, metadata, OG images)

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Truck art reads as kitsch or exoticised | His own photos, Urdu he approves, no drawn florals, disciplined Chivo; a critique round asks "would a Pakistani designer wince?" |
| The agentic claim rests on practice, not a product | Frame it honestly as *agentic development practice* (AGENTS.md rules plus CI gates) and automation (reminder bot); no AI-product claims |
| Two projects are not deployed (DevOps Tutor, CloudAttend) | Say it honestly ("infrastructure tested offline, not yet live"); state proof as test counts; offer to deploy CloudAttend as part of this project (Q5) |
| Not enough honest imagery (Commons DNS blocked, Openverse thin) | He shoots 6–10 photos (one evening); otherwise screenshots and the golden images carry the floor |
| The inspector can't run (WSL libs) | M0 blocks everything until `inspect.mjs` runs |
| Gulzar weight hurts LCP | Subset to used strings; Urdu is never the LCP element; `font-display: swap` |
| GitHub API rate limit on the bilty | Baked JSON first; live status is progressive enhancement |
| Pinned stages are heavy on mobile | Phone specs reduce held lengths; sticky only, no scroll hijack; test on a mid-range Android |
| Skill conflicts (awwwards recommends tracked labels, mono accents, glass, gradients, custom cursor) | Taste-skill precedence: those awwwards techniques are not used; awwwards supplies easing, fluid type, GSAP/ScrollTrigger and View Transitions patterns |

---

## 9. Open questions for Ali Huzaifa (one batch)

1. **Theme:** approve **A "Grand Trunk"** (recommended), or pick B "Platform" or C "Riso Manifest"?
2. **Identity:** display name "Ali Huzaifa" (confirmed). City (it drives the local imagery and live time)? University, programme, year and graduation date?
3. **Goal and primary action:** internship, full-time role, freelance or collaboration? Availability dates? This sets the hero action and the contact `mailto:` subject.
4. **Links:** email for the site, LinkedIn, résumé PDF, anything else (X, Medium, certifications such as AWS CCP/SAA)?
5. **Deployments and extras:** are DevOps Tutor or CloudAttend deployed anywhere, with any real usage (learners, check-ins)? Include classroom-reminder-bot, aws-cloud-resume-challenge and cloudattend-mobile in "Also shipped"?
6. **Photos:** can you shoot 6–10 night or dusk photos of real goods-truck tailgates and a short clip, plus 1–3 portraits of you? If not, are found archive pictures and screenshots acceptable?
7. **Urdu:** are you happy with Urdu on the site? Will you supply or approve one tailgate line per project and "پھر ملیں گے" for the footer? I won't invent Urdu poetry.
8. **Domain and AWS:** do you own a domain (or want one, e.g. `alihuzaifa.dev`)? Is an AWS account available for the site (≈ $1–2/month plus the domain), and may I add a Route 53 zone?
9. **Bio:** a 100–150-word bio, or bullet facts for me to draft into your voice?
10. **Analytics:** none, Cloudflare Web Analytics (as on DAA Study Hub), or CloudFront logs only?
11. **Behance:** paste screenshots or links of any Behance work you want in the board; I could not open Behance from here.

---

## Critical files (to be created at build, after approval)
- `astro.config.mjs`, `src/styles/tokens.css` (from `.agents/skills/design-taste-frontend/assets/base.css`), `src/pages/index.astro`, `src/pages/work/[slug].astro`, `src/content/work/{devops-tutor,cloudattend,aaj-kya-pakayen,daa-study-hub}.mdx`
- `src/components/{Hero,Bilty,WorkPanel,ShipStage,CaseArchitecture}.astro`, `public/bilty.json` (CI-written)
- `src/scripts/motion.js` (taste `assets/scenes/stage.js` + GSAP recipes from taste `references/motion.md` "Masked line reveal", "Pinned story", "Reveal on scroll")
- `infra/` (CDK app + `infra/tests/stack.test.ts`), `.github/workflows/{ci,deploy,preview,infra}.yml`
- `docs/copy-deck.md`, `.taste-skill/` (sheet, inspect output, critiques), `public/credits` via `assets.mjs --credits`

---

## Revisions during the build

- **M2, palette (2026-10-24).** taste-skill's inspector failed the specimen on `palette-claude`: the cream
  paper (#f5eee0) with the orange-red chilli (#e54533) fell inside its cream and terracotta bands. Paper is
  now **bone** `oklch(0.945 0.005 85)` #eeede9 and chilli is now **crimson** `oklch(0.55 0.21 22)` #d01a34,
  the crimson of the trucks themselves. Crimson fields take bone text (4.61:1). Every pair is checked by
  `npm run contrast` in CI.
- **M2, fonts.** Gulzar subset to the Urdu actually used is 115 KB (Nastaliq keeps a large shaping
  closure); it is never preloaded and never the LCP element. Subsetting uses `subset-font` (HarfBuzz
  WASM) instead of Python fonttools, which is not installable here without sudo.
