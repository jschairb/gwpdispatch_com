import type { Link } from "../types";

export const SITE = {
  title: "GWP Dispatch",
  description: "The press hub for Great Western Productions.",
  author: "Great Western Productions",
  url: "https://gwpdispatch.com",
  locale: "en-US",
  dir: "ltr",
  charset: "UTF-8",
  basePath: "/",
  postsPerPage: 4,
};

export const NAVIGATION_LINKS: Link[] = [
  {
    href: "/categories/wire",
    text: "Wire",
  },
  {
    href: "/categories/field-reports",
    text: "Field Reports",
  },
  {
    href: "/categories/dispatches",
    text: "Dispatches",
  },
];

export const OTHER_LINKS: Link[] = [
  {
    href: "/about",
    text: "About",
  },
  {
    href: "/authors",
    text: "Contributors",
  },
  {
    href: "/rss.xml",
    text: "RSS",
  },
  {
    href: "/sitemap-index.xml",
    text: "Sitemap",
  },
];

export const SOCIAL_LINKS: Link[] = [
  {
    href: "https://www.linkedin.com/company/108105905",
    text: "LinkedIn",
    icon: "linkedin",
  },
];
