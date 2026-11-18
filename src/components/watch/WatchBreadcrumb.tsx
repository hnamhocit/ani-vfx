import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useWatchStore } from "@/store/useWatchStore";

export function WatchBreadcrumb() {
  const animeId = useWatchStore((s) => s.animeId);
  const anime = useWatchStore((s) => s.anime);
  const currentEpisode = useWatchStore((s) => s.currentEpisode);

  if (!anime || !animeId) return null;

  const displayTitle = anime.title_english || anime.title;

  return (
    <div className="border-b border-zinc-800/80 bg-[#0c0e17]/90 backdrop-blur-md sticky top-14 sm:top-16 z-30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-zinc-400 min-w-0">
          <Link
            href={`/anime/${animeId}`}
            className="hover:text-purple-300 flex items-center gap-1 shrink-0 font-bold text-zinc-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Thông tin phim</span>
          </Link>
          <span className="shrink-0">/</span>
          <span className="truncate text-zinc-300">{displayTitle}</span>
          <span className="shrink-0">/</span>
          <span className="text-emerald-400 font-bold shrink-0">
            Tập {currentEpisode}
          </span>
        </div>

        <Link
          href={`/anime/${animeId}`}
          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
        >
          Chi tiết anime
        </Link>
      </div>
    </div>
  );
}
