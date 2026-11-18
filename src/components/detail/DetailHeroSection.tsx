"use client";

import {
  Award,
  Bookmark,
  Check,
  ChevronLeft,
  Clock,
  ExternalLink,
  Film,
  Play,
  Sparkles,
  Star,
  Tv,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { type AnimeInput, useAnimeAppStore } from "@/store/useAnimeAppStore";
import { useDetailStore } from "@/store/useDetailStore";

interface DetailHeroAnime extends AnimeInput {
  bannerImage?: string | null;
  trailer?: {
    id?: string | null;
    site?: string | null;
  } | null;
  source?: string | null;
  duration?: number | null;
  status?: string | null;
  popularity?: number | null;
  description?: string | null;
  season?: string | null;
  genres?: string[];
  studios?: {
    nodes?: Array<{ id: number; name: string }>;
  };
  rankings?: Array<{
    rank: number;
    type: string;
    allTime: boolean;
  }>;
}

function getStatusBadge(status?: string | null) {
  switch (status) {
    case "RELEASING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/35">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Đang phát sóng
        </span>
      );
    case "FINISHED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/35">
          Đã hoàn thành
        </span>
      );
    case "NOT_YET_RELEASED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/35">
          Sắp khởi chiếu
        </span>
      );
    case "HIATUS":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-300 border border-orange-500/35">
          Tạm hoãn
        </span>
      );
    default:
      return null;
  }
}

