import { Check, Clock, Play, Search, Tv } from "lucide-react";
import { useMemo } from "react";
import { EpisodeProgressBar } from "@/components/shared/EpisodeProgressBar";
import { useUserStore } from "@/store/useUserStore";
import { formatSeconds, useWatchStore } from "@/store/useWatchStore";
import { isAnimeUpcoming } from "@/utils/anime";

export function WatchEpisodeSelector() {
  const { isWatched, getProgress } = useUserStore();

  const animeId = useWatchStore((s) => s.animeId);
  const anime = useWatchStore((s) => s.anime);
  const episodes = useWatchStore((s) => s.episodes);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const episodeSearch = useWatchStore((s) => s.episodeSearch);

  const setEpisodeSearch = useWatchStore((s) => s.setEpisodeSearch);
  const selectEpisode = useWatchStore((s) => s.selectEpisode);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const q = episodeSearch.toLowerCase().trim();
    return episodes.filter(
      (e) =>
        e.mal_id.toString().includes(q) || e.title.toLowerCase().includes(q),
    );
  }, [episodes, episodeSearch]);

  if (!anime || !animeId) return null;

  const isUpcoming = isAnimeUpcoming(anime, episodes.length);
  const totalEpisodes = isUpcoming
    ? 0
    : episodes.length || anime.episodes || 0;

  const displayEpisodes =
    filteredEpisodes.length > 0
      ? filteredEpisodes
      : Array.from({ length: totalEpisodes }).map((_, idx) => ({
        mal_id: idx + 1,
        title: `Tập ${idx + 1}`,
        filler: false,
      }));

  return (
    <div className="space-y-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#111320] border border-purple-500/20 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Tv className="w-5 h-5 text-emerald-400 shrink-0" />
          <h3 className="font-heading text-base sm:text-xl font-black text-white">
            Chọn tập phim
          </h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
            {totalEpisodes} tập
          </span>
        </div>

        {!isUpcoming && totalEpisodes > 0 && (
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={episodeSearch}
              onChange={(e) => setEpisodeSearch(e.target.value)}
              placeholder="Tìm số tập..."
              className="w-full bg-[#181a28] border border-purple-500/20 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400"
            />
          </div>
        )}
      </div>

      {isUpcoming || totalEpisodes === 0 ? (
        <div className="p-8 sm:p-10 text-center bg-[#151724]/60 rounded-2xl border border-purple-500/20 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white font-heading">
            Chưa có tập phim phát hành
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            Phần phim này chưa có tập phát sóng chính thức. Bạn có thể chọn xem
            các mùa trước trong danh sách các phần phim bên trên.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-8 gap-2.5 p-1.5 -mx-1.5 max-h-[380px] overflow-y-auto no-scrollbar">
          {displayEpisodes.map((ep) => {
            const isCurrent = ep.mal_id === currentEpisode;
            const watched = isWatched(animeId, ep.mal_id);
            const epProg = getProgress(animeId, ep.mal_id);

            return (
              <button
                key={ep.mal_id}
                type="button"
                onClick={() => selectEpisode(ep.mal_id)}
                className={`relative flex flex-col items-center justify-center min-h-[46px] px-2.5 py-2.5 rounded-xl font-heading font-black text-xs sm:text-sm transition cursor-pointer active:scale-95 ${isCurrent
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400 border border-emerald-400"
                    : watched
                      ? "bg-[#181a28] text-zinc-300 border border-emerald-500/30 hover:border-purple-500/50"
                      : "bg-[#161826] hover:bg-[#222538] text-zinc-200 border border-purple-500/20 hover:border-purple-400"
                  }`}
                title={
                  epProg && epProg.currentTime > 0
                    ? `Tập ${ep.mal_id} - Đã xem đến ${formatSeconds(epProg.currentTime)}`
                    : ep.title || `Tập ${ep.mal_id}`
                }
              >
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  {isCurrent ? (
                    <Play className="w-3.5 h-3.5 fill-white shrink-0" />
                  ) : watched ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : null}
                  <span>Tập {ep.mal_id}</span>
                  {ep.filler && !isCurrent && (
                    <span className="text-[9px] leading-none font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Ngoại
                    </span>
                  )}
                </div>

                {epProg && !isCurrent && (
                  <EpisodeProgressBar
                    percentage={epProg.percentage}
                    watched={watched}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
