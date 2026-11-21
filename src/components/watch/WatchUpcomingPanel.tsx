import { ChevronLeft, Clock, Film, Sparkles } from "lucide-react";
import Link from "next/link";

export function WatchUpcomingPanel({
  animeId,
  displayTitle,
  hasTrailer,
  previousSeason,
  onPlayTrailer,
}: {
  animeId: number;
  displayTitle: string;
  hasTrailer: boolean;
  previousSeason?: { id: number; title: string };
  onPlayTrailer: () => void;
}) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-10 text-center bg-gradient-to-b from-zinc-950 via-[#111322] to-zinc-950 text-zinc-300 space-y-2 sm:space-y-4">
      <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-purple-950/70 border border-purple-500/40 items-center justify-center shadow-xl">
        <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
      </div>
      <div className="space-y-1.5 max-w-lg">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chưa phát sóng chính thức</span>
        </div>
        <h3 className="text-base sm:text-2xl font-black text-white font-heading">
          {displayTitle}
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Phần phim này hiện đang trong giai đoạn sản xuất hoặc chưa có tập phim
          phát hành chính thức.
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap justify-center pt-1">
        {hasTrailer && (
          <button
            type="button"
            onClick={onPlayTrailer}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg transition cursor-pointer"
          >
            <Film className="w-4 h-4" />
            <span>Xem Official Trailer</span>
          </button>
        )}
        {previousSeason && (
          <Link
            href={`/anime/${previousSeason.id}/watch?ep=1`}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-[#1a1d2e] hover:bg-[#252a42] text-zinc-200 border border-purple-500/30 font-bold text-xs sm:text-sm transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Xem phần trước ({previousSeason.title})</span>
          </Link>
        )}
        <Link
          href={`/anime/${animeId}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold text-xs sm:text-sm transition"
        >
          <span>Chi tiết anime</span>
        </Link>
      </div>
    </div>
  );
}
