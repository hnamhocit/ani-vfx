import { type AnimeReleaseInfo, getReleasedEpisodeCount } from "./anime";

export function episodeNumber(label: string | null | undefined): number | null {
  if (typeof label !== "string") return null;
  const match = label
    ?.trim()
    .match(/^(?:(?:episode|ep\.?|tập)\s+)?(\d+)(?=$|\s|[-:–—]|\.(?!\d))/i);
  const number = Number(match?.[1]);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export function contiguousEpisodeCount(numbers: Iterable<number>) {
  const unique = new Set(numbers);
  let count = 0;
  while (unique.has(count + 1)) count += 1;
  return count;
}

export interface AnimeEpisodeItem {
  id: number;
  title?: string;
  filler?: boolean;
}

export function listAnimeEpisodes(
  anime: AnimeReleaseInfo | null,
  received: readonly AnimeEpisodeItem[] = [],
) {
  const byId = new Map(
    received
      .filter(({ id }) => Number.isSafeInteger(id) && id > 0)
      .map((episode) => [episode.id, episode]),
  );
  const count =
    getReleasedEpisodeCount(anime) ?? contiguousEpisodeCount(byId.keys());
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return byId.get(id) ?? { id, title: `Tập ${id}` };
  });
}
