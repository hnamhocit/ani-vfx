// AniList GraphQL adapter serving Jikan-compatible responses by idMal
import { type NextRequest, NextResponse } from "next/server";

const ANILIST_ENDPOINT = "https://graphql.anilist.co";

const MAL_GENRE_ID_TO_ANILIST: Record<string, { genre?: string; tag?: string }> = {
  "1": { genre: "Action" },
  "2": { genre: "Adventure" },
  "4": { genre: "Comedy" },
  "8": { genre: "Drama" },
  "10": { genre: "Fantasy" },
  "22": { genre: "Romance" },
  "24": { genre: "Sci-Fi" },
  "36": { genre: "Slice of Life" },
  "37": { genre: "Supernatural" },
  "41": { genre: "Thriller" },
  "62": { tag: "Isekai" },
};

const DEFAULT_GENRES = [
  { mal_id: 1, name: "Action", url: "https://myanimelist.net/anime/genre/1/Action", count: 4700 },
  { mal_id: 2, name: "Adventure", url: "https://myanimelist.net/anime/genre/2/Adventure", count: 3500 },
  { mal_id: 4, name: "Comedy", url: "https://myanimelist.net/anime/genre/4/Comedy", count: 6800 },
  { mal_id: 8, name: "Drama", url: "https://myanimelist.net/anime/genre/8/Drama", count: 2600 },
  { mal_id: 10, name: "Fantasy", url: "https://myanimelist.net/anime/genre/10/Fantasy", count: 5200 },
  { mal_id: 22, name: "Romance", url: "https://myanimelist.net/anime/genre/22/Romance", count: 2100 },
  { mal_id: 24, name: "Sci-Fi", url: "https://myanimelist.net/anime/genre/24/Sci-Fi", count: 3000 },
  { mal_id: 36, name: "Slice of Life", url: "https://myanimelist.net/anime/genre/36/Slice_of_Life", count: 1900 },
  { mal_id: 37, name: "Supernatural", url: "https://myanimelist.net/anime/genre/37/Supernatural", count: 1800 },
  { mal_id: 41, name: "Suspense", url: "https://myanimelist.net/anime/genre/41/Suspense", count: 950 },
  { mal_id: 62, name: "Isekai", url: "https://myanimelist.net/anime/genre/62/Isekai", count: 620 },
];

interface AniListMedia {
  id: number;
  idMal: number | null;
  title: { romaji: string; english: string | null; native: string | null };
  coverImage: { extraLarge: string | null; large: string | null };
  bannerImage: string | null;
  trailer: { id: string; site: string; thumbnail: string | null } | null;
  format: string | null;
  source: string | null;
  episodes: number | null;
  duration: number | null;
  status: string | null;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  description: string | null;
  seasonYear: number | null;
  season: string | null;
  isAdult: boolean;
  nextAiringEpisode: { episode: number; airingAt: number } | null;
  startDate: { year: number | null; month: number | null; day: number | null } | null;
  endDate: { year: number | null; month: number | null; day: number | null } | null;
  genres: string[];
  studios: { nodes: Array<{ id: number; name: string }> };
  characters?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: { full: string };
        image: { large: string | null };
        favourites: number | null;
      };
      voiceActors: Array<{
        id: number;
        name: { full: string };
        languageV2: string;
        image: { large: string | null };
      }>;
    }>;
  };
  recommendations?: {
    nodes: Array<{
      rating: number;
      mediaRecommendation: AniListMedia | null;
    }>;
  };
  relations?: {
    edges: Array<{
      relationType: string;
      node: {
        idMal: number | null;
        type: string;
        title: { romaji: string; english: string | null };
      };
    }>;
  };
}

