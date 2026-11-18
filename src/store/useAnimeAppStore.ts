import { create } from "zustand";
import type { Anime, SavedAnimeItem } from "@/types/anime";

export interface TrailerModalState {
  isOpen: boolean;
  title: string;
  youtubeId?: string | null;
  embedUrl?: string | null;
}

const STORAGE_KEYS = {
  WATCHLIST: "mal_watchlist_v1",
  HISTORY: "mal_history_v1",
  WATCHED_EPISODES: "mal_watched_episodes_v1",
};

function toSavedItem(anime: Anime | SavedAnimeItem): SavedAnimeItem {
  if ("timestamp" in anime) {
    return { ...anime, timestamp: Date.now() };
  }
  return {
    mal_id: anime.mal_id,
    title: anime.title,
    title_english: anime.title_english,
    image_url:
      anime.images.webp?.large_image_url ||
      anime.images.jpg?.large_image_url ||
      anime.images.jpg?.image_url,
    score: anime.score,
    type: anime.type,
    year: anime.year,
    episodes: anime.episodes,
    timestamp: Date.now(),
  };
}

function persistStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

interface AnimeAppState {
  watchlist: SavedAnimeItem[];
  history: SavedAnimeItem[];
  watchedEpisodes: Record<number, number[]>;
  isHydrated: boolean;

  isDrawerOpen: boolean;
  drawerTab: "watchlist" | "history";
  trailerModal: TrailerModalState;
  isSearchModalOpen: boolean;

  hydrateFromStorage: () => void;

  isBookmarked: (mal_id: number) => boolean;
  toggleBookmark: (anime: Anime | SavedAnimeItem) => void;
  removeFromWatchlist: (mal_id: number) => void;

  addToHistory: (anime: Anime | SavedAnimeItem) => void;
  removeFromHistory: (mal_id: number) => void;
  clearHistory: () => void;

  isEpisodeWatched: (animeId: number, epNumber: number) => boolean;
  toggleEpisodeWatched: (animeId: number, epNumber: number) => void;
  markAllEpisodesWatched: (animeId: number, epNumbers: number[]) => void;
  unmarkAllEpisodesWatched: (animeId: number) => void;
  getWatchedCount: (animeId: number) => number;

  openDrawer: (initialTab?: "watchlist" | "history") => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: "watchlist" | "history") => void;

  openTrailerModal: (
    title: string,
    youtubeId?: string | null,
    embedUrl?: string | null,
  ) => void;
  closeTrailerModal: () => void;

  openSearchModal: () => void;
  closeSearchModal: () => void;
  toggleSearchModal: () => void;
}

export const useAnimeAppStore = create<AnimeAppState>((set, get) => ({
  watchlist: [],
  history: [],
  watchedEpisodes: {},
  isHydrated: false,

  isDrawerOpen: false,
  drawerTab: "watchlist",
  trailerModal: {
    isOpen: false,
    title: "",
    youtubeId: null,
    embedUrl: null,
  },
  isSearchModalOpen: false,

  hydrateFromStorage: () => {
    if (typeof window === "undefined" || get().isHydrated) return;
    try {
      const savedWatchlist = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      const savedWatched = localStorage.getItem(STORAGE_KEYS.WATCHED_EPISODES);

      set({
        watchlist: savedWatchlist ? JSON.parse(savedWatchlist) : [],
        history: savedHistory ? JSON.parse(savedHistory) : [],
        watchedEpisodes: savedWatched ? JSON.parse(savedWatched) : {},
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  isBookmarked: (mal_id) =>
    get().watchlist.some((item) => item.mal_id === mal_id),

  toggleBookmark: (anime) =>
    set((state) => {
      const exists = state.watchlist.some(
        (item) => item.mal_id === anime.mal_id,
      );
      const updated = exists
        ? state.watchlist.filter((item) => item.mal_id !== anime.mal_id)
        : [
          toSavedItem(anime),
          ...state.watchlist.filter((w) => w.mal_id !== anime.mal_id),
        ];
      persistStorage(STORAGE_KEYS.WATCHLIST, updated);
      return { watchlist: updated };
    }),

  removeFromWatchlist: (mal_id) =>
    set((state) => {
      const updated = state.watchlist.filter((item) => item.mal_id !== mal_id);
      persistStorage(STORAGE_KEYS.WATCHLIST, updated);
      return { watchlist: updated };
    }),

  addToHistory: (anime) =>
    set((state) => {
      const item = toSavedItem(anime);
      const updated = [
        item,
        ...state.history.filter((h) => h.mal_id !== anime.mal_id),
      ].slice(0, 30);
      persistStorage(STORAGE_KEYS.HISTORY, updated);
      return { history: updated };
    }),

  removeFromHistory: (mal_id) =>
    set((state) => {
      const updated = state.history.filter((item) => item.mal_id !== mal_id);
      persistStorage(STORAGE_KEYS.HISTORY, updated);
      return { history: updated };
    }),

  clearHistory: () => {
    persistStorage(STORAGE_KEYS.HISTORY, []);
    set({ history: [] });
  },

  isEpisodeWatched: (animeId, epNumber) =>
    Boolean(get().watchedEpisodes[animeId]?.includes(epNumber)),

  toggleEpisodeWatched: (animeId, epNumber) =>
    set((state) => {
      const current = state.watchedEpisodes[animeId] || [];
      const exists = current.includes(epNumber);
      const updated = exists
        ? current.filter((num) => num !== epNumber)
        : [...current, epNumber];
      const next = { ...state.watchedEpisodes, [animeId]: updated };
      persistStorage(STORAGE_KEYS.WATCHED_EPISODES, next);
      return { watchedEpisodes: next };
    }),

  markAllEpisodesWatched: (animeId, epNumbers) =>
    set((state) => {
      const next = {
        ...state.watchedEpisodes,
        [animeId]: Array.from(
          new Set([...(state.watchedEpisodes[animeId] || []), ...epNumbers]),
        ),
      };
      persistStorage(STORAGE_KEYS.WATCHED_EPISODES, next);
      return { watchedEpisodes: next };
    }),

  unmarkAllEpisodesWatched: (animeId) =>
    set((state) => {
      const copy = { ...state.watchedEpisodes };
      delete copy[animeId];
      persistStorage(STORAGE_KEYS.WATCHED_EPISODES, copy);
      return { watchedEpisodes: copy };
    }),

  getWatchedCount: (animeId) => get().watchedEpisodes[animeId]?.length || 0,

  openDrawer: (initialTab = "watchlist") =>
    set({ drawerTab: initialTab, isDrawerOpen: true }),

  closeDrawer: () => set({ isDrawerOpen: false }),

  setDrawerTab: (tab) => set({ drawerTab: tab }),

  openTrailerModal: (title, youtubeId = null, embedUrl = null) =>
    set({
      trailerModal: {
        isOpen: true,
        title,
        youtubeId,
        embedUrl,
      },
    }),

  closeTrailerModal: () =>
    set({
      trailerModal: {
        isOpen: false,
        title: "",
        youtubeId: null,
        embedUrl: null,
      },
    }),

  openSearchModal: () => set({ isSearchModalOpen: true }),

  closeSearchModal: () => set({ isSearchModalOpen: false }),

  toggleSearchModal: () =>
    set((state) => ({ isSearchModalOpen: !state.isSearchModalOpen })),
}));
