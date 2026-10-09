import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../../..");
const articlesDir = path.join(root, "src/content/articles");
const slugs = readdirSync(articlesDir);

const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const frontmatter = (slug: string) =>
  read(`src/content/articles/${slug}/index.mdx`).split("---")[1];
const body = (slug: string) =>
  read(`src/content/articles/${slug}/index.mdx`).split("---").slice(2).join("---");

describe("article cover alt text", () => {
  it.each(slugs)("%s carries a cover_alt value", (slug) => {
    expect(frontmatter(slug)).toMatch(/^cover_alt: ".{20,}"$/m);
  });

  it.each(slugs)("%s has no covert_alt typo", (slug) => {
    expect(frontmatter(slug)).not.toMatch(/covert_alt/);
  });

  it("schema, meta and components use cover_alt only", () => {
    for (const file of [
      "src/lib/schema/index.ts",
      "src/lib/utils/getMeta.ts",
      "src/pages/articles/_components/article-header.astro",
    ]) {
      expect(read(file)).not.toMatch(/covert_alt/);
    }
    expect(read("src/lib/schema/index.ts")).toMatch(/cover_alt/);
  });
});

describe("article header avatar", () => {
  it("uses the author name as alt text", () => {
    const header = read("src/pages/articles/_components/article-header.astro");
    const avatar = header.match(/<Image[\s\S]*?\/>/)?.[0] ?? "";
    expect(avatar).toMatch(/alt=\{author\.data\.name\}/);
  });
});

describe("article bodies", () => {
  it.each(slugs)("%s has no stray escaped heading marker", (slug) => {
    expect(body(slug)).not.toMatch(/\\+###/);
  });

  it.each(slugs)("%s does not repeat the About footer inline", (slug) => {
    expect(body(slug)).not.toMatch(/\*\*About Great Western Productions\*\*/);
  });
});

describe("homepage heading", () => {
  it("renders exactly one h1 in the built page", () => {
    const built = path.join(root, "dist/client/index.html");
    const fallback = path.join(root, "dist/index.html");
    const file = existsSync(built) ? built : fallback;
    if (!existsSync(file)) return;
    const html = readFileSync(file, "utf8");
    expect(html.match(/<h1[\s>]/g) ?? []).toHaveLength(1);
  });
});
