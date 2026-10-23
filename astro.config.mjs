import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// SITE_URL is set by CI once the domain exists (plan Q8).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.invalid',
  output: 'static',
  trailingSlash: 'never',
  // The CSS is small (about 6 kB gzip), so it is inlined: no render-blocking stylesheet requests.
  build: { format: 'directory', inlineStylesheets: 'always' },
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/specimen') && !page.includes('/og/') })],
});
