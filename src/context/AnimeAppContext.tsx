"use client";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Anime, SavedAnimeItem } from "@/types/anime";

interface TrailerModalState {
  isOpen: boolean;
  title: string;
  youtubeId?: string | null;
  embedUrl?: string | null;
}

interface AnimeAppContextType {
  // Watchlist
  watchlist: SavedAnimeItem[];
  isBookmarked: (mal_id: number) => boolean;
  toggleBookmark: (anime: Anime | SavedAnimeItem) => void;
  removeFromWatchlist: (mal_id: number) => void;

  // History
  history: SavedAnimeItem[];
  addToHistory: (anime: Anime | SavedAnimeItem) => void;
  removeFromHistory: (mal_id: number) => void;
  clearHistory: () => void;

  // Episode Watch Tracking
  watchedEpisodes: Record<number, number[]>;
  isEpisodeWatched: (animeId: number, epNumber: number) => boolean;
  toggleEpisodeWatched: (animeId: number, epNumber: number) => void;
  markAllEpisodesWatched: (animeId: number, epNumbers: number[]) => void;
  unmarkAllEpisodesWatched: (animeId: number) => void;
  getWatchedCount: (animeId: number) => number;

  // Drawer
  isDrawerOpen: boolean;
  openDrawer: (initialTab?: "watchlist" | "history") => void;
  closeDrawer: () => void;
  drawerTab: "watchlist" | "history";
  setDrawerTab: (tab: "watchlist" | "history") => void;

  // Global Trailer Modal
  trailerModal: TrailerModalState;
  openTrailerModal: (
    title: string,
    youtubeId?: string | null,
    embedUrl?: string | null,
  ) => void;
  closeTrailerModal: () => void;

  // Global Search Modal
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

const AnimeAppContext = createContext<AnimeAppContextType | undefined>(
  undefined,
);

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

export function AnimeAppProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<SavedAnimeItem[]>([]);
  const [history, setHistory] = useState<SavedAnimeItem[]>([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState<
    Record<number, number[]>
  >({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"watchlist" | "history">(
    "watchlist",
  );

  const [trailerModal, setTrailerModal] = useState<TrailerModalState>({
    isOpen: false,
    title: "",
    youtubeId: null,
    embedUrl: null,
  });

  // Hydrate from localStorage once on client
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));

      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      const savedWatched = localStorage.getItem(STORAGE_KEYS.WATCHED_EPISODES);
      if (savedWatched) setWatchedEpisodes(JSON.parse(savedWatched));
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
  }, []);

  const isBookmarked = useCallback(
    (mal_id: number) => {
      return watchlist.some((item) => item.mal_id === mal_id);
    },
    [watchlist],
  );

  const toggleBookmark = useCallback((anime: Anime | SavedAnimeItem) => {
    setWatchlist((prev) => {
      const exists = prev.some((item) => item.mal_id === anime.mal_id);
      let updated: SavedAnimeItem[];
      if (exists) {
        updated = prev.filter((item) => item.mal_id !== anime.mal_id);
      } else {
        const item = toSavedItem(anime);
        updated = [item, ...prev.filter((w) => w.mal_id !== anime.mal_id)];
      }
      try {
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save watchlist:", e);
      }
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((mal_id: number) => {
    setWatchlist((prev) => {
      const updated = prev.filter((item) => item.mal_id !== mal_id);
      try {
        localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save watchlist:", e);
      }
      return updated;
    });
  }, []);

  // Stable callback: Functional updater ensures addToHistory NEVER changes identity across renders
  const addToHistory = useCallback((anime: Anime | SavedAnimeItem) => {
    setHistory((prev) => {
      const item = toSavedItem(anime);
      const updated = [
        item,
        ...prev.filter((h) => h.mal_id !== anime.mal_id),
      ].slice(0, 30);
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((mal_id: number) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.mal_id !== mal_id);
      try {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  }, []);

  const isEpisodeWatched = useCallback(
    (animeId: number, epNumber: number) => {
      return Boolean(watchedEpisodes[animeId]?.includes(epNumber));
    },
    [watchedEpisodes],
  );

  const toggleEpisodeWatched = useCallback(
    (animeId: number, epNumber: number) => {
      setWatchedEpisodes((prev) => {
        const current = prev[animeId] || [];
        const exists = current.includes(epNumber);
        const updated = exists
          ? current.filter((num) => num !== epNumber)
          : [...current, epNumber];
        const next = { ...prev, [animeId]: updated };
        try {
          localStorage.setItem(
            STORAGE_KEYS.WATCHED_EPISODES,
            JSON.stringify(next),
          );
        } catch (e) {
          console.error("Failed to save watched episodes:", e);
        }
        return next;
      });
    },
    [],
  );

  const markAllEpisodesWatched = useCallback(
    (animeId: number, epNumbers: number[]) => {
      setWatchedEpisodes((prev) => {
        const next = {
          ...prev,
          [animeId]: Array.from(
            new Set([...(prev[animeId] || []), ...epNumbers]),
          ),
        };
        try {
          localStorage.setItem(
            STORAGE_KEYS.WATCHED_EPISODES,
            JSON.stringify(next),
          );
        } catch (e) {
          console.error("Failed to save watched episodes:", e);
        }
        return next;
      });
    },
    [],
  );

  const unmarkAllEpisodesWatched = useCallback((animeId: number) => {
    setWatchedEpisodes((prev) => {
      const copy = { ...prev };
      delete copy[animeId];
      try {
        localStorage.setItem(
          STORAGE_KEYS.WATCHED_EPISODES,
          JSON.stringify(copy),
        );
      } catch (e) {
        console.error("Failed to unmark all episodes:", e);
      }
      return copy;
    });
  }, []);

  const getWatchedCount = useCallback(
    (animeId: number) => {
      return watchedEpisodes[animeId]?.length || 0;
    },
    [watchedEpisodes],
  );

  const openDrawer = useCallback(
    (initialTab: "watchlist" | "history" = "watchlist") => {
      setDrawerTab(initialTab);
      setIsDrawerOpen(true);
    },
    [],
  );

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const openTrailerModal = useCallback(
    (title: string, youtubeId?: string | null, embedUrl?: string | null) => {
      setTrailerModal({
        isOpen: true,
        title,
        youtubeId,
        embedUrl,
      });
    },
    [],
  );

  const closeTrailerModal = useCallback(() => {
    setTrailerModal({
      isOpen: false,
      title: "",
      youtubeId: null,
      embedUrl: null,
    });
  }, []);

  // Global Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const openSearchModal = useCallback(() => setIsSearchModalOpen(true), []);
  const closeSearchModal = useCallback(() => setIsSearchModalOpen(false), []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimeAppContext.Provider
      value={{
        watchlist,
        isBookmarked,
        toggleBookmark,
        removeFromWatchlist,
        history,
        addToHistory,
        removeFromHistory,
        clearHistory,
        watchedEpisodes,
        isEpisodeWatched,
        toggleEpisodeWatched,
        markAllEpisodesWatched,
        unmarkAllEpisodesWatched,
        getWatchedCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        drawerTab,
        setDrawerTab,
        trailerModal,
        openTrailerModal,
        closeTrailerModal,
        isSearchModalOpen,
        openSearchModal,
        closeSearchModal,
      }}
    >
      {children}
    </AnimeAppContext.Provider>
  );
}

export function useAnimeApp() {
  const context = useContext(AnimeAppContext);
  if (!context) {
    throw new Error("useAnimeApp must be used within an AnimeAppProvider");
  }
  return context;
}
