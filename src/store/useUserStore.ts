import { VntezClient, type VntezUser } from "@vntez/sdk";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Client-side singleton for VntezClient with App ID 'ani-vfx'
let vntezInstance: VntezClient | null = null;

function getVntez(): VntezClient | null {
  if (typeof window === "undefined") return null;
  if (!vntezInstance) {
    vntezInstance = new VntezClient({
      appId: "ani-vfx",
      iamUrl: "https://vntez-iam.vercel.app",
      uploadUrl: "https://upload.vntez.com",
    });
  }
  return vntezInstance;
}

export interface EpisodeProgress {
  currentTime: number;
  duration: number;
  percentage: number;
  updatedAt: number;
  completed?: boolean;
}

interface UserState {
  // Auth state
  user: VntezUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Watch progress state: key is `${animeId}_${epNumber}`
  watchProgress: Record<string, EpisodeProgress>;
  autoPlayNextEpisode: boolean;
  setAutoPlayNextEpisode: (enabled: boolean) => void;

  // Auth actions
  login: (redirectUri?: string) => Promise<void>;
  logout: (redirectUrl?: string) => void;
  checkAuth: () => void;
  handleAuthCallback: (
    redirectUri?: string,
  ) => Promise<{ accessToken: string; user: VntezUser }>;
  setUser: (user: VntezUser | null, token: string | null) => void;

  // Video progress & tracking actions
  saveProgress: (
    animeId: number,
    epNumber: number,
    currentTime: number,
    duration: number,
  ) => void;
  getProgress: (animeId: number, epNumber: number) => EpisodeProgress | null;
  markWatched: (animeId: number, epNumber: number) => void;
  isWatched: (animeId: number, epNumber: number) => boolean;
  getWatchedEpisodesForAnime: (animeId: number) => number[];
}

export function getLatestEpisodeProgress(
  watchProgress: UserState["watchProgress"],
  animeId: number,
) {
  const prefix = `${animeId}_`;
  let latest: { episode: number; progress: EpisodeProgress } | null = null;
  for (const [key, prog] of Object.entries(watchProgress)) {
    if (!key.startsWith(prefix)) continue;
    const ep = Number(key.slice(prefix.length));
    if (Number.isNaN(ep)) continue;
    if (!latest || prog.updatedAt > latest.progress.updatedAt) {
      latest = { episode: ep, progress: prog };
    }
  }
  return latest;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      watchProgress: {},
      autoPlayNextEpisode: true,
      setAutoPlayNextEpisode: (enabled) =>
        set({ autoPlayNextEpisode: enabled }),

      // Login redirect using VNTEZ IAM OAuth PKCE
      login: async (redirectUri?: string) => {
        const vntez = getVntez();
        if (!vntez) return;
        set({ isLoading: true, error: null });
        try {
          const targetRedirect =
            redirectUri ||
            (typeof window !== "undefined"
              ? `${window.location.origin}/callback`
              : "");
          await vntez.auth.signIn({ redirectUri: targetRedirect });
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Đăng nhập thất bại";
          set({ error: message, isLoading: false });
        }
      },

      // Handle OAuth callback on /callback page
      handleAuthCallback: async (redirectUri?: string) => {
        const vntez = getVntez();
        if (!vntez) throw new Error("Chỉ hỗ trợ trên môi trường trình duyệt");
        set({ isLoading: true, error: null });
        try {
          const targetRedirect =
            redirectUri ||
            (typeof window !== "undefined"
              ? `${window.location.origin}/callback`
              : "");
          const result = await vntez.auth.handleCallback(targetRedirect);
          set({
            user: result.user,
            token: result.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return result;
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Xử lý đăng nhập lỗi";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // Check current auth status from Vntez SDK / Storage
      checkAuth: () => {
        const vntez = getVntez();
        if (!vntez) return;
        try {
          const isAuth = vntez.auth.isAuthenticated();
          const user = vntez.auth.getUser();
          const token = vntez.auth.getToken();
          set({
            isAuthenticated: isAuth && !!user,
            user: user || null,
            token: token || null,
          });
        } catch {
          set({ isAuthenticated: false, user: null, token: null });
        }
      },

      // Sign out
      logout: (redirectUrl?: string) => {
        const vntez = getVntez();
        set({ user: null, token: null, isAuthenticated: false });
        if (vntez) {
          try {
            vntez.auth.signOut(
              redirectUrl ||
                (typeof window !== "undefined"
                  ? window.location.origin
                  : undefined),
            );
          } catch {
            // Ignored
          }
        }
      },

      // Set user manually (e.g. demo mode)
      setUser: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: !!user,
        });
      },

      // Save playback progress of an episode
      saveProgress: (
        animeId: number,
        epNumber: number,
        currentTime: number,
        duration: number,
      ) => {
        if (!animeId || !epNumber || currentTime <= 0 || duration <= 0) return;
        const key = `${animeId}_${epNumber}`;
        const percentage = Math.min(
          100,
          Math.round((currentTime / duration) * 100),
        );
        const isCompleted = percentage >= 85 || duration - currentTime <= 15;

        set((state) => ({
          watchProgress: {
            ...state.watchProgress,
            [key]: {
              currentTime: Math.floor(currentTime),
              duration: Math.floor(duration),
              percentage,
              updatedAt: Date.now(),
              completed: isCompleted,
            },
          },
        }));
      },

      // Get progress for a specific episode
      getProgress: (animeId: number, epNumber: number) => {
        const key = `${animeId}_${epNumber}`;
        return get().watchProgress[key] || null;
      },

      // Check if episode is watched / completed
      isWatched: (animeId: number, epNumber: number) => {
        const key = `${animeId}_${epNumber}`;
        const prog = get().watchProgress[key];
        return !!prog?.completed || (prog?.percentage || 0) >= 85;
      },

      // Explicitly mark an episode as watched
      markWatched: (animeId: number, epNumber: number) => {
        const key = `${animeId}_${epNumber}`;
        const current = get().watchProgress[key];
        const duration = current?.duration || 1440;
        set((state) => ({
          watchProgress: {
            ...state.watchProgress,
            [key]: {
              currentTime: duration,
              duration,
              percentage: 100,
              updatedAt: Date.now(),
              completed: true,
            },
          },
        }));
      },

      getWatchedEpisodesForAnime: (animeId: number) => {
        const prefix = `${animeId}_`;
        const result: number[] = [];
        for (const [key, prog] of Object.entries(get().watchProgress)) {
          if (
            key.startsWith(prefix) &&
            (prog.completed || prog.percentage >= 85)
          ) {
            const ep = Number(key.slice(prefix.length));
            if (!Number.isNaN(ep)) result.push(ep);
          }
        }
        return result.sort((a, b) => a - b);
      },
    }),
    {
      name: "ani-vfx-user-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        watchProgress: state.watchProgress,
        autoPlayNextEpisode: state.autoPlayNextEpisode,
      }),
    },
  ),
);
