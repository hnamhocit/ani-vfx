import { ChevronLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

export function DetailHeroBanner({
  animeId,
  displayTitle,
  bannerImage,
  poster,
}: {
  animeId: number;
  displayTitle: string;
  bannerImage?: string | null;
  poster: string;
}) {
  return (
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
          <span className="text-white font-bold truncate">{displayTitle}</span>
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
  );
}
