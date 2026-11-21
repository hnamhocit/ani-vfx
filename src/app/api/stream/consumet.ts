import type { StreamServer } from "@/types/stream";

import type { AnimeMeta } from "./anime-metadata";
import { localEpisode, numberedEpisodes } from "./provider-episodes";
import { matchesTitle, releaseTitles } from "./release-identity";

const CONSUMET_API_URL = process.env.CONSUMET_API_URL?.replace(/\/$/, "");

export async function getConsumetStreams(
  title: string,
  targetEp: number,
  meta: AnimeMeta,
): Promise<StreamServer[]> {
  if (!CONSUMET_API_URL) return [];

  try {
    const searchRes = await fetch(
      `${CONSUMET_API_URL}/anime/gogoanime/${encodeURIComponent(title)}`,
      { next: { revalidate: 1800 } },
    );
    if (!searchRes.ok) return [];

    const searchData = await searchRes.json();
    const expected = releaseTitles(meta);
    const firstAnime = (
      searchData.results as Array<{ id: string; title?: string }> | undefined
    )?.find(
      (candidate) =>
        typeof candidate.title === "string" &&
        matchesTitle([candidate.title], expected),
    );
    if (!firstAnime) return [];

    const infoRes = await fetch(
      `${CONSUMET_API_URL}/anime/gogoanime/info/${firstAnime.id}`,
    );
    if (!infoRes.ok) return [];

    const infoData = await infoRes.json();
    if (
      meta.seasonYear &&
      Number(infoData.releaseDate) &&
      Math.abs(meta.seasonYear - Number(infoData.releaseDate)) > 1
    )
      return [];
    const episodes = (infoData.episodes ?? []) as Array<{
      number: number;
      id: string;
    }>;
    const epObj = localEpisode(
      numberedEpisodes(episodes, (entry) => String(entry.number)),
      targetEp,
      meta.episodes,
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
