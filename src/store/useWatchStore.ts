import { create } from "zustand";
import { anilistApi } from "@/services/anilist";
import { fetchEpisodeStream } from "@/services/streaming";
import type { StreamServer } from "@/types/stream";
import type { AniListMediaForSeasons } from "@/types/anilist";
import type { EpisodeProgress } from "@/store/useUserStore";

export function formatSeconds(sec: number): string {
  if (!sec || Number.isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

interface WatchState {
  animeId: number | null;
  anime: any | null;
  episodes: any[];
  recommendations: any[];
  relations: AniListMediaForSeasons | null;
  isLoading: boolean;
  error: string | null;

  currentEpisode: number;
  scrollTrigger: number;
  streamServers: StreamServer[];
  activeServer: StreamServer | null;
  streamLoading: boolean;
  streamError: string | null;
  isTrailerMode: boolean;
  playerMode: "hls" | "iframe";

  showResumePrompt: boolean;
  resumeTime: number;
  nextEpisodeCountdown: number | null;

  liked: boolean;
  likeCount: number;
  copied: boolean;
  episodeSearch: string;

  fetchWatchData: (id: number, initialEpisode: number, addToHistory: (anime: any) => void) => Promise<void>;
  fetchStream: (getProgress: (id: number, ep: number) => EpisodeProgress | null | undefined) => Promise<void>;
  selectEpisode: (epNum: number) => void;
  selectServer: (server: StreamServer) => void;
  setPlayerMode: (mode: "hls" | "iframe") => void;
  enableTrailerMode: () => void;
  setShowResumePrompt: (show: boolean) => void;
  setResumeTime: (time: number) => void;
  setNextEpisodeCountdown: (value: number | null) => void;
  decrementCountdown: () => void;
  toggleLike: () => void;
  shareCurrentUrl: () => void;
  setEpisodeSearch: (query: string) => void;
}

export const useWatchStore = create<WatchState>((set, get) => ({
  animeId: null,
  anime: null,
  episodes: [],
  recommendations: [],
  relations: null,
  isLoading: true,
  error: null,
  currentEpisode: 1,
  scrollTrigger: 0,
  streamServers: [],
  activeServer: null,
  streamLoading: false,
  streamError: null,
  isTrailerMode: false,
  playerMode: "hls",
  showResumePrompt: false,
  resumeTime: 0,
  nextEpisodeCountdown: null,
  liked: false,
  likeCount: 0,
  copied: false,
  episodeSearch: "",

  fetchWatchData: async (id, initialEpisode, addToHistory) => {
    set({
      animeId: id,
      currentEpisode: initialEpisode,
      scrollTrigger: 0,
      isLoading: true,
      error: null,
      anime: null,
      episodes: [],
      recommendations: [],
      relations: null,
      streamServers: [],
      activeServer: null,
      isTrailerMode: false,
      nextEpisodeCountdown: null,
      episodeSearch: "",
      liked: false,
    });

    const [animeRes, epsRes, recsRes, relsRes] = await Promise.allSettled([
      anilistApi.getAnimeFull(id),
      anilistApi.getAnimeEpisodes(id),
      anilistApi.getAnimeRecommendations(id),
      anilistApi.getAnimeRelations(id),
    ]);

    if (get().animeId !== id) return;

    if (animeRes.status === "fulfilled" && animeRes.value.data) {
      const animeData = animeRes.value.data as any;
      addToHistory(animeData);
      set({
        anime: animeData,
        likeCount:
          animeData.favourites ||
          Math.floor((animeData.averageScore || 80) * 120) ||
          1540,
      });
    } else {
      set({ error: "Không thể tải thông tin anime này." });
    }

    const rawRecs =
      recsRes.status === "fulfilled"
        ? (recsRes.value.data as
          | { nodes?: Array<{ mediaRecommendation?: unknown }> }
          | unknown[])
        : null;

    const normalizedRecs = Array.isArray(rawRecs)
      ? rawRecs
      : Array.isArray(rawRecs?.nodes)
        ? rawRecs.nodes.map((n) => n.mediaRecommendation).filter(Boolean)
        : [];

    set({
      episodes: epsRes.status === "fulfilled" ? epsRes.value.data || [] : [],
      recommendations: normalizedRecs.slice(0, 15),
      relations: relsRes.status === "fulfilled" ? relsRes.value.data : null,
      isLoading: false,
    });
  },

  fetchStream: async (getProgress) => {
    const { anime, animeId, currentEpisode, episodes } = get();
    if (!anime || !animeId) return;

    const isUpcoming =
      anime.status === "NOT_YET_RELEASED" ||
      (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));

    if (isUpcoming) {
      set({
        streamLoading: false, streamServers: [], activeServer: null,
        isTrailerMode: Boolean(anime.trailer?.id),
      });
      return;
    }

    const progress = getProgress(animeId, currentEpisode);
    const hasResume = Boolean(progress) && (progress?.currentTime ?? 0) > 15 && !progress?.completed;

    set({
      streamLoading: true, streamError: null, isTrailerMode: false,
      nextEpisodeCountdown: null,
      resumeTime: hasResume ? progress?.currentTime ?? 0 : 0,
      showResumePrompt: hasResume,
    });

    try {
      const res = await fetchEpisodeStream({
        anilistId: animeId,
        episode: currentEpisode,
        title: anime.title?.romaji,
        englishTitle: anime.title?.english,
      });

      if (get().animeId !== animeId || get().currentEpisode !== currentEpisode) return;

      if (res.success && res.servers.length > 0) {
        set({
          streamServers: res.servers,
          activeServer: res.servers[0],
          isTrailerMode: false,
          playerMode: res.servers[0].m3u8Url ? "hls" : "iframe",
          streamLoading: false,
        });
      } else {
        const hasTrailer = Boolean(anime.trailer?.id);
        set({
          streamServers: [], activeServer: null, isTrailerMode: hasTrailer,
          streamError: hasTrailer ? null : res.message || `Chưa tìm thấy nguồn cho Tập ${currentEpisode}.`,
          streamLoading: false,
        });
      }
    } catch {
      if (get().animeId !== animeId || get().currentEpisode !== currentEpisode) return;
      const hasTrailer = Boolean(anime.trailer?.id);
      set({
        streamServers: [], activeServer: null, isTrailerMode: hasTrailer,
        streamError: hasTrailer ? null : "Không có kết nối mạng.",
        streamLoading: false,
      });
    }
  },

  selectEpisode: (epNum) => {
    const { animeId, currentEpisode } = get();
    if (epNum === currentEpisode || !animeId) return;
    set((s) => ({ currentEpisode: epNum, nextEpisodeCountdown: null, scrollTrigger: s.scrollTrigger + 1 }));
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/anime/${animeId}/watch?ep=${epNum}`);
    }
  },

  selectServer: (server) =>
    set({ activeServer: server, isTrailerMode: false, ...(server.m3u8Url ? { playerMode: "hls" as const } : {}) }),

  setPlayerMode: (mode) => set({ playerMode: mode }),
  enableTrailerMode: () => set({ isTrailerMode: true, activeServer: null }),
  setShowResumePrompt: (show) => set({ showResumePrompt: show }),
  setResumeTime: (time) => set({ resumeTime: time }),
  setNextEpisodeCountdown: (value) => set({ nextEpisodeCountdown: value }),
  decrementCountdown: () =>
    set((s) => ({ nextEpisodeCountdown: s.nextEpisodeCountdown !== null ? s.nextEpisodeCountdown - 1 : null })),

  toggleLike: () =>
    set((s) => ({ liked: !s.liked, likeCount: !s.liked ? s.likeCount + 1 : s.likeCount - 1 })),

  shareCurrentUrl: () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    set({ copied: true });
    setTimeout(() => set({ copied: false }), 2500);
  },

  setEpisodeSearch: (query) => set({ episodeSearch: query }),
}));
