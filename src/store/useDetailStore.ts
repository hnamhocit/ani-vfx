import { create } from "zustand";
import { anilistApi } from "@/services/anilist";
import type { AniListMediaForSeasons } from "@/types/anilist";

interface DetailState {
  animeId: number | null;
  anime: unknown | null;
  episodes: unknown[];
  characters: unknown;
  recommendations: unknown;
  relations: AniListMediaForSeasons | null;

  episodeViewMode: "grid" | "list";
  episodeSearch: string;

  isLoading: boolean;
  episodesLoading: boolean;
  error: string | null;

  fetchDetailData: (
    id: number,
    addToHistory: (anime: any) => void,
  ) => Promise<void>;
  fetchEpisodes: (id: number) => Promise<void>;
  setEpisodeViewMode: (mode: "grid" | "list") => void;
  setEpisodeSearch: (query: string) => void;
}

export const useDetailStore = create<DetailState>((set, get) => ({
  animeId: null,
  anime: null,
  episodes: [],
  characters: null,
  recommendations: null,
  relations: null,
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
      characters: null,
      recommendations: null,
      relations: null,
      episodeSearch: "",
      isLoading: true,
      error: null,
    });

    try {
      const [animeRes, charsRes, recsRes, relsRes] = await Promise.allSettled([
        anilistApi.getAnimeFull(id),
        anilistApi.getAnimeCharacters(id),
        anilistApi.getAnimeRecommendations(id),
        anilistApi.getAnimeRelations(id),
      ]);

      if (get().animeId !== id) return;

      if (animeRes.status === "fulfilled" && animeRes.value.data) {
        addToHistory(animeRes.value.data);
        set({ anime: animeRes.value.data });
      } else {
        set({ error: "Không tìm thấy thông tin anime này." });
      }

      set({
        characters:
          charsRes.status === "fulfilled" ? charsRes.value.data : null,
        recommendations:
          recsRes.status === "fulfilled" ? recsRes.value.data : null,
        relations: relsRes.status === "fulfilled" ? relsRes.value.data : null,
        isLoading: false,
      });
    } catch {
      if (get().animeId !== id) return;
      set({
        error: "Không có kết nối mạng. Vui lòng thử lại.",
        isLoading: false,
      });
    }
  },

  fetchEpisodes: async (id) => {
    set({ episodesLoading: true });
    try {
      const res = await anilistApi.getAnimeEpisodes(id);
      if (get().animeId !== id) return;
      set({
        episodes: res.data || [],
        episodesLoading: false,
      });
    } catch {
      if (get().animeId !== id) return;
      set({ episodesLoading: false });
    }
  },

  setEpisodeViewMode: (mode) => set({ episodeViewMode: mode }),
  setEpisodeSearch: (query) => set({ episodeSearch: query }),
}));
