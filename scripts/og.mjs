// Photographs each /og/<slug> card into dist/og/<slug>.png with headless Chrome (taste-skill's
// DevTools client), serving dist/ on a throwaway local server. Run after `npm run build`.
import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { Browser, sleep } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const dist = new URL('../dist/', import.meta.url).pathname;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png' };
const server = createServer(async (req, res) => {
  let path = join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try { if ((await stat(path)).isDirectory()) path = join(path, 'index.html'); } catch {}
  let body;
  try { body = await readFile(path); } catch { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
  res.end(body);
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

const slugs = (await readdir(join(dist, 'og'), { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
const browser = await Browser.launch({ width: 1200, height: 630 });
const page = await browser.newPage({ width: 1200, height: 630 });
for (const slug of slugs) {
  await page.goto(`${base}/og/${slug}`);
  await page.eval('document.fonts.ready.then(() => true)');
  await sleep(200);
  await page.screenshot({ path: join(dist, 'og', `${slug}.png`), format: 'png' });
  console.log('og:', slug);
}
await page.close();
await browser.close();
server.close();
