import type { AnimeMeta } from "./anime-metadata";

export function normalizeTitle(title: string) {
  return title
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .replace(/\s*\((?:19|20)\d{2}\)\s*$/, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim()
    .replace(/\b(\d+)(?:st|nd|rd|th) season\b/g, "season $1")
    .replace(/\b(season|part|cour) 0+(\d+)\b/g, "$1 $2");
}

export function releaseTitles(media: AnimeMeta) {
  return [media.romaji, media.english, media.native].filter(
    (title): title is string => Boolean(title),
  );
}

export function matchesTitle(
  titles: readonly string[],
  expected: readonly string[],
) {
  const canonical = new Set(expected.map(normalizeTitle).filter(Boolean));
  return titles.some((title) => canonical.has(normalizeTitle(title)));
}

export function splitTitle(title: string) {
  const match = title.match(
    /^(.*?)\s*[(\[]?\s*(?:part|cour)\s*\.?\s*(\d+)\s*[)\]]?\s*$/i,
  );
  return match?.[1]?.trim() && Number(match[2]) > 0
    ? { base: match[1].trim(), part: Number(match[2]) }
    : { base: title, part: null };
}
