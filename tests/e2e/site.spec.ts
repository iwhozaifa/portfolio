// The site in real browsers: every page loads clean, reads in order, passes axe at WCAG 2.2 AA with no
// serious or critical findings, never scrolls sideways, and works by keyboard and with reduced motion.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/work/devops-tutor', '/work/cloudattend', '/work/aaj-kya-pakayen', '/work/daa-study-hub', '/404'];

async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return errors;
}

for (const path of pages) {
  test(`${path} loads clean, with one h1 and described pictures`, async ({ page }) => {
    const errors = await open(page, path);
    await expect(page.locator('h1')).toHaveCount(1);
    const unnamed = await page.locator('img:not([alt])').count();
    expect(unnamed, 'every picture has an alt attribute').toBe(0);
    expect(errors, 'no script errors').toEqual([]);
  });

  test(`${path} passes axe (WCAG 2.2 AA, no serious or critical findings)`, async ({ page }) => {
    await open(page, path);
    // Reveal everything that enters on scroll, so axe checks the finished page.
    await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in')));
    // Sections below the fold skip rendering (content-visibility: auto) until a reader scrolls near them;
    // render them all so axe reads the colours a reader sees.
    await page.addStyleTag({ content: '.defer { content-visibility: visible !important; }' });
    await page.waitForTimeout(1000);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
  });

  test(`${path} never scrolls sideways`, async ({ page }) => {
    await open(page, path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('the skip link comes first and moves focus to the content', async ({ page, isMobile }) => {
  test.skip(isMobile, 'no keyboard on a phone');
  await open(page, '/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to content');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('the bilty opens from its stub and closes with Escape', async ({ page }) => {
  await open(page, '/');
  const stub = page.locator('.hero-stub');
  await stub.focus();
  await page.keyboard.press('Enter');
  const sheet = page.locator('#bilty-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole('heading', { name: 'Bilty for this page' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});

test('the phone menu opens, lists every section and closes on a choice', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the menu button shows on phones');
  await open(page, '/');
  await page.getByRole('button', { name: 'Menu' }).click();
  const menu = page.locator('#site-menu');
  await expect(menu).toBeVisible();
  for (const name of ['Work', 'How I ship', 'Also shipped', 'About', 'Contact']) await expect(menu.getByRole('link', { name })).toBeVisible();
  await menu.getByRole('link', { name: 'Contact' }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#contact$/);
});

test('the one action writes an email to Ali Huzaifa', async ({ page }) => {
  await open(page, '/');
  const href = await page.locator('.hero .button').getAttribute('href');
  expect(href).toMatch(/^mailto:alihuzaifa7204@gmail\.com\?subject=Project%20enquiry/);
});

test('every case study leads to the next one', async ({ page }) => {
  const seen = new Set<string>();
  let path = '/work/devops-tutor';
  for (let i = 0; i < 4; i++) {
    seen.add(path);
    await open(page, path);
    path = (await page.locator('a.next').getAttribute('href'))!;
  }
  expect(seen.size).toBe(4);
  expect(path).toBe('/work/devops-tutor');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('the page is complete and still', async ({ page }) => {
    await open(page, '/');
    await expect(page.locator('[data-hero-card]')).toHaveCSS('opacity', '1');
    expect(await page.locator('[data-reveal]').count()).toBe(0);
    await page.evaluate(() => window.scrollTo(0, 2000)); // mouse.wheel is not supported in mobile WebKit
    await page.waitForTimeout(600);
    await expect(page.locator('[data-hero-card]')).toHaveCSS('opacity', '1');
  });
});
