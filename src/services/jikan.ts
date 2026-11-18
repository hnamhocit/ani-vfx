import axios, { type AxiosError, type AxiosInstance } from "axios";
import { CURATED_FRANCHISES, getCuratedAnimeById } from "@/services/franchises";
import type {
  Anime,
  AnimeCharacterItem,
  AnimeEpisode,
  AnimeRecommendationItem,
  AnimeRelationItem,
  AnimeVideosData,
  GenreItem,
  JikanResponse,
} from "@/types/anime";
import {
  getMockEpisodes,
  MOCK_ANIMES,
  MOCK_CHARACTERS,
  MOCK_GENRES,
  MOCK_RECOMMENDATIONS,
  MOCK_VIDEOS,
} from "./mockData";

export const jikanClient: AxiosInstance = axios.create({
  baseURL:
    typeof window === "undefined" ? "https://api.jikan.moe/v4" : "/api/jikan",
  timeout: 10000,
});

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const MIN_REQUEST_SPACING_MS = 480;
let lastRequestTime = 0;

interface QueueItem<T> {
  execute: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

const queue: QueueItem<unknown>[] = [];
let isQueueRunning = false;

async function processQueue() {
  if (isQueueRunning) return;
  isQueueRunning = true;

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;

    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < MIN_REQUEST_SPACING_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, MIN_REQUEST_SPACING_MS - elapsed),
      );
    }

    lastRequestTime = Date.now();

    try {
      const result = await item.execute();
      item.resolve(result);
    } catch (err) {
      item.reject(err);
    }
  }

  isQueueRunning = false;
}

function enqueueRequest<T>(task: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    queue.push({
      execute: task as () => Promise<unknown>,
      resolve: resolve as (value: unknown) => void,
      reject,
    });
    processQueue();
  });
}

function getCacheKey(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const sortedKeys = Object.keys(params).sort();
  const query = sortedKeys
    .map((k) => `${k}=${encodeURIComponent(String(params[k]))}`)
    .join("&");
  return `${url}?${query}`;
}

let lastLiveFailureTime = 0;
const LIVE_FAILURE_COOLDOWN_MS = 10 * 1000;

function dedupeAnimes(animes: Anime[]): Anime[] {
  const seen = new Set<number>();
  return animes.filter((a) => {
    if (!a?.mal_id || seen.has(a.mal_id)) return false;
    seen.add(a.mal_id);
    return true;
  });
}

type MergedParams = Record<string, unknown> & {
  sfw: boolean;
  q?: string;
};

