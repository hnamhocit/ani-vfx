import { ChevronLeft, ChevronRight, Clock, Film, Play } from "lucide-react";
import { useWatchStore } from "@/store/useWatchStore";

export function WatchControlBar() {
  const anime = useWatchStore((s) => s.anime);
  const episodes = useWatchStore((s) => s.episodes);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const streamServers = useWatchStore((s) => s.streamServers);
  const activeServer = useWatchStore((s) => s.activeServer);
  const playerMode = useWatchStore((s) => s.playerMode);
  const isTrailerMode = useWatchStore((s) => s.isTrailerMode);

  const selectServer = useWatchStore((s) => s.selectServer);
  const setPlayerMode = useWatchStore((s) => s.setPlayerMode);
  const enableTrailerMode = useWatchStore((s) => s.enableTrailerMode);
  const selectEpisode = useWatchStore((s) => s.selectEpisode);

  if (!anime) return null;

  const isUpcoming =
    anime.status === "Not yet aired" ||
    (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));
  const totalEpisodes = isUpcoming
    ? 0
    : episodes.length || anime.episodes || 0;
  const hasTrailer = Boolean(
    anime.trailer?.embed_url || anime.trailer?.youtube_id,
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#111320] border border-purple-500/20 shadow-lg">
      {isUpcoming || totalEpisodes === 0 ? (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 px-3 py-2 rounded-xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Phần phim chưa phát sóng chính thức</span>
          </span>
          {hasTrailer && (
            <button
              type="button"
              onClick={enableTrailerMode}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${isTrailerMode
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
                    onClick={() => selectServer(server)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${isActive
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
                Chế độ dự phòng
              </span>
            )}

            {activeServer?.m3u8Url && !isTrailerMode && (
              <div className="flex items-center bg-[#1a1d2e] border border-purple-500/20 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setPlayerMode("hls")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${playerMode === "hls"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                    }`}
                >
                  HLS Native
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerMode("iframe")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${playerMode === "iframe"
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
                onClick={enableTrailerMode}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${isTrailerMode
                    ? "bg-[#7950f2] text-white shadow-md border border-purple-400"
                    : "bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-300 border border-purple-500/20"
                  }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Trailer</span>
              </button>
            )}
          </div>

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
