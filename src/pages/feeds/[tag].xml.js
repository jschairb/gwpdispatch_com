import rss from "@astrojs/rss";
import { SITE } from "@/lib/config";
import {
  FEED_ITEM_CAP,
  articleToRssItem,
  filterByTag,
  loadPublishedArticles,
} from "@/lib/utils/feed";

const TAG_FEEDS = [
  { slug: "gwa", title: "GWP Dispatch — GWA" },
  { slug: "kn-86", title: "GWP Dispatch — KN-86" },
];

export function getStaticPaths() {
  return TAG_FEEDS.map(({ slug, title }) => ({
    params: { tag: slug },
    props: { slug, title },
  }));
}

export async function GET(context) {
  const { slug, title } = context.props;
  const articles = filterByTag(await loadPublishedArticles(), slug).slice(
    0,
    FEED_ITEM_CAP
  );
  return rss({
    title,
    description: `${SITE.description} Articles tagged "${slug}".`,
    site: context.site,
    xmlns: { dc: "http://purl.org/dc/elements/1.1/" },
    items: articles.map(articleToRssItem),
  });
}
