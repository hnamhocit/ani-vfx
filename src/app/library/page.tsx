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
import { Suspense, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { formatRelativeDay, formatVietnameseTime } from "@/components/player/types";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";
import { useUserStore } from "@/store/useUserStore";

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialTab =
    searchParams?.get("tab") === "watchlist" ? "watchlist" : "history";

  const [activeTab, setActiveTab] = useState<"watchlist" | "history">(
    initialTab,
  );

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "watchlist" || tabParam === "history") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const watchlist = useAnimeAppStore((s) => s.watchlist);
  const history = useAnimeAppStore((s) => s.history);
  const hydrateFromStorage = useAnimeAppStore((s) => s.hydrateFromStorage);
  const removeFromWatchlist = useAnimeAppStore((s) => s.removeFromWatchlist);
  const removeFromHistory = useAnimeAppStore((s) => s.removeFromHistory);
  const clearHistory = useAnimeAppStore((s) => s.clearHistory);

  const getWatchedEpisodesForAnime = useUserStore(
    (s) => s.getWatchedEpisodesForAnime,
  );
  const getLatestEpisodeProgress = useUserStore(
    (s) => s.getLatestEpisodeProgress,
  );

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const items = activeTab === "watchlist" ? watchlist : history;

  return (
    <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-white">
            Thư viện cá nhân
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Nhấn trực tiếp vào phim để tiếp tục xem ngay tại đoạn đang dở
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${activeTab === "history"
                ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/25"
                : "bg-[#131624] text-zinc-300 border-white/10 hover:text-white"
              }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("watchlist")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${activeTab === "watchlist"
                ? "bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/25"
                : "bg-[#131624] text-zinc-300 border-white/10 hover:text-white"
              }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Đã lưu ({watchlist.length})</span>
          </button>

          {activeTab === "history" && history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-bold transition cursor-pointer"
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
              ? "Tủ phim đã lưu đang trống."
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-5">
          {items.map((item) => {
            const displayTitle = item.titleEnglish || item.title;
            const watchedEps = getWatchedEpisodesForAnime(item.id);
            const latest = getLatestEpisodeProgress(item.id);
            const targetHref = latest
              ? `/anime/${item.id}/watch?ep=${latest.episode}`
              : `/anime/${item.id}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#111320] border border-white/[0.08] hover:border-purple-400/70 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-600/20 hover:-translate-y-1"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (activeTab === "watchlist") {
                      removeFromWatchlist(item.id);
                    } else {
                      removeFromHistory(item.id);
                    }
                  }}
                  title="Xóa"
                  aria-label="Xóa"
                  className="absolute top-2 left-2 z-20 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-zinc-300 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <Link href={targetHref} className="flex-1 flex flex-col">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900">
                    <img
                      src={item.coverImage}
                      alt={displayTitle}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111320] via-black/20 to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="w-11 h-11 rounded-full bg-purple-600/95 text-white flex items-center justify-center shadow-xl shadow-purple-600/40">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </span>
                    </div>

                    {item.score && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center gap-0.5 shadow-md">
                        <Star className="w-3 h-3 fill-black" />
                        {item.score}
                      </span>
                    )}

                    {latest && (
                      <div className="absolute bottom-2.5 inset-x-2.5">
                        <span className="inline-flex items-center gap-1 max-w-full px-2 py-1 rounded-lg bg-black/85 backdrop-blur-md border border-emerald-500/35 text-[11px] font-bold text-emerald-300 truncate">
                          Tập {latest.episode} •{" "}
                          {formatVietnameseTime(latest.progress.currentTime)}
                        </span>
                      </div>
                    )}

                    {latest && latest.progress.percentage > 0 && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-zinc-800">
                        <div
                          className="h-full bg-gradient-to-r from-[#7950f2] to-emerald-400"
                          style={{
                            width: `${Math.min(100, latest.progress.percentage)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between gap-1.5">
                    <h2
                      className="font-heading font-bold text-sm text-white group-hover:text-purple-300 line-clamp-2 leading-snug transition-colors"
                      title={displayTitle}
                    >
                      {displayTitle}
                    </h2>

                    <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
                      {latest ? (
                        <span>{formatRelativeDay(latest.progress.updatedAt)}</span>
                      ) : (
                        <span>{item.format || "Anime"}</span>
                      )}

                      {watchedEps.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          {watchedEps.length} tập
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      <Navbar />
      <Suspense fallback={<div className="flex-1" />}>
        <LibraryContent />
      </Suspense>
      <Footer />
    </div>
  );
}
