import { episodeNumber } from "@/utils/episodes";

export function numberedEpisodes<T>(
  entries: readonly T[],
  getLabel: (entry: T) => string,
) {
  const index = new Map<number, T>();
  for (const entry of entries) {
    const number = episodeNumber(getLabel(entry));
    if (number !== null && !index.has(number)) index.set(number, entry);
  }
  return index;
}

export function completeRangeStart(
  index: ReadonlyMap<number, unknown>,
  count: number,
) {
  if (count < 1 || index.size !== count) return null;
  let first = Infinity;
  let last = 0;
  for (const number of index.keys()) {
    first = Math.min(first, number);
    last = Math.max(last, number);
  }
  return last - first + 1 === count ? first : null;
}

export function localEpisode<T>(
  index: ReadonlyMap<number, T>,
  episode: number,
  count: number | null | undefined,
) {
  if (count && episode > count) return undefined;
  const first = count ? completeRangeStart(index, count) : null;
  if (first !== null) return index.get(first + episode - 1);
  // With an incomplete catalogue, only accept local numbering anchored at episode 1.
  if (
    !index.has(1) ||
    (count && [...index.keys()].some((number) => number > count))
  )
    return undefined;
  return index.get(episode);
}
