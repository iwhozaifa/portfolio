import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One entry per case study. Every number in these files must come from the project's own repo
// (docs/PLAN.md §1); the page template renders them as they are.
const stop = z.object({ label: z.string(), detail: z.string().optional() });

const work = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      urdu: z.string().optional(),
      subtitle: z.string(),
      order: z.number(),
      year: z.number(),
      field: z.enum(['station', 'signal', 'ink', 'slate']),
      fact: z.string(),
      description: z.string(),
      repo: z.url().optional(),
      live: z.url().optional(),
      note: z.string().optional(),
      screens: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string(), kind: z.enum(['desktop', 'phone']).default('desktop') }))
        .min(4),
      problem: z.string(),
      built: z.array(z.string()).min(1),
      architecture: z.object({
        lanes: z.array(z.object({ name: z.string(), stops: z.array(stop).min(2) })).min(1),
        beside: z.array(z.object({ name: z.string(), items: z.array(stop).min(1) })).default([]),
        footnote: z.string(),
      }),
      hard: z.object({ statement: z.string().max(170), body: z.string() }),
      proof: z.array(z.object({ figure: z.string(), label: z.string() })).min(2),
      stack: z.array(z.string()).min(3),
    }),
});

export const collections = { work };
