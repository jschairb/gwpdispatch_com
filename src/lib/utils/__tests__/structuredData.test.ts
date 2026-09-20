import { describe, it, expect } from "vitest";
import { serializeJsonLd, structuredData } from "../structuredData";
import type { ArticleMeta, Meta } from "@/lib/types";

const SITE_URL = "https://gwpdispatch.com";

const listingMeta: Meta = {
  title: "Categories - GWP Dispatch",
  metaTitle: "Categories",
  description: "Every category on the Dispatch.",
  type: "website",
  ogImage: "/cover.png",
  ogImageAlt: "GWP Dispatch",
};

const articleMeta: ArticleMeta = {
  ...listingMeta,
  metaTitle: "XEOJ Radio launches",
  type: "article",
  publishedTime: "2026-08-08T15:00:00.000Z",
  lastModified: "2026-08-18T20:48:25.000Z",
  authors: [
    {
      name: "Joshua Schairbaum",
      link: "josh-schairbaum",
      sameAs: ["https://www.linkedin.com/in/jschairb/"],
    },
  ],
};

const nodesOf = (graph: any, type: string) =>
  graph["@graph"].filter((n: any) => n["@type"] === type);

const trail = (graph: any) =>
  nodesOf(graph, "BreadcrumbList")[0].itemListElement.map((i: any) => i.name);

describe("structuredData", () => {
  it("puts Organization and WebSite on every page", () => {
    const graph = structuredData(listingMeta, "/", `${SITE_URL}/`, "/cover.png");
    expect(nodesOf(graph, "Organization")).toHaveLength(1);
    expect(nodesOf(graph, "WebSite")).toHaveLength(1);
    expect(nodesOf(graph, "Organization")[0].sameAs).toContain(
      "https://www.linkedin.com/company/108105905"
    );
  });

  it("omits a breadcrumb on the home page", () => {
    const graph = structuredData(listingMeta, "/", `${SITE_URL}/`, "/cover.png");
    expect(nodesOf(graph, "BreadcrumbList")).toHaveLength(0);
  });

  it("emits a NewsArticle with author sameAs and a publisher reference", () => {
    const url = `${SITE_URL}/articles/xeoj-radio-app-launch/`;
    const graph = structuredData(articleMeta, "/articles/xeoj-radio-app-launch/", url, "/cover.png");
    const [article] = nodesOf(graph, "NewsArticle");
    expect(article.headline).toBe("XEOJ Radio launches");
    expect(article.datePublished).toBe("2026-08-08T15:00:00.000Z");
    expect(article.dateModified).toBe("2026-08-18T20:48:25.000Z");
    expect(article.author[0].sameAs).toEqual([
      "https://www.linkedin.com/in/jschairb/",
    ]);
    expect(article.publisher["@id"]).toBe(`${SITE_URL}/#organization`);
  });

  it("names an article's last crumb for the headline", () => {
    const url = `${SITE_URL}/articles/xeoj-radio-app-launch/`;
    const graph = structuredData(articleMeta, "/articles/xeoj-radio-app-launch/", url, "/cover.png");
    expect(trail(graph)).toEqual(["Home", "Articles", "XEOJ Radio launches"]);
  });

  it("drops a trailing page number and names a listing for its own segment", () => {
    // The listing view's metaTitle is "Categories"; the crumb must say "Wire".
    const url = `${SITE_URL}/categories/wire/1/`;
    const graph = structuredData(listingMeta, "/categories/wire/1/", url, "/cover.png");
    expect(trail(graph)).toEqual(["Home", "Categories", "Wire"]);
  });

  it("labels a segment from the navigation config when one matches", () => {
    const url = `${SITE_URL}/authors/josh-schairbaum/2/`;
    const graph = structuredData(listingMeta, "/authors/josh-schairbaum/2/", url, "/cover.png");
    expect(trail(graph)).toEqual(["Home", "Contributors", "Josh Schairbaum"]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes a script-closing sequence so it cannot end the element", () => {
    const meta: ArticleMeta = {
      ...articleMeta,
      metaTitle: "Why </script> breaks a page",
      description: "An article about the </script> tag & its <b>markup</b>.",
    };
    const url = `${SITE_URL}/articles/script-tags/`;
    const out = serializeJsonLd(
      structuredData(meta, "/articles/script-tags/", url, "/cover.png")
    );

    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).toContain("\\u003c/script\\u003e");
  });

  it("round-trips to the same value a parser would read", () => {
    const meta: ArticleMeta = {
      ...articleMeta,
      metaTitle: "Tags & </script> and \u2028 separators",
    };
    const url = `${SITE_URL}/articles/round-trip/`;
    const graph = structuredData(meta, "/articles/round-trip/", url, "/cover.png");

    expect(JSON.parse(serializeJsonLd(graph))).toEqual(graph);
  });

  it("escapes the line separators that JSON allows and JavaScript does not", () => {
    const out = serializeJsonLd({ text: "a\u2028b\u2029c" });
    expect(out).not.toContain("\u2028");
    expect(out).not.toContain("\u2029");
    expect(JSON.parse(out)).toEqual({ text: "a\u2028b\u2029c" });
  });
});
