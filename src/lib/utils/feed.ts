import { getCollection, type CollectionEntry } from "astro:content";
import { authorsHandler } from "@/lib/handlers/authors";

export type ArticleEntry = CollectionEntry<"articles">;

export const FEED_ITEM_CAP = 50;

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => XML_ESCAPES[ch]);
}

export function articleToRssItem(article: ArticleEntry) {
  const authorNames = article.data.authors.map(
    (ref) => authorsHandler.findAuthor(ref.id).data.name
  );
  const dcCreators = authorNames
    .map((name) => `<dc:creator>${escapeXml(name)}</dc:creator>`)
    .join("");
  const guid = `<guid isPermaLink="false">${escapeXml(article.id)}</guid>`;

  return {
    title: article.data.title,
    description: article.data.description,
    link: `/articles/${article.id}/`,
    pubDate: new Date(article.data.publishedTime),
    categories: [
      article.data.category.id,
      ...(article.data.tags ?? []),
    ],
    customData: `${guid}${dcCreators}`,
  };
}

export async function loadPublishedArticles(): Promise<ArticleEntry[]> {
  const now = new Date();
  const articles = await getCollection("articles", ({ data }) => {
    return data.isDraft !== true && new Date(data.publishedTime) <= now;
  });
  return articles.sort(
    (a, b) =>
      new Date(b.data.publishedTime).getTime() -
      new Date(a.data.publishedTime).getTime()
  );
}

export function filterByTag(
  articles: ArticleEntry[],
  tagSlug: string
): ArticleEntry[] {
  const needle = tagSlug.toLowerCase();
  return articles.filter((article) =>
    (article.data.tags ?? []).some((t) => t.toLowerCase() === needle)
  );
}

export function parseLimit(
  raw: string | null,
  fallback: number,
  min = 1,
  max = 200
): number {
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}
