# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server (localhost:4321)
npm run build     # Production build (runs Pagefind indexing post-build)
npm run preview   # Preview production build
```

**Keystatic CMS** (optional content editor):
- Set `RUN_KEYSTATIC=true` in `.env`, then run `npm run dev`
- Access at `http://localhost:4321/keystatic`

## Architecture

**News site** built on Astro 5 with static generation. Content is MDX-based with Keystatic as an optional local CMS.

### Content Collections (`src/content/`)

Four collections defined in `src/content.config.ts` with Zod schemas in `src/lib/schema/`:

- **articles** — MDX files. Key frontmatter: `isDraft`, `isMainHeadline`, `isSubHeadline`, `cover`, `category`, `authors[]`, `publishedTime`
- **authors** — MDX files with profile data and social links
- **categories** — JSON files with `title` and `slugPath`
- **views** — MDX files for page-level content (home, articles, authors, categories, search, about, contact, error404)

### Business Logic (`src/lib/handlers/`)

Handlers abstract all collection queries — use these instead of querying collections directly:
- `articlesHandler` — `getAll()`, `getMainHeadline()`, `getSubHeadlines()`, filtered lookups
- `categoriesHandler` — `getAll()`, `getOneById()`, `getAllWithLatestArticles()`
- `authorsHandler` — collection lookups

### Pages & Routing

All routes are static (SSG). Pagination uses `[page]` dynamic segments. Route structure:
- `/` — Homepage
- `/articles`, `/articles/[id]`, `/articles/[page]` — Article listing + detail + pagination
- `/authors/[id]`, `/authors/[id]/[page]` — Author profiles with paginated articles
- `/categories/[category]`, `/categories/[category]/[page]` — Category filtering with pagination
- `/search` — Pagefind static search
- `/rss.xml`, `/sitemap.xml` — Auto-generated

### Component Structure (`src/components/`)

- `bases/` — Primitives: `Head` (SEO meta), `ThemeController`, `Icon`, `ShareItem`
- `cards/` — Content cards: `NewsCard`, `AuthorCard`, `MainHeadline`, `SubHeadlineCard`, `WideCard`
- `elements/` — Layout chrome: `Navbar`, `Footer`, `TopHeader`, `Share`
- `shared/` — Composed layout sections: `Header`, `Pagination`, `Carousel`, `ViewListHeader`

### Layouts (`src/layouts/`)

- `base.astro` — Root layout with Header/Footer and SEO head; all pages use this
- `content.astro` — Wraps individual article content
- `list.astro` — Wraps listing/index pages

### Styling

Tailwind CSS v4 + DaisyUI v5. Path alias `@/*` maps to `src/*`. Fonts: Source Serif 4 (serif), Source Sans Pro (sans-serif). Dark mode via DaisyUI themes (`light` default, `dark` on `prefers-color-scheme: dark`).

### Site Config (`src/lib/config/index.ts`)

Central config for site title, URL, posts per page (4), nav categories, footer links, and social links. Update here before updating content.

### Reading Time & Modified Time

Injected automatically via custom remark plugins (`readingTime`, `modifiedTime`) configured in `astro.config.mjs`. `modifiedTime` reads git history — requires git commits to reflect accurate dates.

### Search

Pagefind runs post-build (`astro build && pagefind`). Search UI is styled via CSS custom properties in `global.css`. No runtime search server needed.
