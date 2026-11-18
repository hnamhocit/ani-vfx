// Stream Source Resolver with AniList metadata scoring to avoid wrong specials/parodies
import { type NextRequest, NextResponse } from "next/server";
import type { StreamResponse, StreamServer } from "@/types/stream";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const CONSUMET_API_URL = process.env.CONSUMET_API_URL?.replace(/\/$/, "");

interface AnimeMeta {
  romaji: string | null;
  english: string | null;
  native: string | null;
  episodes: number | null;
  format: string | null;
  seasonYear: number | null;
}

async function fetchAnimeMeta(anilistId: number): Promise<AnimeMeta | null> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        title { romaji english native }
        episodes
        format
        seasonYear
      }
    }
  `;

  try {
    const res = await fetch(ANILIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id: anilistId } }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const media = json.data?.Media;
    if (!media) return null;

    return {
      romaji: media.title?.romaji ?? null,
      english: media.title?.english ?? null,
      native: media.title?.native ?? null,
      episodes: media.episodes ?? null,
      format: media.format ?? null,
      seasonYear: media.seasonYear ?? null,
    };
  } catch {
    return null;
  }
}

function cleanTitle(title: string): string {
  return title
    .replace(/[():[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSearchCandidates(meta: AnimeMeta): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (raw: string | null) => {
    if (!raw) return;
    const cleaned = cleanTitle(raw);
    if (cleaned && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      candidates.push(cleaned);
    }
  };

  addCandidate(meta.romaji);
  addCandidate(meta.english);
  addCandidate(meta.native);

  for (const c of [...candidates]) {
    const base = c
      .replace(/\s*(?:Season\s*\d+|\b[2-4](?:nd|rd|th)\b|\bPart\s*\d+\b).*$/i, "")
      .trim();
    if (base && base !== c && !seen.has(base.toLowerCase())) {
      seen.add(base.toLowerCase());
      candidates.push(base);
    }
  }

  return candidates;
}

interface PhimEpisodeData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface PhimServer {
  server_name: string;
  server_data: PhimEpisodeData[];
}

interface PhimDetail {
  movieName: string;
  originName: string;
  year: number;
  type: string;
  episodeTotal: number;
  episodes: PhimServer[];
}

async function fetchPhimDetail(slug: string): Promise<PhimDetail | null> {
  try {
    const res = await fetch(`https://phimapi.com/phim/${slug}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.episodes) return null;

    const totalStr = String(data.movie?.episode_total || "");
    const parsedTotal = parseInt(totalStr.replace(/\D/g, ""), 10) || 0;

    return {
      movieName: data.movie?.name || slug,
      originName: data.movie?.origin_name || "",
      year: Number(data.movie?.year) || 0,
      type: data.movie?.type || "",
      episodeTotal: parsedTotal,
      episodes: data.episodes,
    };
  } catch {
    return null;
  }
}

function scorePhimMatch(
  detail: PhimDetail,
  meta: AnimeMeta | null,
  maxServerEpCount: number,
): number {
  let score = 0;
  const hay = `${detail.movieName} ${detail.originName}`.toLowerCase();

  if (hay.includes("lego") || hay.includes("live action") || hay.includes("parody")) {
    score -= 100;
  }

  if (!meta) return score;

  const titles = [meta.romaji, meta.english]
    .filter(Boolean)
    .map((t) => cleanTitle(t as string).toLowerCase());

  if (titles.some((t) => detail.originName.toLowerCase() === t)) {
    score += 50;
  } else if (titles.some((t) => hay.includes(t))) {
    score += 25;
  }

  if (meta.format === "MOVIE" && detail.type === "single") {
    score += 30;
  } else if (meta.format !== "MOVIE" && detail.type !== "single") {
    score += 20;
  }

  if (meta.seasonYear && detail.year && Math.abs(meta.seasonYear - detail.year) <= 1) {
    score += 20;
  }

  const actualCount = detail.episodeTotal || maxServerEpCount;
  if (meta.episodes && actualCount > 0) {
    const diff = Math.abs(meta.episodes - actualCount);
    if (diff === 0) score += 40;
    else if (diff <= 2) score += 20;
    else if (meta.episodes >= 50 && actualCount < 15) score -= 60;
  } else if (!meta.episodes && meta.format === "TV" && actualCount >= 50) {
    score += 35;
  }

  return score;
}

function matchEpisode(
  serverData: PhimEpisodeData[],
  targetEp: number,
): PhimEpisodeData | null {
  for (const ep of serverData) {
    const num = parseInt(ep.name.replace(/\D/g, ""), 10);
    if (num === targetEp) return ep;

    if (
      targetEp === 1 &&
      (ep.name.toLowerCase().includes("full") ||
        ep.slug.toLowerCase().includes("full"))
    ) {
      return ep;
    }
  }
  return null;
}

