import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteUrl.origin;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/callback"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
