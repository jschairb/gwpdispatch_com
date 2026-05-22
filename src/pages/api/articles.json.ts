import type { APIRoute } from "astro";
import { SITE } from "@/lib/config";
import {
  filterByTag,
  loadPublishedArticles,
  parseLimit,
} from "@/lib/utils/feed";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const tagParam = url.searchParams.get("tag");
  const limit = parseLimit(url.searchParams.get("limit"), 50);

  let articles = await loadPublishedArticles();
  if (tagParam !== null) {
    articles = filterByTag(articles, tagParam);
  }
  articles = articles.slice(0, limit);

  const items = articles.map((article) => ({
    id: article.id,
    title: article.data.title,
    description: article.data.description,
    publishedTime: new Date(article.data.publishedTime).toISOString(),
    category: article.data.category.id,
    tags: article.data.tags ?? [],
    authors: article.data.authors.map((a) => a.id),
    url: new URL(`/articles/${article.id}/`, SITE.url).toString(),
  }));

  return new Response(JSON.stringify({ items }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
