"use client";

import { Film, Flame, RefreshCw, Search, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { anilistApi } from "@/services/anilist";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";

const POPULAR_GENRES = [
  { name: "Tất cả", value: null },
  { name: "Action", value: "Action" },
  { name: "Adventure", value: "Adventure" },
  { name: "Comedy", value: "Comedy" },
  { name: "Drama", value: "Drama" },
  { name: "Fantasy", value: "Fantasy" },
  { name: "Romance", value: "Romance" },
  { name: "Sci-Fi", value: "Sci-Fi" },
  { name: "Supernatural", value: "Supernatural" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "TV", label: "TV Series" },
  { value: "MOVIE", label: "Movie" },
];

export function SearchModal() {
  const router = useRouter();
  const isSearchModalOpen = useAnimeAppStore((s) => s.isSearchModalOpen);
  const closeSearchModal = useAnimeAppStore((s) => s.closeSearchModal);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
      setSearchError(null);
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchModalOpen) closeSearchModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  useEffect(() => {
    if (!isSearchModalOpen) return;
    let isMounted = true;
    const trimmed = debouncedQuery.trim();
    setSearchError(null);

    if (!trimmed && !selectedType && !selectedGenre) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    anilistApi.searchAnime({
      q: trimmed || undefined,
      type: selectedType || undefined,
      genres: selectedGenre || undefined,
      ...(trimmed ? {} : { order_by: "popularity", sort: "desc" }),
      limit: 15,
    })
      .then((res) => {
        if (!isMounted) return;
        setResults(res.data || []);
        setIsLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setResults([]);
        setSearchError("Không có kết nối mạng. Vui lòng thử lại.");
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [debouncedQuery, selectedGenre, selectedType, isSearchModalOpen, retryTick]);

  const handleSelectAnime = (animeId: number) => {
    closeSearchModal();
    router.push(`/anime/${animeId}`);
  };

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Tìm kiếm anime"
      className={`fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-6 sm:pt-16 px-3 sm:px-4 pb-6 transition-all duration-200 ease-out ${isSearchModalOpen ? "opacity-100 pointer-events-auto bg-black/85 backdrop-blur-md" : "opacity-0 pointer-events-none bg-black/0 backdrop-blur-none"}`}
      onClick={closeSearchModal}
    >
      <div
        className={`w-full max-w-3xl bg-[#10121b] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden transform transition-all duration-200 ease-out ${isSearchModalOpen ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 sm:p-5 border-b border-zinc-800/80 bg-[#141724] flex items-center gap-2.5 sm:gap-3.5">
          <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0 ml-1" />
          <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm tên anime (Naruto, Frieren, One Piece...)" className="flex-1 min-w-0 bg-transparent text-sm sm:text-lg font-bold text-white placeholder:text-zinc-500 focus:outline-none tracking-normal" />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition shrink-0 cursor-pointer" title="Xoá"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
          )}
          <button type="button" onClick={closeSearchModal} className="sm:hidden px-2.5 py-1 rounded-lg bg-zinc-800 text-xs font-bold text-zinc-300 shrink-0">Đóng</button>
          <kbd className="hidden sm:inline-block text-xs font-semibold px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 select-none">ESC</kbd>
        </div>

        <div className="px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-zinc-800/60 bg-[#0e1017] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {TYPE_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setSelectedType(opt.value)} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${selectedType === opt.value ? "bg-[#7950f2] text-white shadow-md shadow-purple-600/30" : "bg-[#181a26] text-zinc-400 hover:text-white border border-purple-500/20"}`}>{opt.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {POPULAR_GENRES.map((g) => (
              <button key={g.name} type="button" onClick={() => setSelectedGenre(g.value)} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${selectedGenre === g.value ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "bg-[#181a26] text-zinc-400 hover:text-white border border-purple-500/20"}`}>{g.name}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-h-[62vh] sm:max-h-[58vh] overflow-y-auto p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 font-bold px-1 pb-1">
            <span className="flex items-center gap-1.5">
              {debouncedQuery.trim() || selectedGenre || selectedType ? (
                <><Search className="w-4 h-4 text-purple-400" /><span>Kết quả tìm kiếm ({results.length})</span></>
              ) : (
                <><Flame className="w-4 h-4 text-amber-500" /><span>Nhập từ khoá để tìm kiếm</span></>
              )}
            </span>
            {isLoading && <span className="text-purple-400 animate-pulse font-medium">Đang tìm...</span>}
          </div>

          {isLoading && results.length === 0 ? (
            <div className="space-y-2.5 pt-1">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 sm:h-24 bg-zinc-900/70 rounded-2xl animate-pulse border border-zinc-800" />)}
            </div>
          ) : searchError ? (
            <div className="py-10 text-center text-zinc-400 space-y-3">
              <Film className="w-11 h-11 mx-auto text-zinc-600" />
              <p className="text-sm sm:text-base font-bold text-zinc-200">{searchError}</p>
              <button type="button" onClick={() => setRetryTick((t) => t + 1)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold transition cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" /><span>Thử tìm lại</span>
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-zinc-400 space-y-2">
              <Film className="w-11 h-11 mx-auto text-zinc-600" />
              <p className="text-sm sm:text-base font-bold text-zinc-200">Không tìm thấy anime phù hợp</p>
              <p className="text-xs text-zinc-500">Hãy thử tìm kiếm với từ khoá khác hoặc bỏ bớt bộ lọc.</p>
            </div>
          ) : (
            results.map((anime) => {
              const poster = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
              const displayTitle = anime.title?.english || anime.title?.romaji || "Unknown";
              const nativeTitle = anime.title?.native;
              const score = anime.averageScore ? +(anime.averageScore / 10).toFixed(2) : null;
              const format = anime.format === "TV_SHORT" ? "TV" : anime.format;

              return (
                <div key={anime.id} onClick={() => handleSelectAnime(anime.id)} className="group flex items-center justify-between p-2.5 sm:p-3.5 rounded-2xl bg-[#141724]/80 hover:bg-[#1f2438] border border-purple-500/20 hover:border-purple-500/60 transition-all cursor-pointer shadow-md hover:shadow-xl hover:shadow-purple-600/20 gap-2.5">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <img src={poster} alt={displayTitle} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} className="w-12 h-16 sm:w-16 sm:h-22 rounded-xl object-cover bg-zinc-900 shrink-0 border border-zinc-800 shadow-md group-hover:scale-103 transition-transform" />
                    <div className="min-w-0 space-y-1 flex-1">
                      <p className="text-sm sm:text-lg font-bold text-white group-hover:text-purple-300 line-clamp-1 transition-colors">{displayTitle}</p>
                      {nativeTitle && nativeTitle !== displayTitle && <p className="text-[11px] sm:text-xs text-zinc-400 truncate">{nativeTitle}</p>}
                      <div className="flex items-center gap-2 text-[11px] sm:text-xs text-zinc-300 flex-wrap pt-0.5">
                        {format && <span className="font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">{format}</span>}
                        {anime.episodes && <span className="font-medium text-zinc-400">{anime.episodes} tập</span>}
                        {anime.seasonYear && <span className="font-medium text-zinc-400">Năm {anime.seasonYear}</span>}
                      </div>
                    </div>
                  </div>
                  {score && (
                    <div className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 font-black text-xs sm:text-sm shrink-0 shadow-sm">
                      <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" /><span>{score}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-t border-zinc-800/80 bg-[#0c0d14] flex items-center justify-between text-[11px] sm:text-xs text-zinc-500">
          <span>Nhấn vào anime để xem chi tiết</span>
          <span className="hidden sm:inline">Bấm ESC để đóng</span>
        </div>
      </div>
    </div>
  );
}
