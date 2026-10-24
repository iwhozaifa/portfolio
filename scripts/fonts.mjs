// Builds the self-hosted fonts in public/fonts:
// - Big Shoulders and Public Sans (variable weight, Latin) copied from @fontsource-variable.
// - Gulzar subset to the Urdu characters the site actually uses, so the Nastaliq file stays small.
// Re-run after changing any Urdu text: `npm run fonts`.
import { readFile, writeFile, readdir, copyFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import subsetFont from 'subset-font';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'public/fonts');

for (const name of ['big-shoulders', 'public-sans']) {
  await copyFile(
    join(root, `node_modules/@fontsource-variable/${name}/files/${name}-latin-wght-normal.woff2`),
    join(out, `${name}-latin-wght.woff2`),
  );
}

// Every Arabic-script character in the site's source, plus the joiners Nastaliq shaping needs.
const sources = [join(root, 'src'), join(root, 'docs/copy-deck.md')];
const exts = new Set(['.astro', '.mdx', '.md', '.ts', '.js', '.json']);
async function collect(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true });
    const parts = await Promise.all(entries.map((e) => collect(join(path, e.name))));
    return parts.join('');
  } catch {
    return exts.has(extname(path)) ? readFile(path, 'utf8') : '';
  }
}
const text = (await Promise.all(sources.map(collect))).join('');
const urdu = [...new Set(text.match(/[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/g) ?? [])].join('');
const keep = urdu + '‌‍ ،؟۔';

const gulzar = await readFile(join(root, 'node_modules/@fontsource/gulzar/files/gulzar-arabic-400-normal.woff2'));
const subset = await subsetFont(gulzar, keep, { targetFormat: 'woff2' });
await writeFile(join(out, 'gulzar-urdu-subset.woff2'), subset);

console.log(`big-shoulders and public-sans copied; gulzar subset: ${[...urdu].length} characters, ${subset.length} bytes (from ${gulzar.length})`);
