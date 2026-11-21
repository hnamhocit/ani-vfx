import { NextResponse } from "next/server";
import { MEDIA_CARD_FIELDS, queryAniList } from "./graphql";

export async function handleMediaList(
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
  const perPage = Math.min(
    50,
    Math.max(1, Number(searchParams.get("limit") || 24)),
  );

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
    return NextResponse.json(
      { error: "AniList query failed" },
      { status: 502 },
    );
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
