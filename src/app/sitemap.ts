// Dynamic sitemap powered by AniList GraphQL
import type { MetadataRoute } from "next";
import { siteUrl } from "./site-url";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

async function fetchTopAniListIds(): Promise<number[]> {
  const query = `
    query {
      trending: Page(page: 1, perPage: 30) {
        media(type: ANIME, isAdult: false, sort: [TRENDING_DESC]) {
          id
        }
      }
      popular: Page(page: 1, perPage: 30) {
        media(type: ANIME, isAdult: false, sort: [POPULARITY_DESC]) {
          id
        }
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) return [];
    const json = await res.json();

    const trendingIds: number[] =
      json?.data?.trending?.media?.map((m: { id: number }) => m.id) || [];
    const popularIds: number[] =
      json?.data?.popular?.media?.map((m: { id: number }) => m.id) || [];

    return Array.from(new Set([...trendingIds, ...popularIds]));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl.origin;
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

  const animeIds = await fetchTopAniListIds();

  const animeRoutes: MetadataRoute.Sitemap = animeIds.map((id) => ({
    url: `${baseUrl}/anime/${id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const watchRoutes: MetadataRoute.Sitemap = animeIds.map((id) => ({
    url: `${baseUrl}/anime/${id}/watch?ep=1`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...animeRoutes, ...watchRoutes];
}
