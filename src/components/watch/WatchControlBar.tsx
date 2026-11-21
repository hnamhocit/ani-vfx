"use client";

import { ChevronLeft, ChevronRight, Clock, Film, Play } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useWatchStore } from "@/store/useWatchStore";
import {
  type AnimeReleaseInfo,
  getReleasedEpisodeCount,
  isAnimeUpcoming,
} from "@/utils/anime";

interface WatchControlBarAnime extends AnimeReleaseInfo {
  trailer?: {
    id?: string | null;
    site?: string | null;
  } | null;
}

import type { useWatchSource } from "./useWatchSource";

export function WatchControlBar({
  source,
}: {
  source: ReturnType<typeof useWatchSource>;
}) {
  const anime = useWatchStore((s) => s.anime) as WatchControlBarAnime | null;
  const episodes = useWatchStore((s) => s.episodes);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const streamLoading = useWatchStore((s) => s.streamLoading);
  const streamServers = useWatchStore((s) => s.streamServers);
  const activeServer = useWatchStore((s) => s.activeServer);
  const playerMode = useWatchStore((s) => s.playerMode);
  const isTrailerMode = useWatchStore((s) => s.isTrailerMode);

  const selectEpisode = useWatchStore((s) => s.selectEpisode);

  const autoPlayNextEpisode = useUserStore((s) => s.autoPlayNextEpisode);
  const setAutoPlayNextEpisode = useUserStore((s) => s.setAutoPlayNextEpisode);

  if (!anime) return null;

  const isUpcoming = isAnimeUpcoming(anime, episodes.length);
  const totalEpisodes = isUpcoming
    ? 0
    : (getReleasedEpisodeCount(anime) ?? episodes.length);
  const hasTrailer = Boolean(
    anime.trailer?.site === "youtube" && anime.trailer?.id,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#111320] border border-purple-500/20 shadow-lg">
      {isUpcoming ? (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Phần phim chưa phát sóng chính thức</span>
          </span>
          {hasTrailer && (
            <button
              type="button"
              onClick={source.enableTrailerMode}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                isTrailerMode
                  ? "bg-[#7950f2] text-white shadow-md border border-purple-400"
                  : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Xem Official Trailer</span>
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 mr-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Máy chủ:
            </span>

            {streamServers.length > 0 ? (
              streamServers.map((server) => {
                const isActive =
                  !isTrailerMode && activeServer?.id === server.id;
                return (
                  <button
                    key={server.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => source.selectServer(server)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400"
                        : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{server.serverName}</span>
                  </button>
                );
              })
            ) : (
              <span className="text-xs font-semibold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                {streamLoading ? "Đang tìm nguồn phát…" : "Chưa có máy chủ"}
              </span>
            )}

            {activeServer?.m3u8Url &&
              activeServer.embedUrl &&
              !isTrailerMode && (
                <div className="flex items-center bg-[#1a1d2e] border border-purple-500/20 rounded-xl p-0.5">
                  <button
                    type="button"
                    aria-pressed={playerMode === "hls"}
                    onClick={() => source.setPlayerMode("hls")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      playerMode === "hls"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    HLS
                  </button>
                  <button
                    type="button"
                    aria-pressed={playerMode === "iframe"}
                    onClick={() => source.setPlayerMode("iframe")}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      playerMode === "iframe"
                        ? "bg-purple-600 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Embed
                  </button>
                </div>
              )}

            {hasTrailer && (
              <button
                type="button"
                onClick={source.enableTrailerMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  isTrailerMode
                    ? "bg-[#7950f2] text-white shadow-md border border-purple-400"
                    : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Trailer</span>
              </button>
            )}
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-zinc-200">
            <input
              type="checkbox"
              checked={autoPlayNextEpisode}
              onChange={(event) => {
                setAutoPlayNextEpisode(event.currentTarget.checked);
                if (!event.currentTarget.checked)
                  useWatchStore.getState().setNextEpisodeCountdown(null);
              }}
              className="size-4 accent-purple-500"
            />
            Tự phát tập tiếp theo
          </label>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              disabled={currentEpisode <= 1}
              onClick={() => selectEpisode(currentEpisode - 1)}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] disabled:opacity-40 text-xs sm:text-sm font-bold text-zinc-200 border border-purple-500/20 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Tập trước</span>
            </button>

            <button
              type="button"
              disabled={currentEpisode >= totalEpisodes}
              onClick={() => selectEpisode(currentEpisode + 1)}
              className="flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] disabled:opacity-40 text-xs sm:text-sm font-bold text-zinc-200 border border-purple-500/20 transition cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Tập tiếp</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
