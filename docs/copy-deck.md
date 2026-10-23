# Copy deck

Every word on the site, written before markup (taste-skill step 5). Facts come only from the repos
(see `docs/PLAN.md` §1). `[[TBD: …]]` marks what Ali Huzaifa still has to supply. `[[URDU]]` marks an
Urdu line he will write later; the layout keeps its slot, and the page ships without it until then.

Headline budget: Chivo 900 capitals, k ≈ 0.58. At 44px on a 350px phone line that is about 13
characters a line, 26 for two lines; at 12vw on desktop the name is the only display line. Section
headings are two to four words. Counts are in brackets.

## 1. The argument

| # | Section | Claim | Proof on the page |
|---|---|---|---|
| 1 | Hero | Ali Huzaifa builds cloud systems and the pipelines that ship them, and takes freelance builds. | The name, the plain line, the bilty from this site's own deploy |
| 2 | On the road | Four systems, shipped with their receipts. | A full panel each: real screen, one checked fact, a case study |
| 3 | How I ship | The same discipline in every project: code for infrastructure, tests before merge, drills before failure, gates for agents. | This site's real pipeline, state by state |
| 4 | Also shipped | The range goes past the main four. | A short list with links |
| 5 | Driver | Who he is and how to work with him. | Portrait, study, city, a short bio |
| 6 | Book a load | Here is how to start a project. | Email, links, his local time, one button |
| 7 | Footer | A designed close. | Menu, name, credits |

## 2. Navigation

- Wordmark: **ALI HUZAIFA**
- Links: **Work** · **How I ship** · **About**
- Action: **Start a project** (the one primary action, same name everywhere)
- Phone: **Menu** / **Close**

## 3. Hero

- h1: **Ali Huzaifa** [11]
- Urdu name beside it: **علی حذیفہ** [[confirm spelling]]
- Supporting line (lead, 18px+): **I build cloud systems on AWS and the pipelines that ship them. Freelance builds welcome.** [17 words]
- Facts, one line: **Software engineering student at [[TBD: university]], [[TBD: city]], Pakistan.**
- Primary button: **Start a project** → `mailto:[[TBD: email]]?subject=Project%20enquiry&body=What%20are%20you%20building%3F`
- Text link: **GitHub** → https://github.com/iwhozaifa
- Photo credit (14px): set from `assets.mjs --credits` once the hero picture is chosen.

### The bilty (live slip)

- Stub, collapsed: **Bilty #[run]** and the status word.
- Status words: **Delivered** (last deploy green) · **On the road** (deploy running) · **Held at checkpost** (last deploy failed)
- Sheet title: **Bilty for this page**
- Rows (label, value), all from `bilty.json`:
  - **Consignment** · run #[run_number], linked to the Actions run
  - **Commit** · [short sha], linked to the commit
  - **Shipped** · [date, time] PKT
  - **Checks passed** · [n] of [n]
  - **Lighthouse** · Performance [n], Accessibility [n]
  - **Load** · [kB] shipped
  - **Invalidation** · [CloudFront id]
- Footnote: **Written by the pipeline that deployed this page.**
- No-script and rate-limited fallback: the same rows from the baked JSON, status from the build.

## 4. On the road (work)

Pinned title over the panels: **ON THE ROAD** [11]

Midline row on each panel: year · title · one fact. Then a link: **Read the case study**.

| Panel | Field | Year | Title | Fact | Screen | Urdu |
|---|---|---|---|---|---|---|
| 1 | chilli | 2026 | **DEVOPS TUTOR** | Backups restored every month | Day view with XP and streak, local seed data | [[URDU]] |
| 2 | peacock | 2026 | **CLOUDATTEND** | QR codes that expire in 45 seconds | Teacher's session screen: live QR and check-in list, demo accounts | [[URDU]] |
| 3 | turmeric | 2026 | **AAJ KYA PAKAYEN** | 78 dishes, Urdu first | Golden image `dishes_ur.png` beside `dishes_en.png` | [[URDU]] |
| 4 | paper | 2026 | **DAA STUDY HUB** | Every worked number checked by tests | Live site: a recurrence page, flashcard face | [[URDU]] |

## 5. Case studies (`/work/<slug>`)

