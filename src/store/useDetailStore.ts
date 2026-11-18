import { create } from "zustand";
import { jikanApi } from "@/services/jikan";
import type {
  Anime,
  AnimeCharacterItem,
  AnimeEpisode,
  AnimeRecommendationItem,
  AnimeRelationItem,
} from "@/types/anime";

interface DetailState {
  animeId: number | null;
  anime: Anime | null;
  episodes: AnimeEpisode[];
  characters: AnimeCharacterItem[];
  recommendations: AnimeRecommendationItem[];
  relations: AnimeRelationItem[];

  episodePage: number;
  totalEpisodePages: number;
  totalEpisodesCount: number;
  episodeViewMode: "grid" | "list";
  episodeSearch: string;

  isLoading: boolean;
  episodesLoading: boolean;
  error: string | null;

  fetchDetailData: (
    id: number,
    addToHistory: (anime: Anime) => void,
  ) => Promise<void>;
  fetchEpisodes: (id: number, page: number) => Promise<void>;
  setEpisodePage: (page: number | ((prev: number) => number)) => void;
  setEpisodeViewMode: (mode: "grid" | "list") => void;
  setEpisodeSearch: (query: string) => void;
}

export const useDetailStore = create<DetailState>((set, get) => ({
  animeId: null,
  anime: null,
  episodes: [],
  characters: [],
  recommendations: [],
  relations: [],

  episodePage: 1,
  totalEpisodePages: 1,
  totalEpisodesCount: 0,
  episodeViewMode: "grid",
  episodeSearch: "",

  isLoading: true,
  episodesLoading: false,
  error: null,

  fetchDetailData: async (id, addToHistory) => {
    set({
      animeId: id,
      anime: null,
      episodes: [],
      characters: [],
      recommendations: [],
      relations: [],
      episodePage: 1,
      totalEpisodePages: 1,
      totalEpisodesCount: 0,
      episodeSearch: "",
      isLoading: true,
      error: null,
    });

    try {
      const [animeRes, charsRes, recsRes, relsRes] = await Promise.allSettled([
        jikanApi.getAnimeFull(id),
        jikanApi.getAnimeCharacters(id),
        jikanApi.getAnimeRecommendations(id),
        jikanApi.getAnimeRelations(id),
      ]);

      if (get().animeId !== id) return;

      if (animeRes.status === "fulfilled" && animeRes.value.data) {
        const animeData = animeRes.value.data;
        addToHistory(animeData);
        set({ anime: animeData });
      } else {
        set({ error: "Không tìm thấy thông tin anime này." });
      }

      set({
        characters:
          charsRes.status === "fulfilled" && charsRes.value.data
            ? charsRes.value.data
            : [],
        recommendations:
          recsRes.status === "fulfilled" && recsRes.value.data
            ? recsRes.value.data
            : [],
        relations:
          relsRes.status === "fulfilled" && relsRes.value.data
            ? relsRes.value.data
            : [],
        isLoading: false,
      });
    } catch {
      if (get().animeId !== id) return;
      set({
        error: "Lỗi khi tải thông tin anime. Vui lòng thử lại.",
        isLoading: false,
      });
    }
  },

  fetchEpisodes: async (id, page) => {
    set({ episodesLoading: true });
    try {
      const res = await jikanApi.getAnimeEpisodes(id, page);
      if (get().animeId !== id || get().episodePage !== page) return;

      set({
        episodes: res.data || [],
        totalEpisodePages: res.pagination?.last_visible_page || 1,
        totalEpisodesCount:
          res.pagination?.items?.total || res.data?.length || 0,
        episodesLoading: false,
      });
    } catch {
      if (get().animeId !== id) return;
      set({ episodesLoading: false });
    }
  },

  setEpisodePage: (page) =>
    set((state) => ({
      episodePage: typeof page === "function" ? page(state.episodePage) : page,
    })),

  setEpisodeViewMode: (mode) => set({ episodeViewMode: mode }),

  setEpisodeSearch: (query) => set({ episodeSearch: query }),
}));
