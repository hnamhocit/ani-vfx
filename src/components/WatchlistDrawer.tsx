"use client";

import { Bookmark, ExternalLink, History, Star, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";

export function WatchlistDrawer() {
  const {
    isDrawerOpen,
    closeDrawer,
    drawerTab,
    setDrawerTab,
    watchlist,
    removeFromWatchlist,
    history,
    removeFromHistory,
    clearHistory,
  } = useAnimeApp();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  const currentList = drawerTab === "watchlist" ? watchlist : history;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Danh sách xem và Lịch sử"
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ease-in-out ${
        isDrawerOpen
          ? "opacity-100 pointer-events-auto bg-black/80 backdrop-blur-sm"
          : "opacity-0 pointer-events-none bg-black/0 backdrop-blur-none"
      }`}
      onClick={closeDrawer}
    >
      <div
        className="fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`w-screen max-w-md bg-[#0e1017] border-l border-purple-500/25 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                {drawerTab === "watchlist" ? (
                  <Bookmark className="w-5 h-5" />
                ) : (
                  <History className="w-5 h-5" />
                )}
              </span>
              <div>
                <h2 className="text-lg font-bold text-zinc-100">
                  {drawerTab === "watchlist"
                    ? "Danh sách của tôi"
                    : "Đã xem gần đây"}
                </h2>
                <p className="text-xs text-zinc-400">
                  {drawerTab === "watchlist"
                    ? `${watchlist.length} anime đã lưu`
                    : `${history.length} anime đã xem`}
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-zinc-800/80 p-2 gap-2 bg-zinc-900/30">
            <button
              onClick={() => setDrawerTab("watchlist")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                drawerTab === "watchlist"
                  ? "bg-[#7950f2] text-white shadow-lg shadow-purple-600/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d2e]"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Danh sách ({watchlist.length})</span>
            </button>
            <button
              onClick={() => setDrawerTab("history")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                drawerTab === "history"
                  ? "bg-[#7950f2] text-white shadow-lg shadow-purple-600/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1d2e]"
              }`}
            >
              <History className="w-4 h-4" />
              <span>Đã xem ({history.length})</span>
            </button>
          </div>

          {/* Subheader action (for history clear) */}
          {drawerTab === "history" && history.length > 0 && (
            <div className="px-5 py-2.5 bg-zinc-900/20 border-b border-zinc-800/50 flex justify-end">
              <button
                onClick={clearHistory}
                className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa toàn bộ lịch sử
              </button>
            </div>
          )}

          {/* Content List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {currentList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 text-zinc-600">
                  {drawerTab === "watchlist" ? (
                    <Bookmark className="w-8 h-8" />
                  ) : (
                    <History className="w-8 h-8" />
                  )}
                </div>
                <h3 className="text-base font-semibold text-zinc-200 mb-1">
                  {drawerTab === "watchlist"
                    ? "Danh sách của bạn đang trống"
                    : "Chưa có lịch sử xem"}
                </h3>
                <p className="text-sm text-zinc-400 max-w-xs mb-5 leading-relaxed font-sans">
                  {drawerTab === "watchlist"
                    ? "Nhấn vào biểu tượng dấu cộng hoặc bookmark ở bất kỳ anime nào để lưu vào danh sách của bạn."
                    : "Các bộ anime và trailer bạn khám phá sẽ tự động hiển thị ở đây."}
                </p>
                <button
                  onClick={closeDrawer}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition"
                >
                  Khám phá anime ngay
                </button>
              </div>
            ) : (
              currentList.map((item) => (
                <div
                  key={`${item.mal_id}-${item.timestamp}`}
                  className="group relative flex gap-3 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                >
                  {/* Poster Thumbnail */}
                  <Link
                    href={`/anime/${item.mal_id}`}
                    onClick={closeDrawer}
                    className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-800"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <Link
                        href={`/anime/${item.mal_id}`}
                        onClick={closeDrawer}
                        className="text-base font-bold text-zinc-100 hover:text-purple-300 line-clamp-2 transition-colors leading-snug"
                      >
                        {item.title_english || item.title}
                      </Link>

                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {item.score && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {item.score.toFixed(1)}
                          </span>
                        )}
                        {item.type && (
                          <span className="text-[11px] font-medium text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {item.type}
                          </span>
                        )}
                        {item.episodes && (
                          <span className="text-[11px] text-zinc-500">
                            {item.episodes} tập
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 mt-1">
                      <Link
                        href={`/anime/${item.mal_id}`}
                        onClick={closeDrawer}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Chi tiết <ExternalLink className="w-3 h-3" />
                      </Link>

                      <button
                        onClick={() =>
                          drawerTab === "watchlist"
                            ? removeFromWatchlist(item.mal_id)
                            : removeFromHistory(item.mal_id)
                        }
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors rounded"
                        title="Xóa khỏi danh sách"
                        aria-label="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