Each page: title panel → Problem → What I built → Architecture → The hard part → Proof → Stack → Links →
next project panel. Headings are the same words on every page.

### DevOps Tutor (`/work/devops-tutor`)

- Title: **DEVOPS TUTOR** · Subtitle: **A DevOps course that runs on the infrastructure it teaches.**
- **Problem.** Learning DevOps means thousands of free resources, no order to them and nothing that
  tells you whether you learned anything.
- **What I built.** A day-by-day curriculum built from open resources, with quizzes after each day, a
  timed CKA practice exam, hands-on tasks with hints and solutions, and guided projects such as a CI/CD
  pipeline and a Linux server setup. Progress earns XP, badges and streaks. Subjects are JSON files, so
  adding one needs no code. An admin panel tracks learners and logs every admin action.
- **Architecture** (diagram nodes, left to right): Learner → **ALB** with an ACM certificate (and
  **WAF**) → **EC2** running the Docker container → **RDS PostgreSQL**. Side lanes: **SSM Parameter
  Store** (config into the container), **CloudWatch** (logs and alarms), **SES** (email), **ECR**
  (images). Deploy lane: **GitHub Actions** → OIDC → ECR push → **SSM Run Command** → `deploy.sh`
  health-gates `/api/health?ready=1`, rolls back on failure. All of it in **Terraform**.
- **The hard part.** Making the production setup provable without a live account: every Terraform
  module is covered by `terraform test` against mocked providers in CI, deploys never use SSH or
  stored keys, and a scheduled workflow restores the latest backup every month to prove it can be
  restored.
- **Proof.** 33 test files across unit, integration and Playwright end-to-end (including the content
  security policy). Terraform test suites for alarms, restore, WAF and setup. A "Tests required" check
  fails any pull request that changes code without changing a test. XP is an append-only ledger, so
  every point can be traced.
- **Stack.** Next.js 16 · TypeScript · Prisma 7 · PostgreSQL · NextAuth v5 · Zod · Vitest · Playwright
  · Docker · Terraform · AWS EC2, RDS, ALB, WAF, ECR, SSM, SES, CloudWatch · GitHub Actions
- **Links.** Repository: https://github.com/iwhozaifa/devops-tutor · Live: [[TBD: deployed URL, if any]]
- Honest note (shown when no live URL): **Infrastructure tested in CI. Not deployed publicly yet.**

### CloudAttend (`/work/cloudattend`)

- Title: **CLOUDATTEND** · Subtitle: **University attendance a screenshot can't fake.**
- **Problem.** Roll call wastes lecture time, and a static attendance code can be shared with
  friends who aren't in the room.
- **What I built.** A serverless attendance app. Teachers create courses, enrol students by email or
  roll number and open a session that shows a QR code, signed with HMAC and replaced every 45 seconds.
  Students scan it in the app, open it from their phone camera, or paste it. Teachers watch the live
  list, close the session and download reports against an attendance threshold as CSV. Administrators
  promote users to teachers.
- **Architecture:** Browser → **CloudFront** (OAC, security headers) → private **S3** for the React app.
  API path: **API Gateway HTTP API** with a Cognito JWT authorizer → **Lambda** router → **DynamoDB**
  (five on-demand tables, conditional writes). **Cognito** user pool with PreSignUp and
  PostConfirmation **Lambda** triggers. **Secrets Manager** holds the QR signing key. **CloudWatch**
  alarms on Lambda errors and API 5xx. All of it in **AWS CDK**, one IAM role per function.
- **The hard part.** A check-in is saved only after the backend has checked identity and role, course
  ownership and enrolment, session state, the token's signature and expiry, and whether this student
  already checked in, with the duplicate check done atomically in DynamoDB. A local mode runs the real
  API router against in-memory data, so the whole app can be tested without AWS.
- **Proof.** Release verification for v1.0.0: 92 API tests, 86 web component tests, 11 CDK assertion
  tests and 54 Playwright runs (18 journeys at three screen sizes) with axe accessibility checks; no
  serious or critical violations; 0 vulnerabilities in production dependencies.
- **Stack.** React 19 · Vite · TypeScript · shadcn/ui · TanStack Query · React Hook Form · Zod · AWS
  Amplify Auth · AWS CDK v2 · Cognito · API Gateway · Lambda · DynamoDB · Secrets Manager · S3 ·
  CloudFront · CloudWatch · Vitest · MSW · Playwright · axe-core
