"use client";

import { Film, Flame, Search, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";
import { jikanApi } from "@/services/jikan";
import { MOCK_ANIMES } from "@/services/mockData";
import type { Anime } from "@/types/anime";

const POPULAR_GENRES = [
  { id: null, name: "Tất cả" },
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 4, name: "Comedy" },
  { id: 8, name: "Drama" },
  { id: 10, name: "Fantasy" },
  { id: 22, name: "Romance" },
  { id: 24, name: "Sci-Fi" },
  { id: 37, name: "Supernatural" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả định dạng" },
  { value: "tv", label: "TV Series" },
  { value: "movie", label: "Movie" },
];

export function SearchModal() {
  const router = useRouter();
  const { isSearchModalOpen, closeSearchModal } = useAnimeApp();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce query 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Focus input on open & lock scroll
  useEffect(() => {
    if (isSearchModalOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setDebouncedQuery("");
    }
  }, [isSearchModalOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchModalOpen) {
        closeSearchModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchModalOpen, closeSearchModal]);

  // Search API execution
  useEffect(() => {
    if (!isSearchModalOpen) return;

    let isMounted = true;
    setIsLoading(true);

    const params: Record<string, string | number> = {
      limit: 10,
    };
    if (debouncedQuery.trim()) {
      params.q = debouncedQuery.trim();
    }
    if (selectedType) {
      params.type = selectedType;
    }
    if (selectedGenre) {
      params.genres = selectedGenre;
    }

    // If query is empty and no filter, show curated popular suggestions
    if (!debouncedQuery.trim() && !selectedType && !selectedGenre) {
      setResults(MOCK_ANIMES.slice(0, 8));
      setIsLoading(false);
      return;
    }

    jikanApi
      .searchAnime({
        q: debouncedQuery.trim() || undefined,
        type: selectedType || undefined,
        genres: selectedGenre ? String(selectedGenre) : undefined,
        order_by: "popularity",
        sort: "desc",
      })
      .then((res) => {
        if (!isMounted) return;
        setResults(res.data || []);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        console.error("Search modal error:", err);
        // Fallback filter on mock data
        const filtered = MOCK_ANIMES.filter((a) => {
          const matchQ =
            !debouncedQuery.trim() ||
            a.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            a.title_english
              ?.toLowerCase()
              .includes(debouncedQuery.toLowerCase());
          const matchType =
            !selectedType || a.type?.toLowerCase() === selectedType;
          return matchQ && matchType;
        });
        setResults(filtered.slice(0, 8));
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedQuery, selectedGenre, selectedType, isSearchModalOpen]);

  const handleSelectAnime = (animeId: number) => {
    closeSearchModal();
    router.push(`/anime/${animeId}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm anime"
      className={`fixed inset-0 z-50 overflow-y-auto flex items-start justify-center pt-12 sm:pt-20 px-4 pb-6 transition-all duration-300 ease-out ${
        isSearchModalOpen
          ? "opacity-100 pointer-events-auto bg-black/85 backdrop-blur-md"
          : "opacity-0 pointer-events-none bg-black/0 backdrop-blur-none"
      }`}
      onClick={closeSearchModal}
    >
      <div
        className={`w-full max-w-3xl bg-[#10121b] border border-purple-500/30 rounded-3xl shadow-2xl shadow-black/95 flex flex-col overflow-hidden transform transition-all duration-300 ease-out ${
          isSearchModalOpen
            ? "scale-100 translate-y-0"
            : "scale-95 -translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-[#141724] flex items-center gap-3.5">
          <Search className="w-6 h-6 text-purple-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên anime (Solo Leveling, Frieren, Jujutsu...)"
            className="flex-1 bg-transparent text-lg sm:text-xl font-bold text-white placeholder:text-zinc-500 focus:outline-none tracking-normal"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Xoá nội dung tìm kiếm"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-xs font-semibold px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700 select-none">
            ESC
          </kbd>
        </div>

        {/* Quick Filter Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-zinc-800/60 bg-[#0e1017] flex items-center justify-between gap-3 flex-wrap">
          {/* Format Selector */}
          <div className="flex items-center gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  selectedType === opt.value
                    ? "bg-[#7950f2] text-white shadow-md shadow-purple-600/30"
                    : "bg-[#181a26] text-zinc-400 hover:text-white border border-purple-500/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Genre Scrollable Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {POPULAR_GENRES.map((g) => (
              <button
                key={g.name}
                onClick={() => setSelectedGenre(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedGenre === g.id
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "bg-[#181a26] text-zinc-400 hover:text-white border border-purple-500/20"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Container */}
        <div className="flex-1 max-h-[58vh] overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400 font-bold px-1 pb-1">
            <span className="flex items-center gap-1.5">
              {debouncedQuery.trim() ? (
                <>
                  <Search className="w-4 h-4 text-purple-400" />
                  <span>Kết quả tìm kiếm ({results.length})</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Gợi ý anime thịnh hành</span>
                </>
              )}
            </span>
            {isLoading && (
              <span className="text-purple-400 animate-pulse font-medium">
                Đang tìm...
              </span>
            )}
          </div>

          {isLoading && results.length === 0 ? (
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-zinc-900/70 rounded-2xl animate-pulse border border-zinc-800"
                />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 space-y-2">
              <Film className="w-12 h-12 mx-auto text-zinc-600" />
              <p className="text-base font-bold text-zinc-200">
                Không tìm thấy anime phù hợp
              </p>
              <p className="text-xs text-zinc-500">
                Hãy thử tìm kiếm với từ khoá khác hoặc bỏ bớt các bộ lọc thể
                loại.
              </p>
            </div>
          ) : (
            results.map((anime) => {
              const poster =
                anime.images.webp?.large_image_url ||
                anime.images.jpg?.large_image_url ||
                anime.images.jpg?.image_url;
              const displayTitle = anime.title_english || anime.title;

              return (
                <div
                  key={anime.mal_id}
                  onClick={() => handleSelectAnime(anime.mal_id)}
                  className="group flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#141724]/80 hover:bg-[#1f2438] border border-purple-500/20 hover:border-purple-500/60 transition-all cursor-pointer shadow-md hover:shadow-xl hover:shadow-purple-600/20"
                >
                  <div className="flex items-center gap-4 min-w-0 pr-3">
                    <img
                      src={poster}
                      alt={displayTitle}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://cdn.myanimelist.net/images/anime/1208/94745.jpg";
                      }}
                      className="w-14 h-20 sm:w-16 sm:h-22 rounded-xl object-cover bg-zinc-900 shrink-0 border border-zinc-800 shadow-md group-hover:scale-103 transition-transform"
                    />

                    <div className="min-w-0 space-y-1">
                      <p className="text-base sm:text-lg font-bold text-white group-hover:text-purple-300 line-clamp-1 transition-colors">
                        {displayTitle}
                      </p>
                      {anime.title_japanese &&
                        anime.title_japanese !== displayTitle && (
                          <p className="text-xs text-zinc-400 truncate">
                            {anime.title_japanese}
                          </p>
                        )}
                      <div className="flex items-center gap-2.5 text-xs text-zinc-300 flex-wrap pt-0.5">
                        {anime.type && (
                          <span className="font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                            {anime.type}
                          </span>
                        )}
                        {anime.episodes && (
                          <span className="font-medium text-zinc-400">
                            {anime.episodes} tập
                          </span>
                        )}
                        {anime.year && (
                          <span className="font-medium text-zinc-400">
                            Năm {anime.year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {anime.score && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 border border-amber-400/40 text-amber-300 font-black text-sm shrink-0 shadow-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{anime.score.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-[#0c0d14] flex items-center justify-between text-xs text-zinc-500">
          <span>Nhấn vào anime để xem chi tiết & trailer</span>
          <span>Bấm ESC để đóng</span>
        </div>
      </div>
    </div>
  );
}
