import type { AnimeMeta } from "./anime-metadata";

export function cleanTitle(title: string): string {
  return title
    .replace(/[():[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchCandidates(meta: AnimeMeta): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (raw: string | null) => {
    if (!raw) return;
    const cleaned = cleanTitle(raw);
    if (cleaned && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      candidates.push(cleaned);
    }
  };

  addCandidate(meta.romaji);
  addCandidate(meta.english);
  addCandidate(meta.native);

  for (const c of [...candidates]) {
    const base = c
      .replace(
        /\s*(?:Season\s*\d+|\b[2-4](?:nd|rd|th)\b|\bPart\s*\d+\b).*$/i,
        "",
      )
      .trim();
    if (base && base !== c && !seen.has(base.toLowerCase())) {
      seen.add(base.toLowerCase());
      candidates.push(base);
    }
  }

  return candidates;
}
