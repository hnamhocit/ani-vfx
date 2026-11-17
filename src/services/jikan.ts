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

// Dedicated Axios instance as requested (2500ms timeout for rapid failover to prevent UI freeze)
export const jikanClient: AxiosInstance = axios.create({
  baseURL: "https://api.jikan.moe/v4",
  timeout: 2500,
});

// In-Memory Cache (TTL: 5 minutes)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Rate Limiter / Request Queue
// Throttle outgoing requests to max 2 requests per second (minimum ~450ms spacing)
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

// Live API cooldown tracker (15 seconds cooldown upon server failure/timeout to prevent long lockouts)
let lastLiveFailureTime = 0;
const LIVE_FAILURE_COOLDOWN_MS = 15 * 1000;

// Deduplicate animes by mal_id to eliminate duplicate React key crashes
function dedupeAnimes(animes: Anime[]): Anime[] {
  const seen = new Set<number>();
  return animes.filter((a) => {
    if (!a?.mal_id || seen.has(a.mal_id)) return false;
    seen.add(a.mal_id);
    return true;
  });
}

// Request wrapper with caching, queueing, and 429 backoff retry
export async function requestWithRateLimit<T>(
  url: string,
  params?: Record<string, unknown>,
  retries = 2,
): Promise<T> {
  // Always include sfw: true by default
  const mergedParams = { sfw: true, ...params };
  const cacheKey = getCacheKey(url, mergedParams);

  // Check In-Memory Cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data as T;
  }

  // If live API timed out or failed recently, check if a valid fallback is available
  if (Date.now() - lastLiveFailureTime < LIVE_FAILURE_COOLDOWN_MS) {
    const fastFallback = getFallbackData<T>(url, mergedParams);
    if (fastFallback !== null) {
      cache.set(cacheKey, {
        data: fastFallback,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });
      return fastFallback;
    }
  }

  // Queue and execute with circuit breaker
  return enqueueRequest(async () => {
    // If previous queued request marked live as failed, check if a fallback is available
    if (Date.now() - lastLiveFailureTime < LIVE_FAILURE_COOLDOWN_MS) {
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

        // Successful live request resets failure cooldown
        lastLiveFailureTime = 0;

        // Store in cache upon successful GET
        cache.set(cacheKey, {
          data: response.data,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });

        return response.data;
      } catch (error) {
        const axiosErr = error as AxiosError;

        // Automatic 429 Retry after 1200ms backoff
        if (axiosErr.response?.status === 429 && currentAttempt < retries) {
          currentAttempt++;
          console.warn(
            `[Jikan] 429 Rate Limit hit on ${url}. Retrying after 1200ms... (Attempt ${currentAttempt}/${retries})`,
          );
          await new Promise((resolve) => setTimeout(resolve, 1200));
          continue;
        }

        // Live API failed or timed out: activate cooldown only on 429, 5xx, or network failure (not 404)
        const status = axiosErr.response?.status;
        if (!status || status >= 500 || status === 429) {
          lastLiveFailureTime = Date.now();
        }

        console.info(
          `[Jikan] Live request to ${url} timed out/failed (${axiosErr.message}). Checking targeted fallback data...`,
        );
        const fallback = getFallbackData<T>(url, mergedParams);
        if (fallback !== null) {
          // Cache fallback
          cache.set(cacheKey, {
            data: fallback,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });
          return fallback;
        }

        throw error;
      }
    }
    throw new Error(`Failed request to ${url} after ${retries} retries`);
  });
}

