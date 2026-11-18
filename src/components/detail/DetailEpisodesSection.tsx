"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  Play,
  Search,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { EpisodeProgressBar } from "@/components/shared/EpisodeProgressBar";
import { useDetailStore } from "@/store/useDetailStore";
import { useUserStore } from "@/store/useUserStore";

export function DetailEpisodesSection() {
  const { isWatched, getProgress } = useUserStore();

  const animeId = useDetailStore((s) => s.animeId);
  const anime = useDetailStore((s) => s.anime) as any;
  const episodes = useDetailStore((s) => s.episodes) as any[];
  const episodePage = useDetailStore((s) => s.episodePage);
  const totalEpisodePages = useDetailStore((s) => s.totalEpisodePages);
  const totalEpisodesCount = useDetailStore((s) => s.totalEpisodesCount);
  const episodeViewMode = useDetailStore((s) => s.episodeViewMode);
  const episodeSearch = useDetailStore((s) => s.episodeSearch);
  const episodesLoading = useDetailStore((s) => s.episodesLoading);

  const setEpisodePage = useDetailStore((s) => s.setEpisodePage);
  const setEpisodeViewMode = useDetailStore((s) => s.setEpisodeViewMode);
  const setEpisodeSearch = useDetailStore((s) => s.setEpisodeSearch);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch.trim()) return episodes;
    const query = episodeSearch.toLowerCase().trim();
    return episodes.filter((ep: any) => {
      const matchesNumber = String(ep.id).includes(query);
      const matchesTitle = (ep.title || "").toLowerCase().includes(query);
      return matchesNumber || matchesTitle;
    });
  }, [episodes, episodeSearch]);

  if (!anime || !animeId) return null;

  const isUpcoming =
    anime.status === "NOT_YET_RELEASED" ||
    (episodes.length === 0 && (!anime.episodes || anime.episodes === 0));

  return (
    <section className="space-y-4 sm:space-y-5 bg-[#12141c]/90 border border-purple-500/20 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-400 shrink-0">
            <Tv className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading text-base sm:text-xl md:text-2xl font-black text-white">
                Danh sách tập phim
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-black bg-purple-950 text-purple-300 border border-purple-500/30">
                {isUpcoming
                  ? "Chưa khởi chiếu"
                  : `${totalEpisodesCount || episodes.length} tập`}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 sm:text-zinc-300 mt-0.5">
              {isUpcoming
                ? "Thông tin các tập phim sẽ được cập nhật khi có thông báo chính thức"
                : "Chọn tập phim bên dưới để bắt đầu xem ngay"}
            </p>
          </div>
        </div>

        {!isUpcoming && episodes.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={episodeSearch}
                onChange={(e) => setEpisodeSearch(e.target.value)}
                placeholder="Tìm tập (VD: 1, 2)..."
                className="w-full bg-[#1a1d2e] border border-purple-500/30 rounded-xl pl-9 sm:pl-11 pr-3 py-2 sm:py-2.5 text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400 transition"
              />
            </div>
            <div className="flex items-center bg-[#1a1d2e] border border-purple-500/30 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setEpisodeViewMode("grid")}
                className={`p-2 sm:p-2.5 rounded-lg transition cursor-pointer ${episodeViewMode === "grid"
                  ? "bg-[#7950f2] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
                  }`}
                title="Lưới"
              >
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => setEpisodeViewMode("list")}
                className={`p-2 sm:p-2.5 rounded-lg transition cursor-pointer ${episodeViewMode === "list"
                  ? "bg-[#7950f2] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
                  }`}
                title="Danh sách"
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {episodesLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 pt-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-20 sm:h-24 bg-zinc-900/80 rounded-xl animate-pulse border border-zinc-800"
            />
          ))}
        </div>
      ) : isUpcoming || filteredEpisodes.length === 0 ? (
        <div className="p-6 sm:p-14 text-center bg-[#151724]/70 rounded-2xl border border-purple-500/20 space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-2xl font-bold text-white font-heading">
              {isUpcoming
                ? "Phần phim này hiện chưa có tập phát sóng"
                : "Không tìm thấy tập nào"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {isUpcoming
                ? "Phim đang trong quá trình sản xuất hoặc chưa có lịch khởi chiếu chính thức."
                : "Không tìm thấy tập phim nào phù hợp với từ khóa."}
            </p>
          </div>
        </div>
      ) : episodeViewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5 p-1 -mx-1">
          {filteredEpisodes.map((ep: any) => {
            const watched = isWatched(animeId, ep.id);
            const epProg = getProgress(animeId, ep.id);

            return (
              <Link
                key={ep.id}
                href={`/anime/${animeId}/watch?ep=${ep.id}`}
                className={`group relative flex flex-col justify-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none active:scale-97 text-left ${watched
                  ? "bg-[#181a28] text-zinc-300 border-emerald-500/30 hover:border-purple-400"
                  : "bg-[#151724] hover:bg-[#1f2235] border-purple-500/25 hover:border-purple-400 text-zinc-100 hover:shadow-lg hover:shadow-purple-600/20"
                  }`}
              >
                <div className="flex items-center justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${watched
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-purple-500/20 text-purple-300 group-hover:bg-[#7950f2] group-hover:text-white"
                        }`}
                    >
                      {watched ? (
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                      ) : (
                        <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                      )}
                    </span>
                    <span className="font-heading font-black text-sm sm:text-lg text-white truncate">
                      Tập {ep.id}
                    </span>
                  </div>
                  {ep.filler && (
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 bg-amber-400/20 border border-amber-400/30 px-1.5 py-0.5 rounded-md shrink-0">
                      Filler
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-zinc-400 group-hover:text-zinc-200 font-medium truncate w-full mt-1.5 sm:mt-2 transition-colors">
                  {ep.title && ep.title !== `Episode ${ep.id}`
                    ? ep.title
                    : "Tập phim chính"}
                </p>
                {epProg && (
                  <EpisodeProgressBar
                    percentage={epProg.percentage}
                    watched={watched}
                    className="w-full mt-2"
                  />
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 p-1 -mx-1">
          {filteredEpisodes.map((ep: any) => {
            const watched = isWatched(animeId, ep.id);
            const epProg = getProgress(animeId, ep.id);

            return (
              <Link
                key={ep.id}
                href={`/anime/${animeId}/watch?ep=${ep.id}`}
                className={`group flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-98 text-left ${watched
                  ? "bg-[#181a28] text-zinc-300 border-emerald-500/30 hover:border-purple-400"
                  : "bg-[#151724] hover:bg-[#1f2235] border-purple-500/25 hover:border-purple-400 text-zinc-100 hover:shadow-lg hover:shadow-purple-600/20"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <span
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-sm font-heading transition-colors ${watched
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-purple-500/20 text-purple-200 group-hover:bg-[#7950f2] group-hover:text-white"
                      }`}
                  >
                    {watched ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      ep.id
                    )}
                  </span>
                  <div className="min-w-0">
                    <p
                      className="text-xs sm:text-base font-bold text-white truncate group-hover:text-purple-300 transition-colors"
                      title={ep.title}
                    >
                      {ep.title}
                    </p>
                    {ep.filler && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 mt-0.5 inline-block">
                        Tập ngoại truyện
                      </span>
                    )}
                    {epProg && (
                      <EpisodeProgressBar
                        percentage={epProg.percentage}
                        watched={watched}
                        className="w-28 sm:w-32 mt-1.5"
                      />
                    )}
                  </div>
                </div>
                <span className="text-xs font-semibold text-purple-400 shrink-0 group-hover:text-purple-300 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Xem ngay</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {totalEpisodePages > 1 && (
        <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setEpisodePage((p) => Math.max(1, p - 1))}
            disabled={episodePage <= 1}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/30 text-xs sm:text-base font-bold text-zinc-200 disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Trước</span>
          </button>
          <span className="text-xs sm:text-base text-zinc-200 font-bold px-2">
            Trang {episodePage} / {totalEpisodePages}
          </span>
          <button
            type="button"
            onClick={() =>
              setEpisodePage((p) => Math.min(totalEpisodePages, p + 1))
            }
            disabled={episodePage >= totalEpisodePages}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] border border-purple-500/30 text-xs sm:text-base font-bold text-zinc-200 disabled:opacity-40 transition cursor-pointer"
          >
            <span>Sau</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
