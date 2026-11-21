import type { AniListRelationNode, AniListRelationType } from "@/types/anilist";
import type { AnimeReleaseInfo } from "@/utils/anime";
import { queryAniList } from "../anilist/[...path]/graphql";

export interface AnimeMeta extends AnimeReleaseInfo {
  id?: number;
  romaji: string | null;
  english: string | null;
  native: string | null;
  format: string | null;
  seasonYear: number | null;
  neighbors?: { relationType: AniListRelationType; node: AnimeMeta }[];
}

const RELEASE_FIELDS = `id title { romaji english native } episodes status format seasonYear startDate { year }`;
type RawMedia = AniListRelationNode & {
  nextAiringEpisode?: { episode: number } | null;
};

function toMeta(media: RawMedia): AnimeMeta {
  return {
    id: media.id,
    romaji: media.title?.romaji ?? null,
    english: media.title?.english ?? null,
    native: media.title?.native ?? null,
    episodes: media.episodes ?? null,
    nextAiringEpisode: media.nextAiringEpisode,
    status: media.status,
    format: media.format ?? null,
    seasonYear: media.startDate?.year ?? media.seasonYear ?? null,
  };
}

export async function fetchAnimeMeta(id: number): Promise<AnimeMeta | null> {
  try {
    const result = await queryAniList<{
      Media:
        | (RawMedia & {
            relations?: {
              edges?: Array<{
                relationType: AniListRelationType;
                node: RawMedia;
              }>;
            };
          })
        | null;
    }>(
      `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          ${RELEASE_FIELDS}
          nextAiringEpisode { episode }
          relations { edges { relationType node { type ${RELEASE_FIELDS} } } }
        }
      }
    `,
      { id },
    );
    if (result?.Media) {
      return {
        ...toMeta(result.Media),
        neighbors: (result.Media.relations?.edges ?? [])
          .filter(
            ({ relationType, node }) =>
              node.type === "ANIME" &&
              (relationType === "PREQUEL" || relationType === "SEQUEL"),
          )
          .map(({ relationType, node }) => ({
            relationType,
            node: toMeta(node),
          })),
      };
    }
    console.warn("[stream.metadata] AniList metadata unavailable", { id });
  } catch (error) {
    console.warn("[stream.metadata] AniList request failed", {
      id,
      error: error instanceof Error ? error.name : "Unknown error",
    });
  }
  return null;
}
