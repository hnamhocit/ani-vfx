import axios, { type AxiosError, type AxiosInstance } from "axios";
import type { AniListMediaForSeasons } from "@/types/anilist";

const anilistClient: AxiosInstance = axios.create({
  baseURL:
    typeof window === "undefined"
      ? `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/anilist`
      : "/api/anilist",
  timeout: 10000,
});

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MIN_REQUEST_SPACING_MS = 60;
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
      await new Promise((r) => setTimeout(r, MIN_REQUEST_SPACING_MS - elapsed));
    }
    lastRequestTime = Date.now();
    try {
      item.resolve(await item.execute());
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
      resolve: resolve as any,
      reject,
    });
    processQueue();
  });
}

function getCacheKey(url: string, params?: Record<string, unknown>): string {
  if (!params) return url;
  const q = Object.keys(params)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(String(params[k]))}`)
    .join("&");
  return `${url}?${q}`;
}

async function requestWithRateLimit<T>(
  url: string,
  params?: Record<string, unknown>,
  retries = 1,
): Promise<T> {
  const mergedParams = { sfw: true, ...params };
  const cacheKey = getCacheKey(url, mergedParams);

  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) return cached.data as T;

  const existing = inFlightRequests.get(cacheKey);
  if (existing) return existing as Promise<T>;

  const promise = enqueueRequest(async () => {
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const res = await anilistClient.get<T>(url, { params: mergedParams });
        cache.set(cacheKey, {
          data: res.data,
          expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return res.data;
      } catch (error) {
        const axErr = error as AxiosError;
        if (axErr.response?.status === 429 && attempt < retries) {
          attempt++;
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        throw error;
      }
    }
    throw new Error(`Failed: ${url}`);
  }).finally(() => inFlightRequests.delete(cacheKey));

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

interface ApiResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number };
  };
}

export const anilistApi = {
  getTopAnime(params?: {
    filter?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    return requestWithRateLimit<ApiResponse<unknown[]>>("/top/anime", params);
  },

  getSeasonNow(page?: number) {
    return requestWithRateLimit<ApiResponse<unknown[]>>("/seasons/now", {
      page,
    });
  },

  searchAnime(params: {
    q?: string;
    genres?: string;
    type?: string;
    order_by?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    return requestWithRateLimit<ApiResponse<unknown[]>>("/anime", params);
  },

  getAnimeFull(id: number) {
    return requestWithRateLimit<ApiResponse<unknown>>(`/anime/${id}/full`);
  },

  getAnimeEpisodes(id: number) {
    return requestWithRateLimit<ApiResponse<unknown[]>>(
      `/anime/${id}/episodes`,
    );
  },

  getAnimeCharacters(id: number) {
    return requestWithRateLimit<ApiResponse<unknown>>(
      `/anime/${id}/characters`,
    );
  },

  getAnimeRecommendations(id: number) {
    return requestWithRateLimit<ApiResponse<unknown>>(
      `/anime/${id}/recommendations`,
    );
  },

  getAnimeRelations(id: number) {
    return requestWithRateLimit<ApiResponse<AniListMediaForSeasons>>(
      `/anime/${id}/relations`,
    );
  },
};