- **Links.** Repository: https://github.com/iwhozaifa/cloudattend
- Honest note: **Built and tested locally. Not yet deployed to an AWS account.**

### Aaj Kya Pakayen (`/work/aaj-kya-pakayen`)

- Title: **AAJ KYA PAKAYEN** · Urdu: **آج کیا پکائیں؟** · Subtitle: **Dinner, decided.** (app's own
  tagline; Urdu: **رات کا کھانا، طے!**)
- **Problem.** Every evening the same question: what's for dinner? The answer depends on what was
  cooked this week, whether it's a sabzi day or a gosht day, and what meat is in the kitchen.
- **What I built.** A Flutter app for Pakistani home cooks, in Urdu first and English second, with
  large text. It suggests tonight's dish with its reasons and a side, tracks chicken, beef, mutton and
  mince in 250 g steps and uses the oldest meat first, and remembers 60 days of dinners. It has 78
  Pakistani dishes, works fully offline, and every action can be undone.
- **Architecture** (layers, top to bottom): **features** (widgets, Riverpod) → **domain** (use cases,
  entities, the suggestion engine in pure Dart) → **data** (Drift on SQLite, seed data, daily
  reminder). A test fails the build if a layer imports one it must not.
- **The hard part.** Urdu set properly: Nastaliq needs a line height near 1.9 and right-to-left
  layout, and every key screen is checked against golden images in both Urdu and English. The engine
  has no Flutter in it, so it can move to a server later untouched.
- **Proof.** 62 test files; golden images for onboarding, pantry, history, dishes and settings in both
  languages; a domain coverage gate at 80%; CI and release workflows.
- **Stack.** Flutter · Dart · Riverpod · Drift (SQLite) · Noto Nastaliq Urdu · golden tests · GitHub
  Actions
- **Links.** Repository: https://github.com/iwhozaifa/aaj-kya-pakayen

### DAA Study Hub (`/work/daa-study-hub`)

- Title: **DAA STUDY HUB** · Subtitle: **Algorithms notes whose numbers are checked by tests.**
- **Problem.** CS332 Design and Analysis of Algorithms students need notes that are clear, correct
  and usable the week before a midterm.
- **What I built.** A study site with nine topics, from logs and sums to recurrences. Each topic has
  four study modes: visual, worked example, guided questions, and explanation with drills. There are
  two timed mock midterms, a cheatsheet, a "which technique?" guide, a common-mistakes page and 70
  flashcards (also importable into Anki). A progress tracker stays in the reader's own browser, with
  no account.
- **Architecture:** MDX notes → **Next.js** static export with **Fumadocs** (KaTeX maths, Mermaid
  diagrams, search) → **GitHub Actions** runs content tests and Playwright with axe → publishes to
  **GitHub Pages** only if every test passes. `llms.txt` routes serve the notes to language models.
- **The hard part.** Being right: the content tests recompute every number in the worked examples,
  and the build fails if a copyrighted lecture slide or textbook PDF is ever committed.
- **Proof.** Live and deployed by CI; content tests; browser tests with accessibility checks.
- **Stack.** Next.js 16 · React 19 · TypeScript · Fumadocs · MDX · KaTeX · Mermaid · Tailwind CSS 4 ·
  Vitest · Playwright · axe-core · GitHub Pages
- **Links.** Live: https://iwhozaifa.github.io/daa-study-hub/ · Repository:
  https://github.com/iwhozaifa/daa-study-hub

## 6. How I ship

- Heading: **HOW I SHIP** [10]
- Four statements, each a `<p>` at statement size, with one supporting line at 16px. The fragment on
  the right shows the matching state of this site's pipeline.

| State | Statement | Supporting line | Fragment state |
|---|---|---|---|
| 1 | **Infrastructure is code.** | Terraform for DevOps Tutor, CDK for CloudAttend and for this site. Nothing is clicked into a console. | `cdk diff` output for this site's stack |
| 2 | **Nothing merges without a test.** | A pull request that changes code without a test fails. Golden images and recomputed maths count. | The checks list on a pull request, all green |
| 3 | **Drill the failure first.** | Backups are restored on a schedule. A deploy that fails its health check rolls itself back. | Deploy step: health check passed, previous version kept |
| 4 | **Agents work inside the gates.** | Coding agents follow written rules in the repo and pass the same checks as anyone else. | The rules file beside a passing check |

