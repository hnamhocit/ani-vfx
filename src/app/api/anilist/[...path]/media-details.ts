import { NextResponse } from "next/server";
import { fetchMediaById, MEDIA_CARD_FIELDS } from "./graphql";

export async function getFull(id: number) {
  const media = await fetchMediaById(id, "externalLinks { site url type }");
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ data: media });
}

export async function getVideos(id: number) {
  const media = (await fetchMediaById(id)) as {
    trailer?: { id: string; site: string; thumbnail: string | null } | null;
    title?: { romaji: string };
  } | null;

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ytId = media.trailer?.site === "youtube" ? media.trailer.id : null;

  return NextResponse.json({
    data: {
      promo: ytId
        ? [
            {
              title: `${media.title?.romaji ?? ""} Official Trailer`,
              trailer: {
                youtube_id: ytId,
                url: `https://www.youtube.com/watch?v=${ytId}`,
                embed_url: `https://www.youtube.com/embed/${ytId}?autoplay=1`,
              },
            },
          ]
        : [],
      episodes: [],
      music_videos: [],
    },
  });
}

export async function getCharacters(id: number) {
  const media = (await fetchMediaById(
    id,
    `
    characters(sort: [ROLE, RELEVANCE, ID], perPage: 18) {
      edges {
        role
        node {
          id
          name { full }
          image { large }
          favourites
        }
        voiceActors(language: JAPANESE, sort: [RELEVANCE, ID]) {
          id
          name { full }
          languageV2
          image { large }
        }
      }
    }
    `,
  )) as { characters?: unknown } | null;

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: media.characters ?? { edges: [] } });
}

export async function getRecommendations(id: number) {
  const media = (await fetchMediaById(
    id,
    `
    recommendations(sort: [RATING_DESC], perPage: 15) {
      nodes {
        rating
        mediaRecommendation {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
    `,
  )) as { recommendations?: unknown } | null;

  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: media.recommendations ?? { nodes: [] },
  });
}
