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
    (!anime?.status && episodeCount === 0 && !anime?.episodes)
  );
}

export interface AnimeReleaseInfo {
  status?: string | null;
  episodes?: number | null;
  nextAiringEpisode?: { episode: number } | null;
}

export function getReleasedEpisodeCount(anime: AnimeReleaseInfo | null) {
  if (anime?.status === "NOT_YET_RELEASED") return 0;
  const declared = anime?.episodes;
  const total =
    typeof declared === "number" &&
    Number.isSafeInteger(declared) &&
    declared > 0
      ? declared
      : null;
  if (anime?.status === "FINISHED" && total !== null) return total;

  const next = anime?.nextAiringEpisode?.episode;
  if (typeof next === "number" && Number.isSafeInteger(next) && next > 0) {
    return total === null ? next - 1 : Math.min(total, next - 1);
  }
  return null;
}