## 7. Also shipped

- Heading: **ALSO SHIPPED** [12]
- **Classroom Reminder Bot.** Google Classroom deadlines as Slack messages, for $0: Apps Script checks
  every four hours and schedules reminders through Slack itself, with a daily heartbeat that reports
  if the bot goes quiet. https://github.com/iwhozaifa/classroom-reminder-bot
- **AWS Cloud Resume Challenge.** [[TBD: confirm finished and one line on what was built]]
  https://github.com/iwhozaifa/aws-cloud-resume-challenge
- **CloudAttend mobile.** [[TBD: include? the repo is private]]

## 8. About

- Heading: **DRIVER** [6] (the person behind the wheel; it stays because the about text says it plainly)
- First sentence: **I'm Ali Huzaifa, a software engineering student in [[TBD: city]].**
- Bio: [[TBD: 100–150 words from Ali Huzaifa, or bullet facts to draft from]]
- Facts: [[TBD: university, programme, year, graduation]] · [[TBD: certifications, if any]]
- Portrait caption: **Ali Huzaifa, [[TBD: place, year]].**

## 9. Contact

- Heading: **BOOK A LOAD** [11]
- Card lines:
  - **Freelance builds on AWS: infrastructure as code, CI/CD pipelines, serverless apps, automation.**
  - Email: [[TBD]]
  - GitHub: github.com/iwhozaifa · LinkedIn: [[TBD]] · Résumé (PDF): [[TBD]]
  - Local time, live: **It's [HH:MM] in [[TBD: city]]** (Pakistan Standard Time, UTC+5)
  - Availability: [[TBD: e.g. "From [month]: [n] hours a week"]]
- Button: **Start a project** (same `mailto:` as the hero)

## 10. Footer

- Menu, large: **Work** · **How I ship** · **Also shipped** · **About** · **Contact**
- Name at full width: **ALI HUZAIFA**
- Urdu sign-off: **پھر ملیں گے** ("see you again", the tailgate classic) [[confirm]]
- Credits line: **Pictures:** [from `assets.mjs --credits`]
- Legal line (13px): **© 2026 Ali Huzaifa. Built with Astro, shipped to AWS by GitHub Actions.**

## 11. Metadata

| Page | `<title>` | Description |
|---|---|---|
| Home | Ali Huzaifa · cloud systems and pipelines | Ali Huzaifa builds cloud systems on AWS and the pipelines that ship them. Case studies, proof and how to start a freelance project. |
| DevOps Tutor | DevOps Tutor · Ali Huzaifa | A gamified DevOps course on Terraform-built AWS: OIDC deploys, monthly restore drills, 33 test files. |
| CloudAttend | CloudAttend · Ali Huzaifa | Serverless attendance on AWS CDK with QR codes signed and replaced every 45 seconds. |
| Aaj Kya Pakayen | Aaj Kya Pakayen · Ali Huzaifa | An offline, Urdu-first Flutter app that decides dinner for Pakistani home cooks. |
| DAA Study Hub | DAA Study Hub · Ali Huzaifa | Algorithms study notes whose worked numbers are recomputed by tests on every build. |

OG image text: the page title on a turmeric panel with **ALI HUZAIFA** at the foot.

## 12. Alt text

- Hero: [written once the picture is chosen; it says what the photograph shows, not what it means]
- DevOps Tutor screen: **DevOps Tutor's day view: today's lesson, quiz button, XP and streak counter.**
- CloudAttend screen: **CloudAttend teacher view: a large QR code beside the live list of students who have checked in.**
- Aaj Kya Pakayen: **Aaj Kya Pakayen's dish list in Urdu: bhindi masala, chicken karahi, daal chawal and ammi ka qorma, each with its cooking time and an on/off switch.**
- DAA Study Hub: **A DAA Study Hub page working through a recurrence step by step.**
- Diagrams: each gets a text description equal to its "Architecture" paragraph above.

## Sample and pending content (to confirm before launch)

All `[[TBD]]` and `[[URDU]]` items above. No sample proof is used: every number is from a repo.
