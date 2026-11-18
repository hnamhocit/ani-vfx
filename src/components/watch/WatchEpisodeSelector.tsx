"use client";

import { Check, Play, Search, Tv } from "lucide-react";
import { useMemo } from "react";
import { EpisodeProgressBar } from "@/components/shared/EpisodeProgressBar";
import { useUserStore } from "@/store/useUserStore";
import { formatSeconds, useWatchStore } from "@/store/useWatchStore";

interface WatchEpisodeItem {
  id: number;
  title?: string;
}

interface WatchEpisodeAnime {
  status?: string | null;
  episodes?: number | null;
}

export function WatchEpisodeSelector() {
  const isWatched = useUserStore((s) => s.isWatched);
  const getProgress = useUserStore((s) => s.getProgress);

  const animeId = useWatchStore((s) => s.animeId);
  const anime = useWatchStore((s) => s.anime) as WatchEpisodeAnime | null;
  const episodes = useWatchStore((s) => s.episodes) as WatchEpisodeItem[];
  const currentEpisode = useWatchStore((s) => s.currentEpisode);
  const episodeSearch = useWatchStore((s) => s.episodeSearch);
  const setEpisodeSearch = useWatchStore((s) => s.setEpisodeSearch);
  const selectEpisode = useWatchStore((s) => s.selectEpisode);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const query = episodeSearch.toLowerCase().trim();
    return episodes.filter(
      (ep) =>
        String(ep.id).includes(query) ||
        (ep.title || "").toLowerCase().includes(query),
    );
  }, [episodes, episodeSearch]);

  if (!anime || !animeId) return null;

  const isUpcoming =
    anime.status === "NOT_YET_RELEASED" ||
    (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));
  const totalEpisodes = isUpcoming
    ? 0
    : episodes.length || anime.episodes || 0;

  if (totalEpisodes === 0) return null;

  const displayEpisodes: WatchEpisodeItem[] =
    filteredEpisodes.length > 0 || episodeSearch.trim()
      ? filteredEpisodes
      : Array.from({ length: totalEpisodes }, (_, idx) => ({
        id: idx + 1,
        title: `Tập ${idx + 1}`,
      }));

  return (
    <section className="space-y-4 p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#111320] border border-purple-500/20 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Tv className="w-5 h-5 text-emerald-400 shrink-0" />
          <h3 className="font-heading text-base sm:text-lg font-black text-white">
            Chọn tập phim
          </h3>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
            {totalEpisodes} tập
          </span>
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={episodeSearch}
            onChange={(e) => setEpisodeSearch(e.target.value)}
            placeholder="Tìm số tập..."
            className="w-full bg-[#1a1d2e] border border-purple-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 p-1.5 -mx-1.5 max-h-[360px] overflow-y-auto no-scrollbar">
        {displayEpisodes.map((ep) => {
          const isCurrent = ep.id === currentEpisode;
          const watched = isWatched(animeId, ep.id);
          const epProg = getProgress(animeId, ep.id);

          return (
            <button
              key={ep.id}
              type="button"
              onClick={() => selectEpisode(ep.id)}
              title={
                epProg && epProg.currentTime > 0
                  ? `Tập ${ep.id} - Đã xem đến ${formatSeconds(epProg.currentTime)}`
                  : ep.title || `Tập ${ep.id}`
              }
              className={`relative flex flex-col items-center justify-center min-h-[44px] p-2 rounded-xl border transition-all cursor-pointer font-heading font-black text-xs sm:text-sm active:scale-95 ${isCurrent
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 ring-2 ring-emerald-400/70 shadow-lg shadow-emerald-600/30"
                  : watched
                    ? "bg-[#181a28] text-emerald-400 border-emerald-500/35 hover:border-purple-400"
                    : "bg-[#151724] text-zinc-200 border-purple-500/20 hover:bg-[#1f2235] hover:border-purple-400 hover:text-white"
                }`}
            >
              <div className="flex items-center justify-center gap-1">
                {isCurrent ? (
                  <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                ) : watched ? (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                ) : null}
                <span>{ep.id}</span>
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
    </section>
  );
}
