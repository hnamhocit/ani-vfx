import { NextResponse } from "next/server";
import { type AnimeReleaseInfo, getReleasedEpisodeCount } from "@/utils/anime";
import {
  contiguousEpisodeCount,
  episodeNumber,
  listAnimeEpisodes,
} from "@/utils/episodes";
import { queryAniList } from "./graphql";

interface EpisodeMedia extends AnimeReleaseInfo {
  streamingEpisodes?: Array<{ title?: string | null } | null> | null;
}

export async function getEpisodes(id: number) {
  const result = await queryAniList<{ Media?: EpisodeMedia | null }>(
    `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        status
        episodes
        nextAiringEpisode { episode }
        streamingEpisodes { title }
      }
    }
  `,
    { id },
  );

  if (!result?.Media) {
    console.warn("[anilist.episodes] Missing media", { id });
    return NextResponse.json(
      { error: "Episode metadata unavailable" },
      { status: result ? 404 : 502 },
    );
  }

  const media = result.Media;
  const released = getReleasedEpisodeCount(media);
  const numbers = (media.streamingEpisodes ?? [])
    .map((entry) => episodeNumber(entry?.title))
    .filter((number): number is number => number !== null);
  const declared = media.episodes;
  const highestListed = numbers.reduce(
    (max, number) => Math.max(max, number),
    0,
  );

  if (released !== null && highestListed > released) {
    console.warn("[anilist.episodes] Streaming list exceeds media count", {
      id,
      released,
      declared,
      highestListed,
      listedEntries: numbers.length,
    });
  }
  const fallback = Math.min(
    contiguousEpisodeCount(numbers),
    Number.isSafeInteger(declared) && declared && declared > 0
      ? declared
      : Infinity,
  );
  if (released === null) {
    console.warn(
      "[anilist.episodes] Using numbered streaming entries as fallback",
      {
        id,
        status: media.status,
        declared,
        fallback,
      },
    );
  }
  // Streaming titles can belong to another season; only their numbering is a fallback.
  const data = listAnimeEpisodes({
    status: "FINISHED",
    episodes: released ?? fallback,
  });
  return NextResponse.json({
    data,
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: { count: data.length, total: data.length, per_page: data.length },
    },
  });
}
