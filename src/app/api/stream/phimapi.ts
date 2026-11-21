import type { StreamServer } from "@/types/stream";
import type { AnimeMeta } from "./anime-metadata";
import { cleanTitle } from "./search-candidates";

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

  if (
    hay.includes("lego") ||
    hay.includes("live action") ||
    hay.includes("parody")
  ) {
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

  if (
    meta.seasonYear &&
    detail.year &&
    Math.abs(meta.seasonYear - detail.year) <= 1
  ) {
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

export async function getPhimApiStreams(
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
    } catch {}
  }

  if (matchedCandidates.length === 0) return null;

  matchedCandidates.sort((a, b) => b.score - a.score);
  return {
    animeName: matchedCandidates[0].animeName,
    servers: matchedCandidates[0].servers,
  };
}
