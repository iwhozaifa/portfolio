// Writes the bilty, this page's consignment slip, to src/data/bilty.json (built into the page) and
// public/bilty.json (fetched by the live stub). In GitHub Actions it records the deploy run; locally it
// records the working copy, marked "local". The deploy workflow fills the BILTY_* values it measures.
import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';

const env = process.env;
const git = (cmd) => {
  try { return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim(); } catch { return null; }
};
const repo = env.GITHUB_REPOSITORY ?? 'iwhozaifa/portfolio';
const sha = env.GITHUB_SHA ?? git('rev-parse HEAD');
const run = env.GITHUB_RUN_NUMBER ?? null;
const num = (v) => (v === undefined || v === '' ? null : Number(v));

const bilty = {
  run,
  runUrl: env.GITHUB_RUN_ID ? `https://github.com/${repo}/actions/runs/${env.GITHUB_RUN_ID}` : null,
  sha,
  shaUrl: sha ? `https://github.com/${repo}/commit/${sha}` : null,
  shipped: new Date().toISOString(),
  status: env.BILTY_STATUS ?? (run ? 'on-the-road' : 'local'),
  checks: env.BILTY_CHECKS_PASSED ? { passed: num(env.BILTY_CHECKS_PASSED), total: num(env.BILTY_CHECKS_TOTAL) } : null,
  lighthouse: env.BILTY_LH_PERF ? { performance: num(env.BILTY_LH_PERF), accessibility: num(env.BILTY_LH_A11Y) } : null,
  bytes: num(env.BILTY_BYTES),
  invalidation: env.BILTY_INVALIDATION ?? null,
  repo,
  workflow: env.BILTY_WORKFLOW ?? 'deploy.yml',
};

await mkdir('src/data', { recursive: true });
const json = JSON.stringify(bilty, null, 2) + '\n';
await writeFile('src/data/bilty.json', json);
await writeFile('public/bilty.json', json);
console.log(`bilty: ${bilty.run ? '#' + bilty.run : 'local'} ${bilty.sha?.slice(0, 7) ?? ''} ${bilty.status}`);
