// Lighthouse (mobile, simulated throttling) on the built site. Fails below the floors in docs/PLAN.md:
// accessibility and SEO 100, best practices 95, performance 90 (95 is the target; CI machines vary).
// In GitHub Actions it also exports the home page's scores for the bilty. Shared CI machines are noisy,
// so there each page runs three times and the median of each score counts (Lighthouse CI's own advice).
import { spawn, execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The npm script points at the local Chromium wrapper; where it doesn't exist (CI), let Lighthouse find Chrome.
if (process.env.CHROME_PATH && !existsSync(process.env.CHROME_PATH)) delete process.env.CHROME_PATH;

const base = 'http://127.0.0.1:4321';
const pages = ['/', '/work/devops-tutor', '/work/aaj-kya-pakayen'];
const floors = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 100 };
const runs = process.env.CI ? 3 : 1;
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

const up = async () => fetch(base + '/').then((r) => r.ok, () => false);
let server;
if (!(await up())) {
  server = spawn('npx', ['astro', 'preview', '--host', '127.0.0.1', '--port', '4321'], { stdio: 'ignore', detached: true });
  for (let i = 0; i < 60 && !(await up()); i++) await new Promise((r) => setTimeout(r, 500));
}

const dir = mkdtempSync(join(tmpdir(), 'lh-'));
let failed = 0;
const scores = {};
try {
  for (const path of pages) {
    const reports = [];
    for (let i = 0; i < runs; i++) {
      const out = join(dir, `${path.replace(/\W+/g, '_') || 'home'}-${i}.json`);
      // cwd: dir, because under WSL chrome-launcher writes its profile into the working directory.
      execFileSync('npx', ['--yes', 'lighthouse@13.5.0', base + path, '--quiet', '--output=json', `--output-path=${out}`,
        '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new --no-sandbox'], { stdio: 'inherit', cwd: dir });
      reports.push(JSON.parse(readFileSync(out, 'utf8')));
    }
    const s = Object.fromEntries(Object.keys(reports[0].categories).map((k) => [k, median(reports.map((r) => Math.round(r.categories[k].score * 100)))]));
    scores[path] = s;
    const low = Object.entries(floors).filter(([k, min]) => s[k] < min);
    if (low.length) failed++;
    const perf = reports.map((r) => Math.round(r.categories.performance.score * 100)).join('/');
    const tbt = reports.map((r) => r.audits['total-blocking-time'].displayValue).join('/');
    console.log(`${low.length ? 'FAIL' : 'pass'}  ${path}  ${Object.entries(s).map(([k, v]) => `${k} ${v}`).join(', ')}  (performance runs ${perf}; TBT ${tbt}; LCP ${reports[0].audits['largest-contentful-paint'].displayValue})`);
  }
} finally {
  if (server) process.kill(-server.pid);
}
if (process.env.GITHUB_ENV) {
  appendFileSync(process.env.GITHUB_ENV, `BILTY_LH_PERF=${scores['/'].performance}\nBILTY_LH_A11Y=${scores['/'].accessibility}\n`);
}
if (failed) {
  console.error(`${failed} page(s) below the Lighthouse floors.`);
  process.exit(1);
}
