import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    status: z.enum(['complete', 'active', 'practice']),
    techs: z.array(z.string()),
    github: z.string().optional(),
    images: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    order: z.number(),
  }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string(),
    summary: z.string(),
    highlights: z.array(z.string()),
    order: z.number(),
  }),
});

export const collections = { projects, experience };