const MEDIA_CARD_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large }
  bannerImage
  trailer { id site thumbnail }
  format
  source
  episodes
  duration
  status
  averageScore
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
`;

async function queryAniList<T>(query: string, variables: Record<string, unknown>): Promise<T | null> {
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

function mapStatus(status: string | null): string {
  switch (status) {
    case "RELEASING":
      return "Currently Airing";
    case "NOT_YET_RELEASED":
      return "Not yet aired";
    case "FINISHED":
    case "CANCELLED":
    default:
      return "Finished Airing";
  }
}

function mapFormat(format: string | null): string {
  switch (format) {
    case "TV":
    case "TV_SHORT":
      return "TV";
    case "MOVIE":
      return "Movie";
    case "OVA":
      return "OVA";
    case "ONA":
      return "ONA";
    case "SPECIAL":
      return "Special";
    default:
      return format || "TV";
  }
}

function mapSource(source: string | null): string {
  if (!source) return "Manga";
  return source
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function mapMediaToJikan(m: AniListMedia) {
  const malId = m.idMal || m.id;
  const poster = m.coverImage?.extraLarge || m.coverImage?.large || "";
  const ytId = m.trailer?.site === "youtube" ? m.trailer.id : null;
  const maxThumb =
    m.bannerImage ||
    m.trailer?.thumbnail ||
    (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : null);

  return {
    mal_id: malId,
    url: `https://myanimelist.net/anime/${malId}`,
    images: {
      jpg: { image_url: poster, small_image_url: poster, large_image_url: poster },
      webp: { image_url: poster, small_image_url: poster, large_image_url: poster },
    },
    trailer: {
      youtube_id: ytId,
      url: ytId ? `https://www.youtube.com/watch?v=${ytId}` : null,
      embed_url: ytId ? `https://www.youtube.com/embed/${ytId}?autoplay=1` : null,
      images: {
        image_url: ytId ? `https://img.youtube.com/vi/${ytId}/default.jpg` : null,
        small_image_url: ytId ? `https://img.youtube.com/vi/${ytId}/sddefault.jpg` : null,
        medium_image_url: ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null,
        large_image_url: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null,
        maximum_image_url: maxThumb,
      },
    },
    title: m.title.romaji,
    title_english: m.title.english,
    title_japanese: m.title.native,
    type: mapFormat(m.format),
    source: mapSource(m.source),
    episodes: m.episodes,
    status: mapStatus(m.status),
    airing: m.status === "RELEASING",
    aired: {
      from: m.startDate?.year ? `${m.startDate.year}-01-01T00:00:00+00:00` : null,
      to: m.endDate?.year ? `${m.endDate.year}-12-31T00:00:00+00:00` : null,
      string: m.seasonYear ? `${m.season || ""} ${m.seasonYear}`.trim() : "N/A",
    },
    duration: m.duration ? `${m.duration} min per ep` : "24 min per ep",
    rating: m.isAdult ? "Rx - Hentai" : "PG-13 - Teens 13 or older",
    score: m.averageScore ? +(m.averageScore / 10).toFixed(2) : null,
    scored_by: m.popularity,
    rank: null,
    popularity: m.popularity,
    members: m.popularity,
    favorites: m.favourites,
    synopsis: m.description ? m.description.replace(/<[^>]+>/g, "") : null,
    background: null,
    season: m.season ? m.season.toLowerCase() : null,
    year: m.seasonYear,
    studios: (m.studios?.nodes || []).map((s) => ({
      mal_id: s.id,
      type: "anime",
      name: s.name,
      url: `https://myanimelist.net/anime/producer/${s.id}`,
    })),
    genres: (m.genres || []).map((name, idx) => ({
      mal_id: idx + 1,
      type: "anime",
      name,
      url: `https://myanimelist.net/anime/genre/${idx + 1}/${encodeURIComponent(name)}`,
    })),
  };
}

