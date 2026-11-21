import type { StreamServer } from "@/types/stream";
import type { AnimeMeta } from "./anime-metadata";
import {
  completeRangeStart,
  localEpisode,
  numberedEpisodes,
} from "./provider-episodes";
import { matchesTitle, releaseTitles } from "./release-identity";
import type { SplitRelease } from "./split-release";

interface PhimEpisodeData {
  name: string;
  slug: string;
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
    const parsedTotal =
      Number(totalStr.match(/^\s*(?:\d+\s*\/\s*)?(\d+)/)?.[1]) || 0;

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

function resolveProviderEpisode(
  server: PhimServer,
  detail: PhimDetail,
  meta: AnimeMeta,
  split: SplitRelease | null,
  episode: number,
) {
  const titles = [detail.originName, detail.movieName];
  const index = numberedEpisodes(server.server_data, (entry) => entry.name);
  if (
    split &&
    split.year &&
    detail.year === split.year &&
    detail.episodeTotal === split.total &&
    matchesTitle(titles, split.titles)
  ) {
    const first = completeRangeStart(index, split.total);
    if (first !== null && (!meta.episodes || episode <= meta.episodes)) {
      const entry = index.get(first + split.offset + episode - 1);
      if (entry) return { entry, priority: 1 };
    }
    return null;
  }

  if (!matchesTitle(titles, releaseTitles(meta))) return null;
  if (
    meta.seasonYear &&
    detail.year &&
    Math.abs(meta.seasonYear - detail.year) > 1
  )
    return null;
  const count = meta.episodes;
  if (count && (detail.episodeTotal > count || index.size > count)) return null;
  const entry =
    localEpisode(index, episode, count) ??
    (episode === 1 &&
    index.size === 0 &&
    (count === 1 || meta.format === "MOVIE")
      ? server.server_data.find((item) =>
          /^(full|hoàn tất)$/i.test(item.name.trim()),
        )
      : undefined);
  return entry ? { entry, priority: 2 } : null;
}

export async function getPhimApiStreams(
  candidates: string[],
  targetEp: number,
  meta: AnimeMeta,
  split: SplitRelease | null,
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
        let score = 0;

        for (const server of detail.episodes) {
          const resolved = resolveProviderEpisode(
            server,
            detail,
            meta,
            split,
            targetEp,
          );
          if (
            !resolved ||
            (!resolved.entry.link_embed && !resolved.entry.link_m3u8)
          )
            continue;
          const matched = resolved.entry;
          score = Math.max(score, resolved.priority);

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
            score,
            animeName: detail.movieName,
            servers,
          });
        }
      }

      if (matchedCandidates.some((c) => c.score === 2)) {
        break;
      }
    } catch (error) {
      console.warn("[stream.phimapi] Search failed", {
        id: meta.id,
        error: error instanceof Error ? error.name : "Unknown error",
      });
    }
  }

  if (matchedCandidates.length === 0) {
    console.warn("[stream.phimapi] No verified source", {
      id: meta.id,
      episode: targetEp,
      candidates: searchedSlugs.size,
    });
    return null;
  }

  matchedCandidates.sort((a, b) => b.score - a.score);
  return {
    animeName: matchedCandidates[0].animeName,
    servers: matchedCandidates[0].servers,
  };
}
