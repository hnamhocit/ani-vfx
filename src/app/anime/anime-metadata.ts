import { notFound } from "next/navigation";
import { cache } from "react";
import type { AniListMediaTitle } from "@/types/anilist";
import { parsePositiveInteger } from "@/utils/anime";

interface AnimeMetadata {
  title?: AniListMediaTitle;
  description?: string | null;
  coverImage?: { extraLarge?: string | null; large?: string | null };
}

interface MetadataResponse {
  data?: { Media?: AnimeMetadata | null };
  errors?: Array<{ status?: number }>;
}

const fetchAnimeMetadata = cache(
  async (id: number): Promise<AnimeMetadata | null | undefined> => {
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query ($id: Int) {
          Media(id: $id, type: ANIME) {
            title { romaji english native }
            description(asHtml: false)
            coverImage { extraLarge large }
          }
        }`,
          variables: { id },
        }),
        next: { revalidate: 3600 },
      });

      if (response.status === 404) return null;
      const result: MetadataResponse = await response.json();
      if (result.data?.Media) return result.data.Media;
      if (result.errors?.some((error) => error.status === 404)) return null;
      if (response.ok && !result.errors?.length && result.data?.Media === null)
        return null;
    } catch {
      return undefined;
    }
  },
);

export async function resolveAnimeRoute(rawId: string) {
  const id = parsePositiveInteger(rawId);
  if (id === null || id > 2_147_483_647) notFound();

  const media = await fetchAnimeMetadata(id);
  if (media === null) notFound();

  return {
    id,
    title: media?.title?.english || media?.title?.romaji || `Anime #${id}`,
    description: media?.description,
    image:
      media?.coverImage?.extraLarge ||
      media?.coverImage?.large ||
      "/og-image.png",
  };
}