async function handleMediaList(targetPath: string, searchParams: URLSearchParams) {
  const q = searchParams.get("q")?.trim() || undefined;
  const filter = searchParams.get("filter");
  const typeParam = searchParams.get("type")?.toUpperCase();
  const genresParam = searchParams.get("genres");
  const orderBy = searchParams.get("order_by");
  const sortOrder = searchParams.get("sort");
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 24)));

  let sort: string[] = ["POPULARITY_DESC"];
  let status: string | undefined;
  let formatIn: string[] | undefined;
  let genreIn: string[] | undefined;
  let tagIn: string[] | undefined;

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

  if (genresParam) {
    const mapped = MAL_GENRE_ID_TO_ANILIST[genresParam];
    if (mapped?.genre) genreIn = [mapped.genre];
    if (mapped?.tag) tagIn = [mapped.tag];
  }

  const query = `
    query (
      $page: Int,
      $perPage: Int,
      $search: String,
      $status: MediaStatus,
      $formatIn: [MediaFormat],
      $genreIn: [String],
      $tagIn: [String],
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
          tag_in: $tagIn,
          sort: $sort
        ) {
          ${MEDIA_CARD_FIELDS}
        }
      }
    }
  `;

  const data = await queryAniList<{
    Page: {
      pageInfo: { lastPage: number; hasNextPage: boolean; currentPage: number; total: number };
      media: AniListMedia[];
    };
  }>(query, {
    page,
    perPage,
    search: q,
    status,
    formatIn,
    genreIn,
    tagIn,
    sort,
  });

  if (!data?.Page) return null;

  const list = data.Page.media.filter((m) => Boolean(m.idMal)).map(mapMediaToJikan);

  return {
    data: list,
    pagination: {
      last_visible_page: data.Page.pageInfo.lastPage || 1,
      has_next_page: Boolean(data.Page.pageInfo.hasNextPage),
      current_page: data.Page.pageInfo.currentPage || page,
      items: {
        count: list.length,
        total: data.Page.pageInfo.total || list.length,
        per_page: perPage,
      },
    },
  };
}