async function getPhimApiStreams(
  candidates: string[],
  targetEp: number,
  meta: AnimeMeta | null,
): Promise<{ animeName: string; servers: StreamServer[] } | null> {
  const searchedSlugs = new Set<string>();
  const matchedCandidates: Array<{
    score: number;
    animeName: string;
    servers: StreamServer[];
  }> = [];

  for (const title of candidates) {
    try {
      const searchUrl = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(title)}&limit=10`;
      const res = await fetch(searchUrl);
      if (!res.ok) continue;

      const data = await res.json();
      const items: Array<{ name: string; slug: string }> =
        data.data?.items || [];

      for (const item of items) {
        if (searchedSlugs.has(item.slug)) continue;
        searchedSlugs.add(item.slug);

        const detail = await fetchPhimDetail(item.slug);
        if (!detail) continue;

        const servers: StreamServer[] = [];
        let maxServerEpCount = 0;

        for (const server of detail.episodes) {
          if (server.server_data.length > maxServerEpCount) {
            maxServerEpCount = server.server_data.length;
          }
          const matched = matchEpisode(server.server_data, targetEp);
          if (!matched) continue;

          const isVietsub =
            server.server_name.toLowerCase().includes("vietsub") ||
            !server.server_name.toLowerCase().includes("lồng tiếng");

          servers.push({
            id: `phimapi-${server.server_name}-${matched.slug}`,
            serverName:
              server.server_name || (isVietsub ? "Vietsub" : "Lồng Tiếng"),
            type: "iframe",
            embedUrl: matched.link_embed,
            m3u8Url: matched.link_m3u8,
            quality: "Full HD",
            provider: "phimapi",
          });
        }

        if (servers.length > 0) {
          matchedCandidates.push({
            score: scorePhimMatch(detail, meta, maxServerEpCount),
            animeName: detail.movieName,
            servers,
          });
        }
      }

      if (matchedCandidates.some((c) => c.score >= 40)) {
        break;
      }
    } catch { }
  }

  if (matchedCandidates.length === 0) return null;

  matchedCandidates.sort((a, b) => b.score - a.score);
  return {
    animeName: matchedCandidates[0].animeName,
    servers: matchedCandidates[0].servers,
  };
}

async function getConsumetStreams(
  title: string,
  targetEp: number,
): Promise<StreamServer[]> {
  if (!CONSUMET_API_URL) return [];

  try {
    const searchRes = await fetch(
      `${CONSUMET_API_URL}/anime/gogoanime/${encodeURIComponent(title)}`,
      { next: { revalidate: 1800 } },
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const firstAnime = searchData.results?.[0];
    if (!firstAnime) return [];

    const infoRes = await fetch(
      `${CONSUMET_API_URL}/anime/gogoanime/info/${firstAnime.id}`,
    );
    if (!infoRes.ok) return [];

    const infoData = await infoRes.json();
    const epObj = infoData.episodes?.find(
      (e: { number: number; id: string }) => e.number === targetEp,
    );
    if (!epObj) return [];

    const watchRes = await fetch(
      `${CONSUMET_API_URL}/anime/gogoanime/watch/${epObj.id}`,
    );
    if (!watchRes.ok) return [];

    const watchData = await watchRes.json();
    const m3u8Source = watchData.sources?.find(
      (s: { isM3U8?: boolean; quality?: string; url: string }) =>
        s.isM3U8 || s.url?.includes(".m3u8"),
    );

    if (!m3u8Source) return [];

    return [
      {
        id: `consumet-gogo-${epObj.id}`,
        serverName: "Consumet (GogoAnime Engsub)",
        type: "iframe",
        embedUrl: watchData.headers?.Referer || m3u8Source.url,
        m3u8Url: m3u8Source.url,
        quality: m3u8Source.quality || "720p/1080p",
        provider: "consumet",
      },
    ];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const anilistIdStr = searchParams.get("anilistId");
  const titleParam = searchParams.get("title") || "";
  const englishTitleParam = searchParams.get("englishTitle") || "";
  const episode = Math.max(1, parseInt(searchParams.get("episode") || "1", 10) || 1);

  let candidates: string[] = [];
  let meta: AnimeMeta | null = null;

  if (anilistIdStr) {
    const anilistId = parseInt(anilistIdStr, 10);
    if (!Number.isNaN(anilistId)) {
      meta = await fetchAnimeMeta(anilistId);
      if (meta) {
        candidates = buildSearchCandidates(meta);
      }
    }
  }

  if (candidates.length === 0) {
    if (!titleParam && !englishTitleParam) {
      return NextResponse.json<StreamResponse>(
        {
          success: false,
          episode,
          servers: [],
          message: "Thiếu anilistId hoặc tiêu đề phim để tìm kiếm nguồn stream.",
        },
        { status: 400 },
      );
    }

    meta = {
      romaji: titleParam || null,
      english: englishTitleParam || null,
      native: null,
      episodes: null,
      format: null,
      seasonYear: null,
    };
    candidates = buildSearchCandidates(meta);
  }

  const phimResult = await getPhimApiStreams(candidates, episode, meta);
  const consumetServers = await getConsumetStreams(
    candidates[0] || titleParam || englishTitleParam,
    episode,
  );

  const allServers: StreamServer[] = [];
  if (phimResult?.servers) allServers.push(...phimResult.servers);
  if (consumetServers.length > 0) allServers.push(...consumetServers);

  if (allServers.length === 0) {
    return NextResponse.json<StreamResponse>({
      success: false,
      animeName: phimResult?.animeName || candidates[0] || titleParam,
      episode,
      servers: [],
      message: `Chưa tìm thấy nguồn stream trực tiếp cho Tập ${episode}.`,
    });
  }

  return NextResponse.json<StreamResponse>({
    success: true,
    animeName: phimResult?.animeName || candidates[0] || titleParam,
    episode,
    servers: allServers,
  });
}
