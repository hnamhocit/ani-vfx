import type { MetadataRoute } from "next";
import { MOCK_ANIMES } from "@/services/mockData";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://hnamhocit.vercel.app";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?category=now`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?category=popular`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?category=upcoming`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const animeRoutes: MetadataRoute.Sitemap = MOCK_ANIMES.map((anime) => ({
    url: `${baseUrl}/anime/${anime.mal_id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const watchRoutes: MetadataRoute.Sitemap = MOCK_ANIMES.map((anime) => ({
    url: `${baseUrl}/anime/${anime.mal_id}/watch?ep=1`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...animeRoutes, ...watchRoutes];
}
