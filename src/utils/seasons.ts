import type {
  AniListMediaForSeasons,
  AniListRelationNode,
  AniListRelationType,
  AnimeSeasonItem,
} from "@/types/anilist";
import { compareReleases, FRANCHISE_RELATIONS } from "./franchise";

export function buildAnimeSeasons(
  media: AniListMediaForSeasons | null,
  isCurrentUnreleased = false,
): AnimeSeasonItem[] {
  if (!media) return [];
  const entries = new Map<
    number,
    { node: AniListRelationNode; relationType: AniListRelationType }
  >([[media.id, { node: media, relationType: "PARENT" }]]);
  for (const { node, relationType } of media.relations?.edges ?? []) {
    if (
      !relationType ||
      !FRANCHISE_RELATIONS.has(relationType) ||
      node.type === "MANGA" ||
      entries.has(node.id)
    )
      continue;
    entries.set(node.id, { node, relationType });
  }
  const positions = new Map(media.watchOrder?.map((id, index) => [id, index]));
  return [...entries.values()]
    .sort(
      (a, b) =>
        (positions.get(a.node.id) ?? Infinity) -
          (positions.get(b.node.id) ?? Infinity) ||
        compareReleases(a.node, b.node),
    )
    .map(({ node, relationType }) => ({
      id: node.id,
      title:
        node.title.english ||
        node.title.romaji ||
        node.title.native ||
        "Unknown Title",
      relationType,
      mediaFormat: node.format,
      isCurrent: node.id === media.id,
      unreleased:
        node.status === "NOT_YET_RELEASED" ||
        (node.id === media.id && isCurrentUnreleased),
      year: node.startDate?.year ?? node.seasonYear ?? null,
      episodes: node.episodes,
      coverImage: node.coverImage?.medium || node.coverImage?.large || null,
    }));
}