// Fallback provider in case Jikan API is unreachable in restricted environments
function getFallbackData<T>(
  url: string,
  params: Record<string, unknown>,
): T | null {
  // 1. /top/anime
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

  // 2. /seasons/now
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

  // 3. /schedules
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

  // 4. /anime (Search)
  if (url === "/anime") {
    const q = (params.q as string | undefined)?.toLowerCase();
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
          ? (b.popularity || 0) - (a.popularity || 0)
          : (a.popularity || 0) - (b.popularity || 0),
      );
    }

    list = dedupeAnimes(list);
    const page = (params.page as number) || 1;
    const perPage = 20;
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

  // 5. /genres/anime
  if (url === "/genres/anime") {
    return { data: MOCK_GENRES } as unknown as T;
  }

  // 6. /anime/{id}/full
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

  // 7. /anime/{id}/videos
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

  // 8. /anime/{id}/episodes
  const epMatch = url.match(/^\/anime\/(\d+)\/episodes$/);
  if (epMatch) {
    const id = parseInt(epMatch[1], 10);
    const foundAnime =
      MOCK_ANIMES.find((a) => a.mal_id === id) || getCuratedAnimeById(id);

    // If anime is unreleased, has no episodes, or is unknown, NEVER generate fake episodes!
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

  // 9. /anime/{id}/characters
  const charMatch = url.match(/^\/anime\/(\d+)\/characters$/);
  if (charMatch) {
    const id = parseInt(charMatch[1], 10);
    if (MOCK_CHARACTERS[id]) {
      return { data: MOCK_CHARACTERS[id] } as unknown as T;
    }

    // If no specific characters mock, find the anime to construct high-res representative cast
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

  // 10. /anime/{id}/recommendations
  const recMatch = url.match(/^\/anime\/(\d+)\/recommendations$/);
  if (recMatch) {
    const id = parseInt(recMatch[1], 10);
    const found = MOCK_RECOMMENDATIONS[id] || [];
    return { data: found } as unknown as T;
  }

  // 11. /anime/{id}/relations
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

// Typed API Methods as requested:
export const jikanApi = {
  /**
   * Top anime list
   * GET /top/anime
   */
  getTopAnime(params?: {
    filter?: "airing" | "upcoming" | "bypopularity" | "favorite";
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/top/anime", params);
  },

  /**
   * Current season anime
   * GET /seasons/now
   */
  getSeasonNow(page?: number): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/seasons/now", {
      page,
    });
  },

  /**
   * Anime release schedules
   * GET /schedules
   */
  getSchedules(day?: string): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/schedules", {
      filter: day,
    });
  },

  /**
   * Search anime with filters
   * GET /anime
   */
  searchAnime(params: {
    q?: string;
    genres?: string;
    type?: string;
    order_by?: string;
    sort?: "asc" | "desc";
    page?: number;
  }): Promise<JikanResponse<Anime[]>> {
    return requestWithRateLimit<JikanResponse<Anime[]>>("/anime", params);
  },

  /**
   * Anime genres
   * GET /genres/anime
   */
  getAnimeGenres(): Promise<JikanResponse<GenreItem[]>> {
    return requestWithRateLimit<JikanResponse<GenreItem[]>>("/genres/anime");
  },

  /**
   * Full anime details
   * GET /anime/{id}/full
   */
  getAnimeFull(id: number): Promise<JikanResponse<Anime>> {
    return requestWithRateLimit<JikanResponse<Anime>>(`/anime/${id}/full`);
  },

  /**
   * Anime promo videos & trailers
   * GET /anime/{id}/videos
   */
  getAnimeVideos(id: number): Promise<JikanResponse<AnimeVideosData>> {
    return requestWithRateLimit<JikanResponse<AnimeVideosData>>(
      `/anime/${id}/videos`,
    );
  },

  /**
   * Anime episodes
   * GET /anime/{id}/episodes
   */
  getAnimeEpisodes(
    id: number,
    page?: number,
  ): Promise<JikanResponse<AnimeEpisode[]>> {
    return requestWithRateLimit<JikanResponse<AnimeEpisode[]>>(
      `/anime/${id}/episodes`,
      { page },
    );
  },

  /**
   * Anime characters & voice actors
   * GET /anime/{id}/characters
   */
  getAnimeCharacters(id: number): Promise<JikanResponse<AnimeCharacterItem[]>> {
    return requestWithRateLimit<JikanResponse<AnimeCharacterItem[]>>(
      `/anime/${id}/characters`,
    );
  },

  /**
   * Anime user recommendations
   * GET /anime/{id}/recommendations
   */
  getAnimeRecommendations(
    id: number,
  ): Promise<JikanResponse<AnimeRecommendationItem[]>> {
    return requestWithRateLimit<JikanResponse<AnimeRecommendationItem[]>>(
      `/anime/${id}/recommendations`,
    );
  },

  /**
   * Anime relations / seasons
   * GET /anime/{id}/relations
   */
  getAnimeRelations(id: number): Promise<JikanResponse<AnimeRelationItem[]>> {
    return requestWithRateLimit<JikanResponse<AnimeRelationItem[]>>(
      `/anime/${id}/relations`,
    );
  },
};
