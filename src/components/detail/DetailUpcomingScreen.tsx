"use client";

import { ChevronLeft, Clock, Film, Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SeasonGrid } from "@/components/SeasonGrid";
import { useAnimeAppStore } from "@/store/useAnimeAppStore";
import { useDetailStore } from "@/store/useDetailStore";
import type { AnimeSeasonItem } from "@/types/anilist";

interface DetailUpcomingAnime {
  id: number;
  title?: {
    romaji?: string | null;
    english?: string | null;
    native?: string | null;
  };
  description?: string | null;
  trailer?: {
    id?: string | null;
    site?: string | null;
  } | null;
}

export function DetailUpcomingScreen({
  seasonList,
}: {
  seasonList: AnimeSeasonItem[];
}) {
  const openTrailerModal = useAnimeAppStore((s) => s.openTrailerModal);
  const animeId = useDetailStore((s) => s.animeId);
  const anime = useDetailStore((s) => s.anime) as DetailUpcomingAnime | null;
  if (!anime || !animeId) return null;

  const displayTitle = anime.title?.english || anime.title?.romaji || "Unknown";
  const nativeTitle = anime.title?.native;
  const description = anime.description?.replace(/<[^>]+>/g, "").trim();
  const trailerId =
    anime.trailer?.site === "youtube" ? (anime.trailer.id ?? null) : null;
  const prevSeasons = seasonList.filter((s) => !s.isCurrent && !s.unreleased);

  return (
    <div className="min-h-screen bg-[#0b0c10] text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-6 sm:space-y-10">
        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-400">
          <Link
            href="/"
            className="hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
          <span>/</span>
          <span className="text-zinc-200 font-medium truncate">
            {displayTitle}
          </span>
        </div>

        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#121422] to-[#0b0c10] border border-purple-500/30 p-5 sm:p-10 md:p-16 text-center space-y-5 sm:space-y-6 shadow-2xl">
          <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Clock className="w-8 h-8 sm:w-12 sm:h-12 animate-pulse" />
          </div>

          <div className="space-y-2.5 sm:space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Season này chưa ra mắt • Sắp khởi chiếu</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-normal leading-tight">
              {displayTitle}
            </h1>
            {nativeTitle && nativeTitle !== displayTitle && (
              <p className="text-sm sm:text-lg text-purple-300/80 font-medium">
                {nativeTitle}
              </p>
            )}
            <p className="text-xs sm:text-base text-zinc-400 leading-relaxed pt-1">
              {description ||
                "Phần phim này hiện đang trong giai đoạn sản xuất hoặc chưa có lịch phát sóng chính thức từ nhà sản xuất."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2">
            {trailerId && (
              <button
                type="button"
                onClick={() => openTrailerModal(displayTitle, trailerId)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-600/30 transition cursor-pointer"
              >
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Phát Trailer chính thức</span>
              </button>
            )}

            {prevSeasons.length > 0 && (
              <Link
                href={`/anime/${prevSeasons[prevSeasons.length - 1].id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#1e2238] hover:bg-[#282d4a] text-purple-200 border border-purple-500/30 font-bold text-sm sm:text-base transition shadow-md"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span className="truncate">
                  Xem phần trước ({prevSeasons[prevSeasons.length - 1].title})
                </span>
              </Link>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl sm:rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-sm sm:text-base transition"
            >
              <span>Quay lại Khám phá</span>
            </Link>
          </div>
        </div>

        <SeasonGrid seasonList={seasonList} currentAnimeId={animeId} />
      </main>
      <Footer />
    </div>
  );
}
