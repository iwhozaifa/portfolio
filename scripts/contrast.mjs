// Reads the oklch palette from src/styles/tokens.css and checks every colour pair the site uses
// against WCAG 2.2: 4.5:1 for text, 3:1 for large text and for focus rings and control edges.
// Exits non-zero when a pair falls short, so CI fails before a page ships unreadable.
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const palette = Object.fromEntries(
  [...css.matchAll(/--([a-z0-9-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)].map(([, name, l, c, h]) => [name, [+l, +c, +h]]),
);

function oklchToLinearSrgb([l, c, h]) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ].map((v) => Math.min(1, Math.max(0, v)));
}
const luminance = (colour) => {
  const [r, g, b] = oklchToLinearSrgb(colour);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (fg, bg) => {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const hex = (colour) =>
  '#' +
  oklchToLinearSrgb(colour)
    .map((v) => Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255).toString(16).padStart(2, '0'))
    .join('');

// [foreground, background, minimum, what it is]
const pairs = [
  ['paper', 'night', 4.5, 'running text on the ground'],
  ['dust', 'night', 4.5, 'secondary text on the ground'],
  ['paper', 'night-2', 4.5, 'text on a surface'],
  ['dust', 'night-2', 4.5, 'secondary text on a surface'],
  ['night', 'turmeric', 4.5, 'button label, turmeric field text'],
  ['paper', 'crimson', 4.5, 'crimson field text'],
  ['crimson', 'paper', 4.5, 'button label on a paper button (crimson field)'],
  ['paper', 'peacock', 4.5, 'peacock field text'],
  ['night', 'paper', 4.5, 'paper field text'],
  ['peacock', 'paper', 4.5, 'accent and links on paper'],
  ['night', 'paper-2', 4.5, 'bilty rows'],
  ['peacock', 'paper-2', 4.5, 'links in bilty rows'],
  ['paper', 'night', 4.5, 'button label on a night button (turmeric field)'],
  ['turmeric', 'night', 3, 'focus ring and button edge on night'],
  ['turmeric', 'peacock', 3, 'button edge on peacock'],
  ['paper', 'crimson', 3, 'focus ring on crimson'],
  ['night', 'turmeric', 3, 'focus ring on turmeric'],
  ['peacock', 'paper', 3, 'focus ring on paper'],
];

let failed = 0;
for (const [fg, bg, min, use] of pairs) {
  if (!palette[fg] || !palette[bg]) throw new Error(`token missing: ${fg} or ${bg}`);
  const r = ratio(palette[fg], palette[bg]);
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1 ≥ ${min}  ${fg} ${hex(palette[fg])} on ${bg} ${hex(palette[bg])}  (${use})`);
}
if (failed) {
  console.error(`\n${failed} pair(s) below their minimum.`);
  process.exit(1);
}