export async function requestWithRateLimit<T>(
  url: string,
  params?: Record<string, unknown>,
  retries = 2,
): Promise<T> {
  const mergedParams: MergedParams = { sfw: true, ...params };
  const cacheKey = getCacheKey(url, mergedParams);

  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as T;
  }

  const existingInFlight = inFlightRequests.get(cacheKey);
  if (existingInFlight) {
    return existingInFlight as Promise<T>;
  }

  const isSearchWithQuery = url === "/anime" && Boolean(mergedParams.q);

  if (
    !isSearchWithQuery &&
    Date.now() - lastLiveFailureTime < LIVE_FAILURE_COOLDOWN_MS
  ) {
    const fastFallback = getFallbackData<T>(url, mergedParams);
    if (fastFallback !== null) {
      cache.set(cacheKey, {
        data: fastFallback,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return fastFallback;
    }
  }

  const requestPromise = enqueueRequest(async () => {
    if (
      !isSearchWithQuery &&
      Date.now() - lastLiveFailureTime < LIVE_FAILURE_COOLDOWN_MS
    ) {
      const fastFallback = getFallbackData<T>(url, mergedParams);
      if (fastFallback !== null) {
        return fastFallback;
      }
    }

    let currentAttempt = 0;
    while (currentAttempt <= retries) {
      try {
        const response = await jikanClient.get<T>(url, {
          params: mergedParams,
        });

        lastLiveFailureTime = 0;

        cache.set(cacheKey, {
          data: response.data,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return response.data;
      } catch (error) {
        const axiosErr = error as AxiosError;

        if (axiosErr.response?.status === 429 && currentAttempt < retries) {
          currentAttempt++;
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }

        const status = axiosErr.response?.status;
        const isTimeout = axiosErr.code === "ECONNABORTED";
        if (!isTimeout && (!status || status >= 500 || status === 429)) {
          lastLiveFailureTime = Date.now();
        }

        const fallback = getFallbackData<T>(url, mergedParams);
        if (fallback !== null) {
          if (!isSearchWithQuery) {
            cache.set(cacheKey, {
              data: fallback,
              expiresAt: Date.now() + CACHE_TTL_MS,
            });
          }
          return fallback;
        }

        throw error;
      }
    }
    throw new Error(`Failed request to ${url} after ${retries} retries`);
  }).finally(() => {
    inFlightRequests.delete(cacheKey);
  });

  inFlightRequests.set(cacheKey, requestPromise);
  return requestPromise;
}

function getFallbackData<T>(
  url: string,
  params: Record<string, unknown>,
): T | null {
  if (url === "/top/anime") {
    const filter = params.filter as string | undefined;
    let list = [...MOCK_ANIMES];
    if (filter === "airing") {
      list = list.filter((a) => a.airing || a.status === "Currently Airing");
    } else if (filter === "upcoming") {
      const filtered = list.filter(
        (a) =>
          a.status === "Upcoming" ||
          (a.year != null && a.year >= 2024) ||
          a.mal_id === 54492 ||
          a.mal_id === 48583 ||
          a.mal_id === 55644,
      );
      list = dedupeAnimes([...filtered, ...MOCK_ANIMES.slice(15, 25)]);
    } else if (filter === "bypopularity") {
      list.sort((a, b) => (a.popularity || 999) - (b.popularity || 999));
    } else if (filter === "favorite") {
      list.sort((a, b) => (b.favorites || 0) - (a.favorites || 0));
    } else {
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    list = dedupeAnimes(list);
    const limit = (params.limit as number) || 25;
    const page = (params.page as number) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return {
      data: paginated,
      pagination: {
        last_visible_page: Math.ceil(list.length / limit) || 1,
        has_next_page: page * limit < list.length,
        current_page: page,
        items: { count: paginated.length, total: list.length, per_page: limit },
      },
    } as unknown as T;
  }

  if (url === "/seasons/now") {
    const airingList = MOCK_ANIMES.filter(
      (a) => a.airing || a.status === "Currently Airing",
    );
    const list = dedupeAnimes(
      airingList.length >= 10 ? airingList : MOCK_ANIMES.slice(0, 15),
    );
    const limit = (params.limit as number) || 25;
    const page = (params.page as number) || 1;
    const paginated = list.slice((page - 1) * limit, page * limit);
    return {
      data: paginated,
      pagination: {
        last_visible_page: Math.ceil(list.length / limit) || 1,
        has_next_page: page * limit < list.length,
        current_page: page,
        items: { count: paginated.length, total: list.length, per_page: limit },
      },
    } as unknown as T;
  }

  if (url === "/schedules") {
    const list = dedupeAnimes(MOCK_ANIMES);
    return {
      data: list,
      pagination: {
        last_visible_page: 1,
        has_next_page: false,
        current_page: 1,
        items: {
          count: list.length,
          total: list.length,
          per_page: 25,
        },
      },
    } as unknown as T;
  }

  if (url === "/anime") {
    const q = (params.q as string | undefined)?.toLowerCase().trim();
    const type = params.type as string | undefined;
    const genres = params.genres as string | undefined;
    const orderBy = params.order_by as string | undefined;
    const sort = params.sort as string | undefined;
    let list = [...MOCK_ANIMES];

    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.title_english?.toLowerCase().includes(q) ||
          a.title_japanese?.toLowerCase().includes(q) ||
          a.synopsis?.toLowerCase().includes(q),
      );
      if (list.length === 0) {
        return null;
      }
    }
    if (type) {
      list = list.filter((a) => a.type?.toLowerCase() === type.toLowerCase());
    }
    if (genres) {
      const genreId = parseInt(genres, 10);
      if (!Number.isNaN(genreId)) {
        list = list.filter((a) => a.genres?.some((g) => g.mal_id === genreId));
      }
    }
    if (orderBy === "score") {
      list.sort((a, b) =>
        sort === "asc"
          ? (a.score || 0) - (b.score || 0)
          : (b.score || 0) - (a.score || 0),
      );
    } else if (orderBy === "popularity") {
      list.sort((a, b) =>
        sort === "desc"
          ? (b.popularity || 999) - (a.popularity || 999)
          : (a.popularity || 999) - (b.popularity || 999),
      );
    } else if (orderBy === "members") {
      list.sort((a, b) =>
        sort === "asc"
          ? (a.members || 0) - (b.members || 0)
          : (b.members || 0) - (a.members || 0),
      );
    }

    list = dedupeAnimes(list);
    const page = (params.page as number) || 1;
    const perPage = (params.limit as number) || 20;
    const paginated = list.slice((page - 1) * perPage, page * perPage);

    return {
      data: paginated,
      pagination: {
        last_visible_page: Math.ceil(list.length / perPage) || 1,
        has_next_page: page * perPage < list.length,
        current_page: page,
        items: {
          count: paginated.length,
          total: list.length,
          per_page: perPage,
        },
      },
    } as unknown as T;
  }

  if (url === "/genres/anime") {
    return { data: MOCK_GENRES } as unknown as T;
  }

  const fullMatch = url.match(/^\/anime\/(\d+)\/full$/);
  if (fullMatch) {
    const id = parseInt(fullMatch[1], 10);
    const found =
      MOCK_ANIMES.find((a) => a.mal_id === id) || getCuratedAnimeById(id);
    if (found) {
      return { data: found } as unknown as T;
    }
    return null;
  }

  const videosMatch = url.match(/^\/anime\/(\d+)\/videos$/);
  if (videosMatch) {
    const id = parseInt(videosMatch[1], 10);
    const curated = getCuratedAnimeById(id);
    const found = MOCK_VIDEOS[id] || {
      promo: curated?.trailer?.youtube_id
        ? [
          {
            title: `${curated.title} Official Trailer`,
            trailer: curated.trailer,
          },
        ]
        : [],
      episodes: [],
      music_videos: [],
    };
    return { data: found } as unknown as T;
  }

  const epMatch = url.match(/^\/anime\/(\d+)\/episodes$/);
  if (epMatch) {
    const id = parseInt(epMatch[1], 10);
    const foundAnime =
      MOCK_ANIMES.find((a) => a.mal_id === id) || getCuratedAnimeById(id);

    if (
      !foundAnime ||
      foundAnime.status === "Not yet aired" ||
      !foundAnime.episodes
    ) {
      return {
        data: [],
        pagination: {
          last_visible_page: 1,
          has_next_page: false,
          current_page: 1,
          items: {
            count: 0,
            total: 0,
            per_page: 20,
          },
        },
      } as unknown as T;
    }

    const total = foundAnime.episodes;
    const page = (params.page as number) || 1;
    return getMockEpisodes(id, total, page, 20) as unknown as T;
  }

  const charMatch = url.match(/^\/anime\/(\d+)\/characters$/);
  if (charMatch) {
    const id = parseInt(charMatch[1], 10);
    if (MOCK_CHARACTERS[id]) {
      return { data: MOCK_CHARACTERS[id] } as unknown as T;
    }

    const targetAnime =
      MOCK_ANIMES.find((a) => a.mal_id === id) || getCuratedAnimeById(id);
    if (targetAnime) {
      const poster =
        targetAnime.images.webp?.large_image_url ||
        targetAnime.images.jpg?.large_image_url ||
        targetAnime.images.jpg?.image_url;
      const fallbackCast: AnimeCharacterItem[] = [
        {
          character: {
            mal_id: targetAnime.mal_id * 10 + 1,
            name: `${targetAnime.title_english || targetAnime.title}`,
            url: targetAnime.url,
            images: {
              jpg: { image_url: poster },
              webp: { image_url: poster, small_image_url: poster },
            },
          },
          role: "Main",
          favorites: Math.round((targetAnime.favorites || 10000) * 0.7),
          voice_actors: [],
        },
      ];
      return { data: fallbackCast } as unknown as T;
    }

    return { data: [] } as unknown as T;
  }

  const recMatch = url.match(/^\/anime\/(\d+)\/recommendations$/);
  if (recMatch) {
    const id = parseInt(recMatch[1], 10);
    const found = MOCK_RECOMMENDATIONS[id] || [];
    return { data: found } as unknown as T;
  }

  const relMatch = url.match(/^\/anime\/(\d+)\/relations$/);
  if (relMatch) {
    const id = parseInt(relMatch[1], 10);
    for (const franchise of CURATED_FRANCHISES) {
      const currentIdx = franchise.seasons.findIndex((s) => s.mal_id === id);
      if (currentIdx !== -1) {
        const relations: AnimeRelationItem[] = [];
        const prequels = franchise.seasons.slice(0, currentIdx);
        const sequels = franchise.seasons.slice(currentIdx + 1);

        if (prequels.length > 0) {
          relations.push({
            relation: "Prequel",
            entry: prequels.map((s) => ({
              mal_id: s.mal_id,
              type: "anime",
              name: s.title,
              url: `https://myanimelist.net/anime/${s.mal_id}`,
            })),
          });
        }
        if (sequels.length > 0) {
          relations.push({
            relation: "Sequel",
            entry: sequels.map((s) => ({
              mal_id: s.mal_id,
              type: "anime",
              name: s.title,
              url: `https://myanimelist.net/anime/${s.mal_id}`,
            })),
          });
        }
        return { data: relations } as unknown as T;
      }
    }

    return { data: [] } as unknown as T;
  }

  return null;
}

export const jikanApi = {
  getTopAnime(params?: {
    filter?: "airing" | "upcoming" | "bypopularity" | "favorite";
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/top/anime", params);
  },

  getSeasonNow(page?: number): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/seasons/now", {
      page,
    });
  },

  getSchedules(day?: string): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/schedules", {
      filter: day,
    });
  },

  searchAnime(params: {
    q?: string;
    genres?: string;
    type?: string;
    order_by?: string;
    sort?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/anime", params);
  },

  getAnimeGenres(): Promise<JikanResponse<GenreItem[]>> {
    return requestWithRateLimit<JikanResponse<GenreItem[]>>("/genres/anime");
  },

  getAnimeFull(id: number): Promise<JikanResponse<Anime>> {
    return requestWithRateLimit<JikanResponse<Anime>>(`/anime/${id}/full`);
  },

  getAnimeVideos(id: number): Promise<JikanResponse<AnimeVideosData>> {
    return requestWithRateLimit<JikanResponse<AnimeVideosData>>(
      `/anime/${id}/videos`,
    );
  },

  getAnimeEpisodes(
    id: number,
    page?: number,
  ): Promise<JikanResponse<AnimeEpisode[]>> {
    return requestWithRateLimit<JikanResponse<AnimeEpisode[]>>(
      `/anime/${id}/episodes`,
      { page },
    );
  },

  getAnimeCharacters(id: number): Promise<JikanResponse<AnimeCharacterItem[]>> {
    return requestWithRateLimit<JikanResponse<AnimeCharacterItem[]>>(
      `/anime/${id}/characters`,
    );
  },

  getAnimeRecommendations(
    id: number,
  ): Promise<JikanResponse<AnimeRecommendationItem[]>> {
    return requestWithRateLimit<JikanResponse<AnimeRecommendationItem[]>>(
      `/anime/${id}/recommendations`,
    );
  },

  getAnimeRelations(id: number): Promise<JikanResponse<AnimeRelationItem[]>> {
    return requestWithRateLimit<JikanResponse<AnimeRelationItem[]>>(
      `/anime/${id}/relations`,
    );
  },
};
