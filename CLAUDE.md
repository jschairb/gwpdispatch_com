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
- `elements/` — Layout chrome: `Navbar`, `Logo`, `MenuDropdown`, `Share`
- `shared/` — Composed layout sections: `Header`, `Pagination`, `Carousel`, `ViewListHeader`

### Layouts (`src/layouts/`)

- `base.astro` — Root layout with Header/Footer and SEO head; all pages use this
- `content.astro` — Wraps individual article content
- `list.astro` — Wraps listing/index pages

### Styling

Tailwind CSS v4 + DaisyUI v5. Path alias `@/*` maps to `src/*`.

The palette, type stratification, and structural marks come from the GWP design
system (`gwp-design` skill, `colors_and_type.css`). `src/styles/global.css` holds
two DaisyUI themes (`light` default, `dark` on `prefers-color-scheme: dark`) plus
the palette as Tailwind tokens: `navy #1F2C4C`, `navy-deep #131C36`,
`navy-soft #2E3D63`, `gold #C8862E`, `gold-bright #E0A347`, `gold-deep #9C6817`,
`bone #F6F1E7`, `cream #FBF7EE`, `paper #FFFFFF`, and a warm `ink-*` neutral
ramp. Light maps base-100 to paper and base-200 to bone; dark maps base-100 to
navy-deep and primary to gold-bright.

Type is stratified three ways: **Norwester** for "this is GWP" (wordmark,
eyebrows, folio bar), **Source Serif 4** for "this is a story" (headlines,
article body, leads), **Inter** for "this is interface" (nav, meta, buttons).
Josefin Sans sets the deco caps "DISPATCH" in the lockup, standing in for Mostra
Nuova; IBM Plex Mono sets code. Norwester is self-hosted from
`public/fonts/norwester.ttf`; the rest come from `@fontsource*` packages imported
in `components/bases/head.astro`.

Geometry is restrained: 6px on cards and buttons, 4px on inputs, pills only on
tag chips. Cards are opaque paper with a 1px hairline and a paper-toned shadow —
no gradients, no accent stripes, no frosted glass. Motion is eased fades and
translations only; press states move 1px, never scale.

Shared component classes in `global.css`: `.gwp-rule-double` (the 3px-over-1px
divider that marks the masthead, page headers, and section headers),
`.eyebrow` (Norwester gold kicker), `.tag` plus `.tag-wire` /
`.tag-field-reports` / `.tag-dispatches`, `.press-card`, `.gwp-lead`,
`.headline-link`, `.wordmark-primary` / `.wordmark-secondary`, and the
`.btn-press` variants.

No AP dateline. The folio bar carries the city on every page and the article
byline row carries the date, so article bodies open on the lede.

House rules the brand enforces: no emoji anywhere, no exclamation points,
Norwester uppercase only, and never invent a color outside the palette above.

### Site Config (`src/lib/config/index.ts`)

Central config for site title, URL, posts per page (4), nav categories, footer links, and social links. Update here before updating content.

### Reading Time & Modified Time

Injected automatically via custom remark plugins (`readingTime`, `modifiedTime`) configured in `astro.config.mjs`. `modifiedTime` reads git history — requires git commits to reflect accurate dates.

### Search

Pagefind runs post-build (`astro build && pagefind`). Search UI is styled via CSS custom properties in `global.css`. No runtime search server needed.
