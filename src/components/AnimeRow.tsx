"use client";

import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { useRef } from "react";
import type { Anime } from "@/types/anime";
import { AnimeCard, AnimeCardSkeleton } from "./AnimeCard";

interface AnimeRowProps {
  title: string;
  subtitle?: string;
  animes: Anime[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AnimeRow({
  title,
  subtitle,
  animes,
  isLoading = false,
  error = null,
  onRetry,
}: AnimeRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth;
    const scrollAmount =
      direction === "left" ? -containerWidth * 0.75 : containerWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="space-y-4 py-3">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg sm:text-xl md:text-2xl font-bold text-white tracking-normal">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] sm:text-xs md:text-sm text-zinc-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Arrows */}
        {!isLoading && !error && animes.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="p-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] text-zinc-300 hover:text-white border border-purple-500/25 hover:border-purple-500/60 transition-all shadow-md active:scale-95 cursor-pointer"
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="p-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] text-zinc-300 hover:text-white border border-purple-500/25 hover:border-purple-500/60 transition-all shadow-md active:scale-95 cursor-pointer"
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content Container - Spacious cards with smooth scrolling */}
      {error ? (
        <div className="p-8 rounded-2xl bg-red-950/20 border border-red-900/40 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mb-2" />
          <p className="text-sm font-medium text-red-200">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Thử lại
            </button>
          )}
        </div>
      ) : (
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-4 pt-1.5 no-scrollbar scroll-smooth snap-x"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="w-[165px] sm:w-[195px] md:w-[225px] lg:w-[260px] xl:w-[290px] flex-shrink-0 flex flex-col"
                >
                  <AnimeCardSkeleton className="h-full" />
                </div>
              ))
            : Array.from(
                new Map(animes.map((a) => [a.mal_id, a])).values(),
              ).map((anime, idx) => (
                <div
                  key={`${anime.mal_id}-${idx}`}
                  className="w-[165px] sm:w-[195px] md:w-[225px] lg:w-[260px] xl:w-[290px] flex-shrink-0 snap-start flex flex-col"
                >
                  <AnimeCard anime={anime} className="h-full" />
                </div>
              ))}
        </div>
      )}
    </section>
  );
}