export function DetailHeroSection() {
  const isBookmarked = useAnimeAppStore((s) => s.isBookmarked);
  const toggleBookmark = useAnimeAppStore((s) => s.toggleBookmark);
  const openTrailerModal = useAnimeAppStore((s) => s.openTrailerModal);

  const animeId = useDetailStore((s) => s.animeId);
  const anime = useDetailStore((s) => s.anime) as DetailHeroAnime | null;
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  if (!anime || !animeId) return null;

  const displayTitle =
    anime.title?.english || anime.title?.romaji || "Unknown";
  const nativeTitle = anime.title?.native;
  const poster = anime.coverImage?.extraLarge || anime.coverImage?.large || "";
  const bannerImage = anime.bannerImage;

  const score = anime.averageScore
    ? +(anime.averageScore / 10).toFixed(2)
    : null;
  const topRank = anime.rankings?.find(
    (r) => r.type === "RATED" && r.allTime,
  )?.rank;
  const format = anime.format === "TV_SHORT" ? "TV" : anime.format;
  const synopsis = anime.description
    ? anime.description.replace(/<[^>]+>/g, "").trim()
    : null;

  const trailerId =
    anime.trailer?.site === "youtube" ? (anime.trailer.id ?? null) : null;
  const trailerEmbed = trailerId
    ? `https://www.youtube.com/embed/${trailerId}?autoplay=1`
    : null;

  const bookmarked = isBookmarked(animeId);
  const studioName = anime.studios?.nodes?.[0]?.name;
  const sourceText = anime.source
    ? anime.source.toLowerCase().replace(/_/g, " ")
    : null;

  return (
    <section className="relative w-full border-b border-purple-500/15 pb-8 sm:pb-12">
      <div className="relative w-full h-[210px] sm:h-[290px] md:h-[360px] overflow-hidden bg-[#121422]">
        {bannerImage ? (
          <img
            src={bannerImage}
            alt={displayTitle}
            decoding="async"
            fetchPriority="high"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
        ) : poster ? (
          <img
            src={poster}
            alt={displayTitle}
            decoding="async"
            className="w-full h-full object-cover object-center scale-110 blur-xl brightness-50"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-950/60 via-[#151829] to-indigo-950/60" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/45 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10]/80 via-transparent to-[#0b0c10]/80" />

        <div className="absolute top-0 inset-x-0 z-20 max-w-7xl 2xl:max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 flex items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-zinc-200 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 min-w-0">
            <Link
              href="/"
              className="hover:text-purple-300 transition-colors flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-zinc-500">/</span>
            <span className="text-white font-bold truncate">
              {displayTitle}
            </span>
          </div>

          <a
            href={`https://anilist.co/anime/${animeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-purple-200 hover:text-white transition-colors bg-black/55 hover:bg-purple-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-purple-400/30"
          >
            <span>AniList</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl 2xl:max-w-[1540px] mx-auto px-4 sm:px-6 md:px-8 -mt-20 sm:-mt-28 md:-mt-32">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-9 items-center md:items-end">
          <div className="w-40 sm:w-52 md:w-60 lg:w-64 shrink-0">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-black border-2 border-[#1c2033] ring-1 ring-purple-500/30 bg-zinc-900 group">
              {poster ? (
                <img
                  src={poster}
                  alt={displayTitle}
                  referrerPolicy="no-referrer"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-zinc-400">
                  <Clock className="w-8 h-8 text-amber-400 mb-2" />
                  <span className="text-xs font-bold">Chưa có ảnh bìa</span>
                </div>
              )}

              {score && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-400 text-black font-black text-xs sm:text-sm shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span>{score}</span>
                </div>
              )}

              {topRank && (
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md text-amber-300 text-xs font-extrabold border border-amber-500/30">
                  <Award className="w-3.5 h-3.5" />
                  <span>Top #{topRank}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left space-y-4 pb-1">
            <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
              {format && (
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-purple-600/25 text-purple-200 border border-purple-400/35">
                  {format}
                </span>
              )}
              {getStatusBadge(anime.status)}
              {anime.season && anime.seasonYear && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700 capitalize">
                  {anime.season.toLowerCase()} {anime.seasonYear}
                </span>
              )}
              {anime.popularity && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800/90 text-zinc-300 border border-zinc-700">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{anime.popularity.toLocaleString()}</span>
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-normal">
                {displayTitle}
              </h1>
              {nativeTitle && nativeTitle !== displayTitle && (
                <p className="text-sm sm:text-base text-zinc-400 font-medium">
                  {nativeTitle}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-x-5 gap-y-2 flex-wrap text-xs sm:text-sm text-zinc-300 font-semibold">
              <span className="inline-flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-purple-400" />
                {anime.episodes ? `${anime.episodes} tập` : "Đang cập nhật"}
              </span>
              {anime.duration && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  {anime.duration} phút/tập
                </span>
              )}
              {studioName && (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {studioName}
                </span>
              )}
              {sourceText && (
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <Film className="w-4 h-4 text-indigo-400" />
                  {sourceText}
                </span>
              )}
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex items-center justify-center md:justify-start gap-1.5 flex-wrap">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#151828] text-zinc-300 border border-white/10"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap pt-1">
              <Link
                href={`/anime/${animeId}/watch?ep=1`}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#7950f2] to-[#9775fa] hover:from-[#6741d9] hover:to-[#845ef7] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-600/30 transition-all active:scale-98"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                <span>Xem ngay</span>
              </Link>

              {trailerId && (
                <button
                  type="button"
                  onClick={() =>
                    openTrailerModal(displayTitle, trailerId, trailerEmbed)
                  }
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#161927] hover:bg-[#1f2336] text-zinc-200 font-bold text-sm sm:text-base border border-white/10 transition cursor-pointer active:scale-98"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => toggleBookmark(anime)}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm sm:text-base border transition-all cursor-pointer active:scale-98 ${bookmarked
                    ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40"
                    : "bg-[#161927] hover:bg-[#1f2336] text-zinc-200 border-white/10"
                  }`}
              >
                {bookmarked ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-purple-400" />
                    <span>Lưu phim</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {synopsis && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-2xl bg-[#111320]/90 border border-purple-500/20">
            <p
              className={`text-xs sm:text-sm md:text-base text-zinc-300 leading-relaxed ${isSynopsisExpanded ? "" : "line-clamp-3"
                }`}
            >
              {synopsis}
            </p>
            {synopsis.length > 260 && (
              <button
                type="button"
                onClick={() => setIsSynopsisExpanded((prev) => !prev)}
                className="mt-2 text-xs sm:text-sm font-bold text-purple-400 hover:text-purple-300 transition cursor-pointer"
              >
                {isSynopsisExpanded ? "Thu gọn" : "Xem thêm nội dung"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
