import { NextResponse } from "next/server";
import { fetchMediaById } from "./graphql";

export async function getEpisodes(id: number) {
  const media = (await fetchMediaById(
    id,
    `streamingEpisodes { title thumbnail }`,
  )) as {
    status?: string;
    episodes?: number | null;
    nextAiringEpisode?: { episode: number } | null;
    streamingEpisodes?: Array<{
      title: string | null;
      thumbnail: string | null;
    }>;
  } | null;

  if (!media || media.status === "NOT_YET_RELEASED") {
    return NextResponse.json({
      data: [],
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: { count: 0, total: 0, per_page: 0 },
      },
    });
  }

  const streamed = media.streamingEpisodes || [];
  let maxStreamedEp = 0;
  for (const item of streamed) {
    const match = item.title?.match(/(?:Episode|Ep\.?|Tập)\s*(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxStreamedEp) maxStreamedEp = num;
    }
  }

  const airedCount = Math.max(
    media.nextAiringEpisode ? media.nextAiringEpisode.episode - 1 : 0,
    media.episodes || 0,
    maxStreamedEp,
    streamed.length,
  );

  const episodes = Array.from({ length: airedCount }, (_, idx) => {
    const epNum = idx + 1;
    return {
      id: epNum,
      title: `Tập ${epNum}`,
    };
  });

  return NextResponse.json({
    data: episodes,
    pagination: {
      last_visible_page: 1,
      has_next_page: false,
      current_page: 1,
      items: {
        count: episodes.length,
        total: airedCount,
        per_page: airedCount,
      },
    },
  });
}
