"use client";

import {
  Bookmark,
  CheckCircle2,
  History,
  Play,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";
import { getLatestEpisodeProgress, useUserStore } from "@/store/useUserStore";
import { formatRelativeDay, formatVietnameseTime } from "@/utils/date-time";
import { getWatchAction } from "@/utils/watch-action";

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<main className="flex-1" />}>
        <LibraryContent />
      </Suspense>
      <Footer />
    </div>
  );
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "watchlist" ? "watchlist" : "history";

  const watchlist = useAnimeAppStore((s) => s.watchlist);
  const history = useAnimeAppStore((s) => s.history);
  const removeFromWatchlist = useAnimeAppStore((s) => s.removeFromWatchlist);
  const removeFromHistory = useAnimeAppStore((s) => s.removeFromHistory);
  const clearHistory = useAnimeAppStore((s) => s.clearHistory);

  const getWatchedEpisodesForAnime = useUserStore(
    (s) => s.getWatchedEpisodesForAnime,
  );
  const watchProgress = useUserStore((s) => s.watchProgress);

  const items = activeTab === "watchlist" ? watchlist : history;
  const historyById = new Map(history.map((item) => [item.id, item]));

  return (
    <main className="flex-1 max-w-7xl 2xl:max-w-[1540px] w-full mx-auto px-4 sm:px-6 md:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-white">
            Thư viện cá nhân
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Quản lý tủ phim đã lưu, lịch sử xem và tiến độ từng tập
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/library?tab=history"
            aria-current={activeTab === "history" ? "page" : undefined}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
              activeTab === "history"
                ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30"
                : "bg-[#141724] text-zinc-300 border-purple-500/20 hover:text-white"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử xem ({history.length})</span>
          </Link>

          <Link
            href="/library?tab=watchlist"
            aria-current={activeTab === "watchlist" ? "page" : undefined}
            scroll={false}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
              activeTab === "watchlist"
                ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30"
                : "bg-[#141724] text-zinc-300 border-purple-500/20 hover:text-white"
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Đã lưu ({watchlist.length})</span>
          </Link>

          {activeTab === "history" && history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="px-3 py-2.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#111320] border border-purple-500/20 space-y-3">
          <p className="text-base sm:text-lg font-bold text-zinc-300">
            {activeTab === "watchlist"
              ? "Bạn chưa lưu bộ anime nào."
              : "Chưa có lịch sử xem gần đây."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition"
          >
            Khám phá anime ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {items.map((item) => {
            const displayTitle = item.titleEnglish || item.title;
            const watchedEps = getWatchedEpisodesForAnime(item.id);
            const latest = getLatestEpisodeProgress(watchProgress, item.id);
            const historyItem = historyById.get(item.id);
            const releaseInfo =
              historyItem && historyItem.timestamp >= item.timestamp
                ? historyItem
                : item;
            const action = getWatchAction(
              item.id,
              latest,
              releaseInfo.releasedEpisodes ?? item.releasedEpisodes,
            );

            return (
              <div
                key={item.id}
                className="flex gap-4 p-3.5 rounded-2xl bg-[#111320] border border-purple-500/20 hover:border-purple-400/50 transition shadow-lg"
              >
                <Link
                  href={`/anime/${item.id}`}
                  className="relative w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden shrink-0 bg-zinc-900"
                >
                  <img
                    src={item.coverImage}
                    alt={displayTitle}
                    className="w-full h-full object-cover"
                  />
                  {item.score && (
                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-black font-black text-[10px] flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-black" />
                      {item.score}
                    </span>
                  )}
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/anime/${item.id}`}
                        className="font-heading font-bold text-sm sm:text-base text-white hover:text-purple-300 line-clamp-2 leading-snug"
                      >
                        {displayTitle}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          activeTab === "watchlist"
                            ? removeFromWatchlist(item.id)
                            : removeFromHistory(item.id)
                        }
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
                        title="Xóa khỏi danh sách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {latest && (
                      <p className="text-xs text-emerald-300 font-semibold">
                        {formatRelativeDay(latest.progress.updatedAt)} • Tập{" "}
                        {latest.episode} (
                        {formatVietnameseTime(latest.progress.currentTime)})
                      </p>
                    )}

                    {watchedEps.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">
                          Đã xem {watchedEps.length} tập (Tập{" "}
                          {watchedEps.slice(-5).join(", ")})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 flex items-center gap-2">
                    <Link
                      href={action.href}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#7950f2] to-[#9775fa] hover:from-[#6741d9] hover:to-[#845ef7] text-white font-bold text-xs transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{action.label}</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
