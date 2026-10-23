// Crops and resizes the found pictures (originals in .cache/found-originals, downloaded with
// taste-skill's assets.mjs --get) into the derivatives the site uses in src/assets/found.
// Both sources are CC BY-SA: the crops are shared under the same licence and credited on the page.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';

const src = '.cache/found-originals/';
const out = 'src/assets/found/';
const jobs = [
  // The tailgate and its load, wide enough for a 16:10 hero; the painted panels ring the card.
  { from: 'nathiagali-town-road-decorated-truck.jpg', to: 'tailgate-nathiagali.jpg', crop: { left: 500, top: 1173, width: 3130, height: 1956 }, width: 2400 },
  { from: 'decorated-bus-in-karachi.jpg', to: 'bus-karachi.jpg', width: 2400 },
];
for (const j of jobs) {
  let img = sharp(src + j.from).rotate();
  if (j.crop) img = img.extract(j.crop);
  await img.resize({ width: j.width, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(out + j.to);
  console.log('wrote', out + j.to);
}

const credits = JSON.parse(await readFile(out + 'credits.json', 'utf8'));
for (const c of credits) {
  const job = jobs.find((j) => c.file?.endsWith(j.from) || c.file?.endsWith(j.to));
  if (job) Object.assign(c, { file: out + job.to, original: job.from, altered: job.crop ? 'cropped and resized' : 'resized' });
}
await writeFile(out + 'credits.json', JSON.stringify(credits, null, 1) + '\n');
