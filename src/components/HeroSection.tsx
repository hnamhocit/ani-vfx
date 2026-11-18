"use client";

import { Bookmark, Check, ChevronLeft, ChevronRight, Info, Pause, Play, Sparkles, Star, Tv } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";

interface HeroSectionProps {
  featuredList: any[];
  isLoading?: boolean;
}

const SLIDE_DURATION_MS = 6000;

export function HeroSection({ featuredList, isLoading = false }: HeroSectionProps) {
  const { isBookmarked, toggleBookmark, openTrailerModal, addToHistory } = useAnimeApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fallbackImgs, setFallbackImgs] = useState<Record<number, string>>({});
  const touchStartX = useRef<number | null>(null);

  const uniqueFeatured = useMemo(() => {
    const seen = new Set<number>();
    return (featuredList || []).filter((a) => {
      if (!a?.id || seen.has(a.id)) return false;
      seen.add(a.id);
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

  const goToSlide = (idx: number) => setCurrentIndex(idx);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(deltaX) > 45) { deltaX > 0 ? handleNext() : handlePrev(); }
    touchStartX.current = null;
  };

  useEffect(() => {
    if (isLoading || totalSlides <= 1 || isPaused) return;
    const timer = setTimeout(handleNext, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [isLoading, totalSlides, isPaused, handleNext, currentIndex]);

  if (isLoading || uniqueFeatured.length === 0) {
    return (
      <div className="relative w-full h-[480px] sm:h-[520px] md:h-[560px] lg:h-[600px] bg-[#1a1d2e] animate-pulse overflow-hidden rounded-2xl border border-purple-500/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#1a1d2e]/70 to-transparent" />
        <div className="absolute bottom-6 left-4 right-4 sm:left-8 md:left-12 max-w-2xl space-y-3">
          <div className="h-5 w-28 bg-[#242940] rounded-full" />
          <div className="h-8 w-64 sm:w-80 bg-[#242940] rounded-lg" />
          <div className="h-12 w-full max-w-md bg-[#242940]/60 rounded-lg" />
          <div className="flex gap-2.5 pt-2">
            <div className="h-10 flex-1 sm:flex-none sm:w-32 bg-[#242940] rounded-xl" />
            <div className="h-10 flex-1 sm:flex-none sm:w-28 bg-[#242940] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const currentAnime = uniqueFeatured[currentIndex] || uniqueFeatured[0];
  const bookmarked = isBookmarked(currentAnime.id);
  const displayTitle = currentAnime.title?.english || currentAnime.title?.romaji || "Unknown";
  const nativeTitle = currentAnime.title?.native;
  const score = currentAnime.averageScore ? +(currentAnime.averageScore / 10).toFixed(2) : null;
  const format = currentAnime.format === "TV_SHORT" ? "TV" : currentAnime.format;
  const year = currentAnime.seasonYear;
  const description = currentAnime.description?.replace(/<[^>]+>/g, "");
  const genres: string[] = currentAnime.genres || [];

  const getBackdropUrl = (anime: any) => {
    if (fallbackImgs[anime.id]) return fallbackImgs[anime.id];
    if (anime.bannerImage) return anime.bannerImage;
    const ytId = anime.trailer?.site === "youtube" ? anime.trailer.id : null;
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
    return anime.coverImage?.extraLarge || anime.coverImage?.large || "";
  };

  const handlePlayTrailer = (anime: any = currentAnime) => {
    addToHistory(anime);
    const title = anime.title?.english || anime.title?.romaji || "";
    const ytId = anime.trailer?.site === "youtube" ? anime.trailer.id : null;
    if (ytId) {
      openTrailerModal(title, ytId, `https://www.youtube.com/embed/${ytId}?autoplay=1`);
    }
  };

  return (
    <div
      className="relative w-full min-h-[490px] sm:h-[530px] md:h-[580px] lg:h-[620px] rounded-2xl overflow-hidden border border-purple-500/25 shadow-2xl bg-[#0e1017] group select-none flex flex-col justify-end"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {uniqueFeatured.map((anime, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div key={`${anime.id}-${idx}`} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"}`}>
            <img
              src={getBackdropUrl(anime)}
              alt={anime.title?.english || anime.title?.romaji || ""}
              referrerPolicy="no-referrer"
              decoding="async"
              fetchPriority={isActive ? "high" : "low"}
              loading={isActive ? "eager" : "lazy"}
              onError={() => {
                const poster = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
                if (poster && fallbackImgs[anime.id] !== poster) {
                  setFallbackImgs((prev) => ({ ...prev, [anime.id]: poster }));
                }
              }}
              className="w-full h-full object-cover object-[center_20%] brightness-100 contrast-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/90 via-45% to-[#0b0c10]/10 md:hidden" />
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/85 via-35% to-transparent to-65%" />
            <div className="hidden md:block absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0b0c10] to-transparent pointer-events-none" />
          </div>
        );
      })}

      <div className="relative w-full px-4 pt-36 pb-4 sm:px-8 sm:pb-8 md:px-10 md:pb-12 lg:px-12 z-10">
        <div className="max-w-2xl xl:max-w-3xl space-y-2.5 sm:space-y-3.5">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#7950f2]/35 text-purple-200 border border-purple-500/50 text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3 text-[#b197fc]" />
              Đang phát sóng
            </span>
            {score && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-400 text-black text-[11px] sm:text-xs font-black shadow-md">
                <Star className="w-3 h-3 fill-black text-black" />{score}
              </span>
            )}
            {format && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/65 text-zinc-200 border border-white/15 text-[11px] sm:text-xs font-medium backdrop-blur-md">
                <Tv className="w-3 h-3 text-zinc-400" />{format}
              </span>
            )}
            {year && (
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/65 text-zinc-300 border border-white/15 text-[11px] sm:text-xs font-medium backdrop-blur-md">{year}</span>
            )}
          </div>

          <div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white tracking-normal leading-[1.2] line-clamp-2 drop-shadow-xl">{displayTitle}</h1>
            {nativeTitle && nativeTitle !== displayTitle && (
              <p className="hidden sm:block text-xs md:text-sm text-zinc-300 font-medium mt-1 drop-shadow">{nativeTitle}</p>
            )}
          </div>

          {genres.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {genres.slice(0, 4).map((g, index) => (
                <span key={g} className={`${index === 3 ? "hidden sm:inline-flex" : "inline-flex"} text-[11px] sm:text-xs text-zinc-200 bg-white/10 md:bg-black/60 border border-white/15 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg backdrop-blur-md font-medium`}>{g}</span>
              ))}
            </div>
          )}

          {description && (
            <p className="text-xs sm:text-sm md:text-base text-zinc-300 sm:text-zinc-200 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed drop-shadow-md font-sans">{description}</p>
          )}

          <div className="flex items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
            <button type="button" onClick={() => handlePlayTrailer(currentAnime)} className="group/btn relative flex-1 sm:flex-initial justify-center flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#7950f2] to-[#9775fa] hover:from-[#845ef7] hover:to-[#a380fc] text-white font-bold text-xs sm:text-sm md:text-base shadow-xl shadow-purple-600/40 hover:shadow-purple-600/60 transition-all transform hover:-translate-y-0.5 cursor-pointer active:scale-95">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 flex items-center justify-center group-hover/btn:scale-110 transition-transform shrink-0">
                <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white ml-0.5" />
              </div>
              <span className="truncate">Xem Trailer</span>
            </button>
            <Link href={`/anime/${currentAnime.id}`} onClick={() => addToHistory(currentAnime)} className="flex-1 sm:flex-initial justify-center flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-[#1a1d2e] hover:bg-[#242940] text-zinc-100 hover:text-white border border-purple-500/30 hover:border-purple-500/60 font-semibold text-xs sm:text-sm md:text-base backdrop-blur-md transition-all shadow-lg active:scale-95">
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 shrink-0" /><span>Chi tiết</span>
            </Link>
            <button type="button" onClick={() => toggleBookmark(currentAnime)} className={`shrink-0 p-2.5 sm:p-3 rounded-xl border backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg ${bookmarked ? "bg-[#7950f2]/40 text-purple-300 border-purple-500/70 shadow-purple-600/30" : "bg-[#1a1d2e] text-zinc-300 hover:text-white border-purple-500/30 hover:bg-[#242940]"}`} title={bookmarked ? "Đã lưu" : "Lưu"} aria-label="Lưu">
              {bookmarked ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {totalSlides > 1 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between md:mt-0 md:pt-0 md:border-none md:absolute md:bottom-10 md:right-10 z-20 md:gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {uniqueFeatured.slice(0, 5).map((anime, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button key={`${anime.id}-${idx}`} type="button" onClick={() => goToSlide(idx)} className={`relative px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-md ${isActive ? "bg-[#7950f2]/40 text-white border border-purple-500/70 shadow-lg shadow-purple-600/30" : "bg-white/5 md:bg-black/60 text-zinc-400 hover:text-white border border-white/10 hover:bg-black/80"}`} title={anime.title?.english || anime.title?.romaji} aria-label={`Slide ${idx + 1}`}>
                    <span>0{idx + 1}</span>
                    {isActive && (
                      <div className="absolute bottom-0 inset-x-0 h-0.5 sm:h-1 bg-black/60 overflow-hidden">
                        <div key={`${currentIndex}-${isPaused}`} className="h-full bg-[#7950f2] animate-hero-progress" style={{ animationPlayState: isPaused ? "paused" : "running" }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => setIsPaused((p) => !p)} className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 md:bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/10 backdrop-blur-md transition-colors cursor-pointer" title={isPaused ? "Tiếp tục" : "Tạm dừng"} aria-label={isPaused ? "Tiếp tục" : "Tạm dừng"}>
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {totalSlides > 1 && (
        <>
          <button type="button" onClick={handlePrev} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md items-center justify-center shadow-2xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer" aria-label="Trước"><ChevronLeft className="w-6 h-6" /></button>
          <button type="button" onClick={handleNext} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/85 text-white border border-white/20 backdrop-blur-md items-center justify-center shadow-2xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 cursor-pointer" aria-label="Tiếp"><ChevronRight className="w-6 h-6" /></button>
        </>
      )}
    </div>
  );
}
