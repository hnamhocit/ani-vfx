"use client";

import { Star, Tv } from "lucide-react";
import { useWatchStore } from "@/store/useWatchStore";

export function WatchInfoHeader() {
  const anime = useWatchStore((s) => s.anime) as any;
  const currentEpisode = useWatchStore((s) => s.currentEpisode);

  if (!anime) return null;

  const displayTitle = anime.title?.english || anime.title?.romaji || "Unknown";
  const score = anime.averageScore ? +(anime.averageScore / 10).toFixed(2) : null;
  const format = anime.format === "TV_SHORT" ? "TV" : anime.format;
  const year = anime.seasonYear;

  return (
    <div className="space-y-2">
      <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
        {displayTitle} <span className="text-purple-400">— Tập {currentEpisode}</span>
      </h1>
      <div className="flex items-center gap-3 flex-wrap">
        {score && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-black">
            <Star className="w-3.5 h-3.5 fill-amber-400" />{score}
          </span>
        )}
        {format && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#181a28] border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold">
            <Tv className="w-3.5 h-3.5" />{format}
          </span>
        )}
        {year && <span className="text-xs sm:text-sm text-zinc-400 font-medium">{year}</span>}
      </div>
    </div>
  );
}
