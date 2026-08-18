import { getCollection } from "astro:content";

const articlesCollection = (
  await getCollection("articles", ({ data }) => {
    return data.isDraft !== true && new Date(data.publishedTime) < new Date();
  })
).sort((a, b) =>
  new Date(b.data.publishedTime)
    .toISOString()
    .localeCompare(new Date(a.data.publishedTime).toISOString())
);

export const articlesHandler = {
  allArticles: () => articlesCollection,

  mainHeadline: () => {
    const article = articlesCollection.filter(
      (article) => article.data.isMainHeadline === true
    )[0];
    if (!article)
      throw new Error(
        "Please ensure there is at least one item to display for the main headline."
      );
    return article;
  },

  subHeadlines: () => {
    const mainHeadline = articlesHandler.mainHeadline();
    const subHeadlines = articlesCollection
      .filter(
        (article) =>
          article.data.isSubHeadline === true &&
          mainHeadline.id !== article.id
      )
      .slice(0, 4);

    if (subHeadlines.length === 0)
      throw new Error(
        "Please ensure there is at least one item to display for the sub headlines."
      );
    return subHeadlines;
  },

  /**
   * The front-page rail beside the lead story. Flagged sub-headlines come
   * first; the rest of the column is backfilled with the next most recent
   * articles so the rail always balances the lead.
   */
  railArticles: (count = 4) => {
    const mainHeadline = articlesHandler.mainHeadline();
    const rail = [...articlesHandler.subHeadlines()];
    const taken = new Set([mainHeadline.id, ...rail.map((a) => a.id)]);

    for (const article of articlesCollection) {
      if (rail.length >= count) break;
      if (taken.has(article.id)) continue;
      rail.push(article);
      taken.add(article.id);
    }

    return rail.slice(0, count);
  },
};
