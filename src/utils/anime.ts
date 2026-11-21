export function parsePositiveInteger(
  value: string | string[] | undefined,
): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function isAnimeUpcoming(
  anime: { status?: string | null; episodes?: number | null } | null,
  episodeCount: number,
) {
  return (
    anime?.status === "NOT_YET_RELEASED" ||
    (episodeCount === 0 && !anime?.episodes)
  );
}

export interface AnimeReleaseInfo {
  status?: string | null;
  episodes?: number | null;
  nextAiringEpisode?: { episode: number } | null;
}

export function getReleasedEpisodeCount(anime: AnimeReleaseInfo | null) {
  if (anime?.status === "NOT_YET_RELEASED") return 0;
  if (anime?.nextAiringEpisode)
    return Math.max(0, anime.nextAiringEpisode.episode - 1);
  return anime?.status === "FINISHED" ? (anime.episodes ?? null) : null;
}
