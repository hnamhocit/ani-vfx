import type { AnimeMeta } from "./anime-metadata";
import { normalizeTitle, releaseTitles, splitTitle } from "./release-identity";

export function buildSearchCandidates(meta: AnimeMeta): string[] {
  const titles = releaseTitles(meta);
  const candidates = new Map<string, string>();
  for (const title of [
    ...titles,
    ...titles.map((title) => splitTitle(title).base),
  ]) {
    const query = title
      .replace(/[():[\]]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const key = normalizeTitle(query);
    if (key && !candidates.has(key)) candidates.set(key, query);
  }
  return [...candidates.values()];
}
