import { type AnimeMeta, fetchAnimeMeta } from "./anime-metadata";
import {
  matchesTitle,
  normalizeTitle,
  providerAliases,
  releaseTitles,
  splitTitle,
} from "./release-identity";

export interface SplitRelease {
  titles: string[];
  year: number | null;
  totals: number[];
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
    isMatch: (candidate: AnimeMeta) => boolean,
  ) {
    const matches = item.neighbors?.filter(
      ({ relationType: type, node }) => type === relationType && isMatch(node),
    );
    if (!matches?.length) return undefined;
    const id = matches[0].node.id;
    if (matches.length !== 1 || !id) return null;
    const next = known.get(id) ?? (await fetchRelease(id));
    if (next) known.set(id, next);
    return next;
  }

  function isPart(candidate: AnimeMeta, partNumber: number) {
    return releaseTitles(candidate).some((title) => {
      const { base, part } = splitTitle(title);
      return (
        matchesTitle([base], baseTitles) &&
        (part === partNumber || (part === null && partNumber === 1))
      );
    });
  }

  function isChapterSpecial(candidate: AnimeMeta, number: number) {
    if (
      candidate.format !== "SPECIAL" ||
      candidate.episodes !== 1 ||
      candidate.status !== "FINISHED"
    )
      return false;
    return releaseTitles(candidate).some((title) => {
      const match = normalizeTitle(title).match(
        /^(.*?) (?:the )?final chapters special (\d+)$/,
      );
      return (
        match &&
        Number(match[2]) === number &&
        matchesTitle([match[1]], baseTitles)
      );
    });
  }

  let first = media;
  for (let index = part - 1; index >= 1; index--) {
    const previous = await adjacent(first, "PREQUEL", (candidate) =>
      isPart(candidate, index),
    );
    if (!previous) return null;
    first = previous;
  }

  let total = 0;
  const totals: number[] = [];
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
    if (index > 1 && offset !== undefined) totals.push(total);
    const next = await adjacent(current, "SEQUEL", (candidate) =>
      isPart(candidate, index + 1),
    );
    if (next === null) return null;
    if (next === undefined) {
      if (offset === undefined || totals.length === 0) return null;

      // Some catalogues append explicitly linked, numbered finale specials to the season.
      let last = current;
      for (let special = 1; special <= 4; special++) {
        const sequel = await adjacent(last, "SEQUEL", (candidate) =>
          isChapterSpecial(candidate, special),
        );
        if (!sequel) break;
        totals.push(++total);
        last = sequel;
      }
      return {
        titles: [...baseTitles, ...providerAliases(first)],
        year: first.seasonYear,
        totals,
        offset,
      };
    }
    current = next;
  }
  return null;
}
