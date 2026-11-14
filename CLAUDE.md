# CLAUDE.md — Portfolio Project Conventions

## Stack
- Astro 7, TypeScript strict, Tailwind CSS v4, React (islands only)
- Output: static. No server-side rendering.
- Deployment: Cloudflare Pages

## Code conventions

### Components
- Astro components for static content (`.astro`)
- React components only when client-side interactivity is needed (`.tsx`)
- Use `client:load` sparingly — only ThemeToggle currently needs it

### TypeScript
- Strict mode. No `any`.
- Define interfaces in `src/lib/types.ts` for shared shapes
- Use `as const` for static config objects

### Styling
- Tailwind utility classes preferred
- CSS custom properties for design tokens (defined in `src/styles/global.css`)
- No inline styles
- No `!important`

### Content
- Projects: `src/content/projects/*.md` — frontmatter schema in `src/content.config.ts`
- Experience: `src/content/experience/*.md`
- Do not hardcode project/experience data in page files

### Naming
- Files: kebab-case
- Components: PascalCase
- Variables/functions: camelCase
- CSS classes: Tailwind utilities or kebab-case custom classes

## Design rules
- Dark-first. Light mode via `[data-theme="light"]` on `<html>`.
- No skill bars, no fake metrics, no fake testimonials
- No gradients on backgrounds
- Accent colour (#e8a045 dark / #c47c1a light) used sparingly

## Adding content

### New project
1. `src/content/projects/slug.md` with correct frontmatter
2. Images: `public/images/slug/1.jpg`, `2.jpg`, `3.jpg`
3. Run `npm run build` to verify

### New experience entry
1. `src/content/experience/slug.md` with correct frontmatter
2. Run `npm run build` to verify

## Deployment

### Cloudflare Pages setup
1. Push to GitHub
2. In Cloudflare Pages dashboard: connect repo
3. Build command: `npm run build`
4. Output directory: `dist`
5. Node version: 18 (set in environment variables: `NODE_VERSION=18`)

### Security headers
Defined in `public/_headers` — no Worker needed.

### Custom domain
Update `site` in `astro.config.mjs` and `SITE.url` in `src/lib/constants.ts`.

## Do not
- Add `@tailwindcss/typography` — custom prose styles are in global.css
- Use React for components that don't need client-side state
- Commit secrets or credentials
- Hardcode URLs that belong in constants.ts
- Add unnecessary npm dependencies
