import { create } from "zustand";

export interface TrailerModalState {
  isOpen: boolean;
  title: string;
  youtubeId?: string | null;
  embedUrl?: string | null;
}

export interface SavedAnimeItem {
  id: number;
  title: string;
  titleEnglish?: string | null;
  coverImage: string;
  score?: number | null;
  format?: string | null;
  year?: number | null;
  episodes?: number | null;
  timestamp: number;
}

export interface AnimeInput {
  id: number;
  title?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  };
  coverImage?: {
    extraLarge?: string | null;
    large?: string | null;
  };
  averageScore?: number | null;
  format?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
}

const STORAGE_KEYS = {
  WATCHLIST: "anilist_watchlist_v1",
  HISTORY: "anilist_history_v1",
  WATCHED_EPISODES: "anilist_watched_episodes_v1",
};

function toSavedItem(anime: AnimeInput | SavedAnimeItem): SavedAnimeItem {
  if ("timestamp" in anime && typeof anime.coverImage === "string") {
    return { ...anime, timestamp: Date.now() };
  }
  const a = anime as AnimeInput;
  return {
    id: a.id,
    title: a.title?.romaji || a.title?.english || "Unknown",
    titleEnglish: a.title?.english ?? null,
    coverImage: a.coverImage?.extraLarge || a.coverImage?.large || "",
    score: a.averageScore ? +(a.averageScore / 10).toFixed(2) : null,
    format: a.format ?? null,
    year: a.seasonYear ?? null,
    episodes: a.episodes ?? null,
    timestamp: Date.now(),
  };
}

function persistStorage(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { }
}

// One-time migration từ key cũ mal_* sang anilist_*
function migrateOldKeys() {
  if (typeof window === "undefined") return;
  const map: Record<string, string> = {
    mal_watchlist_v1: STORAGE_KEYS.WATCHLIST,
    mal_history_v1: STORAGE_KEYS.HISTORY,
    mal_watched_episodes_v1: STORAGE_KEYS.WATCHED_EPISODES,
  };
  for (const [oldKey, newKey] of Object.entries(map)) {
    const raw = localStorage.getItem(oldKey);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const migrated = Array.isArray(parsed)
        ? parsed.map((item: any) => ({
          ...item,
          id: item.id ?? item.mal_id,
          coverImage: item.coverImage ?? item.image_url ?? "",
          titleEnglish: item.titleEnglish ?? item.title_english,
        }))
        : parsed;
      localStorage.setItem(newKey, JSON.stringify(migrated));
    } catch { }
    localStorage.removeItem(oldKey);
  }
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
  isBookmarked: (id: number) => boolean;
  toggleBookmark: (anime: AnimeInput | SavedAnimeItem) => void;
  removeFromWatchlist: (id: number) => void;
  addToHistory: (anime: AnimeInput | SavedAnimeItem) => void;
  removeFromHistory: (id: number) => void;
  clearHistory: () => void;
  isEpisodeWatched: (animeId: number, epNumber: number) => boolean;
  toggleEpisodeWatched: (animeId: number, epNumber: number) => void;
  markAllEpisodesWatched: (animeId: number, epNumbers: number[]) => void;
  unmarkAllEpisodesWatched: (animeId: number) => void;
  getWatchedCount: (animeId: number) => number;
  openDrawer: (initialTab?: "watchlist" | "history") => void;
  closeDrawer: () => void;
  setDrawerTab: (tab: "watchlist" | "history") => void;
  openTrailerModal: (title: string, youtubeId?: string | null, embedUrl?: string | null) => void;
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
  trailerModal: { isOpen: false, title: "", youtubeId: null, embedUrl: null },
  isSearchModalOpen: false,

  hydrateFromStorage: () => {
    if (typeof window === "undefined" || get().isHydrated) return;
    migrateOldKeys();
    try {
      set({
        watchlist: JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || "[]"),
        history: JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || "[]"),
        watchedEpisodes: JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHED_EPISODES) || "{}"),
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  isBookmarked: (id) => get().watchlist.some((item) => item.id === id),

  toggleBookmark: (anime) =>
    set((state) => {
      const item = toSavedItem(anime);
      const exists = state.watchlist.some((w) => w.id === item.id);
      const updated = exists
        ? state.watchlist.filter((w) => w.id !== item.id)
        : [item, ...state.watchlist.filter((w) => w.id !== item.id)];
      persistStorage(STORAGE_KEYS.WATCHLIST, updated);
      return { watchlist: updated };
    }),

  removeFromWatchlist: (id) =>
    set((state) => {
      const updated = state.watchlist.filter((item) => item.id !== id);
      persistStorage(STORAGE_KEYS.WATCHLIST, updated);
      return { watchlist: updated };
    }),

  addToHistory: (anime) =>
    set((state) => {
      const item = toSavedItem(anime);
      const updated = [item, ...state.history.filter((h) => h.id !== item.id)].slice(0, 30);
      persistStorage(STORAGE_KEYS.HISTORY, updated);
      return { history: updated };
    }),

  removeFromHistory: (id) =>
    set((state) => {
      const updated = state.history.filter((item) => item.id !== id);
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
      const updated = current.includes(epNumber)
        ? current.filter((n) => n !== epNumber)
        : [...current, epNumber];
      const next = { ...state.watchedEpisodes, [animeId]: updated };
      persistStorage(STORAGE_KEYS.WATCHED_EPISODES, next);
      return { watchedEpisodes: next };
    }),

  markAllEpisodesWatched: (animeId, epNumbers) =>
    set((state) => {
      const next = {
        ...state.watchedEpisodes,
        [animeId]: Array.from(new Set([...(state.watchedEpisodes[animeId] || []), ...epNumbers])),
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

  openDrawer: (initialTab = "watchlist") => set({ drawerTab: initialTab, isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  setDrawerTab: (tab) => set({ drawerTab: tab }),

  openTrailerModal: (title, youtubeId = null, embedUrl = null) =>
    set({ trailerModal: { isOpen: true, title, youtubeId, embedUrl } }),
  closeTrailerModal: () =>
    set({ trailerModal: { isOpen: false, title: "", youtubeId: null, embedUrl: null } }),

  openSearchModal: () => set({ isSearchModalOpen: true }),
  closeSearchModal: () => set({ isSearchModalOpen: false }),
  toggleSearchModal: () => set((s) => ({ isSearchModalOpen: !s.isSearchModalOpen })),
}));
