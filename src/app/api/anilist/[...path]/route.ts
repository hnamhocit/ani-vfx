// AniList GraphQL API Proxy Route
import { type NextRequest, NextResponse } from "next/server";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const MEDIA_CARD_FIELDS = `
  id
  title { romaji english native }
  coverImage { extraLarge large color }
  bannerImage
  trailer { id site thumbnail }
  format
  source
  episodes
  duration
  status
  averageScore
  meanScore
  popularity
  favourites
  description(asHtml: false)
  seasonYear
  season
  isAdult
  nextAiringEpisode { episode airingAt }
  startDate { year month day }
  endDate { year month day }
  genres
  studios(isMain: true) { nodes { id name } }
  rankings { rank type allTime context }
`;

const RELATION_NODE_FIELDS = `
  id
  title { romaji english native }
  type
  format
  status
  seasonYear
  startDate { year month day }
`;

async function queryAniList<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T | null> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;
  const json = await res.json();
  if (json.errors && !json.data) return null;
  return json.data as T;
}

async function handleMediaList(
  targetPath: string,
  searchParams: URLSearchParams,
) {
  const q = searchParams.get("q")?.trim() || undefined;
  const filter = searchParams.get("filter");
  const typeParam = searchParams.get("type")?.toUpperCase();
  const genreParam = searchParams.get("genres");
  const orderBy = searchParams.get("order_by");
  const sortOrder = searchParams.get("sort");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 24)));

  let sort: string[] = ["POPULARITY_DESC"];
  let status: string | undefined;
  let formatIn: string[] | undefined;
  let genreIn: string[] | undefined;

  if (targetPath === "seasons/now" || filter === "airing") {
    status = "RELEASING";
    sort = ["TRENDING_DESC", "POPULARITY_DESC"];
  } else if (filter === "upcoming") {
    status = "NOT_YET_RELEASED";
    sort = ["POPULARITY_DESC"];
  } else if (filter === "favorite") {
    sort = ["FAVOURITES_DESC"];
  } else if (filter === "bypopularity") {
    sort = ["POPULARITY_DESC"];
  } else if (targetPath === "top/anime") {
    sort = ["SCORE_DESC"];
  } else if (q) {
    sort = ["SEARCH_MATCH"];
  } else if (orderBy === "score") {
    sort = [sortOrder === "asc" ? "SCORE" : "SCORE_DESC"];
  } else if (orderBy === "members" || orderBy === "popularity") {
    sort = ["POPULARITY_DESC"];
  }

  if (typeParam === "TV") {
    formatIn = ["TV", "TV_SHORT"];
  } else if (typeParam === "MOVIE") {
    formatIn = ["MOVIE"];
  } else if (typeParam) {
    formatIn = [typeParam];
  }

  if (genreParam) {
    genreIn = [genreParam];
  }

  const query = `
    query (
      $page: Int,
      $perPage: Int,
      $search: String,
      $status: MediaStatus,
      $formatIn: [MediaFormat],
      $genreIn: [String],
      $sort: [MediaSort]
    ) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { lastPage hasNextPage currentPage total }
        media(
          type: ANIME,
          isAdult: false,
          search: $search,
          status: $status,
          format_in: $formatIn,
          genre_in: $genreIn,
          sort: $sort
        ) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const data = await queryAniList<{
    Page: {
      pageInfo: {
        lastPage: number;
        hasNextPage: boolean;
        currentPage: number;
        total: number;
      };
      media: unknown[];
    };
  }>(query, { page, perPage, search: q, status, formatIn, genreIn, sort });

  if (!data?.Page) {
    return NextResponse.json({ error: "AniList query failed" }, { status: 502 });
  }

  return NextResponse.json({
    data: data.Page.media,
    pagination: {
      last_visible_page: data.Page.pageInfo.lastPage || 1,
      has_next_page: Boolean(data.Page.pageInfo.hasNextPage),
      current_page: data.Page.pageInfo.currentPage || page,
      items: {
        count: data.Page.media.length,
        total: data.Page.pageInfo.total || data.Page.media.length,
        per_page: perPage,
      },
    },
  });
}

async function fetchMediaById(id: number, extraFields = "") {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_CARD_FIELDS}
        ${extraFields}
      }
    }
  `;
  const data = await queryAniList<{ Media: unknown | null }>(query, { id });
  return data?.Media ?? null;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const searchParams = req.nextUrl.searchParams;

  try {
    if (targetPath === "genres/anime") {
      const data = await queryAniList<{ GenreCollection: string[] }>(
        `query { GenreCollection }`,
      );
      const genres = (data?.GenreCollection || []).filter((g) => g !== "Hentai");
      return NextResponse.json({ data: genres });
    }

    if (["anime", "top/anime", "seasons/now", "schedules"].includes(targetPath)) {
      return await handleMediaList(targetPath, searchParams);
    }

    const fullMatch = targetPath.match(/^anime\/(\d+)\/full$/);
    if (fullMatch) {
      const id = Number(fullMatch[1]);
      const media = await fetchMediaById(id);
      if (!media) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ data: media });
    }

    const videosMatch = targetPath.match(/^anime\/(\d+)\/videos$/);
    if (videosMatch) {
      const id = Number(videosMatch[1]);
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

    const epMatch = targetPath.match(/^anime\/(\d+)\/episodes$/);
    if (epMatch) {
      const id = Number(epMatch[1]);

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

    const charMatch = targetPath.match(/^anime\/(\d+)\/characters$/);
    if (charMatch) {
      const id = Number(charMatch[1]);
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

    const recMatch = targetPath.match(/^anime\/(\d+)\/recommendations$/);
    if (recMatch) {
      const id = Number(recMatch[1]);
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

    const relMatch = targetPath.match(/^anime\/(\d+)\/relations$/);
    if (relMatch) {
      const rootId = Number(relMatch[1]);
      const ALLOWED_RELS = new Set([
        "PREQUEL",
        "SEQUEL",
        "PARENT",
        "SIDE_STORY",
        "SPIN_OFF",
      ]);

      const visited = new Map<number, any>();
      const collectedEdges: Array<{ relationType: string; node: any }> = [];
      let frontier: number[] = [rootId];

      for (let depth = 0; depth < 3 && frontier.length > 0; depth++) {
        const batchQuery = `
          query ($ids: [Int]) {
            Page(page: 1, perPage: 50) {
              media(id_in: $ids, type: ANIME) {
                ${RELATION_NODE_FIELDS}
                relations {
                  edges {
                    relationType
                    node {
                      ${RELATION_NODE_FIELDS}
                    }
                  }
                }
              }
            }
          }
        `;

        const batchData = await queryAniList<{
          Page?: { media?: any[] };
        }>(batchQuery, { ids: frontier });

        const mediaList = batchData?.Page?.media || [];
        const nextFrontier: number[] = [];

        for (const m of mediaList) {
          if (!visited.has(m.id)) {
            visited.set(m.id, m);
          }

          for (const edge of m.relations?.edges || []) {
            const relType = edge.relationType;
            const target = edge.node;
            if (!target || target.type !== "ANIME" || !ALLOWED_RELS.has(relType)) {
              continue;
            }

            if (!visited.has(target.id)) {
              visited.set(target.id, target);
              if (
                relType === "PREQUEL" ||
                relType === "SEQUEL" ||
                relType === "PARENT"
              ) {
                nextFrontier.push(target.id);
              }
            }

            if (target.id !== rootId) {
              collectedEdges.push({
                relationType: relType,
                node: target,
              });
            }
          }
        }

        frontier = Array.from(new Set(nextFrontier));
      }

      const rootMedia = visited.get(rootId);
      if (!rootMedia) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const uniqueMap = new Map<number, { relationType: string; node: any }>();
      for (const item of collectedEdges) {
        if (!uniqueMap.has(item.node.id)) {
          uniqueMap.set(item.node.id, item);
        }
      }

      const sortedEdges = Array.from(uniqueMap.values()).sort((a, b) => {
        const yearA = a.node.seasonYear ?? a.node.startDate?.year ?? 9999;
        const yearB = b.node.seasonYear ?? b.node.startDate?.year ?? 9999;
        if (yearA !== yearB) return yearA - yearB;
        return a.node.id - b.node.id;
      });

      return NextResponse.json({
        data: {
          id: rootMedia.id,
          title: rootMedia.title,
          format: rootMedia.format,
          seasonYear: rootMedia.seasonYear,
          relations: { edges: sortedEdges },
        },
      });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "AniList upstream error",
      },
      { status: 502 },
    );
  }
}
