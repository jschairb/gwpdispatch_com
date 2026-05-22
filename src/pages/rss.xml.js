import rss from "@astrojs/rss";
import { SITE } from "@/lib/config";
import {
  FEED_ITEM_CAP,
  articleToRssItem,
  loadPublishedArticles,
} from "@/lib/utils/feed";

export async function GET(context) {
  const articles = (await loadPublishedArticles()).slice(0, FEED_ITEM_CAP);
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    xmlns: { dc: "http://purl.org/dc/elements/1.1/" },
    items: articles.map(articleToRssItem),
  });
}