async function fetchMediaByMalId(idMal: number, extraFields = ""): Promise<AniListMedia | null> {
  const query = `
    query ($idMal: Int) {
      Media(idMal: $idMal, type: ANIME) {
        ${MEDIA_CARD_FIELDS}
        ${extraFields}
      }
    }
  `;

  const data = await queryAniList<{ Media: AniListMedia | null }>(query, { idMal });
  return data?.Media || null;
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
      return NextResponse.json({ data: DEFAULT_GENRES });
    }

    if (["anime", "top/anime", "seasons/now", "schedules"].includes(targetPath)) {
      const result = await handleMediaList(targetPath, searchParams);
      if (result) return NextResponse.json(result);
    }

    const fullMatch = targetPath.match(/^anime\/(\d+)\/full$/);
    if (fullMatch) {
      const id = Number(fullMatch[1]);
      const media = await fetchMediaByMalId(id);
      if (media) {
        return NextResponse.json({ data: mapMediaToJikan(media) });
      }
    }

    const videosMatch = targetPath.match(/^anime\/(\d+)\/videos$/);
    if (videosMatch) {
      const id = Number(videosMatch[1]);
      const media = await fetchMediaByMalId(id);
      const mapped = media ? mapMediaToJikan(media) : null;
      return NextResponse.json({
        data: {
          promo: mapped?.trailer?.youtube_id
            ? [{ title: `${mapped.title} Official Trailer`, trailer: mapped.trailer }]
            : [],
          episodes: [],
          music_videos: [],
        },
      });
    }

    const epMatch = targetPath.match(/^anime\/(\d+)\/episodes$/);
    if (epMatch) {
      const id = Number(epMatch[1]);
      const page = Math.max(1, Number(searchParams.get("page") || 1));
      const perPage = 25;
      const media = await fetchMediaByMalId(id);

      if (!media || media.status === "NOT_YET_RELEASED") {
        return NextResponse.json({
          data: [],
          pagination: {
            last_visible_page: 1,
            has_next_page: false,
            current_page: 1,
            items: { count: 0, total: 0, per_page: perPage },
          },
        });
      }

      const airedCount = media.nextAiringEpisode
        ? Math.max(1, media.nextAiringEpisode.episode - 1)
        : media.episodes || 0;

      const start = (page - 1) * perPage + 1;
      const end = Math.min(start + perPage - 1, airedCount);
      const episodes = [];

      for (let i = start; i <= end; i++) {
        episodes.push({
          mal_id: i,
          url: `https://myanimelist.net/anime/${id}/episode/${i}`,
          title: `Episode ${i}`,
          title_japanese: `第${i}話`,
          title_romanji: `Dai ${i} Wa`,
          aired: null,
          score: media.averageScore ? +(media.averageScore / 10).toFixed(2) : null,
          filler: false,
          recap: false,
          forum_url: null,
        });
      }

      const lastPage = Math.ceil(airedCount / perPage) || 1;
      return NextResponse.json({
        data: episodes,
        pagination: {
          last_visible_page: lastPage,
          has_next_page: page < lastPage,
          current_page: page,
          items: { count: episodes.length, total: airedCount, per_page: perPage },
        },
      });
    }

    const charMatch = targetPath.match(/^anime\/(\d+)\/characters$/);
    if (charMatch) {
      const id = Number(charMatch[1]);
      const media = await fetchMediaByMalId(
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
      );

      const chars = (media?.characters?.edges || []).map((edge) => ({
        character: {
          mal_id: edge.node.id,
          name: edge.node.name.full,
          url: `https://anilist.co/character/${edge.node.id}`,
          images: {
            jpg: { image_url: edge.node.image?.large || "" },
            webp: {
              image_url: edge.node.image?.large || "",
              small_image_url: edge.node.image?.large || "",
            },
          },
        },
        role: edge.role === "MAIN" ? "Main" : "Supporting",
        favorites: edge.node.favourites || 0,
        voice_actors: (edge.voiceActors || []).map((va) => ({
          person: {
            mal_id: va.id,
            name: va.name.full,
            url: `https://anilist.co/staff/${va.id}`,
            images: {
              jpg: { image_url: va.image?.large || "" },
            },
          },
          language: va.languageV2 || "Japanese",
        })),
      }));

      return NextResponse.json({ data: chars });
    }

    const recMatch = targetPath.match(/^anime\/(\d+)\/recommendations$/);
    if (recMatch) {
      const id = Number(recMatch[1]);
      const media = await fetchMediaByMalId(
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
      );

      const recs = (media?.recommendations?.nodes || [])
        .filter((n) => Boolean(n.mediaRecommendation?.idMal))
        .map((n) => {
          const rec = n.mediaRecommendation as AniListMedia;
          const poster = rec.coverImage?.extraLarge || rec.coverImage?.large || "";
          return {
            entry: {
              mal_id: rec.idMal as number,
              url: `https://myanimelist.net/anime/${rec.idMal}`,
              images: {
                jpg: { image_url: poster, small_image_url: poster, large_image_url: poster },
                webp: { image_url: poster, small_image_url: poster, large_image_url: poster },
              },
              title: rec.title.english || rec.title.romaji,
            },
            url: `https://myanimelist.net/recommendations/anime/${id}-${rec.idMal}`,
            votes: Math.max(1, n.rating || 1),
          };
        });

      return NextResponse.json({ data: recs });
    }

    const relMatch = targetPath.match(/^anime\/(\d+)\/relations$/);
    if (relMatch) {
      const id = Number(relMatch[1]);
      const media = await fetchMediaByMalId(
        id,
        `
        relations {
          edges {
            relationType
            node {
              idMal
              type
              title { romaji english }
            }
          }
        }
        `,
      );

      const grouped = new Map<string, Array<{ mal_id: number; type: string; name: string; url: string }>>();

      for (const edge of media?.relations?.edges || []) {
        if (edge.node.type !== "ANIME" || !edge.node.idMal) continue;
        const relLabel = edge.relationType
          .toLowerCase()
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        const list = grouped.get(relLabel) || [];
        list.push({
          mal_id: edge.node.idMal,
          type: "anime",
          name: edge.node.title.english || edge.node.title.romaji,
          url: `https://myanimelist.net/anime/${edge.node.idMal}`,
        });
        grouped.set(relLabel, list);
      }

      const relations = Array.from(grouped.entries()).map(([relation, entry]) => ({
        relation,
        entry,
      }));

      return NextResponse.json({ data: relations });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AniList upstream error" },
      { status: 502 },
    );
  }
}
