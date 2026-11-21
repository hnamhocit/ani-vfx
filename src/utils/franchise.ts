import type { AniListRelationNode, AniListRelationType } from "@/types/anilist";

export const FRANCHISE_RELATIONS = new Set<AniListRelationType>([
  "PREQUEL",
  "SEQUEL",
  "PARENT",
  "SIDE_STORY",
  "SPIN_OFF",
]);

export function compareReleases(
  a: AniListRelationNode,
  b: AniListRelationNode,
) {
  const year =
    (a.startDate?.year ?? a.seasonYear ?? 9999) -
    (b.startDate?.year ?? b.seasonYear ?? 9999);
  return (
    year ||
    (a.startDate?.month ?? 13) - (b.startDate?.month ?? 13) ||
    (a.startDate?.day ?? 32) - (b.startDate?.day ?? 32) ||
    a.id - b.id
  );
}

// A story prequel can have a later premiere. Keep release order when both dates prove it.
export function compareKnownReleaseDates(
  a: AniListRelationNode,
  b: AniListRelationNode,
) {
  const yearA = a.startDate?.year ?? a.seasonYear;
  const yearB = b.startDate?.year ?? b.seasonYear;
  if (yearA == null || yearB == null) return 0;
  if (yearA !== yearB) return yearA - yearB;

  const monthA = a.startDate?.month;
  const monthB = b.startDate?.month;
  if (monthA == null || monthB == null) return 0;
  if (monthA !== monthB) return monthA - monthB;

  const dayA = a.startDate?.day;
  const dayB = b.startDate?.day;
  return dayA != null && dayB != null ? dayA - dayB : 0;
}
