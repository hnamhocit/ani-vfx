"use client";

import { Check, CornerDownLeft, Play, Search, Tv } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  nextAiringEpisode?: { episode: number } | null;
}

const CHUNK_SIZE = 100;

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

  const isUpcoming = anime?.status === "NOT_YET_RELEASED";

  const totalEpisodes = useMemo(() => {
    if (!anime || isUpcoming) return 0;
    const airedCount = anime.nextAiringEpisode
      ? Math.max(1, anime.nextAiringEpisode.episode - 1)
      : 0;
    return Math.max(episodes.length, anime.episodes || 0, airedCount);
  }, [anime, episodes.length, isUpcoming]);

  const [selectedChunk, setSelectedChunk] = useState(0);

  useEffect(() => {
    if (currentEpisode > 0) {
      setSelectedChunk(Math.floor((currentEpisode - 1) / CHUNK_SIZE));
    }
  }, [currentEpisode]);

  const chunks = useMemo(() => {
    if (totalEpisodes <= CHUNK_SIZE) return [];
    const totalChunks = Math.ceil(totalEpisodes / CHUNK_SIZE);
    return Array.from({ length: totalChunks }, (_, idx) => {
      const start = idx * CHUNK_SIZE + 1;
      const end = Math.min((idx + 1) * CHUNK_SIZE, totalEpisodes);
      return { index: idx, label: `${start} - ${end}` };
    });
  }, [totalEpisodes]);

  const allEpisodes = useMemo(() => {
    if (totalEpisodes === 0) return [];
    if (episodes.length >= totalEpisodes) return episodes;
    return Array.from({ length: totalEpisodes }, (_, idx) => ({
      id: idx + 1,
      title: `Tập ${idx + 1}`,
    }));
  }, [totalEpisodes, episodes]);

  const visibleEpisodes = useMemo(() => {
    const query = episodeSearch.trim();
    if (query) {
      const numericQuery = query.replace(/\D/g, "");
      const exactNum = numericQuery ? Number(numericQuery) : null;
      const matches = allEpisodes.filter((ep) =>
        String(ep.id).includes(numericQuery || query),
      );
      if (exactNum !== null) {
        matches.sort((a, b) =>
          a.id === exactNum ? -1 : b.id === exactNum ? 1 : a.id - b.id,
        );
      }
      return matches;
    }

    if (chunks.length === 0) return allEpisodes;
    const start = selectedChunk * CHUNK_SIZE;
    return allEpisodes.slice(start, start + CHUNK_SIZE);
  }, [allEpisodes, episodeSearch, chunks.length, selectedChunk]);

  if (!anime || !animeId || totalEpisodes === 0) return null;

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(episodeSearch.replace(/\D/g, ""), 10);
    if (!Number.isNaN(target) && target >= 1 && target <= totalEpisodes) {
      selectEpisode(target);
      setEpisodeSearch("");
    }
  };

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

        <form onSubmit={handleQuickJump} className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            inputMode="numeric"
            value={episodeSearch}
            onChange={(e) => setEpisodeSearch(e.target.value)}
            placeholder={`Tìm tập (1-${totalEpisodes})...`}
            className="w-full bg-[#1a1d2e] border border-purple-500/30 rounded-xl pl-9 pr-9 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400 transition"
          />
          {episodeSearch.trim() && (
            <button
              type="submit"
              title="Nhảy tới tập này"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition cursor-pointer"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {chunks.length > 0 && !episodeSearch.trim() && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {chunks.map((chunk) => {
            const active = chunk.index === selectedChunk;
            return (
              <button
                key={chunk.index}
                type="button"
                onClick={() => setSelectedChunk(chunk.index)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition cursor-pointer shrink-0 ${active
                  ? "bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/30"
                  : "bg-[#181a28] hover:bg-[#23263a] text-zinc-300 border-purple-500/20"
                  }`}
              >
                {chunk.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5 p-1.5 -mx-1.5 max-h-[360px] overflow-y-auto no-scrollbar">
        {visibleEpisodes.map((ep) => {
          const isCurrent = ep.id === currentEpisode;
          const watched = isWatched(animeId, ep.id);
          const epProg = getProgress(animeId, ep.id);

          return (
            <button
              key={ep.id}
              type="button"
              onClick={() => {
                selectEpisode(ep.id);
                if (episodeSearch.trim()) setEpisodeSearch("");
              }}
              title={
                epProg && epProg.currentTime > 0
                  ? `Tập ${ep.id} - Đã xem đến ${formatSeconds(epProg.currentTime)}`
                  : `Tập ${ep.id}`
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
