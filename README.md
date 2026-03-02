# GWP Dispatch

The press hub for Great Western Productions. Built with Astro.

## Commands

```bash
npm run dev       # Dev server (localhost:4321)
npm run build     # Production build
npm run preview   # Preview production build
npm test          # Vitest unit tests
npm run test:watch
```

## Content

Articles live in `src/content/articles/` as MDX files. Categories: `wire`, `field-reports`, `dispatches`.

Add content by creating a new MDX file in the appropriate category directory, following the frontmatter schema in `src/lib/schema/index.ts`.

## Architecture

See `CLAUDE.md` for full architecture notes.

## License

[MIT](LICENSE.md)
