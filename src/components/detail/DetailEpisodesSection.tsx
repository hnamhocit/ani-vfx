"use client";

import { Clock, LayoutGrid, List, Search, Tv } from "lucide-react";
import { useMemo, useState } from "react";
import { useDetailStore } from "@/store/useDetailStore";
import { listAnimeEpisodes } from "@/utils/episodes";
import {
  type DetailEpisodeItem,
  DetailEpisodeLinks,
} from "./DetailEpisodeLinks";

const CHUNK_SIZE = 100;

interface DetailEpisodeAnime {
  status?: string | null;
  episodes?: number | null;
  nextAiringEpisode?: { episode: number } | null;
}

export function DetailEpisodesSection() {
  const animeId = useDetailStore((s) => s.animeId);
  const anime = useDetailStore((s) => s.anime) as DetailEpisodeAnime | null;
  const episodes = useDetailStore((s) => s.episodes) as DetailEpisodeItem[];
  const episodeViewMode = useDetailStore((s) => s.episodeViewMode);
  const episodeSearch = useDetailStore((s) => s.episodeSearch);
  const episodesLoading = useDetailStore((s) => s.episodesLoading);

  const setEpisodeViewMode = useDetailStore((s) => s.setEpisodeViewMode);
  const setEpisodeSearch = useDetailStore((s) => s.setEpisodeSearch);

  const [chunkSelection, setChunkSelection] = useState({ animeId, index: 0 });
  const selectedChunk =
    chunkSelection.animeId === animeId ? chunkSelection.index : 0;

  const isUpcoming = anime?.status === "NOT_YET_RELEASED";

  const allEpisodes = useMemo(
    () => listAnimeEpisodes(anime, episodes),
    [anime, episodes],
  );
  const totalEpisodes = allEpisodes.length;

  const chunks = useMemo(() => {
    if (totalEpisodes <= CHUNK_SIZE) return [];
    const count = Math.ceil(totalEpisodes / CHUNK_SIZE);
    return Array.from({ length: count }, (_, idx) => {
      const start = idx * CHUNK_SIZE + 1;
      const end = Math.min((idx + 1) * CHUNK_SIZE, totalEpisodes);
      return { index: idx, label: `${start} - ${end}` };
    });
  }, [totalEpisodes]);

  const visibleEpisodes = useMemo(() => {
    const query = episodeSearch.trim().toLowerCase();
    if (query) {
      const numericQuery = query.replace(/\D/g, "");
      const exactNum = numericQuery ? Number(numericQuery) : null;
      const matches = allEpisodes.filter((ep) => {
        const matchesNumber = String(ep.id).includes(numericQuery || query);
        const matchesTitle = (ep.title || "").toLowerCase().includes(query);
        return matchesNumber || matchesTitle;
      });
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

  if (!anime || !animeId) return null;

  return (
    <section className="space-y-4 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400 shrink-0">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-base sm:text-xl font-black text-white">
                Danh sách tập phim
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-950 text-purple-300 border border-purple-500/30">
                {isUpcoming || totalEpisodes === 0
                  ? "Chưa khởi chiếu"
                  : `${totalEpisodes} tập`}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isUpcoming || totalEpisodes === 0
                ? "Thông tin các tập phim sẽ được cập nhật khi có lịch chiếu chính thức"
                : "Chọn tập phim bên dưới để bắt đầu xem ngay"}
            </p>
          </div>
        </div>

        {!isUpcoming && totalEpisodes > 0 && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                placeholder={`Tìm tập (1-${totalEpisodes})...`}
                className="w-full bg-[#1a1d2e] border border-purple-500/30 rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400 transition"
              />
            </div>
            <div className="flex items-center bg-[#1a1d2e] border border-purple-500/30 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setEpisodeViewMode("grid")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  episodeViewMode === "grid"
                    ? "bg-[#7950f2] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Dạng lưới gọn"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setEpisodeViewMode("list")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  episodeViewMode === "list"
                    ? "bg-[#7950f2] text-white shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Dạng danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {chunks.length > 0 && !episodeSearch.trim() && !episodesLoading && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {chunks.map((chunk) => {
            const active = chunk.index === selectedChunk;
            return (
              <button
                key={chunk.index}
                type="button"
                onClick={() =>
                  setChunkSelection({ animeId, index: chunk.index })
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition cursor-pointer shrink-0 ${
                  active
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

      {episodesLoading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 pt-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="h-11 bg-zinc-900/80 rounded-xl animate-pulse border border-zinc-800"
            />
          ))}
        </div>
      ) : isUpcoming || totalEpisodes === 0 || visibleEpisodes.length === 0 ? (
        <div className="p-6 sm:p-12 text-center bg-[#151724]/70 rounded-2xl border border-purple-500/20 space-y-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-xl font-bold text-white font-heading">
              {isUpcoming || totalEpisodes === 0
                ? "Phần phim này hiện chưa có tập phát sóng"
                : "Không tìm thấy tập nào"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {isUpcoming || totalEpisodes === 0
                ? "Phim đang trong quá trình sản xuất hoặc chưa có lịch khởi chiếu chính thức."
                : "Không tìm thấy tập phim nào phù hợp với từ khóa."}
            </p>
          </div>
        </div>
      ) : (
        <DetailEpisodeLinks
          {...{ animeId, visibleEpisodes, episodeViewMode }}
        />
      )}
    </section>
  );
}
