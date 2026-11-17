"use client";

import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Pause,
  Play,
  Sparkles,
  Star,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";
import type { Anime } from "@/types/anime";

interface HeroSectionProps {
  featuredList: Anime[];
  isLoading?: boolean;
}

const SLIDE_DURATION_MS = 6000;

export function HeroSection({
  featuredList,
  isLoading = false,
}: HeroSectionProps) {
  const { isBookmarked, toggleBookmark, openTrailerModal, addToHistory } =
    useAnimeApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fallbackImgs, setFallbackImgs] = useState<Record<number, string>>({});

  // Deduplicate featured list to ensure unique keys and safe slide navigation
  const uniqueFeatured = useMemo(() => {
    const seen = new Set<number>();
    return (featuredList || []).filter((a) => {
      if (!a?.mal_id || seen.has(a.mal_id)) return false;
      seen.add(a.mal_id);
      return true;
    });
  }, [featuredList]);

  const totalSlides = uniqueFeatured.length;

  const handleNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Pure CSS-accelerated slide timer: React state updates ONCE every 6s instead of 20 times/sec
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset timer whenever currentIndex changes
  useEffect(() => {
    if (isLoading || totalSlides <= 1 || isPaused) {
      return;
    }

    const timer = setTimeout(() => {
      handleNext();
    }, SLIDE_DURATION_MS);

    return () => clearTimeout(timer);
  }, [isLoading, totalSlides, isPaused, handleNext, currentIndex]);

  if (isLoading || uniqueFeatured.length === 0) {
    return (
      <div className="relative w-full h-[400px] sm:h-[460px] md:h-[520px] lg:h-[580px] bg-[#1a1d2e] animate-pulse overflow-hidden rounded-2xl border border-purple-500/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#1a1d2e]/60 to-transparent" />
        <div className="absolute bottom-8 left-4 sm:left-8 md:left-12 max-w-2xl space-y-3">
          <div className="h-5 w-28 bg-[#242940] rounded-full" />
          <div className="h-8 w-64 sm:w-80 bg-[#242940] rounded-lg" />
          <div className="h-12 w-full max-w-md bg-[#242940]/60 rounded-lg" />
          <div className="flex gap-2.5 pt-2">
            <div className="h-9 w-28 bg-[#242940] rounded-xl" />
            <div className="h-9 w-24 bg-[#242940] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const currentAnime = uniqueFeatured[currentIndex] || uniqueFeatured[0];
  const bookmarked = isBookmarked(currentAnime.mal_id);
  const displayTitle = currentAnime.title_english || currentAnime.title;

  const getBackdropUrl = (anime: Anime) => {
    if (fallbackImgs[anime.mal_id]) return fallbackImgs[anime.mal_id];
    // Prefer HD widescreen trailer backdrop (1280x720)
    if (anime.trailer?.images?.maximum_image_url) {
      return anime.trailer.images.maximum_image_url;
    }
    if (anime.trailer?.images?.large_image_url) {
      return anime.trailer.images.large_image_url;
    }
    if (anime.trailer?.youtube_id) {
      return `https://img.youtube.com/vi/${anime.trailer.youtube_id}/maxresdefault.jpg`;
    }
    // Fallback to large poster
    return (
      anime.images.webp?.large_image_url ||
      anime.images.jpg?.large_image_url ||
      anime.images.jpg?.image_url
    );
  };

  const getPosterFallback = (anime: Anime) => {
    return (
      anime.images.webp?.large_image_url ||
      anime.images.jpg?.large_image_url ||
      anime.images.jpg?.image_url
    );
  };

  const handlePlayTrailer = (anime: Anime = currentAnime) => {
    addToHistory(anime);
    const title = anime.title_english || anime.title;
    if (anime.trailer?.youtube_id || anime.trailer?.embed_url) {
      openTrailerModal(
        title,
        anime.trailer.youtube_id,
        anime.trailer.embed_url,
      );
    }
  };

  return (
    <div
      className="relative w-full h-[460px] sm:h-[520px] md:h-[580px] lg:h-[620px] rounded-2xl overflow-hidden border border-purple-500/25 shadow-2xl bg-[#0e1017] group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides with Crossfade Animation - Bright & Crisp */}
      {uniqueFeatured.map((anime, idx) => {
        const isActive = idx === currentIndex;
        const bgUrl = getBackdropUrl(anime);

        return (
          <div
            key={`${anime.mal_id}-${idx}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive
                ? "opacity-100 z-0"
                : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            <img
              src={bgUrl}
              alt={anime.title_english || anime.title}
              referrerPolicy="no-referrer"
              decoding="async"
              fetchPriority={isActive ? "high" : "low"}
              loading={isActive ? "eager" : "lazy"}
              onError={() => {
                const poster = getPosterFallback(anime);
                if (poster && fallbackImgs[anime.mal_id] !== poster) {
                  setFallbackImgs((prev) => ({
                    ...prev,
                    [anime.mal_id]: poster,
                  }));
                }
              }}
              className="w-full h-full object-cover object-[center_25%] brightness-100 contrast-[1.04]"
            />

            {/* Precision Left Vignette: Protects text only on left side, keeps right 60% bright and clear */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/85 via-35% to-transparent to-65%" />
            {/* Subtle bottom fade to blend with page */}
            <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0c10] to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Main Content Area: Left Title & Details */}
      <div className="relative h-full w-full px-4 sm:px-8 md:px-10 lg:px-12 flex flex-col justify-end pb-8 sm:pb-12 md:pb-14 z-10">
        <div className="max-w-2xl xl:max-w-3xl space-y-3 sm:space-y-4">
          {/* Badges Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#7950f2]/30 text-purple-300 border border-purple-500/50 text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3 text-[#9775fa]" />
              Đang phát sóng mùa này
            </span>

            {currentAnime.score && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-400 text-black text-[11px] sm:text-xs font-black shadow-md">
                <Star className="w-3 h-3 fill-black text-black" />
                MAL {currentAnime.score.toFixed(2)}
              </span>
            )}

            {currentAnime.type && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 text-zinc-200 border border-white/15 text-[11px] sm:text-xs font-medium backdrop-blur-md">
                <Tv className="w-3 h-3 text-zinc-400" />
                {currentAnime.type}
              </span>
            )}

            {currentAnime.year && (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/60 text-zinc-300 border border-white/15 text-[11px] sm:text-xs font-medium backdrop-blur-md">
                {currentAnime.year}
              </span>
            )}
          </div>

          {/* Anime Title */}
          <div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-normal leading-[1.2] line-clamp-2 drop-shadow-xl">
              {displayTitle}
            </h1>
            {currentAnime.title_japanese &&
              currentAnime.title_japanese !== displayTitle && (
                <p className="text-[11px] sm:text-xs md:text-sm text-zinc-300 font-medium mt-1 drop-shadow">
                  {currentAnime.title_japanese}
                </p>
              )}
          </div>

          {/* Genres Pills */}
          {currentAnime.genres && currentAnime.genres.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {currentAnime.genres.slice(0, 4).map((g) => (
                <span
                  key={g.mal_id}
                  className="text-[11px] sm:text-xs text-zinc-200 bg-black/60 border border-white/15 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg backdrop-blur-md font-medium"
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {currentAnime.synopsis && (
            <p className="text-xs sm:text-sm md:text-base text-zinc-200 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed drop-shadow-md font-sans">
              {currentAnime.synopsis}
            </p>
          )}

          {/* Action Buttons (CTAs) - Mantine Violet Primary */}
          <div className="flex items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2 flex-wrap">
            {/* Xem Trailer CTA */}
            <button
              type="button"
              onClick={() => handlePlayTrailer(currentAnime)}
              className="group/btn relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#7950f2] to-[#9775fa] hover:from-[#845ef7] hover:to-[#a380fc] text-white font-bold text-xs sm:text-sm md:text-base shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
              </div>
              <span>Xem Trailer</span>
            </button>

            {/* Chi tiết button */}
            <Link
              href={`/anime/${currentAnime.mal_id}`}
              onClick={() => addToHistory(currentAnime)}
              className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] text-zinc-100 hover:text-white border border-purple-500/30 hover:border-purple-500/60 font-semibold text-xs sm:text-sm md:text-base backdrop-blur-md transition-all shadow-lg active:scale-95"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400" />
              <span>Chi tiết</span>
            </Link>

            {/* Bookmark button */}
            <button
              type="button"
              onClick={() => toggleBookmark(currentAnime)}
              className={`p-2.5 sm:p-3 rounded-xl border backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${
                bookmarked
                  ? "bg-[#7950f2]/40 text-purple-300 border-purple-500/70 shadow-purple-600/30"
                  : "bg-[#1a1d2e] text-zinc-300 hover:text-white border-purple-500/30 hover:bg-[#242940]"
              }`}
              title={bookmarked ? "Đã lưu vào danh sách" : "Thêm vào danh sách"}
              aria-label="Lưu vào danh sách"
            >
              {bookmarked ? (
                <Check className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Glassmorphic Slide Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Anime trước"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer"
            aria-label="Anime tiếp theo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Modern Slide Tabs with Countdown Progress Bar */}
      {totalSlides > 1 && (
        <div className="absolute bottom-5 right-6 sm:right-10 z-20 flex items-center gap-2">
          {uniqueFeatured.slice(0, 5).map((anime, idx) => {
            const isActive = idx === currentIndex;
            const thumbTitle = anime.title_english || anime.title;

            return (
              <button
                type="button"
                key={`${anime.mal_id}-${idx}`}
                onClick={() => goToSlide(idx)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md ${
                  isActive
                    ? "bg-[#7950f2]/40 text-white border border-purple-500/70 shadow-lg shadow-purple-600/30"
                    : "bg-black/60 text-zinc-400 hover:text-white border border-white/10 hover:bg-black/80"
                }`}
                title={thumbTitle}
                aria-label={`Slide ${idx + 1}: ${thumbTitle}`}
              >
                <span>0{idx + 1}</span>

                {/* Animated progress bar for active slide (Hardware-accelerated CSS keyframe) */}
                {isActive && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60 overflow-hidden">
                    <div
                      key={`${currentIndex}-${isPaused}`}
                      className="h-full bg-[#7950f2] animate-hero-progress"
                      style={{
                        animationPlayState: isPaused ? "paused" : "running",
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}

          {/* Pause / Play Indicator button */}
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer"
            title={isPaused ? "Tiếp tục chạy slide" : "Tạm dừng slide"}
            aria-label={isPaused ? "Tiếp tục chạy slide" : "Tạm dừng slide"}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
