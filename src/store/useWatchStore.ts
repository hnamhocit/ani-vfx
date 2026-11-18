import { create } from "zustand";
import { jikanApi } from "@/services/jikan";
import { fetchEpisodeStream } from "@/services/streaming";
import type { EpisodeProgress } from "@/store/useUserStore";
import type {
  Anime,
  AnimeEpisode,
  AnimeRecommendationItem,
  AnimeRelationItem,
  StreamServer,
} from "@/types/anime";

export function formatSeconds(sec: number): string {
  if (!sec || Number.isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

interface WatchState {
  animeId: number | null;
  anime: Anime | null;
  episodes: AnimeEpisode[];
  recommendations: AnimeRecommendationItem[];
  relations: AnimeRelationItem[];
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

  fetchWatchData: (
    id: number,
    initialEpisode: number,
    addToHistory: (anime: Anime) => void,
  ) => Promise<void>;
  fetchStream: (
    getProgress: (
      id: number,
      ep: number,
    ) => EpisodeProgress | null | undefined,
  ) => Promise<void>;
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
  relations: [],
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
      relations: [],
      streamServers: [],
      activeServer: null,
      isTrailerMode: false,
      nextEpisodeCountdown: null,
      episodeSearch: "",
      liked: false,
    });

    const [animeRes, epsRes, recsRes, relsRes] = await Promise.allSettled([
      jikanApi.getAnimeFull(id),
      jikanApi.getAnimeEpisodes(id),
      jikanApi.getAnimeRecommendations(id),
      jikanApi.getAnimeRelations(id),
    ]);

    if (get().animeId !== id) return;

    if (animeRes.status === "fulfilled" && animeRes.value.data) {
      const animeData = animeRes.value.data;
      addToHistory(animeData);
      const initialLikes =
        animeData.favorites ||
        Math.floor((animeData.score || 8.0) * 1200) ||
        1540;

      set({
        anime: animeData,
        likeCount: initialLikes,
      });
    } else {
      set({ error: "Không thể tải thông tin anime này." });
    }

    set({
      episodes:
        epsRes.status === "fulfilled" && epsRes.value.data
          ? epsRes.value.data
          : [],
      recommendations:
        recsRes.status === "fulfilled" && recsRes.value.data
          ? recsRes.value.data.slice(0, 15)
          : [],
      relations:
        relsRes.status === "fulfilled" && relsRes.value.data
          ? relsRes.value.data
          : [],
      isLoading: false,
    });
  },

  fetchStream: async (getProgress) => {
    const { anime, animeId, currentEpisode, episodes } = get();
    if (!anime || !animeId) return;

    const isAnimeUpcoming =
      anime.status === "Not yet aired" ||
      (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));

    if (isAnimeUpcoming) {
      set({
        streamLoading: false,
        streamServers: [],
        activeServer: null,
        isTrailerMode: Boolean(
          anime.trailer?.embed_url || anime.trailer?.youtube_id,
        ),
      });
      return;
    }

    const existingProgress = getProgress(animeId, currentEpisode);
    const hasResume =
      Boolean(existingProgress) &&
      (existingProgress?.currentTime ?? 0) > 15 &&
      !existingProgress?.completed;

    set({
      streamLoading: true,
      streamError: null,
      isTrailerMode: false,
      nextEpisodeCountdown: null,
      resumeTime: hasResume ? existingProgress?.currentTime ?? 0 : 0,
      showResumePrompt: hasResume,
    });

    try {
      const res = await fetchEpisodeStream({
        title: anime.title,
        englishTitle: anime.title_english,
        episode: currentEpisode,
        malId: animeId,
      });

      if (get().animeId !== animeId || get().currentEpisode !== currentEpisode) {
        return;
      }

      if (res.success && res.servers.length > 0) {
        const firstServer = res.servers[0];
        set({
          streamServers: res.servers,
          activeServer: firstServer,
          isTrailerMode: false,
          playerMode: firstServer.m3u8Url ? "hls" : "iframe",
          streamLoading: false,
        });
      } else {
        const hasTrailer = Boolean(
          anime.trailer?.embed_url || anime.trailer?.youtube_id,
        );
        set({
          streamServers: [],
          activeServer: null,
          isTrailerMode: hasTrailer,
          streamError: hasTrailer
            ? null
            : res.message ||
            `Chưa tìm thấy máy chủ stream cho Tập ${currentEpisode}.`,
          streamLoading: false,
        });
      }
    } catch {
      if (get().animeId !== animeId || get().currentEpisode !== currentEpisode) {
        return;
      }
      const hasTrailer = Boolean(
        anime.trailer?.embed_url || anime.trailer?.youtube_id,
      );
      set({
        streamServers: [],
        activeServer: null,
        isTrailerMode: hasTrailer,
        streamError: hasTrailer
          ? null
          : "Lỗi kết nối khi tải nguồn video trực tiếp.",
        streamLoading: false,
      });
    }
  },

  selectEpisode: (epNum) => {
    const { animeId, currentEpisode } = get();
    if (epNum === currentEpisode || !animeId) return;

    set((state) => ({
      currentEpisode: epNum,
      nextEpisodeCountdown: null,
      scrollTrigger: state.scrollTrigger + 1,
    }));

    if (typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/anime/${animeId}/watch?ep=${epNum}`,
      );
    }
  },

  selectServer: (server) =>
    set({
      activeServer: server,
      isTrailerMode: false,
      ...(server.m3u8Url ? { playerMode: "hls" as const } : {}),
    }),

  setPlayerMode: (mode) => set({ playerMode: mode }),

  enableTrailerMode: () =>
    set({
      isTrailerMode: true,
      activeServer: null,
    }),

  setShowResumePrompt: (show) => set({ showResumePrompt: show }),

  setResumeTime: (time) => set({ resumeTime: time }),

  setNextEpisodeCountdown: (value) => set({ nextEpisodeCountdown: value }),

  decrementCountdown: () =>
    set((state) => ({
      nextEpisodeCountdown:
        state.nextEpisodeCountdown !== null
          ? state.nextEpisodeCountdown - 1
          : null,
    })),

  toggleLike: () =>
    set((state) => {
      const next = !state.liked;
      return {
        liked: next,
        likeCount: next ? state.likeCount + 1 : state.likeCount - 1,
      };
    }),

  shareCurrentUrl: () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    set({ copied: true });
    setTimeout(() => {
      set({ copied: false });
    }, 2500);
  },

  setEpisodeSearch: (query) => set({ episodeSearch: query }),
}));
