import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { StreamResponse, StreamServer } from "@/types/anime";

// In-memory cache for anime movie details (slug -> episode servers)
interface CacheEntry {
  movieName: string;
  slug: string;
  episodes: Array<{
    server_name: string;
    server_data: Array<{
      name: string;
      slug: string;
      filename: string;
      link_embed: string;
      link_m3u8: string;
    }>;
  }>;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function cleanTitle(title: string): string {
  return title
    .replace(/[-:_()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fetch movie detail from PhimAPI
 */
async function fetchPhimDetail(slug: string): Promise<CacheEntry | null> {
  const cached = cache.get(slug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached;
  }

  try {
    const res = await fetch(`https://phimapi.com/phim/${slug}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.episodes) return null;

    const entry: CacheEntry = {
      movieName: data.movie?.name || slug,
      slug,
      episodes: data.episodes,
      timestamp: Date.now(),
    };
    cache.set(slug, entry);
    return entry;
  } catch {
    return null;
  }
}

/**
 * Try searching PhimAPI for matching anime and extract episode streams
 */
async function getPhimApiStreams(
  titles: string[],
  targetEp: number,
): Promise<{ animeName: string; servers: StreamServer[] } | null> {
  const searchedSlugs = new Set<string>();

  for (const rawTitle of titles) {
    if (!rawTitle) continue;
    const cleaned = cleanTitle(rawTitle);
    if (!cleaned) continue;

    // Search PhimAPI
    try {
      const searchUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
        cleaned,
      )}&limit=6`;
      const res = await fetch(searchUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      if (!res.ok) continue;

      const data = await res.json();
      const items: Array<{ name: string; slug: string }> =
        data.data?.items || [];

      for (const item of items) {
        if (searchedSlugs.has(item.slug)) continue;
        searchedSlugs.add(item.slug);

        const movieDetail = await fetchPhimDetail(item.slug);
        if (!movieDetail) continue;

        const matchingServers: StreamServer[] = [];

        for (const server of movieDetail.episodes) {
          const matchedEpisode = server.server_data.find((e) => {
            const num = parseInt(e.name.replace(/\D/g, ""), 10);
            if (num === targetEp) return true;
            // Support movies or single-episode OVA where name is "Full"
            if (
              targetEp === 1 &&
              (e.name.toLowerCase().includes("full") ||
                e.slug.toLowerCase().includes("full"))
            ) {
              return true;
            }
            return false;
          });

          if (matchedEpisode) {
            const isVietsub =
              server.server_name.toLowerCase().includes("vietsub") ||
              !server.server_name.toLowerCase().includes("lồng tiếng");

            matchingServers.push({
              id: `phimapi-${server.server_name}-${matchedEpisode.slug}`,
              serverName:
                server.server_name || (isVietsub ? "Vietsub" : "Lồng Tiếng"),
              type: "iframe",
              embedUrl: matchedEpisode.link_embed,
              m3u8Url: matchedEpisode.link_m3u8,
              quality: "Full HD",
              provider: "phimapi",
            });
          }
        }

        if (matchingServers.length > 0) {
          return {
            animeName: movieDetail.movieName,
            servers: matchingServers,
          };
        }
      }
    } catch {
      // Continue to next candidate title
    }
  }

  return null;
}

/**
 * Optional Consumet API Integration
 * Works if CONSUMET_API_URL is configured in environment
 */
async function getConsumetStreams(
  title: string,
  targetEp: number,
): Promise<StreamServer[]> {
  const consumetUrl = process.env.CONSUMET_API_URL;
  if (!consumetUrl) return [];

  try {
    const searchRes = await fetch(
      `${consumetUrl.replace(/\/$/, "")}/anime/gogoanime/${encodeURIComponent(
        title,
      )}`,
      { next: { revalidate: 1800 } },
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const firstAnime = searchData.results?.[0];
    if (!firstAnime) return [];

    const infoRes = await fetch(
      `${consumetUrl.replace(/\/$/, "")}/anime/gogoanime/info/${firstAnime.id}`,
    );
    if (!infoRes.ok) return [];

    const infoData = await infoRes.json();
    const epObj = infoData.episodes?.find(
      (e: { number: number; id: string }) => e.number === targetEp,
    );
    if (!epObj) return [];

    const watchRes = await fetch(
      `${consumetUrl.replace(/\/$/, "")}/anime/gogoanime/watch/${epObj.id}`,
    );
    if (!watchRes.ok) return [];

    const watchData = await watchRes.json();
    const servers: StreamServer[] = [];

    // Check if watchData provides sources (m3u8)
    const m3u8Source = watchData.sources?.find(
      (s: { isM3U8?: boolean; quality?: string; url: string }) =>
        s.isM3U8 || s.url?.includes(".m3u8"),
    );

    if (m3u8Source) {
      servers.push({
        id: `consumet-gogo-${epObj.id}`,
        serverName: "Consumet (GogoAnime Engsub)",
        type: "iframe",
        embedUrl: watchData.headers?.Referer || m3u8Source.url,
        m3u8Url: m3u8Source.url,
        quality: m3u8Source.quality || "720p/1080p",
        provider: "consumet",
      });
    }

    return servers;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "";
  const englishTitle = searchParams.get("englishTitle") || "";
  const episodeStr = searchParams.get("episode") || "1";
  const episode = parseInt(episodeStr, 10) || 1;

  if (!title && !englishTitle) {
    return NextResponse.json<StreamResponse>(
      {
        success: false,
        episode,
        servers: [],
        message: "Thiếu tiêu đề phim để tìm kiếm nguồn stream.",
      },
      { status: 400 },
    );
  }

  // Construct prioritized title candidates
  const candidates: string[] = [];
  if (title) candidates.push(title);
  if (englishTitle && englishTitle !== title) candidates.push(englishTitle);

  // If title has season indicators like "Season 2", also try base title
  const baseTitle = title
    .replace(/\s*(?:Season|\b2nd\b|\b3rd\b|\b4th\b|\bPart\b).*$/i, "")
    .trim();
  if (baseTitle && baseTitle !== title && !candidates.includes(baseTitle)) {
    candidates.push(baseTitle);
  }

  // 1. Query PhimAPI Vietsub stream provider
  const phimResult = await getPhimApiStreams(candidates, episode);

  // 2. Query Consumet API if configured
  const consumetServers = await getConsumetStreams(
    title || englishTitle,
    episode,
  );

  const allServers: StreamServer[] = [];
  if (phimResult?.servers) {
    allServers.push(...phimResult.servers);
  }
  if (consumetServers.length > 0) {
    allServers.push(...consumetServers);
  }

  if (allServers.length === 0) {
    return NextResponse.json<StreamResponse>({
      success: false,
      animeName: phimResult?.animeName || title,
      episode,
      servers: [],
      message: `Chưa tìm thấy nguồn stream trực tiếp cho Tập ${episode}.`,
    });
  }

  return NextResponse.json<StreamResponse>({
    success: true,
    animeName: phimResult?.animeName || title,
    episode,
    servers: allServers,
  });
}
