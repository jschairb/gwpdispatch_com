import { SITE, SOCIAL_LINKS, NAVIGATION_LINKS, OTHER_LINKS } from "@/lib/config";
import type { ArticleMeta, Meta } from "@/lib/types";

/**
 * schema.org nodes for the JSON-LD graph in `head.astro`.
 *
 * Every value comes from `src/lib/config` or from collection frontmatter, so a
 * new article carries structured data without anyone editing this file. No
 * runtime dependency: the nodes are plain objects and Astro serializes them.
 */

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

const absolute = (path: string) => new URL(path, SITE.url).href;

const isArticleMeta = (meta: Meta | ArticleMeta): meta is ArticleMeta =>
  meta.type === "article";

/** The publisher. Referenced by @id from the article and website nodes. */
const organizationNode = () => ({
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE.author,
  url: SITE.url,
  description: SITE.description,
  sameAs: SOCIAL_LINKS.map((link) => link.href),
});

const websiteNode = () => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE.title,
  url: SITE.url,
  description: SITE.description,
  inLanguage: SITE.locale,
  publisher: { "@id": ORGANIZATION_ID },
});

const newsArticleNode = (
  meta: ArticleMeta,
  canonicalURL: string,
  imageURL: string
) => ({
  "@type": "NewsArticle",
  "@id": `${canonicalURL}#article`,
  headline: meta.metaTitle,
  description: meta.description,
  image: [imageURL],
  datePublished: new Date(meta.publishedTime).toISOString(),
  dateModified: new Date(meta.lastModified).toISOString(),
  author: meta.authors.map((author) => ({
    "@type": "Person",
    name: author.name,
    url: absolute(`/authors/${author.link}`),
    ...(author.sameAs && author.sameAs.length
      ? { sameAs: author.sameAs }
      : {}),
  })),
  publisher: { "@id": ORGANIZATION_ID },
  isPartOf: { "@id": WEBSITE_ID },
  mainEntityOfPage: { "@type": "WebPage", "@id": canonicalURL },
});

/** Label a path segment from the navigation config, else from the slug itself. */
const segmentName = (href: string, slug: string) => {
  const link = [...NAVIGATION_LINKS, ...OTHER_LINKS].find(
    (candidate) => candidate.href === href
  );
  if (link) return link.text;
  if (/^\d+$/.test(slug)) return `Page ${slug}`;
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Home plus one entry per path segment.
 *
 * A trailing page number is dropped, so page one of Wire is Wire rather than a
 * crumb named "1" under a duplicate parent. Only an article page takes its
 * headline as the final crumb; a listing page is named for its own segment,
 * because its metaTitle is the name of the view that renders it ("Categories")
 * rather than the thing being listed ("Wire").
 *
 * Returns null on the home page, where a single-item trail says nothing.
 */
const breadcrumbNode = (
  pathname: string,
  canonicalURL: string,
  pageName: string,
  isArticle: boolean
) => {
  const segments = pathname.split("/").filter(Boolean);
  const trail =
    segments.length > 1 && /^\d+$/.test(segments[segments.length - 1])
      ? segments.slice(0, -1)
      : segments;
  if (trail.length === 0) return null;

  const items = [{ name: "Home", item: SITE.url }];
  let href = "";
  trail.forEach((slug, index) => {
    href += `/${slug}`;
    const last = index === trail.length - 1;
    items.push({
      name: last && isArticle ? pageName : segmentName(href, slug),
      item: last ? canonicalURL : absolute(href),
    });
  });

  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalURL}#breadcrumb`,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
};

/**
 * JSON safe to place inside an HTML script element.
 *
 * JSON.stringify preserves a literal `</script>` sequence, so an article whose
 * title, description, author name, or profile URL contained one would close the
 * element early and spill the rest of the graph onto the page as markup.
 * Escaping `<` prevents that; `>` and `&` follow so the payload survives any
 * surrounding HTML context, and U+2028 and U+2029 are escaped because both are
 * valid inside a JSON string and neither is valid inside a JavaScript one.
 *
 * The escapes are JSON unicode sequences, so a parser reads the same value back.
 */
export const serializeJsonLd = (data: unknown): string =>
  JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");

/** The full graph for one page, ready to serialize into a ld+json block. */
export const structuredData = (
  meta: Meta | ArticleMeta,
  pathname: string,
  canonicalURL: string,
  imageURL: string
) => {
  const graph: Record<string, unknown>[] = [organizationNode(), websiteNode()];

  if (isArticleMeta(meta)) {
    graph.push(newsArticleNode(meta, canonicalURL, imageURL));
  }

  const breadcrumb = breadcrumbNode(
    pathname,
    canonicalURL,
    meta.metaTitle,
    isArticleMeta(meta)
  );
  if (breadcrumb) graph.push(breadcrumb);

  return { "@context": "https://schema.org", "@graph": graph };
};
