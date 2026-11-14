# Mukundan Gopalachary — Portfolio

Personal portfolio website built with Astro, TypeScript, and Tailwind CSS.

## Stack

- **Framework**: Astro 7 (static output)
- **Styling**: Tailwind CSS v4
- **Interactivity**: React (theme toggle only)
- **Deployment**: Cloudflare Pages

## Local development

### Prerequisites
- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

Opens at http://localhost:4321. Hot-reloads on save.

### Build for production

```bash
npm run build
```

Output in `dist/`. Preview with `npm run preview`.

## Project structure

```
src/
  components/
    layout/       BaseLayout, Header, Footer
    ui/           Button, Badge, ProjectCard, SectionHeading
    react/        ThemeToggle (only React island)
  content/
    projects/     Markdown files, one per project
    experience/   Markdown files, one per role
  pages/          Astro pages
  styles/         global.css
  lib/            types.ts, constants.ts
public/
  _headers        Cloudflare security headers
  robots.txt
  site.webmanifest
  favicon.svg
```

## Adding a project

1. Create `src/content/projects/your-project-slug.md`
2. Add frontmatter matching the schema in `src/content.config.ts`
3. Write the case study in Markdown below the frontmatter
4. Add images to `public/images/your-project-slug/` (1.jpg, 2.jpg, 3.jpg)

## Adding experience

1. Create `src/content/experience/company-name.md`
2. Add frontmatter matching the experience schema

## Deployment (Cloudflare Pages)

See CLAUDE.md for deployment instructions.

## Updating social links

Edit `src/lib/constants.ts` — update the `SOCIAL` object.

## Updating email

Edit `src/lib/constants.ts` — update `SITE.email`.
