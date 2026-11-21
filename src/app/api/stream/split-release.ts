import { type AnimeMeta, fetchAnimeMeta } from "./anime-metadata";
import { matchesTitle, releaseTitles, splitTitle } from "./release-identity";

export interface SplitRelease {
  titles: string[];
  year: number | null;
  total: number;
  offset: number;
}

export async function resolveSplitRelease(
  media: AnimeMeta,
  fetchRelease = fetchAnimeMeta,
): Promise<SplitRelease | null> {
  const titleParts = releaseTitles(media).map(splitTitle);
  const part = titleParts.find(({ part }) => part !== null)?.part ?? 1;
  const baseTitles = titleParts.map(({ base }) => base);
  if (!media.id || part > 8) return null;

  const known = new Map<number, AnimeMeta>([[media.id, media]]);
  async function adjacent(
    item: AnimeMeta,
    relationType: "PREQUEL" | "SEQUEL",
    partNumber: number,
  ) {
    const matches = item.neighbors?.filter(
      ({ relationType: type, node }) =>
        type === relationType &&
        releaseTitles(node).some((title) => {
          const { base, part } = splitTitle(title);
          return (
            matchesTitle([base], baseTitles) &&
            (part === partNumber || (part === null && partNumber === 1))
          );
        }),
    );
    if (!matches?.length) return undefined;
    const id = matches[0].node.id;
    if (matches.length !== 1 || !id) return null;
    const next = known.get(id) ?? (await fetchRelease(id));
    if (next) known.set(id, next);
    return next;
  }

  let first = media;
  for (let index = part - 1; index >= 1; index--) {
    const previous = await adjacent(first, "PREQUEL", index);
    if (!previous) return null;
    first = previous;
  }

  let total = 0;
  let offset: number | undefined;
  let current = first;
  for (let index = 1; index <= 8; index++) {
    const count = current.episodes;
    if (
      current.status !== "FINISHED" ||
      !count ||
      !Number.isSafeInteger(count) ||
      count < 1
    )
      return null;
    if (current.id === media.id) offset = total;
    total += count;
    const next = await adjacent(current, "SEQUEL", index + 1);
    if (next === null) return null;
    if (next === undefined) {
      return index > 1 && offset !== undefined
        ? { titles: baseTitles, year: first.seasonYear, total, offset }
        : null;
    }
    current = next;
  }
  return null;
}
