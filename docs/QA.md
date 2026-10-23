# QA record

Milestone 8, 24 Oct 2026, on the build at the head of `test/qa-browsers-a11y`. The checks that can run
on every change now run in `ci` (taste lint, contrast, infra tests, Playwright on three engines, Lighthouse).

## taste-skill inspector (1440 / 768 / 390, motion counted)

| Page | Result | Remaining WARNs |
| --- | --- | --- |
| `/` | 0 FAIL | no footage (no honest clip found); ON THE ROAD pinned for 3 screens, the house limit |
| `/work/devops-tutor` | 0 FAIL | no footage |
| `/work/cloudattend` | 0 FAIL | no footage; a 19px margin drift at 1440 |
| `/work/aaj-kya-pakayen` | 0 FAIL | no footage |
| `/work/daa-study-hub` | 0 FAIL | no footage |
| `/404` | 0 FAIL with `--allow still-page,few-pictures` | a one-screen utility page; moving it would serve no story |
| `/specimen` | 0 FAIL with `--allow few-pictures,still-page` | not linked, noindex |

Moving elements: 39 on the home page, 24 on each case study (fail under 8, warn under 16).

## Browsers (Playwright 1.64, `tests/e2e/site.spec.ts`)

Every page: loads with no script errors, one `h1`, every image has `alt`, axe (WCAG 2.2 A/AA) finds no
serious or critical issue, no sideways scroll. Plus: the skip link comes first and moves focus to the
content; the bilty opens from its stub by keyboard and closes with Escape; the phone menu opens, lists
every section and closes on a choice; the action writes an email to the right address; the case studies
chain back to the first; reduced motion leaves the page complete and still.

- Locally: Chromium desktop and Chromium phone, 46 passed, 2 skipped by design (keyboard on phones, the
  menu on desktop).
- In CI: also Firefox, WebKit desktop and WebKit on an iPhone profile (the local machine lacks those
  engines' system libraries).

## Lighthouse 13.5 (mobile, simulated throttling)

| Page | Performance | Accessibility | Best practices | SEO | LCP |
| --- | --- | --- | --- | --- | --- |
| `/` | 93–96 | 100 | 100 | 100 | 2.6 s |
| `/work/devops-tutor` | 99 | 100 | 100 | 100 | 1.9 s |
| `/work/cloudattend` | 100 | 100 | 100 | 100 | 1.8 s |
| `/work/aaj-kya-pakayen` | 98 | 100 | 100 | 100 | 2.2 s |

CI floors: performance 90, accessibility 100, best practices 95, SEO 100. The home page's LCP (2.6 s)
misses the plan's 2.0 s budget because the name and lead enter with their load animation; dropping the
entrance would buy back about half a second. That is a design decision for Ali Huzaifa.

Weight: one JS bundle, GSAP + ScrollTrigger, 44 kB gzip; CSS inlined, under 7 kB gzip; Chivo 33 kB
(preloaded); Gulzar subset 115 kB (Urdu only, not preloaded).

## Slop checklist (docs/PLAN.md §7), checked by grep over `src/` and `dist/`

| Rule | Result |
| --- | --- |
| No gradients, aurora, blobs, glows | pass: no `*-gradient(` in source or built CSS |
| No glassmorphism, no resting shadows | pass: no `backdrop-filter`, `box-shadow` or `text-shadow` |
| No Inter, Poppins, Space Grotesk | pass: Chivo and Gulzar only |
| No violet, indigo, purple; no neon on dark | pass |
| No pure `#000`/`#fff` | pass in source and in built CSS |
| Square corners | pass: one radius, 0 |
| No emoji, sparkles, robots, "AI-powered", genre verbs, lorem ipsum | pass |
| No centred gradient hero with two pills | pass: one action on the first screen |
| No eyebrows, tiny tracked labels, mono outside code, 01/02/03, hairlines | pass (taste lint and inspector) |
| Headlines two lines at most; one `h1`; every section titled; equal margins | pass (inspector) |
| Only transform and opacity animate | pass: transitions list `opacity` (2) and `transform` (10); GSAP tweens set scale, yPercent, opacity |
| Reduced motion complete | pass (Playwright) |
| Found pictures credited, none shown as Ali Huzaifa's own | pass: footer credits, captions say what they show |
| Every number traceable | pass: each figure checked against its repo while writing the case studies |
| Only the four featured projects | pass in the current tree |

## Not checked here

- A real iPhone Safari and a mid-range Android: no devices on this machine.
- Screen readers (Orca/NVDA): not installed; the structure is checked by axe and the Playwright roles.
- Production headers and caching: the site is not deployed yet (no AWS account). `deploy.yml`
  smoke-tests HSTS and CSP on the first deploy.
