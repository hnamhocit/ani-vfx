"use client";

import { Bookmark, Check, Film, Play, Star } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { useAnimeApp } from "@/context/AnimeAppContext";
import type { Anime } from "@/types/anime";

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
  className?: string;
}

export function AnimeCard({
  anime,
  priority = false,
  className = "",
}: AnimeCardProps) {
  const { isBookmarked, toggleBookmark, addToHistory } = useAnimeApp();
  const bookmarked = isBookmarked(anime.mal_id);

  const initialPoster =
    anime.images.webp?.large_image_url ||
    anime.images.jpg?.large_image_url ||
    anime.images.jpg?.image_url;

  const [imgSrc, setImgSrc] = useState(initialPoster);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(initialPoster);
    setImgFailed(false);
  }, [initialPoster]);

  const displayTitle = anime.title_english || anime.title;

  const handleCardClick = () => {
    addToHistory(anime);
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(anime);
  };

  const handleImgError = () => {
    if (
      anime.images.jpg?.large_image_url &&
      imgSrc !== anime.images.jpg.large_image_url
    ) {
      setImgSrc(anime.images.jpg.large_image_url);
    } else if (
      anime.images.jpg?.image_url &&
      imgSrc !== anime.images.jpg.image_url
    ) {
      setImgSrc(anime.images.jpg.image_url);
    } else if (
      anime.trailer?.images?.large_image_url &&
      imgSrc !== anime.trailer.images.large_image_url
    ) {
      setImgSrc(anime.trailer.images.large_image_url);
    } else {
      setImgFailed(true);
    }
  };

  return (
    <Link
      href={`/anime/${anime.mal_id}`}
      onClick={handleCardClick}
      className={`group relative flex flex-col h-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#151724] to-[#0e1018] border border-purple-500/25 ring-1 ring-white/10 hover:border-purple-400 hover:ring-2 hover:ring-purple-500/40 shadow-xl shadow-black/85 hover:shadow-2xl hover:shadow-purple-600/30 hover:-translate-y-2.5 transition-all duration-300 ease-out will-change-transform select-none cursor-pointer ${className}`}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0a0b10] block shrink-0">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={displayTitle}
            referrerPolicy="no-referrer"
            decoding="async"
            onError={handleImgError}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1d2e] to-[#0e1017] flex flex-col items-center justify-center p-3 text-center">
            <Film className="w-10 h-10 text-purple-400/70 mb-2" />
            <span className="text-sm font-bold text-zinc-300 line-clamp-2">
              {displayTitle}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1018] via-transparent to-transparent opacity-90 group-hover:opacity-40 transition-opacity pointer-events-none" />

        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
          {anime.type ? (
            <span className="text-xs font-black tracking-wider uppercase px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-zinc-100 border border-white/20 shadow-md">
              {anime.type}
            </span>
          ) : (
            <div />
          )}

          {anime.score ? (
            <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg bg-amber-400 text-black shadow-lg shadow-amber-400/30">
              <Star className="w-3.5 h-3.5 fill-black text-black" />
              {anime.score.toFixed(1)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleBookmarkClick}
          className={`absolute bottom-3 right-3 z-20 p-2 sm:p-2.5 rounded-xl backdrop-blur-md transition-all shadow-lg cursor-pointer ${bookmarked
              ? "bg-[#7950f2] text-white shadow-purple-600/50 scale-100"
              : "bg-black/80 text-zinc-200 hover:text-white hover:bg-black/95 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 border border-white/20 hover:scale-105"
            }`}
          title={bookmarked ? "Đã lưu vào danh sách" : "Thêm vào danh sách"}
          aria-label="Lưu vào danh sách"
        >
          {bookmarked ? (
            <Check className="w-4 h-4 text-emerald-300" />
          ) : (
            <Bookmark className="w-4 h-4 text-purple-300" />
          )}
        </button>

        <div className="pointer-events-none absolute inset-0 z-10 m-auto w-14 h-14 rounded-full bg-gradient-to-tr from-[#7950f2] to-[#9775fa] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all shadow-2xl shadow-purple-600/60">
          <Play className="w-6 h-6 fill-white ml-0.5" />
        </div>
      </div>

      <div className="p-2.5 sm:p-3.5 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-[2.4rem] sm:h-[2.85rem] md:h-[3.25rem] flex items-start overflow-hidden">
            <h3
              className="font-heading font-black text-xs sm:text-sm md:text-base text-white group-hover:text-purple-300 line-clamp-2 transition-colors leading-snug tracking-normal"
              title={displayTitle}
            >
              {displayTitle}
            </h3>
          </div>

          <p
            className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5 sm:mt-1 font-medium h-4 leading-4"
            title={anime.title_japanese || ""}
          >
            {anime.title_japanese && anime.title_japanese !== displayTitle ? (
              anime.title_japanese
            ) : (
              <span className="invisible select-none">-</span>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-purple-500/20 text-xs sm:text-sm text-zinc-300 font-semibold h-7 shrink-0">
          <span className="truncate">
            {anime.episodes
              ? `${anime.episodes} tập`
              : anime.airing
                ? "Đang chiếu"
                : "Chưa rõ"}
          </span>
          <span className="text-purple-300 font-bold">
            {anime.year ||
              (anime.aired?.prop?.from?.year ? anime.aired.prop.from.year : "")}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function AnimeCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col h-full rounded-2xl overflow-hidden bg-[#1a1d2e] border border-purple-500/15 ring-1 ring-white/5 animate-pulse ${className}`}
    >
      <div className="aspect-[3/4] w-full bg-[#242940] shrink-0" />
      <div className="p-2.5 sm:p-3.5 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="h-[2.4rem] sm:h-[2.85rem] md:h-[3.25rem] space-y-1.5">
            <div className="h-4 bg-[#242940] rounded w-4/5" />
            <div className="h-4 bg-[#242940] rounded w-3/5" />
          </div>
          <div className="h-4 mt-1">
            <div className="h-3 bg-[#242940]/60 rounded w-1/2" />
          </div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-purple-500/10 h-7 shrink-0">
          <div className="h-3 bg-[#242940]/50 rounded w-12" />
          <div className="h-3 bg-[#242940]/50 rounded w-8" />
        </div>
      </div>
    </div>
  );
}
