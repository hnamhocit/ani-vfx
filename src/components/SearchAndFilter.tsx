"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tv,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { jikanApi } from "@/services/jikan";
import { MOCK_ANIMES, MOCK_GENRES } from "@/services/mockData";
import type { Anime, GenreItem } from "@/types/anime";
import { AnimeCard, AnimeCardSkeleton } from "./AnimeCard";
import { CustomSelect, type SelectOption } from "./CustomSelect";

interface SearchAndFilterProps {
  onRef?: (el: HTMLElement | null) => void;
}

const FORMAT_OPTIONS: SelectOption[] = [
  { value: "", label: "Tất cả định dạng" },
  { value: "tv", label: "TV Series" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "special", label: "Special" },
];

const SORT_OPTIONS: SelectOption[] = [
  { value: "score-desc", label: "Điểm MAL cao nhất" },
  { value: "popularity-desc", label: "Phổ biến nhất" },
  { value: "score-asc", label: "Điểm thấp nhất" },
];

export function SearchAndFilter({ onRef }: SearchAndFilterProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [genres, setGenres] = useState<GenreItem[]>(() => MOCK_GENRES);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>("");
  const [orderBy, setOrderBy] = useState<string>("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Instant optimistic render
  const [results, setResults] = useState<Anime[]>(() =>
    MOCK_ANIMES.slice(0, 15),
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(2);
  const [totalItems, setTotalItems] = useState(MOCK_ANIMES.length);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLElement | null>(null);

  // Debounce search term 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Pass ref
  useEffect(() => {
    if (onRef) onRef(containerRef.current);
  }, [onRef]);

  // Load Genres on mount
  useEffect(() => {
    let isMounted = true;
    jikanApi
      .getAnimeGenres()
      .then((res) => {
        if (isMounted) setGenres(res.data || []);
      })
      .catch((err) => {
        console.warn("Could not load genres:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch search results
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const params: {
      q?: string;
      genres?: string;
      type?: string;
      order_by?: string;
      sort?: "asc" | "desc";
      page?: number;
    } = {
      page,
      order_by: orderBy,
      sort: sortOrder,
    };

    if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
    if (selectedGenre) params.genres = selectedGenre.toString();
    if (selectedType) params.type = selectedType;

    jikanApi
      .searchAnime(params)
      .then((res) => {
        if (isMounted) {
          setResults(res.data || []);
          setTotalPages(res.pagination?.last_visible_page || 1);
          setTotalItems(res.pagination?.items?.total || res.data?.length || 0);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Search error:", err);
          setError("Không thể tải kết quả tìm kiếm. Vui lòng thử lại sau.");
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedGenre, selectedType, orderBy, sortOrder, page]);

  const handleClear = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedGenre(null);
    setSelectedType("");
    setOrderBy("score");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedGenre || selectedType || orderBy !== "score",
  );

  return (
    <section
      ref={containerRef}
      id="search-section"
      className="space-y-6 pt-4 pb-12 select-none"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-[#9775fa]" />
            <span>Tìm kiếm & Bộ lọc nâng cao</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Khám phá kho anime khổng lồ với bộ lọc thể loại, định dạng và sắp
            xếp điểm MAL
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl bg-[#1a1d2e] border border-purple-500/30 hover:border-purple-500/70 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
            <span>Đặt lại bộ lọc</span>
          </button>
        )}
      </div>

      {/* Unified Search & Filter Control Card */}
      <div className="rounded-2xl bg-[#1a1d2e] border border-purple-500/25 p-4 sm:p-5 shadow-xl shadow-black/80 space-y-4">
        {/* Top Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5">
          {/* Search Input */}
          <div className="relative md:col-span-6 flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-purple-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên anime (vd: Attack on Titan, Frieren, Dandadan)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0e1017] border border-purple-500/25 focus:border-[#7950f2] focus:ring-2 focus:ring-[#7950f2]/30 text-sm text-zinc-100 placeholder-zinc-500 transition-all outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1a1d2e] transition"
                aria-label="Xóa từ khóa"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Format Custom Select */}
          <div className="md:col-span-3">
            <CustomSelect
              options={FORMAT_OPTIONS}
              value={selectedType}
              onChange={(val) => {
                setSelectedType(val);
                setPage(1);
              }}
              icon={<Tv className="w-4 h-4" />}
              ariaLabel="Chọn định dạng anime"
            />
          </div>

          {/* Sort Order Custom Select */}
          <div className="md:col-span-3">
            <CustomSelect
              options={SORT_OPTIONS}
              value={`${orderBy}-${sortOrder}`}
              onChange={(val) => {
                const [newOrder, newSort] = val.split("-") as [
                  string,
                  "asc" | "desc",
                ];
                setOrderBy(newOrder);
                setSortOrder(newSort);
                setPage(1);
              }}
              icon={<ArrowUpDown className="w-4 h-4" />}
              ariaLabel="Sắp xếp kết quả"
            />
          </div>
        </div>

        {/* Genre Filter Pills Row */}
        {genres.length > 0 && (
          <div className="pt-2 border-t border-purple-500/15 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span>Thể loại phổ biến ({genres.length}):</span>
              </span>
              {selectedGenre && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedGenre(null);
                    setPage(1);
                  }}
                  className="text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                >
                  Xóa lọc thể loại
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedGenre(null);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === null
                    ? "bg-[#7950f2] text-white shadow-md shadow-purple-600/40"
                    : "bg-[#0e1017] text-zinc-300 border border-purple-500/20 hover:border-purple-500/60 hover:text-white hover:bg-[#1f2438]"
                }`}
              >
                Tất cả
              </button>
              {genres.map((g) => {
                const isSelected = selectedGenre === g.mal_id;
                return (
                  <button
                    type="button"
                    key={g.mal_id}
                    onClick={() => {
                      setSelectedGenre(isSelected ? null : g.mal_id);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#7950f2] text-white shadow-md shadow-purple-600/40"
                        : "bg-[#0e1017] text-zinc-300 border border-purple-500/20 hover:border-purple-500/60 hover:text-white hover:bg-[#1f2438]"
                    }`}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7950f2]" />
            {isLoading
              ? "Đang tìm kiếm anime..."
              : `Tìm thấy ${totalItems} kết quả (Trang ${page} / ${totalPages})`}
          </span>
        </div>

        {error ? (
          <div className="p-8 rounded-2xl bg-red-950/20 border border-red-900/40 text-center text-red-300 text-sm">
            {error}
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <AnimeCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center bg-[#1a1d2e] rounded-2xl border border-purple-500/25">
            <Search className="w-12 h-12 mx-auto text-zinc-500 mb-3" />
            <p className="font-heading text-lg font-bold text-zinc-200">
              Không tìm thấy anime phù hợp
            </p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Hãy thử từ khóa khác hoặc bỏ bớt các bộ lọc thể loại, định dạng để
              xem thêm kết quả.
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="mt-4 px-4 py-2 bg-[#7950f2] text-white text-xs font-semibold rounded-xl hover:bg-[#845ef7] transition shadow-md cursor-pointer"
              >
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {Array.from(
              new Map(results.map((a) => [a.mal_id, a])).values(),
            ).map((anime, idx) => (
              <AnimeCard key={`${anime.mal_id}-${idx}`} anime={anime} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && results.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                containerRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1d2e] border border-purple-500/25 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#242940] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trước</span>
            </button>

            <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1a1d2e] border border-purple-500/25 text-xs font-bold text-purple-300 shadow-sm">
              Trang {page} / {totalPages}
            </div>

            <button
              type="button"
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                containerRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1d2e] border border-purple-500/25 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#242940] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
            >
              <span>Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
